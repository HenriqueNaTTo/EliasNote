import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="landing-rule h-px w-5 bg-primary/60" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-balance text-[24px] font-semibold leading-tight tracking-tight sm:text-[30px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">{description}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="landing-canvas pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background"
        aria-hidden
      />
      <div className="landing-hero-glow pointer-events-none absolute -right-24 -top-28 h-72 w-72 opacity-70" aria-hidden />
      <Container className="relative py-10 sm:py-14">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="landing-rule h-px w-5 bg-primary/60" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-balance text-[30px] font-semibold leading-[1.08] tracking-tight sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
          {description}
        </p>
        {children ? <div className="mt-5">{children}</div> : null}
      </Container>
    </header>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted/70 px-1.5 font-mono text-[10.5px] text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

function legacyCopy(value: string): boolean {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(area);
  return copied;
}

export function CopyButton({
  value,
  label = "Copiar",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function handleCopy() {
    let ok = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        ok = legacyCopy(value);
      }
    } catch {
      ok = legacyCopy(value);
    }

    if (!ok) return;
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded border border-border bg-background px-2 text-[10.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        copied && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
        className,
      )}
      aria-label={copied ? "Copiado" : label}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado" : label}
    </button>
  );
}

export function CodeBlock({
  title,
  code,
  note,
  className,
}: {
  title?: string;
  code: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden border border-border bg-[hsl(var(--sidebar))]", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <span className="font-mono text-[10.5px] text-muted-foreground">{title ?? "terminal"}</span>
        <CopyButton value={code} className="h-6" />
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      {note ? <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">{note}</p> : null}
    </div>
  );
}
