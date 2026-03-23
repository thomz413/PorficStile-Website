"use client";

import { motion } from "framer-motion";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Image from "next/image";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";
import Header from "@/components/Header";
import { animations, transitions } from "@/lib/animations";
import { SiteSettings, Statistic } from "@/lib/strapi/types/settings";
import Footer from "@/components/footer/Footer";

export default function NosotrosClient({
	settings,
}: {
	settings: SiteSettings | null;
}) {

	const descripcionTienda = "Atlantis Porfic Stile ofrece ropa con diseño propio y fabricación local. Visítanos en Galería Santa Lucía — Piso 7, Tienda 709. Envíos a todo el país.";

	const estadisticas = settings?.estadisticas ?? [];
	const whatsappNumber = settings?.numeroWhatsapp;

	const collaborationConfig: WhatsAppMessageConfig = {
		type: "custom_order",
		customNote:
			"Hola, soy un negocio y quiero conversar sobre una colaboración",
	};

	return (
		<main className="min-h-screen bg-background text-foreground pt-16 overflow-hidden">
			<Header />

			{/* Hero Section */}
			<section className="border-b border-borderbg py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={animations.container}
						transition={transitions.smooth}
						className="max-w-2xl"
					>
						<motion.p
							variants={animations.fadeInUp}
							className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4"
						>
							Nuestra empresa
						</motion.p>

						<div className="flex flex-col items-start gap-4">
							<motion.div
								variants={animations.scaleIn}
								transition={transitions.smooth}
								className="relative"
							>
								<Image
									src="/Atlantis.svg"
									alt="Logo de Atlantis Porfic Stile"
									width={300}
									height={80}
									className="object-contain w-40 sm:w-48 md:w-56 lg:w-64 h-auto filter drop-shadow-[0_0_12px_rgba(255,215,0,0.35)] hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-300"
									priority
								/>
							</motion.div>

							<motion.h1
								variants={animations.fadeInUp}
								transition={transitions.smooth}
								className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
							>
								<span className="font-inter uppercase tracking-widest text-gold-dark">
									PORFIC STILE
								</span>
							</motion.h1>

							<motion.p
								variants={animations.fadeInUp}
								transition={transitions.smooth}
								className="text-base md:text-lg text-muted-foreground leading-relaxed"
							>
								{descripcionTienda}
							</motion.p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Stats / Highlights */}
			<section className="bg-linear-to-r from-secondary to-secondary/90 text-white py-12 md:py-16 relative overflow-hidden">
				<div
					className="absolute inset-0 pattern-geometric opacity-10"
					aria-hidden
				/>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={animations.fadeInUp}
						transition={transitions.smooth}
						className="mb-10"
					>
						<h2 className="text-2xl md:text-3xl font-bold">Nuestros números</h2>
						<p className="mt-3 text-sm md:text-base text-white/80 max-w-xl">
							Años de experiencia y clientes que repiten por nuestra atención y
							calidad.
						</p>
					</motion.div>

					<motion.dl
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={animations.container}
						transition={transitions.smooth}
						className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
					>
						{(estadisticas.length > 0
							? estadisticas
							: [
									{
										id: 1,
										textoArriba: "+5",
										textoAbajo: "Años de experiencia",
									},
									{
										id: 2,
										textoArriba: "+500",
										textoAbajo: "Clientes satisfechos",
									},
									{
										id: 3,
										textoArriba: "24/7",
										textoAbajo: "Soporte por WhatsApp",
									},
									{
										id: 4,
										textoArriba: "Variedad",
										textoAbajo: "Opciones para todos",
									},
								]
						).map((item: Statistic, idx: number) => (
							<motion.div
								key={item.id || idx}
								variants={animations.scaleIn}
								transition={transitions.smooth}
								whileHover={{ y: -4 }}
								whileTap={{ scale: 0.98 }}
								className="text-center cursor-pointer"
							>
								<dt className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
									{item.textoArriba}
								</dt>
								<dd className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">
									{item.textoAbajo}
								</dd>
							</motion.div>
						))}
					</motion.dl>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-16 md:py-20 lg:py-24 bg-muted/40">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={animations.fadeInUp}
						transition={transitions.smooth}
						className="mb-8 md:mb-12 max-w-3xl"
					>
						<p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-3">
							Nuestro trabajo
						</p>
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Por qué elegirnos
						</h2>
						<p className="text-base md:text-lg text-muted-foreground">
							Ropa bien hecha, atención cercana y precios transparentes.
						</p>
					</motion.div>

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={animations.container}
						transition={transitions.smooth}
						className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
					>
						{[
							{
								title: "Materiales duraderos",
								label: "Buena calidad",
								desc: "Seleccionamos telas y controles de producción...",
								color: "primary",
							},
							{
								title: "Transparencia en precios",
								label: "Precios justos",
								desc: "Colaboramos directo con talleres...",
								color: "secondary",
							},
							{
								title: "Hecho en Perú",
								label: "Producción local",
								desc: "Todas nuestras piezas se producen en talleres locales...",
								color: "accent",
							},
						].map((card, i) => (
							<motion.article
								key={i}
								variants={animations.scaleIn}
								transition={transitions.smooth}
								whileHover={{ y: -4 }}
								whileTap={{ scale: 0.98 }}
								className={`relative overflow-hidden rounded-2xl border-2 border-${card.color}/20 bg-card p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300`}
							>
								<div className="relative space-y-3">
									<p
										className={`text-xs font-medium uppercase tracking-[0.2em] text-${card.color}`}
									>
										{card.label}
									</p>
									<h3 className="text-lg md:text-xl font-semibold">
										{card.title}
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{card.desc}
									</p>
								</div>
							</motion.article>
						))}
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<motion.section
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				viewport={{ once: true, margin: "-100px" }}
				className="border-t border-border bg-card py-12 md:py-16 lg:py-20"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
					<div className="flex-1 space-y-3 text-center lg:text-left">
						<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
							¿Necesitas algo personalizado?
						</h2>
						<p className="text-sm md:text-base text-muted-foreground max-w-xl">
							Uniformes, colecciones o piezas únicas. Cuéntanos tu idea.
						</p>
					</div>
					<div className="w-full lg:w-auto lg:flex-1">
						<WhatsAppCTA
							whatsappNumber={whatsappNumber}
							messageConfig={collaborationConfig}
							label="Solicitar cotización"
							className="w-full lg:w-auto justify-center bg-primary text-primary-foreground"
						/>
					</div>
				</div>
			</motion.section>

			<Footer settings={settings} />
		</main>
	);
}
