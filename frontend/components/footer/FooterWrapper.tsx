import { getWhatsAppNumber } from "@/lib/strapi";
import Footer from "@/components/footer/Footer";

export default async function FooterWrapper() {
    // Fetch only the number here
    const whatsappNumber = await getWhatsAppNumber();

    return (
        <>
            <Footer whatsappNumber={whatsappNumber} />
        </>
    );
}