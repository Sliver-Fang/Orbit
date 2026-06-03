import React, { useState, useEffect } from "react";
import { Palette, Habit, DailyTask, AvoidItem, SleepWakeLog, Quote } from "./types";
import { COLOR_PALETTES, getLocalDateString, playSoundWave } from "./utils/data";

// Sub components
import ProgressChart from "./components/ProgressChart";
import QuotesWidget from "./components/QuotesWidget";
import FocusTimer from "./components/FocusTimer";
import SleepTimer from "./components/SleepTimer";
import AvoidList from "./components/AvoidList";
import HabitSection from "./components/HabitSection";
import TaskSection from "./components/TaskSection";
import OrbitSyncManager from "./components/OrbitSyncManager";

// Icons
import { Compass, Palette as PaletteIcon, Sun, Moon, Sparkles, RefreshCw, Calendar, Flame, AlertCircle } from "lucide-react";

export default function App() {
  // --- Persistent States ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const raw = localStorage.getItem("habit_tracker_habits");
    return raw ? JSON.parse(raw) : []; // initially empty as requested
  });

  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    const raw = localStorage.getItem("habit_tracker_tasks");
    return raw ? JSON.parse(raw) : []; // initially empty as requested
  });

  const [avoidItems, setAvoidItems] = useState<AvoidItem[]>(() => {
    const raw = localStorage.getItem("habit_tracker_avoid");
    return raw ? JSON.parse(raw) : []; // initially empty as requested
  });

  const [sleepLogs, setSleepLogs] = useState<SleepWakeLog[]>(() => {
    const raw = localStorage.getItem("habit_tracker_sleep_logs");
    return raw ? JSON.parse(raw) : []; // initially empty as requested
  });

  const [customQuotes, setCustomQuotes] = useState<Quote[]>(() => {
    const raw = localStorage.getItem("habit_tracker_custom_quotes");
    return raw ? JSON.parse(raw) : [];
  });

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    return localStorage.getItem("habit_tracker_palette") || "mint-breeze";
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("habit_tracker_dark") === "true";
  });

  // Today Date key
  const todayStr = getLocalDateString();

  // --- Effects for LocalStorage ---
  useEffect(() => {
    localStorage.setItem("habit_tracker_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_avoid", JSON.stringify(avoidItems));
  }, [avoidItems]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_sleep_logs", JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_custom_quotes", JSON.stringify(customQuotes));
  }, [customQuotes]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_palette", selectedPaletteId);
  }, [selectedPaletteId]);

  useEffect(() => {
    localStorage.setItem("habit_tracker_dark", String(isDark));
  }, [isDark]);

  // Synchronise dark mode class on document element so Tailwind utility classes resolve correctly
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Find active palette
  const activePalette = COLOR_PALETTES.find(p => p.id === selectedPaletteId) || COLOR_PALETTES[0];

  // --- Habit Handlers ---
  const handleAddHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      category,
      frequency: "daily",
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString()
    };
    setHabits([newHabit, ...habits]);
  };

  const handleToggleHabit = (id: string, date: string) => {
    playSoundWave("click");
    setHabits(habits.map(h => {
      if (h.id === id) {
        const alreadyDone = h.completedDates.includes(date);
        const newDates = alreadyDone
          ? h.completedDates.filter(d => d !== date)
          : [...h.completedDates, date];
        return {
          ...h,
          completedDates: newDates
        };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // --- Task Handlers ---
  const handleAddTask = (name: string) => {
    const newTask: DailyTask = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      isCompleted: false,
      assignedDate: todayStr,
      completedAt: undefined
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isCompleted: !t.isCompleted,
          completedAt: !t.isCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- Avoid List Handlers ---
  const handleAddAvoidItem = (name: string, reason?: string) => {
    const newItem: AvoidItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      reason,
      timesViolatedToday: 0,
      avoidedToday: false
    };
    setAvoidItems([newItem, ...avoidItems]);
  };

  const handleUpdateAvoidItem = (id: string, avoidedToday: boolean, timesViolatedToday: number) => {
    setAvoidItems(avoidItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          avoidedToday,
          timesViolatedToday
        };
      }
      return item;
    }));
  };

  const handleDeleteAvoidItem = (id: string) => {
    setAvoidItems(avoidItems.filter(item => item.id !== id));
  };

  // --- Quotes Handlers ---
  const handleAddCustomQuote = (text: string, author: string, category: string) => {
    const newQuote: Quote = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      author,
      category,
      isCustom: true
    };
    setCustomQuotes([newQuote, ...customQuotes]);
  };

  const handleDeleteCustomQuote = (id: string) => {
    setCustomQuotes(customQuotes.filter(q => q.id !== id));
  };

  // Switch dark mode style
  const handleToggleDarkMode = () => {
    playSoundWave("click");
    setIsDark(!isDark);
  };

  // Clear All Data Action
  const handleResetWorkspace = () => {
    if (window.confirm("Are you sure you want to reset all tracked habits, tasks, and timers?")) {
      playSoundWave("alarm");
      setHabits([]);
      setTasks([]);
      setAvoidItems([]);
      setSleepLogs([]);
      setCustomQuotes([]);
      setSelectedPaletteId("mint-breeze");
      setIsDark(false);
    }
  };

  // Calculate day completion summary
  const finishedHabitsCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const finishedTasksCount = tasks.filter(t => t.assignedDate === todayStr && t.isCompleted).length;
  const totalCompletedActions = finishedHabitsCount + finishedTasksCount;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      isDark ? "bg-zinc-950 text-zinc-100" : `${activePalette.bgLight} text-zinc-900`
    }`}>
      
      {/* Upper Navigation Header bar */}
      <header className={`border-b transition-all duration-300 ${
        isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white/80 border-zinc-100"
      } backdrop-blur-md sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl text-white shadow-sm font-sans flex items-center justify-center animate-pulse"
                 style={{ backgroundColor: activePalette.accent }}>
              <Compass size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={`text-sm font-extrabold tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                Orbit Habit <span className="font-medium text-xs opacity-80">&amp; Day Timer</span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-sans font-medium">
                Sleek, minimalist routine planner
              </p>
            </div>
          </div>

          {/* Color Palettes Switcher & Dark mode controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            
            {/* Color Swatch Panel */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isDark ? "bg-zinc-805/40 border-zinc-800" : "bg-zinc-50 border-zinc-200/85"
            }`}>
              <PaletteIcon size={12} className="text-zinc-400 shrink-0" />
              <div className="flex items-center gap-1">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => {
                      playSoundWave("click");
                      setSelectedPaletteId(palette.id);
                    }}
                    className={`w-4.5 h-4.5 rounded-full border-2 transition-all hover:scale-120 cursor-pointer ${
                      selectedPaletteId === palette.id
                        ? isDark ? "border-white scale-110" : "border-zinc-900 scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: palette.accent }}
                    title={palette.name}
                  />
                ))}
              </div>
            </div>

            {/* Dark mode button */}
            <button
              onClick={handleToggleDarkMode}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDark
                  ? "border-zinc-800 bg-zinc-850 text-yellow-400 hover:bg-zinc-850"
                  : "border-zinc-200 bg-zinc-50 text-zinc-650 hover:bg-zinc-200/50"
              }`}
              title="Toggle Dark Slate Mode"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Reset option button */}
            <button
              onClick={handleResetWorkspace}
              className={`p-2 rounded-xl text-xs font-sans font-semibold border transition-all duration-200 text-rose-500 hover:bg-rose-500/10 cursor-pointer ${
                isDark ? "border-zinc-800" : "border-zinc-200 bg-zinc-50"
              }`}
              title="Reset all fields"
            >
              Reset
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Personalized Welcoming Jumbotron Section */}
        <section id="welcome-jumbotron" className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
          isDark
            ? "bg-zinc-900/40 border-zinc-850"
            : "bg-white/80 border-emerald-100/50 shadow-sm"
        }`}>
          {/* Subtle Decorative Ambient Background glow */}
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full opacity-10 filter blur-3xl pointer-events-none"
               style={{ backgroundColor: activePalette.accent }} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={14} style={{ color: activePalette.accent }} className="animate-spin duration-[4s]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-455">
                  Live Dashboard
                </span>
              </div>
              <h2 className={`font-sans font-extrabold text-2xl sm:text-3xl tracking-tight leading-none mb-2 ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                Welcome to Your Day, Companion
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-xl">
                A streamlined space to balance habits, monitor energy phases, check off action items, and strengthen focus durations.
              </p>
            </div>

            {/* Quick Status Stats Card */}
            <div className="flex items-center gap-3.5 self-start md:self-auto">
              <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                isDark ? "bg-zinc-850 border-zinc-800" : "bg-zinc-50 border-zinc-150"
              }`}>
                <div className="p-2.5 rounded-xl text-white font-mono flex items-center justify-center font-bold text-center text-sm"
                     style={{ backgroundColor: activePalette.accent }}>
                  {totalCompletedActions}
                </div>
                <div>
                  <div className={`text-xs font-sans font-bold ${isDark ? "text-zinc-200" : "text-zinc-750"}`}>
                    Total Actions Handled Today
                  </div>
                  <div className="text-[10px] text-zinc-450 font-sans flex items-center gap-2">
                    <span>{finishedHabitsCount} habits checked</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
                    <span>{finishedTasksCount} tasks checked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Device Active Synchronisation Hub */}
        <OrbitSyncManager
          palette={activePalette}
          isDark={isDark}
          habits={habits}
          setHabits={setHabits}
          tasks={tasks}
          setTasks={setTasks}
          avoidItems={avoidItems}
          setAvoidItems={setAvoidItems}
          sleepLogs={sleepLogs}
          setSleepLogs={setSleepLogs}
          customQuotes={customQuotes}
          setCustomQuotes={setCustomQuotes}
          selectedPaletteId={selectedPaletteId}
          setSelectedPaletteId={setSelectedPaletteId}
          setIsDark={setIsDark}
        />

        {/* Bento Grid Layer 1: Sleep Cycles, Focus Stopwatch, and Motivational Quote widgets */}
        <section id="bento-timers-and-quotes" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Box 1: Wake Up & Sleep Timer Section */}
          <div className="md:col-span-1">
            <SleepTimer
              logs={sleepLogs}
              onSaveLogs={setSleepLogs}
              palette={activePalette}
              isDark={isDark}
            />
          </div>

          {/* Box 2: Pomodoro Focus Stopwatch Module */}
          <div className="md:col-span-1">
            <FocusTimer
              palette={activePalette}
              isDark={isDark}
            />
          </div>

          {/* Box 3: Inspirational Quotes & Creator Card */}
          <div className="md:col-span-1">
            <QuotesWidget
              customQuotes={customQuotes}
              onAddCustomQuote={handleAddCustomQuote}
              onDeleteCustomQuote={handleDeleteCustomQuote}
              palette={activePalette}
              isDark={isDark}
            />
          </div>

        </section>

        {/* Bento Grid Layer 2: Weekly progress SVG dynamic chart */}
        <section id="performance-chart-row" className="w-full">
          <ProgressChart
            habits={habits}
            tasks={tasks}
            palette={activePalette}
            isDark={isDark}
          />
        </section>

        {/* Bento Grid Layer 3: Habit Assigner and Tasks Board Columns */}
        <section id="goals-habits-and-agenda-logs" className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          
          {/* Column A & B (xl:col-span-2): Today's checklist columns */}
          <div className="xl:col-span-2 space-y-5">
            {/* Habits/Goals Assigner & Tracker */}
            <HabitSection
              habits={habits}
              onAddHabit={handleAddHabit}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
              palette={activePalette}
              isDark={isDark}
            />

            {/* Split layout: To-Do Column & Completed Column */}
            <TaskSection
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              palette={activePalette}
              isDark={isDark}
            />
          </div>

          {/* Column C (xl:col-span-1): Things to avoid "not-to-do-list" module */}
          <div className="xl:col-span-1">
            <AvoidList
              items={avoidItems}
              onAddAvoidItem={handleAddAvoidItem}
              onUpdateAvoidItem={handleUpdateAvoidItem}
              onDeleteAvoidItem={handleDeleteAvoidItem}
              palette={activePalette}
              isDark={isDark}
            />
          </div>

        </section>

      </main>

      {/* Footer credits bar */}
      <footer className={`mt-12 py-6 border-t font-sans text-center text-xs transition-colors duration-300 ${
        isDark ? "bg-zinc-950 border-zinc-900 text-zinc-500" : "bg-white/40 border-zinc-100 text-zinc-400"
      }`}>
        <p>A simple daily helper to guide deliberate choices — initially empty for custom configurations.</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-wider">No persistent background timers or third-party cookies</p>
      </footer>

    </div>
  );
}
