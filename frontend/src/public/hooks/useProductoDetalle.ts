import { useEffect, useState } from "react";
import { publicApi } from "../lib/publicApi";

export interface ProductoDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    tematica: string | null;
    ocasion: string | null;
    vistas: number;
    createdAt: string;
    imagenes: { id: number; url: string; orden: number }[];
    resenas: {
        id: number;
        calificacion: number;
        comentario: string | null;
        createdAt: string;
        usuario: { id: number; nombre: string };
    }[];
    resenasTotal: number;
}

export function useProductoDetalle(id: string | undefined) {
    const [producto, setProducto] = useState<ProductoDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancelado = false;

        setLoading(true);
        setError(null);

        publicApi
            .get<ProductoDetalle>(`/producto/${id}`)
            .then((res) => {
                if (!cancelado) setProducto(res);
            })
            .catch(() => {
                if (!cancelado) setError("No se pudo cargar este producto.");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [id]);

    return { producto, loading, error };
}
