/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Plus, Trash2, Calendar, AlertCircle, BookOpen, 
  Star, HelpCircle, Sparkles, CheckCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Revision } from '../types';
import { getLocalDateString, getTomorrowLocalDateString, addDaysToDateStr } from '../utils/dateUtils';

export const RevisionTrackerView: React.FC = () => {
  const { data, addRevision, deleteRevision } = useApp();
  const { theme, accentColor } = data.settings;

  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [revisionNumber, setRevisionNumber] = useState(1);
  const [retentionRating, setRetentionRating] = useState(3);
  const [date, setDate] = useState(getLocalDateString());
  const [nextRevisionDate, setNextRevisionDate] = useState(() => getTomorrowLocalDateString());
  const [notes, setNotes] = useState('');

  // Automatically recalculate Leitner suggested next revision date based on cycle
  const handleRevisionNumChange = (cycle: number) => {
    setRevisionNumber(cycle);
    
    // Leitner intervals: Cycle 1 = +1 day, Cycle 2 = +3 days, Cycle 3 = +7 days, Cycle 4 = +15 days, Cycle 5 = +30 days
    const intervals: Record<number, number> = {
      1: 1,
      2: 3,
      3: 7,
      4: 15,
      5: 30
    };
    const daysToAdd = intervals[cycle] || 7;
    setNextRevisionDate(addDaysToDateStr(date, daysToAdd));
  };

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !chapterId) return;

    addRevision({
      subjectId,
      chapterId,
      date,
      revisionNumber,
      retentionRating,
      nextRevisionDate,
      notes
    });

    setSubjectId('');
    setChapterId('');
    setNotes('');
    setRevisionNumber(1);
    setShowAddForm(false);
  };

  const todayStr = getLocalDateString();

  // Compile active list of scheduled revisions due TODAY or OVERDUE
  const upcomingRevisions = data.revisions.filter(r => r.nextRevisionDate <= todayStr);

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">Leitner Spaced Revision</h3>
          <p className="text-xs text-slate-400 mt-1">Conquer cognitive memory decay. Keep track of self-testing cycles.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl active:scale-95 transition cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Revision</span>
        </button>
      </div>

      {/* QUICK ADD REVISION LOG FORM */}
      {showAddForm && (
        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
        }`}>
          <h4 className="text-sm font-bold mb-3">Schedule or Log Active Revision</h4>
          <form onSubmit={handleCreateRevision} className="space-y-3">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Subject Folder *</label>
                <select 
                  required
                  value={subjectId} onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="">Select Subject</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Chapter Concept *</label>
                <select 
                  required
                  disabled={!subjectId}
                  value={chapterId} onChange={(e) => setChapterId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white disabled:opacity-40"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="">Select Chapter</option>
                  {data.chapters.filter(c => c.subjectId === subjectId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Revision Cycle</label>
                <select 
                  value={revisionNumber} onChange={(e) => handleRevisionNumChange(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="1">Revision #1 (Due +1d)</option>
                  <option value="2">Revision #2 (Due +3d)</option>
                  <option value="3">Revision #3 (Due +7d)</option>
                  <option value="4">Revision #4 (Due +15d)</option>
                  <option value="5">Revision #5 (Due +30d)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Retention Rating</label>
                <select 
                  value={retentionRating} onChange={(e) => setRetentionRating(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="1">⭐ Weak recall</option>
                  <option value="2">⭐⭐ Shaky</option>
                  <option value="3">⭐⭐⭐ Decent</option>
                  <option value="4">⭐⭐⭐⭐ Solid</option>
                  <option value="5">⭐⭐⭐⭐⭐ Mastered</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Date Solved *</label>
                <input 
                  type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Suggested Next Revision Date</label>
              <input 
                type="date" required value={nextRevisionDate} onChange={(e) => setNextRevisionDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white font-bold"
                style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Active recall notes (Key formulas, summary)</label>
              <textarea 
                rows={2} placeholder="Write brief triggers, summary questions, or Leitner cards pointers..."
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              />
            </div>

            <div className="flex gap-2 pt-1.5">
              <button 
                type="button" onClick={() => setShowAddForm(false)}
                className="flex-1 py-1.5 text-xs font-semibold border border-slate-800 hover:text-white rounded-lg"
                style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              >
                Cancel
              </button>
              <button 
                type="submit" className="flex-grow py-1.5 text-xs font-bold text-white rounded-lg"
                style={{ backgroundColor: accentColor }}
              >
                Register Revision Cycle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVISIONS ACTIVE DEMAND NOTIFICATION GRID */}
      {upcomingRevisions.length > 0 && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
          <h5 className="font-extrabold text-xs text-yellow-400 flex items-center gap-1.5 uppercase">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span>Revision due list ({upcomingRevisions.length})</span>
          </h5>
          <p className="text-[11px] text-slate-400">The following concepts are scheduled for review according to your Leitner intervals. Self-test to lock memory.</p>
          
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pt-1 pr-1">
            {upcomingRevisions.map(r => {
              const subj = data.subjects.find(s => s.id === r.subjectId);
              const chap = data.chapters.find(c => c.id === r.chapterId);
              return (
                <div key={r.id} className="p-2 bg-slate-900/40 rounded-lg text-xs flex justify-between items-center">
                  <span>
                    <b className="font-extrabold" style={{ color: subj?.color }}>{subj?.name}</b> • {chap?.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase font-black">Cycle #{r.revisionNumber}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL HISTORICAL REVISION LIST */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {data.revisions.length === 0 ? (
            <motion.div 
              key="empty-revisions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-12 rounded-3xl text-center border flex flex-col items-center justify-center space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(148,163,184,0.04)]' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Layers className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-400">No revisions logged.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Log revisions using the Leitner system. Active recall interval cycles will schedule your review milestones.
                </p>
              </div>
            </motion.div>
          ) : (
            [...data.revisions].sort((a,b) => b.date.localeCompare(a.date)).map(rev => {
              const subj = data.subjects.find(s => s.id === rev.subjectId);
              const chap = data.chapters.find(c => c.id === rev.chapterId);

              return (
                <motion.div 
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(148, 163, 184, 0.05)' }}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}
                >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {subj && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider" style={{ backgroundColor: `${subj.color}15`, color: subj.color }}>
                        {subj.name}
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      Cycle #{rev.revisionNumber}
                    </span>
                    
                    {/* Stars */}
                    <div className="flex items-center text-yellow-400 gap-0.5">
                      {Array.from({ length: rev.retentionRating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold leading-snug">{chap?.name || 'Deleted Concept'}</h4>
                  
                  {rev.notes && (
                    <p className="text-xs text-slate-400 italic max-w-lg pl-1 leading-relaxed">
                      "{rev.notes}"
                    </p>
                  )}

                  <div className="flex gap-3 text-[10px] text-slate-500 font-mono pt-1">
                    <span>Solved: {rev.date}</span>
                    <span>Next Review: <b className="text-slate-400">{rev.nextRevisionDate}</b></span>
                  </div>
                </div>

                {/* Operations */}
                <button
                  onClick={() => {
                    if (confirm('Delete this revision cycle record?')) {
                      deleteRevision(rev.id);
                    }
                  }}
                  className="p-1.5 bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition flex-shrink-0"
                  style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
