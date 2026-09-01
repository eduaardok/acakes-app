interface Props {
    className?: string;
}

/** Spinner de carga inline — extraído del botón de Login, reutilizable en cualquier botón ocupado. */
export function Spinner({ className = "h-4 w-4" }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={`animate-spin ${className}`}
            aria-hidden
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
