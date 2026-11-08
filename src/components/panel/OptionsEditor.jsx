import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { formatCOP } from "@/data/defaults";
import { useAction, nextSort } from "./usePanel";
import { TextInput, Toggle, PrimaryButton, GhostButton, Field, C } from "./fields";

const slug = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "grupo";

// Una opción: nombre, valor extra y descripción; se guarda al salir de cada campo
function OptionRow({ option }) {
  const run = useAction();
  const [form, setForm] = useState({ name: option.name, priceExtra: option.priceExtra || 0, description: option.description || "" });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    const next = { ...option, name: form.name.trim(), priceExtra: Number(form.priceExtra) || 0, description: form.description.trim() };
    if (!next.name) return;
    if (next.name !== option.name || next.priceExtra !== (option.priceExtra || 0) || next.description !== (option.description || "")) {
      run(() => catalogApi.saveOption(next), "Opción actualizada");
    }
  };
  const remove = () => {
    if (window.confirm(`¿Eliminar "${option.name}"? Se quitará de todos los productos.`))
      run(() => catalogApi.deleteOption(option.id), "Opción eliminada");
  };

  return (
    <li className="py-3 space-y-2" style={{ opacity: option.visible ? 1 : 0.55 }}>
      <div className="flex items-center gap-2">
        <TextInput aria-label="Nombre de la opción" value={form.name} onChange={(e) => set({ name: e.target.value })} onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
        <Toggle checked={option.visible} label="Visible"
          onChange={(visible) => run(() => catalogApi.saveOption({ ...option, visible }), visible ? "Opción visible" : "Opción oculta")} />
        <button onClick={remove} aria-label={`Eliminar ${option.name}`} className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
          style={{ color: "#b3261e", background: "rgba(179,38,30,0.06)" }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <label className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: "rgba(165,0,89,0.5)" }}>+$</span>
          <TextInput type="number" inputMode="numeric" min={0} step={1000} aria-label="Valor extra" value={form.priceExtra}
            onChange={(e) => set({ priceExtra: e.target.value })} onBlur={save} className="!pl-8" />
        </label>
        <TextInput placeholder="Descripción corta (opcional)" aria-label="Descripción" value={form.description}
          onChange={(e) => set({ description: e.target.value })} onBlur={save} />
      </div>
    </li>
  );
}

