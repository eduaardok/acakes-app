import { Router } from 'express'
import {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente,
    createObservacion,
    getUsuarioClienteDeCliente,
    vincularUsuarioCliente,
    desvincularUsuarioCliente
} from '../controllers/clientes.controller'

const router = Router()

router.get('/', getClientes)
router.get('/:id', getClienteById)
router.post('/', createCliente)
router.patch('/:id', updateCliente)
router.post('/:id/observaciones', createObservacion)

router.get('/:id/usuario-cliente', getUsuarioClienteDeCliente)
router.patch('/:id/vincular-usuario', vincularUsuarioCliente)
router.delete('/:id/vincular-usuario', desvincularUsuarioCliente)

export default router