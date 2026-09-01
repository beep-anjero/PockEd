'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Brain, Zap, Loader2, X, Check, ChevronDown, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export function DecksView() {
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
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-cyan-500', 'bg-violet-500', 'bg-lime-500', 'bg-pink-500',
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

  const handleOpenEditModal = (deck: typeof decks[0]) => {
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated cards based on input
    const mockCards = [
      { front: 'What is the main concept discussed in the notes?', back: 'The primary topic covered in your uploaded notes.' },
      { front: 'Define the key term mentioned in the first paragraph.', back: 'A definition based on your notes content.' },
      { front: 'What are the three main points covered?', back: 'Point 1, Point 2, and Point 3 from your notes.' },
      { front: 'Explain the process described in the notes.', back: 'Step-by-step explanation from your content.' },
      { front: 'What example was given for the main concept?', back: 'The specific example mentioned in your notes.' },
    ].slice(0, Math.min(5, Math.max(3, aiInputText.split('.').length)));
    
    setGeneratedCards(mockCards);
    setIsGenerating(false);
  };

  const handleAddGeneratedCards = () => {
    if (!aiDeckId) return;
    generatedCards.forEach(card => {
      addCard(aiDeckId, card);
    });
    setShowAIModal(null);
    setGeneratedCards([]);
    setAiInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Decks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your flashcard collections
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Deck
        </Button>
      </motion.div>

      {/* Decks Grid */}
      <AnimatePresence mode="popLayout">
        {decks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
              <Brain className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No decks yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first deck to start building flashcard collections for your micro-sprints.
            </p>
            <Button onClick={() => setShowCreateModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Deck
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {decks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="group relative overflow-hidden">
                  <div className={cn('h-1 w-full', deck.color)} />
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', deck.color)}>
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{deck.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deck.cards.length} cards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAIModal(deck.id)}
                          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          aria-label="Generate cards with AI"
                        >
                          <Sparkles className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(deck)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Edit deck"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label="Delete deck"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Deck Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Deck"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {deckColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewDeckColor(color)}
                  className={cn(
                    'w-10 h-10 rounded-xl transition-all border-2',
                    color,
                    newDeckColor === color ? 'border-white ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  aria-label={color.replace('bg-', '').replace('-500', '')}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>Create Deck</Button>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {deckColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditDeckColor(color)}
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all border-2',
                      color,
                      editDeckColor === color ? 'border-white ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                    aria-label={color.replace('bg-', '').replace('-500', '')}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
              <Button onClick={() => handleUpdateDeck(showEditModal)} disabled={!editDeckName.trim()}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Note Ingestion Modal */}
      <Modal
        isOpen={!!showAIModal}
        onClose={() => setShowAIModal(null)}
        title="AI Note Ingestion"
        description="Paste your lecture notes or text, and let AI generate flashcards for you."
        size="lg"
      >
        {showAIModal && (
          <div className="space-y-4">
            <Textarea
              label="Paste your notes here"
              placeholder="Paste lecture notes, textbook excerpts, or any study material..."
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              rows={8}
            />
            
            {!isGenerating && generatedCards.length === 0 ? (
              <Button
                className="w-full"
                onClick={handleGenerateCards}
                disabled={!aiInputText.trim()}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Flashcards
              </Button>
            ) : null}
            
            {isGenerating && (
              <Button className="w-full" disabled>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI is analyzing your notes...
              </Button>
            )}
            
            {generatedCards.length > 0 && !isGenerating && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Generated {generatedCards.length} flashcards:
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {generatedCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">Q:</span>
                        <span className="text-gray-700 dark:text-gray-300">{card.front}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm ml-6">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">A:</span>
                        <span className="text-gray-700 dark:text-gray-300">{card.back}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setGeneratedCards([]); setAiInputText(''); }}>
                    Regenerate
                  </Button>
                  <Button onClick={handleAddGeneratedCards}>
                    <Check className="w-4 h-4 mr-2" />
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