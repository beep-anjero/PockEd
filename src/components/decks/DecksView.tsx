'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  Zap,
  Loader2,
  Check,
  Sparkles,
  Wand2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export function DecksView() {
  const router = useRouter();
  const { decks, addDeck, updateDeck, deleteDeck, addCard } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<{ front: string; back: string }[]>([]);

  // Form states
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('bg-indigo-500');
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckDesc, setEditDeckDesc] = useState('');
  const [editDeckColor, setEditDeckColor] = useState('bg-indigo-500');
  const [aiInputText, setAiInputText] = useState('');
  const [aiDeckId, setAiDeckId] = useState<string | null>(null);

  const deckColors = [
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-emerald-500', label: 'Emerald' },
    { value: 'bg-amber-500', label: 'Amber' },
    { value: 'bg-rose-500', label: 'Rose' },
    { value: 'bg-cyan-500', label: 'Cyan' },
    { value: 'bg-violet-500', label: 'Violet' },
    { value: 'bg-lime-500', label: 'Lime' },
    { value: 'bg-pink-500', label: 'Pink' },
  ];

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    addDeck({ name: newDeckName, description: newDeckDesc, color: newDeckColor, cards: [] });
    setNewDeckName('');
    setNewDeckDesc('');
    setShowCreateModal(false);
  };

  const handleUpdateDeck = (id: string) => {
    if (!editDeckName.trim()) return;
    updateDeck(id, { name: editDeckName, description: editDeckDesc, color: editDeckColor });
    setShowEditModal(null);
  };

  const handleDeleteDeck = (id: string) => {
    if (confirm('Are you sure you want to delete this deck? All cards will be lost.')) {
      deleteDeck(id);
    }
  };

  const handleOpenEditModal = (deck: (typeof decks)[0]) => {
    setEditDeckName(deck.name);
    setEditDeckDesc(deck.description);
    setEditDeckColor(deck.color);
    setShowEditModal(deck.id);
  };

  const handleOpenAIModal = (deckId: string) => {
    setAiDeckId(deckId);
    setAiInputText('');
    setGeneratedCards([]);
    setShowAIModal(deckId);
  };

  const handleGenerateCards = async () => {
    if (!aiInputText.trim() || !aiDeckId) return;

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock generated cards based on input
    const mockCards = [
      {
        front: 'What is the main concept discussed in the notes?',
        back: 'The primary topic covered in your uploaded notes.',
      },
      {
        front: 'Define the key term mentioned in the first paragraph.',
        back: 'A definition based on your notes content.',
      },
      {
        front: 'What are the three main points covered?',
        back: 'Point 1, Point 2, and Point 3 from your notes.',
      },
      {
        front: 'Explain the process described in the notes.',
        back: 'Step-by-step explanation from your content.',
      },
      {
        front: 'What example was given for the main concept?',
        back: 'The specific example mentioned in your notes.',
      },
    ].slice(0, Math.min(5, Math.max(3, aiInputText.split('.').length)));

    setGeneratedCards(mockCards);
    setIsGenerating(false);
  };

  const handleAddGeneratedCards = () => {
    if (!aiDeckId) return;
    generatedCards.forEach((card) => {
      addCard(aiDeckId, card);
    });
    setShowAIModal(null);
    setGeneratedCards([]);
    setAiInputText('');
  };

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
            Your library
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2 font-display">
            Decks
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your flashcard collections. {decks.length} deck
            {decks.length === 1 ? '' : 's'} • {totalCards} card
            {totalCards === 1 ? '' : 's'} total.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Deck
        </Button>
      </motion.div>

      {/* Decks Grid */}
      <AnimatePresence mode="popLayout">
        {decks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="py-16 px-6 text-center relative">
                <div className="absolute inset-x-0 -top-px h-1 bg-pocked-gradient" />
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-pocked-gradient-soft mb-6">
                  <Layers className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 font-display">
                  No decks yet
                </h2>
                <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                  Create your first deck and start building your personal study library. PockEd
                  will turn short breaks into focused flashcard sessions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setShowCreateModal(true)} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Deck
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {decks.map((deck, index) => {
              const cardCount = deck.cards.length;
              const isEmpty = cardCount === 0;
              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.04 * index, type: 'spring', stiffness: 220, damping: 26 }}
                >
                  <Card className="group relative h-full card-hover overflow-hidden">
                    {/* Color bar */}
                    <div className={cn('h-1.5 w-full', deck.color)} />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm',
                            deck.color
                          )}
                        >
                          <Layers className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--foreground)] truncate font-display">
                            {deck.name}
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {cardCount} card{cardCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenAIModal(deck.id)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[#7C3AED] hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            aria-label="Generate cards with AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(deck)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                            aria-label="Edit deck"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck.id)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label="Delete deck"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--muted-foreground)] mb-5 line-clamp-2 min-h-[2.5rem]">
                        {deck.description || 'No description yet.'}
                      </p>

                      {/* Mastery / progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[var(--muted-foreground)]">
                            {isEmpty ? 'Empty deck' : 'Ready to study'}
                          </span>
                          <span className="numeric text-[var(--foreground)]">
                            {cardCount}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: isEmpty ? '4%' : `${Math.min(100, cardCount * 4)}%`,
                            }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', deck.color)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/sprint?deck=${deck.id}`)}
                          disabled={isEmpty}
                        >
                          <Zap className="w-4 h-4 mr-1.5" />
                          Start Sprint
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleOpenAIModal(deck.id)}
                          aria-label="Generate cards with AI"
                          className="border-violet-200 dark:border-violet-900/40 text-[#7C3AED] hover:bg-violet-50 dark:hover:bg-violet-900/20"
                        >
                          <Wand2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Deck Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Deck"
        description="A deck is a collection of flashcards on a single topic."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Deck Name"
            placeholder="e.g., Biology 101, Spanish Vocabulary"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Description (optional)"
            placeholder="What's this deck about?"
            value={newDeckDesc}
            onChange={(e) => setNewDeckDesc(e.target.value)}
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {deckColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewDeckColor(color.value)}
                  className={cn(
                    'w-9 h-9 rounded-xl transition-all border-2',
                    color.value,
                    newDeckColor === color.value
                      ? 'border-white ring-2 ring-offset-2 ring-[var(--primary)] scale-110'
                      : 'border-transparent hover:border-[var(--border)]'
                  )}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Deck
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Deck Modal */}
      <Modal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        title="Edit Deck"
        size="md"
      >
        {showEditModal && (
          <div className="space-y-4">
            <Input
              label="Deck Name"
              value={editDeckName}
              onChange={(e) => setEditDeckName(e.target.value)}
              autoFocus
            />
            <Textarea
              label="Description (optional)"
              value={editDeckDesc}
              onChange={(e) => setEditDeckDesc(e.target.value)}
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {deckColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEditDeckColor(color.value)}
                    className={cn(
                      'w-9 h-9 rounded-xl transition-all border-2',
                      color.value,
                      editDeckColor === color.value
                        ? 'border-white ring-2 ring-offset-2 ring-[var(--primary)] scale-110'
                        : 'border-transparent hover:border-[var(--border)]'
                    )}
                    aria-label={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditModal(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateDeck(showEditModal)} disabled={!editDeckName.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Note Ingestion Modal */}
      <Modal
        isOpen={!!showAIModal}
        onClose={() => setShowAIModal(null)}
        title={
          <span className="flex items-center gap-2">
            <span className="inline-flex w-9 h-9 rounded-xl bg-pocked-gradient items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>AI Note Ingestion</span>
          </span>
        }
        description="Paste your lecture notes and PockEd will turn them into flashcards."
        size="lg"
      >
        {showAIModal && (
          <div className="space-y-4">
            {!isGenerating && generatedCards.length === 0 && (
              <>
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-pocked-gradient-soft p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pocked-gradient text-white flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      How it works
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Paste at least a paragraph of notes. PockEd will suggest Q&amp;A cards
                      you can edit, accept, or regenerate.
                    </p>
                  </div>
                </div>
                <Textarea
                  label="Paste your notes"
                  placeholder="Paste lecture notes, textbook excerpts, or any study material…"
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  rows={8}
                />
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateCards}
                  disabled={!aiInputText.trim()}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Flashcards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {isGenerating && (
              <div className="py-10 text-center">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-pocked-gradient items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
                  AI is reading your notes…
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  This usually takes a few seconds.
                </p>
              </div>
            )}

            {generatedCards.length > 0 && !isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {generatedCards.length} flashcard
                    {generatedCards.length === 1 ? '' : 's'} generated
                  </p>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED]">
                    Review before adding
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {generatedCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]"
                    >
                      <div className="flex items-start gap-2 text-sm mb-1.5">
                        <span className="font-semibold text-[var(--primary)]">Q.</span>
                        <span className="text-[var(--foreground)]">{card.front}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm pl-5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          A.
                        </span>
                        <span className="text-[var(--muted-foreground)]">{card.back}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedCards([]);
                      setAiInputText('');
                    }}
                  >
                    Regenerate
                  </Button>
                  <Button onClick={handleAddGeneratedCards}>
                    <Check className="w-4 h-4 mr-1.5" />
                    Add to Deck
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
