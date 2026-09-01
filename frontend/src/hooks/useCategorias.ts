import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

export interface Categoria {
    id: string;
    nombre: string;
}

export type TipoCategoria = "tematicas" | "ocasiones";

// Tematica y Ocasion comparten la misma forma de API (/categorias/tematicas,
// /categorias/ocasiones), un solo hook parametrizado evita duplicar la pantalla de gestión.
export function useCategorias(tipo: TipoCategoria) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<Categoria[]>(`/categorias/${tipo}`);
            setCategorias(data);
        } catch {
            setError("No se pudieron cargar las categorías.");
        } finally {
            setLoading(false);
        }
    }, [tipo]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const crear = async (nombre: string) => {
        const categoria = await api.post<Categoria>(`/categorias/${tipo}`, { nombre });
        await cargar();
        return categoria;
    };

    const editar = async (id: string, nombre: string) => {
        await api.patch<Categoria>(`/categorias/${tipo}/${id}`, { nombre });
        await cargar();
    };

    const eliminar = async (id: string) => {
        await api.del(`/categorias/${tipo}/${id}`);
        await cargar();
    };

    return { categorias, loading, error, crear, editar, eliminar, refetch: cargar };
}
