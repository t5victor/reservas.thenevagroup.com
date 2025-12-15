import type { APIRoute } from 'astro';
export const prerender = false;
import sgMail from '@sendgrid/mail';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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

const templatePath = fileURLToPath(new URL('../../mails/confirmReservation.html', import.meta.url));

const applyTemplate = (html: string, data: Record<string, string | undefined>) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const safeValue = value ?? '';
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(pattern, safeValue);
  }, html);
};

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

  const template = await readFile(templatePath, 'utf8');
  const html = applyTemplate(template, {
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
    await sgMail.send({
      to: email,
      from,
      subject: `Reserva confirmada - ${serviceTitle}`,
      html,
      text,
    });
  } catch (error) {
    console.error('SendGrid error', error);
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
