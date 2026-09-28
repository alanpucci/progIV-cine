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

### Formularios simples: `[(ngModel)]` de dos vías contra un signal

El buscador del catálogo (Fase 1.3) usa `[(ngModel)]` de `FormsModule` en vez
de leer `$event.target` a mano. La sintaxis de dos vías no funciona escrita
directo contra el signal (`[(ngModel)]="terminoBusqueda()"` no compila: se
expandiría a `(ngModelChange)="terminoBusqueda() = $event"`, y el resultado de
invocar una función no es asignable), así que el componente expone un
accessor `get`/`set` (`terminoBusquedaValor`) que lee y escribe el signal por
detrás:

```ts
protected get terminoBusquedaValor(): string {
  return this.terminoBusqueda();
}
protected set terminoBusquedaValor(valor: string) {
  this.terminoBusqueda.set(valor);
}
```

`[(ngModel)]="terminoBusquedaValor"` se expande entonces contra una propiedad
de verdad, así que compila y funciona como dos vías reales. El `get` sigue
leyendo el signal en el momento del render (se trackea igual que cualquier
otra lectura de signal en el template), y el `set` es el único lugar que lo
escribe. El mismo criterio aplica a cualquier campo de formulario que en el
proyecto respalde su valor en un signal en vez de una propiedad plana.

### Formularios con validación compuesta: Reactive Forms (Fase 3.1)

El criterio de `[(ngModel)]` de la sección anterior es para campos sueltos
sin reglas (un buscador). El registro es otro caso: nueve campos, reglas
por campo (formato de mail, largo mínimo de contraseña, fecha no futura,
entero entre 0 y 365) y una regla **cruzada** entre dos campos (la
contraseña y su confirmación tienen que coincidir). Con `ngModel` esas
reglas quedarían dispersas en atributos del template y la cruzada no tiene
un lugar natural; con `ReactiveFormsModule` el formulario entero se declara
en el componente (`FormBuilder.nonNullable.group`), los validadores propios
son funciones puras testeables en `features/perfil/validadores/`, y la regla
cruzada es un validador de grupo.

Encaje con zoneless: el estado del `FormGroup` (errores, `touched`) no es
un signal, pero sólo cambia como consecuencia de eventos del DOM
(`input`/`blur`/`submit`) que Angular ya escucha desde el template, y esos
eventos marcan la vista para re-renderizar. Lo que ocurre fuera de un
evento del DOM — el resultado asíncrono de `signUp`, el mensaje de error
del backend, el flag de envío en curso — sí va a signals.

### Alta de perfil desde el frontend (Fase 3.1)

Registrarse son dos escrituras: `auth.signUp()` crea el usuario en
`auth.users` (tabla interna de Supabase Auth) y después `PerfilesService`
inserta la fila de negocio en `perfiles` con el `id` que devolvió el signup.
`AuthService.registrar()` orquesta las dos; ningún componente toca Supabase.

La confirmación por mail está desactivada en Supabase, así que `signUp()`
ya devuelve sesión y el INSERT del perfil llega como `authenticated`. La
política `perfiles_insert_alta` igual admite `anon` (quedó así de cuando la
confirmación estaba activa y el signup no devolvía sesión), y lo permite
solo si:
- el `id` corresponde a un usuario de `auth.users` creado hace menos de 15
  minutos (función `es_usuario_recien_registrado`, `security definer`
  porque `anon` no puede leer `auth.users`);
- si hay sesión, el `id` es el del propio usuario;
- `rol = 'cliente'` y ambos saldos en 0 (el trigger que protege esos campos
  es solo de UPDATE, así que en el alta los cubre la política).

Trade-off asumido: las dos escrituras no son atómicas. Si el signup sale
bien y el insert falla, queda un usuario de Auth sin perfil, y el mismo mail
no puede volver a registrarse. El formulario muestra un error explícito en
ese caso. Antes esto lo resolvía un trigger sobre `auth.users`
(`manejar_nuevo_usuario`), que la migración
`20260928120000_alta_perfil_desde_frontend.sql` elimina.

`AuthService` y `PerfilesService` viven en `core/servicios/` porque los van
a consumir varias features (perfil, encabezado, compra registrada).

### Sesión: signal cargado con `getSession()` (Fase 3.2)

