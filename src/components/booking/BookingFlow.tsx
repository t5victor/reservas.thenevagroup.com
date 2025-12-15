import { useMemo, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';

type BookingData = {
  serviceId: string;
  selectedDate?: Date;
  selectedTime: string;
  name: string;
  email: string;
  notes: string;
};

const services = [
  {
    id: 'esencial',
    title: 'Paquete Esencial',
    description:
      'Presencia digital sólida para negocios que necesitan salir al aire sin complejidad extra.',
    setup: '450 € instalación única',
    retainer: '12 € / mes · 80 € anual anticipado',
    bullets: [
      'Dominio, hosting y correo corporativo gestionados',
      'Plantilla optimizada con inicio, servicios y contacto',
      'Identidad visual aplicada, responsive y formulario activo',
    ],
    limit: 'Sin desarrollos a medida ni integraciones externas. Ideal para sitios ligeros.',
  },
  {
    id: 'pro',
    title: 'Paquete Pro',
    description:
      'Para catálogos, tiendas o integraciones que necesitan arquitectura flexible y soporte prioritario.',
    setup: '900 € instalación única',
    retainer: '25 € / mes · 230 € anual anticipado',
    bullets: [
      'Incluye todo lo del paquete Esencial',
      'Estructura extendida para catálogos o comercio',
      'Pasarela de pago o conectores con servicios externos',
    ],
    limit: 'Quedan fuera desarrollos a medida, paneles propios o microservicios.',
  },
];

const timeSlots = ['09:30', '11:00', '12:30', '15:00', '16:30'];

const steps = [
  { id: 'plan', title: 'Elige un presupuesto definido', subtitle: 'Selecciona el paquete que mejor describe tu alcance.' },
  { id: 'agenda', title: 'Agenda la sesión inicial', subtitle: 'Reservamos una llamada para poner el proyecto en marcha.' },
  { id: 'datos', title: 'Datos de contacto y contexto', subtitle: 'Necesitamos saber quién toma decisiones y en qué punto están.' },
  { id: 'resumen', title: 'Confirma la reserva', subtitle: 'Revisa montos, servicio y siguiente paso.' },
];

const formatDate = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat('es', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
      }).format(date)
    : 'Sin definir';

