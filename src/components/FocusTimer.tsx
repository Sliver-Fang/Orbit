import React, { useState, useEffect, useRef } from "react";
import { Palette } from "../types";
import { playSoundWave } from "../utils/data";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Coffee, 
  Trophy, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";

interface FocusTimerProps {
  palette: Palette;
  isDark: boolean;
}

export default function FocusTimer({ palette, isDark }: FocusTimerProps) {
  const [mode, setMode] = useState<'focus' | 'short' | 'long' | 'custom'>('focus');
  const [customMinutes, setCustomMinutes] = useState(() => {
    const cached = localStorage.getItem("habit_tracker_custom_minutes");
    return cached ? parseInt(cached, 10) : 45;
  });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calming wellness phrases for fullscreen mode
  const zenQuotes = [
    "Energy flows where attention goes.",
    "Breathe in strength, breathe out distractions.",
    "Do not hurry, do not worry. Be present.",
    "Quiet minds are focus magnets.",
    "One deliberate step at a time.",
    "Your potential is built in these silent cycles.",
    "Deep breaths, steady progress."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const initialDurations = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
    custom: customMinutes * 60,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync customMinutes lock
  useEffect(() => {
    localStorage.setItem("habit_tracker_custom_minutes", String(customMinutes));
  }, [customMinutes]);

  // Rotate zen quotes when timer is running
  useEffect(() => {
    if (isRunning && isFullScreen) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % zenQuotes.length);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isFullScreen]);

  // Set initial time when mode changes or customMinutes is customized
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(initialDurations[mode]);
    }
  }, [mode, customMinutes]);

  // Listen to Escape key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer interval engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) playSoundWave('alarm');
            if (mode === 'focus' || mode === 'custom') {
              setCompletedSessions((c) => c + 1);
            }
            // Swap standard modes to help maintain cycle
            if (mode === 'focus') {
              setMode('short');
            } else if (mode === 'short') {
              setMode('focus');
            }
            return 0;
          }
          // Tick-tick sound occasionally for sensory grounding
          if (prev % 60 === 0 && soundEnabled) {
            playSoundWave('ticking');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  const toggleTimer = () => {
    if (soundEnabled) playSoundWave('click');
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (soundEnabled) playSoundWave('click');
    setIsRunning(false);
    setTimeLeft(initialDurations[mode]);
  };

  const setManualMode = (newMode: 'focus' | 'short' | 'long' | 'custom') => {
    if (soundEnabled) playSoundWave('click');
    setMode(newMode);
  };

  const incrementCustom = () => {
    if (!isRunning) {
      setCustomMinutes(prev => Math.min(180, prev + 5));
      if (soundEnabled) playSoundWave('click');
    }
  };

  const decrementCustom = () => {
    if (!isRunning) {
      setCustomMinutes(prev => Math.max(1, prev - 5));
      if (soundEnabled) playSoundWave('click');
    }
  };

  // Human countdown converter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Radial track computation
  const totalDuration = initialDurations[mode];
  const progressRatio = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <>
      {/* Standard Display Block */}
      <div id="focus-timer-card" className={`p-6 rounded-3xl transition-all duration-300 border ${
        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-100 text-zinc-900"
      } shadow-sm flex flex-col justify-between h-full relative overflow-hidden`}>
        
        <div className="flex items-center justify-between mb-4 z-10">
          <div>
            <h3 className="font-sans font-semibold tracking-tight text-base">
              Focus Session
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Build concentration cycles
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={() => {
                if (soundEnabled) playSoundWave('click');
                setIsFullScreen(true);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-zinc-800 ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
              title="Enter Full Screen Focus Room"
            >
              <Maximize2 size={14} />
            </button>

            {/* Completed Indicator Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
              isDark ? "bg-zinc-850 text-amber-400" : "bg-amber-50 text-amber-700"
            }`}>
              <Trophy size={11} className="text-amber-500" />
              <span>{completedSessions} sessions</span>
            </div>
          </div>
        </div>

        {/* Mode Select Tabs */}
        <div className={`grid grid-cols-4 p-1 rounded-xl gap-1 mb-4 text-[10px] font-sans font-semibold ${
          isDark ? "bg-zinc-850" : "bg-zinc-100"
        } z-10`}>
          <button
            onClick={() => setManualMode('focus')}
            className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              mode === 'focus'
                ? isDark
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span>Focus</span>
            <span className="text-[8px] opacity-70">25m</span>
          </button>
          
          <button
            onClick={() => setManualMode('short')}
            className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              mode === 'short'
                ? isDark
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span>Short</span>
            <span className="text-[8px] opacity-70">5m</span>
          </button>

          <button
            onClick={() => setManualMode('long')}
            className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              mode === 'long'
                ? isDark
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span>Long</span>
            <span className="text-[8px] opacity-70">15m</span>
          </button>

          <button
            onClick={() => setManualMode('custom')}
            className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              mode === 'custom'
                ? isDark
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span>Custom</span>
            <span className="text-[8px] opacity-70">{customMinutes}m</span>
          </button>
        </div>

        {/* Custom Timer Duration Inlay */}
        {mode === 'custom' && (
          <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs mb-4 border transition-all ${
            isDark ? "bg-zinc-850/50 border-zinc-800" : "bg-zinc-50 border-zinc-150"
          }`}>
            <span className="text-[11px] text-zinc-400 font-sans">Set Custom:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementCustom}
                disabled={isRunning}
                className={`p-1 rounded-lg border transition-all cursor-pointer ${
                  isRunning 
                    ? "opacity-30 cursor-not-allowed border-transparent" 
                    : isDark 
                      ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" 
                      : "border-zinc-200 hover:bg-zinc-100 text-zinc-650"
                }`}
              >
                <Minus size={11} />
              </button>
              <span className="font-mono font-bold tracking-tight text-sm text-center min-w-10">
                {customMinutes} mins
              </span>
              <button
                onClick={incrementCustom}
                disabled={isRunning}
                className={`p-1 rounded-lg border transition-all cursor-pointer ${
                  isRunning 
                    ? "opacity-30 cursor-not-allowed border-transparent" 
                    : isDark 
                      ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" 
                      : "border-zinc-200 hover:bg-zinc-100 text-zinc-650"
                }`}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Radial Clock Circle Layout */}
        <div className="flex flex-col items-center justify-center py-2 relative z-10 select-none">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className={`${isDark ? "stroke-zinc-800" : "stroke-zinc-150"}`}
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={palette.accent}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Time Counter Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-extrabold tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-[9px] uppercase font-sans font-bold tracking-wider mt-0.5 ${
                isRunning ? "text-emerald-500 animate-pulse" : "text-zinc-400"
              }`}>
                {isRunning ? "Focus Active" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Control Deck */}
        <div className="flex items-center justify-center gap-3 mt-4 z-10">
          <button
            onClick={resetTimer}
            title="Reset sequence"
            className={`p-2.5 rounded-full border transition-all duration-205 cursor-pointer ${
              isDark
                ? "border-zinc-800 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
                : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-650"
            }`}
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={toggleTimer}
            className="p-3 rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: palette.accent }}
          >
            {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled) playSoundWave('click');
            }}
            title={soundEnabled ? "Mute focus cues" : "Unmute focus cues"}
            className={`p-2.5 rounded-full border transition-all duration-205 cursor-pointer ${
              isDark
                ? "border-zinc-800 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
                : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-650"
            }`}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* IMMERSIVE FULL SCREEN MODAL FOCUS ROOM */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between p-8 md:p-12 text-white bg-gradient-to-br from-zinc-950 via-teal-950 to-indigo-950 animate-gradient-slow shadow-2xl transition-all duration-700 select-none"
        >
          {/* Calm ambient background shapes */}
          <div className="absolute inset-0 bg-radial-at-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse duration-[8s]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none animate-pulse duration-[12s]" />

          {/* Fullscreen Room Header */}
          <div className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: palette.accent }}
              >
                <Sparkles size={16} className="animate-spin duration-[6s]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight opacity-90 uppercase font-sans">
                  Deep Focus Room
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono tracking-wide">
                  {mode === 'focus' ? "FOCUS INTERVAL" : mode === 'short' ? "SHORT BREAK" : mode === 'long' ? "LONG BREAK" : "CUSTOM FOCUS"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Audio Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (soundEnabled) playSoundWave('click');
                }}
                className="p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all cursor-pointer"
                title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Exit Fullscreen Button */}
              <button
                onClick={() => {
                  if (soundEnabled) playSoundWave('click');
                  setIsFullScreen(false);
                }}
                className="p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 text-white/90 hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Exit focus overlay (Esc)"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Centered Breathing Core and Countdown Timer */}
          <div className="flex flex-col items-center justify-center flex-grow z-10">
            
            {/* Visual breathing bellows guiding animations */}
            <div className={`relative w-72 h-72 rounded-full flex items-center justify-center border border-white/10 transition-all duration-500 ${
              isRunning ? "animate-breathe-glow" : ""
            }`}>
              
              {/* Outer halo tracker ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-95" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke={palette.accent}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 * (1 - progressRatio)}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Glowing core sphere */}
              <div 
                className="absolute w-52 h-52 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center justify-center"
              >
                {/* Large minimalist clock face */}
                <h1 className="text-6xl md:text-7xl font-light tracking-tight font-mono text-zinc-100 select-all">
                  {formatTime(timeLeft)}
                </h1>

                {/* Subtitle status indication */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-400 animate-ping" : "bg-zinc-400"}`} />
                  <span className="text-[10px] tracking-widest font-sans font-bold uppercase text-zinc-300">
                    {isRunning ? "Flow Active" : "Paused"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tranquil moving guide subtitles */}
            <div className="mt-8 text-center max-w-sm px-4">
              <span className="text-[11px] font-mono tracking-widest text-[#10B981] font-bold uppercase bg-[#10B981]/10 px-3 py-1 rounded-full">
                {isRunning ? "Breathe in... Breathe out" : "Settle Your Mind"}
              </span>
              <p className="mt-4 text-sm md:text-base font-medium italic text-zinc-300 leading-relaxed font-sans transition-all duration-1000 min-h-12">
                "{zenQuotes[currentQuoteIndex]}"
              </p>
            </div>
          </div>

          {/* Bottom Fullscreen Controls */}
          <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center gap-6">
            
            {/* Session Stats Pill */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-300">
              <Trophy size={13} className="text-amber-400 shrink-0" />
              <span>Session Cycle Checklist: {completedSessions} finished today</span>
            </div>

            {/* Center Playback control wheel */}
            <div className="flex items-center gap-6">
              <button
                onClick={resetTimer}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={toggleTimer}
                className="p-5 rounded-full text-white shadow-2xl transition-all transform hover:scale-110 active:scale-95 text-center flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: palette.accent, boxShadow: `0 0 25px ${palette.accent}33` }}
              >
                {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              {/* Adjust while paused in fullscreen Option */}
              {mode === 'custom' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={decrementCustom}
                    disabled={isRunning}
                    className={`p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all cursor-pointer ${
                      isRunning ? "opacity-30 cursor-not-allowed" : "hover:scale-105"
                    }`}
                    title="Subtract 5 Minutes"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={incrementCustom}
                    disabled={isRunning}
                    className={`p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all cursor-pointer ${
                      isRunning ? "opacity-30 cursor-not-allowed" : "hover:scale-105"
                    }`}
                    title="Add 5 Minutes"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
              Press <span className="underline font-mono">ESC</span> anytime to exit Full Screen
            </p>
          </div>
        </div>
      )}
    </>
  );
}
