import { useEffect } from "react";
import { Button } from "./Button";
import { XIcon } from "./icons";

interface Props {
    titulo: string;
    /** Cuerpo del diálogo: texto o markup (ej. una advertencia de cascada). */
    children: React.ReactNode;
    textoConfirmar: string;
    /** Rojo para acciones destructivas; primario para el resto. */
    destructivo?: boolean;
    cargando?: boolean;
    /** Error del backend, mostrado dentro del diálogo sin cerrarlo. */
    error?: string | null;
    onConfirmar: () => void;
    onCancelar: () => void;
}

/**
 * Confirmación modal — extraída del patrón ya usado en DetalleProducto
 * (backdrop black/40 + tarjeta blanca redondeada) para las acciones de
 * administración del sistema, donde window.confirm no alcanza: hay que
 * explicar consecuencias y mostrar el error real del backend sin perder el
 * contexto de la acción.
 */
export function ConfirmDialog({
    titulo,
    children,
    textoConfirmar,
    destructivo,
    cargando,
    error,
    onConfirmar,
    onCancelar,
}: Props) {
    // Escape cierra, salvo mientras la acción está en curso.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !cargando) onCancelar();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [cargando, onCancelar]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
        >
            <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">{titulo}</p>
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={cargando}
                        aria-label="Cerrar"
                        className="shrink-0 text-gray-400 disabled:opacity-50"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-2 text-xs text-gray-500">{children}</div>

                {error && (
                    <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</p>
                )}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        disabled={cargando}
                        onClick={onCancelar}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant={destructivo ? "danger" : "primary"}
                        size="sm"
                        className="flex-1"
                        loading={cargando}
                        onClick={onConfirmar}
                    >
                        {textoConfirmar}
                    </Button>
                </div>
            </div>
        </div>
    );
}
