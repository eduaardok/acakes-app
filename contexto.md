# Contexto del proyecto — Pastelería App

Soy desarrollador intermedio construyendo una app web de gestión de pedidos para una pastelería. Es un proyecto de portafolio real que también se usará en producción.

## Stack

- **Backend:** Node.js + Express + TypeScript + Prisma + PostgreSQL (Supabase)
- **Frontend:** React + Vite + Tailwind
- **Auth:** JWT propio con bcrypt
- **Deploy:** Railway (backend) + Vercel (frontend)

## Estructura del backend

```
backend/src/
├── routes/        → auth.routes.ts, clientes.routes.ts, pedidos.routes.ts
├── controllers/   → auth, clientes, pedidos
├── middleware/    → auth.middleware.ts
├── lib/           → prisma.ts (singleton pattern), transiciones.ts
└── index.ts       → rutas públicas (/health, /auth) y protegidas (/clientes, /pedidos)
```

## Estructura del frontend

```
frontend/src/
├── pages/         → Login, Dashboard, NuevoPedido, DetallePedido, Clientes, DetalleCliente, Ingresos
├── components/    → PedidoCard, BuscadorCliente, BottomNav, Layout, PrivateRoute
├── hooks/         → usePedidosHoy, usePedido, useClientes, useCliente, useClienteBusqueda, useIngresos
└── lib/           → api.ts (fetch wrapper con JWT y manejo de 401)
```

## Entidades del sistema

- **Usuario** (solo para auth, un único usuario dueño del negocio)
- **Cliente** (nombre, teléfono, email opcional)
- **Pedido** (cliente FK, descripción, precio, fecha entrega, estado, notas)
- **Observación** (cliente FK, tipo, descripción, fecha, auto_generada)

## Estados del pedido (enum)

```
BORRADOR → CONFIRMADO → EN_PROCESO → LISTO → ENTREGADO
                                            → CANCELADO
                                            → NO_RETIRADO
```

## Tipos de observación (enum)

`PAGO_TARDIO`, `NO_RETIRO`, `CANCELACION_TARDE`, `POSITIVA`, `OTRO`

## Reglas de negocio clave

- Al pasar un pedido a `NO_RETIRADO` → crear Observación automáticamente con `autoGenerada: true`
- No se eliminan registros, solo se cambia estado
- Solo pedidos en `ENTREGADO` cuentan como ingresos
- El endpoint de ingresos filtra por `actualizadoEn` con fechas en formato `T00:00:00` / `T23:59:59` para evitar desfase de zona horaria

## Decisiones técnicas tomadas

- `api.ts` usa función genérica `request<T>` con manejo de 401 y redirección automática a `/login`
- `estadoConfig` en `PedidoCard.tsx` usa `as const` sin `Record<EstadoPedido, ...>` para evitar conflictos con `verbatimModuleSyntax`
- Los tipos usados solo como tipo (interfaces, enums) se importan con `import type` por requerimiento de `verbatimModuleSyntax`
- Solo pedidos en `ENTREGADO` cuentan como ingresos
- Skeletons en lugar de spinner para el estado de carga del Dashboard
- Botón de recarga con SVG inline en el header, sin librerías de íconos
- SVGs de íconos siempre inline, sin librerías externas
- `precio.toFixed()` siempre envuelto en `Number()` porque Prisma devuelve decimales como string
- El buscador de clientes usa debounce de 350ms y requiere mínimo 2 caracteres para buscar
- El parámetro de búsqueda de clientes es `q` (ej: `GET /clientes?q=Maria`)
- Bottom nav con 3 tabs (Pedidos, Clientes, Ingresos) + botón Salir como cuarto elemento con `flex-1`
- El botón flotante `+` vive en el componente `Layout`, no en cada página
- Rutas con bottom nav usan `PrivateLayout` (incluye `Layout`); rutas de detalle usan `PrivateRoute` simple
- Logout movido a la `BottomNav` como cuarto botón discreto

## Plan de desarrollo — 25 días, 1–2 horas diarias

