import { Navigate, Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { ProductoCard } from "../components/ProductoCard";
import { useMisFavoritos } from "../hooks/useMisFavoritos";
import { getClienteToken } from "../lib/publicApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { HeartIcon, StarIcon } from "../../components/icons";

export default function MisFavoritos() {
    usePageTitle("Mis favoritos");
    const logueado = Boolean(getClienteToken());
    const { favoritos, loading, error, quitar, quitandoId, refetch } = useMisFavoritos();

    if (!logueado) {
        return <Navigate to="/login-cliente" replace />;
    }

    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis favoritos</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Los pasteles que guardaste para más tarde
                </p>

                {error && (
                    <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600 space-y-2">
                        <p>{error}</p>
                        <button type="button" onClick={refetch} className="font-medium text-red-700 underline">
                            Reintentar
                        </button>
                    </div>
                )}

                {!error && loading && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                <div className="aspect-square bg-gray-100" />
                                <div className="p-3 space-y-2">
                                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                                    <div className="h-3 w-1/3 rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!error && !loading && favoritos.length === 0 && (
                    <div className="py-16 text-center">
                        <HeartIcon className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="mt-3 text-gray-500">Aún no tienes favoritos guardados.</p>
                        <Link
                            to="/catalogo"
                            className="mt-4 inline-block rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-95 hover:bg-pink-700"
                        >
                            Explorar catálogo
                        </Link>
                    </div>
                )}

                {!error && favoritos.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {favoritos.map((f, i) => (
                            <ProductoCard
                                key={f.id}
                                producto={f.producto}
                                animationDelayMs={Math.min(i, 8) * 35}
                                accionExtra={
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            void quitar(f.producto.id);
                                        }}
                                        disabled={quitandoId === f.producto.id}
                                        aria-label="Quitar de favoritos"
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-amber-500 shadow-sm backdrop-blur transition-transform duration-150 ease-out active:scale-90 disabled:opacity-50"
                                    >
                                        <StarIcon className="h-4 w-4" filled />
                                    </button>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
