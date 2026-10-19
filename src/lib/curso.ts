/** «ProICFES para tu curso»: cliente de las funciones de la migración 0004_cursos.sql. */
import type { AreaId } from "@/data/questions/types";
import { getSupabase } from "./accounts";

export interface ClassGroup { id: string; code: string; name: string; teacher_id: string; created_at: string }
export interface Membership { group_id: string; alias: string; joined_at: string; group?: { name: string; code: string } | null }
export interface SummaryRow { area: AreaId; competencia: string; students: number; answered: number; correct: number; pct: number }
export interface GroupSummary { members: number; withData: number; minStudents: number; rows: SummaryRow[] }

export const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
export const validAlias = (s: string) => s.trim().length >= 2 && s.trim().length <= 30;

/** Mensaje claro a partir del error de Postgres (las funciones lanzan mensajes en español). */
export function cursoError(e: unknown): string {
  const m = (e as { message?: string })?.message ?? "";
  if (/fetch|network/i.test(m)) return "No hay conexión. Intenta de nuevo.";
  if (/does not exist|schema cache|function public\./i.test(m)) return "Los grupos aún no están activados en el servidor.";
  return m || "Algo salió mal. Intenta de nuevo.";
}

async function client() {
  const p = getSupabase();
  if (!p) throw new Error("Las cuentas aún no están disponibles.");
  return p;
}

export async function createGroup(name: string): Promise<ClassGroup> {
  const sb = await client();
  const { data, error } = await sb.rpc("create_group", { p_name: name.trim() });
  if (error) throw error;
  return data as ClassGroup;
}

export async function joinGroup(code: string, alias: string): Promise<string> {
  const sb = await client();
  const { data, error } = await sb.rpc("join_group", { p_code: normalizeCode(code), p_alias: alias.trim() });
  if (error) throw error;
  return data as string;
}

export async function myTeacherGroups(uid: string): Promise<ClassGroup[]> {
  const sb = await client();
  const { data, error } = await sb.from("class_groups").select("*").eq("teacher_id", uid).order("created_at");
  if (error) throw error;
  return (data ?? []) as ClassGroup[];
}

export async function myMemberships(uid: string): Promise<Membership[]> {
  const sb = await client();
  const { data, error } = await sb.from("class_members").select("group_id, alias, joined_at, group:class_groups(name, code)").eq("user_id", uid);
  if (error) throw error;
  return (data ?? []) as unknown as Membership[];
}

export async function groupMembers(groupId: string): Promise<{ user_id: string; alias: string }[]> {
  const sb = await client();
  const { data, error } = await sb.from("class_members").select("user_id, alias").eq("group_id", groupId).order("alias");
  if (error) throw error;
  return data ?? [];
}

export async function groupSummary(groupId: string): Promise<GroupSummary> {
  const sb = await client();
  const { data, error } = await sb.rpc("group_summary", { p_group: groupId });
  if (error) throw error;
  return data as GroupSummary;
}

export async function leaveGroup(groupId: string, uid: string) {
  const sb = await client();
  const { error } = await sb.from("class_members").delete().eq("group_id", groupId).eq("user_id", uid);
  if (error) throw error;
}

export async function removeMember(groupId: string, userId: string) {
  return leaveGroup(groupId, userId);
}

export async function deleteGroup(groupId: string) {
  const sb = await client();
  const { error } = await sb.from("class_groups").delete().eq("id", groupId);
  if (error) throw error;
}

/** Las competencias más débiles primero (pocas respuestas cuentan menos: mínimo 20). */
export function weakest(rows: SummaryRow[], n = 5, minAnswered = 20): SummaryRow[] {
  return rows.filter(r => r.answered >= minAnswered).sort((a, b) => a.pct - b.pct || b.answered - a.answered).slice(0, n);
}

/** Datos de EJEMPLO (inventados, rotulados como tales) para ver cómo luce el panel sin un curso real. */
export const DEMO_SUMMARY: GroupSummary = {
  members: 28,
  withData: 22,
  minStudents: 5,
  rows: [
    { area: "matematicas", competencia: "Formulación y ejecución", students: 21, answered: 412, correct: 169, pct: 41 },
    { area: "lectura-critica", competencia: "Reflexionar a partir de un texto y evaluar su contenido", students: 19, answered: 260, correct: 117, pct: 45 },
    { area: "ciencias-naturales", competencia: "Indagación", students: 18, answered: 240, correct: 120, pct: 50 },
    { area: "sociales-ciudadanas", competencia: "Pensamiento reflexivo y sistémico", students: 17, answered: 198, correct: 107, pct: 54 },
    { area: "matematicas", competencia: "Argumentación", students: 20, answered: 230, correct: 131, pct: 57 },
    { area: "ingles", competencia: "Gramática y léxico", students: 16, answered: 150, correct: 93, pct: 62 },
    { area: "lectura-critica", competencia: "Identificar y entender los contenidos locales", students: 22, answered: 330, correct: 238, pct: 72 },
  ],
};
export const DEMO_MEMBERS = ["Ana", "Brayan", "Camila R.", "Dani", "Esteban", "Fer", "Gabi", "Juanjo"];
