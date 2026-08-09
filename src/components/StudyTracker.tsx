/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Timer, BookOpen, Clock, AlertCircle, 
  Trash2, Edit, CheckSquare, Smile, Award, Sparkles, Check, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudySession, StudyMood, DifficultyLevel, PriorityLevel } from '../types';
import { scheduleLocalNotification } from '../utils/nativeBridge';
import { getLocalDateString } from '../utils/dateUtils';

export const StudyTracker: React.FC = () => {
  const { data, addStudySession, updateStudySession, deleteStudySession, addPomodoroSession } = useApp();
  const { theme, accentColor } = data.settings;

  const [activeSubTab, setActiveSubTab] = useState<'pomodoro' | 'log' | 'history'>('pomodoro');

  // --- STATE FOR STUDY SESSION HISTORICAL LOG ---
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [durationMins, setDurationMins] = useState(45);
  const [productivityRating, setProductivityRating] = useState(4);
  const [focusRating, setFocusRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<StudyMood>('Focused');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [sessionDate, setSessionDate] = useState(getLocalDateString());

  // Editing session states
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // --- STATE FOR POMODORO TIMER ---
  const [pomoMode, setPomoMode] = useState<'25/5' | '50/10' | '90/20' | 'Custom'>('25/5');
  const [customFocus, setCustomFocus] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // In seconds
  const [totalTimeForProgress, setTotalTimeForProgress] = useState(25 * 60);
  const [timerCompleteMessage, setTimerCompleteMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synthesizer (Web Audio API) for chimes when timer finishes
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sequence of notes: C5, E5, G5, C6 (Positive completion chime)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      let startTime = audioCtx.currentTime;
      
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.5);
        
        startTime += 0.15;
      });
    } catch (e) {
      console.warn('Audio Context failed to boot:', e);
    }
  };

  // Synchronize timer limits with pomoMode
  useEffect(() => {
    let focusMinutes = 25;
    if (pomoMode === '50/10') focusMinutes = 50;
    else if (pomoMode === '90/20') focusMinutes = 90;
    else if (pomoMode === 'Custom') focusMinutes = customFocus;

    const seconds = (isBreakTime ? (pomoMode === 'Custom' ? customBreak : (pomoMode === '25/5' ? 5 : pomoMode === '50/10' ? 10 : 20)) : focusMinutes) * 60;
    setTimeLeft(seconds);
    setTotalTimeForProgress(seconds);
    setIsTimerRunning(false);
  }, [pomoMode, customFocus, customBreak, isBreakTime]);

  // Timer interval core loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isBreakTime]);

  const handleTimerComplete = () => {
    playAlertChime();
    setIsTimerRunning(false);

    if (!isBreakTime) {
      // Completed a focus session! Log Pomodoro log
      let minutes = 25;
      if (pomoMode === '50/10') minutes = 50;
      else if (pomoMode === '90/20') minutes = 90;
      else if (pomoMode === 'Custom') minutes = customFocus;

      addPomodoroSession(minutes, pomoMode);
      setTimerCompleteMessage(`🎉 Focus Session complete! Logged a ${minutes} min Pomodoro! Grab some water, time for a break.`);
      scheduleLocalNotification('Deep Focus Complete!', `Logged a ${minutes} min Pomodoro. Time for a break!`);
      setIsBreakTime(true); // Switch to break
    } else {
      setTimerCompleteMessage(`⏱️ Break time over! Ready to lock back in?`);
      scheduleLocalNotification('Break Time Over!', "Ready to lock back in? Let's go!");
      setIsBreakTime(false); // Switch to focus
    }
  };

  const startStopTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    let focusMinutes = 25;
    if (pomoMode === '50/10') focusMinutes = 50;
    else if (pomoMode === '90/20') focusMinutes = 90;
    else if (pomoMode === 'Custom') focusMinutes = customFocus;

    const seconds = (isBreakTime ? (pomoMode === 'Custom' ? customBreak : (pomoMode === '25/5' ? 5 : pomoMode === '50/10' ? 10 : 20)) : focusMinutes) * 60;
    setTimeLeft(seconds);
    setTotalTimeForProgress(seconds);
  };

  const skipTimer = () => {
    setIsTimerRunning(false);
    setIsBreakTime(!isBreakTime);
  };

  // Formatting seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // POMODORO STATS COMPILATION
  const compilePomodoroStats = () => {
    const sessions = data.pomodoroSessions;
    const totalSessions = sessions.length;
    const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration, 0);
    const averageFocusTime = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;
    const longestSession = totalSessions > 0 ? Math.max(...sessions.map(s => s.duration)) : 0;
    
    return {
      totalSessions,
      totalFocusTime,
      averageFocusTime,
      longestSession
    };
  };
  const pomoStats = compilePomodoroStats();

  const handleStudyLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    if (editingSessionId) {
      updateStudySession({
        id: editingSessionId,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        topic: topicName || 'General study',
        date: sessionDate,
        duration: durationMins,
        productivityRating,
        focusRating,
        notes,
        mood,
        difficulty
      });
      setEditingSessionId(null);
    } else {
      addStudySession({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        topic: topicName || 'General study',
        date: sessionDate,
        duration: durationMins,
        productivityRating,
        focusRating,
        notes,
        mood,
        difficulty
      });
    }

    // Reset inputs
    setTopicName('');
    setNotes('');
    setActiveSubTab('history');
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSessionId(session.id);
    setSelectedSubjectId(session.subjectId);
    setSelectedChapterId(session.chapterId);
    setTopicName(session.topic);
    setDurationMins(session.duration);
    setProductivityRating(session.productivityRating);
    setFocusRating(session.focusRating);
    setNotes(session.notes);
    setMood(session.mood);
    setDifficulty(session.difficulty);
    setSessionDate(session.date);
    setActiveSubTab('log');
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div id="study-tab" className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
      
      {/* SECTION HEADER */}
      <header>
        <h2 className="text-2xl font-extrabold tracking-tight">Study Center</h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-1`}>
          Choose to focus using the custom Pomodoro Timer or manually record previous hours.
        </p>
      </header>

      {/* SEGMENT TAB SELECTOR */}
      <div className={`flex p-1 rounded-xl w-full max-w-md ${
        theme === 'light' ? 'bg-slate-100' : 'bg-slate-900/60 border border-slate-800'
      }`}>
        <button 
          id="tab-pomo-timer"
          onClick={() => { setActiveSubTab('pomodoro'); setEditingSessionId(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'pomodoro' 
              ? (theme === 'light' ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white')
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Pomodoro</span>
        </button>
        <button 
          id="tab-log-session"
          onClick={() => { setActiveSubTab('log'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'log' 
              ? (theme === 'light' ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white')
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{editingSessionId ? 'Edit Session' : 'Manual Log'}</span>
        </button>
        <button 
          id="tab-session-history"
          onClick={() => { setActiveSubTab('history'); setEditingSessionId(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'history' 
              ? (theme === 'light' ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white')
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>History ({data.studySessions.length})</span>
        </button>
      </div>

      {/* MODULE SCREEN RENDERING */}

      {/* --- POMODORO TIMER MODE --- */}
      {activeSubTab === 'pomodoro' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Interactive Timer Card (takes 2/3 cols on md) */}
          <div className={`md:col-span-2 p-6 md:p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${
            theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
          }`}>
            
            {/* Break vs Focus indicator */}
            <div className={`mb-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isBreakTime 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {isBreakTime ? '☕ Break Interval' : '🎯 Deep Focus Period'}
            </div>

            {/* Circular SVG Timer Progress */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke={theme === 'light' ? '#f1f5f9' : '#1e2d54'} strokeWidth="4" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  fill="none" 
                  stroke={isBreakTime ? '#10b981' : (accentColor || '#3b82f6')} 
                  strokeWidth="4.5" 
                  strokeDasharray="276.4" 
                  strokeDashoffset={276.4 - (276.4 * (timeLeft / totalTimeForProgress))}
                  pathLength="276.4"
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner details */}
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-mono font-extrabold tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">
                  {pomoMode} Loop
                </span>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                id="pomo-reset"
                onClick={resetTimer}
                className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl active:scale-95 transition border border-slate-700 cursor-pointer"
                style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button 
                id="pomo-play-pause"
                onClick={startStopTimer}
                className="p-4 rounded-full text-white shadow-md active:scale-95 transition cursor-pointer"
                style={{ backgroundColor: isBreakTime ? '#10b981' : (accentColor || '#3b82f6') }}
              >
                {isTimerRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>

              <button 
                id="pomo-skip"
                onClick={skipTimer}
                className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl active:scale-95 transition border border-slate-700 cursor-pointer"
                style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Picker Buttons */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
              {(['25/5', '50/10', '90/20', 'Custom'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPomoMode(mode)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    pomoMode === mode 
                      ? 'bg-blue-600/10 text-blue-400 border-blue-500/40' 
                      : (theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white')
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Custom Mode Duration slider overlay */}
            {pomoMode === 'Custom' && (
              <div className="w-full max-w-sm mt-4 p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-left space-y-3" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Focus Period:</span>
                    <span className="text-blue-400">{customFocus} Minutes</span>
                  </div>
                  <input 
                    type="range" min="5" max="180" step="5"
                    value={customFocus} 
                    onChange={(e) => setCustomFocus(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Break Period:</span>
                    <span className="text-green-400">{customBreak} Minutes</span>
                  </div>
                  <input 
                    type="range" min="1" max="60" step="1"
                    value={customBreak} 
                    onChange={(e) => setCustomBreak(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Pomodoro Statistics Column */}
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border ${
              theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
            }`}>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4">Pomodoro Records</h4>
              <div className="space-y-4">
                
                <div>
                  <span className="text-xs text-slate-400 block">Total Focus Sessions</span>
                  <p className="text-xl font-black">{pomoStats.totalSessions}</p>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Accumulated Focus Time</span>
                  <p className="text-xl font-black">{pomoStats.totalFocusTime} <span className="text-xs font-bold text-slate-400">mins</span></p>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Average Focus Stretch</span>
                  <p className="text-xl font-black">{pomoStats.averageFocusTime} <span className="text-xs font-bold text-slate-400">mins/sess</span></p>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Longest Single Session</span>
                  <p className="text-xl font-black">{pomoStats.longestSession} <span className="text-xs font-bold text-slate-400">mins</span></p>
                </div>

              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-300">Why Pomodoro works</p>
                <p className="text-[10px] text-slate-400 mt-1">Alternating short intervals of absolute distraction-free focus and brief breaks prevents intellectual burnout and maintains a steady peak flow state.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- MANUAL STUDY SESSION LOGGING MODE --- */}
      {activeSubTab === 'log' && (
        <div className={`p-6 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
        }`}>
          <h3 className="text-lg font-bold mb-4">{editingSessionId ? 'Edit Study Session' : 'Record a Study Session'}</h3>
          
          {data.subjects.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No subjects created yet. Navigate to the Subjects module in the Menu to create your subjects first.</p>
            </div>
          ) : (
            <form onSubmit={handleStudyLogSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Subject *</label>
                  <select 
                    required
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedChapterId(''); // Reset chapter on subject change
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

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Chapter</label>
                  <select 
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    <option value="">Select Chapter (Optional)</option>
                    {data.chapters.filter(c => c.subjectId === selectedSubjectId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Topic studied *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Proofs of continuity, dynamic memory allocation"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Session Duration (Mins) *</label>
                  <input 
                    type="number" 
                    required
                    min="5" 
                    max="600"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Session Date *</label>
                  <input 
                    type="date" 
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Study Mood</label>
                  <select 
                    value={mood}
                    onChange={(e) => setMood(e.target.value as StudyMood)}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Productivity Rating (1-5)</label>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={productivityRating}
                    onChange={(e) => setProductivityRating(Number(e.target.value))}
                    className="w-full accent-blue-500 py-2.5"
                  />
                  <span className="text-[10px] text-slate-400">Selected: {productivityRating}/5</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Focus Rating (1-5)</label>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={focusRating}
                    onChange={(e) => setFocusRating(Number(e.target.value))}
                    className="w-full accent-green-500 py-2.5"
                  />
                  <span className="text-[10px] text-slate-400">Selected: {focusRating}/5</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Syllabus Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Session notes</label>
                <textarea 
                  rows={3}
                  placeholder="List any key concepts study, active recall scores, formulas to remember, or issues faced..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingSessionId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingSessionId(null);
                      setTopicName('');
                      setNotes('');
                      setActiveSubTab('history');
                    }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold border border-red-500 text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-grow py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  {editingSessionId ? 'Update Session Log' : 'Add Session to Ledger'}
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* --- HISTORY / LEDGER LOG MODE --- */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          
          <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">All Tracked Study Sessions</h3>

          <AnimatePresence mode="popLayout">
            {data.studySessions.length === 0 ? (
              <motion.div 
                key="empty-sessions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-12 rounded-3xl text-center border flex flex-col items-center justify-center space-y-4 ${
                  theme === 'light' ? 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(148,163,184,0.04)]' : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BookOpen className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold text-slate-400">No sessions recorded yet.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Log your studies manually or run the Pomodoro clock to begin tracking your syllabus mastery.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {data.studySessions.map(sess => {
                  const subj = data.subjects.find(s => s.id === sess.subjectId);
                  const chap = data.chapters.find(c => c.id === sess.chapterId);
                  return (
                    <motion.div 
                      key={sess.id} 
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(148, 163, 184, 0.05)' }}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                      }`}
                    >
                      
                      <div className="flex items-start gap-3">
                        {/* Subject colored indicator block */}
                        <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: subj?.color || '#3b82f6' }} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold bg-slate-800/40 px-2 py-0.5 rounded text-slate-300" style={{ color: theme === 'light' ? '#334155' : undefined, backgroundColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                              {subj?.name || 'Unknown'}
                            </span>
                            {chap && (
                              <span className="text-[10px] text-slate-400">
                                / {chap.name}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold leading-snug">{sess.topic}</h4>
                          
                          {/* Tags */}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {sess.duration} mins
                            </span>
                            <span>Productivity: {sess.productivityRating}/5</span>
                            <span>Focus: {sess.focusRating}/5</span>
                            <span className="flex items-center gap-0.5">
                              <Smile className="w-3 h-3" /> {sess.mood}
                            </span>
                          </div>

                          {sess.notes && (
                            <p className="text-xs text-slate-500 border-l border-slate-700/60 pl-2 mt-1 italic leading-relaxed" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                              {sess.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end md:self-center border-t md:border-t-0 pt-2.5 md:pt-0" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {sess.date}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            id={`btn-edit-session-${sess.id}`}
                            onClick={() => handleEditSession(sess)}
                            className="p-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition active:scale-90 cursor-pointer"
                            style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            id={`btn-delete-session-${sess.id}`}
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this session? This will subtract your earned XP.')) {
                                deleteStudySession(sess.id);
                              }
                            }}
                            className="p-2 bg-slate-800/60 hover:bg-red-950 text-slate-300 hover:text-red-400 rounded-lg transition active:scale-90 cursor-pointer"
                            style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* Timer Completion Dialog */}
      {timerCompleteMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-3xl max-w-sm w-full text-center space-y-4 border ${
              theme === 'light' ? 'bg-white border-slate-100 shadow-xl text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black">Interval Completed!</h3>
            <p className="text-sm text-slate-400">{timerCompleteMessage}</p>
            <button 
              onClick={() => setTimerCompleteMessage(null)}
              className="w-full py-3 rounded-xl font-bold text-white transition active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
