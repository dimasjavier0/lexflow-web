import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WordSearch } from "../components/word-search";
import { Alert, Button, buttonClasses, EmptyState, Eyebrow } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { LevelSection } from "../features/catalog/level-section";
import { errorMessage } from "../hooks/use-async-action";
import { AppLayout } from "../layouts/app-layout";
import { getDueReviews, getLevelCatalog, getLevelProgress, type CatalogLevel, type LevelProgress } from "../lib/api";
import { isCefrLevel, type CefrLevel } from "../lib/levels";

const OPEN_LEVELS_STORAGE_KEY = "lexflow.openLevels";
/** The level picked with the chips this page had before the levels became sections. */
const LEGACY_LEVEL_STORAGE_KEY = "lexflow.level";

function readOpenLevels(): CefrLevel[] | null {
  try {
    const stored = window.localStorage.getItem(OPEN_LEVELS_STORAGE_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(isCefrLevel) : null;
    }
    const legacy = window.localStorage.getItem(LEGACY_LEVEL_STORAGE_KEY);
    return isCefrLevel(legacy) ? [legacy] : null;
  } catch {
    return null;
  }
}

function storeOpenLevels(levels: CefrLevel[]): void {
  try {
    window.localStorage.setItem(OPEN_LEVELS_STORAGE_KEY, JSON.stringify(levels));
  } catch {
    // Private mode or blocked storage: the open sections just last for this visit.
  }
}

/** Until the learner opens or closes a level themselves, the first level with words starts open. */
function defaultOpenLevels(levels: CatalogLevel[]): CefrLevel[] {
  const first = levels.find((entry) => entry.words > 0);
  return first ? [first.level] : [];
}

export function HomePage() {
  const { apiUser, session } = useAuth();
  const [levels, setLevels] = useState<CatalogLevel[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [progress, setProgress] = useState<Record<CefrLevel, LevelProgress> | null>(null);
  const [openLevels, setOpenLevels] = useState<CefrLevel[] | null>(readOpenLevels);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setLoadError(null);
    getLevelCatalog()
      .then((loaded) => {
        if (isCurrent) setLevels(loaded);
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(errorMessage(error, "No se pudieron cargar los niveles."));
      });
    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isCurrent = true;
    if (!session) {
      setProgress(null);
      return;
    }
    // Optional decoration: without it the levels simply show their size.
    getLevelProgress(session)
      .then((loaded) => {
        if (isCurrent) setProgress(loaded);
      })
      .catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, [session]);

  useEffect(() => {
    let isCurrent = true;
    if (!session) {
      setDueCount(0);
      return;
    }
    getDueReviews(session, 1)
      .then((queue) => {
        if (isCurrent) setDueCount(queue.total);
      })
      .catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, [session]);

  const visibleOpenLevels = openLevels ?? (levels ? defaultOpenLevels(levels) : []);
  const toggleLevel = useCallback(
    (level: CefrLevel) => {
      const next = visibleOpenLevels.includes(level) ? visibleOpenLevels.filter((item) => item !== level) : [...visibleOpenLevels, level];
      storeOpenLevels(next);
      setOpenLevels(next);
    },
    [visibleOpenLevels],
  );

  const isLoading = levels === null && !loadError;
  const hasWords = levels?.some((entry) => entry.words > 0) ?? false;

  return (
    <AppLayout className="bg-[radial-gradient(circle_at_88%_10%,var(--color-teal-soft),transparent_29rem)]">
      <section className="mx-auto mt-16 mb-9 max-w-2xl sm:mt-20 sm:mb-11 sm:text-center">
        <Eyebrow>Tu ruta de vocabulario</Eyebrow>
        <h1 className="mx-auto mt-3 mb-3.5 max-w-xl text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.98] font-bold tracking-tighter">Aprende una palabra cada vez.</h1>
        <p className="m-0 text-lg text-muted">Avanza nivel a nivel, de A1 a C2, con vocabulario por temas.</p>
        {apiUser ? <p className="mt-5 text-xs text-muted">Conectado como {apiUser.name ?? apiUser.email}</p> : null}
        {/* Lessons need a session, so the search is only offered once signed in. */}
        {session ? <div className="mt-7"><WordSearch /></div> : null}
      </section>
      {dueCount ? (
        <Alert tone="info" className="mb-6" action={<Link className={buttonClasses({ size: "sm", className: "shrink-0" })} to="/review">Repasar ahora</Link>}>
          {dueCount === 1 ? "Tienes 1 palabra pendiente de repaso." : `Tienes ${dueCount} palabras pendientes de repaso.`}
        </Alert>
      ) : null}
      {loadError ? <Alert className="mb-6" action={<Button variant="secondary" size="sm" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</Button>}>{loadError}</Alert> : null}
      {!session && hasWords ? <p className="mb-4 text-sm text-muted"><Link className="font-semibold text-teal-dark" to="/login">Inicia sesión</Link> para ver cuánto te falta para dominar cada nivel.</p> : null}
      <div className="grid gap-4" aria-label="Niveles de vocabulario" aria-busy={isLoading}>
        {isLoading ? [0, 1, 2].map((item) => <div key={item} aria-hidden="true" className="h-24 animate-pulse rounded-3xl border border-line bg-surface/70" />) : null}
        {levels?.map((entry) => (
          <LevelSection key={entry.level} entry={entry} progress={progress?.[entry.level]} isOpen={visibleOpenLevels.includes(entry.level)} onToggle={() => toggleLevel(entry.level)} />
        ))}
      </div>
      {levels && !hasWords ? <EmptyState title="Todavía no hay colecciones publicadas" description="Vuelve pronto: estamos preparando el primer vocabulario." /> : null}
    </AppLayout>
  );
}
