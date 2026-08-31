const VISITANTE_ID_KEY = "visitanteId";

// Único uso permitido de localStorage en la capa pública fuera del token de
// cliente: un UUID anónimo para likes/favoritos sin cuenta. Se genera la
// primera vez que el usuario interactúa (like/favorito), no al cargar la página.
export function getVisitanteId(): string {
    let id = localStorage.getItem(VISITANTE_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(VISITANTE_ID_KEY, id);
    }
    return id;
}
