import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { ProductoCard } from "../components/ProductoCard";
import { publicApi } from "../lib/publicApi";
import { whatsappContactoUrl } from "../lib/whatsapp";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Skeleton } from "../../components/Skeleton";
import type { ProductoResumen } from "../hooks/useCatalogo";

interface CatalogoResponse {
    productos: ProductoResumen[];
}

export default function Landing() {
    usePageTitle("Inicio");
    const [destacados, setDestacados] = useState<ProductoResumen[]>([]);
    const [loading, setLoading] = useState(true);

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

    const collage = destacados.filter((p) => p.imagenes[0]).slice(0, 4);

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="mx-auto max-w-3xl px-4 pt-10 pb-2">
                <div className="animate-rise-in">
                    <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
                        Pasteles a tu medida, para cada ocasión especial
                    </h1>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-600">
                        Diseñamos y horneamos pasteles personalizados y temáticos en El Empalme —
                        cumpleaños, quinceañeras, o cualquier fecha que quieras celebrar por todo lo alto.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            to="/catalogo"
                            className="rounded-full bg-pink-600 px-6 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] hover:bg-pink-700"
                        >
                            Ver catálogo
                        </Link>
                        <a
                            href={whatsappContactoUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-emerald-200 bg-white px-6 py-3.5 text-base font-semibold text-emerald-700 transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] hover:bg-emerald-50"
                        >
                            Cotizar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* Collage de productos reales — sin galería de marca dedicada, se usan fotos reales del catálogo */}
            {loading && (
                <section className="mx-auto max-w-3xl px-4 pt-8 pb-2">
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="aspect-square rounded-2xl" />
                        ))}
                    </div>
                </section>
            )}

            {!loading && collage.length > 0 && (
                <section className="mx-auto max-w-3xl px-4 pt-8 pb-2">
                    <div className="grid grid-cols-2 gap-3">
                        {collage.map((p, i) => (
                            <Link
                                key={p.id}
                                to={`/producto/${p.id}`}
                                style={{ animationDelay: `${i * 60}ms` }}
                                className="animate-rise-in group aspect-square overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <img
                                    src={p.imagenes[0].url}
                                    alt={p.nombre}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Destacados */}
            {!loading && destacados.length > 0 && (
                <section className="mx-auto max-w-3xl px-4 pt-8 pb-10">
                    <h2 className="text-2xl font-bold text-gray-900">Los favoritos de nuestros clientes</h2>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {destacados.map((p, i) => (
                            <ProductoCard key={p.id} producto={p} animationDelayMs={Math.min(i, 8) * 35} />
                        ))}
                    </div>
                </section>
            )}

            {/* CTA final */}
            <section className="mx-auto max-w-3xl px-4 pb-14 pt-6">
                <div className="rounded-3xl bg-pink-50 px-6 py-10 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">¿Tienes una idea en mente?</h2>
                    <p className="mx-auto mt-2 max-w-sm text-gray-600">
                        Cuéntanos qué estás celebrando y diseñamos el pastel juntos — sin compromiso.
                    </p>
                    <a
                        href={whatsappContactoUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] hover:bg-emerald-600"
                    >
                        Cotizar por WhatsApp
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
