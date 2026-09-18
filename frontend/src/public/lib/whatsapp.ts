import { TIPO_PRODUCTO_LABEL, type TipoProducto } from "../../lib/tipoProducto";

const NUMERO = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// Único mecanismo de contacto/cotización de la UI pública: nunca se muestra
// precio, todo se negocia por WhatsApp. tipo es opcional y, cuando viene, se
// menciona en español — nunca se asume "pastel" para un producto que no lo es.
export function whatsappCotizarUrl(nombreProducto: string, tipo?: TipoProducto, imagenUrl?: string): string {
    const etiquetaTipo = tipo ? ` (${TIPO_PRODUCTO_LABEL[tipo]})` : "";
    const lineaFoto = imagenUrl ? `\nFoto: ${imagenUrl}` : "";
    const mensaje = `Hola, me interesa cotizar: ${nombreProducto}${etiquetaTipo}${lineaFoto}`;
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Contacto genérico (landing) — sin producto puntual todavía, por eso no
// asume un tipo específico ("pastel", "cupcake"): el negocio ahora vende
// varios tipos de producto.
export function whatsappContactoUrl(): string {
    const mensaje = "Hola, quisiera cotizar un pedido personalizado.";
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
