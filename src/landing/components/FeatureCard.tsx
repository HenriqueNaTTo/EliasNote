import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye } from "lucide-react";
import type { Feature } from "@/landing/data";
import { FeaturePreview } from "./FeaturePreview";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 232;
const GAP = 12;

interface PanelLayout {
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
}

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const cardRef = useRef<HTMLElement | null>(null);
  const focusedRef = useRef(false);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<PanelLayout | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function clearTimers() {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }

  function scheduleOpen() {
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpen(true), 110);
  }

  function scheduleClose() {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), 80);
  }

  useEffect(() => {
    if (!open) {
      setLayout(null);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }

      const width = Math.min(PANEL_WIDTH, window.innerWidth - 24);
      const above = rect.top > PANEL_HEIGHT + GAP + 8;
      const left = Math.min(
        Math.max(12, rect.left + rect.width / 2 - width / 2),
        Math.max(12, window.innerWidth - width - 12),
      );
      const top = above
        ? rect.top - PANEL_HEIGHT - GAP
        : Math.min(rect.bottom + GAP, window.innerHeight - PANEL_HEIGHT - 8);

      setLayout({ top: Math.max(8, top), left, width, placement: above ? "top" : "bottom" });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <>
      <article
        ref={cardRef}
        tabIndex={0}
        onMouseEnter={scheduleOpen}
        onMouseLeave={() => {
          if (!focusedRef.current) scheduleClose();
        }}
        onFocus={() => {
          focusedRef.current = true;
          clearTimers();
          setOpen(true);
        }}
        onBlur={() => {
          focusedRef.current = false;
          clearTimers();
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            event.stopPropagation();
          }
        }}
        className={cn(
          "landing-lift group flex h-full gap-3 border border-border bg-card p-4 outline-none transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30",
          open && "border-primary/40 bg-accent/20",
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="text-[12.5px] font-semibold tracking-tight">{feature.title}</h3>
            <Eye
              className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary group-focus-visible:text-primary"
              aria-hidden
            />
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{feature.description}</p>
          <span className="mt-2 inline-flex w-fit items-center gap-1 border border-transparent px-1 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground/50 transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary group-focus-visible:border-primary/20 group-focus-visible:bg-primary/5 group-focus-visible:text-primary">
            <Eye className="h-2.5 w-2.5" aria-hidden />
            Prévia
          </span>
          <span className="sr-only">Passe o mouse ou foque para ver a prévia da interface.</span>
        </div>
      </article>

      {open && layout
        ? createPortal(
            <div
              aria-hidden="true"
              data-placement={layout.placement}
              className="landing-preview-pop pointer-events-none fixed z-[70] overflow-hidden border border-border bg-background shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]"
              style={{ top: layout.top, left: layout.left, width: layout.width }}
            >
              <div className="h-[200px] w-full">
                <FeaturePreview feature={feature} />
              </div>
              <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
                <span className="truncate text-[10px] font-medium">{feature.title}</span>
                <span className="ml-auto shrink-0 text-[8.5px] uppercase tracking-wider text-muted-foreground">
                  Prévia da interface
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
