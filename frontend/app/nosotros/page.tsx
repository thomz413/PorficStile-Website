import NosotrosClient from "@/app/nosotros/nosotrosCliente";
import { getSettings } from "@/lib/strapi";

export default async function NosotrosPage() {
	const settings = await getSettings();

	return <NosotrosClient settings={settings} />;
}
