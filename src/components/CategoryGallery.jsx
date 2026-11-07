import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Box } from "lucide-react";
import useScrollLock from "@/hooks/useScrollLock";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Galería de una categoría: portada con parallax, descripción y sus diseños.
 * Tocar un diseño abre su ficha.
 */
export default function CategoryGallery({ product, onSelect, onBack }) {
  useScrollLock(true);
  const scrollRef = useRef(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const coverY = useTransform(scrollY, [0, 500], [0, 140]);
  const coverScale = useTransform(scrollY, [0, 500], [1.05, 1.2]);

  return (
    <motion.div
      ref={scrollRef}
      data-scroll-lock
      className="fixed inset-0 z-[65] overflow-y-auto overscroll-contain font-inter"
      style={{ background: "var(--lv-cream)" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <button onClick={onBack} aria-label="Volver al catálogo"
        className="btn-press fixed z-10 top-[max(env(safe-area-inset-top),16px)] left-4 md:left-8 w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
        <ArrowLeft size={19} />
      </button>

      {/* Portada */}
      <div className="relative h-[46svh] md:h-[56vh] overflow-hidden" style={{ background: "var(--lv-blush)" }}>
        <motion.img src={product.img} alt="" className="w-full h-full object-cover" style={{ y: coverY, scale: coverScale }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-20">
        <div className="grid md:grid-cols-[1fr_1fr] gap-5 md:gap-16 mb-10 md:mb-14">
          <motion.h2 className="font-display font-semibold text-[46px] md:text-[84px] leading-[0.95]" style={{ color: "var(--lv-wine)" }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}>
            {product.name}
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}>
            <p className="font-inter text-[17px] leading-relaxed" style={{ color: "var(--lv-ink)" }}>{product.description}</p>
            <p className="font-display text-[24px] font-semibold mt-4" style={{ color: "var(--lv-wine)" }}>{product.price}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {product.subcategories.map((sub, i) => (
            <motion.button
              key={sub.id ?? i}
              onClick={() => onSelect(i)}
              className="group text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.3 + i * 0.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative block aspect-[4/5] rounded-[22px] md:rounded-[28px] overflow-hidden" style={{ background: "var(--lv-blush)" }}>
                <img src={sub.img} alt={sub.name} draggable={false}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:scale-[1.07]" />
                {sub.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full font-inter text-[12px] font-semibold"
                    style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>{sub.badge}</span>
                )}
                {sub.ar && (
                  <span className="absolute top-3 right-3 h-8 px-3 rounded-full flex items-center gap-1.5 font-inter text-[12px] font-semibold"
                    style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
                    <Box size={13} style={{ color: "var(--lv-gold)" }} /> 3D
                  </span>
                )}
                <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500 md:group-hover:rotate-45"
                  style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                  <ArrowUpRight size={18} />
                </span>
              </span>
              <span className="block font-display text-[19px] md:text-[24px] font-semibold leading-tight mt-3 px-1" style={{ color: "var(--lv-wine)" }}>{sub.name}</span>
              {sub.subtitle && <span className="block font-inter text-[14px] mt-0.5 px-1" style={{ color: "rgba(74,0,40,0.65)" }}>{sub.subtitle}</span>}
              <span className="block font-inter text-[15px] font-medium mt-1 px-1" style={{ color: "#8a6a1f" }}>{sub.price}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
