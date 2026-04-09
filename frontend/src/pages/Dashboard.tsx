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

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pedidos de hoy</h1>
                        <p className="text-sm text-gray-500 capitalize">{formatFechaHoy()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2 px-3"
                    >
                        Salir
                    </button>
                </div>
            </header>

            {/* Contenido */}
            <main className="px-4 py-4 max-w-lg mx-auto">

                {/* Estado de carga */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-gray-400 mt-3">Cargando pedidos...</p>
                        </div>
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