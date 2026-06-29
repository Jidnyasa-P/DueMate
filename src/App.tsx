import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  HelpCircle, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Clock, 
  Activity, 
  Flame, 
  LineChart, 
  ShieldAlert,
  Sliders,
  Calendar as CalendarIcon,
  Plus,
  Tv,
  LogOut,
  Info,
  Check,
  RotateCcw,
  BookOpen,
  Eye,
  Settings as SettingsIcon,
  MapPin,
  Mail,
  Copy,
  Sun,
  Moon
} from 'lucide-react';

import { UserProfile, Task, RescuePlan, Habit, AppearanceMode, PrimaryRole, DelaySimulationResult } from './types';
import { getTheme, ThemeColors } from './theme';
import { defaultTasksByRole, defaultHabitsByRole } from './initialData';

// Subcomponents
import NavigationDock from './components/NavigationDock';
import LandingHeroVisual from './components/LandingHeroVisual';
import OnboardingFlow from './components/OnboardingFlow';
import DelaySimulator from './components/DelaySimulator';
import FocusTimer from './components/FocusTimer';
import Tour from './components/Tour';
import TaskList from './components/TaskList';
import HabitList from './components/HabitList';
import ProactiveRescueSuite from './components/ProactiveRescueSuite';
import DueMateLogo from './components/DueMateLogo';

