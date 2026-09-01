import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { ProductoImagen } from "./useProductos";

export interface ProductoDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    tematica: string | null;
    ocasion: string | null;
    createdAt: string;
    imagenes: ProductoImagen[];
}

export function useProducto(id: string) {
    const [producto, setProducto] = useState<ProductoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducto = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<ProductoDetalle>(`/productos/${id}`);
            setProducto(data);
        } catch {
            setError("No se pudo cargar el producto.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProducto();
    }, [fetchProducto]);

    return { producto, loading, error, refetch: fetchProducto };
}
