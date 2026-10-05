import { Link } from 'wouter';
import { Home, PenLine } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-4">
      <div className="text-6xl" aria-hidden="true">🧭</div>
      <h1 className="text-3xl font-bold font-['Lexend'] text-foreground">Página no encontrada</h1>
      <p className="text-muted-foreground">
        La dirección que abriste no existe o cambió de lugar. ¡Pero tu progreso sigue guardado!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90"
        >
          <Home className="w-4 h-4" aria-hidden="true" /> Ir al inicio
        </Link>
        <Link
          href="/practica"
          className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/5"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" /> Practicar
        </Link>
      </div>
    </div>
  );
}
