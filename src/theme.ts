import { AppearanceMode, PrimaryRole } from "./types";

export interface ThemeColors {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentHover: string;
  accentText: string;
  ring: string;
  shadow: string;
}

export const roleThemes: Record<PrimaryRole, ThemeColors> = {
  student: {
    bg: "bg-gradient-to-br from-sky-50 via-mint-50 to-cream-50",
    card: "bg-white/80 backdrop-blur-md border-sky-100",
    text: "text-slate-800",
    textMuted: "text-slate-500",
    border: "border-sky-100",
    accent: "bg-sky-500",
    accentHover: "hover:bg-sky-600",
    accentText: "text-sky-600",
    ring: "focus:ring-sky-400",
    shadow: "shadow-sky-100/40",
  },
  professional: {
    bg: "bg-gradient-to-br from-slate-50 via-zinc-100 to-teal-50/30",
    card: "bg-white border-slate-200/80 shadow-sm",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    border: "border-slate-200",
    accent: "bg-teal-600",
    accentHover: "hover:bg-teal-700",
    accentText: "text-teal-600",
    ring: "focus:ring-teal-500",
    shadow: "shadow-slate-200/50",
  },
  entrepreneur: {
    bg: "bg-slate-950 text-slate-100",
    card: "bg-slate-900/90 border-slate-800 backdrop-blur-md",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    border: "border-slate-800",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-600",
    accentText: "text-amber-400",
    ring: "focus:ring-amber-500",
    shadow: "shadow-amber-500/10",
  },
  freelancer: {
    bg: "bg-gradient-to-br from-stone-50 via-violet-50/20 to-cyan-50/30",
    card: "bg-white/90 border-stone-200 backdrop-blur-md",
    text: "text-stone-800",
    textMuted: "text-stone-500",
    border: "border-stone-200",
    accent: "bg-violet-600",
    accentHover: "hover:bg-violet-700",
    accentText: "text-violet-600",
    ring: "focus:ring-violet-500",
    shadow: "shadow-violet-100/50",
  },
  job_seeker: {
    bg: "bg-gradient-to-br from-orange-50/30 via-emerald-50/10 to-slate-100",
    card: "bg-white border-emerald-100",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    border: "border-emerald-100",
    accent: "bg-emerald-700",
    accentHover: "hover:bg-emerald-800",
    accentText: "text-emerald-700",
    ring: "focus:ring-emerald-600",
    shadow: "shadow-emerald-900/5",
  },
};

export const modeThemes: Record<Exclude<AppearanceMode, 'auto'>, ThemeColors> = {
  light: {
    bg: "bg-zinc-50",
    card: "bg-white border-zinc-200 shadow-sm",
    text: "text-zinc-900",
    textMuted: "text-zinc-500",
    border: "border-zinc-200",
    accent: "bg-indigo-600",
    accentHover: "hover:bg-indigo-700",
    accentText: "text-indigo-600",
    ring: "focus:ring-indigo-500",
    shadow: "shadow-zinc-200/50",
  },
  dark: {
    bg: "bg-zinc-950",
    card: "bg-zinc-900 border-zinc-800",
    text: "text-zinc-100",
    textMuted: "text-zinc-400",
    border: "border-zinc-800",
    accent: "bg-cyan-500",
    accentHover: "hover:bg-cyan-600",
    accentText: "text-cyan-400",
    ring: "focus:ring-cyan-500",
    shadow: "shadow-cyan-500/5",
  },
  read: {
    bg: "bg-[#f4ebd0]", // elegant creamy warm sepia background
    card: "bg-[#fbf7eb] border-[#e6d5b8] shadow-sm",
    text: "text-[#2e2514] font-serif text-lg leading-relaxed",
    textMuted: "text-[#6d5c41] font-sans text-sm",
    border: "border-[#e6d5b8]",
    accent: "bg-[#8b5a2b]",
    accentHover: "hover:bg-[#6f421d]",
    accentText: "text-[#8b5a2b] font-medium",
    ring: "focus:ring-[#8b5a2b]",
    shadow: "shadow-[#8b5a2b]/5",
  },
  focus: {
    bg: "bg-neutral-950 text-neutral-200 font-mono",
    card: "bg-neutral-900/95 border-neutral-800",
    text: "text-neutral-100",
    textMuted: "text-neutral-500",
    border: "border-neutral-800",
    accent: "bg-emerald-500",
    accentHover: "hover:bg-emerald-600",
    accentText: "text-emerald-400",
    ring: "focus:ring-emerald-500",
    shadow: "shadow-emerald-500/10",
  },
  panic: {
    bg: "bg-red-950 text-red-100 animate-pulse-slow",
    card: "bg-black/90 border-red-800 border-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    text: "text-red-50",
    textMuted: "text-red-400",
    border: "border-red-800",
    accent: "bg-red-600 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]",
    accentHover: "hover:bg-red-700",
    accentText: "text-red-500 font-bold",
    ring: "focus:ring-red-500",
    shadow: "shadow-red-900/50",
  }
};

export function getTheme(mode: AppearanceMode, role: PrimaryRole): ThemeColors {
  if (mode === 'auto') {
    return roleThemes[role];
  }
  return modeThemes[mode];
}
