import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CakeIcon } from "../../components/icons";
import { PhotoCountBadge } from "../../components/PhotoCountBadge";
import { TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON, type TipoProducto } from "../../lib/tipoProducto";

// Subconjunto de campos que la card necesita — permite reusarla con
// respuestas distintas (catálogo completo vs. resumen de /mis-favoritos).
export interface ProductoCardData {
    id: number;
    nombre: string;
    tipo: TipoProducto;
    tematicas: { id: string; nombre: string }[];
    ocasiones: { id: string; nombre: string }[];
    // El listado solo trae la primera foto — _count.imagenes es el total real.
    imagenes: { url: string }[];
    _count: { imagenes: number };
}

interface Props {
    producto: ProductoCardData;
    animationDelayMs?: number;
    /** Acción adicional (ej. quitar de favoritos), superpuesta sobre la imagen. */
    accionExtra?: ReactNode;
}

export function ProductoCard({ producto, animationDelayMs, accionExtra }: Props) {
    const imagen = producto.imagenes[0];
    const TipoIcon = TIPO_PRODUCTO_ICON[producto.tipo];

    return (
        <Link
            to={`/producto/${producto.id}`}
            style={animationDelayMs ? { animationDelay: `${animationDelayMs}ms` } : undefined}
            className="animate-rise-in group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-[transform,box-shadow] duration-150 ease-out hover:shadow-md active:scale-[0.985]"
        >
            {accionExtra && (
                <div className="absolute right-2 top-2 z-10">{accionExtra}</div>
            )}
            {/* Ícono de tipo — gris y en la esquina opuesta a accionExtra, para no
                competir con los pills de color de tematica/ocasion de abajo. */}
            <span
                aria-label={TIPO_PRODUCTO_LABEL[producto.tipo]}
                title={TIPO_PRODUCTO_LABEL[producto.tipo]}
                className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-gray-500 backdrop-blur"
            >
                <TipoIcon className="h-4 w-4" />
            </span>
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {imagen ? (
                    <img
                        src={imagen.url}
                        alt={producto.nombre}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <CakeIcon className="h-10 w-10" />
                    </div>
                )}
                <PhotoCountBadge count={producto._count.imagenes} />
            </div>
            <div className="p-3">
                <p className="truncate font-semibold text-gray-900">{producto.nombre}</p>
                {(producto.tematicas.length > 0 || producto.ocasiones.length > 0) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {producto.tematicas.map((tematica) => (
                            <span
                                key={tematica.id}
                                className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800"
                            >
                                {tematica.nombre}
                            </span>
                        ))}
                        {producto.ocasiones.map((ocasion) => (
                            <span
                                key={ocasion.id}
                                className="rounded-full bg-brand-purple-100 px-2 py-0.5 text-xs font-medium text-brand-purple-700"
                            >
                                {ocasion.nombre}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
