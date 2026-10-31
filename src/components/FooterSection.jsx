import { Instagram } from "lucide-react";
import { instagramUrl, whatsappUrl, scrollToId } from "@/data/site";

const LINKS = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Porciones", href: "#porciones" },
  { label: "Esencia", href: "#esencia" },
  { label: "Contacto", href: "#contacto" },
];

export default function FooterSection() {
  return (
    <footer className="relative pt-14 pb-[max(env(safe-area-inset-bottom),28px)] px-6 text-center overflow-hidden">
      <div className="w-24 h-[1px] mx-auto mb-10" style={{ background: "linear-gradient(90deg,transparent,#d4af37,transparent)" }} />
      <span className="font-playfair text-[40px] md:text-6xl font-semibold block leading-none" style={{ color: "#a50059" }}>
        Lina <span className="italic font-normal text-shimmer">Valencia</span>
      </span>
      <p className="font-inter text-[11px] tracking-[0.35em] uppercase mt-3 font-light" style={{ color: "#b8912a" }}>
        Pastelería Artesanal
      </p>

      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
        {LINKS.map((l) => (
          <button key={l.href} onClick={() => scrollToId(l.href)} className="font-inter text-[13px] py-1" style={{ color: "rgba(165,0,89,0.65)" }}>
            {l.label}
          </button>
        ))}
      </nav>

      <div className="flex justify-center gap-3 mt-7">
        <a href={instagramUrl()} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
          className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(165,0,89,0.08)", color: "#a50059" }}>
          <Instagram size={18} />
        </a>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
          className="h-11 px-5 rounded-full flex items-center font-inter text-[12px] font-semibold tracking-wide" style={{ background: "#a50059", color: "#fdfaf5" }}>
          Hacer un pedido
        </a>
      </div>

      <p className="font-inter text-[11px] mt-10" style={{ color: "rgba(165,0,89,0.35)" }}>
        © {new Date().getFullYear()} Lina Valencia Pastelería. Todos los derechos reservados.
      </p>
    </footer>
  );
}
