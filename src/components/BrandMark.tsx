import { Link } from "wouter";

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 min-h-11">
      <img src="/logo.svg" alt="" width={compact ? 140 : 160} height={32} className="h-8 w-auto" />
      <span className="sr-only">ProICFES</span>
    </Link>
  );
}
