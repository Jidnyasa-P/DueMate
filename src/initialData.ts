import { Task, Habit, PrimaryRole } from './types';

export const defaultTasksByRole: Record<PrimaryRole, Task[]> = {
  student: [
    {
      id: 'task-st-1',
      title: 'CS301 Advanced Algorithm Thesis Draft',
      description: 'Write section 3 (dynamic programming complexity analysis) and submit draft to Prof. Aris.',
      category: 'Academics',
      dueDate: '2026-06-30T17:00:00Z',
      status: 'pending',
      roleStyle: 'student',
      panicLevel: 'high',
      originalEstimateHours: 8,
      currentRiskScore: 78,
      safestNextMove: 'Open Google Doc draft & write down the 3 main recursive subproblems.'
    },
    {
      id: 'task-st-2',
      title: 'Humanities Group Presentation Slides',
      description: 'Create and format the initial 4 slides on modern philosophical ethics.',
      category: 'Academics',
      dueDate: '2026-07-01T12:00:00Z',
      status: 'pending',
      roleStyle: 'student',
      panicLevel: 'medium',
      originalEstimateHours: 3,
      currentRiskScore: 42,
      safestNextMove: 'Open presentation template and paste raw script into slide speaker notes.'
    },
    {
      id: 'task-st-3',
      title: 'Chemistry Lab Report Revision',
      description: 'Correct calculation errors on thermodynamic tables.',
      category: 'Lab Work',
      dueDate: '2026-07-03T23:59:00Z',
      status: 'completed',
      roleStyle: 'student',
      panicLevel: 'low',
      originalEstimateHours: 2,
      currentRiskScore: 10,
      safestNextMove: 'Open Excel spreadsheet and re-run standard error formulas.'
    }
  ],
  professional: [
    {
      id: 'task-pr-1',
      title: 'Quarterly Project Baseline Report',
      description: 'Synthesize performance milestones from product, design, and engineering managers.',
      category: 'Management',
      dueDate: '2026-06-30T14:00:00Z',
      status: 'pending',
      roleStyle: 'professional',
      panicLevel: 'high',
      originalEstimateHours: 6,
      currentRiskScore: 82,
      safestNextMove: 'Open corporate document template and write bullet-point list of product updates.'
    },
    {
      id: 'task-pr-2',
      title: 'Client SLA Retrospective Slides',
      description: 'Prepare data tables showing target metrics vs actual response speeds.',
      category: 'Reporting',
      dueDate: '2026-07-02T09:00:00Z',
      status: 'pending',
      roleStyle: 'professional',
      panicLevel: 'medium',
      originalEstimateHours: 4,
      currentRiskScore: 35,
      safestNextMove: 'Download response time CSV from cloud dashboard analytics.'
    },
    {
      id: 'task-pr-3',
      title: 'Security Compliance Sign-off',
      description: 'Review updated developer authentication guidelines and approve.',
      category: 'Compliance',
      dueDate: '2026-07-05T18:00:00Z',
      status: 'completed',
      roleStyle: 'professional',
      panicLevel: 'low',
      originalEstimateHours: 1,
      currentRiskScore: 5,
      safestNextMove: 'Verify developer standard checklist in approval workspace.'
    }
  ],
  entrepreneur: [
    {
      id: 'task-en-1',
      title: 'Series-A Term Sheet Assessment',
      description: 'Analyze liquidation preferences and board seat configurations before Friday legal counsel sync.',
      category: 'Fundraising',
      dueDate: '2026-06-30T10:00:00Z',
      status: 'pending',
      roleStyle: 'entrepreneur',
      panicLevel: 'high',
      originalEstimateHours: 5,
      currentRiskScore: 88,
      safestNextMove: 'Highlight major board control paragraphs on page 3 of the term sheet.'
    },
    {
      id: 'task-en-2',
      title: 'Quarterly Executive Hiring Forecast',
      description: 'Define target headcount, salary bandwidths, and equity allocations for incoming VP of Engineering.',
      category: 'Strategy',
      dueDate: '2026-07-01T23:59:00Z',
      status: 'pending',
      roleStyle: 'entrepreneur',
      panicLevel: 'medium',
      originalEstimateHours: 4,
      currentRiskScore: 49,
      safestNextMove: 'Open recruitment budget spreadsheet and lock key executive salaries.'
    },
    {
      id: 'task-en-3',
      title: 'Weekly Standup Briefing Outline',
      description: 'Prepare company-wide strategic shift notes for Monday morning presentation.',
      category: 'Communication',
      dueDate: '2026-07-06T08:00:00Z',
      status: 'pending',
      roleStyle: 'entrepreneur',
      panicLevel: 'low',
      originalEstimateHours: 2,
      currentRiskScore: 18,
      safestNextMove: 'Write down three primary goals achieved this week in shared team log.'
    }
  ],
  freelancer: [
    {
      id: 'task-fr-1',
      title: 'E-commerce Brand Identity Package',
      description: 'Deliver initial high-fidelity vector layouts, typography scale, and color hierarchy to Zenith Retail.',
      category: 'Design Delivery',
      dueDate: '2026-06-30T16:00:00Z',
      status: 'pending',
      roleStyle: 'freelancer',
      panicLevel: 'high',
      originalEstimateHours: 12,
      currentRiskScore: 85,
      safestNextMove: 'Open design workspace and place core brand typography side-by-side.'
    },
    {
      id: 'task-fr-2',
      title: 'Zenith Contract Annex Amendment',
      description: 'Revise design scope terms to account for extra page variations.',
      category: 'Administrative',
      dueDate: '2026-07-02T12:00:00Z',
      status: 'pending',
      roleStyle: 'freelancer',
      panicLevel: 'medium',
      originalEstimateHours: 2,
      currentRiskScore: 30,
      safestNextMove: 'Draft email bullet points clarifying design variation pricing.'
    },
    {
      id: 'task-fr-3',
      title: 'Portfolio Case Study Publication',
      description: 'Compile assets and draft textual breakdown of client success narrative.',
      category: 'Marketing',
      dueDate: '2026-07-04T18:00:00Z',
      status: 'completed',
      roleStyle: 'freelancer',
      panicLevel: 'low',
      originalEstimateHours: 3,
      currentRiskScore: 8,
      safestNextMove: 'Select high-quality screenshot images and export to portfolio web folder.'
    }
  ],
  job_seeker: [
    {
      id: 'task-js-1',
      title: 'Technical Interview Live System Design prep',
      description: 'Review architectural tradeoffs for rate limiters and real-time feed synchronization.',
      category: 'Preparation',
      dueDate: '2026-06-30T11:00:00Z',
      status: 'pending',
      roleStyle: 'job_seeker',
      panicLevel: 'high',
      originalEstimateHours: 10,
      currentRiskScore: 92,
      safestNextMove: 'Sketch simple flow chart representing multi-tier distributed caching.'
    },
    {
      id: 'task-js-2',
      title: 'Adapt Resume for Senior Product Lead',
      description: 'Integrate dynamic KPI metrics and remove wordy legacy experience descriptions.',
      category: 'Applications',
      dueDate: '2026-07-01T23:59:00Z',
      status: 'pending',
      roleStyle: 'job_seeker',
      panicLevel: 'medium',
      originalEstimateHours: 3,
      currentRiskScore: 52,
      safestNextMove: 'Open current resume document and locate top 3 work achievements.'
    },
    {
      id: 'task-js-3',
      title: 'Follow up on InnovateCorp Interview',
      description: 'Write a polite follow-up email confirming thank-you notes to engineering panel.',
      category: 'Follow-ups',
      dueDate: '2026-07-03T17:00:00Z',
      status: 'completed',
      roleStyle: 'job_seeker',
      panicLevel: 'low',
      originalEstimateHours: 1,
      currentRiskScore: 12,
      safestNextMove: 'Open draft email workspace and copy standard follow-up layout.'
    }
  ]
};

