import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface PedidoImagen {
    id: number;
    url: string;
    descripcion: string | null;
    createdAt: string;
}

export function usePedidoImagenes(pedidoId: string) {
    const [imagenes, setImagenes] = useState<PedidoImagen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchImagenes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<PedidoImagen[]>(`/pedidos/${pedidoId}/imagenes`);
            setImagenes(data);
        } catch {
            setError("No se pudieron cargar las fotos.");
        } finally {
            setLoading(false);
        }
    }, [pedidoId]);

    useEffect(() => {
        fetchImagenes();
    }, [fetchImagenes]);

    return { imagenes, loading, error, refetch: fetchImagenes };
}
