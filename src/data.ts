import { User, Skill, StudySession, DailyGoal, Achievement } from './types';

// Helper to format date relative to today (2026-07-11)
export function getRelativeDateString(daysOffset: number): string {
  const baseDate = new Date('2026-07-11');
  baseDate.setDate(baseDate.getDate() + daysOffset);
  return baseDate.toISOString().split('T')[0];
}

export const DEFAULT_USER: User = {
  id: 'user_1',
  email: 'user@example.com',
  name: 'User',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  totalStudyHours: 42.5,
  longestStreak: 12,
  currentStreak: 5,
  lastStudiedDate: '2026-07-10',
  createdAt: '2026-05-15',
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'First Step',
    description: 'Complete your first study session.',
    iconName: 'Flame',
    unlocked: true,
    unlockedAt: '2026-06-12T10:30:00Z',
    type: 'sessions',
    targetValue: 1,
  },
  {
    id: 'ach_2',
    title: 'Focus Initiate',
    description: 'Accumulate 10 hours of focused study.',
    iconName: 'Clock',
    unlocked: true,
    unlockedAt: '2026-06-25T16:45:00Z',
    type: 'hours',
    targetValue: 10,
  },
  {
    id: 'ach_3',
    title: 'Deep Work Master',
    description: 'Accumulate 40 hours of focused study.',
    iconName: 'Award',
    unlocked: true,
    unlockedAt: '2026-07-09T15:20:00Z',
    type: 'hours',
    targetValue: 40,
  },
  {
    id: 'ach_4',
    title: 'Consistency King',
    description: 'Achieve a 10-day learning streak.',
    iconName: 'Zap',
    unlocked: true,
    unlockedAt: '2026-06-22T21:00:00Z',
    type: 'streak',
    targetValue: 10,
  },
  {
    id: 'ach_5',
    title: 'Milestone Crusher',
    description: 'Complete 10 skill roadmap milestones.',
    iconName: 'CheckCircle',
    unlocked: true,
    unlockedAt: '2026-07-02T11:40:00Z',
    type: 'milestones',
    targetValue: 10,
  },
  {
    id: 'ach_6',
    title: 'Unstoppable Mind',
    description: 'Achieve a 30-day learning streak.',
    iconName: 'ShieldAlert',
    unlocked: false,
    type: 'streak',
    targetValue: 30,
  },
];

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'skill_1',
    userId: 'user_1',
    name: 'React & TypeScript Development',
    category: 'Programming',
    progress: 66,
    targetPercentage: 100,
    hoursStudied: 22.5,
    lastStudied: '2026-07-10 18:30',
    notes: 'Focusing on building elegant, performant user interfaces and strict TypeScript typings. Need to review state machines next.',
    archived: false,
    createdAt: '2026-06-10',
    milestones: [
      { id: 'm1_1', name: 'HTML5 Semantic Elements & CSS Variables', completed: true, completedAt: '2026-06-12' },
      { id: 'm1_2', name: 'JavaScript Modern ES6+ & Async/Await', completed: true, completedAt: '2026-06-15' },
      { id: 'm1_3', name: 'React Hooks (useState, useEffect, useMemo, useCallback)', completed: true, completedAt: '2026-06-20' },
      { id: 'm1_4', name: 'TypeScript Basics (Interfaces, Generics, Union types)', completed: true, completedAt: '2026-06-28' },
      { id: 'm1_5', name: 'React Context API & State Management', completed: false },
      { id: 'm1_6', name: 'Vite Production Bundling & Optimizations', completed: false },
    ],
  },
  {
    id: 'skill_2',
    userId: 'user_1',
    name: 'Japanese N5 Language Prep',
    category: 'Languages',
    progress: 40,
    targetPercentage: 100,
    hoursStudied: 12.0,
    lastStudied: '2026-07-09 14:15',
    notes: 'Aiming to clear JLPT N5 by December. Practicing writing kanji on tablet daily.',
    archived: false,
    createdAt: '2026-06-11',
    milestones: [
      { id: 'm2_1', name: 'Hiragana Mastery (Reading & Writing)', completed: true, completedAt: '2026-06-14' },
      { id: 'm2_2', name: 'Katakana Mastery (Reading & Writing)', completed: true, completedAt: '2026-06-18' },
      { id: 'm2_3', name: 'Basic 100 Kanji Characters', completed: false },
      { id: 'm2_4', name: 'Particles (wa, ga, o, ni, de, e)', completed: false },
      { id: 'm2_5', name: 'Listening & Simple Conversational Phrases', completed: false },
    ],
  },
  {
    id: 'skill_3',
    userId: 'user_1',
    name: 'UI/UX Visual Design',
    category: 'Design',
    progress: 60,
    targetPercentage: 100,
    hoursStudied: 8.0,
    lastStudied: '2026-07-08 11:00',
    notes: 'Learning layout grids, responsive typography scales, and high-fidelity component properties.',
    archived: false,
    createdAt: '2026-06-15',
    milestones: [
      { id: 'm3_1', name: 'Figma Auto-Layout & Constraints', completed: true, completedAt: '2026-06-19' },
      { id: 'm3_2', name: 'Typography Scales & Vertical Grids', completed: true, completedAt: '2026-06-24' },
      { id: 'm3_3', name: 'Color Psychology & Contrast Guidelines (WCAG)', completed: true, completedAt: '2026-07-01' },
      { id: 'm3_4', name: 'High-Fidelity Interactive Prototyping', completed: false },
      { id: 'm3_5', name: 'Design System Documentation & Handoff', completed: false },
    ],
  },
];

