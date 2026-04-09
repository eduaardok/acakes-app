import { useState, useEffect } from "react";
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

interface UsePedidosHoyResult {
    pedidos: PedidoHoy[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function usePedidosHoy(): UsePedidosHoyResult {
    const [pedidos, setPedidos] = useState<PedidoHoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<PedidoHoy[]>("/pedidos/hoy");
            setPedidos(data);
        } catch (err) {
            setError("No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    return { pedidos, loading, error, refetch: fetchPedidos };
}