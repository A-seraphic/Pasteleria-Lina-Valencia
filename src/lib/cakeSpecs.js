// Datos livianos de la torta 3D (sin three.js) para usarlos en la carga inicial

// Paletas de cobertura que el cliente puede probar en 3D
export const FROSTINGS = {
  rosa: { label: "Rosa", frosting: "#f6c9d8", accent: "#a50059" },
  vainilla: { label: "Vainilla", frosting: "#fbf1e1", accent: "#d4af37" },
  chocolate: { label: "Chocolate", frosting: "#6b3d2e", accent: "#d4af37" },
  lavanda: { label: "Lavanda", frosting: "#ddd0f0", accent: "#8a6fc2" },
};

// Medidas de cada piso: el de abajo usa el diámetro de la porción y los demás se reducen
export function tierLayout({ diameter, height, tiers = 1 }) {
  const list = [];
  let y = 0;
  for (let i = 0; i < tiers; i++) {
    const d = diameter * Math.pow(0.74, i);
    const h = height * (i === 0 ? 1 : 0.92);
    list.push({ d, h, y });
    y += h;
  }
  return list;
}

// Peso aproximado en kg (densidad media de torta ~0.55 g/cm³)
export function estimateWeightKg(portion) {
  return tierLayout(portion).reduce((kg, t) => kg + (Math.PI * (t.d / 2) ** 2 * t.h * 0.55) / 1000, 0);
}
