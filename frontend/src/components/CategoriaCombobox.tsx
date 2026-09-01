import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useCategorias, type Categoria, type TipoCategoria } from "../hooks/useCategorias";

interface Props {
    tipo: TipoCategoria;
    label: string;
    placeholder: string;
    value: Categoria | null;
    onChange: (categoria: Categoria | null) => void;
}

/**
 * Selector "buscar o crear": filtra la lista de categorías existentes mientras
 * se escribe y, si no hay coincidencia exacta, ofrece crearla al vuelo vía el
 * endpoint /categorias/:tipo/resolver (upsert por nombre).
 */
export function CategoriaCombobox({ tipo, label, placeholder, value, onChange }: Props) {
    const { categorias, refetch } = useCategorias(tipo);
    const [query, setQuery] = useState(value?.nombre ?? "");
    const [open, setOpen] = useState(false);
    const [creando, setCreando] = useState(false);

    useEffect(() => {
        setQuery(value?.nombre ?? "");
    }, [value?.id]);

    const queryTrim = query.trim();
    const coincidencias = queryTrim
        ? categorias.filter((c) => c.nombre.toLowerCase().includes(queryTrim.toLowerCase()))
        : categorias;
    const coincidenciaExacta = categorias.some(
        (c) => c.nombre.toLowerCase() === queryTrim.toLowerCase()
    );

    const seleccionar = (categoria: Categoria) => {
        setQuery(categoria.nombre);
        onChange(categoria);
        setOpen(false);
    };

    const crearAlVuelo = async () => {
        if (!queryTrim) return;
        setCreando(true);
        try {
            const categoria = await api.post<Categoria>(`/categorias/${tipo}/resolver`, {
                nombre: queryTrim,
            });
            await refetch();
            seleccionar(categoria);
        } finally {
            setCreando(false);
        }
    };

    return (
        <div className="relative">
            <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (!e.target.value.trim()) onChange(null);
                }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            />

            {open && (coincidencias.length > 0 || queryTrim) && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                    {coincidencias.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => seleccionar(c)}
                            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-pink-50"
                        >
                            {c.nombre}
                        </button>
                    ))}
                    {queryTrim && !coincidenciaExacta && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={crearAlVuelo}
                            disabled={creando}
                            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-pink-600 hover:bg-pink-50 disabled:opacity-50"
                        >
                            {creando ? "Creando..." : `Crear "${queryTrim}"`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
