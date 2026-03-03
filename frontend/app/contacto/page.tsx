import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getSettings } from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";

export const metadata = {
  title: "Contacto - Atlantis Porfic Stile",
  description:
    "Visítanos en Galería Santa Lucía Piso 7 Tienda 709. Contáctanos para pedidos y consultas. Atención directa por WhatsApp.",
};

export default async function ContactoPage() {
  const settings = await getSettings();
  const whatsappNumber = settings?.numeroWhatsapp;
  const direccion =
    settings?.direccion ?? "Galería Santa Lucía — Piso 7, Tienda 709";
  const horario = settings?.horario ?? "Lun–Sáb 9:00–19:00 (hora referencial)";

  // WhatsApp message configurations for different contact purposes
  const configs: { label: string; config: WhatsAppMessageConfig }[] = [
    { label: "Ver productos", config: { type: "general_question" } },
    {
      label: "Pedir por WhatsApp",
      config: { type: "custom_order", customNote: "Quiero hacer un pedido" },
    },
    {
      label: "Precios al por mayor",
      config: { type: "custom_order", customNote: "Solicito precios al por mayor" },
    },
    {
      label: "Diseños personalizados",
      config: { type: "custom_order", customNote: "Necesito un diseño a medida" },
    },
    { label: "Otras consultas", config: { type: "general_question" } },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24" aria-labelledby="contacto-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
              Contacto
            </p>

            <h1 id="contacto-title" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Contáctanos por <span className="text-primary">WhatsApp</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Pedidos, cotizaciones y consultas. Respuesta rápida y atención clara. Envíos a todo el Perú.
            </p>
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-16 md:py-20 bg-muted/40" aria-labelledby="contact-options">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-12 lg:space-y-0">

            {/* Left column: options */}
            <div>
              <div className="space-y-3 mb-6">
                <h2 id="contact-options" className="text-2xl md:text-3xl font-semibold">¿En qué podemos ayudarte?</h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                  Selecciona la opción que describa tu consulta para escribirnos por WhatsApp con contexto prellenado.
                </p>
              </div>

              <div className="grid gap-4 md:gap-6">
                <div className="rounded-lg p-4 bg-card border border-border">
                  <h3 className="font-semibold text-foreground">Envíos y plazos</h3>
                  <p className="text-sm text-muted-foreground">Envíos a todo el país. Entregas habituales en 24–72 horas según destino.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {configs.map((item, index) => (
                    <WhatsAppCTA
                      key={index}
                      whatsappNumber={whatsappNumber}
                      variant="card"
                      label={item.label}
                      messageConfig={item.config}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: details */}
            <aside className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Datos</h3>
                <p className="text-sm text-muted-foreground">Confirma siempre por WhatsApp antes de cualquier envío o coordinación.</p>
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ubicación</dt>
                  <dd className="font-medium text-foreground">{direccion}</dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Horario</dt>
                  <dd className="font-medium text-foreground">{horario}</dd>
                  <dd className="text-xs text-muted-foreground">Respuestas fuera de horario cuando estemos disponibles.</dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Atención</dt>
                  <dd className="mt-1">
                    <ul className="list-inside list-disc text-foreground">
                      <li>WhatsApp: respuesta directa</li>
                      <li>Envíos nacionales</li>
                      <li>Pedidos a medida</li>
                    </ul>
                  </dd>
                </div>
              </dl>

              <div className="pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">Cambios y devoluciones: escríbenos por WhatsApp con fotos y detalles para evaluar el caso.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <WhatsAppCTA
        whatsappNumber={whatsappNumber}
        variant="sticky"
        messageConfig={{ type: "general_question" }}
      />
    </main>
  );
}
