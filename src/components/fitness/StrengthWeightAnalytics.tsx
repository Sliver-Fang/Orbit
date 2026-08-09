/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, BarChart2, Scale, Dumbbell, Calendar, 
  Award, Zap, ChevronRight, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FITNESS_STATE } from '../../utils/defaultData';
import { getLocalDateString } from '../../utils/dateUtils';

export const StrengthWeightAnalytics: React.FC = () => {
  const { data } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness || DEFAULT_FITNESS_STATE;
  const { profile, workouts, bodyMeasurements } = fitness;
  const todayStr = getLocalDateString();

  const [selectedExercise, setSelectedExercise] = useState<string>('DB Bench Press');

  // Collect unique exercise names from all workouts
  const uniqueExerciseNames = Array.from(new Set(
    workouts.flatMap(w => w.exercises.map(e => e.exerciseName))
  )).sort();

  // Selected exercise history
  const exerciseHistory = workouts
    .filter(w => w.status === 'Completed')
    .map(w => {
      const ex = w.exercises.find(e => e.exerciseName.toLowerCase() === selectedExercise.toLowerCase());
      if (!ex) return null;
      let maxWeight = 0;
      let totalReps = 0;
      ex.sets.forEach(s => {
        if (s.weight > maxWeight) maxWeight = s.weight;
        totalReps += s.reps;
      });
      return {
        date: w.date,
        maxWeight,
        totalReps,
        setsCount: ex.sets.length
      };
    })
    .filter(Boolean) as { date: string; maxWeight: number; totalReps: number; setsCount: number }[];

  exerciseHistory.sort((a, b) => a.date.localeCompare(b.date));

  // Weight Analytics Calculations
  const startingWeight = profile.startingWeight;
  const targetWeight = profile.targetWeight;
  const sortedMeasurements = [...bodyMeasurements].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sortedMeasurements.length > 0 ? (sortedMeasurements[sortedMeasurements.length - 1].weight || startingWeight) : startingWeight;
  const totalChange = Number((currentWeight - startingWeight).toFixed(1));

  // Calculating rate of change (per week)
  let weeklyRate = 0;
  if (sortedMeasurements.length >= 2) {
    const first = sortedMeasurements[0];
    const last = sortedMeasurements[sortedMeasurements.length - 1];
    const daysDiff = Math.max(1, Math.ceil(Math.abs(new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = daysDiff / 7;
    const weightDiff = (last.weight || currentWeight) - (first.weight || startingWeight);
    weeklyRate = Number((weightDiff / weeks).toFixed(2));
  }

  const cardBgClass = theme === 'light' 
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm' 
    : 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBgClass}`}>
        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" /> Strength & Weight Analytics
        </h3>
        <p className="text-xs text-slate-400">Analyze progressive overload, strength gains per exercise, and weight trends.</p>
      </div>

      {/* 1. Weight Progression & Weekly Rate Dashboard */}
      <div className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Weight Progression & Weekly Rate</h4>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">Target: {targetWeight} kg</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Start Weight</span>
            <span className="text-lg font-extrabold text-slate-200">{startingWeight} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Weight</span>
            <span className="text-lg font-extrabold text-blue-400">{currentWeight} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Change</span>
            <span className={`text-lg font-extrabold flex items-center gap-1 ${
              totalChange >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {totalChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {totalChange >= 0 ? `+${totalChange}` : totalChange} kg
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Weekly Rate</span>
            <span className="text-lg font-extrabold text-purple-400">
              {weeklyRate >= 0 ? `+${weeklyRate}` : weeklyRate} kg/wk
            </span>
          </div>
        </div>

        {/* Visual Bar Chart for Weight History */}
        {sortedMeasurements.length > 0 ? (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Weigh-In Records</span>
            <div className="flex items-end gap-2 h-32 p-3 bg-slate-950/50 rounded-xl border border-slate-800 overflow-x-auto">
              {sortedMeasurements.slice(-10).map((m, idx) => {
                const w = m.weight || startingWeight;
                const minW = Math.min(...sortedMeasurements.map(s => s.weight || startingWeight), startingWeight) - 2;
                const maxW = Math.max(...sortedMeasurements.map(s => s.weight || startingWeight), targetWeight) + 2;
                const pct = Math.max(15, Math.min(100, ((w - minW) / (maxW - minW)) * 100));

                return (
                  <div key={m.id || idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] font-mono font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition">{w}kg</span>
                    <div 
                      className="w-full bg-blue-600/80 hover:bg-blue-500 rounded-t-lg transition duration-300"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[8px] font-mono text-slate-500 truncate w-full text-center">{m.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No weight measurements logged yet.</p>
        )}
      </div>

      {/* 2. Strength Progression per Exercise */}
      <div className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Exercise Progressive Overload</h4>
          </div>

          {uniqueExerciseNames.length > 0 && (
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-orange-400 focus:outline-none"
            >
              {uniqueExerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>

        {exerciseHistory.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
            <Dumbbell className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-bold text-slate-300">No workout records found for "{selectedExercise}"</p>
            <p className="text-[11px] text-slate-500">Log workout sessions containing this exercise to view progressive weight gains over time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Peak Weight</span>
                <span className="text-base font-extrabold text-orange-400">
                  {Math.max(...exerciseHistory.map(e => e.maxWeight))} kg
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Sessions</span>
                <span className="text-base font-extrabold text-slate-200">{exerciseHistory.length}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Overload Status</span>
                <span className="text-xs font-extrabold text-emerald-400 uppercase">
                  {exerciseHistory.length >= 2 && exerciseHistory[exerciseHistory.length - 1].maxWeight >= exerciseHistory[0].maxWeight ? 'Gaining 💪' : 'Baseline'}
                </span>
              </div>
            </div>

            {/* Progression Chart */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Progression History</span>
              <div className="space-y-2">
                {exerciseHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">{item.date}</span>
                      <span className="font-bold text-orange-400">
                        {item.maxWeight > 0 ? `${item.maxWeight} kg` : 'Bodyweight'}
                      </span>
                    </div>
                    <div className="font-mono text-slate-400 text-[11px]">
                      {item.setsCount} sets ({item.totalReps} total reps)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
