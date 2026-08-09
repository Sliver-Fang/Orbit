/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppData, Subject, Chapter, StudySession, Task, Habit, 
  PomodoroSession, Revision, MockTest, AppSettings, GamificationState, Achievement,
  FitnessProfile, Workout, BodyMeasurement, ProgressPhoto, NutritionEntry, RecoveryEntry,
  ActivityEntry, WeeklyCheckIn, FitnessHabit, FitnessMilestone
} from '../types';
import { getInitialDefaultData, DEFAULT_ACHIEVEMENTS, DEFAULT_HABITS_LIST, DEFAULT_FITNESS_STATE } from '../utils/defaultData';
import { getLocalDateString, getPastLocalDateString } from '../utils/dateUtils';

interface AppContextType {
  data: AppData;
  addSubject: (name: string, color: string) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  updateChapter: (chapter: Chapter) => void;
  deleteChapter: (id: string) => void;
  
  addStudySession: (session: Omit<StudySession, 'id' | 'date'> & { date?: string }) => void;
  updateStudySession: (session: StudySession) => void;
  deleteStudySession: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (task: Task) => void;
  toggleTaskStatus: (id: string) => void;
  setTaskStatus: (id: string, status: 'Pending' | 'Completed' | 'Incomplete') => void;
  deleteTask: (id: string) => void;
  
  toggleHabitDate: (id: string, date: string, status: 'success' | 'failure' | 'skip') => void;
  addHabit: (name: string, type: 'Good' | 'Bad') => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  
  addPomodoroSession: (duration: number, mode: '25/5' | '50/10' | '90/20' | 'Custom') => void;
  
  addRevision: (revision: Omit<Revision, 'id'>) => void;
  updateRevision: (revision: Revision) => void;
  deleteRevision: (id: string) => void;
  
  addMockTest: (test: Omit<MockTest, 'id'>) => void;
  updateMockTest: (test: MockTest) => void;
  deleteMockTest: (id: string) => void;

  // Fitness System Methods
  updateFitnessProfile: (profile: Partial<FitnessProfile>) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  deleteBodyMeasurement: (id: string) => void;
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  deleteProgressPhoto: (id: string) => void;
  logNutrition: (nutrition: Omit<NutritionEntry, 'id' | 'adherence'> & { adherence?: NutritionEntry['adherence'] }) => void;
  logRecovery: (recovery: Omit<RecoveryEntry, 'id'>) => void;
  logActivity: (activity: Omit<ActivityEntry, 'id'>) => void;
  addWeeklyCheckIn: (checkIn: Omit<WeeklyCheckIn, 'id'>) => void;
  toggleFitnessHabitDate: (habitId: string, date: string) => void;
  addFitnessHabit: (name: string) => void;
  deleteFitnessHabit: (id: string) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: (toBlank?: boolean) => void;
  importBackupData: (jsonString: string, mode: 'merge' | 'replace') => { success: boolean; error?: string };
  addXP: (amount: number) => void;
  
  todayDate: string;
  levelUpNotification: string | null;
  setLevelUpNotification: (msg: string | null) => void;
  achievementNotification: string | null;
  setAchievementNotification: (msg: string | null) => void;

  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetToDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'study_productivity_tracker_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);

  const [data, setData] = useState<AppData>(() => {
    const freshVersionKey = 'study_tracker_fresh_v2.0';
    
    // One-time forced wipe of old mock/dummy data to give user a clean fresh application
    if (!localStorage.getItem(freshVersionKey)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem('study_tracker_onboarded_v1.1', 'true');
      localStorage.setItem(freshVersionKey, 'true');
      return getInitialDefaultData();
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.settings) {
          if (parsed.subjects.length === 0) {
            parsed.subjects = [
              { id: 'subj_maths', name: 'Maths', color: '#3b82f6' },
              { id: 'subj_quant', name: 'Quant', color: '#10b981' },
              { id: 'subj_reasoning', name: 'Reasoning', color: '#eab308' },
              { id: 'subj_english', name: 'English', color: '#a855f7' },
              { id: 'subj_ga', name: 'General awareness', color: '#f97316' },
              { id: 'subj_computer', name: 'Computer', color: '#06b6d4' },
              { id: 'subj_other', name: 'Other Subject', color: '#64748b' }
            ];
          }
          if (!parsed.fitness) {
            parsed.fitness = DEFAULT_FITNESS_STATE;
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved data, resetting to defaults', e);
      }
    }
    // Default data is populated as the first launch demo state
    return getInitialDefaultData();
  });

