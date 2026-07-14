import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Flame, 
  Award, 
  Timer,
  CheckCircle2,
  Sparkles,
  Zap,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { Skill, StudySession } from '../types';

interface FocusTimerProps {
  skills: Skill[];
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
  onLogStudySession: (session: { skillId: string; skillName: string; durationMinutes: number; type: 'study' | 'break' }) => void;
  sessions: StudySession[];
}

type TimerMode = 'study' | 'break';

export default function FocusTimer({
  skills,
  selectedSkillId,
  setSelectedSkillId,
  onLogStudySession,
  sessions,
}: FocusTimerProps) {
  // Timer settings
  const STUDY_DURATION = 25 * 60; // 25 minutes in seconds
  const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState(STUDY_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [totalCompletedSessions, setTotalCompletedSessions] = useState(0);

  // Ambient sound state
  const [ambientSound, setAmbientSound] = useState<'none' | 'white' | 'rain' | 'waves'>('none');
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Today calculations
  const todayStr = new Date('2026-07-11').toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Calculate current progress percentage
  const totalSeconds = mode === 'study' ? STUDY_DURATION : BREAK_DURATION;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Selected skill
  const activeSkills = skills.filter(s => !s.archived);
  const currentSkill = activeSkills.find(s => s.id === selectedSkillId);

  // Synth Audio Helpers for notifications
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSynthesizedChime = (type: 'start' | 'complete' | 'break') => {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Ensure AudioContext is resumed (browser safety rules)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        // Double fast high chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1, ); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'complete') {
        // Arpeggio chime: C5 -> E5 -> G5 -> C6
        osc.type = 'triangle';
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        });
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'break') {
        // Relaxing low chord-like slide
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.4); // A4
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (err) {
      console.warn('Audio synthesis failed or blocked by browser policies:', err);
    }
  };

  // Manage ambient sound synth loop
  useEffect(() => {
    if (!isRunning || ambientSound === 'none') {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.disconnect();
        } catch(e){}
        noiseNodeRef.current = null;
      }
      return;
    }

    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Disconnect existing noise
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.disconnect(); } catch(e){}
      }

      // Generate procedural White Noise / Wave / Rain synth
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to shape noise (Rain/Brown Noise is heavily low-passed)
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      if (ambientSound === 'white') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        gainNode.gain.value = 0.03; // quiet volume
      } else if (ambientSound === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.2;
        gainNode.gain.value = 0.05;
      } else if (ambientSound === 'waves') {
        // Slow modulating bandpass
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.value = 0.04;
        
        // Add low frequency oscillator to simulate surging waves
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // slow waves: 6-7 seconds
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
      }

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;

    } catch (e) {
      console.warn('Ambient sound generation failed:', e);
    }

    return () => {
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.disconnect(); } catch(e){}
      }
    };
  }, [ambientSound, isRunning]);

  // Main Timer Tick Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'study') {
      playSynthesizedChime('complete');
      setTotalCompletedSessions(prev => prev + 1);

      // Log study session
      const skillName = currentSkill ? currentSkill.name : 'General Study';
      const skillId = selectedSkillId || 'general';

      onLogStudySession({
        skillId,
        skillName,
        durationMinutes: 25,
        type: 'study'
      });

      // Switch to break
      setMode('break');
      setTimeLeft(BREAK_DURATION);
    } else {
      playSynthesizedChime('break');
      // Switch back to study
      setMode('study');
      setTimeLeft(STUDY_DURATION);
    }
  };

  const toggleTimer = () => {
    initAudioContext();
    if (!isRunning) {
      playSynthesizedChime('start');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(mode === 'study' ? STUDY_DURATION : BREAK_DURATION);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mode === 'study') {
      // Prompt confirm study session log?
      if (confirm('Skip study block? This session will not be fully logged.')) {
        setMode('break');
        setTimeLeft(BREAK_DURATION);
      }
    } else {
      // Skip break
      setMode('study');
      setTimeLeft(STUDY_DURATION);
    }
  };

  // Convert seconds to format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="focus-timer-container">
      
      {/* Left Column: Timer and Ambient Sound Controller */}
      <div className="lg:col-span-2 space-y-6" id="timer-left-column">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
          id="timer-card-panel"
        >
          {/* Subtle decoration background ripple */}
          <AnimatePresence>
            {isRunning && mode === 'study' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.03, 0.08] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-indigo-500 pointer-events-none w-[350px] h-[350px] mx-auto my-auto"
              ></motion.div>
            )}
          </AnimatePresence>

          {/* Header row */}
          <div className="w-full flex justify-between items-center z-10">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              mode === 'study' 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              {mode === 'study' ? (
                <>
                  <Zap size={12} className="animate-pulse" /> Study Focus Mode
                </>
              ) : (
                <>
                  <Coffee size={12} /> Relaxing Break
                </>
              )}
            </span>

            <div className="flex gap-2">
              <button
                id="toggle-sound-btn"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                title={isSoundEnabled ? "Mute audio" : "Unmute audio"}
              >
                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* SVG Progress Ring and Clock */}
          <div className="relative my-8 flex items-center justify-center z-10" id="timer-ring-wrapper">
            <svg className="w-64 h-64 transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress ring */}
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                className={mode === 'study' ? 'stroke-indigo-600' : 'stroke-emerald-500'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
                transition={{ duration: 0.3 }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl font-extrabold font-display tracking-tight text-slate-800" id="countdown-display">
                {formatTime(timeLeft)}
              </h1>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1 tracking-widest">
                {mode === 'study' ? 'Deep Work' : 'Breath in'}
              </p>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex items-center gap-4 z-10" id="timer-control-buttons">
            <button
              id="timer-reset-btn"
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-700 transition-all cursor-pointer hover:shadow-sm active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              id="timer-play-pause-btn"
              onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-bold text-sm tracking-wide text-white transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                mode === 'study' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/10'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={16} fill="white" /> Pause Focus
                </>
              ) : (
                <>
                  <Play size={16} fill="white" /> Start Focus
                </>
              )}
            </button>

            <button
              id="timer-skip-btn"
              onClick={skipTimer}
              className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-700 transition-all cursor-pointer hover:shadow-sm active:scale-95"
              title="Skip Session"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </motion.div>

        {/* Ambient Noise Generator Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
          id="ambient-noise-panel"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Volume2 size={16} className="text-indigo-500" /> Focus Soundscapes
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-md">
              Synthesized Audio
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Procedural, client-side synthesized soundscapes to block out surrounding noise. Playable only while focus timer is actively running.
          </p>

          <div className="grid grid-cols-4 gap-2" id="ambient-noise-tabs">
            {[
              { id: 'none', label: 'Muted', desc: 'Silent focus' },
              { id: 'white', label: 'White', desc: 'Static noise' },
              { id: 'rain', label: 'Rainfall', desc: 'Rhythmic tap' },
              { id: 'waves', label: 'Ocean', desc: 'Surging tides' },
            ].map((sound) => (
              <button
                key={sound.id}
                id={`ambient-sound-${sound.id}`}
                onClick={() => {
                  initAudioContext();
                  setAmbientSound(sound.id as any);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  ambientSound === sound.id
                    ? 'border-indigo-500 bg-indigo-50/20 text-indigo-700'
                    : 'border-slate-100 bg-slate-50/30 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold leading-none">{sound.label}</span>
                <span className="text-[9px] text-slate-400 mt-1 line-clamp-1 leading-none">{sound.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Skill Selector & Session Logs info */}
      <div className="space-y-6" id="timer-right-column">
        {/* Active Skill Selector card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4"
          id="skill-association-card"
        >
          <h3 className="font-bold font-display text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-50 pb-2">
            <BookOpen size={16} className="text-indigo-500" /> Focus Association
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Select which skill roadmap you are currently focusing on. Completing a 25-minute Pomodoro session will automatically log 0.4 hours of study time to this skill.
          </p>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1" id="timer-skills-selector">
            {/* General study button */}
            <button
              id="skill-select-general-btn"
              onClick={() => setSelectedSkillId(null)}
              className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                selectedSkillId === null
                  ? 'border-indigo-500 bg-indigo-50/10 text-indigo-700'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <span>📚 General Study & Planning</span>
              <CheckCircle2 size={14} className={selectedSkillId === null ? 'text-indigo-600' : 'opacity-0'} />
            </button>

            {/* User skills lists */}
            {activeSkills.map((skill) => (
              <button
                key={skill.id}
                id={`skill-select-btn-${skill.id}`}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                  selectedSkillId === skill.id
                    ? 'border-indigo-500 bg-indigo-50/10 text-indigo-700'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="truncate flex flex-col max-w-[85%] text-left">
                  <span className="truncate">{skill.name}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">{skill.category}</span>
                </div>
                <CheckCircle2 size={14} className={selectedSkillId === skill.id ? 'text-indigo-600' : 'opacity-0'} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Daily focus goals tracker card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4"
          id="daily-focus-stats-card"
        >
          <h3 className="font-bold font-display text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-50 pb-2">
            <Timer size={16} className="text-amber-500" /> Today's Focus Summary
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Focus Logged</span>
              <span className="text-lg font-bold text-slate-800 font-display mt-0.5">{todayMinutes} mins</span>
            </div>
            <div className="p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Blocks Completed</span>
              <span className="text-lg font-bold text-slate-800 font-display mt-0.5">{todaySessions.length} Blocks</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/20 border border-indigo-100/30 rounded-xl flex items-start gap-3">
            <Award size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Completing at least 1 focus block per day keeps your learning streak healthy! Practice deep focus daily to build high cognitive discipline.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
