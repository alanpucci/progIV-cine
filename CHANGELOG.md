# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo,
entrega por entrega. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Fase 7.4] - 2026-10-07

### Added
- `FuncionesAdministracionService`: listado de próximas o pasadas con
  película, sala y entradas vendidas; obtener por id; opciones de películas
  y salas activas; crear y actualizar con asignación automática de sala o
  validación de la sala elegida (margen de 30 minutos); eliminar.
- Página `ListadoFunciones` (`/administracion/funciones`): programación
  agrupada por día, con vista de próximas y pasadas. Editar y eliminar solo
  en funciones sin entradas vendidas.
- Página `FormularioFuncion` (`/administracion/funciones/nueva` y
  `/administracion/funciones/:id`): película, fecha y hora, formato,
  idioma, precio base y sala (automática o a elección), con vista previa
  del horario de fin y de hasta cuándo queda ocupada la sala.
- Validador `fechaHoraFutura` y helpers `sumarMinutos()` y
  `fechaHoraLocal()`.

### Changed
- La sección "Funciones" del panel queda disponible.
- Al crear una función se completa `created_by` con el administrador.
- `README.md`: nueva sección sobre el ABM de funciones.
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: nota de `funciones`
  corregida: la asignación automática de sala la hace la aplicación, el
  `exclude` es el respaldo.

## [Fase 7.3] - 2026-10-06

### Added
- `SalasAdministracionService` (listado con cantidad de butacas por tipo y
  de funciones, obtener sala y butacas, crear, actualizar la distribución
  por diferencia, activar/desactivar y eliminar).
- Helper `planificarCambiosButacas()`: compara las butacas actuales con las
  deseadas y devuelve las altas y las actualizaciones agrupadas por fila.
- Página `ListadoSalas` (`/administracion/salas`): una tarjeta por sala con
  butacas, VIP, accesibles y funciones, y acciones editar,
  activar/desactivar y eliminar con confirmación ("Eliminar" deshabilitado
  si la sala tiene funciones).
- Página `FormularioSala` (`/administracion/salas/nueva` y
  `/administracion/salas/:id`): nombre, estado, filas, butacas por fila,
  adicional VIP y editor visual de la distribución con pinceles
  normal/accesible/VIP/pasillo, por butaca o por fila entera.

### Changed
- La sección "Salas y butacas" del panel queda disponible.
- `README.md`: nueva sección sobre el ABM de salas.

## [Fase 7.2] - 2026-10-06

### Added
- Migración `reglas_peliculas_generos`: checks
  `peliculas_precio_preventa_positivo` y `peliculas_preventa_con_precio`, e
  índice único `generos_nombre_unico_sin_mayusculas` sobre `lower(nombre)`.
- `PeliculasAdministracionService` (listado completo incluidas las ocultas,
  obtener por id, crear, actualizar con reemplazo de géneros, ocultar/publicar
  y eliminar) y `GenerosAdministracionService` (listado con cantidad de
  películas, crear, renombrar y eliminar), en la feature `administracion`.
- Página `ListadoPeliculas` (`/administracion/peliculas`): catálogo completo
  con estado de publicación, preventa y cantidad de funciones, y acciones
  editar, ocultar/publicar y eliminar con confirmación. "Eliminar" queda
  deshabilitado si la película tiene funciones cargadas.
- Página `FormularioPelicula` (`/administracion/peliculas/nueva` y
  `/administracion/peliculas/:id`): alta y edición con ficha, sinopsis,
  géneros, publicación, preventa y vista previa del afiche. El precio de
  preventa queda deshabilitado mientras la preventa no esté habilitada.
- Página `GenerosPeliculas` (`/administracion/peliculas/generos`): alta,
  renombrado y baja de géneros.
- Validador de grupo `precioPreventaRequerido` y helper `mensajeDeError()`.

### Changed
- La sección "Películas" del panel queda disponible.
- `sinEspaciosVacios` se mueve de `features/perfil/validadores/` a
  `shared/validadores/texto.validadores.ts`, porque ahora también lo usan los
  formularios de películas y géneros.
- Se quita el atributo `novalidate` de todos los `<form>` (perfil, compra y
  administración): `ReactiveFormsModule` ya lo agrega solo.
- `CLAUDE.md`: convenciones de formularios (leer con `.value` en vez de
  `getRawValue()`, no escribir `novalidate`).
- `README.md`: nueva sección sobre el ABM de películas y géneros; se corrige
  la mención de que el panel iba a reutilizar `PeliculasService`.
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: restricciones nuevas de
  `peliculas.precio_preventa` y `generos.nombre`.

### Fixed
- `formatearFechaEstreno()` mostraba el día anterior: la fecha `YYYY-MM-DD`
  se interpretaba como medianoche UTC.

## [Fase 7.1] - 2026-10-06

### Added
- Tipo `Rol` y `PerfilesService.obtenerRol(usuarioId)`.
- `AuthService.rol` (signal) y `esAdmin()`: el rol se lee de `perfiles` al
  cargar la sesión o iniciarla, se fija en `cliente` al registrarse y se
  limpia al cerrar sesión.
