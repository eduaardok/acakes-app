import { useEffect, useState } from "react";
import { publicApi } from "../lib/publicApi";

export interface CategoriaFiltro {
    id: string;
    nombre: string;
}

interface ProductoFiltro {
    tematica: CategoriaFiltro | null;
    ocasion: CategoriaFiltro | null;
}

interface CatalogoResponse {
    productos: ProductoFiltro[];
}

/**
 * Deriva las opciones de filtro (temática/ocasión) a partir del catálogo
 * cargado, ya que no hay un endpoint dedicado de facetas. Con catálogos
 * grandes esto puede no cubrir el 100% de los valores existentes.
 */
export function useFiltrosCatalogo() {
    const [tematicas, setTematicas] = useState<CategoriaFiltro[]>([]);
    const [ocasiones, setOcasiones] = useState<CategoriaFiltro[]>([]);

    useEffect(() => {
        publicApi
            .get<CatalogoResponse>("/catalogo?pageSize=50")
            .then((res) => {
                const t = new Map<string, CategoriaFiltro>();
                const o = new Map<string, CategoriaFiltro>();
                for (const p of res.productos) {
                    if (p.tematica) t.set(p.tematica.id, p.tematica);
                    if (p.ocasion) o.set(p.ocasion.id, p.ocasion);
                }
                setTematicas([...t.values()].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                setOcasiones([...o.values()].sort((a, b) => a.nombre.localeCompare(b.nombre)));
            })
            .catch(() => {
                // Sin filtros disponibles no es un error bloqueante: el catálogo
                // sigue funcionando sin ellos.
            });
    }, []);

    return { tematicas, ocasiones };
}
