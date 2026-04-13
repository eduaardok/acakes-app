import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface UsuarioMe {
    id: number;
    email: string;
    creadoEn: string;
}

export default function Cuenta() {
    const navigate = useNavigate();
    const [cargandoPerfil, setCargandoPerfil] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [passwordNueva2, setPasswordNueva2] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [creadoEn, setCreadoEn] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [perfilCargado, setPerfilCargado] = useState(false);
    const [reintentoPerfil, setReintentoPerfil] = useState(0);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setCargandoPerfil(true);
            setError(null);
            try {
                const u = await api.get<UsuarioMe>("/auth/me");
                if (cancel) return;
                setNombreUsuario(u.email);
                setCreadoEn(u.creadoEn);
                setPerfilCargado(true);
            } catch {
                if (!cancel) {
                    setError("No se pudo cargar tu cuenta.");
                    setPerfilCargado(false);
                }
            } finally {
                if (!cancel) setCargandoPerfil(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [reintentoPerfil]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleGuardar = async () => {
        setError(null);
        setOk(null);

        if (passwordNueva || passwordNueva2) {
            if (passwordNueva !== passwordNueva2) {
                setError("Las contraseñas nuevas no coinciden");
                return;
            }
            if (passwordNueva.trim().length > 0 && passwordNueva.trim().length < 4) {
                setError("La nueva contraseña debe tener al menos 4 caracteres");
                return;
            }
        }

        if (!passwordActual.trim()) {
            setError("Ingresa tu contraseña actual para guardar cambios");
            return;
        }

        setGuardando(true);
        try {
            const res = await api.patch<{ token: string; usuario: UsuarioMe }>("/auth/me", {
                nombreUsuario: nombreUsuario.trim(),
                passwordNueva: passwordNueva.trim() || undefined,
                passwordActual: passwordActual.trim(),
            });
            localStorage.setItem("token", res.token);
            setNombreUsuario(res.usuario.email);
            setPasswordNueva("");
            setPasswordNueva2("");
            setPasswordActual("");
            setOk("Cambios guardados");
            if (res.usuario.creadoEn) setCreadoEn(res.usuario.creadoEn);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardando(false);
        }
    };

    const fechaRegistro =
        creadoEn &&
        new Date(creadoEn).toLocaleDateString("es-EC", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900 max-w-lg mx-auto">Mi cuenta</h1>
                <p className="text-sm text-gray-500 max-w-lg mx-auto mt-0.5">
                    Datos de acceso a la app
                </p>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {cargandoPerfil && (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded-xl" />
                        <div className="h-10 bg-gray-200 rounded-xl" />
                    </div>
                )}

                {!cargandoPerfil && !perfilCargado && error && (
                    <div className="bg-red-50 rounded-xl p-4 text-center space-y-3">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setReintentoPerfil((n) => n + 1);
                            }}
                            className="text-sm font-medium text-red-800 underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!cargandoPerfil && perfilCargado && (
                    <section className="space-y-4">
                        {fechaRegistro && (
                            <p className="text-xs text-gray-400 px-1">
                                Cuenta creada el{" "}
                                <span className="text-gray-600">{fechaRegistro}</span>
                            </p>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                value={nombreUsuario}
                                onChange={(e) => setNombreUsuario(e.target.value)}
                                autoComplete="username"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                            <p className="text-xs text-gray-400 mt-1 px-0.5">
                                Es el mismo dato con el que inicias sesión (correo único en el
                                sistema).
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                Nueva contraseña
                            </label>
                            <input
                                type="password"
                                value={passwordNueva}
                                onChange={(e) => setPasswordNueva(e.target.value)}
                                autoComplete="new-password"
                                placeholder="Dejar vacío para no cambiar"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                            <p className="text-xs text-gray-400 mt-1 px-0.5">
                                Si la cambias, usa al menos 4 caracteres.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                Confirmar nueva contraseña
                            </label>
                            <input
                                type="password"
                                value={passwordNueva2}
                                onChange={(e) => setPasswordNueva2(e.target.value)}
                                autoComplete="new-password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                Contraseña actual
                            </label>
                            <input
                                type="password"
                                value={passwordActual}
                                onChange={(e) => setPasswordActual(e.target.value)}
                                autoComplete="current-password"
                                placeholder="Obligatoria al guardar cambios"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                            />
                        </div>

                        {ok && (
                            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-800">
                                {ok}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGuardar}
                            disabled={guardando}
                            className="w-full bg-pink-600 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-[0.99] transition-transform"
                        >
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </section>
                )}

                <section className="border-t border-gray-200 pt-6 space-y-3">
                    <div>
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Sesión
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Cierra la sesión solo en este dispositivo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white active:bg-gray-50"
                    >
                        Cerrar sesión
                    </button>
                </section>
            </main>
        </div>
    );
}
