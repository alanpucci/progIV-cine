# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo,
entrega por entrega. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
