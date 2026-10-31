import { useEffect, useState } from "react";
import { supabase, isRemote } from "@/lib/supabase";
import { useInvalidateCatalog } from "@/data/catalogStore";
import { toast } from "sonner";

// Sesión del panel: en modo remoto exige usuario de Supabase registrado como dueño
export function useAdminSession() {
  const [state, setState] = useState({ loading: isRemote, user: null, isAdmin: !isRemote });

  useEffect(() => {
    if (!isRemote) return;
    const check = async (session) => {
      if (!session) return setState({ loading: false, user: null, isAdmin: false });
      const { data, error } = await supabase.rpc("is_admin");
      setState({ loading: false, user: session.user, isAdmin: !error && data === true });
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { check(session); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos" : error.message);
}

export const signOut = () => supabase?.auth.signOut();

// Ejecuta una acción del panel con aviso de éxito/error y refresca el catálogo
export function useAction() {
  const invalidate = useInvalidateCatalog();
  return async (fn, success = "Cambios guardados") => {
    try {
      const result = await fn();
      await invalidate();
      if (success) toast.success(success, { duration: 2200 });
      return result;
    } catch (err) {
      toast.error("No se pudo guardar", { description: err.message || String(err) });
      throw err;
    }
  };
}

export const nextSort = (list) => (list.length ? Math.max(...list.map((x) => x.sort ?? 0)) + 1 : 0);
