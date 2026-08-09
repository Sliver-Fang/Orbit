/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scale, Camera, Calendar, Plus, Trash2, TrendingUp, 
  Image as ImageIcon, ChevronRight, Check, AlertCircle, Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BodyMeasurement, ProgressPhoto } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';

export const BodyProgressTracker: React.FC = () => {
  const { data, addBodyMeasurement, deleteBodyMeasurement, addProgressPhoto, deleteProgressPhoto } = useApp();
  const theme = data.settings.theme;
  const fitness = data.fitness;
  const todayStr = getLocalDateString();

  const [activeSubTab, setActiveSubTab] = useState<'measurements' | 'photos'>('measurements');

  // Measurement Form state
  const [mDate, setMDate] = useState(todayStr);
  const [mWeight, setMWeight] = useState<number | ''>(52);
  const [mWaist, setMWaist] = useState<number | ''>('');
  const [mChest, setMChest] = useState<number | ''>('');
  const [mShoulders, setMShoulders] = useState<number | ''>('');
  const [mArm, setMArm] = useState<number | ''>('');
  const [mThigh, setMThigh] = useState<number | ''>('');
  const [mNeck, setMNeck] = useState<number | ''>('');
  const [mNotes, setMNotes] = useState('');
  const [showMForm, setShowMForm] = useState(false);

  // Photo Form state
  const [photoDate, setPhotoDate] = useState(todayStr);
  const [photoType, setPhotoType] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<ProgressPhoto | null>(null);

  const measurements = fitness?.bodyMeasurements || [];
  const photos = fitness?.progressPhotos || [];

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyMeasurement({
      date: mDate,
      weight: mWeight !== '' ? Number(mWeight) : undefined,
      waist: mWaist !== '' ? Number(mWaist) : undefined,
      chest: mChest !== '' ? Number(mChest) : undefined,
      shoulders: mShoulders !== '' ? Number(mShoulders) : undefined,
      upperArm: mArm !== '' ? Number(mArm) : undefined,
      thigh: mThigh !== '' ? Number(mThigh) : undefined,
      neck: mNeck !== '' ? Number(mNeck) : undefined,
      notes: mNotes
    });
    setShowMForm(false);
    setMNotes('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    addProgressPhoto({
      date: photoDate,
      photoType,
      imageUrl: photoUrl,
      notes: photoNotes
    });
    setShowPhotoForm(false);
    setPhotoUrl('');
    setPhotoNotes('');
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';
  const cardBgClass = isDark 
    ? 'bg-slate-900/60 border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';
  const inputBg = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Body & Measurement Progress
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track body weight, tape measurements, and progress photos over time.</p>
        </div>

        <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveSubTab('measurements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'measurements' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" /> Measurements
          </button>

          <button
            onClick={() => setActiveSubTab('photos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'photos' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" /> Progress Photos ({photos.length})
          </button>
        </div>
      </div>

      {/* MEASUREMENTS SUB-TAB */}
      {activeSubTab === 'measurements' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Measurement Records</h4>
            <button
              onClick={() => setShowMForm(!showMForm)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Measurements
            </button>
          </div>

          {/* New Measurement Modal / Collapsible Form */}
          {showMForm && (
            <form onSubmit={handleSaveMeasurement} className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
              <h4 className="font-extrabold text-sm text-blue-400">Add Measurement Log</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={mDate} 
                    onChange={e => setMDate(e.target.value)} 
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Body Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={mWeight} 
                    onChange={e => setMWeight(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 52.5"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Waist (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mWaist} 
                    onChange={e => setMWaist(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 74"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Chest (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mChest} 
                    onChange={e => setMChest(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 92"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Shoulders (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mShoulders} 
                    onChange={e => setMShoulders(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 110"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Upper Arm (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mArm} 
                    onChange={e => setMArm(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 32"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Thigh (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mThigh} 
                    onChange={e => setMThigh(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 54"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Neck (cm)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={mNeck} 
                    onChange={e => setMNeck(e.target.value ? Number(e.target.value) : '')} 
                    placeholder="e.g. 36"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Notes</label>
                <input 
                  type="text" 
                  value={mNotes} 
                  onChange={e => setMNotes(e.target.value)} 
                  placeholder="Morning weigh-in before breakfast..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition cursor-pointer"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          )}

          {/* Measurements List Table */}
          {measurements.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${cardBgClass} space-y-2`}>
              <Scale className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-300">No body measurement logs yet</p>
              <p className="text-[11px] text-slate-500">Record weekly or monthly waist, chest, and weight measurements to track transformation.</p>
            </div>
          ) : (
            <div className={`rounded-2xl border ${cardBgClass} overflow-x-auto`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Weight</th>
                    <th className="p-3.5">Waist</th>
                    <th className="p-3.5">Chest</th>
                    <th className="p-3.5">Shoulders</th>
                    <th className="p-3.5">Upper Arm</th>
                    <th className="p-3.5">Thigh</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold font-mono text-blue-400">{m.date}</td>
                      <td className="p-3.5 font-extrabold">{m.weight ? `${m.weight} kg` : '-'}</td>
                      <td className="p-3.5">{m.waist ? `${m.waist} cm` : '-'}</td>
                      <td className="p-3.5">{m.chest ? `${m.chest} cm` : '-'}</td>
                      <td className="p-3.5">{m.shoulders ? `${m.shoulders} cm` : '-'}</td>
                      <td className="p-3.5">{m.upperArm ? `${m.upperArm} cm` : '-'}</td>
                      <td className="p-3.5">{m.thigh ? `${m.thigh} cm` : '-'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => deleteBodyMeasurement(m.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete Measurement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS PHOTOS SUB-TAB */}
      {activeSubTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Progress Photo Gallery</h4>
            <button
              onClick={() => setShowPhotoForm(!showPhotoForm)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Progress Photo
            </button>
          </div>

          {/* Photo Upload Form */}
          {showPhotoForm && (
            <form onSubmit={handleSavePhoto} className={`p-5 rounded-2xl border ${cardBgClass} space-y-4`}>
              <h4 className="font-extrabold text-sm text-blue-400">Upload Progress Photo</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Photo Date</label>
                  <input 
                    type="date" 
                    value={photoDate} 
                    onChange={e => setPhotoDate(e.target.value)} 
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Pose Angle</label>
                  <select
                    value={photoType}
                    onChange={e => setPhotoType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Front">Front View</option>
                    <option value="Side">Side View</option>
                    <option value="Back">Back View</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Image File</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
                    required={!photoUrl}
                  />
                </div>
              </div>

              {photoUrl && (
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-700 relative">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Notes</label>
                <input 
                  type="text" 
                  value={photoNotes} 
                  onChange={e => setPhotoNotes(e.target.value)} 
                  placeholder="Week 4 progress photo..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoForm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!photoUrl}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          )}

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${cardBgClass} space-y-2`}>
              <Camera className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-300">No progress photos uploaded</p>
              <p className="text-[11px] text-slate-500">Take front, side, or back progress photos every 2-4 weeks to visually compare body composition changes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div 
                  key={p.id} 
                  className={`rounded-2xl border ${cardBgClass} overflow-hidden group relative flex flex-col`}
                >
                  <div className="aspect-square bg-slate-950 relative overflow-hidden">
                    <img src={p.imageUrl} alt={p.photoType} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                      {p.photoType}
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold font-mono text-slate-300 block">{p.date}</span>
                      {p.notes && <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">{p.notes}</span>}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPhotoForModal(p)}
                        className="p-1 text-slate-400 hover:text-blue-400 cursor-pointer"
                        title="View Photo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProgressPhoto(p.id)}
                        className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {selectedPhotoForModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200">{selectedPhotoForModal.photoType} View - {selectedPhotoForModal.date}</span>
              <button 
                onClick={() => setSelectedPhotoForModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img src={selectedPhotoForModal.imageUrl} alt="Enlarged Progress Photo" className="max-h-[70vh] object-contain" />
            </div>
            {selectedPhotoForModal.notes && (
              <p className="text-xs text-slate-300 italic">Notes: {selectedPhotoForModal.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
