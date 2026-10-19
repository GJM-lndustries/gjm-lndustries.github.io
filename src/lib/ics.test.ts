import { describe, expect, it } from "vitest";
import { dailyReminderIcs, defaultTimeFor, escapeText, examReminderIcs, foldLine } from "./ics";

const NOW = new Date("2026-10-19T17:00:00Z"); // 12:00 m. en Bogotá

describe("calendario .ics", () => {
  it("escapa comas, punto y coma, barras y saltos de línea", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("corta líneas largas en 75 bytes sin partir tildes", () => {
    const long = "DESCRIPTION:" + "áé".repeat(60);
    const folded = foldLine(long);
    for (const l of folded.split("\r\n")) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(long);
  });

  it("reto diario: hora de Bogotá, duración, alarma y fin antes del examen", () => {
    const ics = dailyReminderIcs({ minutes: 10, time: "06:30", examWindow: "2027-07", intention: "Voy a estudiar 10 minutos en el bus.", now: NOW });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("TZID:America/Bogota");
    expect(ics).toContain("DTSTART;TZID=America/Bogota:20261019T063000");
    expect(ics).toContain("DURATION:PT10M");
    expect(ics).toContain("RRULE:FREQ=DAILY;UNTIL=20270701T045900Z");
    expect(ics).toContain("TRIGGER:PT0M");
    expect(ics).toContain("SUMMARY:Reto ProICFES (10 min)");
    expect(ics).not.toMatch(/[^\r]\n/); // solo CRLF
  });

  it("sin fecha de examen el reto se repite sin fin", () => {
    expect(dailyReminderIcs({ minutes: 5, time: "20:00", examWindow: "nose", now: NOW })).toContain("RRULE:FREQ=DAILY\r\n");
  });

  it("examen: todo el día, dice que la fecha es aproximada y avisa 30 días antes", () => {
    const ics = examReminderIcs("2027-07", NOW)!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20270701");
    expect(ics).toContain("SUMMARY:Mi ICFES: julio/agosto de 2027 (confirma la fecha)");
    expect(ics.replace(/\r\n /g, "")).toMatch(/aproximada/);
    expect(ics).toContain("TRIGGER:-P30D");
    expect(examReminderIcs("2027-08", NOW)).toContain("DTSTART;VALUE=DATE:20270701");
    expect(examReminderIcs("nose", NOW)).toBeNull();
  });

  it("hora sugerida según el momento del plan", () => {
    expect(defaultTimeFor("En el bus o en el camino")).toBe("06:30");
    expect(defaultTimeFor("En la noche, antes de las 9")).toBe("20:00");
    expect(defaultTimeFor("")).toBe("18:00");
  });
});
