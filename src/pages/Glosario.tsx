import { useState } from 'react';
import { modules, allGlossaryTerms } from '@/lib/appData';
import { Search, BookOpen, ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { withMotion } from '@/components/withMotion';

interface TermCardProps {
  term: string;
  simple: string;
  technical: string;
}

function TermCard({ term, simple, technical }: TermCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </span>
          <span className="font-semibold text-foreground font-['Lexend'] text-sm">{term}</span>
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                  En palabras simples:
                </p>
                <p className="text-sm text-foreground leading-relaxed">{simple}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  Definición técnica:
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed italic">{technical}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Glosario() {
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const uniqueTerms = allGlossaryTerms();

  const filtered = uniqueTerms.filter(t => {
    const matchesSearch = !search || 
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.simple.toLowerCase().includes(search.toLowerCase());
    const matchesModule = !activeModule || t.module === activeModule;
    return matchesSearch && matchesModule;
  });

  const moduleFilters = ['General', ...modules.map(m => m.title)];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Glosario</h1>
        <p className="text-muted-foreground mt-1">
          Todas las palabras técnicas explicadas en lenguaje cotidiano
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar una palabra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Module filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveModule(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !activeModule ? 'bg-navy text-white' : 'border border-border bg-card text-foreground hover:border-navy/30'
          }`}
        >
          Todos ({uniqueTerms.length})
        </button>
        {moduleFilters.map(mod => {
          const count = uniqueTerms.filter(t => t.module === mod).length;
          if (count === 0) return null;
          return (
            <button
              key={mod}
              onClick={() => setActiveModule(activeModule === mod ? null : mod)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeModule === mod ? 'bg-navy text-white' : 'border border-border bg-card text-foreground hover:border-navy/30'
              }`}
            >
              {mod} ({count})
            </button>
          );
        })}
      </div>

      {/* Terms */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <span className="icon-tile mx-auto mb-3 h-12 w-12 rounded-2xl bg-muted text-muted-foreground" aria-hidden="true"><SearchX className="h-6 w-6" strokeWidth={1.75} /></span>
            <p className="text-muted-foreground">No encontramos esa palabra</p>
            <p className="text-sm text-muted-foreground mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          filtered.map((term, idx) => (
            <TermCard key={idx} term={term.term} simple={term.simple} technical={term.technical} />
          ))
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">
        {filtered.length} términos encontrados
      </p>
    </div>
  );
}

export default withMotion(Glosario);