  const [todayDate, setTodayDate] = useState<string>(() => getLocalDateString());
  const [levelUpNotification, setLevelUpNotification] = useState<string | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);

  // Live interval checking for midnight (00:00 AM) date rollover to reset system-wide day parameters
  useEffect(() => {
    const checkDateRollover = () => {
      const currentStr = getLocalDateString();
      if (currentStr !== todayDate) {
        setTodayDate(currentStr);
        // Force streak update and day rollover re-evaluation
        setData(prev => ({
          ...prev,
          gamification: {
            ...prev.gamification,
            lastActiveDate: null // Force re-evaluating streak on new date
          }
        }));
      }
    };

    const timer = setInterval(checkDateRollover, 5000); // Check every 5 seconds for instant 00:00 rollover
    return () => clearInterval(timer);
  }, [todayDate]);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const completeOnboarding = () => {
    localStorage.setItem('study_tracker_onboarded_v1.1', 'true');
    setIsOnboarded(true);
    resetAllData(true); // reset to clean empty profile
  };

  const resetToDemo = () => {
    localStorage.removeItem('study_tracker_onboarded_v1.1');
    setIsOnboarded(false);
    setData(getInitialDefaultData());
  };

  // Gamification & Achievement calculation
  const addXP = (amount: number) => {
    setData(prev => {
      const newXp = prev.gamification.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      let leveledUp = false;
      if (newLevel > prev.gamification.level) {
        leveledUp = true;
      }

      const updatedGamification = {
        ...prev.gamification,
        xp: newXp,
        level: newLevel,
      };

      if (leveledUp) {
        setLevelUpNotification(`🎉 LEVEL UP! You reached Level ${newLevel}! Keep studying!`);
      }

      // Check achievements after updating XP
      const tempState = { ...prev, gamification: updatedGamification };
      const freshlyUnlocked = checkAchievements(tempState);
      
      return freshlyUnlocked;
    });
  };

  const checkAchievements = (state: AppData): AppData => {
    const todayStr = getLocalDateString();
    
    // Calculate current values
    const totalHours = state.studySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
    const totalPomodoros = state.pomodoroSessions.length;
    const maxStreak = state.gamification.dailyStreak;
    const completedChapters = state.chapters.filter(c => c.status === 'Mastered' || c.status === 'Revised').length;
    const completedTasks = state.tasks.filter(t => t.status === 'Completed').length;

    let unlockedCount = 0;
    let unlockedTitle = '';

    const updatedAchievements = state.gamification.achievements.map(ach => {
      if (ach.unlockedAt) return ach; // Already unlocked

      let value = 0;
      switch (ach.category) {
        case 'study':
          value = totalHours;
          break;
        case 'pomodoro':
          value = totalPomodoros;
          break;
        case 'streak':
          value = maxStreak;
          break;
        case 'chapters':
          value = completedChapters;
          break;
        case 'tasks':
          value = completedTasks;
          break;
      }

      if (value >= ach.targetValue) {
        unlockedCount++;
        unlockedTitle = ach.title;
        return {
          ...ach,
          unlockedAt: todayStr
        };
      }
      return ach;
    });

    if (unlockedCount > 0) {
      setAchievementNotification(`🏆 ACHIEVEMENT UNLOCKED: "${unlockedTitle}"! Check your badges!`);
    }

    return {
      ...state,
      gamification: {
        ...state.gamification,
        achievements: updatedAchievements
      }
    };
  };

  // Automatically recalculate streaks based on study sessions
  useEffect(() => {
    const todayStr = getLocalDateString();
    if (data.gamification.lastActiveDate === todayStr) return; // Already checked today

    const sessions = data.studySessions;
    if (sessions.length === 0) return;

    // Get unique dates sorted descending
    const dates = (Array.from(new Set(sessions.map(s => s.date))) as string[]).sort((a, b) => b.localeCompare(a));
    
    let currentStreak = 0;
    const yesterdayStr = getPastLocalDateString(1);

    if (dates[0] === todayStr || dates[0] === yesterdayStr) {
      currentStreak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i+1]);
        const diffTime = Math.abs(d1.getTime() - d2.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          break; // Streak broken
        }
      }
    } else {
      currentStreak = 0; // Broken streak
    }

    setData(prev => ({
      ...prev,
      gamification: {
        ...prev.gamification,
        dailyStreak: currentStreak,
        lastActiveDate: todayStr
      }
    }));
  }, [data.studySessions]);

  // Automatically mark pending tasks whose deadline has passed (after 00:00 AM of deadline) as Incomplete
  useEffect(() => {
    const todayStr = getLocalDateString();
    const hasOverduePending = data.tasks.some(t => t.status === 'Pending' && t.deadline < todayStr);
    if (hasOverduePending) {
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => {
          if (t.status === 'Pending' && t.deadline < todayStr) {
            return { ...t, status: 'Incomplete' as const };
          }
          return t;
        })
      }));
    }
  }, [data.tasks]);

  // CRUD FOR SUBJECTS
  const addSubject = (name: string, color: string) => {
    const id = `subj_${Date.now()}`;
    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { id, name, color }]
    }));
    addXP(100); // 100 XP bonus for creating subjects
  };

  const updateSubject = (subject: Subject) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subject.id ? subject : s)
    }));
  };

  const deleteSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      chapters: prev.chapters.filter(c => c.subjectId !== id),
      studySessions: prev.studySessions.filter(s => s.subjectId !== id),
      tasks: prev.tasks.filter(t => t.subjectId !== id),
      revisions: prev.revisions.filter(r => r.subjectId !== id),
      mockTests: prev.mockTests.filter(m => m.subjectId !== id),
    }));
  };

  // CRUD FOR CHAPTERS
  const addChapter = (chapter: Omit<Chapter, 'id'>) => {
    const id = `chap_${Date.now()}`;
    setData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { ...chapter, id }]
    }));
    addXP(50);
  };

  const updateChapter = (chapter: Chapter) => {
    setData(prev => {
      // Calculate XP if chapter becomes Completed/Mastered
      const prevChapter = prev.chapters.find(c => c.id === chapter.id);
      let xpEarned = 0;
      if (prevChapter && 
          (prevChapter.status !== 'Mastered' && prevChapter.status !== 'Revised') && 
          (chapter.status === 'Mastered' || chapter.status === 'Revised')) {
        xpEarned = 150; // Big bonus for mastering a chapter
      }

      const nextState = {
        ...prev,
        chapters: prev.chapters.map(c => c.id === chapter.id ? chapter : c)
      };

      if (xpEarned > 0) {
        setTimeout(() => addXP(xpEarned), 50);
      }

      return nextState;
    });
  };

  const deleteChapter = (id: string) => {
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== id),
      studySessions: prev.studySessions.filter(s => s.chapterId !== id),
      tasks: prev.tasks.filter(t => t.chapterId !== id),
      revisions: prev.revisions.filter(r => r.chapterId !== id),
    }));
  };

  // CRUD FOR STUDY SESSIONS
  const addStudySession = (session: Omit<StudySession, 'id' | 'date'> & { date?: string }) => {
    const id = `sess_${Date.now()}`;
    const todayStr = getLocalDateString();
    const newSession: StudySession = {
      ...session,
      id,
      date: session.date || todayStr
    };

    setData(prev => ({
      ...prev,
      studySessions: [newSession, ...prev.studySessions]
    }));

    // XP calculation: 1.5 XP per minute, multiplier for focus rating (1 to 1.5x)
    const multiplier = 1 + (session.focusRating - 1) * 0.125; // focus 5 = 1.5x, focus 1 = 1x
    const xpEarned = Math.round(session.duration * 1.5 * multiplier);
    addXP(xpEarned);
  };

  const updateStudySession = (session: StudySession) => {
    setData(prev => ({
      ...prev,
      studySessions: prev.studySessions.map(s => s.id === session.id ? session : s)
    }));
  };

  const deleteStudySession = (id: string) => {
    setData(prev => ({
      ...prev,
      studySessions: prev.studySessions.filter(s => s.id !== id)
    }));
  };

  // CRUD FOR TASKS
  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    const id = `task_${Date.now()}`;
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id, status: 'Pending' }]
    }));
    addXP(20);
  };

  const updateTask = (task: Task) => {
    const todayStr = getLocalDateString();
    setData(prev => {
      const existing = prev.tasks.find(t => t.id === task.id);
      if (existing && (existing.status === 'Incomplete' || (existing.deadline < todayStr && existing.status !== 'Completed'))) {
        return prev; // Frozen incomplete task cannot be modified
      }
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === task.id ? task : t)
      };
    });
  };

  const toggleTaskStatus = (id: string) => {
    const todayStr = getLocalDateString();
    setData(prev => {
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;
      if (task.status === 'Incomplete' || (task.deadline < todayStr && task.status !== 'Completed')) {
        return prev; // Frozen incomplete task cannot be toggled
      }
      const isCompleting = task.status === 'Pending';
      
      const nextState = {
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, status: isCompleting ? 'Completed' : 'Pending' as const } : t)
      };

      if (isCompleting) {
        setTimeout(() => addXP(50), 50); // 50 XP bonus for completing tasks
      }

      return nextState;
    });
  };

  const setTaskStatus = (id: string, status: 'Pending' | 'Completed' | 'Incomplete') => {
    const todayStr = getLocalDateString();
    setData(prev => {
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;
      if (task.status === 'Incomplete' || (task.deadline < todayStr && task.status !== 'Completed')) {
        return prev; // Frozen incomplete task status cannot be modified
      }
      const nextState = {
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
      };
      if (status === 'Completed') {
        setTimeout(() => addXP(50), 50);
      }
      return nextState;
    });
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  // CRUD FOR HABITS
  const addHabit = (name: string, type: 'Good' | 'Bad') => {
    const id = `habit_${Date.now()}`;
    const newHabit: Habit = {
      id,
      name,
      type,
      successDates: [],
      failureDates: [],
      skipDates: []
    };
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
    addXP(30);
  };

  const updateHabit = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, name } : h)
    }));
  };

  const deleteHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  };

  const toggleHabitDate = (id: string, date: string, status: 'success' | 'failure' | 'skip') => {
    setData(prev => {
      const habit = prev.habits.find(h => h.id === id);
      if (!habit) return prev;

      // Clean date from all list first
      const successDates = habit.successDates.filter(d => d !== date);
      const failureDates = habit.failureDates.filter(d => d !== date);
      const skipDates = habit.skipDates.filter(d => d !== date);

      // Determine if logging is NEW or a toggle
      const wasSuccess = habit.successDates.includes(date);
      const wasFailure = habit.failureDates.includes(date);
      const wasSkip = habit.skipDates.includes(date);

      let xpAmount = 0;

      // Toggle off if clicking the currently active status
      if ((status === 'success' && wasSuccess) || 
          (status === 'failure' && wasFailure) || 
          (status === 'skip' && wasSkip)) {
        // Just removed, do nothing else
      } else {
        // Add to new list
        if (status === 'success') {
          successDates.push(date);
          // Reward good habits or bad habits avoided
          xpAmount = habit.type === 'Good' ? 25 : 15;
        } else if (status === 'failure') {
          failureDates.push(date);
          // Negative reinforcement: no XP or slight reduction, let's keep XP the same but warn, or deduct a minor 5 XP
          xpAmount = -5;
        } else {
          skipDates.push(date);
        }
      }

      const nextState = {
        ...prev,
        habits: prev.habits.map(h => h.id === id ? {
          ...h,
          successDates,
          failureDates,
          skipDates
        } : h)
      };

      if (xpAmount !== 0) {
        setTimeout(() => addXP(xpAmount), 50);
      }

      return nextState;
    });
  };

  // POMODORO SESSION LOGGING
  const addPomodoroSession = (duration: number, mode: '25/5' | '50/10' | '90/20' | 'Custom') => {
    const id = `pomo_${Date.now()}`;
    const todayStr = getLocalDateString();
    const session: PomodoroSession = {
      id,
      date: todayStr,
      duration,
      mode
    };

    setData(prev => ({
      ...prev,
      pomodoroSessions: [session, ...prev.pomodoroSessions]
    }));

    // Reward Focus: 2 XP per focus minute
    addXP(duration * 2);
  };

  // CRUD FOR REVISIONS
  const addRevision = (revision: Omit<Revision, 'id'>) => {
    const id = `rev_${Date.now()}`;
    setData(prev => ({
      ...prev,
      revisions: [{ ...revision, id }, ...prev.revisions]
    }));
    addXP(60); // 60 XP for revision log
  };

  const updateRevision = (revision: Revision) => {
    setData(prev => ({
      ...prev,
      revisions: prev.revisions.map(r => r.id === revision.id ? revision : r)
    }));
  };

  const deleteRevision = (id: string) => {
    setData(prev => ({
      ...prev,
      revisions: prev.revisions.filter(r => r.id !== id)
    }));
  };

  // CRUD FOR MOCK TESTS
  const addMockTest = (test: Omit<MockTest, 'id'>) => {
    const id = `mock_${Date.now()}`;
    setData(prev => ({
      ...prev,
      mockTests: [{ ...test, id }, ...prev.mockTests]
    }));
    addXP(150); // 150 XP for performing a mock test!
  };

  const updateMockTest = (test: MockTest) => {
    setData(prev => ({
      ...prev,
      mockTests: prev.mockTests.map(m => m.id === test.id ? test : m)
    }));
  };

  const deleteMockTest = (id: string) => {
    setData(prev => ({
      ...prev,
      mockTests: prev.mockTests.filter(m => m.id !== id)
    }));
  };

  // ==================== FITNESS SYSTEM METHODS ====================

  const updateFitnessProfile = (profileUpdate: Partial<FitnessProfile>) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          profile: {
            ...currentFitness.profile,
            ...profileUpdate
          }
        }
      };
    });
  };

  const checkFitnessMilestones = (fitness: FitnessState) => {
    const updatedMilestones = fitness.milestones.map(m => {
      if (m.unlockedAt) return m; // Already unlocked

      let currentVal = m.currentValue;
      let shouldUnlock = false;

      if (m.category === 'weight') {
        const latestWeight = fitness.bodyMeasurements[0]?.weight || fitness.profile.startingWeight;
        currentVal = latestWeight;
        if (m.targetValue >= fitness.profile.startingWeight) {
          // Weight gain goal
          shouldUnlock = latestWeight >= m.targetValue;
        } else {
          // Weight loss goal
          shouldUnlock = latestWeight <= m.targetValue;
        }
      } else if (m.category === 'consistency') {
        const completedCount = fitness.workouts.filter(w => w.status === 'Completed').length;
        currentVal = completedCount;
        shouldUnlock = completedCount >= m.targetValue;
      } else if (m.category === 'strength') {
        if (m.id.includes('pushups')) {
          let maxPushups = 0;
          fitness.workouts.forEach(w => {
            w.exercises.forEach(e => {
              if (e.exerciseName.toLowerCase().includes('push-up') || e.exerciseName.toLowerCase().includes('pushup')) {
                e.sets.forEach(s => {
                  if (s.reps > maxPushups) maxPushups = s.reps;
                });
              }
            });
          });
          currentVal = maxPushups;
          shouldUnlock = maxPushups >= m.targetValue;
        } else if (m.id === 'str_first_db') {
          const hasDb = fitness.workouts.some(w => w.exercises.some(e => e.exerciseName.toLowerCase().includes('db') || e.exerciseName.toLowerCase().includes('dumbbell')));
          currentVal = hasDb ? 1 : 0;
          shouldUnlock = hasDb;
        } else if (m.id === 'str_first_pullup') {
          let maxPullups = 0;
          fitness.workouts.forEach(w => {
            w.exercises.forEach(e => {
              if (e.exerciseName.toLowerCase().includes('pull-up') || e.exerciseName.toLowerCase().includes('pullup')) {
                e.sets.forEach(s => {
                  if (s.reps > maxPullups) maxPullups = s.reps;
                });
              }
            });
          });
          currentVal = maxPullups;
          shouldUnlock = maxPullups >= m.targetValue;
        }
      }

      if (shouldUnlock) {
        setTimeout(() => {
          setAchievementNotification(`Unlocked Fitness Milestone: ${m.title}! 🎉`);
          addXP(100);
        }, 100);
        return {
          ...m,
          currentValue: currentVal,
          unlockedAt: getLocalDateString()
        };
      }

      return {
        ...m,
        currentValue: currentVal
      };
    });

    return updatedMilestones;
  };

  const addWorkout = (workoutData: Omit<Workout, 'id'>) => {
    const id = `w_${Date.now()}`;
    const newWorkout: Workout = { ...workoutData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const updatedWorkouts = [newWorkout, ...currentFitness.workouts];
      const newFitnessState: FitnessState = {
        ...currentFitness,
        workouts: updatedWorkouts
      };
      newFitnessState.milestones = checkFitnessMilestones(newFitnessState);

      return {
        ...prev,
        fitness: newFitnessState
      };
    });

    if (newWorkout.status === 'Completed') {
      addXP(50);
    }
  };

  const updateWorkout = (workout: Workout) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const updatedWorkouts = currentFitness.workouts.map(w => w.id === workout.id ? workout : w);
      const newFitnessState: FitnessState = {
        ...currentFitness,
        workouts: updatedWorkouts
      };
      newFitnessState.milestones = checkFitnessMilestones(newFitnessState);

      return {
        ...prev,
        fitness: newFitnessState
      };
    });
  };

  const deleteWorkout = (id: string) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          workouts: currentFitness.workouts.filter(w => w.id !== id)
        }
      };
    });
  };

  const addBodyMeasurement = (measurementData: Omit<BodyMeasurement, 'id'>) => {
    const id = `bm_${Date.now()}`;
    const newMeasurement: BodyMeasurement = { ...measurementData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      // Filter out existing record for same date if updating
      const filtered = currentFitness.bodyMeasurements.filter(m => m.date !== newMeasurement.date);
      const updated = [newMeasurement, ...filtered].sort((a, b) => b.date.localeCompare(a.date));

      const newFitnessState: FitnessState = {
        ...currentFitness,
        bodyMeasurements: updated
      };
      newFitnessState.milestones = checkFitnessMilestones(newFitnessState);

      return {
        ...prev,
        fitness: newFitnessState
      };
    });

    addXP(20);
  };

  const deleteBodyMeasurement = (id: string) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          bodyMeasurements: currentFitness.bodyMeasurements.filter(m => m.id !== id)
        }
      };
    });
  };

  const addProgressPhoto = (photoData: Omit<ProgressPhoto, 'id'>) => {
    const id = `photo_${Date.now()}`;
    const newPhoto: ProgressPhoto = { ...photoData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          progressPhotos: [newPhoto, ...currentFitness.progressPhotos]
        }
      };
    });

    addXP(30);
  };

  const deleteProgressPhoto = (id: string) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          progressPhotos: currentFitness.progressPhotos.filter(p => p.id !== id)
        }
      };
    });
  };

  const logNutrition = (nutritionData: Omit<NutritionEntry, 'id' | 'adherence'> & { adherence?: NutritionEntry['adherence'] }) => {
    const id = `nut_${Date.now()}`;
    
    // Auto calculate adherence if not explicitly passed
    let adherence: NutritionEntry['adherence'] = nutritionData.adherence || 'Hit target';
    if (!nutritionData.adherence) {
      const targetCals = data.fitness?.profile.calorieTarget || 2200;
      const targetProt = data.fitness?.profile.proteinTarget || 120;
      const calDiffPct = Math.abs(nutritionData.calories - targetCals) / targetCals;
      const protDiffPct = Math.abs(nutritionData.protein - targetProt) / targetProt;

      if (calDiffPct <= 0.12 && protDiffPct <= 0.15) {
        adherence = 'Hit target';
      } else if (calDiffPct <= 0.25 && protDiffPct <= 0.30) {
        adherence = 'Close';
      } else {
        adherence = 'Missed';
      }
    }

    const newEntry: NutritionEntry = { ...nutritionData, id, adherence };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const filtered = currentFitness.nutritionEntries.filter(n => n.date !== newEntry.date);
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          nutritionEntries: [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
        }
      };
    });

    addXP(15);
  };

  const logRecovery = (recoveryData: Omit<RecoveryEntry, 'id'>) => {
    const id = `rec_${Date.now()}`;
    const newEntry: RecoveryEntry = { ...recoveryData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const filtered = currentFitness.recoveryEntries.filter(r => r.date !== newEntry.date);
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          recoveryEntries: [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
        }
      };
    });

    addXP(15);
  };

  const logActivity = (activityData: Omit<ActivityEntry, 'id'>) => {
    const id = `act_${Date.now()}`;
    const newEntry: ActivityEntry = { ...activityData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const filtered = currentFitness.activityEntries.filter(a => a.date !== newEntry.date);
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          activityEntries: [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
        }
      };
    });

    addXP(15);
  };

  const addWeeklyCheckIn = (checkInData: Omit<WeeklyCheckIn, 'id'>) => {
    const id = `wci_${Date.now()}`;
    const newCheckIn: WeeklyCheckIn = { ...checkInData, id };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          weeklyCheckIns: [newCheckIn, ...currentFitness.weeklyCheckIns].sort((a, b) => b.date.localeCompare(a.date))
        }
      };
    });

    addXP(60);
  };

  const toggleFitnessHabitDate = (habitId: string, date: string) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      const habit = currentFitness.habits.find(h => h.id === habitId);
      if (!habit) return prev;

      const isCompleted = habit.successDates.includes(date);
      let successDates = [...habit.successDates];

      if (isCompleted) {
        successDates = successDates.filter(d => d !== date);
      } else {
        successDates.push(date);
      }

      return {
        ...prev,
        fitness: {
          ...currentFitness,
          habits: currentFitness.habits.map(h => h.id === habitId ? { ...h, successDates } : h)
        }
      };
    });

    addXP(10);
  };

  const addFitnessHabit = (name: string) => {
    const id = `fhabit_${Date.now()}`;
    const newHabit: FitnessHabit = {
      id,
      name,
      icon: 'Activity',
      successDates: [],
      skipDates: []
    };

    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          habits: [...currentFitness.habits, newHabit]
        }
      };
    });
  };

  const deleteFitnessHabit = (id: string) => {
    setData(prev => {
      const currentFitness = prev.fitness || DEFAULT_FITNESS_STATE;
      return {
        ...prev,
        fitness: {
          ...currentFitness,
          habits: currentFitness.habits.filter(h => h.id !== id)
        }
      };
    });
  };

  // SETTINGS
  const updateSettings = (settings: Partial<AppSettings>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
  };

  // DATA PERSISTENCE & BACKUPS (HIDDEN DATA MANAGEMENT)
  const resetAllData = (toBlank?: boolean) => {
    if (toBlank) {
      setData({
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
        habits: DEFAULT_HABITS_LIST.map((h, i) => ({
          id: `h_${i+1}`,
          name: h.name,
          type: h.type as 'Good' | 'Bad',
          successDates: [],
          failureDates: [],
          skipDates: []
        })),
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
        }
      });
    } else {
      setData(getInitialDefaultData());
    }
  };

  const importBackupData = (jsonString: string, mode: 'merge' | 'replace'): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic JSON validation checking if it has necessary attributes
      const hasArrays = Array.isArray(parsed.subjects) &&
                        Array.isArray(parsed.chapters) &&
                        Array.isArray(parsed.studySessions) &&
                        Array.isArray(parsed.tasks) &&
                        Array.isArray(parsed.habits) &&
                        Array.isArray(parsed.pomodoroSessions) &&
                        Array.isArray(parsed.revisions) &&
                        Array.isArray(parsed.mockTests);
                        
      if (!hasArrays) {
        return { success: false, error: 'Incompatible file schema. Must contain all tracking fields.' };
      }

      if (mode === 'replace') {
        setData(parsed);
      } else {
        // Merge mode: combine and deduplicate arrays by id
        setData(prev => {
          const mergeById = <T extends { id: string }>(arr1: T[], arr2: T[]): T[] => {
            const map = new Map<string, T>();
            arr1.forEach(item => map.set(item.id, item));
            arr2.forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          };

          return {
            subjects: mergeById(prev.subjects, parsed.subjects),
            chapters: mergeById(prev.chapters, parsed.chapters),
            studySessions: mergeById(prev.studySessions, parsed.studySessions),
            tasks: mergeById(prev.tasks, parsed.tasks),
            habits: mergeById(prev.habits, parsed.habits),
            pomodoroSessions: mergeById(prev.pomodoroSessions, parsed.pomodoroSessions),
            revisions: mergeById(prev.revisions, parsed.revisions),
            mockTests: mergeById(prev.mockTests, parsed.mockTests),
            gamification: {
              ...prev.gamification,
              xp: Math.max(prev.gamification.xp, parsed.gamification?.xp || 0),
              level: Math.max(prev.gamification.level, parsed.gamification?.level || 1),
              achievements: prev.gamification.achievements.map(ach => {
                const parsedAch = (parsed.gamification?.achievements || []).find((a: Achievement) => a.id === ach.id);
                return {
                  ...ach,
                  unlockedAt: ach.unlockedAt || parsedAch?.unlockedAt || null
                };
              })
            },
            settings: {
              ...prev.settings,
              ...(parsed.settings || {})
            }
          };
        });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Malformed JSON. Check the backup file integrity.' };
    }
  };

  return (
    <AppContext.Provider value={{
      data,
      addSubject, updateSubject, deleteSubject,
      addChapter, updateChapter, deleteChapter,
      addStudySession, updateStudySession, deleteStudySession,
      addTask, updateTask, toggleTaskStatus, setTaskStatus, deleteTask,
      toggleHabitDate, addHabit, updateHabit, deleteHabit,
      addPomodoroSession,
      addRevision, updateRevision, deleteRevision,
      addMockTest, updateMockTest, deleteMockTest,
      updateFitnessProfile, addWorkout, updateWorkout, deleteWorkout,
      addBodyMeasurement, deleteBodyMeasurement, addProgressPhoto, deleteProgressPhoto,
      logNutrition, logRecovery, logActivity, addWeeklyCheckIn,
      toggleFitnessHabitDate, addFitnessHabit, deleteFitnessHabit,
      updateSettings, resetAllData, importBackupData, addXP,
      todayDate,
      levelUpNotification, setLevelUpNotification,
      achievementNotification, setAchievementNotification,
      isOnboarded, completeOnboarding, resetToDemo
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
