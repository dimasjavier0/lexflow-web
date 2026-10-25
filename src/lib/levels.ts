import type { LearningStatus } from "./api";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** How the home page names each level, after the CEFR's own descriptions. */
export const CEFR_LEVEL_NAMES: Record<CefrLevel, string> = {
  A1: "Principiante",
  A2: "Elemental",
  B1: "Intermedio",
  B2: "Intermedio alto",
  C1: "Avanzado",
  C2: "Maestría",
};

export function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === "string" && (CEFR_LEVELS as readonly string[]).includes(value);
}

export const LEARNING_STATUS_LABELS: Record<LearningStatus, string> = {
  WANT_TO_LEARN: "Quiero aprender",
  NOT_INTERESTED: "No me interesa",
  LEARNED: "Ya la aprendí",
};
