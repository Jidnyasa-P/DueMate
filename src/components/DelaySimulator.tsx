import React, { useState } from 'react';
import { 
  X, 
  Hourglass, 
  TrendingUp, 
  Compass, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Task, DelaySimulationResult, PrimaryRole, AppearanceMode } from '../types';

interface DelaySimulatorProps {
  task: Task;
  roleStyle: PrimaryRole;
  onClose: () => void;
  onApplyResult?: (result: DelaySimulationResult) => void;
  appearance?: AppearanceMode;
}

export default function DelaySimulator({ task, roleStyle, onClose, onApplyResult, appearance = 'dark' }: DelaySimulatorProps) {
  const [delayDuration, setDelayDuration] = useState<'1h' | '1d' | '1w'>('1d');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DelaySimulationResult | null>(null);

  const isLight = appearance === 'light';
  const isRead = appearance === 'read';

  const cardClass = isLight ? 'bg-white border border-zinc-200 text-zinc-900 shadow-2xl' : isRead ? 'bg-[#fbf7eb] border border-[#ebd4ab] text-[#2e2514] shadow-2xl' : 'bg-slate-900 border border-slate-800 text-white shadow-2xl';
  const innerCardClass = isLight ? 'bg-zinc-100/60 border border-zinc-200 text-zinc-800' : isRead ? 'bg-[#ebd4ab]/40 border border-[#ebd4ab] text-[#2e2514]' : 'bg-slate-950/60 border border-slate-800 text-slate-300';
  const titleColor = isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white';
  const subtitleColor = isLight ? 'text-zinc-600' : isRead ? 'text-[#6d5c41]' : 'text-slate-400';
  const borderClass = isLight ? 'border-zinc-200' : isRead ? 'border-[#ebd4ab]' : 'border-slate-850';
  const textMutedColor = isLight ? 'text-zinc-500 font-medium' : isRead ? 'text-[#6d5c41]/80 font-medium' : 'text-slate-500';

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/simulate-delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate,
          delayDuration,
          originalRisk: task.currentRiskScore,
          roleStyle
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to simulation engine.");
      }

      const data: DelaySimulationResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Premium Local Fallback
      const fallbackRisk = Math.min(100, Math.round(task.currentRiskScore * (delayDuration === '1h' ? 1.15 : delayDuration === '1d' ? 1.45 : 2.2)));
      let impactLevel: 'minor' | 'moderate' | 'severe' | 'catastrophic' = 'moderate';
      if (delayDuration === '1h') impactLevel = 'minor';
      else if (delayDuration === '1w') impactLevel = 'catastrophic';
      
      setResult({
        taskId: task.id,
        taskTitle: task.title,
        delayDuration,
        originalRisk: task.currentRiskScore,
        simulatedRisk: fallbackRisk,
        impactLevel,
        timelineShift: delayDuration === '1h' ? 'Loses final formatting review buffer.' : delayDuration === '1d' ? 'Overlaps with next major milestone.' : 'Forces extreme night stress sprint.',
        survivalAction: 'Write down 3 draft headers right now to anchor focus.',
        dynamicMessage: 'Our heuristic indicates delay increases risk index significantly, reducing confidence.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadgeColor = (level?: string) => {
    switch (level) {
      case 'minor': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'catastrophic': return 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
      isLight ? 'bg-zinc-950/40' : isRead ? 'bg-[#3a3221]/55' : 'bg-slate-950/85'
    }`}>
      <div className={`rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${cardClass}`}>
        
        {/* Banner */}
        <div className={`p-5 flex items-center justify-between border-b ${borderClass} ${
          isLight
            ? 'bg-gradient-to-r from-red-50 to-zinc-50'
            : isRead
            ? 'bg-gradient-to-r from-red-50/40 to-[#fbf7eb]'
            : 'bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-pulse ${
              isLight ? 'bg-red-100 text-red-600' : isRead ? 'bg-red-100/60 text-red-700' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${isLight ? 'text-red-600' : 'text-red-400'}`}>Risk Pre-Mortem</span>
              <h3 className={`text-base font-bold tracking-tight ${titleColor}`}>Active Delay Simulator</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700' : isRead ? 'hover:bg-[#ebd4ab]/40 text-[#6d5c41] hover:text-[#2e2514]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Core */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Task Details */}
          <div className={`rounded-2xl p-4 border ${borderClass} ${innerCardClass}`}>
            <span className={`text-[9px] font-mono uppercase tracking-wider block mb-1 ${textMutedColor}`}>Target Action</span>
            <h4 className={`text-sm font-bold tracking-tight ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{task.title}</h4>
            <p className={`text-xs mt-1 line-clamp-1 ${subtitleColor}`}>{task.description}</p>
            <div className={`flex items-center gap-4 mt-3 pt-3 border-t text-xs ${borderClass}`}>
              <div>
                <span className={textMutedColor}>Current Risk Index: </span>
                <span className="font-mono font-bold text-amber-500">{task.currentRiskScore}%</span>
              </div>
              <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-zinc-300' : isRead ? 'bg-[#ebd4ab]' : 'bg-slate-700'}`} />
              <div>
                <span className={textMutedColor}>Confidence Band: </span>
                <span className={`font-semibold ${isLight ? 'text-zinc-700' : isRead ? 'text-[#2e2514]' : 'text-slate-300'}`}>
                  {100 - task.currentRiskScore > 40 ? 'Stable Buffer' : 'Anxious Compression'}
                </span>
              </div>
            </div>
          </div>

          {/* Delay selector */}
          <div>
            <label className={`text-xs font-mono uppercase tracking-wider block mb-3 ${textMutedColor}`}>
              Select Hypothesized Delay
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '1h', label: '1 Hour', desc: 'Slight delay, compression' },
                { value: '1d', label: '1 Day', desc: 'Overnight shift risk' },
                { value: '1w', label: '1 Week', desc: 'Severe structural threat' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDelayDuration(opt.value as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    delayDuration === opt.value
                      ? 'bg-red-500/10 border-red-500 text-red-500 shadow-md font-bold'
                      : isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                      : isRead
                      ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#6d5c41] hover:border-[#ebd4ab] hover:text-[#2e2514]'
                      : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span className={`text-[10px] mt-0.5 block ${textMutedColor}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger button */}
          {!result && (
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Processing Stress Forecast Heuristics...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Execute Stress & Damage Forecast</span>
                </>
              )}
            </button>
          )}

          {/* Results Block */}
          {result && !loading && (
            <div className="space-y-4 animate-timeline-reveal">
              <div className={`border rounded-2xl p-5 space-y-4 ${innerCardClass} ${borderClass}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase tracking-wider ${textMutedColor}`}>Simulation Output</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono border font-bold uppercase ${getImpactBadgeColor(result.impactLevel)}`}>
                    {result.impactLevel} impact
                  </span>
                </div>

                {/* Risk Progression Chart Visual */}
                <div className="space-y-2">
                  <div className={`flex justify-between text-xs ${textMutedColor}`}>
                    <span>Procrastination Damage Curve</span>
                    <span className="font-mono text-red-500 font-semibold">{result.originalRisk}% → {result.simulatedRisk}%</span>
                  </div>
                  <div className={`h-4 rounded-full overflow-hidden relative flex border ${borderClass} ${isLight ? 'bg-zinc-200/50' : isRead ? 'bg-[#f5ebd2]' : 'bg-slate-900'}`}>
                    {/* Original Risk segment */}
                    <div 
                      className="bg-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${result.originalRisk}%` }}
                    />
                    {/* Simulated addition segment */}
                    <div 
                      className="bg-red-500 h-full transition-all duration-500 relative" 
                      style={{ width: `${result.simulatedRisk - result.originalRisk}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Dynamic message */}
                <div className={`text-sm italic font-medium leading-relaxed border-l-2 border-red-500 pl-3 ${isLight ? 'text-zinc-800' : isRead ? 'text-[#2e2514]' : 'text-slate-100'}`}>
                  "{result.dynamicMessage}"
                </div>

                {/* Advanced Core Product Engine Projection Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`border p-3 rounded-xl space-y-1 ${borderClass} ${isLight ? 'bg-zinc-200/30' : isRead ? 'bg-[#ebd4ab]/20' : 'bg-slate-900/40'}`}>
                    <span className="text-[9px] font-mono text-amber-500 uppercase font-bold">Stress Increase</span>
                    <div className={`text-sm font-bold font-mono ${titleColor}`}>
                      +{result.estimatedStressIncrease || 15}%
                    </div>
                  </div>
                  <div className={`border p-3 rounded-xl space-y-1 ${borderClass} ${isLight ? 'bg-zinc-200/30' : isRead ? 'bg-[#ebd4ab]/20' : 'bg-slate-900/40'}`}>
                    <span className="text-[9px] font-mono text-cyan-600 uppercase font-bold">Catch-up Penalty</span>
                    <div className={`text-sm font-bold font-mono ${titleColor}`}>
                      {result.likelyRecoveryTime || "2 hours"}
                    </div>
                  </div>
                  <div className={`border p-3 rounded-xl space-y-1 ${borderClass} ${isLight ? 'bg-zinc-200/30' : isRead ? 'bg-[#ebd4ab]/20' : 'bg-slate-900/40'}`}>
                    <span className="text-[9px] font-mono text-red-500 uppercase font-bold">Overlaps & Conflicts</span>
                    <div className={`text-xs font-bold truncate ${titleColor}`}>
                      {result.overlappingConflicts && result.overlappingConflicts.length > 0
                        ? result.overlappingConflicts.join(", ")
                        : "None detected"}
                    </div>
                  </div>
                </div>

                <div className={`border rounded-xl p-4 space-y-2 ${isLight ? 'bg-amber-50 border-amber-200' : isRead ? 'bg-[#fbf7eb] border-[#ebd4ab]' : 'bg-amber-950/10 border-amber-500/20'}`}>
                  <span className="text-[10px] font-mono uppercase text-amber-600 font-bold block">Objective Truth Reflection</span>
                  <p className={`text-xs italic leading-relaxed ${isLight ? 'text-amber-800' : isRead ? 'text-[#6d5c41]' : 'text-amber-200'}`}>
                    "{result.honestRecommendation || "Avoidance breeds resistance. Start now to disarm the stress."}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className={`border rounded-xl p-3 ${borderClass} ${isLight ? 'bg-zinc-100' : isRead ? 'bg-[#fbf7eb]' : 'bg-slate-900/80'}`}>
                    <span className="text-[9px] font-mono text-red-500 uppercase block mb-1 font-bold">Timeline Compression</span>
                    <p className={`text-xs leading-relaxed ${subtitleColor}`}>{result.timelineShift}</p>
                    <div className="text-[10px] text-red-500 font-mono mt-1.5 font-semibold">
                      Skip first: {result.whatToSkip || "optional perfectionist styling"}
                    </div>
                  </div>
                  <div className={`border rounded-xl p-3 ${borderClass} ${isLight ? 'bg-zinc-100' : isRead ? 'bg-[#fbf7eb]' : 'bg-slate-900/80'}`}>
                    <span className="text-[9px] font-mono text-emerald-600 uppercase block mb-1 font-bold">Mitigation First Move</span>
                    <p className={`text-xs leading-relaxed font-bold ${isLight ? 'text-zinc-800' : isRead ? 'text-[#2e2514]' : 'text-slate-300'}`}>{result.survivalAction}</p>
                    <div className="text-[10px] text-emerald-600 font-mono mt-1.5 font-semibold">
                      Action 1: {result.whatToDoFirst || "write 3 skeletal headers"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setResult(null)}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer ${
                    isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : isRead ? 'bg-[#ebd4ab] hover:bg-[#d9c7a7] text-[#2e2514]' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Recalculate Scenario
                </button>
                {onApplyResult && (
                  <button
                    onClick={() => {
                      onApplyResult(result);
                      onClose();
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    <span>Commit and Rescue Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-[11px] text-center font-mono ${borderClass} ${isLight ? 'bg-zinc-50 text-zinc-400' : isRead ? 'bg-[#ebd4ab]/20 text-[#6d5c41]/80' : 'bg-slate-950 text-slate-500'}`}>
          DueMate AI Forecast • Strictly therapeutic stress estimation
        </div>
      </div>
    </div>
  );
}
