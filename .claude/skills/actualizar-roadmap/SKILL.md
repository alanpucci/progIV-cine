---
name: actualizar-roadmap
description: Regenera docs/ROADMAP.pdf a partir de docs/ROADMAP.md con la estética oscura del proyecto, usando Chrome headless (no requiere instalar pandoc/wkhtmltopdf). Usar cuando cambie el contenido o el estado de fases del roadmap.
---

Este entorno no tiene `pandoc` ni `wkhtmltopdf` instalados, pero sí Google
Chrome. El procedimiento probado es HTML propio → Chrome headless → PDF.

1. Editar `docs/ROADMAP.md` primero con los cambios de contenido/estado que
   correspondan (fases, sub-tareas, decisiones, puntos abiertos). Ese archivo
   es la fuente de verdad editable; el PDF es solo una vista renderizada.

2. Traducir ese contenido a un HTML standalone (guardado en el scratchpad de
   la sesión, no en el repo) con la paleta oscura tipo sala de cine ya
   validada:
   - `--bg-void: #0b0d12`, `--bg-surface: #14161d`, `--bg-surface-2: #1b1e28`
   - `--accent-marquee: #d4ab5a` (dorado apagado), `--accent-film: #7c8ba1`
   - `--text-primary: #e8e6e1`, `--text-muted: #9aa0ad`
   - Estados: ✅ Hecho en verde (`#7fb37a`), 🔄 En progreso en dorado
     (`--accent-marquee`), ⬜ Pendiente en gris (`#5b6472`).
   - Portada con detalle de cinta de película en los bordes laterales
     (`repeating-linear-gradient` vertical simulando perforaciones).
   - Tablas para la lista de sub-tareas de cada fase con su estado.

3. Renderizar a PDF con Chrome headless:
   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --no-pdf-header-footer \
     --print-to-pdf="<ruta-absoluta-al-repo>/docs/ROADMAP.pdf" \
     "file://<ruta-absoluta-al-html-en-scratchpad>"
   ```

4. Confirmar que el archivo se escribió (tamaño de archivo > 0, ver el log de
   Chrome que imprime "N bytes written to file ...") y avisar al usuario dónde
   quedó.

No commitear `docs/ROADMAP.pdf` automáticamente — es un binario, y el usuario
decide si entra al mismo PR que el resto de los cambios o a uno aparte
(`docs: actualiza roadmap`).
