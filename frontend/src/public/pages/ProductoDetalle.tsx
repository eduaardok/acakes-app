import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useProductoDetalle, type ProductoDetalle as ProductoDetalleData } from "../hooks/useProductoDetalle";
import { publicApi } from "../lib/publicApi";
import { getVisitanteId } from "../lib/visitante";
import { whatsappCotizarUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CakeIcon, StarIcon, HeartIcon } from "../../components/icons";
import { TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON } from "../../lib/tipoProducto";

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
    const [favorito, setFavorito] = useState(false);
    const [pendiente, setPendiente] = useState(false);

    const [resenasExtra, setResenasExtra] = useState<Resena[]>([]);
    const [resenasPage, setResenasPage] = useState(1);
    const [cargandoResenas, setCargandoResenas] = useState(false);

    const resenas = [...(producto?.resenas ?? []), ...resenasExtra];
    const hayMasResenas = producto ? resenas.length < producto.resenasTotal : false;

    // Hidrata el estado real del favorito para este actor — getProductoDetalle
    // no lo puede incluir porque su respuesta se cachea 90s compartida entre
    // todos los visitantes (ver publicCache.ts), así que va en una consulta
    // aparte, sin cache. Si falla, se deja favorito en false (mejora visual,
    // no crítico) en vez de romper la página.
    useEffect(() => {
        if (!id) return;
        let cancelado = false;

        publicApi
            .get<{ esFavorito: boolean }>(`/producto/${id}/favorito`, {
                "X-Visitante-Id": getVisitanteId(),
            })
            .then((res) => {
                if (!cancelado) setFavorito(res.esFavorito);
            })
            .catch(() => {
                // Se mantiene favorito en false.
            });

        return () => {
            cancelado = true;
        };
    }, [id]);

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

    const toggleFavorito = async () => {
        if (!id || pendiente) return;
        setPendiente(true);
        const headers = { "X-Visitante-Id": getVisitanteId() };

        try {
            if (favorito) {
                await publicApi.del(`/producto/${id}/favorito`, headers);
            } else {
                await publicApi.post(`/producto/${id}/favorito`, undefined, headers);
            }
            setFavorito(!favorito);
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
                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
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
                                    i === imagenActiva ? "border-pink-300" : "border-transparent"
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
                        {(() => {
                            const TipoIcon = TIPO_PRODUCTO_ICON[producto.tipo];
                            return (
                                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                    <TipoIcon className="h-3.5 w-3.5" />
                                    {TIPO_PRODUCTO_LABEL[producto.tipo]}
                                </p>
                            );
                        })()}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {producto.tematicas.map((tematica) => (
                                <span
                                    key={tematica.id}
                                    className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-800"
                                >
                                    {tematica.nombre}
                                </span>
                            ))}
                            {producto.ocasiones.map((ocasion) => (
                                <span
                                    key={ocasion.id}
                                    className="rounded-full bg-brand-purple-100 px-2.5 py-1 text-xs font-medium text-brand-purple-700"
                                >
                                    {ocasion.nombre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleFavorito}
                        aria-pressed={favorito}
                        aria-label="Favorito"
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 ${
                            favorito ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-400"
                        }`}
                    >
                        <HeartIcon className="h-5 w-5" filled={favorito} />
                    </button>
                </div>

                {producto.descripcion && (
                    <p className="mt-3 text-gray-600 leading-relaxed">{producto.descripcion}</p>
                )}

                {/* Cotizar por WhatsApp — único mecanismo de contacto, nunca precio */}
                <a
                    href={whatsappCotizarUrl(producto.nombre, producto.tipo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Cotizar por WhatsApp"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] hover:bg-emerald-600"
                >
                    <img src="/WhatsApp.svg" alt="" className="h-5 w-5" aria-hidden="true" />
                    Cotizar
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
