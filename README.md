# progIV-cine

Sistema web integral de gestión y comercialización de un cine, desarrollado
como TP de Programación IV. Permite administrar películas, salas, funciones,
butacas, productos del Candy Bar, promociones y fidelización; vender entradas
y productos (de forma anónima o registrada); y validar los consumos de forma
presencial mediante QR.

El análisis funcional completo (requisitos, casos de uso, reglas de negocio y
modelo de datos), en `docs/`, es la fuente de verdad sobre **qué** hace el
sistema:

- [`docs/01_Analisis_Funcional_Cine.pdf`](docs/01_Analisis_Funcional_Cine.pdf)
- [`docs/02_Requisitos_y_Casos_de_Uso_Cine.pdf`](docs/02_Requisitos_y_Casos_de_Uso_Cine.pdf)
- [`docs/03_Modelo_de_Datos_Supabase_Cine.pdf`](docs/03_Modelo_de_Datos_Supabase_Cine.pdf)

Este README documenta el **cómo**: arquitectura técnica, decisiones de diseño
y el porqué de cada una.

## Stack

- **Angular 22** (standalone components + Vite/`@angular/build`, Vitest para tests).
- **Supabase** (PostgreSQL + Auth + Realtime) como backend.
- **SCSS propio** con design tokens — sin Angular Material ni Tailwind.
- Despliegue en **Vercel**.

## Arquitectura de carpetas

```
src/app/
  core/        # Servicios transversales (SupabaseService, guards), modelos TS
  shared/      # UI primitives propias (Button, Card, Badge, Modal…)
  layout/      # Header, footer, shell de la aplicación
  features/    # Un directorio por dominio funcional (ver más abajo)
  app.routes.ts
```

Cada carpeta dentro de `features/` corresponde a un módulo funcional del
análisis (`catalogo`, `salas-butacas`, `compra`, `fidelizacion`, `entradas`,
`cancelaciones`, `proximamente`, `perfil`, `empleado`, `administracion`) y
agrupa **todo** lo que esa feature necesita: sus componentes, sus servicios de
dominio, sus modelos y sus rutas.

### Por qué organizar por *feature* y no por *tipo técnico*

Una alternativa común es tener carpetas globales `/components`, `/services`,
`/pipes`, `/models` en la raíz de `src/app`. Deliberadamente **no** se eligió
ese esquema, por tres razones concretas:

1. **Lo que cambia junto, vive junto.** Cuando se trabaja en la compra, todo
   lo relevante (el carrito, el formulario de cupón, el servicio de ventas, el
   modelo `Venta`) está en una sola carpeta (`features/compra/`). Con carpetas
   por tipo técnico, el mismo trabajo obliga a saltar entre
   `/components/carrito-compra`, `/services/ventas.service.ts`,
   `/models/venta.model.ts`, etc.
2. **Lazy loading real y aislado.** Angular puede cargar bajo demanda
   (`loadComponent`/`loadChildren`) una carpeta de feature completa. Con
   carpetas por tipo técnico, el code-splitting por dominio es mucho más
   difícil de mantener porque las dependencias de una feature quedan
   dispersas entre carpetas compartidas.
3. **Escala sin degradarse.** Este proyecto tiene 13 módulos funcionales. Una
   carpeta `/services` plana terminaría con 20-30 archivos sin relación
   jerárquica visible entre sí. Por dominio, cada carpeta se mantiene chica y
   agregar o incluso eliminar una feature completa es una operación local (se
   borra una carpeta), no una búsqueda cruzada por todo el árbol de tipos.

`core/` y `shared/` sí son transversales a propósito: `core/` es infraestructura
que usan todas las features (acceso a Supabase, guards de rol), y `shared/` son
piezas de UI realmente genéricas y reutilizables (un botón no pertenece a
ninguna feature). La regla práctica es: **si algo se usa desde una sola
feature, vive en esa feature; si lo usan dos o más, sube a `core`/`shared`**.

### Standalone components y NgModules, combinados a propósito

Angular 22 genera standalone components por defecto, y es el punto de partida
en la mayoría de las features. Dos features son la excepción deliberada:
**`compra/`** y **`administracion/`** usan `NgModule` clásico
(`declarations` + `RouterModule.forChild`), mientras que las otras ocho
features siguen siendo standalone con `loadComponent`.

La razón es doble:
1. Son las dos features que más componentes relacionados van a acumular
   (compra: selección de butacas, candy/combos, cupón, pago, confirmación;
   administración: un CRUD por cada entidad configurable del cine), así que
   es donde un módulo de feature tiene sentido real.
2. Es una decisión también pedagógica: el TP es para una materia que enseña
   NgModule, y tiene valor demostrar que se entiende cuándo aplicar cada
   paradigma en vez de usar uno solo en todo el proyecto por default.

Importante para quien lea el código: en Angular 22 los componentes son
standalone por defecto, así que un componente declarado en un NgModule
necesita `standalone: false` explícito en su decorator — si no, el compilador
rechaza declararlo en `declarations`. No se convierten más features a
NgModule sin una razón puntual — la regla no es "todo módulo" ni "todo
standalone", es esta elección concreta y acotada.

### Manejo de estado: signals + servicios (sin NgRx)

El estado de la aplicación (sesión del usuario, carrito de compra,
disponibilidad de butacas en la sesión de selección) se maneja con signals de
Angular expuestos desde servicios inyectables (`providedIn: 'root'` o a nivel
de feature). Se descartó NgRx porque el dominio, aunque amplio en cantidad de
módulos, no tiene la complejidad de sincronización (undo/redo, time-travel,
efectos altamente encadenados) que justifica su overhead. Si en el camino
aparece un caso que realmente lo necesite, se reevalúa.

