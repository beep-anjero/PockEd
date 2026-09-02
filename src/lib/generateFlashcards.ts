// Heuristic flashcard generator that derives Q&A pairs from source text
// (PDF, DOCX, TXT, or pasted notes). Produces real cards grounded in the
// input content — not generic templates — by spotting study signals:
// definitions, lists, headings, dates/numbers, and key term patterns.

export type GeneratedCard = { front: string; back: string };

export type GeneratorOptions = {
  maxCards?: number;
  minCards?: number;
};

const DEFAULTS = { maxCards: 18, minCards: 5 };

// Split a blob of text into clean, meaningful sentences.
export function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    // Split on sentence endings but keep them on the chunk
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Split into paragraph-like blocks (used to detect list items and headings).
export function splitBlocks(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

// ─── Signal extractors ──────────────────────────────────────────────────────

const DEFINITION_PATTERNS: RegExp[] = [
  // "X is a/an/the Y", "X refers to Y", "X means Y", "X is defined as Y",
  // "X is known as Y", "X is called Y", "X can be defined as Y"
  /^(?<term>[A-Z][\w\s\-/'()]{1,80}?)\s+(?:is|are|was|were|refers to|means|is defined as|is known as|is called|can be defined as|denotes|describes|represents)\s+(?<def>.+)$/,
];

const LIST_PREFIX_RE = /^(?:\d+[.)]\s|[-•*▪◦–—]\s|[a-zA-Z][.)]\s)/;

function stripListPrefix(line: string): string {
  return line.replace(LIST_PREFIX_RE, '').trim();
}

export function extractDefinitionCards(sentences: string[]): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  const seen = new Set<string>();

  for (const raw of sentences) {
    const s = raw.replace(/\s+/g, ' ').trim();
    for (const re of DEFINITION_PATTERNS) {
      const m = s.match(re);
      if (!m || !m.groups) continue;
      const term = m.groups.term.trim();
      const def = m.groups.def.trim().replace(/[.;]+$/, '');
      // Quality filters
      if (term.length < 2 || term.length > 60) continue;
      if (def.length < 8 || def.length > 280) continue;
      if (/^(it|this|that|these|those|he|she|they|we|you)\b/i.test(term)) continue;
      const key = term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      // Drop leading article for a more natural-sounding question.
      const termNoArticle = term.replace(/^(?:the|a|an)\s+/i, '');
      cards.push({
        front: `What is ${termNoArticle}?`,
        back: def.endsWith('.') ? def : `${def}.`,
      });
      break;
    }
  }
  return cards;
}

export function extractListCards(blocks: string[]): GeneratedCard[] {
  const cards: GeneratedCard[] = [];

  for (const block of blocks) {
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const hasListPrefix = lines.some((l) => LIST_PREFIX_RE.test(l));
    if (!hasListPrefix) continue;

    const items = lines.map(stripListPrefix).filter((l) => l.length > 1 && l.length < 200);
    if (items.length < 2) continue;

    // Try to find a leading heading on the first non-list line
    let heading = '';
    let startIdx = 0;
    if (items[0] && !LIST_PREFIX_RE.test(lines[0])) {
      heading = items[0];
      startIdx = 1;
    }
    const listItems = items.slice(startIdx);
    if (listItems.length < 2) continue;

    // Numbered list: "What are the 3 main ...?" → ordered cards
    const isNumbered = lines.every((l) => /^\d+[.)]\s/.test(l));
    if (isNumbered && listItems.length >= 2) {
      cards.push({
        front: `What are the ${listItems.length} items${heading ? ` related to "${heading}"` : ''} listed in order?`,
        back: listItems.map((it, i) => `${i + 1}. ${it}`).join('\n'),
      });
      continue;
    }

    // Bulleted list: each item becomes "What is one of the X?"
    const trimmedHeading = heading || 'this list';
    const cleanHeading = trimmedHeading.replace(/[:?.]+$/, '');
    cards.push({
      front: `List the key points${cleanHeading ? ` of "${cleanHeading}"` : ''} (${listItems.length} items).`,
      back: listItems.map((it) => `• ${it}`).join('\n'),
    });
    // Pull a representative item as a separate Q
    const first = listItems[0];
    if (first && first.length < 140) {
      cards.push({
        front: `Name one of the items${cleanHeading ? ` from "${cleanHeading}"` : ''}.`,
        back: first,
      });
    }
  }
  return cards;
}

