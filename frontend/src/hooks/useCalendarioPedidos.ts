import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { PedidoHoy } from "./usePedidosHoy";
import { toLocalDateKey } from "./usePedidosHoy";
import { monthRange } from "../lib/fechasPeriodo";

interface UseCalendarioPedidosResult {
    /** Pedidos del mes agrupados por fecha de entrega (clave YYYY-MM-DD, calendario local). */
    porDia: Map<string, PedidoHoy[]>;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Pedidos con fechaEntrega dentro de `year`/`monthIndex`, opcionalmente
 * filtrados a solo pendientes (no ENTREGADO/CANCELADO/NO_RETIRADO).
 */
export function useCalendarioPedidos(
    year: number,
    monthIndex: number,
    soloPendientes: boolean
): UseCalendarioPedidosResult {
    const [porDia, setPorDia] = useState<Map<string, PedidoHoy[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { desde, hasta } = monthRange(year, monthIndex);
            const params = new URLSearchParams({ desde, hasta });
            if (soloPendientes) params.set("pendiente", "true");
            const data = await api.get<PedidoHoy[]>(`/pedidos?${params.toString()}`);

            const agrupado = new Map<string, PedidoHoy[]>();
            for (const pedido of data) {
                const key = toLocalDateKey(new Date(pedido.fechaEntrega));
                const lista = agrupado.get(key);
                if (lista) lista.push(pedido);
                else agrupado.set(key, [pedido]);
            }
            setPorDia(agrupado);
        } catch {
            setError("No se pudo cargar el calendario de pedidos.");
        } finally {
            setLoading(false);
        }
    }, [year, monthIndex, soloPendientes]);

    useEffect(() => {
        void load();
    }, [load]);

    return { porDia, loading, error, refetch: load };
}
