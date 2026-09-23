# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo,
entrega por entrega. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Limpieza de navegación] - 2026-09-23

### Removed
- Carpetas `features/compra/`, `fidelizacion/`, `entradas/`, `cancelaciones/`,
  `proximamente/`, `perfil/`, `empleado/` y `administracion/`: eran
  placeholders de la Fase 0.2 sin funcionalidad real todavía (Fases 3-10 sin
  empezar). Se sacan del repo para que el estado del proyecto no genere
  confusión con features a medio armar; se recrean cuando arranque la fase
  correspondiente.
- `app.routes.ts`: rutas de esas 8 features eliminadas del array (quedan
  `catalogo` y `butacas`, las dos únicas en desarrollo activo).
- Header (`encabezado.html`): nav pública queda solo con "Catálogo" (se
  saca Próximamente/Fidelización/Mis entradas/Perfil).
- Footer (`pie.html`): se saca el bloque "Tu compra" (enlace a
  Cancelaciones) y el CSS asociado (`pie__enlaces*`) que quedaba sin uso;
  `pie.ts` deja de importar `RouterLink`/`RouterLinkActive`.

## [Fase 2.3] - 2026-09-23

### Added
- `src/app/features/salas-butacas/paginas/butacas-inicio/` (`ButacasInicio`):
  mapa visual de butacas de la función seleccionada en la Fase 2.2 — lee el
  `funcionId` de la ruta (`/butacas/funcion/:id`), muestra encabezado
  (película, sala, fecha/hora, tipo de proyección, idioma) y renderiza las
  butacas agrupadas por fila (`filasDeButacas()`, método plano sin
  `computed()`), posicionadas por `numero` en un CSS Grid con
  `grid-column` para tolerar salas con huecos, con diferenciación de color
  normal/accesible/VIP y leyenda. Pasa de `.css` vacío a `.scss` real,
  consistente con el resto del design system. Puramente visual: sin
  selección ni disponibilidad en tiempo real (Fases 2.4/2.5).
- `FuncionesService.obtenerParaMapa(funcionId)` y
  `.obtenerButacasPorSala(salaId)` (`funciones.service.ts`): primer método
  para traer una función individual (con `peliculas`/`salas` joineados) y
  primer método para traer butacas activas de una sala, ambos con su
  mapeo en `funcion.mapeos.ts` (`mapearFuncionMapa`, `mapearButaca`).
- `FuncionMapa` (`funcion.model.ts`): DTO para la pantalla del mapa —
  `FuncionDisponible` (ya existente) no alcanza porque no trae
  `peliculaId`/`peliculaNombre`, necesarios acá para el encabezado y el
  link de "volver".
- `--color-acento-terciario` (`_tokens.scss`): tercer acento (azul) para
  distinguir butacas accesibles sin reusar el dorado marquesina, ya
  ocupado por VIP.