export const BookingFlow = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingData>({
    serviceId: services[0]?.id ?? '',
    selectedDate: undefined,
    selectedTime: '',
    name: '',
    email: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === data.serviceId) ?? services[0],
    [data.serviceId]
  );

  const stepIsValid = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(data.serviceId);
      case 1:
        return Boolean(data.selectedDate && data.selectedTime);
      case 2:
        return Boolean(data.name && data.email);
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, data]);

  const progress = ((step + 1) / steps.length) * 100;

  const goNext = () => {
    if (step < steps.length - 1 && stepIsValid) {
      setSubmitError(null);
      setSubmitted(false);
      setStep((current) => current + 1);
    }
  };

  const goPrev = () => {
    setSubmitError(null);
    setSubmitted(false);
    setStep((current) => Math.max(0, current - 1));
  };

  const updateField = (field: keyof BookingData, value: string | Date | undefined) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFlow = () => {
    setData({
      serviceId: services[0]?.id ?? '',
      selectedDate: undefined,
      selectedTime: '',
      name: '',
      email: '',
      notes: '',
    });
    setSubmitted(false);
    setSubmitError(null);
    setStep(0);
  };

  const handleConfirm = async () => {
    if (!stepIsValid) return;
    if (!data.email || !data.name || !data.selectedDate || !data.selectedTime) {
      setSubmitError('Faltan datos para enviar la confirmación.');
      return;
    }

    setSubmitError(null);
    setSending(true);

    try {
      const response = await fetch('/api/send-confirmation-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          serviceTitle: selectedService?.title,
          serviceDescription: selectedService?.description,
          date: formatDate(data.selectedDate),
          time: data.selectedTime,
          notes: data.notes || 'Sin notas adicionales',
          ctaUrl: 'https://reservas.thenevagroup.com',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'No se pudo enviar el correo.');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error enviando confirmación', error);
      setSubmitError('No hemos podido enviar el correo de confirmación. Inténtalo en unos minutos.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <article className="bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-[0_20px_120px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col md:flex-row">
          <aside className="md:w-64 border-b md:border-b-0 md:border-r border-stone-800 p-6 space-y-6 bg-stone-900/50">
            <div className="space-y-1">
              <p className="text-xs uppercase text-zinc-500">The Neva Group</p>
              <h1 className="text-lg font-medium text-white">Reserva con presupuestos definidos</h1>
              <p className="text-sm text-zinc-400">Cada paso se completa dentro de esta página.</p>
            </div>
            <ol className="hidden md:space-y-4 md:block">
              {steps.map((item, index) => {
                const isDone = index < step;
                const isActive = index === step;
                return (
                  <li key={item.id} className="flex items-start gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className={`mt-2 block h-3 w-3 shrink-0 rounded-full border transition ${
                        isActive ? 'border-white bg-white' : 'border-stone-600'
                      } ${isDone && !isActive ? 'opacity-70' : ''}`}
                    />
                    <div>
                      <p className={`font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>{item.title}</p>
                      <p className="text-xs text-zinc-500">{item.subtitle}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="rounded-lg border border-stone-800 bg-stone-900/60 p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-200">Servicio general incluido</p>
              <p>Dominio, hosting, correo y soporte esencial gestionado por nuestro equipo durante todo el proyecto.</p>
            </div>
          </aside>

          <div className="flex-1 p-6 md:p-8 space-y-6">
            <header className="space-y-2 border-b border-stone-800 pb-4">
              <p className="text-xs uppercase text-zinc-500">
                Paso {step + 1} de {steps.length}
              </p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{steps[step].title}</h2>
                  <p className="text-sm text-zinc-400">{steps[step].subtitle}</p>
                </div>
                <div className="flex-1 hidden sm:block">
                  <div className="h-1 rounded-full bg-stone-800">
                    <div
                      className="h-1 rounded-full bg-stone-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </header>

            {step === 0 && (
              <div className="space-y-4">
                {services.map((service) => {
                  const isActive = data.serviceId === service.id;
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => updateField('serviceId', service.id)}
                      className={`w-full text-left rounded-lg border px-5 py-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 ${
                        isActive ? 'border-zinc-100 bg-zinc-50 text-zinc-900' : 'border-stone-800 bg-stone-900'
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className={`text-xs uppercase ${isActive ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {service.id === 'pro' ? 'paquete avanzado' : 'paquete base'}
                          </p>
                          <h3 className={`text-xl font-semibold ${isActive ? 'text-zinc-900' : 'text-white'}`}>{service.title}</h3>
                          <p className={`text-sm ${isActive ? 'text-zinc-600' : 'text-zinc-400'}`}>{service.description}</p>
                        </div>
                        <div className="text-sm text-left md:text-right">
                          <p className={`font-semibold ${isActive ? 'text-zinc-900' : 'text-zinc-100'}`}>{service.setup}</p>
                          <p className={`${isActive ? 'text-zinc-700' : 'text-zinc-400'}`}>{service.retainer}</p>
                        </div>
                      </div>
                      <ul className={`mt-4 grid gap-2 text-sm ${isActive ? 'text-zinc-800' : 'text-zinc-400'}`}>
                        {service.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2">
                            <span>{isActive ? '▸' : '–'}</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <p className={`mt-3 text-xs ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>{service.limit}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6 flex flex-col gap-6 min-h-[520px]">
                  <div className="flex items-start gap-4">
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Calendario disponible</p>
                      <p className="text-sm text-zinc-400">Selecciona el día de la sesión de arranque.</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Calendar
                      captionLayout="dropdown-buttons"
                      startMonth={new Date()}
                      defaultMonth={data.selectedDate ?? new Date()}
                      selected={data.selectedDate}
                      onSelect={(date) => updateField('selectedDate', date)}
                      disabled={{ before: new Date() }}
                      initialFocus
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Horarios (UTC local)</p>
                      <p className="text-sm text-zinc-400">Bloques de 45 minutos para revisar alcance, presupuesto y plan.</p>
                    </div>
                    {data.selectedTime && (
                      <span className="text-xs font-medium text-zinc-300">{data.selectedTime} h</span>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 flex-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        disabled={!data.selectedDate}
                        onClick={() => updateField('selectedTime', slot)}
                        className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100 ${
                          data.selectedTime === slot
                            ? 'border-stone-100 bg-stone-100 text-stone-900'
                            : 'border-stone-800 text-zinc-100 hover:border-stone-600'
                        } ${!data.selectedDate ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {slot} h
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-zinc-500">Mostramos tu zona horaria. Tras confirmar enviaremos invitación con enlace.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-zinc-400">
                    Responsable principal
                    <input
                      type="text"
                      value={data.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      placeholder="Nombre y apellidos"
                      className="mt-2 w-full rounded-md border border-stone-800 bg-transparent px-4 py-3 text-base text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100"
                    />
                  </label>
                  <label className="text-sm text-zinc-400">
                    Correo de confirmación
                    <input
                      type="email"
                      value={data.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="equipo@empresa.com"
                      className="mt-2 w-full rounded-md border border-stone-800 bg-transparent px-4 py-3 text-base text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100"
                    />
                  </label>
                </div>
                <label className="text-sm text-zinc-400">
                  Contexto del proyecto
                  <textarea
                    rows={4}
                    value={data.notes}
                    onChange={(event) => updateField('notes', event.target.value)}
                    placeholder="Ej. Necesitamos lanzar una web bilingüe con blog y fichas de servicio."
                    className="mt-2 w-full rounded-md border border-stone-800 bg-transparent px-4 py-3 text-base text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100"
                  />
                </label>
                <p className="text-xs text-zinc-500">Usaremos estos datos para enviar la propuesta y compartir accesos.</p>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-stone-800 bg-stone-900/30 p-4 space-y-1">
                  <p className="text-xs uppercase text-zinc-500">Paquete</p>
                  <h3 className="text-lg font-semibold text-white">{selectedService?.title}</h3>
                  <p className="text-sm text-zinc-400">{selectedService?.description}</p>
                  <p className="text-sm text-zinc-100">{selectedService?.setup}</p>
                  <p className="text-xs text-zinc-500">{selectedService?.retainer}</p>
                </div>
                <div className="rounded-lg border border-stone-800 bg-stone-900/30 p-4 space-y-1">
                  <p className="text-xs uppercase text-zinc-500">Agenda</p>
                  <h3 className="text-lg font-semibold text-white">{formatDate(data.selectedDate)}</h3>
                  <p className="text-sm text-zinc-400">Horario: {data.selectedTime || 'Sin definir'}</p>
                  <p className="text-xs text-zinc-500">La reunión se realiza vía videollamada con seguimiento grabado.</p>
                </div>
                <div className="rounded-lg border border-stone-800 bg-stone-900/30 p-4 space-y-1">
                  <p className="text-xs uppercase text-zinc-500">Contacto</p>
                  <h3 className="text-lg font-semibold text-white">{data.name || 'Pendiente'}</h3>
                  <p className="text-sm text-zinc-400">{data.email || 'Sin correo'}</p>
                </div>
                <div className="rounded-lg border border-stone-800 bg-stone-900/30 p-4 space-y-1">
                  <p className="text-xs uppercase text-zinc-500">Notas</p>
                  <p className="text-sm text-zinc-200">
                    {data.notes || 'Incluiremos un formulario adicional para capturar materiales antes del arranque.'}
                  </p>
                </div>
                {submitError && (
                  <div className="md:col-span-2 rounded-lg border border-red-900/60 bg-red-900/20 p-4 text-sm text-red-100">
                    {submitError}
                  </div>
                )}
                {submitted && (
                  <div className="md:col-span-2 rounded-lg border border-stone-700 bg-stone-900/50 p-4 flex items-start gap-3">
                    <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-stone-100">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">Reserva enviada</p>
                      <p className="text-sm text-zinc-300">
                        Hemos registrado tu cita para {formatDate(data.selectedDate)} a las {data.selectedTime || 'pendiente'}.
                        Te enviaremos confirmación a {data.email || 'tu correo'}.
                      </p>
                      <p className="text-xs text-zinc-500">Si necesitas ajustar fecha u horario, responde al correo de confirmación.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-col gap-4 border-t border-stone-800 bg-stone-900/50 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{selectedService?.title}</p>
            <p className="text-sm text-zinc-400">{selectedService?.setup} · {selectedService?.retainer}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                step === 0
                  ? 'border-stone-800 text-zinc-600 cursor-not-allowed'
                  : 'border-stone-700 text-white hover:border-stone-500'
              }`}
            >
              Volver
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!stepIsValid}
                className={`rounded-md px-5 py-2 text-sm font-semibold text-zinc-950 transition ${
                  stepIsValid ? 'bg-stone-100 hover:bg-stone-50' : 'bg-stone-700 cursor-not-allowed text-zinc-300'
                }`}
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!stepIsValid || submitted || sending}
                className={`rounded-md px-5 py-2 text-sm font-semibold text-zinc-950 transition ${
                  submitted
                    ? 'bg-stone-800 text-zinc-400 cursor-not-allowed'
                    : sending
                      ? 'bg-stone-800 text-zinc-200 cursor-progress'
                      : stepIsValid
                        ? 'bg-stone-100 hover:bg-stone-50'
                        : 'bg-stone-700 cursor-not-allowed text-zinc-300'
                }`}
              >
                {submitted ? 'Reserva enviada' : sending ? 'Enviando...' : 'Confirmar reserva'}
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BookingFlow;
