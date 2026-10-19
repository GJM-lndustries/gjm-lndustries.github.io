/**
 * Prueba la migración supabase/migrations/0001_init.sql en un Postgres real (PGlite, en memoria)
 * con un esquema `auth` mínimo que imita a Supabase: roles anon/authenticated y auth.uid().
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const db = new PGlite();

async function as(role: "anon" | "authenticated" | "postgres", uid = "") {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  if (role !== "postgres") await db.exec(`set role ${role};`);
}
const profile = (id: string, year: number, minor: boolean, permission = false) =>
  `insert into public.profiles (id, birth_year, is_minor, minor_heard, data_policy_version, data_authorization_at)
   values ('${id}', ${year}, ${minor}, ${permission ? "true" : "false"}, '1.0', now())`;

beforeAll(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    -- Como en Supabase: privilegios amplios por defecto en public (la migración debe restringirlos).
    alter default privileges in schema public grant all on tables to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `);
  const mig = (n: string) =>
    readFileSync(path.resolve(import.meta.dirname, `../supabase/migrations/${n}`), "utf8");
  await db.exec(mig("0001_init.sql"));
  await db.exec(mig("0002_simplify_guardian.sql"));
  await db.exec(mig("0003_streak_fields_doc.sql"));
  await db.exec(mig("0004_cursos.sql"));
}, 30_000);

describe("migración 0001_init.sql", () => {
  it("perfiles: cada quien crea y ve solo el suyo", async () => {
    await as("authenticated", A);
    await db.query(profile(A, 1990, false));
    await expect(db.query(profile(B, 1990, false))).rejects.toThrow(/row-level security/);
    await as("authenticated", B);
    await expect(db.query(profile(B, 2010, true, false))).rejects.toThrow(/minor_permission_declared/);
    await expect(db.query(profile(B, 2010, false))).rejects.toThrow(/casilla de permiso|representante|acudiente/);
    await db.query(profile(B, 2010, true, true));
    const rows = await db.query<{ id: string; minor_heard: boolean }>(
      "select id, minor_heard from public.profiles"
    );
    expect(rows.rows).toEqual([{ id: B, minor_heard: true }]);
    // guardian_* pueden quedar null (ya no se exigen).
    await db.query(`update public.profiles set guardian_name = null, guardian_document = null, guardian_email = null where id = '${B}'`);
    const upd = await db.query(`update public.profiles set display_name = 'x' where id = '${A}'`);
    expect(upd.affectedRows).toBe(0);
  });

  it("progreso: solo el propio, como objeto JSON y con updated_at del servidor", async () => {
    await as("authenticated", B);
    await expect(db.query(`insert into public.progress (user_id, data) values ('${A}', '{}')`)).rejects.toThrow(
      /row-level security/
    );
    const r = await db.query<{ updated_at: Date; data: { totalXp: number } }>(
      `insert into public.progress (user_id, data) values ('${B}', '{"totalXp": 20}')
       on conflict (user_id) do update set data = excluded.data returning updated_at, data`
    );
    expect(r.rows[0].data.totalXp).toBe(20);
    expect(r.rows[0].updated_at).toBeInstanceOf(Date);
    await expect(db.query(`update public.progress set data = '[1]' where user_id = '${B}'`)).rejects.toThrow(/progress_is_object/);
  });

  it("intentos: sin duplicados, sin editar y solo los propios", async () => {
    await as("authenticated", B);
    const ins = (cid: string, correct = 12) =>
      `insert into public.attempts (client_id, format, finished_at, global_score, percent, correct, total)
       values ('${cid}', 'corto', now(), 250, 48, ${correct}, 25) on conflict (user_id, client_id) do nothing`;
    await db.query(ins("1-1"));
    await db.query(ins("1-1"));
    expect((await db.query("select count(*)::int n from public.attempts")).rows).toEqual([{ n: 1 }]);
    await expect(db.query(ins("2", 30))).rejects.toThrow(/attempts_correct_le_total/);
    await expect(db.query("update public.attempts set percent = 100")).rejects.toThrow(/permission denied/);
    await expect(
      db.query(`insert into public.attempts (user_id, client_id, format, finished_at, percent, correct, total)
                values ('${A}', 'x', 'corto', now(), 1, 1, 2)`)
    ).rejects.toThrow(/row-level security/);
    await as("authenticated", A);
    const seen = await db.query<{ p: number; a: number }>(
      "select (select count(*) from public.progress)::int p, (select count(*) from public.attempts)::int a"
    );
    expect(seen.rows[0]).toEqual({ p: 0, a: 0 });
  });

  it("sin sesión (anon) no hay acceso", async () => {
    await as("anon");
    await expect(db.query("select * from public.profiles")).rejects.toThrow(/permission denied/);
    await expect(db.query("select * from public.progress")).rejects.toThrow(/permission denied/);
    await expect(db.query("select * from public.attempts")).rejects.toThrow(/permission denied/);
  });

  it("al borrar el usuario se borran sus datos", async () => {
    await as("postgres");
    await db.query(`delete from auth.users where id = '${B}'`);
    const left = await db.query<{ n: number }>(
      `select ((select count(*) from public.profiles where id = '${B}') + (select count(*) from public.progress) + (select count(*) from public.attempts))::int n`
    );
    expect(left.rows[0].n).toBe(0);
  });
});

describe("migración 0004_cursos.sql", () => {
  const S = Array.from({ length: 6 }, (_, i) => `3333333${i}-3333-3333-3333-333333333333`);
  const stats = (correct: number) =>
    JSON.stringify({ competenciaStats: { "matematicas|Formulación y ejecución": { answered: 10, correct }, "ingles|Parte 1": { answered: 4, correct: 4 } } });
  let gid = "";
  let code = "";

  it("solo un adulto crea grupos; anon no puede llamar las funciones", async () => {
    await as("postgres");
    await db.exec(`insert into auth.users values ${S.map(s => `('${s}')`).join(",")} on conflict do nothing`);
    await as("anon");
    await expect(db.query(`select public.create_group('11-A')`)).rejects.toThrow(/permission denied/);
    await as("authenticated", B); // B es menor de edad
    await expect(db.query(`select public.create_group('11-A')`)).rejects.toThrow(/mayor de edad/);
    await as("authenticated", A);
    const r = await db.query<{ id: string; code: string }>(`select id, code from public.create_group('  11-A  ')`);
    gid = r.rows[0].id;
    code = r.rows[0].code;
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    await expect(db.query(`insert into public.class_groups (code, name, teacher_id) values ('ABCDEF', 'x', '${A}')`)).rejects.toThrow(/permission denied/);
  });

  it("los estudiantes se unen con alias; nadie ve a otros estudiantes salvo el docente", async () => {
    await as("authenticated", A);
    await expect(db.query(`select public.join_group('${code}', 'Profe')`)).rejects.toThrow(/docente de este grupo/);
    for (const [i, s] of S.entries()) {
      await as("authenticated", s);
      await db.query(`select public.join_group('${code.toLowerCase()}', 'Estudiante ${i}')`);
    }
    await expect(db.query(`select public.join_group('ZZZZZZ', 'x')`)).rejects.toThrow(/no existe/);
    await expect(db.query(`select public.join_group('${code}', 'x')`)).rejects.toThrow(/class_members_alias_check/);
    const own = await db.query<{ alias: string }>("select alias from public.class_members");
    expect(own.rows).toEqual([{ alias: "Estudiante 5" }]);
    const g = await db.query<{ name: string }>("select name from public.class_groups");
    expect(g.rows).toEqual([{ name: "11-A" }]);
    await expect(db.query(`select public.group_summary('${gid}')`)).rejects.toThrow(/Solo el docente/);
    await as("authenticated", A);
    const all = await db.query("select alias from public.class_members");
    expect(all.rows).toHaveLength(6);
    // El docente no ve el progreso individual.
    const pr = await db.query(`select * from public.progress where user_id = '${S[0]}'`);
    expect(pr.rows).toHaveLength(0);
  });

  it("el resumen solo aparece con 5 o más estudiantes con datos, y sin datos individuales", async () => {
    for (const [i, s] of S.slice(0, 4).entries()) {
      await as("authenticated", s);
      await db.query(`insert into public.progress (user_id, data) values ('${s}', '${stats(i + 2)}')`);
    }
    await as("authenticated", A);
    let r = await db.query<{ group_summary: { members: number; withData: number; rows: unknown[] } }>(`select public.group_summary('${gid}')`);
    expect(r.rows[0].group_summary).toMatchObject({ members: 6, withData: 4, rows: [] });
    await as("authenticated", S[4]);
    await db.query(`insert into public.progress (user_id, data) values ('${S[4]}', '${stats(6)}')`);
    await as("authenticated", A);
    r = await db.query(`select public.group_summary('${gid}')`);
    const sum = r.rows[0].group_summary as unknown as { withData: number; rows: Record<string, unknown>[] };
    expect(sum.withData).toBe(5);
    expect(sum.rows[0]).toEqual({ area: "matematicas", competencia: "Formulación y ejecución", students: 5, answered: 50, correct: 20, pct: 40 });
    expect(sum.rows[1]).toMatchObject({ area: "ingles", pct: 100 });
    expect(JSON.stringify(sum)).not.toMatch(/3333|Estudiante/);
  });

  it("el estudiante se sale, el docente quita y borra el grupo", async () => {
    await as("authenticated", S[5]);
    const out = await db.query(`delete from public.class_members where group_id = '${gid}'`);
    expect(out.affectedRows).toBe(1);
    await as("authenticated", S[0]);
    const bad = await db.query(`delete from public.class_groups where id = '${gid}'`);
    expect(bad.affectedRows).toBe(0);
    await as("authenticated", A);
    const kick = await db.query(`delete from public.class_members where user_id = '${S[1]}'`);
    expect(kick.affectedRows).toBe(1);
    await db.query(`delete from public.class_groups where id = '${gid}'`);
    await as("postgres");
    const left = await db.query(`select count(*)::int as n from public.class_members`);
    expect(left.rows).toEqual([{ n: 0 }]);
  });
});
