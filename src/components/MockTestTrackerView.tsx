/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Plus, Trash2, Calendar, AlertCircle, BookOpen, 
  TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MockTest } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export const MockTestTrackerView: React.FC = () => {
  const { data, addMockTest, deleteMockTest } = useApp();
  const { theme, accentColor } = data.settings;

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Form states
  const [testName, setTestName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [marksObtained, setMarksObtained] = useState(80);
  const [maxMarks, setMaxMarks] = useState(100);
  const [rank, setRank] = useState('');
  const [mistakesText, setMistakesText] = useState('');
  const [notes, setNotes] = useState('');

  // -------------------------------------------------------------
  // STATS PARSING
  // -------------------------------------------------------------
  const tests = [...data.mockTests].sort((a, b) => a.date.localeCompare(b.date));
  const totalTests = tests.length;

  const percentages = tests.map(t => (t.marksObtained / t.maxMarks) * 100);
  const highestScore = percentages.length > 0 ? Math.max(...percentages) : 0;
  const lowestScore = percentages.length > 0 ? Math.min(...percentages) : 0;
  const averageScore = percentages.length > 0 
    ? Math.round(percentages.reduce((acc, p) => acc + p, 0) / percentages.length)
    : 0;

  // Calculate improvement trend: last test score vs average of previous test scores
  const getImprovementTrend = () => {
    if (tests.length < 2) return 'neutral';
    const lastTest = percentages[percentages.length - 1];
    const prevAverage = percentages.slice(0, -1).reduce((acc, p) => acc + p, 0) / (percentages.length - 1);
    
    if (lastTest > prevAverage + 2) return 'up';
    if (lastTest < prevAverage - 2) return 'down';
    return 'neutral';
  };
  const trend = getImprovementTrend();

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !subjectId) return;

    // Split mistakes by newline or commas
    const mistakes = mistakesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    addMockTest({
      testName,
      subjectId,
      date,
      marksObtained,
      maxMarks,
      rank: rank || 'N/A',
      mistakes,
      notes
    });

    // Reset Form
    setTestName('');
    setSubjectId('');
    setRank('');
    setNotes('');
    setMistakesText('');
    setShowAddForm(false);
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">Mock Test Tracker</h3>
          <p className="text-xs text-slate-400 mt-1">Record mock exam grades, log errors, and trace academic progression.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl active:scale-95 transition cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Test</span>
        </button>
      </div>

      {/* QUICK ADD TEST FORM */}
      {showAddForm && (
        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
        }`}>
          <h4 className="text-sm font-bold mb-3">Record Mock Exam Result</h4>
          <form onSubmit={handleCreateTest} className="space-y-3">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Test Title *</label>
                <input 
                  type="text" required placeholder="e.g. JEE Advanced Full Syllabus Test 1"
                  value={testName} onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Exam Subject *</label>
                <select 
                  required
                  value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                >
                  <option value="">Select Subject</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Marks Obtained *</label>
                <input 
                  type="number" required value={marksObtained} onChange={(e) => setMarksObtained(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Maximum Marks *</label>
                <input 
                  type="number" required value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Date taken *</label>
                <input 
                  type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Secured Rank</label>
                <input 
                  type="text" placeholder="e.g. 14 / 200, Top 5%"
                  value={rank} onChange={(e) => setRank(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                  style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Mistakes logged (One per line)</label>
              <textarea 
                rows={2} placeholder="e.g. Misapplied chain rule on Q12&#10;Off-by-one pointer bounds on search function"
                value={mistakesText} onChange={(e) => setMistakesText(e.target.value)}
                className="w-full p-2.5 rounded-lg border text-xs bg-slate-900/30 border-slate-800 text-white"
                style={{ color: theme === 'light' ? '#1e293b' : undefined, backgroundColor: theme === 'light' ? '#f8fafc' : undefined, borderColor: theme === 'light' ? '#cbd5e1' : undefined }}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">General exam notes</label>
              <textarea 
                rows={2} placeholder="Write paper difficulty, time management issues, or topics to study before revision..."
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
                Save Exam Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SCORE METRICS GRID */}
      {totalTests > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Mock Exams</span>
            <p className="text-xl font-black mt-1">{totalTests}</p>
          </div>
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Highest Score</span>
            <p className="text-xl font-black mt-1 text-green-400">{highestScore.toFixed(0)}%</p>
          </div>
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Average Score</span>
            <p className="text-xl font-black mt-1 text-yellow-400">{averageScore}%</p>
          </div>
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Improvement</span>
            <div className="flex items-center gap-1 mt-1 font-black">
              {trend === 'up' && <span className="text-green-400 flex items-center gap-0.5"><TrendingUp className="w-5 h-5" /> Upwards</span>}
              {trend === 'down' && <span className="text-rose-400 flex items-center gap-0.5"><TrendingDown className="w-5 h-5" /> Down</span>}
              {trend === 'neutral' && <span className="text-slate-400">Steady</span>}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SCORE PROGRESSION CHART */}
      {totalTests >= 2 && (
        <div className={`p-5 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
        }`}>
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Score Progression Trend (% Marks)</span>
          </h4>

          <div className="h-28 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
              {(() => {
                const width = 500;
                const height = 70;
                const xSpacing = width / (tests.length - 1);
                
                const points = tests.map((t, idx) => {
                  const pct = (t.marksObtained / t.maxMarks) * 100;
                  const x = idx * xSpacing;
                  // Map 0-100% to height (height - percentage scaled)
                  const y = height - (pct / 100) * 55;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    <polyline 
                      fill="none" 
                      stroke={accentColor} 
                      strokeWidth="2.5" 
                      points={points} 
                      strokeLinecap="round"
                    />
                    {/* Horizontal target/avg reference line */}
                    <line x1="0" y1={height - (averageScore/100)*55} x2="500" y2={height - (averageScore/100)*55} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3" style={{ opacity: 0.5 }} />
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-2 border-t border-slate-800" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
            <span>First test ({tests[0]?.date})</span>
            <span>Last test ({tests[tests.length-1]?.date})</span>
          </div>
        </div>
      )}

      {/* RECORDED TESTS EXPANDABLE ACCORDION LIST */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {data.mockTests.length === 0 ? (
            <motion.div 
              key="empty-mocktests"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-12 rounded-3xl text-center border flex flex-col items-center justify-center space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(148,163,184,0.04)]' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Award className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-400">No mock exam results logged yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Log mock exams, record rank status, and capture conceptual mistakes to review before finals.
                </p>
              </div>
            </motion.div>
          ) : (
            [...data.mockTests].sort((a,b) => b.date.localeCompare(a.date)).map(test => {
              const isExpanded = expandedTestId === test.id;
              const percentage = Math.round((test.marksObtained / test.maxMarks) * 100);
              const subj = data.subjects.find(s => s.id === test.subjectId);

              return (
                <motion.div 
                  key={test.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(148, 163, 184, 0.05)' }}
                  className={`p-4 rounded-xl border transition-all ${
                    theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}
                >
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 flex-shrink-0" style={{ backgroundColor: `${subj?.color}15`, color: subj?.color }}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm truncate max-w-[160px] md:max-w-xs">{test.testName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{test.date} • Subject: <b>{subj?.name || 'General'}</b></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-yellow-400">{test.marksObtained} / {test.maxMarks}</span>
                      <p className="text-[10px] text-slate-400 font-mono">Score: <b>{percentage}%</b></p>
                    </div>
                    <button className="text-slate-400 hover:text-white transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
                    
                    {/* Metadata Row */}
                    <div className="flex gap-4 text-[10px] font-mono text-slate-400 flex-wrap">
                      <span>Secured Rank: <b className="text-white" style={{ color: theme === 'light' ? '#1e293b' : undefined }}>{test.rank}</b></span>
                      <span>Exam Date: <b className="text-white" style={{ color: theme === 'light' ? '#1e293b' : undefined }}>{test.date}</b></span>
                    </div>

                    {/* Mistakes logged */}
                    {test.mistakes && test.mistakes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Logged Mistakes & Concepts to fix:</span>
                        <div className="space-y-1 pl-1">
                          {test.mistakes.map((mis, idx) => (
                            <div key={idx} className="flex gap-2 items-start text-slate-300" style={{ color: theme === 'light' ? '#334155' : undefined }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                              <p className="leading-relaxed">{mis}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {test.notes && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Self Assessment Notes:</span>
                        <p className="text-slate-400 italic pl-1 leading-relaxed">{test.notes}</p>
                      </div>
                    )}

                    {/* Delete operation */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (confirm(`Delete mock test record "${test.testName}"? This will retract earned XP.`)) {
                            deleteMockTest(test.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Record</span>
                      </button>
                    </div>

                  </div>
                )}

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
