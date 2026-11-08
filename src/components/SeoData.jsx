import { useEffect } from "react";
import { usePublicCatalog } from "@/data/catalogStore";
import { instagramUrl } from "@/data/site";

// Datos estructurados para Google: el negocio (pastelería) y sus preguntas frecuentes.
// Se arman con lo que los dueños editan en el panel, así siempre están al día.
export default function SeoData() {
  const { site, faq, categories } = usePublicCatalog();

  useEffect(() => {
    const origin = window.location.origin;
    const graph = [
      {
        "@type": "Bakery",
        name: "Lina Valencia Pastelería",
        url: `${origin}/`,
        image: `${origin}/og-image.jpg`,
        logo: `${origin}/brand/logo.png`,
        description: "Tortas y postres de autor hechos a pedido.",
        telephone: site.phoneLabel,
        address: { "@type": "PostalAddress", streetAddress: site.address, addressCountry: "CO" },
        openingHours: site.hours,
        servesCuisine: "Pastelería",
        sameAs: site.instagram ? [instagramUrl()] : [],
        hasMenu: {
          "@type": "Menu",
          hasMenuSection: categories.map((c) => ({
            "@type": "MenuSection",
            name: c.name,
            hasMenuItem: c.subcategories.map((s) => ({ "@type": "MenuItem", name: s.name, description: s.desc, offers: { "@type": "Offer", price: s.basePrice || undefined, priceCurrency: "COP" } })),
          })),
        },
      },
      faq.length && {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ].filter(Boolean);

    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(el);
    return () => el.remove();
  }, [site, faq, categories]);

  return null;
}
