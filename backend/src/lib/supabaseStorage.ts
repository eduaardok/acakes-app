import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import path from 'path'

const BUCKET = 'productos-imagenes'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * Sube un archivo al bucket público `productos-imagenes` bajo `{carpeta}/{nombreUnico}`
 * y devuelve su URL pública. El nombre único evita colisiones entre subidas concurrentes.
 */
export async function subirImagen(
    buffer: Buffer,
    nombreOriginal: string,
    carpeta: 'productos' | 'pedidos'
): Promise<string> {
    const ext = path.extname(nombreOriginal).toLowerCase() || '.jpg'
    const nombreUnico = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    const rutaArchivo = `${carpeta}/${nombreUnico}`

    const { error } = await supabase.storage.from(BUCKET).upload(rutaArchivo, buffer, {
        contentType: mimeFromExt(ext),
        upsert: false,
    })

    if (error) {
        throw new Error(`No se pudo subir la imagen a Storage: ${error.message}`)
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(rutaArchivo)
    return data.publicUrl
}

/** Borra un archivo del bucket a partir de su URL pública. */
export async function eliminarImagen(url: string): Promise<void> {
    const rutaArchivo = rutaDesdeUrlPublica(url)
    if (!rutaArchivo) return

    const { error } = await supabase.storage.from(BUCKET).remove([rutaArchivo])
    if (error) {
        throw new Error(`No se pudo eliminar la imagen de Storage: ${error.message}`)
    }
}

function rutaDesdeUrlPublica(url: string): string | null {
    const marcador = `/object/public/${BUCKET}/`
    const idx = url.indexOf(marcador)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marcador.length))
}

function mimeFromExt(ext: string): string {
    switch (ext) {
        case '.png':
            return 'image/png'
        case '.webp':
            return 'image/webp'
        default:
            return 'image/jpeg'
    }
}
