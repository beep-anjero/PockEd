import { format } from 'date-fns';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getTimeBlockOptions(freeBlocks: { start: string; end: string; duration: number }[]): { label: string; value: number }[] {
  const options: { label: string; value: number }[] = [];
  
  freeBlocks.forEach((block) => {
    if (block.duration >= 15) options.push({ label: `${block.duration} min (${block.start} - ${block.end})`, value: block.duration });
    if (block.duration >= 30) options.push({ label: `30 min`, value: 30 });
    if (block.duration >= 15) options.push({ label: `15 min`, value: 15 });
  });
  
  // Add default options
  options.push({ label: '15 min', value: 15 }, { label: '30 min', value: 30 }, { label: '45 min', value: 45 }, { label: '60 min', value: 60 });
  
  // Deduplicate
  const seen = new Set<number>();
  return options.filter((opt) => {
    if (seen.has(opt.value)) return false;
    seen.add(opt.value);
    return true;
  });
}

export function calculateFreeBlocks(schedule: { startTime: string; endTime: string; type: string }[]): { start: string; end: string; duration: number }[] {
  const blocks: { start: string; end: string; duration: number }[] = [];
  
  for (let i = 0; i < schedule.length - 1; i++) {
    const current = schedule[i];
    const next = schedule[i + 1];
    
    if (current.type === 'free') {
      const [currStartH, currStartM] = current.startTime.split(':').map(Number);
      const [currEndH, currEndM] = current.endTime.split(':').map(Number);
      const startMinutes = currStartH * 60 + currStartM;
      const endMinutes = currEndH * 60 + currEndM;
      const duration = endMinutes - startMinutes;
      
      if (duration > 0) {
        blocks.push({ start: current.startTime, end: current.endTime, duration });
      }
    }
    
    // Check gap between current end and next start
    const [currEndH, currEndM] = current.endTime.split(':').map(Number);
    const [nextStartH, nextStartM] = next.startTime.split(':').map(Number);
    const gap = (nextStartH * 60 + nextStartM) - (currEndH * 60 + currEndM);
    
    if (gap >= 15) {
      blocks.push({
        start: current.endTime,
        end: next.startTime,
        duration: gap,
      });
    }
  }
  
  return blocks;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getXPForRating(rating: 'hard' | 'good' | 'easy'): number {
  switch (rating) {
    case 'hard': return 5;
    case 'good': return 10;
    case 'easy': return 15;
  }
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your first sprint to begin a streak!';
  if (streak === 1) return '1 day streak! Keep it going!';
  if (streak < 7) return `${streak} day streak! You're on fire!`;
  if (streak < 30) return `${streak} day streak! Incredible consistency!`;
  return `${streak} day streak! You're a legend!`;
}