-- Fase 0.6 — Esquema SQL inicial (tablas base)
-- Fuente: docs/03_Modelo_de_Datos_Supabase_Cine.pdf (v2).
--
-- Nota de modelado: el documento fuente menciona la relación "cupones 0:N →
-- ventas" en el diagrama conceptual (sección 2) pero no incluye una columna
-- para ese vínculo en la tabla `ventas` (sección 8) ni en la tabla de
-- relaciones formales (sección 4). Se resuelve acá agregando `cupon_id`
-- (nullable) a `ventas`, necesario para poder reportar qué cupón se usó en
-- cada compra (M12) y para no perder esa trazabilidad. Reflejado también en
-- docs/03_Modelo_de_Datos_Supabase_Cine.pdf (sección 7, nuevo punto
-- resuelto).

set search_path = public;

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- M01 Usuarios
-- ---------------------------------------------------------------------

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date not null,
  tipo_sangre text,
  color_ojos text,
  dias_vacaciones_anuales integer,
  rol text not null default 'cliente' check (rol in ('cliente', 'empleado', 'admin')),
  credito_saldo numeric(12, 2) not null default 0,
  puntos_saldo integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rol de negocio del usuario autenticado actual. security definer para poder
-- usarse dentro de las políticas RLS de `perfiles` sin recursión. Debe
-- crearse después de la tabla porque, al ser `language sql`, Postgres valida
-- la existencia de `perfiles` en el momento de crear la función.
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

create or replace function public.actualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_perfiles_updated_at
  before update on public.perfiles
  for each row execute function public.actualizar_updated_at();

-- Alta automática de perfil de negocio al registrarse en Supabase Auth.
-- Requiere que el signup mande nombre/apellido/fecha_nacimiento en
-- options.data (raw_user_meta_data) — sin eso no hay forma de completar las
-- columnas NOT NULL de perfiles.
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'nombre' is null
     or new.raw_user_meta_data ->> 'apellido' is null
     or new.raw_user_meta_data ->> 'fecha_nacimiento' is null then
    raise exception 'Faltan datos obligatorios de perfil (nombre, apellido, fecha_nacimiento) en el registro';
  end if;

  insert into public.perfiles (
    id, nombre, apellido, fecha_nacimiento, tipo_sangre, color_ojos, dias_vacaciones_anuales
  ) values (
    new.id,
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'apellido',
    (new.raw_user_meta_data ->> 'fecha_nacimiento')::date,
    new.raw_user_meta_data ->> 'tipo_sangre',
    new.raw_user_meta_data ->> 'color_ojos',
    nullif(new.raw_user_meta_data ->> 'dias_vacaciones_anuales', '')::integer
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

-- Evita que un usuario se autopromueva a admin/empleado o se cargue saldo
-- editando su propia fila de perfiles (la política de UPDATE "propio" en RLS
-- permite el update en general; esto bloquea los campos sensibles).
create or replace function public.proteger_campos_sensibles_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.rol is distinct from old.rol
      or new.credito_saldo is distinct from old.credito_saldo
      or new.puntos_saldo is distinct from old.puntos_saldo)
     and public.rol_actual() is distinct from 'admin' then
    raise exception 'Solo un administrador puede modificar rol, credito_saldo o puntos_saldo';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_campos_sensibles_perfil
  before update on public.perfiles
  for each row execute function public.proteger_campos_sensibles_perfil();

-- ---------------------------------------------------------------------
-- M02 Catálogo
-- ---------------------------------------------------------------------

create table public.peliculas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  duracion_minutos integer not null check (duracion_minutos > 0),
  imagen_url text not null,
  sinopsis text not null,
  clasificacion_edad integer check (clasificacion_edad in (13, 18)),
  fecha_estreno date not null,
  publicada boolean not null default true,
  preventa_habilitada boolean not null default false,
  precio_preventa numeric(12, 2),
  created_at timestamptz not null default now()
);

create table public.generos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table public.pelicula_genero (
  pelicula_id uuid not null references public.peliculas (id) on delete cascade,
  genero_id uuid not null references public.generos (id) on delete cascade,
  primary key (pelicula_id, genero_id)
);

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  pelicula_id uuid not null references public.peliculas (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  estrellas smallint not null check (estrellas between 1 and 5),
  comentario text check (char_length(comentario) <= 500),
  created_at timestamptz not null default now(),
  unique (pelicula_id, usuario_id)
);

-- ---------------------------------------------------------------------
-- M03 Salas / butacas
-- ---------------------------------------------------------------------

create table public.salas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activa boolean not null default true
);

-- Tabla genérica a propósito: el layout real (filas/columnas, butacas
-- accesibles, VIP) se carga como datos de seed en la Fase 0.7, no como
-- estructura de esquema.
create table public.butacas (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references public.salas (id) on delete cascade,
  fila text not null,
  numero integer not null,
  tipo text not null check (tipo in ('normal', 'accesible', 'vip')),
  precio_adicional numeric(12, 2) not null default 0,
  activa boolean not null default true,
  unique (sala_id, fila, numero)
);

