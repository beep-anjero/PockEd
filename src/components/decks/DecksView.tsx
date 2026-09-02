'use client';

import { useRef, useState } from 'react';
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
  Upload,
  File as FileIcon,
  X as XIcon,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { extractTextFromFile } from '@/lib/extractText';
import { generateFlashcardsFromText } from '@/lib/generateFlashcards';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

const isAcceptedFile = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  if (ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  const t = file.type;
  return (
    t === 'application/pdf' ||
    t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    t.startsWith('text/')
  );
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const fileExtLabel = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.txt')) return 'TXT';
  if (lower.endsWith('.md')) return 'MD';
  // Fallback to whatever the extension is
  const dot = lower.lastIndexOf('.');
  return dot >= 0 ? lower.slice(dot + 1).toUpperCase() : 'FILE';
};

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
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiFileMeta, setAiFileMeta] = useState<{ pages?: number; chars: number } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setAiFile(null);
    setAiFileMeta(null);
    setAiError(null);
    setGeneratedCards([]);
    setShowAIModal(deckId);
  };

  const handleFileSelected = (file: File | null | undefined) => {
    setAiError(null);
    if (!file) return;
    if (!isAcceptedFile(file)) {
      setAiError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setAiError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 25 MB.`
      );
      return;
    }
    setAiFile(file);
    setAiFileMeta(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e.target.files?.[0]);
    // Reset so the same file can be re-selected later
    e.target.value = '';
  };

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelected(e.dataTransfer.files?.[0]);
  };

  const handleFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleFileDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClearFile = () => {
    setAiFile(null);
    setAiFileMeta(null);
    setAiError(null);
  };

  const handleGenerateCards = async () => {
    if (!aiDeckId) return;
    setAiError(null);

    let sourceText = aiInputText.trim();
    if (!sourceText && !aiFile) {
      setAiError('Upload a file or paste some notes first.');
      return;
    }

    setIsGenerating(true);
    try {
      if (aiFile) {
        const result = await extractTextFromFile(aiFile);
        sourceText = result.text;
        setAiFileMeta({ pages: result.pages, chars: result.text.length });
        if (!sourceText.trim()) {
          throw new Error(
            `We couldn't extract any text from ${aiFile.name}. The file may be scanned/image-based or empty.`
          );
        }
      }

      // Brief simulated latency so the loading state is visible.
      await new Promise((resolve) => setTimeout(resolve, 600));

      const cards = generateFlashcardsFromText(sourceText);
      if (cards.length === 0) {
        throw new Error(
          "We couldn't find enough study signals in your content. Try pasting richer notes or a longer excerpt."
        );
      }
      setGeneratedCards(cards);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while generating flashcards.';
      setAiError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedCards = () => {
    if (!aiDeckId) return;
    generatedCards.forEach((card) => {
      addCard(aiDeckId, card);
    });
    setShowAIModal(null);
    setGeneratedCards([]);
    setAiInputText('');
    setAiFile(null);
    setAiFileMeta(null);
  };

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  const canGenerate = aiFile !== null || aiInputText.trim().length > 0;

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
        description="Upload a PDF, DOCX, or paste notes — PockEd turns them into flashcards."
        size="lg"
      >
        {showAIModal && (
          <div className="space-y-4">
            {!isGenerating && generatedCards.length === 0 && (
              <>
                {/* How it works */}
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-pocked-gradient-soft p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pocked-gradient text-white flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      How it works
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Drop in a PDF, DOCX, or text file — or paste notes directly. PockEd will
                      read the content and suggest Q&amp;A cards you can review, accept, or
                      regenerate.
                    </p>
                  </div>
                </div>

                {/* File upload zone */}
                {!aiFile ? (
                  <div>
                    <label
                      htmlFor="ai-file-upload"
                      onDrop={handleFileDrop}
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors text-center',
                        isDragging
                          ? 'border-[var(--primary)] bg-violet-50 dark:bg-violet-900/20'
                          : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]'
                      )}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-pocked-gradient text-white flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {isDragging
                            ? 'Drop to upload'
                            : 'Drag & drop a file, or click to browse'}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          PDF, DOCX, or TXT • up to 25 MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="ai-file-upload"
                        type="file"
                        accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                        onChange={handleFileInputChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pocked-gradient-soft flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pocked-gradient-soft text-[var(--primary)]">
                          {fileExtLabel(aiFile.name)}
                        </span>
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {aiFile.name}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatBytes(aiFile.size)}
                        {aiFileMeta?.pages ? ` • ${aiFileMeta.pages} page${aiFileMeta.pages === 1 ? '' : 's'}` : ''}
                        {aiFileMeta?.chars ? ` • ${aiFileMeta.chars.toLocaleString()} chars` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                      aria-label="Remove file"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Optional paste textarea */}
                <div>
                  <Textarea
                    label={aiFile ? 'Add extra notes (optional)' : 'Or paste your notes'}
                    placeholder={
                      aiFile
                        ? 'Paste anything extra to include in card generation…'
                        : 'Paste lecture notes, textbook excerpts, or any study material…'
                    }
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    rows={aiFile ? 4 : 8}
                  />
                </div>

                {/* Error */}
                {aiError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateCards}
                  disabled={!canGenerate}
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
                  {aiFile
                    ? `Reading ${aiFile.name}…`
                    : 'AI is reading your notes…'}
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
                {aiError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedCards([]);
                      setAiError(null);
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