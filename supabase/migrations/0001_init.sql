-- =====================================================================================
-- ProICFES · esquema inicial de cuentas
--   profiles  : perfil y prueba de la autorización de tratamiento de datos (Ley 1581 de 2012)
--   progress  : progreso de estudio sincronizado (un documento JSON por usuario)
--   attempts  : resultados de simulacros
-- Row Level Security: cada usuario solo puede ver y modificar sus propias filas.
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → pegar todo → Run.
-- =====================================================================================

-- ---------------------------------------------------------------- utilidades
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  display_name           text check (char_length(display_name) <= 80),
  -- Solo el año (minimización de datos); la edad exacta se calcula en el navegador con la fecha completa.
  birth_year             smallint not null check (birth_year between 1900 and 2100),
  is_minor               boolean not null,
  -- Autorización del padre, madre o representante legal (obligatoria si is_minor).
  guardian_name          text check (char_length(guardian_name) between 3 and 120),
  guardian_document      text check (char_length(guardian_document) between 5 and 30),
  guardian_email         text check (char_length(guardian_email) <= 254 and guardian_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  minor_heard            boolean not null default false,
  -- Prueba de la autorización de tratamiento de datos (versión de la política y fecha).
  data_policy_version    text not null check (char_length(data_policy_version) <= 40),
  data_authorization_at  timestamptz not null,
  -- Versión y fecha de la elección de cookies vigente al crear o actualizar la cuenta (opcional).
  consent_version        text check (char_length(consent_version) <= 40),
  consent_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint guardian_required_for_minors check (
    not is_minor
    or (guardian_name is not null and guardian_document is not null and guardian_email is not null and minor_heard)
  )
);

comment on table public.profiles is 'Perfil del estudiante y prueba de la autorización de tratamiento de datos.';

-- Quien por año de nacimiento tiene con seguridad menos de 18 años no puede registrarse como adulto.
create or replace function public.enforce_minor_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not new.is_minor and (extract(year from now())::int - new.birth_year) < 18 then
    raise exception 'Un menor de 18 años necesita la autorización de su representante legal'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger profiles_enforce_minor
  before insert or update of birth_year, is_minor on public.profiles
  for each row execute function public.enforce_minor_flag();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- progress
create table public.progress (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  data            jsonb not null default '{}'::jsonb,
  schema_version  smallint not null default 1,
  updated_at      timestamptz not null default now(),
  constraint progress_is_object check (jsonb_typeof(data) = 'object'),
  constraint progress_max_size check (pg_column_size(data) < 524288)
);

comment on table public.progress is 'Progreso de estudio (mismo formato que localStorage proicfes_progress). updated_at lo pone el servidor.';

create trigger progress_updated_at
  before insert or update on public.progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- attempts
create table public.attempts (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id     text not null check (char_length(client_id) <= 64),
  format        text not null check (format in ('corto', 'completo')),
  finished_at   timestamptz not null,
  global_score  smallint check (global_score between 0 and 500),
  percent       smallint not null check (percent between 0 and 100),
  correct       smallint not null check (correct >= 0),
  total         smallint not null check (total > 0),
  per_area      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  constraint attempts_correct_le_total check (correct <= total),
  constraint attempts_unique_client unique (user_id, client_id)
);

comment on table public.attempts is 'Resultados de simulacros. client_id evita duplicados al reintentar la subida.';

create index attempts_user_finished_idx on public.attempts (user_id, finished_at desc);

-- ---------------------------------------------------------------- permisos y RLS
-- Permisos mínimos: nadie sin sesión toca estas tablas y los intentos no se editan.
revoke all on public.profiles, public.progress, public.attempts from anon, authenticated;
grant select, insert, update, delete on public.profiles, public.progress to authenticated;
grant select, insert, delete on public.attempts to authenticated;

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.attempts enable row level security;

-- profiles: id = auth.uid()
create policy "profiles: ver el propio"        on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: crear el propio"      on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: actualizar el propio" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles: borrar el propio"     on public.profiles for delete to authenticated using ((select auth.uid()) = id);

-- progress: user_id = auth.uid()
create policy "progress: ver el propio"        on public.progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress: crear el propio"      on public.progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress: actualizar el propio" on public.progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress: borrar el propio"     on public.progress for delete to authenticated using ((select auth.uid()) = user_id);

-- attempts: user_id = auth.uid() (los resultados no se editan; se pueden borrar)
create policy "attempts: ver los propios"      on public.attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "attempts: crear los propios"    on public.attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "attempts: borrar los propios"   on public.attempts for delete to authenticated using ((select auth.uid()) = user_id);
