import { Router } from 'express'
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    addImagenesProducto,
    deleteImagenProducto,
    deleteProducto,
} from '../controllers/producto.controller'
import { uploadImagen, manejarErrorUpload } from '../middleware/upload.middleware'

const router = Router()

const MAX_IMAGENES_POR_PRODUCTO = 8

router.get('/', getProductos)
router.get('/:id', getProductoById)
router.post('/', uploadImagen.array('imagenes', MAX_IMAGENES_POR_PRODUCTO), manejarErrorUpload, createProducto)
router.patch('/:id', updateProducto)
router.post(
    '/:id/imagenes',
    uploadImagen.array('imagenes', MAX_IMAGENES_POR_PRODUCTO),
    manejarErrorUpload,
    addImagenesProducto
)
router.delete('/:id/imagenes/:imagenId', deleteImagenProducto)
router.delete('/:id', deleteProducto)

export default router
