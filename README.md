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
`proximamente`, `perfil`, `empleado`, `administracion`) y
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

El buscador del catálogo usa `[(ngModel)]` de `FormsModule` en vez
de leer `$event.target` a mano, enlazado directo al signal escribible y
**sin invocarlo**:

```html
<input [(ngModel)]="terminoBusqueda" />
```

Angular reconoce que la expresión es un `WritableSignal` y resuelve las dos
vías por su cuenta: lee el valor con `terminoBusqueda()` y escribe con
`terminoBusqueda.set($event)`. Escrito con paréntesis
(`[(ngModel)]="terminoBusqueda()"`) no compila, porque la mitad de salida se
expandiría a una asignación sobre el resultado de invocar una función. No
hace falta un accessor `get`/`set` intermedio. El mismo criterio aplica a
cualquier campo de formulario que en el proyecto respalde su valor en un
signal en vez de una propiedad plana.

El estado queda en un signal y no en una propiedad `string` plana aunque, en
este caso puntual, la propiedad también refrescaría la vista: en zoneless,
un listener de evento del template (como el `input` que escucha `ngModel`)
marca la vista para revisar. Se mantiene el signal para cumplir la regla
general del proyecto (todo estado que se refleja en la UI es un signal), que
no depende de dónde se modifica el valor: una propiedad plana dejaría de
refrescar apenas se escribiera desde fuera de un evento del template, por
ejemplo después de un `await` o con un debounce.

### Formularios con validación compuesta: Reactive Forms

El criterio de `[(ngModel)]` de la sección anterior es para campos sueltos
sin reglas (un buscador). El registro es otro caso: nueve campos, reglas
por campo (formato de mail, largo mínimo de contraseña, fecha no futura,
entero entre 0 y 365) y una regla **cruzada** entre dos campos (la
contraseña y su confirmación tienen que coincidir). Con `ngModel` esas
reglas quedarían dispersas en atributos del template y la cruzada no tiene
un lugar natural; con `ReactiveFormsModule` el formulario entero se declara
en el componente (`FormBuilder.nonNullable.group`), los validadores propios
son funciones puras testeables en `features/perfil/validadores/`, y la regla
cruzada es un validador de grupo. Los validadores de fecha de nacimiento
(`fechaNacimientoValida`, `fechaIsoLocal`) viven en `shared/validadores/`
porque también los usa el formulario de datos del comprador en `compra`, y
por el mismo motivo `sinEspaciosVacios` (rechaza un texto hecho solo de
espacios, que `Validators.required` deja pasar) está ahí y lo usan el
registro, el perfil y los formularios del panel de administración.

Encaje con zoneless: el estado del `FormGroup` (errores, `touched`) no es
un signal, pero sólo cambia como consecuencia de eventos del DOM
(`input`/`blur`/`submit`) que Angular ya escucha desde el template, y esos
eventos marcan la vista para re-renderizar. Lo que ocurre fuera de un
evento del DOM — el resultado asíncrono de `signUp`, el mensaje de error
del backend, el flag de envío en curso — sí va a signals.

### Alta de perfil desde el frontend

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

### Sesión: signal cargado con `getSession()`

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

### Rol del usuario y acceso al panel de administración

El rol (`cliente`, `empleado`, `admin`) vive en `perfiles.rol`, no en los
metadatos del usuario de Supabase Auth. Así queda en el mismo lugar que
leen las políticas RLS (`rol_actual()`) y el trigger que impide que un
usuario se cambie el rol a sí mismo. `AuthService.rol` es un
`signal<Rol | null>` que se llena junto con la sesión: `cargarSesion()` e
`iniciarSesion()` lo leen de `perfiles` con un `select` (solo la primera
vez por sesión, después se reutiliza el valor del signal), `registrar()` lo
fija en `cliente` sin consultar y `cerrarSesion()` lo vuelve a `null`. El
header muestra el enlace "Administración" solo si `esAdmin()`.

La ruta `/administracion` se protege con `adminGuard`
(`core/guardias/rol.guard.ts`), que es un `CanMatchFn` y no un
`CanActivateFn` como los guards de sesión. La diferencia es cuándo corre:
`canMatch` decide si la ruta coincide antes de que el router descargue el
chunk de `loadChildren`, así un cliente nunca baja el código del panel. Con
`canActivate` el módulo se descarga igual y recién después se bloquea la
navegación. Si no pasa, el guard devuelve un `UrlTree` (al inicio si hay
sesión, a `/cuenta/ingreso` si no) en vez de navegar a mano: en `canMatch`
devolver `false` haría que el router siga probando rutas y termine en el
comodín `**`, que redirige siempre al inicio.

Los guards de rol (`adminGuard`, `personalGuard` y `noPersonalGuard`)
salen de una sola función, `guardDeRol()`, que recibe la condición sobre
`AuthService` y arma el `CanMatchFn`: cargar la sesión, dejar pasar si se
cumple y, si no, el mismo `UrlTree`. Cada guard exportado queda en una
línea y las rutas siguen leyéndose por nombre (`canMatch: [adminGuard]`)
en vez de con un parámetro suelto.

El guard es solo para la navegación. Lo que impide de verdad que un no-admin
modifique el catálogo son las políticas RLS `*_admin_todo`, que ya estaban
en el esquema inicial.

A la inversa, el personal del cine (admin y empleado) no opera como
cliente: puede recorrer el catálogo y ver el detalle y las funciones de
cada película, pero no comprar. El detalle deshabilita la elección de
función y reemplaza el botón de continuar por un aviso, el encabezado no
le muestra "Mis entradas" ni "Mi perfil", y `noPersonalGuard`
(`CanMatchFn`, también en `rol.guard.ts`, a partir de
`AuthService.esPersonal()`) cierra esas rutas (`/butacas`, `/compra`,
`/mis-entradas`, `/cuenta/perfil`) redirigiendo al catálogo si se escriben
a mano. Tampoco ven "Próximamente" (ni el enlace del encabezado ni el del
catálogo), y el mismo guard cierra `/proximamente`, porque es la vitrina
de estrenos para que el cliente active alertas.

El panel (`features/administracion/`) es un `NgModule` con una ruta padre,
`PanelAdministracion`, que dibuja la barra lateral y un `<router-outlet>`
donde se cargan las secciones como rutas hijas. Las secciones salen de la
constante `SECCIONES_ADMINISTRACION`: la barra lateral y las tarjetas del
inicio del panel se arman desde esa lista, y cada entrada tiene un
`disponible` que vale `false` mientras su ABM no exista. Las secciones no
disponibles se muestran deshabilitadas en vez de enlazar a una ruta que
todavía no está definida.

### ABM de películas y géneros: servicios propios del panel

Las consultas del panel viven en servicios de la feature
(`PeliculasAdministracionService`, `GenerosAdministracionService` en
`features/administracion/servicios/`) y no se agregan a `PeliculasService`
de `core/`. No comparten nada con las del catálogo público: el catálogo lee
solo películas publicadas y con las columnas de una tarjeta; el panel lee
todas (la política `peliculas_select_publico` ya deja ver las ocultas a un
admin), con todas las columnas editables, y escribe. Es la regla general de
"si algo se usa desde una sola feature, vive en esa feature".

- **Baja de una película.** `funciones.pelicula_id` no tiene
  `on delete cascade`: borrar una película con funciones cargadas falla por
  clave foránea, a propósito, para no perder la programación ni las ventas.
  El listado ofrece dos acciones: "Ocultar" (`publicada = false`, la saca del
  catálogo sin borrar nada) y "Eliminar" (borrado físico). Para no ofrecer
  una acción que va a fallar, el listado trae la cantidad de funciones de
  cada película en la misma consulta (`funciones ( count )`) y deshabilita
  "Eliminar" si tiene alguna. Si igual llega el rechazo de Postgres (código
  `23503`), el servicio lo traduce a un mensaje claro.
