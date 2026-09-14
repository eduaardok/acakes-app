import { ImagesIcon } from "./icons";

interface Props {
    /** Total real de fotos del producto — no el largo de un array ya truncado a la primera. */
    count: number;
    className?: string;
}

/**
 * Badge "+N fotos" sobre una miniatura de producto — mismo lenguaje visual
 * (chip oscuro semitransparente) que ya usan los botones de eliminar foto.
 * No renderiza nada con 1 foto o menos: ahí la miniatura ya lo dice todo.
 */
export function PhotoCountBadge({ count, className = "" }: Props) {
    if (count <= 1) return null;
    return (
        <span
            className={`absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white ${className}`}
        >
            <ImagesIcon className="h-3 w-3" />
            {count}
        </span>
    );
}