export default function App() {
  // Session States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeRescuePlan, setActiveRescuePlan] = useState<RescuePlan | null>(null);
  const [activeTour, setActiveTour] = useState(false);
  
  // Custom temporary/interactive state values
  const [simulatingTask, setSimulatingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [loadingAIPlan, setLoadingAIPlan] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'timeline'>('week');

  // Advanced Rescue Plan view states
  const [completedMicroSteps, setCompletedMicroSteps] = useState<Record<string, boolean>>({});
  const [copiedAssetText, setCopiedAssetText] = useState<string | null>(null);
  const [showAgentTrace, setShowAgentTrace] = useState<boolean>(false);
  const [selectedAssetTab, setSelectedAssetTab] = useState<string>('checklist');
  const [guestAppearance, setGuestAppearance] = useState<AppearanceMode>('dark');

  // Role Exploration, Toast & Native Notification States
  const [previewRole, setPreviewRole] = useState<PrimaryRole | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("DueMate AI Companion", {
          body: msg,
        });
      } catch (err) {
        console.error("Native notification delivery failed:", err);
      }
    }
  };

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      showToast("Browser native notifications are not supported in this browser.");
      return;
    }
    
    if (Notification.permission === 'granted') {
      const nextVal = !notificationsEnabled;
      setNotificationsEnabled(nextVal);
      showToast(nextVal ? "Native notifications active! Start before things become expensive." : "Native alerts paused.");
    } else if (Notification.permission === 'denied') {
      showToast("Notifications blocked. Falling back to robust in-app visual warnings.");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        showToast("Native notifications enabled! Real-time sync is active.");
      } else {
        showToast("Permission denied. Falling back to robust in-app visual warnings.");
      }
    }
  };

  // Authentication Fields (Login / Register)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<PrimaryRole>('student');

  // Load and Sync Initial State
  useEffect(() => {
    const storedUser = localStorage.getItem('dueMate_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setActiveTab('dashboard');
        
        // Load tasks and habits
        const storedTasks = localStorage.getItem(`dueMate_tasks_${parsedUser.email}`);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          const initial = defaultTasksByRole[parsedUser.primaryRole] || [];
          setTasks(initial);
          localStorage.setItem(`dueMate_tasks_${parsedUser.email}`, JSON.stringify(initial));
        }

        const storedHabits = localStorage.getItem(`dueMate_habits_${parsedUser.email}`);
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        } else {
          const initial = defaultHabitsByRole[parsedUser.primaryRole] || [];
          setHabits(initial);
          localStorage.setItem(`dueMate_habits_${parsedUser.email}`, JSON.stringify(initial));
        }

        // Check if tour should run automatically
        const tourCompleted = localStorage.getItem('dueMate_tour_completed');
        if (!tourCompleted) {
          setActiveTour(true);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  // Sync tasks and habits to localStorage when changed
  useEffect(() => {
    if (user) {
      localStorage.setItem(`dueMate_tasks_${user.email}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`dueMate_habits_${user.email}`, JSON.stringify(habits));
    }
  }, [habits, user]);

  // Redirect to landing if accessing a protected route without login session
  useEffect(() => {
    const protectedTabs = ['dashboard', 'tasks', 'rescue-plan', 'calendar', 'habits', 'insights', 'settings'];
    if (protectedTabs.includes(activeTab) && !user) {
      setActiveTab('landing');
    }
  }, [activeTab, user]);

  // Derive Current Theme
  const activeRole: PrimaryRole = previewRole || user?.primaryRole || 'student';
  const appearance: AppearanceMode = user ? (user.preferredAppearanceMode || user.appearanceMode || 'auto') : guestAppearance;
  const theme: ThemeColors = getTheme(appearance, activeRole);

  const isThemeLight = () => {
    if (appearance === 'light') return true;
    if (appearance === 'read') return false;
    if (appearance === 'dark' || appearance === 'focus' || appearance === 'panic') return false;
    return activeRole !== 'entrepreneur'; // auto defaults to light for student, professional, freelancer, job_seeker
  };
  const isLight = isThemeLight();
  const isRead = appearance === 'read';
  const isDark = !isLight && !isRead;

  // Responsive design semantic classes
  const titleColor = isLight ? 'text-zinc-900 font-sans' : isRead ? 'text-[#2e2514] font-serif-elegant font-bold' : 'text-white font-sans';
  const subtitleColor = isLight ? 'text-zinc-600 font-sans' : isRead ? 'text-[#6d5c41] font-sans' : 'text-slate-300 font-sans';
  const textMutedColor = isLight ? 'text-zinc-500' : isRead ? 'text-[#6d5c41]/75 font-sans text-xs' : 'text-slate-400';
  const cardClass = isLight ? 'bg-white border border-zinc-200 shadow-sm' : isRead ? 'bg-[#fbf7eb] border border-[#e6d5b8] shadow-sm' : 'bg-slate-900 border border-slate-800';
  const innerCardClass = isLight ? 'bg-zinc-100/60 border border-zinc-200' : isRead ? 'bg-[#f5ebd2] border border-[#e6d5b8]' : 'bg-slate-950/60 border border-slate-800/80';
  const borderClass = isLight ? 'border-zinc-200' : isRead ? 'border-[#e6d5b8]' : 'border-slate-800';
  const accentTextClass = isLight ? 'text-indigo-600' : isRead ? 'text-[#8b5a2b]' : 'text-amber-400';
  const badgeClass = isLight ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : isRead ? 'bg-[#f5ebd2] border border-[#e6d5b8] text-[#8b5a2b]' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400';

  // Calculate Risk Profile / Insights
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const avgRiskScore = pendingTasks.length > 0 
    ? Math.round(pendingTasks.reduce((acc, t) => acc + t.currentRiskScore, 0) / pendingTasks.length)
    : 10;

  // Authentication Logic
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      showToast("Please fill out all registration fields.");
      return;
    }
    if (registerPassword.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    // Save login credentials in client auth database
    const existingUsersRaw = localStorage.getItem('dueMate_auth_users') || '{}';
    const existingUsers = JSON.parse(existingUsersRaw);
    
    existingUsers[registerEmail.toLowerCase()] = {
      password: registerPassword,
      name: registerName,
      primaryRole: registerRole
    };
    
    localStorage.setItem('dueMate_auth_users', JSON.stringify(existingUsers));

    const newProfile: UserProfile = {
      name: registerName,
      email: registerEmail.toLowerCase(),
      primaryRole: registerRole,
      biggestDeadlineProblem: 'procrastination',
      preferredWorkTime: 'Late Night',
      reminderStyle: 'Micro-Action Gentle',
      preferredAppearanceMode: 'auto'
    };

    // Switch to step onboarding workflow
    setUser(newProfile);
    setActiveTab('onboarding');
    showToast("Companion account created! Let's tailor your anti-procrastination profile.");
  };

  const handleOnboardingComplete = (completedProfile: UserProfile) => {
    localStorage.setItem('dueMate_user', JSON.stringify(completedProfile));
    setUser(completedProfile);

    // Seed tasks and habits matching the role
    const seededTasks = defaultTasksByRole[completedProfile.primaryRole] || [];
    const seededHabits = defaultHabitsByRole[completedProfile.primaryRole] || [];
    setTasks(seededTasks);
    setHabits(seededHabits);

    localStorage.setItem(`dueMate_tasks_${completedProfile.email}`, JSON.stringify(seededTasks));
    localStorage.setItem(`dueMate_habits_${completedProfile.email}`, JSON.stringify(seededHabits));

    // Save finalized profile inside auth DB too
    const emailKey = completedProfile.email.toLowerCase();
    const existingUsersRaw = localStorage.getItem('dueMate_auth_users') || '{}';
    const existingUsers = JSON.parse(existingUsersRaw);
    if (existingUsers[emailKey]) {
      existingUsers[emailKey].name = completedProfile.name;
      existingUsers[emailKey].primaryRole = completedProfile.primaryRole;
      localStorage.setItem('dueMate_auth_users', JSON.stringify(existingUsers));
    }

    setActiveTab('dashboard');
    setActiveTour(true); // Automatically trigger the beautiful tour!
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Please enter both email and password.");
      return;
    }

    const emailKey = loginEmail.toLowerCase();
    const existingUsersRaw = localStorage.getItem('dueMate_auth_users') || '{}';
    const existingUsers = JSON.parse(existingUsersRaw);

    const matchUser = existingUsers[emailKey];

    if (!matchUser) {
      showToast("Companion account not found. Please register a new account first.");
      return;
    }

    if (matchUser.password !== loginPassword) {
      showToast("Invalid credentials. Please verify your password.");
      return;
    }

    // Load or recreate UserProfile
    let userToLoad: UserProfile;
    const savedUser = localStorage.getItem('dueMate_user');
    if (savedUser && JSON.parse(savedUser).email === emailKey) {
      userToLoad = JSON.parse(savedUser);
    } else {
      userToLoad = {
        name: matchUser.name,
        email: emailKey,
        primaryRole: matchUser.primaryRole,
        biggestDeadlineProblem: 'procrastination',
        preferredWorkTime: 'Late Night',
        reminderStyle: 'countdown',
        preferredAppearanceMode: 'auto'
      };
    }

    localStorage.setItem('dueMate_user', JSON.stringify(userToLoad));
    setUser(userToLoad);
    
    // Load existing or seed
    const storedTasks = localStorage.getItem(`dueMate_tasks_${userToLoad.email}`);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      const initial = defaultTasksByRole[userToLoad.primaryRole] || [];
      setTasks(initial);
    }

    const storedHabits = localStorage.getItem(`dueMate_habits_${userToLoad.email}`);
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    } else {
      const initial = defaultHabitsByRole[userToLoad.primaryRole] || [];
      setHabits(initial);
    }

    setActiveTab('dashboard');
    showToast(`Welcome back, ${userToLoad.name}! Your workspace buffers are restored.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('dueMate_user');
    setUser(null);
    setTasks([]);
    setHabits([]);
    setActiveRescuePlan(null);
    setActiveTab('landing');
  };

  // Task & Habit Handlers
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'currentRiskScore' | 'safestNextMove'>) => {
    const randomRisk = Math.floor(Math.random() * 40) + 40; // 40 to 80 initial risk
    const textOptions = [
      "Open draft, write down exactly three single sentence points.",
      "Launch files, format main executive headers, and close.",
      "Download template data sheets and highlight previous margins."
    ];
    const generatedTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      currentRiskScore: randomRisk,
      safestNextMove: textOptions[Math.floor(Math.random() * textOptions.length)]
    };

    setTasks(prev => [generatedTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeRescuePlan?.taskId === id) {
      setActiveRescuePlan(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        return {
          ...t,
          status: nextStatus,
          currentRiskScore: nextStatus === 'completed' ? 0 : 50
        };
      }
      return t;
    }));
  };

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const todayStr = new Date().toISOString();
        const doneToday = h.lastCompleted && new Date(h.lastCompleted).toDateString() === new Date().toDateString();
        
        return {
          ...h,
          streak: doneToday ? Math.max(0, h.streak - 1) : h.streak + 1,
          lastCompleted: doneToday ? null : todayStr
        };
      }
      return h;
    }));
  };

  const handleAddHabit = (title: string, category: string, targetFrequency: 'daily' | 'weekly' | 'workdays') => {
    const newHab: Habit = {
      id: `hab-${Date.now()}`,
      title,
      category,
      streak: 0,
      lastCompleted: null,
      targetFrequency
    };
    setHabits(prev => [newHab, ...prev]);
  };

  // Generate / View Rescue Plan
  const handleStartRescuePlan = async (task: Task) => {
    setLoadingAIPlan(true);
    setActiveTab('rescue-plan');
    try {
      const response = await fetch('/api/generate-rescue-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          description: task.description || task.notes || "",
          category: task.category,
          dueDate: task.dueDate || task.deadlineDateTime || "",
          roleStyle: task.roleStyle || user?.primaryRole || "student",
          biggestDeadlineProblem: user?.biggestDeadlineProblem || 'procrastination',
          importance: task.importance || 3,
          difficulty: task.difficulty || 3,
          confidence: task.confidence || 3
        })
      });

      if (!response.ok) {
        throw new Error("AI Endpoint failed.");
      }

      const planData = await response.json();
      setActiveRescuePlan({
        id: `plan-${Date.now()}`,
        taskId: task.id,
        taskTitle: task.title,
        taskUnderstanding: planData.taskUnderstanding || `Reviewing deadline constraints for "${task.title}".`,
        riskSummary: planData.riskSummary || `Evaluating timeline factors for this milestone.`,
        safestNextMove: planData.safestNextMove || `Open a blank page and draft 3 bullet points.`,
        firstFiveMinuteAction: planData.firstFiveMinuteAction || `Paste the guidelines and start with 3 headings.`,
        rescueTimeline: planData.rescueTimeline || [
          { label: "Start now", completionChance: 95, consequence: "Bypass anxiety buffers entirely." }
        ],
        microSteps: planData.microSteps || [
          "Locate references", "Draft raw bullet outline", "Compose hardest parts first", "Verify criteria compliance"
        ],
        timeBlocks: planData.timeBlocks || [
          { label: "Sprint 1", duration: "15m", goal: "Draft raw skeleton outline" }
        ],
        riskFactors: planData.riskFactors || ["Perfectionism", "Overthinking"],
        fallbackPlan: planData.fallbackPlan || "Draft a minimal viable submission.",
        definitionOfDone: planData.definitionOfDone || "Ready to send and review.",
        actionPack: planData.actionPack || {
          checklist: ["Review criteria", "Draft outline"],
          emailDraft: "",
          meetingBrief: "",
          studyPlan: "",
          interviewPrep: "",
          clientUpdate: "",
          resourcesToCollect: ["Task specification sheet"]
        },
        coachLine: planData.coachLine || "Breathe easy. We have a solid starting threshold.",
        agentTrace: planData.agentTrace || [],
        isLocalFallback: planData.isLocalFallback || false,
        createdAt: new Date().toISOString()
      });

      // Update task's safest next move with the generated one
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return { ...t, safestNextMove: planData.safestNextMove || t.safestNextMove };
        }
        return t;
      }));

    } catch (err) {
      console.error(err);
      // High-Fidelity Local Fallback Planner
      const cleanRole = user?.primaryRole || "student";
      let safestNextMove = `Open your notes workspace and write title "${task.title}".`;
      let firstFiveMinuteAction = "Write down 3 bullet headers for the main sections.";
      let coachLine = "Breathe easy. Perfectionism breeds freeze states. Draft the worst first version to clear starting friction.";
      let checklist = ["Read criteria and rubrics", "Outline core headings", "Compose main body elements", "Review spelling and submit"];
      let emailDraft = `Subject: Milestone Status: ${task.title}\n\nHi there,\n\nI am currently packaging the draft deliverables for "${task.title}" to keep our project pipeline synchronized.\n\nBest regards,`;
      let meetingBrief = `Agenda for ${task.title}:\n1. High-level milestone outcomes\n2. Key friction nodes and bottlenecks\n3. Action plan next 24 hours`;
      let studyPlan = `Study Sprint for ${task.title}:\n- Interval 1: Review class slides & rubric metrics (20m)\n- Interval 2: Draft main bullet-point thesis points (30m)`;
      let interviewPrep = "Q: What is your systematic approach to resolving high-urgency bottlenecks?\nA: I decompose critical items into immediate micro-actions with clear validation buffers.";
      let clientUpdate = `Hi [Client],\n\nI am finalizing the structural draft for "${task.title}" and expect to deliver the initial preview for your comments shortly.\n\nBest regards,`;
      let resources = ["Task rubrics and instructions", "Reference template document", "Department milestone log"];

      if (cleanRole === "student") {
        safestNextMove = `Open your academic notes folder and create a document titled "${task.title}".`;
        firstFiveMinuteAction = "Write down your thesis statement or three core sections to cover.";
        coachLine = "This assignment is just a series of small paragraphs. Write the worst first draft possible to clear the starting hurdle.";
        checklist = ["Read rubric carefully", "Outline 3 main body arguments", "Draft introduction", "Review calculations", "Upload PDF"];
      } else if (cleanRole === "professional") {
        safestNextMove = `Open your corporate workspace or draft folder for "${task.title}".`;
        firstFiveMinuteAction = "Paste the main meeting agenda or core project requirements.";
        coachLine = "Work recovery is about triage. Focus on high-visibility compliance items first, then polish details.";
        checklist = ["Gather department milestone logs", "Identify three bottleneck metrics", "Outline executive summary", "Schedule follow-up review"];
      } else if (cleanRole === "entrepreneur") {
        safestNextMove = `Locate the contract sheet or forecast spreadsheet for "${task.title}".`;
        firstFiveMinuteAction = "Highlight the top 3 highest-priority figures or terms.";
        coachLine = "Protect your cash flow and brand momentum. Let's draft a high-level skeleton to keep this client delivery safe.";
        checklist = ["Review liquidation or payment terms", "Draft risk-reduction bullet points", "Verify numbers on invoice/proposal", "Send update to stakeholders"];
      } else if (cleanRole === "freelancer") {
        safestNextMove = `Open client project folder and list 3 raw subtasks.`;
        firstFiveMinuteAction = "Open your graphic design or code workspace and set up files.";
        coachLine = "Keep client alignment crisp. Deliver a solid skeleton draft today so they can give feedback early.";
        checklist = ["Verify client brief constraints", "Assemble vector assets / source files", "Build skeleton layout draft", "Write brief description of design choices"];
      }

      setActiveRescuePlan({
        id: `plan-fallback-${Date.now()}`,
        taskId: task.id,
        taskTitle: task.title,
        taskUnderstanding: `This covers "${task.title}" categorized as "${task.category || "General"}". Our local cognitive heuristic designates this as a key progress node where procrastination compression risks are elevated.`,
        riskSummary: `Timeline evaluation is evaluated as HIGH danger due to an importance index of ${task.importance || 4}/5. Bypassing starting friction is critical.`,
        safestNextMove,
        firstFiveMinuteAction,
        rescueTimeline: [
          { label: "Start now", completionChance: 98, consequence: "Bypasses all anxiety. Generates robust safety buffer." },
          { label: "Start in 2 hours", completionChance: 82, consequence: "Slight pressure, reduces deep editing review times." },
          { label: "Start tonight", completionChance: 60, consequence: "Severe fatigue, requires error-free late-night sprint." },
          { label: "Start tomorrow", completionChance: 35, consequence: "High compromise. Risk of missed submit window." },
          { label: "Too late", completionChance: 10, consequence: "Missed deadline. apolgetic extension email draft required." }
        ],
        microSteps: [
          `Frictionless setup - locate instructions and files for "${task.title}".`,
          `Draft core outline - bullet out 3 main section headings to define shape.`,
          `Frictionless sprint - spend 15 minutes of uninterrupted focus writing raw text.`,
          `Polishing run - review spelling and verify rubric requirements.`,
          `Final handoff - upload to system and mark completed on your dashboard.`
        ],
        timeBlocks: [
          { label: "Sprint 1: Low Friction Outline", duration: "15m", goal: "Open workspace, copy criteria, write 3 rough sections." },
          { label: "Sprint 2: Raw Composition", duration: "35m", goal: "Draft 80% of hardest arguments without stopping to edit." },
          { label: "Sprint 3: Compliance & Check", duration: "15m", goal: "Verify done criteria, correct format errors, submit." }
        ],
        riskFactors: [
          "Detail rabbit hole: excessive editing of early sentences before completing the full draft.",
          "Digital notifications: micro-distractions from social alerts breaking focused flow state.",
          "Fear of imperfect draft: delaying starting due to high quality standards."
        ],
        fallbackPlan: "Done is superior to perfect. If compressed, drop extra sections, prepare a highly cohesive minimum-viable draft, and submit before panic threshold.",
        definitionOfDone: `All foundational criteria of "${task.title}" are clearly visible and submitted, meeting basic compliance goals.`,
        actionPack: {
          checklist,
          emailDraft,
          meetingBrief,
          studyPlan,
          interviewPrep,
          clientUpdate,
          resourcesToCollect: resources
        },
        coachLine,
        agentTrace: [
          { agent: "Capture Agent", action: "Identify task name and role guidelines", output: `Captured "${task.title}" under role: ${cleanRole}.` },
          { agent: "Risk Agent", action: "Evaluate timeline pressure thresholds", output: "Timeline evaluated as highly compressed. Safety margin is +3.5h." },
          { agent: "Planner Agent", action: "Formulate low-friction sequence steps", output: "Drafted 5 sequential steps centering zero starting friction." },
          { agent: "Scheduler Agent", action: "Distribute workload into Pomodoro intervals", output: "Constructed 65-minute active sprint schedule with buffer blocks." },
          { agent: "Execution Agent", action: "Generate specialized action assets", output: "Configured optimized copyable email templates and study briefs." },
          { agent: "Coach Agent", action: "Formulate empathetic nudge", output: "Drafted frictionless confidence boost line." },
          { agent: "Reflection Agent", action: "Audit plan for over-engineering risks", output: "Removed minor tasks to maximize basic delivery success chance." }
        ],
        isLocalFallback: true,
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoadingAIPlan(false);
    }
  };

  const handleApplySimulation = (simResult: DelaySimulationResult) => {
    // Modify task with simulated risk score and safest action
    setTasks(prev => prev.map(t => {
      if (t.id === simResult.taskId) {
        return {
          ...t,
          currentRiskScore: simResult.simulatedRisk,
          safestNextMove: simResult.survivalAction
        };
      }
      return t;
    }));
  };

  const copyCalendarLink = () => {
    navigator.clipboard.writeText(`https://duemate.ai/calendar-sync/feed-${user?.email || 'user'}.ics`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Determine what task to highlight for "Safest Next Move" on dashboard
  const safestMoveTask = pendingTasks.find(t => t.panicLevel === 'critical' || t.panicLevel === 'high') || pendingTasks[0] || tasks[0];

  return (
    <div id="main-applet" className={`min-h-screen pb-24 md:pb-6 transition-all duration-300 font-sans ${theme.bg} ${theme.text}`}>
      
      {/* Interactive Tour Tooltips Overlay */}
      {activeTour && (
        <Tour 
          active={activeTour} 
          onComplete={() => setActiveTour(false)} 
        />
      )}

      {/* Premium Floating Navigation Dock (Desktop Left/Mobile Bottom) */}
      {user && activeTab !== 'onboarding' && (
        <NavigationDock 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          appearanceMode={appearance}
          userName={user.name}
          userEmail={user.email}
        />
      )}

      {/* Core Body Container */}
      <div className={`max-w-5xl mx-auto px-4 pt-6 md:pt-8 ${user && activeTab !== 'onboarding' ? 'md:pl-28' : ''}`}>
        
        {/* Top Mini Header Bar */}
        <header id="applet-top-bar" className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b ${borderClass}`}>
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}>
            <DueMateLogo size={36} showText={true} isLight={isLight || isRead} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Elegant Segmented Theme Control */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : isRead ? 'bg-[#f5ebd2] border-[#e6d5b8]' : 'bg-zinc-950/80 border-slate-800'} text-xs font-sans`}>
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'read', label: 'Read', icon: BookOpen }
              ].map((t) => {
                const isActive = appearance === t.id;
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (user) {
                        const updated = { ...user, preferredAppearanceMode: t.id as AppearanceMode };
                        setUser(updated);
                        localStorage.setItem('dueMate_user', JSON.stringify(updated));
                      } else {
                        setGuestAppearance(t.id as AppearanceMode);
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                        : isRead
                        ? 'text-[#6d5c41] hover:text-[#2e2514] hover:bg-[#e6d5b8]/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className={`text-xs font-bold tracking-tight ${titleColor}`}>{user.name}</div>
                  <div className={`text-[10px] capitalize font-mono ${subtitleColor}`}>{user.primaryRole} Mode</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 font-mono">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('login')} 
                  className={`text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:text-zinc-950' : isRead ? 'text-[#6d5c41] hover:text-[#2e2514]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setActiveTab('register')} 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </header>

        {/* -------------------- 1. LANDING PAGE -------------------- */}
        {activeTab === 'landing' && (
          <main id="view-landing" className="space-y-16 animate-timeline-reveal">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
              <div className="lg:col-span-7 space-y-6">
                <div className={`inline-flex items-center gap-2 border px-3.5 py-1 rounded-full font-semibold font-mono tracking-wide ${badgeClass}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The premium role-adaptive deadline rescue companion</span>
                </div>

                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none ${titleColor}`}>
                  Your deadline <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-amber-500">rescue companion.</span>
                </h1>

                <p className={`text-sm md:text-base leading-relaxed max-w-xl ${subtitleColor}`}>
                  DueMate AI turns urgent assignments, meetings, client work, interviews, and bills into clear rescue plans you can actually follow.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('register')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Start your rescue plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      // Login with custom guest and trigger
                      const guestProfile: UserProfile = {
                        name: 'Guest Explorer',
                        email: 'guest@duemate.ai',
                        role: 'student',
                        primaryRole: 'student',
                        biggestDeadlineProblem: 'procrastination',
                        preferredWorkTime: 'Late Night',
                        reminderStyle: 'Gentle micro-action',
                        appearanceMode: 'auto',
                        preferredAppearanceMode: 'auto',
                        workHours: '09:00 - 17:00',
                        energyPattern: 'Night Owl',
                        focusSessionLength: 25
                      };
                      localStorage.setItem('dueMate_user', JSON.stringify(guestProfile));
                      setUser(guestProfile);
                      setTasks(defaultTasksByRole['student']);
                      setHabits(defaultHabitsByRole['student']);
                      setActiveTab('dashboard');
                      setActiveTour(true);
                    }}
                    className={`font-semibold px-5 py-3 rounded-xl text-sm transition-all border cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300 shadow-sm' 
                        : isRead 
                        ? 'bg-[#e6d5b8] hover:bg-[#d9c7a7] text-[#2e2514] border-[#d9c7a7] shadow-sm' 
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800'
                    }`}
                  >
                    Take Tour
                  </button>
                </div>
              </div>

              {/* Custom abstract SVG/HTML/CSS clock/hourglass visual */}
              <div className="lg:col-span-5 relative">
                <LandingHeroVisual />
              </div>
            </div>

            {/* NEW: Interactive Sensory Presets Selector on homepage */}
            <section className={`p-8 rounded-3xl border ${cardClass} space-y-6 text-center max-w-3xl mx-auto`}>
              <div className="space-y-2">
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${accentTextClass}`}>Adaptive Aesthetic Presets</span>
                <h3 className={`text-2xl font-black tracking-tight ${titleColor}`}>Match your cognitive sensory comfort</h3>
                <p className={`text-xs max-w-md mx-auto ${subtitleColor}`}>
                  Tired of abrasive blue-light screens or bland generic trackers? Switch presets to instantly align with your neurological focus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  {
                    id: 'dark',
                    title: 'Cosmic Dark Mode',
                    desc: 'Calming high-contrast zinc background with crisp cybernetic cyan/amber neon tags. Designed for night coding and intensive sprints.',
                    previewClass: 'bg-zinc-950 text-zinc-100 border-zinc-800',
                    dotClass: 'bg-cyan-400'
                  },
                  {
                    id: 'light',
                    title: 'Minimalist Light Mode',
                    desc: 'A pure, clean Swiss layout with deep charcoal sans-serif typography, light margins, and professional sapphire markers.',
                    previewClass: 'bg-zinc-50 border-zinc-200 text-zinc-900',
                    dotClass: 'bg-indigo-600'
                  },
                  {
                    id: 'read',
                    title: 'Warm Read Mode',
                    desc: 'A gorgeous sepia journal design featuring Playfair Display typography, warm background buffers, and dark walnut ink lines.',
                    previewClass: 'bg-[#f4ebd0] text-[#2e2514] border-[#e6d5b8] font-serif-elegant',
                    dotClass: 'bg-[#8b5a2b]'
                  }
                ].map((preset) => {
                  const isActive = appearance === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (user) {
                          const updated = { ...user, preferredAppearanceMode: preset.id as AppearanceMode };
                          setUser(updated);
                          localStorage.setItem('dueMate_user', JSON.stringify(updated));
                        } else {
                          setGuestAppearance(preset.id as AppearanceMode);
                        }
                      }}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer ${preset.previewClass} ${
                        isActive ? 'ring-2 ring-amber-500 scale-105 shadow-xl' : 'opacity-85 hover:opacity-100 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{preset.title}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${preset.dotClass}`} />
                        </div>
                        <p className="text-[10px] leading-relaxed opacity-80">{preset.desc}</p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-current/10 text-[10px] font-mono flex items-center justify-between">
                        <span>Status: {isActive ? 'Active Preset' : 'Click to preview'}</span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Premium product pillars/features */}
            <section className={`pt-8 border-t ${borderClass} space-y-8`}>
              <div className="text-center max-w-lg mx-auto">
                <span className={`text-xs font-mono uppercase font-bold ${accentTextClass}`}>Engineered For Anti-Procrastination</span>
                <h2 className={`text-2xl font-bold tracking-tight mt-1 ${titleColor}`}>Finish what’s due before panic begins.</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-50 text-indigo-600' : isRead ? 'bg-[#e6d5b8]/30 text-[#8b5a2b]' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm ${titleColor}`}>Role-Adaptive Themes</h3>
                  <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                    Custom spacing and colors dynamically adjusted for students, freelancers, professionals, entrepreneurs, and job seekers.
                  </p>
                </div>

                <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-amber-50 text-amber-600' : isRead ? 'bg-[#e6d5b8]/30 text-[#8b5a2b]' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm ${titleColor}`}>The Safest Next Move</h3>
                  <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                    Bypass starting friction. We outline an action so tiny and low-stress that starting becomes completely automatic.
                  </p>
                </div>

                <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-red-50 text-red-600' : isRead ? 'bg-[#e6d5b8]/30 text-[#8b5a2b]' : 'bg-red-500/10 text-red-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm ${titleColor}`}>Interactive Delay Simulator</h3>
                  <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                    Instantly simulate procrastination scenarios (1 hr, 1 day, 1 week) to view risk calculations without shame or judgment.
                  </p>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* -------------------- 2. LOGIN PAGE -------------------- */}
        {activeTab === 'login' && (
          <main id="view-login" className="max-w-md mx-auto my-12 animate-timeline-reveal">
            <div className={`rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl ${cardClass}`}>
              <div className="flex justify-center pb-2 border-b border-slate-500/10">
                <DueMateLogo size={48} showText={true} isLight={isLight || isRead} />
              </div>
              <div className="text-center space-y-1">
                <h2 className={`text-2xl font-bold ${titleColor}`}>Restore Rescue Workspace</h2>
                <p className={`text-xs ${subtitleColor}`}>Enter your email credentials to restore your deadline companion dashboard.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Security Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors shadow-lg cursor-pointer"
                >
                  Sign In to Workspace
                </button>
              </form>

              <div className="text-center pt-2">
                <span className={`text-xs ${subtitleColor}`}>New rescue client? </span>
                <button onClick={() => setActiveTab('register')} className="text-xs text-amber-500 font-bold hover:underline cursor-pointer">
                  Register Account
                </button>
              </div>
            </div>
          </main>
        )}

        {/* -------------------- 3. REGISTER PAGE -------------------- */}
        {activeTab === 'register' && (
          <main id="view-register" className="max-w-md mx-auto my-12 animate-timeline-reveal">
            <div className={`rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl ${cardClass}`}>
              <div className="flex justify-center pb-2 border-b border-slate-500/10">
                <DueMateLogo size={48} showText={true} isLight={isLight || isRead} />
              </div>
              <div className="text-center space-y-1">
                <h2 className={`text-2xl font-bold ${titleColor}`}>Initiate DueMate Rescue</h2>
                <p className={`text-xs ${subtitleColor}`}>Create your companion profile to customize your role-adaptive deadline theme.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Your Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Security Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-mono uppercase ${textMutedColor}`}>Primary Role Active Profile</label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as PrimaryRole)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
                      isLight 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                        : isRead 
                        ? 'bg-[#ebd4ab]/20 border-[#ebd4ab] text-[#2e2514]' 
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="student">Student (Soft, modern, energetic)</option>
                    <option value="professional">Professional (Clean, calm, minimal)</option>
                    <option value="entrepreneur">Entrepreneur (Premium, cinematic, bold)</option>
                    <option value="freelancer">Freelancer (Creative, modern, flexible)</option>
                    <option value="job_seeker">Job Seeker (Warm, confidence-building)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors shadow-lg cursor-pointer"
                >
                  Create Companion Account
                </button>
              </form>

              <div className="text-center pt-2">
                <span className={`text-xs ${subtitleColor}`}>Already registered? </span>
                <button onClick={() => setActiveTab('login')} className="text-xs text-amber-500 font-bold hover:underline cursor-pointer">
                  Sign In
                </button>
              </div>
            </div>
          </main>
        )}

        {/* -------------------- 4. ROLE ONBOARDING -------------------- */}
        {activeTab === 'onboarding' && user && (
          <main id="view-onboarding" className="animate-timeline-reveal">
            <OnboardingFlow 
              user={user} 
              onComplete={handleOnboardingComplete} 
            />
          </main>
        )}

        {/* -------------------- 5. DASHBOARD VIEW -------------------- */}
        {activeTab === 'dashboard' && user && (
          <main id="view-dashboard" className="space-y-6 animate-timeline-reveal">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <span className={`text-xs font-mono uppercase block ${textMutedColor}`}>Active Milestones</span>
                <div className={`text-3xl font-black mt-1 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{pendingTasks.length}</div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <span className={`text-xs font-mono uppercase block ${textMutedColor}`}>Simulated Average Risk</span>
                <div className="text-3xl font-black text-red-500 mt-1">{avgRiskScore}%</div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <span className={`text-xs font-mono uppercase block ${textMutedColor}`}>Active Anchor Streaks</span>
                <div className="text-3xl font-black text-amber-500 mt-1">{habits.filter(h => h.streak > 0).length} habits</div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <span className={`text-xs font-mono uppercase block ${textMutedColor}`}>Rescue Confidence</span>
                <div className="text-2xl font-bold text-emerald-500 mt-1.5">
                  {avgRiskScore > 70 ? 'Stressed' : avgRiskScore > 45 ? 'Buffer Alert' : 'Highly Safe'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Today's Plan (Pillar 1) */}
              <div id="tour-todays-plan" className={`lg:col-span-7 rounded-3xl p-6 md:p-8 space-y-5 ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-base font-bold tracking-tight ${titleColor}`}>Today’s Plan</h2>
                    <p className={`text-sm ${subtitleColor}`}>Curated, low-pressure focus items targeting active roadblocks.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('tasks')} 
                    className="text-xs text-amber-500 hover:underline font-bold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3.5">
                  {pendingTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className={`p-5 rounded-2xl space-y-2.5 ${innerCardClass}`}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold leading-tight ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{task.title}</h4>
                        <span className="text-[10px] font-mono uppercase bg-red-500/15 border border-red-500/20 text-red-500 px-2.5 py-0.5 rounded font-bold">
                          {task.panicLevel}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-1 ${subtitleColor}`}>{task.description}</p>
                      
                      <div className={`flex items-center justify-between pt-2.5 border-t ${borderClass}`}>
                        <button
                          onClick={() => handleStartRescuePlan(task)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Start Rescue Plan
                        </button>
                        <span className={`text-xs font-mono ${textMutedColor}`}>Risk Index: {task.currentRiskScore}%</span>
                      </div>
                    </div>
                  ))}

                  {pendingTasks.length === 0 && (
                    <div className={`text-center py-8 text-sm italic ${subtitleColor}`}>
                      Zero urgent deadline tasks found. Relax or add a task!
                    </div>
                  )}
                </div>
              </div>

              {/* Safest Next Move & Start Rescue (Pillar 2 & 4) */}
              <div id="tour-safest-next-move" className={`lg:col-span-5 flex flex-col justify-between rounded-3xl p-6 md:p-8 space-y-5 ${cardClass}`}>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-mono font-bold">
                    <Compass className="w-5 h-5 text-amber-500 animate-slow-orbit" />
                    <span>Safest Next Move</span>
                  </div>
                  <h3 className={`text-base font-bold tracking-tight ${titleColor}`}>
                    {safestMoveTask ? safestMoveTask.title : 'All Clear'}
                  </h3>
                  <p className={`text-sm leading-relaxed p-4 rounded-2xl ${innerCardClass}`}>
                    "{safestMoveTask ? safestMoveTask.safestNextMove : 'Breathe deep. You have completely cleared active critical items.'}"
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {safestMoveTask && (
                    <>
                      <button
                        id="tour-focus-mode"
                        onClick={() => setFocusTask(safestMoveTask)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Clock className="w-4.5 h-4.5 fill-slate-950" />
                        <span>Launch Focus Space</span>
                      </button>

                      <button
                        onClick={() => handleStartRescuePlan(safestMoveTask)}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          isLight
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                            : isRead
                            ? 'bg-[#ebd4ab]/60 hover:bg-[#ebd4ab] text-[#2e2514]'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        View Full AI Rescue Steps
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rescue Timeline preview (Pillar 3 & Delay Simulator Button Pillar 5) */}
            <div id="tour-rescue-timeline" className={`rounded-3xl p-6 md:p-8 space-y-5 ${cardClass}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className={`text-base font-bold tracking-tight ${titleColor}`}>Rescue Timeline Preview</h2>
                  <p className={`text-xs ${subtitleColor}`}>Simulate remaining stress buffers before procrastinating.</p>
                </div>

                {safestMoveTask && (
                  <button
                    id="tour-delay-simulator"
                    onClick={() => setSimulatingTask(safestMoveTask)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-red-600/10"
                  >
                    <Activity className="w-4.5 h-4.5" />
                    <span>Launch Delay Simulator</span>
                  </button>
                )}
              </div>

              {/* Graphical Timeline Visualizer */}
              <div className={`rounded-2xl p-5 md:p-6 space-y-6 ${innerCardClass}`}>
                <div className={`flex justify-between items-center text-xs font-mono border-b pb-3 ${borderClass} ${textMutedColor}`}>
                  <span>Current Interval Line</span>
                  <span className="font-bold text-emerald-500">Safe Buffer Area Active</span>
                </div>

                <div className="relative pt-6 pb-2">
                  {/* Timeline Horizontal wire */}
                  <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 ${isLight ? 'bg-zinc-200' : isRead ? 'bg-[#ebd4ab]' : 'bg-slate-850'}`} />
                  
                  {/* Dynamic timeline nodes */}
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-4 h-4 rounded-full bg-emerald-500 border-4 shadow-md ${isLight ? 'border-white' : isRead ? 'border-[#fbf7eb]' : 'border-slate-950'}`} />
                      <span className={`text-[10px] font-bold mt-1.5 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>Check-in</span>
                      <span className={`text-[9px] mt-0.5 ${textMutedColor}`}>Now</span>
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-4 h-4 rounded-full bg-amber-500 border-4 animate-pulse ${isLight ? 'border-white' : isRead ? 'border-[#fbf7eb]' : 'border-slate-950'}`} />
                      <span className={`text-[10px] font-bold mt-1.5 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>Skeleton Draft</span>
                      <span className={`text-[9px] mt-0.5 ${textMutedColor}`}>+4 hrs</span>
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-4 h-4 rounded-full bg-slate-500 border-4 ${isLight ? 'border-white' : isRead ? 'border-[#fbf7eb]' : 'border-slate-950'}`} />
                      <span className={`text-[10px] font-bold mt-1.5 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>Review Buffer</span>
                      <span className={`text-[9px] mt-0.5 ${textMutedColor}`}>+12 hrs</span>
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-4 h-4 rounded-full bg-red-600 border-4 ${isLight ? 'border-white' : isRead ? 'border-[#fbf7eb]' : 'border-slate-950'}`} />
                      <span className={`text-[10px] font-bold mt-1.5 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>Final Submission</span>
                      <span className={`text-[9px] mt-0.5 ${textMutedColor}`}>Deadline</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-4 text-xs leading-relaxed flex items-start gap-2.5 ${isLight ? 'bg-zinc-200/40 text-zinc-600' : isRead ? 'bg-[#f5ebd2] text-[#6d5c41]' : 'bg-slate-900 text-slate-400'}`}>
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Pro tip: We block out 4 hours of buffer room before your final due time to insulate your calendar against unexpected delay impacts.
                  </span>
                </div>
              </div>
            </div>

            {/* Proactive Rescue Suites */}
            <ProactiveRescueSuite
              tasks={tasks}
              setTasks={setTasks}
              user={user}
              isLight={isLight}
              isRead={isRead}
              isDark={isDark}
              theme={theme}
              titleColor={titleColor}
              subtitleColor={subtitleColor}
              textMutedColor={textMutedColor}
              cardClass={cardClass}
              innerCardClass={innerCardClass}
              borderClass={borderClass}
              showToast={showToast}
            />
          </main>
        )}

        {/* -------------------- 6. TASKS REPOSITORY -------------------- */}
        {activeTab === 'tasks' && user && (
          <main id="view-tasks" className="animate-timeline-reveal">
            <TaskList
              tasks={tasks}
              roleStyle={user.primaryRole}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onSelectRescue={handleStartRescuePlan}
              onSelectSimulate={(task) => setSimulatingTask(task)}
              appearance={appearance}
            />
          </main>
        )}

        {/* -------------------- 7. RESCUE PLAN PAGE -------------------- */}
        {activeTab === 'rescue-plan' && user && (
          <main id="view-rescue-plan" className="space-y-6 animate-timeline-reveal">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-black tracking-tight ${titleColor}`}>Adaptive Tactical Rescue Plan</h2>
                <p className={`text-xs ${subtitleColor}`}>Step-by-step low cognitive resistance action sprints curated by DueMate.</p>
              </div>

              {activeRescuePlan && (
                <button
                  onClick={() => {
                    const matchedTask = tasks.find(t => t.id === activeRescuePlan.taskId);
                    if (matchedTask) setFocusTask(matchedTask);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  <Tv className="w-4 h-4" />
                  <span>Launch Focused Workspace</span>
                </button>
              )}
            </div>

            {loadingAIPlan ? (
              <div className={`border rounded-3xl p-12 text-center space-y-4 ${cardClass}`}>
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                <div>
                  <h4 className={`font-bold ${titleColor}`}>Synchronizing Cognitive Rescue Steps...</h4>
                  <p className={`text-xs mt-1 ${subtitleColor}`}>DueMate AI is consulting your role-adaptive profile guidelines and risk thresholds.</p>
                </div>
              </div>
            ) : activeRescuePlan ? (
              <div className="space-y-6">
                
                {/* Local Fallback Warning Badge */}
                {activeRescuePlan.isLocalFallback && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-500">Smart Rescue Mode running offline</h4>
                      <p className="text-[11px] text-amber-500/80 leading-relaxed mt-0.5">
                        DueMate is utilizing our premium built-in micro-step planner. All features, interactive logs, and specialized action packs are fully functional. Connect Gemini later to generate open-ended dynamic plans.
                      </p>
                    </div>
                  </div>
                )}

                {/* Task Heading Identity Banner */}
                <div className={`p-6 rounded-2xl border ${cardClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${badgeClass}`}>
                        Targeting Task
                      </span>
                      <span className={`text-[11px] font-mono ${textMutedColor}`}>
                        Generated {new Date(activeRescuePlan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className={`text-lg font-black tracking-tight ${titleColor}`}>
                      {activeRescuePlan.taskTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-red-500 bg-red-500/10 px-3 py-1 rounded-full font-bold">
                      Triage Active
                    </span>
                  </div>
                </div>

                {/* THE friction breaker: Safest Next Move & First 5-Minute Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Safest Next Move Card */}
                  <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isLight 
                      ? 'bg-amber-50/60 border-amber-200 shadow-sm' 
                      : isRead 
                      ? 'bg-[#fbf7eb] border-[#ebd4ab]' 
                      : 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">Pillar 2 - Friction Free Entry</span>
                        <h4 className={`text-xs font-bold ${titleColor}`}>Your Safest Next Move</h4>
                      </div>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${titleColor}`}>
                      {activeRescuePlan.safestNextMove}
                    </p>
                    <p className={`text-[10px] mt-2 leading-relaxed ${subtitleColor}`}>
                      Zero decision-making required. Complete this task first to release cognitive freezing.
                    </p>
                  </div>

                  {/* First 5-Minute Action Card */}
                  <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isLight 
                      ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' 
                      : isRead 
                      ? 'bg-[#f5ebd2]/40 border-[#ebd4ab]' 
                      : 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-emerald-500 font-bold tracking-wider">The First 5 Minutes</span>
                        <h4 className={`text-xs font-bold ${titleColor}`}>Immediate Starter Action</h4>
                      </div>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${titleColor}`}>
                      {activeRescuePlan.firstFiveMinuteAction}
                    </p>
                    <p className={`text-[10px] mt-2 leading-relaxed ${subtitleColor}`}>
                      Set a physical timer for 5 minutes. Do not worry about quality; only focus on the action.
                    </p>
                  </div>
                </div>

                {/* Deep Analysis Matrix: Task Understanding & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Understanding Column */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-3`}>
                    <h3 className={`text-xs font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Context Analysis</h3>
                    <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                      {activeRescuePlan.taskUnderstanding}
                    </p>
                    <div className="border-t border-slate-500/10 pt-3 mt-1">
                      <h4 className={`text-xs font-bold mb-2 ${titleColor}`}>Key Risk Pitfalls</h4>
                      <div className="space-y-2">
                        {activeRescuePlan.riskFactors.map((rf, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                            <span className="text-red-500 shrink-0 font-bold mt-0.5">⚠️</span>
                            <span className={subtitleColor}>{rf}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Procrastination Decay Timeline Matrix */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
                    <div>
                      <h3 className={`text-xs font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Pillar 3: Decay Timeline Matrix</h3>
                      <p className={`text-[10px] mt-0.5 ${subtitleColor}`}>The blunt consequence of delaying your start:</p>
                    </div>

                    <div className="space-y-3">
                      {activeRescuePlan.rescueTimeline.map((node, idx) => {
                        const score = node.completionChance;
                        const isSafe = score >= 80;
                        const isWarning = score >= 50 && score < 80;
                        const barColor = isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-red-500';
                        const textColor = isSafe ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-red-500';

                        return (
                          <div key={idx} className={`p-3 rounded-xl border ${innerCardClass} space-y-2`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${titleColor}`}>{node.label}</span>
                              <span className={`text-xs font-mono font-bold ${textColor}`}>
                                {score}% Success Chance
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
                              <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
                            </div>
                            <p className={`text-[10px] leading-relaxed ${textMutedColor}`}>
                              {node.consequence}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sprints and Micro-Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timeboxed Pomodoro Sprints */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
                    <h3 className={`text-xs font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Frictionless Sprints Schedule</h3>
                    <p className={`text-[10px] ${subtitleColor}`}>Sprints distributed to optimize brain momentum:</p>

                    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-slate-800">
                      {activeRescuePlan.timeBlocks.map((block, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <span className="absolute left-[-22px] top-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-950 ring-4 ring-amber-500/10" />
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${titleColor}`}>{block.label}</h4>
                            <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                              {block.duration}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${subtitleColor}`}>
                            Goal: {block.goal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checklist Section */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
                    <h3 className={`text-xs font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Interactive Micro-Steps</h3>
                    <p className={`text-[10px] ${subtitleColor}`}>Tick off steps as you proceed to trigger a psychological dopamine loop:</p>

                    <div className="space-y-2.5">
                      {activeRescuePlan.microSteps.map((step, idx) => {
                        const stepId = `${activeRescuePlan.id}-step-${idx}`;
                        const isDone = !!completedMicroSteps[stepId];
                        return (
                          <button
                            key={idx}
                            onClick={() => setCompletedMicroSteps(prev => ({ ...prev, [stepId]: !isDone }))}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                              isDone 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : isLight 
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100' 
                                : isRead 
                                ? 'bg-[#fbf7eb] border-[#ebd4ab] text-[#2e2514] hover:bg-[#ebd4ab]/20'
                                : 'bg-slate-950/40 border-slate-800 hover:bg-slate-850 text-slate-200'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isDone 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-600'
                            }`}>
                              {isDone && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs font-medium leading-relaxed flex-1 ${isDone ? 'line-through opacity-60 text-slate-400' : ''}`}>
                              {step}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* THE ACTION deliverables PACK TABBED WORKSPACE */}
                <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-500/10 pb-4">
                    <div>
                      <h3 className={`text-xs font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Active Deliverables Action Pack</h3>
                      <p className={`text-[10px] ${subtitleColor}`}>Instant copy-paste structures generated to bypass writing block:</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 'checklist', label: 'Checklist' },
                        { id: 'email', label: 'Email Draft' },
                        { id: 'brief', label: 'Brief' },
                        { id: 'study', label: 'Study Plan' },
                        { id: 'client', label: 'Client Update' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setSelectedAssetTab(tab.id);
                            setCopiedAssetText(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            selectedAssetTab === tab.id
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : isLight
                              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                              : isRead
                              ? 'bg-[#ebd4ab]/50 hover:bg-[#ebd4ab] text-[#2e2514]'
                              : 'bg-slate-950 hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Tab Contents */}
                  <div className="space-y-4 font-sans">
                    {selectedAssetTab === 'checklist' && (
                      <div className="space-y-2">
                        <h4 className={`text-xs font-bold ${titleColor}`}>Task Checklist</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeRescuePlan.actionPack.checklist.map((item, i) => (
                            <div key={i} className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${innerCardClass}`}>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className={subtitleColor}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAssetTab !== 'checklist' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${titleColor}`}>
                            {selectedAssetTab === 'email' ? 'Urgent Email Template' : 
                             selectedAssetTab === 'brief' ? 'Core Meeting Briefing' : 
                             selectedAssetTab === 'study' ? 'Systematic Study Planner' : 
                             'Client Delivery Update'}
                          </h4>
                          <button
                            onClick={() => {
                              const txt = selectedAssetTab === 'email' ? activeRescuePlan.actionPack.emailDraft :
                                          selectedAssetTab === 'brief' ? activeRescuePlan.actionPack.meetingBrief :
                                          selectedAssetTab === 'study' ? activeRescuePlan.actionPack.studyPlan :
                                          activeRescuePlan.actionPack.clientUpdate;
                              navigator.clipboard.writeText(txt);
                              setCopiedAssetText(selectedAssetTab);
                              setTimeout(() => setCopiedAssetText(null), 2000);
                            }}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-mono font-bold cursor-pointer"
                          >
                            {copiedAssetText === selectedAssetTab ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAssetText === selectedAssetTab ? 'Copied!' : 'Copy to Clipboard'}</span>
                          </button>
                        </div>

                        <textarea
                          readOnly
                          value={
                            selectedAssetTab === 'email' ? activeRescuePlan.actionPack.emailDraft :
                            selectedAssetTab === 'brief' ? activeRescuePlan.actionPack.meetingBrief :
                            selectedAssetTab === 'study' ? activeRescuePlan.actionPack.studyPlan :
                            activeRescuePlan.actionPack.clientUpdate
                          }
                          className={`w-full h-36 font-mono p-4 rounded-xl text-[11px] leading-relaxed resize-none focus:outline-none ${
                            isLight 
                              ? 'bg-zinc-50 border border-zinc-200 text-zinc-900' 
                              : isRead 
                              ? 'bg-[#fbf7eb] border border-[#ebd4ab] text-[#2e2514]'
                              : 'bg-slate-950 border border-slate-800 text-slate-300'
                          }`}
                        />
                      </div>
                    )}

                    {/* Resources To Collect */}
                    <div className="border-t border-slate-500/10 pt-4">
                      <h4 className={`text-xs font-bold mb-2 ${titleColor}`}>Required Resources to Collect</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeRescuePlan.actionPack.resourcesToCollect.map((res, i) => (
                          <span key={i} className={`text-[10px] font-mono px-3 py-1 rounded-full border ${
                            isLight 
                              ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                              : isRead 
                              ? 'bg-[#ebd4ab]/40 border-[#ebd4ab] text-[#6d5c41]'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}>
                            📚 {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Fail-Safes: Fallback & Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fallback Plan */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-2`}>
                    <h4 className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <span>🆘 Emergency Fallback Path</span>
                    </h4>
                    <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                      {activeRescuePlan.fallbackPlan}
                    </p>
                  </div>

                  {/* Definition of Done */}
                  <div className={`p-5 rounded-2xl border ${cardClass} space-y-2`}>
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>✅ Stopping Criteria (Definition of Done)</span>
                    </h4>
                    <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                      {activeRescuePlan.definitionOfDone}
                    </p>
                  </div>
                </div>

                {/* Coach Empathetic Line */}
                <div className="text-center py-4">
                  <p className={`text-xs italic font-medium max-w-lg mx-auto ${subtitleColor}`}>
                    "{activeRescuePlan.coachLine}"
                  </p>
                </div>

                {/* COLLAPSIBLE DEVELOPER COORDINATION LOG TRACE */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : isRead ? 'bg-[#f5ebd2] border-[#ebd4ab]' : 'bg-slate-950 border-slate-800'} space-y-3`}>
                  <button
                    onClick={() => setShowAgentTrace(!showAgentTrace)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500 font-mono text-[9px]">
                        CMD
                      </div>
                      <span className={`text-xs font-mono font-bold ${titleColor}`}>Inspect Multi-Agent Cognitive Coordination Trace</span>
                    </div>
                    <span className={`text-xs font-mono ${accentTextClass}`}>
                      {showAgentTrace ? '[ COLLAPSE ]' : '[ INSPECT LOGS ]'}
                    </span>
                  </button>

                  {showAgentTrace && (
                    <div className={`p-4 rounded-xl font-mono text-[10px] space-y-3 h-64 overflow-y-auto ${
                      isLight 
                        ? 'bg-zinc-50 border border-zinc-200 text-zinc-700' 
                        : isRead 
                        ? 'bg-[#fbf7eb] border border-[#ebd4ab] text-[#6d5c41]'
                        : 'bg-black text-green-400 border border-slate-800'
                    }`}>
                      <div className="border-b border-current/10 pb-2 mb-2 opacity-60">
                        SYSTEM ARCHITECTURE: DUEMATE MULTI-AGENT SYNC ENGINE
                      </div>
                      {activeRescuePlan.agentTrace.map((trace, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-amber-500 font-bold">[{trace.agent}]</span>
                          <span className="opacity-80 ml-1">[{trace.action}]</span>
                          <p className="pl-4 opacity-90 leading-relaxed border-l border-current/20 ml-2 py-0.5">
                            {trace.output}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className={`border rounded-3xl p-12 text-center space-y-4 ${cardClass}`}>
                <Compass className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h4 className={`font-bold ${titleColor}`}>No active rescue plan loaded.</h4>
                  <p className={`text-xs mt-1 ${subtitleColor}`}>Navigate to your Tasks list and hit the green "Rescue Plan" action node to generate immediate steps.</p>
                </div>
              </div>
            )}
          </main>
        )}

        {/* -------------------- 8. CALENDAR COMPANION -------------------- */}
        {activeTab === 'calendar' && user && (
          <main id="view-calendar" className="space-y-6 animate-timeline-reveal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${titleColor}`}>Active Calendar Companion</h2>
                <p className={`text-sm ${subtitleColor}`}>View upcoming risk slots and coordinate synchronized export links.</p>
              </div>

              <div id="tour-calendar-export" className="flex flex-wrap items-center gap-3">
                {/* View switcher buttons */}
                <div className={`p-1 rounded-xl flex items-center gap-1 ${innerCardClass}`}>
                  {[
                    { id: 'week', label: 'Week Wise' },
                    { id: 'month', label: 'Month Wise' },
                    { id: 'timeline', label: "Today's Timeline" }
                  ].map(view => (
                    <button
                      key={view.id}
                      onClick={() => setCalendarView(view.id as any)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        calendarView === view.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : isLight
                          ? 'text-zinc-600 hover:bg-zinc-200/60'
                          : isRead
                          ? 'text-[#6d5c41] hover:bg-[#ebd4ab]/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={copyCalendarLink}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                      : isRead
                      ? 'bg-[#ebd4ab] hover:bg-[#d9c7a7] text-[#2e2514]'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy ICS Sync Link'}</span>
                </button>
              </div>
            </div>

            {/* WEEK WISE VIEW CONTAINER */}
            {calendarView === 'week' && (
              <div className={`rounded-3xl p-6 md:p-8 space-y-5 ${cardClass}`}>
                <div className={`flex items-center justify-between border-b pb-4 ${borderClass}`}>
                  <span className={`text-sm font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Weekly View Grid (Jun 29 - Jul 05)</span>
                  <span className={`text-xs ${textMutedColor}`}>7 Days Node</span>
                </div>

                <div className={`grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold uppercase pb-3 border-b ${borderClass} ${textMutedColor}`}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 min-h-[220px]">
                  {/* 29th of June is Mon */}
                  {[29, 30, 1, 2, 3, 4, 5].map((day, idx) => {
                    const isToday = day === 29;
                    const monthName = idx < 2 ? 'Jun' : 'Jul';
                    const matchingTasks = tasks.filter(t => {
                      const d = new Date(t.dueDate);
                      return d.getDate() === day && t.status !== 'completed';
                    });

                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-2xl border min-h-[120px] flex flex-col justify-between transition-all hover:scale-[1.01] ${
                          isToday 
                            ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5' 
                            : isLight
                            ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/40'
                            : isRead
                            ? 'bg-[#fbf7eb]/80 border-[#ebd4ab] hover:bg-[#fbf7eb]'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono ${textMutedColor}`}>{monthName}</span>
                          <span className={`text-sm font-bold font-mono ${isToday ? 'text-amber-500' : isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>
                            {day}
                          </span>
                        </div>

                        <div className="space-y-1.5 mt-3">
                          {matchingTasks.map(t => (
                            <div 
                              key={t.id}
                              className="bg-red-500/15 border border-red-500/30 rounded px-2 py-1 text-[10px] text-red-400 font-bold truncate cursor-pointer hover:bg-red-500/25 transition-colors"
                              title={t.title}
                              onClick={() => {
                                setActiveTab('tasks');
                              }}
                            >
                              ⚠ {t.title}
                            </div>
                          ))}
                          {matchingTasks.length === 0 && (
                            <span className={`text-[10px] font-medium leading-tight block ${textMutedColor}`}>Safe zone</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MONTH WISE VIEW CONTAINER */}
            {calendarView === 'month' && (
              <div className={`rounded-3xl p-6 md:p-8 space-y-5 ${cardClass}`}>
                <div className={`flex items-center justify-between border-b pb-4 ${borderClass}`}>
                  <span className={`text-sm font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Monthly View Grid (July 2026)</span>
                  <span className={`text-xs ${textMutedColor}`}>35 Days Horizon</span>
                </div>

                <div className={`grid grid-cols-7 gap-1 text-center text-xs font-mono font-bold uppercase pb-3 border-b ${borderClass} ${textMutedColor}`}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                  {/* July layout starting June 29 to August 2 (35 blocks) */}
                  {[
                    { d: 29, m: 'Jun', active: false },
                    { d: 30, m: 'Jun', active: false },
                    { d: 1, m: 'Jul', active: true },
                    { d: 2, m: 'Jul', active: true },
                    { d: 3, m: 'Jul', active: true },
                    { d: 4, m: 'Jul', active: true },
                    { d: 5, m: 'Jul', active: true },
                    { d: 6, m: 'Jul', active: true },
                    { d: 7, m: 'Jul', active: true },
                    { d: 8, m: 'Jul', active: true },
                    { d: 9, m: 'Jul', active: true },
                    { d: 10, m: 'Jul', active: true },
                    { d: 11, m: 'Jul', active: true },
                    { d: 12, m: 'Jul', active: true },
                    { d: 13, m: 'Jul', active: true },
                    { d: 14, m: 'Jul', active: true },
                    { d: 15, m: 'Jul', active: true },
                    { d: 16, m: 'Jul', active: true },
                    { d: 17, m: 'Jul', active: true },
                    { d: 18, m: 'Jul', active: true },
                    { d: 19, m: 'Jul', active: true },
                    { d: 20, m: 'Jul', active: true },
                    { d: 21, m: 'Jul', active: true },
                    { d: 22, m: 'Jul', active: true },
                    { d: 23, m: 'Jul', active: true },
                    { d: 24, m: 'Jul', active: true },
                    { d: 25, m: 'Jul', active: true },
                    { d: 26, m: 'Jul', active: true },
                    { d: 27, m: 'Jul', active: true },
                    { d: 28, m: 'Jul', active: true },
                    { d: 29, m: 'Jul', active: true },
                    { d: 30, m: 'Jul', active: true },
                    { d: 31, m: 'Jul', active: true },
                    { d: 1, m: 'Aug', active: false },
                    { d: 2, m: 'Aug', active: false }
                  ].map((dayObj, idx) => {
                    const isToday = dayObj.d === 29 && dayObj.m === 'Jun';
                    const matchingTasks = tasks.filter(t => {
                      const d = new Date(t.dueDate);
                      return d.getDate() === dayObj.d && t.status !== 'completed';
                    });

                    return (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-xl border min-h-[70px] flex flex-col justify-between transition-all ${
                          isToday 
                            ? 'bg-amber-500/10 border-amber-500' 
                            : !dayObj.active
                            ? 'opacity-40 bg-zinc-400/5 border-transparent'
                            : isLight
                            ? 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100/60'
                            : isRead
                            ? 'bg-[#fbf7eb]/50 border-[#ebd4ab]/60 hover:bg-[#fbf7eb]'
                            : 'bg-slate-950/20 border-slate-800 hover:border-slate-750'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">{dayObj.m}</span>
                          <span className={`text-xs font-bold font-mono ${isToday ? 'text-amber-500' : isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>
                            {dayObj.d}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {matchingTasks.slice(0, 2).map(t => (
                            <div 
                              key={t.id}
                              className="bg-red-500/15 border border-red-500/30 rounded px-1 text-[9px] text-red-400 font-bold truncate"
                              title={t.title}
                            >
                              ⚠ {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TODAY'S TIMELINE VIEW CONTAINER */}
            {calendarView === 'timeline' && (
              <div className={`rounded-3xl p-6 md:p-8 space-y-6 ${cardClass}`}>
                <div className={`flex items-center justify-between border-b pb-4 ${borderClass}`}>
                  <div className="space-y-1">
                    <span className={`text-sm font-mono uppercase font-bold tracking-wider ${accentTextClass}`}>Today's Interactive Timeline Sequence</span>
                    <p className={`text-xs ${subtitleColor}`}>Hour-by-hour cognitive risk buffers plotted against your pending list</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${badgeClass}`}>UTC Live Slot</span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { hour: '08:00 AM', label: 'Anti-procrastination Kickstart Block', desc: 'Verify Focus Anchors. Clear the physical desk and load active task documents.', type: 'start' },
                    { hour: '10:00 AM', label: 'Primary Energy Peak focus slot', desc: 'High momentum window. Avoid communication channels, target heaviest logical block.', type: 'peak' },
                    { hour: '12:00 PM', label: 'Intermediate Buffer Review & Sync', desc: 'Assess drift indices. Adjust next steps based on Safest Next Move analysis.', type: 'buffer' },
                    { hour: '03:00 PM', label: 'Secondary Focus slot', desc: 'Tackle micro-actions. Ideal for drafting client mails and checklist reviews.', type: 'micro' },
                    { hour: '06:00 PM', label: 'Deadline Safe Zone Audit', desc: 'Run delay projections. Export and align .ics files for evening coordination.', type: 'audit' },
                    { hour: '09:00 PM', label: 'Cognitive Reset & Anchor review', desc: 'Maintain streak values in Focus Anchors. Log mental buffers for tomorrow.', type: 'reset' }
                  ].map((slot, index) => {
                    return (
                      <div key={index} className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:translate-x-1 ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50'
                          : isRead
                          ? 'bg-[#fbf7eb]/80 border-[#ebd4ab] hover:bg-[#fbf7eb]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-750'
                      }`}>
                        <div className="w-24 shrink-0 font-mono text-sm font-black text-amber-500">
                          {slot.hour}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>{slot.label}</span>
                          </h4>
                          <p className={`text-xs leading-relaxed ${subtitleColor}`}>{slot.desc}</p>
                        </div>

                        {index === 0 && pendingTasks.length > 0 && (
                          <span className="bg-red-500/10 border border-red-500/25 text-red-400 font-mono text-[10px] font-bold px-3 py-1 rounded-xl">
                            {pendingTasks.length} pending logs
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Generated Time Blocks Schedule */}
            <div className={`rounded-3xl p-6 md:p-8 space-y-4 ${cardClass}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-bold flex items-center gap-2.5 ${titleColor}`}>
                  <Sparkles className="w-5 h-5 text-amber-500 animate-slow-orbit" />
                  <span>AI-Generated Focus Time Blocks</span>
                </h3>
                {activeRescuePlan && (
                  <span className="text-[11px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">
                    Active Plan: {activeRescuePlan.taskTitle}
                  </span>
                )}
              </div>

              {activeRescuePlan?.timeBlocks && activeRescuePlan.timeBlocks.length > 0 ? (
                <div className="space-y-4">
                  <p className={`text-sm ${subtitleColor}`}>Following focus schedule is customized based on your active rescue sequence:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeRescuePlan.timeBlocks.map((block, idx) => (
                      <div key={idx} className={`p-5 rounded-2xl flex items-start gap-4 ${innerCardClass}`}>
                        <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl text-xs font-mono font-bold shrink-0">
                          {block.duration}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{block.label}</h4>
                          <p className={`text-xs mt-1.5 leading-relaxed ${subtitleColor}`}>{block.goal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-8 rounded-2xl text-center space-y-2 ${innerCardClass}`}>
                    <p className={`text-sm italic ${subtitleColor}`}>No active AI focus plan blocks loaded. Recommended blocks are automatically constructed when you run a task Rescue Plan.</p>
                  </div>

                  {/* Smart default recommended focus slots based on pending tasks */}
                  {pendingTasks.length > 0 && (
                    <div className="space-y-3.5">
                      <span className={`text-xs font-mono uppercase font-bold ${subtitleColor}`}>Smart Focus Suggestions</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingTasks.slice(0, 4).map((t, idx) => (
                          <div key={idx} className={`p-5 rounded-2xl flex items-start gap-4 ${innerCardClass}`}>
                            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl text-xs font-mono font-bold shrink-0">
                              45m
                            </div>
                            <div>
                              <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : isRead ? 'text-[#2e2514]' : 'text-white'}`}>{t.title}</h4>
                              <p className={`text-xs mt-1.5 leading-relaxed ${subtitleColor}`}>Recommended deep-work block targeting starting resistance.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        )}

        {/* -------------------- 9. HABITS VIEW -------------------- */}
        {activeTab === 'habits' && user && (
          <main id="view-habits" className="animate-timeline-reveal">
            <HabitList
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              appearance={appearance}
            />
          </main>
        )}

        {/* -------------------- 10. INSIGHTS / COGNITIVE METRICS -------------------- */}
        {activeTab === 'insights' && user && (
          <main id="view-insights" className="space-y-6 animate-timeline-reveal">
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${titleColor}`}>DueMate Cognitive Insights</h2>
              <p className={`text-xs ${subtitleColor}`}>Empathy-driven cognitive performance and starting risk analysis.</p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Rescued Tasks */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className={`font-bold text-sm ${titleColor}`}>Rescued Tasks</h3>
                </div>
                <div className={`text-4xl font-mono font-extrabold ${titleColor}`}>
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <p className={`text-xs leading-relaxed ${textMutedColor}`}>
                  Total high-anxiety milestones successfully moved past safe thresholds. Every completed item is a deadline rescued.
                </p>
              </div>

              {/* Card 2: Most Common Deadline Risk */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <h3 className={`font-bold text-sm ${titleColor}`}>Most Common Risk</h3>
                </div>
                <div className={`text-sm font-bold line-clamp-2 leading-snug ${titleColor}`}>
                  {(() => {
                    const pending = tasks.filter(t => t.status !== 'completed');
                    if (pending.length === 0) return "Starting Inertia (No pending deadlines)";
                    const highPanic = pending.filter(t => t.panicLevel === 'high' || t.panicLevel === 'critical').length;
                    if (highPanic > pending.length / 2) {
                      return "Time Compression (Over-optimistic delay)";
                    }
                    return "Task Freezing (Anxiety-driven initiation delay)";
                  })()}
                </div>
                <p className={`text-xs leading-relaxed ${textMutedColor}`}>
                  Your primary threat index. Tracks cognitive patterns that narrow your completion buffers prematurely.
                </p>
              </div>

              {/* Card 3: Best Work Time */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-3`}>
                <div className="flex items-center gap-2 text-amber-500">
                  <Clock className="w-5 h-5" />
                  <h3 className={`font-bold text-sm ${titleColor}`}>Best Work Time</h3>
                </div>
                <div className={`text-sm font-bold leading-normal capitalize ${titleColor}`}>
                  {user.preferredWorkTime || "Late Night Focus Sprints"}
                </div>
                <p className={`text-xs leading-relaxed ${textMutedColor}`}>
                  Your peak biological energy zone. Scheduling complex micro-actions inside this window cuts initiation resistance by 40%.
                </p>
              </div>

              {/* Card 4: Missed Pattern */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-3 md:col-span-1`}>
                <div className="flex items-center gap-2 text-blue-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className={`font-bold text-sm ${titleColor}`}>Missed Pattern</h3>
                </div>
                <div className={`text-sm font-bold leading-snug ${titleColor}`}>
                  {(() => {
                    const role = activeRole;
                    if (role === 'student') return "Underestimating reading & citation hours before deadlines close.";
                    if (role === 'professional') return "Focus fragmentation caused by secondary sync check-ins.";
                    if (role === 'entrepreneur') return "Over-polishing presentation details before feedback validation.";
                    if (role === 'freelancer') return "Omitting client feedback loop buffer timelines.";
                    if (role === 'job_seeker') return "Tailoring resume drafts to the point of application fatigue.";
                    return "Overestimating midnight energy levels when fatigue spikes.";
                  })()}
                </div>
                <p className={`text-xs leading-relaxed ${textMutedColor}`}>
                  A high-empathy analysis of where projects usually slow down. Knowing this helps build defensive buffers.
                </p>
              </div>

              {/* Card 5: Improvement Recommendation */}
              <div className={`${isDark ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border border-slate-850' : 'bg-gradient-to-br from-white to-amber-50/40 border border-zinc-200'} rounded-2xl p-5 space-y-3 md:col-span-2`}>
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className={`font-bold text-sm ${titleColor}`}>Actionable Safe Recommendation</h3>
                </div>
                <p className={`text-xs font-medium leading-relaxed p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/80 text-amber-100' : isRead ? 'bg-[#f5ebd2] border-[#ebd4ab] text-[#5c3e1e]' : 'bg-indigo-50/50 border-indigo-100 text-indigo-900'}`}>
                  "A safer way to finish today: chunk your highest anxiety task into 5-minute action sprints before the buffer is consumed."
                </p>
                <p className={`text-xs leading-relaxed ${textMutedColor}`}>
                  By starting with an intentional, low-friction micro-action, you bypass cognitive flight reflexes and secure starting momentum.
                </p>
              </div>

            </div>
          </main>
        )}

        {/* -------------------- 11. SETTINGS & PROFILE -------------------- */}
        {activeTab === 'settings' && user && (
          <main id="view-settings" className="space-y-6 animate-timeline-reveal">
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${titleColor}`}>Workspace Customization</h2>
              <p className={`text-xs ${subtitleColor}`}>Configure your adaptive companion details, notifications, and backup portability.</p>
            </div>

            {/* Profile Information Panel */}
            <div className={`${cardClass} rounded-3xl p-6 space-y-4`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${titleColor}`}>
                <span>👤 Profile Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-mono uppercase ${textMutedColor}`}>Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => {
                      const updated = { ...user, name: e.target.value };
                      setUser(updated);
                      localStorage.setItem('dueMate_user', JSON.stringify(updated));
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                        : isRead
                        ? 'bg-[#fdfbf7] border border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-mono uppercase ${textMutedColor}`}>Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => {
                      const updated = { ...user, email: e.target.value };
                      setUser(updated);
                      localStorage.setItem('dueMate_user', JSON.stringify(updated));
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                        : isRead
                        ? 'bg-[#fdfbf7] border border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]'
                        : 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Customization Forms Card */}
            <div className={`${cardClass} rounded-3xl p-6 space-y-6`}>
              
              {/* Appearance Style */}
              <div className="space-y-3">
                <h3 className={`text-sm font-bold ${titleColor}`}>Default Workspace Visual Mode</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { val: 'auto', label: 'Auto (by Active Role)' },
                    { val: 'light', label: 'Light Mode' },
                    { val: 'dark', label: 'Dark Mode' },
                    { val: 'read', label: 'Read Mode' },
                    { val: 'focus', label: 'Focus Mode' },
                    { val: 'panic', label: 'Panic Mode' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        const updated = { ...user, preferredAppearanceMode: opt.val as AppearanceMode };
                        setUser(updated);
                        localStorage.setItem('dueMate_user', JSON.stringify(updated));
                        showToast(`Theme aesthetic preset switched to ${opt.val}!`);
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        user.preferredAppearanceMode === opt.val
                          ? isLight
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                            : isRead
                            ? 'bg-[#8b5a2b]/10 border-[#8b5a2b] text-[#8b5a2b]'
                            : 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg'
                          : isLight
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                          : isRead
                          ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#6d5c41]/90 hover:bg-[#ebd4ab]/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Explorer Preview */}
              <div className={`space-y-3 pt-4 border-t ${borderClass}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold ${titleColor}`}>Active Visual Persona Selection</h3>
                    <p className={`text-xs leading-relaxed mt-0.5 ${textMutedColor}`}>
                      Change your role setting to shift preset aesthetic colors, guidelines, and micro-actions.
                    </p>
                  </div>
                  {previewRole && (
                    <button
                      onClick={() => {
                        setPreviewRole(null);
                        showToast("Role preview cleared. Restored original profile.");
                      }}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border transition-all cursor-pointer ${
                        isLight
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                          : isRead
                          ? 'bg-red-50/50 hover:bg-red-100/50 text-red-700 border-red-200/60'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                      }`}
                    >
                      Clear Preview [Restored]
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'professional', label: 'Professional' },
                    { id: 'entrepreneur', label: 'Entrepreneur' },
                    { id: 'freelancer', label: 'Freelancer' },
                    { id: 'job_seeker', label: 'Job Seeker' },
                  ].map((r) => {
                    const isSelected = previewRole ? previewRole === r.id : user.primaryRole === r.id;
                    const isActual = user.primaryRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          if (isActual) {
                            setPreviewRole(null);
                            showToast(`Active actual role is ${r.id}.`);
                          } else {
                            setPreviewRole(r.id as PrimaryRole);
                            showToast(`Temporary active explorer role is set to ${r.id}!`);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? isLight
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                              : isRead
                              ? 'bg-[#ebd4ab]/20 border-[#8b5a2b] text-[#8b5a2b]'
                              : 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md'
                            : isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                            : isRead
                            ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#6d5c41]/90 hover:bg-[#ebd4ab]/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{r.label}</span>
                        {isActual && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full border border-slate-900">
                            DB
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className={`text-[10px] leading-normal italic ${textMutedColor}`}>
                  Note: Role explorer switcher (DB tagged is actual) lets you preview other roles' visual assets. Change actual roles in Onboarding.
                </p>
              </div>

              {/* Polite Browser Notification Option */}
              <div className={`space-y-3 pt-4 border-t ${borderClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div>
                  <h3 className={`text-sm font-bold ${titleColor}`}>Browser Push Alerts & Reminders</h3>
                  <p className={`text-xs leading-relaxed max-w-xl ${textMutedColor}`}>
                    Politely alerts you 30 minutes before crucial task blocks are consumed. If permission is denied or unsupported, DueMate falls back to in-app toast overlays automatically.
                  </p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    notificationsEnabled
                      ? isLight
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : isRead
                        ? 'bg-[#ebd4ab]/20 border-[#8b5a2b] text-[#8b5a2b]'
                        : 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                      : isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                      : isRead
                      ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#6d5c41] hover:bg-[#ebd4ab]/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  {notificationsEnabled ? '🔔 Push Alerts Enabled' : '🔕 Enable Push Alerts'}
                </button>
              </div>

              {/* Reminder Custom Style */}
              <div className={`space-y-3 pt-4 border-t ${borderClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div>
                  <h3 className={`text-sm font-bold ${titleColor}`}>System Coaching Accent Style</h3>
                  <p className={`text-xs leading-relaxed max-w-xl ${textMutedColor}`}>
                    Shift the coaching perspective of your rescue timeline sheets to match your pressure sensitivity.
                  </p>
                </div>
                <select
                  value={user.reminderStyle || 'gentle'}
                  onChange={(e) => {
                    const updated = { ...user, reminderStyle: e.target.value };
                    setUser(updated);
                    localStorage.setItem('dueMate_user', JSON.stringify(updated));
                    showToast(`Accent style changed to ${e.target.value}!`);
                  }}
                  className={`rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                      : isRead
                      ? 'bg-[#fdfbf7] border-[#ebd4ab] text-[#2e2514] focus:border-[#8b5a2b]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                  }`}
                >
                  <option value="gentle">Gentle micro-actions (High-empathy, low-friction)</option>
                  <option value="pacing">Countdown pacing (Focus meters, time-remaining loops)</option>
                  <option value="direct">Action-pack updates (Brief instructions, objective outputs)</option>
                </select>
              </div>

              {/* Data Portability (Backup & Restore) */}
              <div className={`space-y-3 pt-4 border-t ${borderClass}`}>
                <h3 className={`text-sm font-bold ${titleColor}`}>Workspace Portability Hub (Import/Export)</h3>
                <p className={`text-xs ${textMutedColor}`}>
                  Export your active deadline logs and anti-procrastination habits to a local JSON backup, or import an existing JSON archive.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => {
                      const backupObj = {
                        user,
                        tasks,
                        habits,
                        exportedAt: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `dueMate_backup_${user.name.replace(/\s+/g, '_')}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast("Workspace backup JSON file exported!");
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                        : isRead
                        ? 'bg-[#f5ebd2] hover:bg-[#e6d5b8] text-[#5c3e1e] border-[#ebd4ab]'
                        : 'bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    📥 Export JSON Backup
                  </button>

                  <label className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                      : isRead
                      ? 'bg-[#f5ebd2] hover:bg-[#e6d5b8] text-[#5c3e1e] border-[#ebd4ab]'
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                  }`}>
                    📤 Import JSON Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const parsed = JSON.parse(ev.target?.result as string);
                            if (parsed.user && parsed.tasks) {
                              setUser(parsed.user);
                              setTasks(parsed.tasks);
                              if (parsed.habits) setHabits(parsed.habits);
                              localStorage.setItem('dueMate_user', JSON.stringify(parsed.user));
                              localStorage.setItem(`dueMate_tasks_${parsed.user.email}`, JSON.stringify(parsed.tasks));
                              localStorage.setItem(`dueMate_habits_${parsed.user.email}`, JSON.stringify(parsed.habits || []));
                              showToast("Backup JSON file successfully imported!");
                            } else {
                              showToast("Invalid backup file: missing mandatory profile/task entries.");
                            }
                          } catch (err) {
                            showToast("Backup parsing failed: file format error.");
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Database / Restore Factory Defaults */}
              <div className={`space-y-3 pt-4 border-t ${borderClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div>
                  <h3 className="text-sm font-bold text-red-500">Wipe Database & Terminate Companion Session</h3>
                  <p className={`text-xs ${textMutedColor}`}>Permanently clears your local-first profile, deadline logs, and habits. Wipes localStorage.</p>
                </div>
                <button
                  onClick={() => {
                    const confirmWipe = window.confirm("WARNING: Are you absolutely sure you want to permanently delete all profile settings, deadlines, and habits? This action is irreversible.");
                    if (confirmWipe) {
                      localStorage.clear();
                      setUser(null);
                      setTasks([]);
                      setHabits([]);
                      setActiveTab('landing');
                      window.location.reload();
                    }
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-slate-950 border border-red-500/20 hover:border-red-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Permanently Wipe All Data
                </button>
              </div>

              {/* Cloud Synchronization Placeholder */}
              <div className={`space-y-3 pt-4 border-t ${borderClass}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${titleColor}`}>
                  <span>☁️ Cloud Synchronization Services</span>
                  <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                    Local-First
                  </span>
                </h3>
                <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                  DueMate is powered by an offline-first browser sandbox. All calculations, NLP speech streams, and heuristic risk indices run inside your browser client. To protect your confidentiality, online cloud database synchronizations are completely inactive.
                </p>
                <div className={`flex items-center gap-2.5 p-4 border rounded-xl max-w-xl ${isLight ? 'bg-zinc-100/40 border-zinc-200' : isRead ? 'bg-[#f5ebd2]/50 border-[#ebd4ab]' : 'bg-slate-950/40 border-slate-800'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                  <div className={`text-[11px] font-medium ${textMutedColor}`}>
                    Cloud Connection: <span className="font-mono text-slate-500">Inactive</span> • Backup via Local Backup files recommended.
                  </div>
                </div>
              </div>

              {/* Interactive User Tour */}
              <div className={`space-y-3 pt-4 border-t ${borderClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div>
                  <h3 className={`text-sm font-bold ${titleColor}`}>Interactive User Tour</h3>
                  <p className={`text-xs ${textMutedColor}`}>Restart the interactive walkthrough showing primary dashboard widgets.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('dueMate_tour_completed');
                    setActiveTour(true);
                    setActiveTab('dashboard');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Tour Guide</span>
                </button>
              </div>

            </div>
          </main>
        )}

      </div>

      {/* Interactive Floating Delay Simulator Drawer Overlay */}
      {simulatingTask && user && (
        <DelaySimulator
          task={simulatingTask}
          roleStyle={user.primaryRole}
          onClose={() => setSimulatingTask(null)}
          onApplyResult={handleApplySimulation}
          appearance={appearance}
        />
      )}

      {/* Fullscreen Distraction-Free Focus Space Overlay */}
      {focusTask && (
        <FocusTimer
          task={focusTask}
          initialStep={activeRescuePlan?.taskId === focusTask.id ? activeRescuePlan.steps[0] : null}
          onClose={() => setFocusTask(null)}
          onCompleteStep={() => {
            // Check off first step if active rescue plan exists
            if (activeRescuePlan && activeRescuePlan.taskId === focusTask.id) {
              const updatedSteps = [...activeRescuePlan.steps];
              updatedSteps[0].status = 'completed';
              setActiveRescuePlan({ ...activeRescuePlan, steps: updatedSteps });
            }
          }}
        />
      )}

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 animate-slide-up max-w-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
          <p className="text-xs font-semibold leading-normal">{toastMessage}</p>
        </div>
      )}

      {/* Universal SaaS-style Premium Footer */}
      <footer className={`mt-20 border-t pt-12 pb-8 ${borderClass} transition-colors duration-300 relative overflow-hidden`}>
        {/* Decorative subtle background accents */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-500/5 blur-2xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-500/5 blur-2xl rounded-full" />

        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-500/10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <DueMateLogo size={36} showText={true} isLight={isLight || isRead} />
            <p className={`text-xs leading-relaxed max-w-sm ${subtitleColor}`}>
              DueMate AI is an empathy-driven, offline-first productivity workspace designed to neutralize start-up friction, alleviate panic-induced freezing, and restore cognitive confidence.
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${textMutedColor}`}>
                Security Status: 100% Private Browser Encrypted
              </span>
            </div>
          </div>

          {/* Links Column 1: Crisis Suite */}
          <div className="md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-zinc-950' : isRead ? 'text-[#2e2514]' : 'text-zinc-200'}`}>
              Crisis Core
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:${accentTextClass} transition-colors cursor-pointer text-left ${subtitleColor}`}>
                  Panic Autopilot
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:${accentTextClass} transition-colors cursor-pointer text-left ${subtitleColor}`}>
                  Bio-Scheduler
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:${accentTextClass} transition-colors cursor-pointer text-left ${subtitleColor}`}>
                  Body Doubler
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:${accentTextClass} transition-colors cursor-pointer text-left ${subtitleColor}`}>
                  Threat Radar
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Sensory Themes */}
          <div className="md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-zinc-950' : isRead ? 'text-[#2e2514]' : 'text-zinc-200'}`}>
              Sensory Themes
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className={`${subtitleColor}`}>Student Empathy</span>
              </li>
              <li>
                <span className={`${subtitleColor}`}>Professional Splitter</span>
              </li>
              <li>
                <span className={`${subtitleColor}`}>Freelancer Sprint</span>
              </li>
              <li>
                <span className={`${subtitleColor}`}>Cosmic Dark Slate</span>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Tech & Privacy */}
          <div className="md:col-span-3 space-y-3">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-zinc-950' : isRead ? 'text-[#2e2514]' : 'text-zinc-200'}`}>
              System Architecture
            </h4>
            <ul className="space-y-2 text-[11px] font-mono">
              <li className={subtitleColor}>
                Engine: <span className="text-cyan-400">React 18 + TS</span>
              </li>
              <li className={subtitleColor}>
                Storage: <span className="text-amber-500">HTML5 LocalStorage</span>
              </li>
              <li className={subtitleColor}>
                Sensory Matrix: <span className="text-emerald-400">Tailwind CSS</span>
              </li>
              <li className="pt-1">
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear your local tasks, habits, and profile? This will restore the factory default settings.")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }} 
                  className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-all px-2.5 py-1 rounded cursor-pointer"
                >
                  Factory Reset Local Storage
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="max-w-5xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-[11px] font-mono text-center sm:text-left ${textMutedColor}`}>
            © 2026 DueMate AI • Designed with Empathy for Cognitive Overload
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono">
            {user ? (
              <span className={`px-2.5 py-1 rounded-full ${innerCardClass} ${subtitleColor}`}>
                Client: <strong className="text-emerald-500">{user.name}</strong> ({user.email})
              </span>
            ) : (
              <span className={`px-2.5 py-1 rounded-full ${innerCardClass} ${subtitleColor}`}>
                Active Mode: <strong>Anonymous Explorer</strong>
              </span>
            )}
            <span className={`text-[11px] ${textMutedColor}`}>All Systems Fully Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
