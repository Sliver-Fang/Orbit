/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Timer, Plus, CheckSquare, Dumbbell, Award, Flame, 
  ChevronRight, ChevronDown, Calendar, AlertCircle, BookOpen, Clock, Smile, Trash2, Copy, X, Check,
  CheckCircle2, XCircle, Quote, Sparkles, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, StudySession, Habit, Subject } from '../types';
import { getLocalDateString, getTomorrowLocalDateString, getPastLocalDateString, addDaysToDateStr } from '../utils/dateUtils';
import { getDailyQuote } from '../utils/quotes';

interface DashboardProps {
  setActiveTab?: (tab: any) => void;
  setMoreSubTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setMoreSubTab }) => {
  const { data, addTask, addStudySession, toggleHabitDate, toggleTaskStatus, setTaskStatus, deleteStudySession, todayDate } = useApp();
  const { theme, accentColor } = data.settings;

  // Modals visibility state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);

  // Form states for Quick Task Add
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskDeadline, setTaskDeadline] = useState(getLocalDateString());
  const [isCustomTaskDate, setIsCustomTaskDate] = useState(false);
  const [isNamingQuickTask, setIsNamingQuickTask] = useState(false);

  // Form states for Quick Study Session Add
  const [sessSubject, setSessSubject] = useState('');
  const [sessChapter, setSessChapter] = useState('');
  const [sessTopic, setSessTopic] = useState('');
  const [sessDuration, setSessDuration] = useState(60);
  const [sessProductivity, setSessProductivity] = useState(4);
  const [sessFocus, setSessFocus] = useState(4);
  const [sessMood, setSessMood] = useState<'Happy' | 'Focused' | 'Tired' | 'Stressed' | 'Calm'>('Focused');
  const [sessDifficulty, setSessDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [sessNotes, setSessNotes] = useState('');

  // CALCULATE STATS FOR TODAY
  const todayStr = todayDate || getLocalDateString();
  const tomorrowStr = getTomorrowLocalDateString();

  const todaySessions = data.studySessions.filter(s => s.date === todayStr);
  const todayStudyHours = todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60;

  const todayPomodoros = data.pomodoroSessions.filter(p => p.date === todayStr).length;

  const todayTasks = data.tasks.filter(t => t.deadline === todayStr);
  const todayCompletedTasks = todayTasks.filter(t => t.status === 'Completed').length;
  const remainingTasksCount = data.tasks.filter(t => t.status === 'Pending').length;

  // OVERALL TASK STATS & DAILY QUOTE FOR HOME INDICATOR CARDS
  const totalCompletedTasksCount = data.tasks.filter(t => t.status === 'Completed').length;
  const totalIncompleteTasksCount = data.tasks.filter(t => t.status === 'Incomplete' || (t.deadline < todayStr && t.status === 'Pending')).length;
  const dailyQuote = getDailyQuote(todayStr);

  // Habit statistics
  const loggedHabitsCount = data.habits.filter(h => h.successDates.includes(todayStr) || h.failureDates.includes(todayStr)).length;
  const totalHabitsCount = data.habits.length;
  const habitSuccessCount = data.habits.filter(h => h.successDates.includes(todayStr)).length;
  const habitSuccessPct = totalHabitsCount > 0 ? Math.round((habitSuccessCount / totalHabitsCount) * 100) : 0;

  // Productivity Score Calculation (Simple algorithmic score 0-100 based on Study time, Pomodoros, Task Completion)
  const calculateProductivityScore = () => {
    let score = 0;
    // Study Hours (max 40 pts for 4 hours of study)
    score += Math.min(todayStudyHours * 10, 40);
    // Pomodoros (max 20 pts for 4 pomodoros)
    score += Math.min(todayPomodoros * 5, 20);
    // Task completion (max 30 pts for 3 completed tasks)
    score += Math.min(todayCompletedTasks * 10, 30);
    // Habit logging success (max 10 pts)
    score += Math.min((habitSuccessCount / Math.max(totalHabitsCount, 1)) * 10, 10);
    return Math.round(score);
  };
  const productivityScore = calculateProductivityScore();

  // STREAKS
  const currentStreak = data.gamification.dailyStreak;

  // RECENT ACTIVITIES (Last 3)
  const recentActivities: { type: 'study' | 'task' | 'test' | 'revision'; title: string; subtitle: string; time: string; color: string }[] = [];

  data.studySessions.slice(0, 2).forEach(s => {
    const subjName = data.subjects.find(sub => sub.id === s.subjectId)?.name || 'General';
    recentActivities.push({
      type: 'study',
      title: `Studied ${subjName}`,
      subtitle: `${s.topic} • ${s.duration} mins`,
      time: s.date === todayStr ? 'Today' : s.date,
      color: data.subjects.find(sub => sub.id === s.subjectId)?.color || '#3b82f6'
    });
  });

  data.tasks.filter(t => t.status === 'Completed').slice(0, 2).forEach(t => {
    const subjName = data.subjects.find(sub => sub.id === t.subjectId)?.name || '';
    recentActivities.push({
      type: 'task',
      title: `Completed: ${t.title}`,
      subtitle: subjName ? `Subject: ${subjName}` : 'General Task',
      time: t.deadline === todayStr ? 'Today' : t.deadline,
      color: '#10b981'
    });
  });

  data.mockTests.slice(0, 1).forEach(m => {
    const subjName = data.subjects.find(sub => sub.id === m.subjectId)?.name || 'General';
    recentActivities.push({
      type: 'test',
      title: `Mock Test: ${m.testName}`,
      subtitle: `Score: ${m.marksObtained}/${m.maxMarks} (${Math.round((m.marksObtained/m.maxMarks)*100)}%)`,
      time: m.date === todayStr ? 'Today' : m.date,
      color: '#eab308'
    });
  });

  // UPCOMING TASKS (Pending, ordered by deadline)
  const upcomingTasks = data.tasks
    .filter(t => t.status === 'Pending')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);

  // CHARTS GENERATION DATA
  // Chart 1: Today's study distribution by subject
  const subjectDistribution = data.subjects.map(subj => {
    const mins = todaySessions.filter(s => s.subjectId === subj.id).reduce((acc, s) => acc + s.duration, 0);
    return { name: subj.name, mins, color: subj.color };
  }).filter(item => item.mins > 0);

  // Chart 2: Last 7 Days study hours
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const dateStr = getPastLocalDateString(i);
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mins = data.studySessions.filter(s => s.date === dateStr).reduce((acc, s) => acc + s.duration, 0);
    return { dayName, hours: Number((mins / 60).toFixed(1)), dateStr };
  }).reverse();

  const handleQuickTaskAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTitle = taskTitle.trim();
    if (!finalTitle) {
      const selectedSubj = data.subjects.find(s => s.id === taskSubject);
      finalTitle = selectedSubj ? `Study ${selectedSubj.name}` : "General Study";
    }

    addTask({
      title: finalTitle,
      description: 'Quickly added task',
      deadline: taskDeadline || getLocalDateString(),
      reminder: false,
      subjectId: taskSubject,
      chapterId: '',
      estimatedTime: 30,
      priority: 'Medium'
    });

    setTaskTitle('');
    setIsNamingQuickTask(false);
    setShowTaskModal(false);
  };

  const handleQuickSessionAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessSubject) return;
    addStudySession({
      subjectId: sessSubject,
      chapterId: sessChapter,
      topic: sessTopic || 'General Study',
      duration: sessDuration,
      productivityRating: sessProductivity,
      focusRating: sessFocus,
      notes: sessNotes,
      mood: sessMood,
      difficulty: sessDifficulty
    });
    setSessTopic('');
    setSessNotes('');
    setShowSessionModal(false);
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div id="dashboard-tab" className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-6xl mx-auto flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
      
      {/* HEADER SECTION WITH USER MOTIVATION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Today's Focus</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1`}>
            {todayStudyHours > 2 ? '🔥 You are in deep focus mode today!' : '⚡ Ready to conquer your syllabus today?'}
          </p>
        </div>
        {/* GAMIFICATION CORNER */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
            <Flame className="w-6 h-6 fill-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Discipline Streak</p>
            <p className="text-lg font-extrabold">{currentStreak} Days</p>
          </div>
        </div>
      </header>

      {/* QUICK INSIGHT GRID - HOME INDICATOR CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL COMPLETED TASKS */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">Completed Tasks</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-emerald-400">{totalCompletedTasksCount} <span className="text-xs font-medium text-slate-400">Total</span></h3>
          <p className="text-xs text-slate-400 mt-1">Total finished tasks</p>
        </div>

        {/* CARD 2: TOTAL INCOMPLETE TASKS */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">Incompleted Tasks</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-rose-400">{totalIncompleteTasksCount} <span className="text-xs font-medium text-slate-400">Total</span></h3>
          <p className="text-xs text-slate-400 mt-1">Auto-marked past 00:00 AM</p>
        </div>

        {/* CARD 3: DAILY MOTIVATIONAL QUOTE */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <Quote className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">Daily Quote</span>
          </div>
          <p className="text-xs font-semibold italic text-slate-200 line-clamp-2 my-0.5" title={`"${dailyQuote.text}" — ${dailyQuote.author}`}>
            "{dailyQuote.text}"
          </p>
          <p className="text-[10px] font-bold text-amber-400 text-right">— {dailyQuote.author}</p>
        </div>

        {/* CARD 4: DAILY STREAK FEATURE */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <Flame className="w-5 h-5 fill-orange-400/20" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-80">Daily Streak</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-orange-400">{currentStreak} <span className="text-sm font-medium text-slate-400">Days</span></h3>
          <p className="text-xs text-slate-400 mt-1">Study discipline streak</p>
        </div>
      </section>

      {/* QUICK ACTION CONTROLS */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Quick Action Circle Button (matching the left circle button from the image) */}
          <button
            id="qa-quick-play-circle"
            onClick={() => setActiveTab?.('study')}
            title="Start Quick Study Session"
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-800' : 'liquid-glass-btn text-white'
            }`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>

          {/* Quick Action Pills (matching the right pill button from the image) */}
          <button 
            id="qa-start-study"
            onClick={() => setActiveTab?.('study')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm tracking-wide cursor-pointer transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-900' : 'liquid-glass-btn text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Study</span>
          </button>

          <button 
            id="qa-start-pomodoro"
            onClick={() => setActiveTab?.('study')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm tracking-wide cursor-pointer transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-900' : 'liquid-glass-btn text-white'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Pomodoro</span>
          </button>

          <button 
            id="qa-add-task"
            onClick={() => {
              setIsCustomTaskDate(false);
              setTaskDeadline(todayStr);
              setShowTaskModal(true);
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm tracking-wide cursor-pointer transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-900' : 'liquid-glass-btn text-white'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>

          <button 
            id="qa-add-session"
            onClick={() => setShowSessionModal(true)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm tracking-wide cursor-pointer transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-900' : 'liquid-glass-btn text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Log Study</span>
          </button>

          <button 
            id="qa-add-habit"
            onClick={() => {
              if (setMoreSubTab) {
                setMoreSubTab('habits');
                setActiveTab?.('more');
              } else {
                setShowHabitModal(true);
              }
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm tracking-wide cursor-pointer transition-all ${
              theme === 'light' ? 'liquid-glass-btn-light text-slate-900' : 'liquid-glass-btn text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Habit Log</span>
          </button>

        </div>
      </section>

      {/* TWO CHARTS OF DAILY & WEEKLY PROGRESS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: DAILY PROGRESS (Subject breakdown today) */}
        <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <h4 className="font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Subject Study Share (Today)</span>
          </h4>
          
          {subjectDistribution.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
              <BookOpen className="w-8 h-8 opacity-45 mb-2 text-slate-400" />
              <p>No study sessions logged today yet.</p>
              <button onClick={() => setShowSessionModal(true)} className="text-blue-400 font-bold mt-1 hover:underline">Log a session</button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:h-48 h-auto py-2">
              {/* Pie/Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke={theme === 'light' ? '#f1f5f9' : '#1e2d54'} strokeWidth="12" />
                  {(() => {
                    let cumulativePct = 0;
                    const totalMins = subjectDistribution.reduce((acc, cur) => acc + cur.mins, 0);
                    return subjectDistribution.map((item, idx) => {
                      const pct = (item.mins / totalMins) * 100;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = -cumulativePct;
                      cumulativePct += pct;
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-500 ease-out hover:stroke-[14]"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center text */}
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-slate-400">Total</span>
                  <span className="text-lg font-extrabold leading-none">
                    {Math.round(subjectDistribution.reduce((acc, cur) => acc + cur.mins, 0))}
                  </span>
                  <span className="text-[10px] text-slate-400">mins</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 space-y-2 max-h-40 overflow-y-auto w-full pr-1">
                {(() => {
                  const totalMins = subjectDistribution.reduce((acc, cur) => acc + cur.mins, 0);
                  return subjectDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {item.mins}m ({Math.round((item.mins / totalMins) * 100)}%)
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* CHART 2: WEEKLY PROGRESS (Last 7 days of hours) */}
        <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <h4 className="font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Weekly Study Trend (Hours)</span>
          </h4>

          {/* Simple custom SVG bar chart */}
          <div className="h-48 flex items-end justify-between gap-1 pt-4 px-2">
            {last7DaysData.map((day, idx) => {
              // Find max hours in the week to scale
              const maxHours = Math.max(...last7DaysData.map(d => d.hours), 4); // default base ceiling of 4 hours
              const pctHeight = Math.min((day.hours / maxHours) * 100, 100);
              const isToday = day.dateStr === todayStr;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-[calc(100%-8px)] bg-slate-950 text-white font-mono text-[10px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-20 shadow border border-slate-800 whitespace-nowrap">
                    {day.hours} Hrs
                  </div>

                  {/* The bar */}
                  <div 
                    className="w-full max-w-[28px] rounded-t-lg transition-all duration-500 ease-out relative cursor-pointer"
                    style={{ 
                      height: `${pctHeight}%`, 
                      backgroundColor: isToday ? accentColor : (theme === 'light' ? '#cbd5e1' : '#1e2d54'),
                      opacity: pctHeight === 0 ? 0.2 : 1
                    }}
                  >
                    {/* Active pulse for today's active bar */}
                    {isToday && day.hours > 0 && (
                      <div className="absolute inset-0 bg-white/20 rounded-t-lg animate-ping pointer-events-none" />
                    )}
                  </div>

                  {/* Day label */}
                  <span className={`text-[10px] mt-2 font-bold font-mono tracking-wider ${isToday ? 'text-blue-400 font-extrabold' : 'text-slate-400'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ADVANCED ANALYTICS ENTRY */}
      <div className="flex justify-center pt-2">
        <button 
          id="btn-more-analytics"
          onClick={() => setActiveTab?.('analytics')}
          className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition group cursor-pointer"
        >
          <span>More Analytics</span>
          <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
        </button>
      </div>

      {/* RECENT ACTIVITY & UPCOMING TASKS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY */}
        <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <h4 className="font-bold text-base mb-4">Recent Activities</h4>
          
          {recentActivities.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <AlertCircle className="w-6 h-6 text-slate-400 mb-1.5" />
              <p>No recent logged study sessions or completed tasks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3 border-slate-800 last:border-0 last:pb-0" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: act.color }} />
                    <div>
                      <p className="text-xs font-bold truncate max-w-[180px] md:max-w-[220px]">{act.title}</p>
                      <p className="text-[10px] text-slate-400">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-800/40 px-2 py-0.5 rounded" style={{ color: theme === 'light' ? '#64748b' : undefined, backgroundColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING PENDING TASKS */}
        <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base">Upcoming Tasks</h4>
            <button onClick={() => setActiveTab?.('tasks')} className="text-xs text-blue-400 hover:underline font-bold">View all</button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <CheckSquare className="w-6 h-6 text-slate-400 mb-1.5 opacity-50" />
              <p>Hooray! No pending tasks remaining.</p>
              <button onClick={() => setShowTaskModal(true)} className="text-blue-400 font-bold mt-1 hover:underline">Add a new task</button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((t, idx) => {
                const isIncomplete = t.status === 'Incomplete' || (t.deadline < todayStr && t.status !== 'Completed');
                const isOverdue = t.deadline < todayStr && t.status === 'Pending';
                return (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between gap-2 overflow-hidden ${
                    theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/30 border-slate-800'
                  }`}>
                    <div className="min-w-0 flex-1">
                      <h5 className={`text-xs font-bold truncate max-w-full ${isIncomplete ? 'line-through text-red-400' : ''}`}>
                        {t.title}
                        {isIncomplete && <span className="ml-1.5 text-[9px] bg-red-500/20 text-red-400 px-1 py-0.2 rounded font-extrabold uppercase">Incomplete</span>}
                      </h5>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          t.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          t.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={isIncomplete || isOverdue ? 'text-red-400 font-semibold' : ''}>{t.deadline} {(isIncomplete || isOverdue) && '(Overdue)'}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <button
                        onClick={() => {
                          addTask({
                            title: t.title,
                            description: t.description,
                            deadline: todayStr,
                            reminder: t.reminder,
                            subjectId: t.subjectId,
                            chapterId: t.chapterId,
                            estimatedTime: t.estimatedTime,
                            priority: t.priority
                          });
                          alert(`Copied "${t.title}" for today (${todayStr})!`);
                        }}
                        title="Copy task for today"
                        className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md transition text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Today</span>
                      </button>

                      <button
                        onClick={() => {
                          addTask({
                            title: t.title,
                            description: t.description,
                            deadline: tomorrowStr,
                            reminder: t.reminder,
                            subjectId: t.subjectId,
                            chapterId: t.chapterId,
                            estimatedTime: t.estimatedTime,
                            priority: t.priority
                          });
                          alert(`Copied "${t.title}" for tomorrow (${tomorrowStr})!`);
                        }}
                        title="Copy task for tomorrow"
                        className="p-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md transition text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Tomorrow</span>
                      </button>
                      
                      {isIncomplete ? (
                        <div 
                          title="Task is frozen & incomplete (past 00:00 AM deadline)" 
                          className="w-5 h-5 rounded border border-red-500/50 bg-red-500/10 flex items-center justify-center text-red-400 cursor-not-allowed"
                        >
                          <Lock className="w-3 h-3" />
                        </div>
                      ) : (
                        <button 
                          id={`btn-complete-task-${t.id}`}
                          onClick={() => setTaskStatus(t.id, 'Completed')}
                          title="Mark as Completed"
                          className="w-5 h-5 rounded border border-green-500/50 hover:bg-green-500/10 transition flex items-center justify-center text-green-400 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TODAY'S LOGGED STUDY SESSIONS (REMOVE IF ADDED BY FAULT) */}
        <div className={`p-5 rounded-2xl border col-span-1 md:col-span-2 ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Today's Tracked Study Time Log</span>
              </h4>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-0.5`}>
                Logged study sessions for today. Click the trash icon to remove any study time if added by fault.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg shrink-0 w-fit">
              {todaySessions.length} session(s) today
            </span>
          </div>

          {todaySessions.length === 0 ? (
            <div className={`p-4 text-center text-xs ${isDark ? 'text-slate-500 bg-slate-900/20 border-slate-800/50' : 'text-slate-500 bg-slate-50 border-slate-200'} rounded-xl border`}>
              No study sessions logged for today yet. Use "Start Study" or "Log Study" above to track hours.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {todaySessions.map((sess) => {
                const subj = data.subjects.find(s => s.id === sess.subjectId);
                return (
                  <div key={sess.id} className="p-3 rounded-xl border bg-slate-900/30 border-slate-800/80 flex items-center justify-between gap-2" style={{ backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subj?.color || '#3b82f6' }} />
                        <span className="text-xs font-bold truncate">{subj?.name || 'General Study'}</span>
                      </div>
                      <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">⏱️ {sess.duration} mins ({sess.topic || 'Practice'})</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this study session? This will subtract the time from your total study hours.')) {
                          deleteStudySession(sess.id);
                        }
                      }}
                      title="Remove study time added by fault"
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition active:scale-95 cursor-pointer shrink-0 flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </section>

      {/* QUICK ADD MODAL: TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <h4 className="text-lg font-bold mb-4">Add Task Quick</h4>
            <form onSubmit={handleQuickTaskAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Subject</label>
                <select 
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="">No Subject (General)</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* DUE DATE SELECTOR */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Due Date</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskDeadline(todayStr);
                      setIsCustomTaskDate(false);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      !isCustomTaskDate && taskDeadline === todayStr
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                        : isDark
                          ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskDeadline(tomorrowStr);
                      setIsCustomTaskDate(false);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      !isCustomTaskDate && taskDeadline === tomorrowStr
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                        : isDark
                          ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTaskDate(true);
                      if (taskDeadline === todayStr || taskDeadline === tomorrowStr) {
                        setTaskDeadline(addDaysToDateStr(todayStr, 2));
                      }
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCustomTaskDate || (taskDeadline !== todayStr && taskDeadline !== tomorrowStr)
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                        : isDark
                          ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Custom Date
                  </button>
                </div>

                {/* Show custom date picker input if Custom Date is selected */}
                {(isCustomTaskDate || (taskDeadline !== todayStr && taskDeadline !== tomorrowStr)) && (
                  <input 
                    type="date" 
                    required
                    value={taskDeadline}
                    onChange={(e) => {
                      setTaskDeadline(e.target.value);
                      setIsCustomTaskDate(true);
                    }}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ 
                      color: theme === 'light' ? '#1e293b' : undefined, 
                      backgroundColor: theme === 'light' ? '#f8fafc' : undefined, 
                      borderColor: theme === 'light' ? '#cbd5e1' : undefined 
                    }}
                  />
                )}
              </div>

              {/* COLLAPSIBLE ACCORDION FOR QUICK TASK NAME */}
              <div className="border border-slate-800/80 rounded-xl overflow-hidden" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                <button
                  type="button"
                  onClick={() => setIsNamingQuickTask(!isNamingQuickTask)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition bg-slate-900/10 hover:bg-slate-900/20"
                  style={{ color: theme === 'light' ? '#475569' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined }}
                >
                  <span className="flex items-center gap-1.5">
                    📝 Name the task <span className="text-[10px] opacity-75 font-normal">(Optional)</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isNamingQuickTask ? 'rotate-180' : ''}`} />
                </button>
                
                {isNamingQuickTask && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/5" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Task Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Study algebra formulas" 
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowTaskModal(false);
                    setTaskTitle('');
                    setIsNamingQuickTask(false);
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-slate-800 text-slate-400 hover:text-white"
                  style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL: STUDY SESSION HISTORIC LOG */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <h4 className="text-lg font-bold mb-4">Log Completed Study Session</h4>
            
            {data.subjects.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-400">You must create at least one Subject in the More page first.</p>
                <button 
                  type="button"
                  onClick={() => {
                    setShowSessionModal(false);
                    setActiveTab?.('more');
                    if (setMoreSubTab) setMoreSubTab('subjects');
                  }}
                  className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Go to Subjects
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickSessionAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Subject *</label>
                  <select 
                    required
                    value={sessSubject}
                    onChange={(e) => {
                      setSessSubject(e.target.value);
                      // Reset chapter selection
                      setSessChapter('');
                    }}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    <option value="">Select Subject</option>
                    {data.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Chapter</label>
                    <select 
                      value={sessChapter}
                      onChange={(e) => setSessChapter(e.target.value)}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="">No Chapter</option>
                      {data.chapters.filter(c => c.subjectId === sessSubject).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Duration (Mins) *</label>
                    <input 
                      type="number" 
                      required
                      min="5" 
                      max="480"
                      value={sessDuration}
                      onChange={(e) => setSessDuration(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Topic Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Practiced algebraic proofs"
                    value={sessTopic}
                    onChange={(e) => setSessTopic(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Productivity Rating (1-5)</label>
                    <select 
                      value={sessProductivity}
                      onChange={(e) => setSessProductivity(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="1">1 - Extremely low</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Normal</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Pure flow state</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Focus Rating (1-5)</label>
                    <select 
                      value={sessFocus}
                      onChange={(e) => setSessFocus(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="1">1 - Distracted</option>
                      <option value="2">2 - Multi-tasking</option>
                      <option value="3">3 - Normal focus</option>
                      <option value="4">4 - High concentration</option>
                      <option value="5">5 - Zero distractions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Study Mood</label>
                    <select 
                      value={sessMood}
                      onChange={(e) => setSessMood(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="Happy">Happy</option>
                      <option value="Focused">Focused</option>
                      <option value="Tired">Tired</option>
                      <option value="Stressed">Stressed</option>
                      <option value="Calm">Calm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Difficulty</label>
                    <select 
                      value={sessDifficulty}
                      onChange={(e) => setSessDifficulty(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowSessionModal(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold border border-slate-800 text-slate-400 hover:text-white"
                    style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Log Session
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUICK HABIT MODAL FOR OFF-SCREEN COMPONENT */}
      {showHabitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">Fast Habit Logger</h4>
              <button onClick={() => setShowHabitModal(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4">Track your habits directly for today ({todayStr}). Green checkmark represents success/avoidance of bad habit, red cross represents trigger/failure.</p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
              {data.habits.map(habit => {
                const wasSuccess = habit.successDates.includes(todayStr);
                const wasFailure = habit.failureDates.includes(todayStr);
                return (
                  <div key={habit.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/30 border border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    <div>
                      <span className="text-xs font-bold block">{habit.name}</span>
                      <span className={`text-[10px] ${habit.type === 'Good' ? 'text-green-400' : 'text-red-400'}`}>{habit.type} Habit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => toggleHabitDate(habit.id, todayStr, 'success')}
                        className={`px-3 py-1 text-xs rounded-lg font-semibold border ${
                          wasSuccess ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {habit.type === 'Good' ? 'Done' : 'Controlled'}
                      </button>
                      <button 
                        onClick={() => toggleHabitDate(habit.id, todayStr, 'failure')}
                        className={`px-3 py-1 text-xs rounded-lg font-semibold border ${
                          wasFailure ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {habit.type === 'Good' ? 'Missed' : 'Triggered'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowHabitModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
