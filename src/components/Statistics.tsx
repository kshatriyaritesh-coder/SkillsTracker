import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle, 
  BookOpen,
  PieChart,
  HelpCircle,
  HelpCircle as GridIcon
} from 'lucide-react';
import { Skill, StudySession, User } from '../types';

interface StatisticsProps {
  user: User;
  skills: Skill[];
  sessions: StudySession[];
}

export default function Statistics({ user, skills, sessions }: StatisticsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'consistency' | 'skills'>('weekly');

  const today = new Date('2026-07-11');
  const todayStr = today.toISOString().split('T')[0];

  // 1. Calculations for Weekly Bar Chart (Last 7 days)
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date('2026-07-11');
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => s.date === dateStr);
    const focusMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const focusHours = focusMins / 60;

    // Get Day Name
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    
    return {
      date: dateStr,
      dayName,
      hours: Number(focusHours.toFixed(1)),
      count: daySessions.length
    };
  }).reverse();

  // Find max hours in weekly to scale the SVG bars properly
  const maxWeeklyHours = Math.max(...last7DaysData.map(d => d.hours), 1.5);

  // 2. Calculations for Monthly Bar Chart (Last 4 Weeks)
  const last4WeeksData = Array.from({ length: 4 }).map((_, i) => {
    const weekStartOffset = i * 7;
    let weekMins = 0;
    let weekSessionsCount = 0;

    const daysInWeek = Array.from({ length: 7 }).map((_, dIndex) => {
      const d = new Date('2026-07-11');
      d.setDate(d.getDate() - (weekStartOffset + dIndex));
      return d.toISOString().split('T')[0];
    });

    const weekSessions = sessions.filter(s => daysInWeek.includes(s.date));
    weekMins = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    weekSessionsCount = weekSessions.length;

    return {
      weekLabel: `Week ${4 - i}`,
      hours: Number((weekMins / 60).toFixed(1)),
      count: weekSessionsCount
    };
  }).reverse();

  const maxMonthlyHours = Math.max(...last4WeeksData.map(d => d.hours), 5);

  // 3. Consistency Grid (GitHub Style: Last 30 Days)
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date('2026-07-11');
    d.setDate(d.getDate() - (29 - i)); // 30 days leading up to today
    const dateStr = d.toISOString().split('T')[0];

    const daySessions = sessions.filter(s => s.date === dateStr);
    const focusMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const hours = focusMins / 60;

    // Intensity color level
    let level = 0;
    if (hours > 0 && hours <= 0.5) level = 1;
    else if (hours > 0.5 && hours <= 1.5) level = 2;
    else if (hours > 1.5) level = 3;

    return {
      date: dateStr,
      dayOfMonth: d.getDate(),
      hours: Number(hours.toFixed(1)),
      level,
      sessionsCount: daySessions.length
    };
  });

  // 4. Skills statistics progress calculation
  const skillProgressSummary = skills.map(s => {
    const totalMilestones = s.milestones.length;
    const completedMilestones = s.milestones.filter(m => m.completed).length;
    return {
      name: s.name,
      category: s.category,
      hours: s.hoursStudied,
      progress: s.progress,
      completedMilestones,
      totalMilestones
    };
  });

  return (
    <div className="space-y-6" id="stats-view-container">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Learning Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Deep analytics on your focus hours, milestone completions, and habit streaks.</p>
      </div>

      {/* Ribbon stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="stats-cards-ribbon">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Learning Hours</span>
            <span className="text-xl font-bold text-slate-800 font-display mt-0.5">{user.totalStudyHours.toFixed(1)} hrs</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Study Streak</span>
            <span className="text-xl font-bold text-slate-800 font-display mt-0.5">{user.currentStreak} Days</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Sessions</span>
            <span className="text-xl font-bold text-slate-800 font-display mt-0.5">{sessions.length} Focus Blocks</span>
          </div>
        </div>
      </div>

      {/* Analytics Tabs Selector */}
      <div className="border-b border-slate-100 flex gap-4" id="stats-tab-menu">
        <button
          id="stats-tab-weekly-btn"
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === 'weekly' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Study Hours Weekly
          {activeTab === 'weekly' && (
            <motion.div layoutId="active-stats-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          id="stats-tab-consistency-btn"
          onClick={() => setActiveTab('consistency')}
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === 'consistency' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Consistency Matrix (30 Days)
          {activeTab === 'consistency' && (
            <motion.div layoutId="active-stats-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          id="stats-tab-skills-btn"
          onClick={() => setActiveTab('skills')}
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === 'skills' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Skill Comparison
          {activeTab === 'skills' && (
            <motion.div layoutId="active-stats-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left" id="analytics-tab-body">
        
        {/* TAB 1: Weekly/Monthly hours vertical bar chart */}
        {activeTab === 'weekly' && (
          <div className="space-y-8" id="tab-weekly-analytics">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Last 7 Days SVG Bar Chart */}
              <div className="lg:col-span-2 space-y-4" id="weekly-hours-chart">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart size={16} className="text-indigo-500" /> Daily Focus (Last 7 Days)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100/50 px-2.5 py-1 rounded-md">
                    Target: 2.0 hrs / day
                  </span>
                </div>

                {/* SVG bar container */}
                <div className="h-64 flex items-end justify-between gap-2.5 pt-8 px-4 border-b border-slate-100" id="weekly-svg-container">
                  {last7DaysData.map((day) => {
                    const heightPercent = (day.hours / maxWeeklyHours) * 100;
                    const isGoalMet = day.hours >= 2.0;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        {/* Hover Tooltip tooltip */}
                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none transition-all z-20 shadow-md whitespace-nowrap">
                          <p className="font-bold">{day.hours} Hours Focus</p>
                          <p className="text-[9px] text-slate-300">{day.count} Pomodoros ({day.date})</p>
                        </div>

                        {/* Hour marker value */}
                        <span className="text-[10px] font-bold text-slate-500 mb-2">{day.hours}h</span>

                        {/* Bar fill */}
                        <div className="w-full max-w-[32px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`w-full rounded-t-lg transition-colors ${
                              isGoalMet 
                                ? 'bg-gradient-to-t from-indigo-600 to-indigo-500' 
                                : 'bg-gradient-to-t from-slate-500 to-slate-400 group-hover:from-indigo-400 group-hover:to-indigo-300'
                            }`}
                          ></motion.div>
                        </div>

                        {/* Day label */}
                        <span className="text-xs font-semibold text-slate-400 mt-3 whitespace-nowrap">{day.dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly/Monthly aggregated analysis metrics */}
              <div className="space-y-6" id="aggregated-weekly-metrics">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp size={14} className="text-indigo-500" /> Weekly Distribution
                  </h4>
                  
                  <div className="space-y-3.5">
                    {last4WeeksData.map((week, idx) => {
                      const barWidth = (week.hours / maxMonthlyHours) * 100;
                      return (
                        <div key={week.weekLabel} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">{week.weekLabel}</span>
                            <span className="font-semibold text-slate-700">{week.hours} hrs <span className="text-slate-400 text-[10px]">({week.count} sessions)</span></span>
                          </div>
                          <div className="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className="bg-indigo-600 h-full rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Weekly Habit Score: Good</h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      You averaged <b>1.8 hours</b> of deep study per day this week. Clear milestones were cleared in React and Design. Keep it up!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: Consistency grid (GitHub contribution map style) */}
        {activeTab === 'consistency' && (
          <div className="space-y-6" id="tab-consistency-analytics">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <GridIcon size={16} className="text-indigo-500" /> Study Consistency Grid
                </h3>
                <p className="text-xs text-slate-400 mt-1">Consistency maps tracking daily focus logs. Avoid breaking the learning habit loop.</p>
              </div>

              {/* Legend map */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold" id="consistency-legend">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded bg-slate-100"></div>
                <div className="w-3.5 h-3.5 rounded bg-indigo-100"></div>
                <div className="w-3.5 h-3.5 rounded bg-indigo-300"></div>
                <div className="w-3.5 h-3.5 rounded bg-indigo-600"></div>
                <span>More</span>
              </div>
            </div>

            {/* Grid display */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50" id="consistency-matrix-outer">
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2" id="consistency-grid-container">
                {last30Days.map((day) => {
                  let bgColor = 'bg-slate-100 hover:bg-slate-200';
                  if (day.level === 1) bgColor = 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700';
                  else if (day.level === 2) bgColor = 'bg-indigo-300 hover:bg-indigo-400 text-white';
                  else if (day.level === 3) bgColor = 'bg-indigo-600 hover:bg-indigo-700 text-white';

                  const dayOfWeek = new Date(day.date).toLocaleDateString([], { weekday: 'short' });

                  return (
                    <div
                      key={day.date}
                      id={`consistency-cell-${day.date}`}
                      className={`h-11 rounded-lg transition-all cursor-help flex flex-col justify-center items-center font-mono select-none relative group ${bgColor}`}
                    >
                      {/* Grid hover element */}
                      <span className="text-[10px] font-bold">{day.dayOfMonth}</span>
                      <span className="text-[8px] opacity-70 font-semibold mt-0.5">{dayOfWeek}</span>

                      {/* Tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-slate-950 text-white text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none transition-all z-20 shadow-md whitespace-nowrap text-center">
                        <p className="font-bold">{day.hours} Hours Study</p>
                        <p className="text-[8px] text-slate-300">{day.sessionsCount} Sessions completed</p>
                        <p className="text-[8px] text-slate-400">{day.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-2xl p-4 flex gap-3.5">
              <Flame size={20} className="text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
              <div className="text-xs">
                <h4 className="font-bold text-indigo-900">Your Current Learning Streak is {user.currentStreak} Days!</h4>
                <p className="text-indigo-700/80 mt-1 leading-relaxed">
                  Your longest recorded streak in Skills Tracker was <b>{user.longestStreak} days</b>, set last month. Study at least 1 Focus block tomorrow to protect and increase your streak!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Skill comparative details circular progress */}
        {activeTab === 'skills' && (
          <div className="space-y-6" id="tab-skills-comparison">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-500" /> Skill Roadmap Comparison
            </h3>

            {skillProgressSummary.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <p className="text-xs font-semibold">No skills to compare yet.</p>
                <p className="text-[11px] mt-0.5">Define your skills and complete roadmaps milestones to see relative comparisons.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="skill-progress-comparison-grid">
                {skillProgressSummary.map((item) => {
                  return (
                    <div 
                      key={item.name}
                      id={`skill-comparison-card-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                      className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 hover:bg-slate-50/75 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-400 uppercase tracking-widest">
                            {item.category}
                          </span>
                          <span className="text-xs font-extrabold text-indigo-600">{item.progress}%</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{item.hours.toFixed(1)} focus hours accumulated</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <CheckCircle size={13} className="text-indigo-500" />
                          {item.completedMilestones}/{item.totalMilestones} Milestones done
                        </span>
                        
                        {/* Circular progress display */}
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="16" cy="16" r="13" className="stroke-slate-200" strokeWidth="2" fill="transparent" />
                            <circle 
                              cx="16" 
                              cy="16" 
                              r="13" 
                              className="stroke-indigo-600" 
                              strokeWidth="2.5" 
                              strokeDasharray={2 * Math.PI * 13}
                              strokeDashoffset={2 * Math.PI * 13 * (1 - item.progress / 100)}
                              strokeLinecap="round" 
                              fill="transparent" 
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
