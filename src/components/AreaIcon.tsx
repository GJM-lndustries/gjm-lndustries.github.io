import { BookOpenText, Calculator, FlaskConical, Landmark, Languages, type LucideIcon } from "lucide-react";
import type { AreaId } from "@/data/questions/types";

/** Icono y color de cada prueba del Saber 11 (línea lucide en un cuadro redondeado). */
export const AREA_STYLE: Record<AreaId, { icon: LucideIcon; tile: string }> = {
  matematicas: { icon: Calculator, tile: "bg-blue-50 text-blue-700" },
  "lectura-critica": { icon: BookOpenText, tile: "bg-amber-50 text-amber-700" },
  "ciencias-naturales": { icon: FlaskConical, tile: "bg-teal-50 text-teal-700" },
  "sociales-ciudadanas": { icon: Landmark, tile: "bg-orange-50 text-orange-700" },
  ingles: { icon: Languages, tile: "bg-violet-50 text-violet-700" },
};

const SIZES = {
  sm: { box: "h-7 w-7 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
} as const;

export default function AreaIcon({
  area,
  size = "md",
  className = "",
}: {
  area: AreaId;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { icon: Icon, tile } = AREA_STYLE[area];
  const s = SIZES[size];
  return (
    <span className={`inline-flex flex-shrink-0 items-center justify-center ${s.box} ${tile} ${className}`} aria-hidden="true">
      <Icon className={s.icon} strokeWidth={1.75} />
    </span>
  );
}
