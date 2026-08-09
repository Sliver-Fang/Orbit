/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, CheckCircle2, Flame, Award, Plus, Trash2, 
  Sparkles, Check, Lock, Zap, Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const FitnessHabitsMilestones: React.FC = () => {
  const { data, toggleFitnessHabitDate, addFitnessHabit, deleteFitnessHabit } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness;
  const habits = fitness?.habits || [];
  const milestones = fitness?.milestones || [];
  const todayStr = getLocalDateString();

  const [newHabitName, setNewHabitName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addFitnessHabit(newHabitName.trim());
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const cardBgClass = theme === 'light' 
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm' 
    : 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl';

  return (
    <div className="space-y-6">
      {/* SECTION 1: FITNESS HABITS */}
      <div className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-blue-400">
              <Activity className="w-5 h-5" /> Daily Fitness Habits Tracker
            </h3>
            <p className="text-xs text-slate-400">Build daily consistency with non-negotiable nutrition, water, and movement habits.</p>
          </div>

          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Habit
          </button>
        </div>

        {showAddHabit && (
          <form onSubmit={handleAddHabit} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <input 
              type="text" 
              value={newHabitName} 
              onChange={e => setNewHabitName(e.target.value)} 
              placeholder="e.g. 10k Daily Steps, Take Creatine"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-500 transition cursor-pointer"
            >
              Add
            </button>
          </form>
        )}

        <div className="space-y-2.5">
          {habits.map((h) => {
            const isCompletedToday = h.successDates.includes(todayStr);

            return (
              <div 
                key={h.id} 
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFitnessHabitDate(h.id, todayStr)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      isCompletedToday 
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30' 
                        : 'border-slate-700 bg-slate-900 text-transparent hover:border-emerald-500/50'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <h4 className={`text-xs font-bold ${isCompletedToday ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {h.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      Total completions: {h.successDates.length} days
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteFitnessHabit(h.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                  title="Delete Habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FITNESS MILESTONES */}
      <div className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
        <div>
          <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-yellow-500">
            <Trophy className="w-5 h-5" /> Fitness Milestones & PR Badges
          </h3>
          <p className="text-xs text-slate-400">Milestones automatically detect when you reach target weight, workout streak, or push-up reps!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const isUnlocked = Boolean(m.unlockedAt);
            const pct = Math.min(100, Math.round((m.currentValue / m.targetValue) * 100));

            return (
              <div 
                key={m.id} 
                className={`p-4 rounded-xl border space-y-2 relative overflow-hidden ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-500/10 via-slate-900 to-slate-900 border-yellow-500/30' 
                    : 'bg-slate-950/40 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                      {isUnlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
                      <span className="text-[10px] text-slate-400">{m.category.toUpperCase()}</span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      Unlocked!
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">{m.currentValue}/{m.targetValue}</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">{m.description}</p>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isUnlocked ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
