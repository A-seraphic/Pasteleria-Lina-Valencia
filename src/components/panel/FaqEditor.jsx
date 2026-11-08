import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { catalogApi } from "@/data/catalogStore";
import { useAction } from "./usePanel";
import { TextInput, TextArea, PrimaryButton, GhostButton, C } from "./fields";

// Editor de preguntas frecuentes: se guardan todas juntas con un botón
export default function FaqEditor({ faq }) {
  const run = useAction();
  const [list, setList] = useState(faq);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(list) !== JSON.stringify(faq);

  const set = (i, patch) => setList((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, dir) =>
    setList((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      await run(() => catalogApi.saveSettings("faq", list.filter((f) => f.q.trim() && f.a.trim())), "Preguntas guardadas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm" style={{ color: "rgba(165,0,89,0.65)" }}>
        Aparecen en la sección “Lo que siempre nos preguntan”, antes del contacto. Las preguntas sin respuesta no se muestran.
      </p>
      {list.map((f, i) => (
        <section key={i} className="rounded-3xl p-4 space-y-2.5" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)" }}>
          <div className="flex gap-2">
            <div className="flex flex-col">
              <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronUp size={18} /></button>
              <button aria-label="Bajar" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronDown size={18} /></button>
            </div>
            <TextInput value={f.q} placeholder="Pregunta" onChange={(e) => set(i, { q: e.target.value })} />
            <button aria-label="Eliminar pregunta" onClick={() => setList((l) => l.filter((_, j) => j !== i))}
              className="w-11 shrink-0 rounded-xl flex items-center justify-center" style={{ color: "#b3261e", background: "rgba(179,38,30,0.06)" }}>
              <Trash2 size={15} />
            </button>
          </div>
          <TextArea rows={3} value={f.a} placeholder="Respuesta" onChange={(e) => set(i, { a: e.target.value })} />
        </section>
      ))}
      <GhostButton className="w-full" onClick={() => setList((l) => [...l, { q: "", a: "" }])}>
        <Plus size={16} /> Nueva pregunta
      </GhostButton>
      <div className="flex sticky bottom-0 z-10 pt-6 pb-3" style={{ background: "linear-gradient(rgba(253,250,245,0), #fdfaf5 45%)" }}>
        <PrimaryButton className="flex-1" disabled={!dirty} loading={saving} onClick={save}>Guardar preguntas</PrimaryButton>
      </div>
    </div>
  );
}
