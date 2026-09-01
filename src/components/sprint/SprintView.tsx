'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Star, Brain, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { SprintTimer } from './SprintTimer';
import { Flashcard } from './Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function SprintView() {
  const { sprint, startSprint, endSprint, rateCard, nextCard, resetSprint, getDeck } = useStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedSession, setCompletedSession] = useState<ReturnType<typeof endSprint> | null>(null);

  // Auto-show completion when sprint ends
  useEffect(() => {
    if (!sprint.isActive && sprint.cards.length > 0 && !showCompletion) {
      const session = endSprint();
      if (session) {
        setCompletedSession(session);
        setShowCompletion(true);
      }
    }
  }, [sprint.isActive, sprint.cards.length, showCompletion, endSprint]);

  const currentCard = sprint.cards[sprint.currentCardIndex];
  const progress = sprint.cards.length > 0 ? ((sprint.currentCardIndex) / sprint.cards.length) * 100 : 0;
  const deck = sprint.deckId ? getDeck(sprint.deckId) : null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: 'hard' | 'good' | 'easy') => {
    rateCard(rating);
    setIsFlipped(false);
    
    // Check if sprint is complete
    if (sprint.currentCardIndex >= sprint.cards.length - 1) {
      // Will be handled by useEffect
    } else {
      nextCard();
    }
  };

  const handleStartNewSprint = () => {
    resetSprint();
    setShowCompletion(false);
    setCompletedSession(null);
    setIsFlipped(false);
  };

  // Show deck selection if no active sprint
  if (!sprint.isActive && !showCompletion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <SprintTimer />
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 pt-28">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-6"
            >
              <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Start a Micro-Sprint
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Turn your downtime into focused study sessions. Pick a deck, set a timer, and level up your knowledge.
            </p>
          </div>

          {/* Deck Selection */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Choose a Deck
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deck ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <button
                    onClick={() => startSprint(deck.id, 15)}
                    className="w-full p-6 rounded-2xl border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', deck.color)}>
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{deck.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deck.cards.length} cards</p>
                        </div>
                      </div>
                      <ArrowLeft className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deck.description}</p>
                  </button>
                </motion.div>
              ) : (
                useStore.getState().decks.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (i + 1) }}
                  >
                    <button
                      onClick={() => startSprint(d.id, 15)}
                      className="w-full p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', d.color)}>
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{d.cards.length} cards</p>
                          </div>
                        </div>
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{d.description}</p>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Select Duration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((minutes) => (
                <motion.button
                  key={minutes}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => deck && startSprint(deck.id, minutes)}
                  disabled={!deck}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all font-medium',
                    deck
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  )}
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{minutes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">minutes</p>
                </motion.button>
              ))}
            </div>
            {!deck && (
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Select a deck first to enable duration options
              </p>
            )}
          </div>

          {/* Quick start if deck selected */}
          {deck && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="font-medium">~{Math.min(deck.cards.length, Math.floor(15 / 0.5))} cards in 15 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">+{deck.cards.length * 10} potential XP</span>
                </div>
              </div>
              <Button
                size="xl"
                className="w-full mt-4 bg-white text-indigo-600 hover:bg-gray-100"
                onClick={() => startSprint(deck.id, 15)}
              >
                Start 15 Min Sprint
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Show completion screen
  if (showCompletion && completedSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-8"
              >
                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Sprint Complete! 🎉
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                You turned {formatDuration(completedSession.duration)} of downtime into progress.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{completedSession.cardsReviewed}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cards Reviewed</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">+{completedSession.xpEarned}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">XP Earned</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatDuration(completedSession.duration)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round((completedSession.cardsReviewed / completedSession.duration) * 60 * 10) / 10}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cards/Min</p>
                </motion.div>
              </div>

              {/* Rating breakdown */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Ratings</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{completedSession.ratings.hard}</span>
                      </div>
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">Hard</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{completedSession.ratings.good}</span>
                      </div>
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Good</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedSession.ratings.easy}</span>
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Easy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleStartNewSprint} className="w-full sm:w-auto">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Another Sprint
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/decks">View Decks</Link>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SprintTimer />
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-28">
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All cards reviewed!</h2>
              <p className="text-gray-600 dark:text-gray-400">Great job completing this sprint.</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}