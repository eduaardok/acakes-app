import { Router } from 'express'
import {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente
} from '../controllers/clientes.controller'

const router = Router()

router.get('/', getClientes)
router.get('/:id', getClienteById)
router.post('/', createCliente)
router.patch('/:id', updateCliente)

export default router