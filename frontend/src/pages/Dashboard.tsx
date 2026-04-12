import { useNavigate } from "react-router-dom";
import { usePedidosHoy } from "../hooks/usePedidosHoy";
import { PedidoCard } from "../components/PedidoCard";

function formatFechaHoy(): string {
    return new Date().toLocaleDateString("es-EC", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { pedidos, loading, error, refetch } = usePedidosHoy();

    // const handleLogout = () => {
    //     localStorage.removeItem("token");
    //     navigate("/login");
    // };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 pt-safe pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pedidos de hoy</h1>
                        <p className="text-sm text-gray-500 capitalize">{formatFechaHoy()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 active:bg-gray-100 transition-colors disabled:opacity-40"
                            aria-label="Recargar pedidos"
                        >
                            {/* Ícono de recarga con SVG inline — sin librerías */}
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
            </header>

            {/* Contenido */}
            <main className="px-4 py-4 max-w-lg mx-auto">

                {/* Estado de carga */}
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

                {/* Error */}
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

                {/* Lista vacía */}
                {!loading && !error && pedidos.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl">🎂</p>
                        <p className="text-gray-500 mt-3">No hay pedidos para hoy</p>
                    </div>
                )}

                {/* Lista de pedidos */}
                {!loading && !error && pedidos.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
                            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
                        </p>
                        {pedidos.map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                onClick={() => navigate(`/pedidos/${pedido.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}