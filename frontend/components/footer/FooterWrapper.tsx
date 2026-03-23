import { getFooterSettings } from "@/lib/strapi";
import Footer from "@/components/footer/Footer";

export default async function FooterWrapper() {
    // Fetch only the number here
    const footerSettings = await getFooterSettings();

    return (
        <>
            <Footer settings={footerSettings} />
        </>
    );
}