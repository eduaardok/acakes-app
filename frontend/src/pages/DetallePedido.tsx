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

function fechaEntregaToDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DetallePedido() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { pedido, loading, error, refetch } = usePedido(id!);
    const [cambiando, setCambiando] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    const [editandoPedido, setEditandoPedido] = useState(false);
    const [descripcionEdit, setDescripcionEdit] = useState("");
    const [precioEdit, setPrecioEdit] = useState("");
    const [fechaEdit, setFechaEdit] = useState("");
    const [notasEdit, setNotasEdit] = useState("");
    const [guardandoPedido, setGuardandoPedido] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

    const abrirEdicionPedido = () => {
        if (!pedido) return;
        setDescripcionEdit(pedido.descripcion);
        setPrecioEdit(String(Number(pedido.precio)));
        setFechaEdit(fechaEntregaToDatetimeLocal(pedido.fechaEntrega));
        setNotasEdit(pedido.notas ?? "");
        setErrorEdicion(null);
        setEditandoPedido(true);
    };

    const handleGuardarPedido = async () => {
        if (!descripcionEdit.trim()) {
            setErrorEdicion("La descripción es obligatoria");
            return;
        }
        if (!precioEdit || Number.isNaN(Number(precioEdit)) || Number(precioEdit) <= 0) {
            setErrorEdicion("Ingresa un precio válido");
            return;
        }
        if (!fechaEdit) {
            setErrorEdicion("La fecha de entrega es obligatoria");
            return;
        }
        setGuardandoPedido(true);
        setErrorEdicion(null);
        try {
            await api.patch(`/pedidos/${id}`, {
                descripcion: descripcionEdit.trim(),
                precio: Number(precioEdit),
                fechaEntrega: new Date(fechaEdit).toISOString(),
                notas: notasEdit.trim() || null,
            });
            setEditandoPedido(false);
            await refetch();
        } catch (err) {
            setErrorEdicion(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardandoPedido(false);
        }
    };

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

                    {!editandoPedido ? (
                        <>
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

                            <div className="pt-1 border-t border-gray-50">
                                <p className="text-xs text-gray-400 mb-1">Notas</p>
                                <p className="text-sm text-gray-600">{pedido.notas || "—"}</p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Descripción
                                </label>
                                <textarea
                                    value={descripcionEdit}
                                    onChange={(e) => setDescripcionEdit(e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Precio
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={precioEdit}
                                        onChange={(e) => setPrecioEdit(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Fecha y hora de entrega
                                </label>
                                <input
                                    type="datetime-local"
                                    value={fechaEdit}
                                    onChange={(e) => setFechaEdit(e.target.value)}
                                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={notasEdit}
                                    onChange={(e) => setNotasEdit(e.target.value)}
                                    rows={2}
                                    placeholder="Vacío para quitar notas"
                                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                                />
                            </div>
                            {errorEdicion && (
                                <p className="text-xs text-red-600">{errorEdicion}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditandoPedido(false);
                                        setErrorEdicion(null);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGuardarPedido}
                                    disabled={guardandoPedido}
                                    className="flex-1 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-medium disabled:opacity-50"
                                >
                                    {guardandoPedido ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    )}

                    {!editandoPedido && (
                        <button
                            type="button"
                            onClick={abrirEdicionPedido}
                            className="text-sm font-medium text-pink-600"
                        >
                            Editar detalles del pedido
                        </button>
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

                {["ENTREGADO", "CANCELADO", "NO_RETIRADO"].includes(pedido.estado) && (
                    <p className="text-center text-sm text-gray-400 py-1">
                        El estado del pedido ya no avanza desde aquí; puedes corregir descripción,
                        precio, fecha o notas con &quot;Editar detalles del pedido&quot; si hubo un
                        error al registrar.
                    </p>
                )}

                <div className="h-6" />
            </main>
        </div>
    );
}