export const defaultHabitsByRole: Record<PrimaryRole, Habit[]> = {
  student: [
    { id: 'hab-st-1', title: 'Start work before 11:00 AM', category: 'Momentum', streak: 4, lastCompleted: '2026-06-28T09:30:00Z', targetFrequency: 'daily' },
    { id: 'hab-st-2', title: '5-minute academic outline step', category: 'Anti-procrastination', streak: 6, lastCompleted: '2026-06-28T10:15:00Z', targetFrequency: 'daily' },
    { id: 'hab-st-3', title: 'Clear digital canvas of tabs', category: 'Focus', streak: 2, lastCompleted: null, targetFrequency: 'daily' }
  ],
  professional: [
    { id: 'hab-pr-1', title: 'Check critical client status early', category: 'Priority', streak: 8, lastCompleted: '2026-06-28T08:15:00Z', targetFrequency: 'daily' },
    { id: 'hab-pr-2', title: 'Block afternoon focus buffer', category: 'Timeboxing', streak: 12, lastCompleted: '2026-06-28T13:00:00Z', targetFrequency: 'workdays' },
    { id: 'hab-pr-3', title: 'Decline non-critical async syncs', category: 'SLA Guard', streak: 3, lastCompleted: null, targetFrequency: 'weekly' }
  ],
  entrepreneur: [
    { id: 'hab-en-1', title: 'Solve absolute toughest project first', category: 'Efficacy', streak: 5, lastCompleted: '2026-06-28T07:45:00Z', targetFrequency: 'daily' },
    { id: 'hab-en-2', title: 'Re-evaluate risk scores on dashboard', category: 'Pre-mortem', streak: 9, lastCompleted: '2026-06-28T17:30:00Z', targetFrequency: 'daily' },
    { id: 'hab-en-3', title: 'Log simulated time buffers', category: 'Buffer preservation', streak: 1, lastCompleted: null, targetFrequency: 'weekly' }
  ],
  freelancer: [
    { id: 'hab-fr-1', title: 'Publish dynamic outline to clients', category: 'SLA Align', streak: 3, lastCompleted: '2026-06-28T11:00:00Z', targetFrequency: 'workdays' },
    { id: 'hab-fr-2', title: 'No browser tabs except primary active task', category: 'Silo Focus', streak: 7, lastCompleted: '2026-06-28T10:00:00Z', targetFrequency: 'daily' },
    { id: 'hab-fr-3', title: 'Log freelance billable hours immediately', category: 'Admin Velocity', streak: 2, lastCompleted: null, targetFrequency: 'daily' }
  ],
  job_seeker: [
    { id: 'hab-js-1', title: 'Complete 1 high-impact system review', category: 'Readiness', streak: 6, lastCompleted: '2026-06-28T14:30:00Z', targetFrequency: 'daily' },
    { id: 'hab-js-2', title: 'Send customized outreach email', category: 'Network', streak: 10, lastCompleted: '2026-06-28T11:45:00Z', targetFrequency: 'workdays' },
    { id: 'hab-js-3', title: 'Review mock-up answers out loud', category: 'Confidence', streak: 3, lastCompleted: null, targetFrequency: 'daily' }
  ]
};
