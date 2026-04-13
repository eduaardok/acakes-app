import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { PedidoHoy } from "./usePedidosHoy";

export type ListadoParams =
    | { tipo: "todos" }
    | { tipo: "rango"; desde: string; hasta: string };

function listadoCacheKey(params: ListadoParams): string {
    if (params.tipo === "todos") return "todos";
    return `rango:${params.desde}:${params.hasta}`;
}

interface UsePedidosListadoResult {
    pedidos: PedidoHoy[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Listado por rango (`GET /pedidos?desde=&hasta=`) o todos (`GET /pedidos`).
 * Si `enabled` es false, no hace fetch y deja la lista vacía.
 */
export function usePedidosListado(
    enabled: boolean,
    params: ListadoParams | null
): UsePedidosListadoResult {
    const [pedidos, setPedidos] = useState<PedidoHoy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cacheKey =
        enabled && params ? listadoCacheKey(params) : "__off__";

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
            const path =
                params.tipo === "todos"
                    ? "/pedidos"
                    : `/pedidos?desde=${encodeURIComponent(params.desde)}&hasta=${encodeURIComponent(params.hasta)}`;
            const data = await api.get<PedidoHoy[]>(path);
            setPedidos(data);
        } catch {
            setError("No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    }, [enabled, cacheKey, params]);

    useEffect(() => {
        void load();
    }, [load]);

    return { pedidos, loading, error, refetch: load };
}
