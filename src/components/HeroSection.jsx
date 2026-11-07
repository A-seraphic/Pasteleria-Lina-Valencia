import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Box } from "lucide-react";
import GoldDust from "./fx/GoldDust";
import Drips from "./fx/Drips";
import { BRAND_ICONS } from "./fx/BrandIcons";
import { scrollToId, whatsappUrl } from "@/data/site";
import { usePublicCatalog } from "@/data/catalogStore";

const HERO_IMG = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/b8c1349ab_generated_82178631.png";
const SIDE_IMG = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/c814b2678_ChatGPTImage28jun202605_49_46pm.png";
const EASE = [0.22, 1, 0.36, 1];
const SPRINKLES = ["#e91e8c", "#f8bbd0", "#d4af37", "#ffffff", "#a50059"];

// Íconos de marca que flotan detrás, cada uno a su profundidad
const FLOATERS = [
  { x: "6%", y: "14%", s: 30, d: -140, r: -12 },
  { x: "88%", y: "10%", s: 26, d: -90, r: 14 },
  { x: "92%", y: "46%", s: 34, d: -200, r: -8 },
  { x: "4%", y: "52%", s: 24, d: -120, r: 10 },
  { x: "46%", y: "6%", s: 20, d: -60, r: 0 },
  { x: "78%", y: "80%", s: 28, d: -170, r: 18 },
];

function Floater({ f, i, progress, ready }) {
  const Icon = BRAND_ICONS[i % BRAND_ICONS.length];
  const y = useTransform(progress, [0, 1], [0, f.d]);
  return (
    <motion.span
      aria-hidden
      className="absolute"
      style={{ left: f.x, top: f.y, y, rotate: f.r }}
      initial={{ opacity: 0, scale: 0 }}
      animate={ready ? { opacity: 0.55, scale: 1 } : {}}
      transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 200, damping: 14 }}
    >
      <Icon size={f.s} color={i % 2 ? "var(--lv-gold)" : "var(--lv-fuchsia)"} />
    </motion.span>
  );
}

// Sello circular con texto que gira
function SpinningSeal({ ready }) {
  return (
    <motion.div
      className="absolute -right-2 -top-6 md:-right-8 md:-top-8 w-[104px] h-[104px] md:w-[130px] md:h-[130px]"
      initial={{ scale: 0, rotate: -90 }}
      animate={ready ? { scale: 1, rotate: 0 } : {}}
      transition={{ delay: 1.1, type: "spring", stiffness: 160, damping: 14 }}
    >
      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="60" cy="60" r="58" style={{ fill: "var(--lv-wine)" }} />
        <defs>
          <path id="seal-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text style={{ fill: "var(--lv-gold-soft)", fontFamily: "Montserrat, sans-serif", fontSize: 11.5, letterSpacing: 3, fontWeight: 600 }}>
          <textPath href="#seal-circle">HECHO A PEDIDO · CON AMOR · </textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-0 flex items-center justify-center font-script text-[30px] md:text-[36px]" style={{ color: "var(--lv-cream)" }}>
        LV
      </span>
    </motion.div>
  );
}

