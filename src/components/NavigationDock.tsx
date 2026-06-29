import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  LifeBuoy, 
  Calendar as CalendarIcon, 
  Sparkles, 
  LineChart, 
  Settings as SettingsIcon,
  LogOut,
  Zap
} from 'lucide-react';
import { AppearanceMode } from '../types';
import DueMateLogo from './DueMateLogo';

interface NavigationDockProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  appearanceMode: AppearanceMode;
  userEmail?: string;
  userName?: string;
}

export default function NavigationDock({ 
  activeTab, 
  setActiveTab, 
  onLogout,
  appearanceMode,
  userEmail,
  userName
}: NavigationDockProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'tour-nav-dashboard' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, tourId: 'tour-nav-tasks' },
    { id: 'rescue-plan', label: 'Rescue Plan', icon: LifeBuoy, tourId: 'tour-nav-rescue' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, tourId: 'tour-calendar-export' },
    { id: 'habits', label: 'Habits', icon: Sparkles, tourId: 'tour-nav-habits' },
    { id: 'insights', label: 'Insights', icon: LineChart, tourId: 'tour-nav-insights' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, tourId: 'tour-nav-settings' },
  ];

  return (
    <>
      {/* Desktop Floating Navigation Dock - Left or Top Side */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40">
        <div className={`flex flex-col items-center gap-4 px-3 py-6 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          appearanceMode === 'dark' || appearanceMode === 'focus' || appearanceMode === 'panic'
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' 
            : appearanceMode === 'read'
            ? 'bg-[#fbf7eb]/90 border-[#e6d5b8] text-[#2e2514]'
            : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          {/* Logo Brand Icon */}
          <div className="mb-4 relative group" title="DueMate AI Rescue Core">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity" />
            <div className="relative cursor-pointer transition-transform duration-300 hover:scale-105">
              <DueMateLogo size={40} showText={false} isLight={appearanceMode === 'light' || appearanceMode === 'read'} />
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`${tab.tourId}-desktop`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-3 rounded-xl transition-all duration-200 group flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                      : 'hover:bg-slate-500/10 hover:text-amber-500 text-slate-400'
                  }`}
                  title={tab.label}
                >
                  <IconComponent className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg shadow-xl font-medium tracking-wide whitespace-nowrap pointer-events-none border border-slate-800">
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-500/10 w-full flex flex-col items-center gap-3">
            <button
              onClick={onLogout}
              className="p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all duration-200"
              title="Logout session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-40">
        <div className={`flex items-center justify-around px-2 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          appearanceMode === 'dark' || appearanceMode === 'focus' || appearanceMode === 'panic'
            ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
            : appearanceMode === 'read'
            ? 'bg-[#fbf7eb]/95 border-[#e6d5b8] text-[#2e2514]'
            : 'bg-white/95 border-slate-200/80 text-slate-800'
        }`}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`${tab.tourId}-mobile`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-amber-500 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={tab.label}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-medium tracking-tight truncate max-w-[48px]">
                  {tab.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium tracking-tight">Exit</span>
          </button>
        </div>
      </div>
    </>
  );
}
