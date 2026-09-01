import { Router } from 'express'
import {
    getPedidos,
    getPedidosHoy,
    getPedidoById,
    createPedido,
    updatePedido,
    updateEstadoPedido
} from '../controllers/pedidos.controller'
import { getIngresos } from "../controllers/pedidos.controller";
import {
    addImagenReferenciaPedido,
    getImagenesPedido,
    deleteImagenReferenciaPedido,
} from '../controllers/pedidoImagenes.controller'
import { uploadImagen, manejarErrorUpload } from '../middleware/upload.middleware'

const router = Router()

router.get('/hoy', getPedidosHoy)
router.get('/', getPedidos)
router.get("/ingresos", getIngresos);
router.get('/:id', getPedidoById)
router.post('/', createPedido)
router.patch('/:id/estado', updateEstadoPedido)
router.patch('/:id', updatePedido)

router.get('/:id/imagenes', getImagenesPedido)
router.post('/:id/imagenes', uploadImagen.single('imagen'), manejarErrorUpload, addImagenReferenciaPedido)
router.delete('/:id/imagenes/:imagenId', deleteImagenReferenciaPedido)

export default router