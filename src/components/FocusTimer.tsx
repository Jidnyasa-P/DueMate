import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  Tv, 
  Flame,
  Music,
  Maximize2
} from 'lucide-react';
import { Task, RescueStep } from '../types';

interface FocusTimerProps {
  task: Task;
  initialStep?: RescueStep | null;
  onClose: () => void;
  onCompleteStep?: () => void;
}

export default function FocusTimer({ task, initialStep, onClose, onCompleteStep }: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // Standard 25 mins Pomodoro
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'brownian' | 'binaural'>('none');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [soundNode, setSoundNode] = useState<AudioScheduledSourceNode | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && !completed) {
      setCompleted(true);
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, completed]);

  // Clean up web audio context
  useEffect(() => {
    return () => {
      if (soundNode) {
        try { soundNode.stop(); } catch(e){}
      }
    };
  }, [soundNode]);

  const toggleSound = () => {
    if (ambientSound !== 'none') {
      // Stop current sound
      if (soundNode) {
        try { soundNode.stop(); } catch(e){}
        setSoundNode(null);
      }
      setAmbientSound('none');
      return;
    }

    try {
      // Initialize premium synthesized focus noise using standard Web Audio (zero-dependency!)
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Simple Brownian/Pink noise integration to lower stress levels
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Amplify slightly
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 400; // soft deep low pass focus sound

      const gain = ctx.createGain();
      gain.gain.value = 0.08; // quiet baseline volume

      noiseSource.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      setSoundNode(noiseSource);
      setAmbientSound('brownian');
    } catch (e) {
      console.warn("Web Audio API blocked or not supported in this frame context.", e);
      // Soft status notification fallback
      setAmbientSound('binaural');
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 text-neutral-200 z-50 flex flex-col justify-between p-6 md:p-12 animate-gradient-bg bg-gradient-to-br from-neutral-950 via-[#121212] to-neutral-900 font-mono">
      
      {/* Top Header controls */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-mono-tech">
            Active Focus Space — Shield Engaged
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          <X className="w-4 h-4" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full my-6">
        
        {/* Soft animated pulsing breathing ring */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-neutral-800 flex items-center justify-center p-8 mb-8 shadow-[0_0_50px_rgba(16,185,129,0.02)]">
          {isActive && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
          )}
          
          <div className="text-center">
            {completed ? (
              <div className="space-y-2 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Focus Block Met</h3>
              </div>
            ) : (
              <>
                <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-white select-none">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2">
                  {isActive ? 'Inhale • Exhale • Focus' : 'Ready for immersion'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Focus Timer Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-neutral-800 text-amber-400 border border-neutral-700' 
                : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6 fill-amber-400" /> : <Play className="w-6 h-6 fill-slate-950 ml-1" />}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(25 * 60);
              setCompleted(false);
            }}
            className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Reset to 25 mins"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Synth ambient noise toggle */}
          <button
            onClick={toggleSound}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
              ambientSound !== 'none'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Synthesized Stress-Relief Brownian Noise"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>

        {/* Safest Next Move Panel */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 w-full text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 text-emerald-400 rounded-bl-xl text-[9px] font-bold">
            SAFE ZONE
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Safest Next Move Instruction</span>
          </div>

          <h4 className="text-sm font-bold text-white tracking-tight mb-1.5">
            {initialStep ? initialStep.title : 'Low-friction Initiation'}
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed mb-4">
            {initialStep ? initialStep.details : task.safestNextMove}
          </p>

          <button
            onClick={() => {
              if (onCompleteStep) onCompleteStep();
              setCompleted(true);
            }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-emerald-400 font-bold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark Step Complete & Advance</span>
          </button>
        </div>
      </div>

      {/* Focus mode footer quotes */}
      <div className="w-full max-w-5xl mx-auto pt-4 border-t border-neutral-900 text-center flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Cognitive strategy: We are bypassing anxiety by doing small chunks first.</span>
        </div>
        <div className="font-mono-tech">
          Target Project: <span className="text-neutral-300 font-semibold">{task.title}</span>
        </div>
      </div>
    </div>
  );
}
