/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Moon, Zap, Activity, Plus, Trash2, Heart, 
  Smile, Flame, Footprints, AlertCircle, Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const RecoveryActivityTracker: React.FC = () => {
  const { data, logRecovery, logActivity } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness;
  const recoveryEntries = fitness?.recoveryEntries || [];
  const activityEntries = fitness?.activityEntries || [];
  const todayStr = getLocalDateString();

  const [activeTab, setActiveTab] = useState<'recovery' | 'activity'>('recovery');

  // Recovery Log State
  const [recDate, setRecDate] = useState(todayStr);
  const [sleepHours, setSleepHours] = useState<number | ''>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);
  const [soreness, setSoreness] = useState<number>(2);
  const [stress, setStress] = useState<number>(2);
  const [recNotes, setRecNotes] = useState('');
  const [showRecForm, setShowRecForm] = useState(false);

  // Activity Log State
  const [actDate, setActDate] = useState(todayStr);
  const [steps, setSteps] = useState<number | ''>(8500);
  const [activeMinutes, setActiveMinutes] = useState<number | ''>(45);
  const [cardioType, setCardioType] = useState('Brisk Walking');
  const [actNotes, setActNotes] = useState('');
  const [showActForm, setShowActForm] = useState(false);

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    logRecovery({
      date: recDate,
      sleepHours: Number(sleepHours) || 7,
      sleepQuality,
      energy,
      soreness,
      stress,
      notes: recNotes
    });
    setShowRecForm(false);
    setRecNotes('');
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    logActivity({
      date: actDate,
      steps: steps !== '' ? Number(steps) : undefined,
      activeMinutes: activeMinutes !== '' ? Number(activeMinutes) : undefined,
      cardioType,
      notes: actNotes
    });
    setShowActForm(false);
    setActNotes('');
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';
  const cardBgClass = isDark 
    ? 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';
  const inputBg = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Sleep, Recovery & Daily Activity
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track sleep duration, energy, muscle soreness, and daily step counts.</p>
        </div>

        <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'recovery' ? 'bg-purple-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-4 h-4" /> Sleep & Recovery
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'activity' ? 'bg-purple-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Footprints className="w-4 h-4" /> Daily Activity
          </button>
        </div>
      </div>

      {/* RECOVERY SUB TAB */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-purple-400">Sleep & Soreness Logs</h4>
            <button
              onClick={() => setShowRecForm(!showRecForm)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Sleep & Energy
            </button>
          </div>

          {/* Collapsible Form */}
          {showRecForm && (
            <form onSubmit={handleSaveRecovery} className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
              <h4 className="font-extrabold text-sm text-purple-400">Log Sleep & Recovery</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={recDate} 
                    onChange={e => setRecDate(e.target.value)} 
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sleep Hours</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={sleepHours} 
                    onChange={e => setSleepHours(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="7.5"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sleep Quality (1-5)</label>
                  <select 
                    value={sleepQuality} 
                    onChange={e => setSleepQuality(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:outline-none"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terribe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Energy Level (1-5)</label>
                  <select 
                    value={energy} 
                    onChange={e => setEnergy(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:outline-none"
                  >
                    <option value={5}>⚡ 5 - High Energy</option>
                    <option value={4}>⚡ 4 - Good Energy</option>
                    <option value={3}>⚡ 3 - Average</option>
                    <option value={2}>⚡ 2 - Sluggish</option>
                    <option value={1}>⚡ 1 - Exhausted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Muscle Soreness (1-5)</label>
                  <select 
                    value={soreness} 
                    onChange={e => setSoreness(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:outline-none"
                  >
                    <option value={1}>1 - None (Fully Recovered)</option>
                    <option value={2}>2 - Mild</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Very Sore</option>
                    <option value={5}>5 - Extremely Sore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Recovery Notes</label>
                <input 
                  type="text" 
                  value={recNotes} 
                  onChange={e => setRecNotes(e.target.value)} 
                  placeholder="Slept deeply, legs feel slightly sore from squats..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {/* Recovery Log Table */}
          {recoveryEntries.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${cardBgClass} space-y-2`}>
              <Moon className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-300">No sleep or recovery logs recorded</p>
            </div>
          ) : (
            <div className={`rounded-2xl border ${cardBgClass} overflow-x-auto`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Sleep Hours</th>
                    <th className="p-3.5">Sleep Quality</th>
                    <th className="p-3.5">Energy Level</th>
                    <th className="p-3.5">Soreness</th>
                    <th className="p-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
                  {recoveryEntries.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold font-mono text-purple-400">{r.date}</td>
                      <td className="p-3.5 font-extrabold">{r.sleepHours} hrs</td>
                      <td className="p-3.5">{r.sleepQuality ? `${r.sleepQuality}/5` : '-'}</td>
                      <td className="p-3.5 text-amber-400 font-bold">{r.energy ? `⚡ ${r.energy}/5` : '-'}</td>
                      <td className="p-3.5 text-slate-300">{r.soreness ? `${r.soreness}/5` : '-'}</td>
                      <td className="p-3.5 text-slate-400 italic text-[11px] truncate max-w-[150px]">{r.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY SUB TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-purple-400">Steps & Cardio Activity</h4>
            <button
              onClick={() => setShowActForm(!showActForm)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Activity
            </button>
          </div>

          {showActForm && (
            <form onSubmit={handleSaveActivity} className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
              <h4 className="font-extrabold text-sm text-purple-400">Log Daily Steps & Activity</h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={actDate} 
                    onChange={e => setActDate(e.target.value)} 
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Steps Count</label>
                  <input 
                    type="number" 
                    value={steps} 
                    onChange={e => setSteps(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="8000"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Active Minutes</label>
                  <input 
                    type="number" 
                    value={activeMinutes} 
                    onChange={e => setActiveMinutes(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="45"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Cardio Type</label>
                  <input 
                    type="text" 
                    value={cardioType} 
                    onChange={e => setCardioType(e.target.value)} 
                    placeholder="Walking / Cycling"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Notes</label>
                <input 
                  type="text" 
                  value={actNotes} 
                  onChange={e => setActNotes(e.target.value)} 
                  placeholder="Evening walk in park..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition cursor-pointer"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          )}

          {activityEntries.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${cardBgClass} space-y-2`}>
              <Footprints className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-300">No activity logs recorded</p>
            </div>
          ) : (
            <div className={`rounded-2xl border ${cardBgClass} overflow-x-auto`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Steps</th>
                    <th className="p-3.5">Active Minutes</th>
                    <th className="p-3.5">Cardio Type</th>
                    <th className="p-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
                  {activityEntries.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold font-mono text-purple-400">{a.date}</td>
                      <td className="p-3.5 font-extrabold">{a.steps ? `${a.steps.toLocaleString()} steps` : '-'}</td>
                      <td className="p-3.5 font-bold text-slate-300">{a.activeMinutes ? `${a.activeMinutes} mins` : '-'}</td>
                      <td className="p-3.5 text-slate-400">{a.cardioType || '-'}</td>
                      <td className="p-3.5 text-slate-400 italic text-[11px] truncate max-w-[150px]">{a.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
