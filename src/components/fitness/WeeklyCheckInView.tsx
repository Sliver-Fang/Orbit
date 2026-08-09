/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, Check, Scale, Flame, Moon, Footprints, 
  Dumbbell, Star, ChevronRight, Sparkles, MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WeeklyCheckIn } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';

interface WeeklyCheckInViewProps {
  onClose?: () => void;
}

export const WeeklyCheckInView: React.FC<WeeklyCheckInViewProps> = ({ onClose }) => {
  const { data, addWeeklyCheckIn } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness;
  const todayStr = getLocalDateString();

  const bodyMeasurements = fitness?.bodyMeasurements || [];
  const nutritionEntries = fitness?.nutritionEntries || [];
  const recoveryEntries = fitness?.recoveryEntries || [];
  const activityEntries = fitness?.activityEntries || [];
  const workouts = fitness?.workouts || [];
  const checkIns = fitness?.weeklyCheckIns || [];

  // Auto calculate last 7 days averages
  const past7Days = (items: { date: string }[]) => {
    return items.filter(item => {
      const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(item.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
  };

  const recentWeights = past7Days(bodyMeasurements).map(m => (m as any).weight).filter(Boolean);
  const avgWeight = recentWeights.length > 0 
    ? Number((recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length).toFixed(1))
    : fitness?.profile.startingWeight || 52;

  const recentNut = past7Days(nutritionEntries);
  const avgProtein = recentNut.length > 0 
    ? Math.round(recentNut.reduce((a, b) => a + (b as any).protein, 0) / recentNut.length)
    : 120;
  const avgCalories = recentNut.length > 0 
    ? Math.round(recentNut.reduce((a, b) => a + (b as any).calories, 0) / recentNut.length)
    : 2200;

  const recentSleep = past7Days(recoveryEntries).map(r => (r as any).sleepHours).filter(Boolean);
  const avgSleep = recentSleep.length > 0 
    ? Number((recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length).toFixed(1))
    : 7.5;

  const recentSteps = past7Days(activityEntries).map(a => (a as any).steps).filter(Boolean);
  const avgSteps = recentSteps.length > 0 
    ? Math.round(recentSteps.reduce((a, b) => a + b, 0) / recentSteps.length)
    : 8000;

  const recentWorkouts = past7Days(workouts);
  const completedWorkouts = recentWorkouts.filter(w => (w as any).status === 'Completed').length;
  const workoutAdherencePct = Math.round((completedWorkouts / Math.max(1, fitness?.profile.weeklyWorkoutGoalDays || 4)) * 100);

  // Ratings State
  const [date, setDate] = useState(todayStr);
  const [energyRating, setEnergyRating] = useState(4);
  const [stressRating, setStressRating] = useState(2);
  const [digestionRating, setDigestionRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    addWeeklyCheckIn({
      date,
      averageWeight: avgWeight,
      averageProteinGrams: avgProtein,
      averageCalories: avgCalories,
      averageSleepHours: avgSleep,
      averageSteps: avgSteps,
      workoutAdherencePct,
      energyRating,
      stressRating,
      digestionRating,
      notes
    });
    setSubmitted(true);
  };

  const cardBgClass = theme === 'light' 
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm' 
    : 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBgClass} flex items-center justify-between`}>
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Weekly Check-In & Evaluation
          </h3>
          <p className="text-xs text-slate-400">Review 7-day averages, rate subjective energy, and log notes for continuous progress.</p>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      {/* Check-In Submission Form */}
      {submitted ? (
        <div className={`p-8 text-center rounded-2xl border ${cardBgClass} space-y-3`}>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-base text-emerald-400">Weekly Check-In Submitted!</h4>
          <p className="text-xs text-slate-400">XP awarded! Your calculated averages and qualitative feedback have been recorded.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition cursor-pointer"
          >
            Log Another Check-In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitCheckIn} className={`p-5 rounded-2xl border ${cardBgClass} space-y-6`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 7-Day Auto-Calculated Averages
            </span>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
            />
          </div>

          {/* Auto Calculated Averages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Scale className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Weight</span>
              <span className="text-sm font-extrabold text-slate-200">{avgWeight} kg</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Flame className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Protein</span>
              <span className="text-sm font-extrabold text-emerald-400">{avgProtein} g</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Cals</span>
              <span className="text-sm font-extrabold text-slate-200">{avgCalories} kcal</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Moon className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Sleep</span>
              <span className="text-sm font-extrabold text-purple-400">{avgSleep} hrs</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Footprints className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Steps</span>
              <span className="text-sm font-extrabold text-slate-200">{avgSteps.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <Dumbbell className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Workout Goal</span>
              <span className="text-sm font-extrabold text-orange-400">{workoutAdherencePct}%</span>
            </div>
          </div>

          {/* Qualitative Subjective Ratings */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualitative Self-Assessment (1 - 5)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Energy & Mood: <span className="text-blue-400">{energyRating}/5</span></label>
                <input 
                  type="range" 
                  min={1} 
                  max={5} 
                  value={energyRating} 
                  onChange={e => setEnergyRating(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Stress Level: <span className="text-amber-400">{stressRating}/5</span></label>
                <input 
                  type="range" 
                  min={1} 
                  max={5} 
                  value={stressRating} 
                  onChange={e => setStressRating(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Appetite / Digestion: <span className="text-emerald-400">{digestionRating}/5</span></label>
                <input 
                  type="range" 
                  min={1} 
                  max={5} 
                  value={digestionRating} 
                  onChange={e => setDigestionRating(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Anything I should know? (Reflections & Next Week Plan)
            </label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Felt strong this week on DB Bench Press. Will try adding 2.5kg next week..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Weekly Check-In
            </button>
          </div>
        </form>
      )}

      {/* Historical Check-Ins List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Past Check-In History</h4>

        {checkIns.length === 0 ? (
          <p className="text-xs text-slate-500 italic pl-1">No past weekly check-ins recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {checkIns.map((ci) => (
              <div key={ci.id} className={`p-4 rounded-2xl border ${cardBgClass} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono">📅 {ci.date} Check-In</span>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Recorded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>Avg Weight: <span className="font-bold text-slate-200">{ci.averageWeight} kg</span></div>
                  <div>Avg Protein: <span className="font-bold text-emerald-400">{ci.averageProteinGrams} g</span></div>
                  <div>Avg Sleep: <span className="font-bold text-purple-400">{ci.averageSleepHours} hrs</span></div>
                  <div>Workout Goal: <span className="font-bold text-orange-400">{ci.workoutAdherencePct}%</span></div>
                </div>

                {ci.notes && <p className="text-xs text-slate-400 italic pt-1">"{ci.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