export const DEFAULT_GOALS: DailyGoal[] = [
  { id: 'g_1', userId: 'user_1', text: 'Study 2 hours total', completed: false, date: '2026-07-11' },
  { id: 'g_2', userId: 'user_1', text: 'Complete 3 Pomodoro sessions', completed: true, date: '2026-07-11' },
  { id: 'g_3', userId: 'user_1', text: 'Review Japanese Kanji (10 chars)', completed: false, date: '2026-07-11' },
  { id: 'g_4', userId: 'user_1', text: 'Implement layout animations', completed: true, date: '2026-07-11' },
];

// Generate programmatically study sessions for the last 30 days
export function generateMockSessions(): StudySession[] {
  const sessions: StudySession[] = [];
  const skillMap = [
    { id: 'skill_1', name: 'React & TypeScript Development' },
    { id: 'skill_2', name: 'Japanese N5 Prep' },
    { id: 'skill_3', name: 'UI/UX Visual Design' },
  ];

  // Let's seed back from 30 days ago to yesterday
  // Today is 2026-07-11. We go back to 2026-06-11
  for (let i = -30; i < 0; i++) {
    const dateStr = getRelativeDateString(i);
    const dayOfWeek = new Date(dateStr).getDay(); // 0 is Sunday, 6 is Saturday

    // Study probability: weekdays are higher than weekends, but let's make some days empty to simulate realistic learning
    let numSessions = 0;
    
    // Create some streaks and gaps
    // Gap around 2026-06-23 to 2026-06-25
    const isGapDate = dateStr >= '2026-06-23' && dateStr <= '2026-06-25';
    
    if (!isGapDate) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend: 40% chance of 1-2 sessions
        if (Math.random() > 0.6) {
          numSessions = Math.floor(Math.random() * 2) + 1;
        }
      } else {
        // Weekday: 85% chance of 1-4 sessions
        if (Math.random() > 0.15) {
          numSessions = Math.floor(Math.random() * 3) + 1;
        }
      }
    }

    for (let s = 0; s < numSessions; s++) {
      // Pick a random skill
      const skill = skillMap[Math.floor(Math.random() * skillMap.length)];
      const hour = 9 + Math.floor(Math.random() * 11); // between 9 AM and 8 PM
      const minute = Math.floor(Math.random() * 6) * 10;
      
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      
      sessions.push({
        id: `sess_m_${i}_${s}`,
        userId: 'user_1',
        skillId: skill.id,
        skillName: skill.name,
        durationMinutes: 25,
        type: 'study',
        timestamp: `${dateStr}T${timeStr}Z`,
        date: dateStr,
      });
    }
  }

  return sessions;
}
