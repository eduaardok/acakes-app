import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useProductoDetalle, type ProductoDetalle as ProductoDetalleData } from "../hooks/useProductoDetalle";
import { publicApi } from "../lib/publicApi";
import { getVisitanteId } from "../lib/visitante";
import { whatsappCotizarUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CakeIcon, StarIcon, HeartIcon } from "../../components/icons";

type Resena = ProductoDetalleData["resenas"][number];

interface ResenasResponse {
    resenas: Resena[];
    page: number;
    totalPages: number;
}

function Estrellas({ calificacion }: { calificacion: number }) {
    return (
        <span className="inline-flex gap-0.5" aria-label={`${calificacion} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < calificacion ? "text-amber-400" : "text-gray-200"}`}
                    filled
                />
            ))}
        </span>
    );
}

export default function ProductoDetalle() {
    const { id } = useParams<{ id: string }>();
    const { producto, loading, error, refetch } = useProductoDetalle(id);
    usePageTitle(producto?.nombre ?? "Producto");

    const [imagenActiva, setImagenActiva] = useState(0);
    const [liked, setLiked] = useState(false);
    const [favorito, setFavorito] = useState(false);
    const [pendiente, setPendiente] = useState(false);

    const [resenasExtra, setResenasExtra] = useState<Resena[]>([]);
    const [resenasPage, setResenasPage] = useState(1);
    const [cargandoResenas, setCargandoResenas] = useState(false);

    const resenas = [...(producto?.resenas ?? []), ...resenasExtra];
    const hayMasResenas = producto ? resenas.length < producto.resenasTotal : false;

    const cargarMasResenas = async () => {
        if (!id || cargandoResenas) return;
        setCargandoResenas(true);
        try {
            const siguientePage = resenasPage + 1;
            const res = await publicApi.get<ResenasResponse>(
                `/producto/${id}/resenas?page=${siguientePage}`
            );
            setResenasExtra((prev) => [...prev, ...res.resenas]);
            setResenasPage(siguientePage);
        } catch {
            // Si falla, el botón sigue disponible para reintentar.
        } finally {
            setCargandoResenas(false);
        }
    };

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
                    <div className="mt-5 flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                            <div className="h-5 w-1/3 animate-pulse rounded-full bg-gray-100" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                        </div>
                    </div>
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
                    <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-gray-100" />
                </div>
            </PublicLayout>
        );
    }

    if (error || !producto) {
        return (
            <PublicLayout>
                <div className="mx-auto max-w-3xl px-4 py-6">
                    <div className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600 space-y-2">
                        <p>{error ?? "Producto no encontrado."}</p>
                        {error && (
                            <button
                                type="button"
                                onClick={refetch}
                                className="font-medium text-red-700 underline"
                            >
                                Reintentar
                            </button>
                        )}
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
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <CakeIcon className="h-16 w-16" />
                        </div>
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
                                    {producto.tematica.nombre}
                                </span>
                            )}
                            {producto.ocasion && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {producto.ocasion.nombre}
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
                            <HeartIcon className="h-5 w-5" filled={liked} />
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
                            <StarIcon className="h-5 w-5" filled={favorito} />
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
                        Reseñas {producto.resenasTotal > 0 && `(${producto.resenasTotal})`}
                    </h2>

                    {resenas.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-400">Aún no hay reseñas para este producto.</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {resenas.map((r) => (
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

                    {hayMasResenas && (
                        <div className="mt-4 flex justify-center">
                            <button
                                type="button"
                                onClick={cargarMasResenas}
                                disabled={cargandoResenas}
                                className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-semibold text-pink-700 transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50"
                            >
                                {cargandoResenas ? "Cargando..." : "Ver más reseñas"}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}
