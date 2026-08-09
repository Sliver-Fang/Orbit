/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { playTapSound } from '../utils/sound';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { data } = useApp();
  const { theme, accentColor, fontSize, uiScaling, cornerRadius, fontSizeMultiplier, volumeEnabled } = data.settings;

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (volumeEnabled !== false) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const actionable = target.closest(
            'button, a, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, .cursor-pointer, [onClick]'
          );
          if (actionable) {
            playTapSound();
          }
        }
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [volumeEnabled]);

  // Font size classes mapping
  const fontClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[fontSize] || 'text-base';

  // Core Theme Background and Text
  let themeBgClass = '';
  let themeCardClass = '';
  let themeBorderClass = '';
  let themeInputClass = '';
  let themeTextClass = '';
  let themeSubTextClass = '';

  switch (theme) {
    case 'light':
      themeBgClass = 'bg-slate-50 text-slate-900 transition-colors duration-300';
      themeCardClass = 'bg-white shadow-sm border border-slate-100';
      themeBorderClass = 'border-slate-100';
      themeInputClass = 'bg-slate-100 text-slate-900 border border-slate-200 focus:bg-white focus:ring-2';
      themeTextClass = 'text-slate-900';
      themeSubTextClass = 'text-slate-500';
      break;
    case 'amoled':
      themeBgClass = 'bg-black text-neutral-100 transition-colors duration-300';
      themeCardClass = 'bg-neutral-950 border border-neutral-900 shadow-none';
      themeBorderClass = 'border-neutral-900';
      themeInputClass = 'bg-neutral-900 text-neutral-100 border border-neutral-800 focus:bg-black focus:ring-1 focus:ring-neutral-700';
      themeTextClass = 'text-neutral-100';
      themeSubTextClass = 'text-neutral-400';
      break;
    case 'glass':
      themeBgClass = 'bg-slate-950 text-slate-100 bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 transition-colors duration-300 min-h-screen';
      themeCardClass = 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white';
      themeBorderClass = 'border-white/15';
      themeInputClass = 'bg-white/10 text-white border border-white/20 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30';
      themeTextClass = 'text-white';
      themeSubTextClass = 'text-slate-300';
      break;
    case 'neumorph':
      themeBgClass = 'bg-[#e6ecf5] text-slate-900 transition-colors duration-300 min-h-screen';
      themeCardClass = 'bg-[#e6ecf5] shadow-[6px_6px_14px_#c3ccdb,-6px_-6px_14px_#ffffff] border border-white/60 text-slate-900';
      themeBorderClass = 'border-slate-300/40';
      themeInputClass = 'bg-[#e6ecf5] text-slate-900 shadow-[inset_3px_3px_6px_#c3ccdb,inset_-3px_-3px_6px_#ffffff] border-none focus:ring-2 focus:ring-blue-500/20';
      themeTextClass = 'text-slate-900';
      themeSubTextClass = 'text-slate-600';
      break;
    case 'flat':
      themeBgClass = 'bg-white text-black transition-colors duration-300 border-4 border-black min-h-screen';
      themeCardClass = 'bg-white border-2 border-black shadow-[4px_4px_0px_#000000] text-black';
      themeBorderClass = 'border-black';
      themeInputClass = 'bg-white text-black border-2 border-black focus:bg-slate-100 focus:outline-none';
      themeTextClass = 'text-black';
      themeSubTextClass = 'text-zinc-700';
      break;
    case 'dark':
    default:
      themeBgClass = 'bg-[#0b1329] text-slate-100 bg-gradient-to-b from-[#0b1329] to-[#080d1a] transition-colors duration-300 min-h-screen';
      themeCardClass = 'bg-[#121d3a] border border-[#1d2d54] shadow-md shadow-black/10';
      themeBorderClass = 'border-[#1d2d54]';
      themeInputClass = 'bg-[#0f1930] text-slate-100 border border-[#1e2f57] focus:bg-[#121d3a] focus:ring-2 focus:ring-blue-500/50';
      themeTextClass = 'text-slate-100';
      themeSubTextClass = 'text-slate-400';
      break;
  }

  // Generate dynamic custom inline style for components
  const styleVariables = {
    '--accent-color': accentColor,
    '--border-radius': `${cornerRadius}px`,
    ...(uiScaling && uiScaling !== 1 ? {
      zoom: uiScaling,
    } : {})
  } as React.CSSProperties;

  return (
    <div 
      id="theme-root"
      className={`${themeBgClass} ${fontClass} min-h-screen flex flex-col font-sans selection:bg-blue-500/30`}
      style={styleVariables}
    >
      {/* Dynamic Liquid Linear Gradient Overlays for Glassmorphism Theme */}
      {theme === 'glass' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Indefinite Animating Multi-stop Linear Gradient Background Overlay */}
          <div 
            className="absolute inset-0 opacity-90"
            style={{
              background: 'linear-gradient(-45deg, rgba(7, 10, 19, 0.95), rgba(30, 27, 75, 0.9), rgba(76, 29, 149, 0.85), rgba(12, 74, 110, 0.85), rgba(15, 23, 42, 0.95))',
              backgroundSize: '400% 400%',
              animation: 'animated-gradient-shift 16s ease-in-out infinite'
            }}
          />
          
          {/* Animated Liquid Linear Gradient Mesh Blobs with morphing organic shapes */}
          <div 
            className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 blur-[110px] opacity-40"
            style={{ animation: 'morph-liquid-blob-1 20s ease-in-out infinite' }}
          />
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] max-w-[700px] max-h-[700px] bg-gradient-to-tr from-fuchsia-600 via-purple-700 to-blue-700 blur-[120px] opacity-35"
            style={{ animation: 'morph-liquid-blob-2 24s ease-in-out infinite' }}
          />
          <div 
            className="absolute top-[30%] right-[10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] bg-gradient-to-tr from-rose-500 via-violet-600 to-cyan-500 blur-[100px] opacity-30"
            style={{ animation: 'morph-liquid-blob-1 28s ease-in-out infinite reverse' }}
          />
          <div 
            className="absolute bottom-[20%] left-[10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-teal-400 via-sky-600 to-indigo-700 blur-[95px] opacity-25"
            style={{ animation: 'morph-liquid-blob-2 22s ease-in-out infinite reverse' }}
          />
        </div>
      )}
      
      {/* Expose styling helpers via inline elements/context to allow deep styled custom panels */}
      <style>{`
        html {
          font-size: ${16 * (fontSizeMultiplier || 1)}px !important;
        }
        @keyframes animated-gradient-shift {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes morph-liquid-blob-1 {
          0% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          33% {
            transform: translate(60px, -50px) rotate(120deg) scale(1.2);
            border-radius: 30% 60% 70% 30% / 50% 60% 30% 60%;
          }
          66% {
            transform: translate(-40px, 40px) rotate(240deg) scale(0.9);
            border-radius: 70% 30% 50% 50% / 30% 40% 60% 70%;
          }
          100% {
            transform: translate(0px, 0px) rotate(360deg) scale(1);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }
        @keyframes morph-liquid-blob-2 {
          0% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
            border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%;
          }
          33% {
            transform: translate(-50px, 60px) rotate(-120deg) scale(1.15);
            border-radius: 60% 40% 30% 70% / 40% 70% 30% 60%;
          }
          66% {
            transform: translate(40px, -40px) rotate(-240deg) scale(0.88);
            border-radius: 30% 70% 50% 50% / 60% 30% 70% 40%;
          }
          100% {
            transform: translate(0px, 0px) rotate(-360deg) scale(1);
            border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%;
          }
        }
        .custom-card {
          border-radius: ${cornerRadius}px;
        }
        .custom-button-primary {
          border-radius: ${cornerRadius}px;
          background-color: ${accentColor};
          color: white;
          transition: all 0.2s ease-in-out;
        }
        .custom-button-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .custom-button-primary:active {
          transform: translateY(1px);
        }
        .custom-input {
          border-radius: ${cornerRadius}px;
        }
        .liquid-glass-btn {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.55),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25),
            0 8px 28px -4px rgba(0, 0, 0, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-glass-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.42);
          box-shadow: 
            inset 0 2px 2px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2),
            0 14px 36px -4px rgba(0, 0, 0, 0.45);
          transform: translateY(-2px) scale(1.02);
        }
        .liquid-glass-btn:active {
          transform: translateY(1px) scale(0.96);
          box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .liquid-glass-btn-light {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.08),
            0 8px 24px -4px rgba(0, 0, 0, 0.08);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-glass-btn-light:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 
            inset 0 2px 2px 0 rgba(255, 255, 255, 1),
            0 12px 30px -4px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px) scale(1.02);
        }
        :root {
          --theme-accent: ${accentColor};
          --theme-radius: ${cornerRadius}px;
        }

        ${theme === 'glass' ? `
          /* High-fidelity Apple Liquid Glass with Multi-stop Linear Gradient Overrides */
          body, #theme-root {
            background: linear-gradient(-45deg, #070a13, #1e1b4b, #2e1065, #0c4a6e, #0f172a, #1f1a4a) !important;
            background-size: 400% 400% !important;
            animation: animated-gradient-shift 18s ease-in-out infinite !important;
            color: #ffffff !important;
          }
          .border, .border-slate-800, .border-white\\/5, .border-slate-700\\/30 {
            border-color: rgba(255, 255, 255, 0.16) !important;
          }
          /* Glass card backgrounds */
          .bg-white, .bg-slate-50, .bg-white\\/5, .bg-slate-900\\/40, .bg-slate-900\\/30, .bg-slate-900\\/20, .bg-slate-950, .custom-card, .bg-white\\/60 {
            background: rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(28px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
            box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 20px 40px -10px rgba(0, 0, 0, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            color: #ffffff !important;
          }
          /* Floating Modals and Sheets */
          div.fixed div.max-w-md, div.fixed div.max-w-xl, div.fixed div.max-w-2xl, div.fixed div.max-w-lg {
            background: rgba(15, 23, 42, 0.88) !important;
            backdrop-filter: blur(32px) saturate(210%) !important;
            -webkit-backdrop-filter: blur(32px) saturate(210%) !important;
            border: 1px solid rgba(255, 255, 255, 0.22) !important;
            box-shadow: inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4), 0 25px 60px rgba(0, 0, 0, 0.6) !important;
            color: #ffffff !important;
          }
          /* Custom inputs */
          .custom-input, input, select, textarea {
            background: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
            color: #ffffff !important;
          }
          .custom-input:focus, input:focus, select:focus, textarea:focus {
            background: rgba(255, 255, 255, 0.18) !important;
            border-color: ${accentColor} !important;
            box-shadow: 0 0 0 2px ${accentColor}44 !important;
          }
          /* Text styling corrections for glass theme legibility */
          .text-slate-900, .text-slate-800, .text-slate-700, .text-slate-600 {
            color: #f8fafc !important;
          }
          .text-slate-500, .text-slate-400 {
            color: #cbd5e1 !important;
          }
          .text-slate-300 {
            color: #e2e8f0 !important;
          }
        ` : ''}

        ${theme === 'neumorph' ? `
          /* Neumorphism Theme Readability Overrides */
          body, #theme-root {
            background-color: #e6ecf5 !important;
            color: #0f172a !important;
          }
          .bg-white, .bg-slate-50, .bg-slate-900, .bg-slate-900\\/40, .bg-slate-900\\/30, .bg-slate-900\\/20, .bg-slate-950, .bg-white\\/5, .custom-card {
            background-color: #e6ecf5 !important;
            box-shadow: 6px 6px 14px #c3ccdb, -6px -6px 14px #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.8) !important;
            color: #0f172a !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-900, .text-slate-800, .text-slate-700, .text-white {
            color: #0f172a !important;
          }
          .text-slate-500, .text-slate-400, .text-slate-600 {
            color: #475569 !important;
          }
          div.fixed div.max-w-md, div.fixed div.max-w-xl, div.fixed div.max-w-2xl, div.fixed div.max-w-lg {
            background-color: #e6ecf5 !important;
            box-shadow: 10px 10px 25px #bdc7d8, -10px -10px 25px #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.9) !important;
            color: #0f172a !important;
          }
          .custom-input, input, select, textarea {
            background-color: #e6ecf5 !important;
            box-shadow: inset 3px 3px 6px #c3ccdb, inset -3px -3px 6px #ffffff !important;
            border: none !important;
            color: #0f172a !important;
          }
        ` : ''}

        ${theme === 'flat' ? `
          /* Flat Theme Readability Overrides */
          body, #theme-root {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .bg-white, .bg-slate-50, .bg-slate-900, .bg-slate-900\\/40, .bg-slate-900\\/30, .bg-slate-900\\/20, .bg-slate-950, .bg-white\\/5, .custom-card {
            background-color: #ffffff !important;
            border: 2px solid #000000 !important;
            box-shadow: 4px 4px 0px #000000 !important;
            color: #000000 !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500, .text-slate-600, .text-slate-700, .text-slate-800, .text-slate-900, .text-white {
            color: #000000 !important;
          }
          div.fixed div.max-w-md, div.fixed div.max-w-xl, div.fixed div.max-w-2xl, div.fixed div.max-w-lg {
            background-color: #ffffff !important;
            border: 3px solid #000000 !important;
            box-shadow: 8px 8px 0px #000000 !important;
            color: #000000 !important;
          }
          .custom-input, input, select, textarea {
            background-color: #ffffff !important;
            border: 2px solid #000000 !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
        ` : ''}

        ${theme === 'light' ? `
          /* Light Theme High Readability Overrides */
          body, #theme-root {
            background-color: #f8fafc !important;
            color: #0f172a !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300 {
            color: #0f172a !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #475569 !important;
          }
          .bg-slate-900\\/40, .bg-slate-900\\/30, .bg-slate-900\\/20, .bg-slate-950, .bg-white\\/5 {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #0f172a !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          }
          div.fixed div.max-w-md, div.fixed div.max-w-xl, div.fixed div.max-w-2xl, div.fixed div.max-w-lg {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #0f172a !important;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important;
          }
          .custom-input, input, select, textarea {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
          }
        ` : ''}
      `}</style>
      
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
};
