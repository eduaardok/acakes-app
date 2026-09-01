import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCalendarioPedidos } from "../hooks/useCalendarioPedidos";
import { getTodayLocalKey } from "../hooks/usePedidosHoy";
import { labelMesAncla } from "../lib/fechasPeriodo";
import { PedidoCard } from "../components/PedidoCard";
import { IconButton } from "../components/IconButton";
import { Skeleton } from "../components/Skeleton";
import { CakeIcon } from "../components/icons";
import { usePageTitle } from "../hooks/usePageTitle";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

interface Celda {
    dia: number;
    fechaKey: string;
}

function construirGrid(year: number, monthIndex: number): (Celda | null)[] {
    const primerDia = new Date(year, monthIndex, 1);
    const diasEnMes = new Date(year, monthIndex + 1, 0).getDate();
    // getDay(): 0=domingo..6=sábado → se convierte a 0=lunes..6=domingo
    const offset = (primerDia.getDay() + 6) % 7;

    const celdas: (Celda | null)[] = [];
    for (let i = 0; i < offset; i++) celdas.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const mm = String(monthIndex + 1).padStart(2, "0");
        const dd = String(dia).padStart(2, "0");
        celdas.push({ dia, fechaKey: `${year}-${mm}-${dd}` });
    }
    while (celdas.length % 7 !== 0) celdas.push(null);
    return celdas;
}

export default function Calendario() {
    usePageTitle("Calendario");
    const navigate = useNavigate();
    const hoyKey = getTodayLocalKey();

    const [ancla, setAncla] = useState(() => {
        const t = new Date();
        return { y: t.getFullYear(), m: t.getMonth() };
    });
    const [soloPendientes, setSoloPendientes] = useState(true);
    const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

    const { porDia, loading, error } = useCalendarioPedidos(ancla.y, ancla.m, soloPendientes);
    const grid = useMemo(() => construirGrid(ancla.y, ancla.m), [ancla.y, ancla.m]);

    const cambiarMes = (delta: number) => {
        setDiaSeleccionado(null);
        setAncla(({ y, m }) => {
            const total = y * 12 + m + delta;
            return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
        });
    };

    const pedidosDelDia = diaSeleccionado ? porDia.get(diaSeleccionado) ?? [] : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-4 pt-safe pb-4 sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">Calendario</h1>

                <div className="mt-3 flex max-w-lg items-center gap-1">
                    <IconButton onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </IconButton>
                    <p className="min-w-0 flex-1 text-center text-sm font-medium text-gray-700 capitalize">
                        {labelMesAncla(ancla.y, ancla.m)}
                    </p>
                    <IconButton onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </IconButton>
                </div>

                <div className="mt-3 flex gap-1.5 max-w-lg">
                    <button
                        type="button"
                        onClick={() => setSoloPendientes(true)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-[color,background-color,transform] duration-150 ease-out active:scale-95 ${
                            soloPendientes ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        Pendientes
                    </button>
                    <button
                        type="button"
                        onClick={() => setSoloPendientes(false)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-[color,background-color,transform] duration-150 ease-out active:scale-95 ${
                            !soloPendientes ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </header>

            <main className="px-4 py-4 max-w-lg mx-auto">
                {error && (
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {!error && (
                    <div className="animate-rise-in grid grid-cols-7 gap-1.5">
                        {DIAS_SEMANA.map((d, i) => (
                            <p key={i} className="text-center text-xs font-semibold text-gray-400 uppercase pb-1">
                                {d}
                            </p>
                        ))}

                        {loading &&
                            grid.map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}

                        {!loading &&
                            grid.map((celda, i) => {
                                if (!celda) return <div key={i} />;
                                const pedidosDia = porDia.get(celda.fechaKey) ?? [];
                                const esHoy = celda.fechaKey === hoyKey;
                                const seleccionado = celda.fechaKey === diaSeleccionado;

                                return (
                                    <button
                                        key={celda.fechaKey}
                                        type="button"
                                        onClick={() =>
                                            setDiaSeleccionado((actual) =>
                                                actual === celda.fechaKey ? null : celda.fechaKey
                                            )
                                        }
                                        className={`aspect-square rounded-xl border p-1 flex flex-col items-center justify-center gap-0.5 transition-[background-color,border-color,transform] duration-150 ease-out active:scale-95 ${
                                            seleccionado
                                                ? "border-pink-500 bg-pink-50"
                                                : esHoy
                                                    ? "border-pink-200 bg-white"
                                                    : "border-gray-100 bg-white"
                                        }`}
                                    >
                                        <span className={`text-sm ${esHoy ? "font-bold text-pink-600" : "text-gray-700"}`}>
                                            {celda.dia}
                                        </span>
                                        {pedidosDia.length > 0 && (
                                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-semibold text-white">
                                                {pedidosDia.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                )}

                {diaSeleccionado && (
                    <section className="animate-rise-in mt-5 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                            {pedidosDelDia.length} pedido{pedidosDelDia.length !== 1 ? "s" : ""}{" "}
                            {soloPendientes ? "pendiente" : ""}
                            {soloPendientes && pedidosDelDia.length !== 1 ? "s" : ""}
                        </p>

                        {pedidosDelDia.length === 0 ? (
                            <div className="text-center py-10">
                                <CakeIcon className="mx-auto h-10 w-10 text-gray-300" />
                                <p className="text-gray-400 text-sm mt-2">
                                    {soloPendientes
                                        ? "Sin pedidos pendientes este día"
                                        : "Sin pedidos este día"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pedidosDelDia.map((pedido, i) => (
                                    <PedidoCard
                                        key={pedido.id}
                                        pedido={pedido}
                                        onClick={() => navigate(`/panel/pedidos/${pedido.id}`)}
                                        animationDelayMs={Math.min(i, 8) * 35}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
