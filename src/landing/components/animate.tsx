import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Respeita a preferência do sistema por menos movimento. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }

    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);

  return reduced;
}

/**
 * Um único listener de scroll (com requestAnimationFrame) atende todas as
 * revelações. Também cobre saltos de scroll — com IntersectionObserver, pular
 * uma seção a deixava invisível para sempre.
 */
type VisibilityCheck = () => boolean;

const visibilityChecks = new Set<VisibilityCheck>();
let checkFrame = 0;
let listening = false;

function runChecks() {
  checkFrame = 0;
  for (const check of [...visibilityChecks]) {
    if (check()) visibilityChecks.delete(check);
  }
  if (visibilityChecks.size === 0) stopListening();
}

function scheduleChecks() {
  if (checkFrame) return;
  checkFrame = window.requestAnimationFrame(runChecks);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", scheduleChecks, { passive: true });
  window.addEventListener("resize", scheduleChecks);
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", scheduleChecks);
  window.removeEventListener("resize", scheduleChecks);
  if (checkFrame) {
    window.cancelAnimationFrame(checkFrame);
    checkFrame = 0;
  }
}

function watchVisibility(check: VisibilityCheck): () => void {
  visibilityChecks.add(check);
  startListening();
  scheduleChecks();

  return () => {
    visibilityChecks.delete(check);
    if (visibilityChecks.size === 0) stopListening();
  };
}

function isNearViewport(node: HTMLElement): boolean {
  return node.getBoundingClientRect().top < window.innerHeight * 0.92;
}

export type RevealVariant = "up" | "fade" | "scale" | "left" | "right";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso em milissegundos para escalonar itens de uma lista. */
  delay?: number;
  variant?: RevealVariant;
  style?: CSSProperties;
}

/** Aparece suavemente quando entra na viewport (uma única vez). */
export function Reveal({ children, className, delay = 0, variant = "up", style }: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const stop = watchVisibility(() => {
      if (!isNearViewport(node)) return false;
      setVisible(true);
      return true;
    });

    return stop;
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={cn("landing-reveal", variant !== "up" && `landing-reveal-${variant}`, className)}
      data-visible={visible || reduced ? "true" : undefined}
      style={{ transitionDelay: reduced ? undefined : `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Conta de zero até o valor quando o número entra na viewport. */
export function CountUp({ value, suffix = "", duration = 1100 }: { value: number; suffix?: string; duration?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let animationFrame = 0;
    const stop = watchVisibility(() => {
      if (!isNearViewport(node)) return false;

      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) animationFrame = window.requestAnimationFrame(tick);
      };
      animationFrame = window.requestAnimationFrame(tick);
      return true;
    });

    return () => {
      stop();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [reduced, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
