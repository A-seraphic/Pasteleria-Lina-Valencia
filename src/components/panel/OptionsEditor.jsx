import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { OPTION_KINDS } from "@/data/defaults";
import { useAction, nextSort } from "./usePanel";
import { TextInput, Toggle, C } from "./fields";

function OptionRow({ option }) {
  const run = useAction();
  const [name, setName] = useState(option.name);

  const saveName = () => {
    if (name.trim() && name !== option.name) run(() => catalogApi.saveOption({ ...option, name: name.trim() }), "Nombre actualizado");
  };
  const remove = () => {
    if (window.confirm(`¿Eliminar "${option.name}"? Se quitará de todos los productos.`))
      run(() => catalogApi.deleteOption(option.id), "Opción eliminada");
  };

  return (
    <li className="flex items-center gap-2 py-2">
      <TextInput value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} style={{ opacity: option.visible ? 1 : 0.5 }} />
      <Toggle checked={option.visible} label="Visible" onChange={(visible) => run(() => catalogApi.saveOption({ ...option, visible }), visible ? "Opción visible" : "Opción oculta")} />
      <button onClick={remove} aria-label={`Eliminar ${option.name}`} className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
        style={{ color: "#b3261e", background: "rgba(179,38,30,0.06)" }}>
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function KindGroup({ kind, label, options }) {
  const run = useAction();
  const [draft, setDraft] = useState("");
  const add = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await run(() => catalogApi.saveOption({ kind, name: draft.trim(), visible: true, sort: nextSort(options) }), "Opción agregada");
    setDraft("");
  };

  return (
    <section className="rounded-3xl p-4 md:p-5" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)" }}>
      <h3 className="font-playfair text-lg font-semibold" style={{ color: C.wine }}>{label}</h3>
      <p className="text-[12px] mb-2" style={{ color: "rgba(165,0,89,0.5)" }}>
        Ocultar una opción la quita de todas las fichas sin borrarla.
      </p>
      <ul className="divide-y" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
        {options.map((o) => <OptionRow key={`${o.id}-${o.name}`} option={o} />)}
      </ul>
      <form onSubmit={add} className="flex gap-2 mt-3">
        <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Nuevo: ${label.toLowerCase()}`} />
        <button type="submit" aria-label="Agregar" className="w-12 shrink-0 rounded-xl flex items-center justify-center"
          style={{ background: C.wine, color: C.cream }}>
          <Plus size={18} />
        </button>
      </form>
    </section>
  );
}

export default function OptionsEditor({ options }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {OPTION_KINDS.map((k) => (
        <KindGroup key={k.kind} kind={k.kind} label={k.label} options={options.filter((o) => o.kind === k.kind)} />
      ))}
    </div>
  );
}
