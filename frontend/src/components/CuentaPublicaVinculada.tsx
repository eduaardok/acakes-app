import { useState } from "react";
import { api } from "../lib/api";
import { useUsuarioClienteVinculado, type UsuarioClienteResumen } from "../hooks/useUsuarioClienteVinculado";
import { Button } from "./Button";

interface Props {
    clienteId: string;
}

function formatFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString("es-EC", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export function CuentaPublicaVinculada({ clienteId }: Props) {
    const { usuario, loading, error, vincular, desvincular } = useUsuarioClienteVinculado(clienteId);

    const [email, setEmail] = useState("");
    const [resultados, setResultados] = useState<UsuarioClienteResumen[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [vinculando, setVinculando] = useState(false);
    const [desvinculando, setDesvinculando] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);
    const [buscado, setBuscado] = useState(false);

    const handleBuscar = async () => {
        if (!email.trim()) return;
        setBuscando(true);
        setErrorAccion(null);
        setBuscado(true);
        try {
            const data = await api.get<UsuarioClienteResumen[]>(
                `/usuarios-cliente/buscar?email=${encodeURIComponent(email.trim())}`
            );
            setResultados(data);
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al buscar");
        } finally {
            setBuscando(false);
        }
    };

    const handleVincular = async (usuarioClienteId: number) => {
        setVinculando(true);
        setErrorAccion(null);
        try {
            await vincular(usuarioClienteId);
            setResultados([]);
            setEmail("");
            setBuscado(false);
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al vincular");
        } finally {
            setVinculando(false);
        }
    };

    const handleDesvincular = async () => {
        if (!usuario) return;
        if (!window.confirm(`¿Desvincular la cuenta pública de ${usuario.nombre}?`)) return;

        setDesvinculando(true);
        setErrorAccion(null);
        try {
            await desvincular();
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al desvincular");
        } finally {
            setDesvinculando(false);
        }
    };

    return (
        <section className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Cuenta pública vinculada
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                {loading && <p className="text-sm text-gray-400">Cargando...</p>}

                {!loading && error && <p className="text-sm text-red-600">{error}</p>}

                {!loading && !error && usuario && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{usuario.nombre}</p>
                            <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                            <p className="text-xs text-gray-300 mt-0.5">
                                Cuenta creada {formatFecha(usuario.createdAt)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDesvincular}
                            disabled={desvinculando}
                            className="shrink-0 text-sm font-medium text-red-600 disabled:opacity-50"
                        >
                            {desvinculando ? "Desvinculando..." : "Desvincular"}
                        </button>
                    </div>
                )}

                {!loading && !error && !usuario && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">
                            Este cliente no tiene una cuenta pública vinculada.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                                placeholder="Buscar por email..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="shrink-0"
                                onClick={handleBuscar}
                                disabled={!email.trim()}
                                loading={buscando}
                            >
                                {buscando ? "Buscando..." : "Buscar"}
                            </Button>
                        </div>

                        {errorAccion && <p className="text-xs text-red-600">{errorAccion}</p>}

                        {buscado && !buscando && resultados.length === 0 && !errorAccion && (
                            <p className="text-xs text-gray-400">
                                Sin cuentas públicas disponibles con ese email.
                            </p>
                        )}

                        {resultados.length > 0 && (
                            <div className="space-y-2">
                                {resultados.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{r.nombre}</p>
                                            <p className="text-xs text-gray-500 truncate">{r.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleVincular(r.id)}
                                            disabled={vinculando}
                                            className="shrink-0 text-sm font-medium text-pink-600 disabled:opacity-50"
                                        >
                                            Vincular
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
