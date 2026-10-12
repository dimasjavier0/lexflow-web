import { cn } from "../../lib/cn";

/** Loading mark: the L inside a ring that fills from empty to complete, over and over. With reduced motion the ring stays complete. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={cn("inline-block size-5 shrink-0 text-ink", className)}>
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeOpacity=".15" strokeWidth="6" />
      <circle cx="32" cy="32" r="24" pathLength="100" strokeDasharray="100" strokeWidth="6" strokeLinecap="round" transform="rotate(-90 32 32)" className="animate-ring-fill stroke-teal motion-reduce:animate-none" />
      <circle cx="32" cy="8" r="5.5" className="origin-center animate-ring-dot fill-coral motion-reduce:animate-none" />
      <path d="M27 22v20h12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
