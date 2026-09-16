# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo,
entrega por entrega. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
