// Cache en memoria para los endpoints públicos de mayor tráfico — mitiga la
// latencia Render (Virginia) <-> Supabase (São Paulo) sin agregar Redis ni
// infraestructura nueva. Instancias separadas por TTL/dominio para poder
// invalidar el catálogo sin tocar el cache de detalle de producto.
import { TtlCache } from './ttlCache'

const NOVENTA_SEGUNDOS = 90_000

export const catalogoCache = new TtlCache<unknown>(NOVENTA_SEGUNDOS)
export const productoDetalleCache = new TtlCache<unknown>(NOVENTA_SEGUNDOS)

const PREFIJO_CATALOGO = 'catalogo:'
const PREFIJO_PRODUCTO = 'producto:'

export function productoCacheKey(id: number): string {
    return `${PREFIJO_PRODUCTO}${id}`
}

// El catálogo público no tiene una sola key: cada combinación de filtros/
// página/orden es una entrada distinta (ver catalogoCacheKey en
// catalogo.controller.ts). Al mutar un producto no sabemos bajo qué
// combinaciones aparecía, así que se invalidan todas de una vez — el costo
// es recalcular esas variantes en el próximo request, no un dato incorrecto.
export function invalidarCatalogo(): void {
    catalogoCache.deleteByPrefix(PREFIJO_CATALOGO)
}

export function invalidarProducto(id: number): void {
    productoDetalleCache.delete(productoCacheKey(id))
}
