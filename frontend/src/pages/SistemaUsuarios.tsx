import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useUsuariosSistema, type UsuarioSistema } from "../hooks/useUsuariosSistema";
import { SistemaLayout } from "../components/SistemaLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Skeleton } from "../components/Skeleton";
import { TrashIcon, RefreshIcon, AlertTriangleIcon } from "../components/icons";
import { ROLES_USUARIO, ROL_LABEL, getRolAdmin, type RolUsuario } from "../lib/authAdmin";

const MIN_PASSWORD_LEN = 4;

const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300";

/** Badge de rol — brand-purple para SYSTEM_ADMIN, gris neutro para ADMIN. */
function RoleBadge({ role }: { role: RolUsuario }) {
    const esSistema = role === "SYSTEM_ADMIN";
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                esSistema
                    ? "bg-brand-purple-50 text-brand-purple-700"
                    : "bg-gray-100 text-gray-600"
            }`}
        >
            {ROL_LABEL[role]}
        </span>
    );
}

const formatoFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-EC", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export default function SistemaUsuarios() {
    usePageTitle("Usuarios del sistema");
    const { usuarios, loading, error, crear, cambiarRole, eliminar } = useUsuariosSistema();

    // Id del admin logueado: para marcar "vos" en la lista. El backend igual
    // bloquea auto-eliminarse y auto-degradarse; esto solo lo anticipa.
    const rolPropio = getRolAdmin();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rolNuevo, setRolNuevo] = useState<RolUsuario>("ADMIN");
    const [creando, setCreando] = useState(false);
    const [errorForm, setErrorForm] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const [aCambiarRole, setACambiarRole] = useState<{
        usuario: UsuarioSistema;
        nuevoRole: RolUsuario;
    } | null>(null);
    const [aEliminar, setAEliminar] = useState<UsuarioSistema | null>(null);
    const [accionEnCurso, setAccionEnCurso] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    const handleCrear = async () => {
        setErrorForm(null);
        setOk(null);

        if (!email.trim()) {
            setErrorForm("El email es requerido");
            return;
        }
        if (password.length < MIN_PASSWORD_LEN) {
            setErrorForm(`La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres`);
            return;
        }

        setCreando(true);
        try {
            await crear({ email: email.trim(), password, role: rolNuevo });
            setEmail("");
            setPassword("");
            setRolNuevo("ADMIN");
            setMostrarForm(false);
            setOk("Usuario creado");
        } catch (err) {
            // Mensaje real del backend (ej. "Ya existe un usuario con ese email").
            setErrorForm(err instanceof Error ? err.message : "Error al crear el usuario");
        } finally {
            setCreando(false);
        }
    };

    const confirmarCambioRole = async () => {
        if (!aCambiarRole) return;
        setAccionEnCurso(true);
        setErrorAccion(null);
        setOk(null);
        try {
            await cambiarRole(aCambiarRole.usuario.id, aCambiarRole.nuevoRole);
            setOk(`Rol actualizado a ${ROL_LABEL[aCambiarRole.nuevoRole]}`);
            setACambiarRole(null);
        } catch (err) {
            // Los 400 de regla de negocio (auto-degradación, último
            // SYSTEM_ADMIN) traen el texto que hay que mostrar tal cual.
            setErrorAccion(err instanceof Error ? err.message : "No se pudo cambiar el rol");
        } finally {
            setAccionEnCurso(false);
        }
    };

    const confirmarEliminar = async () => {
        if (!aEliminar) return;
        setAccionEnCurso(true);
        setErrorAccion(null);
        setOk(null);
        try {
            await eliminar(aEliminar.id);
            setOk("Usuario eliminado");
            setAEliminar(null);
        } catch (err) {
            // Idem: auto-eliminación y "último SYSTEM_ADMIN" llegan con mensaje.
            setErrorAccion(err instanceof Error ? err.message : "No se pudo eliminar el usuario");
        } finally {
            setAccionEnCurso(false);
        }
    };

    const cerrarDialogos = () => {
        setACambiarRole(null);
        setAEliminar(null);
        setErrorAccion(null);
    };

    return (
        <SistemaLayout>
            <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Usuarios del panel
                        </h2>
                        <p className="mt-1 text-xs text-gray-400">
                            Cuentas con acceso al panel de administración.
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            setMostrarForm((v) => !v);
                            setErrorForm(null);
                        }}
                        className="shrink-0"
                    >
                        {mostrarForm ? "Cancelar" : "Nuevo usuario"}
                    </Button>
                </div>

                {mostrarForm && (
                    <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                        <div>
                            <label
                                htmlFor="nuevo-email"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                                Email
                            </label>
                            <input
                                id="nuevo-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                                className={inputBase}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="nuevo-password"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                                Contraseña
                            </label>
                            <input
                                id="nuevo-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                className={inputBase}
                            />
                            <p className="mt-1 px-0.5 text-xs text-gray-400">
                                Mínimo {MIN_PASSWORD_LEN} caracteres.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="nuevo-role"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                                Rol
                            </label>
                            <select
                                id="nuevo-role"
                                value={rolNuevo}
                                onChange={(e) => setRolNuevo(e.target.value as RolUsuario)}
                                className={inputBase}
                            >
                                {ROLES_USUARIO.map((rol) => (
                                    <option key={rol} value={rol}>
                                        {ROL_LABEL[rol]}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 px-0.5 text-xs text-gray-400">
                                {rolNuevo === "SYSTEM_ADMIN"
                                    ? "Podrá gestionar usuarios y roles, además del negocio."
                                    : "Acceso al negocio (pedidos, clientes, productos)."}
                            </p>
                        </div>

                        {errorForm && (
                            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{errorForm}</p>
                        )}

                        <Button type="button" fullWidth size="sm" loading={creando} onClick={handleCrear}>
                            {creando ? "Creando..." : "Crear usuario"}
                        </Button>
                    </div>
                )}

                {ok && (
                    <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{ok}</p>
                )}

                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                    {loading && (
                        <div className="space-y-3 p-4">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    )}

                    {!loading && error && <p className="p-4 text-sm text-red-600">{error}</p>}

                    {!loading && !error && usuarios.length === 0 && (
                        <p className="p-4 text-sm text-gray-400">No hay usuarios todavía.</p>
                    )}

                    {!loading &&
                        !error &&
                        usuarios.map((usuario) => {
                            const otroRole: RolUsuario =
                                usuario.role === "SYSTEM_ADMIN" ? "ADMIN" : "SYSTEM_ADMIN";
                            return (
                                <div key={usuario.id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {usuario.email}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Creado el {formatoFecha(usuario.creadoEn)}
                                        </p>
                                        <div className="mt-1.5">
                                            <RoleBadge role={usuario.role} />
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        <IconButton
                                            type="button"
                                            onClick={() =>
                                                setACambiarRole({ usuario, nuevoRole: otroRole })
                                            }
                                            aria-label={`Cambiar rol de ${usuario.email}`}
                                            title={`Cambiar a ${ROL_LABEL[otroRole]}`}
                                        >
                                            <RefreshIcon className="h-4 w-4" />
                                        </IconButton>
                                        <IconButton
                                            type="button"
                                            variant="danger"
                                            onClick={() => setAEliminar(usuario)}
                                            aria-label={`Eliminar ${usuario.email}`}
                                        >
                                            <TrashIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {rolPropio === "SYSTEM_ADMIN" && (
                    <p className="px-1 text-xs text-gray-400">
                        No podés quitarte tu propio rol de administrador del sistema ni eliminar tu
                        cuenta desde acá, y el sistema siempre conserva al menos uno.
                    </p>
                )}
            </section>

            {aCambiarRole && (
                <ConfirmDialog
                    titulo="Cambiar rol"
                    textoConfirmar="Cambiar rol"
                    cargando={accionEnCurso}
                    error={errorAccion}
                    onConfirmar={confirmarCambioRole}
                    onCancelar={cerrarDialogos}
                >
                    <p>
                        <span className="font-medium text-gray-700">{aCambiarRole.usuario.email}</span>{" "}
                        pasará de {ROL_LABEL[aCambiarRole.usuario.role]} a{" "}
                        <span className="font-medium text-gray-700">
                            {ROL_LABEL[aCambiarRole.nuevoRole]}
                        </span>
                        .
                    </p>
                    {aCambiarRole.nuevoRole === "SYSTEM_ADMIN" ? (
                        <p className="flex gap-2 rounded-xl bg-brand-purple-50 p-3 text-brand-purple-700">
                            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                Podrá crear y eliminar usuarios del panel, cambiar roles y borrar
                                cuentas de clientes.
                            </span>
                        </p>
                    ) : (
                        <p>Perderá el acceso a esta sección de administración del sistema.</p>
                    )}
                </ConfirmDialog>
            )}

            {aEliminar && (
                <ConfirmDialog
                    titulo="Eliminar usuario"
                    textoConfirmar="Eliminar"
                    destructivo
                    cargando={accionEnCurso}
                    error={errorAccion}
                    onConfirmar={confirmarEliminar}
                    onCancelar={cerrarDialogos}
                >
                    <p>
                        Se eliminará la cuenta de{" "}
                        <span className="font-medium text-gray-700">{aEliminar.email}</span> y perderá
                        el acceso al panel. Esta acción no se puede deshacer.
                    </p>
                    <p>
                        El registro de auditoría de lo que hizo se conserva.
                    </p>
                </ConfirmDialog>
            )}
        </SistemaLayout>
    );
}
