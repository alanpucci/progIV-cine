-- Fase 0.7 — Seed de datos de demo.
--
-- Alcance: catálogo (películas/géneros), salas/butacas, funciones y
-- candy bar/combos/cupones — todo lo que no depende de un usuario real.
-- Reseñas y ventas quedan fuera a propósito: `resenas.usuario_id` y
-- `ventas.usuario_id` referencian `perfiles`, que a su vez referencia
-- `auth.users`; fabricar usuarios ahí es una operación no soportada sobre
-- una tabla interna de Supabase Auth. Esos datos se van a generar solos
-- una vez que existan registro (Fase 3) y compra (Fase 4) reales. Hasta
-- entonces, el destacado "3 más vendidas" del home puede resolverse con un
-- fallback (ej. curaduría manual) cuando no hay ventas todavía.
--
-- Los `imagen_url` de las películas usan picsum.photos como placeholder
-- determinístico (seed fijo por película) — no hay pipeline de assets/
-- Storage para posters todavía; se reemplaza cuando lo haya.

set search_path = public;

-- ---------------------------------------------------------------------
-- Géneros
-- ---------------------------------------------------------------------

insert into public.generos (nombre) values
  ('Acción'),
  ('Comedia'),
  ('Drama'),
  ('Terror'),
  ('Ciencia Ficción'),
  ('Animación'),
  ('Suspenso'),
  ('Romance'),
  ('Documental'),
  ('Aventura');

-- ---------------------------------------------------------------------
-- Películas
-- ---------------------------------------------------------------------

insert into public.peliculas (
  nombre, duracion_minutos, imagen_url, sinopsis, clasificacion_edad,
  fecha_estreno, publicada, preventa_habilitada, precio_preventa
) values
  ('El Último Fotograma', 118, 'https://picsum.photos/seed/ultimo-fotograma/400/600',
   'Un fotógrafo de guerra retirado revisa su archivo y encuentra una imagen que nunca debió tomar.',
   null, '2026-08-20', true, false, null),
  ('Sangre en la Sala 6', 97, 'https://picsum.photos/seed/sangre-sala-6/400/600',
   'Una función de medianoche se convierte en una trampa de la que nadie puede salir con vida.',
   18, '2026-09-05', true, false, null),
  ('Risas de Medianoche', 102, 'https://picsum.photos/seed/risas-medianoche/400/600',
   'Cinco comediantes compiten por el mismo espacio en un club a punto de cerrar.',
   null, '2026-08-28', true, false, null),
  ('Horizonte Binario', 134, 'https://picsum.photos/seed/horizonte-binario/400/600',
   'Una inteligencia artificial y su creadora deciden juntas quién merece sobrevivir al colapso.',
   13, '2026-07-15', true, false, null),
  ('El Rugido del Motor', 110, 'https://picsum.photos/seed/rugido-del-motor/400/600',
   'Un piloto retirado vuelve a las carreras clandestinas para saldar una deuda familiar.',
   13, '2026-09-01', true, false, null),
  ('Corazones de Papel', 105, 'https://picsum.photos/seed/corazones-de-papel/400/600',
   'Dos editoriales rivales se enamoran mientras compiten por publicar la misma historia.',
   null, '2026-08-10', true, false, null),
  ('La Sombra que Espera', 121, 'https://picsum.photos/seed/sombra-que-espera/400/600',
   'Una detective vuelve a su pueblo natal para resolver el caso que la obligó a irse.',
   13, '2026-08-22', true, false, null),
  ('Mundo de Cristal', 95, 'https://picsum.photos/seed/mundo-de-cristal/400/600',
   'En un reino hecho de vidrio, una niña aprende que romperse no siempre es el final.',
   null, '2026-07-30', true, false, null),
  ('Voces del Silencio', 88, 'https://picsum.photos/seed/voces-del-silencio/400/600',
   'Un repaso íntimo por las últimas orquestas que todavía graban en cintas analógicas.',
   null, '2026-06-18', true, false, null),
  ('La Última Expedición', 128, 'https://picsum.photos/seed/ultima-expedicion/400/600',
   'Un equipo de rescate se adentra en la Antártida tras la señal de un explorador desaparecido.',
   13, '2026-09-10', true, false, null),
  ('Retorno del Vacío', 142, 'https://picsum.photos/seed/retorno-del-vacio/400/600',
   'La tripulación que sobrevivió al primer contacto tiene que volver al lugar donde todo empezó.',
   13, '2026-11-05', true, true, 4500),
  ('Proyecto Fantasma', 99, 'https://picsum.photos/seed/proyecto-fantasma/400/600',
   'Borrador de ficha todavía sin confirmar por distribución — no debe listarse en el catálogo público.',
   18, '2026-12-01', false, false, null);

