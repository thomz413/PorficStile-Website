import { getSettings } from "@/lib/strapi";
import ContactoClient from "@/app/contacto/contactoClient";

export default async function ContactoPage() {
	const settings = await getSettings();

	return <ContactoClient settings={settings} />;
}
