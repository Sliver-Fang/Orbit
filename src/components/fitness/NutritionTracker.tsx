/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Flame, Plus, Trash2, Settings, CheckCircle2, 
  AlertTriangle, Droplet, Check, Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NutritionEntry } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';

export const NutritionTracker: React.FC = () => {
  const { data, logNutrition, updateFitnessProfile } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness;
  const profile = fitness?.profile || { calorieTarget: 2200, proteinTarget: 120, waterTargetLiters: 3 };
  const entries = fitness?.nutritionEntries || [];
  const todayStr = getLocalDateString();

  const [date, setDate] = useState(todayStr);
  const [calories, setCalories] = useState<number | ''>(2100);
  const [protein, setProtein] = useState<number | ''>(115);
  const [carbs, setCarbs] = useState<number | ''>(240);
  const [fats, setFats] = useState<number | ''>(65);
  const [waterLiters, setWaterLiters] = useState<number | ''>(3);
  const [notes, setNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Target modal form state
  const [targetCals, setTargetCals] = useState(profile.calorieTarget);
  const [targetProt, setTargetProt] = useState(profile.proteinTarget);
  const [targetWater, setTargetWater] = useState(profile.waterTargetLiters);

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    logNutrition({
      date,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: carbs !== '' ? Number(carbs) : undefined,
      fats: fats !== '' ? Number(fats) : undefined,
      waterLiters: waterLiters !== '' ? Number(waterLiters) : undefined,
      notes
    });
    setShowLogForm(false);
    setNotes('');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateFitnessProfile({
      calorieTarget: Number(targetCals) || 2200,
      proteinTarget: Number(targetProt) || 120,
      waterTargetLiters: Number(targetWater) || 3
    });
    setShowTargetModal(false);
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
            <Flame className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Daily Nutrition & Protein Tracking
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Log daily calories, protein intake, and water consumption to ensure goal adherence.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTargetModal(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Adjust Goals
          </button>

          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Nutrition
          </button>
        </div>
      </div>

      {/* Goal Targets Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3`}>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calorie Target</span>
            <p className="text-xl font-black">{profile.calorieTarget} <span className="text-xs text-slate-400">kcal/day</span></p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3`}>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protein Target</span>
            <p className="text-xl font-black">{profile.proteinTarget} <span className="text-xs text-slate-400">g/day</span></p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3`}>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Water Target</span>
            <p className="text-xl font-black">{profile.waterTargetLiters} <span className="text-xs text-slate-400">Liters/day</span></p>
          </div>
        </div>
      </div>

      {/* Log Form Collapsible */}
      {showLogForm && (
        <form onSubmit={handleSaveLog} className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
          <h4 className="font-extrabold text-sm text-emerald-400">Log Daily Nutrition Intake</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Calories (kcal)</label>
              <input 
                type="number" 
                value={calories} 
                onChange={e => setCalories(e.target.value ? Number(e.target.value) : '')} 
                placeholder="2200"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Protein (g)</label>
              <input 
                type="number" 
                value={protein} 
                onChange={e => setProtein(e.target.value ? Number(e.target.value) : '')} 
                placeholder="120"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Carbs (g)</label>
              <input 
                type="number" 
                value={carbs} 
                onChange={e => setCarbs(e.target.value ? Number(e.target.value) : '')} 
                placeholder="250"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Fats (g)</label>
              <input 
                type="number" 
                value={fats} 
                onChange={e => setFats(e.target.value ? Number(e.target.value) : '')} 
                placeholder="60"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Water (Liters)</label>
              <input 
                type="number" 
                step="0.5"
                value={waterLiters} 
                onChange={e => setWaterLiters(e.target.value ? Number(e.target.value) : '')} 
                placeholder="3.0"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Meal Notes / Source</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="3 eggs, chicken breast, whey protein shake..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition cursor-pointer"
            >
              Save Nutrition Entry
            </button>
          </div>
        </form>
      )}

      {/* History Log Table */}
      {entries.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${cardBgClass} space-y-2`}>
          <Flame className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs font-bold text-slate-300">No nutrition logs found</p>
          <p className="text-[11px] text-slate-500">Log daily calories and protein to unlock adherence badges and track macros.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${cardBgClass} overflow-x-auto`}>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Calories</th>
                <th className="p-3.5">Protein</th>
                <th className="p-3.5">Carbs / Fats</th>
                <th className="p-3.5">Water</th>
                <th className="p-3.5">Adherence Status</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
              {entries.map((n) => (
                <tr key={n.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold font-mono text-emerald-400">{n.date}</td>
                  <td className="p-3.5 font-extrabold">{n.calories} kcal</td>
                  <td className="p-3.5 font-bold text-blue-400">{n.protein} g</td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                    {n.carbs ? `${n.carbs}g C` : '-'} / {n.fats ? `${n.fats}g F` : '-'}
                  </td>
                  <td className="p-3.5 text-cyan-400 font-mono">{n.waterLiters ? `${n.waterLiters} L` : '-'}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      n.adherence === 'Hit target' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      n.adherence === 'Close' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {n.adherence}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 italic text-[11px] truncate max-w-[150px]">{n.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Target Adjustment Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveTargets} className="max-w-md w-full bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> Adjust Nutrition Targets
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Daily Calorie Target (kcal)</label>
                <input 
                  type="number" 
                  value={targetCals} 
                  onChange={e => setTargetCals(Number(e.target.value))} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Daily Protein Target (grams)</label>
                <input 
                  type="number" 
                  value={targetProt} 
                  onChange={e => setTargetProt(Number(e.target.value))} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Daily Water Target (Liters)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={targetWater} 
                  onChange={e => setTargetWater(Number(e.target.value))} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition cursor-pointer"
              >
                Save Targets
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
