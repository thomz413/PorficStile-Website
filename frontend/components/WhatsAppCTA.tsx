"use client";

import { MouseEvent, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { generateWhatsAppMessage, WhatsAppMessageConfig } from "@/lib/whatsapp";

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
	// Generate intelligent message if config is provided
	const finalMessage = messageConfig 
		? generateWhatsAppMessage(messageConfig)
		: message || "Hola, me interesa conocer más";

	const whatsappURL = `https://wa.me/${whatsappNumber?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
		finalMessage,
	)}`;

	const openWhatsApp = useCallback(
		(e: MouseEvent) => {
			// Prevent link-like parent handlers from firing
			e.stopPropagation();
			// open in new tab/window safely
			if (typeof window !== "undefined") {
				window.open(whatsappURL, "_blank", "noopener,noreferrer");
			}
		},
		[whatsappURL],
	);

	// ARIA label for screen readers
	const ariaLabel = `Abrir WhatsApp: ${label}`;

	// If there is no configured WhatsApp number, we don't render the CTA.
	if (!whatsappNumber) {
		return null;
	}

	if (variant === "sticky") {
		return (
			<button
				type="button"
				onClick={openWhatsApp}
				aria-label={ariaLabel}
				className="fixed bottom-8 right-8 z-40 flex items-center justify-center h-16 w-16 rounded-none bg-secondary text-white shadow-2xl hover:bg-secondary/90 transition-smooth hover:scale-110 border-2 border-primary group"
				title="Contactar por WhatsApp"
			>
				<MessageCircle className="h-7 w-7 group-hover:rotate-12 transition-transform" />
			</button>
		);
	}

	if (variant === "card") {
		return (
			<button
				type="button"
				onClick={openWhatsApp}
				aria-label={ariaLabel}
				className={`block rounded-none border-2 border-secondary p-6 bg-secondary/5 hover:bg-secondary/10 transition-smooth text-center group ${className}`}
			>
				<div className="flex items-center justify-center mb-3">
					<MessageCircle className="h-8 w-8 text-secondary group-hover:scale-110 transition-smooth" />
				</div>
				<h3 className="font-semibold text-lg text-foreground mb-2">{label}</h3>
				<p className="text-sm text-muted-foreground">
					Te respondemos por WhatsApp
				</p>
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={openWhatsApp}
			aria-label={ariaLabel}
			className={`inline-flex items-center justify-center gap-3 rounded-none bg-secondary px-8 py-4 font-black text-white hover:bg-secondary/90 transition-smooth border-2 border-secondary hover:shadow-lg group uppercase tracking-wide ${className}`}
		>
			<MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
			<span>{label}</span>
		</button>
	);
}
