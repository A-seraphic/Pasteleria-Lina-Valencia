import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, AlertCircle } from "lucide-react";
import ReceiptTemplate from "./ReceiptTemplate";
import useScrollLock from "@/hooks/useScrollLock";
import { whatsappUrl } from "@/data/site";
import { estimateTotal } from "@/data/catalogStore";
import { DEFAULT_RECEIPT, formatCOP } from "@/data/defaults";

const EASE = [0.22, 1, 0.36, 1];

const inputStyle = {
  background: "var(--lv-cream-2)",
  color: "var(--lv-ink)",
};

const NONE = "Por definir";

function generateOrderCode(prefix) {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#${prefix || "LV"}-${year}-${num}`;
}

// Fecha mínima del evento según los días de anticipación del producto (formato yyyy-mm-dd)
function minDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + (Number(days) || 0));
  return d.toISOString().slice(0, 10);
}

/**
 * Formulario de pedido. Todo lo que pregunta sale del panel:
 * - groups: especializaciones del producto [{ group, options }] (una o varias, obligatorias o no)
 * - portions: tamaños disponibles (con su valor extra)
 * - subcategory.customFields: preguntas propias del producto
 * - subcategory.leadDays / basePrice / receiptNote
 * - receipt: lo que imprime el recibo
 */
