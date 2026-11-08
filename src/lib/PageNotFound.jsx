import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { whatsappUrl } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1];

// Página no encontrada, con la marca
export default function PageNotFound() {
  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center text-center px-6 font-inter" style={{ background: "var(--lv-rose-soft)" }}>
      <motion.img src="/brand/logo.webp" alt="Lina Valencia Pastelería" className="w-[min(70vw,320px)]"
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: EASE }} />
      <motion.h1 className="font-script text-[52px] md:text-[64px] mt-4" style={{ color: "var(--lv-fuchsia)" }}
        initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.3, delay: 0.3 }}>
        Esta página se la comieron
      </motion.h1>
      <p className="text-[17px] mt-2 max-w-[36ch]" style={{ color: "var(--lv-ink)" }}>
        No encontramos lo que buscabas, pero el catálogo completo te espera.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-7">
        <Link to="/" className="btn-press px-7 py-4 rounded-full text-[15px] font-semibold" style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
          Ir al inicio
        </Link>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-press px-6 py-4 rounded-full text-[15px] font-semibold"
          style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
          Escribir a Lina
        </a>
      </div>
    </main>
  );
}
