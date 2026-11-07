import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const group = (stagger, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const item = (y) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
});

/**
 * Revela sus <RevealItem> en cascada (título, texto, imagen) cuando entra en pantalla.
 * El contenido siempre existe en el HTML; solo se anima su aparición.
 */
export function Reveal({ as = "div", children, className, stagger = 0.08, delay = 0, amount = 0.25, ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={group(stagger, delay)} {...rest}>
      {children}
    </Comp>
  );
}

export function RevealItem({ as = "div", children, className, y = 24, ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item(y)} {...rest}>
      {children}
    </Comp>
  );
}

// Título que sube línea por línea desde una máscara
export function SplitTitle({ lines, className, as = "h2", delay = 0, style = { color: "var(--lv-wine)" } }) {
  const Comp = motion[as];
  return (
    <Comp className={className} style={style} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }}
      variants={group(0.1, delay)} aria-label={lines.join(" ")}>
      {lines.map((l, i) => (
        <span key={i} aria-hidden className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 1, ease: EASE } } }}>
            {l}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}
