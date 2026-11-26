// Derives multiple-choice options for a flashcard at render time.
//
// Cards are stored as plain { front, back } pairs, so options are built on the
// fly from:
//   1. The blanked sentence itself (for "Fill in the blank" cards).
//   2. Nearby numbers (for "In what year..." style cards).
//   3. Answers from other cards in the user's decks (best length match first).
//
// This keeps the persisted schema unchanged, so existing decks work without a
// migration. If we can't find at least two plausible distractors we return
// null and the card falls back to the classic reveal-and-rate flow.

import type { Flashcard } from '@/types';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

const FILL_PREFIX = /^fill\s+in\s+the\s+blank:\s*/i;
const MAX_OPTIONS = 4;
const MAX_OPTION_LENGTH = 160;
const MIN_DISTRACTORS = 2;

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','of','to','in','on','at','by','for','with','as','is','are',
  'was','were','be','been','being','it','this','that','these','those','he','she','they','we','you','i',
  'my','our','their','his','her','its','from','into','about','over','under','between','through','during',
  'before','after','also','can','could','should','would','may','might','do','does','did','have','has','had',
  'which','who','whom','what','when','where','why','how','not','no','yes','than','so','such','us','them',
]);

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

function firstLine(value: string): string {
  const line = value.split('\n').map((part) => part.trim()).find(Boolean) ?? '';
  return clean(line);
}

function normalizeKey(value: string): string {
  return clean(value).toLowerCase().replace(/[.!?;:,]+$/g, '');
}

// FNV-1a hash — used to seed a stable shuffle so options don't reorder between
// renders (or when the same card is reviewed again).
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const NUMBER_ANSWER_RE = /^(\d{1,4})(?:\s*(BCE|BC|CE|AD))?$/i;

// "1990" → 1991, 1989, 1992, ... (plausible-looking decoys for year questions)
function numericDistractors(answer: string): string[] {
  const match = answer.match(NUMBER_ANSWER_RE);
  if (!match) return [];

  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value)) return [];

  const suffix = match[2] ? ` ${match[2].toUpperCase()}` : '';
  const offsets = value >= 1000 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out: string[] = [];

  for (const offset of offsets) {
    for (const candidate of [value + offset, value - offset]) {
      if (candidate > 0) out.push(`${candidate}${suffix}`);
    }
  }

  return out;
}

// Pull plausible content words out of a cloze sentence: same length as the
// answer is preferred, which keeps the choices believable.
function blankDistractors(front: string, answer: string): string[] {
  const sentence = front.replace(FILL_PREFIX, '').replace(/_{2,}/g, ' ');
  const answerKey = normalizeKey(answer);
  const seen = new Set<string>();
  const candidates: { text: string; score: number }[] = [];

  for (const raw of sentence.split(/[^A-Za-z0-9'’-]+/)) {
    const word = raw.trim();
    if (word.length < 3) continue;

    const key = word.toLowerCase();
    if (STOPWORDS.has(key) || key === answerKey || seen.has(key)) continue;
    seen.add(key);

    candidates.push({ text: word, score: Math.abs(word.length - answer.length) });
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates.map((candidate) => candidate.text);
}

// Answers from other cards, preferring ones with a similar length so long
// definitions don't sit next to one-word options.
function answerDistractors(card: Flashcard, pool: Flashcard[]): string[] {
  const correctKey = normalizeKey(card.back);
  const correctLength = clean(card.back).length;
  const seen = new Set([correctKey]);
  const candidates: { text: string; score: number }[] = [];

  for (const other of pool) {
    if (other.id === card.id) continue;

    let text = firstLine(other.back);
    if (!text) continue;
    if (text.length > MAX_OPTION_LENGTH) {
      text = `${text.slice(0, MAX_OPTION_LENGTH - 1).trimEnd()}…`;
    }

    const key = normalizeKey(text);
    if (!key || seen.has(key)) continue;
    // Skip near-duplicates such as "X" vs "X and Y".
    if (
      correctKey.length >= 4 &&
      key.length >= 4 &&
      (key.includes(correctKey) || correctKey.includes(key))
    ) {
      continue;
    }

    seen.add(key);
    candidates.push({ text, score: Math.abs(text.length - correctLength) });
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates.map((candidate) => candidate.text);
}

export function buildQuizOptions(card: Flashcard, pool: Flashcard[] = []): QuizOption[] | null {
  const correct = clean(card.back);
  if (!correct) return null;

  const raw: string[] = [];

  if (FILL_PREFIX.test(card.front)) {
    raw.push(...blankDistractors(card.front, correct));
  }
  raw.push(...numericDistractors(correct.replace(/[.!?;:]+$/, '')));
  raw.push(...answerDistractors(card, pool));

  const correctKey = normalizeKey(correct);
  const seen = new Set([correctKey]);
  const unique: string[] = [];

  for (const candidate of raw) {
    const text = clean(candidate);
    if (!text) continue;

    const key = normalizeKey(text);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    unique.push(text);
  }

  if (unique.length < MIN_DISTRACTORS) return null;

  const options: QuizOption[] = [
    { text: correct, isCorrect: true },
    ...unique.slice(0, MAX_OPTIONS - 1).map((text) => ({ text, isCorrect: false })),
  ];

  return seededShuffle(options, hashString(card.id || card.front));
}
