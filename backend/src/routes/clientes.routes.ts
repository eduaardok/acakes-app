import { Router } from 'express'
import {getClientes} from "../controllers/clientes.controller";

const router = Router()

// GET    /clientes        → Día 4
router.get('/', getClientes)

// GET    /clientes/:id    → Día 4
// POST   /clientes        → Día 4
// PATCH  /clientes/:id    → Día 4

export default router