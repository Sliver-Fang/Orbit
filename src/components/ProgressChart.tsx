import React, { useState } from "react";
import { Habit, DailyTask, Palette } from "../types";
import { getLocalDateString, getDayOfWeekLabel, getMonthDayLabel } from "../utils/data";
import { motion } from "motion/react";
import { TrendingUp, Award, CheckCircle } from "lucide-react";

interface ProgressChartProps {
  habits: Habit[];
  tasks: DailyTask[];
  palette: Palette;
  isDark: boolean;
}

export default function ProgressChart({ habits, tasks, palette, isDark }: ProgressChartProps) {
  const [metric, setMetric] = useState<'combined' | 'habits' | 'tasks'>('combined');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate the last 7 days
  const days = Array.from({ length: 7 }, (_, i) => getLocalDateString(-6 + i));

  // Compute completions per day
  const data = days.map((day) => {
    // 1. Habits completed on this day
    const habitsDone = habits.filter((h) => h.completedDates.includes(day)).length;
    // 2. Tasks completed on this day
    const tasksDone = tasks.filter((t) => t.assignedDate === day && t.isCompleted).length;

    return {
      day,
      label: getDayOfWeekLabel(day),
      dateLabel: getMonthDayLabel(day),
      habitsDone,
      tasksDone,
      combined: habitsDone + tasksDone,
    };
  });

  // Calculate highest item to scale the graph heights proportionately
  const maxVal = Math.max(...data.map((d) => d[metric]), 4); // default minimum scale roof of 4

  // Chart layout dimensions
  const chartHeight = 220;
  const chartWidth = 560;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 40;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  return (
    <div id="progress-chart-card" className={`p-6 rounded-3xl transition-all duration-300 border ${
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
    } shadow-sm group`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`font-sans font-semibold tracking-tight text-lg mb-1 flex items-center gap-2 ${
            isDark ? "text-zinc-100" : "text-zinc-800"
          }`}>
            <TrendingUp size={18} style={{ color: palette.accent }} />
            Weekly Performance Journey
          </h3>
          <p className="text-xs text-zinc-500 font-sans">
            Completions logged over the trailing 7 days
          </p>
        </div>

        {/* Tab Controls */}
        <div className={`flex p-1 rounded-xl transition-colors duration-200 self-start ${
          isDark ? "bg-zinc-800" : "bg-zinc-100"
        }`}>
          {(['combined', 'habits', 'tasks'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setMetric(opt)}
              className={`px-3 py-1 text-xs font-sans font-medium rounded-lg capitalize transition-all duration-200 ${
                metric === opt
                  ? isDark
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Data Visualization */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
        >
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + graphHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={isDark ? "#27272a" : "#f4f4f5"}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-zinc-400 font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render Bars for last 7 Days */}
          {data.map((item, idx) => {
            const val = item[metric];
            const barHeight = val > 0 ? (val / maxVal) * graphHeight : 4; // minimum structural visual indicator
            const colWidth = graphWidth / 7;
            const x = paddingLeft + idx * colWidth + (colWidth - 28) / 2; // centered
            const y = paddingTop + graphHeight - barHeight;

            // Gradient selection based on metrics
            const barColor = metric === 'combined'
              ? palette.accent
              : metric === 'habits'
                ? '#10b981' // emerald
                : '#f59e0b'; // amber

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Invisible wide interactive columns for easier hover touch targets */}
                <rect
                  x={paddingLeft + idx * colWidth}
                  y={paddingTop}
                  width={colWidth}
                  height={graphHeight}
                  fill="transparent"
                />

                {/* Actual Rounded Bar */}
                <rect
                  x={x}
                  y={y}
                  width="28"
                  height={barHeight}
                  rx="6"
                  ry="6"
                  fill={barColor}
                  opacity={isHovered ? 1 : 0.82}
                  className="transition-all duration-300"
                />

                {/* Day Text Labels (X Axis) */}
                <text
                  x={x + 14}
                  y={chartHeight - 22}
                  textAnchor="middle"
                  className={`font-sans text-[11px] font-semibold tracking-wide ${
                    isHovered
                      ? isDark ? "fill-zinc-100 font-bold" : "fill-zinc-950 font-bold"
                      : "fill-zinc-400"
                  }`}
                >
                  {item.label}
                </text>

                {/* Sub Date indicator */}
                <text
                  x={x + 14}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="font-mono text-[9px] fill-zinc-500"
                >
                  {item.dateLabel.split(' ')[1]}
                </text>

                {/* Hover bubble counter inside the bar or just above */}
                {val > 0 && (
                  <text
                    x={x + 14}
                    y={y - 8}
                    textAnchor="middle"
                    className={`font-semibold font-mono text-[11px] ${
                      isHovered
                        ? "fill-zinc-800 dark:fill-zinc-100"
                        : "fill-transparent"
                    }`}
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Content HUD */}
      <div className={`mt-4 p-3 rounded-2xl flex items-center justify-between transition-colors duration-300 ${
        isDark ? "bg-zinc-800/40" : "bg-zinc-50"
      }`}>
        {hoveredIdx !== null ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{
                backgroundColor: metric === 'combined' ? palette.accent : metric === 'habits' ? '#10b981' : '#f59e0b'
              }} />
              <span className={`text-xs font-sans font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                On <span className="font-semibold">{data[hoveredIdx].dateLabel}</span>:
              </span>
            </div>
            <div className={`text-sm font-mono font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              {metric === 'combined' && `${data[hoveredIdx].combined} Actions Completed`}
              {metric === 'habits' && `${data[hoveredIdx].habitsDone} Habits Checked`}
              {metric === 'tasks' && `${data[hoveredIdx].tasksDone} Tasks Finished`}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Award size={15} className="text-zinc-400" />
              <span className="text-xs text-zinc-500 font-sans">
                Hover over the bars to inspect specific date aggregates
              </span>
            </div>
            <div className="text-xs font-sans text-zinc-400 font-medium flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" />
              Active Week Logged
            </div>
          </>
        )}
      </div>
    </div>
  );
}
