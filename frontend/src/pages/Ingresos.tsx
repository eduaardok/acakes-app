import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIngresos, hoy, haceDias } from "../hooks/useIngresos";
import { usePageTitle } from "../hooks/usePageTitle";
import { Skeleton } from "../components/Skeleton";
import { CakeIcon } from "../components/icons";
import { TIPOS_PRODUCTO, TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON } from "../lib/tipoProducto";

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
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-95 ${
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
                    <div className="animate-rise-in flex gap-3">
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
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
                        <div className="animate-rise-in bg-white rounded-2xl border border-gray-100 p-5">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                                Total del período
                            </p>
                            <p className="text-4xl font-bold text-brand-purple-700 tabular-nums">
                                ${Number(data.total).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {data.cantidad} pedido{data.cantidad !== 1 ? "s" : ""} entregado{data.cantidad !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {/* Desglose por tipo — solo pedidos con producto del catálogo vinculado */}
                        {TIPOS_PRODUCTO.some((t) => data.desglosePorTipo[t].cantidad > 0) && (
                            <div className="animate-rise-in bg-white rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
                                    Por tipo de producto
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {TIPOS_PRODUCTO.map((t) => {
                                        const Icon = TIPO_PRODUCTO_ICON[t];
                                        const bucket = data.desglosePorTipo[t];
                                        return (
                                            <div key={t} className="text-center">
                                                <Icon className="mx-auto h-5 w-5 text-gray-400" />
                                                <p className="mt-1 text-sm font-bold text-gray-900 tabular-nums">
                                                    ${bucket.total.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {TIPO_PRODUCTO_LABEL[t]} ({bucket.cantidad})
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="mt-3 text-xs text-gray-300 text-center">
                                    Solo pedidos vinculados a un producto del catálogo
                                </p>
                            </div>
                        )}

                        {/* Lista de pedidos */}
                        <section className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                                Detalle
                            </p>

                            {data.pedidos.length === 0 ? (
                                <div className="text-center py-10">
                                    <CakeIcon className="mx-auto h-10 w-10 text-gray-300" />
                                    <p className="text-gray-400 text-sm mt-2">
                                        Sin ingresos en este período
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.pedidos.map((p, i) => (
                                        <button
                                            key={p.id}
                                            onClick={() => navigate(`/panel/pedidos/${p.id}`)}
                                            style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
                                            className="animate-rise-in w-full text-left bg-white rounded-2xl border border-gray-100 px-4 py-3 transition-[background-color,transform] duration-150 ease-out active:scale-[0.985] active:bg-gray-50"
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
                                                Entrega programada {formatFecha(p.fechaEntrega)}
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