import React from 'react';

interface DueMateLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  isLight?: boolean;
}

export default function DueMateLogo({
  className = '',
  size = 48,
  showText = false,
  showSubtitle = false,
  isLight = false
}: DueMateLogoProps) {
  // Compute SVG dimensions
  // Default aspect ratio for icon only is 1:1, with text it's wider
  const width = showText ? size * 3.5 : size;
  const height = size;

  const textColorClass = isLight ? 'text-zinc-900' : 'text-white';
  const subtitleColorClass = isLight ? 'text-zinc-500' : 'text-slate-400';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300"
      >
        <defs>
          {/* Main D Gradient */}
          <linearGradient id="duemate-d-grad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" /> {/* Lime Green */}
            <stop offset="25%" stopColor="#06b6d4" /> {/* Cyan */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
            <stop offset="75%" stopColor="#8b5cf6" /> {/* Purple */}
            <stop offset="100%" stopColor="#f97316" /> {/* Orange */}
          </linearGradient>

          {/* Underlay glow filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Speed Lines and Main "D" Frame */}
        {/* We craft the speed lines protruding to the left and merge them into the thick 'D' backbone */}
        <g filter="url(#logo-glow)">
          {/* Top speed pill */}
          <rect x="58" y="60" width="35" height="10" rx="5" fill="#f59e0b" />
          {/* Second speed pill */}
          <rect x="50" y="80" width="45" height="10" rx="5" fill="#f97316" />
          {/* Third speed pill */}
          <rect x="58" y="100" width="35" height="10" rx="5" fill="#ea580c" />
          {/* Bottom speed pill */}
          <rect x="58" y="120" width="28" height="10" rx="5" fill="#dc2626" />

          {/* Thick Rounded Stylized 'D' path */}
          {/* It curves from the top left, sweeps right, arches down, and comes back left */}
          <path
            d="M 85,45 
               H 135 
               A 55,55 0 0 1 190,100 
               A 55,55 0 0 1 135,155 
               H 85 
               C 76,155 70,147 73,138 
               L 88,85 
               C 90,76 96,68 105,68
               H 125
               C 130,68 134,72 134,77
               C 134,82 130,86 125,86
               H 100
               L 89,125
               H 135
               A 25,25 0 0 0 160,100
               A 25,25 0 0 0 135,75
               H 100
               C 91,75 85,67 87,58
               C 88,49 95,45 102,45
               Z"
            fill="url(#duemate-d-grad)"
            fillRule="evenodd"
          />

          {/* Calendar grid icon inside the 'D' center pocket */}
          <g transform="translate(100, 92)" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            {/* Calendar Outer Frame */}
            <rect x="0" y="0" width="34" height="30" rx="5" fill="none" strokeWidth="2.5" />
            {/* Calendar Binder Rings */}
            <path d="M 8,-5 V 4" strokeWidth="2.5" />
            <path d="M 26,-5 V 4" strokeWidth="2.5" />
            {/* Calendar Grid Dot indicators */}
            <circle cx="9" cy="12" r="1.5" fill="white" stroke="none" />
            <circle cx="17" cy="12" r="1.5" fill="white" stroke="none" />
            <circle cx="25" cy="12" r="1.5" fill="white" stroke="none" />
            <circle cx="9" cy="20" r="1.5" fill="white" stroke="none" />
            <circle cx="17" cy="20" r="1.5" fill="white" stroke="none" />
            {/* Today alert day highlight (colored orange) */}
            <circle cx="25" cy="20" r="2.5" fill="#f97316" stroke="none" />
          </g>

          {/* Bold Emerald Checkmark overlaying on top of the 'D' top arch */}
          <path
            d="M 115,75 L 132,92 L 172,52"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]"
          />
        </g>
      </svg>

      {/* Brand Text Elements */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight ${textColorClass} font-sans`}>
              Due<span className="text-cyan-400">Mate</span>
            </span>
            
            {/* Premium AI Badge */}
            <div className="relative group/badge">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-md blur-[1px] opacity-75 animate-pulse" />
              <div className="relative bg-zinc-950 text-[10px] font-black px-1.5 py-0.5 rounded text-cyan-400 font-mono tracking-wider flex items-center gap-0.5 border border-cyan-500/20">
                AI
              </div>
            </div>
          </div>
          
          {showSubtitle && (
            <span className={`text-[10px] tracking-wide font-sans mt-0.5 ${subtitleColorClass}`}>
              Your deadline rescue companion.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