`AuthService.sesion` es un `signal<Session | null>`. Se carga una vez al
arrancar con `supabase.auth.getSession()`, que lee la sesión que el cliente
de Supabase persiste en `localStorage`, así que al recargar la página la
sesión sigue activa. Después se actualiza a mano en `registrar()` (si el
signup devuelve sesión), en `iniciarSesion()` y en `cerrarSesion()`. El
header lee ese signal y cambia solo.

Se descartó `onAuthStateChange` (un listener que avisa cada cambio de
sesión) porque no se vio en la materia y la versión con `getSession()` se
lee más fácil. Lo que se pierde no importa para este TP: el signal no se
entera si el token vence sin poder renovarse ni si se cierra sesión en otra
pestaña.

La carga la hace `cargarSesion()`, que el constructor de `AuthService`
llama al arrancar (el header inyecta el servicio apenas se abre la app).
Como `getSession()` es asíncrono, hay unos milisegundos en que `sesion()`
vale `null` aunque el usuario esté logueado. Por eso `sinSesionGuard`
(`core/guardias/sesion.guard.ts`) vuelve a llamar a `cargarSesion()` con
`await` antes de decidir. Llamarlo dos veces no cuesta nada, porque
`getSession()` lee `localStorage` sin ir al servidor. El guard decide así: si ya hay sesión, `/cuenta/ingreso` y
`/cuenta/registro` navegan al inicio con `replaceUrl: true`, así la página
de ingreso no queda en el historial y el botón "atrás" no vuelve a ella.

El guard es funcional (`CanActivateFn`), no una clase: es la forma
recomendada desde Angular 15 y la de clase está deprecada.

Los estilos de campo de formulario (panel, input/select, errores, enlaces)
están en el partial `src/styles/_formularios.scss` como mixins, que usan
tanto el registro como el ingreso. `src/styles` está en
`stylePreprocessorOptions.includePaths`, así que se importa con
`@use "formularios"` sin rutas relativas.

### Estado de carga global: un overlay compartido, no uno por componente

Ningún componente arma su propio indicador de carga. Existe
`CargaGlobalService` (`core/servicios/`) con un contador de operaciones en
curso, y `SpinnerGlobal` (`shared/componentes/`), montado una única vez en
`Estructura`, que muestra un overlay a pantalla completa mientras ese
contador es mayor a cero. Es un contador y no un booleano porque puede haber
más de una carga en simultáneo (por ejemplo, destacadas + listado del
catálogo pidiéndose en paralelo): un booleano que cualquiera de las dos
pisara al terminar apagaría el spinner con la otra todavía en curso.

El contador se modela con un `BehaviorSubject` de RxJS, no con un signal
directo, y el `subscribe()` del constructor vuelca cada cambio a un
`signal` (`visible`) — el único estado que la vista realmente lee. Es
necesario hacerlo así porque el proyecto es zoneless: un `subscribe()` que
no vuelca su resultado a un signal no dispara detección de cambios. Esa
suscripción no se da de baja explícitamente porque `CargaGlobalService` es
`@Service()` (singleton de toda la app) — vive y muere con la aplicación,
no con un componente, a diferencia de una suscripción hecha dentro de un
componente (esa sí necesita desuscribirse al destruirse).

Los componentes no llaman `mostrar()`/`ocultar()` directo: envuelven la
promesa con `cargaGlobal.envolver(() => servicio.metodo())`, que garantiza
el `ocultar()` incluso si la promesa rechaza (bloque `finally`), para que
ningún error deje el spinner trabado en pantalla.

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

Los servicios (`SupabaseService`, `PeliculasService`, etc.) se declaran con
`@Service()` (Angular 22.1+) en vez de `@Injectable({ providedIn: 'root' })`.
Es una API nueva, posterior a la mayoría del material de referencia sobre
Angular, pero equivalente para el caso por defecto (singleton auto-provisto
en el injector raíz, sin registrarlo en ningún módulo) — se prefirió por ser
más corta y porque el nombre describe mejor el rol de la clase.

### Servicios de dominio compartidos entre features viven en `core/`, no en la feature

