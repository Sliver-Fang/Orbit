import React, { useState } from "react";
import { Habit, Palette } from "../types";
import { getLocalDateString, playSoundWave } from "../utils/data";
import { Plus, Trash2, Flame, CheckCircle, Circle, FolderHeart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitSectionProps {
  habits: Habit[];
  onAddHabit: (name: string, category: string) => void;
  onToggleHabit: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  palette: Palette;
  isDark: boolean;
}

export default function HabitSection({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
  palette,
  isDark
}: HabitSectionProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Wellness");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  const todayStr = getLocalDateString();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), category);
    setName("");
    playSoundWave('success');
  };

  const handleToggle = (id: string) => {
    onToggleHabit(id, todayStr);
  };

  // Extract unique categories for filtering
  const categories = ["all", ...Array.from(new Set(habits.map((h) => h.category)))];

  const filteredHabits = activeCategoryFilter === "all"
    ? habits
    : habits.filter((h) => h.category === activeCategoryFilter);

  // Calculate Streaks
  const calculateCurrentStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    // Convert to sorted unique dates
    const sorted = [...new Set(completedDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let checkDate = new Date(); // Start checking from today
    
    // If today is not completed, we see if yesterday is completed.
    // If neither, streak is 0.
    const hasToday = sorted.includes(getLocalDateString(0));
    const hasYesterday = sorted.includes(getLocalDateString(-1));
    
    if (!hasToday && !hasYesterday) {
      return 0;
    }
    
    let currentIdxDate = hasToday ? 0 : -1;
    
    while (true) {
      const targetStr = getLocalDateString(currentIdxDate);
      if (sorted.includes(targetStr)) {
        streak++;
        currentIdxDate--;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <div id="habits-section-card" className={`p-6 rounded-3xl transition-all duration-300 border ${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
    } shadow-sm`}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className={`font-sans font-semibold tracking-tight text-base flex items-center gap-2 ${
            isDark ? "text-zinc-100" : "text-zinc-800"
          }`}>
            <FolderHeart size={18} style={{ color: palette.accent }} />
            Assign Habits & Goals 🎯
          </h3>
          <p className="text-xs text-zinc-400 font-sans">
            Set deliberate recurring disciplines and trace streaks
          </p>
        </div>

        {/* Input Add Container */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 flex-wrap sm:flex-nowrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Drink 3L of water, code 1hr..."
            className={`flex-1 min-w-[150px] text-xs p-2.5 rounded-xl border focus:outline-none transition-all font-sans ${
              isDark
                ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500"
                : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-300"
            }`}
            maxLength={50}
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`text-xs p-2.5 rounded-xl border focus:outline-none font-sans ${
              isDark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-zinc-50 border-zinc-200 text-zinc-700"
            }`}
          >
            <option value="Wellness">Wellness</option>
            <option value="Mind">Mind</option>
            <option value="Career">Work</option>
            <option value="Hobby">Hobby</option>
            <option value="Fitness">Fitness</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-white font-sans font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer text-center"
            style={{ backgroundColor: palette.accent }}
          >
            Assign
          </button>
        </form>
      </div>

      {/* Categories Filter list (Horizontal Chips) */}
      {habits.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-sans font-semibold capitalize transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? "text-white"
                  : isDark
                    ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "bg-zinc-150 text-zinc-650 hover:bg-zinc-200/50"
              }`}
              style={{
                backgroundColor: activeCategoryFilter === cat ? palette.accent : undefined
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Habit Cards Content */}
      <AnimatePresence mode="popLayout">
        {filteredHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-8 text-xs text-zinc-450 italic rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 font-sans`}
          >
            {habits.length === 0
              ? "Habit list is initially empty. Assign your first recurring goal!"
              : "No habits found for the selected filter."}
          </motion.div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
            {filteredHabits.map((habit) => {
              const checkedToday = habit.completedDates.includes(todayStr);
              const curStreak = calculateCurrentStreak(habit.completedDates);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    checkedToday
                      ? isDark
                        ? "bg-emerald-950/20 border-emerald-900/40"
                        : "bg-emerald-50/60 border-emerald-100"
                      : isDark
                        ? "bg-zinc-805/40 border-zinc-800"
                        : "bg-zinc-50/50 border-zinc-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`transition-transform duration-200 hover:scale-115 cursor-pointer shrink-0 ${
                        checkedToday ? "text-emerald-500" : "text-zinc-400"
                      }`}
                    >
                      {checkedToday ? (
                        <CheckCircle size={21} fill="currentColor" className="text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Circle size={21} className="hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0 text-left">
                      <p className={`text-xs font-sans font-semibold tracking-wide truncate ${
                        checkedToday
                          ? "line-through text-emerald-800/80 dark:text-emerald-400/80"
                          : isDark ? "text-zinc-100" : "text-zinc-850"
                      }`}>
                        {habit.name}
                      </p>
                      <span className={`text-[9px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {habit.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Streaks Count Flame */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                      curStreak > 0
                        ? isDark ? "bg-orange-950/30 text-orange-400" : "bg-orange-50 text-orange-600"
                        : "text-zinc-450 dark:text-zinc-550"
                    }`}>
                      <Flame size={12} className={curStreak > 0 ? "text-orange-500 animate-pulse" : "text-zinc-400"} />
                      <span>{curStreak}d streak</span>
                    </div>

                    <button
                      onClick={() => {
                        playSoundWave('click');
                        onDeleteHabit(habit.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Archive goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
