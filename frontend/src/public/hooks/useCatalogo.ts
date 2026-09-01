import { useEffect, useState, useCallback } from "react";
import { publicApi } from "../lib/publicApi";
import type { CategoriaFiltro } from "./useFiltrosCatalogo";

const PAGE_SIZE = 12;

export interface ProductoResumen {
    id: number;
    nombre: string;
    descripcion: string | null;
    tematicas: CategoriaFiltro[];
    ocasiones: CategoriaFiltro[];
    createdAt: string;
    imagenes: { id: number; url: string; orden: number }[];
}

interface CatalogoResponse {
    productos: ProductoResumen[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export function useCatalogo(tematicaIds: string[], ocasionIds: string[]) {
    const [productos, setProductos] = useState<ProductoResumen[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    // Los arrays de filtro se comparan por contenido, no por referencia, para no
    // reiniciar la página en cada render por un array nuevo con el mismo contenido.
    const tematicaIdsKey = tematicaIds.join(",");
    const ocasionIdsKey = ocasionIds.join(",");

    // Filtro cambió: reinicia la lista y vuelve a la página 1
    useEffect(() => {
        setProductos([]);
        setPage(1);
    }, [tematicaIdsKey, ocasionIdsKey]);

    useEffect(() => {
        let cancelado = false;

        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (tematicaIdsKey) params.set("tematicaIds", tematicaIdsKey);
        if (ocasionIdsKey) params.set("ocasionIds", ocasionIdsKey);

        setLoading(true);
        setError(null);

        publicApi
            .get<CatalogoResponse>(`/catalogo?${params.toString()}`)
            .then((res) => {
                if (cancelado) return;
                setProductos((prev) => (page === 1 ? res.productos : [...prev, ...res.productos]));
                setTotalPages(res.totalPages);
            })
            .catch(() => {
                if (!cancelado) setError("No se pudo cargar el catálogo.");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [tematicaIdsKey, ocasionIdsKey, page, reloadToken]);

    const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

    return {
        productos,
        loading,
        error,
        hayMas: page < totalPages,
        cargarMas: () => setPage((p) => p + 1),
        refetch,
    };
}
