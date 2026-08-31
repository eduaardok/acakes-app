import { Router } from 'express'
import { buscarUsuariosCliente } from '../controllers/usuariosCliente.controller'

const router = Router()

router.get('/buscar', buscarUsuariosCliente)

export default router
