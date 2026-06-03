import React, { useState } from "react";
import { AvoidItem, Palette } from "../types";
import { playSoundWave } from "../utils/data";
import { Plus, Trash2, XCircle, ShieldCheck, ShieldAlert, BadgeMinus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AvoidListProps {
  items: AvoidItem[];
  onAddAvoidItem: (name: string, reason?: string) => void;
  onUpdateAvoidItem: (id: string, avoidedToday: boolean, timesViolatedToday: number) => void;
  onDeleteAvoidItem: (id: string) => void;
  palette: Palette;
  isDark: boolean;
}

export default function AvoidList({
  items,
  onAddAvoidItem,
  onUpdateAvoidItem,
  onDeleteAvoidItem,
  palette,
  isDark
}: AvoidListProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddAvoidItem(name.trim(), reason.trim() || undefined);
    setName("");
    setReason("");
    playSoundWave('success');
  };

  const handleToggleAvoid = (item: AvoidItem) => {
    playSoundWave('click');
    const newState = !item.avoidedToday;
    onUpdateAvoidItem(
      item.id,
      newState,
      newState ? 0 : item.timesViolatedToday // reset slips if checked success, or keep
    );
  };

  const handleIncrementViolations = (item: AvoidItem) => {
    playSoundWave('alarm');
    onUpdateAvoidItem(
      item.id,
      false, // if violated, it wasn't successfully avoided free of slips today!
      item.timesViolatedToday + 1
    );
  };

  return (
    <div id="avoid-list-card" className={`p-6 rounded-3xl transition-all duration-300 border ${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
    } shadow-sm`}>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-sans font-semibold tracking-tight text-base flex items-center gap-2 ${
            isDark ? "text-zinc-100" : "text-zinc-800"
          }`}>
            <XCircle size={18} className="text-rose-500 animate-pulse" />
            Things NOT to Do 🚫
          </h3>
          <p className="text-xs text-zinc-400 font-sans">
            Identify bad habits or boundaries to resist today
          </p>
        </div>
      </div>

      {/* Input Creator Form */}
      <form onSubmit={handleSubmit} className="mb-5 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="No high-sugar snacks after 5PM..."
            className={`flex-1 text-xs p-2.5 rounded-xl border focus:outline-none transition-colors duration-200 font-sans ${
              isDark
                ? "bg-zinc-800/60 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500"
                : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-300"
            }`}
            maxLength={60}
            required
          />
          <button
            type="submit"
            className="px-3.5 rounded-xl text-white font-sans font-semibold text-xs flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: palette.accent }}
          >
            Add
          </button>
        </div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason: Destroys sleep cycle (optional)"
          className={`w-full text-[11px] p-2 rounded-xl border focus:outline-none transition-colors duration-200 font-sans ${
            isDark
              ? "bg-zinc-800/40 border-zinc-700/80 text-zinc-300 placeholder-zinc-500"
              : "bg-zinc-50/50 border-zinc-200/80 text-zinc-600 placeholder-zinc-400"
          }`}
          maxLength={80}
        />
      </form>

      {/* Avoidance Items Lists */}
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-6 text-xs text-zinc-400 italic rounded-2xl border border-dashed font-sans ${
              isDark ? "border-zinc-800 bg-zinc-805/10" : "border-zinc-200 bg-zinc-50/30"
            }`}
          >
            No active barriers configured. Log items you want to avoid!
          </motion.div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
            {items.map((item) => {
              const isCheckingSuccess = item.avoidedToday;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 relative flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCheckingSuccess
                      ? isDark
                        ? "bg-emerald-950/25 border-emerald-900/60"
                        : "bg-emerald-50/70 border-emerald-150"
                      : item.timesViolatedToday > 0
                        ? isDark
                          ? "bg-rose-950/20 border-rose-900/40"
                          : "bg-rose-50/60 border-rose-100"
                        : isDark
                          ? "bg-zinc-800/40 border-zinc-800/80"
                          : "bg-zinc-50/70 border-zinc-150"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-block">
                        {isCheckingSuccess ? (
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        ) : item.timesViolatedToday > 0 ? (
                          <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                        ) : (
                          <BadgeMinus size={14} className="text-zinc-400 shrink-0" />
                        )}
                      </span>
                      <div className="truncate">
                        <p className={`text-xs font-sans font-semibold tracking-wide ${
                          isCheckingSuccess
                            ? "line-through text-emerald-800 dark:text-emerald-400"
                            : isDark ? "text-zinc-100" : "text-zinc-800"
                        }`}>
                          {item.name}
                        </p>
                        {item.reason && (
                          <p className={`text-[10px] font-sans truncate mt-0.5 ${
                            isCheckingSuccess
                              ? "text-emerald-600/70 dark:text-emerald-500/70"
                              : "text-zinc-400"
                          }`}>
                            Why: {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Deck */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    
                    {/* Log Slip/Violation Count Button */}
                    <button
                      onClick={() => handleIncrementViolations(item)}
                      title="Log slip counter"
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors border cursor-pointer ${
                        item.timesViolatedToday > 0
                          ? isDark
                            ? "bg-rose-955/40 border-rose-900/50 text-rose-300 hover:bg-rose-900/30"
                            : "bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200"
                          : isDark
                            ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-400"
                            : "bg-white border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200"
                      }`}
                    >
                      <span>Slipped: {item.timesViolatedToday}</span>
                    </button>

                    {/* Resisted / Checked Secure Today */}
                    <button
                      onClick={() => handleToggleAvoid(item)}
                      className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                        isCheckingSuccess
                          ? "bg-emerald-600 text-white"
                          : isDark
                            ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                            : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {isCheckingSuccess ? "Resisted! ✨" : "Resisted Today"}
                    </button>

                    {/* Trash remove item */}
                    <button
                      onClick={() => {
                        playSoundWave('click');
                        onDeleteAvoidItem(item.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Remove check"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
