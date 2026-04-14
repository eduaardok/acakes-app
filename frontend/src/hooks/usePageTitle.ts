import { useEffect } from "react";

/** Misma marca que en Login — sufijo fijo en la pestaña del navegador */
const TITLE_SUFFIX = " · Ainoa's Cakes";

/**
 * Actualiza `document.title` al montar y cuando cambia el título (p. ej. datos async).
 */
export function usePageTitle(pageTitle: string) {
    useEffect(() => {
        document.title = `${pageTitle}${TITLE_SUFFIX}`;
    }, [pageTitle]);
}
