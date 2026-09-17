-- Fase 1 (M02): RPC pública para el destacado "3 más vendidas" del catálogo.
--
-- `ventas`/`venta_items` son datos personales (RLS: cada usuario ve solo lo
-- propio, ver README sección "Esquema SQL versionado y RLS"). El catálogo
-- público necesita un ranking agregado de películas por entradas vendidas,
-- sin exponer ninguna fila de venta individual a un visitante anónimo. Se
-- resuelve con una función `security definer` que solo devuelve
-- `pelicula_id` + conteo, nunca datos de la venta en sí.
create or replace function public.obtener_peliculas_mas_vendidas(cantidad integer default 3)
returns table (pelicula_id uuid, entradas_vendidas bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.pelicula_id,
    count(*) as entradas_vendidas
  from public.venta_items vi
  join public.ventas v on v.id = vi.venta_id
  join public.funciones f on f.id = vi.funcion_id
  where vi.tipo_item = 'entrada'
    and vi.cancelado = false
    and v.estado = 'pagada'
  group by f.pelicula_id
  order by entradas_vendidas desc
  limit greatest(cantidad, 0);
$$;

grant execute on function public.obtener_peliculas_mas_vendidas(integer) to anon, authenticated;
