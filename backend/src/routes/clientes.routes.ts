import { Router } from 'express'
import {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente,
    createObservacion
} from '../controllers/clientes.controller'

const router = Router()

router.get('/', getClientes)
router.get('/:id', getClienteById)
router.post('/', createCliente)
router.patch('/:id', updateCliente)
router.post('/:id/observaciones', createObservacion)

export default router