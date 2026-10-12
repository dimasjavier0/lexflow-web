import { Link } from "react-router-dom";
import { cn } from "../lib/cn";

/** The LexFlow symbol: a coral drop with an L inside. Keep in sync with public/favicon.svg and public/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={cn("inline-block size-6 shrink-0", className)}>
      <path className="fill-coral" d="M32 5C32 5 11 27 11 39a21 21 0 0 0 42 0C53 27 32 5 32 5Z" />
      <path d="M26 26v20h13" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandMark() {
  return (
    <Link to="/" aria-label="LexFlow inicio" className="inline-flex items-center gap-1.5 text-sm font-black tracking-[0.15em] text-ink no-underline">
      <LogoMark />
      LEXFLOW
    </Link>
  );
}
