import { useRef } from "react";
import { useInView } from "framer-motion";

export default function useSlideReveal(direction = "up", delay = 0) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 },
  };

  const initial = { opacity: 0, ...variants[direction] };
  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : initial;

  const transition = {
    duration: 1.4,
    ease: [0.22, 1, 0.36, 1],
    delay,
  };

  return { ref, animate, initial, transition, isInView };
}