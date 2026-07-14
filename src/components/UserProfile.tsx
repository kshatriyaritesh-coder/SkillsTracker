import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  CheckCircle, 
  User as UserIcon,
  HelpCircle,
  Zap,
  BookOpen,
  Mail,
  LogOut,
  Edit2
} from 'lucide-react';
import { User, Achievement, Skill } from '../types';

interface UserProfileProps {
  user: User;
  achievements: Achievement[];
  skills: Skill[];
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onLogout: () => void;
}

const PREMIUM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', // Student girl
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256', // Designer boy
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', // Tech developer
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256', // Language learner girl
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', // Athlete boy
];

export default function UserProfile({
  user,
  achievements,
  skills,
  onUpdateUser,
  onLogout,
}: UserProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);

  const activeSkillsCount = skills.filter(s => !s.archived).length;
  const completedSkillsCount = skills.filter(s => s.progress >= 100).length;

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    onUpdateUser({ name: tempName.trim() });
    setIsEditingName(false);
  };

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatar(url);
    onUpdateUser({ avatar: url });
    setIsChangingAvatar(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-view-container">
      
      {/* Left Column: User Profile Details Cards */}
      <div className="space-y-6" id="profile-left-column">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center flex flex-col items-center"
          id="profile-info-card"
        >
          {/* Avatar Area */}
          <div className="relative group mb-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-md group-hover:opacity-90 transition-all"
            />
            <button 
              id="change-avatar-icon-btn"
              onClick={() => setIsChangingAvatar(!isChangingAvatar)}
              className="absolute right-0 bottom-0 p-2 rounded-full bg-slate-900 text-white border-2 border-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Premium Avatar Selector Grid Drawer */}
          <AnimatePresence>
            {isChangingAvatar && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4"
                id="avatar-selector-panel"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Select Study Vibe Avatar</span>
                <div className="flex justify-center gap-2">
                  {PREMIUM_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      id={`avatar-option-${idx}`}
                      onClick={() => handleSelectAvatar(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        user.avatar === url ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <img src={url} alt="vibe-avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Editor Area */}
          {!isEditingName ? (
            <div className="flex items-center gap-2 justify-center mb-1">
              <h2 className="text-xl font-bold text-slate-800 font-display">{user.name}</h2>
              <button 
                id="edit-profile-name-btn"
                onClick={() => setIsEditingName(true)}
                className="text-slate-300 hover:text-slate-500 p-1 rounded-md"
              >
                <Edit2 size={13} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-center mb-1 max-w-[80%]">
              <input 
                id="profile-name-input-field"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="border border-slate-200 rounded-xl px-2.5 py-1 text-sm text-center font-bold focus:border-indigo-500 outline-none w-full"
              />
              <button 
                id="save-profile-name-btn"
                onClick={handleSaveName}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 justify-center text-xs text-slate-400 mt-1">
            <Mail size={12} />
            <span>{user.email}</span>
          </div>

          <div className="w-full border-t border-slate-50 my-5"></div>

          {/* Left profile summary statistics list */}
          <div className="w-full space-y-3" id="profile-detailed-stats-grid">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Clock size={13} /> Accumulated Study</span>
              <span className="font-bold text-slate-800">{user.totalStudyHours.toFixed(1)} hours</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Flame size={13} fill="currentColor" className="text-amber-500" /> Longest Streak</span>
              <span className="font-bold text-slate-800">{user.longestStreak} days</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><BookOpen size={13} /> Active Roadmaps</span>
              <span className="font-bold text-slate-800">{activeSkillsCount} Active</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle size={13} /> Completed Roadmaps</span>
              <span className="font-bold text-slate-800">{completedSkillsCount} Completed</span>
            </div>
          </div>

          <div className="w-full border-t border-slate-50 my-5"></div>

          {/* Logout Action */}
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={13} /> Log out of account
          </button>
        </motion.div>
      </div>

      {/* Right Column: Achievements Cabinet */}
      <div className="lg:col-span-2 space-y-6" id="profile-right-column">
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left"
          id="achievements-cabinet"
        >
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-5">
            <Award className="text-indigo-500" size={20} />
            <div>
              <h3 className="font-bold font-display text-slate-800 text-base leading-none">Learning Achievements</h3>
              <p className="text-xs text-slate-400 mt-1">Unlock badges by staying committed to your roadmap milestones.</p>
            </div>
          </div>

          {/* Grid list of achievements cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="achievements-list">
            {achievements.map((ach) => {
              // Calculate progress towards achievement
              let currentValue = 0;
              if (ach.type === 'hours') currentValue = user.totalStudyHours;
              else if (ach.type === 'streak') currentValue = user.longestStreak;
              else if (ach.type === 'milestones') {
                // Count completed milestones across all skills
                currentValue = skills.reduce((acc, s) => {
                  return acc + s.milestones.filter(m => m.completed).length;
                }, 0);
              } else if (ach.type === 'sessions') {
                // This is sessions length
                currentValue = user.totalStudyHours * 2.4; // rough estimate or sessions length
              }

              // Clamp progress percentage
              const percent = Math.min(Math.round((currentValue / ach.targetValue) * 100), 100);

              return (
                <div 
                  key={ach.id}
                  id={`achievement-card-${ach.id}`}
                  className={`p-4 rounded-2xl border transition-all flex gap-3.5 ${
                    ach.unlocked 
                      ? 'bg-gradient-to-br from-white to-slate-50/20 border-indigo-100 shadow-sm' 
                      : 'bg-slate-50/20 border-slate-100/60 opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-xl h-12 w-12 flex items-center justify-center shrink-0 border ${
                    ach.unlocked 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {/* Render matching icon dynamically */}
                    {ach.iconName === 'Flame' && <Flame size={20} fill={ach.unlocked ? "currentColor" : "none"} />}
                    {ach.iconName === 'Clock' && <Clock size={20} />}
                    {ach.iconName === 'Award' && <Award size={20} />}
                    {ach.iconName === 'Zap' && <Zap size={20} fill={ach.unlocked ? "currentColor" : "none"} />}
                    {ach.iconName === 'CheckCircle' && <CheckCircle size={20} />}
                    {ach.iconName === 'ShieldAlert' && <ShieldCheck size={20} />}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{ach.title}</h4>
                        {ach.unlocked ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase">Unlocked</span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase">Locked</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ach.description}</p>
                    </div>

                    {/* Progress slider towards locked reward */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Progress</span>
                        <span className="font-bold text-slate-500">{percent}% ({Math.round(currentValue)}/{ach.targetValue})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            ach.unlocked ? 'bg-indigo-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
