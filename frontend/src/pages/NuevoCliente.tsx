import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ClienteResumen } from "../hooks/useClienteBusqueda";

export default function NuevoCliente() {
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!nombre.trim() || !telefono.trim()) {
            setError("Nombre y teléfono son obligatorios");
            return;
        }

        setError(null);
        setGuardando(true);

        try {
            const cliente = await api.post<ClienteResumen>("/clientes", {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                email: email.trim() || undefined,
            });
            navigate(`/clientes/${cliente.id}`, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear cliente");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        type="button"
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
                    <h1 className="text-xl font-bold text-gray-900">Nuevo cliente</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
                <section className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Datos del cliente
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre completo"
                        autoComplete="name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Teléfono"
                        autoComplete="tel"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (opcional)"
                        autoComplete="email"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                </section>

                {error && (
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={guardando}
                    className="w-full bg-pink-600 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-transform"
                >
                    {guardando ? "Guardando..." : "Guardar cliente"}
                </button>

                <div className="h-6" />
            </main>
        </div>
    );
}
