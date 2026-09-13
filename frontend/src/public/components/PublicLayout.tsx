import { Link, useNavigate } from "react-router-dom";
import { getClienteToken, clearClienteToken } from "../lib/publicApi";
import { GridIcon, HeartIcon } from "../../components/icons";

interface Props {
    children: React.ReactNode;
}

export function PublicLayout({ children }: Props) {
    const navigate = useNavigate();
    const logueado = Boolean(getClienteToken());

    const cerrarSesion = () => {
        clearClienteToken();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-pink-50">
            <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/wordmark.png" alt="Ainoa's Cakes" className="h-8 w-auto object-contain" />
                    </Link>

                    <nav className="flex items-center gap-3 text-sm font-medium text-gray-600">
                        <Link
                            to="/catalogo"
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-150 ease-out hover:bg-pink-50 hover:text-pink-700"
                        >
                            <GridIcon className="h-4 w-4" />
                            Catálogo
                        </Link>
                        {logueado ? (
                            <>
                                <Link
                                    to="/mis-favoritos"
                                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-150 ease-out hover:bg-pink-50 hover:text-pink-700"
                                >
                                    <HeartIcon className="h-4 w-4" />
                                    Favoritos
                                </Link>
                                <button
                                    type="button"
                                    onClick={cerrarSesion}
                                    className="rounded-full px-3 py-1.5 transition-colors duration-150 ease-out hover:bg-pink-50 hover:text-pink-700"
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login-cliente"
                                className="rounded-full bg-pink-600 px-3 py-1.5 text-white transition-[background-color,transform] duration-150 ease-out active:scale-95 hover:bg-pink-700"
                            >
                                Ingresar
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
