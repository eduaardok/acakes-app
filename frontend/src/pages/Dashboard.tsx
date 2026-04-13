import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    usePedidosDelDia,
    getTodayLocalKey,
    addDaysLocalKey,
    formatFechaSelectorLabel,
    compareFechaKeyToHoy,
} from "../hooks/usePedidosHoy";
import { usePedidosListado, type ListadoParams } from "../hooks/usePedidosListado";
import {
    mondayKeyFromAnyDay,
    sundayFromMonday,
    monthRange,
    yearRange,
    labelRangoSemana,
    labelMesAncla,
} from "../lib/fechasPeriodo";
import { PedidoCard } from "../components/PedidoCard";

type VistaPrincipal = "dia" | "listado";
type ListadoPeriodo = "semana" | "mes" | "año" | "todos";

function mensajeListaVaciaDia(fechaKey: string): string {
    const when = compareFechaKeyToHoy(fechaKey);
    if (when === "today") return "No hay pedidos para hoy";
    if (when === "past") return "No hubo pedidos con entrega este día";
    return "No hay pedidos programados para este día";
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [vista, setVista] = useState<VistaPrincipal>("dia");
    const [fechaKey, setFechaKey] = useState(getTodayLocalKey);

    const [listadoPeriodo, setListadoPeriodo] = useState<ListadoPeriodo>("semana");
    const [semanaRefKey, setSemanaRefKey] = useState(getTodayLocalKey);
    const [mesAncla, setMesAncla] = useState(() => {
        const t = new Date();
        return { y: t.getFullYear(), m: t.getMonth() };
    });
    const [añoAncla, setAñoAncla] = useState(() => new Date().getFullYear());

    const listParams = useMemo((): ListadoParams | null => {
        if (vista !== "listado") return null;
        switch (listadoPeriodo) {
            case "todos":
                return { tipo: "todos" };
            case "semana": {
                const mon = mondayKeyFromAnyDay(semanaRefKey);
                const sun = sundayFromMonday(mon);
                return { tipo: "rango", desde: mon, hasta: sun };
            }
            case "mes": {
                const { desde, hasta } = monthRange(mesAncla.y, mesAncla.m);
                return { tipo: "rango", desde, hasta };
            }
            case "año": {
                const { desde, hasta } = yearRange(añoAncla);
                return { tipo: "rango", desde, hasta };
            }
        }
    }, [vista, listadoPeriodo, semanaRefKey, mesAncla.y, mesAncla.m, añoAncla]);

    const dia = usePedidosDelDia(fechaKey);
    const listado = usePedidosListado(vista === "listado", listParams);

    const loading = vista === "dia" ? dia.loading : listado.loading;
    const error = vista === "dia" ? dia.error : listado.error;
    const pedidos = vista === "dia" ? dia.pedidos : listado.pedidos;
    const refetch = () => (vista === "dia" ? dia.refetch() : listado.refetch());

    const listadoLabel = useMemo(() => {
        if (vista !== "listado") return "";
        switch (listadoPeriodo) {
            case "todos":
                return "Todos los pedidos";
            case "semana": {
                const mon = mondayKeyFromAnyDay(semanaRefKey);
                const sun = sundayFromMonday(mon);
                return labelRangoSemana(mon, sun);
            }
            case "mes":
                return labelMesAncla(mesAncla.y, mesAncla.m);
            case "año":
                return String(añoAncla);
        }
    }, [vista, listadoPeriodo, semanaRefKey, mesAncla.y, mesAncla.m, añoAncla]);

    const canPrevNextListado = listadoPeriodo !== "todos";

    const goPrevListado = () => {
        switch (listadoPeriodo) {
            case "semana":
                setSemanaRefKey((k) => addDaysLocalKey(k, -7));
                break;
            case "mes":
                setMesAncla(({ y, m }) =>
                    m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }
                );
                break;
            case "año":
                setAñoAncla((y) => y - 1);
                break;
        }
    };

    const goNextListado = () => {
        switch (listadoPeriodo) {
            case "semana":
                setSemanaRefKey((k) => addDaysLocalKey(k, 7));
                break;
            case "mes":
                setMesAncla(({ y, m }) =>
                    m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }
                );
                break;
            case "año":
                setAñoAncla((y) => y + 1);
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-4 pt-safe pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 active:bg-gray-100 transition-colors disabled:opacity-40"
                            aria-label="Recargar pedidos"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={loading ? "animate-spin" : ""}
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-3 flex rounded-xl bg-gray-100 p-1 max-w-lg">
                    <button
                        type="button"
                        onClick={() => setVista("dia")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                            vista === "dia"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500"
                        }`}
                    >
                        Por día
                    </button>
                    <button
                        type="button"
                        onClick={() => setVista("listado")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                            vista === "listado"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500"
                        }`}
                    >
                        Listado
                    </button>
                </div>

                {vista === "dia" && (
                    <div className="mt-3 flex max-w-lg items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setFechaKey((k) => addDaysLocalKey(k, -1))}
                            className="shrink-0 p-2 rounded-full text-gray-500 hover:text-gray-800 active:bg-gray-100 transition-colors"
                            aria-label="Día anterior"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <p className="min-w-0 flex-1 text-center text-sm font-medium text-gray-700">
                            {formatFechaSelectorLabel(fechaKey)}
                        </p>
                        <button
                            type="button"
                            onClick={() => setFechaKey((k) => addDaysLocalKey(k, 1))}
                            className="shrink-0 p-2 rounded-full text-gray-500 hover:text-gray-800 active:bg-gray-100 transition-colors"
                            aria-label="Día siguiente"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                )}

                {vista === "listado" && (
                    <div className="mt-3 space-y-3 max-w-lg">
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                [
                                    ["semana", "Semana"],
                                    ["mes", "Mes"],
                                    ["año", "Año"],
                                    ["todos", "Todos"],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setListadoPeriodo(id)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        listadoPeriodo === id
                                            ? "bg-pink-600 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={goPrevListado}
                                disabled={!canPrevNextListado}
                                className="shrink-0 p-2 rounded-full text-gray-500 hover:text-gray-800 active:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                aria-label="Periodo anterior"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <p className="min-w-0 flex-1 text-center text-sm font-medium text-gray-700 leading-snug px-1">
                                {listadoLabel}
                            </p>
                            <button
                                type="button"
                                onClick={goNextListado}
                                disabled={!canPrevNextListado}
                                className="shrink-0 p-2 rounded-full text-gray-500 hover:text-gray-800 active:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                aria-label="Periodo siguiente"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main className="px-4 py-4 max-w-lg mx-auto">
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-100 p-4 min-h-[72px] animate-pulse"
                            >
                                <div className="flex justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    </div>
                                    <div className="space-y-2 items-end">
                                        <div className="h-3 bg-gray-100 rounded w-12" />
                                        <div className="h-4 bg-gray-200 rounded w-16" />
                                    </div>
                                </div>
                                <div className="mt-3 h-5 bg-gray-100 rounded-full w-20" />
                            </div>
                        ))}
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            onClick={refetch}
                            className="mt-3 text-sm font-medium text-red-700 underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && vista === "listado" && (
                    <div className="flex justify-end mb-3">
                        <span
                            className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800"
                            aria-live="polite"
                        >
                            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                )}

                {!loading && !error && pedidos.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl">🎂</p>
                        <p className="text-gray-500 mt-3">
                            {vista === "dia"
                                ? mensajeListaVaciaDia(fechaKey)
                                : "No hay pedidos en este periodo"}
                        </p>
                    </div>
                )}

                {!loading && !error && pedidos.length > 0 && (
                    <div className="space-y-3">
                        {vista === "dia" && (
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
                                {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
                            </p>
                        )}
                        {pedidos.map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                onClick={() => navigate(`/pedidos/${pedido.id}`)}
                                mostrarFechaDeEntrega={vista === "listado"}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
