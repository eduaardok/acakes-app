# ACakes — App de gestión de pedidos para una pastelería

Aplicación web para **gestionar pedidos y clientes** en una pastelería, con control de **estados**, **observaciones** y **ingresos**. Está pensada para uso real (mobile-first) y también como proyecto de portafolio orientado a entrevistas.

- **Repo**: `https://github.com/eduaardok/acakes-app`
- **Demo**: `https://ainoascakes.netlify.app/`

## Screenshot / GIF (placeholder)

> Placeholder: reemplazar por una captura/GIF real de la demo.
>
> `https://ainoascakes.netlify.app/` (Dashboard / flujo Nuevo Pedido)

## Stack tecnológico (y por qué)

- **Backend: Node.js + Express + TypeScript**
  - API REST simple, predecible y rápida de iterar.
  - TypeScript para reducir bugs en cambios de reglas de negocio (transiciones, filtros, etc.).
- **ORM: Prisma**
  - Tipado end-to-end en la capa de datos y migraciones controladas.
  - Modelado claro de relaciones (Cliente → Pedidos → Observaciones).
- **Base de datos: PostgreSQL (Supabase)**
  - PostgreSQL por consistencia/transacciones y queries estructuradas.
  - Supabase como Postgres gestionado, fácil de desplegar y mantener para un proyecto pequeño/mediano.
- **Frontend: React + Vite + React Router**
  - React para UI por estados y componentes reutilizables.
  - Vite para DX rápida (dev server/build).
  - Router para separar flujos (Login/Dashboard/Detalles) sin complejidad extra.
- **UI: Tailwind CSS**
  - Iteración rápida en UI mobile-first sin depender de librerías de componentes.
  - Permite consistencia visual con utilidades y componentes propios.
- **Auth: JWT propio + bcrypt**
  - Control explícito del flujo (login/logout, expiración, protección de rutas) sin vendor lock-in.
  - Suficiente para un escenario de “un dueño / un usuario” con endpoints protegidos.

## Funcionalidades principales

- **Pedidos**
  - Crear pedido, ver detalle, actualizar estado.
  - Vista diaria (operación del día) y listados por cliente.
- **Clientes**
  - Búsqueda, listado y detalle con historial.
  - Observaciones manuales (comportamiento, notas relevantes).
- **Estados de pedido**
  - Flujo explícito de estados (ej. BORRADOR → CONFIRMADO → EN_PROCESO → LISTO → ENTREGADO, con estados alternativos como CANCELADO / NO_RETIRADO).
  - Transiciones controladas para evitar estados inválidos.
- **Ingresos**
  - Reporte por rango de fechas.
  - Regla: **solo pedidos ENTREGADO cuentan como ingresos**.
- **Observaciones**
  - Registro asociado al cliente (manual y auto-generado según reglas).
  - Útil para contexto operativo sin “ensuciar” el pedido.

## Decisiones técnicas destacadas

- **`verbatimModuleSyntax`**
  - Fuerza imports consistentes (por ejemplo `import type`) y evita ambigüedades entre tipos/valores en TS, especialmente en frontend.
- **Singleton de Prisma**
  - Una única instancia del cliente Prisma para evitar múltiples conexiones en desarrollo/hot reload.
- **Debounce en el buscador de clientes**
  - Reduce carga de requests y mejora la UX en mobile; además exige mínimo de caracteres para evitar ruido.
- **Skeletons en cargas**
  - Mejor percepción de performance y layout estable vs. spinners genéricos.
- **JWT propio**
  - Control total sobre expiración, payload y manejo de 401 (redirección al login) sin dependencias “mágicas”.
- **Fechas con `T00:00:00`**
  - Normalización al construir rangos (inicio/fin de día) para minimizar desfasajes por zona horaria al filtrar ingresos.

## Arquitectura del proyecto

Monorepo simple con dos apps:

```text
ACakes/
├── backend/
└── frontend/
```

### Backend (`backend/src`)

```text
backend/src/
├── routes/        → auth.routes.ts, clientes.routes.ts, pedidos.routes.ts
├── controllers/   → auth, clientes, pedidos
├── middleware/    → auth.middleware.ts
├── lib/           → prisma.ts (singleton), transiciones.ts
└── index.ts       → rutas públicas (/health, /auth) y protegidas (/clientes, /pedidos)
```

### Frontend (`frontend/src`)

```text
frontend/src/
├── pages/         → Login, Dashboard, NuevoPedido, DetallePedido, Clientes, DetalleCliente, Ingresos
├── components/    → PedidoCard, BuscadorCliente, BottomNav, Layout, PrivateRoute
├── hooks/         → usePedidosHoy, usePedido, useClientes, useCliente, useClienteBusqueda, useIngresos
└── lib/           → api.ts (wrapper fetch con JWT + manejo de 401)
```

## Cómo correr localmente

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

## Deploy

Arquitectura de deploy esperada:

- **Supabase**: PostgreSQL gestionado (variable `DATABASE_URL` en el backend).
- **Railway**: backend (API Express)
  - Configurar variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (apuntando al dominio de Netlify), `PORT` (si aplica).
  - Comandos típicos: build `npm run build` y start `npm run start`.
- **Netlify**: frontend (Vite)
  - Variable: `VITE_API_URL` apuntando al dominio del backend en Railway.
  - Build: `npm run build`, publish: `dist/`.
