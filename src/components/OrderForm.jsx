import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import ReceiptTemplate from "./ReceiptTemplate";
import { OPTION_KINDS } from "@/data/defaults";
import useScrollLock from "@/hooks/useScrollLock";
import { whatsappUrl } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1];


const inputStyle = {
  background: "var(--lv-cream-2)",
  color: "var(--lv-ink)",
};

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
    const waUrl = whatsappUrl(lines.join("\n"));
    setTimeout(() => window.open(waUrl, "_blank"), 400);
  };

  return (
    <>
      {/* Off-screen receipt template — always rendered for html2canvas */}
      <ReceiptTemplate id="receipt-template-node" data={receiptData} />

      <AnimatePresence>
        <motion.div
          data-scroll-lock
          className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto overscroll-contain"
          style={{ background: "rgba(43,0,23,0.45)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-t-[30px] sm:rounded-[30px] px-5 pt-3 pb-0 sm:px-8 sm:pt-8 max-h-[92dvh] overflow-y-auto overscroll-contain"
            style={{ background: "var(--lv-cream)", boxShadow: "0 -20px 60px rgba(92,0,50,0.18)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden className="sm:hidden mx-auto mb-4 w-10 h-1.5 rounded-full" style={{ background: "rgba(74,0,40,0.15)" }} />
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="btn-press absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}
            >
              <X size={17} />
            </button>

            {/* ── STEP: FORM ─────────────────────────────────────────────── */}
            {step === "form" && (
              <>
                <div className="pr-12">
                  <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>{product.name}</p>
                  <h3 className="font-display text-[30px] font-semibold leading-tight" style={{ color: "var(--lv-wine)" }}>
                    Personaliza tu pedido
                  </h3>
                </div>

                <div className="space-y-6 mt-6">
                  <Field label="Diseño">
                    <ChipGroup items={product.subcategories.map((s) => s.name)} value={sabor} onChange={setSabor} />
                  </Field>

                  {OPTION_KINDS.filter((k) => k.kind !== "extra" && options[k.kind]).map((k) => (
                    <Field key={k.kind} label={k.short}>
                      <ChipGroup items={[...options[k.kind].map((o) => o.name), "Por definir"]} value={picks[k.kind]}
                        onChange={(v) => setPicks((p) => ({ ...p, [k.kind]: v }))} />
                    </Field>
                  ))}

                  {options.extra && (
                    <Field label="Adicionales (puedes elegir varios)">
                      <ChipGroup multi items={options.extra.map((o) => o.name)} value={extras}
                        onChange={(name) => setExtras((x) => (x.includes(name) ? x.filter((n) => n !== name) : [...x, name]))} />
                    </Field>
                  )}

                  <Field label={portions.length ? "Tamaño" : "Cantidad de porciones"}>
                    {portions.length ? (
                      <ChipGroup items={portions.map((p) => `${p.label} · Ø ${p.diameter} cm · ${p.people}`)} value={porciones} onChange={setPorciones} />
                    ) : (
                      <input type="number" min="1" placeholder="Ej: 12" inputMode="numeric"
                        value={porciones} onChange={(e) => setPorciones(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none" style={inputStyle} />
                    )}
                  </Field>

                  <Field label="Fecha del evento">
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none"
                      style={{ ...inputStyle, colorScheme: "light" }} />
                  </Field>

                  <Field label="Mensaje o cambios especiales">
                    <textarea rows={3} placeholder="Ej: sin gluten, nombre en el topper, colores…"
                      value={detalles} onChange={(e) => setDetalles(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none resize-none" style={inputStyle} />
                  </Field>
                </div>

                <div className="sticky bottom-0 -mx-5 sm:-mx-8 mt-6 px-5 sm:px-8 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8" style={{ background: "var(--lv-cream)" }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-inter text-[14px]" style={{ color: "rgba(74,0,40,0.65)" }}>Precio de referencia</span>
                    <span className="font-display text-[24px] font-semibold" style={{ color: "var(--lv-wine)" }}>{subcategory?.price}</span>
                  </div>
                  <button
                    onClick={handleConfirm}
                    className="btn-press w-full flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
                    style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}
                  >
                    Generar mi recibo
                  </button>
                </div>
              </>
            )}

            {/* ── STEP: GENERATING ─────────────────────────────────────── */}
            {step === "generating" && (
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <Loader2 size={36} className="animate-spin" style={{ color: "var(--lv-gold)" }} />
                <p className="font-display text-[22px]" style={{ color: "var(--lv-wine)" }}>Imprimiendo tu recibo…</p>
              </div>
            )}

            {/* ── STEP: PREVIEW ────────────────────────────────────────── */}
            {step === "preview" && receiptImg && (
              <motion.div className="pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>Pedido {orderCode.current}</p>
                <h3 className="font-display text-[30px] font-semibold leading-tight pr-12" style={{ color: "var(--lv-wine)" }}>Tu recibo está listo</h3>

                {/* El recibo sale de la "impresora" */}
                <div className="mt-5 overflow-hidden rounded-[18px]" style={{ background: "var(--lv-cream-2)" }}>
                  <motion.img src={receiptImg} alt="Recibo de pedido" className="w-full"
                    initial={{ y: "-60%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE }} />
                </div>

                <p className="font-inter text-[15px] leading-relaxed mt-4" style={{ color: "var(--lv-ink)" }}>
                  Al tocar el botón se descarga la imagen y se abre WhatsApp. Solo adjúntala desde tu galería y envíala.
                </p>

                <button onClick={handleSend}
                  className="btn-press mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
                  style={{ background: "#25d366", color: "#fff" }}>
                  <Download size={17} /> Descargar y enviar por WhatsApp
                </button>
                <button onClick={() => setStep("form")} className="nav-link mx-auto block mt-4 font-inter text-[15px] font-medium" style={{ color: "var(--lv-wine)" }}>
                  Editar pedido
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
      <p className="font-display text-[19px] mb-2.5" style={{ color: "var(--lv-wine)" }}>{label}</p>
      {children}
    </div>
  );
}

// Opciones para tocar con el pulgar (una o varias)
function ChipGroup({ items, value, onChange, multi }) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
      {items.map((name) => {
        const on = multi ? value.includes(name) : value === name;
        return (
          <button key={name} type="button" role={multi ? "checkbox" : "radio"} aria-checked={on}
            onClick={() => onChange(name)}
            className="btn-press px-4 py-2.5 rounded-full font-inter text-[14px] text-left"
            style={{ background: on ? "var(--lv-wine)" : "var(--lv-cream-2)", color: on ? "var(--lv-cream)" : "var(--lv-ink)", transition: "background .25s, color .25s" }}>
            {name}
          </button>
        );
      })}
    </div>
  );
}
