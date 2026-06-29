import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play, HelpCircle } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  fallbackText?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-todays-plan",
    title: "1. Today’s Plan",
    description: "Your structured shelter from overwhelming deadlines. DueMate parses your day into clear, bite-sized tasks tailored specifically to your active role and fatigue constraints.",
    fallbackText: "Check 'Today's Plan' on your primary dashboard to view high-priority items curated for immediate focus."
  },
  {
    targetId: "tour-safest-next-move",
    title: "2. Safest Next Move",
    description: "The absolute lowest physical barrier to cross. To beat procrastination, we don't ask you to finish the project; we ask you to do this micro-task in under 5 minutes.",
    fallbackText: "The 'Safest Next Move' card identifies simple micro-actions (like opening a document) to build momentum easily."
  },
  {
    targetId: "tour-rescue-timeline",
    title: "3. Rescue Timeline",
    description: "An interactive milestone preview that updates dynamically. It shows exactly when your deliverables are due and schedules intermediate rescue markers.",
    fallbackText: "The 'Rescue Timeline' displays upcoming risk indicators and highlights structured buffer periods."
  },
  {
    targetId: "tour-delay-simulator",
    title: "4. Delay Simulator",
    description: "Curious about putting it off? Enter your delay (1 hr, 1 day, 1 week) and watch the AI calculate how your risk profile compresses, without guilt or shame.",
    fallbackText: "Our interactive 'Delay Simulator' lets you preview stress forecasts and adjusted safety buffers before delaying actions."
  },
  {
    targetId: "tour-focus-mode",
    title: "5. Focus Mode",
    description: "Escape the noise. Toggling Focus Mode strips away everything but a serene timer, clean instructions, and your single Safest Next Move.",
    fallbackText: "Enable 'Focus Mode' from the navigation bar or settings to switch to an ambient, distraction-free work view."
  },
  {
    targetId: "tour-calendar-export",
    title: "6. Calendar Sync & Export",
    description: "Ensure your external schedule stays aligned. Copy your rescue calendar link or export directly to keep standard apps perfectly synchronized.",
    fallbackText: "Synchronize your calculated rescue checkpoints with Google Calendar, Outlook, or Apple Calendar using our secure export link."
  },
  {
    targetId: "tour-proactive-suite",
    title: "7. Proactive Rescue Suites",
    description: "Exclusive offline-first tools designed to bypass starting resistance. Focus on 'Panic Autopilot' to auto-triage scope, 'Bio-Scheduler' to align tasks with brain energy, and 'Body Double' to focus with an AI companion.",
    fallbackText: "Find the 'Proactive Rescue Suites' tab panel on your primary dashboard to explore advanced crisis tools."
  }
];

const getVisibleTargetElement = (targetId: string): HTMLElement | null => {
  const selectors = [
    `#${targetId}`,
    `#${targetId}-mobile`,
    `#${targetId}-desktop`
  ];
  const elements = document.querySelectorAll(selectors.join(', '));
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
      return el;
    }
  }
  
  if (elements.length > 0) {
    return elements[0] as HTMLElement;
  }
  
  return null;
};

interface TourProps {
  onComplete: () => void;
  active: boolean;
}

export default function Tour({ onComplete, active }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; position: 'bottom' | 'top' | 'center' }>({ top: 0, left: 0, position: 'center' });
  const [isMobile, setIsMobile] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState<{ top: string; left: string; width: string; height: string } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!active) return;

    const updateCoords = () => {
      const step = TOUR_STEPS[currentStep];
      const element = getVisibleTargetElement(step.targetId);

      if (element) {
        const rect = element.getBoundingClientRect();

        // Determine best placement based on vertical space relative to viewport bounds
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const tooltipHeight = 240;
        const tooltipWidth = 340;

        let top = rect.bottom + 12;
        let position: 'bottom' | 'top' | 'center' = 'bottom';

        if (spaceBelow < tooltipHeight && spaceAbove > tooltipHeight) {
          top = rect.top - tooltipHeight - 12;
          position = 'top';
        } else if (spaceBelow < tooltipHeight && spaceAbove < tooltipHeight) {
          if (spaceBelow > spaceAbove) {
            top = rect.bottom + 12;
            position = 'bottom';
          } else {
            top = rect.top - tooltipHeight - 12;
            position = 'top';
          }
        }

        // Limit top/bottom alignment within safe viewport bounds (16px padding)
        const minTop = 16;
        const maxTop = window.innerHeight - tooltipHeight - 16;
        top = Math.max(minTop, Math.min(maxTop, top));

        // Calculate left offset centered relative to target element center
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        
        // Keep left aligned safely within viewport boundary (16px padding)
        const minLeft = 16;
        const maxLeft = window.innerWidth - tooltipWidth - 16;
        left = Math.max(minLeft, Math.min(maxLeft, left));

        setCoords({ top, left, position });

        // Check if highlighted element is actually partially in viewport
        const isElementVisibleInViewport = (
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth
        );

        if (isElementVisibleInViewport) {
          setHighlightStyle({
            top: `${rect.top - 6}px`,
            left: `${rect.left - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`
          });
        } else {
          setHighlightStyle(null);
        }

        // Scroll element into view smoothly if needed (keep 80px top/bottom buffer)
        const isVisible = rect.top >= 80 && rect.bottom <= window.innerHeight - 80;
        if (!isVisible) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Centered fallback if element is not in DOM
        setCoords({ top: 0, left: 0, position: 'center' });
        setHighlightStyle(null);
      }
    };

    updateCoords();

    // Re-align whenever scroll or resize happens
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, { passive: true });

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [currentStep, active]);

  if (!active) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('dueMate_tour_completed', 'true');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('dueMate_tour_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dimmed backdrop background */}
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-[1px] pointer-events-auto" onClick={handleSkip} />

      {/* Pulsing focal ring highlighting active element */}
      {coords.position !== 'center' && highlightStyle && (
        <div 
          className="fixed border-2 border-amber-400 bg-amber-400/5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 pointer-events-auto animate-pulse"
          style={highlightStyle}
        />
      )}

      {/* Tooltip Card */}
      <div
        className={`fixed bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl p-6 pointer-events-auto transition-all duration-300 z-[100] ${
          isMobile 
            ? 'bottom-4 left-4 right-4 w-auto max-w-none m-0' 
            : coords.position === 'center'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px]'
            : 'w-[340px]'
        }`}
        style={
          !isMobile && coords.position !== 'center'
            ? { top: `${coords.top}px`, left: `${coords.left}px` }
            : undefined
        }
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Play className="w-4 h-4 fill-amber-400" />
            <span className="text-xs font-mono tracking-wider uppercase font-semibold">Interactive Tour</span>
          </div>
          <button 
            onClick={handleSkip} 
            className="text-slate-400 hover:text-white rounded-lg p-0.5 hover:bg-slate-800 transition-colors"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-base font-bold text-white tracking-tight mb-2">
          {step.title}
        </h4>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {step.description}
        </p>

        {coords.position === 'center' && (
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 mb-4 text-xs text-amber-300 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{step.fallbackText}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            {currentStep + 1} of {TOUR_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center justify-center p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors shadow-lg shadow-amber-500/10"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
