import { Router } from 'express'
import { getCatalogo, getProductoDetalle, getResenasProducto } from '../controllers/catalogo.controller'
import { registroCliente, loginCliente, olvidePassword, restablecerPassword } from '../controllers/clienteAuth.controller'
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
    getFavoritoProducto,
    favoritoProducto,
    unfavoritoProducto,
} from '../controllers/interacciones.controller'
import { authenticateClienteToken, optionalClienteToken } from '../middleware/auth.cliente.middleware'

const router = Router()

// ─── Públicas (sin auth) ────────────────────────────────
router.get('/catalogo', getCatalogo)
router.get('/producto/:id', getProductoDetalle)
router.get('/producto/:id/resenas', getResenasProducto)
router.post('/registro-cliente', registroCliente)
router.post('/login-cliente', loginCliente)
router.post('/olvide-password', olvidePassword)
router.post('/restablecer-password', restablecerPassword)

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
router.get('/producto/:id/favorito', optionalClienteToken, getFavoritoProducto)
router.post('/producto/:id/favorito', optionalClienteToken, favoritoProducto)
router.delete('/producto/:id/favorito', optionalClienteToken, unfavoritoProducto)

export default router
