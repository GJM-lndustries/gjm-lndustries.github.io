-- 0004 · «ProICFES para tu curso»
-- Un docente (cuenta de adulto) crea un grupo con un código; sus estudiantes se unen con un alias
-- que ellos eligen. El docente ve SOLO agregados por competencia del grupo, nunca puntajes individuales,
-- y solo cuando al menos 5 estudiantes tienen datos (para que nadie quede identificable).
-- Las escrituras pasan por funciones (create_group, join_group); el resto está cerrado con RLS.
-- Aplicar manualmente en el SQL Editor de Supabase.

create table public.class_groups (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  name        text not null check (char_length(btrim(name)) between 2 and 60),
  teacher_id  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index class_groups_teacher_idx on public.class_groups (teacher_id);

create table public.class_members (
  group_id   uuid not null references public.class_groups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- Nombre que elige el estudiante (puede ser un apodo). No se guarda nada más de él aquí.
  alias      text not null check (char_length(btrim(alias)) between 2 and 30),
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index class_members_user_idx on public.class_members (user_id);

alter table public.class_groups  enable row level security;
alter table public.class_members enable row level security;

revoke all on public.class_groups, public.class_members from anon, authenticated;
grant select, delete on public.class_groups, public.class_members to authenticated;

-- Ayudantes sin recursión de políticas.
create function public.is_group_teacher(gid uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_groups g where g.id = gid and g.teacher_id = (select auth.uid()))
$$;
create function public.is_group_member(gid uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_members m where m.group_id = gid and m.user_id = (select auth.uid()))
$$;
revoke all on function public.is_group_teacher(uuid), public.is_group_member(uuid) from public, anon;
grant execute on function public.is_group_teacher(uuid), public.is_group_member(uuid) to authenticated;

create policy "grupos: los ve su docente y sus miembros" on public.class_groups for select to authenticated
  using (teacher_id = (select auth.uid()) or public.is_group_member(id));
create policy "grupos: solo su docente los borra" on public.class_groups for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "miembros: el propio o los de mi grupo (docente)" on public.class_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_teacher(group_id));
create policy "miembros: salirme o que el docente me quite" on public.class_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_teacher(group_id));

-- Crear grupo: solo cuentas de adulto (is_minor = false), máximo 20 grupos por docente.
create function public.create_group(p_name text) returns public.class_groups
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
  g public.class_groups;
begin
  if uid is null then raise exception 'Inicia sesión para crear un grupo' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles p where p.id = uid and p.is_minor = false) then
    raise exception 'Solo una cuenta de docente (mayor de edad) puede crear grupos' using errcode = '42501';
  end if;
  if (select count(*) from public.class_groups where teacher_id = uid) >= 20 then
    raise exception 'Llegaste al máximo de 20 grupos' using errcode = 'P0001';
  end if;
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.class_groups where code = c);
  end loop;
  insert into public.class_groups (code, name, teacher_id) values (c, btrim(p_name), uid) returning * into g;
  return g;
end $$;

-- Unirse con código y alias (si ya estaba, actualiza el alias). Máximo 60 estudiantes por grupo.
create function public.join_group(p_code text, p_alias text) returns uuid
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  gid uuid;
  tid uuid;
begin
  if uid is null then raise exception 'Inicia sesión para unirte' using errcode = '42501'; end if;
  select id, teacher_id into gid, tid from public.class_groups where code = upper(btrim(p_code));
  if gid is null then raise exception 'Ese código no existe' using errcode = 'P0002'; end if;
  if tid = uid then raise exception 'Eres el docente de este grupo' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.class_members where group_id = gid and user_id = uid)
     and (select count(*) from public.class_members where group_id = gid) >= 60 then
    raise exception 'El grupo está lleno (60 estudiantes)' using errcode = 'P0001';
  end if;
  insert into public.class_members (group_id, user_id, alias) values (gid, uid, btrim(p_alias))
    on conflict (group_id, user_id) do update set alias = excluded.alias;
  return gid;
end $$;

-- Resumen para el docente: aciertos por competencia sumando a todo el grupo.
-- Solo si hay al menos 5 estudiantes con datos, y cada fila cuenta con al menos 5 estudiantes.
create function public.group_summary(p_group uuid) returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
declare
  min_students constant int := 5;
  n_members int;
  n_data int;
  out_rows jsonb;
begin
  if not exists (select 1 from public.class_groups g where g.id = p_group and g.teacher_id = (select auth.uid())) then
    raise exception 'Solo el docente del grupo ve el resumen' using errcode = '42501';
  end if;
  select count(*) into n_members from public.class_members where group_id = p_group;
  with stats as (
    select m.user_id, e.key, e.value
    from public.class_members m
    join public.progress p on p.user_id = m.user_id
    cross join lateral jsonb_each(
      case when jsonb_typeof(p.data -> 'competenciaStats') = 'object' then p.data -> 'competenciaStats' else '{}'::jsonb end
    ) e
    where m.group_id = p_group
      and jsonb_typeof(e.value -> 'answered') = 'number'
      and jsonb_typeof(e.value -> 'correct') = 'number'
      and (e.value ->> 'answered')::numeric > 0
  )
  select (select count(distinct user_id) from stats),
         coalesce(jsonb_agg(r order by r.pct), '[]'::jsonb)
    into n_data, out_rows
  from (
    select split_part(key, '|', 1) as area,
           substr(key, strpos(key, '|') + 1) as competencia,
           count(distinct user_id)::int as students,
           sum(least((value ->> 'answered')::numeric, 100000))::int as answered,
           sum(least((value ->> 'correct')::numeric, (value ->> 'answered')::numeric, 100000))::int as correct,
           round(100 * sum(least((value ->> 'correct')::numeric, (value ->> 'answered')::numeric))
                 / sum((value ->> 'answered')::numeric))::int as pct
    from stats
    where strpos(key, '|') > 1
    group by 1, 2
    having count(distinct user_id) >= min_students
  ) r;
  if n_data < min_students then out_rows := '[]'::jsonb; end if;
  return jsonb_build_object('members', n_members, 'withData', n_data, 'minStudents', min_students, 'rows', out_rows);
end $$;

revoke all on function public.create_group(text), public.join_group(text, text), public.group_summary(uuid) from public, anon;
grant execute on function public.create_group(text), public.join_group(text, text), public.group_summary(uuid) to authenticated;
