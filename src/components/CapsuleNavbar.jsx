import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram } from "lucide-react";
import { scrollToId, whatsappUrl, instagramUrl, SITE } from "@/data/site";
import useScrollLock from "@/hooks/useScrollLock";
import { useCart } from "@/data/cart";

const EASE = [0.22, 1, 0.36, 1];

const navLinks = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Personalizadas", href: "#personalizadas" },
  { label: "Porciones", href: "#porciones" },
  { label: "Cómo pedir", href: "#como-pedir" },
  { label: "Nosotros", href: "#nosotros" },
];

function MobileMenu({ onNav, onClose }) {
  useScrollLock(true);
  return (
    <motion.div
      className="fixed inset-0 z-[55] flex flex-col px-6 pt-24 pb-[max(env(safe-area-inset-bottom),24px)]"
      style={{ background: "var(--lv-wine-deep)" }}
      initial={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 40px) 36px)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <nav className="flex flex-col gap-1">
        {navLinks.map((link, i) => (
          <motion.button
            key={link.href}
            onClick={() => onNav(link.href)}
            className="font-display text-left text-[44px] leading-[1.15] font-medium"
            style={{ color: "var(--lv-cream)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
          >
            {link.label}
          </motion.button>
        ))}
      </nav>
      <motion.div className="mt-auto space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" onClick={onClose}
          className="flex items-center justify-center w-full py-4 rounded-full font-inter text-[15px] font-semibold"
          style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>
          Pedir por WhatsApp
        </a>
        <a href={instagramUrl()} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 font-inter text-[15px]" style={{ color: "var(--lv-gold-soft)" }}>
          <Instagram size={17} /> @{String(SITE.instagram).replace(/^@/, "")}
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function CapsuleNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 160 && y > lastY.current + 4 ? true : y < lastY.current - 4 ? false : (h) => h);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href) => {
    setOpen(false);
    setTimeout(() => scrollToId(href), open ? 350 : 0);
  };

  const solid = scrolled && !open;
  const cart = useCart();

  return (
    <>
      <motion.header
        className="fixed top-0 inset-x-0 z-[60]"
        animate={{ y: hidden && !open ? -90 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{
          background: solid ? "rgba(253,250,245,0.97)" : "transparent",
          backdropFilter: solid ? "blur(12px)" : "none",
          WebkitBackdropFilter: solid ? "blur(12px)" : "none",
          boxShadow: solid ? "0 6px 24px rgba(92,0,50,0.06)" : "none",
          transition: "background .35s ease, box-shadow .35s ease",
        }}
      >
        <div className="max-w-[1400px] mx-auto h-16 md:h-[76px] px-5 md:px-10 flex items-center justify-between gap-6">
          <button onClick={() => (open ? setOpen(false) : scrollToId("#inicio"))} aria-label="Lina Valencia, inicio"
            className="font-script text-[32px] md:text-[38px] leading-none pt-1"
            style={{
              color: open ? "var(--lv-cream)" : "var(--lv-fuchsia)",
              // arriba del todo ya se ve el logo grande del inicio
              opacity: scrolled || open ? 1 : 0,
              transition: "color .3s, opacity .4s",
            }}>
            Lina Valencia
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNav(link.href)}
                className="nav-link font-inter text-[15px] font-medium" style={{ color: "var(--lv-ink)" }}>
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {cart.count > 0 ? (
              <button onClick={() => cart.setOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-inter text-[14px] font-semibold btn-press"
                style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                Mi pedido
                <span className="min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[12px]" style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>{cart.count}</span>
              </button>
            ) : (
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full font-inter text-[14px] font-semibold btn-press"
                style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                Pedir
              </a>
            )}
            <button
              className="lg:hidden relative w-11 h-11 rounded-full flex items-center justify-center"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              style={{ background: open ? "rgba(253,250,245,0.12)" : "var(--lv-cream-2)" }}
            >
              <span className="absolute w-[18px] h-[2px] rounded transition-all duration-300"
                style={{ background: open ? "var(--lv-cream)" : "var(--lv-wine)", transform: open ? "rotate(45deg)" : "translateY(-4px)" }} />
              <span className="absolute w-[18px] h-[2px] rounded transition-all duration-300"
                style={{ background: open ? "var(--lv-cream)" : "var(--lv-wine)", transform: open ? "rotate(-45deg)" : "translateY(4px)" }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open && <MobileMenu onNav={handleNav} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
