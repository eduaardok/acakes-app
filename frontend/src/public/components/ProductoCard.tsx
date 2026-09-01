import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CakeIcon } from "../../components/icons";

// Subconjunto de campos que la card necesita — permite reusarla con
// respuestas distintas (catálogo completo vs. resumen de /mis-favoritos).
export interface ProductoCardData {
    id: number;
    nombre: string;
    tematica: string | null;
    ocasion: string | null;
    imagenes: { url: string }[];
}

interface Props {
    producto: ProductoCardData;
    animationDelayMs?: number;
    /** Acción adicional (ej. quitar de favoritos), superpuesta sobre la imagen. */
    accionExtra?: ReactNode;
}

export function ProductoCard({ producto, animationDelayMs, accionExtra }: Props) {
    const imagen = producto.imagenes[0];

    return (
        <Link
            to={`/producto/${producto.id}`}
            style={animationDelayMs ? { animationDelay: `${animationDelayMs}ms` } : undefined}
            className="animate-rise-in group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-[transform,box-shadow] duration-150 ease-out hover:shadow-md active:scale-[0.985]"
        >
            {accionExtra && (
                <div className="absolute right-2 top-2 z-10">{accionExtra}</div>
            )}
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {imagen ? (
                    <img
                        src={imagen.url}
                        alt={producto.nombre}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <CakeIcon className="h-10 w-10" />
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="truncate font-semibold text-gray-900">{producto.nombre}</p>
                {(producto.tematica || producto.ocasion) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {producto.tematica && (
                            <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700">
                                {producto.tematica}
                            </span>
                        )}
                        {producto.ocasion && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {producto.ocasion}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
