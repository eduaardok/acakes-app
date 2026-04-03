import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                    Cerrar sesión
                </button>
            </div>

            <p className="text-gray-500">Pedidos del día — próximo día</p>
        </div>
    );
}