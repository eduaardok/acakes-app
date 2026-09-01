// Íconos SVG inline compartidos — reemplazan los emoji que antes se usaban
// como ícono/decoración (🎂 ★ ♥ 🤍 👤 ⚠️). Mismo estilo que el resto de los
// SVG ya escritos a mano en el proyecto (stroke, viewBox 24x24).
interface IconProps {
    className?: string;
}

/** Pastel — placeholder de imagen ausente y estados vacíos relacionados al catálogo. */
export function CakeIcon({ className = "h-6 w-6" }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M3 21v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
            <path d="M3 21h18" />
            <path d="M5 13v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
            <path d="M12 9V5" />
            <path d="M9 5.5c0-1 .8-1.5 1.5-2C11 3 11 2 10.5 1.5" />
            <path d="M12 5.5c0-1 .8-1.5 1.5-2C14 3 14 2 13.5 1.5" />
            <path d="M8 17.5c.6.6 1.4.6 2 0s1.4-.6 2 0 1.4.6 2 0 1.4-.6 2 0" />
        </svg>
    );
}

/** Estrella — calificación de reseñas y estado de "favorito". */
export function StarIcon({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7z" />
        </svg>
    );
}

/** Corazón — "me gusta" y estado vacío de favoritos. */
export function HeartIcon({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M12 20.5s-7.5-4.7-10-9.3C.4 8 2 4.5 5.5 4a4.9 4.9 0 0 1 6.5 2.3A4.9 4.9 0 0 1 18.5 4C22 4.5 23.6 8 22 11.2c-2.5 4.6-10 9.3-10 9.3z" />
        </svg>
    );
}

/** Persona — estado vacío de listados de clientes/usuarios. */
export function UserIcon({ className = "h-6 w-6" }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

/** Triángulo de alerta — badges de atención/comportamiento negativo. */
export function AlertTriangleIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
