import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Activity, 
  Clock, 
  LineChart, 
  Zap, 
  User, 
  Send, 
  Check, 
  Copy, 
  Compass, 
  Sliders, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  Maximize2,
  Trash2,
  Eye,
  RefreshCw,
  Info,
  Play,
  Pause
} from 'lucide-react';
import { Task, UserProfile } from '../types';

interface ProactiveRescueSuiteProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: UserProfile;
  isLight: boolean;
  isRead: boolean;
  isDark: boolean;
  theme: any;
  titleColor: string;
  subtitleColor: string;
  textMutedColor: string;
  cardClass: string;
  innerCardClass: string;
  borderClass: string;
  showToast: (msg: string) => void;
}

type SuiteTab = 'panic' | 'biorhythm' | 'bodydouble' | 'analytics';

export default function ProactiveRescueSuite({
  tasks,
  setTasks,
  user,
  isLight,
  isRead,
  isDark,
  theme,
  titleColor,
  subtitleColor,
  textMutedColor,
  cardClass,
  innerCardClass,
  borderClass,
  showToast
}: ProactiveRescueSuiteProps) {
  const [activeSuiteTab, setActiveSuiteTab] = useState<SuiteTab>('panic');

  // --- PANIC BUTTON EMERGENCY AUTOPILOT STATE ---
  const [panicTask, setPanicTask] = useState<Task | null>(null);
  const [selectedTone, setSelectedTone] = useState<'manager' | 'professor' | 'client' | 'friend'>('manager');
  const [customDraftText, setCustomDraftText] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [sandboxText, setSandboxText] = useState('');
  const [draftOutput, setDraftOutput] = useState('');
  const [triagedTasks, setTriagedTasks] = useState<{ id: string; title: string; original: string; triaged: string; cut: string; passLevel: string }[]>([]);

  // --- BIO-RHYTHM STATE ---
  const [cognitiveEnergy, setCognitiveEnergy] = useState<'high' | 'fog' | 'slump' | 'hyper'>('high');

  // --- BODY DOUBLING PEER STATE ---
  const [buddyId, setBuddyId] = useState<'maya' | 'leo' | 'zoe'>('maya');
  const [timerDuration, setTimerDuration] = useState(20); // 20 mins default
  const [timeLeft, setTimeLeft] = useState(1200); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [buddyProgress, setBuddyProgress] = useState(0);
  const [buddyStatus, setBuddyStatus] = useState('Ready to focus together');
  const [whispers, setWhispers] = useState<string[]>([]);
  const [newWhisper, setNewWhisper] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ANALYTICS STATE ---
  const [analyzedProfile, setAnalyzedProfile] = useState<{
    style: string;
    description: string;
    scores: { perfectionism: number; avoidance: number; underestimation: number; panic: number };
    triggerTime: string;
    recs: string[];
  } | null>(null);

  // Helper text/colors based on active modes
  const suiteBg = isLight 
    ? 'bg-zinc-50 border-zinc-200 shadow-sm' 
    : isRead 
    ? 'bg-[#fdfbf7] border-[#ebd4ab] shadow-sm' 
    : 'bg-slate-900 border-slate-800';

  // Whisper preset arrays
  const buddyPresets = {
    maya: {
      name: 'Maya (The Pragmatic Encourager)',
      avatar: '🌸',
      role: 'Content Curator',
      intro: 'Hey! I know starting is the hardest part. Let’s do this together, tiny step by tiny step. No judgment here.',
      activeStatus: 'Working on content outlines...',
      ticks: [
        'I am structuring my introductory headers. How are your first few words coming along?',
        'Look at us go! 5 minutes in. High five for pushing past the initial block.',
        'Taking a deep sip of water. Remember, a sloppy draft is 100% better than an empty page!',
        'Just finished my draft checklist. We are almost done with our session. Stay focused, you got this!'
      ]
    },
    leo: {
      name: 'Leo (The System Architect)',
      avatar: '⚙️',
      role: 'Backend Dev',
      intro: 'System diagnostic: clear objectives loaded. I am setting a 20-minute focus loop. Let’s minimize context switching.',
      activeStatus: 'Refactoring database migrations...',
      ticks: [
        'Compiling my local assets. Keep your focus window isolated to one simple tab.',
        'Halfway mark reached. Brain momentum is a physical property. Keep the velocity up.',
        'Debugging an unexpected syntax quirk. Momentum is building. No phone checks allowed!',
        'Deployment script completed. Excellent work on keeping your focus locked.'
      ]
    },
    zoe: {
      name: 'Zoe (The Calm Designer)',
      avatar: '🎨',
      role: 'UX Illustrator',
      intro: 'Welcome to our focus bubble. Take a deep breath. Let’s create some space for our ideas without any rush.',
      activeStatus: 'Sketching interactive prototypes...',
      ticks: [
        'Blocking out raw visual weights. Focus on the flow, not the perfection.',
        'Adding subtle color fills. Your effort is more than enough. Celebrate being present.',
        'Organizing layout grids. We are doing wonderfully. Breathe in, breathe out.',
        'Adding subtle fade interactions. Session complete. Thank you for sharing this calm energy with me.'
      ]
    }
  };

  // Run initial calculations for analytics and presets
  useEffect(() => {
    // Generate actionable panic triage recommendations when selected task changes
    if (panicTask) {
      const isStudent = user.primaryRole === 'student';
      const isProfessional = user.primaryRole === 'professional';
      const isFreelancer = user.primaryRole === 'freelancer';

      let triaged = '';
      let cut = '';
      let passLevel = '';

      if (isStudent) {
        triaged = 'Write a 300-word core argument summary with 2 simple bullet-point quotes.';
        cut = 'Omit the detailed comparative literature matrix and 3 extra secondary bibliography sources.';
        passLevel = 'C+/B- level baseline (highly acceptable under time constraints, allows 100% submission rate).';
      } else if (isProfessional) {
        triaged = 'Implement a single local-state service mock endpoint showing static JSON responses.';
        cut = 'Omit real-time multi-node WebSocket synchronization and persistent Redis state adapters.';
        passLevel = 'Functional prototype (proves the logic, allows safe, modular, iterative refactoring tomorrow).';
      } else if (isFreelancer) {
        triaged = 'Create a 2-page flat wireframe grid showing core UI components and grayscale placeholders.';
        cut = 'Omit rich interactive page-fold animations, custom illustrations, and dynamic transition mockups.';
        passLevel = 'Concept sign-off layout (demonstrates architectural intent, secures initial client feedback).';
      } else {
        triaged = 'Outline a 3-slide PDF deck showing direct cost-benefit bullets and next milestone targets.';
        cut = 'Omit full financial run-rate forecasts and granular resource scheduling spreadsheets.';
        passLevel = 'Action proposal draft (secures greenlight to proceed without starting analytical freezing).';
      }

      setTriagedTasks([
        {
          id: panicTask.id,
          title: panicTask.title,
          original: 'Full scope deliverable with optimal formatting, extensive secondary reviews, and zero flaws.',
          triaged,
          cut,
          passLevel
        }
      ]);

      // Calculate auto-excuse/extension draft
      let draft = '';
      if (selectedTone === 'manager') {
        draft = `Hi Team,\n\nI am currently finalizing our work on "${panicTask.title}". To ensure we deliver with the structural integrity required, I am executing a tactical triage check. I will be submitting the foundational core deliverable today, with the remaining optimizations scheduled to sync by tomorrow afternoon.\n\nThank you for your flexibility,\n${user.name}`;
      } else if (selectedTone === 'professor') {
        draft = `Dear Professor,\n\nI am writing to update you on my progress for "${panicTask.title}". I have run into minor technical/formatting blockers but am highly committed to completing the requirements. To avoid missing the window completely, I am finishing a targeted core draft for submission today, and will follow up with the complete citation layout shortly.\n\nSincerely,\n${user.name}`;
      } else if (selectedTone === 'client') {
        draft = `Hi there,\n\nRegarding the deliverables for "${panicTask.title}", we are prioritizing high-impact modules to maintain project velocity. You will receive the grayscale interactive flow sheets today for review, with visual high-fidelity assets synchronized shortly after. This ensures we coordinate layout alignment early.\n\nBest regards,\n${user.name}`;
      } else {
        draft = `Hey!\n\nJust wanted to let you know I’m pushing through the final steps on "${panicTask.title}". Running a bit short on time, so I’m cutting down some of the minor formatting extras and focusing 100% on getting the main parts completed today. Let you know once it’s sent!\n\nBest,\n${user.name}`;
      }
      setDraftOutput(draft);
      setCustomDraftText(draft);
    }
  }, [panicTask, selectedTone, user]);

  // Run procrastination profile analysis based on current task risk indices
  useEffect(() => {
    if (tasks.length === 0) {
      setAnalyzedProfile({
        style: 'Clean Slate Achiever',
        description: 'You have no current active deadlines. Your starting resistance is completely clear!',
        scores: { perfectionism: 20, avoidance: 15, underestimation: 10, panic: 10 },
        triggerTime: 'N/A',
        recs: ['Add your upcoming milestones to analyze starting friction tendencies.']
      });
      return;
    }

    // Determine average stats
    let totalRisk = 0;
    tasks.forEach(t => totalRisk += t.currentRiskScore || 0);
    const avgRisk = totalRisk / tasks.length;

    const isStudent = user.primaryRole === 'student';
    const isProfessional = user.primaryRole === 'professional';

    let style = 'Avoider Procrastinator';
    let description = 'Delays initiating due to perceived psychological load, fear of imperfection, or over-planning.';
    let perfectionism = 65;
    let avoidance = 80;
    let underestimation = 45;
    let panic = avgRisk;
    let triggerTime = 'Late Night hours (when cognitive fatigue spikes)';
    let recs = [
      'Initiate tasks with a strict 5-minute timer, allowing a "terrible, draft-level first attempt".',
      'Move deadlines forward on your calendar by 24 hours to separate review stress from starting fear.'
    ];

    if (isStudent && avgRisk > 50) {
      style = 'Perfectionist Procrastinator';
      description = 'Struggles with starting because of high internalized performance standards and fear of citation errors.';
      perfectionism = 90;
      avoidance = 60;
      underestimation = 30;
      triggerTime = 'Sunday evening/Midnight slots';
      recs = [
        'Acknowledge that a completed draft is 100% better than a missing perfect paper.',
        'Use DueMate copy-paste prompts to write rough section arguments hands-free first.'
      ];
    } else if (isProfessional && avgRisk > 40) {
      style = 'Active Crisis Maker';
      description = 'Thrives under extreme adrenaline, delaying tasks to the final hours. Suffers from high quality-compromise rates.';
      perfectionism = 50;
      avoidance = 40;
      underestimation = 85;
      triggerTime = 'Within 6 hours of final deployment';
      recs = [
        'Enforce structural "Skeleton Checkins" 12 hours prior to final build.',
        'Leverage mock endpoints early to prevent dependency freezing.'
      ];
    }

    setAnalyzedProfile({
      style,
      description,
      scores: { perfectionism, avoidance, underestimation, panic: Math.round(panic) },
      triggerTime,
      recs
    });
  }, [tasks, user]);

  // --- TIMER & WHISPER EFFECTS FOR BODY DOUBLING ---
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          
          // Calculate buddy progress matching the percentage
          const totalSecs = timerDuration * 60;
          const percent = ((totalSecs - next) / totalSecs) * 100;
          setBuddyProgress(Math.round(percent));

          // Trigger live buddy message adjustments at checkpoints
          const activeBuddy = buddyPresets[buddyId];
          if (Math.round(percent) === 25) {
            setBuddyStatus(activeBuddy.ticks[0]);
            showToast(`${activeBuddy.name}: "${activeBuddy.ticks[0]}"`);
          } else if (Math.round(percent) === 50) {
            setBuddyStatus(activeBuddy.ticks[1]);
            showToast(`${activeBuddy.name}: "${activeBuddy.ticks[1]}"`);
          } else if (Math.round(percent) === 75) {
            setBuddyStatus(activeBuddy.ticks[2]);
            showToast(`${activeBuddy.name}: "${activeBuddy.ticks[2]}"`);
          }

          if (next <= 0) {
            setIsTimerRunning(false);
            setBuddyStatus(activeBuddy.ticks[3]);
            showToast(`Focus session completed! Amazing work focusing alongside ${activeBuddy.name}.`);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, buddyId, timerDuration]);

  const handleStartTimer = () => {
    setTimeLeft(timerDuration * 60);
    setBuddyProgress(0);
    setBuddyStatus(buddyPresets[buddyId].intro);
    setIsTimerRunning(true);
    showToast(`Focus session started with ${buddyPresets[buddyId].name}! Lock your layout.`);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    setBuddyStatus('Focus session paused. Let’s not lose our brain momentum!');
  };

  const handleAddWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhisper.trim()) return;
    setWhispers(prev => [...prev, `You: ${newWhisper}`]);
    const input = newWhisper;
    setNewWhisper('');

    // Buddy replies with a high-empathy, supportive note immediately
    setTimeout(() => {
      const activeBuddy = buddyPresets[buddyId];
      const replies = [
        `That sounds incredibly tough, but you are here showing up! That takes huge guts. Let’s keep focusing.`,
        `I hear you! Procrastination is just our emotions trying to protect us. Let’s write just one line together now.`,
        `Amazing perspective. You have completely got this. I am locking down my work with you.`,
        `One small micro-step at a time. No overwhelm can survive a 5-minute sprint.`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setWhispers(prev => [...prev, `${activeBuddy.name}: ${randomReply}`]);
      setBuddyStatus(randomReply);
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- BIO-RHYTHM FILTER LOGIC ---
  const getBioRhythmRecommendedTasks = () => {
    const pending = tasks.filter(t => t.status !== 'completed');
    if (cognitiveEnergy === 'high') {
      // Recommends high panicLevel or tasks with large original estimate hours
      return pending.sort((a, b) => b.originalEstimateHours - a.originalEstimateHours);
    } else if (cognitiveEnergy === 'hyper') {
      // Recommends highest risk tasks
      return pending.sort((a, b) => (b.currentRiskScore || 0) - (a.currentRiskScore || 0));
    } else if (cognitiveEnergy === 'slump') {
      // Recommends shorter tasks (originalEstimateHours <= 3)
      return pending.filter(t => t.originalEstimateHours <= 4).sort((a, b) => a.originalEstimateHours - b.originalEstimateHours);
    } else {
      // Brain fog! Recommend task with the lowest complexity/hours or gentle coaching suggestions
      return pending.filter(t => t.originalEstimateHours <= 2).sort((a, b) => a.originalEstimateHours - b.originalEstimateHours);
    }
  };

  const currentRecommended = getBioRhythmRecommendedTasks();

  return (
    <section id="tour-proactive-suite" className={`rounded-3xl p-6 md:p-8 space-y-6 ${suiteBg} transition-all duration-300`}>
      {/* Module Title and Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-500/10">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${titleColor} flex items-center gap-2`}>
            <Zap className="w-5.5 h-5.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>DueMate Proactive Rescue Suites</span>
          </h2>
          <p className={`text-xs ${subtitleColor}`}>
            Exclusive offline-first tools designed to outsmart cognitive freezing, task paralysis, and fatigue.
          </p>
        </div>

        {/* Suite navigation pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/20 p-1 rounded-xl border border-slate-500/5 max-w-full">
          {[
            { id: 'panic', label: '🚨 Panic Autopilot', color: 'text-red-500' },
            { id: 'biorhythm', label: '⚡ Bio-Scheduler', color: 'text-amber-500' },
            { id: 'bodydouble', label: '👥 Body Double', color: 'text-emerald-500' },
            { id: 'analytics', label: '📊 Risk Analytics', color: 'text-indigo-400' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSuiteTab(tab.id as SuiteTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSuiteTab === tab.id
                  ? isLight
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : isRead
                    ? 'bg-[#f5ebd2] text-[#2e2514]'
                    : 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB 1: PANIC EMERGENCY AUTOPILOT ==================== */}
      {activeSuiteTab === 'panic' && (
        <div className="space-y-6 animate-timeline-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Task Selector & Triager */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-4.5 rounded-2xl border ${isLight ? 'bg-red-50/50 border-red-200' : isRead ? 'bg-[#ebd4ab]/15 border-[#ebd4ab]' : 'bg-red-950/15 border-red-950/40'} space-y-2`}>
                <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Activate Panic Triager</span>
                </h3>
                <p className={`text-xs ${subtitleColor}`}>
                  Select any pending task to trigger immediate scope compression. Cuts 45% of clutter so you pass on time.
                </p>

                <select
                  onChange={(e) => {
                    const found = tasks.find(t => t.id === e.target.value);
                    setPanicTask(found || null);
                  }}
                  value={panicTask?.id || ''}
                  className={`w-full mt-2 rounded-xl px-3 py-2.5 text-xs focus:outline-none border ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-950'
                      : isRead
                      ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#2e2514]'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="">-- Choose High-Stress Task --</option>
                  {tasks.filter(t => t.status !== 'completed').map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.panicLevel})</option>
                  ))}
                </select>
              </div>

              {panicTask ? (
                <div className={`p-5 rounded-2xl border ${innerCardClass} space-y-4`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Original Idealist Scope</span>
                    <p className={`text-xs leading-relaxed italic ${subtitleColor}`}>
                      "{triagedTasks[0]?.original}"
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-500/10">
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase">🔥 Triaged 5-Min Starter Scope</span>
                    <p className={`text-xs font-bold leading-relaxed ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>
                      {triagedTasks[0]?.triaged}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-500/10">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">❌ Scope to Cut (Omit Safely)</span>
                    <p className={`text-xs leading-relaxed text-red-400 line-through`}>
                      {triagedTasks[0]?.cut}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-500/10">
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">🎉 Target Minimum Passing Quality</span>
                    <p className={`text-xs leading-relaxed text-emerald-500 font-medium`}>
                      {triagedTasks[0]?.passLevel}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`p-10 text-center rounded-2xl border border-dashed border-slate-500/20 ${innerCardClass}`}>
                  <span className={`text-xs italic ${textMutedColor}`}>No active panic task selected. Use the dropdown to activate emergency triaging.</span>
                </div>
              )}
            </div>

            {/* Email Excuse Draft & Sandbox Editor */}
            <div className="lg:col-span-7 space-y-4">
              {panicTask ? (
                <div className={`rounded-2xl p-5 border ${innerCardClass} space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-500/10">
                    <div>
                      <h4 className={`text-xs font-mono font-bold uppercase ${titleColor}`}>Excuse / Extension Email Pilot</h4>
                      <p className={`text-[10px] ${textMutedColor}`}>Polite pre-written buffer requester templates.</p>
                    </div>

                    {/* Tone selectors */}
                    <div className="flex gap-1">
                      {(['manager', 'professor', 'client', 'friend'] as const).map(tone => (
                        <button
                          key={tone}
                          onClick={() => setSelectedTone(tone)}
                          className={`text-[9px] font-bold px-2 py-1 rounded capitalize cursor-pointer transition-colors ${
                            selectedTone === tone
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-500/10 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Excuse Textbox */}
                  <div className="relative">
                    <textarea
                      value={customDraftText}
                      onChange={(e) => setCustomDraftText(e.target.value)}
                      className={`w-full rounded-xl p-3.5 text-xs focus:outline-none h-32 font-sans leading-relaxed border ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-900'
                          : isRead
                          ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#2e2514]'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(customDraftText);
                        setCopiedDraft(true);
                        showToast("Copied excuse draft to clipboard!");
                        setTimeout(() => setCopiedDraft(false), 2000);
                      }}
                      className="absolute bottom-3 right-3 p-2 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                      title="Copy template text"
                    >
                      {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Sandboxed Fast Deliverable Writer */}
                  <div className="space-y-2 pt-2 border-t border-slate-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Emergency Minimum-Viable-Output Sandbox</span>
                      <span className={`text-[9px] font-mono ${textMutedColor}`}>{sandboxText.length} characters</span>
                    </div>
                    <textarea
                      placeholder="Face the blank page here! Start typing your sloppy first sentences. No headers, no rules. Just dump your basic text..."
                      value={sandboxText}
                      onChange={(e) => setSandboxText(e.target.value)}
                      className={`w-full rounded-xl p-3.5 text-xs focus:outline-none h-36 font-mono leading-relaxed border ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-900 focus:border-indigo-500'
                          : isRead
                          ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                      }`}
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-[10px] italic ${textMutedColor}`}>Dump anything. Once you have 3 sentences, hit copy and submit.</p>
                      <button
                        onClick={() => {
                          if (!sandboxText.trim()) {
                            showToast("Sandbox is empty. Type some sloppy draft sentences first!");
                            return;
                          }
                          navigator.clipboard.writeText(sandboxText);
                          showToast("Sloppy sandbox draft copied! Submit this to clear task freezing.");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Copy Draft & Escape</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-16 text-center rounded-2xl border border-dashed border-slate-500/20 ${innerCardClass}`}>
                  <span className={`text-xs italic ${textMutedColor}`}>Excuses drafts and sandboxed low-resistance writing blocks will activate upon choosing a stress task.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 2: BIO-RHYTHM & FATIGUE-AWARE SCHEDULER ==================== */}
      {activeSuiteTab === 'biorhythm' && (
        <div className="space-y-6 animate-timeline-reveal">
          {/* State Selectors */}
          <div className={`p-5 rounded-2xl border ${innerCardClass} space-y-4`}>
            <div>
              <h3 className={`text-sm font-bold ${titleColor}`}>What is your current subjective brain comfort?</h3>
              <p className={`text-xs ${subtitleColor}`}>DueMate shifts pending tasks to align exactly with your real-time fatigue or hyperfocus levels.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'high', label: '🔥 High Alert Focus', desc: 'Ready for deep, heavy thinking', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
                { id: 'hyper', label: '⚡ Creative Hyperfocus', desc: 'Intense energy, fast velocity', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
                { id: 'slump', label: '🥱 Post-Lunch Slump', desc: 'Mild sleepiness, physical tasks only', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' },
                { id: 'fog', label: '🌫️ Mental Brain Fog', desc: 'Anxiety-frozen, need tiny tasks', color: 'border-red-500/30 text-red-400 bg-red-500/5' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setCognitiveEnergy(opt.id as any);
                    showToast(`Bio-rhythm adjusted. Recommended tasks filtered to match: ${opt.label}`);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    cognitiveEnergy === opt.id
                      ? opt.color + ' ring-2 ring-amber-500/35 border-transparent scale-102 shadow-lg'
                      : isLight
                      ? 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                      : isRead
                      ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#6d5c41] hover:bg-[#ebd4ab]/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight block">{opt.label}</span>
                  <span className={`text-[10px] mt-1 ${textMutedColor}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Task Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Recommended tasks for {cognitiveEnergy.toUpperCase()} state</span>
              
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {currentRecommended.map((task) => (
                  <div key={task.id} className={`p-4 rounded-xl border ${innerCardClass} space-y-2`}>
                    <div className="flex justify-between items-start">
                      <h4 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{task.title}</h4>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-red-500/10 text-red-500 border border-red-500/15">
                        {task.panicLevel}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-1 ${subtitleColor}`}>{task.description}</p>
                    <div className={`flex items-center justify-between pt-2 border-t ${borderClass} text-[10px] ${textMutedColor}`}>
                      <span>Estimate: {task.originalEstimateHours} hrs</span>
                      <span className="font-mono text-emerald-500">Friction: low</span>
                    </div>
                  </div>
                ))}

                {currentRecommended.length === 0 && (
                  <div className={`text-center py-10 border border-dashed border-slate-500/20 rounded-xl ${innerCardClass}`}>
                    <p className={`text-xs italic ${subtitleColor}`}>No matching pending tasks. Great job keeping your workspace clean!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Bio-coaching Insights based on current selection */}
            <div className={`p-5 rounded-2xl border ${innerCardClass} space-y-4`}>
              <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1">
                <Compass className="w-4 h-4 animate-slow-orbit" />
                <span>Cognitive Alignment Insight</span>
              </h4>

              {cognitiveEnergy === 'high' && (
                <div className="space-y-2.5 text-xs leading-relaxed">
                  <p className={subtitleColor}>
                    <strong>Strategic advice:</strong> Your cognitive fuel is currently peaking. Avoid working on email sorting, scheduling, or minor formatting right now. 
                  </p>
                  <p className={subtitleColor}>
                    Redirect this high executive function towards your heaviest conceptual hurdles. Tackle architectural layout draftings, mathematical modeling, or dense academic core structures first.
                  </p>
                </div>
              )}

              {cognitiveEnergy === 'hyper' && (
                <div className="space-y-2.5 text-xs leading-relaxed">
                  <p className={subtitleColor}>
                    <strong>Strategic advice:</strong> Creative Hyperfocus is a high-adrenaline status. Your brain velocity is excellent, but your resistance to structural planning is high.
                  </p>
                  <p className={subtitleColor}>
                    Focus on drafting visual elements, rapid UI layouts, copy-editing, or experimental drafts without worrying about secondary rules. Capture raw momentum; clean up structure later.
                  </p>
                </div>
              )}

              {cognitiveEnergy === 'slump' && (
                <div className="space-y-2.5 text-xs leading-relaxed">
                  <p className={subtitleColor}>
                    <strong>Strategic advice:</strong> Subjective glucose or biological circadian cycle fatigue is visible. Do not force dense logical calculations right now — you will trigger frustration blocks.
                  </p>
                  <p className={subtitleColor}>
                    Tackle low cognitive friction items: check formatting, collect references/citations, prepare file folders, mock out JSON data responses, or tick off simple progress checklists.
                  </p>
                </div>
              )}

              {cognitiveEnergy === 'fog' && (
                <div className="space-y-2.5 text-xs leading-relaxed text-red-400">
                  <p className={subtitleColor}>
                    <strong>Strategic advice:</strong> Brain fog or task freeze is actively freezing your initiating momentum. Any multi-hour goal is currently perceived as an immediate threat.
                  </p>
                  <p className={subtitleColor}>
                    <strong>Emergency Escape Plan:</strong> Choose a task and click the "Panic Autopilot" tab. Commit to a strict 5-minute sloppy draft, allowing your grammar or styling to be 100% messy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: "BODY DOUBLING" & INTERACTIVE FOCUS COACH ==================== */}
      {activeSuiteTab === 'bodydouble' && (
        <div className="space-y-6 animate-timeline-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Peer Selector and Timer */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-4.5 rounded-2xl border ${innerCardClass} space-y-3`}>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">Choose Your AI Focus Peer</span>
                
                <div className="space-y-2">
                  {[
                    { id: 'maya', name: 'Maya', avatar: '🌸', role: 'Curator', desc: 'Gentle, warm, high-empathy pacing' },
                    { id: 'leo', name: 'Leo', avatar: '⚙️', role: 'Developer', desc: 'Highly structural, technical, focused' },
                    { id: 'zoe', name: 'Zoe', avatar: '🎨', role: 'UX Designer', desc: 'Calm space, quiet focus prompts' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (isTimerRunning) {
                          showToast("Focus timer is running! Stop or pause to change peers.");
                          return;
                        }
                        setBuddyId(p.id as any);
                        setBuddyStatus(buddyPresets[p.id as 'maya' | 'leo' | 'zoe'].intro);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                        buddyId === p.id
                          ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5 shadow-md scale-102'
                          : isLight
                          ? 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                          : isRead
                          ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#6d5c41] hover:bg-[#ebd4ab]/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl shrink-0">{p.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold leading-tight text-white">{p.name}</span>
                          <span className="text-[8px] font-mono bg-slate-500/10 px-1.5 py-0.5 rounded uppercase text-slate-400">{p.role}</span>
                        </div>
                        <p className={`text-[10px] truncate ${textMutedColor}`}>{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Pacer Gauge */}
              <div className={`p-5 rounded-2xl border text-center ${innerCardClass} space-y-4`}>
                <div className="space-y-1">
                  <span className="text-4xl font-mono font-black tracking-widest text-emerald-500 animate-pulse">
                    {formatTime(timeLeft)}
                  </span>
                  <p className={`text-[10px] font-mono uppercase ${textMutedColor}`}>Focus loop remaining</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${buddyProgress}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  {isTimerRunning ? (
                    <button
                      onClick={handlePauseTimer}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause Focus</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartTimer}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Start Co-Working</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeft(timerDuration * 60);
                      setBuddyProgress(0);
                      setBuddyStatus('Focus timer reset. Ready to initiate next sprint.');
                      showToast("Focus loop reset.");
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs border cursor-pointer ${
                      isLight
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                        : isRead
                        ? 'bg-[#f5ebd2] border-[#ebd4ab] text-[#5c3e1e] hover:bg-[#e6d5b8]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <span className={`text-[10px] ${subtitleColor}`}>Set Duration:</span>
                  {[10, 20, 30].map(mins => (
                    <button
                      key={mins}
                      onClick={() => {
                        if (isTimerRunning) return;
                        setTimerDuration(mins);
                        setTimeLeft(mins * 60);
                      }}
                      disabled={isTimerRunning}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                        timerDuration === mins
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 disabled:opacity-50'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat & Peer Co-working Feed */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`p-4.5 rounded-2xl border ${innerCardClass} space-y-4 h-[380px] flex flex-col justify-between`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Live Focus Companion Feed</span>
                    <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>Synchronized Session Active</span>
                    </span>
                  </div>

                  {/* Active Bubble status */}
                  <div className={`p-3 rounded-xl border border-dashed flex items-start gap-2.5 ${isLight ? 'bg-zinc-200/40 text-zinc-600 border-zinc-300' : isRead ? 'bg-[#f5ebd2] text-[#6d5c41] border-[#ebd4ab]' : 'bg-slate-950 border-slate-850 text-slate-300'}`}>
                    <span className="text-xl shrink-0">{buddyPresets[buddyId].avatar}</span>
                    <div className="text-[11px] leading-relaxed">
                      <div className="font-bold">{buddyPresets[buddyId].name}</div>
                      <div className="italic mt-0.5">"{buddyStatus}"</div>
                    </div>
                  </div>

                  {/* Message feed log */}
                  <div className="space-y-1.5 h-[140px] overflow-y-auto pr-1">
                    {whispers.map((w, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[10px] leading-relaxed p-2 rounded-lg ${
                          w.startsWith('You:') 
                            ? 'bg-slate-500/5 text-slate-400 self-end ml-10' 
                            : 'bg-emerald-500/5 border border-emerald-500/5 text-emerald-400/90 mr-10'
                        }`}
                      >
                        {w}
                      </div>
                    ))}

                    {whispers.length === 0 && (
                      <div className="text-center py-8">
                        <p className={`text-[10px] italic ${textMutedColor}`}>No focus notes recorded yet. Send a whisper below to notify your focus partner!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form input */}
                <form onSubmit={handleAddWhisper} className="flex gap-2">
                  <input
                    type="text"
                    value={newWhisper}
                    onChange={(e) => setNewWhisper(e.target.value)}
                    placeholder={`Tell ${buddyPresets[buddyId].name} how your start is going...`}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                      isLight
                        ? 'bg-white border-zinc-200 text-zinc-900 focus:border-indigo-500'
                        : isRead
                        ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 4: PROCRASTINATION STYLE ANALYTICS ==================== */}
      {activeSuiteTab === 'analytics' && analyzedProfile && (
        <div className="space-y-6 animate-timeline-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Radar spider visualization using SVG */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-4.5 rounded-2xl border ${innerCardClass} space-y-3 text-center`}>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">Active Procrastination Threat Index</span>
                
                {/* Custom Vector Radial Chart representing risk scores */}
                <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full rotate-45" viewBox="0 0 120 120">
                    {/* Background rings */}
                    <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                    <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
                    <circle cx="60" cy="60" r="15" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                    
                    {/* Radial grid lines */}
                    <line x1="60" y1="15" x2="60" y2="105" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.5" />
                    <line x1="15" y1="60" x2="105" y2="60" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.5" />

                    {/* Threat Polygon */}
                    {(() => {
                      const perf = analyzedProfile.scores.perfectionism / 100 * 45;
                      const avoi = analyzedProfile.scores.avoidance / 100 * 45;
                      const unde = analyzedProfile.scores.underestimation / 100 * 45;
                      const panic = analyzedProfile.scores.panic / 100 * 45;

                      // Coordinates relative to center (60,60)
                      // Top (Perfectionism): (60, 60 - perf)
                      // Right (Avoidance): (60 + avoi, 60)
                      // Bottom (Underestimation): (60, 60 + unde)
                      // Left (Panic Index): (60 - panic, 60)
                      return (
                        <polygon
                          points={`60,${60 - perf} ${60 + avoi},60 60,${60 + unde} ${60 - panic},60`}
                          fill="rgba(245, 158, 11, 0.25)"
                          stroke="rgba(245, 158, 11, 0.85)"
                          strokeWidth="1.5"
                          className="animate-pulse"
                        />
                      );
                    })()}
                  </svg>

                  {/* Labels on corners */}
                  <span className="absolute top-2 text-[8px] font-mono font-bold uppercase text-slate-400">PERFECTION</span>
                  <span className="absolute right-0 text-[8px] font-mono font-bold uppercase text-slate-400">AVOIDANCE</span>
                  <span className="absolute bottom-2 text-[8px] font-mono font-bold uppercase text-slate-400">ESTIMATE</span>
                  <span className="absolute left-0 text-[8px] font-mono font-bold uppercase text-slate-400">PANIC</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-500/10">
                  <div className="p-2 bg-slate-950/20 rounded-lg text-center">
                    <span className="text-[14px] font-mono font-bold text-amber-500">{analyzedProfile.scores.perfectionism}%</span>
                    <span className={`block text-[8px] ${textMutedColor} uppercase font-mono`}>Perfectionism</span>
                  </div>
                  <div className="p-2 bg-slate-950/20 rounded-lg text-center">
                    <span className="text-[14px] font-mono font-bold text-red-500">{analyzedProfile.scores.avoidance}%</span>
                    <span className={`block text-[8px] ${textMutedColor} uppercase font-mono`}>Avoidance</span>
                  </div>
                  <div className="p-2 bg-slate-950/20 rounded-lg text-center">
                    <span className="text-[14px] font-mono font-bold text-indigo-400">{analyzedProfile.scores.underestimation}%</span>
                    <span className={`block text-[8px] ${textMutedColor} uppercase font-mono`}>Estimation Slip</span>
                  </div>
                  <div className="p-2 bg-slate-950/20 rounded-lg text-center">
                    <span className="text-[14px] font-mono font-bold text-emerald-400">{analyzedProfile.scores.panic}%</span>
                    <span className={`block text-[8px] ${textMutedColor} uppercase font-mono`}>Panic score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis and coaching metrics */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`p-5 rounded-2xl border ${innerCardClass} space-y-4`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Procrastination Style Diagnostic</span>
                    <h3 className={`text-base font-bold mt-0.5 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{analyzedProfile.style}</h3>
                  </div>
                  <span className="text-xl">🧠</span>
                </div>

                <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                  {analyzedProfile.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-500/5 space-y-1">
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">Trigger Danger Zone</span>
                  <p className={`text-xs ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{analyzedProfile.triggerTime}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-500/10">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">Monthly Action Recommendation</span>
                  <ul className="space-y-2">
                    {analyzedProfile.recs.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-xs">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        <span className={subtitleColor}>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
