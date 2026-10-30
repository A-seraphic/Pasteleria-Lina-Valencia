const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { motion } from "framer-motion";

const HERO_IMG = "https://media.db.com/images/public/69f9758f7d1c8f8af9a6884c/b8c1349ab_generated_82178631.png";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 px-6"
    >
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <motion.div
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 3 }}
        >
          <motion.span
            className="font-inter text-xs tracking-[0.4em] uppercase font-medium mb-4"
            style={{ color: "#d4af37" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3.3 }}
          >
            Pastelería de Autor
          </motion.span>

          <h1
            className="font-playfair text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-6"
            style={{ color: "#a50059" }}
          >
            Donde cada
            <br />
            <span className="italic font-normal" style={{ color: "#d4af37" }}>
              bocado
            </span>{" "}
            cuenta
            <br />
            una historia
          </h1>

          <p
            className="font-inter text-base md:text-lg font-light leading-relaxed max-w-md mb-8"
            style={{ color: "rgba(165, 0, 89, 0.6)" }}
          >
            Creaciones artesanales que fusionan tradición y elegancia.
            Cada postre es una obra de arte hecha con amor.
          </p>

          <div className="flex gap-4">
            <a
              href="#catalogo"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#catalogo");
                if (!el) return;
                const y = el.getBoundingClientRect().top + window.scrollY;
                window.smoothScrollTo ? window.smoothScrollTo(y) : el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full font-inter text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:scale-[1.04] hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #d4af37, #c49b2f)",
                color: "#fdfaf5",
              }}
            >
              Explorar
            </a>
            <a
              href="#esencia"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#esencia");
                if (!el) return;
                const y = el.getBoundingClientRect().top + window.scrollY;
                window.smoothScrollTo ? window.smoothScrollTo(y) : el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full font-inter text-sm font-medium tracking-wide transition-all duration-500 hover:scale-[1.03] border"
              style={{
                borderColor: "rgba(212, 175, 55, 0.3)",
                color: "#a50059",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Nuestra Esencia
            </a>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          className="relative flex justify-center"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 3.2 }}
        >
          <div
            className="relative w-80 h-96 md:w-96 md:h-[28rem] rounded-[2.5rem] overflow-hidden"
            style={{
              boxShadow:
                "0 30px 60px rgba(165, 0, 89, 0.1), 0 10px 20px rgba(212, 175, 55, 0.06)",
            }}
          >
            <img
              src={HERO_IMG}
              alt="Pastel artesanal de lujo decorado con flores de azúcar"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(253, 250, 245, 0.3))",
              }}
            />
          </div>
          {/* Gold decorative ring */}
          <div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2"
            style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full"
            style={{ background: "rgba(212, 175, 55, 0.08)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}