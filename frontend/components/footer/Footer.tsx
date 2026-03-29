import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTiktok } from "react-icons/fa";
import CopyrightYear from "@/components/CopyRightYear";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { FooterSettings } from "@/lib/strapi/types/settings";

export default function Footer({
	settings,
}: {
	settings?: FooterSettings | null;
}) {
	return (
		<footer className="bg-[#0f172a] text-slate-200 pt-16 pb-8 relative overflow-hidden border-t border-white/5">
			{/* Subtle Decorative Background */}
			<div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

			<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
					{/* Brand Column (Takes up 2 columns on large screens for breathing room) */}
					<div className="lg:col-span-2 space-y-6">
						<div className="flex flex-col items-start">
							<div className="relative h-10 w-40 mb-2">
								<Image
									src="/AtlantisTitle.svg"
									alt="ATLANTIS"
									fill
									className="object-contain object-left"
									priority
								/>
							</div>
							<span className="text-xs text-[#d4af37] font-bold uppercase tracking-[0.4em] ml-1">
								Porfic Stile
							</span>
						</div>

						<p className="text-slate-400 leading-relaxed text-sm max-w-sm">
							Prendas que te acompañan. Diseñamos ropa cómoda y con estilo para
							que te veas bien todos los días.
						</p>

						{/* Socials */}
						<div className="flex items-center gap-3 pt-2">
							{settings?.linkTiktok && (
								<SocialLink
									href={settings.linkTiktok}
									icon={<FaTiktok size={16} />}
									label="TikTok"
								/>
							)}

							{settings?.linkFacebook && (
								<SocialLink
									href={settings.linkFacebook}
									icon={<FaFacebook size={16} />}
									label="Facebook"
								/>
							)}
						</div>
					</div>

					{/* Simplified Links Column */}
					<div>
						<h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">
							Explorar
						</h4>
						<ul className="space-y-3 text-sm">
							<FooterLink href="/productos">Catálogo de Ropa</FooterLink>
							<FooterLink href="/nosotros">Nuestra Historia</FooterLink>
							<FooterLink href="/envios">Envíos y Cambios</FooterLink>
							<FooterLink href="/faq">Preguntas Frecuentes</FooterLink>
						</ul>
					</div>

					{/* Contact/Location Column */}
					<div>
						<h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">
							Contacto
						</h4>
						<div className="space-y-4 text-sm">
							<div className="flex gap-3 items-start group cursor-default">
								<MapPin
									size={18}
									className="text-accent shrink-0 mt-0.5 group-hover:-translate-y-1 transition-transform duration-300"
								/>
								<p className="text-slate-400">
									Galería Santa Lucía <br />
									Piso 7, Tienda 709 <br />
									Gamarra, Lima
								</p>
							</div>
							<a className="flex gap-3 items-center text-slate-400 hover:text-white transition-colors duration-300">
								<Phone size={18} className="text-accent" />
								<span>{settings?.numeroWhatsapp}</span>
							</a>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-slate-500 text-xs tracking-wide text-center md:text-left">
						© <CopyrightYear /> ATLANTIS PORFIC STILE. Todos los derechos
						reservados.
					</p>

					{settings && (
						<div className="flex items-center gap-3">
							<span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
								Atención al cliente
							</span>
							<WhatsAppCTA
								whatsappNumber={settings?.numeroWhatsapp}
								messageConfig={{ type: "general_question" }}
								label="WhatsApp"
								className="rounded-full bg-white/10 hover:bg-accent text-white px-5 py-2 text-xs font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
							/>
						</div>
					)}
				</div>
			</div>
		</footer>
	);
}

/** Helper Components */

function FooterLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<li>
			<Link
				href={href}
				className="text-slate-400 hover:text-white hover:translate-x-1.5 inline-block transition-all duration-300 ease-out"
			>
				{children}
			</Link>
		</li>
	);
}

function SocialLink({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#0f172a] hover:-translate-y-1 transition-all duration-300"
		>
			{icon}
		</a>
	);
}
