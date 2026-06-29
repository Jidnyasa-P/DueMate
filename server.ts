import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client to prevent startup crashes
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      console.warn("GEMINI_API_KEY is not defined. DueMate AI will run with premium local fallbacks.");
    }
  }
  return aiClient;
}

// Helper to provide realistic local fallback rescue plans when Gemini is offline/unconfigured
function getLocalRescuePlan(
  taskTitle: string,
  description: string,
  category: string,
  role: string,
  obstacle: string,
  importance: number,
  difficulty: number
) {
  const cleanRole = (role || "student").toLowerCase();
  const cleanObstacle = obstacle || "procrastination";

  // Customize based on user role
  let safestNextMove = "Open a blank page and draft 3 lines.";
  let firstFiveMinuteAction = "Write down 3 bullet points of what you need to cover.";
  let coachLine = "Breathe easy. Starting is just a physical gesture. Let's make it frictionless.";
  
  let checklist: string[] = [];
  let emailDraft = "";
  let meetingBrief = "";
  let studyPlan = "";
  let interviewPrep = "";
  let clientUpdate = "";
  let resources: string[] = [];

  if (cleanRole === "student") {
    safestNextMove = `Open your notes folder and create a document titled "${taskTitle}".`;
    firstFiveMinuteAction = "Write down your thesis statement or three core sections to cover.";
    coachLine = "This assignment is just a series of small paragraphs. Write the worst first draft possible to clear the starting hurdle.";
    checklist = ["Read rubric carefully", "Outline 3 main body arguments", "Draft introduction", "Review calculations", "Upload PDF"];
    studyPlan = `Study focus for ${taskTitle}:\n- Block 1: Review lecture notes on ${category} (25m)\n- Block 2: Draft main outline with raw bullet points (25m)`;
    resources = ["Class slides", "Assignment guidelines document", "Reference links"];
  } else if (cleanRole === "professional") {
    safestNextMove = `Open your email draft or workspace for "${taskTitle}".`;
    firstFiveMinuteAction = "Paste the main meeting agenda or core update items into the file.";
    coachLine = "Work recovery is about triage. Focus on high-visibility compliance items first, then polish details.";
    checklist = ["Gather department milestone logs", "Identify three bottleneck metrics", "Outline executive summary", "Schedule follow-up review"];
    emailDraft = `Subject: Quick Update: ${taskTitle}\n\nHi Team,\n\nI am compiling the report for ${taskTitle} and expect to complete the review shortly.\n\nBest regards,`;
    meetingBrief = `Sync Points for ${taskTitle}:\n1. Target timeline alignment\n2. Blockers identified on ${category}\n3. Actionable handoffs`;
    resources = ["SLA charts", "Manager status emails", "Corporate template deck"];
  } else if (cleanRole === "entrepreneur") {
    safestNextMove = `Locate the contract or spreadsheet for "${taskTitle}".`;
    firstFiveMinuteAction = "Highlight the top 3 highest-priority figures or terms.";
    coachLine = "Protect your cash flow and brand momentum. Let's draft a high-level skeleton to keep this client delivery safe.";
    checklist = ["Review liquidation or payment terms", "Draft risk-reduction bullet points", "Verify numbers on invoice/proposal", "Send update to stakeholders"];
    clientUpdate = `Dear Investor/Client,\n\nWe are finalized on the upcoming milestones for ${taskTitle}. Here is a high-level summary of our primary focus points...`;
    resources = ["Term sheets", "Headcount sheets", "Pitch slide deck"];
  } else if (cleanRole === "freelancer") {
    safestNextMove = `Open the client project folder and list 3 raw subtasks.`;
    firstFiveMinuteAction = "Open your graphic tool/editor and set up your template file.";
    coachLine = "Keep client alignment crisp. Deliver a solid skeleton draft today so they can give feedback early.";
    checklist = ["Verify client brief constraints", "Assemble vector assets / source files", "Build skeleton layout draft", "Write brief description of design choices"];
    clientUpdate = `Hi [Client],\n\nI have initiated work on ${taskTitle} and wanted to share our baseline timeline for feedback...`;
    resources = ["Figma guidelines", "Client brief text", "Brand color codes"];
  } else { // job_seeker
    safestNextMove = `Open your resume and search for achievements related to "${taskTitle}".`;
    firstFiveMinuteAction = "Write 1 paragraph detailing a successful project you led.";
    coachLine = "Confidence is built on physical prep. Speak your answers out loud before writing them down.";
    checklist = ["Read job description highlight metrics", "Structure 3 STAR stories for senior role", "Send connection note", "Practice interview answers out loud"];
    interviewPrep = `Q1: Tell me about a time you solved a bottleneck like ${taskTitle}?\nA: [Insert achievement showing KPI increases]`;
    resources = ["STAR worksheet", "Target company mission page", "Polite outreach draft"];
  }

  const calculatedUrgency = difficulty + importance > 7 ? "critical" : difficulty + importance > 5 ? "high" : "medium";

  return {
    taskUnderstanding: `This task covers "${taskTitle}" categorized under "${category}". Given your profile, this represents a major focus node where ${cleanObstacle} could cause compressed review intervals.`,
    riskSummary: `Urgency is evaluated as ${calculatedUrgency.toUpperCase()} due to an importance rating of ${importance}/5 and a difficulty of ${difficulty}/5. Delaying this will severely limit your buffer capacity.`,
    safestNextMove,
    firstFiveMinuteAction,
    rescueTimeline: [
      { label: "Start now", completionChance: 95, consequence: "Zero stress, maximum sleep, 4-hour safety buffer preserved." },
      { label: "Start in 2 hours", completionChance: 80, consequence: "Minor pressure, slightly compressed rest period." },
      { label: "Start tonight", completionChance: 60, consequence: "High fatigue, zero room for mistakes or system crashes." },
      { label: "Start tomorrow", completionChance: 35, consequence: "Panic-driven triage. Significant reduction in delivery quality." },
      { label: "Too late", completionChance: 10, consequence: "Missed deadline. Will require immediate apology or extension draft." }
    ],
    microSteps: [
      `Step 1: frictionless setup - locate all reference files for ${taskTitle} and set focus timer.`,
      `Step 2: draft core outline - assemble raw bullet points for main parts without writing full sentences.`,
      `Step 3: composition sprint - spend one focused interval on the hardest segment.`,
      `Step 4: review buffer - clear spelling errors and verify rubric compliance.`,
      `Step 5: final upload - submit and mark completed on your dashboard.`
    ],
    timeBlocks: [
      { label: "Sprint 1: Frictionless Outline", duration: "15m", goal: "Set up file, paste constraints, write 3 main bullet points." },
      { label: "Sprint 2: Deep Composition", duration: "35m", goal: "Complete 80% of the hardest sections with simple phrasing." },
      { label: "Sprint 3: Proofing & Compliance", duration: "15m", goal: "Clean formatting, eliminate structural errors." }
    ],
    riskFactors: [
      "Detail rabbit holes: over-polishing small sections before drafting the whole piece.",
      "Distraction intervals: leaving social media notifications on during work blocks.",
      "Analysis paralysis: waiting for perfect inspiration instead of writing raw text."
    ],
    fallbackPlan: "If you run out of time, compile a simplified minimum-viable draft and submit immediately. Done is superior to perfect.",
    definitionOfDone: `All core requirements of "${taskTitle}" are visible, clean, and exported to PDF/workspace, ready for immediate review.`,
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
      { agent: "Capture Agent", action: "Identify task name and role guidelines", output: `Captured "${taskTitle}" under role: ${cleanRole}.` },
      { agent: "Risk Agent", action: "Evaluate timeline pressure thresholds", output: `Urgency is ${calculatedUrgency}. Calculated risk index of ${importance * 18}%.` },
      { agent: "Planner Agent", action: "Formulate low-friction sequence steps", output: "Drafted 5-step sequence targeting immediate, low-barrier starting points." },
      { agent: "Scheduler Agent", action: "Distribute workload into Pomodoro intervals", output: "Allocated 65 minutes of active block time separated by buffers." },
      { agent: "Execution Agent", action: "Generate specialized action assets", output: "Created targeted role assets (drafts, briefs, study plans) for frictionless use." },
      { agent: "Coach Agent", action: "Formulate empathetic nudge", output: "Injected low-stress coaching lines directly targeting start friction." },
      { agent: "Reflection Agent", action: "Audit plan for over-engineering risks", output: "Stripped secondary requirements to guarantee deadline compliance." }
    ],
    isLocalFallback: true
  };
}

