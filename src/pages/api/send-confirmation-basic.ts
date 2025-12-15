import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;

  if (!apiKey || !from) {
    return new Response(JSON.stringify({ error: 'Faltan SENDGRID_API_KEY o SENDGRID_FROM.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: Record<string, string | undefined>;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, serviceTitle, date, time } = payload;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Falta el correo destino.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sgMail.setApiKey(apiKey);

  // Carga opcional de plantilla externa para no hardcodear HTML aquí.
  const templateUrl = process.env.SENDGRID_TEMPLATE_URL;
  let html = `<p><strong>Reserva confirmada</strong></p>
  <p>Servicio: ${serviceTitle ?? ''}</p>
  <p>Fecha: ${date ?? ''} ${time ?? ''}</p>
  <p>Contacto: ${name ?? ''} (${email})</p>`;

  if (templateUrl) {
    try {
      const res = await fetch(templateUrl);
      if (res.ok) {
        html = await res.text();
      } else {
        console.warn('No se pudo cargar la plantilla externa:', res.status);
      }
    } catch (err) {
      console.warn('Error cargando plantilla externa', err);
    }
  }

  const text = `Reserva confirmada

Servicio: ${serviceTitle ?? ''}
Fecha: ${date ?? ''} ${time ?? ''}
Contacto: ${name ?? ''} (${email})`;

  try {
    const [res] = await sgMail.send({
      to: email,
      from,
      subject: `Reserva confirmada - ${serviceTitle ?? 'The Neva Group'}`,
      text,
      html,
    });
    console.info('SendGrid basic response:', res.statusCode, res.headers['x-message-id'] || '');
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
