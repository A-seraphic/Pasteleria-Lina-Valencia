import { useEffect, useState } from "react";

export default function ScrollBackground() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bg = `linear-gradient(180deg, #fdfaf5 ${Math.max(0, 40 - progress * 40)}%, #eed3d7 ${100 - (1 - progress) * 30}%)`;

  return (
    <div
      className="fixed inset-0 z-[-1] transition-none"
      style={{ background: bg }}
    />
  );
}