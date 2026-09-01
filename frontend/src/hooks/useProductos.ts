import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Categoria } from "./useCategorias";

const PAGE_SIZE = 20;

export interface ProductoImagen {
    id: number;
    url: string;
    orden: number;
}

export interface ProductoLista {
    id: number;
    nombre: string;
    descripcion: string | null;
    tematica: Categoria | null;
    ocasion: Categoria | null;
    createdAt: string;
    imagenes: ProductoImagen[];
}

interface ProductosResponse {
    productos: ProductoLista[];
    page: number;
    totalPages: number;
}

export function useProductos() {
    const [productos, setProductos] = useState<ProductoLista[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recargarNonce, setRecargarNonce] = useState(0);

    useEffect(() => {
        let cancelado = false;

        const fetchProductos = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
                const data = await api.get<ProductosResponse>(`/productos?${params.toString()}`);
                if (cancelado) return;
                setProductos((prev) => (page === 1 ? data.productos : [...prev, ...data.productos]));
                setTotalPages(data.totalPages);
            } catch {
                if (!cancelado) setError("No se pudieron cargar los productos.");
            } finally {
                if (!cancelado) setLoading(false);
            }
        };

        fetchProductos();
        return () => {
            cancelado = true;
        };
    }, [page, recargarNonce]);

    return {
        productos,
        loading,
        error,
        hayMas: page < totalPages,
        cargarMas: () => setPage((p) => p + 1),
        recargar: () => {
            setPage(1);
            setRecargarNonce((n) => n + 1);
        },
    };
}