- **Semana 1** (días 1–7): Setup + API + Auth JWT ✅
- **Semana 2** (días 8–14): Frontend + Login + flujo core ✅
- **Semana 3** (días 15–21): Clientes, historial, ingresos ✅
- **Semana 4** (días 22–25): Deploy + README + portafolio

---

## Estado actual — Días 1 al 21 completados

### Backend (completo)
- Servidor Express corriendo con TypeScript
- Conexión a Supabase funcionando
- Schema de Prisma con todos los modelos y relaciones
- Endpoints GET y POST de clientes y pedidos funcionando
- Lógica de transición de estados y observaciones automáticas implementada
- Autenticación JWT con bcrypt funcionando
- Endpoint de ingresos por rango de fechas implementado

### Frontend (completo)
- React + Vite + Tailwind + React Router configurado
- Login real funcionando end-to-end con token JWT
- Dashboard con vista diaria de pedidos, skeletons, estado vacío y botón de recarga
- PedidoCard con chips de color por estado y tap targets mobile
- Formulario NuevoPedido con búsqueda de cliente en tiempo real y creación inline
- DetallePedido con cambio de estado en un tap y botón contextual por estado
- Página Clientes con buscador y lista
- DetalleCliente con historial de pedidos, observaciones, badge de comportamiento y formulario de observación manual
- Página Ingresos con selector de rango (Hoy / 7 días / Este mes / Personalizado) y lista de pedidos entregados
- Bottom nav fija con tabs Pedidos, Clientes, Ingresos y botón Salir
- Botón flotante `+` para nuevo pedido visible en todas las páginas principales
- Probado en iPhone con datos reales
- Estructura completa en GitHub

---

## Pendientes solicitados por el cliente (a implementar en Cursor)

### 1. Crear cliente sin necesidad de crear un pedido
Actualmente solo se puede crear un cliente desde el formulario de nuevo pedido. Se debe agregar la opción de crear un cliente directamente desde la pantalla de Clientes.

**Implementación sugerida:**
- Agregar un botón `+` en la página `Clientes.tsx` (en el header o como botón flotante secundario)
- Reutilizar el formulario inline de `BuscadorCliente` o crear una página/modal `NuevoCliente.tsx`
- Al guardar, redirigir al detalle del cliente recién creado

### 2. Visualización de pedidos de otros días
Actualmente el Dashboard solo muestra pedidos del día actual (`GET /pedidos/hoy`). El cliente quiere poder ver pedidos de cualquier fecha.

**Implementación sugerida:**
- Agregar un selector de fecha en el Dashboard (o una vista separada)
- Usar el endpoint existente `GET /pedidos?fecha=YYYY-MM-DD` que ya filtra por fecha
- Opciones de visualización: selector de fecha con flechas anterior/siguiente, o tabs (Hoy / Esta semana / Todos)
- Considerar también mostrar un resumen por día (cuántos pedidos hay en cada fecha próxima)

---

## Semana 4 — Deploy + Portafolio

### Día 22–23 — Despliegue en producción (~3h)
- Backend en Railway con variables de entorno
- Frontend en Vercel con `VITE_API_URL` apuntando a Railway
- Probar flujo completo en producción desde iPhone
- Commit: `chore: configuración para producción`
- **ENTREGABLE:** URL real en producción con HTTPS

### Día 24–25 — README y portafolio (~2h)
- README con descripción, stack justificado, decisiones técnicas
- Sección de cómo correr localmente
- Link al demo en vivo y capturas del iPhone
- Commit: `docs: README completo con decisiones técnicas y demo`
- **ENTREGABLE:** Proyecto listo para mostrar en entrevistas

---

## Cómo actuar

Eres mi mentor técnico. Guíame paso a paso por el día indicado. No agregues librerías ni patrones fuera del stack definido. No te adelantes a días siguientes.

---

## Skills de Claude Code instalados (diseño y animación)

Skills comunitarios (no oficiales de Anthropic) instalados en `.claude/skills/` para mejorar el pulido visual y las animaciones del panel de admin y, más adelante, de la UI pública (`/catalogo`, `/producto/:id`).

