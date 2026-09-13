import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ProductoLista } from "../hooks/useProductos";
import { TIPO_PRODUCTO_LABEL, type TipoProducto } from "../lib/tipoProducto";

interface ProductosResponse {
    productos: ProductoLista[];
}

// Forma mínima que el selector necesita — así el caller puede prefiltrar
// `value` desde un Pedido ya cargado (que solo trae {id,nombre,tipo} del
// producto vinculado) sin tener que fingir un ProductoLista completo.
export interface ProductoVinculado {
    id: number;
    nombre: string;
    tipo: TipoProducto;
}

interface Props {
    value: ProductoVinculado | null;
    onChange: (producto: ProductoVinculado | null) => void;
}

/**
 * Selector opcional "vincular a producto del catálogo" para el formulario de
 * pedido. Carga una sola página grande (pageSize=50, mismo criterio que
 * useFiltrosCatalogo del lado público) y filtra por nombre en el cliente —
 * no existe un endpoint de búsqueda por texto en /productos, y el catálogo
 * de esta pastelería es chico, así que no se justifica agregar uno.
 */
export function BuscadorProducto({ value, onChange }: Props) {
    const [productos, setProductos] = useState<ProductoLista[]>([]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        api
            .get<ProductosResponse>("/productos?pageSize=50")
            .then((res) => setProductos(res.productos))
            .catch(() => {
                // Selector opcional: si falla la carga, el pedido sigue siendo válido sin vínculo.
            });
    }, []);

    const queryTrim = query.trim().toLowerCase();
    const resultados = queryTrim
        ? productos.filter((p) => p.nombre.toLowerCase().includes(queryTrim))
        : productos;

    if (value) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-gray-900">{value.nombre}</p>
                    <p className="text-xs text-gray-400">{TIPO_PRODUCTO_LABEL[value.tipo]}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="text-xs text-gray-400 underline"
                >
                    Quitar
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Buscar producto del catálogo..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            />

            {open && resultados.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                    {resultados.map((p) => (
                        <li key={p.id}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onChange(p);
                                    setQuery("");
                                    setOpen(false);
                                }}
                                className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-pink-50"
                            >
                                {p.nombre}
                                <span className="ml-1.5 text-xs text-gray-400">
                                    ({TIPO_PRODUCTO_LABEL[p.tipo]})
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {open && queryTrim && resultados.length === 0 && (
                <p className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm text-gray-400 shadow-lg">
                    Sin resultados
                </p>
            )}
        </div>
    );
}
