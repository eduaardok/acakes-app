import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "custom";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    /** Muestra un spinner y deshabilita el botón — mismo criterio en toda la app para "acción en curso". */
    loading?: boolean;
}

const BASE =
    "inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,box-shadow,transform,border-color,color] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
    primary: "bg-pink-600 text-white hover:bg-pink-700 hover:shadow-md hover:shadow-pink-200/60",
    secondary: "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
    // Sin color propio — para acciones cuyo color codifica significado (ej. el
    // estado destino de un pedido) y no debe forzarse al tono primario/pink.
    custom: "",
};

const SIZES: Record<Size, string> = {
    sm: "rounded-xl px-4 py-2.5 text-sm",
    md: "rounded-2xl px-4 py-4 text-base",
};

/**
 * Botón de acción compartido para el admin — unifica los estilos de
 * "guardar", "cancelar" y acciones destructivas que antes se repetían con
 * pequeñas variaciones (radio, padding, tono, transición) en cada pantalla.
 */
export function Button({
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    disabled,
    className = "",
    children,
    ...rest
}: Props) {
    return (
        <button
            disabled={disabled || loading}
            className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...rest}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
}
