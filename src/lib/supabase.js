import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin variables de entorno la página funciona con el catálogo local (modo demo)
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isRemote = Boolean(supabase);

export const STORAGE_BUCKET = "catalogo";
