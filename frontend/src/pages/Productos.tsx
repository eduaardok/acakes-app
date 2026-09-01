import { useNavigate } from "react-router-dom";
import { useProductos } from "../hooks/useProductos";
import { usePageTitle } from "../hooks/usePageTitle";
import { IconButton } from "../components/IconButton";
import { Skeleton } from "../components/Skeleton";
import { CakeIcon } from "../components/icons";

export default function Productos() {
    usePageTitle("Productos");
    const navigate = useNavigate();
    const { productos, loading, error, hayMas, cargarMas } = useProductos();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
                    <h1 className="text-xl font-bold text-gray-900">Productos</h1>
                    <div className="flex items-center gap-1">
                        <IconButton
                            onClick={() => navigate("/panel/categorias")}
                            aria-label="Gestionar categorías"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.82Z" />
                                <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                            </svg>
                        </IconButton>
                        <IconButton
                            variant="solid"
                            onClick={() => navigate("/panel/productos/nuevo")}
                            aria-label="Nuevo producto"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </IconButton>
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 max-w-lg mx-auto">
                {loading && productos.length === 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <Skeleton className="h-28 w-full rounded-none" />
                                <div className="p-3 space-y-1.5">
                                    <Skeleton className="h-3.5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && productos.length === 0 && (
                    <div className="text-center py-16">
                        <CakeIcon className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="text-gray-500 mt-3">Aún no hay productos en el catálogo</p>
                    </div>
                )}

                {productos.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
                            {productos.length} producto{productos.length !== 1 ? "s" : ""}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {productos.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => navigate(`/panel/productos/${p.id}`)}
                                    className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden active:bg-gray-50 transition-colors"
                                >
                                    <div className="h-28 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {p.imagenes[0] ? (
                                            <img
                                                src={p.imagenes[0].url}
                                                alt={p.nombre}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <CakeIcon className="h-8 w-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{p.nombre}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                                            {[p.tematica, p.ocasion].filter(Boolean).join(" · ") || "—"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {hayMas && (
                            <div className="pt-1 flex justify-center">
                                <button
                                    type="button"
                                    onClick={cargarMas}
                                    disabled={loading}
                                    className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-semibold text-pink-700 transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Cargando..." : "Cargar más"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
