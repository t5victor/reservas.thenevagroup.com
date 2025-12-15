import type { APIRoute } from 'astro';
export const prerender = false;
import sgMail from '@sendgrid/mail';

type Payload = {
  name: string;
  email: string;
  serviceTitle?: string;
  serviceDescription?: string;
  date?: string;
  time?: string;
  notes?: string;
  ctaUrl?: string;
};

const inlineTemplate = (data: Record<string, string | undefined>) => `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reserva confirmada · The Neva Group</title>
    </head>
    <body style="margin:0;padding:0;background:#0c0a09;color:#e7e5e4;font-family:Helvetica,Arial,sans-serif;">
      <div style="width:100%;padding:32px 0;background:#0c0a09;">
        <table role="presentation" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;overflow:hidden;color:#1c1917;">
          <tr>
            <td style="padding:28px 32px 12px;">
              <div style="font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-size:13px;color:#57534e;">The Neva Group</div>
              <div style="margin:14px 0 4px;font-size:24px;color:#1c1917;font-weight:700;">Reserva confirmada</div>
              <p style="margin:0;font-size:14px;color:#57534e;">Hemos bloqueado tu sesión. Aquí tienes el resumen:</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <div style="width:100%;height:180px;background:url('https://reservas.thenevagroup.com/ReservaConfirmada.svg') center/cover no-repeat;line-height:0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#1c1917;text-align:justify;">
                Hola <strong style="color:#0f172a;">${data.name ?? ''}</strong>, confirmamos tu reserva para el servicio <strong style="color:#0f172a;">${data.serviceTitle ?? ''}</strong>
                (${data.serviceDescription ?? ''}). Hemos bloqueado la agenda para el <strong style="color:#0f172a;">${data.date ?? ''}</strong> a las <strong style="color:#0f172a;">${data.time ?? ''}</strong>.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#1c1917;text-align:justify;">
                Usaremos el correo <strong style="color:#0f172a;">${data.email ?? ''}</strong> para enviarte la invitación y los detalles logísticos. Si necesitas
                mover la fecha u hora, responde a este mensaje y lo ajustamos.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#1c1917;text-align:justify;">
                Notas del proyecto: ${data.notes ?? ''}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="${data.ctaUrl ?? '#'}" target="_blank" rel="noopener noreferrer"
                style="display:inline-block;padding:14px 22px;background:#1c1917;color:#f5f5f4;font-weight:700;font-size:15px;border-radius:10px;border:1px solid #1c1917;letter-spacing:0.02em;text-decoration:none;">
                Ver detalles de la reserva
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 26px;font-size:12px;color:#57534e;line-height:1.6;">
              The Neva Group · Reserva de sesión inicial.<br />
              Si necesitas mover la fecha u hora, responde a este correo o contáctanos en WhatsApp.
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;

  if (!apiKey || !from) {
    return new Response(JSON.stringify({ error: 'Falta configuración de SendGrid (SENDGRID_API_KEY, SENDGRID_FROM).' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, serviceTitle, serviceDescription, date, time, notes, ctaUrl } = payload;

  if (!name || !email || !serviceTitle || !date || !time) {
    return new Response(JSON.stringify({ error: 'Faltan campos obligatorios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const html = inlineTemplate({
    name,
    email,
    serviceTitle,
    serviceDescription,
    date,
    time,
    notes: notes || 'Sin notas adicionales',
    ctaUrl: ctaUrl || '',
  });

  const text = [
    'Reserva confirmada',
    '',
    `Servicio: ${serviceTitle}`,
    `Fecha: ${date} ${time}`,
    `Contacto: ${name} (${email})`,
    `Notas: ${notes || 'Sin notas'}`,
  ].join('\n');

  sgMail.setApiKey(apiKey);

  try {
    const [response] = await sgMail.send({
      to: email,
      from,
      subject: `Reserva confirmada - ${serviceTitle}`,
      html,
      text,
    });
    console.info('SendGrid response:', response.statusCode, response.headers['x-message-id'] || '');
  } catch (error) {
    const detail = (error as any)?.response?.body || (error as Error).message || 'SendGrid error';
    console.error('SendGrid error', detail);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el correo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
