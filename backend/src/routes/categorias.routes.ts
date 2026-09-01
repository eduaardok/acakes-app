import { Router } from 'express'
import {
    listarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    resolverCategoria,
} from '../controllers/categoria.controller'

const router = Router()

router.get('/tematicas', listarCategorias('tematica'))
router.post('/tematicas', crearCategoria('tematica'))
router.post('/tematicas/resolver', resolverCategoria('tematica'))
router.patch('/tematicas/:id', actualizarCategoria('tematica'))
router.delete('/tematicas/:id', eliminarCategoria('tematica'))

router.get('/ocasiones', listarCategorias('ocasion'))
router.post('/ocasiones', crearCategoria('ocasion'))
router.post('/ocasiones/resolver', resolverCategoria('ocasion'))
router.patch('/ocasiones/:id', actualizarCategoria('ocasion'))
router.delete('/ocasiones/:id', eliminarCategoria('ocasion'))

export default router