export default function HeroSection({ ready = true }) {
  const ref = useRef(null);
  const logoRef = useRef(null);
  const { categories } = usePublicCatalog();
  const fromPrice = categories[0]?.price;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tiltX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 16 });
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 16 });
  const onPoint = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  // Chispas de azúcar que salen del logo al terminar la carga
  useEffect(() => {
    if (!ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(async () => {
      const r = logoRef.current?.getBoundingClientRect();
      if (!r) return;
      const confetti = (await import("canvas-confetti")).default;
      const origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight };
      const mobile = window.innerWidth < 640;
      confetti({
        particleCount: mobile ? 45 : 80,
        spread: 75,
        startVelocity: mobile ? 28 : 38,
        gravity: 0.9,
        ticks: 180,
        scalar: 0.75,
        origin,
        colors: SPRINKLES,
        shapes: ["circle", "square"],
        zIndex: 50,
        disableForReducedMotion: true,
      });
    }, 650);
    return () => clearTimeout(t);
  }, [ready]);

  const show = (d, extra = {}) => ({
    initial: { opacity: 0, y: 24, ...extra },
    animate: ready ? { opacity: 1, y: 0, x: 0, scale: 1, rotateY: 0 } : {},
    transition: { duration: 1, ease: EASE, delay: d },
  });

  return (
    <section ref={ref} id="inicio" className="relative">
      <div className="relative overflow-hidden pt-20 md:pt-24 pb-10 md:pb-16" style={{ background: "var(--lv-rose-soft)" }}>
        <GoldDust count={36} colors={SPRINKLES} />
        <div className="absolute inset-0 pointer-events-none">
          {FLOATERS.map((f, i) => (
            <Floater key={i} f={f} i={i} progress={scrollYProgress} ready={ready} />
          ))}
        </div>

        <div className="relative max-w-[1400px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Marca, lema y acciones */}
          <motion.div style={{ y: textY }} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.img
              ref={logoRef}
              src="/brand/logo.webp"
              alt="Lina Valencia Pastelería"
              draggable={false}
              className="w-[min(82vw,400px)] lg:w-[min(36vw,480px)] h-auto"
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", stiffness: 120, damping: 13, delay: 0.15 }}
            />

            {/* El lema se "escribe" de izquierda a derecha */}
            <motion.h1
              className="font-script text-[46px] leading-[1.05] sm:text-[60px] lg:text-[72px] mt-2"
              style={{ color: "var(--lv-fuchsia)" }}
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={ready ? { clipPath: "inset(0 0% 0 0)" } : {}}
              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.55 }}
            >
              Dulces momentos, <br className="hidden sm:block" />
              hechos con amor
            </motion.h1>

            <motion.p
              {...show(0.9)}
              className="font-inter text-[16.5px] md:text-[18px] leading-relaxed mt-4 max-w-[36ch]"
              style={{ color: "var(--lv-ink)" }}
            >
              Tortas y postres de autor, hechos a pedido. Elige sabores, mira en 3D cuántas porciones salen y pide por WhatsApp.
            </motion.p>

            <motion.div {...show(1.05)} className="flex flex-wrap justify-center lg:justify-start gap-3 mt-7">
              <button
                onClick={() => scrollToId("#catalogo")}
                className="btn-press px-8 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}
              >
                Ver el catálogo
              </button>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press px-6 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}
              >
                Escribir a Lina
              </a>
            </motion.div>

            {fromPrice && (
              <motion.p {...show(1.2)} className="font-inter text-[15px] mt-6" style={{ color: "var(--lv-ink)" }}>
                {categories[0].name}{" "}
                <span className="font-display text-[21px] font-semibold ml-1" style={{ color: "var(--lv-wine)" }}>
                  {fromPrice.replace(/^Desde\s*/i, "desde ")}
                </span>
              </motion.p>
            )}
          </motion.div>

          {/* Fotos: arco de vitrina, plato redondo y sello */}
          <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none" style={{ perspective: 1200 }}>
            <motion.div style={{ y: photoY, rotateX, scale: photoScale, transformStyle: "preserve-3d" }}>
              <motion.div {...show(0.35, { y: 90, rotateY: -22 })} style={{ transformStyle: "preserve-3d" }}>
                <motion.div
                  onPointerMove={onPoint}
                  onPointerLeave={() => {
                    px.set(0);
                    py.set(0);
                  }}
                  className="relative ml-auto w-[84%] lg:w-[80%] aspect-[4/5] overflow-hidden touch-pan-y"
                  style={{
                    rotateX: tiltX,
                    rotateY: tiltY,
                    borderRadius: "999px 999px 34px 34px",
                    background: "var(--lv-rose)",
                    boxShadow: "0 40px 80px -30px rgba(165,0,89,0.45)",
                  }}
                >
                  <motion.img
                    src={HERO_IMG}
                    alt="Torta de tres pisos en buttercream con rosas de azúcar"
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.25 }}
                    animate={ready ? { scale: 1.04 } : {}}
                    transition={{ duration: 2.2, ease: EASE, delay: 0.35 }}
                  />
                  <GoldDust count={18} />
                </motion.div>
                <SpinningSeal ready={ready} />
              </motion.div>
            </motion.div>

            <motion.div style={{ y: sideY }} className="absolute left-0 bottom-[-4%] w-[44%] lg:w-[40%] aspect-square">
              <motion.div {...show(0.75, { scale: 0.5, y: 0 })} className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={SIDE_IMG}
                  alt="Torta semidesnuda con flores"
                  className="w-full h-full object-cover rounded-full"
                  style={{ outline: "7px solid var(--lv-rose-soft)", outlineOffset: -7 }}
                />
              </motion.div>
            </motion.div>

            <motion.button
              onClick={() => scrollToId("#porciones")}
              {...show(1.3)}
              className="btn-press absolute right-3 bottom-4 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full font-inter text-[13px] font-semibold"
              style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}
            >
              <Box size={15} style={{ color: "var(--lv-gold)" }} /> Mírala en 3D
            </motion.button>
          </div>
        </div>
      </div>

      {/* Glaseado que gotea sobre la siguiente sección */}
      <Drips
        color="var(--lv-rose-soft)"
        count={18}
        seed={3}
        height={110}
        play={ready}
        delay={0.4}
        className="absolute left-0 right-0 top-full -mt-[2px] z-10 pointer-events-none"
      />
    </section>
  );
}
