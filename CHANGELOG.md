# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo,
entrega por entrega. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
