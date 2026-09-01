# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias distintas en la misma app:
- **Dueña/operadora del negocio** (admin en `/`, `/clientes`, `/calendario`, `/ingresos`, `/cuenta`): gestiona pedidos, clientes e ingresos desde el celular, en el día a día del taller.
- **Clientes finales** (frontend público en `/catalogo`, `/producto/:id`, ahora `/` como landing): navegan el catálogo de pasteles, guardan favoritos y cotizan por WhatsApp. *(Inferido del código existente — no confirmado por entrevista.)*

## Product Purpose

App de gestión de pedidos para una pastelería (Ainoa's Cakes) con una capa pública de catálogo para que los clientes descubran productos y coticen. Éxito = pedidos correctamente registrados/seguidos en el admin, y clientes que llegan al catálogo y cotizan por WhatsApp.

## Positioning

Pasteles personalizados y temáticos a pedido — no un menú fijo de precios. El catálogo público está organizado por temática/ocasión (cumpleaños, quinceañeras, infantil, etc.), y todo el contacto/cotización pasa por WhatsApp en vez de un checkout con precios. *(Confirmado por el usuario: el diferenciador es la personalización a pedido.)*

## Operating Context

Zona de cobertura/entrega: El Empalme, Ecuador. *(Confirmado por el usuario.)*

## Capabilities and Constraints

- Nunca se muestra precio en la capa pública del catálogo (constraint de negocio explícito, ya aplicado en todo el código existente).
- Cotización de productos es siempre vía WhatsApp (`whatsappCotizarUrl`), no un formulario ni checkout propio.
- El admin es de un solo usuario dueño del negocio (no hay roles/equipo).
- Favoritos y "me gusta" funcionan tanto para visitantes anónimos (actorId por UUID en localStorage) como para clientes con cuenta.

## Brand Commitments

- Nombre: **Ainoa's Cakes**.
- Logo existente: `frontend/public/logo.png` (usado en headers de admin y público).
- Colores de marca en uso en la UI: rosa (`pink-600`, acento primario/CTA dominante) y morado (`#662889`, escala `brand-purple` en `frontend/src/index.css`, acento secundario) — ambos extraídos del logo de dos tonos. El morado se usa en momentos de marca puntuales (gradiente del CTA final de la landing, wash de sección, glow decorativo del hero) y como color categórico de "ocasión" (vs. rosa para "temática"), nunca compitiendo con el rosa como acción principal.

## Evidence on Hand

- Catálogo real vía `GET /api/public/catalogo` (productos con imágenes, temática, ocasión, vistas).
- No hay testimonios, casos de estudio ni prensa — no inventar ninguno.
- No hay fotografía de marca dedicada para un hero; el único asset de `assets/hero.png` es un placeholder genérico sin relación con pastelería y no se usa como imagen de marca.

## Product Principles

1. Nunca mostrar precios en la capa pública — todo pasa por cotización directa.
2. El catálogo se organiza por temática/ocasión, no por categoría de producto genérica.
3. WhatsApp es el único canal de contacto/conversión — cualquier CTA de "contactar" apunta ahí.
4. La capa pública es mobile-first y de baja fricción (el proyecto ya prioriza bajo peso/conectividad limitada).
