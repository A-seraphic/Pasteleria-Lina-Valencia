import { useEffect } from "react";

let locks = 0;

// Bloquea el scroll de la página mientras un modal está abierto
export default function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.style.overflow = "hidden";
    document.body.dataset.scrollLocked = "1";
    return () => {
      locks -= 1;
      if (locks === 0) {
        document.body.style.overflow = "";
        delete document.body.dataset.scrollLocked;
      }
    };
  }, [active]);
}
