// Cache en memoria con expiración perezosa (se revisa al leer, no hay timer
// de barrido en segundo plano — no hace falta para el volumen de tráfico de
// este proyecto). No persiste a disco ni sobrevive un cold start de Render;
// eso es esperado, el cache solo ayuda dentro de una sesión de proceso activa.
interface Entrada<T> {
    valor: T
    expiraEn: number
}

export class TtlCache<T> {
    private almacen = new Map<string, Entrada<T>>()

    constructor(private readonly ttlMs: number) {}

    get(key: string): T | undefined {
        const entrada = this.almacen.get(key)
        if (!entrada) return undefined
        if (Date.now() > entrada.expiraEn) {
            this.almacen.delete(key)
            return undefined
        }
        return entrada.valor
    }

    set(key: string, valor: T): void {
        this.almacen.set(key, { valor, expiraEn: Date.now() + this.ttlMs })
    }

    delete(key: string): void {
        this.almacen.delete(key)
    }

    // Borra todas las entradas cuya key empieza con el prefijo dado — usado
    // para invalidar de una sola vez todas las variantes de filtros/paginado
    // de un mismo endpoint (ej. "catalogo:") sin llevar un índice aparte.
    deleteByPrefix(prefix: string): void {
        for (const key of this.almacen.keys()) {
            if (key.startsWith(prefix)) this.almacen.delete(key)
        }
    }

    clear(): void {
        this.almacen.clear()
    }
}
