import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import clientesRoutes from './routes/clientes.routes'
import pedidosRoutes from './routes/pedidos.routes'
import { authenticateToken } from './middleware/auth.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
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

// Rutas protegidas (con auth)
app.use('/clientes', authenticateToken, clientesRoutes)
app.use('/pedidos', authenticateToken, pedidosRoutes)

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})