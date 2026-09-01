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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { calculateFreeBlocks, getTimeBlockOptions, formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function Dashboard() {
  const router = useRouter();
  const { schedule, decks, stats, startSprint, addSchedule, updateSchedule, deleteSchedule } =
    useStore();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  // Form states
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState<'class' | 'free'>('class');
  const [scheduleColor, setScheduleColor] = useState('bg-blue-500');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const freeBlocks = calculateFreeBlocks(schedule);
  const durationOptions = getTimeBlockOptions(freeBlocks);

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

  const handleQuickStart = (deckId: string, duration: number) => {
    startSprint(deckId, duration);
    router.push('/sprint');
  };

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setShowDurationModal(true);
  };

  const nextFreeBlock = freeBlocks[0];

  const validateScheduleForm = () => {
    const errors: Record<string, string> = {};
    if (!scheduleTitle.trim()) {
      errors.title = 'Title is required';
    }
    if (!scheduleStartTime) {
      errors.startTime = 'Start time is required';
    }
    if (!scheduleEndTime) {
      errors.endTime = 'End time is required';
    }
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

  const openScheduleModal = (item?: (typeof schedule)[0]) => {
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
          {getGreeting()}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2 font-display">
          Ready to learn?
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl">
          Turn your downtime into micro-learning sprints. PockEd turns short breaks between
          classes into focused flashcard sessions.
        </p>
      </motion.div>

      {/* Streak & Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <HeroStreakCard streak={stats.currentStreak} />
        <StatCard
          icon={Trophy}
          label="Total XP"
          value={stats.totalXP.toLocaleString()}
          accent="amber"
        />
        <StatCard
          icon={Zap}
          label="Sprints"
          value={stats.totalSprints}
          accent="indigo"
        />
        <StatCard
          icon={Layers}
          label="Cards Reviewed"
          value={stats.totalCardsReviewed}
          accent="green"
        />
      </motion.div>

      {/* Next Available Time Block */}
      {nextFreeBlock && decks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6 sm:p-8 relative">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-emerald-50 text-sm font-medium mb-1">
                      <Sparkles className="w-4 h-4" />
                      Next available free block
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-display">
                      {nextFreeBlock.start} – {nextFreeBlock.end}
                    </p>
                    <p className="text-sm text-emerald-50/90 mt-0.5">
                      {formatDuration(nextFreeBlock.duration)} of focus time
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => handleSelectDeck(decks[0].id)}
                  className="bg-white !text-emerald-600 hover:bg-emerald-50 shadow-lg shadow-emerald-900/20"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Sprint
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule — main column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--primary)]" />
                Today&apos;s Schedule
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                Plan your day to discover free time for sprints.
              </p>
            </div>
            <Button size="sm" onClick={() => openScheduleModal()}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {schedule.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="py-14 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pocked-gradient-soft mb-4">
                      <Calendar className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 font-display">
                      No schedule for today yet
                    </h3>
                    <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                      Add your classes, study blocks, and breaks to see your free time for
                      micro-learning sprints.
                    </p>
                    <Button onClick={() => openScheduleModal()} size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Add First Class
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {schedule.map((item, index) => {
                  const isClass = item.type === 'class';
                  const startMins =
                    parseInt(item.startTime.split(':')[0]) * 60 +
                    parseInt(item.startTime.split(':')[1]);
                  const endMins =
                    parseInt(item.endTime.split(':')[0]) * 60 +
                    parseInt(item.endTime.split(':')[1]);
                  const duration = endMins - startMins;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ delay: 0.03 * index }}
                      className={cn(
                        'group flex items-center gap-4 p-4 rounded-2xl border transition-all card-hover',
                        isClass
                          ? 'bg-[var(--card)] border-[var(--border)] hover:border-blue-300 dark:hover:border-blue-700'
                          : 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/70 dark:border-emerald-900/40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          isClass
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {isClass ? (
                          <GraduationCap className="w-5 h-5" />
                        ) : (
                          <Coffee className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-[var(--foreground)] truncate">
                            {item.title}
                          </p>
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
                              isClass
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            )}
                          >
                            {isClass ? 'Class' : 'Free Time'}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {item.startTime} – {item.endTime} • {formatDuration(duration)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {!isClass && decks.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-emerald-300 dark:border-emerald-800 !text-emerald-700 dark:!text-emerald-300 hover:!bg-emerald-100 dark:hover:!bg-emerald-900/40"
                            onClick={() => handleSelectDeck(decks[0].id)}
                          >
                            <Zap className="w-3.5 h-3.5 mr-1" />
                            Study
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                          onClick={() => openScheduleModal(item)}
                          aria-label="Edit schedule item"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--muted-foreground)] hover:text-red-600"
                          onClick={() => handleDeleteSchedule(item.id)}
                          aria-label="Delete schedule item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Side column: recent progress + AI tip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Today's goal */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--primary)]" />
                  Today
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Goal
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
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
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                <span className="numeric text-[var(--foreground)]">
                  {Math.min(stats.currentStreak, 7)}
                </span>{' '}
                of 7 days
              </p>
            </CardContent>
          </Card>

          {/* Free time summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] font-display">
                  Free blocks
                </h3>
              </div>
              <p className="numeric text-3xl text-[var(--foreground)] mb-1">
                {freeBlocks.length}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {freeBlocks.length === 0
                  ? 'Add free time to find opportunities'
                  : `Up to ${formatDuration(Math.max(...freeBlocks.map((b) => b.duration), 0))} of study time available`}
              </p>
            </CardContent>
          </Card>

          {/* AI tip */}
          <Card className="sparkle-accent">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-pocked-gradient flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] font-display">
                  AI Notes
                </h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Paste your lecture notes and PockEd generates flashcards for you in seconds.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="/decks">Open a deck</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Decks quick access */}
      {decks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-10"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                Your Decks
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                Quick access to your flashcard collections.
              </p>
            </div>
            <a
              href="/decks"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.slice(0, 3).map((deck, index) => {
              const mastery = deck.cards.length > 0 ? Math.round((deck.cards.length / Math.max(deck.cards.length, 1)) * 100) : 0;
              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card
                    className="group cursor-pointer h-full card-hover"
                    onClick={() => handleSelectDeck(deck.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm',
                            deck.color
                          )}
                        >
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--foreground)] truncate font-display">
                            {deck.name}
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {deck.cards.length} card{deck.cards.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2 min-h-[2.5rem]">
                        {deck.description || 'No description yet.'}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="numeric text-[var(--foreground)]">
                            {mastery}%
                          </span>
                          <span>ready</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/sprint?deck=${deck.id}`);
                          }}
                          className="group-hover:shadow-md"
                        >
                          <Zap className="w-3.5 h-3.5 mr-1" />
                          Sprint
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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
                if (selectedDeckId) {
                  handleQuickStart(selectedDeckId, option.value);
                }
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

function HeroStreakCard({ streak }: { streak: number }) {
  return (
    <Card className="overflow-hidden border-0 sm:col-span-2 lg:col-span-1 bg-pocked-gradient text-white">
      <CardContent className="p-5 sm:p-6 relative">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4" />
            Current Streak
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="numeric text-4xl sm:text-5xl">{streak}</span>
            <span className="text-sm text-indigo-100">day{streak === 1 ? '' : 's'}</span>
          </div>
          <p className="text-sm text-indigo-100">{getStreakMessage(streak)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: 'indigo' | 'green' | 'amber' | 'rose' | 'purple';
}) {
  const accentMap: Record<typeof accent, { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    purple: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  };
  const c = accentMap[accent];
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {label}
          </span>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
            <Icon className={cn('w-5 h-5', c.text)} />
          </div>
        </div>
        <p className="numeric text-3xl sm:text-4xl text-[var(--foreground)]">{value}</p>
      </CardContent>
    </Card>
  );
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your first sprint today';
  if (streak === 1) return 'Day one — keep it going!';
  if (streak < 7) return `${streak} days in a row. You are on fire!`;
  if (streak < 30) return 'Incredible consistency!';
  return 'You are a PockEd legend!';
}
