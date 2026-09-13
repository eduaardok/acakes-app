import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { EstadoPedido } from "./usePedidosHoy";
import type { TipoProducto } from "../lib/tipoProducto";

export interface PedidoDetalle {
    id: string;
    descripcion: string;
    precio: number;
    fechaEntrega: string;
    estado: EstadoPedido;
    notas?: string | null;
    creadoEn: string;
    cliente: {
        id: string;
        nombre: string;
        telefono: string;
        email?: string | null;
    };
    // Vínculo opcional a un producto del catálogo público — un pedido custom
    // sin match en el catálogo sigue siendo válido con esto en null.
    producto?: { id: number; nombre: string; tipo: TipoProducto } | null;
}

export function usePedido(id: string) {
    const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPedido = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<PedidoDetalle>(`/pedidos/${id}`);
            setPedido(data);
        } catch {
            setError("No se pudo cargar el pedido.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedido();
    }, [id]);

    return { pedido, loading, error, refetch: fetchPedido };
}