- **Géneros de una película.** Al guardar, el servicio borra las filas de
  `pelicula_genero` de esa película y vuelve a insertar las elegidas, en vez
  de calcular qué se agregó y qué se quitó. Son dos requests sin
  transacción: si falla la segunda, la película queda sin géneros hasta que
  se vuelva a guardar. Se acepta por simplicidad.
- **Reglas reforzadas en Postgres.** La migración `reglas_peliculas_generos`
  agrega dos `check` en `peliculas` (el precio de preventa, si está, es
  mayor a 0, y es obligatorio con la preventa habilitada) y un índice único
  sobre `lower(generos.nombre)`, para que "Drama" y "drama" no convivan. El
  formulario valida lo mismo antes de enviar: el precio de preventa con un
  validador de grupo (depende de otro campo) y los géneros como un
  `FormControl<string[]>` con `Validators.required`, que trata un array
  vacío como faltante.
- **Mensajes de error.** `PostgrestError` extiende `Error`, así que mostrar
  `error.message` sin filtrar dejaría ver mensajes técnicos de Postgres. Los
  servicios del panel tiran un `Error` propio solo para los casos conocidos
  (película con funciones, género repetido), y el helper `mensajeDeError()`
  muestra ese mensaje o, si es un `PostgrestError`, uno genérico.

### ABM de salas: las butacas se desactivan, no se borran

`venta_items.butaca_id` referencia a `butacas` sin `on delete cascade`, así
que una butaca con entradas vendidas no se puede borrar. El editor de sala
nunca borra butacas: un "pasillo" es una butaca con `activa = false` (o una
posición sin fila en `butacas`), y el mapa público ya mostraba solo las
activas, dejando el hueco en la grilla.

- **Editor visual.** El formulario de sala tiene la cantidad de filas
  (letras A–Z) y de butacas por fila, y una grilla donde se elige un
  "pincel" (normal, accesible, VIP o pasillo) y se pinta butaca por butaca o
  una fila entera. La grilla vive en un signal (`Record` de posición a
  estado); achicar las dimensiones no pierde lo pintado afuera, solo deja de
  guardarlo.
- **Guardado por diferencia.** El componente manda la lista de butacas
  activas que quiere; `SalasAdministracionService` lee las actuales y
  `planificarCambiosButacas()` calcula qué insertar (posiciones nuevas) y qué
  actualizar (cambio de tipo/precio, reactivar o desactivar). Las
  actualizaciones se agrupan por fila y por valores
  (`.update(...).eq('fila', ...).in('numero', [...])`), para no mandar un
  request por butaca. Son varios requests sin transacción: si uno falla, la
  sala queda a medio guardar hasta volver a guardar.
- **Adicional VIP por sala.** `butacas.precio_adicional` es por butaca, pero
  el formulario expone un único "adicional VIP" que se aplica a todas las
  VIP de la sala; normales y accesibles quedan en 0.
- **Baja.** Igual que con las películas: `funciones.sala_id` no tiene
  cascada, así que una sala con funciones no se puede eliminar, solo
  desactivar (`salas.activa = false`). Una sala inactiva no se ofrece para
  programar funciones nuevas.

### ABM de funciones: asignación de sala en el servicio, solapamiento en Postgres

El análisis pide que la sala se asigne sola buscando disponibilidad (RN03) y
que entre funciones de una misma sala haya al menos 30 minutos después del
fin (RN01/RN02). Las dos cosas se resuelven en
`FuncionesAdministracionService`; el `exclude using gist` de `funciones`
(`sin_solapamiento_por_sala`) del esquema inicial sigue rechazando un
solapamiento en Postgres:

- **Fin calculado en el cliente.** El formulario calcula `fin` como
  `inicio + duracion_minutos` de la película y lo manda en el insert/update.
  El trigger `calcular_fin_funcion` solo completa `fin` cuando llega vacío,
  y en un update que cambia `inicio` sin tocar `fin` dejaría el valor viejo;
  mandarlo siempre evita depender de ese caso.
- **Salas ocupadas en una sola consulta.** Una función existente choca con
  la nueva si `inicio < fin_nuevo + 30 min` y `fin > inicio_nuevo - 30 min`
  (la misma intersección de rangos que evalúa el `exclude`). El servicio
  trae las funciones que cumplen eso (excluyendo la que se está editando) y
  se queda con sus `sala_id`.
- **Automática o manual.** Por defecto la sala es "Automática": se elige la
  primera sala activa, por nombre, que no esté ocupada; si no hay ninguna,
  se rechaza con un mensaje. El formulario permite además elegir una sala a
  mano, y en ese caso se valida que esté libre.
- **Funciones con ventas.** El listado trae la cantidad de entradas
  vendidas de cada función (`venta_items ( count )` filtrado por
  `tipo_item = 'entrada'` y no cancelado). Con alguna vendida, la función
  no se puede editar (cambiar horario o sala dejaría entradas apuntando a
  otra función o a butacas de otra sala) ni eliminar.

### ABM del Candy bar: un servicio por tabla y combos con `FormArray`

El panel administra categorías, productos y combos con un servicio por
tabla (`CategoriasProductoAdministracionService`,
`ProductosAdministracionService`, `CombosAdministracionService`), separados
de `CandyBarService` de `compra`, que solo lee lo activo para armar la
carta (misma regla que con las películas).

- **Desactivar en vez de borrar.** `combo_items.producto_id` y
  `venta_items.producto_id`/`combo_id` no tienen cascada: un producto que
  está en un combo o ya se vendió, o un combo vendido, no se pueden
  eliminar. El servicio traduce el `23503` a un mensaje que sugiere
  desactivarlo (`activo = false` lo saca de la compra). Una categoría con
  productos tampoco se puede eliminar, y el listado ya trae la cantidad
  (`productos ( count )`) para deshabilitar el botón.
- **Stock opcional.** `productos.stock` vacío significa "sin control de
  stock", que la compra ya respetaba (no descuenta ni limita).
- **Contenido del combo.** El formulario usa un `FormArray` de grupos
  `{ productoId, cantidad }` con `Validators.minLength(1)`, y muestra el
  precio de los productos sueltos y el ahorro contra el precio fijo. Al
  guardar, los `combo_items` se reemplazan enteros (borrar e insertar),
  igual que los géneros de una película.

### ABM de cupones

`CuponesAdministracionService` lista todos los cupones (activos o no) con la
cantidad de ventas que los usaron (`ventas ( count )`, por
`ventas.cupon_id`), y da de alta, edita, activa/desactiva y elimina. Un
cupón usado no se puede eliminar (la venta lo referencia), solo desactivar.

- **Código en mayúsculas.** La compra pasa el código ingresado a mayúsculas
  antes de buscarlo, así que el formulario lo guarda igual (letras, dígitos,
  `_` y `-`, sin espacios).
- **Edad mínima.** Se habilita solo con el tipo "Por edad" y un validador
  de grupo la exige en ese caso (mismo patrón que el precio de preventa);
  para otros tipos se guarda `null`. El `check` `chk_cupon_edad_minima` del
  esquema inicial ya lo reforzaba en Postgres.
- **Vigencia por días.** El formulario pide fechas (`type="date"`), no
  fecha y hora: "desde" se guarda como el inicio de ese día y "hasta" como
  las 23:59:59, ambos en hora local, así el último día cuenta entero. Un
  validador de grupo impide que el fin quede antes del inicio.
