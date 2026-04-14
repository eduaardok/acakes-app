import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Al cambiar de ruta: sube el scroll y quita el foco del teclado.
 * En iOS ayuda a que no quede “enganchado” el zoom por un input enfocado al saltar de pantalla.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        const active = document.activeElement;
        if (active instanceof HTMLElement && active !== document.body) {
            active.blur();
        }
    }, [pathname]);

    return null;
}
