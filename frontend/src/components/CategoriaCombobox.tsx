import { useState } from "react";
import { api } from "../lib/api";
import { useCategorias, type Categoria, type TipoCategoria } from "../hooks/useCategorias";

interface Props {
    tipo: TipoCategoria;
    label: string;
    placeholder: string;
    value: Categoria[];
    onChange: (categorias: Categoria[]) => void;
}

/**
 * Selector múltiple "buscar o crear": filtra la lista de categorías existentes
 * mientras se escribe y, si no hay coincidencia exacta, ofrece crearla al vuelo
 * vía el endpoint /categorias/:tipo/resolver (upsert por nombre). Las
 * seleccionadas se muestran como chips removibles arriba del input.
 */
// Acento por tipo — misma convención que el resto del sistema: temática = rosa,
// ocasión = morado (color de marca secundario, del logo).
const ACENTO_CHIP: Record<TipoCategoria, { chip: string; quitar: string }> = {
    tematicas: { chip: "bg-pink-50 text-pink-700", quitar: "text-pink-400 hover:text-pink-600" },
    ocasiones: {
        chip: "bg-brand-purple-50 text-brand-purple-700",
        quitar: "text-brand-purple-400 hover:text-brand-purple-600",
    },
};

export function CategoriaCombobox({ tipo, label, placeholder, value, onChange }: Props) {
    const { categorias, refetch } = useCategorias(tipo);
    const acento = ACENTO_CHIP[tipo];
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [creando, setCreando] = useState(false);

    const seleccionadosIds = new Set(value.map((c) => c.id));
    const queryTrim = query.trim();
    const coincidencias = (
        queryTrim
            ? categorias.filter((c) => c.nombre.toLowerCase().includes(queryTrim.toLowerCase()))
            : categorias
    ).filter((c) => !seleccionadosIds.has(c.id));
    const coincidenciaExacta = categorias.some(
        (c) => c.nombre.toLowerCase() === queryTrim.toLowerCase()
    );

    const agregar = (categoria: Categoria) => {
        if (!seleccionadosIds.has(categoria.id)) onChange([...value, categoria]);
        setQuery("");
    };

    const quitar = (id: string) => {
        onChange(value.filter((c) => c.id !== id));
    };

    const crearAlVuelo = async () => {
        if (!queryTrim) return;
        setCreando(true);
        try {
            const categoria = await api.post<Categoria>(`/categorias/${tipo}/resolver`, {
                nombre: queryTrim,
            });
            await refetch();
            agregar(categoria);
        } finally {
            setCreando(false);
        }
    };

    return (
        <div className="relative">
            <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>

            {value.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {value.map((c) => (
                        <span
                            key={c.id}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${acento.chip}`}
                        >
                            {c.nombre}
                            <button
                                type="button"
                                onClick={() => quitar(c.id)}
                                aria-label={`Quitar ${c.nombre}`}
                                className={acento.quitar}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
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
                            onClick={() => agregar(c)}
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
