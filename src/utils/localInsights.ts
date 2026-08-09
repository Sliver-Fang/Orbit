/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData } from '../types';
import { getPastLocalDateString } from './dateUtils';

export interface LocalInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
}

export const generateLocalInsights = (data: AppData): LocalInsight[] => {
  const insights: LocalInsight[] = [];
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => getPastLocalDateString(i));
  const previous7Days = Array.from({ length: 7 }).map((_, i) => getPastLocalDateString(i + 7));

  // --- 1. RECENT STUDY HOURS & BAD HABIT CORRELATION ---
  const studySessionsThisWeek = data.studySessions.filter(s => last7Days.includes(s.date));
  const studyMinsThisWeek = studySessionsThisWeek.reduce((acc, s) => acc + s.duration, 0);
  const studyHoursThisWeek = Number((studyMinsThisWeek / 60).toFixed(1));

  const completedTasksThisWeek = data.tasks.filter(t => t.status === 'Completed' && last7Days.includes(t.deadline)).length;

  // Calculate "hours wasted" on bad habits (Instagram, YouTube, Gaming, Phone Addiction)
  // Let's assume typical average waste per trigger:
  // YouTube: 1.5 hours, Instagram: 1 hour, Gaming: 2 hours, Phone Addiction: 1.5 hours, Procrastination: 2 hours, Late Sleeping: 1 hour.
  let hoursWasted = 0;
  let youtubeTriggers = 0;
  let instagramTriggers = 0;

  data.habits.forEach(h => {
    if (h.type === 'Bad') {
      const triggersThisWeek = h.failureDates.filter(d => last7Days.includes(d)).length;
      if (h.name === 'YouTube') {
        youtubeTriggers = triggersThisWeek;
        hoursWasted += triggersThisWeek * 1.5;
      } else if (h.name === 'Instagram') {
        instagramTriggers = triggersThisWeek;
        hoursWasted += triggersThisWeek * 1.0;
      } else if (h.name === 'Gaming') {
        hoursWasted += triggersThisWeek * 2.0;
      } else if (h.name === 'Phone Addiction') {
        hoursWasted += triggersThisWeek * 1.5;
      } else {
        hoursWasted += triggersThisWeek * 1.0;
      }
    }
  });

  if (completedTasksThisWeek > 0 || hoursWasted > 0) {
    if (hoursWasted > 5) {
      insights.push({
        type: 'warning',
        message: `You completed ${completedTasksThisWeek} tasks this week while spending approximately ${hoursWasted.toFixed(1)} hours on distracting habits (including YouTube/Instagram). Try a 25/5 Pomodoro next time to lock in focus!`
      });
    } else if (completedTasksThisWeek >= 5 && hoursWasted <= 2) {
      insights.push({
        type: 'success',
        message: `Outstanding self-discipline! You crushed ${completedTasksThisWeek} tasks this week with minimal distraction logs (less than 2 hours wasted).`
      });
    } else {
      insights.push({
        type: 'info',
        message: `You registered ${studyHoursThisWeek} hours of study and finished ${completedTasksThisWeek} tasks. Keep a strict timer during YouTube sessions to double your efficiency.`
      });
    }
  }

  // --- 2. WEEK-OVER-WEEK REVISION FREQUENCY TREND ---
  const revisionsThisWeek = data.revisions.filter(r => last7Days.includes(r.date)).length;
  const revisionsLastWeek = data.revisions.filter(r => previous7Days.includes(r.date)).length;

  if (revisionsLastWeek > 0) {
    const pctChange = Math.round(((revisionsThisWeek - revisionsLastWeek) / revisionsLastWeek) * 100);
    if (pctChange > 0) {
      insights.push({
        type: 'success',
        message: `Your revision frequency increased by ${pctChange}% compared to last week. Active recall is boosting your cognitive retention!`
      });
    } else if (pctChange < 0) {
      insights.push({
        type: 'warning',
        message: `Revision frequency dropped by ${Math.abs(pctChange)}% this week. Schedule a 15-minute quick revision card for active subjects tomorrow.`
      });
    }
  } else if (revisionsThisWeek > 1) {
    insights.push({
      type: 'success',
      message: `You logged ${revisionsThisWeek} key revisions this week! Repeating topics is the key to conquering long-term exams.`
    });
  }

  // --- 3. DETERMINING MOST PRODUCTIVE STUDY DAY ---
  // Group study session minutes by Day of Week (0-6, where 0 is Sunday, 1 is Monday, etc.)
  const dayMins = Array(7).fill(0);
  data.studySessions.forEach(s => {
    const d = new Date(s.date);
    const dayOfWeek = d.getDay();
    dayMins[dayOfWeek] += s.duration;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let maxDayIdx = -1;
  let maxMins = 0;
  for (let i = 0; i < 7; i++) {
    if (dayMins[i] > maxMins) {
      maxMins = dayMins[i];
      maxDayIdx = i;
    }
  }

  if (maxMins > 0 && maxDayIdx !== -1) {
    insights.push({
      type: 'info',
      message: `${dayNames[maxDayIdx]} is your most productive day, with a total of ${(maxMins/60).toFixed(1)} hours logged historically.`
    });
  }

  // --- 4. SUBJECT COMPLETION / FOCUS INSIGHTS ---
  if (data.studySessions.length > 0) {
    const subjMins: Record<string, number> = {};
    data.studySessions.forEach(s => {
      subjMins[s.subjectId] = (subjMins[s.subjectId] || 0) + s.duration;
    });

    let maxSubjId = '';
    let maxSubjMins = 0;
    Object.entries(subjMins).forEach(([id, mins]) => {
      if (mins > maxSubjMins) {
        maxSubjMins = mins;
        maxSubjId = id;
      }
    });

    const subjName = data.subjects.find(s => s.id === maxSubjId)?.name;
    if (subjName) {
      insights.push({
        type: 'info',
        message: `Your most studied subject is ${subjName}, clocking a total of ${(maxSubjMins/60).toFixed(1)} focus hours.`
      });
    }
  }

  // Fallback insights if database is empty/freshly reset
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      message: "Ready to analyze! Log your first study session, tick off a task, or mark your habits to see intelligent local insights."
    });
  }

  return insights;
};
