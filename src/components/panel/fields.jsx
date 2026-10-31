import { useRef, useState } from "react";
import { ImagePlus, Loader2, Link2 } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { toast } from "sonner";

export const C = { wine: "#a50059", gold: "#d4af37", cream: "#fdfaf5" };

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.14em] uppercase font-semibold mb-1.5" style={{ color: "rgba(165,0,89,0.6)" }}>
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] mt-1" style={{ color: "rgba(165,0,89,0.4)" }}>{hint}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-xl px-3.5 py-3 text-base sm:text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(212,175,55,0.25)]";
const inputStyle = { background: "#fff", border: "1px solid rgba(212,175,55,0.3)", color: C.wine };

export function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} style={inputStyle} />;
}

export function TextArea(props) {
  return <textarea rows={3} {...props} className={`${inputCls} resize-y ${props.className || ""}`} style={inputStyle} />;
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full shrink-0 transition-colors"
      style={{ background: checked ? C.wine : "rgba(165,0,89,0.15)" }}
    >
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: checked ? 22 : 2 }} />
    </button>
  );
}

export function Chip({ on, onClick, children, muted }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[12px] transition-colors active:scale-95"
      style={{
        background: on ? C.wine : "#fff",
        color: on ? C.cream : C.wine,
        border: `1px solid ${on ? C.wine : "rgba(212,175,55,0.35)"}`,
        opacity: muted ? 0.5 : 1,
      }}
    >
      {on ? "✓ " : ""}{children}
    </button>
  );
}

export function PrimaryButton({ children, loading, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition disabled:opacity-60 ${className}`}
      style={{ background: "linear-gradient(135deg,#a50059,#7d0044)", color: C.cream, ...props.style }}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", danger, ...props }) {
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium active:scale-[0.98] transition ${className}`}
      style={{ background: danger ? "rgba(179,38,30,0.08)" : "rgba(212,175,55,0.12)", color: danger ? "#b3261e" : C.wine, ...props.style }}
    >
      {children}
    </button>
  );
}

// Foto: subir desde el celular (se comprime) o pegar un enlace
export function ImageField({ value, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await catalogApi.uploadImage(file));
    } catch (err) {
      toast.error("No se pudo subir la foto", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-3 items-start">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: "rgba(212,175,55,0.1)", border: "1px dashed rgba(212,175,55,0.6)" }}
      >
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <ImagePlus size={22} style={{ color: C.gold }} />}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 size={20} className="animate-spin" style={{ color: C.wine }} />
          </span>
        )}
      </button>
      <div className="flex-1 min-w-0 space-y-2">
        <GhostButton type="button" onClick={() => fileRef.current?.click()} className="w-full">
          <ImagePlus size={15} /> {value ? "Cambiar foto" : "Subir foto"}
        </GhostButton>
        {showUrl ? (
          <TextInput placeholder="https://..." value={value || ""} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <button type="button" onClick={() => setShowUrl(true)} className="flex items-center gap-1 text-[12px]" style={{ color: "rgba(165,0,89,0.55)" }}>
            <Link2 size={12} /> Usar un enlace
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

// Hoja inferior en celular / panel lateral en escritorio
export function EditorSheet({ title, onClose, children, footer }) {
  return (
    <div data-scroll-lock className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full md:max-w-lg max-h-[92dvh] md:max-h-none md:h-full flex flex-col rounded-t-[28px] md:rounded-none md:rounded-l-[28px] shadow-2xl"
        style={{ background: C.cream }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
          <h2 className="font-playfair text-xl font-semibold" style={{ color: C.wine }}>{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(165,0,89,0.07)", color: C.wine }} aria-label="Cerrar">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5">{children}</div>
        {footer && (
          <div className="px-5 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] border-t flex gap-2" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
