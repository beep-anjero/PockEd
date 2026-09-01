'use client';

import { useMemo } from 'react';
import { Zap, Target, BookOpen, Calendar, Clock, Trophy, Flame, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function StatsView() {
  const { stats, decks, sprint } = useStore();

  // Calculate additional stats
  const totalCards = useMemo(() => decks.reduce((acc, deck) => acc + deck.cards.length, 0), [decks]);
  const avgCardsPerDeck = decks.length > 0 ? Math.round(totalCards / decks.length) : 0;
  const totalStudyHours = Math.round(stats.totalTimeStudied / 60 * 10) / 10;
  const cardsPerMinute = stats.totalTimeStudied > 0 
    ? Math.round((stats.totalCardsReviewed / stats.totalTimeStudied) * 100) / 100 
    : 0;

  // Weekly progress (mock data for demo)
  const weeklyData = useMemo(() => [
    { day: 'Mon', sprints: 2, cards: 15, minutes: 30 },
    { day: 'Tue', sprints: 1, cards: 8, minutes: 15 },
    { day: 'Wed', sprints: 3, cards: 22, minutes: 45 },
    { day: 'Thu', sprints: 2, cards: 18, minutes: 35 },
    { day: 'Fri', sprints: 1, cards: 10, minutes: 20 },
    { day: 'Sat', sprints: 0, cards: 0, minutes: 0 },
    { day: 'Sun', sprints: 0, cards: 0, minutes: 0 },
  ], []);

  const maxWeeklySprints = Math.max(...weeklyData.map(d => d.sprints), 1);
  const maxWeeklyCards = Math.max(...weeklyData.map(d => d.cards), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Your Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your micro-learning journey
        </p>
      </motion.div>

      {/* Main Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={Zap}
          iconColor="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          value={stats.totalSprints}
          label="Total Sprints"
          subtitle={`${stats.totalTimeStudied} min studied`}
        />
        <StatCard
          icon={BookOpen}
          iconColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          value={stats.totalCardsReviewed}
          label="Cards Reviewed"
          subtitle={`${cardsPerMinute} cards/min avg`}
        />
        <StatCard
          icon={Flame}
          iconColor="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          value={stats.currentStreak}
          label="Current Streak"
          subtitle={`Best: ${stats.longestStreak} days`}
        />
        <StatCard
          icon={Target}
          iconColor="text-rose-600 dark:text-rose-400"
          bgColor="bg-rose-50 dark:bg-rose-900/20"
          value={stats.totalXP.toLocaleString()}
          label="Total XP"
          subtitle={`Level ${Math.floor(stats.totalXP / 1000) + 1}`}
        />
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Study Time & Efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Study Time & Efficiency
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Study Time</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatDuration(stats.totalTimeStudied)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                      style={{ width: `${Math.min((stats.totalTimeStudied / 600) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Goal: 10 hours</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Review Speed</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cardsPerMinute} cards/min</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min((cardsPerMinute / 2) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Target: 2 cards/min</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudyHours}h</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Hours</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.totalTimeStudied / Math.max(stats.totalSprints, 1))}m</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Session</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgCardsPerDeck}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cards/Deck</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Deck Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Deck Overview
              </h2>
            </CardHeader>
            <CardContent>
              {decks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No decks created yet</p>
                  <a href="/decks" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                    Create your first deck
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {decks.map((deck) => (
                    <div key={deck.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn('w-3 h-3 rounded-full flex-shrink-0', deck.color)} />
                          <span className="font-medium text-gray-900 dark:text-white truncate">{deck.name}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">{deck.cards.length} cards</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(deck.cards.length / Math.max(totalCards, 1)) * 100}%`,
                            backgroundColor: deck.color.replace('bg-', '').replace('-500', '')
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              This Week's Activity
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 text-sm font-medium text-gray-500 dark:text-gray-400">{day.day}</div>
                  
                  {/* Sprints bar */}
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(day.sprints / maxWeeklySprints) * 100}%` }}
                    >
                      {day.sprints > 0 && (
                        <span className="text-xs font-medium text-white">{day.sprints} sprints</span>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sprints</span>
                    </div>
                  </div>

                  {/* Cards bar */}
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden ml-2">
                    <div 
                      className="h-full bg-emerald-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(day.cards / maxWeeklyCards) * 100}%` }}
                    >
                      {day.cards > 0 && (
                        <span className="text-xs font-medium text-white">{day.cards} cards</span>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Cards</span>
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="w-20 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {day.minutes}m
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Weekly Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {weeklyData.reduce((a, b) => a + b.sprints, 0)}
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-500">Sprints This Week</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {weeklyData.reduce((a, b) => a + b.cards, 0)}
                </p>
                <p className="text-xs text-emerald-500 dark:text-emerald-500">Cards Reviewed</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatDuration(weeklyData.reduce((a, b) => a + b.minutes, 0))}
                </p>
                <p className="text-xs text-amber-500 dark:text-amber-500">Time Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Achievements
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AchievementBadge
                icon={Zap}
                title="First Sprint"
                description="Complete your first micro-sprint"
                earned={stats.totalSprints >= 1}
                color="indigo"
              />
              <AchievementBadge
                icon={Flame}
                title="Week Warrior"
                description="Maintain a 7-day streak"
                earned={stats.currentStreak >= 7}
                color="amber"
              />
              <AchievementBadge
                icon={BookOpen}
                title="Centurion"
                description="Review 100 flashcards total"
                earned={stats.totalCardsReviewed >= 100}
                color="emerald"
              />
              <AchievementBadge
                icon={Target}
                title="XP Master"
                description="Earn 1,000 total XP"
                earned={stats.totalXP >= 1000}
                color="rose"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  iconColor, 
  bgColor, 
  value, 
  label, 
  subtitle 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  value: number | string;
  label: string;
  subtitle: string;
}) {
  return (
    <Card className={cn('relative overflow-hidden', bgColor)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementBadge({ 
  icon: Icon, 
  title, 
  description, 
  earned, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string; iconText: string }> = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconText: 'text-indigo-600 dark:text-indigo-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconText: 'text-amber-600 dark:text-amber-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconText: 'text-emerald-600 dark:text-emerald-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconText: 'text-rose-600 dark:text-rose-400' },
  };

  const colors = colorMap[color] || colorMap.indigo;
  const opacity = earned ? 1 : 0.4;

  return (
    <div 
      className={cn(
        'p-4 rounded-xl border-2 transition-all',
        earned ? 'border-transparent' : 'border-dashed border-gray-200 dark:border-gray-700',
        colors.bg
      )}
      style={{ opacity }}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors.iconBg)}>
        <Icon className={cn('w-5 h-5', colors.iconText)} />
      </div>
      <h3 className={cn('font-semibold text-gray-900 dark:text-white', colors.text)}>{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      {earned && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: colors.text }}>
          <span className="flex items-center">
            <Award className="w-3 h-3 mr-1" /> Unlocked
          </span>
        </div>
      )}
    </div>
  );
}