import ContactoClient from "@/app/contacto/contactoClient";
import { getSettings } from "@/lib/strapi";

export default async function ContactoPage() {
	const settings = await getSettings();

	return <ContactoClient settings={settings} />;
}
