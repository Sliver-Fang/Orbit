/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, AlertCircle, BookOpen, 
  CheckSquare, Dumbbell, Award, Layers, Sparkles, Lock, Check, XCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { data } = useApp();
  const { theme, accentColor } = data.settings;

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (Jan=0, Dec=11)
  
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate days in current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get weekday index of first day (0=Sunday, 6=Saturday)
  const getFirstDayOfMonthIndex = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx = getFirstDayOfMonthIndex(currentYear, currentMonth);

  // Pad days from previous month to align layout columns
  const prevMonthPaddingDays = Array.from({ length: firstDayIdx }).map((_, i) => null);
  const monthDaysList = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  // Combine list for grid render
  const calendarCells = [...prevMonthPaddingDays, ...monthDaysList];

  // -------------------------------------------------------------
  // SELECTED DATE RECORDS COMPILE
  // -------------------------------------------------------------
  const sessionsOnSelected = data.studySessions.filter(s => s.date === selectedDate);
  const tasksOnSelected = data.tasks.filter(t => t.deadline === selectedDate);
  const mockTestsOnSelected = data.mockTests.filter(m => m.date === selectedDate);
  const revisionsOnSelected = data.revisions.filter(r => r.date === selectedDate);

  // Habits logged success on selected date
  const habitsOnSelected = data.habits.map(h => {
    if (h.successDates.includes(selectedDate)) return { name: h.name, status: 'success' };
    if (h.failureDates.includes(selectedDate)) return { name: h.name, status: 'failure' };
    if (h.skipDates.includes(selectedDate)) return { name: h.name, status: 'skip' };
    return null;
  }).filter(Boolean) as { name: string; status: string }[];

  // Productivity score calculation for selected day
  const calculateSelectedDayProductivity = () => {
    let score = 0;
    const hrs = sessionsOnSelected.reduce((acc, s) => acc + s.duration, 0) / 60;
    const completedTasks = tasksOnSelected.filter(t => t.status === 'Completed').length;
    const tests = mockTestsOnSelected.length;
    const revs = revisionsOnSelected.length;
    
    score += Math.min(hrs * 15, 45); // Max 45 pts for 3 hours of study
    score += Math.min(completedTasks * 15, 30); // Max 30 pts for 2 completed tasks
    score += Math.min(revs * 15, 15); // Max 15 pts for revision
    score += Math.min(tests * 10, 10); // Max 10 pts for taking a test
    
    return Math.round(score);
  };
  const selectedDayProductivity = calculateSelectedDayProductivity();

  // Helper to determine if a specific date string has ANY active logs
  const dateHasActivity = (dateStr: string) => {
    const hasSess = data.studySessions.some(s => s.date === dateStr);
    const hasTask = data.tasks.some(t => t.deadline === dateStr);
    const hasTest = data.mockTests.some(m => m.date === dateStr);
    const hasRev = data.revisions.some(r => r.date === dateStr);
    
    return hasSess || hasTask || hasTest || hasRev;
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID (takes 2 cols on lg) */}
      <div className={`lg:col-span-2 p-5 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
      }`}>
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Interactive Calendar Ledger</span>
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold">{months[currentMonth]} {currentYear}</span>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth} 
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Completion Status Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold py-2.5 px-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 mb-4" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined }}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Task Status Legend:</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500/50"></span>
              <span>Incomplete / Overdue (Red)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
              <span>All Tasks Completed (Green)</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 inline-block"></span>
              <span>Selected Date</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 py-1 border-b border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {calendarCells.map((dayNum, cellIdx) => {
              if (dayNum === null) {
                return <div key={`padding-${cellIdx}`} className="aspect-square opacity-0" />;
              }

              // Create strict YYYY-MM-DD date string
              const cellDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === cellDateStr;
              const hasActivity = dateHasActivity(cellDateStr);
              const todayStr = getLocalDateString();
              const isTodayCell = todayStr === cellDateStr;

              // Task status for this date cell
              const tasksForCell = data.tasks.filter(t => t.deadline === cellDateStr);
              const hasTasks = tasksForCell.length > 0;
              const hasIncompleteTask = tasksForCell.some(t => t.status === 'Incomplete' || (cellDateStr < todayStr && t.status !== 'Completed'));
              const allTasksCompleted = hasTasks && tasksForCell.every(t => t.status === 'Completed');

              let cellStyle = 'bg-slate-900/30 text-slate-300 hover:bg-slate-800 border-transparent';
              
              if (hasIncompleteTask) {
                // RED COLOR when tasks on this date were NOT completed / incomplete
                cellStyle = theme === 'light'
                  ? 'bg-red-100/90 text-red-700 border-red-300 font-bold shadow-sm'
                  : 'bg-red-500/20 text-red-300 border-red-500/50 font-bold shadow-sm shadow-red-500/10';
              } else if (allTasksCompleted) {
                // GREEN COLOR when ALL tasks on this date were completed
                cellStyle = theme === 'light'
                  ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300 font-bold shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-sm shadow-emerald-500/10';
              } else if (theme === 'light') {
                cellStyle = 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/60';
              } else {
                cellStyle = 'bg-slate-900/40 text-slate-300 hover:bg-slate-800 border-slate-800';
              }

              if (isSelected) {
                cellStyle += ' ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 font-black';
              } else if (isTodayCell && !hasIncompleteTask && !allTasksCompleted) {
                cellStyle += ' border-blue-500 font-bold text-blue-400';
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDateStr)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-between p-1.5 transition active:scale-95 cursor-pointer relative ${cellStyle}`}
                >
                  {/* Number */}
                  <span className="text-xs font-bold leading-none font-mono">{dayNum}</span>
                  
                  {/* Status Indicator Dot / Badge */}
                  {hasIncompleteTask ? (
                    <span 
                      title="Task not completed on this date (Incomplete)"
                      className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse shadow-sm shadow-red-500" 
                    />
                  ) : allTasksCompleted ? (
                    <span 
                      title="All tasks completed on this date"
                      className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400" 
                    />
                  ) : hasActivity ? (
                    <span 
                      className="w-1.5 h-1.5 rounded-full opacity-60" 
                      style={{ backgroundColor: accentColor }} 
                    />
                  ) : (
                    <span className="w-1.5 h-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: DAILY LEDGER LOGS DETAIL LIST FOR SELECTED DATE */}
      <div className="space-y-4">
        
        {/* Detail Panel Card */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
        }`}>
          
          <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inspecting Date</span>
              <h5 className="font-extrabold text-sm text-slate-200" style={{ color: theme === 'light' ? '#1e293b' : undefined }}>{selectedDate}</h5>
            </div>
            
            {/* Day productivity score badge */}
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Activity Score</span>
              <p className="text-sm font-black text-yellow-400">{selectedDayProductivity} / 100</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            
            {/* STUDY SESSIONS logged */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">📖 Study Sessions ({sessionsOnSelected.length})</span>
              {sessionsOnSelected.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No study logged on this date.</p>
              ) : (
                <div className="space-y-2">
                  {sessionsOnSelected.map(s => {
                    const subj = data.subjects.find(sub => sub.id === s.subjectId);
                    return (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-xs" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span style={{ color: subj?.color }}>{subj?.name || 'General'}</span>
                          <span className="font-mono">{s.duration} mins</span>
                        </div>
                        <p className="text-slate-300 truncate font-semibold" style={{ color: theme === 'light' ? '#334155' : undefined }}>{s.topic}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TASKS logged */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">✅ Tasks Deadlines ({tasksOnSelected.length})</span>
              {tasksOnSelected.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No task deadlines on this date.</p>
              ) : (
                <div className="space-y-2">
                  {tasksOnSelected.map(t => {
                    const todayStr = getLocalDateString();
                    const isIncomplete = t.status === 'Incomplete' || (selectedDate < todayStr && t.status !== 'Completed');
                    const isCompleted = t.status === 'Completed';
                    return (
                      <div key={t.id} className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-xs flex justify-between items-center gap-2" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                        <span className={isCompleted ? 'line-through text-slate-500 font-medium' : isIncomplete ? 'line-through text-red-400 font-medium' : 'font-semibold'}>
                          {t.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase inline-flex items-center gap-1 ${
                          isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          isIncomplete ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {isIncomplete && <Lock className="w-2.5 h-2.5" />}
                          {isCompleted ? 'Completed' : isIncomplete ? 'Frozen Incomplete' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* REVISIONS scheduled */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">🔄 Revisions log ({revisionsOnSelected.length})</span>
              {revisionsOnSelected.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No subject revisions logged.</p>
              ) : (
                <div className="space-y-2">
                  {revisionsOnSelected.map(r => {
                    const subj = data.subjects.find(sub => sub.id === r.subjectId);
                    const chap = data.chapters.find(c => c.id === r.chapterId);
                    return (
                      <div key={r.id} className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-xs flex justify-between items-center" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                        <span>
                          <span className="font-bold mr-1" style={{ color: subj?.color }}>{subj?.name}</span>
                          <span className="text-slate-400">({chap?.name})</span>
                        </span>
                        <span className="font-bold font-mono">Cycle #{r.revisionNumber}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MOCK TESTS taken */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">🏆 Mock Tests ({mockTestsOnSelected.length})</span>
              {mockTestsOnSelected.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No mock tests registered.</p>
              ) : (
                <div className="space-y-2">
                  {mockTestsOnSelected.map(m => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-xs" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <p className="font-bold truncate">{m.testName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-yellow-400 font-extrabold">{m.marksObtained} / {m.maxMarks} ({Math.round((m.marksObtained / m.maxMarks) * 100)}%)</span>
                        <span className="text-slate-400 font-mono text-[10px]">Rank: {m.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HABITS logged success */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">🟢/🔴 Habits log ({habitsOnSelected.length})</span>
              {habitsOnSelected.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No habits registered on this date.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {habitsOnSelected.map((h, i) => (
                    <span 
                      key={i} 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        h.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        h.status === 'failure' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {h.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
