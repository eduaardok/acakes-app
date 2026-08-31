import { useEffect, useState } from "react";
import { publicApi } from "../lib/publicApi";

interface ProductoFiltro {
    tematica: string | null;
    ocasion: string | null;
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
    const [tematicas, setTematicas] = useState<string[]>([]);
    const [ocasiones, setOcasiones] = useState<string[]>([]);

    useEffect(() => {
        publicApi
            .get<CatalogoResponse>("/catalogo?pageSize=50")
            .then((res) => {
                const t = new Set<string>();
                const o = new Set<string>();
                for (const p of res.productos) {
                    if (p.tematica) t.add(p.tematica);
                    if (p.ocasion) o.add(p.ocasion);
                }
                setTematicas([...t].sort());
                setOcasiones([...o].sort());
            })
            .catch(() => {
                // Sin filtros disponibles no es un error bloqueante: el catálogo
                // sigue funcionando sin ellos.
            });
    }, []);

    return { tematicas, ocasiones };
}