- `adminGuard` (`CanMatchFn`) en `core/guardias/rol.guard.ts`.
- Feature `administracion` como `NgModule` (`AdministracionModule` +
  `AdministracionRoutingModule`), cargada con `loadChildren` en
  `/administracion` y protegida con `adminGuard`.
- `PanelAdministracion`: layout del panel con barra lateral de secciones
  y `<router-outlet>` para las rutas hijas.
- `InicioAdministracion`: inicio del panel con una tarjeta por sección.
- `SECCIONES_ADMINISTRACION`: lista de secciones del panel, con las que
  todavía no tienen ABM marcadas como no disponibles.

### Changed
- El header muestra el enlace "Administración" solo a usuarios admin.
- `README.md`: nueva sección sobre el rol del usuario y el acceso al panel,
  y pasos para crear el primer usuario administrador.

## [Fase 2.7] - 2026-10-05

### Added
- Migración `lectura_butacas_vendidas`: política
  `venta_items_select_entradas_vendidas`, que deja leer a `anon` y
  `authenticated` los `venta_items` de tipo `entrada` no cancelados (mismo
  filtro que el índice `ux_butaca_por_funcion`).
- `FuncionesService.obtenerIdsButacasVendidas(funcionId)`.
- `ButacaEstado` suma el `input()` `vendida`, que se refleja en el atributo
  `data-vendida`.
- Ítem "Vendida" en la leyenda del mapa.

### Changed
- `ButacasInicio` pide las butacas vendidas en paralelo con la
  distribución de la sala: las vendidas quedan deshabilitadas, con un
  rayado propio, y se descartan de una selección previa guardada.
- `README.md`: nueva sección "Butacas vendidas"; se actualizan el criterio
  de RLS de datos personales y la justificación del contador
  `peliculas.entradas_vendidas`.
- `docs/ROADMAP.md` / `docs/ROADMAP.pdf`: se agrega la sub-tarea 2.7.

## [Refactor: buscador con ngModel sobre el signal] - 2026-10-05

### Removed
- Accessor `get`/`set` `terminoBusquedaValor` de `CatalogoInicio`.

### Changed
- El buscador del catálogo enlaza `[(ngModel)]="terminoBusqueda"`
  directo al `WritableSignal`, sin accessor intermedio.
- `README.md`: la sección de `[(ngModel)]` contra un signal documenta el
  enlace directo al `WritableSignal` y por qué el estado sigue en un signal
  y no en una propiedad plana.

## [Refactor: carga global como fuente de verdad] - 2026-10-05

### Removed
- Flags de carga propios de las pantallas: `cargando` de
  `PeliculaDetallePagina` y `ButacasInicio`, `cargandoDestacadas` y
  `cargandoListado` de `CatalogoInicio`, y `cargado` de `DatosComprador`.

