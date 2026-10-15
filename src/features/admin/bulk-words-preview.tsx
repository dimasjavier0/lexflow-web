import { useState } from "react";
import { Badge } from "../../components/ui";
import type { BulkListPreview, BulkWordPreview } from "../../lib/admin-api";
import { cn } from "../../lib/cn";
import { CollectionSummary } from "./collection-row";
import { WordSummary } from "./word-row";

/** Images a word keeps from its candidates, as on save; the first one is the cover. */
export const MAX_PICKED_IMAGES = 2;

/** A word of the preview with the candidates picked so far, by position. */
export type DraftWord = BulkWordPreview & { picked: number[] };

export type DraftList = Omit<BulkListPreview, "words"> & { words: DraftWord[] };

/** Words the save would give images to: the ones to add that have none yet. */
export function needsImages(word: BulkWordPreview): boolean {
  return word.status !== "linked" && word.images.length === 0;
}

/** Image URLs the word would end up with, cover first. */
function shownImages(word: DraftWord): string[] {
  return needsImages(word) ? word.picked.map((index) => word.candidates[index].previewUrl) : word.images;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

const STATUS_BADGES: Record<BulkWordPreview["status"], { label: string; tone: "teal" | "neutral" | "warning" }> = {
  new: { label: "Nueva", tone: "teal" },
  reused: { label: "Ya existe", tone: "neutral" },
  linked: { label: "Ya en la colección", tone: "warning" },
};

type PreviewWordRowProps = {
  word: DraftWord;
  onPick: (picked: number[]) => void;
};

/** A word laid out like the panel's word rows; opening it shows its images and lets the admin swap them. */
function PreviewWordRow({ word, onPick }: PreviewWordRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const images = shownImages(word);
  const status = STATUS_BADGES[word.status];

  const toggle = (index: number) => {
    // Past the limit, the oldest pick makes room for the new one.
    onPick(word.picked.includes(index) ? word.picked.filter((picked) => picked !== index) : [...word.picked, index].slice(-MAX_PICKED_IMAGES));
  };

  return (
    <li className={cn("overflow-hidden rounded-xl border bg-surface", isOpen ? "border-teal" : "border-line", word.status === "linked" && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-2">
        <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)} className="flex min-w-0 flex-1 basis-40 cursor-pointer items-center gap-3 rounded-lg p-1 text-left hover:bg-teal-soft/50">
          <WordSummary term={word.term} translationEs={word.translationEs} level={word.level} coverUrl={images[0]} />
        </button>
        <div className="flex flex-wrap items-center gap-1.5 pr-1">
          {images.length > 1 ? <Badge tone="neutral">+{images.length - 1} img</Badge> : null}
          {images.length ? null : <Badge tone="warning">Sin imágenes</Badge>}
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>
      {isOpen ? (
        <div className="grid gap-2.5 border-t border-line p-3">
          {word.status === "linked" ? <p className="m-0 text-xs text-muted">Ya está en esta colección: no se vuelve a añadir.</p> : null}
          {word.status === "reused" ? <p className="m-0 text-xs text-muted">Ya existe en otra colección: se añade con su traducción, su nivel y sus imágenes.</p> : null}
          {needsImages(word) ? (
            word.candidates.length ? (
              <>
                <p className="m-0 text-xs text-muted">Elige hasta {MAX_PICKED_IMAGES} imágenes; la primera es la portada. Sin ninguna, la palabra se guarda sin imágenes.</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {word.candidates.map((candidate, index) => {
                    const order = word.picked.indexOf(index);
                    return (
                      <button
                        key={candidate.url}
                        type="button"
                        aria-pressed={order >= 0}
                        aria-label={`${order >= 0 ? "Quitar" : "Elegir"} la imagen ${index + 1} de ${word.term}`}
                        onClick={() => toggle(index)}
                        className={cn("relative cursor-pointer overflow-hidden rounded-lg border-2 p-0", order >= 0 ? "border-teal" : "border-transparent opacity-60 hover:opacity-100")}
                      >
                        <img className="block aspect-[4/3] w-full bg-teal-soft object-cover" src={candidate.previewUrl} alt="" />
                        {order >= 0 ? <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-teal text-[0.7rem] font-black text-white">{order + 1}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="m-0 text-xs text-muted">Pixabay no encontró imágenes. Podrás añadirlas después desde el editor de la palabra.</p>
            )
          ) : images.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {images.map((url, index) => <img key={url} className="block aspect-[4/3] w-full rounded-lg bg-teal-soft object-cover" src={url} alt={`Imagen ${index + 1} de ${word.term}`} />)}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

type BulkWordsPreviewProps = {
  lists: DraftList[];
  onPick: (listIndex: number, wordIndex: number, picked: number[]) => void;
};

/** Each list as the collection it would land in, with its words as the panel lists them. Nothing here is saved. */
export function BulkWordsPreview({ lists, onPick }: BulkWordsPreviewProps) {
  return (
    <ul className="m-0 grid list-none gap-3 p-0" aria-label="Vista previa de las listas">
      {lists.map((list, listIndex) => {
        const { collection } = list;
        const added = list.words.filter((word) => word.status !== "linked");
        const newCount = added.filter((word) => word.status === "new").length;
        const linkedCount = list.words.length - added.length;
        const withoutImages = added.filter((word) => !shownImages(word).length).length;
        const detail = collection.isNew ? `/${collection.slug} · colección nueva` : `/${collection.slug} · ${plural(collection.wordCount, "palabra", "palabras")} ahora`;
        return (
          <li key={collection.id ?? `new-${collection.slug}`} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex flex-wrap items-center gap-2 p-2">
              <div className="flex min-w-0 flex-1 basis-60 items-center gap-3 p-2">
                <CollectionSummary name={collection.name} imageUrl={collection.imageUrl} detail={detail} />
              </div>
              <div className="ml-auto flex items-center gap-1.5 pr-2">
                <Badge tone={added.length ? "teal" : "neutral"}>+{plural(added.length, "palabra", "palabras")}</Badge>
                <Badge tone={collection.isNew ? "teal" : "neutral"}>{collection.isNew ? "Nueva" : "Existente"}</Badge>
              </div>
            </div>
            <div className="grid gap-3 border-t border-line bg-paper/60 p-3">
              <p className="m-0 text-xs text-muted">
                {plural(newCount, "nueva", "nuevas")} · {plural(added.length - newCount, "ya existe", "ya existen")} en otra colección
                {linkedCount ? ` · ${plural(linkedCount, "ya está", "ya están")} en esta y se omite${linkedCount === 1 ? "" : "n"}` : ""}
                {withoutImages ? ` · ${withoutImages} sin imágenes` : ""}. Pulsa una palabra para ver sus imágenes.
              </p>
              <ul className="m-0 grid list-none items-start gap-1.5 p-0">
                {list.words.map((word, wordIndex) => (
                  <PreviewWordRow key={word.term} word={word} onPick={(picked) => onPick(listIndex, wordIndex, picked)} />
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
