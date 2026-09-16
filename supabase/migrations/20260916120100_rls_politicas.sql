-- Fase 0.6 — Row Level Security
--
-- Criterio general:
-- - Catálogo público (películas, funciones, productos, combos, etc.):
--   lectura abierta a anon/authenticated de lo publicado/activo; ABM
--   reservado a rol 'admin'.
-- - Datos personales (ventas, entradas, pagos, ledgers de puntos/crédito,
--   notificaciones): el dueño lee lo propio; admin/empleado según
--   corresponda ven todo.
-- - Tablas transaccionales sensibles (ventas, venta_items, entradas, pagos,
--   reservas_butaca, movimientos_*, usos_qr, logs_actividad): sin políticas
--   de escritura para anon/authenticated en esta fase — se escriben desde
--   funciones RPC `security definer` (bloqueo de butacas en Fase 2, compra en
--   Fase 4, validación QR en Fase 6, cancelación en Fase 9), que corren con
--   privilegios propios y no dependen de RLS. Este archivo solo deja el
--   esquema de seguridad de base; esas RPC se agregan en cada fase futura.
-- - cupones: sin lectura pública masiva (solo admin) para no exponer códigos
--   vigentes por enumeración; la validación de un código puntual en el
--   checkout la hace el RPC de compra.

alter table public.perfiles enable row level security;
alter table public.peliculas enable row level security;
alter table public.generos enable row level security;
alter table public.pelicula_genero enable row level security;
alter table public.resenas enable row level security;
alter table public.salas enable row level security;
alter table public.butacas enable row level security;
alter table public.funciones enable row level security;
alter table public.reservas_butaca enable row level security;
alter table public.categorias_producto enable row level security;
alter table public.productos enable row level security;
alter table public.combos enable row level security;
alter table public.combo_items enable row level security;
alter table public.cupones enable row level security;
alter table public.ventas enable row level security;
alter table public.venta_items enable row level security;
alter table public.pagos enable row level security;
alter table public.entradas enable row level security;
alter table public.usos_qr enable row level security;
alter table public.recompensas enable row level security;
alter table public.canjes enable row level security;
alter table public.movimientos_puntos enable row level security;
alter table public.movimientos_credito enable row level security;
alter table public.alertas_estreno enable row level security;
alter table public.notificaciones enable row level security;
alter table public.logs_actividad enable row level security;

-- ---------------------------------------------------------------------
-- perfiles
-- ---------------------------------------------------------------------

create policy perfiles_select_propio on public.perfiles
  for select to authenticated
  using (id = auth.uid());

create policy perfiles_select_admin on public.perfiles
  for select to authenticated
  using (public.rol_actual() = 'admin');

create policy perfiles_update_propio on public.perfiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy perfiles_admin_todo on public.perfiles
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- Catálogo (M02/M03/M04/M06/M08)
-- ---------------------------------------------------------------------

create policy peliculas_select_publico on public.peliculas
  for select to anon, authenticated
  using (publicada = true or public.rol_actual() = 'admin');

create policy peliculas_admin_todo on public.peliculas
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy generos_select_publico on public.generos
  for select to anon, authenticated
  using (true);

create policy generos_admin_todo on public.generos
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy pelicula_genero_select_publico on public.pelicula_genero
  for select to anon, authenticated
  using (true);

create policy pelicula_genero_admin_todo on public.pelicula_genero
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy resenas_select_publico on public.resenas
  for select to anon, authenticated
  using (true);

create policy resenas_insert_propio on public.resenas
  for insert to authenticated
  with check (usuario_id = auth.uid());

create policy resenas_update_propio on public.resenas
  for update to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy resenas_delete_propio on public.resenas
  for delete to authenticated
  using (usuario_id = auth.uid());

create policy resenas_admin_moderacion on public.resenas
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy salas_select_publico on public.salas
  for select to anon, authenticated
  using (true);

create policy salas_admin_todo on public.salas
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy butacas_select_publico on public.butacas
  for select to anon, authenticated
  using (activa = true or public.rol_actual() = 'admin');