-- ---------------------------------------------------------------------
-- M04 Funciones
-- ---------------------------------------------------------------------

create table public.funciones (
  id uuid primary key default gen_random_uuid(),
  pelicula_id uuid not null references public.peliculas (id),
  sala_id uuid not null references public.salas (id),
  inicio timestamptz not null,
  fin timestamptz not null,
  tipo_proyeccion text not null check (tipo_proyeccion in ('2D', '3D', '4D', '5D')),
  idioma text not null check (idioma in ('castellano', 'subtitulada')),
  precio_base numeric(12, 2) not null,
  estado text not null default 'programada' check (estado in ('programada', 'cancelada', 'finalizada')),
  created_by uuid references public.perfiles (id),
  created_at timestamptz not null default now()
);

-- Completa `fin` a partir de la duración de la película cuando no viene
-- seteado explícitamente (el frontend puede mandarlo igual si lo calculó ya).
create or replace function public.calcular_fin_funcion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.fin is null then
    select new.inicio + (duracion_minutos || ' minutes')::interval
      into new.fin
      from public.peliculas
      where id = new.pelicula_id;
  end if;
  return new;
end;
$$;

create trigger trg_funciones_calcular_fin
  before insert or update of inicio, pelicula_id on public.funciones
  for each row execute function public.calcular_fin_funcion();

-- Regla 5.2 del modelo de datos: no solapar horarios en la misma sala
-- (margen de 30 minutos entre funciones).
alter table public.funciones
  add constraint sin_solapamiento_por_sala
  exclude using gist (
    sala_id with =,
    tstzrange(inicio, fin + interval '30 minutes') with &&
  );

-- Bloqueo temporal de butacas en selección (tiempo real vía Supabase
-- Realtime). La unicidad "una butaca por función mientras el bloqueo está
-- vigente" no se modela como constraint porque depende de expira_at
-- (now()); se resuelve con upsert transaccional en el RPC de selección de
-- butacas (Fase 2) — ver regla 5.1 del modelo de datos.
create table public.reservas_butaca (
  id uuid primary key default gen_random_uuid(),
  funcion_id uuid not null references public.funciones (id) on delete cascade,
  butaca_id uuid not null references public.butacas (id) on delete cascade,
  sesion_id text not null,
  expira_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index ix_reservas_butaca_funcion_butaca on public.reservas_butaca (funcion_id, butaca_id);
create index ix_reservas_butaca_expira on public.reservas_butaca (expira_at);

-- ---------------------------------------------------------------------
-- M06 Candy bar / combos
-- ---------------------------------------------------------------------

create table public.categorias_producto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias_producto (id),
  nombre text not null,
  descripcion text,
  precio numeric(12, 2) not null,
  stock integer,
  activo boolean not null default true
);

create table public.combos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio_fijo numeric(12, 2) not null,
  destacado boolean not null default false,
  activo boolean not null default true
);

create table public.combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos (id) on delete cascade,
  producto_id uuid not null references public.productos (id),
  cantidad integer not null check (cantidad > 0)
);

-- ---------------------------------------------------------------------
-- M07 Promos
-- ---------------------------------------------------------------------

create table public.cupones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  porcentaje numeric(5, 2) not null check (porcentaje > 0 and porcentaje <= 100),
  tipo text not null check (tipo in ('primera_compra', 'edad', 'general')),
  edad_minima integer,
  activo boolean not null default true,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  constraint chk_cupon_edad_minima check (tipo <> 'edad' or edad_minima is not null)
);

-- ---------------------------------------------------------------------
-- M05 Venta
-- ---------------------------------------------------------------------