`PeliculasService` y `FuncionesService` están en `core/servicios/`, aunque la
regla general (ver más arriba) sea "si algo se usa desde una sola feature,
vive en esa feature". No es una excepción: ambos se van a consumir desde más
de una feature (el detalle de película de `catalogo` necesita las funciones
disponibles; `salas-butacas` va a necesitar `FuncionesService` para el mapa de
butacas de la Fase 2.2+; `administracion` va a necesitar los dos para las
ABM de las Fases 7.2/7.4; `compra` va a necesitar `FuncionesService` para el
checkout), así que la regla los sube a `core/` desde que se crean, en vez de
nacer en una feature y migrarse después.

Por eso `PeliculasService.obtenerDetalle()` no arma su propia query contra la
tabla `funciones`: delega en `FuncionesService.obtenerDisponiblesPorPelicula()`
(Fase 2.1). Mantiene esa tabla con una sola consulta relevante en todo el
proyecto en vez de duplicarla a medida que más features necesiten "funciones
de una película" (catálogo hoy, selección de función en la Fase 2.2 después).

### Selección de butacas: estado compartido en `core/` y respaldado en `sessionStorage` (Fase 2.6)

La selección confirmada en el mapa de butacas (función + butacas elegidas +
precio de cada una) vive en `SeleccionButacasService` (`core/servicios/`),
no en la feature `salas-butacas`. Lo va a consumir la feature `compra`
(`CarritoService`, Fase 4.1), así que aplica la misma regla que a
`FuncionesService`: se sube a `core/` desde que nace. El mapa solo mantiene
la selección *en curso* como un signal local; recién al confirmar se
entrega al servicio, que es el contrato entre ambas features.

El servicio respalda el signal en `sessionStorage` para que refrescar la
pantalla de resumen (o, más adelante, el checkout) no pierda la selección.
Se eligió `sessionStorage` y no `localStorage` porque la selección es
efímera: no tiene sentido que sobreviva al cierre de la pestaña ni que se
comparta entre pestañas. El precio por butaca (`precio_base` de la función
+ `precio_adicional` de la butaca) se calcula en el cliente solo para
mostrarlo: el monto que se cobra lo recalcula Postgres en la RPC de
confirmación de compra (Fase 4.6).

Hasta que se haga la Fase 2.4, esta selección **no bloquea** butacas en la
base: es puramente del lado del cliente. 2.4 y 2.5 se difirieron a
propósito (ver `docs/ROADMAP.md`) y 2.4 es prerrequisito de 4.6; el
bloqueo transaccional se va a enchufar dentro de
`SeleccionButacasService.confirmar()` sin tocar el mapa.

### Carrito: `CarritoService` dentro de la feature `compra` (Fase 4.1)

`features/compra/` es el primer `NgModule` del proyecto: `CompraModule`
declara sus páginas (`standalone: false`) y se carga lazy desde
`app.routes.ts` con `loadChildren` apuntando al módulo;
`CompraRoutingModule` tiene las rutas hijas con `RouterModule.forChild` y
reexporta `RouterModule` para que las plantillas del módulo usen
`routerLink`. Los componentes standalone compartidos (`Boton`) se importan
en `imports` del módulo como si fueran otro módulo.

`CarritoService` vive en `features/compra/servicios/` y no en `core/`,
porque hoy solo lo usa esta feature (regla general de más arriba). Sigue
siendo singleton con `@Service()`, así que no hace falta proveerlo en el
módulo. Si más adelante el encabezado muestra el contador del carrito, se
sube a `core/`.

El carrito **no duplica** las entradas: las lee de
`SeleccionButacasService` (el contrato con `salas-butacas` de la 2.6), así
que modificar butacas desde el mapa se refleja solo en el carrito. Lo que sí
guarda son los productos y combos del Candy Bar, en dos signals separados
(`productos`, `combos`) que coinciden con los `tipo_item` de `venta_items`, y
los respalda en `sessionStorage` con el mismo criterio que la selección de
butacas. Subtotales y total son métodos planos que leen esos signals (sin
`computed()`). Los precios son solo para mostrar: el monto definitivo lo
recalcula Postgres en la RPC de la Fase 4.6.

### Inputs y outputs: `input()` / `output()` sin `.required`

Los componentes y directivas reciben datos con `input()` y emiten eventos con
`output()`, que son las APIs vistas en la materia. No se usa
`input.required()`, por el mismo criterio que excluye
`computed()`/`resource()`. Por eso todo `input()` lleva un valor por defecto,
y si el componente depende de que el padre lo pase, revisa que no esté vacío
antes de usarlo. Un `input()` todavía no tiene su valor en el constructor, así
que si el componente lo necesita para cargar datos lo lee en `ngOnInit()`.

