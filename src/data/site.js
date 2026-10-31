// Datos de contacto en un solo lugar (WhatsApp, redes, dirección)
export const SITE = {
  whatsapp: "573001234567",
  phoneLabel: "+57 300 123 4567",
  instagram: "linavalenciapasteleria",
  address: "Calle 85 #12-30, Bogotá",
  hours: "Lun - Sáb: 8:00 AM - 7:00 PM",
};

export const whatsappUrl = (text = "¡Hola Lina! Quiero hacer un pedido 🎂") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const instagramUrl = () => `https://instagram.com/${SITE.instagram}`;
export const mapsUrl = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;

// Desplazamiento a una sección respetando el scroll suave
export function scrollToId(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 12;
  window.smoothScrollTo ? window.smoothScrollTo(y) : el.scrollIntoView({ behavior: "smooth" });
}
