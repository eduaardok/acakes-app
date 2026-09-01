import { useState } from "react";
import { PublicLayout } from "../components/PublicLayout";
import { ProductoCard } from "../components/ProductoCard";
import { useCatalogo } from "../hooks/useCatalogo";
import { useFiltrosCatalogo } from "../hooks/useFiltrosCatalogo";
import { usePageTitle } from "../../hooks/usePageTitle";

function FiltroChips({
    label,
    opciones,
    activo,
    onChange,
}: {
    label: string;
    opciones: string[];
    activo: string;
    onChange: (v: string) => void;
}) {
    if (opciones.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </span>
            <button
                type="button"
                onClick={() => onChange("")}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-95 ${
                    activo === "" ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
            >
                Todas
            </button>
            {opciones.map((o) => (
                <button
                    key={o}
                    type="button"
                    onClick={() => onChange(o)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-95 ${
                        activo === o ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                    }`}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

export default function Catalogo() {
    usePageTitle("Catálogo");
    const [tematica, setTematica] = useState("");
    const [ocasion, setOcasion] = useState("");

    const { tematicas, ocasiones } = useFiltrosCatalogo();
    const { productos, loading, error, hayMas, cargarMas, refetch } = useCatalogo(tematica, ocasion);

    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900">Nuestras creaciones</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Cotiza el pastel perfecto para tu ocasión especial
                </p>

                <div className="mt-4 space-y-2">
                    <FiltroChips label="Temática" opciones={tematicas} activo={tematica} onChange={setTematica} />
                    <FiltroChips label="Ocasión" opciones={ocasiones} activo={ocasion} onChange={setOcasion} />
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600 space-y-2">
                        <p>{error}</p>
                        <button type="button" onClick={refetch} className="font-medium text-red-700 underline">
                            Reintentar
                        </button>
                    </div>
                )}

                {!error && productos.length === 0 && loading && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                <div className="aspect-square bg-gray-100" />
                                <div className="p-3 space-y-2">
                                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                                    <div className="h-3 w-1/3 rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!error && !loading && productos.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-4xl">🎂</p>
                        <p className="mt-3 text-gray-500">No hay productos con estos filtros por ahora.</p>
                    </div>
                )}

                {productos.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {productos.map((p, i) => (
                            <ProductoCard key={p.id} producto={p} animationDelayMs={Math.min(i, 8) * 35} />
                        ))}
                    </div>
                )}

                {hayMas && (
                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={cargarMas}
                            disabled={loading}
                            className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-semibold text-pink-700 transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Cargando..." : "Cargar más"}
                        </button>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
