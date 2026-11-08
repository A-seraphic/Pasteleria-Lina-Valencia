import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import ReceiptTemplate from "./ReceiptTemplate";
import useScrollLock from "@/hooks/useScrollLock";
import { useCart } from "@/data/cart";
import { usePublicCatalog } from "@/data/catalogStore";
import { whatsappUrl, scrollToId } from "@/data/site";
import { formatCOP } from "@/data/defaults";

const EASE = [0.22, 1, 0.36, 1];
const inputStyle = { background: "var(--lv-cream-2)", color: "var(--lv-ink)" };

function generateOrderCode(prefix) {
  return `#${prefix || "LV"}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function minDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + (Number(days) || 0));
  return d.toISOString().slice(0, 10);
}

function Sheet({ onClose }) {
  useScrollLock(true);
  const cart = useCart();
  const { receipt } = usePublicCatalog();
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("cart"); // cart | generating | preview | sent
  const [receiptImg, setReceiptImg] = useState(null);
  const orderCode = useRef(generateOrderCode(receipt.codePrefix));
  const earliest = minDate(cart.leadDays);

  const data = { items: cart.items, fecha, detalles, total: cart.total, orderCode: orderCode.current, receipt };

  const generate = async () => {
    if (!cart.count) return;
    if (receipt.showEventDate && fecha && fecha < earliest) {
      setError(`La fecha del evento debe ser desde el ${earliest} (${cart.leadDays} días de anticipación).`);
      return;
    }
    setError("");
    setStep("generating");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(document.getElementById("receipt-template-node"), { scale: 2, useCORS: true, backgroundColor: "#fdfaf5", logging: false });
      setReceiptImg(canvas.toDataURL("image/png"));
      setStep("preview");
    } catch (err) {
      console.error("No se pudo generar el recibo", err);
      setError("No se pudo generar el recibo. Inténtalo de nuevo.");
      setStep("cart");
    }
  };

  const send = () => {
    const link = document.createElement("a");
    link.download = `recibo-${orderCode.current.replace("#", "")}.png`;
    link.href = receiptImg;
    link.click();

    const lines = [receipt.whatsappIntro, "", `*Pedido ${orderCode.current}*`];
    cart.items.forEach((item, n) => {
      lines.push("", `*${cart.count > 1 ? `${n + 1}. ` : ""}${item.design}* (${item.category})`);
      item.rows.forEach((r) => lines.push(`🍰 ${r.label}: ${r.value}${receipt.showPrices && r.price ? ` (+${formatCOP(r.price)})` : ""}`));
      item.answers.forEach((a) => lines.push(`✏️ ${a.label}: ${a.value}`));
      lines.push(`💰 ${receipt.showTotal && item.total ? formatCOP(item.total) : item.priceText || "Precio por confirmar"}`);
    });
    lines.push("");
    if (receipt.showEventDate) lines.push(`📅 Evento: ${fecha || "Por definir"}`);
    if (receipt.showNotes && detalles) lines.push(`📝 Notas: ${detalles}`);
    if (receipt.showTotal && cart.total) lines.push(`💰 *Total estimado: ${formatCOP(cart.total)}*`);
    lines.push("", "_(Adjunto la imagen del recibo desde mi galería)_");
    setTimeout(() => window.open(whatsappUrl(lines.join("\n")), "_blank"), 400);
    setStep("sent");
  };

  const keepBrowsing = () => {
    onClose();
    if (!document.querySelector("[data-scroll-lock].fixed")) setTimeout(() => scrollToId("#catalogo"), 350);
  };

  return (
    <>
      <ReceiptTemplate id="receipt-template-node" data={data} />
      <motion.div data-scroll-lock className="fixed inset-0 z-[88] flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: "rgba(43,0,23,0.45)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          role="dialog" aria-modal="true" aria-label="Mi pedido"
          className="relative w-full max-w-lg rounded-t-[30px] sm:rounded-[30px] px-5 pt-3 sm:px-8 sm:pt-8 max-h-[92dvh] overflow-y-auto overscroll-contain"
          style={{ background: "var(--lv-cream)", boxShadow: "0 -20px 60px rgba(92,0,50,0.18)" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.55, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          <div aria-hidden className="sm:hidden mx-auto mb-4 w-10 h-1.5 rounded-full" style={{ background: "rgba(74,0,40,0.15)" }} />
          <button onClick={onClose} aria-label="Cerrar" className="btn-press absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
            <X size={17} />
          </button>

          {step === "cart" && (
            <>
              <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>{cart.count} {cart.count === 1 ? "producto" : "productos"}</p>
              <h3 className="font-display text-[30px] font-semibold leading-tight pr-12" style={{ color: "var(--lv-wine)" }}>Mi pedido</h3>

              {cart.count === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={34} className="mx-auto" style={{ color: "var(--lv-gold)" }} />
                  <p className="font-inter text-[16px] mt-3" style={{ color: "var(--lv-ink)" }}>Aún no has agregado productos.</p>
                  <button onClick={keepBrowsing} className="btn-press mt-5 px-7 py-3.5 rounded-full font-inter text-[15px] font-semibold"
                    style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>Ver el catálogo</button>
                </div>
              ) : (
                <>
                  <ul className="mt-5 space-y-3">
                    <AnimatePresence initial={false}>
                      {cart.items.map((item) => (
                        <motion.li key={item.uid} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
                          className="flex gap-3 rounded-[22px] p-3" style={{ background: "#fff" }}>
                          {item.img && <img src={item.img} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-[12.5px]" style={{ color: "#8a6a1f" }}>{item.category}</p>
                            <p className="font-display text-[18px] font-semibold leading-tight" style={{ color: "var(--lv-wine)" }}>{item.design}</p>
                            <p className="font-inter text-[13px] mt-1 leading-snug" style={{ color: "rgba(74,0,40,0.7)" }}>
                              {[...item.rows, ...item.answers].map((r) => r.value).filter(Boolean).join(" · ")}
                            </p>
                            <p className="font-inter text-[14px] font-semibold mt-1.5" style={{ color: "var(--lv-wine)" }}>
                              {receipt.showTotal && item.total ? formatCOP(item.total) : item.priceText}
                            </p>
                          </div>
                          <button onClick={() => cart.remove(item.uid)} aria-label={`Quitar ${item.design}`}
                            className="btn-press w-10 h-10 shrink-0 rounded-full flex items-center justify-center" style={{ background: "rgba(179,38,30,0.07)", color: "#b3261e" }}>
                            <Trash2 size={16} />
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <button onClick={keepBrowsing} className="nav-link mt-4 font-inter text-[15px] font-medium" style={{ color: "var(--lv-wine)" }}>
                    + Agregar otro producto
                  </button>

                  <div className="space-y-5 mt-6">
                    {receipt.showEventDate && (
                      <div>
                        <p className="font-display text-[19px] mb-2.5" style={{ color: "var(--lv-wine)" }}>Fecha del evento</p>
                        <input type="date" value={fecha} min={earliest} onChange={(e) => setFecha(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none" style={{ ...inputStyle, colorScheme: "light" }} />
                        {cart.leadDays > 0 && (
                          <p className="font-inter text-[13px] mt-1.5" style={{ color: "rgba(74,0,40,0.6)" }}>
                            Tu pedido necesita {cart.leadDays} {cart.leadDays === 1 ? "día" : "días"} de anticipación.
                          </p>
                        )}
                      </div>
                    )}
                    {receipt.showNotes && (
                      <div>
                        <p className="font-display text-[19px] mb-2.5" style={{ color: "var(--lv-wine)" }}>Notas para Lina</p>
                        <textarea rows={3} placeholder="Ej: alergias, hora de entrega, dirección…" value={detalles} onChange={(e) => setDetalles(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl font-inter text-base outline-none resize-none" style={inputStyle} />
                      </div>
                    )}
                  </div>

                  <div className="sticky bottom-0 -mx-5 sm:-mx-8 mt-6 px-5 sm:px-8 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8" style={{ background: "var(--lv-cream)" }}>
                    {error && (
                      <p className="flex gap-2 rounded-2xl px-4 py-3 mb-3 font-inter text-[14px]" style={{ background: "#fdecea", color: "#8c1d18" }}>
                        <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
                      </p>
                    )}
                    {receipt.showTotal && cart.total > 0 && (
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="font-inter text-[14px]" style={{ color: "rgba(74,0,40,0.65)" }}>Total estimado</span>
                        <motion.span key={cart.total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-[26px] font-semibold" style={{ color: "var(--lv-wine)" }}>
                          {formatCOP(cart.total)}
                        </motion.span>
                      </div>
                    )}
                    <button onClick={generate} className="btn-press w-full py-4 rounded-full font-inter text-[15px] font-semibold" style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                      Generar mi recibo
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <Loader2 size={36} className="animate-spin" style={{ color: "var(--lv-gold)" }} />
              <p className="font-display text-[22px]" style={{ color: "var(--lv-wine)" }}>Imprimiendo tu recibo…</p>
            </div>
          )}

          {(step === "preview" || step === "sent") && receiptImg && (
            <motion.div className="pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <p className="font-inter text-[14px]" style={{ color: "#8a6a1f" }}>Pedido {orderCode.current}</p>
              <h3 className="font-display text-[30px] font-semibold leading-tight pr-12" style={{ color: "var(--lv-wine)" }}>
                {step === "sent" ? "¡Listo! Envía tu recibo" : "Tu recibo está listo"}
              </h3>
              <div className="mt-5 overflow-hidden rounded-[18px]" style={{ background: "var(--lv-cream-2)" }}>
                <motion.img src={receiptImg} alt="Recibo de pedido" className="w-full" initial={{ y: "-50%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE }} />
              </div>
              <p className="font-inter text-[15px] leading-relaxed mt-4" style={{ color: "var(--lv-ink)" }}>
                {step === "sent"
                  ? "Se descargó la imagen y se abrió WhatsApp. Adjunta el recibo desde tu galería y envíalo para confirmar."
                  : "Al tocar el botón se descarga la imagen y se abre WhatsApp. Solo adjúntala desde tu galería y envíala."}
              </p>
              <button onClick={send} className="btn-press mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "#25d366", color: "#fff" }}>
                <Download size={17} /> {step === "sent" ? "Enviar de nuevo" : "Descargar y enviar por WhatsApp"}
              </button>
              {step === "sent" ? (
                <button onClick={() => { cart.clear(); onClose(); }} className="btn-press mt-3 w-full py-3.5 rounded-full font-inter text-[15px] font-semibold"
                  style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
                  Terminar y vaciar mi pedido
                </button>
              ) : (
                <button onClick={() => setStep("cart")} className="nav-link mx-auto block mt-4 font-inter text-[15px] font-medium" style={{ color: "var(--lv-wine)" }}>
                  Editar pedido
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

// Hoja de "Mi pedido" (global: se abre desde la barra, la ficha o al agregar un producto)
export default function CheckoutSheet() {
  const cart = useCart();
  return createPortal(
    <AnimatePresence>{cart.open && <Sheet key="checkout" onClose={() => cart.setOpen(false)} />}</AnimatePresence>,
    document.body
  );
}

// Botón flotante con la cantidad de productos del pedido
export function CartButton() {
  const cart = useCart();
  return (
    <AnimatePresence>
      {cart.count > 0 && (
        <motion.button
          onClick={() => cart.setOpen(true)}
          aria-label={`Mi pedido, ${cart.count} productos`}
          className="fixed z-20 left-4 bottom-[max(env(safe-area-inset-bottom),16px)] md:left-8 md:bottom-8 h-14 pl-4 pr-5 rounded-full flex items-center gap-2 font-inter text-[15px] font-semibold"
          style={{ background: "var(--lv-wine)", color: "var(--lv-cream)", boxShadow: "0 14px 30px rgba(92,0,50,0.35)" }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ShoppingBag size={19} />
          Mi pedido
          <motion.span key={cart.count} initial={{ scale: 1.6 }} animate={{ scale: 1 }}
            className="min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center text-[13px]" style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>
            {cart.count}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
