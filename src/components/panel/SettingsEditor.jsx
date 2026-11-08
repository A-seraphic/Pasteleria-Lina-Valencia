import { useLayoutEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import ReceiptTemplate from "@/components/ReceiptTemplate";
import { catalogApi } from "@/data/catalogStore";
import { DEFAULT_RECEIPT, DEFAULT_SITE, formatCOP } from "@/data/defaults";
import { useAction } from "./usePanel";
import { Field, TextInput, TextArea, Toggle, PrimaryButton, GhostButton, C } from "./fields";

function Card({ title, hint, children }) {
  return (
    <section className="rounded-3xl p-4 md:p-5 space-y-4" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)" }}>
      <div>
        <h3 className="font-display text-[22px]" style={{ color: C.wine }}>{title}</h3>
        {hint && <p className="text-[13px]" style={{ color: "rgba(165,0,89,0.55)" }}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function SwitchRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span>
        <span className="block text-[14px] font-medium" style={{ color: C.wine }}>{label}</span>
        {hint && <span className="block text-[12px]" style={{ color: "rgba(165,0,89,0.5)" }}>{hint}</span>}
      </span>
      <Toggle checked={!!checked} onChange={onChange} label={label} />
    </label>
  );
}

// Escala el recibo (480 px) para que quepa en el ancho disponible
function ScaledPreview({ children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const update = () => {
      const s = Math.min(1, el.clientWidth / 480);
      setScale(s);
      setH((el.firstChild?.offsetHeight || 0) * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstChild) ro.observe(el.firstChild);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ height: h || undefined }}>
      <div style={{ width: 480, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

// ── Recibo ─────────────────────────────────────────────────────────────────────
export function ReceiptSettings({ receipt, sample }) {
  const run = useAction();
  const [form, setForm] = useState(receipt);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(receipt);

  const save = async () => {
    setSaving(true);
    try { await run(() => catalogApi.saveSettings("receipt", form), "Recibo actualizado"); } finally { setSaving(false); }
  };

  // Pedido de ejemplo para la vista previa, con un producto real del catálogo
  const first = (sample?.basePrice || 145000) + 38000;
  const sampleData = {
    items: [
      {
        uid: "a",
        category: sample?.category || "Tortas Artesanales",
        design: sample?.name || "Chocolate Intenso",
        rows: [
          { label: "Bizcocho", value: "Chocolate negro 72%", price: 0 },
          { label: "Relleno", value: "Ganache de chocolate", price: 8000 },
          { label: "Tamaño", value: "Familiar · Ø 24 cm · 10–12 personas", price: 30000 },
        ],
        answers: [{ label: "Nombre en la torta", value: "Feliz cumpleaños Valentina" }],
        note: sample?.receiptNote || "",
        total: first,
      },
      { uid: "b", category: "Cupcakes", design: "Jardín de Rosas", rows: [], answers: [], note: "", total: 30000 },
    ],
    fecha: "2026-12-12",
    detalles: "Sin nueces, por favor",
    total: first + 30000,
    orderCode: `#${form.codePrefix || "LV"}-${new Date().getFullYear()}-0427`,
    receipt: form,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-5 items-start">
      <div className="min-w-0 space-y-4">
        <Card title="Encabezado" hint="Lo primero que se lee en el recibo, debajo del logo.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre"><TextInput value={form.title} onChange={(e) => set({ title: e.target.value })} /></Field>
            <Field label="Subtítulo"><TextInput value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
            <Field label="Título del documento"><TextInput value={form.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
            <Field label="Prefijo del código" hint={`Ej: #${form.codePrefix || "LV"}-2026-0427`}>
              <TextInput value={form.codePrefix} maxLength={6} onChange={(e) => set({ codePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
            </Field>
          </div>
        </Card>

        <Card title="Qué se imprime" hint="Activa o desactiva cada dato del recibo y del formulario de pedido.">
          <SwitchRow label="Precios de cada opción" hint={`Ej: “Ganache +${formatCOP(8000)}”`} checked={form.showPrices} onChange={(v) => set({ showPrices: v })} />
          <SwitchRow label="Total estimado" hint="Precio base + tamaño + opciones" checked={form.showTotal} onChange={(v) => set({ showTotal: v })} />
          <SwitchRow label="Fecha del evento" checked={form.showEventDate} onChange={(v) => set({ showEventDate: v })} />
          <SwitchRow label="Notas del cliente" checked={form.showNotes} onChange={(v) => set({ showNotes: v })} />
          <SwitchRow label="Condiciones" checked={form.showTerms} onChange={(v) => set({ showTerms: v })} />
        </Card>

        <Card title="Condiciones y pie">
          <Field label="Condiciones" hint="Abonos, políticas de cambio, tiempos de entrega…">
            <TextArea rows={3} value={form.terms} onChange={(e) => set({ terms: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Pie izquierdo"><TextInput value={form.footerLeft} onChange={(e) => set({ footerLeft: e.target.value })} /></Field>
            <Field label="Pie derecho"><TextInput value={form.footerRight} onChange={(e) => set({ footerRight: e.target.value })} /></Field>
          </div>
          <Field label="Saludo del mensaje de WhatsApp" hint="Primera línea del mensaje que se envía con el recibo">
            <TextArea rows={2} value={form.whatsappIntro} onChange={(e) => set({ whatsappIntro: e.target.value })} />
          </Field>
        </Card>

        <div className="flex gap-2 sticky bottom-0 z-10 pt-6 pb-3" style={{ background: "linear-gradient(rgba(253,250,245,0), #fdfaf5 45%)" }}>
          <GhostButton onClick={() => setForm(DEFAULT_RECEIPT)} aria-label="Valores originales"><RotateCcw size={15} /></GhostButton>
          <PrimaryButton className="flex-1" disabled={!dirty} loading={saving} onClick={save}>Guardar recibo</PrimaryButton>
        </div>
      </div>

      <div className="min-w-0 lg:sticky lg:top-36 space-y-2">
        <p className="text-[13px] font-semibold" style={{ color: C.wine }}>Vista previa en vivo</p>
        <ScaledPreview><ReceiptTemplate data={sampleData} preview /></ScaledPreview>
      </div>
    </div>
  );
}

// ── Negocio ────────────────────────────────────────────────────────────────────
export function SiteSettings({ site }) {
  const run = useAction();
  const [form, setForm] = useState(site);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(site);
  const digits = String(form.whatsapp || "").replace(/\D/g, "");

  const save = async () => {
    setSaving(true);
    try { await run(() => catalogApi.saveSettings("site", { ...form, whatsapp: digits }), "Datos del negocio actualizados"); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card title="WhatsApp" hint="A este número llegan todos los pedidos y mensajes de la página.">
        <Field label="Número con indicativo, sin espacios" hint={digits.length < 11 ? "Ej: 573001234567 (57 = Colombia)" : `Abre wa.me/${digits}`}>
          <TextInput inputMode="numeric" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
        </Field>
        <Field label="Mensaje de saludo" hint="Texto que aparece escrito al tocar “Pedir por WhatsApp”">
          <TextArea rows={2} value={form.greeting} onChange={(e) => set({ greeting: e.target.value })} />
        </Field>
        {digits.length >= 11 && (
          <a href={`https://wa.me/${digits}?text=${encodeURIComponent(form.greeting || "")}`} target="_blank" rel="noopener noreferrer"
            className="inline-block text-[14px] underline" style={{ color: C.wine }}>
            Probar este WhatsApp
          </a>
        )}
      </Card>

      <Card title="Contacto que se muestra en la página">
        <Field label="Teléfono (como se lee)"><TextInput value={form.phoneLabel} onChange={(e) => set({ phoneLabel: e.target.value })} placeholder="+57 300 123 4567" /></Field>
        <Field label="Instagram" hint="Solo el usuario, sin @"><TextInput value={form.instagram} onChange={(e) => set({ instagram: e.target.value.replace(/^@/, "") })} /></Field>
        <Field label="Dirección" hint="Abre Google Maps al tocarla"><TextInput value={form.address} onChange={(e) => set({ address: e.target.value })} /></Field>
        <Field label="Horario"><TextInput value={form.hours} onChange={(e) => set({ hours: e.target.value })} /></Field>
      </Card>

      <div className="flex gap-2 sticky bottom-0 z-10 pt-6 pb-3" style={{ background: "linear-gradient(rgba(253,250,245,0), #fdfaf5 45%)" }}>
        <GhostButton onClick={() => setForm(DEFAULT_SITE)} aria-label="Valores originales"><RotateCcw size={15} /></GhostButton>
        <PrimaryButton className="flex-1" disabled={!dirty} loading={saving} onClick={save}>Guardar datos del negocio</PrimaryButton>
      </div>
    </div>
  );
}
