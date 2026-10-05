-- =====================================================================================
-- ProICFES · simplificar autorización de menores
-- Ya no exigimos nombre, documento ni correo del acudiente: el menor declara con una
-- casilla que tiene su permiso. `minor_heard` pasa a significar esa declaración.
-- Las columnas guardian_* quedan nullable (por si hubiera filas antiguas).
-- =====================================================================================

alter table public.profiles
  drop constraint if exists guardian_required_for_minors;

-- Un menor debe haber marcado la casilla de permiso del acudiente (minor_heard = true).
alter table public.profiles
  add constraint minor_permission_declared check (
    not is_minor or minor_heard
  );

comment on column public.profiles.minor_heard is
  'Menor: el estudiante declaró tener permiso de su papá, mamá o acudiente. Adulto: false.';
comment on column public.profiles.guardian_name is
  'Obsoleto (nullable). Antes se pedía el nombre del representante; ya no se recoge.';
comment on column public.profiles.guardian_document is
  'Obsoleto (nullable). Antes se pedía el documento del representante; ya no se recoge.';
comment on column public.profiles.guardian_email is
  'Obsoleto (nullable). Antes se pedía el correo del representante; ya no se recoge.';

create or replace function public.enforce_minor_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not new.is_minor and (extract(year from now())::int - new.birth_year) < 18 then
    raise exception 'Un menor de 18 años debe registrarse con la casilla de permiso del acudiente'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
