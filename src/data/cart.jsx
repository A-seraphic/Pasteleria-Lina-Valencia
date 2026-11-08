import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "lv-mi-pedido-v1";
const CartContext = createContext(null);

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * "Mi pedido": los productos personalizados que el cliente va agregando.
 * Se guarda en el navegador para que no se pierda si cierra la página.
 * Cada item: { uid, category, design, img, rows, answers, note, total, priceText, leadDays }
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readSaved);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // sin almacenamiento disponible: el pedido vive solo mientras la página esté abierta
    }
  }, [items]);

  const add = useCallback((item) => setItems((list) => [...list, { ...item, uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]), []);
  const remove = useCallback((uid) => setItems((list) => list.filter((i) => i.uid !== uid)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((t, i) => t + (Number(i.total) || 0), 0),
      leadDays: items.reduce((m, i) => Math.max(m, Number(i.leadDays) || 0), 0),
      add,
      remove,
      clear,
      open,
      setOpen,
    }),
    [items, add, remove, clear, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
