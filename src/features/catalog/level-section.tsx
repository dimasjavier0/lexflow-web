import { CollectionCard } from "../../components/collection-card";
import type { CatalogLevel, LevelProgress } from "../../lib/api";
import { cn } from "../../lib/cn";
import { CEFR_LEVEL_NAMES } from "../../lib/levels";

type LevelSectionProps = {
  entry: CatalogLevel;
  /** Omitted when signed out: the header then shows the size of the level instead of progress. */
  progress?: LevelProgress;
  isOpen: boolean;
  onToggle: () => void;
};

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** One CEFR level of the home page: a header with the learner's progress that opens onto its topic collections. */
export function LevelSection({ entry, progress, isOpen, onToggle }: LevelSectionProps) {
  const { level, words, collections } = entry;
  const isEmpty = words === 0;
  const known = Math.min(progress?.known ?? 0, words);
  const percent = words ? Math.floor((known / words) * 100) : 0;
  const panelId = `level-${level}`;
  const isMastered = progress !== undefined && words > 0 && known === words;

  return (
    <section className={cn("overflow-hidden rounded-3xl border bg-surface shadow-card", isOpen ? "border-teal" : "border-line")} aria-labelledby={`${panelId}-heading`}>
      <h2 id={`${panelId}-heading`} className="m-0">
        <button
          type="button"
          className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-4 text-left sm:px-6 sm:py-5", isEmpty ? "cursor-default" : "cursor-pointer hover:bg-teal-soft/40")}
          aria-expanded={isEmpty ? undefined : isOpen}
          aria-controls={isEmpty ? undefined : panelId}
          disabled={isEmpty}
          onClick={onToggle}
        >
          <span aria-hidden="true" className={cn("grid size-14 place-items-center rounded-2xl text-xl font-black tracking-tight sm:size-16 sm:text-2xl", isEmpty ? "bg-line/60 text-muted" : "bg-teal-soft text-teal-dark")}>{level}</span>
          <span className="grid min-w-0 gap-0.5">
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              <span className="sr-only">Nivel {level}: </span>
              {CEFR_LEVEL_NAMES[level]}
            </span>
            <span className="text-sm text-muted">
              {isEmpty ? "Próximamente" : `${plural(collections.length, "colección", "colecciones")} · ${plural(words, "palabra", "palabras")}`}
            </span>
          </span>
          <span className="flex items-center gap-3">
            {progress && !isEmpty ? (
              <span className="grid justify-items-end leading-none">
                <span className={cn("text-2xl font-black tabular-nums sm:text-3xl", isMastered ? "text-teal-dark" : "text-ink")}>{percent} %</span>
                <span className="mt-1 hidden text-xs text-muted sm:block">para dominar {level}</span>
              </span>
            ) : null}
            {isEmpty ? null : (
              <svg aria-hidden="true" viewBox="0 0 20 20" className={cn("size-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-180")}>
                <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>
      </h2>
      {progress && !isEmpty ? (
        <div className="-mt-1 grid gap-1.5 px-4 pb-4 sm:px-6 sm:pb-5">
          <span
            className="block h-2 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`Progreso para dominar ${level}`}
            aria-valuemin={0}
            aria-valuemax={words}
            aria-valuenow={known}
            aria-valuetext={`${percent} %: ${known} de ${words} palabras`}
          >
            <span className="block h-full rounded-full bg-teal transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(known / words) * 100}%` }} />
          </span>
          <span className="text-xs text-muted">
            {isMastered ? `¡Dominas las ${words} palabras de ${level}!` : `${known} de ${plural(words, "palabra aprendida", "palabras aprendidas")} · faltan ${words - known} para dominar ${level}`}
          </span>
        </div>
      ) : null}
      {isOpen && !isEmpty ? (
        <div id={panelId} className="grid gap-4.5 border-t border-line bg-paper/60 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} level={level} learnedCount={progress ? (progress.collections[collection.id] ?? 0) : undefined} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