### Parámetros de ruta: `ActivatedRoute.snapshot`, no `withComponentInputBinding()`

Un segmento de ruta como `:id` se lee con `ActivatedRoute` inyectado y
`snapshot.paramMap.get('id')` en el constructor — una lectura sincrónica, sin
`Observable` ni suscripción. Se descartó `withComponentInputBinding()` (que
mapearía el parámetro de ruta directo a un `input()` del componente) por ser
una API de Router no vista en la materia — el mismo criterio que ya excluye
`computed()`/`resource()`.

Usar `snapshot` en vez de suscribirse a `paramMap` es una decisión puntual
para este caso, no la regla general: `snapshot` solo refleja el valor del
parámetro en el momento en que se crea el componente, y **no** se entera si
después cambia sin que el componente se destruya y recree (por ejemplo,
navegar de `/pelicula/A` a `/pelicula/B` sin salir de esa página — el router
reutiliza la instancia). Hoy ninguna pantalla del proyecto enlaza una ruta
consigo misma cambiando solo el parámetro, así que ese caso no se da. El día
que aparezca (por ejemplo, "películas relacionadas" enlazando entre dos
detalles), ahí sí hace falta volver a `ActivatedRoute.paramMap.subscribe()`
— y, al ser una suscripción hecha **dentro de un componente** (a diferencia
de la de `CargaGlobalService`, que es un singleton `@Service()` y vive y
muere con la app), esa versión necesitaría además `OnDestroy` para darla de
baja explícitamente al destruirse el componente.

### Concurrencia y validación de negocio en el backend

Reglas críticas como "no vender la misma butaca dos veces" o "no solapar
funciones en una sala" **no** se validan solo en el frontend: se resuelven con
funciones/RPC en PostgreSQL (Supabase) dentro de una transacción, de modo que
el estado visual del cliente sea una ayuda a la UX pero nunca la única barrera
de integridad.

### Esquema SQL versionado y RLS (Fase 0.6)

El esquema completo (26 tablas de negocio) vive como migraciones SQL en
`supabase/migrations/` (`<timestamp>_<nombre>.sql`, convención del CLI de
Supabase), no como algo creado a mano desde el dashboard. Cada migración se
aplica una sola vez y en orden; no se edita una ya aplicada, se agrega una
nueva. La carpeta `supabase/` (junto con `.claude/`) está en `.gitignore`:
las migraciones quedan solo en el filesystem local, no en el repo de GitHub.

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
- El alta de `perfiles` la hace el frontend después del signup, acotada por
  la política `perfiles_insert_alta` (ver "Alta de perfil desde el
  frontend").

Las migraciones no se aplican solas contra el proyecto de Supabase real desde
acá: se corren con `supabase db push` (requiere `supabase link` con
credenciales propias del proyecto) o pegando el contenido de cada archivo, en
orden, en el SQL Editor del dashboard.

### Contador cacheado para datos agregados públicos (Fase 1)

El destacado "3 más vendidas" del catálogo necesita un ranking de películas
por entradas vendidas, pero `ventas`/`venta_items` son datos personales (cada
usuario lee solo lo propio) — el catálogo público no puede leerlas ni para
agregarlas, porque RLS filtra filas, no columnas: dar `SELECT` público sobre
esas tablas expondría también email, montos y qué compró cada usuario, no
solo el total por película.

Se resuelve con un contador cacheado: `peliculas.entradas_vendidas`, una
columna simple que ya es de lectura pública porque `peliculas` ya lo es. Es
el mismo patrón que `perfiles.puntos_saldo`/`credito_saldo`: el valor se
mantiene actualizado por un trigger en el momento de la escritura (a agregar
en la Fase 4, cuando una venta se confirma, y en la Fase 9, cuando se
cancela), no se recalcula en cada lectura. El frontend hace una consulta
directa y simple:

```ts
.from('peliculas').select('...').order('entradas_vendidas', { ascending: false })
```

sin funciones ni joins en el momento de la lectura. Se descartó a propósito
una función `security definer` que agregara `ventas`/`venta_items` al vuelo:
funcionaba, pero sumaba una función a mantener por un cálculo que en realidad
se puede resolver una sola vez, en el momento en que la venta cambia de
estado.

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
