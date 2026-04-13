import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export type EstadoPedido =
    | "BORRADOR"
    | "CONFIRMADO"
    | "EN_PROCESO"
    | "LISTO"
    | "ENTREGADO"
    | "CANCELADO"
    | "NO_RETIRADO";

export interface PedidoHoy {
    id: string;
    descripcion: string;
    precio: number;
    fechaEntrega: string;
    estado: EstadoPedido;
    notas?: string;
    cliente: {
        id: string;
        nombre: string;
        telefono: string;
    };
}

/** YYYY-MM-DD en calendario local (no UTC). */
export function toLocalDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function getTodayLocalKey(): string {
    return toLocalDateKey(new Date());
}

export function addDaysLocalKey(key: string, delta: number): string {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    return toLocalDateKey(date);
}

function parseLocalDateKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** Texto tipo "lunes 13 de abril" → capitalizar primera letra. */
export function formatFechaSelectorLabel(fechaKey: string): string {
    const raw = parseLocalDateKey(fechaKey).toLocaleDateString("es-EC", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Comparación por cadena YYYY-MM-DD (misma zona que las keys). */
export function compareFechaKeyToHoy(fechaKey: string): "past" | "today" | "future" {
    const t = getTodayLocalKey();
    if (fechaKey < t) return "past";
    if (fechaKey > t) return "future";
    return "today";
}

interface UsePedidosDelDiaResult {
    pedidos: PedidoHoy[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Pedidos cuya fecha de entrega cae en el día indicado (calendario local).
 * Si `fechaKey` es hoy → GET /pedidos/hoy; si no → GET /pedidos?fecha=...
 */
export function usePedidosDelDia(fechaKey: string): UsePedidosDelDiaResult {
    const [pedidos, setPedidos] = useState<PedidoHoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const hoyKey = getTodayLocalKey();
            const data =
                fechaKey === hoyKey
                    ? await api.get<PedidoHoy[]>("/pedidos/hoy")
                    : await api.get<PedidoHoy[]>(
                          `/pedidos?fecha=${encodeURIComponent(fechaKey)}`
                      );
            setPedidos(data);
        } catch {
            setError("No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    }, [fechaKey]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    return { pedidos, loading, error, refetch: fetchPedidos };
}
