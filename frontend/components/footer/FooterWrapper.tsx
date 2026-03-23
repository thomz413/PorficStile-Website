import { getFooterSettings } from "@/lib/strapi";
import Footer from "@/components/footer/Footer";

export default async function FooterWrapper() {
    const footerSettings = await getFooterSettings();

    // If data is missing, we still want to show the footer structure
    // maybe with empty links, rather than crashing or showing nothing.
    return <Footer settings={footerSettings} />;
}