/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Scale, Dumbbell, Flame, Moon, Activity, Trophy, TrendingUp, Plus, 
  Calendar, CheckCircle2, AlertCircle, Award, ChevronRight, Zap, Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FITNESS_STATE } from '../../utils/defaultData';
import { getLocalDateString } from '../../utils/dateUtils';

interface FitnessOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenWorkoutLogger: () => void;
  onOpenCheckIn: () => void;
}

export const FitnessOverview: React.FC<FitnessOverviewProps> = ({
  onNavigateTab,
  onOpenWorkoutLogger,
  onOpenCheckIn
}) => {
  const { data } = useApp();
  const fitness = data.fitness || DEFAULT_FITNESS_STATE;
  const { profile, workouts, bodyMeasurements, nutritionEntries, recoveryEntries, milestones } = fitness;
  const theme = data.settings.theme;
  const accentColor = data.settings.accentColor;
  const todayStr = getLocalDateString();

  // Calculate Weight Metrics
  const latestMeasurement = bodyMeasurements[0];
  const currentWeight = latestMeasurement?.weight || profile.startingWeight;
  const startingWeight = profile.startingWeight;
  const targetWeight = profile.targetWeight;
  const totalWeightChange = Number((currentWeight - startingWeight).toFixed(1));

  // Weekly average weight (past 7 days)
  const past7DaysMeasurements = bodyMeasurements.filter(m => {
    if (!m.weight) return false;
    const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(m.date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  
  const weeklyAvgWeight = past7DaysMeasurements.length > 0
    ? (past7DaysMeasurements.reduce((acc, curr) => acc + (curr.weight || 0), 0) / past7DaysMeasurements.length).toFixed(1)
    : currentWeight.toFixed(1);

  // Training Metrics (This week)
  const past7DaysWorkouts = workouts.filter(w => {
    const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(w.date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  const completedThisWeek = past7DaysWorkouts.filter(w => w.status === 'Completed').length;

  // Streak calculation
  let streak = 0;
  const sortedWorkouts = [...workouts].filter(w => w.status === 'Completed').sort((a, b) => b.date.localeCompare(a.date));
  if (sortedWorkouts.length > 0) {
    let checkDate = new Date(todayStr);
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasWorkout = sortedWorkouts.some(w => w.date === dateStr);
      if (hasWorkout) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a workout yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Nutrition Today
  const todayNutrition = nutritionEntries.find(n => n.date === todayStr);
  const todayCalories = todayNutrition?.calories || 0;
  const todayProtein = todayNutrition?.protein || 0;

  // Recovery Today
  const todayRecovery = recoveryEntries.find(r => r.date === todayStr);
  const sleepHours = todayRecovery?.sleepHours || 0;
  const energyRating = todayRecovery?.energy || 0;

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  // Recent Milestone
  const recentMilestone = milestones.find(m => m.unlockedAt) || milestones[0];

  const cardBgClass = isDark 
    ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Controls */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900/80 border-blue-500/20'
          : 'bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white border-blue-100' 
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" /> Fitness & Body System
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
              Active Dashboard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Fitness Overview</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Track workouts, weight trends, nutrition, and recovery independent of study sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenWorkoutLogger}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Workout
          </button>

          <button
            onClick={onOpenCheckIn}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition border flex items-center gap-2 cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Weekly Check-In
          </button>
        </div>
      </div>

      {/* 4 Primary Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col justify-between relative overflow-hidden group`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Body Weight</h3>
                <span className="text-[10px] font-mono text-slate-500">Target: {targetWeight} kg</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('progress')}
              className={`p-1 transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              title="View Body Progress"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{currentWeight} <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>kg</span></span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                totalWeightChange >= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {totalWeightChange >= 0 ? `+${totalWeightChange}` : totalWeightChange} kg
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              7-Day Avg: <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{weeklyAvgWeight} kg</span>
            </p>
          </div>

          {/* Progress towards target bar */}
          <div className="mt-2 space-y-1">
            <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-1.5 overflow-hidden`}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, (currentWeight / targetWeight) * 100))}%` }}
              />
            </div>
            <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
              <span>Start: {startingWeight}kg</span>
              <span>Target: {targetWeight}kg</span>
            </div>
          </div>
        </div>

        {/* Training Card */}
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col justify-between relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Training</h3>
                <span className="text-[10px] font-mono text-slate-500">Streak: {streak} days</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('workouts')}
              className={`p-1 transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              title="View Workouts"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{completedThisWeek}</span>
              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>workouts this week</span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 flex items-center gap-1`}>
              <Zap className="w-3 h-3 text-orange-500 dark:text-orange-400" /> Total logged: <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{workouts.length} sessions</span>
            </p>
          </div>

          <div className="mt-2">
            <button 
              onClick={onOpenWorkoutLogger}
              className="w-full py-1.5 text-xs font-bold rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 transition cursor-pointer"
            >
              + Quick Workout Log
            </button>
          </div>
        </div>

        {/* Nutrition Card */}
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col justify-between relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nutrition Today</h3>
                <span className="text-[10px] font-mono text-slate-500">Target: {profile.calorieTarget} kcal</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('nutrition')}
              className={`p-1 transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              title="View Nutrition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{todayCalories} <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>kcal</span></span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                todayNutrition?.adherence === 'Hit target' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                todayNutrition?.adherence === 'Close' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {todayNutrition?.adherence || 'Not Logged'}
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Protein: <span className="font-bold text-emerald-600 dark:text-emerald-400">{todayProtein}g</span> / {profile.proteinTarget}g
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-1.5 overflow-hidden`}>
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (todayProtein / profile.proteinTarget) * 100)}%` }}
              />
            </div>
            <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
              <span>Protein Goal</span>
              <span>{Math.round((todayProtein / profile.proteinTarget) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Recovery Card */}
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col justify-between relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recovery Today</h3>
                <span className="text-[10px] font-mono text-slate-500">Goal: {profile.sleepTargetHours} hrs</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('recovery')}
              className={`p-1 transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              title="View Recovery"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{sleepHours} <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>hrs</span></span>
              {energyRating > 0 && (
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  ⚡ {energyRating}/5 Energy
                </span>
              )}
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Sleep Quality: <span className="font-bold text-purple-600 dark:text-purple-300">{todayRecovery?.sleepQuality ? `${todayRecovery.sleepQuality}/5` : 'Not logged'}</span>
            </p>
          </div>

          <div className="mt-2">
            <button 
              onClick={() => onNavigateTab('recovery')}
              className="w-full py-1.5 text-xs font-bold rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition cursor-pointer"
            >
              Log Sleep & Energy
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Quick Action Row & Recent Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Workouts Widget */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="font-bold text-sm">Recent Workouts</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('workouts')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {workouts.length === 0 ? (
            <div className={`p-8 text-center border-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'} rounded-xl space-y-2`}>
              <Dumbbell className="w-8 h-8 mx-auto text-slate-400 animate-pulse" />
              <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No workouts logged yet</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Start tracking your upper body, push, or leg sessions to build progressive overload.</p>
              <button 
                onClick={onOpenWorkoutLogger}
                className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition cursor-pointer inline-block"
              >
                Log First Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workouts.slice(0, 3).map((w) => (
                <div 
                  key={w.id} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        w.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {w.status}
                      </span>
                      <h4 className="text-xs font-bold truncate">{w.name}</h4>
                    </div>
                    <div className={`flex items-center gap-3 mt-1.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} font-mono`}>
                      <span>📅 {w.date}</span>
                      <span>⏱️ {w.durationMinutes} mins</span>
                      <span>🏋️ {w.exercises.length} exercises</span>
                    </div>
                  </div>

                  {w.status === 'Skipped' && w.skipReason && (
                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                      Reason: {w.skipReason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Progress Box */}
        <div className={`p-5 rounded-2xl border ${cardBgClass} flex flex-col justify-between space-y-4`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-sm">Active Milestone</h3>
            </div>

            {recentMilestone ? (
              <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-yellow-600 dark:text-yellow-400">{recentMilestone.title}</span>
                  {recentMilestone.unlockedAt ? (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">Unlocked!</span>
                  ) : (
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500/80 font-mono">In Progress</span>
                  )}
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-snug`}>{recentMilestone.description}</p>
                <div className={`w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-1.5 overflow-hidden mt-1`}>
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${Math.min(100, (recentMilestone.currentValue / recentMilestone.targetValue) * 100)}%` }}
                  />
                </div>
                <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
                  <span>Progress: {recentMilestone.currentValue}</span>
                  <span>Target: {recentMilestone.targetValue}</span>
                </div>
              </div>
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No active milestones.</p>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('milestones')}
            className={`w-full py-2 text-xs font-bold rounded-xl transition border flex items-center justify-center gap-2 cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-yellow-500" /> View All Milestones & Habits
          </button>
        </div>
      </div>
    </div>
  );
};
