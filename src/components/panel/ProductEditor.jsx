import { useState } from "react";
import { Trash2, Box, Plus, X } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { formatCOP, parsePrice } from "@/data/defaults";
import { useAction, nextSort } from "./usePanel";
import { EditorSheet, Field, TextInput, TextArea, Toggle, Chip, ImageField, PrimaryButton, GhostButton, C } from "./fields";

const EMPTY = {
  name: "", subtitle: "", desc: "", img: "", price: "", badge: "", visible: true, ar: false,
  portionIds: [], options: {}, basePrice: 0, leadDays: 0, receiptNote: "", customFields: [],
};

function Section({ title, hint, children }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.25)" }}>
      <div>
        <p className="font-display text-[19px]" style={{ color: C.wine }}>{title}</p>
        {hint && <p className="text-[12.5px]" style={{ color: "rgba(165,0,89,0.55)" }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ProductEditor({ product, category, categories, options, portions, groups, onClose }) {
  const run = useAction();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    categoryId: category.id,
    sort: nextSort(category.subcategories),
    ...product,
    options: { ...(product?.options || {}) },
    customFields: product?.customFields || [],
  }));
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  // ids puede ser una lista o una función de la lista actual (toques rápidos seguidos)
  const setKind = (kind, ids) =>
    setForm((f) => {
      const current = f.options[kind] || [];
      return { ...f, options: { ...f.options, [kind]: typeof ids === "function" ? ids(current) : ids } };
    });
  const setField = (i, patch) => setForm((f) => ({ ...f, customFields: f.customFields.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await run(() => catalogApi.saveProduct({ ...form, basePrice: Number(form.basePrice) || 0, leadDays: Number(form.leadDays) || 0 }),
        product?.id ? "Producto actualizado" : "Producto creado");
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`¿Eliminar "${form.name}"? Esta acción no se puede deshacer.`)) return;
    await run(() => catalogApi.deleteProduct(product.id), "Producto eliminado");
    onClose();
  };

  return (
    <EditorSheet
      title={product?.id ? "Editar producto" : "Nuevo producto"}
      onClose={onClose}
      footer={
        <>
          {product?.id && <GhostButton danger onClick={remove} aria-label="Eliminar"><Trash2 size={16} /></GhostButton>}
          <PrimaryButton className="flex-1" loading={saving} onClick={save} disabled={!form.name.trim()}>
            Guardar
          </PrimaryButton>
        </>
      }
    >
      <ImageField value={form.img} onChange={(img) => set({ img })} />

      <div className="flex items-center justify-between gap-3 rounded-2xl p-3.5" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.25)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: C.wine }}>Visible en el catálogo</p>
          <p className="text-[12px]" style={{ color: "rgba(165,0,89,0.5)" }}>Si lo apagas, los clientes no lo verán</p>
        </div>
        <Toggle checked={form.visible} onChange={(visible) => set({ visible })} label="Visible" />
      </div>

      <Field label="Nombre"><TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej: Chocolate Intenso" /></Field>
      <Field label="Subtítulo"><TextInput value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder="Ej: Cacao Puro" /></Field>
      <Field label="Descripción"><TextArea value={form.desc} onChange={(e) => set({ desc: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Etiqueta" hint="Ej: Nuevo, Top"><TextInput value={form.badge} onChange={(e) => set({ badge: e.target.value })} /></Field>
        <Field label="Categoría">
          <select value={form.categoryId} onChange={(e) => set({ categoryId: Number(e.target.value) })}
            className="w-full rounded-xl px-3.5 py-3 text-base sm:text-sm" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.3)", color: C.wine }}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Precio y pedido */}
      <Section title="Precio y pedido" hint="El precio base más los extras de tamaño y opciones forman el total estimado del recibo.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio que se muestra" hint="Texto libre: “Desde $120.000”">
            <TextInput value={form.price}
              onChange={(e) => set({ price: e.target.value, ...(Number(form.basePrice) ? {} : { basePrice: parsePrice(e.target.value) }) })} placeholder="$145.000" />
          </Field>
          <Field label="Precio base (número)" hint={Number(form.basePrice) ? formatCOP(form.basePrice) : "0 = sin total en el recibo"}>
            <TextInput type="number" inputMode="numeric" min={0} step={1000} value={form.basePrice} onChange={(e) => set({ basePrice: e.target.value })} />
          </Field>
        </div>
        <Field label="Días de anticipación" hint="La fecha del evento no podrá ser antes de esto">
          <TextInput type="number" inputMode="numeric" min={0} max={60} value={form.leadDays} onChange={(e) => set({ leadDays: e.target.value })} />
        </Field>
        <Field label="Nota que se imprime en el recibo" hint="Ej: “Incluye topper dorado y caja de regalo”">
          <TextArea rows={2} value={form.receiptNote} onChange={(e) => set({ receiptNote: e.target.value })} />
        </Field>
      </Section>

      {/* Especializaciones */}
      <Section title="Especializaciones que puede elegir el cliente" hint="Marca las opciones que aplican a este producto. Se crean en la pestaña Especializaciones.">
        {groups.map((g) => {
          const all = options.filter((o) => o.kind === g.key);
          if (!all.length) return null;
          const selected = form.options[g.key] || [];
          return (
            <div key={g.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold" style={{ color: C.wine }}>
                  {g.label} <span className="font-normal" style={{ color: "rgba(165,0,89,0.5)" }}>· {g.type === "multi" ? "varias" : "una"}{g.required ? " · obligatoria" : ""}</span>
                </span>
                <span className="flex gap-3 text-[12px]" style={{ color: C.gold }}>
                  <button type="button" onClick={() => setKind(g.key, all.map((o) => o.id))}>Todos</button>
                  <button type="button" onClick={() => setKind(g.key, [])}>Ninguno</button>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {all.map((o) => (
                  <Chip key={o.id} on={selected.includes(o.id)} muted={!o.visible} onClick={() => setKind(g.key, (cur) => toggleIn(cur, o.id))}>
                    {o.name}{o.priceExtra ? ` +${formatCOP(o.priceExtra)}` : ""}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      {/* Preguntas propias */}
      <Section title="Preguntas para el cliente" hint="Campos extra que se piden al hacer el pedido y salen en el recibo (ej: nombre en el topper, edad, temática).">
        {form.customFields.map((f, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(212,175,55,0.08)" }}>
            <div className="flex gap-2">
              <TextInput value={f.label} placeholder="Pregunta (ej: Nombre en el topper)" onChange={(e) => setField(i, { label: e.target.value })} />
              <button type="button" aria-label="Quitar pregunta" onClick={() => set({ customFields: form.customFields.filter((_, j) => j !== i) })}
                className="w-11 shrink-0 rounded-xl flex items-center justify-center" style={{ color: C.wine, background: "rgba(165,0,89,0.06)" }}>
                <X size={15} />
              </button>
            </div>
            <TextInput value={f.placeholder || ""} placeholder="Ejemplo que verá el cliente (opcional)" onChange={(e) => setField(i, { placeholder: e.target.value })} />
            <label className="flex items-center gap-2 text-[13px]" style={{ color: C.wine }}>
              <Toggle checked={!!f.required} onChange={(required) => setField(i, { required })} label="Obligatoria" /> Obligatoria
            </label>
          </div>
        ))}
        <GhostButton type="button" className="w-full" onClick={() => set({ customFields: [...form.customFields, { label: "", placeholder: "", required: false }] })}>
          <Plus size={15} /> Agregar pregunta
        </GhostButton>
      </Section>

      {/* Tamaños y 3D */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(212,175,55,0.08)" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Box size={16} style={{ color: C.wine }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: C.wine }}>Ver en 3D con la cámara</p>
              <p className="text-[12px]" style={{ color: "rgba(165,0,89,0.5)" }}>Para tortas: muestra el tamaño real</p>
            </div>
          </div>
          <Toggle checked={form.ar} onChange={(ar) => set({ ar })} label="3D" />
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-2" style={{ color: C.wine }}>Tamaños disponibles</p>
          <div className="flex flex-wrap gap-1.5">
            {portions.map((p) => (
              <Chip key={p.id} on={form.portionIds.includes(p.id)} onClick={() => setForm((f) => ({ ...f, portionIds: toggleIn(f.portionIds, p.id) }))}>
                {p.label} · Ø{p.diameter}{p.priceExtra ? ` +${formatCOP(p.priceExtra)}` : ""}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </EditorSheet>
  );
}
