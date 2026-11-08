import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { useAction, nextSort } from "./usePanel";
import { Field, TextInput, PrimaryButton, GhostButton, C } from "./fields";

function PortionCard({ portion, onDone }) {
  const run = useAction();
  const [form, setForm] = useState(portion);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(portion);

  const save = async () => {
    setSaving(true);
    try {
      const clean = {
        ...form,
        diameter: Number(form.diameter) || 10,
        height: Number(form.height) || 8,
        tiers: Math.min(4, Math.max(1, parseInt(form.tiers) || 1)),
        slices: Math.max(1, parseInt(form.slices) || 1),
        priceExtra: Number(form.priceExtra) || 0,
      };
      await run(() => catalogApi.savePortion(clean), portion.id ? "Tamaño actualizado" : "Tamaño creado");
      onDone?.();
    } finally {
      setSaving(false);
    }
  };
  const remove = () => {
    if (window.confirm(`¿Eliminar el tamaño "${portion.label}"?`)) run(() => catalogApi.deletePortion(portion.id), "Tamaño eliminado");
  };

  const num = (key) => ({ type: "number", inputMode: "decimal", min: 1, value: form[key], onChange: (e) => set({ [key]: e.target.value }) });

  return (
    <div className="rounded-3xl p-4 space-y-3" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)" }}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre"><TextInput value={form.label} onChange={(e) => set({ label: e.target.value })} /></Field>
        <Field label="Personas"><TextInput value={form.people} onChange={(e) => set({ people: e.target.value })} placeholder="10–12 personas" /></Field>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Field label="Ø cm"><TextInput {...num("diameter")} /></Field>
        <Field label="Alto"><TextInput {...num("height")} /></Field>
        <Field label="Pisos"><TextInput {...num("tiers")} max={4} /></Field>
        <Field label="Porc."><TextInput {...num("slices")} /></Field>
      </div>
      <Field label="Valor extra de este tamaño" hint="Se suma al precio base del producto en el total del recibo (0 = no cambia)">
        <TextInput type="number" inputMode="numeric" min={0} step={1000} value={form.priceExtra ?? 0} onChange={(e) => set({ priceExtra: e.target.value })} />
      </Field>
      <div className="flex gap-2">
        {portion.id && <GhostButton danger onClick={remove} aria-label="Eliminar"><Trash2 size={15} /></GhostButton>}
        <PrimaryButton className="flex-1" onClick={save} loading={saving} disabled={!dirty || !form.label}>
          {portion.id ? "Guardar" : "Crear tamaño"}
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function PortionsEditor({ portions }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "rgba(165,0,89,0.6)" }}>
        Estos tamaños alimentan la guía de porciones, la torta 3D a escala real y el formulario de pedido.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {portions.map((p) => <PortionCard key={`${p.id}-${JSON.stringify(p)}`} portion={p} />)}
        {adding && (
          <PortionCard
            portion={{ label: "", people: "", diameter: 20, height: 10, tiers: 1, slices: 10, priceExtra: 0, sort: nextSort(portions) }}
            onDone={() => setAdding(false)}
          />
        )}
      </div>
      {!adding && (
        <GhostButton className="w-full" onClick={() => setAdding(true)} style={{ color: C.wine }}>
          <Plus size={16} /> Nuevo tamaño
        </GhostButton>
      )}
    </div>
  );
}
