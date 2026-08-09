/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, ShieldAlert, Download, Upload, AlertCircle, 
  CheckCircle, Palette, Volume2, HardDrive, Trash2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppData, AppTheme } from '../types';
import { shareContent, isNative } from '../utils/nativeBridge';
import { getLocalDateString } from '../utils/dateUtils';

export const SettingsView: React.FC = () => {
  const { data, updateSettings, importBackupData } = useApp();
  const { theme, accentColor, fontSizeMultiplier, volumeEnabled } = data.settings;

  const [importOption, setImportOption] = useState<'merge' | 'replace' | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  const [parsedDataToImport, setParsedDataToImport] = useState<AppData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset accent colors
  const colorPresets = [
    { name: 'Classic Blue', hex: '#3b82f6' },
    { name: 'Emerald Forest', hex: '#10b981' },
    { name: 'Royal Violet', hex: '#8b5cf6' },
    { name: 'Warm Amber', hex: '#f59e0b' },
    { name: 'Crimson Ember', hex: '#ef4444' },
    { name: 'Cosmic Magenta', hex: '#ec4899' },
    { name: 'Nordic Teal', hex: '#14b8a6' },
    { name: 'Minimal Charcoal', hex: '#64748b' }
  ];

  // Preset themes
  const themePresets: { name: AppTheme; desc: string }[] = [
    { name: 'light', desc: 'Squeaky clean white canvas with high readability.' },
    { name: 'dark', desc: 'Balanced slate-colored midnight setup.' },
    { name: 'amoled', desc: '100% pitch black backgrounds optimized for OLED battery.' },
    { name: 'glass', desc: 'Frosted liquid glass panels over a multi-stop linear gradient background.' },
    { name: 'neumorph', desc: 'Tactile, soft extruded bevel design with physical shadows.' },
    { name: 'flat', desc: 'High-contrast monochrome solid border style.' }
  ];

  // -------------------------------------------------------------
  // DATA MANAGEMENT OPERATIONS
  // -------------------------------------------------------------
  const handleExportJSON = async () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      
      if (isNative()) {
        const result = await shareContent(
          'Study Tracker Database Backup',
          dataStr
        );
        if (result === 'copied') {
          alert('Backup copied to clipboard! You can paste and save it as a backup.');
        }
        return;
      }

      // Web platform standard file download fallback
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `study_tracker_backup_${getLocalDateString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Failed to construct export file.');
    }
  };

  const validateBackupSchema = (obj: any): obj is AppData => {
    if (!obj || typeof obj !== 'object') return false;
    const requiredKeys = ['subjects', 'chapters', 'tasks', 'studySessions', 'habits', 'revisions', 'mockTests', 'gamification', 'settings'];
    for (const key of requiredKeys) {
      if (!(key in obj)) return false;
      if (key !== 'gamification' && key !== 'settings' && !Array.isArray(obj[key])) return false;
    }
    return true;
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportOption(null);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (validateBackupSchema(parsed)) {
          setParsedDataToImport(parsed);
          setImportOption('merge'); // default suggestion
        } else {
          setImportError('Invalid backup file schema structure. It must contain complete Study Tracker v1 matrices.');
        }
      } catch (err) {
        setImportError('Failed to parse file. Ensure it is a valid formatted JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const executeImport = () => {
    if (!parsedDataToImport || !importOption) return;

    const res = importBackupData(JSON.stringify(parsedDataToImport), importOption);
    if (res.success) {
      setImportSuccess(true);
    } else {
      setImportError(res.error || 'Failed to import backup data.');
    }

    setImportOption(null);
    setParsedDataToImport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAppWipe = () => {
    if (confirm('CRITICAL WARNING: This will immediately erase all subjects, chapters, study sessions, tasks, achievements, and statistics from this device permanently. Ensure you exported a JSON backup first. Proceed with database wipe?')) {
      localStorage.removeItem('study_productivity_tracker_data_v1');
      window.location.reload();
    }
  };

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      
      {/* APPEARANCE / BRAND THEME SETTINGS */}
      <section className={`p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
      }`}>
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Device Appearance Settings</span>
        </h4>

        {/* Themes Grid */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Core Visual Themes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {themePresets.map(preset => {
                const isActive = theme === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => updateSettings({ theme: preset.name })}
                    className={`p-3 rounded-xl border text-left transition select-none cursor-pointer active:scale-95 ${
                      isActive 
                        ? 'border-blue-500 bg-blue-500/10 font-bold text-blue-400' 
                        : (theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800')
                    }`}
                    style={{
                      borderColor: isActive ? accentColor : undefined,
                      color: isActive ? accentColor : undefined,
                      backgroundColor: isActive ? `${accentColor}10` : undefined
                    }}
                  >
                    <span className="text-xs font-extrabold capitalize block">{preset.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-1 block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color presets list */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Custom Brand Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(color => {
                const isSelected = accentColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    onClick={() => updateSettings({ accentColor: color.hex })}
                    className="w-8 h-8 rounded-full border-2 transition active:scale-90 flex items-center justify-center cursor-pointer relative"
                    style={{ 
                      backgroundColor: color.hex, 
                      borderColor: isSelected ? (theme === 'light' ? '#000000' : '#ffffff') : 'transparent' 
                    }}
                    title={color.name}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizing multipliers & Audio Chime alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4" style={{ borderColor: theme === 'light' ? '#f1f5f9' : undefined }}>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Audio Alert Chimes</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSettings({ volumeEnabled: !volumeEnabled })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    volumeEnabled 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{volumeEnabled ? 'Sound Enabled' : 'Muted'}</span>
                </button>
                <span className="text-[10px] text-slate-500">Plays study session completion chimes.</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">UI Font Scaling</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateSettings({ fontSizeMultiplier: Math.max(0.8, fontSizeMultiplier - 0.1) })}
                  className="px-2.5 py-1 bg-slate-800 rounded text-xs text-slate-300 font-bold hover:bg-slate-700"
                >-</button>
                <span className="text-xs font-bold font-mono">{(fontSizeMultiplier * 100).toFixed(0)}%</span>
                <button 
                  onClick={() => updateSettings({ fontSizeMultiplier: Math.min(1.3, fontSizeMultiplier + 0.1) })}
                  className="px-2.5 py-1 bg-slate-800 rounded text-xs text-slate-300 font-bold hover:bg-slate-700"
                >+</button>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* DURABLE MULTI-YEAR JSON DATABASE BACKUP PANEL */}
      <section className={`p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
      }`}>
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Advanced Database & Sync Settings</span>
        </h4>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          All study cycles, habits, achievements, and syllabuses remain 100% offline. Export JSON files as long-term backups, or import them on a secondary device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Export card */}
          <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-3" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Backup Export</span>
            <p className="text-[11px] text-slate-400 leading-tight">Compile all study logs and settings into a download file.</p>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition select-none cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Database</span>
            </button>
          </div>

          {/* Import card */}
          <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-3" style={{ borderColor: theme === 'light' ? '#cbd5e1' : undefined }}>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Restore / Import</span>
            <p className="text-[11px] text-slate-400 leading-tight">Choose a JSON backup file to load database records.</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".json" 
              onChange={handleImportFileSelect}
              className="hidden" 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition select-none cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Upload className="w-4 h-4" />
              <span>Select File from Disk</span>
            </button>
          </div>

        </div>

        {/* Schema validation options */}
        {importError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 items-start text-red-400 text-xs font-bold leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-2 items-start text-green-400 text-xs font-bold leading-relaxed">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Database imported and parsed successfully. Active viewport refreshed!</p>
          </div>
        )}

        {importOption && parsedDataToImport && (
          <div className="mt-4 p-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 space-y-3">
            <h5 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Conflict Resolution: Import options</span>
            </h5>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              We parsed your backup. You have <b>{parsedDataToImport.subjects?.length || 0} subjects</b>, <b>{parsedDataToImport.studySessions?.length || 0} sessions</b>, and <b>{parsedDataToImport.tasks?.length || 0} tasks</b>. How do you want to handle existing data?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setImportOption('merge')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded border ${
                  importOption === 'merge' ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-slate-900/30 border-slate-800 text-slate-400'
                }`}
              >
                Merge (Keep existing, avoid duplicates)
              </button>
              <button
                onClick={() => setImportOption('replace')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded border ${
                  importOption === 'replace' ? 'bg-red-500/20 text-rose-400 border-red-500' : 'bg-slate-900/30 border-slate-800 text-slate-400'
                }`}
              >
                Replace (Wipe local, overwrite entirely)
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800" style={{ borderColor: theme === 'light' ? '#e2e8f0' : undefined }}>
              <button
                onClick={() => {
                  setImportOption(null);
                  setParsedDataToImport(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-1 rounded text-[10px] border border-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={executeImport}
                className="px-4 py-1 bg-green-600 text-white font-bold text-[10px] rounded"
              >
                Proceed & Update Database
              </button>
            </div>
          </div>
        )}

      </section>

      {/* DANGEROUS PERMANENT DISK WIPE BUTTON */}
      <section className={`p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-sm'
      }`}>
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>Danger Zone</span>
        </h4>
        <p className="text-xs text-slate-400 mb-4">Permanently destroy the entire local SQL-equivalent cache on this device. Action is irreversible.</p>
        <button
          onClick={handleResetAppWipe}
          className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 inline mr-1" />
          <span>Permanently Wipe Database</span>
        </button>
      </section>

    </div>
  );
};
