import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIngresos, hoy, haceDias } from "../hooks/useIngresos";
import { usePageTitle } from "../hooks/usePageTitle";

// Rangos rápidos predefinidos
const RANGOS = [
    { label: "Hoy",       desde: () => hoy(),          hasta: () => hoy() },
    { label: "7 días",    desde: () => haceDias(6),     hasta: () => hoy() },
    { label: "Este mes",  desde: () => primerDiaMes(),  hasta: () => hoy() },
    { label: "Otro",      desde: () => "",              hasta: () => "" },
] as const;

function primerDiaMes(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function formatFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString("es-EC", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export default function Ingresos() {
    usePageTitle("Ingresos");
    const navigate = useNavigate();

    // Rango activo — por defecto "Hoy"
    const [rangoIdx, setRangoIdx] = useState(0);
    const [desdeCustom, setDesdeCustom] = useState("");
    const [hastaCustom, setHastaCustom] = useState("");

    const esCustom = rangoIdx === 3;
    const desde = esCustom ? desdeCustom : RANGOS[rangoIdx].desde();
    const hasta = esCustom ? hastaCustom : RANGOS[rangoIdx].hasta();

    const { data, loading, error } = useIngresos(desde, hasta);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-xl font-bold text-gray-900">Ingresos</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-5">

                {/* Selector de rango */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {RANGOS.map((r, i) => (
                        <button
                            key={r.label}
                            onClick={() => setRangoIdx(i)}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                rangoIdx === i
                                    ? "bg-pink-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-600"
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Selector de fechas custom */}
                {esCustom && (
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Desde</label>
                            <input
                                type="date"
                                value={desdeCustom}
                                max={hastaCustom || hoy()}
                                onChange={(e) => setDesdeCustom(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Hasta</label>
                            <input
                                type="date"
                                value={hastaCustom}
                                min={desdeCustom}
                                max={hoy()}
                                onChange={(e) => setHastaCustom(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                        </div>
                    </div>
                )}

                {/* Card resumen */}
                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {data && !loading && (
                    <>
                        {/* Total destacado */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                                Total del período
                            </p>
                            <p className="text-4xl font-bold text-gray-900">
                                ${Number(data.total).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {data.cantidad} pedido{data.cantidad !== 1 ? "s" : ""} entregado{data.cantidad !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {/* Lista de pedidos */}
                        <section className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                                Detalle
                            </p>

                            {data.pedidos.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-3xl">💰</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Sin ingresos en este período
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.pedidos.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => navigate(`/pedidos/${p.id}`)}
                                            className="w-full text-left bg-white rounded-2xl border border-gray-100 px-4 py-3 active:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {p.cliente.nombre}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {p.descripcion}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-emerald-600 shrink-0">
                                                    ${Number(p.precio).toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-300 mt-1">
                                                Entregado el {formatFecha(p.actualizadoEn)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                <div className="h-6" />
            </main>
        </div>
    );
}