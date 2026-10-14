# Créditos de imágenes

Todas las imágenes se alojan en este mismo sitio (no se cargan desde terceros).
La lista pública está en https://proicfes.com.co/creditos (`src/pages/Creditos.tsx`).
Mantén los dos lugares sincronizados al agregar o quitar una imagen.

## Imágenes de la portada (generadas con IA)

Las cuatro imágenes de la portada fueron **generadas con Google Gemini (IA) para ProICFES** en octubre de 2026.
No son fotos de personas reales. Originales en JPEG (2400×1792 y 2048×2048), convertidos a WebP con ffmpeg/libwebp.

| Archivo | Original | Descripción | Dónde se usa | Proceso |
|---------|----------|-------------|--------------|---------|
| `public/images/landing/estudiante-1200.webp`, `estudiante-800.webp` | `escena-1-a.jpeg` | Estudiante de grado 11 con uniforme escribe en su cuaderno y revisa el celular en el patio del colegio | Portada, «Pensado para estudiantes de grado 11» | Recorte 4:3 (2133×1600 desde x=0, y=150) centrado en la estudiante; 1200×900 y 800×600, calidad 80/78 |
| `public/images/landing/estudia-bus-800.webp`, `-480.webp` | `escena-2-a.jpeg` | Dos estudiantes revisan una pregunta en el celular en un bus urbano | Portada, «Estudia donde estés» | 1:1, 800 y 480 px, calidad 78 |
| `public/images/landing/estudia-casa-800.webp`, `-480.webp` | `escena-3-a.jpeg` | Estudiante toma apuntes en la mesa de la cocina, de noche | Portada, «Estudia donde estés» | 1:1, 800 y 480 px, calidad 78 |
| `public/images/landing/estudia-biblioteca-800.webp`, `-480.webp` | `escena-4-a.jpeg` | Estudiante escribe en su cuaderno en una biblioteca pública | Portada, «Estudia donde estés» | 1:1, 800 y 480 px, calidad 78 |

Para reemplazar una imagen, conserva el nombre de archivo y la proporción (4:3 o 1:1) y actualiza esta tabla y `Creditos.tsx`.

## Ilustraciones y gráficos

- El logo, el ícono de la app y la imagen para redes (`public/og-image-v2.jpg`) son diseños propios de ProICFES.
- La maqueta del celular en la portada es HTML/CSS propio que reproduce la interfaz real de la app.
- Los íconos de la interfaz son de [Lucide](https://lucide.dev) (licencia ISC).

## Retiradas (octubre de 2026)

- `estudiante-*.webp` anterior: foto de Vitaly Gariev en Unsplash. Reemplazada por la imagen generada con Gemini; ya no se usa, así que se quitó su crédito.
- `public/images/hero-icfes*.webp` y `public/images/modulo-*.webp`: ilustraciones generadas por IA con estilo de dibujo o de stock sin crédito verificable. Eliminadas.
- `public/images/landing/hero-study.jpg`, `practice.jpg`, `friends.jpg`: no se pudo verificar el autor ni la página de origen. Eliminadas.

Toda imagen generada con IA debe indicarse como tal en `/creditos`.
