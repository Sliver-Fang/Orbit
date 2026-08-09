/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Home, GraduationCap, CheckSquare, BarChart2, MoreHorizontal, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type MainTab = 'home' | 'study' | 'tasks' | 'fitness' | 'analytics' | 'more';

interface NavigationProps {
  activeTab: MainTab;
  setActiveTab?: (tab: MainTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { data } = useApp();
  const { accentColor, theme } = data.settings;
  const isFlat = theme === 'flat';
  const isNeumorph = theme === 'neumorph';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { id: 'home' as MainTab, label: 'Home', icon: Home },
    { id: 'study' as MainTab, label: 'Study', icon: GraduationCap },
    { id: 'tasks' as MainTab, label: 'Tasks', icon: CheckSquare },
    { id: 'fitness' as MainTab, label: 'Fitness', icon: Dumbbell },
    { id: 'analytics' as MainTab, label: 'Analytics', icon: BarChart2 },
    { id: 'more' as MainTab, label: 'More', icon: MoreHorizontal },
  ];

  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) {
      return theme === 'light' || theme === 'neumorph' || theme === 'flat' 
        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5';
    }
    
    if (isFlat) {
      return 'bg-black text-white border-2 border-black font-bold';
    }
    
    if (isNeumorph) {
      return 'text-slate-900 bg-slate-200 shadow-[inset_2px_2px_5px_rgba(165,175,190,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] font-bold';
    }

    if (theme === 'light') {
      return 'text-slate-900 bg-slate-100 font-bold shadow-sm';
    }

    return 'text-white bg-white/10 font-bold';
  };

  const mobileNavContent = (
    <nav 
      id="mobile-bottom-nav"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999999, width: '100vw' }}
      className={`md:hidden fixed bottom-0 left-0 right-0 w-full h-16 border-t flex justify-around items-center px-2 py-1 z-[999999] shadow-2xl transition-all duration-300 pb-[calc(0.25rem+env(safe-area-inset-bottom))]
        ${theme === 'light' ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]' : ''}
        ${theme === 'dark' ? 'bg-[#0f172a]/95 backdrop-blur-md border-slate-800 text-slate-100 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]' : ''}
        ${theme === 'amoled' ? 'bg-black border-neutral-900 text-white shadow-[0_-4px_25px_rgba(0,0,0,0.9)]' : ''}
        ${theme === 'glass' ? 'bg-slate-950/90 backdrop-blur-2xl border-white/20 text-white shadow-[0_-8px_32px_rgba(0,0,0,0.7)]' : ''}
        ${theme === 'neumorph' ? 'bg-[#e6ecf5] border-white/80 text-slate-900 shadow-[0_-6px_16px_#c3ccdb]' : ''}
        ${theme === 'flat' ? 'bg-white border-t-4 border-black text-black shadow-none' : ''}
      `}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        let inactiveTextColor = 'text-slate-400';
        if (theme === 'light' || theme === 'neumorph') {
          inactiveTextColor = 'text-slate-600 hover:text-slate-900';
        } else if (theme === 'flat') {
          inactiveTextColor = 'text-black hover:opacity-80';
        }

        let activeTextColor = 'text-white';
        if (isFlat) activeTextColor = 'text-black font-extrabold';
        else if (isNeumorph) activeTextColor = 'text-slate-900 font-extrabold';
        else if (theme === 'light') activeTextColor = 'text-slate-900 font-extrabold';

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab?.(item.id)}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
              isActive ? activeTextColor : inactiveTextColor
            }`}
          >
            <div 
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? (isFlat ? 'bg-black text-white' : isNeumorph ? 'bg-slate-200 shadow-inner' : theme === 'light' ? 'bg-slate-100' : 'bg-white/10') : ''
              }`}
            >
              <Icon 
                className="w-5 h-5" 
                style={{ color: isActive && !isFlat && !isNeumorph ? accentColor : undefined }} 
              />
            </div>
            <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* SIDEBAR FOR DESKTOP & TABLETS */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col w-64 min-h-screen p-5 fixed left-0 top-0 h-full border-r z-30 transition-colors duration-300
          ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : ''}
          ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800 text-slate-100' : ''}
          ${theme === 'amoled' ? 'bg-black border-neutral-900 text-white' : ''}
          ${theme === 'glass' ? 'bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl' : ''}
          ${theme === 'neumorph' ? 'bg-[#e6ecf5] border-slate-300/40 text-slate-900 shadow-[4px_0_15px_rgba(0,0,0,0.03)]' : ''}
          ${theme === 'flat' ? 'bg-white border-r-4 border-black text-black' : ''}
        `}
      >
        {/* App Branding */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <img 
            src="https://studymotion.ai.studio/app_icon.jpg" 
            alt="Study Motion Logo" 
            className="w-10 h-10 rounded-xl object-cover border shadow-sm shrink-0"
            style={{ borderColor: isFlat ? 'black' : 'rgba(255,255,255,0.2)' }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-xs leading-tight uppercase tracking-wider opacity-70">STUDY MOTION</h1>
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.1</span>
            </div>
            <p className="font-extrabold text-lg leading-tight">Study tracker</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab?.(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${getActiveStyles(isActive)}`}
              >
                <Icon className="w-5 h-5" style={{ color: isActive && !isFlat && !isNeumorph ? accentColor : undefined }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Gamification Indicator at the bottom of the sidebar */}
        <div className={`mt-auto p-4 rounded-xl border ${
          theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <span className="text-xs font-bold font-mono">Lvl</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">Your Progress</p>
              <p className="text-sm font-bold">Level {data.gamification.level}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ width: `${(data.gamification.xp % 1000) / 10}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-mono">
            <span>{data.gamification.xp % 1000} XP</span>
            <span>1000 XP</span>
          </div>
        </div>
      </aside>

      {/* BOTTOM NAVIGATION FOR MOBILE PHONES - PORTALED DIRECTLY TO DOCUMENT.BODY */}
      {mounted ? createPortal(mobileNavContent, document.body) : mobileNavContent}
    </>
  );
};