- **Estado en el listado.** Cada cupón se muestra como vigente, programado
  (todavía no empezó), vencido o inactivo, calculado en el cliente con la
  misma lógica que usa la compra para aceptarlo.

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

`visible()` es además la única fuente de verdad para decidir si una
pantalla ya puede mostrar su contenido: los componentes no mantienen un
flag `cargando` propio en paralelo, sino que condicionan el template con
`!cargaGlobal.visible()` (inyectando el servicio como `protected` para
poder leerlo desde la vista). Eso evita que un "no encontrado" o "sin
resultados" aparezca un instante antes de que llegue la respuesta, y evita
que haya dos estados de carga que puedan desincronizarse. El costo es que
la pantalla espera a que termine *cualquier* carga global en curso, no solo
las suyas; con las cargas cortas de este proyecto, ese acoplamiento es
aceptable.

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
disponibles; `salas-butacas` necesita `FuncionesService` para el mapa de
butacas; `compra` necesita `FuncionesService` para el checkout), así que la
regla los sube a `core/` desde que se crean, en vez de nacer en una feature
y migrarse después. El ABM de películas del panel no los reutiliza porque
sus consultas son otras (ver "ABM de películas y géneros").

Por eso `PeliculasService.obtenerDetalle()` no arma su propia query contra la
tabla `funciones`: delega en `FuncionesService.obtenerDisponiblesPorPelicula()`.
Mantiene esa tabla con una sola consulta relevante en todo el proyecto en
vez de duplicarla a medida que más features necesiten "funciones de una
película" (el detalle del catálogo y la selección de función).

### Selección de butacas: estado compartido en `core/` y respaldado en `sessionStorage`

La selección confirmada en el mapa de butacas (función + butacas elegidas +
precio de cada una) vive en `SeleccionButacasService` (`core/servicios/`),
no en la feature `salas-butacas`. Lo va a consumir la feature `compra`
(`CarritoService`), así que aplica la misma regla que a
`FuncionesService`: se sube a `core/` desde que nace. El mapa solo mantiene
la selección *en curso* como un signal local; recién al confirmar se
entrega al servicio, que es el contrato entre ambas features.

El servicio respalda el signal en `sessionStorage` para que refrescar la
pantalla de resumen (o, más adelante, el checkout) no pierda la selección.
Se eligió `sessionStorage` y no `localStorage` porque la selección es
efímera: no tiene sentido que sobreviva al cierre de la pestaña ni que se
comparta entre pestañas. El precio por butaca (`precio_base` de la función
+ `precio_adicional` de la butaca) se calcula en el cliente solo para
mostrarlo y se guarda tal cual en `venta_items` al confirmar la compra.

Por ahora esta selección **no bloquea** butacas en la base: es puramente
del lado del cliente. El bloqueo temporal (`reservas_butaca`) se va a
enchufar dentro de `SeleccionButacasService.confirmar()` sin tocar el mapa.
Mientras tanto, lo único que impide vender dos veces la misma butaca es el
índice único `ux_butaca_por_funcion` al confirmar la compra.

### Butacas vendidas: lectura pública de las entradas en `venta_items`

El mapa marca como no seleccionables las butacas que ya tienen una entrada
vendida para la función. Para eso cualquier visitante, con o sin sesión,
tiene que poder leer las entradas vendidas de otros usuarios. Originalmente
`venta_items` quedó legible solo por el dueño de la venta (y por
admin/empleado). La migración `lectura_butacas_vendidas` agrega una
política `select` para `anon`/`authenticated`:

```sql
using (tipo_item = 'entrada' and cancelado = false)
```

Es el mismo filtro que el índice único `ux_butaca_por_funcion`: una butaca
se ve ocupada exactamente cuando la base no deja volver a venderla. Las
políticas `select` son permisivas y se combinan con OR, así que la de
"propio" sigue valiendo para los productos, combos y recompensas.

`FuncionesService.obtenerIdsButacasVendidas()` trae solo `butaca_id` de esa
función, y el mapa lo pide en paralelo con la distribución de la sala. Una
butaca vendida se deshabilita, se pinta con un rayado propio (atributo
`data-vendida` de la directiva `ButacaEstado`) y se descarta de una
selección previa guardada en `sessionStorage`.

Costo aceptado: RLS filtra filas, no columnas, así que la fila completa de
cada entrada vendida queda legible, incluido el precio pagado. No expone
quién compró: `venta_id` apunta a `ventas`, que sigue limitada a las ventas
propias. Se descartó una vista que expusiera solo `funcion_id`/`butaca_id`
(eso habría ocultado el precio) porque sumaba un objeto más a mantener en
la base para proteger un dato que no es sensible en el alcance del TP. A partir de esta
política, toda consulta nueva sobre `venta_items` que deba devolver solo lo
del usuario tiene que filtrarlo explícitamente (por ejemplo con
`ventas!inner ( usuario_id )`), sin depender de RLS.

### Butacas vendidas en tiempo real: Supabase Realtime sobre `venta_items`

Mientras el mapa está abierto, una compra confirmada por otro usuario
bloquea esas butacas al instante, sin recargar. La migración
`realtime_butacas_vendidas` agrega `venta_items` a la publicación
`supabase_realtime`, y `FuncionesService.escucharButacasVendidas()` abre un
canal de `postgres_changes` con eventos `INSERT` filtrados por
`funcion_id`. Devuelve una función para cerrar el canal, que el mapa llama
en `ngOnDestroy()`; el componente nunca toca el cliente de Supabase.

- **RLS también filtra los eventos.** Realtime solo envía a cada cliente
  los cambios que su rol puede leer, así que la política pública de
  entradas vendidas alcanza para que reciban eventos los visitantes con o
  sin sesión, sin exponer productos ni combos ajenos.
- **Por qué `INSERT` de `venta_items` y no `ventas`.** La compra inserta un
  ítem por butaca y desde ese momento el índice `ux_butaca_por_funcion` ya
  impide volver a venderla, aunque la venta siga `pendiente`: el mapa
  muestra lo mismo que la base hace cumplir.
- **Butaca elegida que se vende.** Se descarta de la selección en curso y
  el resumen avisa que otra persona la compró. Si la selección ya se
  confirmó y el usuario está en el resumen o el pago, el conflicto sigue
  apareciendo al pagar, como antes.
- **Cancelaciones no se escuchan.** Una butaca que se libera por
  cancelación aparece disponible recién al volver a cargar el mapa: el
  `UPDATE` a `cancelado = true` deja la fila fuera de la política pública,
  así que Realtime no lo envía a los demás.

La selección en curso de otros usuarios (antes de confirmar la compra)
todavía no se refleja: depende del bloqueo temporal en `reservas_butaca`.

### Carrito: `CarritoService` dentro de la feature `compra`

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
`computed()`). Esos importes son los que se guardan en la venta al
confirmar la compra.

### Candy Bar: carta dentro de `compra` y stock como tope visual

El flujo de compra queda **butacas → Candy Bar → carrito**: el resumen de
butacas continúa a `/compra/candy-bar`, que se puede saltear sin agregar
nada. `CandyBarService` y sus mapeos (`features/compra/helpers/`) viven en
la feature porque hoy solo los usa `compra`, con la misma regla que
`CarritoService`. El ABM del Candy Bar va a escribir en las mismas tablas
desde `administracion`, pero con otras consultas (incluye inactivos), así
que no hay nada para compartir todavía.

