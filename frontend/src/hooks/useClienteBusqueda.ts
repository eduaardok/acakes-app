// frontend/src/hooks/useClienteBusqueda.ts
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";

export interface ClienteResumen {
    id: number;
    nombre: string;
    telefono: string;
    email?: string | null;
}

export function useClienteBusqueda() {
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState<ClienteResumen[]>([]);
    const [buscando, setBuscando] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Limpiar resultados si el campo está vacío
        if (query.trim().length < 2) {
            setResultados([]);
            return;
        }

        // Debounce: esperar 350ms antes de buscar
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            setBuscando(true);
            try {
                const data = await api.get<ClienteResumen[]>(
                    `/clientes?q=${encodeURIComponent(query.trim())}`
                );
                setResultados(data);
            } catch {
                setResultados([]);
            } finally {
                setBuscando(false);
            }
        }, 350);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [query]);

    return { query, setQuery, resultados, buscando };
}