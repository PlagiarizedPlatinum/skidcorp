'use client';
import { useEffect } from 'react';

export default function Particles() {
  useEffect(() => {
    const count = 55;
    const particles: HTMLElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 2.5 + Math.random() * 4;
      const drift = (Math.random() - 0.5) * 120;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}vw;
        bottom: -10px;
        opacity: ${0.6 + Math.random() * 0.4};
        animation-duration: ${12 + Math.random() * 18}s;
        animation-delay: -${Math.random() * 18}s;
        --drift: ${drift}px;
      `;
      document.body.appendChild(p);
      particles.push(p);
    }
    return () => particles.forEach(p => p.remove());
  }, []);
  return null;
}