La página `CandyBar` arma la carta y habla con el carrito, y cada ítem es un
componente presentacional (`TarjetaCandy`, declarado en `CompraModule`) que
solo recibe datos por `input()` y avisa con `output()`. Productos y combos
usan la misma tarjeta y no sabe a qué tabla pertenece el ítem.

`productos` y `combos` son tablas separadas en el modelo: el combo tiene
precio fijo propio, no tiene categoría ni stock, y su composición vive en
`combo_items`. Por eso el Candy Bar limita la cantidad de un producto a su
`stock` (y lo muestra "Agotado" en 0), pero no limita los combos. Es solo
un tope en pantalla: el stock se descuenta en la base recién al confirmar
la compra, incluyendo los productos que vienen dentro de cada combo (vía
`combo_items`), y la compra se rechaza si alguno queda sin stock.

### Cupones: validación en el servicio, lectura pública de los activos

Originalmente `cupones` quedó legible solo por admin, para que no se
pudieran listar los códigos vigentes. Al implementar los cupones se reabrió
esa decisión:
la migración `lectura_cupones_activos` agrega una política `select` para
`anon`/`authenticated` sobre los cupones con `activo = true`. Así el código
se valida con una consulta común a la tabla. El costo es que alguien podría
consultar la tabla y ver los códigos, algo aceptable para el alcance del TP.

`CuponesService` (en `features/compra/`, misma regla que
`CarritoService`) busca el código y valida en el frontend. Las consultas
filtran `activo = true` explícitamente aunque la política ya lo haga para
clientes: a un admin, `cupones_admin_todo` le deja leer también los
desactivados, y sin el filtro se le aplicarían al comprar.

- vigencia: `fecha_inicio`/`fecha_fin`, cada extremo abierto si es `null`;
- `primera_compra`: exige sesión y que el usuario no tenga ventas no
  canceladas (las lee por la política `ventas_select_propio`);
- `edad`: exige sesión y compara la edad calculada desde
  `perfiles.fecha_nacimiento` con `edad_minima`. El comprador anónimo
  no puede usarlo: el cupón se aplica en el carrito, antes de que declare
  su fecha de nacimiento, y validarlo contra un dato autodeclarado lo
  volvería un descuento para cualquiera.

Además de escribirse a mano, los cupones de tipo `primera_compra` y `edad`
se aplican solos: al abrir el carrito con sesión y sin cupón aplicado,
`buscarCuponAutomatico()` trae los activos de esos tipos ordenados por
porcentaje y se queda con el primero que esté vigente y cuyas condiciones
cumpla el usuario. Una venta lleva un solo cupón (`ventas.cupon_id`), así
que no se acumulan. Los `general` quedan manuales: aplican a cualquiera,
así que aplicarlos solos los dejaría de hacer funcionar como código
promocional. Si el usuario quita el cupón automático, vuelve a aplicarse la
próxima vez que entre al carrito.

`CarritoService` guarda el cupón como signal (respaldado en
`sessionStorage`, igual que los extras). El descuento se calcula sobre el
subtotal completo (entradas + Candy Bar), redondeado a centavos. La venta
guarda `cupon_id` y `descuento` al confirmar la compra.

### Datos del comprador y restricción de edad (RN04)

Antes del pago, `/compra/datos-comprador` pide el mail de contacto
(`ventas.email_contacto`) y la fecha de nacimiento. La página se habilita
solo si el carrito tiene entradas: una venta sin entradas no tiene QR con
el que retirar el Candy Bar.

- **Con sesión**: el mail se precarga desde la sesión (editable, es solo
  de contacto) y la fecha se toma de `perfiles.fecha_nacimiento`, en un
  campo deshabilitado.
- **Sin sesión**: la fecha es obligatoria siempre, no solo en películas
  restringidas, para que el flujo sea uno solo; se guarda como
  `ventas.fecha_nacimiento_comprador`. Un enlace a `/cuenta/ingreso` con
  `?volverA=/compra/datos-comprador` permite pasar a compra registrada sin
  perder el carrito (ingreso redirige a `volverA` si es una ruta interna).

Para validar la edad, la clasificación de la película viaja con la función
elegida: `FuncionMapa` incluye `clasificacionEdad` (se trae en el mismo
join a `peliculas` que ya traía el nombre), así que el checkout no hace otra
consulta. La edad se compara contra la fecha de hoy. Los datos confirmados
quedan en `CarritoService.comprador` (signal respaldado en
`sessionStorage`, igual que el cupón) y `vaciar()` los descarta.

La validación vive solo en el frontend: la compra se confirma con llamadas
directas a las tablas, sin lógica de servidor que la repita.

### Crédito y puntos como pago parcial

Con sesión, el checkout muestra el saldo de `perfiles.credito_saldo` y
`perfiles.puntos_saldo` (leídos con `MovimientosService.obtenerSaldos()`,
el mismo servicio del perfil) y deja usar cualquier parte de cada uno como
pago parcial. Un punto vale $1 (`VALOR_PUNTO_EN_PESOS`), simétrico con la
acreditación de 1 punto por peso; el análisis funcional no definía la
equivalencia y quedó registrada en el modelo de datos.

`CarritoService.saldosAplicados` guarda lo que el usuario pidió usar
(signal respaldado en `sessionStorage`, igual que el cupón y el comprador).
Los importes efectivos se derivan en cada lectura: `creditoUsado()` se
topea en el total y `puntosUsados()` en lo que queda después del crédito,
así que si el carrito cambia después de aplicar el saldo nunca se usa más
de lo necesario. `totalAPagar()` es lo que resta cobrar con el medio de
pago simulado, y es la base sobre la que se acreditan puntos. Sin sesión
los saldos aplicados se descartan.

Al confirmar la compra, el uso se registra en
`movimientos_credito`/`movimientos_puntos`, y los triggers de esos ledgers
actualizan el saldo cacheado en `perfiles`.

### Recompensas: se canjean dentro de la compra

Además de usar puntos como pago parcial a $1 cada uno, el cliente puede
canjearlos por recompensas que configura el admin
(`/administracion/recompensas`), cada una con su propio costo en puntos:

- **entrada**: cubre una entrada de la compra, de cualquier función. Si la
  compra tiene varias entradas, cubre la de menor precio;
- **producto**: suma un producto del Candy Bar sin cargo.

El canje no es un paso aparte ni un voucher para usar después: se elige en
el checkout, en el mismo bloque del saldo (`RecompensasCompra`, dentro de
`SaldosCompra`), y se graba junto con la compra. Así cada canje queda
atado a la venta donde se usó (`canjes.venta_id`) y no hace falta un flujo
para consumir canjes pendientes.

`CarritoService.canjes` guarda las recompensas elegidas (respaldado en
`sessionStorage`, como el resto del carrito). `canjesEfectivos()` descarta
los canjes de entrada que sobran si después se sacan butacas, y de ahí se
derivan las entradas cubiertas (`entradasCanjeadas()`), su monto, que se
resta de `subtotalEntradas()`, y los puntos comprometidos
(`puntosCanjes()`). Los puntos disponibles para pago parcial son el saldo
menos los comprometidos en canjes, y viceversa.

Al confirmar la compra:

- la entrada cubierta se graba como un `venta_items` de tipo `entrada` con
  precio 0, para que siga ocupando la butaca en el índice único;
- el producto se graba como un `venta_items` de tipo `recompensa` con su
  `producto_id` y precio 0, y descuenta stock igual que una venta;
- cada canje inserta una fila en `canjes` y un débito en
  `movimientos_puntos` con su `canje_id`. La migración `canje_recompensas`
  agrega la política de alta en `canjes`, acotada a los propios.

