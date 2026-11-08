import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Pencil, Plus, LogOut, ExternalLink, Loader2, Lock, Database, Box, EyeOff } from "lucide-react";
import { isRemote } from "@/lib/supabase";
import { useCatalog, catalogApi } from "@/data/catalogStore";
import { useAdminSession, signIn, signOut, useAction } from "@/components/panel/usePanel";
import { TextInput, Toggle, PrimaryButton, GhostButton, C } from "@/components/panel/fields";
import ProductEditor from "@/components/panel/ProductEditor";
import CategoryEditor from "@/components/panel/CategoryEditor";
import OptionsEditor from "@/components/panel/OptionsEditor";
import PortionsEditor from "@/components/panel/PortionsEditor";
import { ReceiptSettings, SiteSettings } from "@/components/panel/SettingsEditor";
import FaqEditor from "@/components/panel/FaqEditor";

const TABS = [
  { key: "catalogo", label: "Catálogo" },
  { key: "opciones", label: "Especializaciones" },
  { key: "porciones", label: "Tamaños" },
  { key: "recibo", label: "Recibo" },
  { key: "preguntas", label: "Preguntas" },
  { key: "negocio", label: "Negocio" },
];

// El panel no debe aparecer en buscadores
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const prev = document.title;
    document.title = "Panel · Lina Valencia";
    return () => { meta.remove(); document.title = prev; };
  }, []);
}

export default function Panel() {
  useNoIndex();
  const session = useAdminSession();

  if (session.loading) return <Center><Loader2 className="animate-spin" style={{ color: C.gold }} /></Center>;
  if (isRemote && !session.user) return <Login />;
  if (isRemote && !session.isAdmin) {
    return (
      <Center>
        <div className="max-w-sm text-center space-y-4 px-6">
          <Lock className="mx-auto" style={{ color: C.gold }} />
          <p style={{ color: C.wine }}>Esta cuenta ({session.user.email}) no tiene acceso al panel.</p>
          <GhostButton className="mx-auto" onClick={signOut}>Cerrar sesión</GhostButton>
        </div>
      </Center>
    );
  }
  return <Dashboard email={session.user?.email} />;
}

function Center({ children }) {
  return <div className="min-h-[100dvh] flex items-center justify-center font-inter" style={{ background: C.cream }}>{children}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try { await signIn(email, password); } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Center>
      <motion.form onSubmit={submit} className="w-full max-w-sm mx-4 rounded-[28px] p-7 space-y-4"
        style={{ background: "#fff", boxShadow: "0 30px 80px rgba(165,0,89,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-2">
          <p className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: C.gold }}>Acceso privado</p>
          <h1 className="font-playfair text-3xl font-semibold mt-1" style={{ color: C.wine }}>Lina Valencia</h1>
        </div>
        <TextInput type="email" autoComplete="username" required placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextInput type="password" autoComplete="current-password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm" style={{ color: "#b3261e" }}>{error}</p>}
        <PrimaryButton type="submit" loading={busy} className="w-full">Entrar</PrimaryButton>
      </motion.form>
    </Center>
  );
}

