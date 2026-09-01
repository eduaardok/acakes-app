interface Props {
    className?: string;
}

/** Bloque de carga — mismo lenguaje visual (pulse gris) usado en todas las pantallas del admin. */
export function Skeleton({ className = "" }: Props) {
    // El caller puede pasar su propio "rounded-*" (ej. rounded-full para un chip);
    // solo se aplica el default cuando no trae ninguno, para no competir con él.
    const radius = /\brounded(-\S+)?\b/.test(className) ? "" : "rounded";
    return <div className={`animate-pulse ${radius} bg-gray-200 ${className}`} />;
}