Como lo canjeado vale $0 en la venta, no suma puntos: la acreditación sigue
saliendo de lo pagado con tarjeta.

### Pago simulado y confirmación de compra desde el frontend

`/compra/pago` (`Pago`, en `CompraModule`) muestra el resumen como un
ticket y, si queda algo por cobrar después del crédito y los puntos, pide
una tarjeta. El pago es un mock: el formulario valida formato (16 dígitos,
`MM/AA` no vencido, CVV de 3 o 4 dígitos) y `simularAutorizacion()`
(`features/compra/helpers/tarjeta.helpers.ts`) aprueba cualquier tarjeta
salvo las terminadas en `0000`, para poder mostrar un rechazo. La
autorización devuelve una referencia `SIM-<últimos 4>-<marca de tiempo>`
que se guarda en `pagos.referencia_externa`. Si el crédito y los puntos
cubren el total, no se pide tarjeta.

Todas las llamadas a Supabase salen del frontend, con la API de tablas de
supabase-js (`insert`/`update`). `CarritoService.solicitudDeCompra()`
arma la compra con los importes que ya calcula el carrito, y
`VentasService.confirmarCompra()` (en `features/compra/`) la graba en este
orden:

1. calcula el stock que necesita la compra, sumando los productos que vienen
   dentro de los combos (`combo_items`), y corta si alguno no alcanza;
2. inserta la venta en estado `pendiente`;
3. inserta los `venta_items`. Si alguna butaca ya se vendió, el índice
   único `ux_butaca_por_funcion` rechaza el insert;
4. inserta una `entradas` por butaca, con un `codigo_qr` aleatorio, y una
   fila de `pagos` por cada medio usado (`credito`, `puntos`, `tarjeta`);
5. con sesión, registra el uso de crédito y puntos y acredita 1 punto por
   peso pagado con tarjeta (RN08: sin generar puntos sobre crédito ni
   puntos);
6. actualiza el stock de los productos;
7. pasa la venta a `pagada`.

Los ids de la venta y de sus ítems se generan en el cliente
(`crypto.randomUUID()`): así las filas siguientes pueden referenciarlos sin
volver a leer la venta, algo que el comprador anónimo no puede hacer. Si un
paso falla, la compra se corta ahí y la venta queda en `pendiente`; el
historial de compras ya ignora las ventas pendientes. No hay transacción
entre los pasos: es el costo de no tener lógica del lado del servidor.

Para que esos inserts pasen, la migración `compra_desde_frontend` agrega
políticas RLS de escritura:

- `ventas`: insertar solo como `pendiente` y con el `usuario_id` de la
  sesión (o `null` sin sesión), y pasarla de `pendiente` a `pagada`;
- `venta_items` y `pagos`: insertar solo sobre una venta `pendiente`
  visible para quien inserta;
- `entradas`: insertar en estado `emitida`;
- `movimientos_credito`/`movimientos_puntos`: insertar solo movimientos
  propios;
- `productos`: actualizar los activos sin dejar stock negativo.

Postgres solo deja hacer un `update` si quien lo hace puede leer la fila
nueva. Para que el comprador anónimo pueda pasar su venta a `pagada`, `anon`
lee las ventas anónimas, pero con permiso solo sobre `id`, `usuario_id` y
`estado` (`grant select (...)`): sin mails ni importes.

El costo de esta decisión: precios, cupón, edad y saldos se validan solo en
el frontend, y las políticas de escritura permiten que alguien con la clave
pública inserte ventas o movimientos de puntos propios con los importes que
quiera. Las garantías que quedan en Postgres son el índice único de
butacas, las FK, los `check` de cada tabla, el trigger que impide editar
los saldos de `perfiles` directamente y la regla de que cada usuario solo
mueve sus propios saldos.

El mapa de butacas todavía no marca las vendidas: con solo la selección del
lado del cliente, un conflicto con otra compra recién aparece al pagar.

La misma migración corrige `proteger_campos_sensibles_perfil`: bloqueaba
también los `update` de saldo que hacen los triggers de
`movimientos_credito`/`movimientos_puntos`, porque mira el rol del usuario
de la sesión y no quién hace el cambio. Ahora solo controla los `update`
directos (`pg_trigger_depth() = 1`). También agrega el trigger que mantiene
`peliculas.entradas_vendidas` (suma al insertar entradas y resta cuando un
ítem se cancela).

### Comprobante de compra: armado en el cliente, no releído de Supabase

`/compra/confirmacion` (`Confirmacion`, en `CompraModule`) muestra la
compra recién pagada: número de operación, una entrada por butaca con su
código y el resumen de importes. No vuelve a leer la venta de Supabase: el
comprador anónimo no tiene lectura sobre `venta_items` ni `entradas`, y
abrírsela expondría los códigos de otras compras.

En cambio, `VentasService.confirmarCompra()` devuelve lo que solo se conoce
al grabar (id de venta, código QR de cada butaca y puntos acreditados) y
`CarritoService.guardarComprobante()` lo combina con lo que ya tiene el
carrito (función, butacas, extras, importes) en un `CompraConfirmada`. El
comprobante vive en el signal `ultimaCompra`, respaldado en
`sessionStorage` para que refrescar la página no lo pierda, y sobrevive a
`vaciar()`. `Pago` guarda el comprobante, navega y recién después vacía el
carrito, para no mostrar un instante el estado de carrito vacío.

El costo: el comprobante solo existe en la pestaña donde se compró. El
usuario registrado sí puede leer sus ventas y entradas de Supabase (políticas
`*_select_propio`), así que fuera de este flujo se le pueden mostrar desde
la base.

### Código QR de las entradas: generado en el cliente

`entradas.codigo_qr` guarda solo el texto del código (32 caracteres
hexadecimales aleatorios, generados al confirmar la compra). La imagen del QR
no se guarda en ningún lado: se genera en el navegador cada vez que se
muestra, con la librería `qrcode` (`generarQr()` en
`core/helpers/qr.helpers.ts`, que devuelve un data URL PNG). Así no hace falta
Storage ni otra columna, y el QR siempre coincide con el código de la base.

El componente `CodigoQr` vive en `shared/componentes/` porque lo usan el
comprobante de compra y la pantalla de entradas del usuario. Genera la imagen
en `ngOnInit()` (el `input()` todavía no tiene valor en el constructor) y la
guarda en un signal. Los colores son fijos (módulos oscuros sobre fondo
crema) y no salen de los tokens: un QR necesita contraste alto para que la
cámara lo lea, aunque la interfaz sea oscura.

`qrcode` se publica como CommonJS, así que está en
`allowedCommonJsDependencies` de `angular.json` para que el build no avise.
Como solo lo importan componentes de features con lazy loading, no suma peso
a la carga inicial.

### PDF de entradas: jsPDF cargado bajo demanda

El PDF de las entradas se arma en el navegador con `jspdf`, dibujando cada
entrada a mano (rectángulos, texto e imagen del QR) en una página de
200 × 90 mm con forma de ticket. Se descartó `window.print()` con una hoja de
estilos de impresión porque no genera un archivo: deja al usuario en el
diálogo de impresión y el resultado depende del navegador. También se
descartó convertir el HTML del ticket a PDF (`jsPDF.html()` con
`html2canvas`): rasteriza la pantalla, pesa más y el texto no se puede
seleccionar.

