# progIV-cine

Sistema web integral de gestión y comercialización de un cine, desarrollado
como TP de Programación IV. Permite administrar películas, salas, funciones,
butacas, productos del Candy Bar, promociones y fidelización; vender entradas
y productos (de forma anónima o registrada); y validar los consumos de forma
presencial mediante QR.

El análisis funcional completo (requisitos, casos de uso, reglas de negocio y
modelo de datos) es la fuente de verdad sobre **qué** hace el sistema. Este
README documenta el **cómo**: arquitectura técnica, decisiones de diseño y el
porqué de cada una.

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
análisis (catálogo, salas y butacas, checkout, fidelización, tickets,
cancelaciones, próximamente, perfil, empleado, admin) y agrupa **todo** lo que
esa feature necesita: sus componentes, sus servicios de dominio, sus modelos y
sus rutas.

### Por qué organizar por *feature* y no por *tipo técnico*

Una alternativa común es tener carpetas globales `/components`, `/services`,
`/pipes`, `/models` en la raíz de `src/app`. Deliberadamente **no** se eligió
ese esquema, por tres razones concretas:

1. **Lo que cambia junto, vive junto.** Cuando se trabaja en el checkout, todo
   lo relevante (el carrito, el formulario de cupón, el servicio de ventas, el
   modelo `Venta`) está en una sola carpeta. Con carpetas por tipo técnico, el
   mismo trabajo obliga a saltar entre `/components/checkout-cart`,
   `/services/ventas.service.ts`, `/models/venta.model.ts`, etc.
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
en todo el proyecto. Sin embargo, no se descarta usar `NgModule` cuando una
feature concentra muchos componentes/pipes/directivas fuertemente
relacionados entre sí (por ejemplo `checkout/` o `admin/`, que van a tener
varios subcomponentes que solo tienen sentido juntos). En esos casos, agrupar
en un módulo de feature evita repetir la misma lista de imports en cada
componente standalone del dominio. La decisión se toma **feature por
feature**, según cuánto se beneficie esa carpeta en particular — no es una
regla global de "todo módulo" ni "todo standalone".

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

### Concurrencia y validación de negocio en el backend

Reglas críticas como "no vender la misma butaca dos veces" o "no solapar
funciones en una sala" **no** se validan solo en el frontend: se resuelven con
funciones/RPC en PostgreSQL (Supabase) dentro de una transacción, de modo que
el estado visual del cliente sea una ayuda a la UX pero nunca la única barrera
de integridad.

## Diseño visual

Paleta oscura/nocturna con motivos de cine (proyección, cinta de película,
marquesina), definida como design tokens en SCSS propios — sin librería de
componentes de por medio, para lograr una identidad visual propia en vez de
una interfaz genérica.

## Desarrollo

```bash
npm install
npm start      # ng serve
npm test       # vitest
```

## Estado del proyecto

El desarrollo avanza en fases incrementales documentadas en `CHANGELOG.md`.
Cada fase corresponde a uno o más módulos funcionales del análisis.
