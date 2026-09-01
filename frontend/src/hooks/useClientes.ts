import { useState, useEffect } from "react";
import { api } from "../lib/api";

const PAGE_SIZE = 30;

export interface ClienteLista {
    id: string;
    nombre: string;
    telefono: string;
    email?: string | null;
    creadoEn: string;
}

interface ClientesResponse {
    clientes: ClienteLista[];
    page: number;
    totalPages: number;
}

export function useClientes(q: string) {
    const [clientes, setClientes] = useState<ClienteLista[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Búsqueda cambió: reinicia la lista y vuelve a la página 1
    useEffect(() => {
        setClientes([]);
        setPage(1);
    }, [q]);

    useEffect(() => {
        let cancelado = false;

        const fetchClientes = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
                if (q.trim().length >= 2) params.set("q", q.trim());
                const data = await api.get<ClientesResponse>(`/clientes?${params.toString()}`);
                if (cancelado) return;
                setClientes((prev) => (page === 1 ? data.clientes : [...prev, ...data.clientes]));
                setTotalPages(data.totalPages);
            } catch {
                if (!cancelado) setError("No se pudieron cargar los clientes.");
            } finally {
                if (!cancelado) setLoading(false);
            }
        };

        const timeout = setTimeout(fetchClientes, q && page === 1 ? 350 : 0);
        return () => {
            cancelado = true;
            clearTimeout(timeout);
        };
    }, [q, page]);

    return {
        clientes,
        loading,
        error,
        hayMas: page < totalPages,
        cargarMas: () => setPage((p) => p + 1),
    };
}
