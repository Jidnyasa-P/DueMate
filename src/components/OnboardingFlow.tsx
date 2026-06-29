import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Sliders, Eye, Zap, Shield, HelpCircle } from 'lucide-react';
import { UserProfile, PrimaryRole, AppearanceMode } from '../types';

interface OnboardingFlowProps {
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export default function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [deadlinesFace, setDeadlinesFace] = useState<string>('');
  const [makesMiss, setMakesMiss] = useState<string>('');
  const [bestWorkTime, setBestWorkTime] = useState<string>('');
  const [remindStyle, setRemindStyle] = useState<string>('');
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>('auto');

  const deadlineOptions = [
    { value: 'Academic submissions & research papers', label: 'Academic Submissions', desc: 'Syllabus dates, homeworks, exams, term drafts.' },
    { value: 'Client deliverables & launch baselines', label: 'Client Deliverables', desc: 'Milestones, high-pressure freelance handoffs.' },
    { value: 'Investor decks & team standup briefs', label: 'Investor Decks & Reports', desc: 'Hiring metrics, Series-A sheets, board updates.' },
    { value: 'Interview live testings & resume edits', label: 'Job Applications & Practice', desc: 'Technical screenings, follow-up emails.' },
    { value: 'General utility bills & home commitments', label: 'Personal Schedules', desc: 'Bills, household deadlines, life tracking.' }
  ];

  const makesMissOptions = [
    { value: 'Severe overwhelm & anxiety paralysis', label: 'Overwhelm Paralysis', desc: 'Starting feels so huge that you put it off entirely.' },
    { value: 'Getting lost in secondary details too early', label: 'Detail Rabbit Hole', desc: 'Spent 3 hours on fonts instead of core arguments.' },
    { value: 'Losing track of deep milestone timelines', label: 'Time Blindness', desc: 'Losing awareness of intermediate checkpoints.' },
    { value: 'Lack of single micro-action initiation points', label: 'Friction Friction', desc: 'Unsure of the immediate physical first step.' }
  ];

  const bestWorkTimeOptions = [
    { value: 'Early Morning (5 AM - 9 AM)', label: 'Early Morning', desc: 'Quiet focus before the world wakes.' },
    { value: 'Core Midday (10 AM - 3 PM)', label: 'Core Midday', desc: 'High-energy execution during regular hours.' },
    { value: 'Late Night (9 PM - 2 AM)', label: 'Late Night', desc: 'Peaceful deep work without any Slack pings.' },
    { value: 'Highly fragmented sprints throughout the day', label: 'Fragmented Sprints', desc: 'Short, high-intensity bursts when possible.' }
  ];

  const remindStyleOptions = [
    { value: 'Micro-Action Gentle nudges (Low friction)', label: 'Micro-Action Gentle', desc: 'Suggesting the safest micro-move rather than deadlines.' },
    { value: 'Strict Countdown pacing (Realistic urgency)', label: 'Strict Pacing Countdown', desc: 'Showing remaining buffer minutes clearly.' },
    { value: 'Silent Ambient light changes (Quiet space)', label: 'Quiet Light Shifts', desc: 'Subtle theme shift to panic mode state when close.' },
    { value: 'Direct, clear tactical instruction summaries', label: 'Direct Tactical Instruction', desc: 'Pure plain instructions with no extra widgets.' }
  ];

