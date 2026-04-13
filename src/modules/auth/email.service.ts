import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to: string, code: string, userName: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Codigo de acceso MedAssembly</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">🏥</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;">MedAssembly</h1>
              <p style="margin:4px 0 0;color:#e0e7ff;font-size:14px;">Sistema de Primeros Auxilios</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hola ${userName},</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                Usa el siguiente codigo para iniciar sesion en MedAssembly. Este codigo expira en <strong>${env.OTP_EXPIRATION_MINUTES} minutos</strong>.
              </p>
              <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
                <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2563eb;font-family:'Courier New',monospace;">
                  ${code}
                </div>
              </div>
              <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
                Si no solicitaste este codigo, puedes ignorar este correo. Nunca compartas tu codigo con nadie.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                © 2026 MedAssembly - Enviado desde iabotwell@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await getTransporter().sendMail({
      from: `"MedAssembly" <${env.SMTP_FROM}>`,
      to,
      subject: `Tu codigo de acceso: ${code}`,
      text: `Hola ${userName},\n\nTu codigo de acceso a MedAssembly es: ${code}\n\nEste codigo expira en ${env.OTP_EXPIRATION_MINUTES} minutos.\n\nSi no solicitaste este codigo, ignora este correo.`,
      html,
    });
    logger.info(`OTP email sent to ${to}`);
  } catch (err: any) {
    logger.error(`Failed to send OTP email to ${to}: ${err.message}`);
    throw new Error('No se pudo enviar el correo con el codigo. Intentelo mas tarde.');
  }
}
