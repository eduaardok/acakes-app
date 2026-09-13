interface Props {
    className?: string;
    /**
     * "current" (default) — el arco hereda currentColor, para integrarse con el color
     * que ya define el contenedor (ej. texto blanco en Button primary, rojo en danger);
     * el fondo usa currentColor al 20% de opacidad.
     * "brand" — arco pink-600 sobre fondo pink-100, para uso standalone fuera de un
     * contenedor que ya defina su propio color de texto.
     */
    tone?: "current" | "brand";
}

/** Spinner de carga inline — extraído del botón de Login, reutilizable en cualquier botón ocupado. */
export function Spinner({ className = "h-4 w-4", tone = "current" }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className={`animate-spin ${className}`}
            aria-hidden
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                strokeWidth="2.5"
                className={tone === "brand" ? "stroke-pink-100" : "stroke-current opacity-20"}
            />
            <path
                d="M21 12a9 9 0 1 1-6.219-8.56"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={tone === "brand" ? "stroke-pink-600" : "stroke-current"}
            />
        </svg>
    );
}
