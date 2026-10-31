import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase, isRemote, STORAGE_BUCKET } from "@/lib/supabase";
import { CATALOG } from "./catalogData";
import { DEFAULT_OPTIONS, DEFAULT_PORTIONS, CAKE_CATEGORY_NAMES } from "./defaults";

const LOCAL_KEY = "lv-catalogo-demo-v1";
export const CATALOG_QUERY_KEY = ["catalogo"];

// ── Estado inicial (catálogo actual de la página) ───────────────────────────────
export function getDefaultState() {
  const optionIds = (kind) => DEFAULT_OPTIONS.filter((o) => o.kind === kind).map((o) => o.id);
  const categories = CATALOG.map((cat, ci) => {
    const isCake = CAKE_CATEGORY_NAMES.includes(cat.name);
    const portionIds = cat.name === "Mini Tortas" ? [1] : isCake ? DEFAULT_PORTIONS.map((p) => p.id) : [];
    return {
      id: cat.id,
      name: cat.name,
      tagline: cat.tagline,
      shortDesc: cat.shortDesc,
      price: cat.price,
      tag: cat.tag,
      img: cat.img,
      description: cat.description,
      details: cat.details,
      visible: true,
      sort: ci,
      subcategories: cat.subcategories.map((sub, si) => ({
        id: cat.id * 100 + si,
        categoryId: cat.id,
        name: sub.name,
        subtitle: sub.subtitle,
        desc: sub.desc,
        img: sub.img,
        price: sub.price,
        badge: "",
        visible: true,
        sort: si,
        ar: isCake,
        portionIds,
        options: isCake
          ? { bizcocho: optionIds("bizcocho"), relleno: optionIds("relleno"), cobertura: optionIds("cobertura"), extra: optionIds("extra") }
          : { bizcocho: [], relleno: [], cobertura: [], extra: [] },
      })),
    };
  });
  return { categories, options: DEFAULT_OPTIONS, portions: DEFAULT_PORTIONS };
}

const bySort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.id ?? 0) - (b.id ?? 0);

function sortState(state) {
  return {
    ...state,
    categories: [...state.categories]
      .sort(bySort)
      .map((c) => ({ ...c, subcategories: [...(c.subcategories || [])].sort(bySort) })),
    options: [...state.options].sort(bySort),
    portions: [...state.portions].sort(bySort),
  };
}

// ── Conversión filas Supabase <-> objetos de la app ─────────────────────────────
const catFromRow = (r) => ({
  id: r.id, name: r.name, tagline: r.tagline || "", shortDesc: r.short_desc || "", price: r.price || "",
  tag: r.tag || "", img: r.img || "", description: r.description || "", details: r.details || [],
  visible: r.visible, sort: r.sort, subcategories: [],
});
const catToRow = (c) => ({
  name: c.name, tagline: c.tagline, short_desc: c.shortDesc, price: c.price, tag: c.tag, img: c.img,
  description: c.description, details: c.details || [], visible: c.visible ?? true, sort: c.sort ?? 0,
});
const prodFromRow = (r) => ({
  id: r.id, categoryId: r.category_id, name: r.name, subtitle: r.subtitle || "", desc: r.description || "",
  img: r.img || "", price: r.price || "", badge: r.badge || "", visible: r.visible, sort: r.sort, ar: r.ar,
  portionIds: r.portion_ids || [], options: r.options || {},
});
const prodToRow = (p) => ({
  category_id: p.categoryId, name: p.name, subtitle: p.subtitle, description: p.desc, img: p.img, price: p.price,
  badge: p.badge || "", visible: p.visible ?? true, sort: p.sort ?? 0, ar: Boolean(p.ar),
  portion_ids: p.portionIds || [], options: p.options || {},
});
const optFromRow = (r) => ({ id: r.id, kind: r.kind, name: r.name, visible: r.visible, sort: r.sort });
const optToRow = (o) => ({ kind: o.kind, name: o.name, visible: o.visible ?? true, sort: o.sort ?? 0 });
const porFromRow = (r) => ({
  id: r.id, label: r.label, people: r.people || "", diameter: Number(r.diameter_cm), height: Number(r.height_cm),
  tiers: r.tiers, slices: r.slices, sort: r.sort,
});
const porToRow = (p) => ({
  label: p.label, people: p.people, diameter_cm: Number(p.diameter), height_cm: Number(p.height),
  tiers: Number(p.tiers) || 1, slices: Number(p.slices) || 1, sort: p.sort ?? 0,
});

