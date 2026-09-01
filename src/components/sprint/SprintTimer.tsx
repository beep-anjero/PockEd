'use client';

import { motion } from 'framer-motion';
import { Pause, Play, X, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/utils';
import { useSprintTimer } from '@/context/SprintTimerContext';
import { Button } from '@/components/ui/Button';

export function SprintTimer() {
  const { sprint, timeRemaining, isRunning, updateTimer, resetSprint } = useSprintTimer();

  const progress =
    sprint.duration > 0
      ? ((sprint.duration * 60 - timeRemaining) / (sprint.duration * 60)) * 100
      : 0;
  const isCritical = timeRemaining <= 60 && timeRemaining > 0;
  const isOver = timeRemaining === 0 && sprint.isActive;

  if (!sprint.isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 glass-nav border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          {/* Brand mark + timer */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'relative w-10 h-10 md:w-11 md:h-11 flex-shrink-0',
                isCritical && 'animate-pulse'
              )}
            >
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[var(--muted)]"
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
                    'transition-colors duration-300',
                    !isCritical && !isOver && 'text-[var(--primary)]',
                    isCritical && 'text-red-500',
                    isOver && 'text-emerald-500'
                  )}
                  style={{
                    strokeDasharray: 283,
                    strokeDashoffset: 283 - (283 * progress) / 100,
                  }}
                />
              </svg>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-mono font-bold numeric',
                  isCritical && 'text-red-500',
                  isOver && 'text-emerald-500',
                  !isCritical && !isOver && 'text-[var(--primary)]'
                )}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hidden sm:block">
                Focus sprint
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                {sprint.cards.length > 0
                  ? `Card ${Math.min(sprint.currentCardIndex + 1, sprint.cards.length)} of ${sprint.cards.length}`
                  : 'No cards'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden md:block flex-1 mx-6 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full transition-colors',
                isCritical
                  ? 'bg-red-500'
                  : isOver
                    ? 'bg-emerald-500'
                    : 'bg-pocked-gradient'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateTimer()}
              aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('End this sprint early?')) {
                  resetSprint();
                }
              }}
              aria-label="End sprint"
              className="text-[var(--muted-foreground)] hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