// Endpoint 1: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Endpoint 2: Core AI Rescue Plan Generator
app.post("/api/generate-rescue-plan", async (req, res) => {
  const { 
    taskTitle, 
    description, 
    category, 
    dueDate, 
    deadlineDateTime,
    roleStyle, 
    roleContext,
    role,
    biggestDeadlineProblem,
    importance,
    difficulty,
    confidence
  } = req.body;

  const titleStr = taskTitle || req.body.title || "Untitled Milestone";
  const notesStr = description || req.body.notes || "";
  const catStr = category || "General";
  const finalRole = role || roleStyle || roleContext || "student";
  const obstacleStr = biggestDeadlineProblem || "procrastination";
  const finalImportance = Number(importance) || 3;
  const finalDifficulty = Number(difficulty) || 3;

  if (!titleStr) {
    return res.status(400).json({ error: "Milestone title is required." });
  }

  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key found. Using rich local fallback for rescue plan.");
    const fallback = getLocalRescuePlan(
      titleStr, 
      notesStr, 
      catStr, 
      finalRole, 
      obstacleStr, 
      finalImportance, 
      finalDifficulty
    );
    return res.json(fallback);
  }

  try {
    const prompt = `
Task Details:
- Title: "${titleStr}"
- Details: "${notesStr}"
- Category: "${catStr}"
- Due Date: "${dueDate || deadlineDateTime || "Unspecified"}"
- User Role Profile: "${finalRole}"
- Obstacle: "${obstacleStr}"
- Importance (1-5): ${finalImportance}
- Difficulty (1-5): ${finalDifficulty}
- Confidence (1-5): ${Number(confidence) || 3}

Generate a comprehensive, realistic, action-oriented deadline rescue plan conforming strictly to the requested JSON schema.
Ensure your advice is fully customized for a ${finalRole} battling "${obstacleStr}".
Follow multi-agent orchestration instructions. Run Capture Agent, Risk Agent, Planner Agent, Scheduler Agent, Execution Agent, Coach Agent, and Reflection Agent sequentially and record their exact traces inside "agentTrace".
The output must be structured, helpful, and free of generic fluff. Provide real draft letters, briefs, or plans inside "actionPack".
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are DueMate AI, a practical deadline rescue concierge. Your job is to help users finish what is due before panic begins. Be specific, honest, and action-oriented. Never give vague productivity advice. Always produce realistic next actions, time blocks, fallback plans, and user-approved execution assets. Output must be valid JSON matching the requested schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskUnderstanding: { type: Type.STRING },
            riskSummary: { type: Type.STRING },
            safestNextMove: { type: Type.STRING },
            firstFiveMinuteAction: { type: Type.STRING },
            rescueTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  completionChance: { type: Type.INTEGER },
                  consequence: { type: Type.STRING }
                },
                required: ["label", "completionChance", "consequence"]
              }
            },
            microSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  goal: { type: Type.STRING }
                },
                required: ["label", "duration", "goal"]
              }
            },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            fallbackPlan: { type: Type.STRING },
            definitionOfDone: { type: Type.STRING },
            actionPack: {
              type: Type.OBJECT,
              properties: {
                checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                emailDraft: { type: Type.STRING },
                meetingBrief: { type: Type.STRING },
                studyPlan: { type: Type.STRING },
                interviewPrep: { type: Type.STRING },
                clientUpdate: { type: Type.STRING },
                resourcesToCollect: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["checklist", "emailDraft", "meetingBrief", "studyPlan", "interviewPrep", "clientUpdate", "resourcesToCollect"]
            },
            coachLine: { type: Type.STRING },
            agentTrace: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agent: { type: Type.STRING },
                  action: { type: Type.STRING },
                  output: { type: Type.STRING }
                },
                required: ["agent", "action", "output"]
              }
            }
          },
          required: [
            "taskUnderstanding", "riskSummary", "safestNextMove", "firstFiveMinuteAction", "rescueTimeline",
            "microSteps", "timeBlocks", "riskFactors", "fallbackPlan", "definitionOfDone", "actionPack",
            "coachLine", "agentTrace"
          ]
        }
      }
    });

    const parsedPlan = JSON.parse(response.text || "{}");
    return res.json(parsedPlan);

  } catch (err: any) {
    const isHighDemand = err && (err.status === 503 || err.code === 503 || String(err).includes("503") || String(err).includes("UNAVAILABLE") || String(err).includes("high demand"));
    
    if (isHighDemand) {
      console.warn("Gemini Service is temporarily experiencing high demand (503). Running premium local fallback rescue planner.");
    } else {
      console.error("Gemini Plan Generation Error:", err?.message || err);
    }

    // Graceful fallback to premium local calculation
    const fallback = getLocalRescuePlan(
      titleStr, 
      notesStr, 
      catStr, 
      finalRole, 
      obstacleStr, 
      finalImportance, 
      finalDifficulty
    );

    if (isHighDemand) {
      fallback.coachLine = `[DueMate Client Local Triage Mode] Due to high network traffic on Gemini services, we have engaged our local heuristic planner. ${fallback.coachLine}`;
    }

    return res.json(fallback);
  }
});

// Endpoint 3: Dynamic AI Delay Simulator
app.post("/api/simulate-delay", async (req, res) => {
  const { 
    taskId,
    taskTitle, 
    dueDate, 
    deadlineDateTime,
    delayDuration, 
    originalRisk, 
    roleStyle,
    roleContext,
    role,
    otherTasks 
  } = req.body;

  const titleStr = taskTitle || req.body.title || "Untitled Milestone";
  const cleanRole = role || roleStyle || roleContext || "student";
  const cleanDuration = delayDuration || "1d";
  const currentRisk = Number(originalRisk) || 45;

  // Derive simple conflicts locally in case Gemini is offline or for fallback reference
  const pendingMilestones = Array.isArray(otherTasks) ? otherTasks : [];
  const localConflicts = pendingMilestones
    .filter((t: any) => t.title && t.title !== titleStr && t.status !== 'rescued')
    .map((t: any) => t.title)
    .slice(0, 2);

  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key found. Generating local delay simulation matrix.");
    
    // Local fallback logic
    const riskMultiplier = cleanDuration === "1h" ? 1.15 : cleanDuration === "1d" ? 1.6 : 2.8;
    const simulatedRisk = Math.min(100, Math.round(currentRisk * riskMultiplier));
    const stressIncrease = Math.round((simulatedRisk - currentRisk) * 1.2);

    let impactLevel: 'minor' | 'moderate' | 'severe' | 'catastrophic' = "moderate";
    let timelineShift = "";
    let survivalAction = "";
    let dynamicMessage = "";
    let whatToSkip = "";
    let whatToDoFirst = "";
    let honestRecommendation = "";
    let likelyRecoveryTime = "2 hours";

    if (cleanDuration === "1h") {
      impactLevel = "minor";
      timelineShift = "Pushes focus window 1 hour down. Compresses your evening safety buffer.";
      survivalAction = "Spend 10 minutes outlining a skeletal skeleton model right now.";
      dynamicMessage = "A 1-hour delay won't sink you, but it chips away at your margin. Getting past the start block now is optimal.";
      whatToSkip = "Detailed font design and heavy spellchecking on draft 1.";
      whatToDoFirst = "Open the files and write down 3 headers to claim starting momentum.";
      honestRecommendation = "You are overthinking the difficulty. Open the draft. Motivation will follow the physical action.";
      likelyRecoveryTime = "1 hour of evening catch-up.";
    } else if (cleanDuration === "1d") {
      impactLevel = "severe";
      timelineShift = "Shifts core drafting to tomorrow, creating direct overlap with other active items.";
      survivalAction = "Execute a 15-minute skeleton draft tonight to maintain starting momentum.";
      dynamicMessage = "Postponing by a full day increases delivery risk significantly. Your buffer will be fully exhausted.";
      whatToSkip = "In-depth research reading. Focus entirely on layout and raw structure first.";
      whatToDoFirst = "Schedule a clear 1-hour focus session tomorrow morning.";
      honestRecommendation = "Delaying this is a classic avoidance reflex. Spend 5 minutes on a rough list right now to disarm the stress.";
      likelyRecoveryTime = "4 hours of high-stress catch-up.";
    } else { // 1w or longer
      impactLevel = "catastrophic";
      timelineShift = "Forces you past the formal target delivery window. No safety margin.";
      survivalAction = "Contact supervisor/client to request a realistic 24h buffer extension immediately.";
      dynamicMessage = "Critical alert: Procrastinating for a week completely compromises the submission. Active crisis triage required.";
      whatToSkip = "Secondary requirements. Skip all optional compliance elements.";
      whatToDoFirst = "Draft a formal, polite extension request letter or negotiate basic milestones.";
      honestRecommendation = "You have fully exhausted your capacity. Stop avoiding this. Triage a simplified version immediately.";
      likelyRecoveryTime = "12 hours of emergency focus.";
    }

    return res.json({
      taskId: taskId || "temp-id",
      taskTitle: titleStr,
      delayDuration: cleanDuration,
      originalRisk: currentRisk,
      simulatedRisk,
      impactLevel,
      timelineShift,
      survivalAction,
      dynamicMessage,
      overlappingConflicts: localConflicts.length > 0 ? localConflicts : ["Other pending delivery items", "Private rest time"],
      estimatedStressIncrease: Math.min(100, Math.max(5, stressIncrease)),
      likelyRecoveryTime,
      whatToSkip,
      whatToDoFirst,
      honestRecommendation
    });
  }

  try {
    const prompt = `
Task Title: "${titleStr}"
Role Context: "${cleanRole}"
Requested Delay: "${cleanDuration}" (1h, 1d, 1w)
Original Risk Index: ${currentRisk} / 100
Other Pending Deadlines: ${JSON.stringify(localConflicts)}

Calculate a detailed risk, stress and conflict projection. Ensure simulatedRisk is between 0 and 100.
Conform strictly to the requested response schema. Provide blunt, supportive, and highly actionable diagnostic projections.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are the DueMate AI Delay Simulator. Your task is to calculate the realistic impact of delaying an action. Provide constructive, clear, realistic feedback. Avoid generic advice. Tone should be professional, slightly dramatic but highly stabilizing.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simulatedRisk: { type: Type.INTEGER },
            impactLevel: { type: Type.STRING },
            timelineShift: { type: Type.STRING },
            survivalAction: { type: Type.STRING },
            dynamicMessage: { type: Type.STRING },
            overlappingConflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedStressIncrease: { type: Type.INTEGER },
            likelyRecoveryTime: { type: Type.STRING },
            whatToSkip: { type: Type.STRING },
            whatToDoFirst: { type: Type.STRING },
            honestRecommendation: { type: Type.STRING }
          },
          required: [
            "simulatedRisk", "impactLevel", "timelineShift", "survivalAction", "dynamicMessage",
            "overlappingConflicts", "estimatedStressIncrease", "likelyRecoveryTime", "whatToSkip",
            "whatToDoFirst", "honestRecommendation"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      taskId: taskId || "temp-id",
      taskTitle: titleStr,
      delayDuration: cleanDuration,
      originalRisk: currentRisk,
      ...parsed
    });

  } catch (err: any) {
    const isHighDemand = err && (err.status === 503 || err.code === 503 || String(err).includes("503") || String(err).includes("UNAVAILABLE") || String(err).includes("high demand"));
    
    if (isHighDemand) {
      console.warn("Gemini Service is temporarily experiencing high demand (503). Running premium local fallback delay simulator.");
    } else {
      console.error("Gemini Delay Simulation Error:", err?.message || err);
    }

    // Return fallback as reference
    const fallbackRisk = Math.min(100, Math.round(currentRisk * (cleanDuration === "1h" ? 1.15 : cleanDuration === "1d" ? 1.6 : 2.5)));
    const dynamicMsg = isHighDemand
      ? "Avoidance raises cognitive anxiety. [Local Simulator Mode engaged due to high Gemini traffic] Starting is the fastest path to mental peace."
      : "Avoidance raises cognitive anxiety. Starting is the fastest path to mental peace.";

    return res.json({
      taskId: taskId || "temp-id",
      taskTitle: titleStr,
      delayDuration: cleanDuration,
      originalRisk: currentRisk,
      simulatedRisk: fallbackRisk,
      impactLevel: fallbackRisk > 80 ? "catastrophic" : fallbackRisk > 55 ? "severe" : "moderate",
      timelineShift: "Compresses remaining buffer capacity, risking conflict with incoming items.",
      survivalAction: "Commit to a tiny, easy action block (10 mins) immediately.",
      dynamicMessage: dynamicMsg,
      overlappingConflicts: localConflicts.length > 0 ? localConflicts : ["Incoming review targets"],
      estimatedStressIncrease: 25,
      likelyRecoveryTime: "3 hours of high pressure sprint",
      whatToSkip: "Perfectionist research rabbit holes",
      whatToDoFirst: "Open the file and list three bullet points.",
      honestRecommendation: "Action precedes motivation. Take a tiny action right now."
    });
  }
});

// Configure Vite middleware for development or Serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DueMate AI] Server active at http://localhost:${PORT}`);
  });
}

startServer();
