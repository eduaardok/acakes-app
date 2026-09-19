import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { RolUsuario } from "../lib/authAdmin";

export interface UsuarioSistema {
    id: number;
    email: string;
    role: RolUsuario;
    creadoEn: string;
}

// Gestión de Usuario (admins del panel) contra /admin/usuarios. Las mutaciones
// NO atrapan el error: las reglas de negocio del backend (auto-eliminación,
// auto-degradación, último SYSTEM_ADMIN) devuelven un 400 con un mensaje ya
// escrito para mostrarle a la persona, y la pantalla lo necesita tal cual.
export function useUsuariosSistema() {
    const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setUsuarios(await api.get<UsuarioSistema[]>("/admin/usuarios"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const crear = async (datos: { email: string; password: string; role: RolUsuario }) => {
        const usuario = await api.post<UsuarioSistema>("/admin/usuarios", datos);
        await cargar();
        return usuario;
    };

    const cambiarRole = async (id: number, role: RolUsuario) => {
        await api.patch<UsuarioSistema>(`/admin/usuarios/${id}/role`, { role });
        await cargar();
    };

    const eliminar = async (id: number) => {
        await api.del(`/admin/usuarios/${id}`);
        await cargar();
    };

    return { usuarios, loading, error, crear, cambiarRole, eliminar, refetch: cargar };
}
