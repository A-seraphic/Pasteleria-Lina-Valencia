import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const TIPS = [
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
    tip: "Nunca congeles cremas decoradas. Para pasteles con fondant, guarda a temperatura ambiente fresca y seca.",
  },
];

export default function DessertCareModal({ product, onClose }) {
  const conservacion = product?.details?.find(
    (d) => d.label?.toLowerCase().includes("conserv")
  );
  const tips = conservacion
    ? [{ ...TIPS[0], tip: conservacion.value + ". " + TIPS[0].tip }, ...TIPS.slice(1)]
    : TIPS;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(165,0,89,0.06)", backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-3xl p-8"
          style={{
            background: "rgba(253,250,245,0.88)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(212,175,55,0.18)",
            boxShadow: "0 32px 80px rgba(165,0,89,0.12), 0 8px 24px rgba(212,175,55,0.08)",
          }}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.45, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: "rgba(165,0,89,0.07)", color: "#a50059" }}
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="font-inter text-[10px] tracking-[0.35em] uppercase font-medium block mb-1" style={{ color: "#d4af37" }}>
              Guía de cuidados
            </span>
            <h3 className="font-playfair text-2xl font-semibold" style={{ color: "#a50059" }}>
              Cómo cuidar tu postre
            </h3>
            <div className="h-[1px] w-10 mt-4" style={{ background: "#d4af37" }} />
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map((t, i) => (
              <motion.div
                key={t.title}
                className="flex gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.09)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.07 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(212,175,55,0.1)" }}
                >
                  {t.icon}
                </div>
                <div>
                  <p className="font-inter text-[10px] tracking-[0.15em] uppercase font-semibold mb-1" style={{ color: "#d4af37" }}>
                    {t.title}
                  </p>
                  <p className="font-inter text-xs font-light leading-relaxed" style={{ color: "rgba(165,0,89,0.6)" }}>
                    {t.tip}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}