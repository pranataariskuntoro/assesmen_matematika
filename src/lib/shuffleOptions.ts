/**
 * Seeded option shuffler for multiple choice / multiple response questions.
 *
 * Strategy
 * --------
 * Options are shuffled **client-side only** using a deterministic seed that
 * is derived from the student's biodata (nama + nomor absen). This means:
 *  - Every student sees a different order of options.
 *  - The same student always sees the same order (stable across refreshes).
 *  - The server / DB never needs to know about the shuffle.
 *  - Answers are always stored as the **original key** (A-E as in the DB),
 *    so grading logic requires zero changes.
 *
 * Questions listed in SKIP_SHUFFLE are rendered in their original order
 * (e.g. question 18 whose options are images that must stay ordered).
 */

export type ShuffledOption = {
  /** Display label shown to the student (A–E in new shuffled order) */
  key: string;
  /** Option text / image path */
  text: string;
  /** Original key from the database – always stored in answers state */
  originalKey: string;
};

/** Question numbers whose options must NOT be shuffled */
const SKIP_SHUFFLE = new Set([18]);

const DISPLAY_KEYS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Tiny seeded LCG (Linear Congruential Generator).
 * Returns a function that produces deterministic pseudo-random floats [0, 1).
 */
function seededRandom(seed: string): () => number {
  let h = 2166136261; // FNV offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0; // FNV-1a 32-bit
  }
  return function () {
    // Park-Miller LCG
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 0x100000000;
  };
}

/**
 * Shuffles the options of a single question using a per-question seed.
 * Returns options with `.originalKey` set so answers can always be tracked.
 */
export function shuffleOptionsForQuestion(
  options: { key: string; text: string }[],
  baseSeed: string,
  questionNumber: number
): ShuffledOption[] {
  // Always normalise to include originalKey, even if skipping shuffle
  if (SKIP_SHUFFLE.has(questionNumber) || options.length === 0) {
    return options.map(opt => ({ key: opt.key, text: opt.text, originalKey: opt.key }));
  }

  const rand = seededRandom(`${baseSeed}__q${questionNumber}`);

  // Fisher-Yates in-place shuffle on a copy of indices
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.map((originalIdx, displayIdx) => ({
    key: DISPLAY_KEYS[displayIdx],          // new display label
    text: options[originalIdx].text,         // actual text
    originalKey: options[originalIdx].key,   // key stored in DB / answers
  }));
}

/**
 * Returns a new questions array where multiple_choice and multiple_response
 * options are shuffled. Matching and essay questions are untouched.
 */
export function shuffleAllMCOptions(questions: any[], seed: string): any[] {
  if (!seed) return questions;
  return questions.map(q => {
    if (q.type === 'multiple_choice' || q.type === 'multiple_response') {
      return {
        ...q,
        options: shuffleOptionsForQuestion(q.options ?? [], seed, q.number),
      };
    }
    return q;
  });
}

/**
 * Produces a stable seed string from the student's biodata.
 * Lowercase + trim to make it insensitive to capitalisation / whitespace.
 */
export function buildExamSeed(nama: string, noAbsen: string | number): string {
  return `${nama.trim().toLowerCase()}_absen${noAbsen}`;
}
