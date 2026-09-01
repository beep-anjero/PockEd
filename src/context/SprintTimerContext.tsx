'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const [timeRemaining, setTimeRemaining] = useState(sprint.remainingTime);
  const [isRunning, setIsRunning] = useState(sprint.isActive);

  useEffect(() => {
    setTimeRemaining(sprint.remainingTime);
    setIsRunning(sprint.isActive);
  }, [sprint.remainingTime, sprint.isActive]);

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      updateTimer();
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, updateTimer]);

  return (
    <SprintTimerContext.Provider
      value={{ sprint, timeRemaining, isRunning, updateTimer, resetSprint }}
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