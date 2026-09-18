import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useProductoDetalle, type ProductoDetalle as ProductoDetalleData } from "../hooks/useProductoDetalle";
import { publicApi, getClienteToken } from "../lib/publicApi";
import { getVisitanteId } from "../lib/visitante";
import { whatsappCotizarUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CakeIcon, StarIcon, HeartIcon, ThumbUpIcon, XIcon } from "../../components/icons";
import { TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON } from "../../lib/tipoProducto";

type Resena = ProductoDetalleData["resenas"][number];

interface ResenasResponse {
    resenas: Resena[];
    page: number;
    totalPages: number;
}

// Tope de ids por request del backend (ver interacciones.controller.ts,
// RESENAS_LIKES_IDS_MAX = PAGE_SIZE_MAX). RESENAS_PAGE_SIZE=10 en el backend
// hace que esto no debería dispararse nunca en la práctica, pero se trocea
// igual por si en algún momento cambia esa constante.
const RESENAS_LIKES_LOTE_MAX = 50;

interface ResenaLikeState {
    likesCount: number;
    meGusta: boolean;
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

// Versión clickeable de Estrellas — selector de calificación en el
// formulario de nueva reseña.
function EstrellasInput({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
    return (
        <div className="inline-flex gap-1" role="radiogroup" aria-label="Calificación">
            {Array.from({ length: 5 }, (_, i) => {
                const n = i + 1;
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        role="radio"
                        aria-checked={n === valor}
                        aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                        className="p-0.5 active:scale-90 transition-transform duration-150 ease-out"
                    >
                        <StarIcon className={`h-6 w-6 ${n <= valor ? "text-amber-400" : "text-gray-200"}`} filled />
                    </button>
                );
            })}
        </div>
    );
}

export default function ProductoDetalle() {
    const { id } = useParams<{ id: string }>();
    const { producto, loading, error, refetch } = useProductoDetalle(id);
    usePageTitle(producto?.nombre ?? "Producto");
    const logueado = Boolean(getClienteToken());

    const [imagenActiva, setImagenActiva] = useState(0);
    const [favorito, setFavorito] = useState(false);
    const [pendiente, setPendiente] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [totalLikes, setTotalLikes] = useState(0);
    const [meGustaProducto, setMeGustaProducto] = useState(false);
    const [likePendiente, setLikePendiente] = useState(false);

    const [resenasExtra, setResenasExtra] = useState<Resena[]>([]);
    const [resenasPage, setResenasPage] = useState(1);
    const [cargandoResenas, setCargandoResenas] = useState(false);
    const [misResenasNuevas, setMisResenasNuevas] = useState<Resena[]>([]);

    const [resenaLikes, setResenaLikes] = useState<Record<number, ResenaLikeState>>({});
    const [resenaLikePendientes, setResenaLikePendientes] = useState<Set<number>>(new Set());
    // Ids de reseña para los que ya se consultó GET /resenas/likes — evita
    // re-consultar en cada render/carga los que ya se resolvieron antes.
    const idsConsultadosRef = useRef<Set<number>>(new Set());

    const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [enviandoResena, setEnviandoResena] = useState(false);
    const [errorResena, setErrorResena] = useState<string | null>(null);

    const resenas = [...misResenasNuevas, ...(producto?.resenas ?? []), ...resenasExtra];
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

    // Hidrata total + meGusta del like de producto — mismo criterio que
    // favorito arriba: sin cache, por actor.
    useEffect(() => {
        if (!id) return;
        let cancelado = false;

        publicApi
            .get<{ total: number; meGusta: boolean }>(`/producto/${id}/likes`, {
                "X-Visitante-Id": getVisitanteId(),
            })
            .then((res) => {
                if (!cancelado) {
                    setTotalLikes(res.total);
                    setMeGustaProducto(res.meGusta);
                }
            })
            .catch(() => {
                // Se mantiene en 0/false.
            });

        return () => {
            cancelado = true;
        };
    }, [id]);

    // Hidrata likesCount + meGusta por reseña. likesCount ya viene en el
    // payload (agregado, cacheado — ver Fase 1 backend); meGusta es por-actor
    // y se resuelve aparte en batch para las reseñas visibles, en vez de un
    // GET /resena/:id/like por cada una. Se dispara al montar y cada vez que
    // se cargan más reseñas (cargarMasResenas) o se envía una nueva.
    useEffect(() => {
        const todas = [...misResenasNuevas, ...(producto?.resenas ?? []), ...resenasExtra];
        if (todas.length === 0) return;

        setResenaLikes((prev) => {
            const next = { ...prev };
            let cambio = false;
            for (const r of todas) {
                if (!(r.id in next)) {
                    next[r.id] = { likesCount: r.likesCount, meGusta: false };
                    cambio = true;
                }
            }
            return cambio ? next : prev;
        });

        const idsPorConsultar = todas
            .map((r) => r.id)
            .filter((rid) => !idsConsultadosRef.current.has(rid));
        if (idsPorConsultar.length === 0) return;
        idsPorConsultar.forEach((rid) => idsConsultadosRef.current.add(rid));

        const lotes: number[][] = [];
        for (let i = 0; i < idsPorConsultar.length; i += RESENAS_LIKES_LOTE_MAX) {
            lotes.push(idsPorConsultar.slice(i, i + RESENAS_LIKES_LOTE_MAX));
        }

        let cancelado = false;
        const headers = { "X-Visitante-Id": getVisitanteId() };

        Promise.all(
            lotes.map((lote) =>
                publicApi.get<{ likeadas: number[] }>(`/resenas/likes?ids=${lote.join(",")}`, headers)
            )
        )
            .then((respuestas) => {
                if (cancelado) return;
                const likeadas = new Set(respuestas.flatMap((r) => r.likeadas));
                setResenaLikes((prev) => {
                    const next = { ...prev };
                    for (const rid of idsPorConsultar) {
                        if (next[rid]) next[rid] = { ...next[rid], meGusta: likeadas.has(rid) };
                    }
                    return next;
                });
            })
            .catch(() => {
                // Se deja meGusta en false para las reseñas de este lote.
            });

        return () => {
            cancelado = true;
        };
    }, [id, producto?.resenas, resenasExtra, misResenasNuevas]);

    // Lightbox: Escape para cerrar + bloqueo de scroll del body mientras está
    // abierto (se restaura el valor previo, no simplemente "" — evita pisar un
    // overflow ya seteado por otra parte del layout).
    useEffect(() => {
        if (!isLightboxOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsLightboxOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);

        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = overflowPrevio;
        };
    }, [isLightboxOpen]);

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

