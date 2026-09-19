import { Router } from 'express'
import {
    listarUsuarios,
    crearUsuario,
    cambiarRoleUsuario,
    eliminarUsuario,
    listarCuentasCliente,
    eliminarCuentaCliente,
} from '../controllers/admin.controller'

const router = Router()

// Gestión de Usuario (admin / system admin). El gate de SYSTEM_ADMIN y la
// auditoría se montan en index.ts, para todo el router de una.
router.get('/usuarios', listarUsuarios)
router.post('/usuarios', crearUsuario)
router.patch('/usuarios/:id/role', cambiarRoleUsuario)
router.delete('/usuarios/:id', eliminarUsuario)

// Gestión de UsuarioCliente: cuentas del catálogo público, modelo distinto
// de Usuario y con su propio ciclo de vida.
router.get('/clientes-cuenta', listarCuentasCliente)
router.delete('/clientes-cuenta/:id', eliminarCuentaCliente)

export default router
