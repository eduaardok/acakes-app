<div align="center">

<img src="frontend/public/og-image.jpg" alt="Ainoa's Cakes" width="100%" />

# ACakes — Sistema de gestión para Ainoa's Cakes

**Aplicación a medida desarrollada para Ainoa's Cakes**, pastelería de pasteles personalizados y temáticos en El Empalme, Ecuador. Centraliza la operación diaria del negocio (pedidos, clientes, productos e ingresos) y expone un catálogo público para que los clientes descubran productos y coticen por WhatsApp.

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](frontend)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](backend)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](backend)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](backend/prisma)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](frontend)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](frontend)

[![Estado](https://img.shields.io/badge/Estado-En_producción-2ea44f?style=flat-square)](https://ainoascakes.netlify.app/)
[![Uso](https://img.shields.io/badge/Uso-Privado%20%7C%20Cliente%20real-662889?style=flat-square)](#)
[![Demo](https://img.shields.io/badge/Demo-ainoascakes.netlify.app-db2777?style=flat-square&logo=netlify&logoColor=white)](https://ainoascakes.netlify.app/)

</div>

<br>

<img src="frontend/public/wordmark.png" alt="Ainoa's Cakes" width="220" />

## <img src="docs/icons/about.svg" width="20" height="20" valign="middle" /> Sobre el proyecto

ACakes es el software interno que usa **Ainoa's Cakes** para operar su taller de pastelería a diario. No es un menú de precios fijos: cada pastel se cotiza y confecciona a pedido, así que el sistema está construido alrededor de ese flujo real de negocio.

La app tiene dos capas:

| Capa | Para quién | Rutas |
|---|---|---|
| **Panel administrativo** | La dueña del negocio, desde el celular | `/panel`, `/panel/clientes`, `/panel/productos`, `/panel/ingresos`, `/panel/cuenta` |
| **Catálogo público** | Clientes finales | `/`, `/catalogo`, `/producto/:id`, `/mis-favoritos` |

- Los precios **nunca se muestran** en el catálogo público: la cotización siempre ocurre por WhatsApp.
- El catálogo se organiza por **temática/ocasión** (cumpleaños, quinceañeras, infantil, etc.), no por categoría genérica de producto.
- Cobertura y entrega: **El Empalme, Ecuador**.

- **Demo en producción**: [ainoascakes.netlify.app](https://ainoascakes.netlify.app/)
- **Repositorio**: [`github.com/eduaardok/acakes-app`](https://github.com/eduaardok/acakes-app)

## <img src="docs/icons/screenshots.svg" width="20" height="20" valign="middle" /> Capturas de pantalla

<div align="center">
<img src="docs/screenshot.png" alt="Panel de Pedidos — vista semanal" width="360" />

<sub><b>Panel de Pedidos</b> — vista semanal mobile-first, con estados por pedido (Borrador, Confirmado, En proceso, Listo, Entregado) y acceso rápido a crear un nuevo pedido.</sub>
</div>

## <img src="docs/icons/pedidos.svg" width="20" height="20" valign="middle" /> Funcionalidades principales

<table>
<tr>
<td width="34" align="center"><img src="docs/icons/pedidos.svg" width="24" height="24" /></td>
<td><b>Pedidos</b><br/>Crear pedido, ver detalle, actualizar estado. Vista diaria/semanal de operación del día y listados por cliente. Imágenes adjuntas por pedido.</td>
</tr>
<tr>
<td align="center"><img src="docs/icons/clientes.svg" width="24" height="24" /></td>
<td><b>Clientes</b><br/>Búsqueda con debounce, listado y detalle con historial. Observaciones manuales y automáticas (comportamiento, notas relevantes).</td>
</tr>
<tr>
<td align="center"><img src="docs/icons/productos.svg" width="24" height="24" /></td>
<td><b>Productos y categorías</b><br/>Catálogo interno de productos con imágenes (Supabase Storage), organizados por categoría/temática desde el panel.</td>
</tr>
<tr>
<td align="center"><img src="docs/icons/ingresos.svg" width="24" height="24" /></td>
<td><b>Ingresos</b><br/>Reporte por rango de fechas. Regla de negocio explícita: solo los pedidos en estado <code>ENTREGADO</code> cuentan como ingreso.</td>
</tr>
<tr>
<td align="center"><img src="docs/icons/catalogo.svg" width="24" height="24" /></td>
<td><b>Catálogo público</b><br/>Landing + catálogo navegable por temática/ocasión, favoritos (invitado o con cuenta), detalle de producto y cotización directa por WhatsApp. Sin precios visibles.</td>
</tr>
<tr>
<td align="center"><img src="docs/icons/seguridad.svg" width="24" height="24" /></td>
<td><b>Cuentas y seguridad</b><br/>Auth propia con JWT + bcrypt para el panel administrativo, y cuenta de cliente independiente (registro, login, recuperación de contraseña) para el catálogo.</td>
</tr>
</table>

## <img src="docs/icons/stack.svg" width="20" height="20" valign="middle" /> Stack tecnológico (y por qué)

- **Backend: Node.js + Express + TypeScript**
  API REST simple, predecible y rápida de iterar. TypeScript reduce bugs en cambios de reglas de negocio (transiciones de estado, filtros de ingresos, etc.).
- **ORM: Prisma**
  Tipado end-to-end en la capa de datos y migraciones controladas. Modelado claro de relaciones (Cliente → Pedidos → Observaciones, Producto → Categoría).
- **Base de datos: PostgreSQL (Supabase)**
  Postgres por consistencia/transacciones y queries estructuradas. Supabase como Postgres gestionado, con Storage para las imágenes de productos y pedidos.
- **Frontend: React + Vite + React Router**
  React para UI por estados y componentes reutilizables. Vite para DX rápida. Router para separar panel administrativo y catálogo público sin complejidad extra.
- **UI: Tailwind CSS**
  Iteración rápida en UI mobile-first sin depender de librerías de componentes, manteniendo consistencia visual con la identidad de marca.
- **Auth: JWT propio + bcrypt**
  Control explícito del flujo (login/logout, expiración, protección de rutas) sin vendor lock-in, con auth separada para panel y clientes.

## <img src="docs/icons/estructura.svg" width="20" height="20" valign="middle" /> Arquitectura del proyecto

Monorepo simple con dos apps:

```text
ACakes/
├── backend/
└── frontend/
```

### Backend (`backend/src`)

```text
backend/src/
├── routes/        → auth, clientes, pedidos, producto, categorias, usuariosCliente, public
├── controllers/    → auth, clientes, pedidos, producto, categoria, catalogo, interacciones, clienteAuth, pedidoImagenes
├── middleware/     → auth.middleware.ts, auth.cliente.middleware.ts, upload.middleware.ts
├── lib/            → prisma.ts (singleton), transiciones.ts, supabaseStorage.ts, mailer.ts, publicCache.ts
└── index.ts        → rutas públicas (/health, /auth, /public) y protegidas (/clientes, /pedidos, /productos)
```

### Frontend (`frontend/src`)

```text
frontend/src/
├── pages/          → Dashboard, Clientes, Productos, Categorias, Ingresos, Cuenta, DetallePedido, DetalleCliente...
├── public/          → Landing, Catalogo, ProductoDetalle, login/registro de cliente, favoritos
├── components/      → PedidoCard, BuscadorCliente, BottomNav, Layout, PrivateRoute...
├── hooks/           → usePedidosHoy, usePedido, useClientes, useCliente, useIngresos, useCatalogo...
└── lib/             → api.ts (wrapper fetch con JWT + manejo de 401)
```

## <img src="docs/icons/decisiones.svg" width="20" height="20" valign="middle" /> Decisiones técnicas destacadas

- **`verbatimModuleSyntax`** — Fuerza imports consistentes (`import type`) y evita ambigüedades entre tipos/valores en TS, especialmente en frontend.
- **Singleton de Prisma** — Una única instancia del cliente Prisma para evitar múltiples conexiones en desarrollo/hot reload.
- **Debounce en el buscador de clientes** — Reduce carga de requests y mejora la UX en mobile; exige mínimo de caracteres para evitar ruido.
- **Skeletons en cargas** — Mejor percepción de performance y layout estable vs. spinners genéricos.
- **JWT propio** — Control total sobre expiración, payload y manejo de 401 (redirección al login) sin dependencias "mágicas".
- **Fechas con `T00:00:00`** — Normalización al construir rangos (inicio/fin de día) para minimizar desfasajes por zona horaria al filtrar ingresos.
- **Sin precios en el catálogo público** — Regla de negocio aplicada de forma consistente en todo el código público; la cotización siempre pasa por WhatsApp.

## <img src="docs/icons/run.svg" width="20" height="20" valign="middle" /> Cómo correr localmente

### Requisitos

- Node.js (LTS recomendado)
- npm
- Una base Postgres accesible (por ejemplo un proyecto en **Supabase**)

### Variables de entorno

Crear un archivo `backend/.env` con valores reales:

```bash
# Backend
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
JWT_SECRET="cambia-esto-por-un-secreto-largo"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

Crear un archivo `frontend/.env`:

```bash
# Frontend
VITE_API_URL="http://localhost:3000"
```

### Instalar dependencias y ejecutar

Backend:

```bash
cd backend
npm install
npx prisma generate
# opcional si usas migraciones en tu entorno local:
# npx prisma migrate dev
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Notas operativas:
- Si el backend devuelve 401, el frontend maneja el caso y redirige al login.
- Si tu base devuelve decimales como string (común en ORMs/PG), el frontend normaliza para mostrar importes correctamente.

## <img src="docs/icons/deploy.svg" width="20" height="20" valign="middle" /> Deploy

Arquitectura de deploy en producción:

- **Supabase** — PostgreSQL gestionado (`DATABASE_URL`) y Storage para imágenes.
- **Railway** — backend (API Express)
  - Variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (apuntando al dominio de Netlify), `PORT` (si aplica).
  - Comandos: build `npm run build` y start `npm run start`.
- **Netlify** — frontend (Vite) → [ainoascakes.netlify.app](https://ainoascakes.netlify.app/)
  - Variable: `VITE_API_URL` apuntando al dominio del backend en Railway.
  - Build: `npm run build`, publish: `dist/`.

---

<div align="center">
<img src="frontend/public/logo.png" alt="Ainoa's Cakes" width="140" />

<sub>Desarrollado a medida para <b>Ainoa's Cakes</b> · El Empalme, Ecuador</sub>
</div>
