'use client';

import { useState } from 'react';
import { Clock, Zap, BookOpen, Target, Calendar, Clock as ClockIcon, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { calculateFreeBlocks, getTimeBlockOptions, formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function Dashboard() {
  const { schedule, decks, stats, startSprint, addSchedule, updateSchedule, deleteSchedule } = useStore();
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

  const typeColors = {
    class: 'bg-blue-500',
    free: 'bg-green-500',
  };

  const handleQuickStart = (deckId: string, duration: number) => {
    startSprint(deckId, duration);
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

  const openScheduleModal = (item?: typeof schedule[0]) => {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Good morning! ☀️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Turn your downtime into micro-learning sprints
        </p>
      </motion.div>

      {/* Streak & Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-100">Current Streak</p>
                <p className="text-4xl font-bold">{stats.currentStreak} days</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Zap className="w-8 h-8" />
              </div>
            </div>
            <p className="mt-4 text-sm text-indigo-100">{getStreakMessage(stats.currentStreak)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalXP.toLocaleString()}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sprints Completed</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalSprints}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Available Time Block */}
      {nextFreeBlock && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <ClockIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-100">Next Available Slot</p>
                    <p className="text-2xl font-bold">
                      {nextFreeBlock.start} - {nextFreeBlock.end} ({formatDuration(nextFreeBlock.duration)})
                    </p>
                  </div>
                </div>
                {decks.length > 0 && (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-emerald-600 hover:bg-gray-100"
                    onClick={() => handleSelectDeck(decks[0].id)}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Sprint
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Today's Schedule
          </h2>
          <Button size="sm" onClick={() => openScheduleModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {schedule.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schedule for today yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Add your classes, study blocks, and breaks to see your free time for micro-learning sprints.
              </p>
              <Button onClick={() => openScheduleModal()} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Schedule Item
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {schedule.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.05 * index }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-all',
                    item.type === 'class'
                      ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  )}
                >
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0', item.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.startTime} - {item.endTime} • {formatDuration(
                        (parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1])) -
                        (parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]))
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.type === 'free' && decks.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleSelectDeck(decks[0].id)}
                      >
                        Study
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      onClick={() => openScheduleModal(item)}
                      aria-label="Edit schedule item"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => handleDeleteSchedule(item.id)}
                      aria-label="Delete schedule item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Your Decks Quick Access */}
      {decks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Your Decks
            </h2>
            <a href="/decks" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.slice(0, 3).map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => handleSelectDeck(deck.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', deck.color)}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{deck.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deck.cards.length} cards</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{deck.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {deck.cards.length === 0 ? 'Empty' : `${deck.cards.length} cards ready`}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = `/sprint?deck=${deck.id}`;
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Sprint
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Duration Selection Modal */}
      <Modal
        isOpen={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        title="Select Sprint Duration"
        size="sm"
      >
        <div className="space-y-3">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <div className="flex gap-4">
              <label className={cn(
                'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                scheduleType === 'class' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}>
                <input
                  type="radio"
                  value="class"
                  checked={scheduleType === 'class'}
                  onChange={() => setScheduleType('class')}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Class
                </span>
              </label>
              <label className={cn(
                'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                scheduleType === 'free' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}>
                <input
                  type="radio"
                  value="free"
                  checked={scheduleType === 'free'}
                  onChange={() => setScheduleType('free')}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Free Time
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {scheduleColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setScheduleColor(color.value)}
                  className={cn(
                    'w-10 h-10 rounded-xl transition-all border-2',
                    color.value,
                    scheduleColor === color.value ? 'border-white ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closeScheduleModal}>Cancel</Button>
            <Button onClick={handleScheduleSubmit}>
              {editingScheduleId ? 'Save Changes' : 'Add Schedule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your first sprint to begin a streak!';
  if (streak === 1) return '1 day streak! Keep it going!';
  if (streak < 7) return `${streak} day streak! You're on fire!`;
  if (streak < 30) return `${streak} day streak! Incredible consistency!`;
  return `${streak} day streak! You're a legend!`;
}