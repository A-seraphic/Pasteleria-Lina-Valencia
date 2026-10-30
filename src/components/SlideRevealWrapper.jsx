import { motion } from "framer-motion";
import useSlideReveal from "./useSlideReveal";

export default function SlideRevealWrapper({
  children,
  direction = "up",
  delay = 0,
  className = "",
}) {
  const { ref, animate, initial, transition } = useSlideReveal(direction, delay);

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}