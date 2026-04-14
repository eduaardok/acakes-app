import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useCliente } from "../hooks/useCliente";
import { usePageTitle } from "../hooks/usePageTitle";
import type { TipoObservacion } from "../hooks/useCliente";

// Badge de comportamiento — negativo si tiene observaciones negativas
const obsNegativas = new Set<TipoObservacion>(["PAGO_TARDIO", "NO_RETIRO", "CANCELACION_TARDE"]);

const obsConfig: Record<TipoObservacion, { label: string; bg: string; text: string }> = {
    PAGO_TARDIO:       { label: "Pago tardío",       bg: "bg-red-100",    text: "text-red-700" },
    NO_RETIRO:         { label: "No retiró",          bg: "bg-orange-100", text: "text-orange-700" },
    CANCELACION_TARDE: { label: "Canceló tarde",      bg: "bg-yellow-100", text: "text-yellow-700" },
    POSITIVA:          { label: "Positiva",           bg: "bg-green-100",  text: "text-green-700" },
    OTRO:              { label: "Otro",               bg: "bg-gray-100",   text: "text-gray-600" },
};

const estadoLabel: Record<string, string> = {
    BORRADOR: "Borrador", CONFIRMADO: "Confirmado", EN_PROCESO: "En proceso",
    LISTO: "¡Listo!", ENTREGADO: "Entregado", CANCELADO: "Cancelado", NO_RETIRADO: "No retirado",
};

function formatFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString("es-EC", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export default function DetalleCliente() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { cliente, loading, error, refetch } = useCliente(id!);

    const pageTitle = useMemo(() => (cliente ? cliente.nombre : "Cliente"), [cliente]);
    usePageTitle(pageTitle);

    // Form de observación manual
    const [mostrarForm, setMostrarForm] = useState(false);
    const [tipo, setTipo] = useState<TipoObservacion>("OTRO");
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState<string | null>(null);

    const [editandoCliente, setEditandoCliente] = useState(false);
    const [nombreEdit, setNombreEdit] = useState("");
    const [telefonoEdit, setTelefonoEdit] = useState("");
    const [emailEdit, setEmailEdit] = useState("");
    const [guardandoCliente, setGuardandoCliente] = useState(false);
    const [errorCliente, setErrorCliente] = useState<string | null>(null);

    const abrirEdicionCliente = () => {
        if (!cliente) return;
        setNombreEdit(cliente.nombre);
        setTelefonoEdit(cliente.telefono);
        setEmailEdit(cliente.email ?? "");
        setErrorCliente(null);
        setEditandoCliente(true);
    };

    const handleGuardarCliente = async () => {
        if (!nombreEdit.trim() || !telefonoEdit.trim()) {
            setErrorCliente("Nombre y teléfono son obligatorios");
            return;
        }
        setGuardandoCliente(true);
        setErrorCliente(null);
        try {
            await api.patch(`/clientes/${id}`, {
                nombre: nombreEdit.trim(),
                telefono: telefonoEdit.trim(),
                email: emailEdit.trim() || null,
            });
            setEditandoCliente(false);
            await refetch();
        } catch (err) {
            setErrorCliente(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardandoCliente(false);
        }
    };

    const handleGuardarObservacion = async () => {
        if (!descripcion.trim()) {
            setErrorForm("La descripción es obligatoria");
            return;
        }
        setGuardando(true);
        setErrorForm(null);
        try {
            await api.post(`/clientes/${id}/observaciones`, { tipo, descripcion: descripcion.trim() });
            setMostrarForm(false);
            setDescripcion("");
            setTipo("OTRO");
            await refetch();
        } catch (err) {
            setErrorForm(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (error || !cliente) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
                <p className="text-red-500 text-sm">{error ?? "Cliente no encontrado"}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-400 underline">Volver</button>
            </div>
        );
    }

    const tieneObsNegativas = cliente.observaciones.some((o) => obsNegativas.has(o.tipo));
    const pedidosEntregados = cliente.pedidos.filter((p) => p.estado === "ENTREGADO").length;

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
                    <h1 className="text-xl font-bold text-gray-900 truncate">{cliente.nombre}</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">

                {/* Card: Info del cliente */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            {!editandoCliente ? (
                                <>
                                    <p className="font-semibold text-gray-900 text-lg">{cliente.nombre}</p>
                                    <p className="text-sm text-gray-500">{cliente.telefono}</p>
                                    {cliente.email ? (
                                        <p className="text-sm text-gray-400">{cliente.email}</p>
                                    ) : (
                                        <p className="text-sm text-gray-300">Sin email</p>
                                    )}
                                    <p className="text-xs text-gray-300 mt-1">
                                        Cliente desde {formatFecha(cliente.creadoEn)}
                                    </p>
                                </>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Nombre
                                        </label>
                                        <input
                                            value={nombreEdit}
                                            onChange={(e) => setNombreEdit(e.target.value)}
                                            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={telefonoEdit}
                                            onChange={(e) => setTelefonoEdit(e.target.value)}
                                            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Email (opcional)
                                        </label>
                                        <input
                                            type="email"
                                            value={emailEdit}
                                            onChange={(e) => setEmailEdit(e.target.value)}
                                            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                    </div>
                                    {errorCliente && (
                                        <p className="text-xs text-red-600">{errorCliente}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditandoCliente(false);
                                                setErrorCliente(null);
                                            }}
                                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGuardarCliente}
                                            disabled={guardandoCliente}
                                            className="flex-1 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-medium disabled:opacity-50"
                                        >
                                            {guardandoCliente ? "Guardando..." : "Guardar"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Badge de comportamiento */}
                        {!editandoCliente && tieneObsNegativas && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700 shrink-0">
                                ⚠️ Atención
                            </span>
                        )}
                    </div>

                    {!editandoCliente && (
                        <button
                            type="button"
                            onClick={abrirEdicionCliente}
                            className="text-sm font-medium text-pink-600"
                        >
                            Editar datos del cliente
                        </button>
                    )}

                    {/* Resumen rápido */}
                    <div className="flex gap-4 pt-2 border-t border-gray-50">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{cliente.pedidos.length}</p>
                            <p className="text-xs text-gray-400">pedidos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-600">{pedidosEntregados}</p>
                            <p className="text-xs text-gray-400">entregados</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{cliente.observaciones.length}</p>
                            <p className="text-xs text-gray-400">observaciones</p>
                        </div>
                    </div>
                </div>

                {/* Historial de pedidos */}
                <section className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                        Historial de pedidos
                    </p>
                    {cliente.pedidos.length === 0 ? (
                        <p className="text-sm text-gray-400 px-1">Sin pedidos aún</p>
                    ) : (
                        <div className="space-y-2">
                            {cliente.pedidos.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => navigate(`/pedidos/${p.id}`)}
                                    className="w-full text-left bg-white rounded-2xl border border-gray-100 px-4 py-3 active:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm text-gray-900 flex-1 truncate">{p.descripcion}</p>
                                        <p className="text-sm font-semibold text-gray-900 shrink-0">
                                            ${Number(p.precio).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-400">{formatFecha(p.fechaEntrega)}</p>
                                        <span className="text-xs text-gray-500">{estadoLabel[p.estado]}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Observaciones */}
                <section className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Observaciones
                        </p>
                        {!mostrarForm && (
                            <button
                                onClick={() => setMostrarForm(true)}
                                className="text-xs font-medium text-pink-600"
                            >
                                + Agregar
                            </button>
                        )}
                    </div>

                    {/* Form de nueva observación */}
                    {mostrarForm && (
                        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as TipoObservacion)}
                                className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                            >
                                <option value="POSITIVA">Positiva</option>
                                <option value="PAGO_TARDIO">Pago tardío</option>
                                <option value="NO_RETIRO">No retiró</option>
                                <option value="CANCELACION_TARDE">Canceló tarde</option>
                                <option value="OTRO">Otro</option>
                            </select>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción de la observación..."
                                rows={3}
                                className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                            />
                            {errorForm && <p className="text-xs text-red-600">{errorForm}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setMostrarForm(false); setErrorForm(null); }}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 bg-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGuardarObservacion}
                                    disabled={guardando}
                                    className="flex-1 py-3 rounded-xl bg-pink-600 text-white text-sm font-medium disabled:opacity-50"
                                >
                                    {guardando ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lista de observaciones */}
                    {cliente.observaciones.length === 0 && !mostrarForm ? (
                        <p className="text-sm text-gray-400 px-1">Sin observaciones</p>
                    ) : (
                        <div className="space-y-2">
                            {cliente.observaciones.map((o) => {
                                const cfg = obsConfig[o.tipo];
                                return (
                                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                                                {cfg.label}
                                            </span>
                                            {o.autoGenerada && (
                                                <span className="text-xs text-gray-300">automática</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700">{o.descripcion}</p>
                                        <p className="text-xs text-gray-300 mt-1">{formatFecha(o.fecha)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="h-6" />
            </main>
        </div>
    );
}