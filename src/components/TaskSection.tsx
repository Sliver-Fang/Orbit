import React, { useState } from "react";
import { DailyTask, Palette } from "../types";
import { getLocalDateString, playSoundWave } from "../utils/data";
import { Plus, Trash2, CheckCircle2, ChevronRight, ListTodo, ClipboardCheck, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TaskSectionProps {
  tasks: DailyTask[];
  onAddTask: (name: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  palette: Palette;
  isDark: boolean;
}

export default function TaskSection({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  palette,
  isDark
}: TaskSectionProps) {
  const [taskName, setTaskName] = useState("");
  const todayStr = getLocalDateString();

  // Filter tasks to show ONLY today's assigned tasks
  const todaysTasks = tasks.filter((t) => t.assignedDate === todayStr);
  const pendingTasks = todaysTasks.filter((t) => !t.isCompleted);
  const completedTasks = todaysTasks.filter((t) => t.isCompleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAddTask(taskName.trim());
    setTaskName("");
    playSoundWave('success');
  };

  return (
    <div id="tasks-split-section" className="space-y-4">
      
      {/* Title & Creator Block */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      } shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`font-sans font-semibold tracking-tight text-base flex items-center gap-2 ${
              isDark ? "text-zinc-100" : "text-zinc-800"
            }`}>
              <ListTodo size={18} style={{ color: palette.accent }} />
              Today's Task Columns 📋
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Plan and check off tasks assigned specifically for today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Assign today's task..."
              className={`text-xs p-2.5 rounded-xl border focus:outline-none transition-colors font-sans min-w-[180px] ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500"
                  : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-300"
              }`}
              maxLength={60}
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-white font-sans font-semibold text-xs flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              style={{ backgroundColor: palette.accent }}
            >
              <Plus size={13} strokeWidth={3} />
              <span>Assign</span>
            </button>
          </form>
        </div>
      </div>

      {/* Two Column Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Column 1: Pending Task List */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[250px] ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        } shadow-sm`}>
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: palette.accent }} />
                <h4 className={`text-xs font-sans font-bold uppercase tracking-wider ${
                  isDark ? "text-zinc-300" : "text-zinc-700"
                }`}>
                  To-Do (Pending)
                </h4>
              </div>
              <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                {pendingTasks.length} tasks
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {pendingTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-xs text-zinc-450 italic font-sans"
                >
                  All tasks cleared, or no agenda assigned for today!
                </motion.div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                  {pendingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isDark ? "bg-zinc-800/25 border-zinc-800/80" : "bg-zinc-50/50 border-zinc-150"
                      }`}
                    >
                      <button
                        onClick={() => {
                          playSoundWave('success');
                          onToggleTask(task.id);
                        }}
                        className={`text-left text-xs font-sans font-semibold tracking-wide flex-1 min-w-0 pr-2 flex items-center gap-2 cursor-pointer ${
                          isDark ? "text-zinc-200" : "text-zinc-800"
                        }`}
                      >
                        <ChevronRight size={13} className="text-zinc-400 py-0.5 shrink-0" />
                        <span className="truncate">{task.name}</span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            playSoundWave('success');
                            onToggleTask(task.id);
                          }}
                          className={`px-2.5 py-1 text-[10px] font-sans font-bold rounded-lg border transition-all cursor-pointer ${
                            isDark
                              ? "border-emerald-900/60 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30"
                              : "border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          Check Done
                        </button>
                        <button
                          onClick={() => {
                            playSoundWave('click');
                            onDeleteTask(task.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: Completed Task List Check column */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[250px] ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100/50 border-zinc-100"
        } shadow-sm`}>
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-dashed border-zinc-200 dark:border-zinc-850">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <h4 className={`text-xs font-sans font-bold uppercase tracking-wider ${
                  isDark ? "text-zinc-300" : "text-zinc-700"
                }`}>
                  Done (Completed)
                </h4>
              </div>
              <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isDark ? "bg-zinc-800 text-emerald-400" : "bg-emerald-50 text-emerald-700"
              }`}>
                {completedTasks.length} done
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {completedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-xs text-zinc-400 italic font-sans"
                >
                  No tasks completed yet. Finish a task above!
                </motion.div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                  {completedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                        isDark ? "bg-emerald-950/10 border-emerald-900/20" : "bg-emerald-50/20 border-emerald-100/40"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2 text-left flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span className={`text-xs font-sans font-semibold tracking-wide truncate line-through ${
                          isDark ? "text-emerald-500/80" : "text-emerald-800/70"
                        }`}>
                          {task.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            playSoundWave('click');
                            onToggleTask(task.id);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-sans font-medium rounded-md border cursor-pointer ${
                            isDark
                              ? "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                              : "border-zinc-200 text-zinc-650 hover:bg-zinc-100"
                          }`}
                          title="Return to pending list"
                        >
                          Undo
                        </button>
                        <button
                          onClick={() => {
                            playSoundWave('click');
                            onDeleteTask(task.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                          title="Clear forever"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
