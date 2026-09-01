import { useEffect, useRef, useState } from "react";

/**
 * true una vez que el elemento entra en viewport (una sola vez — no se
 * revierte al salir). Usado para los reveals direccionales de la landing.
 * Si IntersectionObserver no está disponible, devuelve true de entrada.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
    const ref = useRef<T | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold, rootMargin: "0px 0px -10% 0px" }
        );

        observer.observe(el);

        // Red de seguridad: contenido invisible para siempre por un observer
        // que nunca dispara (viewport atípico, navegación programática, etc.)
        // es peor que perder la animación de entrada.
        const fallback = setTimeout(() => setVisible(true), 2500);

        return () => {
            observer.disconnect();
            clearTimeout(fallback);
        };
    }, [threshold]);

    return { ref, visible };
}
