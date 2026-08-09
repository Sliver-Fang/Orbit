/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, Plus, Calendar, AlertCircle, Trash2, Edit2, 
  ChevronDown, Search, ArrowUpDown, Filter, ToggleLeft, ToggleRight, Check, Copy, X, Lock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, PriorityLevel } from '../types';
import { getLocalDateString, getTomorrowLocalDateString, addDaysToDateStr } from '../utils/dateUtils';

export const TaskManager: React.FC = () => {
  const { data, addTask, updateTask, toggleTaskStatus, setTaskStatus, deleteTask, todayDate } = useApp();
  const { theme, accentColor } = data.settings;

  // Views & Filters state
  const [activeFilter, setActiveFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'incomplete' | 'completed' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'subject'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  // Task Form State (for Add & Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(getLocalDateString());
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [isNamingTask, setIsNamingTask] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const todayStr = todayDate || getLocalDateString();
  const tomorrowStr = getTomorrowLocalDateString();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyTaskToToday = (task: Task) => {
    addTask({
      title: task.title,
      description: task.description,
      deadline: todayStr,
      reminder: task.reminder,
      subjectId: task.subjectId,
      chapterId: task.chapterId,
      estimatedTime: task.estimatedTime,
      priority: task.priority,
    });
    showToast(`Copied "${task.title}" for today (${todayStr})!`);
  };

  const handleCopyTaskToTomorrow = (task: Task) => {
    addTask({
      title: task.title,
      description: task.description,
      deadline: tomorrowStr,
      reminder: task.reminder,
      subjectId: task.subjectId,
      chapterId: task.chapterId,
      estimatedTime: task.estimatedTime,
      priority: task.priority,
    });
    showToast(`Copied "${task.title}" for tomorrow (${tomorrowStr})!`);
  };

  const handleCopyTodayTasksToTomorrow = () => {
    const todayTasks = data.tasks.filter(t => t.deadline === todayStr);
    if (todayTasks.length === 0) {
      showToast('No tasks found for today to copy.');
      return;
    }
    todayTasks.forEach(t => {
      addTask({
        title: t.title,
        description: t.description,
        deadline: tomorrowStr,
        reminder: t.reminder,
        subjectId: t.subjectId,
        chapterId: t.chapterId,
        estimatedTime: t.estimatedTime,
        priority: t.priority,
      });
    });
    showToast(`Copied ${todayTasks.length} task(s) to tomorrow (${tomorrowStr})!`);
  };

  // Filtering Logic
  const getFilteredTasks = () => {
    let list = [...data.tasks];

    // Filter by Tab View
    switch (activeFilter) {
      case 'today':
        list = list.filter(t => (t.deadline === todayStr && t.status === 'Pending') || (t.deadline < todayStr && t.status === 'Pending'));
        break;
      case 'tomorrow':
        list = list.filter(t => t.deadline === tomorrowStr && t.status === 'Pending');
        break;
      case 'upcoming':
        list = list.filter(t => t.deadline > todayStr && t.status === 'Pending');
        break;
      case 'incomplete':
        list = list.filter(t => t.status === 'Incomplete' || (t.deadline < todayStr && t.status === 'Pending'));
        break;
      case 'completed':
        list = list.filter(t => t.status === 'Completed');
        break;
      case 'all':
      default:
        // Show everything
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    // Sorting Logic
    list.sort((a, b) => {
      if (sortBy === 'date') {
        return a.deadline.localeCompare(b.deadline);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'subject') {
        const subA = data.subjects.find(s => s.id === a.subjectId)?.name || '';
        const subB = data.subjects.find(s => s.id === b.subjectId)?.name || '';
        return subA.localeCompare(subB);
      }
      return 0;
    });

    return list;
  };

  const filteredTasks = getFilteredTasks();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTitle = title.trim();
    if (!finalTitle) {
      const selectedSubj = data.subjects.find(s => s.id === subjectId);
      finalTitle = selectedSubj ? `Study ${selectedSubj.name}` : "General Study";
    }

    if (editingTaskId) {
      updateTask({
        id: editingTaskId,
        title: finalTitle,
        description,
        deadline: deadline || getLocalDateString(),
        reminder: false,
        subjectId,
        chapterId: '',
        estimatedTime: 30,
        priority: 'Medium',
        status: data.tasks.find(t => t.id === editingTaskId)?.status || 'Pending'
      });
      setEditingTaskId(null);
    } else {
      addTask({
        title: finalTitle,
        description,
        deadline: deadline || getLocalDateString(),
        reminder: false,
        subjectId,
        chapterId: '',
        estimatedTime: 30,
        priority: 'Medium'
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setSubjectId('');
    setChapterId('');
    setEstimatedTime(30);
    setPriority('Medium');
    setReminder(false);
    setIsNamingTask(false);
    setShowFormModal(false);
  };

  const handleEditClick = (task: Task) => {
    if (task.status === 'Incomplete' || (task.deadline < todayStr && task.status !== 'Completed')) {
      alert("Incomplete tasks are frozen after 00:00 AM deadline and cannot be edited. You can copy this task to Today or Tomorrow to retry it!");
      return;
    }
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline);
    setIsCustomDate(task.deadline !== todayStr && task.deadline !== tomorrowStr);
    setReminder(task.reminder);
    setSubjectId(task.subjectId);
    setChapterId(task.chapterId);
    setEstimatedTime(task.estimatedTime);
    setPriority(task.priority);
    setIsNamingTask(!!task.title || !!task.description);
    setShowFormModal(true);
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div id="tasks-tab" className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
      
      {/* HEADER ROW */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">Daily Task Board</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs leading-relaxed max-w-md`}>
            Track upcoming assignments, homework, self-revision tasks, and practice sheets.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
          <button
            id="btn-add-task-board"
            onClick={() => {
              setEditingTaskId(null);
              setTitle('');
              setDescription('');
              setDeadline(getLocalDateString());
              setSubjectId('');
              setPriority('Medium');
              setIsNamingTask(false);
              setShowFormModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm active:scale-95 transition cursor-pointer w-full"
            style={{ backgroundColor: accentColor || '#3b82f6' }}
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          <button
            id="btn-add-future-task"
            onClick={() => {
              setEditingTaskId(null);
              setTitle('');
              setDescription('');
              setDeadline(tomorrowStr);
              setSubjectId('');
              setPriority('Medium');
              setIsNamingTask(false);
              setShowFormModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold border transition-all active:scale-95 cursor-pointer rounded-xl w-full text-slate-300 hover:text-white border-slate-800 bg-slate-900/20 hover:bg-slate-900/40"
            style={{ 
              borderColor: theme === 'light' ? '#cbd5e1' : undefined,
              color: theme === 'light' ? '#475569' : undefined,
              backgroundColor: theme === 'light' ? '#f8fafc' : undefined
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Add Future Task (for tomorrow or upcoming)</span>
          </button>

          <button
            id="btn-copy-today-tasks-tomorrow"
            onClick={handleCopyTodayTasksToTomorrow}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold border transition-all active:scale-95 cursor-pointer rounded-xl w-full text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copy Today's Tasks to Tomorrow</span>
          </button>
        </div>
      </header>

      {/* TOAST MESSAGE BANNER */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
        </div>
      )}

      {/* SEARCH AND CONTROLS */}
      <section className="flex flex-col sm:flex-row gap-3 items-center">
        
        {/* Search bar */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search checklists or syllabus descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm custom-input bg-slate-900/40 border-slate-800 text-white"
            style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-900/40 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 w-full sm:w-auto justify-between" style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort By</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none outline-none font-extrabold text-white cursor-pointer ml-1"
              style={{ color: theme === 'light' ? '#1e293b' : undefined }}
            >
              <option value="date" className="text-black">Deadline</option>
              <option value="priority" className="text-black">Priority</option>
              <option value="subject" className="text-black">Subject</option>
            </select>
          </div>
        </div>

      </section>

      {/* VIEWS SEGMENT BAR */}
      <section className="flex gap-1 overflow-x-auto pb-1 max-w-full">
        {(['all', 'today', 'tomorrow', 'upcoming', 'incomplete', 'completed'] as const).map(filter => (
          <button
            key={filter}
            id={`filter-task-${filter}`}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/40'
                : (theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white')
            }`}
          >
            <span className="capitalize">{filter}</span>
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">
              {filter === 'all' && data.tasks.length}
              {filter === 'today' && data.tasks.filter(t => (t.deadline === todayStr && t.status === 'Pending') || (t.deadline < todayStr && t.status === 'Pending')).length}
              {filter === 'tomorrow' && data.tasks.filter(t => t.deadline === tomorrowStr && t.status === 'Pending').length}
              {filter === 'upcoming' && data.tasks.filter(t => t.deadline > todayStr && t.status === 'Pending').length}
              {filter === 'incomplete' && data.tasks.filter(t => t.status === 'Incomplete' || (t.deadline < todayStr && t.status === 'Pending')).length}
              {filter === 'completed' && data.tasks.filter(t => t.status === 'Completed').length}
            </span>
          </button>
        ))}
      </section>

      {/* TASK CARDS BOARD */}
      <section className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-12 rounded-3xl text-center border flex flex-col items-center justify-center space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(148,163,184,0.04)]' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <CheckSquare className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-400">No tasks found in this bucket.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Add assignments, homework, self-revision steps, or mock prep lists to organize your workflow.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredTasks.map(task => {
              const isCompleted = task.status === 'Completed';
              const isIncomplete = task.status === 'Incomplete';
              const subj = data.subjects.find(s => s.id === task.subjectId);
              const isOverdue = task.deadline < todayStr && task.status === 'Pending';

              return (
                <motion.div 
                  key={task.id} 
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(148, 163, 184, 0.05)' }}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden transition-all ${
                    isCompleted || isIncomplete ? 'opacity-65' : ''
                  } ${
                    theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    {/* Task completion toggle box (Tick button) */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 mr-1 mt-0.5">
                      {isIncomplete ? (
                        <div 
                          title="Task is frozen & incomplete (past 00:00 AM deadline). Cannot be marked as completed."
                          className="w-6 h-6 rounded-lg border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                        </div>
                      ) : (
                        <button 
                          id={`btn-complete-task-${task.id}`}
                          onClick={() => setTaskStatus(task.id, isCompleted ? 'Pending' : 'Completed')}
                          title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition active:scale-90 flex-shrink-0 cursor-pointer ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/25' 
                              : 'border-slate-500 hover:border-green-400 hover:bg-green-500/10 text-transparent hover:text-green-400'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3.5]" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Title */}
                      <h4 className={`text-sm font-extrabold break-words ${isCompleted ? 'line-through text-slate-500 font-medium' : isIncomplete ? 'line-through text-red-400/85 font-medium' : ''}`}>
                        {task.title}
                        {isIncomplete && (
                          <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Frozen Incomplete
                          </span>
                        )}
                      </h4>

                      {/* Description if present */}
                      {task.description && (
                        <p className="text-xs text-slate-400 leading-relaxed break-words max-w-full">
                          {task.description}
                        </p>
                      )}

                      {/* Detail metadata row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
                        {/* Subject tag */}
                        {subj && (
                          <span 
                            className="text-[9px] px-1.5 py-0.2 rounded font-extrabold"
                            style={{ backgroundColor: `${subj.color}15`, color: subj.color, border: `1px solid ${subj.color}25` }}
                          >
                            {subj.name}
                          </span>
                        )}

                        {/* Estimated time */}
                        <span className="text-[10px] text-slate-500 font-mono">
                          ⏱️ {task.estimatedTime} mins
                        </span>

                        {/* Priority Tag */}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                          task.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>

                        {/* Deadline */}
                        <span className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {task.deadline} {isOverdue && '(Overdue)'}</span>
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Copy to Today/Tomorrow, Edit and Delete operations */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 self-end sm:self-center flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/20 w-full sm:w-auto justify-end">
                    <button 
                      id={`btn-copy-today-task-${task.id}`}
                      onClick={() => handleCopyTaskToToday(task)}
                      title="Copy task for today"
                      className="flex items-center gap-1 px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition active:scale-90 cursor-pointer text-[10px] font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Today</span>
                    </button>
                    <button 
                      id={`btn-copy-tomorrow-task-${task.id}`}
                      onClick={() => handleCopyTaskToTomorrow(task)}
                      title="Copy task for tomorrow"
                      className="flex items-center gap-1 px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition active:scale-90 cursor-pointer text-[10px] font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tomorrow</span>
                    </button>
                    <button 
                      id={`btn-edit-task-${task.id}`}
                      onClick={() => handleEditClick(task)}
                      disabled={isIncomplete}
                      title={isIncomplete ? "Incomplete tasks are frozen after 00:00 AM and cannot be modified" : "Edit task"}
                      className={`p-2 bg-slate-800/60 rounded-lg transition ${
                        isIncomplete ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700 text-slate-300 active:scale-90 cursor-pointer'
                      }`}
                      style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      id={`btn-delete-task-${task.id}`}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          deleteTask(task.id);
                        }
                      }}
                      className="p-2 bg-slate-800/60 hover:bg-red-950 text-slate-300 hover:text-red-400 rounded-lg transition active:scale-90 cursor-pointer"
                      style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </section>

      {/* TASK EDIT / LOG CREATION MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
          }`}>
            <h4 className="text-lg font-bold mb-4">{editingTaskId ? 'Edit Tracked Task' : 'Register New Study Task'}</h4>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Subject</label>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
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
                      setDeadline(todayStr);
                      setIsCustomDate(false);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      !isCustomDate && deadline === todayStr
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
                      setDeadline(tomorrowStr);
                      setIsCustomDate(false);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      !isCustomDate && deadline === tomorrowStr
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
                      setIsCustomDate(true);
                      if (deadline === todayStr || deadline === tomorrowStr) {
                        setDeadline(addDaysToDateStr(todayStr, 2));
                      }
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCustomDate || (deadline !== todayStr && deadline !== tomorrowStr)
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
                {(isCustomDate || (deadline !== todayStr && deadline !== tomorrowStr)) && (
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      setIsCustomDate(true);
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

              {/* COLLAPSIBLE / DROP ENCLOSED LIST FOR TASK NAME AND DESCRIPTION */}
              <div className="border border-slate-800/80 rounded-xl overflow-hidden" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                <button
                  type="button"
                  onClick={() => setIsNamingTask(!isNamingTask)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition bg-slate-900/10 hover:bg-slate-900/20"
                  style={{ color: theme === 'light' ? '#475569' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined }}
                >
                  <span className="flex items-center gap-1.5">
                    📝 Name the task <span className="text-[10px] opacity-75 font-normal">(Optional)</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isNamingTask ? 'rotate-180' : ''}`} />
                </button>
                
                {isNamingTask && (
                  <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-900/5" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Task Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Complete math chapter 2 problem set" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                        style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Task Description</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Finish questions 1-20. Do active recall self-test." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2.5 rounded-lg border text-sm custom-input bg-slate-900/40 text-white border-slate-800"
                        style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-slate-800 text-slate-400 hover:text-white"
                  style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-grow py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  {editingTaskId ? 'Update Task' : 'Register Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
