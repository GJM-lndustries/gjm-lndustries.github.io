/**
 * Archivos de calendario (.ics, RFC 5545) para recordar el reto diario y la fecha del examen.
 * Se generan en el navegador: no se envía nada a ningún servidor.
 */
import { examWindowLabel, windowStart } from "./plan";

const TZID = "America/Bogota";
const SITE = "https://proicfes.com.co";

/** Colombia no tiene horario de verano: UTC−5 todo el año. */
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0500",
  "TZNAME:COT",
  "END:STANDARD",
  "END:VTIMEZONE",
];

export function escapeText(t: string): string {
  return t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Corta líneas de más de 75 bytes (UTF-8) como pide el estándar, sin partir caracteres. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // las líneas de continuación empiezan con un espacio
    if (bytes + n > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

/** Fecha y hora de Bogotá (YYYYMMDD) para un instante. */
function bogotaYmd(d: Date): [number, number, number] {
  const b = new Date(d.getTime() - 5 * 3600000);
  return [b.getUTCFullYear(), b.getUTCMonth() + 1, b.getUTCDate()];
}

function calendar(events: string[][], now: Date): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ProICFES//Recordatorios//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...VTIMEZONE,
    ...events.flatMap(e => ["BEGIN:VEVENT", `DTSTAMP:${utcStamp(now)}`, ...e, "END:VEVENT"]),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Hora sugerida según el momento que eligió en el plan (se puede cambiar). */
export function defaultTimeFor(moment: string | undefined): string {
  const m = (moment ?? "").toLowerCase();
  if (m.includes("bus") || m.includes("camino")) return "06:30";
  if (m.includes("almorzar")) return "13:30";
  if (m.includes("noche")) return "20:00";
  if (m.includes("colegio")) return "15:00";
  return "18:00";
}

export interface DailyReminderOptions {
  minutes: number;
  /** «HH:MM», hora de Bogotá. */
  time: string;
  /** Ventana del examen (AAAA-MM); si existe, el recordatorio termina ese mes. */
  examWindow?: string;
  intention?: string;
  now?: Date;
}

/** Evento diario de N minutos con alarma a la hora elegida. */
export function dailyReminderIcs({ minutes, time, examWindow, intention, now = new Date() }: DailyReminderOptions): string {
  const [hh, mm] = time.split(":").map(Number) as [number, number];
  const [y, mo, d] = bogotaYmd(now);
  const start = `${y}${pad(mo)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  let rrule = "RRULE:FREQ=DAILY";
  if (examWindow && examWindow !== "nose") {
    const [ey, em] = windowStart(examWindow);
    // Hasta el último día del mes anterior al examen, a las 23:59 de Bogotá (04:59 UTC del día siguiente).
    rrule += `;UNTIL=${ey}${pad(em)}01T045900Z`;
  }
  const desc = [
    intention ?? `Tu reto de ${minutes} minutos para el ICFES.`,
    `Entra a ${SITE}/inicio y haz tu reto de hoy. Si un día no puedes, no pasa nada: tu meta es semanal.`,
  ].join("\n\n");
  return calendar(
    [
      [
        "UID:reto-diario@proicfes.com.co",
        `DTSTART;TZID=${TZID}:${start}`,
        `DURATION:PT${minutes}M`,
        rrule,
        `SUMMARY:${escapeText(`Reto ProICFES (${minutes} min)`)}`,
        `DESCRIPTION:${escapeText(desc)}`,
        `URL:${SITE}/inicio`,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText(`Tu reto de ${minutes} minutos en ProICFES`)}`,
        "TRIGGER:PT0M",
        "END:VALARM",
      ],
    ],
    now
  );
}

/**
 * Evento de todo el día al inicio del mes del examen. Las fechas de 2027 no son oficiales todavía,
 * así que el evento lo dice en el título y pide confirmar en icfes.gov.co.
 */
export function examReminderIcs(examWindow: string, now: Date = new Date()): string | null {
  if (!examWindow || examWindow === "nose") return null;
  const [y, m] = windowStart(examWindow);
  const label = examWindowLabel(examWindow)!;
  return calendar(
    [
      [
        `UID:examen-${y}-${pad(m)}@proicfes.com.co`,
        `DTSTART;VALUE=DATE:${y}${pad(m)}01`,
        `DTEND;VALUE=DATE:${y}${pad(m)}02`,
        `SUMMARY:${escapeText(`Mi ICFES: ${label} (confirma la fecha)`)}`,
        `DESCRIPTION:${escapeText(
          `Presentas el Saber 11 en ${label}. Esta fecha es aproximada: el ICFES publica el día exacto en su resolución de calendario. Revísala en icfes.gov.co (Saber 11, cronograma) y cambia este evento cuando salga.\n\nTu plan: ${SITE}/inicio`
        )}`,
        `URL:${SITE}/cuando-y-cuanto-cuesta`,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText("En un mes es tu ICFES. Revisa la fecha y tu citación en icfes.gov.co")}`,
        "TRIGGER:-P30D",
        "END:VALARM",
      ],
    ],
    now
  );
}

/** Descarga el .ics. En el celular, el sistema lo ofrece para abrirlo con el calendario. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
