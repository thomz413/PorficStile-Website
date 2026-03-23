import Link from "next/link";
import { ArrowRight, Star, Award, Heart } from "lucide-react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getFeaturedProducts, getSettings } from "@/lib/strapi";
import { WhatsAppMessageConfig } from "@/lib/whatsapp";
import HeaderTransition from "@/components/HeaderTransition";
import {
	FadeIn,
	StaggerContainer,
	StaggerItem,
	TextReveal,
} from "@/components/Animations";
import FooterWrapper from "@/components/footer/FooterWrapper";
import {Suspense} from "react";

export default async function Home() {
	// 1. Fetch data directly on the server
	// This happens during build time or request time, not in the browser!
	const [featuredProducts, settings] = await Promise.all([
		getFeaturedProducts(),
		getSettings(),
	]);

	const whatsappNumber = settings?.numeroWhatsapp;
	const heroImageUrl = settings?.imagenHero?.url;
	const generalQuestionConfig = {
		type: "general_question",
	} satisfies WhatsAppMessageConfig;

	return (
		<main className="min-h-screen bg-background">
			<HeaderTransition whatsappNumber={whatsappNumber} />

			{/* Hero Section */}
			<section className="relative overflow-hidden min-h-screen flex items-center justify-center">
				<div className="absolute inset-0 z-0">
					{heroImageUrl ? (
						<Image
							src={heroImageUrl}
							alt="Hero Background"
							fill
							priority
							className="object-cover scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
						/>
					) : (
						<div className="absolute inset-0 bg-linear-to-br from-slate-900 to-slate-800" />
					)}
					<div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-black/80" />
					<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
				</div>

				<div className="relative z-20 mx-auto max-w-7xl px-4 text-center space-y-8">
					{/* Staggered Hero Elements */}
					<FadeIn
						delay={0.2}
						className="flex flex-col items-center justify-center mb-4"
					>
						<Image
							src="/AtlantisTitle.svg"
							alt="Atlantis logo"
							width={300}
							height={80}
							className="w-48 md:w-80 h-auto mb-4"
						/>
						<span className="text-1xl md:text-4xl text-gold-shimmer font-black uppercase tracking-widest">
							PORFIC STILE
						</span>
					</FadeIn>

					<FadeIn delay={0.4}>
						<p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 font-light">
							{settings?.subtituloHero ||
								"Ropa de alta calidad con estilo único."}
						</p>
					</FadeIn>

					<FadeIn
						delay={0.6}
						className="flex flex-col sm:flex-row gap-4 justify-center items-center"
					>
						<Link
							href="/productos"
							className="bg-gold-premium-shimmer text-accent-foreground px-8 py-4 font-black hover:-translate-y-1 transition-all uppercase tracking-widest text-sm shadow-2xl"
						>
							Ver Catálogo
							<ArrowRight className="inline ml-2 h-4 w-4" />
						</Link>

						{whatsappNumber && (
							<WhatsAppCTA
								whatsappNumber={whatsappNumber}
								messageConfig={generalQuestionConfig}
								label="Contactanos"
								className="bg-white/10 backdrop-blur-sm text-white border-white/20"
							/>
						)}
					</FadeIn>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-20 md:py-32 bg-background">
				<div className="mx-auto max-w-7xl px-4">
					{/* 3D Word Reveal for Section Title */}
					<TextReveal
						text="Productos Destacados"
						className="justify-center text-4xl md:text-7xl font-black text-center mb-16"
					/>

					{/* Staggered Grid Reveal */}
					<StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
						{featuredProducts.map((product) => (
							<StaggerItem key={product.id}>
								<ProductCard product={product} />
							</StaggerItem>
						))}
					</StaggerContainer>
				</div>
			</section>

			{/* Brand Story Section */}
			<section className="py-20 md:py-32 bg-linear-to-b from-background to-muted/30 relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-20" />

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center space-y-8">
						<div className="space-y-4">
							<TextReveal
								text="Calidad y Estilo"
								className="justify-center text-4xl sm:text-5xl md:text-7xl font-black text-foreground leading-tight"
							/>
							<FadeIn delay={0.3}>
								<p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
									En Atlantis Porfic Stile creamos ropa de alta calidad con
									diseños que combinan tradición y modernidad.
								</p>
							</FadeIn>
						</div>

						<StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
							<StaggerItem className="text-center space-y-4">
								<div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
									<Star className="h-8 w-8 text-accent" />
								</div>
								<h3 className="text-xl font-black text-foreground">
									Diseño Único
								</h3>
								<p className="text-muted-foreground">
									Piezas originales creadas con atención al detalle
								</p>
							</StaggerItem>
							<StaggerItem className="text-center space-y-4">
								<div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
									<Award className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-black text-foreground">
									Alta Calidad
								</h3>
								<p className="text-muted-foreground">
									Materiales seleccionados y acabados duraderos
								</p>
							</StaggerItem>
							<StaggerItem className="text-center space-y-4">
								<div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
									<Heart className="h-8 w-8 text-secondary" />
								</div>
								<h3 className="text-xl font-black text-foreground">
									Estilo Peruano
								</h3>
								<p className="text-muted-foreground">
									Diseños que reflejan nuestra cultura
								</p>
							</StaggerItem>
						</StaggerContainer>
					</div>
				</div>
			</section>

			{/* Premium CTA Section */}
			<section className="py-20 md:py-32 bg-linear-to-br from-primary to-primary/80 text-white relative overflow-hidden">
				<div className="absolute inset-0 pattern-geometric opacity-20" />
				<div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
				<div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

				<FadeIn
					className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center"
					direction="none"
				>
					<div className="space-y-8">
						<h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
							Encuentra tu Estilo
						</h2>
						<p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
							Descubre nuestra colección de ropa de calidad.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							{whatsappNumber ? (
								<WhatsAppCTA
									whatsappNumber={whatsappNumber}
									messageConfig={generalQuestionConfig}
									label="Asesoría Personal"
									className="cursor-pointer border-white text-lg px-8 py-4 font-black"
								/>
							) : null}
							<Link
								href="/productos"
								className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 font-black hover:bg-white/20 transition-all duration-500 group uppercase tracking-widest text-sm"
							>
								Explorar Tienda
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
							</Link>
						</div>
					</div>
				</FadeIn>
			</section>

			<Suspense fallback={<footer className="h-64 bg-muted animate-pulse" />}>
				<FooterWrapper />
			</Suspense>

			{whatsappNumber && (
				<WhatsAppCTA
					whatsappNumber={whatsappNumber}
					variant="sticky"
					messageConfig={generalQuestionConfig}
					className="border border-white"
				/>
			)}
		</main>
	);
}
