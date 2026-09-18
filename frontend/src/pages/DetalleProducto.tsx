import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useProducto, type ProductoDetalle } from "../hooks/useProducto";
import type { Categoria } from "../hooks/useCategorias";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Skeleton } from "../components/Skeleton";
import { Spinner } from "../components/Spinner";
import { CakeIcon, TrashIcon, DotsVerticalIcon, XIcon } from "../components/icons";
import { CategoriaCombobox } from "../components/CategoriaCombobox";
import { TipoProductoSelect } from "../components/TipoProductoSelect";
import { BuscadorProducto, type ProductoVinculado } from "../components/BuscadorProducto";
import { TIPO_PRODUCTO_LABEL, TIPO_PRODUCTO_ICON, type TipoProducto } from "../lib/tipoProducto";

const MAX_IMAGENES = 8;

export default function DetalleProducto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { producto, loading, error, refetch } = useProducto(id!);

    const [editando, setEditando] = useState(false);
    const [nombreEdit, setNombreEdit] = useState("");
    const [descripcionEdit, setDescripcionEdit] = useState("");
    const [tipoEdit, setTipoEdit] = useState<TipoProducto>("PASTEL");
    const [tematicasEdit, setTematicasEdit] = useState<Categoria[]>([]);
    const [ocasionesEdit, setOcasionesEdit] = useState<Categoria[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

    const [subiendoFotos, setSubiendoFotos] = useState(false);
    const [errorFotos, setErrorFotos] = useState<string | null>(null);
    const [eliminandoImagenId, setEliminandoImagenId] = useState<number | null>(null);
    const [eliminandoProducto, setEliminandoProducto] = useState(false);

    const [menuImagenId, setMenuImagenId] = useState<number | null>(null);

    const [imagenASepararId, setImagenASepararId] = useState<number | null>(null);
    const [tipoSeparar, setTipoSeparar] = useState<TipoProducto>("PASTEL");
    const [separando, setSeparando] = useState(false);
    const [errorSeparar, setErrorSeparar] = useState<string | null>(null);

    const [imagenAMoverId, setImagenAMoverId] = useState<number | null>(null);
    const [moviendo, setMoviendo] = useState(false);
    const [errorMover, setErrorMover] = useState<string | null>(null);

    usePageTitle(producto?.nombre ?? "Producto");

    const abrirEdicion = () => {
        if (!producto) return;
        setNombreEdit(producto.nombre);
        setDescripcionEdit(producto.descripcion ?? "");
        setTipoEdit(producto.tipo);
        setTematicasEdit(producto.tematicas);
        setOcasionesEdit(producto.ocasiones);
        setErrorEdicion(null);
        setEditando(true);
    };

    const handleGuardar = async () => {
        if (!nombreEdit.trim()) {
            setErrorEdicion("El nombre es obligatorio");
            return;
        }
        setGuardando(true);
        setErrorEdicion(null);
        try {
            await api.patch(`/productos/${id}`, {
                nombre: nombreEdit.trim(),
                descripcion: descripcionEdit.trim() || null,
                tipo: tipoEdit,
                tematicaIds: tematicasEdit.map((c) => c.id),
                ocasionIds: ocasionesEdit.map((c) => c.id),
            });
            setEditando(false);
            await refetch();
        } catch (err) {
            setErrorEdicion(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardando(false);
        }
    };

    const handleAgregarFotos = async (files: FileList | null) => {
        if (!files || files.length === 0 || !producto) return;
        const disponibles = MAX_IMAGENES - producto.imagenes.length;
        if (disponibles <= 0) return;

        setSubiendoFotos(true);
        setErrorFotos(null);
        try {
            const formData = new FormData();
            Array.from(files)
                .slice(0, disponibles)
                .forEach((f) => formData.append("imagenes", f));
            await api.postForm<ProductoDetalle>(`/productos/${id}/imagenes`, formData);
            await refetch();
        } catch (err) {
            setErrorFotos(err instanceof Error ? err.message : "Error al subir fotos");
        } finally {
            setSubiendoFotos(false);
        }
    };

    const handleEliminarImagen = async (imagenId: number) => {
        if (!window.confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
        setEliminandoImagenId(imagenId);
        setErrorFotos(null);
        try {
            await api.del(`/productos/${id}/imagenes/${imagenId}`);
            await refetch();
        } catch (err) {
            setErrorFotos(err instanceof Error ? err.message : "Error al eliminar la foto");
        } finally {
            setEliminandoImagenId(null);
        }
    };

    const abrirSepararModal = (imagenId: number) => {
        if (!producto) return;
        setMenuImagenId(null);
        setTipoSeparar(producto.tipo);
        setErrorSeparar(null);
        setImagenASepararId(imagenId);
    };

    const confirmarSeparar = async () => {
        if (imagenASepararId == null) return;
        setSeparando(true);
        setErrorSeparar(null);
        try {
            const nuevo = await api.post<ProductoDetalle>(
                `/productos/${id}/imagenes/${imagenASepararId}/separar`,
                { tipo: tipoSeparar }
            );
            navigate(`/panel/productos/${nuevo.id}`);
        } catch (err) {
            setErrorSeparar(err instanceof Error ? err.message : "Error al separar la imagen");
            setSeparando(false);
        }
    };

    const abrirMoverModal = (imagenId: number) => {
        setMenuImagenId(null);
        setErrorMover(null);
        setImagenAMoverId(imagenId);
    };

    const confirmarMover = async (destino: ProductoVinculado) => {
        if (imagenAMoverId == null) return;
        setMoviendo(true);
        setErrorMover(null);
        try {
            await api.patch(`/productos/${id}/imagenes/${imagenAMoverId}/mover`, {
                productoDestinoId: destino.id,
            });
            setImagenAMoverId(null);
            await refetch();
        } catch (err) {
            setErrorMover(err instanceof Error ? err.message : "Error al mover la imagen");
        } finally {
            setMoviendo(false);
        }
    };

    const handleEliminarProducto = async () => {
        if (!window.confirm("¿Eliminar este producto y todas sus fotos? Esta acción no se puede deshacer.")) return;
        setEliminandoProducto(true);
        try {
            await api.del(`/productos/${id}`);
            navigate("/panel/productos", { replace: true });
        } catch (err) {
            setErrorFotos(err instanceof Error ? err.message : "Error al eliminar el producto");
            setEliminandoProducto(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                    <Skeleton className="h-6 w-40 max-w-lg mx-auto" />
                </header>
                <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
                <p className="text-red-600 text-sm">{error ?? "Producto no encontrado"}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-400 underline">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <IconButton onClick={() => navigate(-1)} className="-ml-2" aria-label="Volver">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </IconButton>
                    <h1 className="text-xl font-bold text-gray-900 truncate">{producto.nombre}</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
                {/* Fotos */}
                <section className="space-y-2">
                    {producto.imagenes.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {producto.imagenes.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                                    onBlur={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            setMenuImagenId((actual) => (actual === img.id ? null : actual));
                                        }
                                    }}
                                >
                                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setMenuImagenId(menuImagenId === img.id ? null : img.id)}
                                        className="absolute top-1 left-1 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center"
                                        aria-label="Más opciones de esta foto"
                                        aria-expanded={menuImagenId === img.id}
                                    >
                                        <DotsVerticalIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarImagen(img.id)}
                                        disabled={eliminandoImagenId === img.id}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center disabled:opacity-50"
                                        aria-label="Eliminar foto"
                                    >
                                        {eliminandoImagenId === img.id ? (
                                            <Spinner className="h-3.5 w-3.5" />
                                        ) : (
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        )}
                                    </button>

                                    {menuImagenId === img.id && (
                                        <div className="absolute top-8 left-1 z-10 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() => abrirSepararModal(img.id)}
                                                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-pink-50"
                                            >
                                                Separar como producto nuevo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => abrirMoverModal(img.id)}
                                                className="block w-full border-t border-gray-100 px-3 py-2 text-left text-xs text-gray-700 hover:bg-pink-50"
                                            >
                                                Mover a otro producto
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 py-8 flex flex-col items-center gap-2">
                            <CakeIcon className="h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-400">Sin fotos todavía</p>
                        </div>
                    )}

                    {producto.imagenes.length < MAX_IMAGENES && (
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 cursor-pointer active:bg-gray-50">
                            {subiendoFotos ? "Subiendo..." : "Agregar fotos"}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                disabled={subiendoFotos}
                                onChange={(e) => handleAgregarFotos(e.target.files)}
                            />
                        </label>
                    )}
                    {errorFotos && <p className="text-xs text-red-600 px-0.5">{errorFotos}</p>}
                </section>

                {/* Card: datos */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Datos</p>

                    {!editando ? (
                        <>
                            <div>
                                <p className="text-xs text-gray-400">Nombre</p>
                                <p className="text-gray-900">{producto.nombre}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Descripción</p>
                                <p className="text-sm text-gray-600">{producto.descripcion || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Tipo</p>
                                <p className="flex items-center gap-1.5 text-sm text-gray-600">
                                    {(() => {
                                        const Icon = TIPO_PRODUCTO_ICON[producto.tipo];
                                        return <Icon className="h-4 w-4 text-gray-400" />;
                                    })()}
                                    {TIPO_PRODUCTO_LABEL[producto.tipo]}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Temáticas</p>
                                    <p className="text-sm text-gray-600">
                                        {producto.tematicas.map((c) => c.nombre).join(", ") || "—"}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Ocasiones</p>
                                    <p className="text-sm text-gray-600">
                                        {producto.ocasiones.map((c) => c.nombre).join(", ") || "—"}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={abrirEdicion} className="text-sm font-medium text-pink-600">
                                Editar datos
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={nombreEdit}
                                onChange={(e) => setNombreEdit(e.target.value)}
                                placeholder="Nombre"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                            <textarea
                                value={descripcionEdit}
                                onChange={(e) => setDescripcionEdit(e.target.value)}
                                placeholder="Descripción"
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                            />
                            <TipoProductoSelect value={tipoEdit} onChange={setTipoEdit} />
                            <CategoriaCombobox
                                tipo="tematicas"
                                label="Temáticas"
                                placeholder="Buscar o crear temática"
                                value={tematicasEdit}
                                onChange={setTematicasEdit}
                            />
                            <CategoriaCombobox
                                tipo="ocasiones"
                                label="Ocasiones"
                                placeholder="Buscar o crear ocasión"
                                value={ocasionesEdit}
                                onChange={setOcasionesEdit}
                            />
                            {errorEdicion && <p className="text-xs text-red-600">{errorEdicion}</p>}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setEditando(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleGuardar}
                                    loading={guardando}
                                >
                                    {guardando ? "Guardando..." : "Guardar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    loading={eliminandoProducto}
                    onClick={handleEliminarProducto}
                >
                    {eliminandoProducto ? "Eliminando..." : "Eliminar producto"}
                </Button>

                <div className="h-6" />
            </main>

            {imagenASepararId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Separar como producto nuevo</p>
                            <button
                                type="button"
                                onClick={() => setImagenASepararId(null)}
                                disabled={separando}
                                aria-label="Cerrar"
                                className="text-gray-400 disabled:opacity-50"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Se creará un producto nuevo con esta foto. Confirmá o ajustá su tipo.
                        </p>
                        <TipoProductoSelect value={tipoSeparar} onChange={setTipoSeparar} />
                        {errorSeparar && <p className="text-xs text-red-600">{errorSeparar}</p>}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                disabled={separando}
                                onClick={() => setImagenASepararId(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="flex-1"
                                loading={separando}
                                onClick={confirmarSeparar}
                            >
                                {separando ? "Creando..." : "Crear producto"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {imagenAMoverId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Mover a otro producto</p>
                            <button
                                type="button"
                                onClick={() => setImagenAMoverId(null)}
                                disabled={moviendo}
                                aria-label="Cerrar"
                                className="text-gray-400 disabled:opacity-50"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                        {moviendo ? (
                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                                <Spinner className="h-4 w-4" />
                                Moviendo imagen...
                            </div>
                        ) : (
                            <BuscadorProducto
                                value={null}
                                onChange={(destino) => {
                                    if (destino) confirmarMover(destino);
                                }}
                                excludeId={producto.id}
                            />
                        )}
                        {errorMover && <p className="text-xs text-red-600">{errorMover}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
