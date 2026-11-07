import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600);
    }, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "var(--lv-wine-deep)" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="font-display text-5xl md:text-7xl font-semibold"
              style={{ color: "var(--lv-cream)" }}
            >
              Lina Valencia
            </span>
            <span
              className="font-inter text-[15px] md:text-[17px]"
              style={{ color: "var(--lv-gold-soft)" }}
            >
              Pastelería de autor
            </span>
          </motion.div>

          <motion.div
            className="mt-10 h-[1px] rounded-full"
            style={{ background: "#d4af37" }}
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}