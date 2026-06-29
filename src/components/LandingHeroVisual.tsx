import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Clock, Zap, ArrowRight, Smartphone, BookOpen, Coffee, HelpCircle, AlertTriangle } from 'lucide-react';

export default function LandingHeroVisual() {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes timer
  const [timerActive, setTimerActive] = useState(true);

  // Focus Timer Tick
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return 600; // Reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full max-w-[620px] aspect-[4/3] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 bg-[#060814] select-none p-5 group">
      {/* Background radial atmosphere glow stream */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-red-500/10 to-transparent blur-3xl rounded-full opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl rounded-full opacity-60" />
      
      {/* Subtle organic light lines in the background */}
      <svg className="absolute inset-0 w-full h-full stroke-slate-800/20 stroke-[1.5]" fill="none">
        <circle cx="450" cy="220" r="180" strokeDasharray="5 5" />
        <circle cx="450" cy="220" r="130" />
        <circle cx="450" cy="220" r="80" strokeDasharray="3 3" />
        <path d="M 100 350 Q 200 280 450 220" stroke="rgba(6,182,212,0.08)" />
        <path d="M 250 100 Q 350 180 450 220" stroke="rgba(245,158,11,0.08)" />
      </svg>

      {/* --- LAYER 1: LARGE GLOWING ANALOG TIMELINE CLOCK & HOURGLASS --- */}
      <div className="absolute top-12 right-6 w-56 h-56 flex items-center justify-center z-10">
        {/* Glow halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 to-cyan-500/15 blur-2xl rounded-full animate-pulse" />
        
        {/* Clock Frame */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-800/80 bg-slate-950/40 backdrop-blur-sm shadow-inner flex items-center justify-center">
          {/* Ticks */}
          <div className="absolute inset-2 rounded-full border border-dashed border-slate-700/30" />
          
          {/* Glowing hands */}
          <div className="absolute w-[2px] h-[35%] bg-amber-500 origin-bottom bottom-1/2 rotate-45 rounded-full shadow-[0_0_10px_#f59e0b] animate-slow-orbit" style={{ animationDuration: '30s' }} />
          <div className="absolute w-[2px] h-[45%] bg-cyan-400 origin-bottom bottom-1/2 -rotate-12 rounded-full shadow-[0_0_8px_#22d3ee] animate-slow-orbit" style={{ animationDuration: '120s' }} />

          {/* Central neon checkmark representing deadlines conquered! */}
          <div className="absolute bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] fill-cyan-950/20 animate-bounce" />
          </div>
        </div>

        {/* Real Glass Hourglass overlaying the clock */}
        <div className="absolute -bottom-4 right-16 w-16 h-28 bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-700/50 backdrop-blur-md rounded-2xl flex flex-col justify-between items-center p-2.5 shadow-2xl transform hover:rotate-180 transition-transform duration-1000 cursor-pointer" title="Flip hourglass to restart sprint">
          <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
          
          {/* Upper Bulb */}
          <div className="relative w-9 h-10 bg-slate-500/10 border border-slate-600/20 rounded-b-full flex items-end justify-center overflow-hidden">
            <div className="w-full bg-amber-500/50 h-[30%] rounded-b-full animate-pulse" />
          </div>

          {/* Connector Neck */}
          <div className="w-2 h-1 bg-slate-700" />

          {/* Lower Bulb */}
          <div className="relative w-9 h-10 bg-slate-500/10 border border-slate-600/20 rounded-t-full flex items-end justify-center overflow-hidden">
            <div className="w-full bg-amber-500/80 h-[75%] rounded-t-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-amber-400/80 animate-ping" />
            </div>
          </div>

          <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* --- LAYER 2: FLOATING TRANSLUCENT COGNITIVE DEADLINE CARDS --- */}
      {/* 1. Client Proposal Card (Top Left) */}
      <div className="absolute top-6 left-6 w-44 bg-slate-950/85 border border-red-500/30 hover:border-red-500/60 p-2.5 rounded-xl shadow-xl shadow-red-950/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-red-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          <span>Client Proposal</span>
        </div>
        <div className="text-[11px] font-bold text-white">Due in 5h 42m</div>
        <span className="inline-block mt-1 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase bg-red-500/10 text-red-500 border border-red-500/15">
          URGENT
        </span>
      </div>

      {/* 2. Interview Prep (Top Right Floating) */}
      <div className="absolute top-4 right-1/4 w-36 bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/50 p-2.5 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Interview Prep</span>
        </div>
        <div className="text-[11px] font-bold text-white">In 2 Days</div>
        <span className="inline-block mt-1 text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">
          FOCUS
        </span>
      </div>

      {/* 3. Assignment Card (Middle Left) */}
      <div className="absolute top-[42%] left-10 w-40 bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-500/50 p-2.5 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">
          <BookOpen className="w-3 h-3" />
          <span>Assignment</span>
        </div>
        <div className="text-[11px] font-bold text-white">Due Tomorrow</div>
        <span className="inline-block mt-1 text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
          ON TRACK
        </span>
      </div>

      {/* 4. Electricity Bill Card (Middle Right) */}
      <div className="absolute top-[52%] right-4 w-36 bg-slate-950/85 border border-purple-500/30 hover:border-purple-500/50 p-2.5 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[9px] uppercase tracking-wider mb-0.5">
          <Zap className="w-3 h-3" />
          <span>Electricity Bill</span>
        </div>
        <div className="text-[11px] font-bold text-white">Due Today</div>
        <span className="inline-block mt-1 text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/15">
          PAY NOW
        </span>
      </div>

      {/* --- LAYER 3: COFFEE CUP WITH CHALK LABELS --- */}
      <div className="absolute bottom-4 left-40 w-24 h-24 z-10 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Cup Handle */}
          <div className="absolute left-[8%] w-8 h-12 border-4 border-slate-800 rounded-l-2xl top-[25%]" />
          
          {/* Cup Body */}
          <div className="absolute right-2 w-16 h-20 bg-slate-850 rounded-b-3xl rounded-t-sm flex flex-col items-center justify-center p-2 text-center border-t border-slate-750">
            {/* Liquid coffee gradient & subtle steam inside */}
            <div className="absolute -top-1 w-14 h-2 bg-gradient-to-r from-amber-900 to-amber-950 rounded-full" />
            
            {/* Chalk text markings */}
            <span className="text-[10px] font-sans font-extrabold text-cyan-400 leading-none">Focus</span>
            <span className="text-[10px] font-sans font-extrabold text-amber-500 leading-none my-0.5">Plan</span>
            <span className="text-[10px] font-sans font-extrabold text-pink-500 leading-none">Finish</span>
          </div>

          {/* Steaming heat lines */}
          <div className="absolute -top-3 right-6 flex gap-1 opacity-70">
            <span className="w-[1.5px] h-3 bg-gradient-to-t from-slate-400/30 to-transparent rounded-full animate-pulse" />
            <span className="w-[1.5px] h-4 bg-gradient-to-t from-slate-400/40 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span className="w-[1.5px] h-3 bg-gradient-to-t from-slate-400/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>
      </div>

      {/* --- LAYER 4: TODAY'S RESCUE PLAN CHECKLIST NOTEBOOK --- */}
      <div className="absolute bottom-4 left-4 w-44 bg-[#faf8f5] border border-slate-300 rounded-xl p-3 shadow-2xl text-zinc-950 flex flex-col justify-between h-44 transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-20">
        {/* Wire binder rings */}
        <div className="absolute -top-2 left-6 right-6 flex justify-between px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2.5 h-4 bg-slate-800 rounded-full border border-zinc-400 transform rotate-12" />
          ))}
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-black text-amber-600 uppercase tracking-wider">Today's Rescue Plan</span>
          <div className="space-y-1">
            {[
              'Outline the proposal',
              'Prepare key points',
              'Review & finalize',
              'Send with confidence'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-emerald-600 rounded flex items-center justify-center bg-emerald-50 text-[8px] text-emerald-600 font-bold shrink-0">
                  ✓
                </div>
                <span className="text-[9px] font-sans font-semibold text-zinc-700 truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notebook page lines accent */}
        <div className="border-t border-dashed border-zinc-300 pt-1 flex justify-between items-center text-[8px] text-zinc-400">
          <span>Page 1 of 1</span>
          <span className="font-mono text-emerald-600 font-bold uppercase">Ready</span>
        </div>
      </div>

      {/* --- LAYER 5: GLOWING SMARTPHONE FOCUS TIMER --- */}
      <div className="absolute bottom-4 right-4 w-36 bg-slate-950 border-2 border-slate-850 rounded-2xl p-2.5 shadow-2xl shadow-cyan-950/20 transform rotate-2 hover:rotate-0 transition-transform duration-500 flex flex-col justify-between h-44 z-20">
        {/* Phone speaker notch */}
        <div className="w-10 h-1.5 bg-slate-800 rounded-full mx-auto mb-1 shrink-0" />
        
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Next 5-Min Action</span>
            <p className="text-[9px] leading-tight text-white font-bold font-sans">
              Draft the proposal outline for 10 minutes.
            </p>
          </div>

          {/* Central countdown circle and time */}
          <div className="my-2 relative flex items-center justify-center">
            {/* Clock circle */}
            <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center">
              <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-sm font-mono font-black text-cyan-400 tracking-wider">
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setTimerActive(!timerActive)}
            className={`w-full ${timerActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-slate-950 text-[9px] font-black py-1 rounded-lg transition-colors cursor-pointer shrink-0`}
          >
            {timerActive ? 'PAUSE SPRINT' : 'START SPRINT'}
          </button>
        </div>
      </div>
    </div>
  );
}
