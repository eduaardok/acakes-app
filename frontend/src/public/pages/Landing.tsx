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
import { CakeIcon, HeartIcon, MapPinIcon, PaletteIcon, SparkleIcon } from "../../components/icons";

interface CatalogoResponse {
    productos: ProductoResumen[];
}

const VALORES = [
    { label: "Diseño 100% personalizado", Icon: PaletteIcon },
    { label: "Cada pastel a pedido", Icon: CakeIcon },
    { label: "Entrega en El Empalme", Icon: MapPinIcon },
];

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

    const heroProducto = destacados.find((p) => p.imagenes[0]);

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden pb-8 sm:pb-10">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-16">
                    <div className="animate-fade-left relative z-10">
                        <p className="font-script flex items-center gap-2 text-2xl leading-none text-brand-purple-700 sm:text-3xl">
                            <SparkleIcon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
                            ¡Tu momento dulce, a tu manera!
                        </p>

                        <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Pasteles y cupcakes
                            <span className="mt-2 block">
                                <span className="inline-block -rotate-2 rounded-2xl bg-pink-600 px-4 py-1 text-white shadow-md shadow-pink-600/30">
                                    personalizados
                                </span>
                            </span>
                            <span className="mt-2 block">para cada ocasión especial</span>
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
                    </div>

                    {/* Foto real del catálogo — sin galería de marca dedicada */}
                    <div className="animate-fade-right relative mx-auto w-full max-w-sm lg:max-w-none">
                        {/* Blob decorativo — acento de marca detrás de la foto, morado de marca */}
                        <svg
                            className="pointer-events-none absolute -inset-8 -z-10 sm:-inset-10"
                            viewBox="0 0 200 200"
                            preserveAspectRatio="none"
                            aria-hidden
                        >
                            <path
                                className="fill-purple-100"
                                d="M154.96,100.00 C154.31,113.97 149.12,125.84 139.96,139.96 C130.80,154.07 115.63,182.38 100.00,184.69 C84.37,187.00 57.94,167.95 46.17,153.83 C34.39,139.72 28.27,116.88 29.34,100.00 C30.40,83.12 40.78,64.05 52.56,52.56 C64.34,41.07 84.79,30.44 100.00,31.04 C115.21,31.64 134.67,44.67 143.83,56.17 C152.99,67.66 155.61,86.03 154.96,100.00Z"
                            />
                        </svg>

                        {/* Corazones decorativos — puramente visuales, no togglean favorito */}
                        <HeartIcon
                            filled
                            className="pointer-events-none absolute left-1 top-6 z-10 h-8 w-8 -rotate-12 text-pink-500 drop-shadow-sm"
                        />
                        <HeartIcon
                            filled
                            className="pointer-events-none absolute right-3 bottom-16 z-10 h-6 w-6 rotate-12 text-brand-purple-500 drop-shadow-sm"
                        />

                        {loading && <Skeleton className="aspect-[4/5] rounded-[2.5rem]" />}

                        {!loading && heroProducto && (
                            <Link
                                to={`/producto/${heroProducto.id}`}
                                className="group block aspect-[4/5] overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl shadow-pink-900/15 transition-transform duration-300 ease-out hover:-rotate-1 hover:scale-[1.01]"
                            >
                                <img
                                    src={heroProducto.imagenes[0].url}
                                    alt={heroProducto.nombre}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tira de valores de marca — flota debajo del hero */}
                <div className="relative z-10 mx-auto max-w-4xl px-4">
                    <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-4 shadow-xl shadow-pink-900/10 sm:gap-6 sm:p-6">
                        {VALORES.map(({ label, Icon }) => (
                            <div key={label} className="flex flex-col items-center gap-2 text-center">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 sm:h-12 sm:w-12">
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </span>
                                <span className="text-xs font-medium text-gray-600 sm:text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destacados — wash sutil de marca para dar ritmo entre el hero blanco y la banda CTA sólida */}
            {(loading || destacados.length > 0) && (
                <section className="w-full bg-brand-purple-50/40">
                    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 lg:pb-24">
                        <div
                            ref={destacadosReveal.ref}
                            className={`reveal-up flex items-start justify-between gap-3 ${destacadosReveal.visible ? "is-visible" : ""}`}
                        >
                            <div>
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                                    <SparkleIcon className="h-5 w-5 shrink-0 text-pink-500 sm:h-6 sm:w-6" />
                                    Nuestros favoritos
                                </h2>
                                <p className="mt-1 text-gray-500">Los diseños más vistos del catálogo, elegidos por ustedes.</p>
                            </div>
                            <Link
                                to="/catalogo"
                                className="mt-1 shrink-0 whitespace-nowrap text-sm font-semibold text-pink-700 transition-colors duration-150 ease-out hover:text-pink-800"
                            >
                                Ver todo →
                            </Link>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {loading
                                ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
                                : destacados.map((p, i) => (
                                      <ProductoCard key={p.id} producto={p} animationDelayMs={Math.min(i, 8) * 35} />
                                  ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA final — banda a todo el ancho, degradado pastel (los dos tonos del logo, versión clara) */}
            <section className="w-full bg-gradient-to-br from-pink-100 to-brand-purple-100 py-16 lg:py-20">
                <div
                    ref={ctaReveal.ref}
                    className={`reveal-up mx-auto max-w-2xl px-4 text-center ${ctaReveal.visible ? "is-visible" : ""}`}
                >
                    <h2 className="text-3xl font-bold text-brand-purple-700 sm:text-4xl">
                        ¿Para cuándo es tu celebración?
                    </h2>
                    <p className="mx-auto mt-3 max-w-sm text-gray-600">
                        Los pasteles personalizados se preparan a pedido — escríbenos hoy y aseguramos tu fecha, sin
                        compromiso.
                    </p>
                    <a
                        href={whatsappContactoUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-pink-600/25 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:bg-pink-700 active:translate-y-0 active:scale-[0.98]"
                    >
                        Cotizar por WhatsApp
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
