import React, { useState, useEffect } from "react";
import { SleepWakeLog, Palette } from "../types";
import { getLocalDateString, playSoundWave } from "../utils/data";
import { Sun, Moon, Clock, MonitorPlay, Zap, Coffee } from "lucide-react";

interface SleepTimerProps {
  logs: SleepWakeLog[];
  onSaveLogs: (newLogs: SleepWakeLog[]) => void;
  palette: Palette;
  isDark: boolean;
}

export default function SleepTimer({ logs, onSaveLogs, palette, isDark }: SleepTimerProps) {
  const [currentAwakeTime, setCurrentAwakeTime] = useState<string | null>(null);
  const [runningSeconds, setRunningSeconds] = useState(0);

  // Sync state with active log in current logs list
  const activeLog = logs.find(l => l.status === 'active-awake');

  useEffect(() => {
    if (activeLog && activeLog.wakeTime) {
      setCurrentAwakeTime(activeLog.wakeTime);
      const wakeDate = new Date(activeLog.wakeTime);
      const diffSecs = Math.floor((new Date().getTime() - wakeDate.getTime()) / 1000);
      setRunningSeconds(diffSecs > 0 ? diffSecs : 0);
    } else {
      setCurrentAwakeTime(null);
      setRunningSeconds(0);
    }
  }, [logs]);

  // Real-time ticking counter for awake duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (currentAwakeTime) {
      interval = setInterval(() => {
        setRunningSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentAwakeTime]);

  const handleWakeUp = () => {
    playSoundWave('success');
    const nowStr = new Date().toISOString();
    const todayStr = getLocalDateString();
    
    // Create new log
    const newLog: SleepWakeLog = {
      id: Math.random().toString(36).substring(2, 9),
      date: todayStr,
      wakeTime: nowStr,
      status: 'active-awake'
    };

    // Deactivate previous active logs just in case
    const updated = logs.map(l => {
      if (l.status === 'active-awake') {
        const fallbackWake = l.wakeTime || nowStr;
        const duration = Math.abs(new Date().getTime() - new Date(fallbackWake).getTime()) / (1000 * 60 * 60);
        return {
          ...l,
          sleepTime: nowStr,
          durationHours: Number(duration.toFixed(2)),
          status: 'completed' as const
        };
      }
      return l;
    });

    onSaveLogs([newLog, ...updated]);
  };

  const handleSleep = () => {
    playSoundWave('alarm');
    const nowStr = new Date().toISOString();
    
    const updated = logs.map(l => {
      if (l.status === 'active-awake') {
        const wakeTime = l.wakeTime || nowStr;
        const duration = Math.abs(new Date().getTime() - new Date(wakeTime).getTime()) / (1000 * 60 * 60);
        return {
          ...l,
          sleepTime: nowStr,
          durationHours: Number(duration.toFixed(2)),
          status: 'completed' as const
        };
      }
      return l;
    });

    onSaveLogs(updated);
  };

  // Convert seconds to readable hour limit
  const formatSecondsToDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const getLogStartTimeLabel = (isoStr?: string) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="sleep-timer-card" className={`p-6 rounded-3xl transition-all duration-300 border ${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
    } shadow-sm h-full flex flex-col justify-between`}>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-sans font-semibold tracking-tight text-base ${
              isDark ? "text-zinc-100" : "text-zinc-800"
            }`}>
              Day Logger & Timer
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Track your daily active window duration
            </p>
          </div>
          
          <Clock size={18} className="text-zinc-400" />
        </div>

        {/* Current status display */}
        <div className={`p-4 rounded-2xl mb-4 text-center ${
          activeLog
            ? isDark ? "bg-emerald-950/20 border border-emerald-900/40" : "bg-emerald-50/70 border border-emerald-100"
            : isDark ? "bg-zinc-800/40 border border-zinc-800" : "bg-zinc-50 border border-zinc-100"
        }`}>
          {activeLog ? (
            <div className="space-y-1.5 animate-pulse">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-500 text-white uppercase">
                <Sun size={10} className="animate-spin duration-3000" /> Waking Phase
              </span>
              <div className={`font-mono text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                {formatSecondsToDuration(runningSeconds)}
              </div>
              <p className="text-[10px] text-zinc-500 font-sans">
                Logged morning wake-up at {getLogStartTimeLabel(activeLog.wakeTime)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-indigo-500 text-white uppercase">
                <Moon size={10} /> Rest Phase
              </span>
              <div className={`font-mono text-xl font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                Offline
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Log wake time when you start your day
              </p>
            </div>
          )}
        </div>

        {/* Big Switch Controls */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleWakeUp}
            disabled={!!activeLog}
            className={`py-3 px-4 rounded-xl font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeLog
                ? "opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
            }`}
          >
            <Sun size={14} className="text-white" />
            <span>Woke Up ☀️</span>
          </button>

          <button
            onClick={handleSleep}
            disabled={!activeLog}
            className={`py-3 px-4 rounded-xl font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
              !activeLog
                ? "opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            }`}
          >
            <Moon size={14} className="text-white" />
            <span>Sleeping 🌙</span>
          </button>
        </div>
      </div>

      {/* Historical List */}
      <div>
        <h4 className={`text-[10px] font-sans font-bold uppercase tracking-wider mb-2 ${
          isDark ? "text-zinc-500" : "text-zinc-400"
        }`}>
          Recent Awake Logs
        </h4>
        
        {logs.filter(l => l.status === 'completed').length === 0 ? (
          <div className="text-center py-2 text-xs text-zinc-400 italic font-sans">
            Completions appear here
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto scrollbar-thin">
            {logs
              .filter(l => l.status === 'completed')
              .slice(0, 3)
              .map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between text-xs p-2 rounded-xl border ${
                    isDark
                      ? "bg-zinc-800/20 border-zinc-800/80 text-zinc-300"
                      : "bg-zinc-50/50 border-zinc-100 text-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={11} className="text-amber-500" />
                    <span className="font-medium font-sans">
                      {new Date(log.date + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-zinc-700 dark:text-zinc-200">
                    <Coffee size={11} className="text-zinc-400" />
                    <span>{log.durationHours} hrs active</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  );
}
