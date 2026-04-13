import { useNavigate, useLocation } from "react-router-dom";

const iconWrap = "flex h-6 w-6 shrink-0 items-center justify-center";

const navItems = [
    {
        path: "/",
        label: "Pedidos",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
        ),
    },
    {
        path: "/ingresos",
        label: "Ingresos",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
    {
        path: "/cuenta",
        label: "Usuario",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-3 2.5-6 8-6s8 3 8 6" />
            </svg>
        ),
    },
] as const;

const itemBtn =
    "flex min-h-[3.25rem] min-w-0 w-full flex-col items-center justify-center gap-0.5 px-1 py-2 touch-manipulation [-webkit-tap-highlight-color:transparent]";

export function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto grid w-full max-w-lg grid-cols-4">
                {navItems.map((item) => {
                    const active = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`${itemBtn} ${
                                active ? "text-pink-600" : "text-gray-400"
                            }`}
                            aria-current={active ? "page" : undefined}
                        >
                            <span className={iconWrap}>{item.icon}</span>
                            <span className="w-full min-w-0 px-0.5 text-center text-[11px] font-medium leading-tight sm:text-xs">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
