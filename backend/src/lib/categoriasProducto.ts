// Helpers compartidos entre producto.controller.ts, catalogo.controller.ts y
// cliente.controller.ts para la relación muchos-a-muchos Producto<->Tematica/Ocasion
// (tablas puente ProductoTematica/ProductoOcasion).

export interface CategoriaPlana {
    id: string
    nombre: string
}

export const includeCategorias = {
    tematicas: { include: { tematica: { select: { id: true, nombre: true } } } },
    ocasiones: { include: { ocasion: { select: { id: true, nombre: true } } } },
} as const

interface ProductoConCategoriasCrudas {
    tematicas: { tematica: CategoriaPlana }[]
    ocasiones: { ocasion: CategoriaPlana }[]
    [key: string]: unknown
}

// Convierte la forma cruda que sale de Prisma ({ tematicas: [{ tematica: {id,nombre} }] })
// a la forma plana que consume el frontend ({ tematicas: [{id,nombre}] }).
export function aplanarCategorias<T extends ProductoConCategoriasCrudas>(producto: T) {
    const { tematicas, ocasiones, ...resto } = producto
    return {
        ...resto,
        tematicas: tematicas.map((t) => t.tematica),
        ocasiones: ocasiones.map((o) => o.ocasion),
    }
}

// Body de create/update puede llegar como array real (JSON) o como string
// JSON-encodeado (multipart/form-data no soporta arrays nativos en FormData.set).
export function parseIdsInput(value: unknown): string[] | undefined {
    if (value === undefined) return undefined
    if (Array.isArray(value)) {
        return value.map(String).map((v) => v.trim()).filter(Boolean)
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return []
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
                return parsed.map(String).map((v) => v.trim()).filter(Boolean)
            }
        } catch {
            // no era JSON — se ignora, cae al fallback de abajo
        }
        return [trimmed]
    }
    return []
}