// Una especialización (grupo): nombre, nombre en el recibo, tipo, obligatoria, visible y sus opciones
function GroupCard({ group, groups, options, index }) {
  const run = useAction();
  const [form, setForm] = useState(group);
  const [draft, setDraft] = useState({ name: "", priceExtra: "" });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(group);

  const saveGroups = (next, msg) => run(() => catalogApi.saveSettings("optionGroups", next), msg);
  const saveGroup = () => saveGroups(groups.map((g) => (g.key === group.key ? { ...form, label: form.label.trim() || group.label } : g)), "Especialización guardada");
  const move = (dir) => {
    const list = [...groups];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    saveGroups(list.map((g, i) => ({ ...g, sort: i })), null);
  };
  const remove = () => {
    if (window.confirm(`¿Eliminar la especialización "${group.label}" y sus ${options.length} opciones? No se puede deshacer.`))
      run(() => catalogApi.deleteGroup(groups, group.key), "Especialización eliminada");
  };
  const addOption = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    await run(() => catalogApi.saveOption({ kind: group.key, name: draft.name.trim(), priceExtra: Number(draft.priceExtra) || 0, description: "", visible: true, sort: nextSort(options) }), "Opción agregada");
    setDraft({ name: "", priceExtra: "" });
  };

  return (
    <section className="rounded-3xl p-4 md:p-5 space-y-4" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)", opacity: form.visible === false ? 0.7 : 1 }}>
      <div className="flex items-start gap-2">
        <div className="flex flex-col">
          <button aria-label="Subir" disabled={index === 0} onClick={() => move(-1)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronUp size={18} /></button>
          <button aria-label="Bajar" disabled={index === groups.length - 1} onClick={() => move(1)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronDown size={18} /></button>
        </div>
        <div className="flex-1 grid sm:grid-cols-2 gap-3">
          <Field label="Nombre en la página"><TextInput value={form.label} onChange={(e) => set({ label: e.target.value })} placeholder="Ej: Sabor de bizcocho" /></Field>
          <Field label="Nombre en el recibo"><TextInput value={form.receipt} onChange={(e) => set({ receipt: e.target.value })} placeholder="Ej: Bizcocho" /></Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex rounded-full p-1" style={{ background: "rgba(212,175,55,0.12)" }} role="radiogroup" aria-label="Tipo de selección">
          {[["single", "Elige una"], ["multi", "Elige varias"]].map(([v, l]) => (
            <button key={v} role="radio" aria-checked={form.type === v} onClick={() => set({ type: v })}
              className="px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors"
              style={{ background: form.type === v ? C.wine : "transparent", color: form.type === v ? C.cream : C.wine }}>
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[14px]" style={{ color: C.wine }}>
          <Toggle checked={!!form.required} onChange={(required) => set({ required })} label="Obligatoria" /> Obligatoria
        </label>
        <label className="flex items-center gap-2 text-[14px]" style={{ color: C.wine }}>
          <Toggle checked={form.visible !== false} onChange={(visible) => set({ visible })} label="Visible" /> Visible
        </label>
      </div>

      {dirty && <PrimaryButton className="w-full" onClick={saveGroup}>Guardar cambios de la especialización</PrimaryButton>}

      <div>
        <p className="text-[12px] mb-1" style={{ color: "rgba(165,0,89,0.55)" }}>
          Opciones · el valor extra se suma al total del pedido (deja 0 si no cambia el precio)
        </p>
        <ul className="divide-y" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
          {options.map((o) => <OptionRow key={`${o.id}-${o.name}-${o.priceExtra}-${o.description}`} option={o} />)}
        </ul>
        <form onSubmit={addOption} className="grid grid-cols-[1fr_110px_48px] gap-2 mt-3">
          <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nueva opción" />
          <TextInput type="number" inputMode="numeric" min={0} step={1000} value={draft.priceExtra} placeholder="+$ 0"
            onChange={(e) => setDraft((d) => ({ ...d, priceExtra: e.target.value }))} />
          <button type="submit" aria-label="Agregar opción" className="rounded-xl flex items-center justify-center" style={{ background: C.wine, color: C.cream }}>
            <Plus size={18} />
          </button>
        </form>
      </div>

      <GhostButton danger className="w-full" onClick={remove}><Trash2 size={15} /> Eliminar especialización</GhostButton>
    </section>
  );
}

export default function OptionsEditor({ options, groups }) {
  const run = useAction();
  const [name, setName] = useState("");

  const addGroup = async (e) => {
    e.preventDefault();
    const label = name.trim();
    if (!label) return;
    let key = slug(label);
    while (groups.some((g) => g.key === key)) key += "-2";
    const next = [...groups, { key, label, receipt: label, type: "single", required: false, visible: true, sort: groups.length }];
    await run(() => catalogApi.saveSettings("optionGroups", next), "Especialización creada");
    setName("");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "rgba(165,0,89,0.65)" }}>
        Las especializaciones son lo que el cliente elige al pedir (sabor, relleno, topper, decoración…).
        En cada producto marcas cuáles aplican. Todo lo elegido se imprime en el recibo con su valor. Total de opciones: {options.length}.
      </p>
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {groups.map((g, i) => (
          <GroupCard key={`${g.key}-${JSON.stringify(g)}`} group={g} groups={groups} index={i} options={options.filter((o) => o.kind === g.key)} />
        ))}
      </div>
      <form onSubmit={addGroup} className="rounded-3xl p-4 flex gap-2" style={{ background: "rgba(212,175,55,0.1)" }}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva especialización (ej: Topper, Tipo de decoración)" />
        <PrimaryButton type="submit" className="shrink-0"><Plus size={16} /> Crear</PrimaryButton>
      </form>
      <p className="text-[12px]" style={{ color: "rgba(165,0,89,0.45)" }}>
        Ejemplo de precios: “Fondant +{formatCOP(15000)}”, “Topper personalizado +{formatCOP(12000)}”.
      </p>
    </div>
  );
}