    const toggleLikeProducto = async () => {
        if (!id || likePendiente) return;
        setLikePendiente(true);
        const headers = { "X-Visitante-Id": getVisitanteId() };
        const meGustaPrevio = meGustaProducto;
        const totalPrevio = totalLikes;

        // Optimista: el POST/DELETE solo devuelve 204, así que se actualiza
        // el estado local antes de la respuesta y se revierte si falla.
        setMeGustaProducto(!meGustaPrevio);
        setTotalLikes(totalPrevio + (meGustaPrevio ? -1 : 1));

        try {
            if (meGustaPrevio) {
                await publicApi.del(`/producto/${id}/like`, headers);
            } else {
                await publicApi.post(`/producto/${id}/like`, undefined, headers);
            }
        } catch {
            setMeGustaProducto(meGustaPrevio);
            setTotalLikes(totalPrevio);
        } finally {
            setLikePendiente(false);
        }
    };

    const toggleLikeResena = async (resenaId: number) => {
        const previo = resenaLikes[resenaId];
        if (!previo || resenaLikePendientes.has(resenaId)) return;

        setResenaLikePendientes((prev) => new Set(prev).add(resenaId));
        setResenaLikes((prev) => ({
            ...prev,
            [resenaId]: {
                meGusta: !previo.meGusta,
                likesCount: previo.likesCount + (previo.meGusta ? -1 : 1),
            },
        }));

        const headers = { "X-Visitante-Id": getVisitanteId() };
        try {
            if (previo.meGusta) {
                await publicApi.del(`/resena/${resenaId}/like`, headers);
            } else {
                await publicApi.post(`/resena/${resenaId}/like`, undefined, headers);
            }
        } catch {
            setResenaLikes((prev) => ({ ...prev, [resenaId]: previo }));
        } finally {
            setResenaLikePendientes((prev) => {
                const next = new Set(prev);
                next.delete(resenaId);
                return next;
            });
        }
    };

