import { useEffect, useState, useCallback } from "react";
import { publicApi } from "../lib/publicApi";
import type { ProductoCardData } from "../components/ProductoCard";

export interface FavoritoItem {
    id: number;
    createdAt: string;
    producto: ProductoCardData;
}

export function useMisFavoritos() {
    const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quitandoId, setQuitandoId] = useState<number | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await publicApi.get<FavoritoItem[]>("/mis-favoritos");
            setFavoritos(data);
        } catch {
            setError("No se pudieron cargar tus favoritos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void cargar();
    }, [cargar]);

    const quitar = useCallback(async (productoId: number) => {
        setQuitandoId(productoId);
        try {
            await publicApi.del(`/producto/${productoId}/favorito`);
            setFavoritos((prev) => prev.filter((f) => f.producto.id !== productoId));
        } finally {
            setQuitandoId(null);
        }
    }, []);

    return { favoritos, loading, error, quitar, quitandoId, refetch: cargar };
}