-- ---------------------------------------------------------------------
-- Relación películas ↔ géneros
-- ---------------------------------------------------------------------

insert into public.pelicula_genero (pelicula_id, genero_id)
select p.id, g.id
from (values
  ('El Último Fotograma', 'Drama'),
  ('Sangre en la Sala 6', 'Terror'),
  ('Sangre en la Sala 6', 'Suspenso'),
  ('Risas de Medianoche', 'Comedia'),
  ('Horizonte Binario', 'Ciencia Ficción'),
  ('Horizonte Binario', 'Suspenso'),
  ('El Rugido del Motor', 'Acción'),
  ('El Rugido del Motor', 'Aventura'),
  ('Corazones de Papel', 'Romance'),
  ('Corazones de Papel', 'Drama'),
  ('La Sombra que Espera', 'Suspenso'),
  ('La Sombra que Espera', 'Drama'),
  ('Mundo de Cristal', 'Animación'),
  ('Mundo de Cristal', 'Aventura'),
  ('Mundo de Cristal', 'Comedia'),
  ('Voces del Silencio', 'Documental'),
  ('La Última Expedición', 'Aventura'),
  ('La Última Expedición', 'Acción'),
  ('Retorno del Vacío', 'Ciencia Ficción'),
  ('Retorno del Vacío', 'Acción'),
  ('Proyecto Fantasma', 'Terror')
) as m(pelicula_nombre, genero_nombre)
join public.peliculas p on p.nombre = m.pelicula_nombre
join public.generos g on g.nombre = m.genero_nombre;

-- ---------------------------------------------------------------------
-- Salas
-- ---------------------------------------------------------------------

insert into public.salas (nombre) values
  ('Sala 1'),
  ('Sala 2'),
  ('Sala 3 (VIP)'),
  ('Sala 4 (4D)');

-- ---------------------------------------------------------------------
-- Butacas
-- ---------------------------------------------------------------------

-- Sala 1 y Sala 2: layout clásico, 6 filas (A-F) x 10 butacas. Los
-- extremos de la fila A quedan como accesibles.
insert into public.butacas (sala_id, fila, numero, tipo, precio_adicional)
select s.id, chr(64 + fila.n), asiento.n,
  case when chr(64 + fila.n) = 'A' and asiento.n in (1, 10) then 'accesible' else 'normal' end,
  0
from public.salas s
cross join generate_series(1, 6) as fila(n)
cross join generate_series(1, 10) as asiento(n)
where s.nombre in ('Sala 1', 'Sala 2');

-- Sala 3 (VIP): 5 filas x 8 butacas. Filas D y E son VIP (con recargo);
-- los extremos de la fila A quedan como accesibles.
insert into public.butacas (sala_id, fila, numero, tipo, precio_adicional)
select s.id, chr(64 + fila.n), asiento.n,
  case
    when chr(64 + fila.n) in ('D', 'E') then 'vip'
    when chr(64 + fila.n) = 'A' and asiento.n in (1, 8) then 'accesible'
    else 'normal'
  end,
  case when chr(64 + fila.n) in ('D', 'E') then 1200 else 0 end
from public.salas s
cross join generate_series(1, 5) as fila(n)
cross join generate_series(1, 8) as asiento(n)
where s.nombre = 'Sala 3 (VIP)';

-- Sala 4 (4D): 4 filas x 8 butacas, todas con recargo por la experiencia
-- 4D; los extremos de la fila A quedan como accesibles.
insert into public.butacas (sala_id, fila, numero, tipo, precio_adicional)
select s.id, chr(64 + fila.n), asiento.n,
  case when chr(64 + fila.n) = 'A' and asiento.n in (1, 8) then 'accesible' else 'normal' end,
  600
from public.salas s
cross join generate_series(1, 4) as fila(n)
cross join generate_series(1, 8) as asiento(n)
where s.nombre = 'Sala 4 (4D)';

-- ---------------------------------------------------------------------
-- Funciones
-- ---------------------------------------------------------------------

