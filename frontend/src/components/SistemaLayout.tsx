import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "./IconButton";
import { Button } from "./Button";
import { ShieldIcon } from "./icons";
import { esSystemAdmin } from "../lib/authAdmin";

const TABS = [
    { path: "/panel/sistema/usuarios", label: "Usuarios" },
    { path: "/panel/sistema/cuentas-cliente", label: "Cuentas de clientes" },
] as const;

/**
 * Cascarón de la sección "Administración del sistema": header, tabs y el gate
 * por rol.
 *
 * El gate es UX, no seguridad — evita que un ADMIN que escribe la URL a mano
 * vea una pantalla rota llena de 403. La autorización de verdad vive en el
 * backend (requireRole(SYSTEM_ADMIN) sobre /admin/*), que rechaza el request
 * sin importar lo que muestre esta UI.
 */
export function SistemaLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    if (!esSystemAdmin()) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
                    <div className="mx-auto flex max-w-lg items-center gap-3">
                        <IconButton onClick={() => navigate("/panel")} className="-ml-2" aria-label="Volver">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </IconButton>
                        <h1 className="text-xl font-bold text-gray-900">Acceso denegado</h1>
                    </div>
                </header>

                <main className="mx-auto max-w-lg space-y-4 px-4 py-10 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple-50 text-brand-purple-700">
                        <ShieldIcon className="h-7 w-7" />
                    </span>
                    <div className="space-y-1">
                        <p className="text-base font-semibold text-gray-900">
                            Esta sección es solo para administradores del sistema
                        </p>
                        <p className="text-sm text-gray-500">
                            Tu cuenta no tiene ese permiso. Si creés que debería tenerlo, pedile a un
                            administrador del sistema que te lo asigne.
                        </p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/panel")}>
                        Volver al panel
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <header className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto max-w-lg px-4 py-4">
                    <div className="flex items-center gap-3">
                        <IconButton onClick={() => navigate("/panel/cuenta")} className="-ml-2" aria-label="Volver">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </IconButton>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold text-gray-900">
                                Administración del sistema
                            </h1>
                            <p className="truncate text-sm text-gray-500">Usuarios, roles y cuentas</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-lg px-4">
                    <div className="flex gap-1 border-t border-gray-100 pt-1">
                        {TABS.map((tab) => {
                            const activa = pathname === tab.path;
                            return (
                                <button
                                    key={tab.path}
                                    type="button"
                                    onClick={() => navigate(tab.path)}
                                    aria-current={activa ? "page" : undefined}
                                    className={`-mb-px min-w-0 flex-1 truncate border-b-2 px-2 py-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
                                        activa
                                            ? "border-pink-600 text-pink-600"
                                            : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-lg space-y-5 px-4 py-6">{children}</main>
        </div>
    );
}
