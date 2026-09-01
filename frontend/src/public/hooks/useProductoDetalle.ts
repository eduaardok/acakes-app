import { useEffect, useState, useCallback } from "react";
import { publicApi } from "../lib/publicApi";
import type { CategoriaFiltro } from "./useFiltrosCatalogo";

export interface ProductoDetalle {
    id: number;
    nombre: string;
    descripcion: string | null;
    tematicas: CategoriaFiltro[];
    ocasiones: CategoriaFiltro[];
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
    const [reloadToken, setReloadToken] = useState(0);

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
    }, [id, reloadToken]);

    const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

    return { producto, loading, error, refetch };
}
