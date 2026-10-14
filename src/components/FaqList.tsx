import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/data/faq';

/** Lista de preguntas frecuentes con <details>: funciona sin JavaScript y es legible para buscadores. */
export default function FaqList({ items, headingLevel = 'h2' }: { items: FaqItem[]; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="space-y-2">
      {items.map(item => (
        <details key={item.id} id={item.id} className="card group">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
            <Heading className="font-semibold text-foreground font-['Lexend'] text-sm sm:text-base">{item.question}</Heading>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-4 pb-4 space-y-2 text-sm text-foreground/90 leading-relaxed">
            {item.answer.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
