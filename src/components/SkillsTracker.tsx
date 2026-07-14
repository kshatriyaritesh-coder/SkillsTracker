import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Archive, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckSquare, 
  ChevronRight, 
  Folder, 
  Award,
  ChevronLeft,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Skill, Milestone } from '../types';

interface SkillsTrackerProps {
  skills: Skill[];
  onAddSkill: (skillData: { name: string; category: string; targetPercentage: number; notes: string; milestones: string[] }) => void;
  onUpdateSkill: (skillId: string, updatedFields: Partial<Skill>) => void;
  onDeleteSkill: (skillId: string) => void;
  onArchiveSkill: (skillId: string) => void;
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
}

export default function SkillsTracker({
  skills,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onArchiveSkill,
  selectedSkillId,
  setSelectedSkillId,
}: SkillsTrackerProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [isAddingNewSkill, setIsAddingNewSkill] = useState(false);
  
  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillTarget, setNewSkillTarget] = useState(100);
  const [newSkillNotes, setNewSkillNotes] = useState('');
  const [newMilestonesText, setNewMilestonesText] = useState('');

  // Editing Skill state (for notes or title)
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  // Milestone input for detailed view
  const [newMilestoneInput, setNewMilestoneInput] = useState('');

  // Unique categories
  const categories = ['All', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = skills.filter(skill => {
    const matchesCat = activeCategoryFilter === 'All' || skill.category === activeCategoryFilter;
    return matchesCat;
  });

  const handleOpenDetail = (skill: Skill) => {
    setSelectedSkillId(skill.id);
    setEditedNotes(skill.notes);
    setEditedName(skill.name);
    setEditedCategory(skill.category);
    setIsEditingSkill(false);
  };

  const currentSkill = skills.find(s => s.id === selectedSkillId);

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    // Split milestones text by lines or commas
    const milestonesList = newMilestonesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    onAddSkill({
      name: newSkillName.trim(),
      category: newSkillCategory.trim(),
      targetPercentage: Number(newSkillTarget) || 100,
      notes: newSkillNotes.trim(),
      milestones: milestonesList,
    });

    // Reset Form
    setNewSkillName('');
    setNewSkillCategory('Programming');
    setNewSkillTarget(100);
    setNewSkillNotes('');
    setNewMilestonesText('');
    setIsAddingNewSkill(false);
  };

  // Milestone handlers
  const handleToggleMilestone = (skillId: string, milestoneId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    const updatedMilestones = skill.milestones.map(m => {
      if (m.id === milestoneId) {
        const completed = !m.completed;
        return {
          ...m,
          completed,
          completedAt: completed ? new Date('2026-07-11').toISOString().split('T')[0] : undefined
        };
      }
      return m;
    });

    // Recalculate progress percentage
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateSkill(skillId, {
      milestones: updatedMilestones,
      progress,
      lastStudied: new Date('2026-07-11').toISOString().replace('T', ' ').substring(0, 16)
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSkill || !newMilestoneInput.trim()) return;

    const newMilestone: Milestone = {
      id: `m_${Date.now()}`,
      name: newMilestoneInput.trim(),
      completed: false,
    };

    const updatedMilestones = [...currentSkill.milestones, newMilestone];
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateSkill(currentSkill.id, {
      milestones: updatedMilestones,
      progress,
    });

    setNewMilestoneInput('');
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (!currentSkill) return;

    const updatedMilestones = currentSkill.milestones.filter(m => m.id !== milestoneId);
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateSkill(currentSkill.id, {
      milestones: updatedMilestones,
      progress,
    });
  };

  const handleSaveNotes = () => {
    if (!currentSkill) return;
    onUpdateSkill(currentSkill.id, {
      notes: editedNotes,
      name: editedName,
      category: editedCategory,
    });
    setIsEditingSkill(false);
  };

  return (
    <div className="space-y-6" id="skills-tracker-view-container">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="skills-header">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Skills Roadmaps</h1>
          <p className="text-xs text-slate-500 mt-1">Break skills into structured milestones to visualize your mastery path.</p>
        </div>
        <button 
          id="create-new-skill-btn"
          onClick={() => setIsAddingNewSkill(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus size={14} /> Create Skill Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="skills-main-layout">
        
        {/* Left Side: Skills list */}
        <div className={`lg:col-span-2 space-y-4 ${selectedSkillId ? 'hidden lg:block' : 'block'}`} id="skills-list-section">
          {/* Categories Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none" id="category-filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-tab-${cat}`}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  activeCategoryFilter === cat
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of skills */}
          {filteredSkills.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-450 shadow-sm" id="empty-skills-state">
              <Layers size={40} className="mx-auto mb-3 stroke-1 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">No skills in this category</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Create a roadmap with interactive milestones like 'Animations' or 'Japanese Hiragana' to stay consistent.</p>
              <button 
                id="empty-state-add-skill-btn"
                onClick={() => setIsAddingNewSkill(true)}
                className="mt-4 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Create First Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="skills-grid">
              {filteredSkills.map((skill) => {
                const totalMilestones = skill.milestones.length;
                const completedMilestones = skill.milestones.filter(m => m.completed).length;
                const isSelected = skill.id === selectedSkillId;

                return (
                  <motion.div
                    key={skill.id}
                    id={`skill-card-${skill.id}`}
                    layoutId={`skill-card-layout-${skill.id}`}
                    onClick={() => handleOpenDetail(skill)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-50/10' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {skill.category}
                        </span>
                        {skill.archived && (
                          <span className="text-[9px] font-bold text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            Archived
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1 font-display">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[32px] leading-relaxed">
                        {skill.notes || 'No log written yet.'}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      {/* Progress ring/bar info */}
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                        <span className="text-slate-700">{completedMilestones}/{totalMilestones} Milestones</span>
                        <span className="text-indigo-600">{skill.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {skill.hoursStudied.toFixed(1)} hrs
                        </span>
                        {skill.lastStudied && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> Studied {skill.lastStudied.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Skill Detail Drawer/Page (and Roadmap execution) */}
        <div className={`lg:col-span-1 ${selectedSkillId ? 'block' : 'hidden lg:block'}`} id="skill-detail-panel">
          {currentSkill ? (
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-6"
              id={`skill-detail-card-${currentSkill.id}`}
            >
              {/* Back to list button (for tablet/mobile) */}
              <button
                id="back-to-list-btn"
                onClick={() => setSelectedSkillId(null)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2 lg:hidden cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to skills list
              </button>

              {/* Title & Actions */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {!isEditingSkill ? (
                    <>
                      <span className="inline-block text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md mb-2">
                        {currentSkill.category}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 font-display leading-snug">{currentSkill.name}</h2>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Skill Name</label>
                        <input
                          id="edit-skill-name-input"
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                        <input
                          id="edit-skill-cat-input"
                          type="text"
                          value={editedCategory}
                          onChange={(e) => setEditedCategory(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!isEditingSkill ? (
                    <button
                      id="edit-skill-action-btn"
                      onClick={() => {
                        setIsEditingSkill(true);
                        setEditedNotes(currentSkill.notes);
                        setEditedName(currentSkill.name);
                        setEditedCategory(currentSkill.category);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit details"
                    >
                      <FileText size={16} />
                    </button>
                  ) : (
                    <button
                      id="save-skill-action-btn"
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Save
                    </button>
                  )}
                  
                  <button
                    id="archive-skill-action-btn"
                    onClick={() => onArchiveSkill(currentSkill.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    title={currentSkill.archived ? "Unarchive skill" : "Archive skill"}
                  >
                    <Archive size={16} className={currentSkill.archived ? "fill-amber-400 stroke-amber-500" : ""} />
                  </button>

                  <button
                    id="delete-skill-action-btn"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this skill and all its roadmap milestones? This cannot be undone.")) {
                        onDeleteSkill(currentSkill.id);
                        setSelectedSkillId(null);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete skill"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Card Inside Details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hours Tracked</span>
                  <span className="text-lg font-bold text-slate-800 font-display mt-0.5 flex items-center gap-1">
                    <Clock size={14} className="text-indigo-500" />
                    {currentSkill.hoursStudied.toFixed(1)} hrs
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Goals</span>
                  <span className="text-lg font-bold text-slate-800 font-display mt-0.5 flex items-center gap-1">
                    <Award size={14} className="text-amber-500" />
                    {currentSkill.progress}% Done
                  </span>
                </div>
              </div>

              {/* General Study Notes Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText size={14} className="text-slate-500" /> Study Notes & Logs
                </h4>
                {!isEditingSkill ? (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl min-h-[70px]">
                    {currentSkill.notes || 'Write down some notes, core books, links, or specific learning plans for this skill.'}
                  </p>
                ) : (
                  <textarea
                    id="edit-skill-notes-input"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 min-h-[90px] bg-slate-50/50"
                    placeholder="Enter study strategies, materials, or general comments..."
                  />
                )}
              </div>

              {/* Milestone Roadmap Tracker */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers size={14} className="text-indigo-500 animate-pulse" /> Milestone Roadmap
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {currentSkill.milestones.filter(m => m.completed).length}/{currentSkill.milestones.length} Done
                  </span>
                </div>

                {/* Add Milestone Form */}
                <form onSubmit={handleAddMilestone} className="flex gap-2" id="add-milestone-form">
                  <input
                    id="new-milestone-text-input"
                    type="text"
                    placeholder="Add milestone e.g. Flexbox, Kanji..."
                    value={newMilestoneInput}
                    onChange={(e) => setNewMilestoneInput(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 bg-slate-50/20"
                  />
                  <button
                    id="add-milestone-submit-btn"
                    type="submit"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                {/* Milestones list */}
                {currentSkill.milestones.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
                    <p className="text-xs">No milestones yet.</p>
                    <p className="text-[10px] mt-0.5">Define steps to master this skill!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5" id="skill-milestones-list">
                    {currentSkill.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        id={`milestone-item-${milestone.id}`}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          milestone.completed
                            ? 'bg-emerald-50/30 border-emerald-100/60 text-slate-400'
                            : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={() => handleToggleMilestone(currentSkill.id, milestone.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                          />
                          <span className={`text-xs ${milestone.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                            {milestone.name}
                          </span>
                        </label>
                        <button
                          id={`delete-milestone-btn-${milestone.id}`}
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 min-h-[300px]">
              <Layers size={36} className="mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">Select a skill to view roadmap</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">View milestones, update study logs, or log progress.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal Dialog */}
      <AnimatePresence>
        {isAddingNewSkill && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add-skill-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-lg text-slate-900 font-display">Create Skill Roadmap</h3>
                </div>
                <button
                  id="close-add-skill-modal-btn"
                  onClick={() => setIsAddingNewSkill(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSkillSubmit} className="space-y-4" id="create-skill-form">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Skill Name</label>
                  <input
                    id="new-skill-name-field"
                    type="text"
                    required
                    placeholder="e.g. React & Node.js, Japanese JLPT N5..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Category</label>
                    <select
                      id="new-skill-category-field"
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                    >
                      <option value="Programming">Programming</option>
                      <option value="Languages">Languages</option>
                      <option value="Design">Design</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Academics">Academics</option>
                      <option value="Music">Music</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Target Goal (%)</label>
                    <input
                      id="new-skill-target-field"
                      type="number"
                      min="1"
                      max="100"
                      value={newSkillTarget}
                      onChange={(e) => setNewSkillTarget(Number(e.target.value))}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">Study Strategy / Log Notes</label>
                  <textarea
                    id="new-skill-notes-field"
                    placeholder="e.g. Learning from Udemy and MDN. Aiming for 2 hours a day. Need to build 5 portfolio projects."
                    value={newSkillNotes}
                    onChange={(e) => setNewSkillNotes(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 min-h-[80px] bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase">
                    Initial Milestones (One per line)
                  </label>
                  <textarea
                    id="new-skill-milestones-field"
                    placeholder="HTML Introduction&#10;Forms & Inputs&#10;CSS Flexbox&#10;TypeScript Generics"
                    value={newMilestonesText}
                    onChange={(e) => setNewMilestonesText(e.target.value)}
                    className="w-full text-sm font-mono border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 min-h-[110px] bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Separate milestones by pushing Enter/Return. You can add more later.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    id="cancel-add-skill-modal-btn"
                    type="button"
                    onClick={() => setIsAddingNewSkill(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-add-skill-modal-btn"
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Create Roadmap <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