### Changed
- `PeliculaDetallePagina`, `ButacasInicio`, `CatalogoInicio` y
  `DatosComprador` deciden si mostrar su contenido (o el aviso de "no
  encontrado"/"sin resultados") según `CargaGlobalService.visible()`:
  mientras haya cualquier carga global en curso no muestran nada y solo se
  ve el spinner global. En `CatalogoInicio`, las destacadas ya no aparecen
  antes que el listado: las dos secciones se muestran juntas cuando
  terminan ambas cargas.

## [Refactor: catálogo sin @let] - 2026-10-05

### Changed
- `CatalogoInicio` deja de usar `@let` en el template: el pipe
  `filtrarPeliculas` se aplica directamente en la condición de "sin
  resultados" y en el `@for` de la grilla, en vez de guardar el resultado
  en una variable local del template.

## [Fase 5.3] - 2026-10-05

### Added
- Feature standalone `entradas` con la página `/mis-entradas` (`MisEntradas`,
  protegida con `conSesionGuard`): entradas del usuario agrupadas por
  función, separadas en pestañas "Próximas" (la función todavía no
  terminó) y "Pasadas", con contador en cada una. Las próximas muestran el
  ticket completo con QR y estado, y un botón para descargar el PDF de las
  entradas `emitida` de esa función. Las pasadas muestran un resumen
  compacto por butaca con su estado (`Sin usar`/`Validada`/`Cancelada`).
- `EntradasService.obtenerEntradasPropias()` (`features/entradas/servicios/`):
  una sola consulta a `entradas` con `venta_items`, `butacas`, `funciones`,
  `salas`, `peliculas` y `ventas` embebidas, filtrada por el usuario y sin
  ventas `pendiente`. `agruparPorFuncion()` arma los grupos en el cliente.
- Enlace "Mis entradas" en el encabezado (con sesión) y "Ver mis entradas"
  en la confirmación de compra registrada.
- `EstadoEntrada` en `core/modelos/entrada.model.ts`.

### Changed
- `TicketEntrada` pasa de `features/compra/componentes/` (declarado en
  `CompraModule`) a `shared/componentes/` como componente standalone, porque
  ahora lo usan dos features. Suma el `input()` `estado`: la etiqueta y el
  color cambian según el estado, y una entrada validada o cancelada atenúa el
  QR (la cancelada además tacha película y código). La butaca queda alineada
  abajo del ticket.
- `Relacion<T>` y `unico()` pasan de `compra.mapeos.ts` a
  `core/helpers/relacion.helpers.ts` para reutilizarlos.
- En la confirmación, el botón de PDF queda debajo del aviso de documento.

## [Fase 5.2] - 2026-10-05

### Added
- `PdfEntradasService` (`core/servicios/`): `descargar(funcion, entradas)`
  arma un PDF con una página de 200 × 90 mm por entrada, con forma de
  ticket: marca, película, sala, fecha y hora, proyección, idioma,
  clasificación, butaca y tipo, aviso de documento si la película es +13/+18,
  y en el talón el QR con el código en texto. Lo descarga como
  `entradas-<pelicula>-<fecha>.pdf`.
- Modelos `FuncionEntrada` y `EntradaImprimible` (`core/modelos/entrada.model.ts`):
  los datos mínimos para imprimir una entrada, que cumplen tanto el
  comprobante de compra como las entradas leídas de Supabase.
- Botón "Descargar entradas en PDF" en `/compra/confirmacion`, con el
  spinner global mientras se genera y un mensaje si falla.
- Dependencia `jspdf` (`^4.2.1`; las versiones anteriores tienen avisos de
  seguridad críticos).

### Changed
- `angular.json`: `allowedCommonJsDependencies` suma las dependencias
  opcionales de `jspdf` (`html2canvas`, `canvg`, `core-js`, `raf`,
  `rgbcolor`), que solo se cargan si se usa `.html()`.

## [Fase 5.1] - 2026-10-05

### Added
- Componente standalone `CodigoQr` (`shared/componentes/codigo-qr/`):
  recibe el `codigo` por `input()` y dibuja el QR como imagen; mientras se
  genera muestra un recuadro rayado.
- Helper `generarQr()` (`core/helpers/qr.helpers.ts`): genera el QR del
  código como data URL PNG, con módulos oscuros sobre fondo crema.
- Dependencia `qrcode` (y `@types/qrcode`), declarada en
  `allowedCommonJsDependencies` de `angular.json` porque no se publica como
  ESM.

### Changed
- `TicketEntrada` muestra el QR de la entrada en el talón, arriba del código
  en texto; `CompraModule` importa `CodigoQr`.
- La confirmación de compra pide mostrar el QR (no el código) en el ingreso.

## [Fase 4.7] - 2026-10-05

### Added
- Página `/compra/confirmacion` (`Confirmacion`, declarada en
  `CompraModule`): sello de compra pagada con número de operación, fecha y
  mail de contacto, puntos sumados (con sesión), una entrada con forma de
  ticket por butaca (película, sala, horario, proyección, idioma, butaca,
  tipo, estado `emitida` y código), aviso de documento si la película tiene
  clasificación, y resumen de extras e importes.
- Componente presentacional `TicketEntrada` (`componentes/ticket-entrada/`,
  declarado en `CompraModule`): recibe `funcion` y `entrada` por `input()`
  y dibuja el ticket de una entrada emitida.
- `CompraConfirmada` (comprobante) y `CompraRegistrada` (resultado de
  `VentasService.confirmarCompra()`: id de venta, códigos QR por butaca y
  puntos acreditados).
- `CarritoService.ultimaCompra` y `guardarComprobante()`: el comprobante se
  arma con el estado del carrito antes de vaciarlo y se respalda en
  `sessionStorage`.
- `codigosQrPorButaca()` y `puntosAcreditados()` en `venta.filas.ts`.

### Changed
- `Pago` ya no muestra la confirmación en la misma página: al confirmar,
  guarda el comprobante, navega a `/compra/confirmacion` y recién ahí vacía
  el carrito.
- `README.md`: sección nueva sobre el comprobante de compra.

## [Fase 4.6] - 2026-10-05

### Added
- Página `/compra/pago` (`Pago`, declarada en `CompraModule`): resumen de la
  compra en forma de ticket, formulario de tarjeta simulada con título e
  indicación del monto a pagar, y confirmación de la venta. Los campos de
  tarjeta usan `autocomplete="off"`, y el número y el vencimiento se
  formatean mientras se escriben (`formatoNumeroTarjeta()` agrega un espacio
  cada 4 dígitos y `formatoVencimiento()` la barra de `MM/AA`; solo aceptan
  dígitos).
- `VentasService.confirmarCompra()` en `features/compra/`: graba la compra
  desde el frontend con la API de tablas de supabase-js (venta `pendiente`,
  `venta_items`, `entradas` con código QR, `pagos` por medio usado,
  movimientos de crédito/puntos con acreditación sobre lo pagado con
  tarjeta, descuento de stock incluidos los productos de combos) y la pasa
  a `pagada`.
- `SolicitudCompra`, `CarritoService.solicitudDeCompra()` y los armadores de
  filas en `venta.filas.ts`.
- `tarjeta.helpers.ts`: validadores de la tarjeta y
  `simularAutorizacion()` (rechaza las tarjetas terminadas en `0000`).
- Migración `20261005120000_compra_desde_frontend.sql`: políticas RLS de
  escritura acotadas para `ventas`, `venta_items`, `pagos`, `entradas`,
  `movimientos_credito`, `movimientos_puntos` y el stock de `productos`;
  lectura de `ventas` anónimas para `anon` limitada a `id`, `usuario_id` y
  `estado`; trigger `trg_venta_items_entradas_vendidas` que mantiene
  `peliculas.entradas_vendidas`.

### Changed
- Decisión de arquitectura: todas las llamadas a Supabase salen del
  frontend con la API de tablas de supabase-js. Actualizados `README.md` (sección nueva sobre el pago
  y la confirmación, y las de concurrencia y RLS) y `CLAUDE.md`.
- "Ir a pagar" en `/compra/datos-comprador` navega al pago en vez de mostrar
  un aviso de datos confirmados.
- La etiqueta del movimiento de puntos `debito` pasa a "Uso de puntos"
  (cubre pago y canje).
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: la sección 7 suma como
  resuelto el proveedor de pagos simulado y la confirmación desde el
  frontend, y el punto de crédito y puntos indica que el saldo se valida en
  el checkout. Las reglas 5.1, 5.3 y la nota de QR atómico dejan de suponer
  lógica de servidor invocada por el cliente.
- `docs/ROADMAP.md` y `docs/ROADMAP.pdf`: 4.6 pasa a ✅; las sub-tareas 1.1,
  2.4, 4.6, 6.3, 8.1, 8.5, 9.2 y 12.1 se describen sin lógica de servidor, y
  la nota de 2.4/2.5 deja de marcar la 2.4 como prerrequisito de la 4.6.

### Fixed
- `proteger_campos_sensibles_perfil` ya no bloquea las actualizaciones de
  saldo que hacen los triggers de `movimientos_credito` y
  `movimientos_puntos`; solo frena los `update` directos.

## [Fase 4.5] - 2026-10-05

### Added
- Componente `SaldosCompra` (declarado en `CompraModule`) en
  `/compra/datos-comprador`, visible solo con sesión: muestra el crédito y
  los puntos disponibles, permite elegir cuánto usar de cada uno (o "Usar
  todo") y desglosa total, crédito, puntos y monto a pagar.
- `CarritoService.saldosAplicados` (signal + `sessionStorage`) y
  `aplicarSaldos()`, `creditoUsado()`, `puntosUsados()`,
  `montoCubiertoPorPuntos()` y `totalAPagar()`. Los importes usados se
  topean contra el total vigente del carrito.
- `VALOR_PUNTO_EN_PESOS` (1 punto = $1) en `carrito.model.ts`.

### Changed
- `DatosComprador` descarta los saldos aplicados cuando no hay sesión, y
  `CarritoService.vaciar()` también los limpia.
- `README.md`: nueva sección sobre crédito y puntos como pago parcial.
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: la sección 7 suma como
  resuelta la equivalencia 1 punto = $1 para `ventas.puntos_usados`
  (editado directamente sobre el PDF con PyMuPDF).

## [Fase 4.4] - 2026-09-28

### Added
- Página `/compra/datos-comprador` (`DatosComprador`, declarada en
  `CompraModule`): mail de contacto y fecha de nacimiento del comprador.
  Con sesión precarga el mail y toma la fecha del perfil; sin sesión pide
  la fecha obligatoriamente y ofrece ingresar para comprar con cuenta.
- Validación de edad (RN04) contra la clasificación de la película antes
  de continuar (`cumpleEdadMinima` en `edad.helpers.ts`).
- `CarritoService.comprador` (signal + `sessionStorage`) con los datos
  confirmados, y `edadMinimaRequerida()`.
- Botón "Continuar" en el carrito, habilitado solo si hay entradas.
- Parámetro `volverA` en `/cuenta/ingreso` para volver al checkout después
  de iniciar sesión.

### Changed
- `FuncionMapa` incluye `clasificacionEdad`, traída en el mismo join a
  `peliculas` de `obtenerParaMapa()`.
- `fechaNacimientoValida`, `fechaIsoLocal` y `FECHA_NACIMIENTO_MINIMA` se
  mueven de `features/perfil/validadores/` a `shared/validadores/`.
- `CarritoService` unifica la persistencia en `sessionStorage` del cupón y
  del comprador en un par de métodos genéricos.
- Ingreso, registro y perfil leen el formulario con `.value` en vez de
  `getRawValue()`.

## [Docs: README sin fases] - 2026-09-28

### Changed
- `README.md`: se quitan todas las referencias a fases y sub-tareas. Los
  títulos de sección pierden el "(Fase X.Y)" y lo pendiente se nombra por
  lo que es (por ejemplo, "la confirmación de compra" en vez de "la
  Fase 4.6"). El README queda solo con arquitectura y decisiones
  técnicas; el seguimiento por fase sigue en `CHANGELOG.md` y
  `docs/ROADMAP.md`.
- `CLAUDE.md`: se agrega la regla de no referenciar fases en el README.

### Removed
- Sección "Estado del proyecto" del README, que solo describía el avance
  por fases.

## [Refactor: directiva Interactiva] - 2026-09-28

### Added
- Directiva `Interactiva` (`[appInteractiva]`, en `shared/directivas/`):
  escucha `mouseenter`/`mouseleave` y, mientras el mouse está encima,
  eleva el elemento y le cambia sombra y borde con estilos del host. Se usa
  en las tarjetas de la cartelera.

### Changed
- `Tarjeta` pierde el input `interactiva`: la elevación al pasar el mouse
  pasa a la directiva `appInteractiva`, y la caja visual (fondo, borde,
  sombra) es ahora el `:host` del componente en vez de un `div` interno.
- `SeleccionButacasService.confirmar()` copia la butaca completa con spread
  en vez de campo por campo.

### Fixed
- El `gap` de `.catalogo-inicio__tarjeta` no tenía efecto porque se aplicaba
  al host de `Tarjeta` y no a la caja interna; con la caja en el `:host`,
  ahora separa póster e info en la cartelera.

## [Fase 4.3] - 2026-09-28

### Added
- `supabase/migrations/20260928130000_lectura_cupones_activos.sql`:
  política `cupones_select_activos` para que `anon` y `authenticated`
  puedan leer los cupones con `activo = true`.
- `CuponesService` (`features/compra/servicios/`): busca el cupón por
  código y valida vigencia, primera compra (con sesión y sin ventas previas
  no canceladas) y edad mínima (con sesión, usando la fecha de nacimiento
  del perfil). Devuelve el mensaje de error listo para mostrar.
- `features/compra/modelos/cupon.model.ts` (`CuponAplicado`), su mapeo en
  `helpers/cupon.mapeos.ts` y `helpers/edad.helpers.ts` (`calcularEdad`).
- Componente `CuponCarrito` (`standalone: false`, declarado en
  `CompraModule`): campo de código con Reactive Forms y botón "Aplicar";
  con un cupón aplicado muestra el código, el porcentaje y "Quitar".
- `CarritoService`: signal `cupon` (guardado en `sessionStorage`),
  `aplicarCupon(codigo)`, `aplicarCuponAutomatico()`, `quitarCupon()`,
  `subtotal()` y `descuento()`.
- Aplicación automática de cupones: al abrir el carrito con sesión y sin
  cupón, `CuponesService.buscarCuponAutomatico()` aplica el cupón
  `primera_compra` o `edad` de mayor porcentaje que el usuario cumpla. Los
  cupones `general` se siguen ingresando a mano.

### Changed
- Se reabre la decisión de la Fase 0.6 de que `cupones` sea legible solo
  por admin (ver README, sección Cupones).
- `CarritoService.total()` ahora resta el descuento del cupón. El carrito
  muestra la línea "Descuento CÓDIGO (X%)" entre los subtotales y el total.
  La barra del Candy Bar también muestra el total con descuento.
- `CarritoService.vaciar()` también quita el cupón.
- `CompraModule` importa `ReactiveFormsModule`.

## [Fase 4.2] - 2026-09-28

### Added
- Página `CandyBar` en `/compra/candy-bar` (`standalone: false`, declarada
  en `CompraModule`): combos primero (los destacados arriba, con sello
  "Recomendado") y después una sección por categoría de producto. Chips
  para filtrar por Todo / Combos / categoría (solo las categorías con
  productos activos). Barra fija inferior con la cantidad de ítems de
  Candy, el total del carrito y "Ir al carrito" / "Seguir sin Candy".
- Componente presentacional `TarjetaCandy`
  (`features/compra/componentes/`): recibe nombre, descripción, precio,
  cantidad, stock máximo y si está destacado, y emite `sumar` / `restar`.
  Muestra "Agregar" sin unidades y stepper −/+ con unidades. Si
  `stock` es 0 muestra "Agotado", y el + se desactiva al llegar al stock.
  Si el stock es `null`, no hay tope.
- `CandyBarService` (`features/compra/servicios/`): `obtenerCarta()` trae
  en paralelo categorías, productos activos y combos activos.
- `features/compra/modelos/candy-bar.model.ts` (`CategoriaProducto`,
  `ProductoCandy`, `ComboCandy`, `CartaCandy`) y los mapeos en
  `features/compra/helpers/candy-bar.mapeos.ts`.
- `CarritoService.cantidadDe(tipo, id)` (unidades de un producto/combo en
  el carrito) y `cantidadExtras()` (total de unidades del Candy Bar).

### Changed
- El resumen de selección de butacas ahora continúa al Candy Bar
  ("Continuar al Candy Bar") en vez de ir directo al carrito. El flujo
  queda butacas → Candy Bar → carrito.
- El bloque Candy Bar del carrito suma un link para volver a agregar
  productos ("Agregar del Candy Bar" / "Sumar más").
- `CarritoService.cantidadItems()` reutiliza `cantidadExtras()`.

## [Fase 4.1] - 2026-09-28

### Added
- Feature `compra` como `NgModule` clásico: `CompraModule` (lazy con
  `loadChildren` en `/compra`) + `CompraRoutingModule`
  (`RouterModule.forChild`). `/compra` redirige a `/compra/carrito`.
- `CarritoService` (`features/compra/servicios/`): toma las entradas de
  `SeleccionButacasService` sin duplicarlas y guarda productos y combos en
  dos signals (`productos`, `combos`) respaldados en `sessionStorage`.
  Expone `agregar()`, `cambiarCantidad()`, `quitar()`, `vaciar()`,
  subtotales de entradas y Candy Bar, total y cantidad de ítems.
- Página `CarritoCompra` (`standalone: false`, declarada en el módulo):
  detalle con la función y las butacas elegidas (con link para
  modificarlas), líneas del Candy Bar con cantidad +/− y quitar,
  subtotales, total y "Vaciar carrito". Muestra un estado vacío con link
  a la cartelera.
- `features/compra/modelos/carrito.model.ts` (`ExtraCarrito`,
  `ExtrasCarrito`).

### Changed
- El resumen de selección de butacas (`/butacas/funcion/:id/resumen`)
  suma el botón "Continuar al carrito".

## [Fase 3.5] - 2026-09-28

### Added
- Componente `MisPeliculas` (`features/perfil/componentes/`), integrado en
  `/cuenta/perfil` debajo de la billetera (RF-034). Muestra una tira de
  película con el póster, la fecha de la última función vista y la
  calificación propia (estrellas de `resenas`, o "Sin calificar"). Cada
  cuadro es un acceso rápido al detalle de la película.
- Componente `HistorialCompras`: lista de compras propias como tickets con
  talón: fecha de compra, película (link al detalle), función, sala,
  butacas, productos/combos, total y estado (pagada/cancelada). Las ventas
  `pendiente` no se muestran porque son checkouts sin terminar.
- `ComprasService` (`core/servicios/`): `obtenerComprasPropias()` (últimas
  50 `ventas` con sus `venta_items` y relaciones) y
  `obtenerPeliculasVistas()`, que cuenta como vista una película con
  entrada no cancelada, de una venta pagada y con función ya empezada.
  No hizo falta migración: las políticas RLS de lectura propia ya existían.
- `core/modelos/compra.model.ts` y `core/helpers/compra.mapeos.ts`.

## [Fase 3.4] - 2026-09-28

### Added
- Componente `BilleteraCuenta` (`features/perfil/componentes/`), integrado
  en `/cuenta/perfil` entre el carnet y "Mis datos". Muestra dos fichas con
  forma de entrada de cine con el saldo de puntos y el de crédito (ARS).
  Tocar una ficha cambia el historial visible: concepto, fecha y cantidad
  con signo (verde si suma, rojo si resta), del más nuevo al más viejo.
  Tiene mensaje para cuando no hay movimientos.
- `MovimientosService` (`core/servicios/`): `obtenerSaldos()`, que lee
  `perfiles.puntos_saldo`/`credito_saldo` (los mantiene el trigger de los
  ledgers), y `obtenerMovimientosPuntos()`/`obtenerMovimientosCredito()`,
  que traen los últimos 50 de cada ledger. No hizo falta migración: las
  políticas RLS de lectura propia ya existían.
- `core/modelos/movimiento.model.ts`, `core/helpers/movimiento.mapeos.ts`
  (filas snake_case → modelo) y `core/helpers/movimiento.formato.ts`
  (pesos, puntos, fecha y etiquetas por tipo de movimiento).

### Changed
- `ButacaEstado`: `input.required<TipoButaca>()` pasa a
  `input<TipoButaca>("normal")`, siguiendo la convención nueva de no usar
  `input.required()` (no visto en la materia).
- `CLAUDE.md`: regla nueva para inputs/outputs. Se usan `input()`/`output()`
  sin `.required`, con valor por defecto, y se leen en `ngOnInit()`.
  `README.md` suma la sección "Inputs y outputs" con el mismo criterio.
- `docs/ROADMAP.md`/`ROADMAP.pdf`: 3.3 y 3.4 pasan a ✅ y se actualiza la
  nota de guards de sesión (`conSesionGuard` ya existe desde la 3.3).

## [Fase 3.3] - 2026-09-28

### Added
- Guard funcional `conSesionGuard` (`core/guardias/sesion.guard.ts`): si no
  hay sesión, navega a `/cuenta/ingreso` con `replaceUrl: true`.
- Página `PerfilCuenta` en `/cuenta/perfil`, protegida por
  `conSesionGuard`. Arriba muestra un "carnet de socio" con las iniciales,
  el nombre y el mail (solo lectura). Debajo está el formulario de datos
  propios (nombre, apellido, fecha de nacimiento, tipo de sangre, color de
  ojos, vacaciones anuales), con los mismos validadores del registro.
  "Guardar" y "Descartar cambios" se habilitan solo si hay cambios.
- `PerfilesService.obtener()` y `PerfilesService.actualizar()`. El update
  solo manda los campos editables. `rol`, `credito_saldo` y `puntos_saldo`
  siguen protegidos por el trigger `proteger_campos_sensibles_perfil`, que
  ya existía, así que no hizo falta migración.
- `core/helpers/perfil.mapeos.ts`: `mapearPerfil()` / `aFilaPerfil()` para
  pasar de las columnas snake_case de `perfiles` al modelo y viceversa.
- Encabezado: link "Mi perfil" con sesión iniciada, en escritorio y en el
  menú móvil. Se adelanta de la 3.6 porque sin él no se llega a la página.

### Changed
- `DatosPerfilNuevo` pasa a llamarse `DatosPerfil`, porque ahora sirve para
  el alta y para la edición. `PerfilesService.crear()` usa `aFilaPerfil()`.

## [Fase 3.2] - 2026-09-27

### Added
- `AuthService`: signal `sesion`, que se carga al arrancar con
  `getSession()` y se actualiza a mano en `registrar()`, `iniciarSesion()`
  y `cerrarSesion()`. También `haySesion()` y `cargarSesion()`, que el
  constructor llama al arrancar y el guard vuelve a llamar antes de decidir.
  Mensajes en español para `invalid_credentials` y `user_banned`.
- Guard funcional `sinSesionGuard` (`core/guardias/sesion.guard.ts`),
  aplicado a `/cuenta/ingreso` y `/cuenta/registro`: si ya hay sesión,
  navega al inicio con `replaceUrl: true` y cancela la navegación.
- Página `IngresoCuenta` en `/cuenta/ingreso`: formulario reactivo de mail
  y contraseña. Después del login vuelve al catálogo. Si falla, limpia la
  contraseña y muestra el error.
- Encabezado: "Ingresar" y "Crear cuenta" sin sesión, "Cerrar sesión" con
  sesión, tanto en escritorio como en el menú móvil. El header completo
  (nombre, acceso al perfil) sigue siendo la Fase 3.6.
- Registro: enlace al ingreso al pie del formulario.
- Partial `src/styles/_formularios.scss` con mixins de panel, campo, errores
  y enlace, y `src/styles` en `stylePreprocessorOptions.includePaths`.

### Changed
- `RegistroCuenta` usa los mixins de `_formularios.scss` en vez de sus
  propios estilos de campo. El resultado visual es el mismo.
- `RegistroCuenta` (e `IngresoCuenta` desde el inicio) ya no tienen el
  signal `enviando`: mientras dura el envío, el overlay de
  `CargaGlobalService` tapa el formulario, y eso alcanza para evitar el
  doble envío.
- Se desactivó la confirmación por mail en Supabase (Authentication →
  Sign In / Providers → Email → *Confirm email*). `signUp()` ahora deja la
  sesión iniciada, así que `AuthService.registrar()` devuelve `void` y
  guarda la sesión en el signal. `RegistroCuenta` navega al catálogo al
  terminar, igual que el login.
- La directiva `ButacaSeleccionada` pasa a llamarse `ButacaEstado`
  (`features/salas-butacas/directivas/butaca-estado.directive.ts`, selector
  `[appButaca]`). Además de la selección (`[seleccionada]` →
  `aria-pressed`), recibe el tipo de butaca (`[appButaca]="butaca.tipo"` →
  `data-tipo`). Reemplaza los dos `[class...--accesible/--vip]` del mapa.
  También se usa en las muestras de la leyenda, así que los colores por
  tipo y de selección quedan en un solo bloque del SCSS, compartido entre
  butaca y muestra (antes estaban duplicados como modificadores `--*`).
- `README.md`: nueva sección sobre el manejo de sesión, el guard y el
  partial de formularios. La sección del alta de perfil ya no asume
  confirmación por mail.

### Removed
- Todo lo que dependía de la confirmación por mail: el tipo
  `ResultadoRegistro`, la pantalla de éxito del registro con sus dos
  variantes ("Revisá tu mail" y "Cuenta creada"), los signals `resultado` y
  `emailRegistrado`, `emailRedirectTo` en el `signUp()`, la detección de
  mail repetido por `identities` vacío (sin confirmación, Supabase devuelve
  directamente `user_already_exists`) y los mensajes de
  `email_not_confirmed` y `over_email_send_rate_limit`.

## [Fase 3.1] - 2026-09-27

### Added
- `AuthService` (`core/servicios/auth.service.ts`) con `registrar()`: llama a
  `auth.signUp()` y, con el `id` del usuario creado, inserta la fila de
  `perfiles` vía `PerfilesService.crear()` (`core/servicios/`). El perfil se
  crea aunque falte confirmar el mail. Distingue si Supabase devolvió sesión
  (`'sesion-iniciada'`) o si falta confirmar el mail
  (`'confirmacion-pendiente'`), traduce los códigos de error de Auth a
  mensajes en español y detecta el caso "mail ya registrado" que Supabase
  devuelve sin error cuando la confirmación por mail está activa
  (`identities` vacío).
- Migración `20260928120000_alta_perfil_desde_frontend.sql`: elimina el
  trigger `al_crear_usuario`/`manejar_nuevo_usuario` y agrega la política
  `perfiles_insert_alta` (anon/authenticated) más la función
  `es_usuario_recien_registrado()`. El INSERT solo pasa para un usuario de
  Auth creado hace menos de 15 minutos, propio si hay sesión, con
  `rol = 'cliente'` y saldos en 0.
- Modelos `DatosPerfilNuevo`/`DatosRegistro` y catálogos `TIPOS_SANGRE`/`COLORES_OJOS`
  (`core/modelos/usuario.model.ts`).
- Feature `perfil` (standalone) montada en `/cuenta`, con la página
  `RegistroCuenta` en `/cuenta/registro`: formulario reactivo en tres
  bloques (acceso, datos personales, otros datos) con todos los
  campos de RF-001 obligatorios, errores por campo al perder foco o al
  intentar enviar, validadores propios en
  `features/perfil/validadores/registro.validadores.ts` (fecha de
  nacimiento no futura ni anterior a 1900, sin campos de solo espacios,
  contraseñas coincidentes a nivel de grupo) y pantalla de éxito según el
  resultado del registro.
- Campo "Días de vacaciones anuales" como `type="text"` +
  `inputmode="numeric"` con `maxlength="3"`: el handler
  `dejarSoloDigitos()` descarta todo lo que no sea dígito (tipeado o
  pegado). No se usa `type="number"` porque el navegador acepta `e`, `-`,
  `+` y `.` como parte de un número válido. El tope de 365 lo sigue
  validando el formulario.
- Enlace "Crear cuenta" en el encabezado (escritorio y menú móvil). Por
  ahora es estático; reflejar la sesión es la Fase 3.6.

### Fixed
- `ButacasInicio` y `ResumenSeleccion` usaban `formatearFechaFuncion`/
  `formatearHoraFuncion` en el template sin exponerlos en la clase (quedó
  así tras el merge de la 2.6), lo que rompía `ng build` en `main`.

### Changed
- `README.md`: nueva sección sobre cuándo se usan Reactive Forms en vez de
  `[(ngModel)]` y cómo encajan con zoneless, y otra sobre el alta de perfil
  desde el frontend (reemplaza la mención al trigger de alta automática).

## [Fase 2.6] - 2026-09-27

### Added
- Selección de butacas en el mapa (`ButacasInicio`): cada butaca pasa de
  `<span>` a `<button>`, se alterna con un click (`alternarButaca()`) y se
  resalta con el acento rojo, pisando el color normal/accesible/VIP. Nueva
  entrada "Tu selección" en la leyenda.
- Directiva de atributo `ButacaSeleccionada`
  (`features/salas-butacas/directivas/butaca-seleccionada.directive.ts`,
  selector `[appButacaSeleccionada]`): refleja el estado de selección en
  `aria-pressed` del host, y el SCSS estiliza sobre
  `[aria-pressed="true"]` en vez de una clase modificadora. Así el estado
  tiene una sola fuente, que sirve tanto a lectores de pantalla como al
  estilo. De atributo y no estructural porque la butaca siempre existe en
  el DOM; solo cambia su estado.
- Barra de resumen fija al pie del mapa (`butacas-mapa__resumen`): muestra
  cantidad, total y ubicaciones elegidas (`butacasSeleccionadas()`,
  `totalSeleccion()`, métodos planos sin `computed()`), con el botón
  "Confirmar butacas" deshabilitado mientras no haya selección.
- `SeleccionButacasService` (`core/servicios/seleccion-butacas.service.ts`):
  contrato entre el mapa y la futura feature `compra` (Fase 4.1).
  `confirmar(funcion, butacas)` guarda la función y las butacas ordenadas
  por fila/número, con el precio de cada una (`precio_base` +
  `precio_adicional`); expone también `limpiar()`, `total()` e
  `idsElegidosPara(funcionId)`. Respaldado en `sessionStorage` para que un
  refresh no pierda la selección (justificación en `README.md`).
- Modelos `ButacaElegida` y `SeleccionButacas` (`funcion.model.ts`).
- `ResumenSeleccion` (`features/salas-butacas/paginas/resumen-seleccion/`,
  ruta `/butacas/funcion/:id/resumen`): destino de "Confirmar butacas".
  Muestra la selección con estética de ticket (película, función, butacas
  con tipo y precio, total), permite volver a modificarla (el mapa la
  precarga, descartando butacas que ya no estén activas) o cancelarla.
  Sin botón de "continuar a la compra" hasta que exista la Fase 4.

### Changed
- `docs/ROADMAP.md`/`docs/ROADMAP.pdf`: 2.4 (bloqueo temporal) y 2.5
  (Realtime) quedan **diferidas**; 2.4 pasa a ser prerrequisito de 4.6.
  2.6 se amplía para incluir la selección del lado del cliente, que no
  estaba asignada a ninguna sub-tarea (2.3 era solo visual). 4.1 aclara
  que las entradas del carrito salen de `SeleccionButacasService`.
- `README.md`: nueva sección sobre dónde vive el estado de la selección y
  por qué se respalda en `sessionStorage`.

## [Limpieza de docs] - 2026-09-23

### Changed
- `docs/03_Modelo_de_Datos_Supabase_Cine.pdf`: se sacan los badges `NUEVO`/
  `V3` y las cajas "Qué cambió en la versión 2"/"Qué cambió en la versión 3"
  de la sección 1 (Criterio de modelado), junto con las menciones sueltas a
  esas versiones (nota de tapa, intro de la sección 2, un par de notas al pie
  con `(V3)`). El documento venía marcando cada cambio respecto a
  revisiones anteriores; ahora queda solo el contenido vigente, sin ese
  rastro de versionado. Editado directamente sobre el PDF (con PyMuPDF,
  redacción dirigida por texto/color de fondo real de cada fila) porque no
  hay una fuente editable versionada para este documento.

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
  tablas transaccionales sensibles sin escritura de cliente hasta que cada
  funcionalidad agregue las políticas que necesita).

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
