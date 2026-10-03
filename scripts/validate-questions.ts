/**
 * Valida el banco de preguntas: ids únicos, respuesta dentro de las opciones,
 * campos obligatorios, competencias válidas y estímulos existentes.
 * Uso: pnpm validate:questions
 */
import fs from "node:fs";
import path from "node:path";
import { AREA_IDS } from "../src/data/questions/types";
import { validateBank, type BankFile } from "../src/data/questions/validate";

const dir = path.resolve(import.meta.dirname, "../src/data/questions");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

const files: BankFile[] = AREA_IDS.map(area => ({
  area,
  file: `${area}.json`,
  questions: read(`${area}.json`),
}));
const stimuli = read("stimuli.json");
const errors = validateBank(files, stimuli);

for (const f of files) {
  const qs = f.questions as { source?: string; reviewed?: boolean }[];
  const original = qs.filter(q => q.source === "original").length;
  const pending = qs.filter(q => q.reviewed === false).length;
  console.log(
    `${f.file.padEnd(26)} ${String(qs.length).padStart(3)} preguntas (${original} originales nuevas, ${pending} sin revisión docente)`
  );
}
console.log(`stimuli.json               ${String(stimuli.length).padStart(3)} estímulos`);

if (errors.length) {
  console.error(`\n✖ ${errors.length} error(es):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✔ Banco de preguntas válido");
