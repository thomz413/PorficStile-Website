"use client";

import { motion } from "framer-motion";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";
import FooterWrapper from "@/components/footer/Footer";
import Header from "@/components/Header";
import { animations, transitions } from "@/lib/animations";
import { SiteSettings } from "@/lib/strapi/types/settings";

export default function ContactoCliente({
	settings,
}: {
	settings: SiteSettings | null;
}) {
	const whatsappNumber = settings?.numeroWhatsapp;
	const direccion =
		settings?.direccionTienda ?? "Galería Santa Lucía — Piso 7, Tienda 709";

	const configs: { label: string; config: WhatsAppMessageConfig }[] = [
		{ label: "Ver productos", config: { type: "general_question" } },
		{
			label: "Pedir por WhatsApp",
			config: { type: "custom_order", customNote: "Quiero hacer un pedido" },
		},
		{
			label: "Precios al por mayor",
			config: {
				type: "custom_order",
				customNote: "Solicito precios al por mayor",
			},
		},
		{
			label: "Diseños personalizados",
			config: {
				type: "custom_order",
				customNote: "Necesito un diseño a medida",
			},
		},
		{ label: "Otras consultas", config: { type: "general_question" } },
	];

	return (
		<main className="min-h-screen bg-background text-foreground pt-16">
			<Header />

			{/* Hero Section */}
			<section className="border-b border-border py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={animations.container}
						className="max-w-2xl space-y-4"
					>
						<motion.p
							variants={animations.fadeInUp}
							transition={transitions.smooth}
							className="text-xs font-medium text-primary uppercase tracking-[0.2em]"
						>
							Contacto
						</motion.p>

						<motion.h1
							variants={animations.fadeInUp}
							transition={transitions.smooth}
							className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
						>
							Contáctanos por{" "}
							<span className="text-primary italic">WhatsApp</span>
						</motion.h1>

						<motion.p
							variants={animations.fadeInUp}
							transition={transitions.smooth}
							className="text-base md:text-lg text-muted-foreground leading-relaxed"
						>
							Pedidos, cotizaciones y consultas. Respuesta rápida y atención
							clara. Envíos a todo el Perú.
						</motion.p>
					</motion.div>
				</div>
			</section>

			{/* Contact Options */}
			<section className="py-16 md:py-20 bg-muted/40">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="space-y-12 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-12 lg:space-y-0">
						{/* Left column: Options */}
						<motion.section
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							variants={animations.container}
							transition={transitions.smooth}
							className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-secondary/5"
						>
							<div className="space-y-3 mb-6">
								<motion.h2
									variants={animations.fadeInUp}
									transition={transitions.smooth}
									className="text-2xl md:text-3xl font-semibold"
								>
									¿En qué podemos ayudarte?
								</motion.h2>
								<motion.p
									variants={animations.fadeInUp}
									transition={transitions.smooth}
									className="text-sm md:text-base text-muted-foreground max-w-xl"
								>
									Selecciona la opción que describa tu consulta.
								</motion.p>
							</div>

							<div className="grid gap-4 md:gap-6">
								<motion.div
									variants={animations.fadeInUp}
									transition={transitions.smooth}
									whileHover={{ y: -2 }}
									className="rounded-lg p-4 bg-card border border-border shadow-sm hover:shadow-lg transition-shadow"
								>
									<h3 className="font-semibold text-foreground">
										Envíos y plazos
									</h3>
									<p className="text-sm text-muted-foreground">
										Envíos a todo el país. Entregas habituales en 24–72 horas.
									</p>
								</motion.div>

								<motion.div
									variants={animations.container}
									transition={transitions.smooth}
									className="grid grid-cols-1 sm:grid-cols-2 gap-4"
								>
									{configs.map((item, index) => (
										<motion.div
											key={index}
											variants={animations.fadeInUp}
											whileHover={{ y: -4 }}
											whileTap={{ scale: 0.98 }}
											className="cursor-pointer"
										>
											<WhatsAppCTA
												whatsappNumber={whatsappNumber}
												variant="card"
												label={item.label}
												messageConfig={item.config}
											/>
										</motion.div>
									))}
								</motion.div>
							</div>
						</motion.section>

						{/* Right column: Details Sidebar */}
						<motion.aside
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							variants={animations.fadeInRight}
							transition={transitions.smooth}
							className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl"
						>
							{/* Subtle background glow with animation */}
							<motion.div
								className="absolute -top-24 -right-24 h-48 w-48 bg-primary/5 blur-3xl rounded-full"
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.5, 0.8, 0.5],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>

							<div className="relative">
								<h3 className="text-lg md:text-xl font-semibold text-foreground">
									Información
								</h3>
								<p className="text-sm text-muted-foreground">
									Confirma siempre por WhatsApp antes de cualquier coordinación.
								</p>
							</div>

							<dl className="space-y-4 text-sm relative">
								<div>
									<dt className="text-xs font-semibold uppercase tracking-wide text-primary">
										Ubicación
									</dt>
									<dd className="font-medium text-foreground mt-1">
										{direccion}
									</dd>
								</div>

								<div>
									<dt className="text-xs font-semibold uppercase tracking-wide text-primary">
										Nuestra atención
									</dt>
									<dd className="mt-1">
										<ul className="space-y-2 text-foreground">
											<li className="flex items-center gap-2">
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
												WhatsApp: respuesta directa
											</li>
											<li className="flex items-center gap-2">
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
												Envíos nacionales
											</li>
											<li className="flex items-center gap-2">
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
												Pedidos a medida
											</li>
										</ul>
									</dd>
								</div>
							</dl>

							<div className="pt-4 border-t border-border/60 relative">
								<p className="text-xs text-muted-foreground italic">
									Cambios y devoluciones: escríbenos por WhatsApp con fotos para
									evaluar el caso.
								</p>
							</div>
						</motion.aside>
					</div>
				</div>
			</section>

			<FooterWrapper />

			<WhatsAppCTA
				whatsappNumber={whatsappNumber}
				variant="sticky"
				messageConfig={{ type: "general_question" }}
			/>
		</main>
	);
}
