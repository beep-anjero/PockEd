'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Zap,
  BookOpen,
  Target,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Flame,
  Trophy,
  Sparkles,
  GraduationCap,
  Coffee,
  Layers,
  BarChart3,
  TrendingUp,
  Timer,
  X,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { calculateFreeBlocks, getTimeBlockOptions, formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { ScheduleItem, Deck } from '@/types';

type SectionKey = 'today' | 'decks' | 'activity';

const SECTIONS: {
  key: SectionKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'today', label: 'Today', description: 'Schedule & free time', icon: Calendar },
  { key: 'decks', label: 'Decks', description: 'Flashcard collections', icon: Layers },
  { key: 'activity', label: 'Activity', description: 'Your progress', icon: BarChart3 },
];

export function Dashboard() {
  const router = useRouter();
  const { schedule, decks, stats, startSprint, addSchedule, updateSchedule, deleteSchedule } =
    useStore();

  const [activeSection, setActiveSection] = useState<SectionKey>('today');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sprint duration modal
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState<'class' | 'free'>('class');
  const [scheduleColor, setScheduleColor] = useState('bg-blue-500');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const freeBlocks = calculateFreeBlocks(schedule);
  const durationOptions = getTimeBlockOptions(freeBlocks);
  const nextFreeBlock = freeBlocks[0];

  const selectedSchedule =
    activeSection === 'today' ? schedule.find((s) => s.id === selectedId) ?? null : null;
  const selectedDeck =
    activeSection === 'decks' ? decks.find((d) => d.id === selectedId) ?? null : null;

  const handleQuickStart = (deckId: string, duration: number) => {
    startSprint(deckId, duration);
    router.push('/sprint');
  };

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setShowDurationModal(true);
  };

  const switchSection = (key: SectionKey) => {
    setActiveSection(key);
    setSelectedId(null);
  };

  // Schedule form
  const scheduleColors = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-cyan-500', label: 'Cyan' },
  ];

  const validateScheduleForm = () => {
    const errors: Record<string, string> = {};
    if (!scheduleTitle.trim()) errors.title = 'Title is required';
    if (!scheduleStartTime) errors.startTime = 'Start time is required';
    if (!scheduleEndTime) errors.endTime = 'End time is required';
    if (scheduleStartTime && scheduleEndTime && scheduleStartTime >= scheduleEndTime) {
      errors.endTime = 'End time must be after start time';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleSubmit = () => {
    if (!validateScheduleForm()) return;
    if (editingScheduleId) {
      updateSchedule(editingScheduleId, {
        title: scheduleTitle.trim(),
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        type: scheduleType,
        color: scheduleColor,
      });
    } else {
      addSchedule({
        title: scheduleTitle.trim(),
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        type: scheduleType,
        color: scheduleColor,
      });
    }
    closeScheduleModal();
  };

  const openScheduleModal = (item?: ScheduleItem) => {
    if (item) {
      setEditingScheduleId(item.id);
      setScheduleTitle(item.title);
      setScheduleStartTime(item.startTime);
      setScheduleEndTime(item.endTime);
      setScheduleType(item.type);
      setScheduleColor(item.color);
    } else {
      setEditingScheduleId(null);
      setScheduleTitle('');
      setScheduleStartTime('09:00');
      setScheduleEndTime('10:00');
      setScheduleType('class');
      setScheduleColor('bg-blue-500');
    }
    setFormErrors({});
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingScheduleId(null);
    setScheduleTitle('');
    setScheduleStartTime('09:00');
    setScheduleEndTime('10:00');
    setScheduleType('class');
    setScheduleColor('bg-blue-500');
    setFormErrors({});
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule item?')) {
      deleteSchedule(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const detailContent = renderDetail({
    section: activeSection,
    scheduleItem: selectedSchedule,
    deck: selectedDeck,
    statKey: activeSection === 'activity' ? selectedId : null,
    stats,
    schedule,
    decks,
    onStudy: () => selectedSchedule && handleSelectDeck(decks[0].id),
    onStartSprint: () => selectedDeck && handleSelectDeck(selectedDeck.id),
    onEditSchedule: () => selectedSchedule && openScheduleModal(selectedSchedule),
    onDeleteSchedule: () => selectedSchedule && handleDeleteSchedule(selectedSchedule.id),
  });

  return (
    <div className="flex h-[calc(100dvh-4rem)] lg:h-dvh overflow-hidden">
      {/* ===== Pane 2: middle list / feed ===== */}
      <section className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="shrink-0 px-4 sm:px-6 pt-4 pb-3 border-b border-[var(--border)] bg-[var(--card)]/60 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {getGreeting()}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] font-display truncate">
                {SECTIONS.find((s) => s.key === activeSection)?.label}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] truncate">
                {SECTIONS.find((s) => s.key === activeSection)?.description}
              </p>
            </div>
            {activeSection === 'today' && (
              <Button size="sm" onClick={() => openScheduleModal()} className="shrink-0">
                <Plus className="w-4 h-4 mr-1.5" />
                Add
              </Button>
            )}
            {activeSection === 'decks' && (
              <Button size="sm" asChild className="shrink-0">
                <a href="/decks">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New deck
                </a>
              </Button>
            )}
          </div>

          {/* Section switcher */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.key;
              const count =
                section.key === 'today'
                  ? schedule.length
                  : section.key === 'decks'
                    ? decks.length
                    : stats.totalSprints;
              return (
                <button
                  key={section.key}
                  onClick={() => switchSection(section.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-pocked-gradient text-white shadow-md shadow-indigo-500/20'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)]'
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                  <span
                    className={cn(
                      'numeric text-xs px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--card)] text-[var(--muted-foreground)]'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* List body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {activeSection === 'today' && (
                <TodayFeed
                  schedule={schedule}
                  decks={decks}
                  nextFreeBlock={nextFreeBlock}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                  onAdd={() => openScheduleModal()}
                  onStartSprint={() => decks.length > 0 && handleSelectDeck(decks[0].id)}
                />
              )}

              {activeSection === 'decks' && (
                <DecksFeed
                  decks={decks}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                />
              )}

              {activeSection === 'activity' && (
                <ActivityFeed
                  stats={stats}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ===== Pane 3: detail panel (desktop) ===== */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col shrink-0 border-l border-[var(--border)] bg-[var(--card)]/40 overflow-y-auto">
        {detailContent}
      </aside>

      {/* Detail panel (mobile slide-over) */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            key="mobile-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col"
            >
              <div className="flex justify-end p-3 shrink-0">
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{detailContent}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration Selection Modal */}
      <Modal
        isOpen={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        title="Select Sprint Duration"
        description="How much focus time do you have?"
        size="sm"
      >
        <div className="space-y-2">
          {durationOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedDuration === option.value ? 'primary' : 'outline'}
              className="w-full justify-between"
              onClick={() => {
                setSelectedDuration(option.value);
                if (selectedDeckId) handleQuickStart(selectedDeckId, option.value);
                setShowDurationModal(false);
                setSelectedDuration(null);
                setSelectedDeckId(null);
              }}
            >
              <span>{option.label}</span>
              <Zap className="w-4 h-4" />
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setShowDurationModal(false);
              setSelectedDuration(null);
              setSelectedDeckId(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Add/Edit Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={closeScheduleModal}
        title={editingScheduleId ? 'Edit Schedule Item' : 'Add Schedule Item'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g., Chemistry Lecture, Lunch Break, Study Session"
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            error={formErrors.title}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              error={formErrors.startTime}
            />
            <Input
              label="End Time"
              type="time"
              value={scheduleEndTime}
              onChange={(e) => setScheduleEndTime(e.target.value)}
              error={formErrors.endTime}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all',
                  scheduleType === 'class'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-[var(--border)] hover:border-blue-200 dark:hover:border-blue-800 text-[var(--muted-foreground)]'
                )}
              >
                <input
                  type="radio"
                  value="class"
                  checked={scheduleType === 'class'}
                  onChange={() => setScheduleType('class')}
                  className="sr-only"
                />
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Class</span>
              </label>
              <label
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all',
                  scheduleType === 'free'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-[var(--border)] hover:border-emerald-200 dark:hover:border-emerald-800 text-[var(--muted-foreground)]'
                )}
              >
                <input
                  type="radio"
                  value="free"
                  checked={scheduleType === 'free'}
                  onChange={() => setScheduleType('free')}
                  className="sr-only"
                />
                <Coffee className="w-5 h-5" />
                <span className="font-medium">Free Time</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {scheduleColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setScheduleColor(color.value)}
                  className={cn(
                    'w-9 h-9 rounded-xl transition-all border-2',
                    color.value,
                    scheduleColor === color.value
                      ? 'border-white ring-2 ring-offset-2 ring-[var(--primary)] scale-110'
                      : 'border-transparent hover:border-[var(--border)]'
                  )}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeScheduleModal}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit}>
              {editingScheduleId ? 'Save Changes' : 'Add Schedule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   Middle pane feeds
   ============================================================ */

function TodayFeed({
  schedule,
  decks,
  nextFreeBlock,
  selectedId,
  onSelect,
  onAdd,
  onStartSprint,
}: {
  schedule: ScheduleItem[];
  decks: Deck[];
  nextFreeBlock: { start: string; end: string; duration: number } | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onStartSprint: () => void;
}) {
  if (schedule.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pocked-gradient-soft mb-3">
            <Calendar className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1.5 font-display">
            No schedule for today yet
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-5 max-w-md mx-auto">
            Add your classes, study blocks, and breaks to see your free time for micro-learning
            sprints.
          </p>
          <Button onClick={onAdd} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add First Class
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {nextFreeBlock && decks.length > 0 && (
        <Card className="overflow-hidden border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 text-white">
          <CardContent className="p-5 relative">
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-50 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Next free block
                  </div>
                  <p className="text-lg font-bold font-display">
                    {nextFreeBlock.start} – {nextFreeBlock.end}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={onStartSprint}
                className="bg-white !text-emerald-600 hover:bg-emerald-50 shadow-md shadow-emerald-900/20"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Sprint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {schedule.map((item) => {
        const isClass = item.type === 'class';
        const startMins =
          parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]);
        const endMins =
          parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]);
        const duration = endMins - startMins;
        const isSelected = selectedId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
              isSelected
                ? 'border-[var(--primary)] bg-[var(--muted)]/70 shadow-sm'
                : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted-foreground)]/40 card-hover'
            )}
          >
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                isClass
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              )}
            >
              {isClass ? <GraduationCap className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-[var(--foreground)] truncate">{item.title}</p>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
                    isClass
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  )}
                >
                  {isClass ? 'Class' : 'Free'}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {item.startTime} – {item.endTime} • {formatDuration(duration)}
              </p>
            </div>
            <ArrowRight
              className={cn(
                'w-4 h-4 flex-shrink-0 transition-opacity',
                isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100'
              )}
            />
          </button>
        );
      })}
    </>
  );
}

