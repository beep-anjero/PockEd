'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import {
  ArrowLeft,
  CheckCircle,
  Layers,
  Clock,
  Sparkles,
  Trophy,
  Timer,
  XCircle,
  Flame,
  Zap,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { Deck } from '@/types';
import { SprintTimer } from './SprintTimer';
import { Flashcard } from './Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function SprintView() {
  const { sprint, endSprint, rateCard, resetSprint } =
    useStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedSession, setCompletedSession] = useState<ReturnType<typeof endSprint> | null>(
    null
  );

  // Auto-show completion when sprint ends
  const prevSprintActiveRef = useRef(sprint.isActive);

  // Auto-show completion when sprint ends (transition from active to inactive)
  useEffect(() => {
    const wasActive = prevSprintActiveRef.current;
    const isActive = sprint.isActive;
    prevSprintActiveRef.current = isActive;

    // Only trigger on transition from active to inactive
    if (wasActive && !isActive && sprint.cards.length > 0 && !showCompletion) {
      const session = endSprint();
      if (session) {
        setTimeout(() => {
          setCompletedSession(session);
          setShowCompletion(true);
        }, 0);
    }
  }
  }, [sprint.isActive, sprint.cards.length, showCompletion, endSprint]);

  const currentCard = sprint.cards[sprint.currentCardIndex];
  const progress =
    sprint.cards.length > 0 ? (sprint.currentCardIndex / sprint.cards.length) * 100 : 0;

  const handleFlip = useCallback(() => setIsFlipped((v) => !v), []);

  const handleRate = useCallback(
    (rating: 'hard' | 'good' | 'easy') => {
      rateCard(rating);
      setIsFlipped(false);
    },
    [rateCard]
  );

  const handleStartNewSprint = () => {
    resetSprint();
    setShowCompletion(false);
    setCompletedSession(null);
    setIsFlipped(false);
  };

  // Show completion screen
  if (showCompletion && completedSession) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.15 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-pocked-gradient mb-6 shadow-lg shadow-indigo-500/30"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
                Sprint complete
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3 font-display">
                You turned {formatDuration(completedSession.duration)} into progress
              </h1>
              <p className="text-[var(--muted-foreground)] mb-10 max-w-md mx-auto">
                Every sprint makes you a little sharper. Ready for another?
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <CompletionStat
                  icon={Layers}
                  value={completedSession.cardsReviewed}
                  label="Cards"
                  accent="indigo"
                  delay={0.2}
                />
                <CompletionStat
                  icon={Sparkles}
                  value={`+${completedSession.xpEarned}`}
                  label="XP Earned"
                  accent="amber"
                  delay={0.25}
                />
                <CompletionStat
                  icon={Timer}
                  value={formatDuration(completedSession.duration)}
                  label="Focus Time"
                  accent="green"
                  delay={0.3}
                />
                <CompletionStat
                  icon={Zap}
                  value={
                    Math.round((completedSession.cardsReviewed / completedSession.duration) * 60 * 10) /
                    10
                  }
                  label="Cards / min"
                  accent="purple"
                  delay={0.35}
                />
              </div>

              {/* Rating breakdown */}
              <Card className="mb-8 text-left">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[var(--foreground)] mb-5 font-display flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Your ratings
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <RatingBreakdown
                      color="red"
                      label="Hard"
                      count={completedSession.ratings.hard}
                    />
                    <RatingBreakdown
                      color="amber"
                      label="Good"
                      count={completedSession.ratings.good}
                    />
                    <RatingBreakdown
                      color="green"
                      label="Easy"
                      count={completedSession.ratings.easy}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="gradient" size="lg" onClick={handleStartNewSprint} className="w-full sm:w-auto">
                  <Zap className="w-5 h-5 mr-2" />
                  Another Sprint
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/decks">
                    <Layers className="w-5 h-5 mr-2" />
                    View Decks
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Active sprint view
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SprintTimer />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 pt-24">
        {currentCard && (
          <Flashcard
            card={currentCard}
            onFlip={handleFlip}
            onRate={handleRate}
            isFlipped={isFlipped}
            progress={progress}
            totalCards={sprint.cards.length}
            currentIndex={sprint.currentCardIndex}
          />
        )}

        {!currentCard && sprint.isActive && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-col items-center p-10 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 font-display">
                All cards reviewed!
              </h2>
              <p className="text-[var(--muted-foreground)]">Great job completing this sprint.</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyDecksState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pocked-gradient-soft mb-4">
          <Layers className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 font-display">
          No decks yet
        </h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Create your first deck to start a micro-sprint. You can add cards manually or use
          AI to generate them from your notes.
        </p>
        <Button variant="gradient" size="lg" onClick={onCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Create a Deck
        </Button>
      </CardContent>
    </Card>
  );
}

