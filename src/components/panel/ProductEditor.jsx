import { useState } from "react";
import { Trash2, Box } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { OPTION_KINDS } from "@/data/defaults";
import { useAction, nextSort } from "./usePanel";
import { EditorSheet, Field, TextInput, TextArea, Toggle, Chip, ImageField, PrimaryButton, GhostButton, C } from "./fields";

const EMPTY = {
  name: "", subtitle: "", desc: "", img: "", price: "", badge: "", visible: true, ar: false,
  portionIds: [], options: { bizcocho: [], relleno: [], cobertura: [], extra: [] },
};

export default function ProductEditor({ product, category, categories, options, portions, onClose }) {
  const run = useAction();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    categoryId: category.id,
    sort: nextSort(category.subcategories),
    ...product,
    options: { ...EMPTY.options, ...(product?.options || {}) },
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

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await run(() => catalogApi.saveProduct(form), product?.id ? "Producto actualizado" : "Producto creado");
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
        <Field label="Precio"><TextInput value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="$145.000" /></Field>
        <Field label="Etiqueta" hint="Ej: Nuevo, Top"><TextInput value={form.badge} onChange={(e) => set({ badge: e.target.value })} /></Field>
      </div>
      <Field label="Categoría">
        <select value={form.categoryId} onChange={(e) => set({ categoryId: Number(e.target.value) })}
          className="w-full rounded-xl px-3.5 py-3 text-base sm:text-sm" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.3)", color: C.wine }}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      {/* Opciones que el cliente puede elegir */}
      {OPTION_KINDS.map((k) => {
        const all = options.filter((o) => o.kind === k.kind);
        if (!all.length) return null;
        const selected = form.options[k.kind] || [];
        return (
          <div key={k.kind}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] tracking-[0.14em] uppercase font-semibold" style={{ color: "rgba(165,0,89,0.6)" }}>{k.label}</span>
              <span className="flex gap-3 text-[12px]" style={{ color: C.gold }}>
                <button type="button" onClick={() => setKind(k.kind, all.map((o) => o.id))}>Todos</button>
                <button type="button" onClick={() => setKind(k.kind, [])}>Ninguno</button>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {all.map((o) => (
                <Chip key={o.id} on={selected.includes(o.id)} muted={!o.visible} onClick={() => setKind(k.kind, (cur) => toggleIn(cur, o.id))}>
                  {o.name}
                </Chip>
              ))}
            </div>
          </div>
        );
      })}

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
          <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mb-2" style={{ color: "rgba(165,0,89,0.6)" }}>Tamaños disponibles</p>
          <div className="flex flex-wrap gap-1.5">
            {portions.map((p) => (
              <Chip key={p.id} on={form.portionIds.includes(p.id)} onClick={() => setForm((f) => ({ ...f, portionIds: toggleIn(f.portionIds, p.id) }))}>
                {p.label} · Ø{p.diameter}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </EditorSheet>
  );
}
