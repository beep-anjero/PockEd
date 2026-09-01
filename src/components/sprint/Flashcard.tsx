'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { Flashcard } from '@/types';

interface FlashcardProps {
  card: Flashcard;
  onFlip: () => void;
  onRate: (rating: 'hard' | 'good' | 'easy') => void;
  isFlipped: boolean;
  progress: number;
  totalCards: number;
  currentIndex: number;
}

export function Flashcard({ card, onFlip, onRate, isFlipped, progress, totalCards, currentIndex }: FlashcardProps) {
  const [flipAnimation, setFlipAnimation] = useState(0);

  useEffect(() => {
    if (isFlipped) {
      setFlipAnimation(180);
    } else {
      setFlipAnimation(0);
    }
  }, [isFlipped]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 perspective-1000">
      {/* Progress indicator */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl">
        <motion.div
          className="relative w-full h-80 md:h-96 cursor-pointer"
          onClick={onFlip}
          style={{
            transform: `rotateY(${flipAnimation}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Front of card */}
          <div
            className={cn(
              'absolute w-full h-full rounded-2xl shadow-xl backface-hidden',
              'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
              'flex flex-col items-center justify-center p-8 text-center',
              'transition-all duration-300'
            )}
            style={{ transform: 'rotateY(0deg)' }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6">
              <RotateCcw className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
              {card.front}
            </h3>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Tap to flip
            </p>
          </div>

          {/* Back of card */}
          <div
            className={cn(
              'absolute w-full h-full rounded-2xl shadow-xl backface-hidden',
              'bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500',
              'flex flex-col items-center justify-center p-8 text-center text-white',
              'transition-all duration-300'
            )}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-medium leading-relaxed whitespace-pre-wrap">
              {card.back}
            </h3>
            <p className="mt-6 text-sm text-indigo-100">
              How well did you know this?
            </p>
          </div>
        </motion.div>

        {/* Rating buttons - only show when flipped */}
        <AnimatePresence mode="wait">
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-6 flex items-center justify-center gap-3 w-full max-w-2xl"
            >
              <button
                onClick={() => onRate('hard')}
                className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
              >
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Hard</span>
                <span className="text-xs text-red-500 dark:text-red-500">+5 XP</span>
              </button>
              <button
                onClick={() => onRate('good')}
                className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
              >
                <Check className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Good</span>
                <span className="text-xs text-amber-500 dark:text-amber-500">+10 XP</span>
              </button>
              <button
                onClick={() => onRate('easy')}
                className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
              >
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Easy</span>
                <span className="text-xs text-emerald-500 dark:text-emerald-500">+15 XP</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}