| Skill | Repo | Qué cubre | Instalado con |
|---|---|---|---|
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (64k+ stars, activo) | Lenguaje de diseño general: 23 comandos (`polish`, `critique`, `audit`, `bolder`, `quieter`, `layout`, `animate`, etc.), detección de anti-patrones de "AI slop" (gradientes genéricos, cards anidadas, etc.), accesibilidad y responsive. | `npm install --no-save --prefix <tmp> impeccable@latest` seguido de `node <tmp>/node_modules/impeccable/cli/bin/cli.js install --providers=claude --scope=project --yes` |
| `animate` | [delphi-ai/animate-skill](https://github.com/delphi-ai/animate-skill) | Patrones de animación para React basados en el curso de Emil Kowalski (animations.dev): easing/timing, CSS transitions, Framer Motion (layoutId, AnimatePresence, stagger), reglas de accesibilidad (`prefers-reduced-motion`) y performance (solo animar `transform`/`opacity`). | `npx -y skills add https://github.com/delphi-ai/animate-skill --skill animate --agent claude-code` (usa el paquete `skills` de vercel-labs) |

Notas:
- Se evaluó también `emilkowalski/skills` (skill `emil-design-eng`, 33k+ stars) pero se descartó por redundancia: cubre la misma filosofía de animación que `animate-skill` (ambos basados en el curso de Emil Kowalski) sin aportar algo que `impeccable` + `animate` no cubran ya.
- `impeccable` instaló además un hook local en `.claude/settings.local.json` (corre su detector de anti-patrones después de editar archivos de UI). Ese archivo es local por máquina y está en `.gitignore` — si se reinstala en otra máquina, el hook se vuelve a generar solo.
- `skills-lock.json` (raíz del repo) registra el hash del skill `animate` instalado vía `skills add`, para poder verificar/actualizar más adelante con `npx skills update`.
- Ambos skills se activan automáticamente por descripción (trigger semántico) cuando se pide diseño, rediseño, pulido visual o animaciones — no hace falta invocarlos por nombre.
- Reinstalación en otra máquina: correr los dos comandos de la columna "Instalado con" desde la raíz del repo.

---

## Cron de notificaciones por email (FechaEspecial)

Job diario (`backend/src/jobs/notificarFechasEspeciales.ts`, registrado en `index.ts` vía `iniciarCronNotificaciones()`) que revisa `FechaEspecial` y envía un recordatorio por email cuando la fecha está a 7 días o menos.

- Envío por Gmail SMTP con `nodemailer` (`backend/src/lib/mailer.ts`), cuenta dedicada. Credenciales en `SMTP_USER` / `SMTP_PASS` (ver `backend/.env.example`) — **configurar manualmente en las variables de entorno de Render**, no se versionan valores reales. `SMTP_PASS` es un App Password de Gmail, no la contraseña normal de la cuenta.
- Scheduling con `node-cron`, expresión `0 13 * * *` (13:00 UTC = 8:00 AM Ecuador, UTC-5 sin horario de verano).
- El rango "próximo" (fecha entre ahora y ahora+7 días) se calcula al vuelo en cada corrida, no se persiste ningún estado intermedio.
- `notificadoEmail` solo se marca `true` tras un envío exitoso; si el envío falla se deja en `false` para reintentar al día siguiente, y el error se loguea sin detener el resto del batch (falla por registro, no por corrida completa).

**Riesgo de cold start en Render (free tier) — sin resolver, pendiente de decisión:**
Render duerme el proceso tras ~15 min de inactividad y tarda 30-60s en despertar con el primer tráfico entrante. El cron (`node-cron`) corre dentro del mismo proceso Node del servidor Express, así que si el proceso está dormido a las 8:00 AM (sin tráfico previo), el cron simplemente no dispara — no hay nada que lo "despierte" a esa hora. Esto puede hacer que el recordatorio no se envíe algunos días. No se implementó ninguna mitigación (ej. un servicio externo de ping tipo cron-job.org/UptimeRobot para mantener el proceso despierto, o mover el cron a un servicio externo) porque implica una decisión de infraestructura fuera del alcance de esta tarea. Si el problema se confirma en producción, evaluar alguna de esas opciones.