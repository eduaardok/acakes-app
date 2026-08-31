import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useProductoDetalle } from "../hooks/useProductoDetalle";
import { publicApi } from "../lib/publicApi";
import { getVisitanteId } from "../lib/visitante";
import { whatsappCotizarUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";

function Estrellas({ calificacion }: { calificacion: number }) {
    return (
        <span className="text-amber-400" aria-label={`${calificacion} de 5 estrellas`}>
            {"★".repeat(calificacion)}
            <span className="text-gray-200">{"★".repeat(5 - calificacion)}</span>
        </span>
    );
}

export default function ProductoDetalle() {
    const { id } = useParams<{ id: string }>();
    const { producto, loading, error } = useProductoDetalle(id);
    usePageTitle(producto?.nombre ?? "Producto");

    const [imagenActiva, setImagenActiva] = useState(0);
    const [liked, setLiked] = useState(false);
    const [favorito, setFavorito] = useState(false);
    const [pendiente, setPendiente] = useState(false);

    const toggle = async (tipo: "like" | "favorito") => {
        if (!id || pendiente) return;
        setPendiente(true);
        const activo = tipo === "like" ? liked : favorito;
        const setActivo = tipo === "like" ? setLiked : setFavorito;
        const headers = { "X-Visitante-Id": getVisitanteId() };

        try {
            if (activo) {
                await publicApi.del(`/producto/${id}/${tipo}`, headers);
            } else {
                await publicApi.post(`/producto/${id}/${tipo}`, undefined, headers);
            }
            setActivo(!activo);
        } catch {
            // Si falla, se mantiene el estado visual anterior.
        } finally {
            setPendiente(false);
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="mx-auto max-w-3xl px-4 py-6">
                    <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
                    <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
            </PublicLayout>
        );
    }

    if (error || !producto) {
        return (
            <PublicLayout>
                <div className="mx-auto max-w-3xl px-4 py-6">
                    <div className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600">
                        {error ?? "Producto no encontrado."}
                    </div>
                    <Link to="/catalogo" className="mt-4 block text-center text-sm font-medium text-pink-700 underline">
                        Volver al catálogo
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    const imagenes = producto.imagenes;

    return (
        <PublicLayout>
            <div className="animate-rise-in mx-auto max-w-3xl px-4 py-6">
                {/* Galería */}
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                    {imagenes[imagenActiva] ? (
                        <img
                            src={imagenes[imagenActiva].url}
                            alt={producto.nombre}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl">🎂</div>
                    )}
                </div>

                {imagenes.length > 1 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {imagenes.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setImagenActiva(i)}
                                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors duration-150 ease-out ${
                                    i === imagenActiva ? "border-pink-500" : "border-transparent"
                                }`}
                            >
                                <img
                                    src={img.url}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {producto.tematica && (
                                <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700">
                                    {producto.tematica}
                                </span>
                            )}
                            {producto.ocasion && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {producto.ocasion}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => toggle("like")}
                            aria-pressed={liked}
                            aria-label="Me gusta"
                            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 ${
                                liked ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-400"
                            }`}
                        >
                            ♥
                        </button>
                        <button
                            type="button"
                            onClick={() => toggle("favorito")}
                            aria-pressed={favorito}
                            aria-label="Favorito"
                            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 ${
                                favorito ? "border-amber-400 bg-amber-50 text-amber-500" : "border-gray-200 text-gray-400"
                            }`}
                        >
                            ★
                        </button>
                    </div>
                </div>

                {producto.descripcion && (
                    <p className="mt-3 text-gray-600 leading-relaxed">{producto.descripcion}</p>
                )}

                {/* Cotizar por WhatsApp — único mecanismo de contacto, nunca precio */}
                <a
                    href={whatsappCotizarUrl(producto.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] hover:bg-emerald-600"
                >
                    Cotizar por WhatsApp
                </a>

                {/* Reseñas */}
                <section className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900">
                        Reseñas {producto.resenas.length > 0 && `(${producto.resenas.length})`}
                    </h2>

                    {producto.resenas.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-400">Aún no hay reseñas para este producto.</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {producto.resenas.map((r) => (
                                <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900">{r.usuario.nombre}</p>
                                        <Estrellas calificacion={r.calificacion} />
                                    </div>
                                    {r.comentario && (
                                        <p className="mt-1.5 text-sm text-gray-600">{r.comentario}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}