    // POST /producto/:id/resena requiere JWT de cliente (authenticateClienteToken
    // en el backend) — publicApi ya adjunta el Bearer del clienteToken en cada
    // request, así que no hace falta ningún cliente HTTP especial (a diferencia
    // del admin, que usa lib/api.ts con su propio token).
    const enviarResena = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || enviandoResena) return;
        setEnviandoResena(true);
        setErrorResena(null);

        try {
            const creada = await publicApi.post<{
                id: number;
                calificacion: number;
                comentario: string | null;
                createdAt: string;
            }>(`/producto/${id}/resena`, {
                calificacion: nuevaCalificacion,
                comentario: nuevoComentario.trim() || undefined,
            });

            // El backend devuelve la reseña "cruda" (sin usuario ni likesCount —
            // ver cliente.controller.ts:crearResena). loginCliente tampoco expone
            // el nombre del cliente logueado en ningún lado del frontend, así que
            // se usa "Tú" como placeholder visual hasta que la página se recargue.
            const resenaLocal: Resena = {
                id: creada.id,
                calificacion: creada.calificacion,
                comentario: creada.comentario,
                createdAt: creada.createdAt,
                usuario: { id: -1, nombre: "Tú" },
                likesCount: 0,
            };

            setMisResenasNuevas((prev) => [resenaLocal, ...prev]);
            setResenaLikes((prev) => ({ ...prev, [resenaLocal.id]: { likesCount: 0, meGusta: false } }));
            idsConsultadosRef.current.add(resenaLocal.id);
            setNuevaCalificacion(5);
            setNuevoComentario("");
        } catch (err) {
            setErrorResena(err instanceof Error ? err.message : "No se pudo enviar tu reseña.");
        } finally {
            setEnviandoResena(false);
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
                <div
                    className={`aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 ${
                        imagenes[imagenActiva] ? "cursor-zoom-in" : ""
                    }`}
                    onClick={() => {
                        if (imagenes[imagenActiva]) setIsLightboxOpen(true);
                    }}
                >
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

                {isLightboxOpen && imagenes[imagenActiva] && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsLightboxOpen(false)}
                            aria-label="Cerrar"
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                        <img
                            src={imagenes[imagenActiva].url}
                            alt={producto.nombre}
                            className="max-h-full max-w-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

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

                    <div className="flex shrink-0 flex-col items-end gap-2">
                        <button
                            type="button"
                            onClick={toggleFavorito}
                            aria-pressed={favorito}
                            aria-label="Favorito"
                            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 ${
                                favorito ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-400"
                            }`}
                        >
                            <HeartIcon className="h-5 w-5" filled={favorito} />
                        </button>

                        <button
                            type="button"
                            onClick={toggleLikeProducto}
                            disabled={likePendiente}
                            aria-pressed={meGustaProducto}
                            aria-label="Me gusta"
                            className={`flex h-10 items-center gap-1.5 rounded-full border px-3 transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 disabled:opacity-50 ${
                                meGustaProducto
                                    ? "border-brand-purple-500 bg-brand-purple-50 text-brand-purple-700"
                                    : "border-gray-200 text-gray-400"
                            }`}
                        >
                            <ThumbUpIcon className="h-4 w-4" filled={meGustaProducto} />
                            <span className="text-sm font-semibold">{totalLikes}</span>
                        </button>
                    </div>
                </div>

                {producto.descripcion && (
                    <p className="mt-3 text-gray-600 leading-relaxed">{producto.descripcion}</p>
                )}

                {/* Cotizar por WhatsApp — único mecanismo de contacto, nunca precio */}
                <a
                    href={whatsappCotizarUrl(producto.nombre, producto.tipo, imagenes[imagenActiva]?.url)}
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

                    {logueado ? (
                        <form
                            onSubmit={enviarResena}
                            className="mt-3 space-y-3 rounded-2xl border border-gray-100 bg-white p-4"
                        >
                            <EstrellasInput valor={nuevaCalificacion} onChange={setNuevaCalificacion} />
                            <textarea
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                placeholder="Contanos qué te pareció (opcional)"
                                rows={2}
                                maxLength={1000}
                                className="w-full resize-none rounded-xl border border-gray-200 p-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-pink-300 focus:outline-none"
                            />
                            {errorResena && <p className="text-sm text-red-600">{errorResena}</p>}
                            <button
                                type="submit"
                                disabled={enviandoResena}
                                className="rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:opacity-50 hover:bg-pink-700"
                            >
                                {enviandoResena ? "Enviando..." : "Publicar reseña"}
                            </button>
                        </form>
                    ) : (
                        <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
                            <Link to="/login-cliente" className="font-medium text-pink-700 underline">
                                Inicia sesión
                            </Link>{" "}
                            para dejar tu reseña de este producto.
                        </div>
                    )}

                    {resenas.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-400">Aún no hay reseñas para este producto.</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {resenas.map((r) => {
                                const like = resenaLikes[r.id] ?? { likesCount: r.likesCount, meGusta: false };
                                return (
                                    <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{r.usuario.nombre}</p>
                                            <Estrellas calificacion={r.calificacion} />
                                        </div>
                                        {r.comentario && (
                                            <p className="mt-1.5 text-sm text-gray-600">{r.comentario}</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleLikeResena(r.id)}
                                            disabled={resenaLikePendientes.has(r.id)}
                                            aria-pressed={like.meGusta}
                                            aria-label="Me gusta esta reseña"
                                            className={`mt-2 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,transform] duration-150 ease-out active:scale-90 disabled:opacity-50 ${
                                                like.meGusta
                                                    ? "border-brand-purple-500 bg-brand-purple-50 text-brand-purple-700"
                                                    : "border-gray-200 text-gray-400"
                                            }`}
                                        >
                                            <ThumbUpIcon className="h-3.5 w-3.5" filled={like.meGusta} />
                                            {like.likesCount}
                                        </button>
                                    </div>
                                );
                            })}
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
