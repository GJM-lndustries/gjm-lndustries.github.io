import { Link } from 'wouter';
import { Compass, Home, PenLine } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-4">
      <span className="icon-tile mx-auto h-14 w-14 rounded-2xl bg-navy/5 text-navy" aria-hidden="true">
        <Compass className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <h1 className="page-title">Página no encontrada</h1>
      <p className="text-muted-foreground">
        La dirección que abriste no existe o cambió de lugar. Tu progreso sigue guardado.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/inicio"
          className="btn-primary"
        >
          <Home className="w-4 h-4" aria-hidden="true" /> Ir al inicio
        </Link>
        <Link
          href="/practica"
          className="btn-secondary"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" /> Practicar
        </Link>
      </div>
    </div>
  );
}
