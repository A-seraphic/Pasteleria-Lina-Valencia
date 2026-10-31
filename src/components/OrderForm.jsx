import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import ReceiptTemplate from "./ReceiptTemplate";
import { OPTION_KINDS } from "@/data/defaults";
import useScrollLock from "@/hooks/useScrollLock";

const EASE = [0.22, 1, 0.36, 1];

const WHATSAPP = "573001234567";

const inputStyle = {
  background: "rgba(253,250,245,0.7)",
  border: "1px solid rgba(212,175,55,0.2)",
  color: "#a50059",
};
const focusBorder = "rgba(212,175,55,0.55)";
const blurBorder  = "rgba(212,175,55,0.2)";

function generateOrderCode() {
  const year = new Date().getFullYear();
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `#LV-${year}-${num}`;
}

export default function OrderForm({ product, subcategory, options = {}, portions = [], onClose }) {
  useScrollLock(true);
  const [porciones,  setPorciones]  = useState("");
  const [sabor,      setSabor]      = useState(subcategory?.name || "");
  // Una opción por tipo (bizcocho, relleno, cobertura); los adicionales pueden ser varios
  const [picks,      setPicks]      = useState(() =>
    Object.fromEntries(Object.entries(options).filter(([k]) => k !== "extra").map(([k, list]) => [k, list[0]?.name || ""]))
  );
  const [extras,     setExtras]     = useState([]);
  const [fecha,      setFecha]      = useState("");
  const [detalles,   setDetalles]   = useState("");

  const [step,       setStep]       = useState("form"); // "form" | "generating" | "preview"
  const [receiptImg, setReceiptImg] = useState(null);
  const orderCode = useRef(generateOrderCode());

  const choices = [
    ...OPTION_KINDS.filter((k) => picks[k.kind]).map((k) => ({ label: k.short, value: picks[k.kind] })),
    ...(extras.length ? [{ label: "Adicionales", value: extras.join(", ") }] : []),
  ];
  const receiptData = { product, subcategory, sabor, choices, porciones, fecha, detalles, orderCode: orderCode.current };

  // ── Generate receipt image ────────────────────────────────────────────────
  const handleConfirm = async () => {
    setStep("generating");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById("receipt-template-node");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fdfaf5",
        logging: false,
      });
      setReceiptImg(canvas.toDataURL("image/png"));
      setStep("preview");
    } catch (err) {
      console.error("Receipt generation failed", err);
      setStep("form");
    }
  };

  // ── Download + open WhatsApp ──────────────────────────────────────────────
  const handleSend = () => {
    // 1. Download image
    const link = document.createElement("a");
    link.download = `recibo-${orderCode.current}.png`;
    link.href = receiptImg;
    link.click();

    // 2. Build WhatsApp text
    const lines = [
      `¡Hola Lina! 🎂 Te comparto el recibo de mi pedido que acabo de generar en la web.`,
      ``,
      `*Pedido ${orderCode.current}*`,
      `📦 Producto: ${product.name} — ${sabor || subcategory?.name}`,
      ...choices.map((c) => `🍰 ${c.label}: ${c.value}`),
      `👥 Porciones: ${porciones || "No especificado"}`,
      `📅 Evento: ${fecha || "No especificada"}`,
      `✏️ Notas: ${detalles || "Sin notas"}`,
      `💰 Precio ref.: ${subcategory?.price}`,
      ``,
      `_(Adjunto la imagen del recibo desde mi galería)_`,
    ];
    const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
    setTimeout(() => window.open(waUrl, "_blank"), 400);
  };

  return (
    <>
      {/* Off-screen receipt template — always rendered for html2canvas */}
      <ReceiptTemplate id="receipt-template-node" data={receiptData} />

      <AnimatePresence>
        <motion.div
          data-scroll-lock
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          style={{ background: "rgba(165,0,89,0.08)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 my-4"
            style={{
              background: "rgba(253,250,245,0.92)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 32px 80px rgba(165,0,89,0.14), 0 8px 24px rgba(212,175,55,0.08)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ background: "rgba(165,0,89,0.07)", color: "#a50059" }}
            >
              <X size={15} />
            </button>

            {/* ── STEP: FORM ─────────────────────────────────────────────── */}
            {step === "form" && (
              <>
                <div className="mb-5">
                  <span className="font-inter text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#d4af37" }}>
                    Personalizar pedido
                  </span>
                  <h3 className="font-playfair text-2xl font-semibold mt-1" style={{ color: "#a50059" }}>
                    {product.name}
                  </h3>
                  <p className="font-inter text-sm font-light italic mt-0.5" style={{ color: "#d4af37" }}>
                    {subcategory?.name}
                  </p>
                </div>
                <div className="h-[1px] w-10 mb-5" style={{ background: "#d4af37" }} />

                <div className="space-y-4">
                  <Field label="Variedad / Sabor del postre">
                    <select value={sabor} onChange={(e) => setSabor(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none appearance-none" style={inputStyle}>
                      {product.subcategories.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </Field>

                  {OPTION_KINDS.filter((k) => k.kind !== "extra" && options[k.kind]).map((k) => (
                    <Field key={k.kind} label={k.short}>
                      <select value={picks[k.kind]} onChange={(e) => setPicks((p) => ({ ...p, [k.kind]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none appearance-none" style={inputStyle}>
                        {options[k.kind].map((o) => (
                          <option key={o.id} value={o.name}>{o.name}</option>
                        ))}
                        <option value="Por definir">Por definir / Consultar</option>
                      </select>
                    </Field>
                  ))}

                  {options.extra && (
                    <Field label="Adicionales">
                      <div className="flex flex-wrap gap-2">
                        {options.extra.map((o) => {
                          const on = extras.includes(o.name);
                          return (
                            <button key={o.id} type="button"
                              onClick={() => setExtras((x) => (on ? x.filter((n) => n !== o.name) : [...x, o.name]))}
                              className="px-3 py-2 rounded-full font-inter text-xs transition-colors"
                              style={{ background: on ? "#a50059" : "rgba(253,250,245,0.7)", color: on ? "#fdfaf5" : "#a50059", border: "1px solid rgba(212,175,55,0.25)" }}>
                              {on ? "✓ " : "+ "}{o.name}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  )}

                  <Field label={portions.length ? "Tamaño" : "Cantidad de porciones"}>
                    {portions.length ? (
                      <select value={porciones} onChange={(e) => setPorciones(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none appearance-none" style={inputStyle}>
                        <option value="">Elige un tamaño</option>
                        {portions.map((p) => {
                          const text = `${p.label} · Ø ${p.diameter} cm · ${p.people}`;
                          return <option key={p.id} value={text}>{text}</option>;
                        })}
                      </select>
                    ) : (
                      <input type="number" min="1" placeholder="Ej: 12"
                        value={porciones} onChange={(e) => setPorciones(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none" style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                        onBlur={(e) => (e.target.style.borderColor = blurBorder)} />
                    )}
                  </Field>

                  <Field label="Fecha del evento">
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none"
                      style={{ ...inputStyle, colorScheme: "light" }}
                      onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                      onBlur={(e) => (e.target.style.borderColor = blurBorder)} />
                  </Field>

                  <Field label="Descripción / Cambios especiales">
                    <textarea rows={3} placeholder="Ej: Sin gluten, mensaje personalizado, color específico..."
                      value={detalles} onChange={(e) => setDetalles(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl font-inter text-base sm:text-sm outline-none resize-none" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = focusBorder)}
                      onBlur={(e) => (e.target.style.borderColor = blurBorder)} />
                  </Field>
                </div>

                <div className="mt-5 px-4 py-3 rounded-2xl flex items-center justify-between"
                  style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.12)" }}>
                  <span className="font-inter text-[10px] tracking-[0.15em] uppercase" style={{ color: "rgba(165,0,89,0.4)" }}>
                    Precio referencia
                  </span>
                  <span className="font-playfair text-lg font-semibold" style={{ color: "#d4af37" }}>
                    {subcategory?.price}
                  </span>
                </div>

                <button
                  onClick={handleConfirm}
                  className="mt-6 w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-inter text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #a50059, #8a004c)", color: "#fdfaf5" }}
                >
                  Generar Recibo del Pedido ✨
                </button>
              </>
            )}

            {/* ── STEP: GENERATING ─────────────────────────────────────── */}
            {step === "generating" && (
              <div className="flex flex-col items-center justify-center py-16 gap-5">
                <Loader2 size={36} className="animate-spin" style={{ color: "#d4af37" }} />
                <p className="font-inter text-sm font-light" style={{ color: "rgba(165,0,89,0.6)" }}>
                  Generando tu recibo…
                </p>
              </div>
            )}

            {/* ── STEP: PREVIEW ────────────────────────────────────────── */}
            {step === "preview" && receiptImg && (
              <motion.div
                className="flex flex-col items-center gap-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="text-center mb-1">
                  <span className="font-inter text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#d4af37" }}>
                    Tu recibo está listo
                  </span>
                  <h3 className="font-playfair text-xl font-semibold mt-1" style={{ color: "#a50059" }}>
                    {orderCode.current}
                  </h3>
                </div>

                {/* Receipt preview */}
                <div className="w-full rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 12px 40px rgba(165,0,89,0.1)" }}>
                  <img src={receiptImg} alt="Recibo de pedido" className="w-full" />
                </div>

                <p className="font-inter text-[10px] text-center leading-relaxed" style={{ color: "rgba(165,0,89,0.45)" }}>
                  Al confirmar, la imagen se descargará automáticamente.
                  Luego solo adjúntala en WhatsApp desde tu galería.
                </p>

                <button
                  onClick={handleSend}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-inter text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #25d366, #1da851)", color: "#fff" }}
                >
                  <Download size={16} />
                  Descargar y enviar por WhatsApp
                </button>

                <button
                  onClick={() => setStep("form")}
                  className="font-inter text-[11px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70"
                  style={{ color: "rgba(165,0,89,0.4)" }}
                >
                  ← Editar pedido
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium block mb-1.5"
        style={{ color: "rgba(165,0,89,0.5)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}