import { useRef } from "react";
import { useInView } from "framer-motion";

export default function useSlideReveal(direction = "up", delay = 0) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const variants = {
    up: { y: 44 },
    down: { y: -44 },
    left: { x: 44 },
    right: { x: -44 },
  };

  const initial = { opacity: 0, ...variants[direction] };
  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : initial;

  const transition = {
    duration: 0.95,
    ease: [0.22, 1, 0.36, 1],
    delay,
  };

  return { ref, animate, initial, transition, isInView };
}