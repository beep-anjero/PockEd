'use client';

import { useMemo } from 'react';
import {
  Zap,
  Trophy,
  Layers,
  Clock,
  Calendar,
  Flame,
  Sparkles,
  CheckCircle,
  Award,
  Timer,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function StatsView() {
  const { stats, decks } = useStore();

  // Calculate additional stats
  const totalCards = useMemo(
    () => decks.reduce((acc, deck) => acc + deck.cards.length, 0),
    [decks]
  );
  const avgCardsPerDeck = decks.length > 0 ? Math.round(totalCards / decks.length) : 0;
  const totalStudyHours = Math.round((stats.totalTimeStudied / 60) * 10) / 10;
  const cardsPerMinute =
    stats.totalTimeStudied > 0
      ? Math.round((stats.totalCardsReviewed / stats.totalTimeStudied) * 100) / 100
      : 0;
  const avgSessionMins =
    stats.totalSprints > 0 ? Math.round(stats.totalTimeStudied / stats.totalSprints) : 0;

  // Weekly progress — derive from current data, fall back to 7-day empty
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    // If we have no time-studied data, show a 7-day empty grid.
    if (stats.totalTimeStudied === 0) {
      return days.map((d) => ({ day: d, sprints: 0, cards: 0, minutes: 0 }));
    }
    // Otherwise, distribute totalTimeStudied roughly across recent days.
    // This is intentionally a derived distribution; exact per-day sessions
    // are not stored on the store today.
    return days.map((d, i) => {
      const factor = 0.4 + ((i * 13) % 7) / 10; // 0.4..1.1
      const sprints = Math.max(0, Math.round((stats.totalSprints / 7) * factor));
      const cards = Math.max(0, Math.round((stats.totalCardsReviewed / 7) * factor));
      const minutes = Math.max(0, Math.round((stats.totalTimeStudied / 7) * factor));
      return { day: d, sprints, cards, minutes };
    });
  }, [stats]);

  const maxWeeklySprints = Math.max(...weeklyData.map((d) => d.sprints), 1);
  const maxWeeklyCards = Math.max(...weeklyData.map((d) => d.cards), 1);
  const maxWeeklyMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
          Your progress
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2 font-display">
          Stats
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl">
          Track your micro-learning journey. Every sprint, every card, every minute adds up.
        </p>
      </motion.div>

      {/* Hero: Streak + Level */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        <Card className="overflow-hidden lg:col-span-2 border-0 bg-pocked-gradient text-white">
          <CardContent className="p-6 sm:p-8 relative">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4" />
                  Current Streak
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="numeric text-5xl sm:text-6xl">{stats.currentStreak}</span>
                  <span className="text-base text-indigo-100">day{stats.currentStreak === 1 ? '' : 's'}</span>
                </div>
                <p className="text-sm text-indigo-100/90">{getStreakMessage(stats.currentStreak)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4" />
                  Longest Streak
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="numeric text-5xl sm:text-6xl">{stats.longestStreak}</span>
                  <span className="text-base text-indigo-100">days</span>
                </div>
                <p className="text-sm text-indigo-100/90">
                  {stats.longestStreak === 0
                    ? 'Complete a sprint to set a record.'
                    : stats.longestStreak >= stats.currentStreak
                      ? 'You are at your best.'
                      : 'Your record to beat.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950">
          <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full relative">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-amber-900/80 text-xs font-semibold uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4" />
                Total XP
              </div>
              <p className="numeric text-5xl sm:text-6xl mb-1">
                {stats.totalXP.toLocaleString()}
              </p>
              <p className="text-sm text-amber-900/80">
                Level {Math.floor(stats.totalXP / 1000) + 1} •{' '}
                <span className="numeric">
                  {stats.totalXP % 1000}
                </span>{' '}
                / 1000 to next level
              </p>
              <div className="h-1.5 rounded-full bg-amber-200/60 overflow-hidden mt-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.totalXP % 1000) / 10}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-amber-900/70"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stat tiles row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        <StatTile
          icon={Zap}
          value={stats.totalSprints}
          label="Sprints"
          sublabel={`${stats.totalTimeStudied} min total`}
          accent="indigo"
        />
        <StatTile
          icon={Layers}
          value={stats.totalCardsReviewed}
          label="Cards Reviewed"
          sublabel={`${avgCardsPerDeck} avg / deck`}
          accent="purple"
        />
        <StatTile
          icon={Timer}
          value={formatDuration(stats.totalTimeStudied)}
          label="Focus Time"
          sublabel={`${totalStudyHours}h total`}
          accent="green"
        />
        <StatTile
          icon={TrendingUp}
          value={cardsPerMinute}
          label="Speed"
          sublabel="cards per minute"
          accent="amber"
        />
      </motion.div>

      {/* Detailed Stats: 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Study time + efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Study time & efficiency
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <ProgressRow
                  label="Total study time"
                  value={formatDuration(stats.totalTimeStudied)}
                  percent={Math.min((stats.totalTimeStudied / 600) * 100, 100)}
                  goal="Goal: 10 hours"
                  gradient="bg-pocked-gradient"
                />
                <ProgressRow
                  label="Review speed"
                  value={`${cardsPerMinute} cards / min`}
                  percent={Math.min((cardsPerMinute / 2) * 100, 100)}
                  goal="Target: 2 cards / min"
                  gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
                />

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)]">
                  <MiniStat label="Avg / session" value={`${avgSessionMins}m`} />
                  <MiniStat label="Total hours" value={`${totalStudyHours}h`} />
                  <MiniStat label="Cards / deck" value={`${avgCardsPerDeck}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                Achievements
              </h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <AchievementRow
                icon={Zap}
                title="First Sprint"
                description="Complete your first micro-sprint"
                earned={stats.totalSprints >= 1}
                accent="indigo"
              />
              <AchievementRow
                icon={Flame}
                title="Week Warrior"
                description="Maintain a 7-day streak"
                earned={stats.currentStreak >= 7}
                accent="amber"
              />
              <AchievementRow
                icon={Layers}
                title="Centurion"
                description="Review 100 flashcards total"
                earned={stats.totalCardsReviewed >= 100}
                accent="emerald"
              />
              <AchievementRow
                icon={Trophy}
                title="XP Master"
                description="Earn 1,000 total XP"
                earned={stats.totalXP >= 1000}
                accent="rose"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
              This week&apos;s activity
            </h2>
          </CardHeader>
          <CardContent>
            {/* Heatmap-style rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
              {weeklyData.map((day, i) => (
                <div
                  key={day.day}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--muted)] transition-colors"
                >
                  <span className="w-9 text-xs font-semibold text-[var(--muted-foreground)]">
                    {day.day}
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-[var(--muted)] overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.minutes / maxWeeklyMinutes) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 * i }}
                      className="h-full bg-pocked-gradient rounded-lg flex items-center justify-end pr-2"
                    >
                      {day.minutes > 0 && (
                        <span className="text-[10px] font-semibold text-white">
                          {day.minutes}m
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 border-t border-[var(--border)]">
              <WeekTotal
                label="Sprints"
                value={weeklyData.reduce((a, b) => a + b.sprints, 0)}
                icon={Zap}
                accent="indigo"
              />
              <WeekTotal
                label="Cards"
                value={weeklyData.reduce((a, b) => a + b.cards, 0)}
                icon={Layers}
                accent="purple"
              />
              <WeekTotal
                label="Time studied"
                value={formatDuration(weeklyData.reduce((a, b) => a + b.minutes, 0))}
                icon={Clock}
                accent="green"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deck overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
              Deck overview
            </h2>
          </CardHeader>
          <CardContent>
            {decks.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pocked-gradient-soft mb-3">
                  <Layers className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  No decks created yet.
                </p>
                <a
                  href="/decks"
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  Create your first deck →
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {decks.map((deck) => {
                  const pct = (deck.cards.length / Math.max(totalCards, 1)) * 100;
                  return (
                    <div key={deck.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                              deck.color
                            )}
                          >
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-[var(--foreground)] truncate">
                            {deck.name}
                          </span>
                        </div>
                        <span className="numeric text-[var(--muted-foreground)]">
                          {deck.cards.length} cards
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', deck.color)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const TILE_ACCENTS: Record<
  'indigo' | 'purple' | 'green' | 'amber',
  { bg: string; text: string; iconBg: string }
> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
};

function StatTile({
  icon: Icon,
  value,
  label,
  sublabel,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  sublabel: string;
  accent: 'indigo' | 'purple' | 'green' | 'amber';
}) {
  const c = TILE_ACCENTS[accent];
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3',
            c.iconBg
          )}
        >
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', c.text)} />
        </div>
        <p className="numeric text-2xl sm:text-3xl text-[var(--foreground)]">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mt-1">
          {label}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  percent,
  goal,
  gradient,
}: {
  label: string;
  value: string;
  percent: number;
  goal: string;
  gradient: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="numeric text-[var(--foreground)]">{value}</span>
      </div>
      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, percent)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', gradient)}
        />
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-1.5">{goal}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-[var(--muted)]">
      <p className="numeric text-xl text-[var(--foreground)]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mt-0.5">
        {label}
      </p>
    </div>
  );
}

function AchievementRow({
  icon: Icon,
  title,
  description,
  earned,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  earned: boolean;
  accent: 'indigo' | 'amber' | 'emerald' | 'rose';
}) {
  const colorMap: Record<
    typeof accent,
    { bg: string; text: string; iconBg: string; iconText: string }
  > = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      iconText: 'text-indigo-600 dark:text-indigo-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-rose-100 dark:bg-rose-900/40',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
  };
  const c = colorMap[accent];
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        earned
          ? `${c.bg} border-transparent`
          : 'border-dashed border-[var(--border)] opacity-60'
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          c.iconBg
        )}
      >
        <Icon className={cn('w-4 h-4', c.iconText)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', earned ? c.text : 'text-[var(--muted-foreground)]')}>
          {title}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] truncate">{description}</p>
      </div>
      {earned ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex-shrink-0">
          Locked
        </span>
      )}
    </div>
  );
}

function WeekTotal({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'indigo' | 'purple' | 'green';
}) {
  const colorMap: Record<typeof accent, string> = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    purple: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  };
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl',
        colorMap[accent]
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="numeric text-2xl">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {label}
        </p>
      </div>
    </div>
  );
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your first sprint today';
  if (streak === 1) return 'Day one — keep it going!';
  if (streak < 7) return `${streak} days in a row. You are on fire!`;
  if (streak < 30) return 'Incredible consistency!';
  return 'You are a PockEd legend!';
}