  const appearanceOptions = [
    { value: 'auto', label: 'Auto adaptive by Active Role', desc: 'Let your active persona configure the colors dynamically.', accent: 'from-sky-400 to-emerald-400' },
    { value: 'light', label: 'Pristine Light Theme', desc: 'Generous soft off-whites and dark text for maximum clarity.', accent: 'from-zinc-100 to-zinc-200 border-zinc-300' },
    { value: 'dark', label: 'Ambient Dark Space', desc: 'Eye-friendly deep grays with rich colored highlights.', accent: 'from-slate-900 to-zinc-900' },
    { value: 'read', label: 'Warm Scholar Sepia (Book theme)', desc: 'Beautiful creamy palette that simulates real premium paper.', accent: 'from-amber-100 to-amber-200' },
    { value: 'focus', label: 'Distraction-Free Terminal Focus', desc: 'Clean, raw monospace with neon emerald highlight nodes.', accent: 'from-neutral-900 to-stone-900 border-neutral-800 text-emerald-400' },
    { value: 'panic', label: 'Panic State (High risk awareness)', desc: 'High-contrast red state to command urgent adrenaline.', accent: 'from-red-950 to-black border-red-800' }
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      const updatedProfile: UserProfile = {
        ...user,
        biggestDeadlineProblem: makesMiss || 'anxiety paralysis',
        preferredWorkTime: bestWorkTime || 'Late Night',
        reminderStyle: remindStyle || 'Micro-Action Gentle',
        preferredAppearanceMode: appearanceMode || 'auto',
        completedTour: false
      };
      onComplete(updatedProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    if (step === 1) return !!deadlinesFace;
    if (step === 2) return !!makesMiss;
    if (step === 3) return !!bestWorkTime;
    if (step === 4) return !!remindStyle;
    return true; // Appearance mode step is always valid with 'auto' default
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4">
      {/* Premium Top Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Step {step} of 5</span>
            <h3 className="text-sm font-bold text-white tracking-tight">Onboarding Compass</h3>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-8 bg-amber-500' 
                  : s < step 
                  ? 'w-4 bg-emerald-500' 
                  : 'w-2 bg-slate-800'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Main Stepped Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative background light */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        
        {/* Step 1: Face deadlines */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              What kind of deadlines do you usually face?
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We customize your primary language and daily schedule categories to perfectly match your environment.
            </p>
            <div className="space-y-3">
              {deadlineOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDeadlinesFace(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    deadlinesFace === opt.value
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    deadlinesFace === opt.value ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                  }`}>
                    {deadlinesFace === opt.value && <Check className="w-3 h-3 text-slate-950 font-bold" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{opt.label}</h4>
                    <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What makes you miss deadlines */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              What usually gets in your way?
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Anxiety and resistance are natural. Select your biggest obstacle so our AI engine can formulate the correct low-friction micro-actions.
            </p>
            <div className="space-y-3">
              {makesMissOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMakesMiss(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    makesMiss === opt.value
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    makesMiss === opt.value ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                  }`}>
                    {makesMiss === opt.value && <Check className="w-3 h-3 text-slate-950 font-bold" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{opt.label}</h4>
                    <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Best work time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              When do you achieve your deepest focus?
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We buffer heavy work intervals during your peak brain hours, and schedule light admin tasks during low-energy slots.
            </p>
            <div className="space-y-3">
              {bestWorkTimeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBestWorkTime(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    bestWorkTime === opt.value
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    bestWorkTime === opt.value ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                  }`}>
                    {bestWorkTime === opt.value && <Check className="w-3 h-3 text-slate-950 font-bold" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{opt.label}</h4>
                    <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: How should DueMate remind you */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              How should DueMate remind you?
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              No annoying notification slop. Choose the cognitive style that reduces your nervous system tension.
            </p>
            <div className="space-y-3">
              {remindStyleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRemindStyle(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    remindStyle === opt.value
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    remindStyle === opt.value ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                  }`}>
                    {remindStyle === opt.value && <Check className="w-3 h-3 text-slate-950 font-bold" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{opt.label}</h4>
                    <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Choose your workspace style */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Choose your default workspace style
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Every mode changes the visual spacing, typography pairings, and background palette to control psychological distraction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appearanceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAppearanceMode(opt.value as AppearanceMode)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    appearanceMode === opt.value
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-sm font-bold tracking-tight">{opt.label}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      appearanceMode === opt.value ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                    }`}>
                      {appearanceMode === opt.value && <Check className="w-2.5 h-2.5 text-slate-950 font-bold" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {opt.desc}
                  </p>

                  {/* Gradient preview block */}
                  <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${opt.accent}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800/60">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold transition-all ${
              step === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-600' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              isStepValid()
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{step === 5 ? 'Launch My Workspace' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
