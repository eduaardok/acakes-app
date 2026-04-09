import type { PedidoHoy } from "../hooks/usePedidosHoy";

interface Props {
    pedido: PedidoHoy;
    onClick: () => void;
}

const estadoConfig = {
    BORRADOR:    { label: "Borrador",    bg: "bg-gray-100",    text: "text-gray-600" },
    CONFIRMADO:  { label: "Confirmado",  bg: "bg-blue-100",    text: "text-blue-700" },
    EN_PROCESO:  { label: "En proceso",  bg: "bg-yellow-100",  text: "text-yellow-700" },
    LISTO:       { label: "¡Listo!",     bg: "bg-green-100",   text: "text-green-700" },
    ENTREGADO:   { label: "Entregado",   bg: "bg-emerald-100", text: "text-emerald-700" },
    CANCELADO:   { label: "Cancelado",   bg: "bg-red-100",     text: "text-red-700" },
    NO_RETIRADO: { label: "No retirado", bg: "bg-orange-100",  text: "text-orange-700" },
} as const;

function formatHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatPrecio(precio: number): string {
    return `$${precio.toFixed(2)}`;
}

export function PedidoCard({ pedido, onClick }: Props) {
    const config = estadoConfig[pedido.estado];

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 min-h-[72px] active:bg-gray-50 transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                        {pedido.cliente.nombre}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {pedido.descripcion}
                    </p>
                </div>

                {/* Hora de entrega */}
                <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-700">
                        {formatHora(pedido.fechaEntrega)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {formatPrecio(pedido.precio)}
                    </p>
                </div>
            </div>

            {/* Chip de estado */}
            <div className="mt-3">
        <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
            </div>
        </button>
    );
}