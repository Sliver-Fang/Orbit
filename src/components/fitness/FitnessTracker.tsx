/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Dumbbell, Scale, Flame, Moon, TrendingUp, Trophy, Calendar, 
  Plus, Activity, LayoutDashboard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Workout } from '../../types';
import { FitnessOverview } from './FitnessOverview';
import { WorkoutLogger } from './WorkoutLogger';
import { WorkoutHistory } from './WorkoutHistory';
import { BodyProgressTracker } from './BodyProgressTracker';
import { NutritionTracker } from './NutritionTracker';
import { RecoveryActivityTracker } from './RecoveryActivityTracker';
import { StrengthWeightAnalytics } from './StrengthWeightAnalytics';
import { WeeklyCheckInView } from './WeeklyCheckInView';
import { FitnessHabitsMilestones } from './FitnessHabitsMilestones';

export const FitnessTracker: React.FC = () => {
  const { data } = useApp();
  const theme = data.settings.theme;
  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'workouts' | 'progress' | 'nutrition' | 'recovery' | 'analytics' | 'milestones'
  >('overview');

  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showWorkoutLoggerModal, setShowWorkoutLoggerModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'progress', label: 'Body Progress', icon: Scale },
    { id: 'nutrition', label: 'Nutrition', icon: Flame },
    { id: 'recovery', label: 'Sleep & Recovery', icon: Moon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'milestones', label: 'Milestones & Habits', icon: Trophy },
  ] as const;

  const cardBgClass = isDark 
    ? 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';

  return (
    <div className="space-y-6 pb-20">
      {/* Sub-Navigation Bar for Fitness Module */}
      <div className={`p-2 rounded-2xl border ${cardBgClass} overflow-x-auto`}>
        <div className="flex items-center gap-1 min-w-[680px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold' 
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'overview' && (
        <FitnessOverview 
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onOpenWorkoutLogger={() => {
            setEditingWorkout(null);
            setShowWorkoutLoggerModal(true);
          }}
          onOpenCheckIn={() => setShowCheckInModal(true)}
        />
      )}

      {activeTab === 'workouts' && (
        <WorkoutHistory 
          onEditWorkout={(w) => {
            setEditingWorkout(w);
            setShowWorkoutLoggerModal(true);
          }}
          onOpenNewWorkout={() => {
            setEditingWorkout(null);
            setShowWorkoutLoggerModal(true);
          }}
        />
      )}

      {activeTab === 'progress' && <BodyProgressTracker />}
      {activeTab === 'nutrition' && <NutritionTracker />}
      {activeTab === 'recovery' && <RecoveryActivityTracker />}
      {activeTab === 'analytics' && <StrengthWeightAnalytics />}
      {activeTab === 'milestones' && <FitnessHabitsMilestones />}

      {/* Workout Logger Modal */}
      {showWorkoutLoggerModal && (
        <WorkoutLogger 
          initialWorkout={editingWorkout}
          onClose={() => {
            setShowWorkoutLoggerModal(false);
            setEditingWorkout(null);
          }}
        />
      )}

      {/* Weekly Check-In View Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <WeeklyCheckInView onClose={() => setShowCheckInModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
