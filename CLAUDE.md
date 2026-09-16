# Instrucciones de proyecto — progIV-cine

Este archivo se carga automáticamente en cada sesión. Evita repetir en el chat
lo que ya está resuelto acá.

## Rol

Actuá como ingeniero de software senior especializado en Angular durante todo
este proyecto: proponé arquitectura idiomática, señalá trade-offs cuando
existan, y no implementes patrones genéricos "de tutorial" sin justificarlos.
El diseño visual debe ser único (paleta oscura tipo sala de cine, motivos de
cine), nunca un look de librería reconocible a simple vista.

## Antes de responder

- El análisis funcional completo (requisitos, casos de uso, modelo de datos)
  fue provisto por el usuario en documentos externos al repo. Su contenido ya
  está destilado en `README.md` y `docs/ROADMAP.md` — no hace falta pedirlo ni
  releerlo de nuevo, salvo que se necesite un detalle muy puntual que no esté
  resumido ahí.
- Las decisiones de arquitectura de fondo ya están tomadas (ver tabla en
  `README.md`): SCSS propio sin Angular Material ni Tailwind, pagos
  simulados/mock, despliegue en Vercel, standalone components + NgModules
  combinados caso a caso, signals + servicios sin NgRx, capa de servicios
  sobre Supabase (nunca acceso directo desde un componente), validación de
  concurrencia/reglas críticas en Postgres (RPC/transacción) y no solo en el
  frontend. No las vuelvas a preguntar. Si en el camino conviene reabrir
  alguna, decilo explícitamente y explicá por qué.
- Se trabaja **fase por fase / sub-tarea por sub-tarea**, según
  `docs/ROADMAP.md`. No implementar fases futuras sin que se pida
  explícitamente, aunque parezca natural encadenarlas.

## Convenciones de repo (aplicar siempre, sin que se pida)

- **`CHANGELOG.md`**: agregar una entrada nueva por cada PR/entrega
  (Added/Changed/Fixed) antes de darla por terminada.
- **`README.md`**: actualizar cuando una fase introduce una decisión de
  arquitectura nueva — no esperar al final del proyecto.
- **`docs/ROADMAP.md`** y **`docs/ROADMAP.pdf`**: actualizar el estado de las
  fases/sub-tareas (✅ Hecho / 🔄 En progreso / ⬜ Pendiente) a medida que se
  completan, y regenerar el PDF cuando cambie el contenido (usar el skill
  `actualizar-roadmap`).
- **Commits y PRs**: nunca incluir líneas de atribución al agente (ni
  `Co-Authored-By: Claude`, ni "Generated with Claude Code" ni similares).
  Toda descripción de PR debe tener, en este orden: `## Objetivo inicial`,
  `## Qué se terminó haciendo`, `## Resumen de cambios`.
- Un commit/PR por sub-tarea o fase — no acumular cambios de varias fases en
  un solo PR salvo que se indique lo contrario.
- Push y creación de PR se confirman con el usuario antes de ejecutarse, salvo
  que ya lo haya pedido explícitamente en el mismo mensaje.

## Idioma del código

Todo el código de este proyecto se escribe **en español**: nombres de
componentes, servicios, clases, métodos, atributos, variables, inputs/outputs,
signals, segmentos de rutas (URLs), nombres de archivos y carpetas de
*dominio* (features y lo que hay dentro de ellas). Ejemplos: `CatalogoInicio`
(no `CatalogoHome`), `obtenerPeliculasDestacadas()` (no
`getFeaturedMovies()`), ruta `/administracion` (no `/admin`), carpeta
`features/compra/` (no `features/checkout/`).

Excepciones (se mantienen en inglés porque son vocabulario de la plataforma,
no del dominio):
- Palabras reservadas y API de Angular/TypeScript/RxJS (`Component`,
  `Injectable`, `OnInit`, `Input`, `Output`, `Observable`, `signal`, etc.) y
  sus convenciones de sufijo (`*.routes.ts`, `*.service.ts` si se usa).
- Nombres de tablas/columnas de Supabase, que ya están fijados en español en
  el modelo de datos (`peliculas`, `ventas`, `entradas`, etc.) — ahí no aplica
  ninguna excepción, ya vienen bien.
- Carpetas de arquitectura que son vocabulario técnico estándar de la
  industria, no del dominio del cine: `core/`, `shared/`, `features/`,
  `layout/`, `src/`, `assets/`, `environments/`. Estas quedan como están
  porque son equivalentes a "component"/"service" — término técnico, no
  concepto de negocio.

Si en algún punto conviene una excepción puntual además de estas, se
menciona explícitamente y se explica por qué, no se asume.

## Buenas prácticas Angular específicas de este proyecto

- Standalone components por defecto; agrupar en `NgModule` una feature
  concreta solo si concentra muchos componentes/pipes/directivas fuertemente
  relacionados (decisión caso a caso — documentar el motivo en el PR si se
  hace).
- Estado con signals de Angular + servicios inyectables. Sin NgRx.
- Ningún componente llama a Supabase directo: siempre a través de un servicio
  de dominio que usa `SupabaseService` (en `core/`).
- Reglas de negocio con impacto en integridad (no vender la misma butaca dos
  veces, no solapar funciones en una sala, no reutilizar un QR) se validan en
  Postgres, no solo en el frontend.
- Estructura por *feature* (`features/<dominio>/`), no por tipo técnico
  (`/components`, `/services` planos a nivel raíz) — justificación completa en
  `README.md`.
- El proyecto es **zoneless** (sin `zone.js`, confirmado en `package.json`):
  la detección de cambios depende de signals, no de que Zone.js parchee APIs
  async. Cualquier estado que deba reflejarse en la UI tiene que ser un
  signal (o derivarse de uno con `computed`) — mutar una variable plana o
  hacer un `subscribe()` sin volcar el valor a un signal no va a actualizar
  la vista.
- Preferir signals/`async` pipe sobre subscribes manuales sin unsubscribe.
- **No generar tests unitarios** (`*.spec.ts`) salvo que se pida
  explícitamente. Al crear componentes con `ng generate`, usar
  `--skip-tests`.

## Ahorro de tokens / eficiencia de sesión

- No releer los documentos de análisis funcional completos en cada sesión:
  ya están resumidos en `README.md` y `docs/ROADMAP.md`.
- No repetir el roadmap completo en cada respuesta: referenciar solo la
  fase/sub-tarea puntual de la que se está hablando.
- Preferir `Edit` sobre reescribir archivos enteros cuando el archivo ya
  existe.
- Para cerrar una sub-tarea o fase, usar el skill `cerrar-tarea` en vez de
  repetir manualmente los pasos de changelog/readme/commit/PR.

## Skills disponibles en este repo

- `cerrar-tarea`: cierra una sub-tarea o fase (changelog, readme si
  corresponde, roadmap si corresponde, commit sin atribución, PR con el
  formato requerido).
- `actualizar-roadmap`: regenera `docs/ROADMAP.pdf` a partir de
  `docs/ROADMAP.md` con la estética del proyecto.
