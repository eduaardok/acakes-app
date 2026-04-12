import { useState, useEffect } from "react";
import { api } from "../lib/api";

export interface PedidoIngreso {
    id: string;
    descripcion: string;
    precio: number;
    actualizadoEn: string;
    cliente: {
        id: string;
        nombre: string;
    };
}

export interface ResumenIngresos {
    desde: string;
    hasta: string;
    cantidad: number;
    total: number;
    pedidos: PedidoIngreso[];
}

// Helpers para construir fechas en formato YYYY-MM-DD
export function hoy(): string {
    return new Date().toISOString().split("T")[0];
}

export function haceDias(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
}

export function useIngresos(desde: string, hasta: string) {
    const [data, setData] = useState<ResumenIngresos | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!desde || !hasta) return;

        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get<ResumenIngresos>(
                    `/pedidos/ingresos?desde=${desde}&hasta=${hasta}`
                );
                setData(res);
            } catch {
                setError("No se pudieron cargar los ingresos.");
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [desde, hasta]);

    return { data, loading, error };
}