function SprintSelection({
  decks,
  preselectedDeck,
  onStart,
}: {
  decks: Deck[];
  preselectedDeck: Deck | null;
  onStart: (deckId: string, duration: number) => void;
}) {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    preselectedDeck?.id ?? null
  );
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const selectedDeck = selectedDeckId ? decks.find((d) => d.id === selectedDeckId) ?? null : null;
  const canStart = !!selectedDeck && !!selectedDuration;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Decks */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" /> 1. Choose a deck
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map((d, i) => {
            const isActive = selectedDeckId === d.id;
            return (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => setSelectedDeckId(d.id)}
                className={cn(
                  'text-left p-4 rounded-2xl border-2 transition-all',
                  isActive
                    ? 'border-[var(--primary)] bg-pocked-gradient-soft shadow-md shadow-indigo-500/10'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm',
                      d.color
                    )}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--foreground)] truncate font-display">
                      {d.name}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {d.cards.length} card{d.cards.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                      Selected
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Duration + Start */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> 2. Pick duration
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[15, 30, 45, 60].map((m) => {
              const isActive = selectedDuration === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedDuration(m)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all',
                    isActive
                      ? 'border-[var(--primary)] bg-pocked-gradient-soft'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40'
                  )}
                >
                  <p className="numeric text-2xl text-[var(--foreground)]">{m}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">min</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-pocked-gradient text-white">
          <div className="flex items-center gap-2 text-sm text-indigo-50 mb-2">
            <Flame className="w-4 h-4" />
            Ready when you are
          </div>
          <p className="text-xs text-indigo-100/90 mb-4">
            {canStart && selectedDeck
              ? `~${Math.min(
                  selectedDeck.cards.length,
                  Math.floor((selectedDuration ?? 15) / 0.5)
                )} cards • up to ${Math.min(
                  selectedDeck.cards.length * 15,
                  (selectedDuration ?? 15) * 60
                )} XP`
              : 'Pick a deck and duration to begin.'}
          </p>
          <Button
            size="lg"
            className="w-full bg-white !text-indigo-600 hover:!bg-indigo-50 shadow-lg"
            disabled={!canStart}
            onClick={() => {
              if (canStart && selectedDeck) onStart(selectedDeck.id, selectedDuration!);
            }}
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Sprint
          </Button>
        </div>
      </div>
    </div>
  );
}

const COMPLETION_ACCENT: Record<
  'indigo' | 'amber' | 'green' | 'purple',
  { bg: string; text: string; iconBg: string }
> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
  },
};

function CompletionStat({
  icon: Icon,
  value,
  label,
  accent,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent: 'indigo' | 'amber' | 'green' | 'purple';
  delay: number;
}) {
  const c = COMPLETION_ACCENT[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardContent className={cn('p-4 sm:p-5', c.bg)}>
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
              c.iconBg,
              c.text
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <p className={cn('numeric text-2xl sm:text-3xl', c.text)}>{value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mt-0.5">
            {label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RatingBreakdown({
  color,
  label,
  count,
}: {
  color: 'red' | 'amber' | 'green';
  label: string;
  count: number;
}) {
  const colorMap: Record<typeof color, { bg: string; text: string; icon: typeof XCircle }> = {
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: XCircle },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: CheckCircle },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  };
  const c = colorMap[color];
  const Icon = c.icon;
  return (
    <div className={cn('flex flex-col items-center gap-1.5 p-4 rounded-2xl', c.bg)}>
      <Icon className={cn('w-5 h-5', c.text)} />
      <span className={cn('numeric text-2xl', c.text)}>{count}</span>
      <span className={cn('text-xs font-semibold uppercase tracking-wider', c.text)}>
        {label}
      </span>
    </div>
  );
}
