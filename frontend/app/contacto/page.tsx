import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getSettings } from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";

export const metadata = {
	title: "Contacto - Moda Peru",
	description:
		"Contáctanos para pedidos y consultas. Atención personalizada por WhatsApp. Ropa de calidad a precios justos.",
};

export default async function ContactoPage() {
	const settings = await getSettings();
	const whatsappNumber = settings?.numeroWhatsapp;

	// WhatsApp message configurations for different contact purposes
	const configs: { label: string; config: WhatsAppMessageConfig }[] = [
		{
			label: "Comprar productos",
			config: {
				type: 'product_order',
				category: 'General'
			}
		},
		{
			label: "Precios al por mayor",
			config: {
				type: 'custom_order',
				customNote: 'Soy un negocio y necesito precios al por mayor'
			}
		},
		{
			label: "Diseños personalizados",
			config: {
				type: 'custom_order',
				customNote: 'Necesito productos con mi diseño/logo'
			}
		},
		{
			label: "Otras consultas",
			config: {
				type: 'general_question'
			}
		}
	];

	return (
		<main className="min-h-screen bg-background">
			<Header />

			{/* Hero */}
			<section className="border-b border-border bg-linear-to-b from-background via-background to-secondary/10 py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl space-y-4">
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
							Contacto
						</p>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
							Escríbenos por <span className="text-secondary">WhatsApp</span>
						</h1>
						<p className="text-base md:text-lg text-muted-foreground leading-relaxed">
							Pedidos, cotizaciones y consultas. Te respondemos rápidamente.
						</p>
					</div>
				</div>
			</section>

			{/* Contact options */}
			<section className="py-16 md:py-20 bg-muted/40">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
					<div className="space-y-8">
						<div className="space-y-3">
							<h2 className="text-2xl md:text-3xl font-semibold text-foreground">
								¿En qué podemos ayudarte?
							</h2>
							<p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
								Elige la opción que mejor describa lo que necesitas.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

					<div className="space-y-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
						<div>
							<h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
								Datos de contacto
							</h3>
							<p className="text-sm text-muted-foreground">
								Horarios y datos referenciales. Confirma por WhatsApp al
								coordinar.
							</p>
						</div>

						<div className="space-y-4 text-sm">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Operación
								</p>
								<p className="font-medium text-foreground">
									Negocio 100% online con envíos desde Perú
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Horario referencial
								</p>
								<p className="font-medium text-foreground">
									Lunes a sábado: 9:00 am – 7:00 pm
								</p>
								<p className="text-xs text-muted-foreground">
									Fuera de horario te respondemos cuando estemos disponibles.
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Formas de atención
								</p>
								<ul className="mt-1 space-y-1 text-foreground">
									<li>• WhatsApp</li>
									<li>• Envíos a todo el Perú</li>
									<li>• Pedidos a medida</li>
								</ul>
							</div>
						</div>

						<div className="pt-4 border-t border-border/60">
							<p className="text-xs text-muted-foreground">
								Cambios, devoluciones o garantías: cuéntanos tu caso por
								WhatsApp y, si hace falta, envía fotos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Sticky WhatsApp Button */}
			<WhatsAppCTA
				whatsappNumber={whatsappNumber}
				variant="sticky"
				messageConfig={{
					type: 'general_question'
				}}
			/>
		</main>
	);
}
