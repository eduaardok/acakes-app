import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { publicApi } from "../lib/publicApi";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function RestablecerPassword() {
    usePageTitle("Restablecer contraseña");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [exito, setExito] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmarPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setCargando(true);
        try {
            await publicApi.post("/restablecer-password", { token, nuevaPassword: password });
            setExito(true);
            setTimeout(() => navigate("/login-cliente"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
        } finally {
            setCargando(false);
        }
    };

    return (
        <PublicLayout>
            <div className="w-full bg-gradient-to-br from-pink-100 to-brand-purple-100">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">
                    <div className="animate-rise-in w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
                        <h1 className="text-center text-2xl font-bold text-gray-800">Crea una nueva contraseña</h1>

                        {!token ? (
                            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                Este enlace es inválido. Solicita uno nuevo desde{" "}
                                <Link to="/olvide-password" className="font-medium underline">
                                    recuperar contraseña
                                </Link>
                                .
                            </div>
                        ) : exito ? (
                            <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                                Contraseña actualizada. Redirigiendo a ingresar...
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-full border border-gray-300 px-4 py-3 text-base transition-shadow duration-150 ease-out focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        autoComplete="new-password"
                                        minLength={4}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmarPassword}
                                        onChange={(e) => setConfirmarPassword(e.target.value)}
                                        className="w-full rounded-full border border-gray-300 px-4 py-3 text-base transition-shadow duration-150 ease-out focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        autoComplete="new-password"
                                        minLength={4}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="animate-rise-in rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={cargando || !password || !confirmarPassword}
                                    className="w-full rounded-full bg-pink-600 py-3 text-base font-semibold text-white shadow-lg shadow-pink-600/25 transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-600/30 active:scale-[0.98] disabled:bg-pink-300 disabled:shadow-none"
                                >
                                    {cargando ? "Guardando..." : "Guardar nueva contraseña"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
