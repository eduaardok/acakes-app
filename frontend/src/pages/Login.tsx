import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const data = await api.post<{ token: string }>("/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">

                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🧁</div>
                    <h1 className="text-2xl font-bold text-gray-800">Ainoa's Cakes</h1>
                    <p className="text-gray-500 text-sm mt-1">Ingresa para continuar</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usuario
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="usuario"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={cargando || !email || !password}
                        className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold rounded-xl py-3 text-base transition-colors"
                    >
                        {cargando ? "Ingresando..." : "Ingresar"}
                    </button>
                </div>

            </div>
        </div>
    );
}