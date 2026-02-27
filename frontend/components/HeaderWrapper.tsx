"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import { getSettings } from "@/lib/strapi";

export default function HeaderWrapper() {
	const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			const settings = await getSettings();
			setWhatsappNumber(settings?.numeroWhatsapp || null);
		};
		fetchSettings();
	}, []);

	return <Header whatsappNumber={whatsappNumber} />;
}
