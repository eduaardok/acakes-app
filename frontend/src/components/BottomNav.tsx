import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
    {
        path: "/",
        label: "Pedidos",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
            </svg>
        ),
    },
    {
        path: "/clientes",
        label: "Clientes",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
        ),
    },
    {
        path: "/ingresos",
        label: "Ingresos",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
] as const;

export function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 pb-safe">
            <div className="flex max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const active = pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                                active ? "text-pink-600" : "text-gray-400"
                            }`}
                        >
                            {tab.icon}
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}

                {/* Logout — fuera de los tabs principales */}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-300 hover:text-gray-400 transition-colors"
                    aria-label="Cerrar sesión"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="text-xs font-medium">Salir</span>
                </button>
            </div>
        </nav>
    );
}