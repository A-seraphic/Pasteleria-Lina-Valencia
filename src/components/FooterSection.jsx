import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram } from "lucide-react";
import GoldDust from "./fx/GoldDust";
import { instagramUrl, whatsappUrl, scrollToId } from "@/data/site";
import { usePublicCatalog } from "@/data/catalogStore";

const LINKS = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Personalizadas", href: "#personalizadas" },
  { label: "Porciones", href: "#porciones" },
  { label: "Cómo pedir", href: "#como-pedir" },
  { label: "Contacto", href: "#contacto" },
];

export default function FooterSection() {
  const { site } = usePublicCatalog();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // El nombre sube y se abre al llegar al final de la página
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const spacing = useTransform(scrollYProgress, [0, 1], ["-0.08em", "-0.03em"]);

  return (
    <footer ref={ref} className="relative overflow-hidden pt-16 md:pt-24" style={{ background: "var(--lv-wine-deep)", color: "var(--lv-cream)" }}>
      <GoldDust count={40} />
      <div className="relative max-w-[1400px] mx-auto px-5 md:px-10 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-[30px] md:text-[40px] leading-[1.05] max-w-[16ch]">Hagamos juntos tu próxima celebración.</p>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
            className="btn-press inline-flex mt-6 px-7 py-4 rounded-full font-inter text-[15px] font-semibold"
            style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>
            Pedir por WhatsApp
          </a>
        </div>
        <nav className="flex flex-col gap-2.5 font-inter text-[16px]">
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => scrollToId(l.href)} className="nav-link self-start" style={{ color: "rgba(253,250,245,0.85)" }}>
              {l.label}
            </button>
          ))}
        </nav>
        <div className="font-inter text-[16px] space-y-2.5" style={{ color: "rgba(253,250,245,0.85)" }}>
          <p>{site.address}</p>
          <p>{site.hours}</p>
          <a href={instagramUrl()} target="_blank" rel="noopener noreferrer" className="nav-link inline-flex items-center gap-2">
            <Instagram size={17} /> @{String(site.instagram).replace(/^@/, "")}
          </a>
        </div>
      </div>

      <motion.p aria-hidden style={{ y, letterSpacing: spacing }}
        className="relative font-display font-semibold whitespace-nowrap text-center leading-[0.8] mt-14 md:mt-20 text-[15.5vw] select-none"
        >
        <span style={{ color: "var(--lv-cream)" }}>Lina </span><span style={{ color: "var(--lv-gold)" }}>Valencia</span>
      </motion.p>
      <p className="relative text-center font-inter text-[13px] pb-[max(env(safe-area-inset-bottom),20px)] pt-4" style={{ color: "rgba(253,250,245,0.5)" }}>
        © {new Date().getFullYear()} Lina Valencia Pastelería
      </p>
    </footer>
  );
}
