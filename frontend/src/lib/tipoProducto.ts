// Compartido entre el admin (NuevoProducto/DetalleProducto/NuevoPedido/
// DetallePedido/Ingresos) y la capa pública (Catalogo/ProductoCard/
// ProductoDetalle) — un solo lugar con los 3 valores del enum TipoProducto
// del backend, sus etiquetas en español y su ícono.
import { CakeIcon, CupcakeIcon, TagIcon } from "../components/icons";

export const TIPOS_PRODUCTO = ["PASTEL", "CUPCAKE", "OTRO"] as const;
export type TipoProducto = (typeof TIPOS_PRODUCTO)[number];

export const TIPO_PRODUCTO_LABEL: Record<TipoProducto, string> = {
    PASTEL: "Pastel",
    CUPCAKE: "Cupcake",
    OTRO: "Otro",
};

export const TIPO_PRODUCTO_ICON: Record<TipoProducto, typeof CakeIcon> = {
    PASTEL: CakeIcon,
    CUPCAKE: CupcakeIcon,
    OTRO: TagIcon,
};
