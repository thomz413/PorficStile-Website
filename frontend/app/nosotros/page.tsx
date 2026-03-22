import { getSettings } from "@/lib/strapi";
import NosotrosClient from "@/app/nosotros/nosotrosCliente";

export default async function NosotrosPage() {
	const settings = await getSettings();

	return <NosotrosClient settings={settings} />;
}