function Dashboard({ email }) {
  const { data, isLoading, error } = useCatalog();
  const [tab, setTab] = useState("catalogo");

  return (
    <div className="min-h-[100dvh] font-inter pb-16" style={{ background: "linear-gradient(180deg,#fdfaf5,#f8eef2)" }}>
      <Toaster position="top-center" richColors closeButton />
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(253,250,245,0.85)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
        <div className="max-w-5xl mx-auto px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: C.gold }}>Panel privado</p>
            <h1 className="font-playfair text-xl font-semibold truncate" style={{ color: C.wine }}>Lina Valencia</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(212,175,55,0.14)", color: C.wine }} aria-label="Ver página">
              <ExternalLink size={16} />
            </Link>
            {isRemote && (
              <button onClick={signOut} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(165,0,89,0.08)", color: C.wine }} aria-label={`Salir (${email})`}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
              style={{ color: tab === t.key ? C.cream : C.wine }}>
              {tab === t.key && <motion.span layoutId="panel-tab" className="absolute inset-0 rounded-full" style={{ background: C.wine }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-4">
        <SourceBanner source={data?.source} />
        {data?.source !== "local" && data?.schemaReady === false && (
          <p className="rounded-2xl p-4 text-[14px]" style={{ background: "#fdecea", color: "#8c1d18" }}>
            <b>Falta actualizar la base de datos.</b> En Supabase → SQL Editor, ejecuta el archivo
            <code className="mx-1">supabase/migrations/002_panel_avanzado.sql</code>
            para guardar especializaciones con precio, recibo y datos del negocio.
          </p>
        )}
        {isLoading && <div className="py-20 flex justify-center"><Loader2 className="animate-spin" style={{ color: C.gold }} /></div>}
        {error && <p className="rounded-2xl p-4 text-sm" style={{ background: "#fdecea", color: "#b3261e" }}>No se pudo cargar el catálogo: {error.message}</p>}
        {data && (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {tab === "catalogo" && <CatalogTab data={data} />}
              {tab === "opciones" && <OptionsEditor options={data.options} groups={data.settings.optionGroups} />}
              {tab === "porciones" && <PortionsEditor portions={data.portions} />}
              {tab === "recibo" && (
                <ReceiptSettings
                  key={JSON.stringify(data.settings.receipt)}
                  receipt={data.settings.receipt}
                  sample={(() => {
                    const c = data.categories[0];
                    const p = c?.subcategories[0];
                    return p && { ...p, category: c.name };
                  })()}
                />
              )}
              {tab === "preguntas" && <FaqEditor key={JSON.stringify(data.settings.faq)} faq={data.settings.faq} />}
              {tab === "negocio" && <SiteSettings key={JSON.stringify(data.settings.site)} site={data.settings.site} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

function SourceBanner({ source }) {
  const run = useAction();
  const [busy, setBusy] = useState(false);
  if (source === "local") {
    return (
      <div className="rounded-2xl p-4 text-[13px] flex gap-3" style={{ background: "rgba(212,175,55,0.14)", color: C.wine }}>
        <Database size={18} className="shrink-0 mt-0.5" style={{ color: C.gold }} />
        <div>
          <b>Modo demostración.</b> Los cambios se guardan solo en este navegador. Conecta Supabase para que se publiquen para todos los clientes.
          <button className="block mt-2 underline text-[12px]" onClick={() => { if (window.confirm("¿Volver al catálogo original? Se pierden los cambios de prueba.")) run(async () => catalogApi.resetLocal(), "Catálogo restaurado"); }}>
            Restaurar catálogo original
          </button>
        </div>
      </div>
    );
  }
  if (source === "defaults") {
    return (
      <div className="rounded-2xl p-4 text-[13px] space-y-3" style={{ background: "rgba(212,175,55,0.14)", color: C.wine }}>
        <p><b>La base de datos está vacía.</b> Los clientes ven el catálogo original. Impórtalo para empezar a editarlo.</p>
        <PrimaryButton loading={busy} onClick={async () => { setBusy(true); try { await run(() => catalogApi.seedRemote(), "Catálogo importado"); } finally { setBusy(false); } }}>
          Importar catálogo actual
        </PrimaryButton>
      </div>
    );
  }
  return null;
}

function CatalogTab({ data }) {
  const run = useAction();
  const [open, setOpen] = useState(() => new Set());
  const [editing, setEditing] = useState(null); // { type, item, category }
  const readOnly = data.source === "defaults";

  const toggleOpen = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const move = (list, i, dir, save) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    run(async () => {
      await save({ ...a, sort: b.sort ?? j });
      await save({ ...b, sort: a.sort ?? i });
    }, null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "rgba(165,0,89,0.6)" }}>
          {data.categories.length} categorías · {data.categories.reduce((n, c) => n + c.subcategories.length, 0)} productos
        </p>
        <PrimaryButton disabled={readOnly} onClick={() => setEditing({ type: "category" })} className="!py-2.5">
          <Plus size={16} /> Categoría
        </PrimaryButton>
      </div>

      {data.categories.map((cat, ci) => {
        const isOpen = open.has(cat.id);
        return (
          <section key={cat.id} className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 8px 24px rgba(165,0,89,0.04)" }}>
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => toggleOpen(cat.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <img src={cat.img} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" style={{ opacity: cat.visible ? 1 : 0.4 }} />
                <div className="min-w-0">
                  <p className="font-playfair text-[17px] font-semibold truncate flex items-center gap-1.5" style={{ color: C.wine }}>
                    {cat.name} {!cat.visible && <EyeOff size={13} style={{ color: C.gold }} />}
                  </p>
                  <p className="text-[12px]" style={{ color: "rgba(165,0,89,0.5)" }}>{cat.subcategories.length} productos · {cat.price}</p>
                </div>
              </button>
              <IconBtn label="Editar categoría" disabled={readOnly} onClick={() => setEditing({ type: "category", item: cat })}><Pencil size={15} /></IconBtn>
              <IconBtn label={isOpen ? "Cerrar" : "Abrir"} onClick={() => toggleOpen(cat.id)}>
                <ChevronDown size={17} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .3s" }} />
              </IconBtn>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-3 pb-3 space-y-2">
                    <div className="flex gap-2 text-[12px] px-1" style={{ color: "rgba(165,0,89,0.5)" }}>
                      <span>Posición de la categoría:</span>
                      <button disabled={readOnly || ci === 0} onClick={() => move(data.categories, ci, -1, catalogApi.saveCategory)} className="disabled:opacity-30"><ChevronUp size={16} /></button>
                      <button disabled={readOnly || ci === data.categories.length - 1} onClick={() => move(data.categories, ci, 1, catalogApi.saveCategory)} className="disabled:opacity-30"><ChevronDown size={16} /></button>
                    </div>
                    {cat.subcategories.map((p, pi) => (
                      <div key={p.id} className="flex items-center gap-2.5 rounded-2xl p-2" style={{ background: "rgba(253,250,245,0.9)", border: "1px solid rgba(212,175,55,0.12)" }}>
                        <div className="flex flex-col">
                          <button aria-label="Subir" disabled={readOnly || pi === 0} onClick={() => move(cat.subcategories, pi, -1, catalogApi.saveProduct)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronUp size={15} /></button>
                          <button aria-label="Bajar" disabled={readOnly || pi === cat.subcategories.length - 1} onClick={() => move(cat.subcategories, pi, 1, catalogApi.saveProduct)} className="disabled:opacity-20" style={{ color: C.gold }}><ChevronDown size={15} /></button>
                        </div>
                        <img src={p.img} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" style={{ opacity: p.visible ? 1 : 0.4 }} />
                        <button className="flex-1 min-w-0 text-left" disabled={readOnly} onClick={() => setEditing({ type: "product", item: p, category: cat })}>
                          <p className="text-[14px] font-semibold truncate flex items-center gap-1" style={{ color: C.wine }}>
                            {p.name} {p.ar && <Box size={12} style={{ color: C.gold }} />}
                          </p>
                          <p className="text-[12px] truncate" style={{ color: "rgba(165,0,89,0.5)" }}>{p.price}{p.badge ? ` · ${p.badge}` : ""}</p>
                        </button>
                        <Toggle checked={p.visible} label={`Visible ${p.name}`} onChange={(visible) => !readOnly && run(() => catalogApi.saveProduct({ ...p, visible }), visible ? "Producto visible" : "Producto oculto")} />
                      </div>
                    ))}
                    <GhostButton className="w-full" disabled={readOnly} onClick={() => setEditing({ type: "product", category: cat })}>
                      <Plus size={15} /> Nuevo producto en {cat.name}
                    </GhostButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}

      {editing?.type === "product" && (
        <ProductEditor product={editing.item} category={editing.category} categories={data.categories}
          options={data.options} portions={data.portions} groups={data.settings.optionGroups} onClose={() => setEditing(null)} />
      )}
      {editing?.type === "category" && (
        <CategoryEditor category={editing.item} categories={data.categories} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function IconBtn({ children, label, ...props }) {
  return (
    <button aria-label={label} {...props} className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center disabled:opacity-30"
      style={{ background: "rgba(212,175,55,0.12)", color: C.wine }}>
      {children}
    </button>
  );
}
