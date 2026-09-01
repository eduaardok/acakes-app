import type { ButtonHTMLAttributes } from "react";

type Variant = "ghost" | "solid";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    /** Gira el ícono (ej. refrescar mientras carga) sin deshabilitar el botón. */
    spinning?: boolean;
}

const BASE =
    "flex items-center justify-center rounded-full p-2.5 transition-[color,background-color,transform] duration-150 ease-out active:scale-90 disabled:opacity-40 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
    ghost: "text-gray-400 hover:text-gray-600 active:bg-gray-100",
    solid: "bg-pink-600 text-white shadow-sm hover:bg-pink-700",
};

/**
 * Botón circular de solo ícono — back, refrescar, prev/next, "+" nuevo.
 * Antes cada pantalla repetía su propia combinación de padding y
 * transición (algunas sin active:scale ni transición en absoluto).
 */
export function IconButton({ variant = "ghost", spinning, className = "", children, ...rest }: Props) {
    return (
        <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
            <span className={spinning ? "animate-spin" : undefined}>{children}</span>
        </button>
    );
}
