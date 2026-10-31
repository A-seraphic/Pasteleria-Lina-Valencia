import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { useAction, nextSort } from "./usePanel";
import { EditorSheet, Field, TextInput, TextArea, Toggle, ImageField, PrimaryButton, GhostButton, C } from "./fields";

export default function CategoryEditor({ category, categories, onClose }) {
  const run = useAction();
  const [form, setForm] = useState(() => ({
    name: "", tagline: "", shortDesc: "", price: "", tag: "", img: "", description: "", details: [], visible: true,
    sort: nextSort(categories),
    ...category,
  }));
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setDetail = (i, patch) => set({ details: form.details.map((d, j) => (j === i ? { ...d, ...patch } : d)) });

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const { subcategories, ...cat } = form;
    try {
      await run(() => catalogApi.saveCategory({ ...cat, details: cat.details.filter((d) => d.label || d.value) }),
        category?.id ? "Categoría actualizada" : "Categoría creada");
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const remove = async () => {
    const n = category.subcategories?.length || 0;
    if (!window.confirm(`¿Eliminar la categoría "${form.name}"${n ? ` y sus ${n} productos` : ""}? No se puede deshacer.`)) return;
    await run(() => catalogApi.deleteCategory(category.id), "Categoría eliminada");
    onClose();
  };

  return (
    <EditorSheet
      title={category?.id ? "Editar categoría" : "Nueva categoría"}
      onClose={onClose}
      footer={
        <>
          {category?.id && <GhostButton danger onClick={remove} aria-label="Eliminar"><Trash2 size={16} /></GhostButton>}
          <PrimaryButton className="flex-1" loading={saving} onClick={save} disabled={!form.name.trim()}>Guardar</PrimaryButton>
        </>
      }
    >
      <ImageField value={form.img} onChange={(img) => set({ img })} />
      <div className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.25)" }}>
        <p className="text-sm font-semibold" style={{ color: C.wine }}>Visible en el catálogo</p>
        <Toggle checked={form.visible} onChange={(visible) => set({ visible })} label="Visible" />
      </div>
      <Field label="Nombre"><TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Frase corta"><TextInput value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="El arte hecho pastel" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio desde"><TextInput value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="Desde $120.000" /></Field>
        <Field label="Etiqueta"><TextInput value={form.tag} onChange={(e) => set({ tag: e.target.value })} placeholder="Signature" /></Field>
      </div>
      <Field label="Resumen"><TextInput value={form.shortDesc} onChange={(e) => set({ shortDesc: e.target.value })} /></Field>
      <Field label="Descripción"><TextArea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field>

      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mb-2" style={{ color: "rgba(165,0,89,0.6)" }}>Detalles de la ficha</p>
        <div className="space-y-2">
          {form.details.map((d, i) => (
            <div key={i} className="flex gap-2">
              <TextInput className="w-[38%]" value={d.label} placeholder="Ej: Rellenos" onChange={(e) => setDetail(i, { label: e.target.value })} />
              <TextInput className="flex-1" value={d.value} placeholder="Ej: Más de 15" onChange={(e) => setDetail(i, { value: e.target.value })} />
              <button type="button" aria-label="Quitar" onClick={() => set({ details: form.details.filter((_, j) => j !== i) })}
                className="w-11 shrink-0 rounded-xl flex items-center justify-center" style={{ color: C.wine, background: "rgba(165,0,89,0.06)" }}>
                <X size={15} />
              </button>
            </div>
          ))}
          <GhostButton type="button" className="w-full" onClick={() => set({ details: [...form.details, { label: "", value: "" }] })}>
            <Plus size={15} /> Agregar detalle
          </GhostButton>
        </div>
      </div>
    </EditorSheet>
  );
}