function DecksFeed({
  decks,
  selectedId,
  onSelect,
}: {
  decks: Deck[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (decks.length === 0) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pocked-gradient-soft mb-4">
            <Layers className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 font-display">
            No decks yet
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            Create a deck to start turning your downtime into flashcard sprints.
          </p>
          <Button asChild size="lg">
            <a href="/decks">
              <Plus className="w-5 h-5 mr-2" />
              Create a Deck
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {decks.map((deck) => {
        const cardCount = deck.cards.length;
        const isSelected = selectedId === deck.id;
        return (
          <button
            key={deck.id}
            onClick={() => onSelect(deck.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
              isSelected
                ? 'border-[var(--primary)] bg-[var(--muted)]/70 shadow-sm'
                : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted-foreground)]/40 card-hover'
            )}
          >
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0',
                deck.color
              )}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--foreground)] truncate">{deck.name}</p>
              <p className="text-sm text-[var(--muted-foreground)] truncate">
                {cardCount} card{cardCount === 1 ? '' : 's'}
                {deck.description ? ` • ${deck.description}` : ''}
              </p>
            </div>
            <ArrowRight
              className={cn(
                'w-4 h-4 flex-shrink-0',
                isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
              )}
            />
          </button>
        );
      })}
    </>
  );
}

