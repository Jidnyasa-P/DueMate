/**
 * Shared Type Definitions for DueMate AI Core Product Engine
 */

export type PrimaryRole = 'student' | 'professional' | 'entrepreneur' | 'freelancer' | 'job_seeker';

export type AppearanceMode = 'light' | 'dark' | 'read' | 'focus' | 'panic' | 'auto';

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'rescued' | 'missed' | 'pending' | 'completed';

export type PanicLevel = 'low' | 'medium' | 'high' | 'critical';

export interface UserProfile {
  name: string;
  email: string;
  role?: PrimaryRole; // UserProfile: role
  primaryRole?: PrimaryRole; // Kept for legacy compatibility
  biggestDeadlineProblem: string;
  preferredWorkTime: string;
  reminderStyle: string;
  appearanceMode?: AppearanceMode; // UserProfile: appearanceMode
  preferredAppearanceMode?: AppearanceMode; // Kept for legacy compatibility
  workHours?: string; // UserProfile: workHours (e.g. "09:00 - 17:00")
  energyPattern?: string; // UserProfile: energyPattern (e.g. "Morning Peak")
  focusSessionLength?: number; // UserProfile: focusSessionLength (e.g. 25 minutes)
  completedTour?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CalendarBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface AgentTraceItem {
  agent: string; // "Capture Agent" | "Risk Agent" | "Planner Agent" | "Scheduler Agent" | "Execution Agent" | "Coach Agent" | "Reflection Agent"
  action: string;
  output: string;
}

export interface RescueTimelineNode {
  label: string; // "Start now" | "Start in 2 hours" | "Start tonight" | "Start tomorrow" | "Too late"
  completionChance: number; // 0 - 100
  consequence: string;
}

export interface TimeBlock {
  label: string; // e.g., "10:00 AM - 10:25 AM"
  duration: string; // e.g., "25m"
  goal: string;
}

export interface ActionPack {
  checklist: string[];
  emailDraft: string;
  meetingBrief: string;
  studyPlan: string;
  interviewPrep: string;
  clientUpdate: string;
  resourcesToCollect: string[];
}

export interface RescuePlan {
  id: string;
  taskId: string;
  taskTitle: string;
  taskUnderstanding: string;
  riskSummary: string;
  safestNextMove: string;
  firstFiveMinuteAction: string;
  rescueTimeline: RescueTimelineNode[];
  microSteps: string[];
  timeBlocks: TimeBlock[];
  riskFactors: string[];
  fallbackPlan: string;
  definitionOfDone: string;
  actionPack: ActionPack;
  coachLine: string;
  agentTrace: AgentTraceItem[];
  isLocalFallback?: boolean; // "Smart rescue mode is running locally. Gemini can regenerate this when available."
  createdAt: string;
}

export interface DelaySimulationResult {
  taskId: string;
  taskTitle: string;
  delayDuration: string; // "1h" | "1d" | "1w"
  originalRisk: number;
  simulatedRisk: number;
  impactLevel: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  timelineShift: string;
  survivalAction: string;
  dynamicMessage: string;
  overlappingConflicts: string[]; // what overlapping tasks conflict
  estimatedStressIncrease: number; // percentage
  likelyRecoveryTime: string; // e.g. "3 hours"
  whatToSkip: string;
  whatToDoFirst: string;
  honestRecommendation: string;
}

export interface Task {
  id: string;
  title: string;
  roleContext?: PrimaryRole; // Task: roleContext
  category: string;
  deadlineDateTime?: string; // Task: deadlineDateTime (ISO String)
  dueDate?: string; // Kept for compatibility
  estimatedMinutes?: number; // Task: estimatedMinutes
  originalEstimateHours?: number; // Kept for compatibility
  importance?: number; // 1-5
  difficulty?: number; // 1-5
  confidence?: number; // 1-5
  status: TaskStatus;
  notes?: string;
  description?: string; // Kept for compatibility
  roleStyle?: PrimaryRole; // Kept for compatibility
  createdAt?: string;
  subtasks?: Subtask[];
  rescuePlan?: RescuePlan;
  rescueScore?: number; // 0-100
  urgencyLevel?: PanicLevel; // PanicLevel mapping
  panicLevel?: PanicLevel; // Kept for compatibility
  delaySimulation?: DelaySimulationResult | null;
  actionPack?: ActionPack;
  calendarBlocks?: CalendarBlock[];
  safestNextMove?: string; // Kept for compatibility
  currentRiskScore?: number; // Kept for compatibility
}

export interface RescueStep {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'completed';
  details: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  lastCompleted: string | null;
  targetFrequency: 'daily' | 'workdays' | 'weekly';
}
