import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Field, Input, Modal, ProgressBar, Select } from "../../components/ui";
import { errorMessage, useAsyncAction } from "../../hooks/use-async-action";
import { createWordsBulk, previewWordsBulk, type BulkPreviewProgress, type BulkWordInput, type BulkWordsInput, type BulkWordsProgress, type BulkWordsResult } from "../../lib/admin-api";
import { cn } from "../../lib/cn";
import type { CefrLevel } from "../../lib/levels";
import { normalizeText, slugify } from "../../lib/slug";
import { BulkWordsPreview, MAX_PICKED_IMAGES, needsImages, type DraftList, type DraftWord } from "./bulk-words-preview";
import { MAX_BULK_LISTS, MAX_BULK_WORDS, parseBulkMarkdown, type BulkLine, type BulkList } from "./parse-bulk-lines";
import type { AdminLibrary } from "./use-admin-library";

const NEW_COLLECTION = "new";

const LINE_SYMBOLS: Record<BulkLine["status"], string> = { valid: "✓", warning: "⚠", invalid: "✕", empty: "·", heading: "#" };
const LINE_CLASSES: Record<BulkLine["status"], string> = {
  valid: "text-[#cbd8e3] [&>b]:text-[#72d6a0]",
  warning: "bg-sun/10 text-[#f8d57a]",
  invalid: "bg-red-700/15 text-[#ff9b9b]",
  empty: "text-[#6f8496]",
  heading: "bg-white/5 font-bold text-[#8fd3ff]",
};

const PLACEHOLDER = "# Animals\n- cat, gato, A1\n- dog, perro, A1\n\n# Food\napple, manzana, A1\nbread, pan\nflour, harina, B1";

/** Where a list goes: a collection id, or "new" with the name and slug the API matches or creates. */
type ListTarget = { collectionId: string; name: string; input: Pick<BulkWordsInput, "collectionName" | "collectionSlug"> };

/** A list whose preview is on screen, ready to save as shown. */
type PreparedList = { target: ListTarget; draft: DraftList };

/** The word as the save receives it, with the images picked in the preview for the words that get some. */
function toBulkInput(word: DraftWord): BulkWordInput {
  const input: BulkWordInput = { term: word.term, translationEs: word.translationEs, level: word.level as CefrLevel };
  if (!needsImages(word)) return input;
  return { ...input, images: word.picked.map((index) => ({ url: word.candidates[index].url, attribution: word.candidates[index].attribution, metadata: word.candidates[index].metadata })) };
}

type BulkWordsModalProps = {
  library: AdminLibrary;
  onClose: () => void;
  /** Called as each list is saved, so finished lists show up even if a later one fails. */
  onListDone: (result: BulkWordsResult) => void;
  onDone: (results: BulkWordsResult[]) => void;
};