function ActivityFeed({
  stats,
  selectedId,
  onSelect,
}: {
  stats: ReturnType<typeof useStore.getState>['stats'];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const cardsPerMinute =
    stats.totalTimeStudied > 0
      ? Math.round((stats.totalCardsReviewed / stats.totalTimeStudied) * 100) / 100
      : 0;
  const items = [
    {
      key: 'streak',
      label: 'Current Streak',
      value: `${stats.currentStreak}`,
      unit: `day${stats.currentStreak === 1 ? '' : 's'}`,
      icon: Flame,
      accent: 'amber' as const,
    },
    {
      key: 'xp',
      label: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      unit: 'XP',
      icon: Trophy,
      accent: 'indigo' as const,
    },
    {
      key: 'sprints',
      label: 'Sprints',
      value: `${stats.totalSprints}`,
      unit: 'sessions',
      icon: Zap,
      accent: 'purple' as const,
    },
    {
      key: 'cards',
      label: 'Cards Reviewed',
      value: `${stats.totalCardsReviewed}`,
      unit: 'cards',
      icon: Layers,
      accent: 'green' as const,
    },
    {
      key: 'focus',
      label: 'Focus Time',
      value: formatDuration(stats.totalTimeStudied),
      unit: '',
      icon: Timer,
      accent: 'cyan' as const,
    },
    {
      key: 'speed',
      label: 'Review Speed',
      value: `${cardsPerMinute}`,
      unit: 'cards/min',
      icon: TrendingUp,
      accent: 'rose' as const,
    },
  ];

  const accentMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  } as const;

  return (
    <>
      {items.map((item) => {
        const isSelected = selectedId === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
              isSelected
                ? 'border-[var(--primary)] bg-[var(--muted)]/70 shadow-sm'
                : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted-foreground)]/40 card-hover'
            )}
          >
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                accentMap[item.accent]
              )}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">{item.label}</p>
              <p className="font-semibold text-[var(--foreground)]">
                <span className="numeric">{item.value}</span>
                {item.unit && (
                  <span className="text-sm text-[var(--muted-foreground)]"> {item.unit}</span>
                )}
              </p>
            </div>
            <ArrowRight
              className={cn(
                'w-4 h-4 flex-shrink-0',
                isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
              )}
            />
          </button>
        );
      })}
    </>
  );
}

