/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Dumbbell, Calendar, Clock, Filter, Trash2, Edit3, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle, Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Workout } from '../../types';

interface WorkoutHistoryProps {
  onEditWorkout: (workout: Workout) => void;
  onOpenNewWorkout: () => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  onEditWorkout,
  onOpenNewWorkout
}) => {
  const { data, deleteWorkout } = useApp();
  const theme = data.settings.theme;
  const workouts = data.fitness?.workouts || [];

  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Skipped'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const filteredWorkouts = workouts.filter(w => {
    if (filterStatus !== 'All' && w.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = w.name.toLowerCase().includes(q);
      const matchesEx = w.exercises.some(e => e.exerciseName.toLowerCase().includes(q));
      if (!matchesName && !matchesEx) return false;
    }
    return true;
  });

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';
  const cardBgClass = isDark 
    ? 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';
  const inputBg = isDark ? 'bg-slate-950/50 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBgClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-500 dark:text-orange-400" /> Workout History
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>View past sessions, total volume, and reasons for skipped workouts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercise or name..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl ${inputBg} text-xs focus:outline-none focus:border-blue-500`}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            {(['All', 'Completed', 'Skipped'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === s 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewWorkout}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/30 cursor-pointer"
          >
            + Log Workout
          </button>
        </div>
      </div>

      {/* Workout History List */}
      {filteredWorkouts.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${cardBgClass} space-y-3`}>
          <Dumbbell className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
          <h4 className="font-extrabold text-sm text-slate-300">No workout records found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'All' 
              ? 'Try clearing search filters.' 
              : 'Start by logging your first workout session to track strength progress over time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((w) => {
            const isExpanded = expandedWorkoutId === w.id;
            
            // Calculate total volume
            let totalVolume = 0;
            w.exercises.forEach(e => {
              e.sets.forEach(s => {
                if (s.isCompleted) {
                  totalVolume += (s.weight * s.reps);
                }
              });
            });

            return (
              <div 
                key={w.id} 
                className={`rounded-2xl border transition ${cardBgClass} overflow-hidden`}
              >
                {/* Summary Row */}
                <div 
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${
                      w.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {w.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm truncate">{w.name}</h4>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          w.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> {w.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {w.durationMinutes} mins</span>
                        <span>🏋️ {w.exercises.length} exercises</span>
                        {totalVolume > 0 && <span className="text-orange-400 font-bold">⚡ {totalVolume} kg vol</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {w.status === 'Skipped' && w.skipReason && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                        Reason: {w.skipReason}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWorkout(w);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Edit Workout"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this workout log?')) {
                          deleteWorkout(w.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      title="Delete Workout"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Exercise Sets Breakdown</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {w.exercises.map((ex) => (
                        <div key={ex.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                          <h6 className="font-bold text-blue-400">{ex.exerciseName}</h6>
                          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                            {ex.sets.map((s) => (
                              <span 
                                key={s.setNumber}
                                className={`px-2 py-0.5 rounded border ${
                                  s.isCompleted ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-red-950/30 border-red-800 text-red-400 line-through'
                                }`}
                              >
                                Set {s.setNumber}: {s.weight > 0 ? `${s.weight}kg × ` : ''}{s.reps}
                              </span>
                            ))}
                          </div>
                          {ex.notes && <p className="text-[10px] text-slate-400 italic">"{ex.notes}"</p>}
                        </div>
                      ))}
                    </div>

                    {w.notes && (
                      <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 text-xs">
                        <span className="font-bold text-slate-400 block mb-0.5">Notes:</span>
                        <p className="text-slate-300 italic">{w.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
