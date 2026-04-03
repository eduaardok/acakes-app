import { Router } from 'express'
import {
    getPedidos,
    getPedidosHoy,
    getPedidoById,
    createPedido,
    updateEstadoPedido
} from '../controllers/pedidos.controller'
import { getIngresos } from "../controllers/pedidos.controller";

const router = Router()

router.get('/hoy', getPedidosHoy)
router.get('/', getPedidos)
router.get("/ingresos", getIngresos);
router.get('/:id', getPedidoById)
router.post('/', createPedido)
router.patch('/:id/estado', updateEstadoPedido)

export default router