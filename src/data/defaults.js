// Valores iniciales: se usan mientras el panel no tenga datos propios

// Especializaciones (grupos de opciones). Los dueños pueden crear, renombrar y ordenar las suyas.
// type: "single" (una opción) | "multi" (varias). receipt: cómo se llama en el recibo.
export const DEFAULT_OPTION_GROUPS = [
  { key: "bizcocho", label: "Sabores de bizcocho", receipt: "Bizcocho", type: "single", required: true, visible: true, sort: 0 },
  { key: "relleno", label: "Rellenos", receipt: "Relleno", type: "single", required: false, visible: true, sort: 1 },
  { key: "cobertura", label: "Coberturas", receipt: "Cobertura", type: "single", required: false, visible: true, sort: 2 },
  { key: "extra", label: "Adicionales", receipt: "Adicionales", type: "multi", required: false, visible: true, sort: 3 },
];

const OPTION_NAMES = {
  bizcocho: [
    "Vainilla de Madagascar",
    "Chocolate negro 72%",
    "Red Velvet",
    "Limón Siciliano",
    "Almendra & Amaretto",
    "Café colombiano",
    "Coco & Maracuyá",
  ],
  relleno: [
    "Arequipe",
    "Crema pastelera",
    "Ganache de chocolate",
    "Mermelada de frutos rojos",
    "Crema de maracuyá",
    "Nutella",
    "Queso crema",
  ],
  cobertura: ["Buttercream suizo", "Fondant", "Ganache", "Crema chantilly", "Naked (semidesnuda)"],
  extra: ["Topper personalizado", "Flores frescas", "Fresas frescas", "Oro comestible"],
};

export const DEFAULT_OPTIONS = Object.entries(OPTION_NAMES).flatMap(([kind, names], k) =>
  names.map((name, i) => ({ id: (k + 1) * 100 + i, kind, name, visible: true, sort: i, priceExtra: 0, description: "" }))
);

export const DEFAULT_PORTIONS = [
  { id: 1, label: "Individual", people: "1–2 personas", diameter: 10, height: 8, tiers: 1, slices: 2, sort: 0, priceExtra: 0 },
  { id: 2, label: "Para dos", people: "2–4 personas", diameter: 15, height: 10, tiers: 1, slices: 4, sort: 1, priceExtra: 0 },
  { id: 3, label: "Pequeño", people: "6–8 personas", diameter: 18, height: 10, tiers: 1, slices: 8, sort: 2, priceExtra: 0 },
  { id: 4, label: "Familiar", people: "10–12 personas", diameter: 24, height: 11, tiers: 1, slices: 12, sort: 3, priceExtra: 0 },
  { id: 5, label: "Celebración", people: "20–25 personas", diameter: 30, height: 11, tiers: 1, slices: 20, sort: 4, priceExtra: 0 },
  { id: 6, label: "Gran Evento", people: "+40 personas", diameter: 30, height: 10, tiers: 3, slices: 40, sort: 5, priceExtra: 0 },
];

// Datos del negocio que se muestran en la página y se usan para WhatsApp
export const DEFAULT_SITE = {
  whatsapp: "573001234567",
  phoneLabel: "+57 300 123 4567",
  instagram: "linavalenciapasteleria",
  address: "Calle 85 #12-30, Bogotá",
  hours: "Lun - Sáb: 8:00 AM - 7:00 PM",
  greeting: "¡Hola Lina! Quiero hacer un pedido 🎂",
};

// Lo que imprime el recibo de pedido
export const DEFAULT_RECEIPT = {
  title: "Lina Valencia",
  subtitle: "Pastelería de autor",
  heading: "Recibo de pedido",
  codePrefix: "LV",
  footerLeft: "Pedido hecho en la web",
  footerRight: "Hecho con amor",
  terms: "Para confirmar tu pedido se requiere un abono del 50%. Los precios son de referencia y se confirman por WhatsApp.",
  showPrices: true,
  showTotal: true,
  showEventDate: true,
  showNotes: true,
  showTerms: true,
  whatsappIntro: "¡Hola Lina! Te comparto el recibo de mi pedido que acabo de generar en la web.",
};

// Preguntas frecuentes (se editan en el panel → Preguntas)
export const DEFAULT_FAQ = [
  { q: "¿Con cuánta anticipación debo pedir?", a: "Las tortas artesanales se piden con al menos 3 días de anticipación y las personalizadas con 7 días. Para fechas especiales, escríbenos antes para separar tu fecha." },
  { q: "¿Cómo confirmo mi pedido?", a: "Arma tu pedido en la página, genera el recibo y envíalo por WhatsApp. Lina te confirma la disponibilidad y el abono para separar la fecha." },
  { q: "¿Hacen domicilios?", a: "Sí. Coordinamos la entrega por WhatsApp y el valor depende de la zona. También puedes recoger tu pedido con cita previa." },
  { q: "¿Puedo pedir un diseño propio?", a: "Claro. Cuéntanos tu idea en las notas del pedido o envíanos una foto de referencia por WhatsApp y te ayudamos a hacerla realidad." },
  { q: "¿Tienen opciones para alergias o sin gluten?", a: "Escribe tus alergias o restricciones en las notas del pedido y te diremos qué opciones podemos preparar para ti." },
  { q: "¿Cómo conservo mi torta?", a: "Guárdala refrigerada y sácala 20 a 30 minutos antes de servir para que recupere su textura y sabor." },
];

export const DEFAULT_SETTINGS = { site: DEFAULT_SITE, receipt: DEFAULT_RECEIPT, optionGroups: DEFAULT_OPTION_GROUPS, faq: DEFAULT_FAQ };

// Categorías cuyo producto es una torta y se puede ver en 3D / realidad aumentada
export const CAKE_CATEGORY_NAMES = ["Tortas Artesanales", "Personalizadas", "Ponqués", "Mini Tortas", "Combos"];

// Formato de dinero colombiano: 120000 → "$120.000"
export const formatCOP = (n) => `$${Math.round(Number(n) || 0).toLocaleString("es-CO")}`;

// Saca el primer número de un precio escrito ("Desde $120.000" → 120000, "$32.000 x 6 und" → 32000)
export const parsePrice = (text) => {
  const m = String(text || "").match(/\d[\d.,]*/);
  return m ? Number(m[0].replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".")) || 0 : 0;
};
