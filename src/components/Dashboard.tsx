import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle, 
  Plus, 
  Play, 
  TrendingUp, 
  Compass,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Skill, DailyGoal, StudySession, User } from '../types';

interface DashboardProps {
  user: User;
  skills: Skill[];
  goals: DailyGoal[];
  sessions: StudySession[];
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (text: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onNavigate: (view: 'dashboard' | 'skills' | 'timer' | 'stats' | 'profile') => void;
  onSelectSkillForTimer: (skillId: string) => void;
}

export default function Dashboard({
  user,
  skills,
  goals,
  sessions,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onNavigate,
  onSelectSkillForTimer,
}: DashboardProps) {
  const [newGoalText, setNewGoalText] = useState('');

  // Calculations
  const todayStr = new Date('2026-07-11').toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayFocusHours = (todayFocusMinutes / 60).toFixed(1);

  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsCount = goals.length;
  const goalProgressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Calculate weekly focus hours (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date('2026-07-11');
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  const weeklyFocusMinutes = sessions
    .filter(s => last7Days.includes(s.date))
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const weeklyFocusHours = (weeklyFocusMinutes / 60).toFixed(1);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal(newGoalText.trim());
    setNewGoalText('');
  };

  const activeSkills = skills.filter(s => !s.archived);

  // Calculations for Activity Intensity (Bento style)
  const weeklyIntensityData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date('2026-07-11');
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => s.date === dateStr);
    const focusMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const focusHrs = focusMins / 60;
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    return { dayName, hours: focusHrs, dateStr };
  }).reverse();

  const maxHours = Math.max(...weeklyIntensityData.map(d => d.hours), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard-view-container">
      
      {/* 1. Welcome Banner Block (col-span-8 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 lg:col-span-8 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-sm border border-indigo-950/80 flex flex-col justify-between min-h-[220px]"
        id="dashboard-welcome-banner"
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-4 backdrop-blur-md">
            <Sparkles size={11} /> Live Learning Studio
          </span>
          <h1 className="text-3xl font-extrabold font-display tracking-tight sm:text-4xl">
            Welcome back, <span className="text-indigo-300 font-extrabold">{user.name}</span>
          </h1>
          <p className="mt-2.5 text-indigo-200/90 text-sm sm:text-base leading-relaxed max-w-xl">
            Consistency breeds mastery. You're on a <span className="font-extrabold text-amber-400">{user.currentStreak} day streak</span>—let's keep the fire burning today!
          </p>
        </div>
        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
          <button 
            id="dashboard-start-timer-btn"
            onClick={() => onNavigate('timer')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Play size={14} fill="currentColor" /> Start Focused Session
          </button>
          <button 
            id="dashboard-view-skills-btn"
            onClick={() => onNavigate('skills')}
            className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
          >
            Manage Roadmaps <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* 2. Streak & Motivation Level Up Block (col-span-4 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="col-span-12 lg:col-span-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[220px]"
        id="dashboard-streak-card"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Daily Level Up</p>
          <h3 className="text-xl font-bold mt-1 font-display">Consistent Master</h3>
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            Keep logging focused minutes to maintain your learning fire and complete your targets.
          </p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-extrabold font-display flex items-center gap-1.5">
              🔥 {user.currentStreak} <span className="text-xs font-bold opacity-80 tracking-wide uppercase">Days</span>
            </span>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
              {Math.min(100, Math.round((user.totalStudyHours % 1) * 100))}% to next hour
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(15, Math.min(100, Math.round((user.totalStudyHours % 1) * 100)))}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* 3. Interactive Focus Timer Preview Card (col-span-4 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-12 lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between relative overflow-hidden min-h-[360px]"
        id="dashboard-focus-timer-card"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
        <div className="w-full flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Session</span>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {todaySessions.length} Logs Today
          </span>
        </div>
        
        <div className="relative w-44 h-44 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90">
            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
            <circle 
              cx="88" 
              cy="88" 
              r="76" 
              fill="transparent" 
              stroke="#4F46E5" 
              strokeWidth="10" 
              strokeDasharray="477" 
              strokeDashoffset={477 - (477 * Math.min(100, (Number(todayFocusHours) / 4) * 100)) / 100} 
              strokeLinecap="round" 
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center text-center px-4">
            <span className="text-3xl font-extrabold font-display text-slate-800">{todayFocusHours}h</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5">Focus Today</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">
            <span>Target: 4.0 Hrs</span>
            <span>{Math.round((Number(todayFocusHours) / 4) * 100)}% Completed</span>
          </div>
          <div className="flex gap-2.5 w-full">
            <button 
              onClick={() => onNavigate('timer')}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              Go to Timer
            </button>
            <button 
              onClick={() => onNavigate('skills')}
              className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Roadmaps
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4. Daily Habits & Targets Checklist Block (col-span-5 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full min-h-[360px]"
        id="dashboard-goals-panel"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-slate-800" size={18} />
            <h2 className="font-extrabold font-display text-slate-800 text-lg">Daily Targets</h2>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {completedGoalsCount}/{totalGoalsCount} Done
          </span>
        </div>

        <form onSubmit={handleAddGoalSubmit} className="flex gap-2 mb-4" id="add-goal-form">
          <input 
            id="new-goal-input"
            type="text" 
            placeholder="Complete 4 Pomodoro sessions..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors bg-slate-50/50"
          />
          <button 
            id="add-goal-submit-btn"
            type="submit"
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Plus size={16} />
          </button>
        </form>

        {goals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            <Compass size={28} className="mb-2 stroke-1 text-slate-400" />
            <p className="text-xs font-bold text-slate-500">No daily targets set.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Write a habit above to stay disciplined!</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[220px] flex-1 pr-1 scrollbar-none" id="goals-list-container">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                id={`goal-item-${goal.id}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  goal.completed 
                    ? 'bg-slate-50 border-slate-100 text-slate-400' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input 
                    type="checkbox" 
                    checked={goal.completed}
                    onChange={() => onToggleGoal(goal.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span className={`text-xs font-semibold ${goal.completed ? 'line-through opacity-75' : 'font-medium text-slate-700'}`}>
                    {goal.text}
                  </span>
                </label>
                <button 
                  id={`delete-goal-btn-${goal.id}`}
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Plus size={12} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 5. Activity Intensity / Histogram Block (col-span-3 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-12 lg:col-span-3 bg-slate-900 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[360px]"
        id="dashboard-intensity-card"
      >
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consistency</p>
          <h3 className="text-md font-bold font-display text-slate-200">Activity Intensity</h3>
        </div>

        {/* Bar chart container */}
        <div className="flex items-end gap-2.5 h-36 my-4 px-1">
          {weeklyIntensityData.map((day, idx) => {
            const barHeight = `${Math.max(10, Math.min(100, (day.hours / maxHours) * 100))}%`;
            const isToday = day.dateStr === todayStr;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <span className="absolute bottom-full mb-1.5 bg-slate-800 border border-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.hours.toFixed(1)}h
                </span>
                {/* Bar */}
                <div 
                  style={{ height: barHeight }}
                  className={`w-full rounded-t transition-all duration-500 ${
                    isToday ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                ></div>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tight select-none">
                  {day.dayName.substring(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-[10px] font-extrabold tracking-wider text-slate-400 bg-slate-800/40 px-3 py-2 rounded-xl">
          <span>Week Total:</span>
          <span className="text-indigo-400 font-extrabold">{weeklyFocusHours} Hours</span>
        </div>
      </motion.div>

      {/* 6. Recent Focused Sessions (col-span-9 on desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="col-span-12 lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
        id="dashboard-history-timeline-panel"
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-slate-800" />
            <h2 className="font-extrabold font-display text-slate-800 text-lg">Recent Focus Logs</h2>
          </div>
          <button 
            id="dashboard-view-all-stats"
            onClick={() => onNavigate('stats')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            Analytics & Charts <ChevronRight size={14} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="py-12 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            <p className="text-xs font-bold text-slate-500">No sessions logged yet.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Your study sessions will be logged here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="recent-sessions-grid">
            {sessions.slice(0, 3).map((session) => {
              const date = new Date(session.timestamp);
              const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isToday = session.date === todayStr;

              return (
                <div 
                  key={session.id} 
                  id={`recent-session-item-${session.id}`}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-all flex flex-col justify-between min-h-[110px]"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {session.skillName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {formattedTime}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-md font-extrabold text-slate-800 font-display">
                      {session.durationMinutes} Mins Focus
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                      <span>Log date:</span>
                      <span className={isToday ? 'text-amber-600 font-bold' : ''}>
                        {isToday ? 'Today' : session.date}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 7. Active Skills Roadmap (col-span-12) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
        id="dashboard-skills-panel"
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="text-slate-800" size={18} />
            <h2 className="font-extrabold font-display text-slate-800 text-lg">Active Skill Roadmaps</h2>
          </div>
          <button 
            id="dashboard-view-all-skills"
            onClick={() => onNavigate('skills')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            See All Roadmaps <ChevronRight size={14} />
          </button>
        </div>

        {activeSkills.length === 0 ? (
          <div className="py-12 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            <Compass size={28} className="mb-2 stroke-1 text-slate-400" />
            <p className="text-xs font-bold text-slate-500">No active skills found.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Create your first skill and milestones to start tracking!</p>
            <button 
              id="dashboard-create-skill-btn-empty"
              onClick={() => onNavigate('skills')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Create Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="active-skills-list">
            {activeSkills.slice(0, 3).map((skill) => {
              const completedMilestones = skill.milestones.filter(m => m.completed).length;
              const totalMilestones = skill.milestones.length;

              return (
                <div 
                  key={skill.id}
                  id={`active-skill-item-${skill.id}`}
                  className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {skill.category}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600">
                        {skill.progress}% Done
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors font-display">
                      {skill.name}
                    </h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} className="text-indigo-500" />
                      <span>{completedMilestones}/{totalMilestones} Milestones</span>
                    </div>
                    
                    <button 
                      id={`dashboard-skill-timer-btn-${skill.id}`}
                      onClick={() => {
                        onSelectSkillForTimer(skill.id);
                        onNavigate('timer');
                      }}
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-colors cursor-pointer"
                      title="Start focus session for this skill"
                    >
                      <Play size={10} fill="currentColor" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
}