export function BulkWordsModal({ library, onClose, onListDone, onDone }: BulkWordsModalProps) {
  const collections = library.collections ?? [];
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? NEW_COLLECTION);
  const [collectionName, setCollectionName] = useState("");
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const collectionSlug = customSlug ?? slugify(collectionName);
  const [text, setText] = useState("");
  // Set once every list has its preview; nothing is saved until it is confirmed.
  const [prepared, setPrepared] = useState<PreparedList[] | null>(null);
  const [searchProgress, setSearchProgress] = useState<{ label: string; step: BulkPreviewProgress | null; found: { imagesFound: number; imagesMissing: number } } | null>(null);
  // `step` covers the list being saved; `saved` adds up the lists already finished.
  const [progress, setProgress] = useState<{ label: string; step: BulkWordsProgress | null; saved: { withImages: number; withoutImages: number; withoutAudio: number } } | null>(null);
  const preview = useAsyncAction();
  const save = useAsyncAction();
  const contentRef = useRef<HTMLDivElement>(null);
  const isPreviewing = prepared !== null;

  // The dialog keeps its scroll position across steps; each step starts at its top.
  useEffect(() => {
    contentRef.current?.closest("dialog")?.scrollTo({ top: 0 });
  }, [isPreviewing]);

  const { lines, lists } = useMemo(() => parseBulkMarkdown(text), [text]);
  const validCount = lists.reduce((sum, list) => sum + list.words.length, 0);
  const invalidCount = lines.filter((line) => line.status === "invalid").length;
  // Words written before any heading go to the collection picked in the form.
  const hasUntitledList = lists.some((list) => list.title === null);
  const isCollectionPickerVisible = hasUntitledList || lists.length === 0;
  const oversizedList = lists.find((list) => list.words.length > MAX_BULK_WORDS);
  const limitError = oversizedList
    ? `“${oversizedList.title ?? "La lista sin título"}” supera las ${MAX_BULK_WORDS} palabras por lista.`
    : lists.length > MAX_BULK_LISTS ? `Máximo ${MAX_BULK_LISTS} listas por carga.` : null;

  const existingCollection = (title: string) => collections.find((collection) => normalizeText(collection.name) === normalizeText(title) || collection.slug === slugify(title));

  // Titled lists are matched to a collection by name on the server; it creates the missing ones.
  const listTarget = (list: BulkList): ListTarget => {
    if (list.title !== null) return { collectionId: NEW_COLLECTION, name: list.title, input: { collectionName: list.title, collectionSlug: slugify(list.title) } };
    if (collectionId === NEW_COLLECTION) return { collectionId, name: collectionName.trim(), input: { collectionName: collectionName.trim(), collectionSlug } };
    return { collectionId, name: collections.find((collection) => collection.id === collectionId)?.name ?? "", input: {} };
  };

  const prepare = async (event: FormEvent) => {
    event.preventDefault();
    const { session } = library;
    if (!session || !validCount || limitError) return;
    const ready: PreparedList[] = [];
    const found = { imagesFound: 0, imagesMissing: 0 };
    const isReady = await preview.run(async () => {
      for (const [index, list] of lists.entries()) {
        const target = listTarget(list);
        setSearchProgress({ label: lists.length > 1 ? `Lista ${index + 1} de ${lists.length}: ${target.name}` : target.name, step: null, found: { ...found } });
        try {
          const result = await previewWordsBulk(session, target.collectionId, { words: list.words, ...target.input }, (step) => setSearchProgress((current) => current && { ...current, step }));
          // The save keeps the first results unless the admin picks others.
          const words = result.words.map((word) => ({ ...word, picked: word.candidates.slice(0, MAX_PICKED_IMAGES).map((_, position) => position) }));
          for (const word of words.filter(needsImages)) found[word.candidates.length ? "imagesFound" : "imagesMissing"] += 1;
          ready.push({ target, draft: { ...result, words } });
        } catch (error) {
          throw new Error(`“${target.name}”: ${errorMessage(error, "no se pudo preparar la vista previa.")}`);
        }
      }
    }, "No se pudo preparar la vista previa.");
    setSearchProgress(null);
    if (isReady) setPrepared(ready);
  };

  const pick = (listIndex: number, wordIndex: number, picked: number[]) => {
    setPrepared((current) => current && current.map((item, index) => index !== listIndex ? item : {
      ...item,
      draft: { ...item.draft, words: item.draft.words.map((word, position) => position === wordIndex ? { ...word, picked } : word) },
    }));
  };

  const confirm = async () => {
    const { session } = library;
    if (!session || !prepared?.length) return;
    const queue = prepared;
    const results: BulkWordsResult[] = [];
    const saved = { withImages: 0, withoutImages: 0, withoutAudio: 0 };
    const isComplete = await save.run(async () => {
      for (const [index, item] of queue.entries()) {
        const { target, draft } = item;
        setProgress({ label: queue.length > 1 ? `Lista ${index + 1} de ${queue.length}: ${target.name}` : target.name, step: null, saved: { ...saved } });
        try {
          const result = await createWordsBulk(session, target.collectionId, { words: draft.words.map(toBulkInput), ...target.input }, (step) => setProgress((current) => current && { ...current, step }));
          results.push(result);
          saved.withImages += result.words.length - result.withoutImages;
          saved.withoutImages += result.withoutImages;
          saved.withoutAudio += result.failedAudio;
          onListDone(result);
          // A retry after a failure only saves the lists still on screen.
          setPrepared((current) => current && current.filter((other) => other !== item));
        } catch (error) {
          const earlier = results.length ? ` ${results.length === 1 ? "La anterior sí se guardó" : `Las ${results.length} anteriores sí se guardaron`}; vuelve a confirmar para guardar el resto.` : "";
          throw new Error(`“${target.name}”: ${errorMessage(error, "no se pudo crear la lista.")}${earlier}`);
        }
      }
    }, "No se pudo crear la lista de palabras.");
    setProgress(null);
    if (isComplete) onDone(results);
  };

  const backToEditing = () => {
    setPrepared(null);
    save.clearError();
  };

  if (prepared) {
    const addedCount = prepared.reduce((sum, item) => sum + item.draft.words.filter((word) => word.status !== "linked").length, 0);
    return (
      <Modal title="Lista de palabras" eyebrow="Vista previa" size="lg" onClose={onClose}>
        <div ref={contentRef} className="grid gap-4">
          <p className="m-0 rounded-xl border border-sun bg-sun-soft px-3.5 py-2.5 text-sm leading-snug text-warning">
            <strong>Todavía no se ha guardado nada.</strong> Así quedarán las colecciones: pulsa una palabra para ver sus imágenes y cambiarlas. La pronunciación se genera al guardar.
          </p>
          <BulkWordsPreview lists={prepared.map((item) => item.draft)} onPick={pick} />
          {save.isPending && progress ? (
            <ProgressBar
              label={progress.label}
              unit="palabras"
              done={progress.step?.done ?? 0}
              total={progress.step?.total ?? null}
              item={progress.step?.item}
              details={[
                { label: "con imágenes", value: progress.saved.withImages + (progress.step?.counts.withImages ?? 0), tone: "good" as const },
                { label: "sin imágenes", value: progress.saved.withoutImages + (progress.step?.counts.withoutImages ?? 0), tone: "bad" as const },
                { label: "sin pronunciación", value: progress.saved.withoutAudio + (progress.step?.counts.withoutAudio ?? 0), tone: "bad" as const },
              ].filter((detail) => detail.value > 0 || detail.label.includes("imágenes"))}
            />
          ) : null}
          {save.error ? <Alert>{save.error}</Alert> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" disabled={save.isPending} onClick={backToEditing}>Volver a editar</Button>
            <Button disabled={!addedCount} isLoading={save.isPending} loadingLabel="Guardando..." onClick={() => void confirm()}>
              {addedCount ? `Confirmar y guardar ${addedCount} ${addedCount === 1 ? "palabra" : "palabras"}` : "No hay palabras nuevas"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Lista de palabras" eyebrow="Carga rápida" size="lg" onClose={onClose}>
      <div ref={contentRef}>
        <form className="grid gap-4" onSubmit={(event) => void prepare(event)}>
          <p className="m-0 text-sm leading-snug text-muted">
            Pega una o varias listas en Markdown: cada título (<code># Animals</code>) es una colección y debajo va una palabra por línea con su traducción y, si quieres, su nivel (<code>cat, gato, A1</code>).
            Las colecciones y palabras que ya existen se reutilizan, sin distinguir acentos ni mayúsculas, y conservan su nivel; el resto se crea como borrador con imágenes y pronunciación, en el nivel indicado o en A1 si la línea no lo trae.
            Antes de guardar verás cómo quedan las colecciones, con las imágenes de cada palabra.
          </p>
          <div className="overflow-hidden rounded-xl border border-[#26384b] bg-[#101923] font-mono shadow-card">
            <div className="flex items-center justify-between gap-3 bg-[#1b2937] px-3 py-2 text-xs text-[#d7e2ec]">
              <label htmlFor="bulk-words-text">Listas de palabras</label>
              <small className="text-[0.68rem] text-[#9fb2c2]"># título · palabra en inglés, traducción, nivel</small>
            </div>
            <textarea
              id="bulk-words-text"
              required
              rows={10}
              spellCheck={false}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={PLACEHOLDER}
              className="block w-full resize-y border-0 bg-transparent p-3.5 text-sm leading-7 text-[#dce7f0] caret-sun outline-none placeholder:text-[#6f8496]"
            />
            {text.trim() ? (
              <div className="grid max-h-44 overflow-auto border-t border-[#26384b] py-1.5 text-[0.72rem]" aria-live="polite">
                {lines.map((line) => (
                  <div key={line.line} className={cn("grid min-h-6 grid-cols-[1.75rem_1.25rem_minmax(0,1fr)_auto] items-center gap-1.5 px-2.5 py-0.5", LINE_CLASSES[line.status])}>
                    <span className="text-right text-[#6f8496]">{line.line}</span>
                    <b className="text-center" aria-hidden="true">{LINE_SYMBOLS[line.status]}</b>
                    <span className="truncate">{line.raw || "—"}</span>
                    <small className="text-[0.66rem] opacity-80">{line.message}</small>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {isCollectionPickerVisible ? (
            <Field label={lists.length > 1 ? "Colección para las palabras sin título" : "Colección"} hint={lists.length ? undefined : "Solo se usa para las palabras que no están bajo un título."}>
              <Select value={collectionId} onChange={(event) => setCollectionId(event.target.value)}>
                <option value={NEW_COLLECTION}>＋ Crear nueva colección</option>
                {collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
              </Select>
            </Field>
          ) : null}
          {isCollectionPickerVisible && collectionId === NEW_COLLECTION ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre de la colección">
                <Input required={hasUntitledList} maxLength={100} value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="Animals" />
              </Field>
              <Field label="Slug de la colección">
                <Input required={hasUntitledList} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={collectionSlug} onChange={(event) => setCustomSlug(event.target.value)} placeholder="animals" />
              </Field>
            </div>
          ) : null}
          {lists.some((list) => list.title !== null) ? (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Listas detectadas">
              {lists.filter((list) => list.title !== null).map((list) => (
                <li key={list.title}>
                  <Badge tone={existingCollection(list.title!) ? "neutral" : "teal"}>
                    {list.title} · {list.words.length} · {existingCollection(list.title!) ? "existente" : "nueva"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
          <p className={cn("m-0 text-xs font-extrabold", limitError ? "text-danger" : "text-teal-dark")}>
            {validCount} válidas · {invalidCount} inválidas{lists.length > 1 ? ` · ${lists.length} listas` : ""}{limitError ? ` · ${limitError}` : ""}
          </p>
          {preview.isPending && searchProgress ? (
            <ProgressBar
              label={`Buscando imágenes · ${searchProgress.label}`}
              unit="palabras"
              done={searchProgress.step?.done ?? 0}
              total={searchProgress.step?.total ?? null}
              item={searchProgress.step?.item}
              details={[
                { label: "con imágenes propuestas", value: searchProgress.found.imagesFound + (searchProgress.step?.counts.imagesFound ?? 0), tone: "good" as const },
                { label: "sin imágenes en Pixabay", value: searchProgress.found.imagesMissing + (searchProgress.step?.counts.imagesMissing ?? 0), tone: "bad" as const },
              ]}
            />
          ) : null}
          {preview.error ? <Alert>{preview.error}</Alert> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!validCount || limitError !== null} isLoading={preview.isPending} loadingLabel="Preparando vista previa...">Ver vista previa</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