/* ============================================================
   Detail panel
   ============================================================ */

function renderDetail({
  section,
  scheduleItem,
  deck,
  statKey,
  stats,
  schedule,
  decks,
  onStudy,
  onStartSprint,
  onEditSchedule,
  onDeleteSchedule,
}: {
  section: SectionKey;
  scheduleItem: ScheduleItem | null;
  deck: Deck | null;
  statKey: string | null;
  stats: ReturnType<typeof useStore.getState>['stats'];
  schedule: ScheduleItem[];
  decks: Deck[];
  onStudy: () => void;
  onStartSprint: () => void;
  onEditSchedule: () => void;
  onDeleteSchedule: () => void;
}) {
  // Schedule detail
  if (section === 'today' && scheduleItem) {
    const isClass = scheduleItem.type === 'class';
    const startMins =
      parseInt(scheduleItem.startTime.split(':')[0]) * 60 +
      parseInt(scheduleItem.startTime.split(':')[1]);
    const endMins =
      parseInt(scheduleItem.endTime.split(':')[0]) * 60 +
      parseInt(scheduleItem.endTime.split(':')[1]);
    const duration = endMins - startMins;
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
              isClass
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
            )}
          >
            {isClass ? <GraduationCap className="w-7 h-7" /> : <Coffee className="w-7 h-7" />}
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                'inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1',
                isClass
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              )}
            >
              {isClass ? 'Class' : 'Free Time'}
            </span>
            <h2 className="text-xl font-bold text-[var(--foreground)] font-display">
              {scheduleItem.title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailMeta label="Starts" value={scheduleItem.startTime} icon={Clock} />
          <DetailMeta label="Ends" value={scheduleItem.endTime} icon={Clock} />
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Zap className="w-4 h-4 text-[var(--primary)]" />
          {formatDuration(duration)} block
        </div>

        <div className="pt-2 space-y-2">
          {!isClass && decks.length > 0 && (
            <Button className="w-full" onClick={onStudy}>
              <Zap className="w-4 h-4 mr-2" />
              Study Now
            </Button>
          )}
          {isClass && decks.length > 0 && (
            <Button className="w-full" onClick={onStudy}>
              <BookOpen className="w-4 h-4 mr-2" />
              Review This Subject
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onEditSchedule}>
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Button variant="danger" className="flex-1" onClick={onDeleteSchedule}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Deck detail
  if (section === 'decks' && deck) {
    const cardCount = deck.cards.length;
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0',
              deck.color
            )}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--foreground)] font-display">
              {deck.name}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {cardCount} card{cardCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          {deck.description || 'No description yet.'}
        </p>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--muted-foreground)]">
              {cardCount === 0 ? 'Empty deck' : 'Ready to study'}
            </span>
            <span className="numeric text-[var(--foreground)]">{cardCount}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className={cn('h-full rounded-full', deck.color)}
              style={{ width: cardCount === 0 ? '4%' : `${Math.min(100, cardCount * 4)}%` }}
            />
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <Button className="w-full" onClick={onStartSprint} disabled={cardCount === 0}>
            <Zap className="w-4 h-4 mr-2" />
            Start Sprint
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/decks">
              <Layers className="w-4 h-4 mr-2" />
              Open in Decks
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Activity detail
  if (section === 'activity' && statKey) {
    return <ActivityDetail statKey={statKey} stats={stats} decks={decks} />;
  }

  // Placeholder when nothing selected
  const freeBlocks = calculateFreeBlocks(schedule);
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--foreground)] font-display">Today&apos;s Goal</h3>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        {getDailyGoalMessage(stats.currentStreak, freeBlocks.length)}
      </p>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (stats.currentStreak / 7) * 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-pocked-gradient rounded-full"
        />
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        <span className="numeric text-[var(--foreground)]">
          {Math.min(stats.currentStreak, 7)}
        </span>{' '}
        of 7 days
      </p>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <DetailMeta label="Free blocks" value={`${freeBlocks.length}`} icon={Clock} />
        <DetailMeta label="Sprints" value={`${stats.totalSprints}`} icon={Zap} />
      </div>

      <Card className="sparkle-accent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-pocked-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] font-display">AI Notes</h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Paste your lecture notes and PockEd generates flashcards for you in seconds.
          </p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <a href="/decks">Open a deck</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailMeta({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-3 rounded-2xl bg-[var(--muted)]/70 border border-[var(--border)]">
      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="numeric text-lg text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function ActivityDetail({
  statKey,
  stats,
  decks,
}: {
  statKey: string;
  stats: ReturnType<typeof useStore.getState>['stats'];
  decks: Deck[];
}) {
  const cardsPerMinute =
    stats.totalTimeStudied > 0
      ? Math.round((stats.totalCardsReviewed / stats.totalTimeStudied) * 100) / 100
      : 0;
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  const config: Record<
    string,
    {
      label: string;
      value: string;
      icon: React.ComponentType<{ className?: string }>;
      description: string;
      percent: number;
      accent: string;
    }
  > = {
    streak: {
      label: 'Current Streak',
      value: `${stats.currentStreak}`,
      icon: Flame,
      description: getStreakMessage(stats.currentStreak),
      percent: Math.min((stats.currentStreak / 7) * 100, 100),
      accent: 'bg-gradient-to-r from-amber-400 to-orange-500',
    },
    xp: {
      label: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      icon: Trophy,
      description: `Level ${Math.floor(stats.totalXP / 1000) + 1} — ${stats.totalXP % 1000} / 1000 XP to the next level.`,
      percent: ((stats.totalXP % 1000) / 1000) * 100,
      accent: 'bg-gradient-to-r from-amber-400 to-amber-500',
    },
    sprints: {
      label: 'Sprints',
      value: `${stats.totalSprints}`,
      icon: Zap,
      description: 'Micro-learning sessions completed. Every sprint counts toward your streak.',
      percent: Math.min((stats.totalSprints / 20) * 100, 100),
      accent: 'bg-pocked-gradient',
    },
    cards: {
      label: 'Cards Reviewed',
      value: `${stats.totalCardsReviewed}`,
      icon: Layers,
      description: `Across ${totalCards} card${totalCards === 1 ? '' : 's'} in ${decks.length} deck${decks.length === 1 ? '' : 's'}.`,
      percent: Math.min((stats.totalCardsReviewed / 100) * 100, 100),
      accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    focus: {
      label: 'Focus Time',
      value: formatDuration(stats.totalTimeStudied),
      icon: Timer,
      description: 'Total time spent in focused sprint sessions.',
      percent: Math.min((stats.totalTimeStudied / 600) * 100, 100),
      accent: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    },
    speed: {
      label: 'Review Speed',
      value: `${cardsPerMinute}`,
      icon: TrendingUp,
      description:
        cardsPerMinute === 0
          ? 'Complete a sprint to measure your pace.'
          : 'Average cards reviewed per minute during sprints.',
      percent: Math.min((cardsPerMinute / 2) * 100, 100),
      accent: 'bg-gradient-to-r from-violet-500 to-purple-500',
    },
  };

  const item = config[statKey];
  if (!item) return null;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-pocked-gradient-soft flex items-center justify-center flex-shrink-0">
          <item.icon className="w-7 h-7 text-[var(--primary)]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--foreground)] font-display">{item.label}</h2>
          <p className="numeric text-2xl text-[var(--foreground)]">{item.value}</p>
        </div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.description}</p>

      <div>
        <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, item.percent)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', item.accent)}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

function getDailyGoalMessage(streak: number, freeBlockCount: number): string {
  if (freeBlockCount === 0) {
    return 'Add free time to your schedule to unlock your first sprint today.';
  }
  if (streak === 0) {
    return 'Complete one sprint today to start your streak.';
  }
  if (streak < 7) {
    return `${7 - streak} day${7 - streak === 1 ? '' : 's'} to a 7-day streak. Keep going!`;
  }
  return 'You are on a 7+ day streak. Amazing consistency!';
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your first sprint today';
  if (streak === 1) return 'Day one — keep it going!';
  if (streak < 7) return `${streak} days in a row. You are on fire!`;
  if (streak < 30) return 'Incredible consistency!';
  return 'You are a PockEd legend!';
}
