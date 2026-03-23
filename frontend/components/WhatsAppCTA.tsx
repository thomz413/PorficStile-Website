"use client";

import { useMemo } from "react";
import { generateWhatsAppMessage, WhatsAppMessageConfig } from "@/lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppCTAProps {
	whatsappNumber?: string | null;
	message?: string;
	messageConfig?: WhatsAppMessageConfig;
	variant?: "button" | "sticky" | "card";
	className?: string;
	label?: string;
}

export default function WhatsAppCTA({
	whatsappNumber,
	message,
	messageConfig,
	variant = "button",
	className = "",
	label = "Escribir por WhatsApp",
}: WhatsAppCTAProps) {
	// 1. PERFORMANCE: Memoize the URL calculation so it doesn't run on every render
	const whatsappURL = useMemo(() => {
		if (!whatsappNumber) return "";

		const cleanNumber = whatsappNumber.replace(/[^\d]/g, "");
		const finalMessage = messageConfig
			? generateWhatsAppMessage(messageConfig)
			: message || "Hola, me interesa conocer más sobre sus prendas.";

		return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(finalMessage)}`;
	}, [whatsappNumber, message, messageConfig]);

	// If there is no configured WhatsApp number, we don't render the CTA.
	if (!whatsappNumber) return null;

	const ariaLabel = `Abrir WhatsApp: ${label}`;
	// 2. SECURITY: Standard rel attributes for external links
	const externalLinkProps = {
		target: "_blank",
		rel: "noopener noreferrer",
		"aria-label": ariaLabel,
	};

	// 3. SEMANTICS: Using <a> instead of <button> for navigation
	if (variant === "sticky") {
		return (
			<a
				href={whatsappURL}
				{...externalLinkProps}
				// 4. RESPONSIVENESS: Adjusted mobile padding/sizing so it doesn't block UI on small screens
				className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-secondary text-white shadow-2xl hover:bg-secondary/90 transition-all hover:scale-110 border-2 border-transparent hover:border-white/20 group ${className}`}
				title="Contactar por WhatsApp"
			>
				<FaWhatsapp className="h-7 w-7 group-hover:rotate-12 transition-transform" />
			</a>
		);
	}

	if (variant === "card") {
		return (
			<a
				href={whatsappURL}
				{...externalLinkProps}
				className={`block rounded-xl border-2 border-secondary/20 p-6 bg-secondary/5 hover:bg-secondary/10 transition-all text-center group ${className}`}
			>
				<div className="flex items-center justify-center mb-3 text-secondary">
					<FaWhatsapp className="h-8 w-8 group-hover:rotate-12 transition-transform" />
				</div>
				<h3 className="font-semibold text-lg text-foreground mb-2">{label}</h3>
				<p className="text-sm text-muted-foreground">
					Atención directa y personalizada
				</p>
			</a>
		);
	}

	return (
		<a
			href={whatsappURL}
			{...externalLinkProps}
			className={`inline-flex items-center justify-center gap-3 rounded-lg bg-secondary px-8 py-4 font-bold text-white hover:bg-secondary/90 transition-all border-2 border-transparent hover:shadow-lg group uppercase tracking-wide ${className}`}
		>
			<FaWhatsapp className="h-6 w-6 group-hover:rotate-12 transition-transform" />
			<span>{label}</span>
		</a>
	);
}
