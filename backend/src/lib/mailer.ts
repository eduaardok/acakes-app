import nodemailer from 'nodemailer'

// Cuenta Gmail dedicada (SMTP_USER + App Password en SMTP_PASS).
// Ver .env.example y contexto.md para la configuración en Render.
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function enviarEmail(destinatario: string, asunto: string, html: string) {
    await transporter.sendMail({
        from: `"Ainoa's Cakes" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: asunto,
        html,
    })
}
