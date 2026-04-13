import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientes } from "../hooks/useClientes";

export default function Clientes() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const { clientes, loading, error } = useClientes(q);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
                        <button
                            type="button"
                            onClick={() => navigate("/clientes/nuevo")}
                            className="shrink-0 p-2.5 rounded-full bg-pink-600 text-white shadow-sm active:scale-95 transition-transform"
                            aria-label="Nuevo cliente"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por nombre o teléfono..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                    />
                </div>
            </header>

            <main className="px-4 py-4 max-w-lg mx-auto">

                {/* Carga */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Lista vacía */}
                {!loading && !error && clientes.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-4xl">👤</p>
                        <p className="text-gray-500 mt-3">
                            {q ? "No se encontraron clientes" : "Aún no hay clientes"}
                        </p>
                    </div>
                )}

                {/* Lista */}
                {!loading && !error && clientes.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
                            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
                        </p>
                        {clientes.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => navigate(`/clientes/${c.id}`)}
                                className="w-full text-left bg-white rounded-2xl border border-gray-100 px-4 py-3 active:bg-gray-50 transition-colors"
                            >
                                <p className="font-semibold text-gray-900">{c.nombre}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{c.telefono}</p>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}