const HEADING_RE = /^([A-Z][A-Z0-9 \-:&/]{2,80}|[A-Z][\w\s\-:&/]{2,80}\?)$/;

function extractHeadingCards(blocks: string[]): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const firstLine = block.split(/\n/)[0]?.trim() ?? '';
    if (firstLine.length < 3 || firstLine.length > 90) continue;
    if (!HEADING_RE.test(firstLine)) continue;
    // Skip if it's a numbered/bulleted heading (handled above)
    if (LIST_PREFIX_RE.test(firstLine)) continue;

    const body = block
      .split(/\n/)
      .slice(1)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (body.length < 40) continue;
    const summary = body.slice(0, 240);
    cards.push({
      front: `Summarize "${firstLine.replace(/[:?.]+$/, '')}".`,
      back: summary.endsWith('.') ? summary : `${summary}.`,
    });
  }
  return cards;
}

const NUMBER_FACT_RE = /\b([A-Z][\w\s\-/'()]{2,60}?)\s+(?:was|is|in|occurred on|founded in|established in|released in|died in|born in|happened in)\s+(\d{2,4}(?:\s*(?:BC|AD|BCE|CE))?)\b/;

function extractDateNumberCards(sentences: string[]): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  const seen = new Set<string>();
  for (const raw of sentences) {
    const s = raw.replace(/\s+/g, ' ').trim().replace(/^\s*(?:\d+[.)]\s+|[-•*▪◦–—]\s+|[a-zA-Z][.)]\s+)/, '');
    const m = s.match(NUMBER_FACT_RE);
    if (!m) continue;
    const subject = m[1].trim();
    const value = m[2].trim();
    if (subject.length < 2 || subject.length > 60) continue;
    // Use just the key noun phrase (strip "The/A/An" articles for cleaner reading)
    const key = `${subject.toLowerCase()}|${value}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Build a natural-sounding question. Drop leading article from the subject.
    const subjectNoArticle = subject.replace(/^(?:the|a|an)\s+/i, '');
    const lowerSubject = subjectNoArticle.toLowerCase();
    // Detect "verb in year" phrases like "... began in YYYY" / "... ended in YYYY"
    const verbMatch = subjectNoArticle.match(
      /\b(began|ended|started|launched|occurred|took place|happened)\b\s*$/i
    );
    let front: string;
    if (verbMatch) {
      // Pull the noun before "began/ended/etc." and use it as the question subject.
      const event = subjectNoArticle.replace(/\s*\b(?:began|ended|started|launched|occurred|took place|happened)\b\s*$/i, '').trim();
      // Normalize to past tense base form for "did" questions.
      const pastBase: Record<string, string> = {
        began: 'begin',
        ended: 'end',
        started: 'start',
        launched: 'launch',
        occurred: 'occur',
        'took place': 'take place',
        happened: 'happen',
      };
      const verbInfinitive = pastBase[verbMatch[1].toLowerCase()] || verbMatch[1].toLowerCase();
      front = `In what year did ${event} ${verbInfinitive}?`;
    } else if (/^(?:was|is|in|occurred|founded|established|released|died|born|happened|took place)\b/i.test(subjectNoArticle)) {
      front = `In what year did ${lowerSubject.charAt(0).toUpperCase() + lowerSubject.slice(1)}?`;
    } else {
      front = `In what year was ${subjectNoArticle}?`;
    }
    cards.push({ front, back: value });
  }
  return cards;
}

function extractFillInCards(sentences: string[]): GeneratedCard[] {
  // Pick a content word in longer sentences to blank out as a cloze-style card.
  const cards: GeneratedCard[] = [];
  const seen = new Set<string>();
  const STOPWORDS = new Set([
    'the','a','an','and','or','but','if','then','of','to','in','on','at','by','for','with','as','is','are','was','were','be','been','being','it','this','that','these','those','he','she','they','we','you','i','my','our','their','his','her','its','from','into','about','over','under','between','through','during','before','after','also','can','could','should','would','may','might','do','does','did','have','has','had','which','who','whom','what','when','where','why','how','not','no','yes','than','so','such'
  ]);

  for (const raw of sentences) {
    // Strip leading/trailing list markers and stray list digits so they don't end up in the cloze prompt.
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    const s = cleaned
      .replace(/^\s*(?:\d+[.)]\s+|[-•*▪◦–—]\s+|[a-zA-Z][.)]\s+)/, '')
      .replace(/\s+(?:\d+[.)]|[-•*▪◦–—]|[a-zA-Z][.)])\s*$/, '');

    if (s.length < 50 || s.length > 220) continue;
    // Pull candidate content words (skip punctuation)
    const words = s.split(/\s+/).map((w) => w.replace(/[.,;:()"]/g, ''));
    // Find the longest content word (rough proxy for "key term")
    let target = '';
    let targetIdx = -1;
    for (let i = 1; i < words.length - 1; i++) {
      const w = words[i];
      if (!w) continue;
      const lower = w.toLowerCase();
      if (STOPWORDS.has(lower)) continue;
      if (w.length < 5) continue;
      if (!/^[A-Z]/.test(w) && !/^[a-z]/.test(w)) continue;
      if (w.length > target.length) {
        target = w;
        targetIdx = i;
      }
    }
    if (targetIdx === -1) continue;
    const key = target.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const blanked = words
      .map((w, i) => (i === targetIdx ? '____' : w))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    cards.push({
      front: `Fill in the blank: ${blanked}`,
      back: target,
    });
  }
  return cards;
}

// ─── Main entry ─────────────────────────────────────────────────────────────

export function generateFlashcardsFromText(
  sourceText: string,
  options: GeneratorOptions = {}
): GeneratedCard[] {
  const { maxCards = DEFAULTS.maxCards, minCards = DEFAULTS.minCards } = options;
  if (!sourceText || !sourceText.trim()) return [];

  // IMPORTANT: split on original text so block/list structure survives.
  const sentences = splitSentences(sourceText);
  const blocks = splitBlocks(sourceText);

  // Collect candidates from each detector
  const buckets: Record<string, GeneratedCard[]> = {
    definition: extractDefinitionCards(sentences),
    list: extractListCards(blocks),
    heading: extractHeadingCards(blocks),
    fact: extractDateNumberCards(sentences),
    fill: extractFillInCards(sentences),
  };

  // Interleave to mix question styles rather than dumping all of one type
  const order = ['definition', 'list', 'heading', 'fact', 'fill'];
  const result: GeneratedCard[] = [];
  const seenFronts = new Set<string>();

  const pushUnique = (c: GeneratedCard) => {
    const key = c.front.toLowerCase().trim();
    if (seenFronts.has(key)) return false;
    if (c.front.length < 6 || c.front.length > 240) return false;
    if (c.back.length < 1 || c.back.length > 1200) return false;
    seenFronts.add(key);
    result.push(c);
    return true;
  };

  // Round-robin until we hit maxCards or all buckets are empty
  let safety = 0;
  while (result.length < maxCards && safety < 200) {
    safety++;
    let addedThisRound = false;
    for (const key of order) {
      if (result.length >= maxCards) break;
      const next = buckets[key].shift();
      if (!next) continue;
      if (pushUnique(next)) addedThisRound = true;
    }
    if (!addedThisRound) break;
  }

  // If we fell short of minCards and still have raw sentences, mint generic
  // "key takeaway" cards from remaining long sentences.
  if (result.length < minCards) {
    for (const raw of sentences) {
      if (result.length >= minCards) break;
      const s = raw.replace(/\s+/g, ' ').trim();
      if (s.length < 60 || s.length > 220) continue;
      pushUnique({
        front: 'What is a key takeaway from this sentence?',
        back: s.endsWith('.') ? s : `${s}.`,
      });
    }
  }

  return result;
}

export function summarizeSource(sourceText: string, maxLen = 220): string {
  const text = sourceText.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  // Use the first long sentence as a heuristic summary
  const first = splitSentences(text).find((s) => s.length >= 40 && s.length <= 280);
  if (first) return first.length > maxLen ? `${first.slice(0, maxLen).trim()}…` : first;
  return text.length > maxLen ? `${text.slice(0, maxLen).trim()}…` : text;
}