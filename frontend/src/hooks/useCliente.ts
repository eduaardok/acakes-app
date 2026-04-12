import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { EstadoPedido } from "./usePedidosHoy";

export type TipoObservacion =
    | "PAGO_TARDIO"
    | "NO_RETIRO"
    | "CANCELACION_TARDE"
    | "POSITIVA"
    | "OTRO";

export interface ObservacionDetalle {
    id: string;
    tipo: TipoObservacion;
    descripcion: string;
    fecha: string;
    autoGenerada: boolean;
}

export interface PedidoResumen {
    id: string;
    descripcion: string;
    precio: number;
    fechaEntrega: string;
    estado: EstadoPedido;
}

export interface ClienteDetalle {
    id: string;
    nombre: string;
    telefono: string;
    email?: string | null;
    creadoEn: string;
    pedidos: PedidoResumen[];
    observaciones: ObservacionDetalle[];
}

export function useCliente(id: string) {
    const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCliente = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<ClienteDetalle>(`/clientes/${id}`);
            setCliente(data);
        } catch {
            setError("No se pudo cargar el cliente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCliente();
    }, [id]);

    return { cliente, loading, error, refetch: fetchCliente };
}