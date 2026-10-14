import React from "react";

/**
 * Markdown muy sencillo y seguro (sin HTML): párrafos, saltos de línea,
 * **negrita**, *cursiva* y tablas con barras verticales (| a | b |).
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(c => c.trim());
}

function Table({ lines, id }: { lines: string[]; id: string }) {
  const rows = lines.filter(l => !/^\s*\|?\s*:?-{2,}/.test(l)).map(splitRow);
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse bg-card rounded-lg overflow-hidden">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="text-left font-semibold px-3 py-2 bg-primary/10 text-foreground border border-border">
                {renderInline(h, `${id}-h${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} className="px-3 py-1.5 border border-border text-foreground">
                  {renderInline(c, `${id}-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RichText({ text, className = "", inline = false }: { text: string; className?: string; inline?: boolean }) {
  const blocks = text.split(/\n\s*\n/);
  if (inline) {
    // Dentro de <button> solo se permite contenido de frase: <span> en vez de <div>/<p>/<table>.
    return (
      <span className={`block ${className}`}>
        {blocks.map((block, bi) => (
          <span key={bi} className={`block leading-relaxed${bi > 0 ? " mt-2" : ""}`}>
            {block.split("\n").map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l, `i${bi}-${li}`)}
              </React.Fragment>
            ))}
          </span>
        ))}
      </span>
    );
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every(l => l.trim().startsWith("|"))) {
          return <Table key={bi} lines={lines} id={`t${bi}`} />;
        }
        return (
          <p key={bi} className="leading-relaxed">
            {lines.map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l, `p${bi}-${li}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