// ── Lectura ────────────────────────────────────────────────────────────────────
function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // almacenamiento no disponible: se usa el catálogo por defecto
  }
  return getDefaultState();
}

function writeLocal(state) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    throw new Error("No se pudo guardar en este navegador (espacio lleno). Usa imágenes más livianas.");
  }
}

export async function fetchCatalog() {
  if (!isRemote) return { ...sortState(readLocal()), source: "local" };

  const [cats, prods, opts, pors] = await Promise.all([
    supabase.from("categories").select("*"),
    supabase.from("products").select("*"),
    supabase.from("options").select("*"),
    supabase.from("portions").select("*"),
  ]);
  const error = cats.error || prods.error || opts.error || pors.error;
  if (error) throw error;

  // Base de datos todavía vacía: se muestra el catálogo actual hasta que lo importen
  if (cats.data.length === 0) return { ...sortState(getDefaultState()), source: "defaults" };

  const categories = cats.data.map(catFromRow);
  const byId = new Map(categories.map((c) => [c.id, c]));
  prods.data.map(prodFromRow).forEach((p) => byId.get(p.categoryId)?.subcategories.push(p));
  return {
    ...sortState({
      categories,
      options: opts.data.map(optFromRow),
      portions: pors.data.map(porFromRow),
    }),
    source: "remote",
  };
}

export function useCatalog() {
  return useQuery({ queryKey: CATALOG_QUERY_KEY, queryFn: fetchCatalog, staleTime: 60_000 });
}

// Vista para clientes: solo lo visible, con el catálogo local mientras carga
export function usePublicCatalog() {
  const query = useCatalog();
  const data = useMemo(() => {
    const state = query.data || sortState(getDefaultState());
    const options = state.options.filter((o) => o.visible);
    return {
      options,
      portions: state.portions,
      categories: state.categories
        .filter((c) => c.visible)
        .map((c) => ({ ...c, subcategories: c.subcategories.filter((s) => s.visible) }))
        .filter((c) => c.subcategories.length > 0),
    };
  }, [query.data]);
  return { ...data, isLoading: query.isLoading };
}

// Opciones elegibles de un producto, agrupadas por tipo
export function productOptions(product, options) {
  const result = {};
  for (const [kind, ids] of Object.entries(product?.options || {})) {
    const list = options.filter((o) => o.kind === kind && o.visible && ids.includes(o.id));
    if (list.length) result[kind] = list;
  }
  return result;
}

// ── Escritura (panel) ──────────────────────────────────────────────────────────
function mutateLocal(fn) {
  const state = readLocal();
  const result = fn(state);
  writeLocal(state);
  return result;
}
const newId = () => Date.now() + Math.floor(Math.random() * 1000);

