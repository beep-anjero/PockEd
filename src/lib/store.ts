import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Deck, Flashcard, SprintSession, UserStats, SprintState, ScheduleItem } from '@/types';

interface PockEdStore {
  // Decks
  decks: Deck[];
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Deck;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  getDeck: (id: string) => Deck | undefined;
  
  // Flashcards
  addCard: (deckId: string, card: Omit<Flashcard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>) => Flashcard;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  
  // Sprint State
  sprint: SprintState;
  startSprint: (deckId: string, duration: number) => void;
  endSprint: () => SprintSession | null;
  nextCard: () => void;
  rateCard: (rating: 'hard' | 'good' | 'easy') => void;
  flipCard: () => void;
  updateTimer: () => void;
  resetSprint: () => void;
  
  // Stats
  stats: UserStats;
  updateStats: (session: SprintSession) => void;
  resetStats: () => void;
  
  // Schedule
  schedule: ScheduleItem[];
  setSchedule: (items: ScheduleItem[]) => void;
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;
}

const defaultSprintState: SprintState = {
  isActive: false,
  deckId: null,
  duration: 0,
  remainingTime: 0,
  currentCardIndex: 0,
  cards: [],
  ratings: { hard: 0, good: 0, easy: 0 },
  startTime: 0,
};

const defaultStats: UserStats = {
  totalSprints: 0,
  totalCardsReviewed: 0,
  totalTimeStudied: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  lastStudyDate: '',
};

const defaultSchedule: ScheduleItem[] = [];

const deckColors = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-violet-500', 'bg-lime-500', 'bg-pink-500',
];

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<PockEdStore>()(
  persist(
    (set, get) => ({
      decks: [],
      
      sprint: defaultSprintState,
      
      stats: defaultStats,
      
      schedule: defaultSchedule,
      
      addDeck: (deckData) => {
        const newDeck: Deck = {
          ...deckData,
          id: generateId(),
          cards: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ decks: [...state.decks, newDeck] }));
        return newDeck;
      },
      
      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
          ),
        }));
      },
      
      deleteDeck: (id) => {
        set((state) => ({ decks: state.decks.filter((d) => d.id !== id) }));
      },
      
      getDeck: (id) => {
        return get().decks.find((d) => d.id === id);
      },
      
      addCard: (deckId, cardData) => {
        const newCard: Flashcard = {
          ...cardData,
          id: generateId(),
          deckId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId ? { ...d, cards: [...d.cards, newCard], updatedAt: Date.now() } : d
          ),
        }));
        return newCard;
      },
      
      updateCard: (deckId, cardId, updates) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId ? { ...c, ...updates, updatedAt: Date.now() } : c
                  ),
                  updatedAt: Date.now(),
                }
              : d
          ),
        }));
      },
      
      deleteCard: (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: d.cards.filter((c) => c.id !== cardId), updatedAt: Date.now() }
              : d
          ),
        }));
      },
      
      startSprint: (deckId, duration) => {
        const deck = get().getDeck(deckId);
        if (!deck || deck.cards.length === 0) return;
        
        // Shuffle cards for the sprint
        const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
        
        set({
          sprint: {
            isActive: true,
            deckId,
            duration,
            remainingTime: duration * 60,
            currentCardIndex: 0,
            cards: shuffledCards,
            ratings: { hard: 0, good: 0, easy: 0 },
            startTime: Date.now(),
          },
        });
      },
      
      endSprint: () => {
        const { sprint, updateStats } = get();
        if (!sprint.isActive) return null;
        
        const session: SprintSession = {
          id: generateId(),
          deckId: sprint.deckId!,
          duration: sprint.duration,
          cardsReviewed: sprint.currentCardIndex + 1,
          xpEarned: (sprint.currentCardIndex + 1) * 10 + sprint.ratings.easy * 5,
          startedAt: sprint.startTime,
          completedAt: Date.now(),
          ratings: sprint.ratings,
        };
        
        updateStats(session);
        set({ sprint: defaultSprintState });
        return session;
      },
      
      nextCard: () => {
        set((state) => {
          if (!state.sprint.isActive) return state;
          const nextIndex = state.sprint.currentCardIndex + 1;
          if (nextIndex >= state.sprint.cards.length) {
            return state; // Will be handled by endSprint
          }
          return {
            sprint: {
              ...state.sprint,
              currentCardIndex: nextIndex,
            },
          };
        });
      },
      
      rateCard: (rating) => {
        set((state) => {
          if (!state.sprint.isActive) return state;
          const nextIndex = state.sprint.currentCardIndex + 1;
          const newRatings = { ...state.sprint.ratings, [rating]: state.sprint.ratings[rating] + 1 };
          
          if (nextIndex >= state.sprint.cards.length) {
            // Sprint complete - will be handled by endSprint call
            return {
              sprint: {
                ...state.sprint,
                ratings: newRatings,
              },
            };
          }
          
          return {
            sprint: {
              ...state.sprint,
              currentCardIndex: nextIndex,
              ratings: newRatings,
            },
          };
        });
      },
      
      flipCard: () => {
        // This is handled locally in the component via state
      },
      
      updateTimer: () => {
        set((state) => {
          if (!state.sprint.isActive || state.sprint.remainingTime <= 0) return state;
          return {
            sprint: {
              ...state.sprint,
              remainingTime: state.sprint.remainingTime - 1,
            },
          };
        });
      },
      
      resetSprint: () => {
        set({ sprint: defaultSprintState });
      },
      
      updateStats: (session) => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = state.stats.lastStudyDate;
          let newStreak = state.stats.currentStreak;
          
          if (lastDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastDate === yesterday) {
              newStreak += 1;
            } else if (lastDate !== '') {
              newStreak = 1;
            } else {
              newStreak = 1;
            }
          }
          
          return {
            stats: {
              totalSprints: state.stats.totalSprints + 1,
              totalCardsReviewed: state.stats.totalCardsReviewed + session.cardsReviewed,
              totalTimeStudied: state.stats.totalTimeStudied + session.duration,
              currentStreak: newStreak,
              longestStreak: Math.max(state.stats.longestStreak, newStreak),
              totalXP: state.stats.totalXP + session.xpEarned,
              lastStudyDate: today,
            },
          };
        });
      },
      
      resetStats: () => {
        set({ stats: defaultStats });
      },
      
      setSchedule: (items) => {
        set({ schedule: items });
      },

      addSchedule: (itemData) => {
        const newItem: ScheduleItem = {
          ...itemData,
          id: generateId(),
        };
        set((state) => ({ schedule: [...state.schedule, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime)) }));
        return newItem;
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedule: state.schedule.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ).sort((a, b) => a.startTime.localeCompare(b.startTime)),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedule: state.schedule.filter((s) => s.id !== id),
        }));
      },
    }),
    {
      name: 'pocked-storage',
      version: 1,
    }
  )
);