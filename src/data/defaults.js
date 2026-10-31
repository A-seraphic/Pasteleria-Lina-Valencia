// Valores iniciales: se usan mientras el panel no tenga datos propios
export const OPTION_KINDS = [
  { kind: "bizcocho", label: "Sabores de bizcocho", short: "Bizcocho" },
  { kind: "relleno", label: "Rellenos", short: "Relleno" },
  { kind: "cobertura", label: "Coberturas", short: "Cobertura" },
  { kind: "extra", label: "Adicionales", short: "Adicional" },
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
  names.map((name, i) => ({ id: (k + 1) * 100 + i, kind, name, visible: true, sort: i }))
);

export const DEFAULT_PORTIONS = [
  { id: 1, label: "Individual", people: "1–2 personas", diameter: 10, height: 8, tiers: 1, slices: 2, sort: 0 },
  { id: 2, label: "Para dos", people: "2–4 personas", diameter: 15, height: 10, tiers: 1, slices: 4, sort: 1 },
  { id: 3, label: "Pequeño", people: "6–8 personas", diameter: 18, height: 10, tiers: 1, slices: 8, sort: 2 },
  { id: 4, label: "Familiar", people: "10–12 personas", diameter: 24, height: 11, tiers: 1, slices: 12, sort: 3 },
  { id: 5, label: "Celebración", people: "20–25 personas", diameter: 30, height: 11, tiers: 1, slices: 20, sort: 4 },
  { id: 6, label: "Gran Evento", people: "+40 personas", diameter: 30, height: 10, tiers: 3, slices: 40, sort: 5 },
];

// Categorías cuyo producto es una torta y se puede ver en 3D / realidad aumentada
export const CAKE_CATEGORY_NAMES = ["Tortas Artesanales", "Personalizadas", "Ponqués", "Mini Tortas", "Combos"];
