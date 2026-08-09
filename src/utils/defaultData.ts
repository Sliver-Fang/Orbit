/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData, Achievement, HabitType, GamificationState, AppSettings, FitnessState, FitnessMilestone } from '../types';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'study_10', title: 'Novice Scholar', description: 'Complete 10 hours of study tracking', unlockedAt: null, category: 'study', targetValue: 10, icon: 'GraduationCap' },
  { id: 'study_100', title: 'Relentless Academic', description: 'Complete 100 hours of study tracking', unlockedAt: null, category: 'study', targetValue: 100, icon: 'Award' },
  { id: 'study_1000', title: 'Grandmaster Intellectual', description: 'Complete 1000 hours of study tracking', unlockedAt: null, category: 'study', targetValue: 1000, icon: 'Flame' },
  { id: 'pomo_10', title: 'Focus Starter', description: 'Complete 10 Pomodoro sessions', unlockedAt: null, category: 'pomodoro', targetValue: 10, icon: 'Timer' },
  { id: 'pomo_500', title: 'Deep Work Legend', description: 'Complete 500 Pomodoro sessions', unlockedAt: null, category: 'pomodoro', targetValue: 500, icon: 'Zap' },
  { id: 'streak_3', title: 'Consistency Spark', description: 'Maintain a 3-day active streak', unlockedAt: null, category: 'streak', targetValue: 3, icon: 'CalendarDays' },
  { id: 'streak_30', title: 'Unstoppable Mindset', description: 'Maintain a 30-day active streak', unlockedAt: null, category: 'streak', targetValue: 30, icon: 'Infinity' },
  { id: 'streak_365', title: 'Year of Discipline', description: 'Maintain a 365-day active streak', unlockedAt: null, category: 'streak', targetValue: 365, icon: 'ShieldAlert' },
  { id: 'chap_10', title: 'Syllabus Shredder', description: 'Complete or master 10 chapters', unlockedAt: null, category: 'chapters', targetValue: 10, icon: 'BookOpen' },
  { id: 'chap_100', title: 'Ultimate Master', description: 'Complete or master 100 chapters', unlockedAt: null, category: 'chapters', targetValue: 100, icon: 'Crown' },
  { id: 'task_50', title: 'Get Things Done', description: 'Complete 50 tasks', unlockedAt: null, category: 'tasks', targetValue: 50, icon: 'CheckSquare' },
  { id: 'task_1000', title: 'Task Annihilator', description: 'Complete 1000 tasks', unlockedAt: null, category: 'tasks', targetValue: 1000, icon: 'Trophy' }
];

export const DEFAULT_HABITS_LIST: { name: string; type: 'Good' | 'Bad' }[] = [];

export const DEFAULT_FITNESS_MILESTONES: FitnessMilestone[] = [
  { id: 'wt_55', title: '55 kg Milestone', description: 'Reach a body weight of 55 kg', category: 'weight', targetValue: 55, currentValue: 52, unlockedAt: null, icon: 'Scale' },
  { id: 'wt_57', title: '57.5 kg Milestone', description: 'Reach a body weight of 57.5 kg', category: 'weight', targetValue: 57.5, currentValue: 52, unlockedAt: null, icon: 'Scale' },
  { id: 'wt_60', title: '60 kg Target Achieved', description: 'Reach your target body weight of 60 kg', category: 'weight', targetValue: 60, currentValue: 52, unlockedAt: null, icon: 'Trophy' },
  { id: 'str_pushups_10', title: '10 Push-ups', description: 'Complete a set of 10 push-ups in a single workout', category: 'strength', targetValue: 10, currentValue: 0, unlockedAt: null, icon: 'Dumbbell' },
  { id: 'str_pushups_15', title: '15 Push-ups', description: 'Complete a set of 15 push-ups', category: 'strength', targetValue: 15, currentValue: 0, unlockedAt: null, icon: 'Flame' },
  { id: 'str_first_db', title: 'First Dumbbell Session', description: 'Complete your first dumbbell workout session', category: 'strength', targetValue: 1, currentValue: 0, unlockedAt: null, icon: 'Award' },
  { id: 'str_first_pullup', title: 'First Pull-up', description: 'Perform 1 full pull-up', category: 'strength', targetValue: 1, currentValue: 0, unlockedAt: null, icon: 'Crown' },
  { id: 'con_7_workouts', title: '7 Workouts Completed', description: 'Log 7 completed workout sessions', category: 'consistency', targetValue: 7, currentValue: 0, unlockedAt: null, icon: 'CheckSquare' },
  { id: 'con_30_workouts', title: '30 Workouts Completed', description: 'Log 30 completed workout sessions', category: 'consistency', targetValue: 30, currentValue: 0, unlockedAt: null, icon: 'Zap' },
];

export const DEFAULT_FITNESS_STATE: FitnessState = {
  profile: {
    startingWeight: 52,
    targetWeight: 60,
    targetWeightRateKgPerWeek: 0.25,
    calorieTarget: 2200,
    proteinTarget: 120,
    waterTargetMl: 3000,
    sleepTargetHours: 8,
    stepTarget: 8000
  },
  workouts: [],
  bodyMeasurements: [],
  progressPhotos: [],
  nutritionEntries: [],
  recoveryEntries: [],
  activityEntries: [],
  weeklyCheckIns: [],
  habits: [
    { id: 'fhabit_workout', name: 'Workout Session', icon: 'Dumbbell', successDates: [], skipDates: [] },
    { id: 'fhabit_protein', name: 'Hit Protein Target (120g+)', icon: 'Flame', successDates: [], skipDates: [] },
    { id: 'fhabit_water', name: 'Drink 3L Water', icon: 'Droplets', successDates: [], skipDates: [] },
    { id: 'fhabit_sleep', name: '8 Hours Sleep', icon: 'Moon', successDates: [], skipDates: [] },
    { id: 'fhabit_morning', name: 'Morning Routine', icon: 'Sun', successDates: [], skipDates: [] },
  ],
  milestones: DEFAULT_FITNESS_MILESTONES
};

export const getInitialDefaultData = (): AppData => {
  return {
    subjects: [
      { id: 'subj_maths', name: 'Maths', color: '#3b82f6' },
      { id: 'subj_quant', name: 'Quant', color: '#10b981' },
      { id: 'subj_reasoning', name: 'Reasoning', color: '#eab308' },
      { id: 'subj_english', name: 'English', color: '#a855f7' },
      { id: 'subj_ga', name: 'General awareness', color: '#f97316' },
      { id: 'subj_computer', name: 'Computer', color: '#06b6d4' },
      { id: 'subj_other', name: 'Other Subject', color: '#64748b' }
    ],
    chapters: [],
    studySessions: [],
    tasks: [],
    habits: [],
    pomodoroSessions: [],
    revisions: [],
    mockTests: [],
    gamification: {
      xp: 0,
      level: 1,
      achievements: DEFAULT_ACHIEVEMENTS.map(ach => ({ ...ach, unlockedAt: null })),
      dailyStreak: 0,
      weeklyStreak: 0,
      monthlyStreak: 0,
      lastActiveDate: null
    },
    settings: {
      theme: 'dark',
      accentColor: '#3b82f6',
      fontSize: 'base',
      uiScaling: 1.0,
      animationSpeed: 'normal',
      cornerRadius: 12,
      notificationsEnabled: true,
      fontSizeMultiplier: 1.0,
      volumeEnabled: true
    },
    fitness: DEFAULT_FITNESS_STATE
  };
};
