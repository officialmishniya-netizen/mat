"use client";
import { useEffect, useRef, useState } from "react";

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function parseTarget(raw: string): { prefix: string; suffix: string; value: number } {
  const match = raw.match(/^([^0-9]*)([0-9,]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return { prefix: "", suffix: "", value: 0 };
  return {
    prefix: match[1],
    value: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatNum(n: number, original: string): string {
  if (original.includes(",") && n >= 1000) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (original.includes(".")) {
    const decimals = original.split(".")[1]?.replace(/[^0-9]/g, "").length || 1;
    return n.toFixed(decimals);
  }
  return Math.round(n).toString();
}

export default function AnimatedCounter({
  value,
  duration = 1800,
  className = "",
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const { prefix, suffix, value: target } = parseTarget(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const current = easeOut(elapsed) * target;
            setDisplay(formatNum(current, value));
            if (elapsed < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
