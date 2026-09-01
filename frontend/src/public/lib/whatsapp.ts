const NUMERO = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// Único mecanismo de contacto/cotización de la UI pública: nunca se muestra
// precio, todo se negocia por WhatsApp.
export function whatsappCotizarUrl(nombreProducto: string): string {
    const mensaje = `Hola, me interesa cotizar: ${nombreProducto}`;
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Contacto genérico (landing) — sin producto puntual todavía.
export function whatsappContactoUrl(): string {
    const mensaje = "Hola, quisiera cotizar un pastel personalizado.";
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
