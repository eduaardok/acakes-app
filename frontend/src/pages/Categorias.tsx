import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useCategorias, type Categoria, type TipoCategoria } from "../hooks/useCategorias";
import { IconButton } from "../components/IconButton";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";

function CategoriaSection({
    tipo,
    titulo,
    singular,
}: {
    tipo: TipoCategoria;
    titulo: string;
    singular: string;
}) {
    const { categorias, loading, error, crear, editar, eliminar } = useCategorias(tipo);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [creando, setCreando] = useState(false);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);

    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [nombreEdit, setNombreEdit] = useState("");
    const [guardandoEdit, setGuardandoEdit] = useState(false);
    const [eliminandoId, setEliminandoId] = useState<string | null>(null);

    const handleCrear = async () => {
        if (!nuevoNombre.trim()) return;
        setCreando(true);
        setErrorAccion(null);
        try {
            await crear(nuevoNombre.trim());
            setNuevoNombre("");
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al crear");
        } finally {
            setCreando(false);
        }
    };

    const abrirEdicion = (categoria: Categoria) => {
        setEditandoId(categoria.id);
        setNombreEdit(categoria.nombre);
        setErrorAccion(null);
    };

    const handleGuardarEdicion = async (id: string) => {
        if (!nombreEdit.trim()) return;
        setGuardandoEdit(true);
        setErrorAccion(null);
        try {
            await editar(id, nombreEdit.trim());
            setEditandoId(null);
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setGuardandoEdit(false);
        }
    };

    const handleEliminar = async (categoria: Categoria) => {
        if (!window.confirm(`¿Eliminar "${categoria.nombre}"?`)) return;
        setEliminandoId(categoria.id);
        setErrorAccion(null);
        try {
            await eliminar(categoria.id);
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : "Error al eliminar");
        } finally {
            setEliminandoId(null);
        }
    };

    return (
        <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{titulo}</h2>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder={`Nueva ${singular}`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={handleCrear}
                    loading={creando}
                    disabled={!nuevoNombre.trim()}
                >
                    Agregar
                </Button>
            </div>

            {errorAccion && <p className="text-xs text-red-600">{errorAccion}</p>}

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {loading && (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                )}

                {error && !loading && <p className="p-4 text-sm text-red-600">{error}</p>}

                {!loading && !error && categorias.length === 0 && (
                    <p className="p-4 text-sm text-gray-400">Sin categorías todavía.</p>
                )}

                {!loading &&
                    categorias.map((categoria) => (
                        <div key={categoria.id} className="flex items-center gap-2 px-4 py-3">
                            {editandoId === categoria.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={nombreEdit}
                                        onChange={(e) => setNombreEdit(e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleGuardarEdicion(categoria.id)}
                                        disabled={guardandoEdit}
                                        className="text-sm font-medium text-pink-600 disabled:opacity-50"
                                    >
                                        {guardandoEdit ? "..." : "Guardar"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditandoId(null)}
                                        className="text-sm text-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 text-sm text-gray-800">{categoria.nombre}</span>
                                    <button
                                        type="button"
                                        onClick={() => abrirEdicion(categoria)}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEliminar(categoria)}
                                        disabled={eliminandoId === categoria.id}
                                        className="text-sm font-medium text-red-500 disabled:opacity-50"
                                    >
                                        {eliminandoId === categoria.id ? "..." : "Eliminar"}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
            </div>
        </section>
    );
}

export default function Categorias() {
    usePageTitle("Categorías");
    const navigate = useNavigate();

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
                    <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                <CategoriaSection tipo="tematicas" titulo="Temáticas" singular="temática" />
                <CategoriaSection tipo="ocasiones" titulo="Ocasiones" singular="ocasión" />
                <div className="h-6" />
            </main>
        </div>
    );
}
