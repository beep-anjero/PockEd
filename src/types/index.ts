export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: 'class' | 'free';
  color: string;
}

export interface SprintSession {
  id: string;
  deckId: string;
  duration: number; // in minutes
  cardsReviewed: number;
  xpEarned: number;
  startedAt: number;
  completedAt: number;
  ratings: { hard: number; good: number; easy: number };
}

export interface UserStats {
  totalSprints: number;
  totalCardsReviewed: number;
  totalTimeStudied: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  lastStudyDate: string; // YYYY-MM-DD
}

export interface SprintState {
  isActive: boolean;
  deckId: string | null;
  duration: number; // in minutes
  remainingTime: number; // in seconds
  currentCardIndex: number;
  cards: Flashcard[];
  ratings: { hard: number; good: number; easy: number };
  startTime: number;
}