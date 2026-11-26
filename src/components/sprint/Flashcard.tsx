'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  RotateCcw,
  Check,
  X,
  Lightbulb,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { buildQuizOptions } from '@/lib/quiz';
import type { Flashcard as FlashcardType } from '@/types';

interface FlashcardProps {
  card: FlashcardType;
  /** All cards available for distractor answers (usually every deck). */
  pool?: FlashcardType[];
  onRate: (rating: 'hard' | 'good' | 'easy') => void;
  progress: number;
  totalCards: number;
  currentIndex: number;
}

export function Flashcard({
  card,
  pool = [],
  onRate,
  progress,
  totalCards,
  currentIndex,
}: FlashcardProps) {
  const options = useMemo(() => buildQuizOptions(card, pool), [card, pool]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isMultipleChoice = options !== null;
  const answered = isMultipleChoice ? selectedIndex !== null : revealed;
  const selectedOption = selectedIndex !== null && options ? options[selectedIndex] : null;
  const correctOption = options?.find((option) => option.isCorrect) ?? null;
  const isCorrect = selectedOption?.isCorrect ?? false;
  const flipAnimation = answered && !isMultipleChoice ? 180 : 0;

  // Keyboard: 1-4 picks an option, Space reveals (fallback cards), 1-3 rates
  // once the answer is showing.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!answered) {
        if (isMultipleChoice && options) {
          const index = Number.parseInt(event.key, 10) - 1;
          if (Number.isInteger(index) && index >= 0 && index < options.length) {
            event.preventDefault();
            setSelectedIndex(index);
          }
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          setRevealed(true);
        }
        return;
      }

      if (event.key === '1' || event.key === '2' || event.key === '3') {
        event.preventDefault();
        onRate(event.key === '1' ? 'hard' : event.key === '2' ? 'good' : 'easy');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answered, isMultipleChoice, options, onRate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-6 perspective-1000">
      {/* Progress indicator */}
      <div className="w-full max-w-2xl mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium text-[var(--muted-foreground)]">
            Card{' '}
            <span className="numeric text-[var(--foreground)]">
              {currentIndex + 1}
            </span>{' '}
            of{' '}
            <span className="numeric text-[var(--foreground)]">{totalCards}</span>
          </span>
          <span className="font-semibold text-[var(--primary)] numeric">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pocked-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl">
        <motion.div
          className={cn(
            'relative w-full h-[420px] sm:h-[460px] md:h-[500px] select-none',
            !isMultipleChoice && 'cursor-pointer'
          )}
          onClick={isMultipleChoice ? undefined : () => setRevealed(true)}
          style={{
            transform: `rotateY(${flipAnimation}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Front of card */}
          <div
            className={cn(
              'absolute w-full h-full rounded-3xl backface-hidden',
              'bg-[var(--card)] border border-[var(--border)] shadow-xl shadow-black/5',
              'flex flex-col p-6 sm:p-8'
            )}
            style={{ transform: 'rotateY(0deg)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                Question
              </div>
              {isMultipleChoice && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Choose one
                </span>
              )}
            </div>

            {isMultipleChoice && options ? (
              <div className="flex-1 min-h-0 flex flex-col gap-4 pt-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--foreground)] leading-snug whitespace-pre-wrap font-display">
                  {card.front}
                </h3>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                  {options.map((option, index) => {
                    const state = !answered
                      ? 'idle'
                      : option.isCorrect
                        ? 'correct'
                        : index === selectedIndex
                          ? 'wrong'
                          : 'dim';

                    return (
                      <button
                        key={`${option.text}-${index}`}
                        type="button"
                        disabled={answered}
                        onClick={() => setSelectedIndex(index)}
                        aria-pressed={selectedIndex === index}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors',
                          OPTION_STYLES[state]
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                            OPTION_BADGE_STYLES[state]
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-sm leading-snug">{option.text}</span>
                        {answered && option.isCorrect && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        {answered && !option.isCorrect && index === selectedIndex && (
                          <X className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {answered ? (
                  <div
                    className={cn(
                      'flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold',
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-300'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {isCorrect ? 'Correct!' : 'Not quite.'}{' '}
                      <span className="font-normal opacity-90">
                        Correct answer: {correctOption?.text}
                      </span>
                    </span>
                  </div>
                ) : (
                  <p className="text-center text-[11px] font-medium text-[var(--muted-foreground)]">
                    Choose an answer · press{' '}
                    <kbd className="px-1 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">
                      1
                    </kbd>
                    –
                    <kbd className="px-1 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">
                      4
                    </kbd>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-pocked-gradient-soft mb-6">
                  <Lightbulb className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-display">
                  {card.front}
                </h3>
                <p className="mt-8 text-xs font-medium text-[var(--muted-foreground)] inline-flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Tap card or press Space to reveal answer
                </p>
              </div>
            )}
          </div>

          {/* Back of card — only used by cards without multiple choice */}
          {!isMultipleChoice && (
            <div
              className={cn(
                'absolute w-full h-full rounded-3xl backface-hidden',
                'bg-pocked-gradient text-white border border-[var(--primary)]/30',
                'flex flex-col items-center justify-center p-8 text-center',
                'shadow-2xl shadow-indigo-900/30'
              )}
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="absolute top-5 left-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                <span className="w-2 h-2 rounded-full bg-white" />
                Answer
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-6">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold leading-relaxed whitespace-pre-wrap font-display">
                {card.back}
              </h3>
              <p className="mt-8 text-xs font-medium text-white/80">
                How well did you know this? Pick a rating below.
              </p>
            </div>
          )}
        </motion.div>

        {/* Rating buttons - only show once answered */}
        <AnimatePresence mode="wait">
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mt-6 grid grid-cols-3 gap-3 w-full max-w-2xl"
            >
              <RatingButton
                onClick={() => onRate('hard')}
                color="red"
                icon={X}
                label="Hard"
                xp={5}
                shortcut="1"
              />
              <RatingButton
                onClick={() => onRate('good')}
                color="amber"
                icon={Check}
                label="Good"
                xp={10}
                shortcut="2"
              />
              <RatingButton
                onClick={() => onRate('easy')}
                color="green"
                icon={Check}
                label="Easy"
                xp={15}
                shortcut="3"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!answered && !isMultipleChoice && (
          <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
            Hint: press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">
              Space
            </kbd>{' '}
            to flip
          </p>
        )}
      </div>
    </div>
  );
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'dim';

const OPTION_STYLES: Record<OptionState, string> = {
  idle: 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-pocked-gradient-soft',
  correct:
    'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-200',
  wrong:
    'border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/25 dark:text-red-200',
  dim: 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] opacity-60',
};

const OPTION_BADGE_STYLES: Record<OptionState, string> = {
  idle: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  correct: 'bg-emerald-500 text-white',
  wrong: 'bg-red-500 text-white',
  dim: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
};

const RATING_STYLES: Record<
  'red' | 'amber' | 'green',
  { bg: string; border: string; text: string; iconBg: string; xp: string }
> = {
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    xp: 'text-red-500/80',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-900/50',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    xp: 'text-amber-500/80',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-900/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    xp: 'text-emerald-500/80',
  },
};

function RatingButton({
  onClick,
  color,
  icon: Icon,
  label,
  xp,
  shortcut,
}: {
  onClick: () => void;
  color: 'red' | 'amber' | 'green';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  xp: number;
  shortcut: string;
}) {
  const c = RATING_STYLES[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl border-2 transition-all',
        'hover:scale-[1.02] active:scale-[0.98]',
        c.bg,
        c.border
      )}
    >
      <span
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
          c.iconBg,
          c.text
        )}
      >
        <Icon className="w-5 h-5" />
      </span>
      <span className={cn('text-sm font-semibold', c.text)}>{label}</span>
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', c.xp)}>
        +{xp} XP
      </span>
      <span className="absolute top-1.5 right-1.5 text-[9px] font-mono text-[var(--muted-foreground)] opacity-50 group-hover:opacity-80">
        {shortcut}
      </span>
    </button>
  );
}
