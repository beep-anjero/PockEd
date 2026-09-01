'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/utils';
import { useSprintTimer } from '@/context/SprintTimerContext';
import { Button } from '@/components/ui/Button';

export function SprintTimer() {
  const { sprint, timeRemaining, isRunning, updateTimer } = useSprintTimer();
  
  const progress = sprint.duration > 0 ? ((sprint.duration * 60 - timeRemaining) / (sprint.duration * 60)) * 100 : 0;
  const isCritical = timeRemaining <= 60 && timeRemaining > 0;
  const isOver = timeRemaining === 0 && sprint.isActive;

  useEffect(() => {
    if (isOver && sprint.isActive) {
      // Sprint completed - the timer will handle ending
    }
  }, [isOver, sprint.isActive]);

  if (!sprint.isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Timer display */}
          <div className={cn('flex items-center gap-3 text-center', isCritical && 'text-red-600 dark:text-red-400', isOver && 'text-emerald-600 dark:text-emerald-400')}>
            <div className={cn('relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0', isCritical && 'animate-pulse')}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="opacity-20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-300',
                    isCritical && 'text-red-500',
                    isOver && 'text-emerald-500'
                  )}
                  style={{
                    strokeDasharray: 283,
                    strokeDashoffset: 283 - (283 * progress) / 100,
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {sprint.cards.length > 0 ? `Card ${Math.min(sprint.currentCardIndex + 1, sprint.cards.length)} of ${sprint.cards.length}` : ''}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden md:block flex-1 mx-8 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500',
                isOver && 'bg-emerald-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Pause/Resume button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateTimer()}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}