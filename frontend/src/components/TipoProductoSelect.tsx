import { TIPOS_PRODUCTO, TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON, type TipoProducto } from "../lib/tipoProducto";

interface Props {
    value: TipoProducto;
    onChange: (tipo: TipoProducto) => void;
    label?: string;
}

/** Selector requerido de tipo de producto (PASTEL/CUPCAKE/OTRO) — usado en
 * crear/editar producto. Siempre tiene un valor (default visual PASTEL lo
 * fija el caller), así que no hace falta un estado "sin seleccionar". */
export function TipoProductoSelect({ value, onChange, label = "Tipo" }: Props) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
            <div className="flex gap-2">
                {TIPOS_PRODUCTO.map((tipo) => {
                    const Icon = TIPO_PRODUCTO_ICON[tipo];
                    const activo = value === tipo;
                    return (
                        <button
                            key={tipo}
                            type="button"
                            onClick={() => onChange(tipo)}
                            aria-pressed={activo}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-[color,background-color] duration-150 ease-out ${
                                activo
                                    ? "bg-pink-600 text-white"
                                    : "border border-gray-200 bg-white text-gray-600"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {TIPO_PRODUCTO_LABEL[tipo]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
