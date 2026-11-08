import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";
import { usePublicCatalog } from "@/data/catalogStore";
import { whatsappUrl } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1];

function Item({ item, open, onToggle, index }) {
  const id = `faq-${index}`;
  return (
    <RevealItem as="li" className="rounded-[24px] overflow-hidden" style={{ background: open ? "#fff" : "var(--lv-cream-2)", transition: "background .3s" }}>
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id}
          className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-7 py-5">
          <span className="font-display text-[20px] md:text-[23px] font-semibold leading-snug" style={{ color: "var(--lv-wine)" }}>{item.q}</span>
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.35, ease: EASE }}
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
            style={{ background: open ? "var(--lv-wine)" : "#fff", color: open ? "var(--lv-cream)" : "var(--lv-wine)" }}>
            <Plus size={18} />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
            <p className="px-5 md:px-7 pb-6 font-inter text-[16px] md:text-[17px] leading-relaxed max-w-[60ch]" style={{ color: "var(--lv-ink)" }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </RevealItem>
  );
}

// Preguntas frecuentes (se editan en el panel). También alimentan los datos para Google.
export default function FaqSection() {
  const { faq } = usePublicCatalog();
  const [open, setOpen] = useState(0);
  if (!faq.length) return null;

  return (
    <section id="preguntas" className="relative py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-28">
          <SplitTitle lines={["Lo que", "siempre nos", "preguntan"]} className="font-display font-semibold text-[44px] md:text-[72px] leading-[0.98]" />
          <p className="font-inter text-[16px] md:text-[18px] leading-relaxed mt-5 max-w-[34ch]" style={{ color: "var(--lv-ink)" }}>
            ¿No encuentras tu respuesta? Escríbenos y te contestamos en el día.
          </p>
          <a href={whatsappUrl("¡Hola Lina! Tengo una pregunta 😊")} target="_blank" rel="noopener noreferrer"
            className="btn-press inline-flex mt-6 px-6 py-3.5 rounded-full font-inter text-[15px] font-semibold" style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
            Preguntar por WhatsApp
          </a>
        </div>
        <Reveal as="ul" className="space-y-3" stagger={0.07} amount={0.1}>
          {faq.map((item, i) => (
            <Item key={`${item.q}-${i}`} item={item} index={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