export default function OrderForm({ product, subcategory, groups = [], portions = [], receipt = DEFAULT_RECEIPT, onClose }) {
  useScrollLock(true);
  const [design, setDesign] = useState(subcategory?.name || "");
  const [sel, setSel] = useState(() =>
    Object.fromEntries(groups.map(({ group, options }) => [
      group.key,
      group.type === "multi" ? [] : group.required ? options[0]?.name || "" : NONE,
    ]))
  );
  const [portionId, setPortionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState("");
  const [errors, setErrors] = useState([]);

  const [step, setStep] = useState("form"); // "form" | "generating" | "preview"
  const [receiptImg, setReceiptImg] = useState(null);
  const orderCode = useRef(generateOrderCode(receipt.codePrefix));

  const fields = subcategory?.customFields || [];
  const leadDays = Number(subcategory?.leadDays) || 0;
  const earliest = minDate(leadDays);
  const portion = portions.find((p) => p.id === portionId);

  // Opciones elegidas (objetos con su precio) y filas del recibo por especialización
  const { chosen, rows } = useMemo(() => {
    const chosenAll = [];
    const groupRows = groups.map(({ group, options }) => {
      const names = [].concat(sel[group.key] || []).filter((n) => n && n !== NONE);
      const opts = options.filter((o) => names.includes(o.name));
      chosenAll.push(...opts);
      return {
        label: group.receipt || group.label,
        value: names.length ? names.join(", ") : group.type === "multi" ? "" : NONE,
        price: opts.reduce((t, o) => t + (Number(o.priceExtra) || 0), 0),
      };
    });
    if (portion) {
      groupRows.push({ label: "Tamaño", value: `${portion.label} · Ø ${portion.diameter} cm · ${portion.people}`, price: Number(portion.priceExtra) || 0 });
    }
    return { chosen: chosenAll, rows: groupRows.filter((r) => r.value) };
  }, [groups, sel, portion]);

  const total = estimateTotal(subcategory, portion, chosen);
  const answerRows = fields.map((f) => ({ label: f.label, value: (answers[f.label] || "").trim() })).filter((a) => a.value);

  const receiptData = {
    product, design, rows, answers: answerRows, fecha, detalles, total,
    note: subcategory?.receiptNote, orderCode: orderCode.current, receipt,
  };

  const toggle = (group, name) =>
    setSel((s) => {
      if (group.type !== "multi") return { ...s, [group.key]: name };
      const cur = s[group.key] || [];
      return { ...s, [group.key]: cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name] };
    });

  // Revisa lo obligatorio antes de imprimir el recibo
  const validate = () => {
    const missing = [];
    groups.forEach(({ group }) => {
      const v = sel[group.key];
      if (group.required && (Array.isArray(v) ? v.length === 0 : !v || v === NONE)) missing.push(group.label);
    });
    if (portions.length && !portion) missing.push("Tamaño");
    fields.forEach((f) => { if (f.required && !(answers[f.label] || "").trim()) missing.push(f.label); });
    if (fecha && fecha < earliest) missing.push(`Fecha (mínimo ${leadDays} días de anticipación)`);
    setErrors(missing);
    return missing.length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setStep("generating");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById("receipt-template-node");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fdfaf5", logging: false });
      setReceiptImg(canvas.toDataURL("image/png"));
      setStep("preview");
    } catch (err) {
      console.error("No se pudo generar el recibo", err);
      setStep("form");
    }
  };

  const handleSend = () => {
    const link = document.createElement("a");
    link.download = `recibo-${orderCode.current.replace("#", "")}.png`;
    link.href = receiptImg;
    link.click();

    const lines = [
      receipt.whatsappIntro,
      "",
      `*Pedido ${orderCode.current}*`,
      `📦 ${product.name} — ${design}`,
      ...rows.map((r) => `🍰 ${r.label}: ${r.value}${receipt.showPrices && r.price ? ` (+${formatCOP(r.price)})` : ""}`),
      ...answerRows.map((a) => `✏️ ${a.label}: ${a.value}`),
      ...(receipt.showEventDate ? [`📅 Evento: ${fecha || "Por definir"}`] : []),
      ...(receipt.showNotes && detalles ? [`📝 Notas: ${detalles}`] : []),
      ...(receipt.showTotal && total ? [`💰 Total estimado: ${formatCOP(total)}`] : [`💰 Precio de referencia: ${subcategory?.price}`]),
      "",
      "_(Adjunto la imagen del recibo desde mi galería)_",
    ];
    setTimeout(() => window.open(whatsappUrl(lines.join("\n")), "_blank"), 400);
  };

  return (
    <>
      {/* Recibo fuera de la vista: html2canvas lo convierte en imagen */}
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
            <button onClick={onClose} aria-label="Cerrar"
              className="btn-press absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
              <X size={17} />
            </button>

            {/* ── FORMULARIO ─────────────────────────────────────────────── */}
            {step === "form" && (
              <>
                <div className="pr-12">
                  <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>{product.name}</p>
                  <h3 className="font-display text-[30px] font-semibold leading-tight" style={{ color: "var(--lv-wine)" }}>
                    Personaliza tu pedido
                  </h3>
                  {leadDays > 0 && (
                    <p className="font-inter text-[14px] mt-1" style={{ color: "var(--lv-ink)" }}>
                      Pídela con al menos {leadDays} {leadDays === 1 ? "día" : "días"} de anticipación.
                    </p>
                  )}
                </div>

                <div className="space-y-6 mt-6">
                  {product.subcategories?.length > 1 && (
                    <Field label="Diseño">
                      <ChipGroup items={product.subcategories.map((s) => ({ name: s.name }))} value={design} onChange={setDesign} />
                    </Field>
                  )}

                  {groups.map(({ group, options }) => (
                    <Field key={group.key} label={group.label} hint={group.type === "multi" ? "Puedes elegir varios" : null} required={group.required}>
                      <ChipGroup
                        multi={group.type === "multi"}
                        items={[...options, ...(group.type !== "multi" && !group.required ? [{ name: NONE }] : [])]}
                        value={sel[group.key]}
                        onChange={(name) => toggle(group, name)}
                        showPrices={receipt.showPrices}
                      />
                    </Field>
                  ))}

                  {portions.length > 0 && (
                    <Field label="Tamaño" required>
                      <ChipGroup
                        items={portions.map((p) => ({ name: `${p.label} · Ø ${p.diameter} cm · ${p.people}`, priceExtra: p.priceExtra, id: p.id }))}
                        value={portion ? `${portion.label} · Ø ${portion.diameter} cm · ${portion.people}` : ""}
                        onChange={(name) => setPortionId(portions.find((p) => `${p.label} · Ø ${p.diameter} cm · ${p.people}` === name)?.id ?? null)}
                        showPrices={receipt.showPrices}
                      />
                    </Field>
                  )}

                  {fields.map((f) => (
                    <Field key={f.label} label={f.label} required={f.required}>
                      <input type="text" placeholder={f.placeholder || ""} value={answers[f.label] || ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.label]: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none" style={inputStyle} />
                    </Field>
                  ))}

                  {receipt.showEventDate && (
                    <Field label="Fecha del evento">
                      <input type="date" value={fecha} min={earliest} onChange={(e) => setFecha(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none"
                        style={{ ...inputStyle, colorScheme: "light" }} />
                    </Field>
                  )}

                  {receipt.showNotes && (
                    <Field label="Mensaje o cambios especiales">
                      <textarea rows={3} placeholder="Ej: sin gluten, colores, alergias…"
                        value={detalles} onChange={(e) => setDetalles(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none resize-none" style={inputStyle} />
                    </Field>
                  )}
                </div>

                <div className="sticky bottom-0 -mx-5 sm:-mx-8 mt-6 px-5 sm:px-8 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8" style={{ background: "var(--lv-cream)" }}>
                  <AnimatePresence>
                    {errors.length > 0 && (
                      <motion.div className="flex gap-2 rounded-2xl px-4 py-3 mb-3 font-inter text-[14px]" style={{ background: "#fdecea", color: "#8c1d18" }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>Falta completar: {errors.join(", ")}.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-inter text-[14px]" style={{ color: "rgba(74,0,40,0.65)" }}>
                      {receipt.showTotal && total ? "Total estimado" : "Precio de referencia"}
                    </span>
                    <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-[26px] font-semibold" style={{ color: "var(--lv-wine)" }}>
                      {receipt.showTotal && total ? formatCOP(total) : subcategory?.price}
                    </motion.span>
                  </div>
                  <button onClick={handleConfirm}
                    className="btn-press w-full flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
                    style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                    Generar mi recibo
                  </button>
                </div>
              </>
            )}

            {/* ── IMPRIMIENDO ─────────────────────────────────────────────── */}
            {step === "generating" && (
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <Loader2 size={36} className="animate-spin" style={{ color: "var(--lv-gold)" }} />
                <p className="font-display text-[22px]" style={{ color: "var(--lv-wine)" }}>Imprimiendo tu recibo…</p>
              </div>
            )}

            {/* ── RECIBO LISTO ────────────────────────────────────────────── */}
            {step === "preview" && receiptImg && (
              <motion.div className="pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>Pedido {orderCode.current}</p>
                <h3 className="font-display text-[30px] font-semibold leading-tight pr-12" style={{ color: "var(--lv-wine)" }}>Tu recibo está listo</h3>
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

function Field({ label, hint, required, children }) {
  return (
    <div>
      <p className="font-display text-[19px] mb-2.5" style={{ color: "var(--lv-wine)" }}>
        {label}
        {required && <span style={{ color: "var(--lv-fuchsia)" }}> *</span>}
        {hint && <span className="font-inter text-[13px] ml-2" style={{ color: "rgba(74,0,40,0.55)" }}>{hint}</span>}
      </p>
      {children}
    </div>
  );
}

// Opciones para tocar con el pulgar (una o varias), con su valor extra si lo tienen
function ChipGroup({ items, value, onChange, multi, showPrices }) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
      {items.map((item) => {
        const on = multi ? (value || []).includes(item.name) : value === item.name;
        return (
          <button key={item.id ?? item.name} type="button" role={multi ? "checkbox" : "radio"} aria-checked={on}
            title={item.description || undefined}
            onClick={() => onChange(item.name)}
            className="btn-press px-4 py-2.5 rounded-full font-inter text-[14px] text-left"
            style={{ background: on ? "var(--lv-wine)" : "var(--lv-cream-2)", color: on ? "var(--lv-cream)" : "var(--lv-ink)", transition: "background .25s, color .25s" }}>
            {item.name}
            {showPrices && Number(item.priceExtra) > 0 && (
              <span className="ml-1.5 text-[12.5px] font-semibold" style={{ color: on ? "var(--lv-gold-soft)" : "#8a6a1f" }}>
                +{formatCOP(item.priceExtra)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
