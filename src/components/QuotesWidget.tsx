import React, { useState } from "react";
import { Quote, Palette } from "../types";
import { ROOT_QUOTES, playSoundWave } from "../utils/data";
import { Quote as QuoteIcon, RefreshCw, Plus, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuotesWidgetProps {
  customQuotes: Quote[];
  onAddCustomQuote: (text: string, author: string, category: string) => void;
  onDeleteCustomQuote: (id: string) => void;
  palette: Palette;
  isDark: boolean;
}

export default function QuotesWidget({
  customQuotes,
  onAddCustomQuote,
  onDeleteCustomQuote,
  palette,
  isDark
}: QuotesWidgetProps) {
  // Combine core with custom quotes
  const allQuotes = [...ROOT_QUOTES, ...customQuotes];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Inspiration");

  const currentQuote = allQuotes[currentIndex] || ROOT_QUOTES[0];

  const handleNextQuote = () => {
    playSoundWave('click');
    if (allQuotes.length <= 1) return;
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * allQuotes.length);
    }
    setCurrentIndex(nextIdx);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddCustomQuote(
      newText.trim(),
      newAuthor.trim() || "Anonymous",
      newCategory.trim() || "Inspiration"
    );
    setNewText("");
    setNewAuthor("");
    setNewCategory("Inspiration");
    setShowAddForm(false);
    playSoundWave('success');
    
    // Switch to look at this newly added quote which goes to the end
    setCurrentIndex(allQuotes.length); // will be correct index after parents updates state
  };

  return (
    <div id="quotes-widget-card" className={`p-6 rounded-3xl transition-all duration-300 border flex flex-col justify-between ${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
    } shadow-sm h-full min-h-[220px]`}>
      
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
          isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-50 text-zinc-500"
        }`}>
          {currentQuote.category}
        </span>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            title="Create quote"
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            }`}
          >
            <Plus size={15} />
          </button>
          <button
            onClick={handleNextQuote}
            title="Next Inspiration"
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            }`}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          <motion.form
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onSubmit={handleFormSubmit}
            className="space-y-3 flex flex-col h-full justify-center"
          >
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Inject your own mental driver quote..."
              className={`w-full text-xs p-2 rounded-xl focus:outline-none resize-none h-14 font-sans ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500"
                  : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-300"
              } border`}
              maxLength={150}
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Author"
                className={`flex-1 text-[11px] p-2 rounded-xl focus:outline-none font-sans ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                    : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400"
                } border`}
                maxLength={30}
              />
              <button
                type="submit"
                className="px-3 rounded-xl text-white font-sans font-medium text-xs flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: palette.accent }}
              >
                <Check size={14} />
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="relative mb-2">
              <QuoteIcon
                size={34}
                className="absolute -top-3.5 -left-3.5 opacity-8 rotate-180"
                style={{ color: palette.accent }}
              />
              <p className={`font-sans text-sm italic leading-relaxed pl-3 font-medium tracking-wide ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}>
                &ldquo;{currentQuote.text}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between pl-3 mt-1.5">
              <span className="font-mono text-xs text-zinc-500">
                &mdash; {currentQuote.author}
              </span>

              {/* Delete Custom Quote */}
              {currentQuote.isCustom && (
                <button
                  onClick={() => {
                    onDeleteCustomQuote(currentQuote.id);
                    setCurrentIndex(0);
                    playSoundWave('click');
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  title="Remove quote"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