async function upsertRemote(table, row, id) {
  const query = id
    ? supabase.from(table).update(row).eq("id", id).select().single()
    : supabase.from(table).insert(row).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function deleteRemote(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export const catalogApi = {
  async saveCategory(cat) {
    if (isRemote) return catFromRow(await upsertRemote("categories", catToRow(cat), cat.id));
    return mutateLocal((s) => {
      const i = s.categories.findIndex((c) => c.id === cat.id);
      if (i >= 0) s.categories[i] = { ...s.categories[i], ...cat, subcategories: s.categories[i].subcategories };
      else s.categories.push({ ...cat, id: newId(), subcategories: [] });
      return cat;
    });
  },

  async deleteCategory(id) {
    if (isRemote) return deleteRemote("categories", id);
    mutateLocal((s) => { s.categories = s.categories.filter((c) => c.id !== id); });
  },

  async saveProduct(prod) {
    if (isRemote) return prodFromRow(await upsertRemote("products", prodToRow(prod), prod.id));
    return mutateLocal((s) => {
      s.categories.forEach((c) => { c.subcategories = c.subcategories.filter((p) => p.id !== prod.id); });
      const saved = { ...prod, id: prod.id || newId() };
      s.categories.find((c) => c.id === prod.categoryId)?.subcategories.push(saved);
      return saved;
    });
  },

  async deleteProduct(id) {
    if (isRemote) return deleteRemote("products", id);
    mutateLocal((s) => s.categories.forEach((c) => { c.subcategories = c.subcategories.filter((p) => p.id !== id); }));
  },

  async saveOption(opt) {
    if (isRemote) return optFromRow(await upsertRemote("options", optToRow(opt), opt.id));
    return mutateLocal((s) => {
      const i = s.options.findIndex((o) => o.id === opt.id);
      const saved = { ...opt, id: opt.id || newId() };
      if (i >= 0) s.options[i] = saved; else s.options.push(saved);
      return saved;
    });
  },

  async deleteOption(id) {
    if (isRemote) return deleteRemote("options", id);
    mutateLocal((s) => { s.options = s.options.filter((o) => o.id !== id); });
  },

  async savePortion(por) {
    if (isRemote) return porFromRow(await upsertRemote("portions", porToRow(por), por.id));
    return mutateLocal((s) => {
      const i = s.portions.findIndex((p) => p.id === por.id);
      const saved = { ...por, id: por.id || newId() };
      if (i >= 0) s.portions[i] = saved; else s.portions.push(saved);
      return saved;
    });
  },

  async deletePortion(id) {
    if (isRemote) return deleteRemote("portions", id);
    mutateLocal((s) => { s.portions = s.portions.filter((p) => p.id !== id); });
  },

  // Sube una foto comprimida y devuelve su URL pública
  async uploadImage(file) {
    if (!isRemote) return compressImage(file, 900, 0.78, "dataurl");
    const blob = await compressImage(file, 1600, 0.85, "blob");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: "image/webp" });
    if (error) throw error;
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  // Copia el catálogo actual a una base de datos vacía
  async seedRemote() {
    const state = getDefaultState();
    const optionMap = new Map();
    for (const o of state.options) {
      const row = await upsertRemote("options", optToRow(o));
      optionMap.set(o.id, row.id);
    }
    const portionMap = new Map();
    for (const p of state.portions) {
      const row = await upsertRemote("portions", porToRow(p));
      portionMap.set(p.id, row.id);
    }
    for (const c of state.categories) {
      const catRow = await upsertRemote("categories", catToRow(c));
      const rows = c.subcategories.map((p) => prodToRow({
        ...p,
        categoryId: catRow.id,
        portionIds: p.portionIds.map((id) => portionMap.get(id)),
        options: Object.fromEntries(Object.entries(p.options).map(([k, ids]) => [k, ids.map((id) => optionMap.get(id))])),
      }));
      const { error } = await supabase.from("products").insert(rows);
      if (error) throw error;
    }
  },

  resetLocal() {
    try { localStorage.removeItem(LOCAL_KEY); } catch { /* nada que borrar */ }
  },
};

export function useInvalidateCatalog() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
}

function compressImage(file, maxSide, quality, as) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      if (as === "dataurl") resolve(canvas.toDataURL("image/webp", quality));
      else canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/webp", quality);
    };
    img.onerror = () => reject(new Error("El archivo no es una imagen válida"));
    img.src = URL.createObjectURL(file);
  });
}
