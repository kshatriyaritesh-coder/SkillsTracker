import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  LayoutDashboard, 
  BookOpen, 
  Timer, 
  BarChart2, 
  User as UserIcon, 
  Bell, 
  Award,
  LogOut,
  Sparkles,
  Menu,
  X,
  Plus
} from 'lucide-react';

import { User, Skill, StudySession, DailyGoal, Achievement, Milestone } from './types';
import { 
  DEFAULT_USER, 
  DEFAULT_SKILLS, 
  DEFAULT_GOALS, 
  DEFAULT_ACHIEVEMENTS, 
  generateMockSessions,
  getRelativeDateString
} from './data';

import Dashboard from './components/Dashboard';
import SkillsTracker from './components/SkillsTracker';
import FocusTimer from './components/FocusTimer';
import Statistics from './components/Statistics';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'skills' | 'timer' | 'stats' | 'profile'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Core App States
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Visual Custom Notification Toast State
  const [toast, setToast] = useState<{ show: boolean; title: string; text: string; type: 'achievement' | 'focus' | 'success' } | null>(null);

  // 1. Initial Load: Retrieve from localStorage or seed defaults
  useEffect(() => {
    const cachedUser = localStorage.getItem('st_user');
    const cachedSkills = localStorage.getItem('st_skills');
    const cachedSessions = localStorage.getItem('st_sessions');
    const cachedGoals = localStorage.getItem('st_goals');
    const cachedAchievements = localStorage.getItem('st_achievements');

    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setSkills(cachedSkills ? JSON.parse(cachedSkills) : []);
      setSessions(cachedSessions ? JSON.parse(cachedSessions) : []);
      setGoals(cachedGoals ? JSON.parse(cachedGoals) : []);
      setAchievements(cachedAchievements ? JSON.parse(cachedAchievements) : []);
    } else {
      // Seed with our default profile so the app is instantly rich and satisfying
      setUser(DEFAULT_USER);
      setSkills(DEFAULT_SKILLS);
      setSessions(generateMockSessions());
      setGoals(DEFAULT_GOALS);
      setAchievements(DEFAULT_ACHIEVEMENTS);

      // Save to cache
      localStorage.setItem('st_user', JSON.stringify(DEFAULT_USER));
      localStorage.setItem('st_skills', JSON.stringify(DEFAULT_SKILLS));
      localStorage.setItem('st_sessions', JSON.stringify(generateMockSessions()));
      localStorage.setItem('st_goals', JSON.stringify(DEFAULT_GOALS));
      localStorage.setItem('st_achievements', JSON.stringify(DEFAULT_ACHIEVEMENTS));
    }
  }, []);

  // 2. State Sync Effect: Save updates to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('st_user', JSON.stringify(user));
      localStorage.setItem('st_skills', JSON.stringify(skills));
      localStorage.setItem('st_sessions', JSON.stringify(sessions));
      localStorage.setItem('st_goals', JSON.stringify(goals));
      localStorage.setItem('st_achievements', JSON.stringify(achievements));
    }
  }, [user, skills, sessions, goals, achievements]);

  // Helper to show floating animations/toasts
  const triggerToast = (title: string, text: string, type: 'achievement' | 'focus' | 'success') => {
    setToast({ show: true, title, text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 3. User Authentication Handlers
  const handleLogin = (name: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
      totalStudyHours: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastStudiedDate: null,
      createdAt: new Date('2026-07-11').toISOString().split('T')[0],
    };

    setUser(newUser);
    setSkills([]);
    setSessions([]);
    // Seed general default goals for empty user
    setGoals([
      { id: 'g_e1', userId: newUser.id, text: 'Study for 1 hour', completed: false, date: '2026-07-11' },
      { id: 'g_e2', userId: newUser.id, text: 'Create first Skill Roadmap', completed: false, date: '2026-07-11' },
    ]);
    setAchievements(DEFAULT_ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false, unlockedAt: undefined })));
    triggerToast('Welcome!', `Logged in as ${name}. Let's master something new today!`, 'success');
  };

  const handleLoginDemo = () => {
    setUser(DEFAULT_USER);
    setSkills(DEFAULT_SKILLS);
    setSessions(generateMockSessions());
    setGoals(DEFAULT_GOALS);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    triggerToast('Demo Profile Loaded', 'Successfully initialized with your achievements & 30-day focus logs!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('st_user');
    localStorage.removeItem('st_skills');
    localStorage.removeItem('st_sessions');
    localStorage.removeItem('st_goals');
    localStorage.removeItem('st_achievements');
    setUser(null);
    setSkills([]);
    setSessions([]);
    setGoals([]);
    setAchievements([]);
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  // 4. Daily Goals Operations
  const handleToggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    }));
  };

  const handleAddGoal = (text: string) => {
    if (!user) return;
    const newGoal: DailyGoal = {
      id: `goal_${Date.now()}`,
      userId: user.id,
      text,
      completed: false,
      date: '2026-07-11',
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  // 5. Pomodoro Session Logger & Achievement Trigger Logic
  const handleLogStudySession = (sessionData: { skillId: string; skillName: string; durationMinutes: number; type: 'study' | 'break' }) => {
    if (!user) return;

    const todayStr = '2026-07-11';
    const newSession: StudySession = {
      id: `sess_${Date.now()}`,
      userId: user.id,
      skillId: sessionData.skillId,
      skillName: sessionData.skillName,
      durationMinutes: sessionData.durationMinutes,
      type: sessionData.type,
      timestamp: new Date().toISOString(),
      date: todayStr,
    };

    // 1. Append session log
    setSessions(prev => [newSession, ...prev]);

    // 2. Accumulate study hours to the associated Skill
    if (sessionData.skillId !== 'general') {
      setSkills(prev => prev.map(skill => {
        if (skill.id === sessionData.skillId) {
          return {
            ...skill,
            hoursStudied: skill.hoursStudied + (sessionData.durationMinutes / 60),
            lastStudied: new Date('2026-07-11').toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return skill;
      }));
    }

    // 3. Update learning streak and total hours studied
    const addedHours = sessionData.durationMinutes / 60;
    const updatedHours = user.totalStudyHours + addedHours;
    
    // Streak rules
    const lastStudied = user.lastStudiedDate;
    let newStreak = user.currentStreak;
    let newLongest = user.longestStreak;

    if (lastStudied !== todayStr) {
      // Calculate yesterday's date
      const yesterday = new Date('2026-07-11');
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudied === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      newLongest = Math.max(newLongest, newStreak);
    }

    const updatedUser = {
      ...user,
      totalStudyHours: updatedHours,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStudiedDate: todayStr
    };
    setUser(updatedUser);

    triggerToast(
      'Deep Session Completed!', 
      `Logged 25 mins of Focus under "${sessionData.skillName}". Streak updated!`, 
      'focus'
    );

    // 4. Trigger achievements checker
    checkAchievements(updatedUser, sessions.length + 1, skills);
  };

  // 6. Skill Roadmap Operations
  const handleAddSkill = (skillData: { name: string; category: string; targetPercentage: number; notes: string; milestones: string[] }) => {
    if (!user) return;

    const newMilestones: Milestone[] = skillData.milestones.map((text, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: text,
      completed: false,
    }));

    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      userId: user.id,
      name: skillData.name,
      category: skillData.category,
      progress: 0,
      targetPercentage: skillData.targetPercentage,
      hoursStudied: 0,
      lastStudied: null,
      notes: skillData.notes,
      archived: false,
      createdAt: '2026-07-11',
      milestones: newMilestones,
    };

    setSkills(prev => [...prev, newSkill]);
    triggerToast('Roadmap Created', `Added "${skillData.name}" with ${newMilestones.length} milestones.`, 'success');
  };

  const handleUpdateSkill = (skillId: string, updatedFields: Partial<Skill>) => {
    setSkills(prev => prev.map(skill => {
      if (skill.id === skillId) {
        const mergedSkill = { ...skill, ...updatedFields };
        
        // If milestones list was updated, see if they unlocked the Milestones Crusher
        if (updatedFields.milestones) {
          checkAchievements(user!, sessions.length, prev.map(s => s.id === skillId ? mergedSkill : s));
        }

        return mergedSkill;
      }
      return skill;
    }));
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
    triggerToast('Roadmap Deleted', 'The skill and its milestones were removed.', 'success');
  };

  const handleArchiveSkill = (skillId: string) => {
    setSkills(prev => prev.map(skill => {
      if (skill.id === skillId) {
        const archived = !skill.archived;
        triggerToast(
          archived ? 'Roadmap Archived' : 'Roadmap Unarchived', 
          `"${skill.name}" has been ${archived ? 'moved to archive' : 'restored to active'}.`, 
          'success'
        );
        return { ...skill, archived };
      }
      return skill;
    }));
  };

  // 7. Dynamic Achievements Unlock Evaluation
  const checkAchievements = (currentUser: User, totalSessions: number, currentSkillsList: Skill[]) => {
    // Count total completed milestones across all skills
    const totalMilestonesCompleted = currentSkillsList.reduce((acc, skill) => {
      return acc + skill.milestones.filter(m => m.completed).length;
    }, 0);

    setAchievements(prevAchievements => {
      let changed = false;
      const updatedAchievements = prevAchievements.map(ach => {
        if (ach.unlocked) return ach; // Already unlocked

        let shouldUnlock = false;
        if (ach.type === 'hours' && currentUser.totalStudyHours >= ach.targetValue) {
          shouldUnlock = true;
        } else if (ach.type === 'streak' && currentUser.longestStreak >= ach.targetValue) {
          shouldUnlock = true;
        } else if (ach.type === 'milestones' && totalMilestonesCompleted >= ach.targetValue) {
          shouldUnlock = true;
        } else if (ach.type === 'sessions' && totalSessions >= ach.targetValue) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          changed = true;
          // Trigger a beautiful visual screen toast
          triggerToast(
            '🏆 Achievement Unlocked!', 
            `"${ach.title}" - ${ach.description}`, 
            'achievement'
          );
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toISOString()
          };
        }
        return ach;
      });

      return changed ? updatedAchievements : prevAchievements;
    });
  };

  // Auth Guard
  if (!user) {
    return <Auth onLogin={handleLogin} onLoginDemo={handleLoginDemo} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 font-sans" id="app-viewport-wrapper">
      
      {/* 1. Desktop Sidebar Navigation Menu */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 p-6 shrink-0 h-screen sticky top-0 justify-between" id="desktop-sidebar">
        <div className="space-y-8">
          {/* Brand header Logo */}
          <div className="flex items-center gap-2.5 px-1">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/10">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-extrabold font-display text-slate-900 leading-none">Skills Tracker</h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide block mt-1">Consistency Companion</span>
            </div>
          </div>

          {/* Navigation Buttons List */}
          <nav className="space-y-1.5" id="desktop-nav-menu">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'skills', label: 'My Roadmaps', icon: BookOpen },
              { id: 'timer', label: 'Focus Timer', icon: Timer },
              { id: 'stats', label: 'Insights & Stats', icon: BarChart2 },
              { id: 'profile', label: 'Profile & Badges', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-50/75 text-indigo-700 font-bold shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Small desktop profile summary badge at the bottom of the sidebar */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between" id="sidebar-user-footer">
          <div className="flex items-center gap-2.5">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-100" 
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-slate-800 truncate leading-none">{user.name}</h4>
              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 mt-1 leading-none">
                <Flame size={10} fill="currentColor" /> {user.currentStreak} day streak
              </span>
            </div>
          </div>
          <button 
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* 2. Mobile / Tablet Top Header Bar */}
      <header className="lg:hidden bg-white border-b border-slate-100 px-5 py-4 flex justify-between items-center shrink-0 z-40 sticky top-0" id="mobile-top-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Flame size={16} fill="currentColor" />
          </div>
          <h2 className="font-bold font-display text-slate-900 text-sm">Skills Tracker</h2>
        </div>

        {/* Streak & Drawer toggle buttons */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <Flame size={12} fill="currentColor" /> {user.currentStreak} Days
          </span>
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu Overlays */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 p-5 z-40 shadow-lg space-y-4 text-left"
            id="mobile-nav-drawer"
          >
            <nav className="grid grid-cols-2 gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'skills', label: 'My Roadmaps', icon: BookOpen },
                { id: 'timer', label: 'Focus Timer', icon: Timer },
                { id: 'stats', label: 'Insights & Stats', icon: BarChart2 },
                { id: 'profile', label: 'Profile & Badges', icon: Award },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-btn-${item.id}`}
                    onClick={() => {
                      setCurrentView(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
              </div>
              <button
                id="mobile-logout-action-btn"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={12} /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main View Area Scroll Window */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:py-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] lg:min-h-screen">
        
        {/* Render active subview */}
        {currentView === 'dashboard' && (
          <Dashboard 
            user={user} 
            skills={skills} 
            goals={goals} 
            sessions={sessions} 
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onNavigate={setCurrentView}
            onSelectSkillForTimer={setSelectedSkillId}
          />
        )}

        {currentView === 'skills' && (
          <SkillsTracker 
            skills={skills}
            onAddSkill={handleAddSkill}
            onUpdateSkill={handleUpdateSkill}
            onDeleteSkill={handleDeleteSkill}
            onArchiveSkill={handleArchiveSkill}
            selectedSkillId={selectedSkillId}
            setSelectedSkillId={setSelectedSkillId}
          />
        )}

        {currentView === 'timer' && (
          <FocusTimer 
            skills={skills}
            selectedSkillId={selectedSkillId}
            setSelectedSkillId={setSelectedSkillId}
            onLogStudySession={handleLogStudySession}
            sessions={sessions}
          />
        )}

        {currentView === 'stats' && (
          <Statistics 
            user={user} 
            skills={skills} 
            sessions={sessions} 
          />
        )}

        {currentView === 'profile' && (
          <UserProfile 
            user={user} 
            achievements={achievements} 
            skills={skills}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}

      </main>

      {/* 4. Beautiful Custom Toast Animation Overlay (floating bottom-right corner) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white max-w-sm shadow-2xl flex gap-3 text-left items-start"
            id="floating-toast"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'achievement' 
                ? 'bg-amber-500 text-slate-900' 
                : toast.type === 'focus' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-emerald-500 text-white'
            }`}>
              {toast.type === 'achievement' ? <Award size={18} /> : <Timer size={18} />}
            </div>
            <div>
              <h4 className="font-extrabold text-sm font-display tracking-tight text-white flex items-center gap-1">
                {toast.type === 'achievement' && <Sparkles size={12} className="text-amber-400" />} {toast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Mobile bottom navigation bar for absolute comfort */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex justify-around items-center z-40 shadow-lg" id="mobile-bottom-navigation-bar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'skills', label: 'Roadmaps', icon: BookOpen },
          { id: 'timer', label: 'Timer', icon: Timer },
          { id: 'stats', label: 'Stats', icon: BarChart2 },
          { id: 'profile', label: 'Profile', icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`bottom-nav-btn-${item.id}`}
              onClick={() => {
                setCurrentView(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
