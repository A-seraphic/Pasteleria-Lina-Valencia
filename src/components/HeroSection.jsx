import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Box } from "lucide-react";
import GoldDust from "./fx/GoldDust";
import { scrollToId, whatsappUrl } from "@/data/site";
import { usePublicCatalog } from "@/data/catalogStore";

const HERO_IMG = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/b8c1349ab_generated_82178631.png";
const SIDE_IMG = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/c814b2678_ChatGPTImage28jun202605_49_46pm.png";
const EASE = [0.22, 1, 0.36, 1];
const START = 1.9; // espera a que termine la pantalla de carga

export default function HeroSection() {
  const ref = useRef(null);
  const { categories } = usePublicCatalog();
  const fromPrice = categories[0]?.price;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Al bajar: la foto principal se inclina hacia atrás y la secundaria sube más rápido (capas)
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const mainY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  // Inclinación con el puntero / dedo
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tiltX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 16 });
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 16 });
  const onPoint = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const enter = (d) => ({ initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease: EASE, delay: START + d } });

  return (
    <section ref={ref} id="inicio" className="relative overflow-hidden pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-center">
        {/* Texto */}
        <motion.div style={{ y: textY }} className="order-2 lg:order-1">
          <h1 className="font-display font-semibold text-[46px] leading-[0.98] sm:text-[64px] lg:text-[clamp(64px,6.6vw,108px)]"
            style={{ color: "var(--lv-wine)" }} aria-label="Tortas de autor, hechas a pedido">
            {["Tortas de autor,", "hechas a pedido"].map((line, i) => (
              <span key={line} aria-hidden className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }}
                  transition={{ duration: 1.15, ease: EASE, delay: START + i * 0.12 }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...enter(0.35)} className="font-inter text-[17px] md:text-[19px] leading-relaxed mt-6 max-w-[34ch]" style={{ color: "var(--lv-ink)" }}>
            Elige sabores y rellenos, mira en 3D cuántas porciones salen y recibe tu pedido listo para enviar por WhatsApp.
          </motion.p>

          <motion.div {...enter(0.45)} className="flex flex-wrap items-center gap-3 mt-8">
            <button onClick={() => scrollToId("#catalogo")}
              className="btn-press px-8 py-4 rounded-full font-inter text-[15px] font-semibold"
              style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
              Ver el catálogo
            </button>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
              className="btn-press px-6 py-4 rounded-full font-inter text-[15px] font-semibold"
              style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
              Escribir a Lina
            </a>
          </motion.div>

          {fromPrice && (
            <motion.p {...enter(0.55)} className="font-inter text-[15px] mt-8" style={{ color: "var(--lv-ink)" }}>
              {categories[0].name} <span className="font-display text-[22px] font-semibold ml-1" style={{ color: "var(--lv-wine)" }}>{fromPrice.replace(/^Desde\s*/i, "desde ")}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Fotos en capas */}
        <div className="order-1 lg:order-2 relative" style={{ perspective: 1200 }}>
          <motion.div style={{ y: mainY, rotateX, scale, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE, delay: START - 0.2 }}>
            <motion.div
              onPointerMove={onPoint}
              onPointerLeave={() => { px.set(0); py.set(0); }}
              className="relative ml-auto w-[86%] sm:w-[70%] lg:w-[82%] aspect-[4/5] rounded-[28px] md:rounded-[36px] overflow-hidden touch-pan-y"
              style={{ rotateX: tiltX, rotateY: tiltY, background: "var(--lv-blush)" }}
            >
              <motion.img src={HERO_IMG} alt="Torta de tres pisos en buttercream con rosas de azúcar"
                className="w-full h-full object-cover" initial={{ scale: 1.18 }} animate={{ scale: 1.04 }}
                transition={{ duration: 2.4, ease: EASE, delay: START - 0.2 }} />
              <GoldDust count={28} />
            </motion.div>
          </motion.div>

          {/* Segunda foto: más cerca, sube más rápido */}
          <motion.div style={{ y: sideY }}
            className="absolute left-0 bottom-[-6%] w-[42%] sm:w-[34%] lg:w-[38%] aspect-square rounded-[22px] md:rounded-[28px] overflow-hidden"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: EASE, delay: START + 0.3 }}>
            <img src={SIDE_IMG} alt="Torta semidesnuda con flores" className="w-full h-full object-cover" style={{ outline: "6px solid var(--lv-cream)", outlineOffset: -6, borderRadius: "inherit" }} />
          </motion.div>

          <motion.button onClick={() => scrollToId("#porciones")}
            className="btn-press absolute right-3 top-3 md:right-5 md:top-5 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full font-inter text-[13px] font-semibold"
            style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: START + 0.8, duration: 0.6 }}>
            <Box size={15} style={{ color: "var(--lv-gold)" }} /> Mírala en 3D
          </motion.button>
        </div>
      </div>
    </section>
  );
}
