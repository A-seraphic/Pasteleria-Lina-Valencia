import { DEFAULT_SITE } from "./defaults";

// Datos de contacto (WhatsApp, redes, dirección). Se editan en el panel → Ajustes;
// el catálogo los sincroniza aquí al cargar (setSite).
export const SITE = { ...DEFAULT_SITE };

export function setSite(values) {
  Object.assign(SITE, values);
}

const digits = (n) => String(n || "").replace(/\D/g, "");

export const whatsappUrl = (text = SITE.greeting) =>
  `https://wa.me/${digits(SITE.whatsapp)}?text=${encodeURIComponent(text)}`;

export const instagramUrl = () => `https://instagram.com/${String(SITE.instagram).replace(/^@/, "")}`;
export const mapsUrl = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;

// Desplazamiento a una sección respetando el scroll suave
export function scrollToId(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 12;
  window.smoothScrollTo ? window.smoothScrollTo(y) : el.scrollIntoView({ behavior: "smooth" });
}
