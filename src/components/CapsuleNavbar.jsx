import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Esencia", href: "#esencia" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Porciones", href: "#porciones" },
  { label: "Contacto", href: "#contacto" },
];

export default function CapsuleNavbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [visible, setVisible]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y < 80) { setVisible(true); }
      else if (y > lastY.current + 6) { setVisible(false); } // scrolling down
      else if (y < lastY.current - 4) { setVisible(true);  } // scrolling up
      lastY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY;
    if (window.smoothScrollTo) {
      window.smoothScrollTo(y);
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full border border-white/30"
        style={{
          background: scrolled
            ? "rgba(253, 250, 245, 0.75)"
            : "rgba(253, 250, 245, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(165, 0, 89, 0.06), 0 1px 4px rgba(212, 175, 55, 0.08)"
            : "0 4px 20px rgba(165, 0, 89, 0.04)",
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -96, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo pill — left anchor */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full mr-1 flex-shrink-0"
          style={{ background: "rgba(165, 0, 89, 0.08)" }}
        >
          <span className="font-playfair text-base font-semibold" style={{ color: "#a50059" }}>
            LV
          </span>
        </div>

        {/* Desktop links — perfectly centered */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="px-4 py-2 rounded-full font-inter text-sm font-medium transition-all duration-300 hover:scale-[1.03]"
              style={{ color: "#a50059" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA — right anchor */}
        <button
          onClick={() => handleNav("#contacto")}
          className="hidden md:block px-5 py-2 rounded-full font-inter text-xs font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-[1.04] hover:shadow-lg flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #d4af37, #c49b2f)",
            color: "#fdfaf5",
          }}
        >
          Pedir Ahora
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-full"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: "#a50059" }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{
              background: "rgba(253, 250, 245, 0.95)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="font-playfair text-3xl font-medium"
                  style={{ color: "#a50059" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                onClick={() => handleNav("#contacto")}
                className="mt-4 px-8 py-3 rounded-full font-inter text-sm font-semibold tracking-wide uppercase"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #c49b2f)",
                  color: "#fdfaf5",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Pedir Ahora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}