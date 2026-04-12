// frontend/src/pages/NuevoPedido.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { BuscadorCliente } from "../components/BuscadorCliente";
import type { ClienteResumen } from "../hooks/useClienteBusqueda";

export default function NuevoPedido() {
    const navigate = useNavigate();

    // Cliente seleccionado
    const [cliente, setCliente] = useState<ClienteResumen | null>(null);

    // Campos del pedido
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [notas, setNotas] = useState("");

    // UI
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        // Validación mínima
        if (!cliente) {
            setError("Selecciona un cliente");
            return;
        }
        if (!descripcion.trim()) {
            setError("La descripción es obligatoria");
            return;
        }
        if (!precio || isNaN(Number(precio)) || Number(precio) <= 0) {
            setError("Ingresa un precio válido");
            return;
        }
        if (!fechaEntrega) {
            setError("La fecha de entrega es obligatoria");
            return;
        }

        setError(null);
        setGuardando(true);

        try {
            await api.post("/pedidos", {
                clienteId: cliente.id,
                descripcion: descripcion.trim(),
                precio: Number(precio),
                fechaEntrega: new Date(fechaEntrega).toISOString(),
                notas: notas.trim() || undefined,
                // estado omitido → el backend asigna BORRADOR por defecto
            });
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar el pedido");
        } finally {
            setGuardando(false);
        }
    };

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
                    <h1 className="text-xl font-bold text-gray-900">Nuevo pedido</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">

                {/* Sección: Cliente */}
                <section className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Cliente
                    </label>

                    {/* Cliente ya seleccionado */}
                    {cliente ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                                <p className="text-xs text-gray-400">{cliente.telefono}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCliente(null)}
                                className="text-xs text-gray-400 underline"
                            >
                                Cambiar
                            </button>
                        </div>
                    ) : (
                        <BuscadorCliente onClienteSeleccionado={setCliente} />
                    )}
                </section>

                {/* Sección: Datos del pedido */}
                <section className="space-y-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Detalle del pedido
                    </label>

                    <div>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción (ej: Torta de chocolate 3 pisos para 20 personas)"
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white resize-none"
                        />
                    </div>

                    <div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Fecha de entrega</label>
                        <input
                            type="datetime-local"
                            value={fechaEntrega}
                            onChange={(e) => setFechaEntrega(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                        />
                    </div>

                    <div>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Notas adicionales (opcional)"
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white resize-none"
                        />
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Botón guardar */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={guardando}
                    className="w-full bg-pink-600 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-transform"
                >
                    {guardando ? "Guardando..." : "Guardar pedido"}
                </button>

                {/* Espacio para que el botón no quede pegado al borde en iPhone */}
                <div className="h-6" />
            </main>
        </div>
    );
}