import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";
import { scrollToId, whatsappUrl } from "@/data/site";

// Cada línea del recibo es un paso del pedido: el mismo recibo que genera la web
const ROWS = [
  ["Producto", "Lo eliges en el catálogo"],
  ["Sabores", "Bizcocho, relleno y cobertura"],
  ["Tamaño", "Lo ves en 3D antes de pedir"],
  ["Recibo", "Se descarga como imagen"],
  ["Envío", "Directo al WhatsApp de Lina"],
];

export default function HowToOrder() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // El ticket sale de la ranura de la impresora al bajar
  const ticketY = useTransform(scrollYProgress, [0.1, 0.55], ["-78%", "0%"]);
  const ticketRot = useTransform(scrollYProgress, [0.1, 0.55, 0.9], [-2, 0, 1.5]);
  const year = new Date().getFullYear();

  return (
    <section ref={ref} id="como-pedir" className="relative py-20 md:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <SplitTitle lines={["Pedir es tan fácil", "como leer un recibo"]} className="font-display font-semibold text-[40px] md:text-[72px] leading-[1]" />
          <Reveal className="mt-6 space-y-6">
            <RevealItem as="p" className="font-inter text-[17px] md:text-[19px] leading-relaxed max-w-[40ch]" style={{ color: "var(--lv-ink)" }}>
              Al personalizar tu torta, la página arma un recibo con todo lo que elegiste. Lo descargas y se lo envías a Lina por WhatsApp: sin formularios ni esperas.
            </RevealItem>
            <RevealItem className="flex flex-wrap gap-3">
              <button onClick={() => scrollToId("#catalogo")} className="btn-press px-8 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                Empezar mi pedido
              </button>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-press px-6 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
                Tengo una idea propia
              </a>
            </RevealItem>
          </Reveal>
        </div>

        {/* Impresora + recibo */}
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative z-10 h-12 rounded-[18px] flex items-center justify-center" style={{ background: "var(--lv-wine-deep)" }}>
            <span className="w-[86%] h-2 rounded-full" style={{ background: "#2b0017" }} />
          </div>
          <div className="relative -mt-4 mx-[7%] overflow-hidden pt-4 pb-6">
            <motion.div style={{ y: ticketY, rotate: ticketRot }} className="receipt-paper relative px-6 pt-7 pb-9 origin-top">
              <p className="font-display text-[28px] font-semibold text-center leading-none" style={{ color: "var(--lv-wine)" }}>Lina Valencia</p>
              <p className="font-inter text-[13px] text-center mt-1.5" style={{ color: "#8a6a1f" }}>Recibo de pedido · #LV-{year}-0427</p>
              <div className="my-5 h-[2px]" style={{ backgroundImage: "radial-gradient(circle, rgba(165,0,89,0.35) 1px, transparent 1.5px)", backgroundSize: "8px 2px" }} />
              <ul className="space-y-3.5">
                {ROWS.map(([k, v], i) => (
                  <motion.li key={k} className="flex justify-between gap-4 font-inter"
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 1 }}
                    transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}>
                    <span className="text-[14px]" style={{ color: "rgba(74,0,40,0.6)" }}>{k}</span>
                    <span className="text-[14.5px] font-semibold text-right" style={{ color: "var(--lv-ink)" }}>{v}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="my-5 h-[2px]" style={{ backgroundImage: "radial-gradient(circle, rgba(165,0,89,0.35) 1px, transparent 1.5px)", backgroundSize: "8px 2px" }} />
              <div className="flex justify-between items-baseline">
                <span className="font-display text-[20px]" style={{ color: "var(--lv-wine)" }}>Tu celebración</span>
                <span className="font-display text-[20px] font-semibold" style={{ color: "var(--lv-wine)" }}>a tu medida</span>
              </div>
              <div aria-hidden className="mt-6 h-12 mx-auto w-[78%]"
                style={{ background: "repeating-linear-gradient(90deg, var(--lv-ink) 0 2px, transparent 2px 4px, var(--lv-ink) 4px 5px, transparent 5px 8px, var(--lv-ink) 8px 11px, transparent 11px 13px)" }} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
