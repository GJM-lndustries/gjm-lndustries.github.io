# ProICFES

App web interactiva y gratuita para preparar el examen **Saber 11 (ICFES)**: lecciones cortas, modo práctica con
retroalimentación inmediata, mini simulacro y puntaje global estimado por áreas.

Sitio: <https://proicfes.com.co> · Hecho por GJM lndustries

## Tecnología

React 19 + TypeScript + Vite + Tailwind CSS 4, con `wouter` (rutas), `framer-motion` y `recharts`.
Fuentes Lexend y DM Sans autoalojadas (`src/assets/fonts`, licencia SIL OFL).
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

## Dominio y configuración del sitio

La URL pública vive en **un solo lugar**: `src/config/site.ts` (`SITE.url`, hoy `https://proicfes.com.co`).
De ahí salen el canonical, `hreflang`, Open Graph, JSON-LD, `sitemap.xml` y `robots.txt`. Para cambiar de dominio
basta con editar esa constante y volver a compilar.

## Despliegue

`pnpm build` deja en `dist/` un sitio 100 % estático que funciona en cualquier hosting estático.

- **Cloudflare Pages** (recomendado con el dominio propio): conectar el repositorio de GitHub, *Framework preset*
  «None», *Build command* `pnpm build`, *Build output directory* `dist`, variable `NODE_VERSION=22`. Agregar el
  dominio `proicfes.com.co` en *Custom domains*. `public/_headers` define la caché de los archivos con hash.
- **GitHub Pages**: cada push a `main` ejecuta `.github/workflows/deploy.yml`, que valida, compila y publica `dist/`
  con las acciones oficiales (`configure-pages`, `upload-pages-artifact`, `deploy-pages`). En **Settings → Pages →
  Build and deployment → Source** debe estar seleccionado **GitHub Actions**. Si el sitio pasa a Cloudflare Pages,
  se puede desactivar el job `deploy` (el job `build` sigue sirviendo como verificación de cada PR).

### Prerender, rutas y SEO

`pnpm build` hace tres pasos: `vite build` (la app), `vite build --ssr src/entry-server.tsx` (versión para Node) y
`scripts/postbuild.mjs`, que:

- prerenderiza cada ruta con React y escribe `dist/<ruta>/index.html` y `dist/<ruta>.html` con el **contenido real
  visible sin JavaScript**, más su `<title>`, descripción, canonical, `hreflang`, Open Graph y JSON-LD
  (`src/seo/head.ts`, `src/seo/jsonld.ts`). Así los enlaces directos y recargas responden 200;
- genera `404.html` (noindex), `sitemap.xml` y `robots.txt`;
- precarga las fuentes principales.

En el navegador, `src/main.tsx` **hidrata** ese HTML (sin animaciones de entrada en el primer cuadro) y carga el
progreso guardado justo después. Por eso el primer render debe ser determinista: nada de `localStorage`,
`Date.now()` o `Math.random()` durante el render inicial (usar `useEffect`).

Las rutas y sus metadatos están en `src/seo/routes.ts`. **Si agregas una página**, añádela ahí y en `src/App.tsx`.
Las páginas personales (Mi progreso, Logros, Ranking, Meta) llevan `noindex` y no van al sitemap.

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
