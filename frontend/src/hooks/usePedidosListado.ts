import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { PedidoHoy } from "./usePedidosHoy";

const PAGE_SIZE = 30;

export type ListadoParams =
    | { tipo: "todos" }
    | { tipo: "rango"; desde: string; hasta: string };

interface PedidosTodosResponse {
    pedidos: PedidoHoy[];
    page: number;
    totalPages: number;
}

function listadoCacheKey(params: ListadoParams): string {
    if (params.tipo === "todos") return "todos";
    return `rango:${params.desde}:${params.hasta}`;
}

interface UsePedidosListadoResult {
    pedidos: PedidoHoy[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    /** Solo aplica a tipo "todos" — el rango/día ya viene acotado por fecha. */
    hayMas: boolean;
    cargarMas: () => void;
}

/**
 * Listado por rango (`GET /pedidos?desde=&hasta=`, sin paginar porque ya
 * está acotado por fecha) o todos (`GET /pedidos`, paginado con "cargar más"
 * porque la tabla crece sin cota natural).
 * Si `enabled` es false, no hace fetch y deja la lista vacía.
 */
export function usePedidosListado(
    enabled: boolean,
    params: ListadoParams | null
): UsePedidosListadoResult {
    const [pedidos, setPedidos] = useState<PedidoHoy[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheKey =
        enabled && params ? listadoCacheKey(params) : "__off__";

    // Cambió el filtro activo: reinicia paginación
    useEffect(() => {
        setPage(1);
    }, [cacheKey]);

    const load = useCallback(async () => {
        if (!enabled || !params) {
            setPedidos([]);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (params.tipo === "todos") {
                const data = await api.get<PedidosTodosResponse>(
                    `/pedidos?page=${page}&pageSize=${PAGE_SIZE}`
                );
                setPedidos((prev) => (page === 1 ? data.pedidos : [...prev, ...data.pedidos]));
                setTotalPages(data.totalPages);
            } else {
                const path = `/pedidos?desde=${encodeURIComponent(params.desde)}&hasta=${encodeURIComponent(params.hasta)}`;
                const data = await api.get<PedidoHoy[]>(path);
                setPedidos(data);
                setTotalPages(1);
            }
        } catch {
            setError("No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    }, [enabled, cacheKey, params, page]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        pedidos,
        loading,
        error,
        refetch: load,
        hayMas: params?.tipo === "todos" && page < totalPages,
        cargarMas: () => setPage((p) => p + 1),
    };
}
