 'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useStore } from '@/lib/store';
import type { SprintState } from '@/types';

interface SprintTimerContextType {
  sprint: SprintState;
  timeRemaining: number;
  isRunning: boolean;
  updateTimer: () => void;
  resetSprint: () => void;
}

const SprintTimerContext = createContext<SprintTimerContextType | null>(null);

export function SprintTimerProvider({ children }: { children: ReactNode }) {
  const { sprint, updateTimer, resetSprint } = useStore();

  useEffect(() => {
    if (!sprint.isActive) return;

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [sprint.isActive, updateTimer]);

  return (
    <SprintTimerContext.Provider
      value={{
        sprint,
        timeRemaining: sprint.remainingTime,
        isRunning: sprint.isActive,
        updateTimer,
        resetSprint,
      }}
    >
      {children}
    </SprintTimerContext.Provider>
  );
}

export function useSprintTimer() {
  const context = useContext(SprintTimerContext);
  if (!context) {
    throw new Error('useSprintTimer must be used within a SprintTimerProvider');
  }
  return context;
}
