/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Edit2, AlertCircle, Check, X, Calendar, 
  TrendingUp, Activity, Sparkles, Dumbbell, Zap 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';
import { getLocalDateString, getPastLocalDateString, parseLocalDate } from '../utils/dateUtils';

export const HabitTrackerView: React.FC = () => {
  const { data, addHabit, deleteHabit, toggleHabitDate } = useApp();
  const { theme, accentColor } = data.settings;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'Good' | 'Bad'>('Good');

  // Generate date strings for the last 7 days (Mon-Sun style)
  const weekdays = Array.from({ length: 7 }).map((_, i) => {
    const dateStr = getPastLocalDateString(i);
    const d = parseLocalDate(dateStr);
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = d.getDate();
    return { dateStr, shortDay, dayOfMonth };
  }).reverse(); // Order from oldest (6 days ago) to newest (today)

  const todayStr = getLocalDateString();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName, newHabitType);
    setNewHabitName('');
    setShowAddForm(false);
  };

  // Streaks & Stats Calculations for single habit
  const calculateHabitStats = (habit: Habit) => {
    const totalLogged = habit.successDates.length + habit.failureDates.length;
    const successPct = totalLogged > 0 ? Math.round((habit.successDates.length / totalLogged) * 100) : 0;

    // Current Streak calculation based on success dates
    const successSet = new Set(habit.successDates);
    let currentStreak = 0;
    
    // Start counting back from today
    let daysAgo = 0;
    while (daysAgo < 365) {
      const dateStr = getPastLocalDateString(daysAgo);
      if (successSet.has(dateStr)) {
        currentStreak++;
        daysAgo++;
      } else {
        // If it's today and empty, check if yesterday was successful
        if (dateStr === todayStr && currentStreak === 0) {
          const yesterdayStr = getPastLocalDateString(1);
          if (successSet.has(yesterdayStr)) {
            daysAgo = 1;
            continue;
          }
        }
        break;
      }
    }

    return {
      totalLogged,
      successPct,
      currentStreak
    };
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">Tactile Habit Grids</h3>
          <p className="text-xs text-slate-400 mt-1">Tap a cell to log habit statuses for previous days. Green is Success, Red is Failure.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl active:scale-95 transition cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* QUICK HABIT FORM */}
      {showAddForm && (
        <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/10 space-y-4" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add New Habit Tracker</h4>
          <form onSubmit={handleCreateHabit} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Habit Name *</label>
              <input 
                type="text" required placeholder="e.g. Solve 5 algorithms, No YouTube"
                value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Type</label>
              <select 
                value={newHabitType} onChange={(e) => setNewHabitType(e.target.value as any)}
                className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              >
                <option value="Good">🟢 Positive Habit (Study, Recall, Water)</option>
                <option value="Bad">🔴 Distracting Habit (Late sleeping, YouTube)</option>
              </select>
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto">
              <button 
                type="button" onClick={() => setShowAddForm(false)}
                className="flex-1 sm:flex-initial px-3 py-2 border border-slate-800 hover:text-white rounded-lg text-xs"
                style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              >
                Cancel
              </button>
              <button 
                type="submit" className="flex-1 sm:flex-initial px-4 py-2 text-white font-bold rounded-lg text-xs"
                style={{ backgroundColor: accentColor }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPACT INTUITIVE HABIT ROW LAYOUT */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.habits.length === 0 ? (
            <motion.div 
              key="empty-habits"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-12 rounded-3xl text-center border flex flex-col items-center justify-center space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(148,163,184,0.04)]' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Dumbbell className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-400">No habit trackers configured yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Log good habits to form deep focus routines, or bad triggers to avoid distracting screens.
                </p>
              </div>
            </motion.div>
          ) : (
          data.habits.map(habit => {
            const { successPct, currentStreak } = calculateHabitStats(habit);
            const isGood = habit.type === 'Good';

            return (
              <motion.div 
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(148, 163, 184, 0.05)' }}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                }`}
              >
                {/* Left hand details */}
                <div className="md:w-56 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h4 className="font-bold text-sm truncate max-w-[180px]">{habit.name}</h4>
                  </div>
                  
                  {/* Streak Metrics */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                    <span className="flex items-center gap-0.5">
                      <Zap className="w-3 h-3 text-yellow-400 fill-yellow-500" />
                      <span>Streak: <b>{currentStreak}</b>d</span>
                    </span>
                    <span>Score: <b>{successPct}%</b></span>
                    <span className="uppercase font-extrabold" style={{ color: isGood ? '#10b981' : '#f43f5e' }}>{habit.type}</span>
                  </div>
                </div>

                {/* Center 7-day tactile tracking grids */}
                <div className="flex-1 flex justify-between gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                  {weekdays.map(day => {
                    const isSuccess = habit.successDates.includes(day.dateStr);
                    const isFailure = habit.failureDates.includes(day.dateStr);
                    const isSkip = habit.skipDates.includes(day.dateStr);
                    
                    let cellBg = 'bg-slate-900/40 border-slate-800 text-slate-500';
                    if (theme === 'light') cellBg = 'bg-slate-50 border-slate-200 text-slate-400';

                    if (isSuccess) cellBg = 'bg-green-500/20 text-green-400 border-green-500/30';
                    if (isFailure) cellBg = 'bg-red-500/20 text-red-400 border-red-500/30';
                    if (isSkip) cellBg = 'bg-slate-800/80 text-slate-400 border-slate-700';

                    // Cycle cell state on click: Empty -> Success -> Failure -> Empty
                    const handleGridClick = () => {
                      let nextStatus: 'success' | 'failure' | 'skip' = 'success';
                      if (isSuccess) nextStatus = 'failure';
                      else if (isFailure) nextStatus = 'skip';
                      else if (isSkip) nextStatus = 'success'; // toggle back
                      
                      toggleHabitDate(habit.id, day.dateStr, nextStatus);
                    };

                    const isToday = day.dateStr === todayStr;

                    return (
                      <button
                        key={day.dateStr}
                        onClick={handleGridClick}
                        className={`flex-1 flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition cursor-pointer select-none active:scale-95 ${cellBg} ${
                          isToday ? 'ring-1 ring-blue-500' : ''
                        }`}
                      >
                        <span className="text-[8px] font-mono block uppercase tracking-wider">{day.shortDay}</span>
                        <span className="text-xs font-black font-mono block mt-0.5">{day.dayOfMonth}</span>
                        
                        {/* Tactile Inner Icon indicators */}
                        <div className="h-3.5 mt-1 flex items-center justify-center">
                          {isSuccess && <Check className="w-3 h-3 stroke-[3]" />}
                          {isFailure && <X className="w-3 h-3 stroke-[3]" />}
                          {isSkip && <span className="text-[8px] font-mono leading-none">-</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right hand delete button */}
                <div className="flex md:items-center justify-end flex-shrink-0">
                  <button
                    onClick={() => {
                      if (confirm(`Delete habit tracker for "${habit.name}"?`)) {
                        deleteHabit(habit.id);
                      }
                    }}
                    className="p-1.5 bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition"
                    style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
