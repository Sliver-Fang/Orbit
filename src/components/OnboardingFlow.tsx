/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, GraduationCap, Calendar, Dumbbell, Award, 
  ArrowRight, Play, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingFlow: React.FC = () => {
  const { isOnboarded, completeOnboarding, data } = useApp();
  const { theme, accentColor } = data.settings;
  const [showModal, setShowModal] = useState(true);

  if (isOnboarded) return null;

  const isLight = theme === 'light' || theme === 'glass' || theme === 'neumorph';
  const accentHex = accentColor || '#3b82f6';

  const features = [
    {
      icon: GraduationCap,
      title: 'Syllabus Organizer',
      desc: 'Define subjects and log chapter level details (In Progress, Revised, Mastered) with tactile completion sliders.',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: Calendar,
      title: 'Leitner Spaced Revisions',
      desc: 'Track Cycle #1 to #5 spaced intervals with automatic reminders and dynamic calendar integration.',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      icon: Dumbbell,
      title: 'Tactile Habit Ledger',
      desc: 'Form high-value routines or avoid traps with an interactive 7-day grid and streak calendars.',
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      icon: Award,
      title: 'Performance & Gamification',
      desc: 'Log mock exams, analyze weak concepts, unlock badges, and earn XP with every study minute.',
      color: 'bg-amber-500/10 text-amber-500'
    }
  ];

  return (
    <>
      {/* Sticky frosted glass top bar when they minimize/explore demo */}
      {!showModal && (
        <motion.div 
          id="demo-mode-header-bar"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-0 left-0 right-0 z-40 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-b shadow-md backdrop-blur-md"
          style={{ 
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
            borderColor: theme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(30, 41, 59, 0.8)',
            color: isLight ? '#1e293b' : '#f8fafc'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-500">Explorer Sandbox Mode</span>
              <p className="text-xs font-semibold leading-tight text-slate-400">
                You are playing with a fully populated workspace. Explore tabs freely to see what is possible!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-onboarding-modal-reopen"
              onClick={() => setShowModal(true)}
              className="px-3 py-1 text-[11px] font-bold border rounded-lg transition hover:bg-slate-500/10 cursor-pointer"
              style={{ borderColor: theme === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.1)' }}
            >
              Learn More
            </button>
            <button
              id="btn-onboarding-start-fresh-top"
              onClick={completeOnboarding}
              className="px-4 py-1.5 text-xs font-extrabold text-white rounded-lg shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
              style={{ backgroundColor: accentHex }}
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Get Started</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main onboarding overlay dialog */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl p-6 md:p-8 flex flex-col z-10"
              style={{ 
                backgroundColor: theme === 'light' ? '#ffffff' : (theme === 'glass' ? 'rgba(255, 255, 255, 0.92)' : '#101a35'),
                borderColor: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                color: isLight ? '#0f172a' : '#f8fafc'
              }}
            >
              {/* Colored decorative background orb */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ backgroundColor: accentHex }}
              />

              {/* Title Section */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 font-mono tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STUDY LEDGER V1.1</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  Premium Spaced Repetition <br className="hidden sm:inline" />
                  & Productivity Suite
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A multi-module framework designed for long-term syllabus mastery, tactile habit tracking, and deep study accountability.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feat, index) => {
                  const Icon = feat.icon;
                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-2xl border flex gap-3 transition-all hover:bg-slate-500/5"
                      style={{ 
                        borderColor: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.04)',
                        backgroundColor: theme === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div className={`p-2.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold">{feat.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-snug">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)' }}>
                <button
                  id="btn-onboarding-sandbox"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Explore Sandbox first</span>
                </button>

                <button
                  id="btn-onboarding-count-me-in"
                  onClick={completeOnboarding}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl text-xs font-extrabold text-white shadow-lg transition hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2 group order-1 sm:order-2"
                  style={{ 
                    backgroundColor: accentHex,
                    boxShadow: `0 10px 15px -3px ${accentHex}30`
                  }}
                >
                  <span>Count Me In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
