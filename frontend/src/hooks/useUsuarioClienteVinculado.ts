import { useEffect, useState } from "react";
import { api } from "../lib/api";

export interface UsuarioClienteResumen {
    id: number;
    email: string;
    nombre: string;
    createdAt: string;
    clienteId: number | null;
}

export function useUsuarioClienteVinculado(clienteId: string) {
    const [usuario, setUsuario] = useState<UsuarioClienteResumen | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsuario = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<UsuarioClienteResumen | null>(
                `/clientes/${clienteId}/usuario-cliente`
            );
            setUsuario(data);
        } catch {
            setError("No se pudo cargar la cuenta pública vinculada.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuario();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteId]);

    const vincular = async (usuarioClienteId: number) => {
        const actualizado = await api.patch<UsuarioClienteResumen>(
            `/clientes/${clienteId}/vincular-usuario`,
            { usuarioClienteId }
        );
        setUsuario(actualizado);
    };

    const desvincular = async () => {
        await api.del(`/clientes/${clienteId}/vincular-usuario`);
        setUsuario(null);
    };

    return { usuario, loading, error, vincular, desvincular, refetch: fetchUsuario };
}
