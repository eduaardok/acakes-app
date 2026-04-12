import { useState, useEffect } from "react";
import { api } from "../lib/api";

export interface ClienteLista {
    id: string;
    nombre: string;
    telefono: string;
    email?: string | null;
    creadoEn: string;
}

export function useClientes(q: string) {
    const [clientes, setClientes] = useState<ClienteLista[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClientes = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = q.trim().length >= 2
                    ? `/clientes?q=${encodeURIComponent(q.trim())}`
                    : "/clientes";
                const data = await api.get<ClienteLista[]>(url);
                setClientes(data);
            } catch {
                setError("No se pudieron cargar los clientes.");
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchClientes, q ? 350 : 0);
        return () => clearTimeout(timeout);
    }, [q]);

    return { clientes, loading, error };
}