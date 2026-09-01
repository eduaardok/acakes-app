import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB por imagen
const MIME_TYPES_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const uploadImagen = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        if (!MIME_TYPES_PERMITIDOS.has(file.mimetype)) {
            cb(new Error('Formato de imagen no permitido (solo JPEG, PNG o WEBP)'))
            return
        }
        cb(null, true)
    },
})

/** Traduce errores de multer (tamaño, formato) a una respuesta JSON 400 en vez del error crudo de Express. */
export function manejarErrorUpload(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ message: 'Cada imagen debe pesar máximo 5MB' })
            return
        }
        res.status(400).json({ message: `Error al subir archivo: ${err.message}` })
        return
    }
    if (err instanceof Error) {
        res.status(400).json({ message: err.message })
        return
    }
    next(err)
}
