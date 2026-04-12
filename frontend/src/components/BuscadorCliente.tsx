// frontend/src/components/BuscadorCliente.tsx
import { useState } from "react";
import { api } from "../lib/api";
import { useClienteBusqueda } from "../hooks/useClienteBusqueda";
import type { ClienteResumen } from "../hooks/useClienteBusqueda";
interface Props {
    onClienteSeleccionado: (cliente: ClienteResumen) => void;
}

export function BuscadorCliente({ onClienteSeleccionado }: Props) {
    const { query, setQuery, resultados, buscando } = useClienteBusqueda();

    // Estado para crear cliente nuevo inline
    const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevoTelefono, setNuevoTelefono] = useState("");
    const [nuevoEmail, setNuevoEmail] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);

    const handleSeleccionar = (cliente: ClienteResumen) => {
        onClienteSeleccionado(cliente);
        setQuery("");
    };

    const handleCrearCliente = async () => {
        if (!nuevoNombre.trim() || !nuevoTelefono.trim()) {
            setErrorCrear("Nombre y teléfono son obligatorios");
            return;
        }

        setGuardando(true);
        setErrorCrear(null);

        try {
            const cliente = await api.post<ClienteResumen>("/clientes", {
                nombre: nuevoNombre.trim(),
                telefono: nuevoTelefono.trim(),
                email: nuevoEmail.trim() || undefined,
            });
            onClienteSeleccionado(cliente);
            // Limpiar el form
            setMostrarFormNuevo(false);
            setNuevoNombre("");
            setNuevoTelefono("");
            setNuevoEmail("");
        } catch (err) {
            setErrorCrear(err instanceof Error ? err.message : "Error al crear cliente");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Campo de búsqueda */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setMostrarFormNuevo(false);
                    }}
                    placeholder="Buscar por nombre o teléfono..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                />
                {buscando && (
                    <span className="absolute right-3 top-3 text-xs text-gray-400">
                        Buscando...
                    </span>
                )}
            </div>

            {/* Resultados de búsqueda */}
            {resultados.length > 0 && (
                <ul className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 shadow-sm">
                    {resultados.map((c) => (
                        <li key={c.id}>
                            <button
                                type="button"
                                onClick={() => handleSeleccionar(c)}
                                className="w-full text-left px-4 py-3 hover:bg-pink-50 active:bg-pink-100 transition-colors"
                            >
                                <p className="text-sm font-medium text-gray-900">{c.nombre}</p>
                                <p className="text-xs text-gray-400">{c.telefono}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Sin resultados + opción de crear */}
            {query.trim().length >= 2 && !buscando && !mostrarFormNuevo && (
                <button
                    type="button"
                    onClick={() => setMostrarFormNuevo(true)}
                    className="text-sm font-medium text-pink-600 underline px-1"
                >
                    + Crear cliente nuevo
                </button>
            )}

            {query.trim().length >= 2 && !buscando && resultados.length === 0 && !mostrarFormNuevo && (
                <p className="text-sm text-gray-400 px-1">No se encontraron clientes</p>
            )}

            {/* Formulario inline de cliente nuevo */}
            {mostrarFormNuevo && (
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide">
                        Cliente nuevo
                    </p>
                    <input
                        type="text"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    <input
                        type="tel"
                        value={nuevoTelefono}
                        onChange={(e) => setNuevoTelefono(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    <input
                        type="email"
                        value={nuevoEmail}
                        onChange={(e) => setNuevoEmail(e.target.value)}
                        placeholder="Email (opcional)"
                        className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    {errorCrear && (
                        <p className="text-xs text-red-600">{errorCrear}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setMostrarFormNuevo(false)}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 bg-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleCrearCliente}
                            disabled={guardando}
                            className="flex-1 py-3 rounded-xl bg-pink-600 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {guardando ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}