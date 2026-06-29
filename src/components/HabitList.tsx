import React, { useState } from 'react';
import { Sparkles, Check, Flame, Trophy, Plus, RefreshCw, Star } from 'lucide-react';
import { Habit, PrimaryRole, AppearanceMode } from '../types';

interface HabitListProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string, category: string, targetFrequency: 'daily' | 'weekly' | 'workdays') => void;
  appearance?: AppearanceMode;
}

export default function HabitList({ habits, onToggleHabit, onAddHabit, appearance = 'dark' }: HabitListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Momentum');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'workdays'>('daily');
  const [showForm, setShowForm] = useState(false);

  // Theme support
  const isLight = appearance === 'light';
  const isRead = appearance === 'read';
  const isDark = !isLight && !isRead;

  const titleColor = isLight ? 'text-zinc-900 font-sans' : isRead ? 'text-[#2e2514] font-serif-elegant font-bold' : 'text-white font-sans';
  const subtitleColor = isLight ? 'text-zinc-600 font-sans' : isRead ? 'text-[#6d5c41] font-sans' : 'text-slate-300 font-sans';
  const textMutedColor = isLight ? 'text-zinc-500' : isRead ? 'text-[#6d5c41]/75 font-sans' : 'text-slate-400';
  const cardClass = isLight ? 'bg-white border border-zinc-200 shadow-sm' : isRead ? 'bg-[#fbf7eb] border border-[#e6d5b8] shadow-sm' : 'bg-slate-900 border border-slate-800';
  const innerCardClass = isLight ? 'bg-zinc-100/60 border border-zinc-200' : isRead ? 'bg-[#f5ebd2] border border-[#ebd4ab]' : 'bg-slate-950/60 border border-slate-800/80';
  const borderClass = isLight ? 'border-zinc-200' : isRead ? 'border-[#e6d5b8]' : 'border-slate-800';
  const inputClass = isLight ? 'bg-zinc-50 border border-zinc-300 text-zinc-900 focus:border-indigo-500' : isRead ? 'bg-[#fdfbf7] border border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]' : 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500';
  const btnCancelClass = isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : isRead ? 'bg-[#ebd4ab] hover:bg-[#d9c7a7] text-[#2e2514]' : 'bg-slate-900 hover:bg-slate-850 text-slate-400';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    onAddHabit(newTitle, category, frequency);
    setNewTitle('');
    setShowForm(false);
  };

  const getCompletedToday = (lastCompletedStr: string | null) => {
    if (!lastCompletedStr) return false;
    try {
      const last = new Date(lastCompletedStr);
      const today = new Date();
      return last.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${titleColor}`}>Focus Anchors (Anti-Procrastination Habits)</h2>
          <p className={`text-sm ${subtitleColor}`}>Lock down daily behavioral anchors to guarantee deadline delivery safety.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4.5 py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Custom Anchor</span>
        </button>
      </div>

      {/* Habit creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-2xl p-6 md:p-7 space-y-5 animate-timeline-reveal ${innerCardClass}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${titleColor}`}>Configure Focus Anchor Node</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Anchor Behavioral Name</label>
              <input
                type="text"
                placeholder="e.g. Put phone in drawer for 1 hour"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Target Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              >
                <option value="Momentum">Momentum (Initiation)</option>
                <option value="Anti-procrastination">Anti-procrastination</option>
                <option value="Buffer Preservation">Buffer Preservation</option>
                <option value="Mental Rest">Mental Rest (Restoration)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Target Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              >
                <option value="daily">Every single day</option>
                <option value="workdays">Workdays only</option>
                <option value="weekly">Once per week</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`px-4.5 py-2 rounded-xl text-sm ${btnCancelClass}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold cursor-pointer"
            >
              Deploy Anchor
            </button>
          </div>
        </form>
      )}

      {/* Grid rendering list of habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {habits.map((habit) => {
          const doneToday = getCompletedToday(habit.lastCompleted);
          const activeCardBgClass = doneToday 
            ? isLight
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : isRead
              ? 'bg-[#e2f0d9] border-[#a2cf8d]'
              : 'bg-emerald-950/20 border-emerald-500/30'
            : cardClass;

          return (
            <div 
              key={habit.id}
              className={`p-6 rounded-3xl border transition-all flex items-center justify-between gap-5 ${activeCardBgClass}`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                    isLight 
                      ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      : isRead
                      ? 'bg-[#f5ebd2] text-[#8b5a2b] border border-[#ebd4ab]'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {habit.category}
                  </span>
                  <span className={`text-xs font-mono uppercase ${textMutedColor}`}>
                    • {habit.targetFrequency}
                  </span>
                </div>

                <h4 className={`text-base font-bold tracking-tight ${
                  doneToday 
                    ? 'line-through text-slate-500' 
                    : isLight
                    ? 'text-zinc-900'
                    : isRead
                    ? 'text-[#2e2514]'
                    : 'text-white'
                }`}>
                  {habit.title}
                </h4>

                {/* Streak count */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-500">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-mono font-bold">{habit.streak} Day Streak</span>
                </div>
              </div>

              {/* Complete checklist button */}
              <button
                onClick={() => onToggleHabit(habit.id)}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                  doneToday
                    ? 'bg-emerald-600 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                    : isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:border-amber-500 hover:text-zinc-900 hover:bg-zinc-50'
                    : isRead
                    ? 'bg-[#ebd4ab] border-[#ebd4ab] text-[#8b5a2b] hover:border-[#8b5a2b] hover:bg-[#ebd4ab]/80'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-amber-500 hover:text-white'
                }`}
                title={doneToday ? 'Completed' : 'Complete anchor for today'}
              >
                {doneToday ? (
                  <Check className="w-7 h-7 stroke-[3]" />
                ) : (
                  <Sparkles className="w-5.5 h-5.5 text-amber-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
