"use client";

import { useEffect, useRef } from "react";

export default function Stars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = 120;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2.5 + 0.5;
      const isSakura = Math.random() < 0.12;
      const color = isSakura ? "rgba(249,168,212,0.9)" : "white";
      star.className = "star";
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 4 + 2}s;
        animation-delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.7 + 0.1};
        background: ${color};
      `;
      fragment.appendChild(star);
    }

    container.appendChild(fragment);
    return () => { container.innerHTML = ""; };
  }, []);

  return <div ref={containerRef} className="stars" aria-hidden="true" />;
}