- `supabase/migrations/20260923120000_reseed_butacas_layout_real.sql`:
  el seed de la Fase 0.7 nunca siguió el layout real documentado en
  `docs/03_Modelo_de_Datos_Supabase_Cine.pdf` (tabla `butacas`, columna
  `fila`: "20 filas, columnas de 4/20/4 butacas, filas J/K convertidas en
  butacas accesibles (2/10/2), VIP en filas R/S/T") — quedó con 4-8 filas
  según la sala. Esta migración borra y recarga `butacas` para las 4 salas
  existentes con el layout correcto: filas A-T (K sin butacas, pasillo),
  bloques de 4/6-25/4 con pasillos en los números 5 y 26, fila J reducida
  a 2/10/2 accesible y filas R/S/T en VIP (recargo $1200, mismo valor que
  ya usaba la Sala 3). No se pudo aplicar contra el proyecto real desde
  acá (el `.env` local solo tiene la clave anon pública, sin permiso de
  escritura); a correr manualmente en el SQL Editor de Supabase.

### Changed
- `butacas-inicio.ts`: `filasDeButacas()` ahora completa el rango
  alfabético entre la primera y la última fila con butacas (en vez de
  listar solo las filas con datos), para que una fila intermedia sin
  butacas (la K, pasillo) aparezca igual con su etiqueta y sin asientos —
  generalizable a cualquier sala con huecos de fila, no hardcodeado a "K".
- `butacas-inicio.scss`: el layout real tiene hasta 30 columnas por fila
  (vs. las 10 con las que se diseñó originalmente), así que:
  - `.butacas-mapa` pasa de `max-width: 56rem` a `72rem` (igual que
    `pelicula-detalle`/`catalogo-inicio`).
  - `.butacas-mapa__sala` gana `overflow-x: auto` + `align-self: stretch`
    (no alcanza con `max-width: 100%` dentro de un flex `align-items:
    center` — el ancho no queda acotado al contenedor y nunca dispara el
    scroll) para salas más anchas que la pantalla.
  - `.butacas-mapa__etiqueta-fila` pasa a `position: sticky; left: 0` con
    fondo propio, así la letra de fila no desaparece al hacer scroll
    horizontal en mobile.
  - Butacas de 2.25rem a 2rem (1.5rem en mobile) para que el layout de 20
    filas entre sin scroll en un viewport de escritorio típico (~1280px).

## [Fase 2.2] - 2026-09-23

### Added
- `pelicula-detalle.ts`/`.html`/`.scss`: selección de función desde el
  detalle de película. Cada función pasa de texto estático a un botón
  seleccionable (signal `funcionSeleccionada`), con estado visual de
  seleccionada y muestra sala además de horario, tipo de proyección e
  idioma. CTA (`app-boton`) "Continuar a selección de butacas", deshabilitado
  hasta elegir función, que navega a `/butacas/funcion/:id`.
- `FuncionDisponible` (`funcion.model.ts`) ahora incluye `salaNombre`, vía
  join a `salas` en `FuncionesService.obtenerDisponiblesPorPelicula()`
  (`funciones.service.ts`/`funcion.mapeos.ts`) — mismo workaround de tipado
  ya usado en `pelicula.mapeos.ts` para joins muchos-a-uno sin tipos
  generados de Supabase.

### Changed
- `salas-butacas.routes.ts`: la ruta placeholder pasa de `''` a
  `'funcion/:id'`, a la espera del mapa real de butacas (Fase 2.3).

## [Configuración de repo] - 2026-09-23

### Removed
- `supabase/` y `.claude/` dejan de versionarse (agregados a `.gitignore`,
  destrackeados con `git rm --cached`). Los archivos siguen en disco
  (migraciones SQL, skills), pero de acá en más no viajan por git.

## [Fase 2.1] - 2026-09-23

### Added
- `src/app/core/modelos/funcion.model.ts`: modelos `Sala`, `Butaca`,
  `Funcion` y `ReservaButaca` (M03/M04), más `FuncionDisponible` (movido
  desde `pelicula.model.ts`, ahora dominio de `funcion.model.ts`).
- `src/app/core/servicios/funciones.service.ts` (`FuncionesService`):
  `obtenerDisponiblesPorPelicula()`, con la query a la tabla `funciones` que
  antes vivía inline en `PeliculasService.obtenerDetalle()`.
- `src/app/core/helpers/funcion.mapeos.ts`: `mapearFuncionDisponible` (movido
  desde `pelicula.mapeos.ts`).

### Changed
- `PeliculasService.obtenerDetalle()` delega en
  `FuncionesService.obtenerDisponiblesPorPelicula()` en vez de consultar
  `funciones` directamente — evita duplicar esa query a medida que más
  features (`salas-butacas`, `compra`, `administracion`) necesiten funciones
  de una película. Detalle y justificación en `README.md`.

## [Fase 1.4] - 2026-09-23

### Added
- `src/app/features/catalogo/paginas/pelicula-detalle/` (`PeliculaDetallePagina`):
  página de detalle de película — poster, nombre, duración, clasificación,
  géneros, fecha de estreno, sinopsis, badge de preventa, funciones
  disponibles agrupadas por día y reseñas con promedio de estrellas. Usa
  `PeliculasService.obtenerDetalle()` (ya existente desde la Fase 1.1).
  Ruta `pelicula/:id` (`catalogo.routes.ts`), con el `id` leído vía
  `ActivatedRoute.snapshot.paramMap.get('id')` (no `withComponentInputBinding()`,
  API de Router no vista en la materia) — detalle y trade-off en `README.md`.
- `src/app/core/helpers/pelicula.formato.ts`: `formatearFechaFuncion`,
  `formatearHoraFuncion` y `formatearFechaEstreno`.

### Changed
- `catalogo-inicio.html`/`.ts`/`.scss`: el podio de destacadas y la grilla de
  la Fase 1.2/1.3 pasan a ser enlaces (`routerLink`) a `/pelicula/:id`.
- `docs/ROADMAP.md`/`docs/ROADMAP.pdf`: desglose de sub-tareas de las Fases
  2 a 13 (planificación, sin tocar el estado de la Fase 1).

## [Fase 1.3] - 2026-09-22

### Fixed
- `docs/ROADMAP.md`: la sub-tarea 1.2 había quedado en ⬜ pese a estar
  mergeada (PR #14) — se corrige a ✅ junto con el estado de esta entrega.

### Added
- `src/app/core/helpers/texto.helpers.ts`: `normalizarTexto` (minúsculas +
  sin acentos), utilidad genérica de texto (no específica de películas) para
  comparar strings ignorando tildes.
- `src/app/features/catalogo/pipes/filtrar-peliculas.pipe.ts`
  (`FiltrarPeliculas`): pipe puro que filtra `PeliculaResumen[]` por título
  (usando `normalizarTexto`) y por géneros seleccionados. Se usa inline en el
  template (`@let listadoFiltrado = listado() | filtrarPeliculas:...`) en vez
  de un método plano, porque al ser puro Angular lo recalcula solo cuando
  cambian sus argumentos por referencia, en vez de en cada ciclo de detección.

### Changed
- `catalogo-inicio.ts`/`.html`/`.scss`: la sección "Todas las películas" suma
  un buscador por título y chips de género (multi-selección) sobre el
  listado ya cargado por `PeliculasService.obtenerListado()` en la Fase 1.1 —
  sin ida adicional a Supabase por tecla ni por click. El input de búsqueda
  usa `[(ngModel)]` de `FormsModule` de dos vías reales contra un accessor
  `get`/`set` (`terminoBusquedaValor`) que lee/escribe el signal
  `terminoBusqueda` por detrás — necesario porque `[(ngModel)]` no compila
  escrito directo contra un signal (`terminoBusqueda()` no es asignable).
  `generosDisponibles()` y `hayFiltrosActivos()` son métodos planos
  (no `computed()`, ver `CLAUDE.md`) que leen `listado()`, `terminoBusqueda()`
  y `generosSeleccionados()` e invocados desde el template; el filtrado en sí
  lo resuelve `FiltrarPeliculas`. `generosSeleccionados` es un
  `signal<readonly string[]>` (no `Set`, no visto en la materia): agregar/
  quitar un género arma un array nuevo con `filter`/spread en vez de
  `add`/`delete` sobre una copia del `Set`. Botón "Limpiar filtros" visible
  solo con algún filtro activo, y mensaje distinto para "sin películas
  publicadas" vs. "sin resultados para el filtro actual".
- `angular.json`: sube el budget `anyComponentStyle` (4kB → 6kB de warning,
  8kB → 10kB de error) — el default del scaffold quedaba corto para una
  página con buscador + chips de filtro; no es una decisión de arquitectura,
  es el umbral de build.
- `CLAUDE.md`: nueva regla — no usar `computed()` de Angular signals (no
  visto en la materia, mismo criterio ya aplicado a `resource()`); un valor
  derivado se resuelve con un método plano que lee los signals de origen e
  invocado desde el template.

## [Fase 1.2] - 2026-09-22

### Added
- `src/app/features/catalogo/paginas/catalogo-inicio/`: home del catálogo
  con dos secciones — podio de "Las 3 más vendidas" (ranking numerado,
  poster grande) y grilla de "Todas las películas" (`app-tarjeta` con
  poster, duración, clasificación y chips de género) — usando
  `PeliculasService.obtenerDestacadas()`/`obtenerListado()` de la Fase 1.1.
  Estado (listado, carga, error) manejado con signals simples seteados en el
  constructor vía `async`/`await`, sin `resource()` (API no vista en la
  materia) ni subscribes manuales sin volcar a signal.
- `src/app/core/helpers/pelicula.formato.ts`: `formatearDuracion` (minutos →
  `"2h 22m"`) y `formatearClasificacion` (`null`/`13`/`18` → `"ATP"`/`"+13"`/
  `"+18"`), pensados para reusarse en el detalle de película (Fase 1.4) y el
  buscador (Fase 1.3).
- `src/app/core/servicios/carga-global.service.ts` (`CargaGlobalService`) y
  `src/app/shared/componentes/spinner-global/` (`SpinnerGlobal`): overlay de
  carga a pantalla completa, compartido por toda la app en vez de uno por
  componente. Documentado en detalle en `README.md`.

### Changed
- `src/app/layout/estructura/`: monta `<app-spinner-global />` junto al
  header/footer, así queda disponible en cualquier ruta sin repetirlo por
  feature.
- `catalogo-inicio.css` → `catalogo-inicio.scss`: pasa a tener estilos reales
  (podio, grilla, chips de género) ahora que la pantalla se implementa,
  consistente con el resto del design system.
- `README.md`: nueva sub-sección "Estado de carga global: un overlay
  compartido, no uno por componente".

## [Fase 1.1] - 2026-09-21

### Added
- `src/app/core/modelos/pelicula.model.ts`: modelos de dominio del catálogo
  (`Genero`, `PeliculaResumen` —incluye `entradasVendidas`—,
  `FuncionDisponible`, `ResenaPelicula`, `PeliculaDetalle`).
- `src/app/core/servicios/peliculas.service.ts`: `PeliculasService` con
  `obtenerListado()`, `obtenerDetalle(id)` (funciones programadas a futuro,
  reseñas y promedio de estrellas) y `obtenerDestacadas(cantidad)` para el
  destacado "3 más vendidas" de la home.
- `supabase/migrations/20260921120000_contador_entradas_vendidas.sql`: columna
  `peliculas.entradas_vendidas` (contador cacheado, default 0) para poder
  ordenar por "más vendidas" con una consulta directa desde el frontend, sin
  exponer `ventas`/`venta_items` (datos personales) ni depender de una
  función SQL. El trigger que la mantiene al día se agrega en la Fase 4
  (compra) y la Fase 9 (cancelaciones).

### Changed
- `README.md`: nueva sub-sección "Contador cacheado para datos agregados
  públicos (Fase 1)".
- `src/app/core/supabase.service.ts` y `peliculas.service.ts`: los servicios
  pasan a declararse con `@Service()` (Angular 22.1+) en vez de
  `@Injectable({ providedIn: 'root' })` — equivalente para este caso, se
  documenta la convención en el README.

## [Fase 0.6] - 2026-09-16

### Added
- `supabase/migrations/20260916120000_esquema_inicial.sql`: esquema SQL
  inicial completo (26 tablas de negocio) a partir del modelo de datos
  revisado — usuarios/perfiles, catálogo (películas/géneros/reseñas),
  salas/butacas/reservas temporales, funciones (con exclusion constraint
  anti-solapamiento), candy bar/combos, cupones, venta/venta_items/pagos
  (con CHECK de coherencia por `tipo_item` e índice único parcial anti doble
  venta de butaca), entradas/usos_qr, fidelización (recompensas/canjes/
  ledgers de puntos y crédito con saldo cacheado por trigger) y
  alertas/notificaciones/auditoría. Incluye triggers de negocio: alta
  automática de `perfiles` al registrarse, protección de `rol`/saldos contra
  auto-edición, cálculo de `funciones.fin` por duración de película y
  propagación de cancelación de venta a sus items.
- `supabase/migrations/20260916120100_rls_politicas.sql`: Row Level Security
  habilitada en las 26 tablas — catálogo de lectura pública/ABM admin, datos
  personales visibles solo por su dueño (o admin/empleado según rol), y
  tablas transaccionales sensibles sin escritura de cliente (reservada a RPC
  `security definer` de fases futuras).

### Changed
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: versión 3. Se agrega
  `ventas.cupon_id` (nullable) para formalizar la relación cupones→ventas que
  el diagrama conceptual ya daba por hecha pero nunca estaba modelada como
  columna. Nuevo punto resuelto en la sección 7.
- `README.md`: nueva sección "Esquema SQL versionado y RLS" documentando la
  convención de migraciones y el criterio de seguridad por tabla.

### Fixed
- `supabase/migrations/20260916120000_esquema_inicial.sql`: la exclusion
  constraint `sin_solapamiento_por_sala` fallaba al correrla contra Supabase
  (`functions in index expression must be marked IMMUTABLE`) porque
  `timestamptz + interval` es `STABLE`, no `IMMUTABLE`, y Postgres exige
  IMMUTABLE en expresiones de índice. Se resuelve envolviendo el cálculo del
  margen de 30 minutos en `public.rango_funcion_con_margen(inicio, fin)`, una
  función SQL declarada `immutable` (seguro en este caso puntual porque el
  margen es fijo en minutos, sin componentes de mes/día sujetos a DST).
  Verificado corriendo el script completo contra el proyecto real: las 26
  tablas y las políticas RLS quedaron creadas sin errores.

## [Fase 0.7] - 2026-09-17

### Added
- `supabase/migrations/20260917120000_seed_datos_demo.sql`: datos de demo
  para poder desarrollar y probar el Catálogo (Fase 1) y Salas/butacas
  (Fase 2) contra datos reales — 10 géneros, 12 películas (con relación a
  géneros, una sin publicar y una en preventa), 4 salas con sus butacas
  (normal/accesible/VIP, dos con recargo), 36 funciones distribuidas en 3
  días sin solapamientos, y candy bar/combos/cupones (4 categorías de
  producto, 10 productos, 3 combos con sus items, 3 cupones). Reseñas y
  ventas quedan fuera a propósito: dependen de usuarios reales
  (`auth.users`), que todavía no existen hasta que se implemente el
  registro (Fase 3).

## [Fase 0.5] - 2026-09-16

### Added
- `src/app/layout/encabezado/`: header sticky con logo propio (rollo de
  fílmico en SVG), nav pública (Catálogo, Próximamente, Fidelización, Mis
  entradas, Perfil) con indicador de link activo y menú hamburguesa
  responsive (<860px). Guirnalda de luces de marquesina como remate inferior.
- `src/app/layout/pie/`: footer con marca, enlace a Cancelaciones (acción del
  cliente sobre su propia compra) y perforaciones de fílmico como motivo
  visual. Los accesos de staff (Panel de empleado, Administración) quedan
  sin botón visible por ahora — las rutas siguen existiendo, el foco de esta
  etapa es la experiencia del cliente.
- `src/app/layout/estructura/`: componente que compone encabezado +
  `router-outlet` + pie, y aporta el fondo temático (halo de proyector fijo
  y cintas de perforaciones fílmicas a los costados en pantallas ≥1400px).

### Changed
- `src/app/app.ts` / `app.html` / `app.css`: se reemplaza la navegación
  provisoria de la Fase 0 por `<app-estructura />`.

## [Docs: revisión pre-Fase 0.5] - 2026-09-16

### Changed
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: revisado contra el intercambio
  de emails original antes de crear las tablas en Supabase. Se agrega la
  tabla `reservas_butaca` (bloqueo temporal en tiempo real mientras se
  seleccionan butacas, vía Supabase Realtime), `ventas.candy_entregado_at`
  (retiro de Candy como redención independiente de la validación de la
  entrada), `ventas.fecha_nacimiento_comprador` (valida edad en compra
  anónima), `perfiles.puntos_saldo` cacheado (simetría con `credito_saldo`) y
  `usos_qr.entrada_id` (FK de trazabilidad). Se documentan además las reglas
  SQL concretas: exclusion constraint para no solapar funciones por sala,
  CHECK de coherencia por `tipo_item` e índice único parcial en
  `venta_items` para no vender la misma butaca dos veces.
- `docs/01_Analisis_Funcional_Cine.pdf`: la sección 11 pasa la ambigüedad de
  "compra anónima + restricción de edad" de abierta a resuelta, con la
  decisión tomada y su referencia cruzada al modelo de datos.
- `docs/02_Requisitos_y_Casos_de_Uso_Cine.pdf`: RF-026, RN-004 y CU-26
  aclaran cómo se valida la edad cuando la compra es anónima.
- `CLAUDE.md`: nueva regla — `docs/01`, `docs/02` y `docs/03` son documentos
  vivos que pueden actualizarse durante el desarrollo si surge una decisión u
  obstáculo que los vuelva inexactos, a diferencia de `docs/ROADMAP.md`, que
  sigue requiriendo confirmación previa para cualquier cambio.
- `docs/ROADMAP.md` / `docs/ROADMAP.pdf`: se corrige el estado de 0.3 y 0.4 a
  ✅ Hecho (ya estaban mergeadas por PRs anteriores; el checkbox había
  quedado desactualizado) y se marca como resuelto el punto abierto de "edad
  en compra anónima", con referencia a la decisión tomada en esta entrega.

## [Fase 0.4] - 2026-09-16

### Added
- `src/styles/_tokens.scss`: design tokens del sistema visual como custom
  properties de CSS en `:root` — paleta oscura tipo sala de cine (fondo,
  superficies, acento rojo cortina, acento secundario dorado marquesina),
  tipografía (`Bebas Neue` para títulos, `Inter` para texto, cargadas desde
  Google Fonts en `index.html`), escala de espaciado, radios, sombras y
  transiciones.
- `shared/componentes/boton/` (`Boton`): botón propio con variantes
  `primario`/`secundario`/`fantasma`, tamaños `chico`/`mediano`/`grande` e
  input `deshabilitado`, usando `input()` de signals.
- `shared/componentes/tarjeta/` (`Tarjeta`): contenedor de tarjeta con input
  `interactiva` para efecto hover-lift, pensado para reusarse en catálogo,
  candy bar, etc.

### Changed
- `src/styles.css` → `src/styles.scss`: entrypoint global de estilos pasa a
  SCSS, importa los tokens y aplica un reset base mínimo (box-sizing,
  fondo/color/tipografía del body). El fondo temático completo con motivos de
  cine se resuelve en la Fase 0.5 (shell de layout).
- `angular.json`: `@schematics/angular:component` genera con `style: scss`
  y `skipTests: true` por defecto (y `skipTests: true` en
  `@schematics/angular:service`), así `ng generate` ya no necesita pasar
  esos flags a mano en cada componente/servicio nuevo.

## [Fase 0.3] - 2026-09-16

### Added
- `@supabase/supabase-js` como dependencia y `core/supabase.service.ts`
  (`SupabaseService`, `providedIn: 'root'`) que expone el cliente de Supabase
  ya inicializado — punto único de acceso, ningún componente lo llama
  directo.
- `scripts/generar-entorno.js`: genera `src/environments/environment.ts` a
  partir de las variables `SUPABASE_URL`/`SUPABASE_ANON_KEY` (tomadas de
  `.env` en local o de las variables del proyecto en Vercel en despliegue).
  Se ejecuta solo con los hooks `prestart`/`prebuild` de `package.json`, antes
  de `ng serve`/`ng build`.
- `.env.example` con los nombres de variable esperados, para que cada quien
  arme su propio `.env` local con las credenciales de su proyecto de
  Supabase.

### Changed
- `.gitignore`: se agrega `src/environments/environment.ts` a los archivos
  ignorados — es generado por `scripts/generar-entorno.js` y nunca debe
  commitearse (contiene la URL y la clave de Supabase).
- `README.md`: sección "Acceso a datos" documenta el mecanismo de
  credenciales por variables de entorno; "Desarrollo" agrega el paso de
  copiar `.env.example` a `.env`.

## [Fase 0.2b] - 2026-09-16

### Added
- `features/administracion/administracion.module.ts` y
  `features/compra/compra.module.ts`: estas dos features usan NgModule
  clásico en vez de standalone (declarations + `RouterModule.forChild`),
  decisión documentada en `README.md` — combina beneficio real (son las
  features con más componentes relacionados a futuro) con valor pedagógico
  para el TP.

### Changed
- Los 10 componentes placeholder pasan de template/estilo inline a archivos
  separados (`.ts`/`.html`/`.css`), documentado como convención fija en
  `CLAUDE.md`.
- `AdministracionInicio` y `CompraInicio` pasan a `standalone: false` para
  poder declararse en su NgModule.
- `app.routes.ts`: las rutas de `compra` y `administracion` cargan su
  `*.module.ts` con `loadChildren`; el resto sigue cargando su `*.routes.ts`
  standalone sin cambios.

## [Fase 0.2] - 2026-09-16

### Added
- Estructura de `features/` con las 10 carpetas de dominio (`catalogo`,
  `salas-butacas`, `compra`, `fidelizacion`, `entradas`, `cancelaciones`,
  `proximamente`, `perfil`, `empleado`, `administracion`), cada una con una
  página placeholder standalone y su propio archivo `*.routes.ts`.
- Rutas lazy en `app.routes.ts` (`loadChildren` por feature) — confirmado con
  `ng build` que cada feature genera su propio chunk separado.
- Convención de idioma del código (todo en español, salvo API de
  Angular/TS/RxJS y vocabulario técnico de arquitectura) documentada en
  `CLAUDE.md`.
- Nota sobre el proyecto siendo **zoneless** (sin `zone.js`) en `CLAUDE.md`.

### Changed
- `app.html`/`app.ts`/`app.css`: reemplazado el template de bienvenida del
  scaffold de Angular CLI por una navegación provisoria (10 links, uno por
  feature) para validar el ruteo. Se reemplaza por el diseño definitivo en
  la sub-tarea 0.5.
- `app.spec.ts`: actualizado para reflejar la navegación nueva en vez del
  título de bienvenida del scaffold.

## [Fase 0.1b] - 2026-09-15

### Added
- `CLAUDE.md`: instrucciones de proyecto que se cargan automáticamente en
  cada sesión (rol de ingeniero senior Angular, decisiones de arquitectura ya
  tomadas, convenciones de repo, buenas prácticas Angular específicas y
  recomendaciones de eficiencia de sesión).
- `docs/ROADMAP.md` y `docs/ROADMAP.pdf`: roadmap completo del proyecto por
  fases, con estado por sub-tarea, pensado para actualizarse sesión a sesión.
- `.claude/skills/cerrar-tarea/`: checklist para cerrar una sub-tarea/fase
  (changelog, readme, roadmap, commit sin atribución, PR con formato fijo).
- `.claude/skills/actualizar-roadmap/`: procedimiento para regenerar
  `docs/ROADMAP.pdf` a partir de `docs/ROADMAP.md`.

## [Fase 0.1] - 2026-09-15

### Added
- `CHANGELOG.md` para llevar registro de cambios entrega por entrega.
- `README.md` con la arquitectura del proyecto (estructura por feature,
  standalone components + NgModules combinados, signals + servicios para
  estado, capa de acceso a Supabase) y la justificación de esas decisiones.

### Changed
- `.gitignore`: se dejó de ignorar `package-lock.json` (debe versionarse para
  builds reproducibles) y se agregó ignorado de archivos de entorno
  (`.env`, `.env.*`) y basura de SO/editor (`.DS_Store`, `.vscode/*`).

### Removed
- `README 2.md` (duplicado accidental del README default de Angular CLI).
- `.DS_Store` (no debía estar versionado).
