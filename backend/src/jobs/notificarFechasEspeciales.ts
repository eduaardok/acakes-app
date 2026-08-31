import cron from 'node-cron'
import { prisma } from '../lib/prisma'
import { enviarEmail } from '../lib/mailer'

const DIAS_ANTICIPACION = 7

function formatFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
}

function emailHtml(nombre: string, descripcion: string, fecha: Date): string {
    return `
        <p>Hola ${nombre},</p>
        <p>Te recordamos que tienes una fecha especial próxima: <strong>${descripcion}</strong>, el ${formatFecha(fecha)}.</p>
        <p>¡Contáctanos si quieres reservar tu pastel a tiempo! 🎂</p>
        <p>— Ainoa's Cakes</p>
    `
}

// Revisa las FechaEspecial pendientes de notificar cuya fecha cae dentro de los
// próximos DIAS_ANTICIPACION días. El rango "próximo" se calcula al vuelo en cada
// corrida (no se persiste), tal como se decidió para esta feature.
export async function revisarFechasEspecialesProximas() {
    const ahora = new Date()
    const limite = new Date(ahora.getTime() + DIAS_ANTICIPACION * 24 * 60 * 60 * 1000)

    const fechas = await prisma.fechaEspecial.findMany({
        where: {
            notificadoEmail: false,
            fecha: { gte: ahora, lte: limite },
        },
        include: {
            usuario: { select: { email: true, nombre: true } },
        },
    })

    console.log(`[notificarFechasEspeciales] ${fechas.length} fecha(s) próxima(s) por notificar`)

    for (const fechaEspecial of fechas) {
        try {
            await enviarEmail(
                fechaEspecial.usuario.email,
                'Tienes una fecha especial próxima 🎂',
                emailHtml(fechaEspecial.usuario.nombre, fechaEspecial.descripcion, fechaEspecial.fecha)
            )

            await prisma.fechaEspecial.update({
                where: { id: fechaEspecial.id },
                data: { notificadoEmail: true },
            })
        } catch (err) {
            // Un fallo de envío individual no debe tumbar el resto del batch;
            // se deja notificadoEmail=false para reintentar en la próxima corrida.
            console.error(`[notificarFechasEspeciales] error al notificar fechaEspecial ${fechaEspecial.id}:`, err)
        }
    }
}

// 8:00 AM hora de Ecuador (UTC-5, sin horario de verano) = 13:00 UTC.
// Render corre en UTC — el cron expression está en UTC.
const CRON_EXPRESSION = '0 13 * * *'

export function iniciarCronNotificaciones() {
    cron.schedule(CRON_EXPRESSION, () => {
        revisarFechasEspecialesProximas().catch((err) =>
            console.error('[notificarFechasEspeciales] error inesperado en la corrida del cron:', err)
        )
    })
    console.log(`[notificarFechasEspeciales] cron programado (${CRON_EXPRESSION} UTC)`)
}