create table public.ventas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id),
  email_contacto text not null,
  -- Obligatorio en el checkout cuando usuario_id es null y la función es de
  -- una película con clasificacion_edad no nula (RN04).
  fecha_nacimiento_comprador date,
  cupon_id uuid references public.cupones (id),
  subtotal numeric(12, 2) not null,
  descuento numeric(12, 2) not null default 0,
  credito_usado numeric(12, 2) not null default 0,
  puntos_usados integer not null default 0,
  total numeric(12, 2) not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada', 'cancelada')),
  -- Momento de entrega del candy, independiente de la validación de entradas.
  candy_entregado_at timestamptz,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table public.venta_items (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references public.ventas (id) on delete cascade,
  tipo_item text not null check (tipo_item in ('entrada', 'producto', 'combo', 'recompensa')),
  producto_id uuid references public.productos (id),
  combo_id uuid references public.combos (id),
  funcion_id uuid references public.funciones (id),
  butaca_id uuid references public.butacas (id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null,
  total_linea numeric(12, 2) not null,
  cancelado boolean not null default false,
  -- Regla 5.3: coherencia de columnas según tipo_item.
  constraint chk_coherencia_tipo_item check (
    (tipo_item = 'entrada' and funcion_id is not null and butaca_id is not null
      and producto_id is null and combo_id is null) or
    (tipo_item = 'producto' and producto_id is not null
      and combo_id is null and funcion_id is null and butaca_id is null) or
    (tipo_item = 'combo' and combo_id is not null
      and producto_id is null and funcion_id is null and butaca_id is null) or
    (tipo_item = 'recompensa')
  )
);

-- Regla 5.3: no vender la misma butaca dos veces para la misma función. Esta
-- es la segunda línea de defensa (índice único parcial); la primera es la
-- validación transaccional en el RPC de compra (Fase 4).
create unique index ux_butaca_por_funcion on public.venta_items (funcion_id, butaca_id)
  where tipo_item = 'entrada' and butaca_id is not null and cancelado = false;

-- Propaga la cancelación de una venta a sus items para liberar el índice
-- único de arriba.
create or replace function public.propagar_cancelacion_venta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado = 'cancelada' and old.estado is distinct from 'cancelada' then
    update public.venta_items set cancelado = true where venta_id = new.id;
  end if;
  return new;
end;
$$;

create trigger trg_ventas_propagar_cancelacion
  after update of estado on public.ventas
  for each row execute function public.propagar_cancelacion_venta();

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references public.ventas (id) on delete cascade,
  metodo text not null,
  monto numeric(12, 2) not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  referencia_externa text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- M09 Tickets / QR
-- ---------------------------------------------------------------------

create table public.entradas (
  id uuid primary key default gen_random_uuid(),
  venta_item_id uuid not null unique references public.venta_items (id) on delete cascade,
  codigo_qr text not null unique,
  estado text not null default 'emitida' check (estado in ('emitida', 'validada', 'cancelada')),
  validada_at timestamptz,
  adulto_requerido boolean not null default false
);

create table public.usos_qr (
  id uuid primary key default gen_random_uuid(),
  codigo_qr text not null,
  -- Nullable: un intento con código inexistente/vencido igual queda logueado
  -- (resultado='rechazado') sin poder resolver a una entrada real.
  entrada_id uuid references public.entradas (id),
  tipo text not null check (tipo in ('entrada', 'candy')),
  empleado_id uuid not null references public.perfiles (id),
  resultado text not null check (resultado in ('validado', 'rechazado')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- M08 Fidelización
-- ---------------------------------------------------------------------

create table public.recompensas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'producto')),
  producto_id uuid references public.productos (id),
  nombre text not null,
  puntos_costo integer not null check (puntos_costo > 0),
  activo boolean not null default true
);

create table public.canjes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id),
  recompensa_id uuid not null references public.recompensas (id),
  venta_id uuid references public.ventas (id),
  puntos_usados integer not null check (puntos_usados > 0),
  created_at timestamptz not null default now()
);

create table public.movimientos_puntos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id),
  venta_id uuid references public.ventas (id),
  canje_id uuid references public.canjes (id),
  tipo text not null check (tipo in ('acreditacion', 'debito', 'ajuste')),
  -- Cantidad positiva o negativa según el tipo de movimiento.
  puntos integer not null,
  created_at timestamptz not null default now()
);

create table public.movimientos_credito (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id),
  venta_id uuid references public.ventas (id),
  tipo text not null check (tipo in ('acreditacion', 'uso', 'ajuste')),
  -- Monto positivo o negativo según el tipo de movimiento (misma convención
  -- que movimientos_puntos.puntos).
  monto numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- Saldos cacheados en perfiles, mantenidos por trigger sobre estos ledgers.
create or replace function public.actualizar_saldo_credito()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.perfiles set credito_saldo = credito_saldo + new.monto where id = new.usuario_id;
  return new;
end;
$$;

create trigger trg_movimientos_credito_saldo
  after insert on public.movimientos_credito
  for each row execute function public.actualizar_saldo_credito();

create or replace function public.actualizar_saldo_puntos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.perfiles set puntos_saldo = puntos_saldo + new.puntos where id = new.usuario_id;
  return new;
end;
$$;

create trigger trg_movimientos_puntos_saldo
  after insert on public.movimientos_puntos
  for each row execute function public.actualizar_saldo_puntos();

-- ---------------------------------------------------------------------
-- M11 Alertas / notificaciones
-- ---------------------------------------------------------------------

create table public.alertas_estreno (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  pelicula_id uuid not null references public.peliculas (id) on delete cascade,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  unique (usuario_id, pelicula_id)
);

create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

-- El cliente solo puede tocar `leida` (marcar como leída); el resto del
-- contenido lo escribe el backend.
create or replace function public.proteger_contenido_notificacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tipo is distinct from old.tipo
     or new.titulo is distinct from old.titulo
     or new.mensaje is distinct from old.mensaje
     or new.usuario_id is distinct from old.usuario_id then
    raise exception 'Solo se puede modificar el estado de lectura de una notificación';
  end if;
  return new;
end;
$$;

create trigger trg_notificaciones_proteger_contenido
  before update on public.notificaciones
  for each row execute function public.proteger_contenido_notificacion();

-- ---------------------------------------------------------------------
-- M13 Auditoría
-- ---------------------------------------------------------------------

create table public.logs_actividad (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id),
  accion text not null,
  entidad text not null,
  entidad_id uuid,
  detalle jsonb,
  created_at timestamptz not null default now()
);
