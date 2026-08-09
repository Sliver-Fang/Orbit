/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart, LineChart, TrendingUp, Calendar, Zap, AlertTriangle, 
  Sparkles, ShieldCheck, HelpCircle, ArrowRightLeft, BookOpen, Clock,
  Plus, CheckCircle, Flame, Star, Smile, ChevronRight, Activity, Trash, CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateLocalInsights } from '../utils/localInsights';
import { StudyMood, DifficultyLevel } from '../types';
import { getLocalDateString, getPastLocalDateString, parseLocalDate } from '../utils/dateUtils';

export const AdvancedAnalytics: React.FC = () => {
  const { data, addStudySession, deleteStudySession, todayDate } = useApp();
  const { theme, accentColor } = data.settings;
  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  // System local anchor today
  const todayStr = todayDate || getLocalDateString();

  // State
  const [activeSegment, setActiveSegment] = useState<'metrics' | 'habits-vs-tasks'>('metrics');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [monthViewMode, setMonthViewMode] = useState<'summary' | 'detailed'>('summary');
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string>(todayStr);
  const [logDate, setLogDate] = useState<string>(todayStr);

  // Manual interactive questionnaire state
  const [manualDuration, setManualDuration] = useState<string>('60');
  const [selectedSubject, setSelectedSubject] = useState<string>(data.subjects[0]?.id || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('Self Practice & Review');
  const [studyMood, setStudyMood] = useState<StudyMood>('Focused');
  const [studyDiff, setStudyDiff] = useState<DifficultyLevel>('Medium');
  const [focusRating, setFocusRating] = useState<number>(4);
  const [prodRating, setProdRating] = useState<number>(4);
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);

  // Quick helper to determine if date is in range
  const getPastDateString = (daysAgo: number): string => {
    return getPastLocalDateString(daysAgo, parseLocalDate(todayStr));
  };

  // -------------------------------------------------------------
  // TIMEFRAME FILTER DEFINITIONS
  // -------------------------------------------------------------
  const isInSelectedTimeframe = (dateStr: string): boolean => {
    if (timeframe === 'today') {
      return dateStr === todayStr;
    }
    if (timeframe === 'week') {
      const start = getPastLocalDateString(6, parseLocalDate(todayStr));
      return dateStr >= start && dateStr <= todayStr;
    }
    if (timeframe === 'month') {
      const start = getPastLocalDateString(29, parseLocalDate(todayStr));
      return dateStr >= start && dateStr <= todayStr;
    }
    if (timeframe === 'year') {
      const start = getPastLocalDateString(364, parseLocalDate(todayStr));
      return dateStr >= start && dateStr <= todayStr;
    }
    return true;
  };

  // Filter core datasets based on selected timeframe
  const filteredSessions = data.studySessions.filter(s => isInSelectedTimeframe(s.date));
  const filteredTasks = data.tasks.filter(t => isInSelectedTimeframe(t.deadline));

  const totalHours = filteredSessions.reduce((acc, s) => acc + s.duration, 0) / 60;
  const tasksCompleted = filteredTasks.filter(t => t.status === 'Completed').length;
  const tasksIncomplete = filteredTasks.filter(t => t.status === 'Incomplete' || (t.deadline < todayStr && t.status === 'Pending')).length;
  const totalTasksCount = filteredTasks.length;
  const resolvedTasksCount = tasksCompleted + tasksIncomplete;
  const taskCompletionPct = resolvedTasksCount > 0 ? Math.round((tasksCompleted / resolvedTasksCount) * 100) : (totalTasksCount > 0 ? 0 : 100);
  const totalRevisions = data.revisions.filter(r => isInSelectedTimeframe(r.date)).length;
  const totalMockTests = data.mockTests.filter(m => isInSelectedTimeframe(m.date)).length;

  const calculateAvgProductivity = () => {
    if (filteredSessions.length === 0) return 0;
    const sum = filteredSessions.reduce((acc, s) => acc + s.productivityRating, 0);
    return Number((sum / filteredSessions.length).toFixed(1));
  };

  const calculateAvgFocus = () => {
    if (filteredSessions.length === 0) return 0;
    const sum = filteredSessions.reduce((acc, s) => acc + s.focusRating, 0);
    return Number((sum / filteredSessions.length).toFixed(1));
  };

  const calculateAvgSession = () => {
    if (filteredSessions.length === 0) return 0;
    const sum = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
    return Math.round(sum / filteredSessions.length);
  };

  // Find most studied subject
  const getMostStudiedSubjectName = () => {
    if (filteredSessions.length === 0) return 'None';
    const counts: Record<string, number> = {};
    filteredSessions.forEach(s => {
      counts[s.subjectId] = (counts[s.subjectId] || 0) + s.duration;
    });
    let maxId = '';
    let maxVal = 0;
    Object.entries(counts).forEach(([id, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxId = id;
      }
    });
    return data.subjects.find(s => s.id === maxId)?.name || 'General';
  };

  // Find most triggered bad habit
  const getMostMissedHabitName = () => {
    const badHabits = data.habits.filter(h => h.type === 'Bad');
    if (badHabits.length === 0) return 'None';
    let maxHabit = 'None';
    let maxFailures = 0;
    badHabits.forEach(h => {
      const fails = h.failureDates.filter(d => isInSelectedTimeframe(d)).length;
      if (fails > maxFailures) {
        maxFailures = fails;
        maxHabit = h.name;
      }
    });
    return maxFailures > 0 ? maxHabit : 'None';
  };

  // -------------------------------------------------------------
  // DYNAMIC CHART DATA GENERATION
  // -------------------------------------------------------------

  // 1. TODAY'S HOURLY BREAKDOWN
  const getHourlyBreakdownToday = () => {
    // 6 blocks of 4 hours
    const blocks = [
      { label: '12am-4am', startHour: 0, endHour: 4, mins: 0 },
      { label: '4am-8am', startHour: 4, endHour: 8, mins: 0 },
      { label: '8am-12pm', startHour: 8, endHour: 12, mins: 0 },
      { label: '12pm-4pm', startHour: 12, endHour: 16, mins: 0 },
      { label: '4pm-8pm', startHour: 16, endHour: 20, mins: 0 },
      { label: '8pm-12am', startHour: 20, endHour: 24, mins: 0 },
    ];

    // Filter today's study sessions
    const todaySessions = data.studySessions.filter(s => s.date === todayStr);
    
    todaySessions.forEach(s => {
      // Since studySessions don't have a strict start time field, we map them based on studySession ID hash or distribute evenly to show realistic active intervals
      const sessionHash = parseInt(s.id.replace(/\D/g, '').substring(4, 8) || '12') % 24;
      let matchedBlockIdx = blocks.findIndex(b => sessionHash >= b.startHour && sessionHash < b.endHour);
      if (matchedBlockIdx === -1) matchedBlockIdx = 4; // default to evening block
      blocks[matchedBlockIdx].mins += s.duration;
    });

    return blocks;
  };

  // 2. DAY OF WEEK (WEEK timeframe)
  const getDayOfWeekData = () => {
    const daysOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const last7DaysList = Array.from({ length: 7 }).map((_, i) => getPastDateString(i));

    data.studySessions.forEach(s => {
      if (last7DaysList.includes(s.date)) {
        const d = new Date(s.date);
        counts[d.getDay()] += s.duration / 60;
      }
    });

    return daysOfWeekNames.map((name, idx) => ({
      label: name,
      hours: counts[idx]
    }));
  };

  // 3. MONTH TREND (MONTH timeframe - last 30 days)
  const getMonthTrendData = () => {
    // Let's create 10 points (groups of 3 days each)
    const points = [];
    for (let i = 9; i >= 0; i--) {
      const daysAgoStart = i * 3 + 2;
      const daysAgoEnd = i * 3;
      const dateLabel = new Date(getPastDateString(daysAgoEnd)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let totalMins = 0;
      for (let d = daysAgoEnd; d <= daysAgoStart; d++) {
        const dateStr = getPastDateString(d);
        totalMins += data.studySessions.filter(s => s.date === dateStr).reduce((acc, s) => acc + s.duration, 0);
      }

      points.push({
        label: dateLabel,
        hours: totalMins / 60
      });
    }
    return points;
  };

  // 3.5 MONTH DETAILED DAILY DATA (Last 30 days individual)
  const getMonthDetailedData = () => {
    const points = [];
    for (let i = 29; i >= 0; i--) {
      const dateStr = getPastDateString(i);
      const sessions = data.studySessions.filter(s => s.date === dateStr);
      const tasks = data.tasks.filter(t => t.deadline === dateStr && t.status === 'Completed');
      const totalMins = sessions.reduce((acc, s) => acc + s.duration, 0);
      points.push({
        date: dateStr,
        mins: totalMins,
        tasksDone: tasks.length,
        sessions
      });
    }
    return points;
  };

  // 4. WHOLE YEAR CHART (July 2026 - July 2027)
  const getYearTrendData = () => {
    const months = [
      { label: 'Jul 26', start: '2026-07-21', end: '2026-07-31' },
      { label: 'Aug 26', start: '2026-08-01', end: '2026-08-31' },
      { label: 'Sep 26', start: '2026-09-01', end: '2026-09-30' },
      { label: 'Oct 26', start: '2026-10-01', end: '2026-10-31' },
      { label: 'Nov 26', start: '2026-11-01', end: '2026-11-30' },
      { label: 'Dec 26', start: '2026-12-01', end: '2026-12-31' },
      { label: 'Jan 27', start: '2027-01-01', end: '2027-01-31' },
      { label: 'Feb 27', start: '2027-02-01', end: '2027-02-28' },
      { label: 'Mar 27', start: '2027-03-01', end: '2027-03-31' },
      { label: 'Apr 27', start: '2027-04-01', end: '2027-04-30' },
      { label: 'May 27', start: '2027-05-01', end: '2027-05-31' },
      { label: 'Jun 27', start: '2027-06-01', end: '2027-06-30' },
      { label: 'Jul 27', start: '2027-07-01', end: '2027-07-21' }
    ];

    return months.map(m => {
      const sessions = data.studySessions.filter(s => s.date >= m.start && s.date <= m.end);
      const tasks = data.tasks.filter(t => t.deadline >= m.start && t.deadline <= m.end);
      
      const studyHrs = sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;

      return {
        label: m.label,
        studyHours: studyHrs,
        completedTasks: completedTasks
      };
    });
  };

  // -------------------------------------------------------------
  // MANUALLY RECORD STUDY SESSION ACTION
  // -------------------------------------------------------------
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMins = parseInt(manualDuration) || 0;
    if (durationMins <= 0) return;

    // Retrieve active subject info
    const subId = selectedSubject || (data.subjects[0]?.id || '');
    const chapId = selectedChapter || '';

    addStudySession({
      subjectId: subId,
      chapterId: chapId,
      topic: customTopic || 'Custom Revision',
      duration: durationMins,
      productivityRating: prodRating,
      focusRating: focusRating,
      mood: studyMood,
      difficulty: studyDiff,
      notes: 'Logged manually via the interactive Analytics questionnaire.',
      date: logDate // recorded for the selected logDate
    });

    setShowLogSuccess(true);
    setTimeout(() => {
      setShowLogSuccess(false);
    }, 4000);

    // Reset simple parts of state
    setCustomTopic('Self Practice & Review');
  };

  // Find relevant chapters based on subject
  const subjectChapters = data.chapters.filter(c => c.subjectId === (selectedSubject || data.subjects[0]?.id));

  // Determine bad habit logs
  const last7Days = Array.from({ length: 7 }).map((_, i) => getPastDateString(i));
  let badHabitsTriggered = 0;
  let badHabitsAvoided = 0;
  data.habits.forEach(h => {
    if (h.type === 'Bad') {
      badHabitsTriggered += h.failureDates.filter(d => isInSelectedTimeframe(d)).length;
      badHabitsAvoided += h.successDates.filter(d => isInSelectedTimeframe(d)).length;
    }
  });
  const totalBadHabitLogs = badHabitsTriggered + badHabitsAvoided;
  const habitAvoidancePct = totalBadHabitLogs > 0 ? Math.round((badHabitsAvoided / totalBadHabitLogs) * 100) : 100;

  // Local AI Advisor Insights
  const localInsights = generateLocalInsights(data);

  return (
    <div id="analytics-tab" className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
      
      {/* SECTION HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Academic Analytics</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-1`}>
            Unlock deep academic trends, habit triggers, study efficiency, and historical patterns.
          </p>
        </div>

        {/* METRICS VS TASK CORRELATION SEGMENT */}
        <div className={`flex p-1 rounded-xl border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
          <button 
            id="tab-segment-metrics"
            onClick={() => setActiveSegment('metrics')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSegment === 'metrics' 
                ? (theme === 'light' ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white')
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart className="w-3.5 h-3.5" />
            <span>Core Statistics</span>
          </button>
          <button 
            id="tab-segment-habits"
            onClick={() => setActiveSegment('habits-vs-tasks')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSegment === 'habits-vs-tasks' 
                ? (theme === 'light' ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white')
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Task vs Bad Habits</span>
          </button>
        </div>
      </header>

      {/* =============================================================
          1. INTERACTIVE QUESTIONNAIRE: HOW MUCH DID YOU STUDY TODAY?
          ============================================================= */}
      <section className={`p-5 rounded-2xl border ${
        theme === 'light' 
          ? 'bg-blue-50/60 border-blue-100 shadow-sm' 
          : 'bg-gradient-to-br from-blue-950/20 via-slate-900/30 to-blue-900/10 border-blue-900/30'
      }`}>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-extrabold text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>How much did you study on {logDate === todayStr ? 'Today' : logDate}? 📚</span>
            </h3>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-xs leading-relaxed max-w-xl`}>
              Log your custom study hours directly! Select a date, tell us how long you studied, and provide your focus level. We will instantly update all trends, heatmaps, and stats.
            </p>

            {showLogSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Study session on {logDate} logged successfully! All charts have been updated instantly.</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {/* LOG DATE SELECT */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Log Date</label>
                <input 
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  min="2026-07-21"
                  max="2027-07-21"
                  required
                  className={`w-full text-xs font-bold p-2 rounded-lg border ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>

              {/* SUBJECT SELECT */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Subject</label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    // Reset chapter
                    const subChaps = data.chapters.filter(c => c.subjectId === e.target.value);
                    setSelectedChapter(subChaps[0]?.id || '');
                  }}
                  className={`w-full text-xs font-semibold p-2 rounded-lg border ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  {data.subjects.length > 0 ? (
                    data.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  ) : (
                    <option value="">General Study</option>
                  )}
                </select>
              </div>

              {/* CHAPTER SELECT */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Chapter/Topic</label>
                {subjectChapters.length > 0 ? (
                  <select 
                    value={selectedChapter} 
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className={`w-full text-xs font-semibold p-2 rounded-lg border ${
                      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="">-- No Specific Chapter --</option>
                    {subjectChapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="E.g. Self Revision"
                    className={`w-full text-xs font-semibold p-2 rounded-lg border ${
                      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* STUDY DURATION INPUT */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Minutes Studied</label>
                <input 
                  type="number" 
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="Minutes studied"
                  min="1"
                  max="1440"
                  required
                  className={`w-full text-xs font-extrabold p-2 rounded-lg border ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>

              {/* QUICK CHIP OPTIONS FOR DURATION */}
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] font-bold text-slate-500 mr-1 uppercase">Quick:</span>
                  {[15, 30, 45, 60, 90, 120, 180, 240].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setManualDuration(mins.toString())}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition border cursor-pointer active:scale-95 ${
                        manualDuration === mins.toString()
                          ? 'bg-blue-500 text-white border-transparent'
                          : (theme === 'light' ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300')
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* STAR FOCUS RATING */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Focus Level (1-5)</label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFocusRating(star)}
                      className="cursor-pointer active:scale-125 transition"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= focusRating ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-slate-500'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* MOOD */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Mood during Study</label>
                <div className="flex gap-1">
                  {(['Focused', 'Calm', 'Tired', 'Stressed', 'Happy'] as StudyMood[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setStudyMood(m)}
                      title={m}
                      className={`text-[10px] p-1.5 rounded-lg border font-bold transition-all cursor-pointer active:scale-95 flex-1 text-center ${
                        studyMood === m
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400 font-extrabold'
                          : (theme === 'light' ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-950/60 border-slate-800 text-slate-400')
                      }`}
                    >
                      {m === 'Focused' && '🎯'}
                      {m === 'Calm' && '🍃'}
                      {m === 'Tired' && '💤'}
                      {m === 'Stressed' && '🤯'}
                      {m === 'Happy' && '☀️'}
                    </button>
                  ))}
                </div>
              </div>

              {/* BUTTON TO SAVE */}
              <div className="flex items-end justify-end pt-3 sm:pt-0">
                <button
                  type="submit"
                  className="w-full text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow-lg active:scale-95 hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1"
                  style={{ backgroundColor: accentColor || '#3b82f6' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Study Session</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* =============================================================
          2. TIMEFRAME SELECTION BAR
          ============================================================= */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900/40 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Timeframe Scope</h3>
        </div>

        {/* Today, Week, Month, Year Filter */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
          {[
            { id: 'today', name: 'Today' },
            { id: 'week', name: 'This Week' },
            { id: 'month', name: 'This Month' },
            { id: 'year', name: 'Whole Year (2026-2027)' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setTimeframe(opt.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeframe === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeSegment === 'metrics' ? (
        <div className="space-y-6">
          
          {/* HIGH LEVEL METRICS SUMMARY BENTO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            
            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Study Focus</span>
              <p className="text-xl font-extrabold mt-1 text-orange-400">{totalHours.toFixed(1)} Hrs</p>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
              <p className="text-xl font-extrabold mt-1 text-blue-400">
                {tasksCompleted} <span className="text-xs font-medium text-slate-400">of {totalTasksCount}</span>
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Done Rate</span>
              <p className="text-xl font-extrabold mt-1 text-green-400">{taskCompletionPct}%</p>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Session</span>
              <p className="text-xl font-extrabold mt-1 text-indigo-400">
                {calculateAvgSession()} <span className="text-[10px] font-medium text-slate-400">mins</span>
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Productivity</span>
              <p className="text-xl font-extrabold mt-1 text-teal-400">{calculateAvgProductivity()}/5.0</p>
            </div>

            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus Rating</span>
              <p className="text-xl font-extrabold mt-1 text-violet-400">{calculateAvgFocus()}/5.0</p>
            </div>

          </div>

          {/* DYNAMIC TRENDS CHART ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FOCUS GRAPH WITH ACCENT LINE */}
            <div className={`lg:col-span-2 p-5 rounded-2xl border ${
              theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>
                    {timeframe === 'today' && "Today's Study Blocks"}
                    {timeframe === 'week' && "Weekly Study Pattern"}
                    {timeframe === 'month' && (monthViewMode === 'summary' ? "Monthly Study Trend (Summary)" : "Monthly Study Trend (Detailed Daily)")}
                    {timeframe === 'year' && "Whole Year Study Tracker (2026-2027)"}
                  </span>
                </div>
                
                {/* Month Detailed/Summary Toggle */}
                {timeframe === 'month' && (
                  <div className={`flex p-0.5 rounded-lg border text-[10px] shrink-0 font-bold ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <button
                      type="button"
                      onClick={() => setMonthViewMode('summary')}
                      className={`px-2 py-1 rounded transition-all cursor-pointer ${
                        monthViewMode === 'summary'
                          ? 'bg-blue-500 text-white shadow-sm font-extrabold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Summary Chart
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonthViewMode('detailed')}
                      className={`px-2 py-1 rounded transition-all cursor-pointer ${
                        monthViewMode === 'detailed'
                          ? 'bg-blue-500 text-white shadow-sm font-extrabold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Detailed Day-by-Day
                    </button>
                  </div>
                )}

                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  Scope: {timeframe.toUpperCase()}
                </span>
              </h4>

              {/* RENDER THE CHART ACCORDING TO TIMEFRAME */}
              <div className="h-48 w-full pt-4 relative">
                {timeframe === 'today' && (() => {
                  const dataPoints = getHourlyBreakdownToday();
                  const maxVal = Math.max(...dataPoints.map(d => d.mins), 60);
                  return (
                    <div className="h-full flex items-end justify-between gap-2 px-1">
                      {dataPoints.map((dp, idx) => {
                        const pctHeight = (dp.mins / maxVal) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                            <div className="absolute bottom-[calc(100%-8px)] bg-slate-950 text-white font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 z-20 pointer-events-none shadow">
                              {dp.mins} mins
                            </div>
                            <div 
                              className="w-full max-w-[28px] rounded-t-md transition-all duration-300"
                              style={{ 
                                height: `${pctHeight}%`, 
                                backgroundColor: dp.mins > 0 ? (accentColor || '#3b82f6') : '#1e293b',
                                opacity: dp.mins === 0 ? 0.3 : 1
                              }}
                            />
                            <span className="text-[8px] mt-2 font-mono text-slate-400 text-center block w-full whitespace-nowrap">{dp.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {timeframe === 'week' && (() => {
                  const dataPoints = getDayOfWeekData();
                  const maxVal = Math.max(...dataPoints.map(d => d.hours), 2);
                  return (
                    <div className="h-full flex items-end justify-between gap-3 px-1">
                      {dataPoints.map((dp, idx) => {
                        const pctHeight = (dp.hours / maxVal) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                            <div className="absolute bottom-[calc(100%-8px)] bg-slate-950 text-white font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 z-20 pointer-events-none shadow">
                              {dp.hours.toFixed(1)} hrs
                            </div>
                            <div 
                              className="w-full max-w-[32px] rounded-t-md transition-all duration-300"
                              style={{ 
                                height: `${pctHeight}%`, 
                                backgroundColor: dp.hours > 0 ? (accentColor || '#3b82f6') : '#1e293b',
                                opacity: dp.hours === 0 ? 0.3 : 1
                              }}
                            />
                            <span className="text-[9px] mt-2 font-mono text-slate-400">{dp.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {timeframe === 'month' && (() => {
                  if (monthViewMode === 'detailed') {
                    const detailedData = getMonthDetailedData();
                    const maxMins = Math.max(...detailedData.map(d => d.mins), 60);
                    return (
                      <div className="w-full h-full flex flex-col justify-between">
                        {/* Daily 30 days bar chart */}
                        <div className="h-[125px] flex items-end justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                          {detailedData.map((dp, idx) => {
                            const pctHeight = (dp.mins / maxMins) * 100;
                            const dayLabel = dp.date.substring(8, 10); // get DD
                            const isSelected = selectedHeatmapDate === dp.date;
                            return (
                              <div key={idx} className="flex-1 min-w-[16px] flex flex-col items-center group h-full justify-end relative">
                                {/* Hover details */}
                                <div className="absolute bottom-[calc(100%-4px)] bg-slate-950 text-white font-mono text-[8px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition z-30 pointer-events-none whitespace-nowrap shadow border border-slate-800">
                                  <div className="font-bold text-blue-400">{dp.date}</div>
                                  <div>Study: <span className="font-bold text-white">{dp.mins} mins</span></div>
                                  <div>Tasks Done: <span className="font-bold text-yellow-400">{dp.tasksDone}</span></div>
                                  {dp.sessions.length > 0 && (
                                    <div className="text-[7.5px] text-slate-400 max-w-[120px] truncate">
                                      {dp.sessions[0].topic}
                                    </div>
                                  )}
                                </div>
                                <div 
                                  className="w-full rounded-t-sm transition-all duration-300 cursor-pointer hover:scale-x-110"
                                  onClick={() => {
                                    setSelectedHeatmapDate(dp.date);
                                    setLogDate(dp.date);
                                  }}
                                  style={{ 
                                    height: `${Math.max(pctHeight, 4)}%`, 
                                    backgroundColor: dp.mins > 0 ? (isSelected ? '#eab308' : (accentColor || '#3b82f6')) : '#1e293b',
                                    opacity: dp.mins === 0 ? 0.2 : (isSelected ? 1 : 0.8)
                                  }}
                                />
                                <span className={`text-[7px] font-mono mt-1 ${isSelected ? 'text-yellow-400 font-extrabold' : 'text-slate-500'}`}>{dayLabel}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-between items-center text-[8px] text-slate-400 mt-2 border-t border-slate-800/20 pt-1" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                          <span>← 30 Days Ago</span>
                          <span className="font-semibold text-slate-500">Selected: {selectedHeatmapDate} (Click any bar to inspect / log retroactive)</span>
                          <span>Today (July 21) →</span>
                        </div>
                      </div>
                    );
                  }

                  const dataPoints = getMonthTrendData();
                  const maxVal = Math.max(...dataPoints.map(d => d.hours), 2);
                  
                  const width = 500;
                  const height = 140;
                  const xSpacing = width / (dataPoints.length - 1);
                  const points = dataPoints.map((dp, idx) => {
                    const x = idx * xSpacing;
                    const y = height - (dp.hours / maxVal) * 110;
                    return { x, y, hours: dp.hours, label: dp.label };
                  });

                  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
                  const areaPoints = `${points[0].x},${height} ${polyPoints} ${points[points.length - 1].x},${height}`;

                  return (
                    <div className="w-full h-full relative">
                      <svg className="w-full h-[150px]" viewBox="0 0 500 140" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accentColor || '#3b82f6'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={accentColor || '#3b82f6'} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="35" x2="500" y2="35" stroke="#1e2d54" strokeWidth="0.5" strokeDasharray="2" style={{ stroke: theme === 'light' ? '#e2e8f0' : undefined }} />
                        <line x1="0" y1="70" x2="500" y2="70" stroke="#1e2d54" strokeWidth="0.5" strokeDasharray="2" style={{ stroke: theme === 'light' ? '#e2e8f0' : undefined }} />
                        <line x1="0" y1="105" x2="500" y2="105" stroke="#1e2d54" strokeWidth="0.5" strokeDasharray="2" style={{ stroke: theme === 'light' ? '#e2e8f0' : undefined }} />

                        <polygon points={areaPoints} fill="url(#monthGradient)" />
                        <polyline fill="none" stroke={accentColor || '#3b82f6'} strokeWidth="2.5" points={polyPoints} strokeLinecap="round" strokeLinejoin="round" />
                        
                        {points.map((p, idx) => (
                          <g key={idx} className="group/dot">
                            <circle cx={p.x} cy={p.y} r="4.5" fill={accentColor || '#3b82f6'} className="cursor-pointer hover:r-6 transition" />
                          </g>
                        ))}
                      </svg>
                      {/* X labels */}
                      <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                        {dataPoints.map((dp, idx) => (
                          <span key={idx}>{dp.label}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {timeframe === 'year' && (() => {
                  const dataPoints = getYearTrendData();
                  const maxHrs = Math.max(...dataPoints.map(d => d.studyHours), 5);
                  const maxTasks = Math.max(...dataPoints.map(d => d.completedTasks), 5);
                  
                  // Compute points for dual lines or side-by-side bars
                  return (
                    <div className="w-full h-full flex flex-col justify-between">
                      {/* Chart body */}
                      <div className="h-[140px] flex items-end justify-between gap-1.5 px-1">
                        {dataPoints.map((dp, idx) => {
                          const hrsPct = (dp.studyHours / maxHrs) * 90;
                          const taskPct = (dp.completedTasks / maxTasks) * 90;
                          return (
                            <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full relative">
                              {/* Hover breakdown */}
                              <div className="absolute bottom-[calc(100%-4px)] bg-slate-950 text-white font-mono text-[8px] p-1 rounded opacity-0 group-hover:opacity-100 transition z-30 pointer-events-none whitespace-nowrap shadow border border-slate-800">
                                <div>Focus: {dp.studyHours.toFixed(1)} hrs</div>
                                <div>Tasks: {dp.completedTasks} done</div>
                              </div>
                              
                              <div className="w-full flex justify-center items-end gap-0.5 h-full">
                                {/* Study Hours bar */}
                                <div 
                                  className="w-[8px] rounded-t-sm transition-all"
                                  style={{ 
                                    height: `${hrsPct}%`, 
                                    backgroundColor: accentColor || '#3b82f6',
                                    opacity: dp.studyHours === 0 ? 0.2 : 1
                                  }}
                                />
                                {/* Completed Tasks bar */}
                                <div 
                                  className="w-[8px] rounded-t-sm transition-all"
                                  style={{ 
                                    height: `${taskPct}%`, 
                                    backgroundColor: '#eab308',
                                    opacity: dp.completedTasks === 0 ? 0.2 : 1
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* X Labels */}
                      <div className="flex justify-between text-[7.5px] text-slate-500 font-mono mt-2 overflow-x-auto gap-1">
                        {dataPoints.map((dp, idx) => (
                          <span key={idx} className="flex-1 text-center truncate">{dp.label}</span>
                        ))}
                      </div>

                      {/* Chart Legend */}
                      <div className="flex justify-center gap-4 text-[9px] font-mono mt-1 text-slate-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: accentColor || '#3b82f6' }} />
                          <span>Focus Duration (Hours)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm bg-yellow-500" />
                          <span>Completed Tasks (Qty)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* SUBJECT & TEST CORRELATIONS (1 col) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span>Academic Efficiency</span>
                </h4>
                
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs leading-relaxed mb-4`}>
                  How well does your logged study focus convert into test scores, revisions, and task completions?
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    <span className="text-xs font-semibold text-slate-400">Completed Revision Drills</span>
                    <span className="text-sm font-extrabold text-indigo-400">{totalRevisions} logs</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    <span className="text-xs font-semibold text-slate-400">Mock Practice Exams</span>
                    <span className="text-sm font-extrabold text-green-400">{totalMockTests} tests</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    <span className="text-xs font-semibold text-slate-400">Tasks per Study Hour</span>
                    <span className="text-sm font-extrabold text-amber-400">
                      {totalHours > 0 ? (tasksCompleted / totalHours).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">Primary Distraction Threat</span>
                    <span className="text-sm font-extrabold text-red-400 truncate max-w-[120px]" title={getMostMissedHabitName()}>
                      {getMostMissedHabitName()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`mt-5 p-3 rounded-xl border ${
                theme === 'light' ? 'bg-amber-50 border-amber-100' : 'bg-amber-950/10 border-amber-500/10'
              }`}>
                <div className="flex gap-2 items-start">
                  <Flame className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
                  <div className="text-[11px] font-semibold text-amber-500 leading-normal">
                    You have maintained a <span className="font-extrabold">{data.gamification.dailyStreak} Day streak</span>! Studying at least 30 minutes every day preserves your level multiplier.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =============================================================
              TASK COMPLETION ANALYTICS (TODAY, ALL-TIME, WEEKLY, MONTHLY, YEARLY)
              ============================================================= */}
          {(() => {
            const todayTasksList = data.tasks.filter(t => t.deadline === todayStr);
            const todayDone = todayTasksList.filter(t => t.status === 'Completed').length;
            const todayPending = todayTasksList.filter(t => t.status === 'Pending').length;
            const todayTotal = todayTasksList.length;
            const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

            const allTimeTotal = data.tasks.length;
            const allTimeCompleted = data.tasks.filter(t => t.status === 'Completed').length;
            const allTimePending = data.tasks.filter(t => t.status === 'Pending' && t.deadline >= todayStr).length;
            const allTimeIncomplete = data.tasks.filter(t => t.status === 'Incomplete' || (t.deadline < todayStr && t.status === 'Pending')).length;
            const allTimePct = allTimeTotal > 0 ? Math.round((allTimeCompleted / allTimeTotal) * 100) : 0;

            const str7 = getPastLocalDateString(6, parseLocalDate(todayStr));
            const str30 = getPastLocalDateString(29, parseLocalDate(todayStr));
            const str365 = getPastLocalDateString(364, parseLocalDate(todayStr));

            const weeklyTasks = data.tasks.filter(t => t.deadline >= str7 && t.deadline <= todayStr);
            const weeklyDone = weeklyTasks.filter(t => t.status === 'Completed').length;
            const weeklyTotal = weeklyTasks.length;
            const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;

            const monthlyTasks = data.tasks.filter(t => t.deadline >= str30 && t.deadline <= todayStr);
            const monthlyDone = monthlyTasks.filter(t => t.status === 'Completed').length;
            const monthlyTotal = monthlyTasks.length;
            const monthlyPct = monthlyTotal > 0 ? Math.round((monthlyDone / monthlyTotal) * 100) : 0;

            const yearlyTasks = data.tasks.filter(t => t.deadline >= str365 && t.deadline <= todayStr);
            const yearlyDone = yearlyTasks.filter(t => t.status === 'Completed').length;
            const yearlyTotal = yearlyTasks.length;
            const yearlyPct = yearlyTotal > 0 ? Math.round((yearlyDone / yearlyTotal) * 100) : 0;

            const cPct = allTimeTotal > 0 ? (allTimeCompleted / allTimeTotal) * 100 : 0;
            const pPct = allTimeTotal > 0 ? (allTimePending / allTimeTotal) * 100 : 0;
            const iPct = allTimeTotal > 0 ? (allTimeIncomplete / allTimeTotal) * 100 : 0;

            return (
              <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2 text-blue-400">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>Task Completion Analytics & All-Time Performance</span>
                    </h3>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-0.5`}>
                      Detailed analysis of today's tasks and all-time assigned tasks (Completed vs Pending vs Incomplete).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {todayDone}/{todayTotal} Today ({todayPct}%)
                    </span>
                    <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {allTimeCompleted}/{allTimeTotal} All-Time ({allTimePct}%)
                    </span>
                  </div>
                </div>

                {/* TWO DONUT CHARTS: TODAY'S TASKS vs ALL-TIME TASKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* DONUT CHART 1: TODAY'S TASKS */}
                  <div className={`p-5 rounded-xl border flex flex-col items-center justify-between text-center ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      Today's Tasks: Completed vs Pending
                    </h4>

                    {todayTotal === 0 ? (
                      <div className="py-8 text-slate-500 text-xs flex flex-col items-center my-auto">
                        <CheckSquare className="w-8 h-8 opacity-40 mb-2 text-slate-400" />
                        <p>No tasks scheduled for today yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full">
                        {/* SVG Donut Chart */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke={theme === 'light' ? '#e2e8f0' : '#1e2d54'} strokeWidth="12" />
                            {/* Completed Arc (Emerald Green) */}
                            {todayDone > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="12"
                                strokeDasharray={`${(todayDone / todayTotal) * 100} ${100 - (todayDone / todayTotal) * 100}`}
                                strokeDashoffset="0"
                                pathLength="100"
                                className="transition-all duration-500"
                              />
                            )}
                            {/* Pending Arc (Amber) */}
                            {todayPending > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="12"
                                strokeDasharray={`${(todayPending / todayTotal) * 100} ${100 - (todayPending / todayTotal) * 100}`}
                                strokeDashoffset={`-${(todayDone / todayTotal) * 100}`}
                                pathLength="100"
                                className="transition-all duration-500"
                              />
                            )}
                          </svg>
                          <div className="absolute flex flex-col items-center text-center">
                            <span className="text-xl font-black">{todayPct}%</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">Done Today</span>
                          </div>
                        </div>

                        {/* Breakdown metrics */}
                        <div className="grid grid-cols-2 gap-2 w-full pt-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed Today</span>
                            <span className="text-lg font-black text-emerald-400">{todayDone}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Today</span>
                            <span className="text-lg font-black text-amber-400">{todayPending}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DONUT CHART 2: ALL-TIME TASKS (EVER ASSIGNED) */}
                  <div className={`p-5 rounded-xl border flex flex-col items-center justify-between text-center ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      All-Time Tasks: Completed vs Pending vs Incomplete
                    </h4>

                    {allTimeTotal === 0 ? (
                      <div className="py-8 text-slate-500 text-xs flex flex-col items-center my-auto">
                        <CheckSquare className="w-8 h-8 opacity-40 mb-2 text-slate-400" />
                        <p>No tasks created in your history yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full">
                        {/* SVG Donut Chart */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke={theme === 'light' ? '#e2e8f0' : '#1e2d54'} strokeWidth="12" />
                            
                            {/* 1. Completed Arc (Emerald Green) */}
                            {allTimeCompleted > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="12"
                                strokeDasharray={`${cPct} ${100 - cPct}`}
                                strokeDashoffset="0"
                                pathLength="100"
                                className="transition-all duration-500"
                              />
                            )}

                            {/* 2. Pending Arc (Amber) */}
                            {allTimePending > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="12"
                                strokeDasharray={`${pPct} ${100 - pPct}`}
                                strokeDashoffset={`-${cPct}`}
                                pathLength="100"
                                className="transition-all duration-500"
                              />
                            )}

                            {/* 3. Incomplete Arc (Rose Red) */}
                            {allTimeIncomplete > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="12"
                                strokeDasharray={`${iPct} ${100 - iPct}`}
                                strokeDashoffset={`-${cPct + pPct}`}
                                pathLength="100"
                                className="transition-all duration-500"
                              />
                            )}
                          </svg>
                          <div className="absolute flex flex-col items-center text-center">
                            <span className="text-xl font-black text-indigo-400">{allTimePct}%</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">All-Time Done</span>
                          </div>
                        </div>

                        {/* Breakdown metrics */}
                        <div className="grid grid-cols-3 gap-1.5 w-full pt-2 text-xs">
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Completed</span>
                            <span className="text-base font-black text-emerald-400">{allTimeCompleted}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Pending</span>
                            <span className="text-base font-black text-amber-400">{allTimePending}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Incomplete</span>
                            <span className="text-base font-black text-rose-400">{allTimeIncomplete}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* HISTORICAL COMPLETED DATA: WEEKLY, MONTHLY, YEARLY */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Historical Completed Task Metrics & Volume Trends
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WEEKLY */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Weekly Completed</span>
                      <p className="text-2xl font-black mt-1 text-blue-400">
                        {weeklyDone} <span className="text-xs font-semibold text-slate-400">/ {weeklyTotal}</span>
                      </p>
                      <div className="w-full bg-slate-700/40 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${weeklyPct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">{weeklyPct}% completion rate (Last 7 days)</span>
                    </div>

                    {/* MONTHLY */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Monthly Completed</span>
                      <p className="text-2xl font-black mt-1 text-indigo-400">
                        {monthlyDone} <span className="text-xs font-semibold text-slate-400">/ {monthlyTotal}</span>
                      </p>
                      <div className="w-full bg-slate-700/40 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${monthlyPct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">{monthlyPct}% completion rate (Last 30 days)</span>
                    </div>

                    {/* YEARLY */}
                    <div className={`p-4 rounded-xl border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Yearly Completed</span>
                      <p className="text-2xl font-black mt-1 text-teal-400">
                        {yearlyDone} <span className="text-xs font-semibold text-slate-400">/ {yearlyTotal}</span>
                      </p>
                      <div className="w-full bg-slate-700/40 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${yearlyPct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">{yearlyPct}% completion rate (Last 365 days)</span>
                    </div>
                  </div>

                  {/* HISTORICAL TASK COMPLETION BAR CHART COMPARISON */}
                  <div className={`p-4 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                      Task Volume Comparison (Completed vs Total)
                    </span>
                    <div className="h-28 flex items-end justify-around gap-4 pt-2">
                      {[
                        { label: 'Today', done: todayDone, total: todayTotal, color: '#10b981' },
                        { label: 'Weekly', done: weeklyDone, total: weeklyTotal, color: '#3b82f6' },
                        { label: 'Monthly', done: monthlyDone, total: monthlyTotal, color: '#6366f1' },
                        { label: 'Yearly', done: yearlyDone, total: yearlyTotal, color: '#14b8a6' },
                        { label: 'All-Time', done: allTimeCompleted, total: allTimeTotal, color: '#8b5cf6' },
                      ].map((item, idx) => {
                        const maxVal = Math.max(todayTotal, weeklyTotal, monthlyTotal, yearlyTotal, allTimeTotal, 1);
                        const heightDonePct = (item.done / maxVal) * 100;
                        const heightTotalPct = (item.total / maxVal) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            <div className="absolute bottom-[calc(100%-4px)] bg-slate-950 text-white font-mono text-[9px] p-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20 border border-slate-800">
                              <div>{item.label}: {item.done} done / {item.total} total</div>
                            </div>
                            <div className="w-full max-w-[40px] flex items-end gap-1 h-full justify-center">
                              <div className="w-1/2 rounded-t transition-all duration-300" style={{ height: `${Math.max(heightDonePct, 8)}%`, backgroundColor: item.color }} />
                              <div className="w-1/2 bg-slate-700/50 rounded-t transition-all duration-300" style={{ height: `${Math.max(heightTotalPct, 8)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold mt-2 text-slate-400">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 text-[9px] font-mono text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Completed Tasks</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-600" /> Total Created</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =============================================================
              3. AMAN'S YEARLY STUDY LEDGER & HEATMAP
              ============================================================= */}
          {timeframe === 'year' && (() => {
            const getStartDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();
            const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
            
            const yearMonths = [
              { name: 'July 2026', year: 2026, month: 6 },
              { name: 'August 2026', year: 2026, month: 7 },
              { name: 'September 2026', year: 2026, month: 8 },
              { name: 'October 2026', year: 2026, month: 9 },
              { name: 'November 2026', year: 2026, month: 10 },
              { name: 'December 2026', year: 2026, month: 11 },
              { name: 'January 2027', year: 2027, month: 0 },
              { name: 'February 2027', year: 2027, month: 1 },
              { name: 'March 2027', year: 2027, month: 2 },
              { name: 'April 2027', year: 2027, month: 3 },
              { name: 'May 2027', year: 2027, month: 4 },
              { name: 'June 2027', year: 2027, month: 5 },
              { name: 'July 2027', year: 2027, month: 6 },
            ];

            const details = (() => {
              const daySessions = data.studySessions.filter(s => s.date === selectedHeatmapDate);
              const dayTasks = data.tasks.filter(t => t.deadline === selectedHeatmapDate);
              const dayMins = daySessions.reduce((acc, s) => acc + s.duration, 0);
              const completedTasks = dayTasks.filter(t => t.status === 'Completed');
              const mood = daySessions[0]?.mood;
              const focus = daySessions.length > 0 ? Math.round(daySessions.reduce((acc, s) => acc + s.focusRating, 0) / daySessions.length) : 0;
              return {
                date: selectedHeatmapDate,
                mins: dayMins,
                sessions: daySessions,
                tasks: dayTasks,
                completedTasks,
                mood,
                focus
              };
            })();

            return (
              <div className={`p-5 rounded-2xl border space-y-6 ${
                theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Aman's 365-Day Study Heatmap Ledger (July 2026 - July 2027)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    A beautiful, detailed overview of every day in your academic year. Hover on a square to view daily minutes, or click to load detailed day insights below!
                  </p>
                </div>

                {/* Legend bar */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono bg-slate-950/20 px-3 py-1.5 rounded-lg w-fit border border-slate-800/40" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                  <span>Study Intensity:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-950" />
                    <span>0m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/10" />
                    <span>1-30m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500/40 border border-emerald-500/20" />
                    <span>31-90m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500/70 border border-emerald-500/30" />
                    <span>91-180m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400" />
                    <span>180m+</span>
                  </div>
                </div>

                {/* Months grid wrapper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {yearMonths.map((m, mIdx) => {
                    const startDay = getStartDayOfWeek(m.year, m.month);
                    const daysCount = getDaysInMonth(m.year, m.month);
                    
                    const daysArr = [];
                    // Placeholders for start of week offsets
                    for (let p = 0; p < startDay; p++) {
                      daysArr.push({ isPlaceholder: true });
                    }
                    // Real days of month
                    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
                      const dateStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isWithinStudyYear = dateStr >= '2026-07-21' && dateStr <= '2027-07-21';
                      
                      let mins = 0;
                      let tasks = 0;
                      if (isWithinStudyYear) {
                        mins = data.studySessions.filter(s => s.date === dateStr).reduce((acc, s) => acc + s.duration, 0);
                        tasks = data.tasks.filter(t => t.deadline === dateStr && t.status === 'Completed').length;
                      }

                      daysArr.push({
                        isPlaceholder: false,
                        date: dateStr,
                        dayNum,
                        isWithinStudyYear,
                        mins,
                        tasks
                      });
                    }

                    return (
                      <div key={mIdx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/20 flex flex-col justify-between h-fit w-full max-w-[280px] sm:max-w-none mx-auto" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-800 pb-1.5 mb-1.5 block text-center" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                          {m.name}
                        </span>

                        {/* Calendar week header */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[8px] font-bold text-slate-500">
                          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {daysArr.map((day, dIdx) => {
                            if (day.isPlaceholder) {
                              return <div key={dIdx} className="aspect-square" />;
                            }

                            if (!day.isWithinStudyYear) {
                              return (
                                <div 
                                  key={dIdx} 
                                  className="aspect-square rounded-[3px] bg-slate-200 dark:bg-slate-900/10 border border-transparent opacity-10 cursor-not-allowed" 
                                  title={`${day.date} (Outside tracking year)`}
                                />
                              );
                            }

                            const isSelected = selectedHeatmapDate === day.date;
                            let cellBg = 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-950';
                            if (day.mins > 0 && day.mins <= 30) cellBg = 'bg-emerald-500/20 border-emerald-500/10 text-emerald-400';
                            if (day.mins > 30 && day.mins <= 90) cellBg = 'bg-emerald-500/40 border-emerald-500/20 text-emerald-200';
                            if (day.mins > 90 && day.mins <= 180) cellBg = 'bg-emerald-500/70 border-emerald-500/30 text-emerald-100';
                            if (day.mins > 180) cellBg = 'bg-emerald-500 border-emerald-400 text-white font-extrabold';

                            return (
                              <button
                                key={dIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedHeatmapDate(day.date || '');
                                  setLogDate(day.date || '');
                                }}
                                className={`aspect-square rounded-[3px] border transition-all text-[8px] sm:text-[6.5px] font-mono flex items-center justify-center cursor-pointer hover:scale-110 hover:brightness-125 select-none relative group/cell ${cellBg} ${
                                  isSelected ? 'ring-2 ring-yellow-400 border-yellow-400 scale-105 z-10' : ''
                                }`}
                              >
                                {day.dayNum}
                                
                                {/* Cell Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 text-white font-mono text-[8px] p-1.5 rounded opacity-0 pointer-events-none group-hover/cell:opacity-100 transition z-30 whitespace-nowrap shadow border border-slate-800">
                                  <div className="font-bold">{day.date}</div>
                                  <div className="text-blue-400">Study: {day.mins} mins</div>
                                  <div className="text-yellow-500">Tasks: {day.tasks} completed</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DETAILED INFORMATION CARD FOR SELECTED HEATMAP DATE */}
                <div className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/60 border-slate-900'
                }`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspector Panel</h5>
                        <p className="text-sm font-extrabold text-white" style={{ color: theme === 'light' ? '#0f172a' : undefined }}>
                          {new Date(details.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLogDate(details.date);
                        document.getElementById('analytics-tab')?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log retroactive study session for this date</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/40" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duration Studied</span>
                      <p className="text-lg font-black text-blue-400 mt-1">{details.mins} mins</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/40" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
                      <p className="text-lg font-black text-yellow-500 mt-1">{details.completedTasks.length} <span className="text-[10px] font-medium text-slate-400">of {details.tasks.length}</span></p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/40" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Focus Rating</span>
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {details.focus > 0 ? (
                          Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3.5 h-3.5 ${idx < details.focus ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-slate-600'}`} />
                          ))
                        ) : (
                          <span className="text-xs font-bold text-slate-500">No Focus Data</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/40" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mood Logged</span>
                      <p className="text-sm font-black text-indigo-400 mt-1 flex items-center gap-1">
                        {details.mood === 'Focused' && '🎯 Focused'}
                        {details.mood === 'Calm' && '🍃 Calm'}
                        {details.mood === 'Tired' && '💤 Tired'}
                        {details.mood === 'Stressed' && '🤯 Stressed'}
                        {details.mood === 'Happy' && '☀️ Happy'}
                        {!details.mood && <span className="text-slate-500 font-bold">N/A</span>}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Logged study sessions details list */}
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sessions Logged on this day</span>
                      </h6>
                      
                      {details.sessions.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-2">No study sessions recorded for this day.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {details.sessions.map((s, idx) => {
                            const sub = data.subjects.find(sub => sub.id === s.subjectId);
                            return (
                              <div key={idx} className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 flex justify-between items-center text-[11px]" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color || '#3b82f6' }} />
                                    <span className="font-extrabold">{sub?.name || 'General Study'}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-blue-400 font-bold">{s.duration} mins</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.topic}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this study session?')) {
                                      deleteStudySession(s.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-400 p-1 rounded transition active:scale-95 cursor-pointer"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Logged tasks details list */}
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Tasks Scheduled on this day</span>
                      </h6>
                      
                      {details.tasks.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-2">No tasks due on this day.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {details.tasks.map((t, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 flex justify-between items-center text-[11px]" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                              <span className="font-medium truncate max-w-[160px]">{t.title}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* RECENT DETAILED LOGS WITH TRASH FUNCTIONALITY */}
          <div className={`p-5 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Logged Study History ({timeframe.toUpperCase()})</span>
            </h4>

            {filteredSessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No study logs registered for this timeframe. Use the interactive questionnaire card at the top to record study logs now!
              </p>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Subject</th>
                      <th className="py-2.5">Topic</th>
                      <th className="py-2.5">Duration</th>
                      <th className="py-2.5">Focus</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.slice(0, 8).map((session, sIdx) => {
                      const sub = data.subjects.find(s => s.id === session.subjectId);
                      return (
                        <tr key={session.id} className="border-b border-slate-800/40 last:border-0" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                          <td className="py-2.5 font-mono text-[11px] text-slate-400">{session.date}</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color || '#3b82f6' }} />
                              {sub?.name || 'General Study'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-300 font-medium truncate max-w-[150px]" style={{ color: theme === 'light' ? '#1e293b' : undefined }}>
                            {session.topic}
                          </td>
                          <td className="py-2.5 font-extrabold text-blue-400">{session.duration} mins</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, starIdx) => (
                                <Star 
                                  key={starIdx} 
                                  className={`w-3 h-3 ${
                                    starIdx < session.focusRating ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-slate-600'
                                  }`} 
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this study session log?')) {
                                  deleteStudySession(session.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-400 p-1 rounded-lg transition active:scale-95 cursor-pointer"
                              title="Delete log"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      ) : (
        // =============================================================
        // TASK VS BAD HABIT CORRELATION VIEW
        // =============================================================
        <div className="space-y-6">
          
          {/* Comparative metrics board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left side: Task Completion Accomplishments */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Discipline & Task Milestones ({timeframe.toUpperCase()})</span>
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-950/15 border border-emerald-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Tasks Finished</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{tasksCompleted}</p>
                </div>

                <div className="p-3 bg-rose-950/15 border border-rose-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Incomplete Tasks</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">{tasksIncomplete}</p>
                </div>

                <div className="p-3 bg-emerald-950/15 border border-emerald-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Study Duration</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{totalHours.toFixed(1)} <span className="text-xs font-bold text-slate-400">Hrs</span></p>
                </div>

                <div className="p-3 bg-emerald-950/15 border border-emerald-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Task Success Rate</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{taskCompletionPct}%</p>
                </div>
              </div>
            </div>

            {/* Right side: Distraction Log */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/5 to-rose-500/5 border border-red-500/20">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Distraction logs & Trigger frequency ({timeframe.toUpperCase()})</span>
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-rose-950/15 border border-rose-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bad Habit Triggers</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">{badHabitsTriggered} <span className="text-xs font-bold text-slate-400">times</span></p>
                </div>

                <div className="p-3 bg-rose-950/15 border border-rose-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Avoidance Rate</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">{habitAvoidancePct}%</p>
                </div>

                <div className="p-3 bg-rose-950/15 border border-rose-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Distractor</span>
                  <p className="text-sm font-black text-rose-400 mt-2 truncate">{getMostMissedHabitName()}</p>
                </div>

                <div className="p-3 bg-rose-950/15 border border-rose-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Est. Hours Wasted</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">
                    {(badHabitsTriggered * 1.5).toFixed(1)} <span className="text-xs font-bold text-slate-400">Hrs</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* DEDICATED OFFLINE LOCAL INTELLIGENT INSIGHTS LIST */}
          <div className={`p-6 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
          }`}>
            <h4 className="font-extrabold text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span>Offline Study Advisor (Local Intelligence)</span>
            </h4>

            <div className="space-y-3">
              {localInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex gap-3 items-start ${
                    insight.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-300' :
                    insight.type === 'warning' ? 'bg-red-500/5 border-red-500/20 text-red-300' :
                    'bg-blue-500/5 border-blue-500/20 text-blue-300'
                  }`}
                  style={{
                    color: theme === 'light' ? (
                      insight.type === 'success' ? '#15803d' :
                      insight.type === 'warning' ? '#b91c1c' :
                      '#1d4ed8'
                    ) : undefined
                  }}
                >
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