`PdfEntradasService` vive en `core/servicios/` porque lo usan el
comprobante de compra y el listado de entradas del usuario. No toca Supabase:
recibe la función (`FuncionEntrada`) y las entradas (`EntradaImprimible`) ya
cargadas. Esos dos modelos de `core/modelos/entrada.model.ts` piden solo lo
que se imprime, así que les sirven tanto `FuncionMapa` del comprobante como
las entradas que se leen de la base. El QR reutiliza `generarQr()`, el mismo
helper que dibuja el QR en pantalla.

`jspdf` pesa unos 110 kB comprimido, así que el servicio lo importa con
`await import('jspdf')` dentro de `descargar()`: queda en un chunk aparte que
se baja recién la primera vez que alguien descarga un PDF, no al abrir la
confirmación. El `import type` de arriba del archivo solo aporta el tipo y
desaparece al compilar. Las dependencias opcionales de `jspdf` (`html2canvas`,
`canvg`) también quedan en chunks propios que nunca se piden, porque no se usa
`.html()`. Son CommonJS, así que están en `allowedCommonJsDependencies`.

La fuente es Helvetica, una de las estándar de PDF, que no hace falta
incrustar y cubre los acentos y la ñ. Un título que no entra en dos líneas
se corta con puntos suspensivos.

### Mis entradas: una consulta embebida y agrupación en el cliente

`/mis-entradas` es la feature standalone `entradas`, con lazy loading
(`loadChildren` a `entradas.routes.ts`) y protegida con `conSesionGuard`.
`EntradasService` vive en la feature porque solo la usa ella.

Los datos salen de una sola consulta a `entradas` con las relaciones
embebidas (`venta_items` → `butacas`, `funciones` → `salas`/`peliculas`, y
`ventas`). `venta_items!inner` y `ventas!inner` permiten filtrar por
columnas de la venta (`venta_items.ventas.usuario_id`,
`venta_items.ventas.estado`) y descartar las entradas que no cumplen. Las
ventas `pendiente` se excluyen: son compras que fallaron a mitad de camino y
que igual pueden tener entradas insertadas. El filtro por usuario es
explícito aunque RLS (`entradas_select_propio`) ya lo garantice, porque un
empleado o admin lee todas las entradas y la pantalla tiene que mostrar solo
las propias.

La agrupación por función y la separación en próximas/pasadas se hacen en
el cliente: PostgREST no agrupa sin una vista o función, y la cantidad de
entradas de un usuario es chica. Una función cuenta como "próxima" hasta que
termina (`funciones.fin`), no hasta que empieza, para que la entrada siga
visible con su QR si alguien llega tarde. Si RLS oculta la función (por
ejemplo, porque se canceló) o la butaca (porque se desactivó), esa entrada
no se muestra.

`TicketEntrada` está en `shared/componentes/` como standalone porque lo usan
el comprobante de compra (`CompraModule` lo importa en `imports`, igual que
`Boton`) y esta pantalla. Recibe la función y la entrada con los modelos de
`core/modelos/entrada.model.ts` y el estado por un `input()` aparte, que en
el comprobante queda en su valor por defecto (`emitida`).

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

### Llamadas a Supabase solo desde el frontend

Todas las lecturas y escrituras salen del frontend, desde los servicios, con
la API de tablas de supabase-js (`.from(...)`); no se invocan funciones de
Postgres desde el cliente (no se vio en la materia).
Las reglas críticas que no pueden depender solo del cliente se apoyan en lo
que Postgres hace por su cuenta: constraints e índices únicos (no vender la
misma butaca dos veces, no solapar funciones en una sala), triggers y
políticas RLS que acotan quién puede escribir qué.

### Esquema SQL versionado y RLS

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
  por rol. Excepción: las entradas no canceladas de `venta_items` son de
  lectura pública para pintar las butacas vendidas (ver "Butacas vendidas").
- **Tablas transaccionales** (`ventas`, `venta_items`, `entradas`, `pagos`,
  `reservas_butaca`, `movimientos_puntos`, `movimientos_credito`, `usos_qr`,
  `logs_actividad`): arrancaron sin políticas de escritura para el cliente,
  y cada funcionalidad agrega las que necesita, acotadas (ver la
  confirmación de compra más arriba).
