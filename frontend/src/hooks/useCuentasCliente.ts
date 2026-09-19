import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

export interface CuentaCliente {
    id: number;
    email: string;
    nombre: string;
    createdAt: string;
    /** Cliente de negocio vinculado, si la cuenta pública ya se asoció a uno. */
    clienteId: number | null;
}

// Cuentas del catálogo público (UsuarioCliente) contra /admin/clientes-cuenta.
// Modelo distinto de Usuario: no tienen rol ni acceso al panel.
export function useCuentasCliente() {
    const [cuentas, setCuentas] = useState<CuentaCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCuentas(await api.get<CuentaCliente[]>("/admin/clientes-cuenta"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar las cuentas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const eliminar = async (id: number) => {
        await api.del(`/admin/clientes-cuenta/${id}`);
        await cargar();
    };

    return { cuentas, loading, error, eliminar, refetch: cargar };
}
