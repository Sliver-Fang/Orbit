/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Plus, Trash2, Edit2, AlertCircle, CheckCircle, 
  Settings, Award, Clock, ArrowLeft, MoreVertical, Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, Chapter, ChapterStatus, PriorityLevel, DifficultyLevel } from '../types';

export const SubjectManager: React.FC = () => {
  const { data, addSubject, deleteSubject, addChapter, updateChapter, deleteChapter } = useApp();
  const { theme, accentColor } = data.settings;

  // Active Subject Selection (shows details/chapters)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Forms Visibility
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);

  // Form State: Subject
  const [subjName, setSubjName] = useState('');
  const [subjColor, setSubjColor] = useState('#3b82f6');

  // Form State: Chapter
  const [chapName, setChapName] = useState('');
  const [chapStatus, setChapStatus] = useState<ChapterStatus>('Not Started');
  const [chapCompletion, setChapCompletion] = useState(0);
  const [chapDifficulty, setChapDifficulty] = useState<DifficultyLevel>('Medium');
  const [chapEstTime, setChapEstTime] = useState(10);
  const [chapNotes, setChapNotes] = useState('');
  const [chapPriority, setChapPriority] = useState<PriorityLevel>('Medium');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;
    addSubject(subjName, subjColor);
    setSubjName('');
    setShowSubjectForm(false);
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapName.trim() || !activeSubjectId) return;
    
    addChapter({
      subjectId: activeSubjectId,
      name: chapName,
      status: chapStatus,
      completionPct: chapStatus === 'Mastered' ? 100 : chapStatus === 'Not Started' ? 0 : chapCompletion,
      difficulty: chapDifficulty,
      estimatedTime: chapEstTime,
      notes: chapNotes,
      revisionsCount: 0,
      priority: chapPriority
    });

    setChapName('');
    setChapNotes('');
    setChapStatus('Not Started');
    setChapCompletion(0);
    setShowChapterForm(false);
  };

  const toggleChapterStatus = (chapter: Chapter) => {
    const statusMap: Record<ChapterStatus, ChapterStatus> = {
      'Not Started': 'In Progress',
      'In Progress': 'Revised',
      'Revised': 'Mastered',
      'Mastered': 'Not Started'
    };
    const nextStatus = statusMap[chapter.status];
    updateChapter({
      ...chapter,
      status: nextStatus,
      completionPct: nextStatus === 'Mastered' ? 100 : nextStatus === 'Not Started' ? 0 : chapter.completionPct
    });
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  // Find currently active subject object
  const activeSubject = data.subjects.find(s => s.id === activeSubjectId);
  const activeSubjectChapters = data.chapters.filter(c => c.subjectId === activeSubjectId);

  return (
    <div className="space-y-6">
      
      {!activeSubjectId ? (
        // =============================================================
        // SUBJECTS GENERAL OVERVIEW LIST
        // =============================================================
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">All Subjects</h3>
            <button
              onClick={() => setShowSubjectForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl active:scale-95 transition cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* New Subject Form Modal */}
          {showSubjectForm && (
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/10 space-y-4" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Create New Subject</h4>
              <form onSubmit={handleCreateSubject} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Subject Title *</label>
                  <input 
                    type="text" required placeholder="e.g. Organic Chemistry, Real Analysis"
                    value={subjName} onChange={(e) => setSubjName(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Color Palette</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" value={subjColor} onChange={(e) => setSubjColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs font-mono">{subjColor}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 w-full sm:w-auto">
                  <button 
                    type="button" onClick={() => setShowSubjectForm(false)}
                    className="flex-1 sm:flex-initial px-3 py-2 border border-slate-800 hover:text-white rounded-lg text-xs"
                    style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" className="flex-1 sm:flex-initial px-4 py-2 text-white font-bold rounded-lg text-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}

          {data.subjects.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center ${theme === 'light' ? 'bg-white' : 'bg-white/5'}`}>
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-xs text-slate-400">No subjects cataloged. Click Add Subject to define your syllabus folders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.subjects.map(subj => {
                // Calculate detailed subject statistics
                const subjChapters = data.chapters.filter(c => c.subjectId === subj.id);
                const chapCount = subjChapters.length;
                const masteredCount = subjChapters.filter(c => c.status === 'Mastered').length;
                
                const sessions = data.studySessions.filter(s => s.subjectId === subj.id);
                const totalMins = sessions.reduce((acc, s) => acc + s.duration, 0);
                const totalHrs = totalMins / 60;
                
                const mockTests = data.mockTests.filter(m => m.subjectId === subj.id);
                const avgMockScore = mockTests.length > 0 
                  ? Math.round(mockTests.reduce((acc, m) => acc + (m.marksObtained / m.maxMarks * 100), 0) / mockTests.length)
                  : null;

                return (
                  <div 
                    key={subj.id}
                    onClick={() => setActiveSubjectId(subj.id)}
                    className={`p-5 rounded-2xl border cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden group ${
                      theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    {/* Subject Color Line indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: subj.color }} />
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-base group-hover:text-blue-400 transition">{subj.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono font-semibold uppercase mt-0.5 tracking-wider">{chapCount} Chapters cataloged</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete subject "${subj.name}"? This will recursively wipe out all chapters, sessions, mock tests, and revision history mapped to it.`)) {
                            deleteSubject(subj.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stats bento layout inside card */}
                    <div className="grid grid-cols-3 gap-2 border-t pt-3 border-slate-800 text-xs mt-3" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Studied</span>
                        <span className="font-extrabold">{totalHrs.toFixed(1)} <span className="text-[10px] text-slate-500">Hrs</span></span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Mastered</span>
                        <span className="font-extrabold text-green-400">{masteredCount}/{chapCount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Mock Avg</span>
                        <span className="font-extrabold text-yellow-400">{avgMockScore ? `${avgMockScore}%` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-3 group-hover:translate-x-1 transition-transform">
                      <span>Manage chapters & syllabus</span>
                      <Layers className="w-3 h-3" />
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // =============================================================
        // SINGLE SUBJECT CHAPTER MANAGER SCREEN
        // =============================================================
        <div className="space-y-4">
          
          {/* Sub Navigation Back row */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveSubjectId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Subjects</span>
            </button>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded" style={{ backgroundColor: `${activeSubject?.color}15`, color: activeSubject?.color }}>
              Syllabus Detail Folder
            </span>
          </div>

          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-800" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
            <div>
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: activeSubject?.color }} />
                <span>{activeSubject?.name} Chapters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Review topics completion status, write syllabus cards, and log revisions.</p>
            </div>
            
            <button
              onClick={() => setShowChapterForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl active:scale-95 transition cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>
          </header>

          {/* New Chapter Modal Overlay/Dropdown */}
          {showChapterForm && (
            <div className={`p-5 rounded-2xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
            }`}>
              <h4 className="text-sm font-bold mb-3">Add Chapter to {activeSubject?.name}</h4>
              <form onSubmit={handleCreateChapter} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Chapter Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Integration by parts, Vector subspaces"
                    value={chapName} onChange={(e) => setChapName(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Difficulty Level</label>
                    <select 
                      value={chapDifficulty} onChange={(e) => setChapDifficulty(e.target.value as any)}
                      className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Syllabus Priority</label>
                    <select 
                      value={chapPriority} onChange={(e) => setChapPriority(e.target.value as any)}
                      className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Status</label>
                    <select 
                      value={chapStatus} onChange={(e) => setChapStatus(e.target.value as any)}
                      className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Revised">Revised</option>
                      <option value="Mastered">Mastered</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Est. Completion Hours</label>
                    <input 
                      type="number" value={chapEstTime} onChange={(e) => setChapEstTime(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                      style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                    />
                  </div>
                </div>

                {chapStatus === 'In Progress' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Completion Slider ({chapCompletion}%)</label>
                    <input 
                      type="range" min="0" max="95" step="5" value={chapCompletion} onChange={(e) => setChapCompletion(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Study Notes</label>
                  <textarea 
                    rows={2} placeholder="Write high-level formulas, key definitions, or core focus areas..."
                    value={chapNotes} onChange={(e) => setChapNotes(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                    style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  />
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button 
                    type="button" onClick={() => setShowChapterForm(false)}
                    className="flex-1 py-1.5 text-xs font-semibold border border-slate-800 hover:text-white rounded-lg"
                    style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" className="flex-grow py-1.5 text-xs font-bold text-white rounded-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    Register Chapter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chapters listing */}
          {activeSubjectChapters.length === 0 ? (
            <div className={`p-10 rounded-2xl border text-center ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-white/5'}`}>
              <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400">No chapters cataloged in this subject syllabus.</p>
              <button onClick={() => setShowChapterForm(true)} className="text-blue-400 text-xs font-bold mt-1.5 hover:underline block mx-auto">Create first chapter</button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSubjectChapters.map(chap => {
                
                // Color status helper
                const getStatusStyle = (status: ChapterStatus) => {
                  switch (status) {
                    case 'Mastered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    case 'Revised': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                    case 'In Progress': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    case 'Not Started':
                    default:
                      return 'bg-slate-800 text-slate-400 border border-slate-700/60';
                  }
                };

                return (
                  <div key={chap.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${getStatusStyle(chap.status)}`}>
                          {chap.status}
                        </span>
                        
                        {/* Priority */}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                          chap.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                          chap.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {chap.priority} Priority
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          Difficulty: {chap.difficulty}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold leading-snug">{chap.name}</h4>
                      
                      {chap.notes && (
                        <p className="text-xs text-slate-400 border-l border-slate-700/80 pl-2 leading-relaxed max-w-lg" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
                          {chap.notes}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <div className="w-24 bg-slate-800 rounded-full h-1 overflow-hidden" style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${chap.completionPct}%`, backgroundColor: chap.status === 'Mastered' ? '#10b981' : undefined }} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{chap.completionPct}% Completed</span>
                      </div>
                    </div>

                    {/* Quick action buttons on chapter */}
                    <div className="flex items-center gap-3 justify-end md:self-center border-t md:border-t-0 pt-2.5 md:pt-0" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                      <button
                        onClick={() => toggleChapterStatus(chap)}
                        className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete chapter "${chap.name}"?`)) {
                            deleteChapter(chap.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
