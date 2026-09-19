import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useCuentasCliente, type CuentaCliente } from "../hooks/useCuentasCliente";
import { SistemaLayout } from "../components/SistemaLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconButton } from "../components/IconButton";
import { Skeleton } from "../components/Skeleton";
import { TrashIcon, AlertTriangleIcon } from "../components/icons";

const formatoFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-EC", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export default function SistemaCuentasCliente() {
    usePageTitle("Cuentas de clientes");
    const { cuentas, loading, error, eliminar } = useCuentasCliente();

    const [aEliminar, setAEliminar] = useState<CuentaCliente | null>(null);
    const [eliminando, setEliminando] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const confirmarEliminar = async () => {
        if (!aEliminar) return;
        setEliminando(true);
        setErrorAccion(null);
        setOk(null);
        try {
            await eliminar(aEliminar.id);
            setOk("Cuenta eliminada");
            setAEliminar(null);
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "No se pudo eliminar la cuenta");
        } finally {
            setEliminando(false);
        }
    };

    return (
        <SistemaLayout>
            <section className="space-y-3">
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Cuentas del catálogo
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                        Clientes registrados en la tienda pública. No tienen acceso al panel ni rol
                        asignado.
                    </p>
                </div>

                {ok && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{ok}</p>}

                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                    {loading && (
                        <div className="space-y-3 p-4">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    )}

                    {!loading && error && <p className="p-4 text-sm text-red-600">{error}</p>}

                    {!loading && !error && cuentas.length === 0 && (
                        <p className="p-4 text-sm text-gray-400">
                            Todavía no hay clientes registrados en el catálogo.
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        cuentas.map((cuenta) => (
                            <div key={cuenta.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {cuenta.nombre}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">{cuenta.email}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Registrado el {formatoFecha(cuenta.createdAt)}
                                        {cuenta.clienteId !== null && " · vinculado a un cliente"}
                                    </p>
                                </div>

                                <IconButton
                                    type="button"
                                    variant="danger"
                                    onClick={() => {
                                        setAEliminar(cuenta);
                                        setErrorAccion(null);
                                    }}
                                    aria-label={`Eliminar cuenta de ${cuenta.email}`}
                                    className="shrink-0"
                                >
                                    <TrashIcon />
                                </IconButton>
                            </div>
                        ))}
                </div>
            </section>

            {aEliminar && (
                <ConfirmDialog
                    titulo="Eliminar cuenta de cliente"
                    textoConfirmar="Eliminar"
                    destructivo
                    cargando={eliminando}
                    error={errorAccion}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => {
                        setAEliminar(null);
                        setErrorAccion(null);
                    }}
                >
                    <p>
                        Se eliminará la cuenta de{" "}
                        <span className="font-medium text-gray-700">{aEliminar.nombre}</span> (
                        {aEliminar.email}).
                    </p>
                    <p className="flex gap-2 rounded-xl bg-red-50 p-3 text-red-700">
                        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            También se borran en cascada sus reseñas, favoritos y fechas especiales.
                            Esta acción no se puede deshacer.
                        </span>
                    </p>
                    {aEliminar.clienteId !== null && (
                        <p>
                            El cliente de negocio vinculado no se elimina: solo queda desvinculado,
                            con sus pedidos intactos.
                        </p>
                    )}
                </ConfirmDialog>
            )}
        </SistemaLayout>
    );
}
