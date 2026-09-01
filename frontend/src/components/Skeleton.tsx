interface Props {
    className?: string;
}

/** Bloque de carga — mismo lenguaje visual (pulse gris) usado en todas las pantallas del admin. */
export function Skeleton({ className = "" }: Props) {
    return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}
