/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Dumbbell, Award, Layers, Settings, 
  ArrowLeft, Grid, ChevronRight, Activity, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/dateUtils';

// Import child views
import { SubjectManager } from './SubjectManager';
import { HabitTrackerView } from './HabitTrackerView';
import { CalendarView } from './CalendarView';
import { MockTestTrackerView } from './MockTestTrackerView';
import { RevisionTrackerView } from './RevisionTrackerView';
import { SettingsView } from './SettingsView';

export const MoreMenu: React.FC = () => {
  const { data } = useApp();
  const { theme, accentColor } = data.settings;

  // Track currently active sub-view
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'subjects' | 'habits' | 'calendar' | 'mocktests' | 'revisions' | 'settings'>('menu');

  // Definitions for grid cards
  const menuCards = [
    {
      id: 'subjects' as const,
      title: 'Syllabus Organizer',
      desc: 'Define subjects, chapter difficulties, and syllabus completion sliders.',
      icon: BookOpen,
      color: '#3b82f6',
      badge: `${data.subjects.length} Subjects`
    },
    {
      id: 'habits' as const,
      title: 'Tactile Habits',
      desc: 'Track physical/bad habits via a 7-day grid. Check streaks & avoidance rates.',
      icon: Dumbbell,
      color: '#10b981',
      badge: `${data.habits.length} Trackers`
    },
    {
      id: 'calendar' as const,
      title: 'Calendar Ledger',
      desc: 'Interactive monthly view summarizing daily sessions, completed tasks, and exams.',
      icon: Calendar,
      color: '#8b5cf6',
      badge: 'Interactive'
    },
    {
      id: 'mocktests' as const,
      title: 'Mock Exams',
      desc: 'Record scores, mistake concepts to repeat, rank progression, and highest/lowest metrics.',
      icon: Award,
      color: '#f59e0b',
      badge: `${data.mockTests.length} Logged`
    },
    {
      id: 'revisions' as const,
      title: 'Leitner Revisions',
      desc: 'Log spaced repetition recall intervals (Cycle #1 - #5) with automatic dates.',
      icon: Layers,
      color: '#ec4899',
      badge: `${data.revisions.filter(r => r.nextRevisionDate <= getLocalDateString()).length} Due`
    },
    {
      id: 'settings' as const,
      title: 'Advanced Settings',
      desc: 'Customize 6 themes, adjust typography scaling, and manage JSON exports/imports.',
      icon: Settings,
      color: '#14b8a6',
      badge: 'Advanced'
    }
  ];

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'glass';

  // Breadcrumb layout
  const renderHeader = (title: string) => (
    <div className="flex items-center gap-2 mb-6">
      <button 
        id="btn-back-more-menu"
        onClick={() => setActiveSubTab('menu')}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h2 className="text-xl font-black leading-none">{title}</h2>
        <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase mt-1 block">Breadcrumbs: More Menu &gt; {title}</span>
      </div>
    </div>
  );

  return (
    <div id="more-tab" className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
      
      {activeSubTab === 'menu' ? (
        // =============================================================
        // PORTAL MENU SELECTION GRID
        // =============================================================
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">More Modules</h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mt-1`}>
              Navigate into advanced spaced repetitions, performance logs, habits, calendars, and JSON sync options.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuCards.map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  id={`btn-card-more-${card.id}`}
                  onClick={() => setActiveSubTab(card.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition hover:scale-[1.01] hover:shadow-lg flex flex-col justify-between h-44 relative overflow-hidden group ${
                    theme === 'light' ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}
                >
                  {/* Subtle color highlight indicator line */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: card.color }} />

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: card.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold font-mono uppercase bg-slate-800 text-slate-400" style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : undefined, color: theme === 'light' ? '#1e293b' : undefined }}>
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base group-hover:text-blue-400 transition">{card.title}</h4>
                    <p className="text-xs text-slate-400 leading-tight mt-1 group-hover:text-slate-300 transition line-clamp-2">{card.desc}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold group-hover:translate-x-1 transition-transform self-end mt-2">
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // =============================================================
        // SUB-VIEW ACTIVE VIEWPORTS
        // =============================================================
        <div className="space-y-4">
          {activeSubTab === 'subjects' && (
            <>
              {renderHeader('Syllabus Organizer')}
              <SubjectManager />
            </>
          )}

          {activeSubTab === 'habits' && (
            <>
              {renderHeader('Tactile Habits')}
              <HabitTrackerView />
            </>
          )}

          {activeSubTab === 'calendar' && (
            <>
              {renderHeader('Calendar Ledger')}
              <CalendarView />
            </>
          )}

          {activeSubTab === 'mocktests' && (
            <>
              {renderHeader('Mock Exams')}
              <MockTestTrackerView />
            </>
          )}

          {activeSubTab === 'revisions' && (
            <>
              {renderHeader('Leitner Spaced Revisions')}
              <RevisionTrackerView />
            </>
          )}

          {activeSubTab === 'settings' && (
            <>
              {renderHeader('System Settings')}
              <SettingsView />
            </>
          )}
        </div>
      )}

    </div>
  );
};