create policy butacas_admin_todo on public.butacas
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy funciones_select_publico on public.funciones
  for select to anon, authenticated
  using (estado <> 'cancelada' or public.rol_actual() in ('admin', 'empleado'));

create policy funciones_admin_todo on public.funciones
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- Lectura pública para pintar el mapa de butacas en tiempo real; la
-- escritura (bloqueo/liberación) se hace vía RPC en la Fase 2, no queda
-- policy de insert/update/delete para anon/authenticated acá.
create policy reservas_butaca_select_publico on public.reservas_butaca
  for select to anon, authenticated
  using (true);

create policy categorias_producto_select_publico on public.categorias_producto
  for select to anon, authenticated
  using (true);

create policy categorias_producto_admin_todo on public.categorias_producto
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy productos_select_publico on public.productos
  for select to anon, authenticated
  using (activo = true or public.rol_actual() = 'admin');

create policy productos_admin_todo on public.productos
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy combos_select_publico on public.combos
  for select to anon, authenticated
  using (activo = true or public.rol_actual() = 'admin');

create policy combos_admin_todo on public.combos
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy combo_items_select_publico on public.combo_items
  for select to anon, authenticated
  using (true);

create policy combo_items_admin_todo on public.combo_items
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy recompensas_select_publico on public.recompensas
  for select to anon, authenticated
  using (activo = true or public.rol_actual() = 'admin');

create policy recompensas_admin_todo on public.recompensas
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- Sin lectura pública: evita permitir "adivinar"/listar códigos vigentes.
create policy cupones_admin_todo on public.cupones
  for all to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- Venta (M05/M09) — solo lectura de lo propio; toda escritura vía RPC
-- ---------------------------------------------------------------------

create policy ventas_select_propio on public.ventas
  for select to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() in ('admin', 'empleado'));

create policy venta_items_select_propio on public.venta_items
  for select to authenticated
  using (
    exists (
      select 1 from public.ventas v
      where v.id = venta_items.venta_id and v.usuario_id = auth.uid()
    )
    or public.rol_actual() in ('admin', 'empleado')
  );

create policy pagos_select_propio on public.pagos
  for select to authenticated
  using (
    exists (
      select 1 from public.ventas v
      where v.id = pagos.venta_id and v.usuario_id = auth.uid()
    )
    or public.rol_actual() in ('admin', 'empleado')
  );

create policy entradas_select_propio on public.entradas
  for select to authenticated
  using (
    exists (
      select 1 from public.venta_items vi
      join public.ventas v on v.id = vi.venta_id
      where vi.id = entradas.venta_item_id and v.usuario_id = auth.uid()
    )
    or public.rol_actual() in ('admin', 'empleado')
  );

-- Trazabilidad de escaneos: sin lectura para el cliente, solo auditoría.
create policy usos_qr_select_admin on public.usos_qr
  for select to authenticated
  using (public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- Fidelización (M08)
-- ---------------------------------------------------------------------

create policy canjes_select_propio on public.canjes
  for select to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'admin');

create policy movimientos_puntos_select_propio on public.movimientos_puntos
  for select to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'admin');

create policy movimientos_credito_select_propio on public.movimientos_credito
  for select to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- Alertas / notificaciones (M11)
-- ---------------------------------------------------------------------

create policy alertas_estreno_propio on public.alertas_estreno
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy notificaciones_select_propio on public.notificaciones
  for select to authenticated
  using (usuario_id = auth.uid());

-- El trigger trg_notificaciones_proteger_contenido limita esto a marcar
-- `leida`; no se puede reescribir título/mensaje/tipo desde el cliente.
create policy notificaciones_update_propio on public.notificaciones
  for update to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- ---------------------------------------------------------------------
-- Auditoría (M13)
-- ---------------------------------------------------------------------

create policy logs_actividad_select_admin on public.logs_actividad
  for select to authenticated
  using (public.rol_actual() = 'admin');
