import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Care tips vary by product category keywords
const DEFAULT_TIPS = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
        <rect x="4" y="10" width="24" height="18" rx="3" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M10 10V7a6 6 0 0 1 12 0v3" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="19" r="2.5" stroke="#d4af37" strokeWidth="1.3" />
        <path d="M16 21.5v2" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Conservación",
    tip: "Mantén refrigerado entre 2°C y 6°C. Retira 20 minutos antes de servir para disfrutar la textura ideal.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
        <circle cx="16" cy="16" r="11" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M16 8v8l5 3" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Tiempo de vida",
    tip: "Consume en las primeras 48–72 horas para disfrutar la frescura y el sabor óptimos de cada creación.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
        <path d="M16 4C10 4 5 9 5 15c0 4.5 2.5 8.5 6.5 10.5l1 1.5h7l1-1.5C24.5 23.5 27 19.5 27 15c0-6-5-11-11-11z" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M13 20s1 2 3 2 3-2 3-2" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M12 14c0-1.1.9-2 2-2s2 .9 2 2M18 14c0-1.1.9-2 2-2" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Transporte",
    tip: "Transporta en superficie plana y evita cambios bruscos de temperatura. La caja original mantiene la estructura.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
        <path d="M8 26V14l8-10 8 10v12" stroke="#d4af37" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="13" y="18" width="6" height="8" rx="1.5" stroke="#d4af37" strokeWidth="1.3" />
        <path d="M12 14h8" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Temperatura ideal",
    tip: "Nunca congeles cremas decoradas. Para pasteles fondant, guarda a temperatura ambiente fresca y seca.",
  },
];

export default function DessertCare({ product }) {
  // Customize first tip's time based on product conservation detail if available
  const conservacion = product?.details?.find(
    (d) => d.label?.toLowerCase().includes("conserv")
  );
  const tips = conservacion
    ? [{ ...DEFAULT_TIPS[0], tip: conservacion.value + ". " + DEFAULT_TIPS[0].tip }, ...DEFAULT_TIPS.slice(1)]
    : DEFAULT_TIPS;

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{
        background: "rgba(253,250,245,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(212,175,55,0.10)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-[1px] flex-1" style={{ background: "rgba(212,175,55,0.2)" }} />
        <div className="text-center">
          <span
            className="font-inter text-[9px] tracking-[0.35em] uppercase font-medium block mb-1"
            style={{ color: "#d4af37" }}
          >
            Guía
          </span>
          <h3
            className="font-playfair text-lg font-semibold"
            style={{ color: "#a50059" }}
          >
            Cuidado de tu Postre
          </h3>
        </div>
        <div className="h-[1px] flex-1" style={{ background: "rgba(212,175,55,0.2)" }} />
      </div>

      {/* Tips grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((t, i) => (
          <motion.div
            key={t.title}
            className="flex gap-4 p-4 rounded-2xl"
            style={{
              background: "rgba(212,175,55,0.04)",
              border: "1px solid rgba(212,175,55,0.09)",
            }}
            initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 + i * 0.08 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(212,175,55,0.1)" }}
            >
              {t.icon}
            </div>
            <div>
              <p
                className="font-inter text-[10px] tracking-[0.15em] uppercase font-semibold mb-1"
                style={{ color: "#d4af37" }}
              >
                {t.title}
              </p>
              <p
                className="font-inter text-xs font-light leading-relaxed"
                style={{ color: "rgba(165,0,89,0.6)" }}
              >
                {t.tip}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}