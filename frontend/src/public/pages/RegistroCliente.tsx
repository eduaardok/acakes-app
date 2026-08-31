import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { publicApi, setClienteToken } from "../lib/publicApi";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function RegistroCliente() {
    usePageTitle("Crear cuenta");
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const data = await publicApi.post<{ token: string }>("/registro-cliente", {
                nombre,
                email,
                password,
            });
            setClienteToken(data.token);
            navigate("/catalogo");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear la cuenta");
        } finally {
            setCargando(false);
        }
    };

    return (
        <PublicLayout>
            <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">
                <form
                    onSubmit={handleSubmit}
                    className="animate-rise-in w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm"
                >
                    <h1 className="text-center text-2xl font-bold text-gray-800">Crea tu cuenta</h1>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Guarda favoritos y recibe recordatorios de fechas especiales
                    </p>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-shadow duration-150 ease-out focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-shadow duration-150 ease-out focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-shadow duration-150 ease-out focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                autoComplete="new-password"
                                minLength={4}
                                required
                            />
                        </div>

                        {error && (
                            <div className="animate-rise-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={cargando || !email || !password || !nombre}
                            className="w-full rounded-xl bg-pink-500 py-3 text-base font-semibold text-white transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-pink-600 hover:shadow-md hover:shadow-pink-200/60 active:scale-[0.98] disabled:bg-pink-300 disabled:shadow-none"
                        >
                            {cargando ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                    </div>

                    <p className="mt-5 text-center text-sm text-gray-500">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login-cliente" className="font-medium text-pink-700 underline">
                            Ingresa
                        </Link>
                    </p>
                </form>
            </div>
        </PublicLayout>
    );
}
