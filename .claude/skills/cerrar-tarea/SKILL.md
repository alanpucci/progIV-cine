---
name: cerrar-tarea
description: Cierra una sub-tarea o fase del roadmap del cine (changelog, readme, roadmap, commit y PR) sin repetir las instrucciones cada vez. Usar cuando el usuario pida cerrar, wrappear, commitear o hacer el PR de lo que se acaba de hacer.
---

Cuando el usuario pida cerrar/wrappear una sub-tarea o fase (ej. "cerremos
esto", "hagamos el commit y el PR", "terminemos la fase X"), seguir este
checklist en orden. No saltear pasos aunque parezcan triviales.

1. **`CHANGELOG.md`**: agregar una entrada nueva (`## [Fase X.Y] - fecha`,
   fecha real de la sesión) con lo agregado/cambiado/corregido en esta
   entrega, en secciones Added/Changed/Removed según corresponda.

2. **`README.md`**: revisar si esta sub-tarea introdujo o cambió una decisión
   de arquitectura (nueva carpeta estructural, nueva librería, cambio de
   patrón, nueva convención). Si sí, actualizar la sección correspondiente. Si
   no hubo cambios de arquitectura, no tocar el README solo por tocarlo.

3. **`docs/ROADMAP.md`** / **`docs/ROADMAP.pdf`**: **preguntar primero** si
   corresponde actualizarlos (no siempre hace falta). Si el usuario confirma,
   actualizar el estado de la sub-tarea/fase (⬜ Pendiente → 🔄 En progreso →
   ✅ Hecho) y cualquier detalle del plan que haya cambiado en el camino
   (alcance, decisiones, puntos abiertos resueltos), y regenerar el PDF — ver
   el skill `actualizar-roadmap` para el procedimiento exacto (HTML con la
   paleta del proyecto + Chrome headless). Si el usuario dice que no hace
   falta, seguir sin tocarlos.

4. **Commit**: crear una rama con nombre descriptivo en inglés o español
   consistente con el historial (`feature/...`, `fix/...`, `chore/...`,
   `docs/...`), y commitear con un mensaje corto y claro. **Nunca** incluir
   líneas de atribución al agente (ni `Co-Authored-By: Claude`, ni "Generated
   with Claude Code", ni variantes).

5. **Push + PR**: pushear la rama. Si `gh` está disponible, crear el PR con
   `gh pr create`. Si no está instalado, generar un link de GitHub
   `compare/<rama>?quick_pull=1&title=...&body=...` con título y descripción
   pre-cargados (usar Python `urllib.parse.urlencode` para armar la URL) y
   pasárselo al usuario para que lo confirme con un clic.

   La descripción del PR **siempre** debe tener estas tres secciones, en este
   orden, y nada de atribución al agente en el body:
   - `## Objetivo inicial` — qué se buscaba hacer originalmente.
   - `## Qué se terminó haciendo` — el resultado real, marcando explícitamente
     cualquier desvío respecto al objetivo inicial.
   - `## Resumen de cambios` — lista concreta de archivos/áreas modificadas.

   Un checklist de plan de pruebas al final es un plus, no reemplaza las tres
   secciones anteriores.

6. Push y creación del PR se confirman con el usuario antes de ejecutarse,
   salvo que ya haya sido pedido explícitamente en el mismo mensaje que
   disparó este skill.
