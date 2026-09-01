import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import clientesRoutes from './routes/clientes.routes'
import pedidosRoutes from './routes/pedidos.routes'
import productoRoutes from './routes/producto.routes'
import categoriasRoutes from './routes/categorias.routes'
import publicRoutes from './routes/public.routes'
import usuariosClienteRoutes from './routes/usuariosCliente.routes'
import { authenticateToken } from './middleware/auth.middleware'
import { iniciarCronNotificaciones } from './jobs/notificarFechasEspeciales'
// import {prisma} from './lib/prisma'
// // Smoke test — borra esto después
// async function testDB() {
//     const count = await prisma.cliente.count()
//     console.log(`✅ Conexión OK — Clientes en DB: ${count}`)
// }
// testDB()

const app = express()
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000","http://192.168.1.9:5173","http://192.168.1.14:5173",
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
app.use('/auth', authRoutes)

// Rutas protegidas (con auth) — ADMIN, privadas, JWT con role: 'admin'
app.use('/clientes', authenticateToken, clientesRoutes)
app.use('/pedidos', authenticateToken, pedidosRoutes)
app.use('/productos', authenticateToken, productoRoutes)
app.use('/categorias', authenticateToken, categoriasRoutes)
app.use('/usuarios-cliente', authenticateToken, usuariosClienteRoutes)

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