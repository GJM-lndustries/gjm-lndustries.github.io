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
