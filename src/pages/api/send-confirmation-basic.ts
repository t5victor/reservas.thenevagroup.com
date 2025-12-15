import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';

export const prerender = false;

const applyTemplate = (html: string, data: Record<string, string | undefined>) =>
  Object.entries(data).reduce((acc, [key, value]) => {
    const safe = value ?? '';
    return acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), safe);
  }, html);

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;
  const templateUrl = process.env.SENDGRID_TEMPLATE_URL?.trim();

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
  let html = `<p><strong>Reserva confirmada</strong></p>
  <p>Servicio: ${serviceTitle ?? ''}</p>
  <p>Fecha: ${date ?? ''} ${time ?? ''}</p>
  <p>Contacto: ${name ?? ''} (${email})</p>`;

  if (templateUrl) {
    try {
      const res = await fetch(templateUrl);
      if (res.ok) {
        const raw = await res.text();
        html = applyTemplate(raw, {
          name,
          email,
          serviceTitle,
          serviceDescription,
          date,
          time,
          notes,
          ctaUrl: payload.ctaUrl,
        });
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
