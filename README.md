# ProICFES

App web interactiva y gratuita para preparar el examen **Saber 11 (ICFES)**: lecciones cortas, modo práctica con
retroalimentación inmediata, mini simulacro y puntaje global estimado por áreas.

Sitio: <https://gjm-lndustries.github.io/>

## Tecnología

React 19 + TypeScript + Vite + Tailwind CSS 4, con `wouter` (rutas), `framer-motion` y `recharts`.
Es una app 100 % estática: no tiene servidor, cuentas ni pagos. El progreso se guarda en el navegador
(`localStorage`, clave `proicfes_progress`).

## Desarrollo

```bash
pnpm install
pnpm dev                 # servidor local en http://localhost:3000
pnpm check               # TypeScript
pnpm validate:questions  # valida el banco de preguntas
pnpm test                # pruebas (vitest)
pnpm build               # compila a dist/ (incluye el paso postbuild)
pnpm preview             # sirve dist/ localmente
```

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`, que compila y publica `dist/` en GitHub Pages con las
acciones oficiales (`configure-pages`, `upload-pages-artifact`, `deploy-pages`). En **Settings → Pages → Build and
deployment → Source** debe estar seleccionado **GitHub Actions**.

### Rutas y recargas

GitHub Pages no sabe nada de las rutas de React. Después de `vite build`, `scripts/postbuild.mjs` copia
`index.html` a cada ruta estática (`dist/practica/index.html`, `dist/practica.html`, …) con su propio título y
descripción, genera `404.html` (para rutas desconocidas) y `sitemap.xml`. Si agregas una página nueva, añádela
también en `scripts/routes.mjs`.

## Banco de preguntas

```
src/data/questions/
  matematicas.json  lectura-critica.json  ciencias-naturales.json
  sociales-ciudadanas.json  ingles.json
  stimuli.json      # textos y tablas compartidos por varias preguntas
  types.ts          # tipos TypeScript y competencias válidas por área
  validate.ts       # reglas de validación (usadas por el script y las pruebas)
```

Cada pregunta tiene:

| Campo | Descripción |
|---|---|
| `id` | Identificador único (p. ej. `mat-001`) |
| `area` | `matematicas`, `lectura-critica`, `ciencias-naturales`, `sociales-ciudadanas` o `ingles` |
| `competencia` / `afirmacion` | Competencia del marco Saber 11 y descripción de lo que se evalúa |
| `difficulty` | 1 (básico), 2 (intermedio) o 3 (avanzado) |
| `stimulusId` | Opcional: id de un texto/tabla en `stimuli.json` (Markdown sencillo, tablas con `\|`) |
| `enunciado`, `options` (`[{id, text}]`), `answer` | Pregunta, opciones y id de la opción correcta |
| `explanation`, `tip` | Explicación de la respuesta y consejo corto |
| `source` | `original` (escrita para ProICFES) o `proicfes-lecciones` (migrada de las lecciones) |
| `reviewed` | `true` solo cuando un docente la revisó |

Las lecciones (`src/lib/appData.ts`, campo `questionIds`) y el simulacro (`src/data/simulacro.ts`) leen sus preguntas
de este banco. **No agregues preguntas copiadas de cuadernillos oficiales u otras fuentes con derechos de autor**:
escribe preguntas originales y márcalas con `reviewed: false` hasta que un docente las revise.
