import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes'
import clientesRoutes from './routes/clientes.routes'
import pedidosRoutes from './routes/pedidos.routes'
import productoRoutes from './routes/producto.routes'
import categoriasRoutes from './routes/categorias.routes'
import publicRoutes from './routes/public.routes'
import usuariosClienteRoutes from './routes/usuariosCliente.routes'
import { authenticateToken } from './middleware/auth.middleware'
import { iniciarCronNotificaciones } from './jobs/notificarFechasEspeciales'
import { auditLogMiddleware } from './middleware/auditLog.middleware'

const app = express()
app.set('trust proxy', 1)
const PORT = Number(process.env.PORT) || 3000;

// crossOriginResourcePolicy en "cross-origin": por default helmet bloquea
// que otros orígenes (ej. el frontend en Netlify) carguen recursos servidos
// acá — pero las imágenes reales viven en Supabase Storage, no en este
// servidor, así que esto solo evita falsos bloqueos si algo se sirve local.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000",
        "https://calm-squirrel-5232fd.netlify.app", "https://ainoascakes.netlify.app"],
    credentials: true,
}));
app.use(express.json())

// Rutas públicas (sin auth)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor de pastelería funcionando',
        timestamp: new Date().toISOString()
    })
})
app.use('/auth', auditLogMiddleware, authRoutes)

// Rutas protegidas (con auth) — ADMIN, privadas, JWT con role: 'admin'
app.use('/clientes', authenticateToken, auditLogMiddleware, clientesRoutes)
app.use('/pedidos', authenticateToken, auditLogMiddleware, pedidosRoutes)
app.use('/productos', authenticateToken, auditLogMiddleware, productoRoutes)
app.use('/categorias', authenticateToken, auditLogMiddleware, categoriasRoutes)
app.use('/usuarios-cliente', authenticateToken, auditLogMiddleware, usuariosClienteRoutes)

// Capa pública (catálogo + interacciones de clientes) — JWT con role: 'cliente',
// completamente separada de las rutas de admin de arriba (ver auth.cliente.middleware.ts)
app.use('/api/public', publicRoutes)

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' })
})

app.listen(PORT,"0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

iniciarCronNotificaciones()
