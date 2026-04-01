import { EstadoPedido } from '@prisma/client'

const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
    BORRADOR:    ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO:  ['EN_PROCESO', 'CANCELADO'],
    EN_PROCESO:  ['LISTO', 'CANCELADO'],
    LISTO:       ['ENTREGADO', 'NO_RETIRADO', 'CANCELADO'],
    ENTREGADO:   [],
    CANCELADO:   [],
    NO_RETIRADO: []
}

export function esTransicionValida(
    actual: EstadoPedido,
    nuevo: EstadoPedido
): boolean {
    return transicionesValidas[actual].includes(nuevo)
}