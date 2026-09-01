import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { ProductoCard } from "../components/ProductoCard";
import { publicApi } from "../lib/publicApi";
import { whatsappContactoUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Skeleton } from "../../components/Skeleton";
import { useInView } from "../../hooks/useInView";
import type { ProductoResumen } from "../hooks/useCatalogo";

interface CatalogoResponse {
    productos: ProductoResumen[];
}

const VALORES = ["Diseño 100% personalizado", "Cada pastel a pedido", "Entrega en El Empalme"];

export default function Landing() {
    usePageTitle("Inicio");
    const [destacados, setDestacados] = useState<ProductoResumen[]>([]);
    const [loading, setLoading] = useState(true);

    const destacadosReveal = useInView<HTMLDivElement>();
    const ctaReveal = useInView<HTMLDivElement>();

    useEffect(() => {
        let cancelado = false;
        publicApi
            .get<CatalogoResponse>("/catalogo?pageSize=6&ordenarPor=vistas")
            .then((res) => {
                if (!cancelado) setDestacados(res.productos);
            })
            .catch(() => {
                // Sección opcional: si falla, simplemente no se muestra.
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });
        return () => {
            cancelado = true;
        };
    }, []);

    const collage = destacados.filter((p) => p.imagenes[0]).slice(0, 3);

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-24 lg:pt-16">
                    <div className="animate-fade-left relative z-10">
                        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Pasteles a tu medida,
                            <br />
                            para cada ocasión especial
                        </h1>
                        <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-600">
                            Diseñamos y horneamos pasteles personalizados y temáticos en El Empalme —
                            cumpleaños, quinceañeras, o cualquier fecha que quieras celebrar por todo lo alto.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                to="/catalogo"
                                className="group relative overflow-hidden rounded-full bg-pink-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-600/25 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-600/30 active:translate-y-0 active:scale-[0.98]"
                            >
                                <span className="relative z-10">Ver catálogo</span>
                                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                            </Link>
                            <a
                                href={whatsappContactoUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border-2 border-emerald-500 bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-emerald-50 active:translate-y-0 active:scale-[0.98]"
                            >
                                Cotizar por WhatsApp
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500">
                            {VALORES.map((v, i) => (
                                <span key={v} className="flex items-center gap-4">
                                    {i > 0 && <span className="h-1 w-1 rounded-full bg-pink-300" aria-hidden />}
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bento de fotos reales del catálogo — sin galería de marca dedicada */}
                    <div className="animate-fade-right relative">
                        <div
                            className="animate-float-slow absolute -right-10 -top-10 h-56 w-56 rounded-full bg-pink-300/40 blur-3xl sm:h-72 sm:w-72"
                            aria-hidden
                        />
                        <div
                            className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl"
                            aria-hidden
                        />

                        {loading && (
                            <div className="relative grid grid-cols-2 gap-4">
                                <Skeleton className="col-span-2 aspect-[16/10] rounded-3xl" />
                                <Skeleton className="aspect-square rounded-2xl" />
                                <Skeleton className="aspect-square rounded-2xl" />
                            </div>
                        )}

                        {!loading && collage.length > 0 && (
                            <div className="relative grid grid-cols-2 gap-4">
                                {collage[0] && (
                                    <Link
                                        to={`/producto/${collage[0].id}`}
                                        className="group col-span-2 aspect-[16/10] overflow-hidden rounded-3xl border border-white shadow-xl shadow-pink-900/10 transition-transform duration-300 ease-out hover:-rotate-1 hover:scale-[1.015]"
                                    >
                                        <img
                                            src={collage[0].imagenes[0].url}
                                            alt={collage[0].nombre}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                        />
                                    </Link>
                                )}
                                {collage.slice(1).map((p, i) => (
                                    <Link
                                        key={p.id}
                                        to={`/producto/${p.id}`}
                                        className={`group aspect-square overflow-hidden rounded-2xl border border-white shadow-lg shadow-pink-900/10 transition-transform duration-300 ease-out ${
                                            i === 0 ? "hover:rotate-1 hover:scale-[1.03]" : "hover:-rotate-1 hover:scale-[1.03]"
                                        }`}
                                    >
                                        <img
                                            src={p.imagenes[0].url}
                                            alt={p.nombre}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Destacados */}
            {(loading || destacados.length > 0) && (
                <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 lg:pb-24">
                    <div ref={destacadosReveal.ref} className={`reveal-up ${destacadosReveal.visible ? "is-visible" : ""}`}>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Los favoritos de nuestros clientes
                        </h2>
                        <p className="mt-1 text-gray-500">Los diseños más vistos del catálogo, elegidos por ustedes.</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {loading
                            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
                            : destacados.map((p, i) => (
                                  <ProductoCard key={p.id} producto={p} animationDelayMs={Math.min(i, 8) * 35} />
                              ))}
                    </div>
                </section>
            )}

            {/* CTA final — banda a todo el ancho, comprometida con el color de marca */}
            <section className="w-full bg-pink-600 py-16 lg:py-20">
                <div
                    ref={ctaReveal.ref}
                    className={`reveal-up mx-auto max-w-2xl px-4 text-center ${ctaReveal.visible ? "is-visible" : ""}`}
                >
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">¿Tienes una idea en mente?</h2>
                    <p className="mx-auto mt-3 max-w-sm text-pink-50">
                        Cuéntanos qué estás celebrando y diseñamos el pastel juntos — sin compromiso.
                    </p>
                    <a
                        href={whatsappContactoUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-pink-700 shadow-xl shadow-pink-900/20 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:scale-[0.98]"
                    >
                        Cotizar por WhatsApp
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
