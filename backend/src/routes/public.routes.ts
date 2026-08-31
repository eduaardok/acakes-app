import { Router } from 'express'
import { getCatalogo, getProductoDetalle } from '../controllers/catalogo.controller'
import { registroCliente, loginCliente } from '../controllers/clienteAuth.controller'
import {
    crearResena,
    misFavoritos,
    crearFechaEspecial,
    getFechasEspeciales,
    deleteFechaEspecial,
} from '../controllers/cliente.controller'
import {
    likeProducto,
    unlikeProducto,
    likeResena,
    unlikeResena,
    favoritoProducto,
    unfavoritoProducto,
} from '../controllers/interacciones.controller'
import { authenticateClienteToken, optionalClienteToken } from '../middleware/auth.cliente.middleware'

const router = Router()

// ─── Públicas (sin auth) ────────────────────────────────
router.get('/catalogo', getCatalogo)
router.get('/producto/:id', getProductoDetalle)
router.post('/registro-cliente', registroCliente)
router.post('/login-cliente', loginCliente)

// ─── Protegidas por JWT de cliente ──────────────────────
router.post('/producto/:id/resena', authenticateClienteToken, crearResena)
router.get('/mis-favoritos', authenticateClienteToken, misFavoritos)
router.post('/fechas-especiales', authenticateClienteToken, crearFechaEspecial)
router.get('/fechas-especiales', authenticateClienteToken, getFechasEspeciales)
router.delete('/fechas-especiales/:id', authenticateClienteToken, deleteFechaEspecial)

// ─── Interacciones anónimas o autenticadas (actorId) ────
router.post('/producto/:id/like', optionalClienteToken, likeProducto)
router.delete('/producto/:id/like', optionalClienteToken, unlikeProducto)
router.post('/resena/:id/like', optionalClienteToken, likeResena)
router.delete('/resena/:id/like', optionalClienteToken, unlikeResena)
router.post('/producto/:id/favorito', optionalClienteToken, favoritoProducto)
router.delete('/producto/:id/favorito', optionalClienteToken, unfavoritoProducto)

export default router
