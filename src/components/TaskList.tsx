import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertOctagon, 
  Plus, 
  Trash2, 
  Play, 
  Compass, 
  ShieldAlert, 
  Calendar as CalendarIcon,
  Activity,
  Mic,
  MicOff,
  CornerDownLeft
} from 'lucide-react';
import { Task, PrimaryRole, PanicLevel, TaskStatus, AppearanceMode } from '../types';

interface TaskListProps {
  tasks: Task[];
  roleStyle: PrimaryRole;
  onAddTask: (task: Omit<Task, 'id' | 'currentRiskScore' | 'safestNextMove'>) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSelectRescue: (task: Task) => void;
  onSelectSimulate: (task: Task) => void;
  appearance?: AppearanceMode;
}

export default function TaskList({ 
  tasks, 
  roleStyle, 
  onAddTask, 
  onDeleteTask, 
  onToggleStatus,
  onSelectRescue,
  onSelectSimulate,
  appearance = 'dark'
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Theme helpers for light/read vs dark mode support
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
  const btnCancelClass = isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : isRead ? 'bg-[#e6d5b8] hover:bg-[#d9c7a7] text-[#2e2514]' : 'bg-slate-900 hover:bg-slate-850 text-slate-400';

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academics');
  const [dueDate, setDueDate] = useState('');
  const [panicLevel, setPanicLevel] = useState<PanicLevel>('medium');
  const [originalEstimateHours, setOriginalEstimateHours] = useState(4);

  // Web Speech API / Voice and Fallback Input States
  const [listeningField, setListeningField] = useState<'title' | 'description' | 'quick' | null>(null);
  const [voiceError, setVoiceError] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');

  const isListening = listeningField !== null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  const handleVoiceCapture = (field: 'title' | 'description' | 'quick') => {
    if (!isSpeechSupported) return;
    setVoiceError('');
    setListeningField(field);
    
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          if (field === 'quick') {
            setTitle(resultText);
            setShowForm(true);
          } else if (field === 'title') {
            setTitle((prev) => prev ? `${prev} ${resultText}` : resultText);
          } else if (field === 'description') {
            setDescription((prev) => prev ? `${prev} ${resultText}` : resultText);
          }
        }
        setListeningField(null);
      };

      rec.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        
        let friendlyMessage = `Voice capturing failed: ${event.error}`;
        if (event.error === 'not-allowed') {
          friendlyMessage = 'Microphone access was denied. If you are inside the AI Studio preview iframe, please click "Open in New Tab" in the top-right of your screen, or authorize microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          friendlyMessage = 'No speech was detected. Please make sure your microphone is working and try speaking again.';
        } else if (event.error === 'audio-capture') {
          friendlyMessage = 'No microphone was found. Please ensure a microphone is plugged in, enabled, and selected.';
        } else if (event.error === 'network') {
          friendlyMessage = 'A network error occurred during speech recognition. Please check your internet connection.';
        }
        
        setVoiceError(friendlyMessage);
        setListeningField(null);
      };

      rec.onend = () => {
        setListeningField(null);
      };

      rec.start();
    } catch (err: any) {
      console.error(err);
      setVoiceError('Voice speech setup failed.');
      setListeningField(null);
    }
  };

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackInput.trim()) return;
    setTitle(fallbackInput);
    setFallbackInput('');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddTask({
      title,
      description,
      category,
      dueDate: dueDate || new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days default
      status: 'pending',
      roleStyle,
      panicLevel,
      originalEstimateHours: Number(originalEstimateHours),
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowForm(false);
  };

  const getPanicBadgeColor = (level: PanicLevel) => {
    switch (level) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse';
    }
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getGoogleCalendarUrl = (task: Task) => {
    const title = `[DueMate AI Rescue] ${task.title}`;
    const details = `${task.description || ''}\n\nGenerated by DueMate AI: Start before things become expensive!`;
    const dateStr = task.dueDate || new Date().toISOString();
    const date = new Date(dateStr);
    const formatGCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = formatGCalDate(new Date(date.getTime() - 30 * 60 * 1000)); // 30 mins prior buffer
    const end = formatGCalDate(date);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  };

  const handleDownloadIcs = (task: Task) => {
    const title = `[DueMate AI Rescue] ${task.title}`;
    const desc = `${task.description || ''}\n\nGenerated by DueMate AI: Start before things become expensive!`;
    const dateStr = task.dueDate || new Date().toISOString();
    const date = new Date(dateStr);
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = formatDate(new Date(date.getTime() - 30 * 60 * 1000));
    const end = formatDate(date);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DueMate AI//Calendar Export//EN',
      'BEGIN:VEVENT',
      `UID:${task.id}-${Date.now()}@duemate.ai`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.title.replace(/\s+/g, '_')}_rescue.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${titleColor}`}>Active Deadline Repository</h2>
          <p className={`text-sm ${subtitleColor}`}>Add or manage your active deadlines and generate high-impact AI Rescue Plans.</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4.5 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Deadline Item</span>
        </button>
      </div>

      {/* Voice & Smart Deadline Capture Panel */}
      <div className={`rounded-3xl p-6 md:p-7 space-y-5 ${cardClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold tracking-tight flex items-center gap-2.5 ${titleColor}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Voice & Smart Deadline Capture</span>
            </h3>
            <p className={`text-xs mt-1 ${subtitleColor}`}>Quickly capture what you almost forgot using your voice or fast entry.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSpeechSupported ? (
              <button
                type="button"
                onClick={() => handleVoiceCapture('quick')}
                className={`flex items-center gap-2 font-bold px-4.5 py-3 rounded-xl text-sm transition-all border cursor-pointer ${
                  listeningField === 'quick'
                    ? 'bg-red-500/15 border-red-500 text-red-500 animate-pulse shadow-red-500/10 shadow-lg'
                    : isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                    : isRead
                    ? 'bg-[#e6d5b8] border-[#ebd4ab] text-[#2e2514] hover:bg-[#d9c7a7]'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Mic className={`w-4.5 h-4.5 ${listeningField === 'quick' ? 'animate-bounce text-red-500' : ''}`} />
                <span>{listeningField === 'quick' ? 'Listening...' : 'Speak a deadline'}</span>
              </button>
            ) : (
              <span className={`text-xs font-mono px-3.5 py-2.5 rounded-xl flex items-center gap-2 border ${innerCardClass} ${textMutedColor}`}>
                <MicOff className="w-4 h-4" />
                <span>Voice unavailable</span>
              </span>
            )}
          </div>
        </div>

        {/* Fallback Input Box */}
        <form onSubmit={handleFallbackSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type what you almost forgot..."
            value={fallbackInput}
            onChange={(e) => setFallbackInput(e.target.value)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-zinc-500 ${inputClass}`}
          />
          <button
            type="submit"
            className={`font-semibold px-4.5 py-3 rounded-xl text-sm flex items-center gap-1.5 cursor-pointer transition-all ${
              isLight
                ? 'bg-zinc-800 text-white hover:bg-zinc-750'
                : isRead
                ? 'bg-[#8b5a2b] text-white hover:bg-[#724a23]'
                : 'bg-slate-800 border border-slate-750 text-slate-200 hover:text-white'
            }`}
          >
            <span>Fast Entry</span>
            <CornerDownLeft className="w-4 h-4 opacity-75" />
          </button>
        </form>

        {voiceError && (
          <p className="text-xs font-mono text-red-500 flex items-center gap-1.5 mt-1">
            <span>⚠️</span>
            <span>{voiceError}</span>
          </p>
        )}
      </div>

      {/* Task Creation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-2xl p-6 md:p-7 space-y-5 animate-timeline-reveal ${innerCardClass}`}>
          <h3 className={`text-base font-bold tracking-tight uppercase tracking-wider font-mono ${titleColor}`}>Create Deadline Node</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Deadline Item Title *</label>
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceCapture('title')}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-sans cursor-pointer transition-all ${
                      listeningField === 'title'
                        ? 'bg-red-500/15 border-red-500 text-red-500 animate-pulse'
                        : isLight
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                        : isRead
                        ? 'bg-[#ebd4ab]/25 border-[#ebd4ab] text-[#8b5a2b]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Mic className={`w-3 h-3 ${listeningField === 'title' ? 'animate-bounce text-red-500' : ''}`} />
                    <span>{listeningField === 'title' ? 'Listening...' : 'Voice Type'}</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. Prepare Series-A Term Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`w-full rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none ${inputClass}`}
                />
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceCapture('title')}
                    className={`absolute right-3 p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      listeningField === 'title' ? 'text-red-500 animate-pulse' : textMutedColor
                    }`}
                    title="Voice Type Title"
                  >
                    <Mic className={`w-4 h-4 ${listeningField === 'title' ? 'animate-bounce' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Due Date & Hour *</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Supportive Details / Instructions</label>
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => handleVoiceCapture('description')}
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-sans cursor-pointer transition-all ${
                    listeningField === 'description'
                      ? 'bg-red-500/15 border-red-500 text-red-500 animate-pulse'
                      : isLight
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                      : isRead
                      ? 'bg-[#ebd4ab]/25 border-[#ebd4ab] text-[#8b5a2b]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Mic className={`w-3 h-3 ${listeningField === 'description' ? 'animate-bounce text-red-500' : ''}`} />
                  <span>{listeningField === 'description' ? 'Listening...' : 'Voice Type'}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                placeholder="Provide context, references, key guidelines, or what has been causing roadblocks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none h-24 resize-none ${inputClass}`}
              />
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => handleVoiceCapture('description')}
                  className={`absolute right-3 top-3 p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    listeningField === 'description' ? 'text-red-500 animate-pulse' : textMutedColor
                  }`}
                  title="Voice Type Description"
                >
                  <Mic className={`w-4 h-4 ${listeningField === 'description' ? 'animate-bounce' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Milestone Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              >
                <option value="Academics">Academics</option>
                <option value="Client Deliverable">Client Deliverable</option>
                <option value="Corporate/Professional">Corporate/Professional</option>
                <option value="Strategy">Strategy</option>
                <option value="Administrative">Administrative</option>
                <option value="Interview Practice">Interview Practice</option>
                <option value="Bills & Commitments">Bills & Commitments</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Estimate Active Hours</label>
              <input
                type="number"
                min="1"
                max="100"
                value={originalEstimateHours}
                onChange={(e) => setOriginalEstimateHours(Number(e.target.value))}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono uppercase font-semibold ${subtitleColor}`}>Anxiety Level Preset</label>
              <select
                value={panicLevel}
                onChange={(e) => setPanicLevel(e.target.value as PanicLevel)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputClass}`}
              >
                <option value="low">Low (Stable breathing room)</option>
                <option value="medium">Medium (Compressed review)</option>
                <option value="high">High (Moderate stress levels)</option>
                <option value="critical">Critical (Nearing Panic Stage)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`px-4.5 py-2.5 rounded-xl text-sm ${btnCancelClass}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            >
              Deploy Deadline Node
            </button>
          </div>
        </form>
      )}

      {/* Task List Rendering */}
      {tasks.length === 0 ? (
        <div className={`rounded-3xl p-10 text-center space-y-4 ${cardClass}`}>
          <CheckSquare className="w-14 h-14 text-slate-500 mx-auto opacity-70" />
          <div>
            <h4 className={`font-bold text-base ${titleColor}`}>No active deadline logs found.</h4>
            <p className={`text-sm mt-1.5 ${subtitleColor}`}>Excellent! You are currently safe from compressed risk intervals.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const cardBgClass = isCompleted 
              ? isLight 
                ? 'bg-zinc-50 border border-zinc-200/60 opacity-60' 
                : isRead
                ? 'bg-[#f5ebd2] border border-[#ebd4ab]/60 opacity-60'
                : 'bg-slate-950/40 border-slate-800/40 opacity-75'
              : cardClass;

            return (
              <div 
                key={task.id}
                className={`p-6 rounded-3xl transition-all duration-300 hover:scale-[1.005] ${cardBgClass}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => onToggleStatus(task.id)}
                      className={`w-6 h-6 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted 
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950' 
                          : isLight
                          ? 'border-zinc-300 hover:border-indigo-600 bg-white text-zinc-900'
                          : isRead
                          ? 'border-[#ebd4ab] hover:border-[#8b5a2b] bg-[#fbf7eb] text-[#2e2514]'
                          : 'border-slate-700 hover:border-amber-500 text-white'
                      }`}
                      title={isCompleted ? 'Mark Pending' : 'Mark Complete'}
                    >
                      {isCompleted && <CheckSquare className="w-5 h-5 text-slate-950" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full font-bold ${
                          isLight 
                            ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' 
                            : isRead 
                            ? 'bg-[#e6d5b8] text-[#2e2514] border border-[#ebd4ab]' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {task.category}
                        </span>
                        
                        <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded-full border font-bold ${getPanicBadgeColor(task.panicLevel)}`}>
                          {task.panicLevel} panic
                        </span>

                        <span className={`text-xs font-mono flex items-center gap-1.5 ${textMutedColor}`}>
                          <Clock className="w-3.5 h-3.5" />
                          Est: {task.originalEstimateHours}h
                        </span>
                      </div>

                      <h3 className={`text-base font-bold mt-2.5 tracking-tight ${
                        isCompleted 
                          ? 'line-through text-slate-500' 
                          : isLight
                          ? 'text-zinc-900'
                          : isRead
                          ? 'text-[#2e2514]'
                          : 'text-white'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className={`text-sm mt-1.5 max-w-xl leading-relaxed ${subtitleColor}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Safest Next Move info box */}
                      {!isCompleted && (
                        <div className="space-y-4">
                          <div className={`mt-4 rounded-2xl p-4 text-sm flex items-start gap-3 max-w-xl ${innerCardClass}`}>
                            <Compass className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-slow-orbit" />
                            <div>
                              <span className="text-xs font-mono uppercase text-amber-500 block font-bold mb-0.5">Safest Next Move</span>
                              <span className={isLight ? 'text-zinc-800 font-medium' : isRead ? 'text-[#2e2514] font-medium' : 'text-slate-300'}>{task.safestNextMove}</span>
                            </div>
                          </div>

                          {/* Quick Calendar Export Ribbon */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <a
                              href={getGoogleCalendarUrl(task)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                                isLight
                                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                                  : isRead
                                  ? 'bg-[#f5ebd2] hover:bg-[#e6d5b8] text-[#8b5a2b] border border-[#ebd4ab]'
                                  : 'bg-slate-950/40 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white'
                              }`}
                              title="Add to Google Calendar"
                            >
                              <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                              <span>Add to Google Calendar</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDownloadIcs(task)}
                              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isLight
                                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                                  : isRead
                                  ? 'bg-[#f5ebd2] hover:bg-[#e6d5b8] text-[#8b5a2b] border border-[#ebd4ab]'
                                  : 'bg-slate-950/40 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white'
                              }`}
                              title="Download .ics Calendar Event File"
                            >
                              <Plus className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Download .ics File</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap items-center gap-2.5 md:self-center">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => onSelectRescue(task)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                          title="Generate step-by-step custom AI rescue plan"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Rescue Plan</span>
                        </button>

                        <button
                          onClick={() => onSelectSimulate(task)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-medium'
                              : isRead
                              ? 'bg-[#e6d5b8] hover:bg-[#d9c7a7] text-[#2e2514] font-medium'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Simulate delay and see risk projections"
                        >
                          <Activity className="w-4 h-4" />
                          <span>Simulate Delay</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated progress slider bar */}
                {!isCompleted && (
                  <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${borderClass} ${textMutedColor}`}>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Heuristic Stress Index: </span>
                      <span className={`font-mono font-bold ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{task.currentRiskScore}%</span>
                    </div>
                    <span className="font-medium">Target: {formatDueDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
