/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, Plus, Trash2, Check, Clock, Calendar, Dumbbell, 
  History, TrendingUp, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Workout, WorkoutExercise, ExerciseSet, SkippedWorkoutReason } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';

interface WorkoutLoggerProps {
  initialWorkout?: Workout | null;
  onClose: () => void;
}

const COMMON_EXERCISES = [
  'Push-ups', 'Pull-ups', 'DB Bench Press', 'DB Overhead Press', 
  'Dumbbell Bicep Curls', 'Tricep Dips', 'Squats', 'Lunges', 
  'Romanian Deadlift', 'Plank', 'Lat Pulldown', 'Incline DB Press'
];

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  initialWorkout,
  onClose
}) => {
  const { data, addWorkout, updateWorkout } = useApp();
  const theme = data.settings.theme;
  const accentColor = data.settings.accentColor;
  const todayStr = getLocalDateString();

  const [date, setDate] = useState<string>(initialWorkout?.date || todayStr);
  const [name, setName] = useState<string>(initialWorkout?.name || 'Upper Body Workout');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialWorkout?.durationMinutes || 45);
  const [status, setStatus] = useState<'Completed' | 'Skipped'>(initialWorkout?.status || 'Completed');
  const [skipReason, setSkipReason] = useState<SkippedWorkoutReason>(initialWorkout?.skipReason || 'Busy');
  const [notes, setNotes] = useState<string>(initialWorkout?.notes || '');

  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    if (initialWorkout && initialWorkout.exercises.length > 0) {
      return initialWorkout.exercises;
    }
    // Default 1 exercise
    return [
      {
        id: `we_${Date.now()}_1`,
        exerciseName: 'Push-ups',
        sets: [
          { setNumber: 1, reps: 10, weight: 0, isCompleted: true },
          { setNumber: 2, reps: 10, weight: 0, isCompleted: true },
          { setNumber: 3, reps: 8, weight: 0, isCompleted: true }
        ],
        notes: ''
      }
    ];
  });

  // Lookup function for previous performance for any exercise
  const getExerciseHistory = (exName: string) => {
    if (!exName.trim() || !data.fitness?.workouts) return null;
    const cleanName = exName.trim().toLowerCase();

    // Find workouts containing this exercise
    const relevantWorkouts = data.fitness.workouts
      .filter(w => w.status === 'Completed')
      .sort((a, b) => b.date.localeCompare(a.date));

    let previousSession = null;
    let bestWeight = 0;
    let maxReps = 0;

    for (const w of relevantWorkouts) {
      const foundEx = w.exercises.find(e => e.exerciseName.trim().toLowerCase() === cleanName);
      if (foundEx && foundEx.sets.length > 0) {
        if (!previousSession) {
          previousSession = {
            date: w.date,
            sets: foundEx.sets
          };
        }
        foundEx.sets.forEach(s => {
          if (s.weight > bestWeight) bestWeight = s.weight;
          if (s.reps > maxReps) maxReps = s.reps;
        });
      }
    }

    return { previousSession, bestWeight, maxReps };
  };

  const handleAddExercise = (exerciseName: string = 'DB Bench Press') => {
    // Check if there's previous set data to autofill
    const history = getExerciseHistory(exerciseName);
    let defaultSets: ExerciseSet[] = [
      { setNumber: 1, reps: 10, weight: 5, isCompleted: true },
      { setNumber: 2, reps: 10, weight: 5, isCompleted: true },
      { setNumber: 3, reps: 8, weight: 7.5, isCompleted: true }
    ];

    if (history?.previousSession) {
      defaultSets = history.previousSession.sets.map((s, idx) => ({
        setNumber: idx + 1,
        reps: s.reps,
        weight: s.weight,
        isCompleted: true
      }));
    }

    setExercises(prev => [
      ...prev,
      {
        id: `we_${Date.now()}_${prev.length + 1}`,
        exerciseName,
        sets: defaultSets,
        notes: ''
      }
    ]);
  };

  const handleRemoveExercise = (exId: string) => {
    if (exercises.length <= 1) return;
    setExercises(prev => prev.filter(e => e.id !== exId));
  };

  const handleUpdateExerciseName = (exId: string, newName: string) => {
    setExercises(prev => prev.map(e => e.id === exId ? { ...e, exerciseName: newName } : e));
  };

  const handleAddSet = (exId: string) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const lastSet = e.sets[e.sets.length - 1];
      const newSet: ExerciseSet = {
        setNumber: e.sets.length + 1,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 0,
        isCompleted: true
      };
      return { ...e, sets: [...e.sets, newSet] };
    }));
  };

  const handleRemoveSet = (exId: string, setNum: number) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId || e.sets.length <= 1) return e;
      const filtered = e.sets.filter(s => s.setNumber !== setNum)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...e, sets: filtered };
    }));
  };

  const handleUpdateSet = (exId: string, setNum: number, field: keyof ExerciseSet, value: any) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const updatedSets = e.sets.map(s => s.setNumber === setNum ? { ...s, [field]: value } : s);
      return { ...e, sets: updatedSets };
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const workoutPayload = {
      date,
      name,
      durationMinutes: Number(durationMinutes) || 30,
      status,
      skipReason: status === 'Skipped' ? skipReason : undefined,
      notes,
      exercises
    };

    if (initialWorkout) {
      updateWorkout({ ...workoutPayload, id: initialWorkout.id });
    } else {
      addWorkout(workoutPayload);
    }

    onClose();
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';
  const modalBg = isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const inputBg = isDark ? 'bg-slate-950/50 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-2xl border ${modalBg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {initialWorkout ? 'Edit Workout Session' : 'Log Workout Session'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Record exercises, reps, weight, and track progressive overload.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Toggle & Top Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                Workout Name
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Upper Body, Leg Day"
                className={`w-full px-3 py-2 rounded-xl ${inputBg} text-xs font-semibold focus:outline-none focus:border-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                Date
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className={`w-full px-3 py-2 rounded-xl ${inputBg} text-xs font-semibold focus:outline-none focus:border-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                Duration (minutes)
              </label>
              <input 
                type="number" 
                value={durationMinutes} 
                onChange={e => setDurationMinutes(Number(e.target.value))} 
                min={5}
                max={240}
                className={`w-full px-3 py-2 rounded-xl ${inputBg} text-xs font-semibold focus:outline-none focus:border-blue-500`}
              />
            </div>
          </div>

          {/* Completion Status vs Skipped */}
          <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Workout Status:</span>
            <button
              type="button"
              onClick={() => setStatus('Completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                status === 'Completed' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Completed
            </button>

            <button
              type="button"
              onClick={() => setStatus('Skipped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                status === 'Skipped' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <X className="w-3.5 h-3.5" /> Skipped
            </button>

            {status === 'Skipped' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Reason:</span>
                <select
                  value={skipReason}
                  onChange={e => setSkipReason(e.target.value as SkippedWorkoutReason)}
                  className={`px-2.5 py-1 rounded-lg ${inputBg} text-xs font-bold text-red-500 dark:text-red-400 focus:outline-none`}
                >
                  <option value="Busy">Busy</option>
                  <option value="Tired">Tired</option>
                  <option value="Pain">Pain / Soreness</option>
                  <option value="Schedule conflict">Schedule Conflict</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Add Common Exercises presets */}
          <div className="space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Quick Add Exercise Preset:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EXERCISES.map(exName => (
                <button
                  key={exName}
                  type="button"
                  onClick={() => handleAddExercise(exName)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-blue-600/30 hover:text-blue-300 text-slate-300 border-slate-700/80' 
                      : 'bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 border-slate-200'
                  }`}
                >
                  + {exName}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-blue-500 dark:text-blue-400 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Exercise Performance
              </h4>
              <button
                type="button"
                onClick={() => handleAddExercise('New Exercise')}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Exercise
              </button>
            </div>

            {exercises.map((ex, exIdx) => {
              const history = getExerciseHistory(ex.exerciseName);

              return (
                <div 
                  key={ex.id} 
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Exercise Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">#{exIdx + 1}</span>
                      <input 
                        type="text" 
                        value={ex.exerciseName} 
                        onChange={e => handleUpdateExerciseName(ex.id, e.target.value)} 
                        placeholder="Exercise name (e.g. DB Bench Press)"
                        className={`flex-1 px-3 py-1.5 rounded-xl ${inputBg} text-xs font-bold focus:outline-none focus:border-blue-500`}
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleAddSet(ex.id)}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                      >
                        + Add Set
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(ex.id)}
                        disabled={exercises.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30 transition cursor-pointer"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PREVIOUS PERFORMANCE HISTORICAL OVERLOAD BANNER */}
                  {history?.previousSession ? (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                        <History className="w-3.5 h-3.5" />
                        <span>Previous Session ({history.previousSession.date}):</span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-2 font-mono text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {history.previousSession.sets.map((s, idx) => (
                          <span key={idx} className={`px-2 py-0.5 rounded border ${isDark ? 'bg-blue-950/60 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                            Set {s.setNumber}: {s.weight > 0 ? `${s.weight}kg × ` : ''}{s.reps} reps
                          </span>
                        ))}
                      </div>
                      {history.bestWeight > 0 && (
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'} font-sans`}>
                          🏆 Best Weight: <span className="font-bold text-yellow-600 dark:text-yellow-400">{history.bestWeight} kg</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic flex items-center gap-1 pl-1">
                      <Sparkles className="w-3 h-3 text-slate-400" />
                      No prior session history for this exercise name. Log today's performance to establish your benchmark!
                    </div>
                  )}

                  {/* Sets Table */}
                  <div className="space-y-1.5">
                    <div className={`grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} px-2`}>
                      <span className="col-span-2">Set</span>
                      <span className="col-span-4">Weight (kg)</span>
                      <span className="col-span-4">Reps</span>
                      <span className="col-span-2 text-center">Actions</span>
                    </div>

                    {ex.sets.map((set) => (
                      <div key={set.setNumber} className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <span className={`col-span-2 font-mono font-bold text-xs pl-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Set {set.setNumber}
                        </span>

                        <input 
                          type="number" 
                          value={set.weight} 
                          onChange={e => handleUpdateSet(ex.id, set.setNumber, 'weight', Number(e.target.value))} 
                          placeholder="0"
                          min={0}
                          step={0.5}
                          className={`col-span-4 px-2 py-1 rounded-lg ${inputBg} text-xs font-mono font-bold focus:outline-none focus:border-blue-500`}
                        />

                        <input 
                          type="number" 
                          value={set.reps} 
                          onChange={e => handleUpdateSet(ex.id, set.setNumber, 'reps', Number(e.target.value))} 
                          placeholder="10"
                          min={1}
                          className={`col-span-4 px-2 py-1 rounded-lg ${inputBg} text-xs font-mono font-bold focus:outline-none focus:border-blue-500`}
                        />

                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(ex.id, set.setNumber)}
                            disabled={ex.sets.length <= 1}
                            className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
              Workout Notes / Feeling
            </label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Felt great, increased weight on bench press..."
              rows={2}
              className={`w-full px-3 py-2 rounded-xl ${inputBg} text-xs focus:outline-none focus:border-blue-500`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-end gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold text-xs ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'} transition cursor-pointer`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Save Workout
          </button>
        </div>
      </div>
    </div>
  );
};
