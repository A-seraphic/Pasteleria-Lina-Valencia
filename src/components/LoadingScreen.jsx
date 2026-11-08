import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_ICONS } from "./fx/BrandIcons";

const EASE = [0.76, 0, 0.24, 1];
const SOFT = [0.22, 1, 0.36, 1];

// La primera visita ve la animación completa; si vuelve en la misma sesión, es corta
function firstVisit() {
  try {
    const seen = sessionStorage.getItem("lv-intro");
    sessionStorage.setItem("lv-intro", "1");
    return !seen;
  } catch {
    return true;
  }
}

/**
 * Pantalla de carga de pastelería: el óvalo dorado se dibuja, el logo aparece
 * como glaseado que se sirve de abajo arriba, giran los íconos de la marca
 * y al final todo sube como una cortina de glaseado que gotea.
 */
export default function LoadingScreen({ onComplete }) {
  const [full] = useState(firstVisit);
  const [isVisible, setIsVisible] = useState(true);
  const hold = full ? 2600 : 900;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 650);
    }, hold);
    return () => clearTimeout(timer);
  }, [onComplete, hold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100]"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: EASE }}
        >
          <div className="relative h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: "var(--lv-rose-soft)" }}>
            {/* Íconos de la marca orbitando */}
            {full && (
              <motion.div className="absolute w-[min(78vw,420px)] aspect-square" aria-hidden
                initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 30, opacity: 1 }} transition={{ duration: 2.8, ease: SOFT }}>
                {BRAND_ICONS.concat(BRAND_ICONS).map((Icon, i) => {
                  const a = (i / 8) * Math.PI * 2;
                  return (
                    <motion.span key={i} className="absolute" style={{ left: `${50 + Math.cos(a) * 48}%`, top: `${50 + Math.sin(a) * 48}%`, translate: "-50% -50%" }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 260, damping: 14 }}>
                      <Icon size={i % 2 ? 22 : 28} color={i % 2 ? "var(--lv-gold)" : "var(--lv-fuchsia)"} />
                    </motion.span>
                  );
                })}
              </motion.div>
            )}

            {/* Logo: se "sirve" desde abajo como glaseado */}
            <motion.div className="relative w-[min(72vw,380px)]"
              initial={{ scale: 0.86 }} animate={{ scale: 1 }} transition={{ duration: full ? 2.2 : 0.8, ease: SOFT }}>
              <motion.img src="/brand/logo.webp" alt="Lina Valencia Pastelería" className="w-full h-auto" draggable={false}
                initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: full ? 1.3 : 0.5, ease: SOFT, delay: full ? 0.25 : 0 }} />
            </motion.div>

            <motion.p className="font-script text-[30px] md:text-[38px] mt-4" style={{ color: "var(--lv-fuchsia)" }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: full ? 1.3 : 0.3, duration: 0.8, ease: SOFT }}>
              Dulces momentos, hechos con amor
            </motion.p>

            {/* Barra de carga como manga pastelera que llena una línea dorada */}
            <div className="absolute bottom-[12svh] w-40 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.25)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "var(--lv-gold)", originX: 0 }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: hold / 1000, ease: "easeInOut" }} />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
