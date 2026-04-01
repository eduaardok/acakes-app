import { Router } from 'express'
import {
    getPedidos,
    getPedidosHoy,
    getPedidoById,
    createPedido
} from '../controllers/pedidos.controller'

const router = Router()

router.get('/hoy', getPedidosHoy)
router.get('/', getPedidos)
router.get('/:id', getPedidoById)
router.post('/', createPedido)

export default router