- `perfiles.rol`, `credito_saldo` y `puntos_saldo` están protegidos además
  por un trigger (no solo por RLS): ni siquiera con una política de UPDATE
  "propio" un usuario puede autopromoverse a admin. El rol solo lo cambia un
  admin, y los saldos no los edita nadie directamente (ver "Puntos y crédito
  no transferibles").
- El alta de `perfiles` la hace el frontend después del signup, acotada por
  la política `perfiles_insert_alta` (ver "Alta de perfil desde el
  frontend").

Las migraciones no se aplican solas contra el proyecto de Supabase real desde
acá: se corren con `supabase db push` (requiere `supabase link` con
credenciales propias del proyecto) o pegando el contenido de cada archivo, en
orden, en el SQL Editor del dashboard.

### Puntos y crédito no transferibles

Los puntos (RN08/RN-010) y el crédito son personales. La regla no depende
del frontend: el saldo cacheado en `perfiles` solo cambia cuando se
inserta un movimiento en el ledger, y cada usuario solo inserta
movimientos propios.

- `movimientos_puntos`, `movimientos_credito` y `canjes`: la única
  escritura permitida es el `insert` con `usuario_id = auth.uid()`. Nadie
  puede acreditar ni debitar a otra cuenta, ni siquiera un admin. No hay
  políticas de `update`/`delete`, así que el historial no se edita. La
  única escritura en una cuenta ajena es la del trigger de cancelación de
  ventas (ver "Cancelación de compras").
- `perfiles.puntos_saldo`/`credito_saldo`: el trigger
  `proteger_campos_sensibles_perfil` rechaza cualquier `update` directo,
  también el de un admin (migración `saldos_solo_por_movimientos`). Solo
  pasan los `update` que hacen los triggers de los ledgers
  (`pg_trigger_depth() > 1`), así que saldo e historial no pueden quedar
  desfasados.
- Cada usuario lee solo sus propios saldos, movimientos y canjes.

Lo que la regla no cubre, por la decisión de grabar la compra desde el
frontend: un usuario con la clave pública puede insertarse movimientos
propios con el importe que quiera (ver "Pago simulado y confirmación de
compra desde el frontend"). Eso nunca toca la cuenta de otro.

Estas reglas se verificaron aplicando todas las migraciones sobre un
Postgres en memoria (PGlite), con un esquema `auth` mínimo, y probando
cada caso como `authenticated`: transferencias de puntos y crédito, edición
directa de saldos (cliente y admin), edición y borrado de movimientos,
canjes a nombre de otro, y una compra con canjes que el trigger descuenta
del saldo.

### Cancelación de compras: un `update` de la venta, el resto en el trigger

La cancelación (RN07) no tiene una feature propia: es una acción sobre una
venta que aparece en dos pantallas que ya existían. El cliente cancela
desde "Mis compras" del perfil (`HistorialCompras`) y el admin desde la
sección "Ventas" del panel (`ListadoVentas`, en `AdministracionModule`).
Por eso no hay carpeta `features/cancelaciones/`: las reglas compartidas
(plazo y crédito a devolver) viven en `core/helpers/cancelacion.helpers.ts`.

En los dos casos el frontend hace lo mismo: un `update` de `ventas` de
`pagada` a `cancelada` con `cancelled_at` (y `motivo_cancelacion`,
obligatorio, cuando cancela el admin). Las políticas
`ventas_update_cancelar_propia` y `ventas_update_cancelar_admin`
(migración `cancelacion_ventas`) solo permiten esa transición, al dueño de
la venta o a un admin.

Todo lo demás lo hace el trigger `propagar_cancelacion_venta`, que ya
marcaba `venta_items.cancelado`:

1. marca los `venta_items` como cancelados, lo que libera el índice único
   de butacas y descuenta `peliculas.entradas_vendidas`;
2. pasa las `entradas` de la venta a `cancelada`;
3. si la venta es de un cliente registrado, acredita en
   `movimientos_credito` lo que se pagó con tarjeta o con crédito
   (`total - puntos_usados`) y revierte el neto de puntos de la venta en
   `movimientos_puntos` con un movimiento `ajuste`: vuelven los puntos
   usados como pago o en canjes y se descuentan los que sumó la compra.
   Una compra anónima libera las butacas sin generar crédito.

Se resolvió en el trigger, y no con inserts desde el frontend como en la
compra, por dos motivos. El admin no puede insertar movimientos en cuentas
ajenas (ver "Puntos y crédito no transferibles"), y abrirle esa política
solo para esto debilitaba la regla para todos los casos. Y la cancelación
y el crédito quedan en la misma transacción: no puede haber una venta
cancelada sin su crédito. El trigger toma los importes de la fila anterior
al `update` (`old`), así que el `update` no puede inflar el crédito.

El plazo de 2 horas antes de la función se valida solo en el frontend,
al mostrar el botón y otra vez al confirmar (por si la página quedó
abierta). El admin no tiene plazo. No se repone el stock del Candy Bar.

Igual que con los saldos, el trigger se verificó sobre PGlite con todas
las migraciones: cancelación del dueño y de un admin, intento sobre una
venta ajena y doble cancelación (sin filas afectadas), crédito y puntos
resultantes, entradas canceladas, contador de vendidas y reventa de la
butaca liberada.

### Preventa: ventana calculada en el cliente, sin columna ni cron

La preventa (RN06) no tiene estado propio en la base: la ventana se deriva
de `peliculas.fecha_estreno` y `preventa_habilitada` cada vez que se lee la
película. `core/helpers/preventa.helpers.ts` concentra la regla en
`estadoVenta()`, que devuelve uno de tres estados:

- `en-venta`: la película ya se estrenó.
- `preventa`: tiene la preventa habilitada y faltan 7 días o menos para el
  estreno. Cada entrada cuesta `precio_preventa` (más el adicional de la
  butaca) en lugar de `funciones.precio_base`.
- `proximamente`: todavía no se puede comprar. Sin preventa, la venta abre
  el día del estreno.

El catálogo ("En cartelera") filtra en la consulta las películas
`en-venta` o en `preventa` con un `.or(...)` de PostgREST sobre esas dos
columnas; la sección pública Próximamente (`features/proximamente/`) lista
las de estreno futuro, incluidas las que ya están en preventa. El precio de
preventa se aplica al mapear la función para el mapa de butacas
(`mapearFuncionMapa`), así que todo lo que viene después (selección,
carrito, `venta_items.precio_unitario`) lo recibe sin cambios.

Se descartó una columna de estado actualizada por un job programado
(`pg_cron`): agregaba una pieza de infraestructura para algo que se
resuelve comparando dos fechas. Como el resto de las validaciones de
negocio que no son críticas, la ventana se respeta solo en el frontend.

### Alertas de estreno y avisos de venta: notificaciones generadas desde el frontend

Las alertas (`alertas_estreno`) se activan desde Próximamente o desde el
detalle de una película que todavía no está a la venta, con el componente
compartido `InterruptorAlerta` (`shared/componentes/`), y se gestionan en
"Alertas de estreno" del perfil. Activar es un `upsert` sobre
`(usuario_id, pelicula_id)` y quitarla es un `delete`; la política
`alertas_estreno_propio` del esquema inicial ya cubría las dos cosas.

El aviso de que la venta se habilitó (CU-29) depende del paso del tiempo,
no de una escritura en la base, así que ningún trigger lo puede disparar.
En lugar de un job programado, lo genera el frontend al abrir la
aplicación: la campana del encabezado (`layout/campana-notificaciones/`)
se monta solo con un cliente logueado y en su `ngOnInit()` llama a
`NotificacionesService.generarAvisosDeVenta()`, que busca las alertas
activas cuya película ya está en `preventa` o `en-venta`, inserta una
notificación por cada una y pasa la alerta a `activa = false` (cumplida).
Después lista las últimas 20 notificaciones y muestra cuántas no se leyeron.
Al abrir el panel se vuelve a ejecutar, así que una preventa que abre con
la aplicación ya abierta aparece sin recargar.

Como las notificaciones son solo in-app, generarlas al abrir la aplicación
no cambia lo que ve el cliente: no hay otro canal por el que pudiera
enterarse antes. La migración `avisos_venta` agrega
`notificaciones.pelicula_id` (para que el aviso lleve a la película) y la
política `notificaciones_insert_propio`, que solo deja insertar
notificaciones propias y no leídas. El trigger
`trg_notificaciones_proteger_contenido` sigue impidiendo editar el
contenido después: el cliente solo puede marcarlas como leídas.

### Reportes y estadísticas: agregación en el cliente

La página de reportes del panel (`/administracion/reportes`) trae con una
sola consulta las ventas `pagada` del período, con sus `venta_items`
embebidos (función, película, sala, producto y los `combo_items` de cada
combo), y `armarReporte()` (`administracion/helpers/`) arma todo en el
navegador: facturación por día, entradas por película y por función, y
unidades por producto. No hizo falta migración: las políticas del esquema
inicial ya dejan al admin leer todas las ventas y sus ítems, y los combos y
sus componentes son de lectura pública.

Se descartó una vista o una función de Postgres que agregara con
`group by`: el proyecto solo usa `.from(...).select()` sobre tablas, y con
los volúmenes de un TP sumar en el cliente es instantáneo. Su límite es el
máximo de filas que devuelve Supabase por consulta (1000 por defecto), que
un período de un TP no alcanza. Criterios del cálculo:

- Se agrupa por la **fecha de la venta** en la zona horaria del navegador,
  y la facturación diaria lista también los días sin ventas.
- **Facturado** suma `ventas.total` (ya con el descuento del cupón).
  Crédito y puntos son medios de pago, no descuentos, así que no se restan.
  Las ventas canceladas no suman.
- **Películas más vistas** se mide por entradas vendidas, no validadas: es
  el dato que existe para cualquier período, incluso para funciones que
  todavía no ocurrieron.
- **Producto más vendido** cuenta los productos sueltos y los que vienen
  dentro de combos (cantidad del combo × `combo_items.cantidad`), con el
  mismo criterio que el descuento de stock. Los canjes de recompensas no
  cuentan como venta.

El período se elige con atajos (hoy, esta semana, este mes) o con un rango
de fechas, que cubre el pedido de estadísticas por semana o por mes.

Los gráficos (`GraficoBarras`, declarado en el módulo de administración)
son barras horizontales hechas con HTML y CSS, sin librería de gráficos:
son rankings de una sola serie, así que alcanza con una barra por ítem cuyo
largo se pasa como custom property (`[style.--largo]`). Una librería como
Chart.js sumaba peso y una estética reconocible para algo que no necesita
ejes ni escalas. El color de las barras es un token propio
(`--color-grafico`) y no el dorado de marquesina, que también es el color de
advertencia.

### Exportación de reportes: PDF y Excel bajo demanda

`ExportacionReportesService` arma los dos archivos a partir de las mismas
tablas (`tablasDelReporte()`), así el PDF y el Excel tienen siempre las
mismas columnas. El PDF se dibuja con `jspdf`, como las entradas: tablas con
cabecera repetida en cada página y pie con la fecha de generación. El Excel
usa `write-excel-file`, que genera `.xlsx` reales (una hoja de resumen y
una por tabla) con una sola dependencia (`fflate`); se descartó `xlsx`
(SheetJS) porque su versión en npm quedó desactualizada y la mantenida se
distribuye fuera del registro, y `exceljs` por tamaño. Las dos librerías se
importan con `await import(...)` dentro de cada método, así quedan en
chunks aparte que solo se descargan al exportar.

### Control de acceso del empleado: lectura de QR y consumo condicionado

La feature `empleado/` es standalone (una sola página, `ControlAcceso`, en
`/empleado`) y se protege con `personalGuard`, otro `CanMatchFn` de
`rol.guard.ts` que deja pasar a `empleado` y a `admin`
(`AuthService.esPersonal()`); el encabezado muestra "Control de acceso" con
la misma condición. Como el admin, el empleado no opera como cliente (ver
"Rol del usuario y acceso al panel de administración").

La pantalla trabaja por concepto, ingreso a sala o retiro de Candy, porque
son dos consumos independientes del mismo QR (RN05): validar la entrada no
gasta el Candy ni al revés. El código se lee con la cámara o se escribe a
mano (se normaliza sin espacios y en mayúsculas, igual que se imprime en el
ticket). Con el código se busca la entrada con una consulta embebida hasta
su función, su butaca y su venta con los ítems, y
`motivoRechazo()` (`validacion.helpers.ts`) decide si se puede consumir:
código inexistente, compra cancelada o sin pagar, entrada ya usada, compra
sin Candy o Candy ya entregado. Si se puede, la pantalla muestra los datos
(película, función, butaca, aviso de adulto acompañante o la lista de
productos) y el empleado confirma.

El consumo es un `update` condicionado al estado, no una lectura seguida de
una escritura: `entradas` pasa a `validada` solo `where estado = 'emitida'`,
y `ventas.candy_entregado_at` se completa solo `where candy_entregado_at is
null`, ambos con `.select('id')`. Si otro puesto lo consumió primero, el
`update` no devuelve filas y el intento se rechaza. La migración
`validacion_empleado` agrega las políticas que lo permiten solo a
`empleado`/`admin` (y el `with check` exige el estado final, así que esas
políticas no sirven para otra cosa), el insert en `usos_qr` con el
`empleado_id` propio y la lectura de los `usos_qr` propios.

Además, un trigger (`proteger_candy_entregado`) solo deja completar
`candy_entregado_at` a `empleado`/`admin` y no deja cambiarlo una vez
completo. Las políticas solas no alcanzan: en un `update`, Postgres acepta la
fila si pasa el `using` de alguna política y el `with check` de alguna
otra, no necesariamente de la misma. Un cliente pasa el `using` de
`ventas_update_cancelar_propia` (venta propia pagada) y el `with check` de
`ventas_update_confirmar` (sigue propia y pagada), así que sin el trigger
podría volver a poner el campo en nulo y retirar el Candy otra vez.

Cada intento, aceptado o rechazado, queda en `usos_qr`; un código que no
existe se guarda con `entrada_id` nulo. El historial de la derecha
(`HistorialValidaciones`, presentacional) se relee de `usos_qr` después de
cada intento y se limita a la sesión en curso con
`user.last_sign_in_at` de Supabase Auth, así sobrevive a una recarga de la
página y se reinicia al volver a ingresar.

### Escaneo de QR por cámara: `jsQR` sobre `getUserMedia`

`EscanerQr` abre la cámara trasera con `getUserMedia`, muestra el video con
un visor propio y cada 200 ms copia el cuadro a un `<canvas>` y lo pasa a
`jsQR`. Al leer un código emite `leido` y apaga la cámara; también la apaga
en `ngOnDestroy`. Se eligió `jsQR` porque solo decodifica: el visor y los
mensajes son del diseño del cine, a diferencia de `html5-qrcode`, que trae
su propia interfaz. La API nativa `BarcodeDetector` no está disponible en
Safari ni en Firefox, así que no alcanza para un celular cualquiera.
`jsQR` se importa con `await import(...)` como `jspdf` (queda en un chunk
aparte) y figura en `allowedCommonJsDependencies` porque se publica como
UMD. La cámara exige HTTPS o `localhost`; si el navegador no da permiso,
queda el ingreso manual.

### Contador cacheado para datos agregados públicos

El destacado "3 más vendidas" del catálogo necesita un ranking de películas
por entradas vendidas. `ventas` es un dato personal (cada usuario lee solo
lo propio) y de `venta_items` solo las entradas son de lectura pública (ver
"Butacas vendidas"), sin la película a mano: habría que traer todas las
entradas vendidas y cruzarlas con `funciones` en cada carga del catálogo
para contarlas.

Se resuelve con un contador cacheado: `peliculas.entradas_vendidas`, una
columna simple que ya es de lectura pública porque `peliculas` ya lo es. Es
el mismo patrón que `perfiles.puntos_saldo`/`credito_saldo`: el valor se
mantiene actualizado por un trigger en el momento de la escritura (cuando una
venta se confirma y cuando se cancela), no se recalcula en cada lectura. El frontend hace una consulta
directa y simple:

```ts
.from('peliculas').select('...').order('entradas_vendidas', { ascending: false })
```

sin funciones ni joins en el momento de la lectura. Se descartó a propósito
una función `security definer` que agregara `ventas`/`venta_items` al vuelo:
funcionaba, pero sumaba una función a mantener por un cálculo que en realidad
se puede resolver una sola vez, en el momento en que la venta cambia de
estado.

### PWA: service worker de Angular solo para la app

La app es instalable con `@angular/pwa` (`@angular/service-worker`). El
service worker se registra solo en el build de producción
(`enabled: !isDevMode()`) y con `registerWhenStable:30000`, así no compite
con la carga inicial. `ngsw-config.json` cachea únicamente el *app shell*
(`index.html`, JS, CSS y el manifest, precargados) y los assets estáticos
(que se cachean al primer uso). No declara `dataGroups`, así que las
respuestas de Supabase nunca se cachean: funciones, butacas y stock siempre
se leen en vivo. Sin conexión la app abre, pero no puede comprar ni
consultar datos.

`@angular/service-worker` tiene un *peer dependency* exacto con
`@angular/core`, así que hay que actualizarlo junto con el resto de los
paquetes `@angular/*`.

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
sueltos. Los comportamientos visuales reutilizables que no necesitan template
propio van como directivas en `shared/directivas/` (por ejemplo
`appInteractiva`, el efecto de elevación al pasar el mouse), así se pueden
aplicar a cualquier elemento en vez de estar atados a un solo componente.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar SUPABASE_URL y SUPABASE_ANON_KEY
npm start              # ng serve (genera environment.ts antes de levantar)
npm test               # vitest
```

### Crear un usuario administrador

Toda cuenta nueva se crea como `cliente`, y el trigger
`trg_proteger_campos_sensibles_perfil` rechaza cambiar `rol` si quien lo
hace no es admin. En el SQL Editor de Supabase `auth.uid()` es `null`, así
que el trigger también rechaza el cambio ahí. Para promover al primer
administrador, se desactivan los triggers solo dentro de esa transacción:

```sql
begin;
set local session_replication_role = replica;
update public.perfiles
set rol = 'admin'
where id = (select id from auth.users where email = 'admin@ejemplo.com');
commit;
```

Si el usuario tenía la app abierta, tiene que recargar la página para que
se vuelva a leer el rol. Un empleado se crea igual, con `rol = 'empleado'`.