### Acceso a datos: capa de servicios sobre Supabase

Ningún componente llama a Supabase directamente. Existe un `SupabaseService`
central en `core/` que expone el cliente (`@supabase/supabase-js`), y sobre él
se construyen servicios de dominio (`PeliculasService`, `FuncionesService`,
`VentasService`, etc.) que los componentes consumen. Esto mantiene las queries
concentradas, testeables y reemplazables sin tocar la capa de presentación.

Las credenciales de Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) no se
commitean: viven en un `.env` local (ver `.env.example`) o en las variables de
entorno del proyecto en Vercel, y `scripts/generar-entorno.js` genera
`src/environments/environment.ts` (gitignored) a partir de ellas antes de
`ng serve`/`ng build` (hooks `prestart`/`prebuild` en `package.json`).

### Concurrencia y validación de negocio en el backend

Reglas críticas como "no vender la misma butaca dos veces" o "no solapar
funciones en una sala" **no** se validan solo en el frontend: se resuelven con
funciones/RPC en PostgreSQL (Supabase) dentro de una transacción, de modo que
el estado visual del cliente sea una ayuda a la UX pero nunca la única barrera
de integridad.

### Esquema SQL versionado y RLS (Fase 0.6)

El esquema completo (26 tablas de negocio) vive como migraciones SQL
versionadas en `supabase/migrations/` (`<timestamp>_<nombre>.sql`, convención
del CLI de Supabase), no como algo creado a mano desde el dashboard. Cada
migración se aplica una sola vez y en orden; no se edita una ya aplicada, se
agrega una nueva.

Row Level Security está habilitada en las 26 tablas desde el arranque, con un
criterio parejo:

- **Catálogo** (películas, funciones, productos, combos, etc.): lectura
  abierta a `anon`/`authenticated` de lo publicado/activo; alta/edición
  reservada a `rol = 'admin'` vía un helper `rol_actual()` (`security
  definer`, evita recursión al consultar `perfiles` desde su propia política).
- **Datos personales** (ventas, entradas, pagos, ledgers de puntos/crédito,
  notificaciones): cada usuario lee solo lo propio (`usuario_id = auth.uid()`
  o join hasta `ventas`); `admin`/`empleado` ven todo lo que les corresponde
  por rol.
- **Tablas transaccionales sensibles** (`ventas`, `venta_items`, `entradas`,
  `pagos`, `reservas_butaca`, `movimientos_puntos`, `movimientos_credito`,
  `usos_qr`, `logs_actividad`): sin políticas de escritura para el cliente en
  esta fase. Se escriben desde funciones RPC `security definer` que se
  agregan fase a fase (bloqueo de butacas en la Fase 2, compra en la Fase 4,
  validación de QR en la Fase 6, cancelación en la Fase 9) — esas funciones
  corren con privilegios propios y no dependen de RLS, así que la ausencia de
  política de escritura ahí es intencional, no un olvido.
- `perfiles.rol`, `credito_saldo` y `puntos_saldo` están protegidos además
  por un trigger (no solo por RLS): ni siquiera con una política de UPDATE
  "propio" un usuario puede autopromoverse a admin o cargarse saldo, porque
  el trigger rechaza el cambio si quien lo hace no es admin.
- El alta de `perfiles` es automática: un trigger sobre `auth.users` crea la
  fila de negocio al registrarse, tomando nombre/apellido/fecha de nacimiento
  del `raw_user_meta_data` que mande el formulario de registro (Fase 3).

Las migraciones no se aplican solas contra el proyecto de Supabase real desde
acá: se corren con `supabase db push` (requiere `supabase link` con
credenciales propias del proyecto) o pegando el contenido de cada archivo, en
orden, en el SQL Editor del dashboard.

### RPC pública para datos agregados (Fase 1)

El destacado "3 más vendidas" del catálogo necesita un ranking de películas
por entradas vendidas, pero `ventas`/`venta_items` son datos personales (cada
usuario lee solo lo propio). En vez de relajar esa política, se agregó
`obtener_peliculas_mas_vendidas(cantidad)`: una función `security definer`
que devuelve únicamente `pelicula_id` + conteo agregado, sin exponer ninguna
fila de venta individual, con `grant execute` a `anon`/`authenticated`. Es el
mismo patrón de RPC ya usado para escritura en tablas transaccionales, aplicado
acá a una lectura agregada en vez de a una escritura.

## Diseño visual

Paleta oscura/nocturna con motivos de cine (proyección, cinta de película,
marquesina) — sin librería de componentes de por medio, para lograr una
identidad visual propia en vez de una interfaz genérica.

Los tokens (`src/styles/_tokens.scss`) se definen como **custom properties de
CSS** en `:root` (`--color-acento`, `--espacio-md`, etc.), no como variables
SCSS (`$color-acento`). La ventaja frente a variables SCSS es que quedan
disponibles en runtime dentro de cualquier hoja de estilos del proyecto sin
necesidad de `@use` en cada archivo — cualquier `.scss` de un componente usa
`var(--token)` directo. Tipografía: `Bebas Neue` (títulos, estilo marquesina)
+ `Inter` (texto), cargadas desde Google Fonts en `index.html`.

Sobre esos tokens se construyen primitivas de UI propias en `shared/componentes/`
(`Boton`, `Tarjeta`, …), consumidas por las features en vez de repetir estilos
sueltos.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar SUPABASE_URL y SUPABASE_ANON_KEY
npm start              # ng serve (genera environment.ts antes de levantar)
npm test               # vitest
```

## Estado del proyecto

El desarrollo avanza en fases incrementales documentadas en `CHANGELOG.md`.
Cada fase corresponde a uno o más módulos funcionales del análisis.