-- Horarios de ejemplo para 3 días (17, 18 y 19 de septiembre de 2026),
-- con al menos 30 minutos de margen entre funciones de una misma sala
-- (la exclusion constraint `sin_solapamiento_por_sala` lo exige). No se
-- especifica `fin`: lo completa el trigger `calcular_fin_funcion` a partir
-- de `duracion_minutos`. Horario Argentina (UTC-3, sin DST).
insert into public.funciones (pelicula_id, sala_id, inicio, tipo_proyeccion, idioma, precio_base)
select p.id, s.id, v.inicio::timestamptz, v.tipo_proyeccion, v.idioma, v.precio_base::numeric
from (values
  -- Sala 1: matinée de animación + dos funciones de noche.
  ('Mundo de Cristal', 'Sala 1', '2026-09-17 12:00:00-03', '2D', 'castellano', 3600),
  ('El Último Fotograma', 'Sala 1', '2026-09-17 16:00:00-03', '2D', 'subtitulada', 3900),
  ('Risas de Medianoche', 'Sala 1', '2026-09-17 20:00:00-03', '2D', 'castellano', 3900),
  ('Mundo de Cristal', 'Sala 1', '2026-09-18 12:00:00-03', '2D', 'castellano', 3600),
  ('El Último Fotograma', 'Sala 1', '2026-09-18 16:00:00-03', '2D', 'subtitulada', 3900),
  ('Risas de Medianoche', 'Sala 1', '2026-09-18 20:00:00-03', '2D', 'castellano', 3900),
  ('Mundo de Cristal', 'Sala 1', '2026-09-19 12:00:00-03', '2D', 'castellano', 3600),
  ('El Último Fotograma', 'Sala 1', '2026-09-19 16:00:00-03', '2D', 'subtitulada', 3900),
  ('Risas de Medianoche', 'Sala 1', '2026-09-19 20:00:00-03', '2D', 'castellano', 3900),

  -- Sala 2: matinée de documental + suspenso a la tarde + terror (18+) a
  -- la noche.
  ('Voces del Silencio', 'Sala 2', '2026-09-17 12:30:00-03', '2D', 'castellano', 3600),
  ('La Sombra que Espera', 'Sala 2', '2026-09-17 17:00:00-03', '2D', 'subtitulada', 4000),
  ('Sangre en la Sala 6', 'Sala 2', '2026-09-17 21:30:00-03', '2D', 'castellano', 4000),
  ('Voces del Silencio', 'Sala 2', '2026-09-18 12:30:00-03', '2D', 'castellano', 3600),
  ('La Sombra que Espera', 'Sala 2', '2026-09-18 17:00:00-03', '2D', 'subtitulada', 4000),
  ('Sangre en la Sala 6', 'Sala 2', '2026-09-18 21:30:00-03', '2D', 'castellano', 4000),
  ('Voces del Silencio', 'Sala 2', '2026-09-19 12:30:00-03', '2D', 'castellano', 3600),
  ('La Sombra que Espera', 'Sala 2', '2026-09-19 17:00:00-03', '2D', 'subtitulada', 4000),
  ('Sangre en la Sala 6', 'Sala 2', '2026-09-19 21:30:00-03', '2D', 'castellano', 4000),

  -- Sala 3 (VIP): ciencia ficción y romance en 3D.
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-17 15:00:00-03', '3D', 'castellano', 5200),
  ('Horizonte Binario', 'Sala 3 (VIP)', '2026-09-17 19:00:00-03', '3D', 'subtitulada', 5200),
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-17 22:00:00-03', '3D', 'castellano', 5200),
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-18 15:00:00-03', '3D', 'castellano', 5200),
  ('Horizonte Binario', 'Sala 3 (VIP)', '2026-09-18 19:00:00-03', '3D', 'subtitulada', 5200),
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-18 22:00:00-03', '3D', 'castellano', 5200),
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-19 15:00:00-03', '3D', 'castellano', 5200),
  ('Horizonte Binario', 'Sala 3 (VIP)', '2026-09-19 19:00:00-03', '3D', 'subtitulada', 5200),
  ('Corazones de Papel', 'Sala 3 (VIP)', '2026-09-19 22:00:00-03', '3D', 'castellano', 5200),

  -- Sala 4 (4D): acción y aventura.
  ('La Última Expedición', 'Sala 4 (4D)', '2026-09-17 14:30:00-03', '4D', 'castellano', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-17 18:30:00-03', '4D', 'subtitulada', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-17 21:00:00-03', '4D', 'castellano', 6000),
  ('La Última Expedición', 'Sala 4 (4D)', '2026-09-18 14:30:00-03', '4D', 'castellano', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-18 18:30:00-03', '4D', 'subtitulada', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-18 21:00:00-03', '4D', 'castellano', 6000),
  ('La Última Expedición', 'Sala 4 (4D)', '2026-09-19 14:30:00-03', '4D', 'castellano', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-19 18:30:00-03', '4D', 'subtitulada', 6000),
  ('El Rugido del Motor', 'Sala 4 (4D)', '2026-09-19 21:00:00-03', '4D', 'castellano', 6000)
) as v(pelicula_nombre, sala_nombre, inicio, tipo_proyeccion, idioma, precio_base)
join public.peliculas p on p.nombre = v.pelicula_nombre
join public.salas s on s.nombre = v.sala_nombre;

-- ---------------------------------------------------------------------
-- Candy bar / combos
-- ---------------------------------------------------------------------

insert into public.categorias_producto (nombre) values
  ('Pochoclos'),
  ('Bebidas'),
  ('Golosinas'),
  ('Nachos y extras');

insert into public.productos (categoria_id, nombre, descripcion, precio, stock, activo)
select c.id, v.nombre, v.descripcion, v.precio::numeric, v.stock::integer, true
from (values
  ('Pochoclos', 'Pochoclos chico', 'Balde chico de pochoclos salados.', 1800, 200),
  ('Pochoclos', 'Pochoclos grande', 'Balde grande de pochoclos salados.', 2600, 200),
  ('Pochoclos', 'Pochoclos grande dulces', 'Balde grande de pochoclos dulces.', 2600, 150),
  ('Bebidas', 'Gaseosa chica', 'Vaso chico de gaseosa a elección.', 1500, 300),
  ('Bebidas', 'Gaseosa grande', 'Vaso grande de gaseosa a elección.', 2000, 300),
  ('Bebidas', 'Agua mineral', 'Botella de agua mineral 500ml.', 1200, 150),
  ('Nachos y extras', 'Nachos con queso', 'Nachos con salsa de queso cheddar.', 2400, 100),
  ('Nachos y extras', 'Nachos supremos', 'Nachos con queso, guacamole y jalapeños.', 2900, 100),
  ('Golosinas', 'Chocolate', 'Barra de chocolate importado.', 1000, 250),
  ('Golosinas', 'Golosina surtida', 'Bolsa de golosinas surtidas.', 900, 250)
) as v(categoria_nombre, nombre, descripcion, precio, stock)
join public.categorias_producto c on c.nombre = v.categoria_nombre;

insert into public.combos (nombre, descripcion, precio_fijo, destacado) values
  ('Combo Individual', 'Pochoclos chico + gaseosa chica.', 2800, true),
  ('Combo Pareja', 'Pochoclos grande + 2 gaseosas grandes.', 5800, true),
  ('Combo Nachos', 'Nachos supremos + gaseosa grande.', 4200, false);

insert into public.combo_items (combo_id, producto_id, cantidad)
select combo.id, producto.id, v.cantidad
from (values
  ('Combo Individual', 'Pochoclos chico', 1),
  ('Combo Individual', 'Gaseosa chica', 1),
  ('Combo Pareja', 'Pochoclos grande', 1),
  ('Combo Pareja', 'Gaseosa grande', 2),
  ('Combo Nachos', 'Nachos supremos', 1),
  ('Combo Nachos', 'Gaseosa grande', 1)
) as v(combo_nombre, producto_nombre, cantidad)
join public.combos combo on combo.nombre = v.combo_nombre
join public.productos producto on producto.nombre = v.producto_nombre;

-- ---------------------------------------------------------------------
-- Promos
-- ---------------------------------------------------------------------

insert into public.cupones (codigo, porcentaje, tipo, edad_minima, activo, fecha_inicio, fecha_fin) values
  ('BIENVENIDO10', 10, 'primera_compra', null, true, null, null),
  ('MAYOR18', 15, 'edad', 18, true, null, null),
  ('CINEVERANO', 20, 'general', null, true, '2026-12-01 00:00:00-03', '2027-02-28 23:59:59-03');
