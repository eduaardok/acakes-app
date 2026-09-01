import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { usePageTitle } from "../hooks/usePageTitle";
import type { ProductoDetalle } from "../hooks/useProducto";
import type { Categoria } from "../hooks/useCategorias";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { CategoriaCombobox } from "../components/CategoriaCombobox";

const MAX_IMAGENES = 8;

export default function NuevoProducto() {
    usePageTitle("Nuevo producto");
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tematica, setTematica] = useState<Categoria | null>(null);
    const [ocasion, setOcasion] = useState<Categoria | null>(null);
    const [archivos, setArchivos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const urls = archivos.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [archivos]);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const nuevos = Array.from(files).slice(0, MAX_IMAGENES - archivos.length);
        setArchivos((prev) => [...prev, ...nuevos].slice(0, MAX_IMAGENES));
    };

    const quitarArchivo = (index: number) => {
        setArchivos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }

        setError(null);
        setGuardando(true);

        try {
            const formData = new FormData();
            formData.set("nombre", nombre.trim());
            if (descripcion.trim()) formData.set("descripcion", descripcion.trim());
            if (tematica) formData.set("tematicaId", tematica.id);
            if (ocasion) formData.set("ocasionId", ocasion.id);
            archivos.forEach((f) => formData.append("imagenes", f));

            const producto = await api.postForm<ProductoDetalle>("/productos", formData);
            navigate(`/panel/productos/${producto.id}`, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear producto");
        } finally {
            setGuardando(false);
        }
    };

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
                    <h1 className="text-xl font-bold text-gray-900">Nuevo producto</h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
                <section className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Datos del producto
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    />
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción (opcional)"
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white resize-none"
                    />
                    <CategoriaCombobox
                        tipo="tematicas"
                        label="Temática (opcional)"
                        placeholder="Buscar o crear temática"
                        value={tematica}
                        onChange={setTematica}
                    />
                    <CategoriaCombobox
                        tipo="ocasiones"
                        label="Ocasión (opcional)"
                        placeholder="Buscar o crear ocasión"
                        value={ocasion}
                        onChange={setOcasion}
                    />
                </section>

                <section className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Fotos ({archivos.length}/{MAX_IMAGENES})
                    </label>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {previews.map((url, i) => (
                                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => quitarArchivo(i)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs leading-none"
                                        aria-label="Quitar foto"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {archivos.length < MAX_IMAGENES && (
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-500 cursor-pointer active:bg-gray-50">
                            Agregar fotos
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                        </label>
                    )}
                    <p className="text-xs text-gray-400 px-0.5">
                        Hasta {MAX_IMAGENES} imágenes, máximo 5MB cada una (JPEG, PNG o WEBP).
                    </p>
                </section>

                {error && (
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <Button type="button" onClick={handleSubmit} loading={guardando} fullWidth>
                    {guardando ? "Guardando..." : "Guardar producto"}
                </Button>

                <div className="h-6" />
            </main>
        </div>
    );
}
