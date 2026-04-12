import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { usePedido } from "../hooks/usePedido";
import type { EstadoPedido } from "../hooks/usePedidosHoy";

// Misma config que PedidoCard — colores por estado
const estadoConfig: Record<EstadoPedido, { label: string; bg: string; text: string }> = {
    BORRADOR:    { label: "Borrador",    bg: "bg-gray-100",    text: "text-gray-600" },
    CONFIRMADO:  { label: "Confirmado",  bg: "bg-blue-100",    text: "text-blue-700" },
    EN_PROCESO:  { label: "En proceso",  bg: "bg-yellow-100",  text: "text-yellow-700" },
    LISTO:       { label: "¡Listo!",     bg: "bg-green-100",   text: "text-green-700" },
    ENTREGADO:   { label: "Entregado",   bg: "bg-emerald-100", text: "text-emerald-700" },
    CANCELADO:   { label: "Cancelado",   bg: "bg-red-100",     text: "text-red-600" },
    NO_RETIRADO: { label: "No retirado", bg: "bg-orange-100",  text: "text-orange-700" },
};

// Qué transición ofrecer según el estado actual
// Solo las transiciones válidas de tu backend
const siguienteAccion: Partial<Record<EstadoPedido, { label: string; estado: EstadoPedido; color: string }>> = {
    BORRADOR:   { label: "Confirmar pedido",  estado: "CONFIRMADO", color: "bg-blue-600" },
    CONFIRMADO: { label: "Iniciar proceso",   estado: "EN_PROCESO", color: "bg-yellow-500" },
    EN_PROCESO: { label: "Marcar como listo", estado: "LISTO",      color: "bg-green-600" },
    LISTO:      { label: "Marcar entregado",  estado: "ENTREGADO",  color: "bg-emerald-600" },
};

// Estados donde aún tiene sentido ofrecer cancelar
const puedeCancel = new Set<EstadoPedido>(["BORRADOR", "CONFIRMADO", "EN_PROCESO"]);

function formatFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString("es-EC", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function DetallePedido() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { pedido, loading, error, refetch } = usePedido(id!);
    const [cambiando, setCambiando] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    const cambiarEstado = async (nuevoEstado: EstadoPedido) => {
        setCambiando(true);
        setErrorAccion(null);
        try {
            await api.patch(`/pedidos/${id}/estado`, { estado: nuevoEstado });
            await refetch(); // recargar el pedido con el nuevo estado
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al cambiar estado");
        } finally {
            setCambiando(false);
        }
    };

    // --- Estados de carga y error ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (error || !pedido) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
                <p className="text-red-500 text-sm">{error ?? "Pedido no encontrado"}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-400 underline">
                    Volver
                </button>
            </div>
        );
    }

    const config = estadoConfig[pedido.estado];
    const accion = siguienteAccion[pedido.estado];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full text-gray-400 hover:text-gray-600 active:bg-gray-100"
                        aria-label="Volver"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Detalle del pedido</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">

                {/* Chip de estado */}
                <div>
                    <span className={`inline-block text-sm font-medium px-3 py-1.5 rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                    </span>
                </div>

                {/* Card: Cliente */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Cliente</p>
                    <p className="font-semibold text-gray-900">{pedido.cliente.nombre}</p>
                    <p className="text-sm text-gray-500">{pedido.cliente.telefono}</p>
                    {pedido.cliente.email && (
                        <p className="text-sm text-gray-400">{pedido.cliente.email}</p>
                    )}
                </div>

                {/* Card: Pedido */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pedido</p>
                    <p className="text-gray-900">{pedido.descripcion}</p>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Precio</span>
                        <span className="font-bold text-gray-900 text-lg">
                            ${Number(pedido.precio).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-start pt-1 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Entrega</span>
                        <span className="text-sm text-gray-700 text-right capitalize">
                            {formatFecha(pedido.fechaEntrega)}
                        </span>
                    </div>

                    {pedido.notas && (
                        <div className="pt-1 border-t border-gray-50">
                            <p className="text-xs text-gray-400 mb-1">Notas</p>
                            <p className="text-sm text-gray-600">{pedido.notas}</p>
                        </div>
                    )}
                </div>

                {/* Error de acción */}
                {errorAccion && (
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-sm text-red-600 text-center">{errorAccion}</p>
                    </div>
                )}

                {/* Botón de acción principal */}
                {accion && (
                    <button
                        onClick={() => cambiarEstado(accion.estado)}
                        disabled={cambiando}
                        className={`w-full ${accion.color} text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-transform`}
                    >
                        {cambiando ? "Actualizando..." : accion.label}
                    </button>
                )}

                {/* Botón cancelar — solo en estados donde tiene sentido */}
                {puedeCancel.has(pedido.estado) && (
                    <button
                        onClick={() => cambiarEstado("CANCELADO")}
                        disabled={cambiando}
                        className="w-full border border-red-200 text-red-500 font-medium py-3 rounded-2xl text-sm disabled:opacity-50"
                    >
                        Cancelar pedido
                    </button>
                )}

                {/* Estados finales — sin acciones */}
                {["ENTREGADO", "CANCELADO", "NO_RETIRADO"].includes(pedido.estado) && (
                    <p className="text-center text-sm text-gray-400 py-2">
                        Este pedido ya no puede modificarse
                    </p>
                )}

                <div className="h-6" />
            </main>
        </div>
    );
}