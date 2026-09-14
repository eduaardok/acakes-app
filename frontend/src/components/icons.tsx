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

/** Cuadrícula 2x2 — enlace "Catálogo" del navbar público. */
export function GridIcon({ className = "h-5 w-5" }: IconProps) {
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
            <rect x="3" y="3" width="8" height="8" rx="2" />
            <rect x="13" y="3" width="8" height="8" rx="2" />
            <rect x="3" y="13" width="8" height="8" rx="2" />
            <rect x="13" y="13" width="8" height="8" rx="2" />
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

/** Destello — acento decorativo (línea manuscrita del hero, encabezados de sección). */
export function SparkleIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden
        >
            <path d="M12 2c.6 3.2 1.8 5.6 3.4 7.2C17 10.8 19.4 12 22.6 12c-3.2.6-5.6 1.8-7.2 3.4C13.8 17 12.6 19.4 12 22.6c-.6-3.2-1.8-5.6-3.4-7.2C6.9 13.8 4.5 12.6 1.4 12c3.2-.6 5.6-1.8 7.2-3.4C10.1 6.9 11.3 4.5 12 2z" />
        </svg>
    );
}

/** Paleta de pintor — valor de marca "diseño personalizado". */
export function PaletteIcon({ className = "h-6 w-6" }: IconProps) {
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
            <path d="M12 3c-4.97 0-9 3.69-9 8.25 0 3.02 2.46 4.75 5 4.75h1.2a1.3 1.3 0 0 1 1 2.13l-.4.47a1.3 1.3 0 0 0 1 2.15c4.53-.2 8.2-3.99 8.2-8.5C19 6.69 16.97 3 12 3Z" />
            <circle cx="8" cy="12" r="1.4" />
            <circle cx="10" cy="8" r="1" fill="currentColor" stroke="none" />
            <circle cx="14.5" cy="8" r="1" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

/** Pin de ubicación — valor de marca "zona de entrega". */
export function MapPinIcon({ className = "h-6 w-6" }: IconProps) {
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
            <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

/** Cupcake — badge/selector de tipo de producto (TipoProducto.CUPCAKE). */
export function CupcakeIcon({ className = "h-6 w-6" }: IconProps) {
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
            <path d="M7 11h10l-1.3 8.3a2 2 0 0 1-2 1.7h-3.4a2 2 0 0 1-2-1.7L7 11Z" />
            <path d="M6.5 11a5.5 5.5 0 0 1 11 0" />
            <path d="M12 6.5V4" />
            <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

/** Etiqueta — badge/selector de tipo de producto genérico (TipoProducto.OTRO). */
export function TagIcon({ className = "h-6 w-6" }: IconProps) {
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
            <path d="M12.6 2.5H6.5a2 2 0 0 0-2 2v6.1c0 .5.2 1 .6 1.4l9 9a2 2 0 0 0 2.8 0l6-6a2 2 0 0 0 0-2.8l-9-9a2 2 0 0 0-1.3-.7Z" />
            <circle cx="9" cy="8" r="1.4" />
        </svg>
    );
}

/** Basura — eliminar foto/elemento. */
export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
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
            <path d="M4 7h16" />
            <path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" />
            <path d="M6 7l1 12.5a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9L18 7" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );
}

/** Lápiz — editar un registro existente. */
export function PencilIcon({ className = "h-4 w-4" }: IconProps) {
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
            <path d="M12.5 6.5l5 5L7 22H2v-5Z" />
            <path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L16 9l-3-3Z" />
        </svg>
    );
}

/** Check — confirmar/guardar una edición inline. */
export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
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
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

/** X — cancelar una acción o edición inline. */
export function XIcon({ className = "h-4 w-4" }: IconProps) {
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
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
        </svg>
    );
}

/** Refrescar — dos flechas en círculo, recargar datos sin cambiar de pantalla. */
export function RefreshIcon({ className = "h-5 w-5" }: IconProps) {
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
            <path d="M20 12a8 8 0 0 0-8-8 8 8 0 0 0-6.32 3.09" />
            <path d="M4 4v5h5" />
            <path d="M4 12a8 8 0 0 0 8 8 8 8 0 0 0 6.32-3.09" />
            <path d="M20 20v-5h-5" />
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
