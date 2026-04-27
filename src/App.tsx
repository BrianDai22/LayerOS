import {
  ArrowUp,
  ChevronRight,
  Monitor,
  Plus,
  Settings,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  animate,
} from "motion/react";
import {
  FormEvent,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";

type WorkflowId = "client-call" | "company-research" | "finance-report" | "plan-day";
type WindowId =
  | "transcript"
  | "response"
  | "next"
  | "snapshot"
  | "radar"
  | "notes"
  | "risk"
  | "metrics"
  | "assumptions"
  | "memo"
  | "sources"
  | "timeline"
  | "priority"
  | "focus"
  | "prep";
type WindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type DragHandleProps = HTMLAttributes<HTMLElement>;

type Workflow = {
  id: WorkflowId;
  label: string;
  description: string;
  icon: ReactNode;
  promptHints: string[];
};

const workflows: Workflow[] = [
  {
    id: "client-call",
    label: "Client Call",
    description: "Live call prep and response assist",
    icon: <GeneratedIcon name="client-call" />,
    promptHints: ["call", "client", "transcript", "sales", "deal"],
  },
  {
    id: "company-research",
    label: "Company Research",
    description: "Summarize signals and risks",
    icon: <GeneratedIcon name="company-research" />,
    promptHints: ["company", "research", "market", "competitor", "risk"],
  },
  {
    id: "finance-report",
    label: "Finance Report",
    description: "Build model and memo",
    icon: <GeneratedIcon name="finance-report" />,
    promptHints: ["finance", "report", "model", "memo", "roi"],
  },
  {
    id: "plan-day",
    label: "Plan My Day",
    description: "Prioritize work and meetings",
    icon: <GeneratedIcon name="plan-day" />,
    promptHints: ["day", "plan", "schedule", "meeting", "priority"],
  },
];

const fallbackWorkflow: WorkflowId = "client-call";

let nextWindowZIndex = 20;

const workspaceRects: Record<WorkflowId, Partial<Record<WindowId, WindowRect>>> = {
  "client-call": {
    transcript: { x: 0, y: 74, width: 340, height: 360 },
    response: { x: 370, y: 74, width: 340, height: 360 },
    next: { x: 740, y: 74, width: 340, height: 360 },
  },
  "company-research": {
    snapshot: { x: 0, y: 104, width: 330, height: 340 },
    radar: { x: 374, y: 104, width: 332, height: 340 },
    notes: { x: 750, y: 104, width: 330, height: 160 },
    risk: { x: 750, y: 284, width: 330, height: 160 },
  },
  "finance-report": {
    metrics: { x: 0, y: 104, width: 324, height: 340 },
    assumptions: { x: 354, y: 104, width: 286, height: 340 },
    memo: { x: 670, y: 104, width: 410, height: 218 },
    sources: { x: 670, y: 342, width: 410, height: 102 },
  },
  "plan-day": {
    timeline: { x: 0, y: 104, width: 458, height: 340 },
    priority: { x: 488, y: 104, width: 278, height: 340 },
    focus: { x: 796, y: 104, width: 284, height: 154 },
    prep: { x: 796, y: 278, width: 284, height: 166 },
  },
};

function App() {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [prompt, setPrompt] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === activeWorkflow),
    [activeWorkflow]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsBooting(false);
    }, shouldReduceMotion ? 260 : 2400);

    return () => window.clearTimeout(timeout);
  }, [shouldReduceMotion]);

  function selectWorkflow(id: WorkflowId) {
    setActiveWorkflow(id);
    setIsPaletteOpen(false);
    setPrompt("");
  }

  function resetWorkspace() {
    setActiveWorkflow(null);
    setIsPaletteOpen(false);
    setPrompt("");
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPrompt = prompt.trim().toLowerCase();

    if (!nextPrompt) {
      setIsPaletteOpen((value) => !value);
      return;
    }

    const matchedWorkflow =
      workflows.find((workflow) =>
        workflow.promptHints.some((hint) => nextPrompt.includes(hint))
      )?.id ?? fallbackWorkflow;

    selectWorkflow(matchedWorkflow);
  }

  return (
    <>
      <CursorClickEffect disabled={Boolean(shouldReduceMotion)} />
      <AnimatePresence>{isBooting && <BootScreen />}</AnimatePresence>
      <main
        className={`os-shell ${activeWorkflow ? "has-workspace" : "is-idle"} ${
          isPaletteOpen ? "has-palette" : ""
        } ${isBooting ? "is-booting" : "is-ready"}`}
        aria-label="LayerOS demo"
      >
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />

        <TopChrome />
        <DesktopRail />

        <section className="workspace-stage" aria-live="polite">
          <AnimatePresence mode="wait">
            {selectedWorkflow ? (
              <motion.div
                key={selectedWorkflow.id}
                className="workspace-motion-wrap"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18, scale: shouldReduceMotion ? 1 : 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12, scale: shouldReduceMotion ? 1 : 0.99 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <WorkspaceExit workflow={selectedWorkflow} onReset={resetWorkspace} />
                <Workspace workflow={selectedWorkflow} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="empty-canvas"
                aria-label="Blank LayerOS canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.24 }}
              />
            )}
          </AnimatePresence>
        </section>

        <ControlDeck
          isPaletteOpen={isPaletteOpen}
          prompt={prompt}
          activeWorkflow={activeWorkflow}
          onPromptChange={setPrompt}
          onPromptSubmit={submitPrompt}
          onTogglePalette={() => setIsPaletteOpen((value) => !value)}
          onSelectWorkflow={selectWorkflow}
        />
      </main>
    </>
  );
}

function BootScreen() {
  const shouldReduceMotion = useReducedMotion();
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = ["Loading workspace layer", "Syncing permissions", "Preparing AI workspace"];

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setStatusIndex((index) => Math.min(index + 1, statuses.length - 1));
    }, 720);

    return () => window.clearInterval(interval);
  }, [shouldReduceMotion, statuses.length]);

  return (
    <motion.div
      className="boot-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.015, filter: "blur(10px)" }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="LayerOS boot screen"
    >
      <motion.div
        className="boot-card liquid-surface"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.52, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="boot-mark">
          <GeneratedIcon name="layer-mark" />
        </span>
        <strong>LayerOS</strong>
        <AnimatePresence mode="wait">
          <motion.span
            key={statuses[statusIndex]}
            className="boot-status"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.22 }}
          >
            {statuses[statusIndex]}
          </motion.span>
        </AnimatePresence>
        <span className="boot-progress" aria-hidden="true">
          <motion.i
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 2.05, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}

function CursorClickEffect({ disabled }: { disabled: boolean }) {
  const [blooms, setBlooms] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const id = Date.now() + Math.random();
      setBlooms((items) => [...items.slice(-5), { id, x: event.clientX, y: event.clientY }]);
      const timeout = window.setTimeout(() => {
        setBlooms((items) => items.filter((item) => item.id !== id));
      }, 560);
      timersRef.current.push(timeout);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [disabled]);

  return (
    <div className="click-effect-layer" aria-hidden="true">
      <AnimatePresence>
        {blooms.map((bloom) => (
          <motion.span
            key={bloom.id}
            className="click-bloom"
            style={{ left: bloom.x, top: bloom.y }}
            initial={{ opacity: 0.86, scale: 0.18 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <i />
            <i />
            <i />
            <i />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DesktopRail() {
  return (
    <aside className="desktop-rail" aria-label="Desktop shortcuts">
      <motion.button
        type="button"
        className="desktop-shortcut"
        aria-label="Open workspace folder"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>
          <GeneratedIcon name="workspace-stack" />
        </span>
        <small>Workspaces</small>
      </motion.button>
      <motion.button
        type="button"
        className="desktop-shortcut"
        aria-label="Open call notes"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>
          <GeneratedIcon name="call-notes" />
        </span>
        <small>Call Notes</small>
      </motion.button>
      <motion.button
        type="button"
        className="desktop-shortcut"
        aria-label="Open calendar"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>
          <GeneratedIcon name="calendar-tile" />
        </span>
        <small>Calendar</small>
      </motion.button>
    </aside>
  );
}

function TopChrome() {
  return (
    <>
      <motion.div
        className="top-pill brand-pill liquid-surface"
        aria-label="LayerOS"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        <GeneratedIcon name="layer-mark" />
        <strong>LayerOS</strong>
        <span className="status-dot" />
      </motion.div>

      <motion.div
        className="top-pill time-pill liquid-surface"
        aria-label="Time"
        initial={{ opacity: 0, y: -8, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ duration: 0.38, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <strong>11:43 PM</strong>
        <span>UTC</span>
      </motion.div>

      <motion.div
        className="top-pill system-pill liquid-surface"
        aria-label="System controls"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <button type="button" aria-label="Settings">
          <Settings />
        </button>
        <span className="pill-divider" />
        <button type="button" aria-label="Display">
          <Monitor />
        </button>
        <span className="pill-divider" />
        <button type="button" className="avatar-button" aria-label="User profile">
          A
        </button>
      </motion.div>
    </>
  );
}

function WorkspaceExit({
  workflow,
  onReset,
}: {
  workflow: Workflow;
  onReset: () => void;
}) {
  const isCall = workflow.id === "client-call";

  return (
    <motion.button
      type="button"
      className={`workspace-exit liquid-surface ${isCall ? "is-call" : ""}`}
      onClick={onReset}
      aria-label={isCall ? "End client call and return to blank canvas" : "Close workspace and return to blank canvas"}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <GeneratedIcon name={isCall ? "end-call" : "reset-canvas"} />
      <span>{isCall ? "End Call" : "Close"}</span>
    </motion.button>
  );
}

function ControlDeck({
  isPaletteOpen,
  prompt,
  activeWorkflow,
  onPromptChange,
  onPromptSubmit,
  onTogglePalette,
  onSelectWorkflow,
}: {
  isPaletteOpen: boolean;
  prompt: string;
  activeWorkflow: WorkflowId | null;
  onPromptChange: (prompt: string) => void;
  onPromptSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTogglePalette: () => void;
  onSelectWorkflow: (id: WorkflowId) => void;
}) {
  return (
    <motion.div
      className="control-deck"
      initial={{ opacity: 0, y: 16, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {!activeWorkflow && !isPaletteOpen && (
        <motion.nav
          className="dock liquid-surface"
          aria-label="Starter workflows"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {workflows.map((workflow) => (
            <motion.button
              key={workflow.id}
              type="button"
              onClick={() => onSelectWorkflow(workflow.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="dock-icon">{workflow.icon}</span>
              <span>{workflow.label}</span>
            </motion.button>
          ))}
        </motion.nav>
      )}

      <div className="composer-wrap">
        <AnimatePresence>
          {isPaletteOpen && (
            <CommandPalette onSelectWorkflow={onSelectWorkflow} onClose={onTogglePalette} />
          )}
        </AnimatePresence>

        <motion.form
          className="composer liquid-surface"
          onSubmit={onPromptSubmit}
          layout
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            type="button"
            className={`plus-button ${isPaletteOpen ? "is-active" : ""}`}
            onClick={onTogglePalette}
            aria-label={isPaletteOpen ? "Hide workflow templates" : "Open workflow templates"}
            aria-expanded={isPaletteOpen}
            whileTap={{ scale: 0.92 }}
          >
            <Plus />
          </motion.button>
          <input
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder={
              activeWorkflow
                ? "Ask LayerOS what to do next..."
                : "What should LayerOS help with?"
            }
            aria-label="Describe what LayerOS should do"
          />
          <motion.button
            type="submit"
            className="send-button"
            aria-label="Submit command"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowUp />
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
}

function CommandPalette({
  onSelectWorkflow,
  onClose,
}: {
  onSelectWorkflow: (id: WorkflowId) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="palette liquid-surface"
      role="menu"
      aria-label="Workflow templates"
      initial={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 12, scale: 0.985, filter: "blur(4px)" }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="palette-header">
        <span>Starter Templates</span>
        <button type="button" onClick={onClose} aria-label="Close workflow templates">
          <X />
        </button>
      </div>
      {workflows.map((workflow, index) => (
        <motion.button
          key={workflow.id}
          type="button"
          className="palette-row"
          onClick={() => onSelectWorkflow(workflow.id)}
          role="menuitem"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04 + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.985 }}
        >
          <span className="palette-icon">{workflow.icon}</span>
          <span>
            <strong>{workflow.label}</strong>
            <small>{workflow.description}</small>
          </span>
          <ChevronRight aria-hidden="true" />
        </motion.button>
      ))}
      <span className="palette-pointer" />
    </motion.div>
  );
}

function Workspace({ workflow }: { workflow: Workflow }) {
  if (workflow.id === "client-call") {
    return <ClientCallWorkspace key={workflow.id} />;
  }

  if (workflow.id === "company-research") {
    return <CompanyResearchWorkspace key={workflow.id} workflow={workflow} />;
  }

  if (workflow.id === "finance-report") {
    return <FinanceReportWorkspace key={workflow.id} workflow={workflow} />;
  }

  return <PlanDayWorkspace key={workflow.id} workflow={workflow} />;
}

function ClientCallWorkspace() {
  const rects = workspaceRects["client-call"];

  return (
    <div className="client-workspace workspace-canvas">
      <div className="call-status liquid-surface">
        <GeneratedIcon name="client-call" />
        <strong>Client Call</strong>
        <span className="live-dot" />
        <span>00:04:28</span>
      </div>

      <DraggableWindow rect={rects.transcript!}>
        {(dragHandleProps) => (
          <Panel
            className="transcript-panel"
            icon={<GeneratedIcon name="live-transcript" />}
            title="Live Transcript"
            dragHandleProps={dragHandleProps}
          >
            <TranscriptLine speaker="Client" time="11:42 PM">
              Budget is tighter this quarter.
            </TranscriptLine>
            <TranscriptLine speaker="Rep" time="11:42 PM">
              Understood.
            </TranscriptLine>
            <TranscriptLine speaker="Client" time="11:43 PM">
              We need proof this saves time.
            </TranscriptLine>
            <div className="listening-row">
              <span className="typing-dots">
                <i />
                <i />
                <i />
              </span>
              <span>Listening...</span>
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.response!}>
        {(dragHandleProps) => (
          <Panel
            className="suggestion-panel"
            icon={<GeneratedIcon name="suggested-response" />}
            title="Suggested Response"
            dragHandleProps={dragHandleProps}
          >
            <div className="response-card">
              <p>Anchor on time saved.</p>
              <p>Offer a small pilot with measurable milestones.</p>
            </div>
            <div className="action-row">
              <button type="button">
                <GeneratedIcon name="rephrase-loop" />
                Rephrase
              </button>
              <button type="button">
                <GeneratedIcon name="save-note" />
                Save note
              </button>
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.next!}>
        {(dragHandleProps) => (
          <Panel
            className="next-panel"
            icon={<GeneratedIcon name="next-steps" />}
            title="Next Steps"
            dragHandleProps={dragHandleProps}
          >
            <ActionItem icon={<GeneratedIcon name="email-draft" />} label="Draft follow-up email" />
            <ActionItem icon={<GeneratedIcon name="attachment-roi" />} label="Attach ROI snapshot" />
            <ActionItem icon={<GeneratedIcon name="risk-flag" />} label="Log pricing concern" />
          </Panel>
        )}
      </DraggableWindow>
    </div>
  );
}

function CompanyResearchWorkspace({ workflow }: { workflow: Workflow }) {
  const rects = workspaceRects["company-research"];

  return (
    <div className="research-workspace workspace-canvas">
      <WorkspaceHeading workflow={workflow} />

      <DraggableWindow rect={rects.snapshot!}>
        {(dragHandleProps) => (
          <Panel
            className="snapshot-panel"
            icon={<GeneratedIcon name="company-research" />}
            title="Company Snapshot"
            dragHandleProps={dragHandleProps}
          >
            <div className="snapshot-score">
              <strong>84</strong>
              <span>Fit Score</span>
            </div>
            <p className="muted-copy">
              Mid-market finance team. Tool consolidation, renewal pressure, and CFO visibility
              are all trending up.
            </p>
            <div className="research-table">
              <span>Buying trigger</span>
              <strong>Renewal in 41 days</strong>
              <span>Workflow pain</span>
              <strong>Manual handoffs</strong>
              <span>Best opener</span>
              <strong>Time saved proof</strong>
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.radar!}>
        {(dragHandleProps) => (
          <Panel
            className="radar-panel"
            icon={<GeneratedIcon name="next-steps" />}
            title="Signals Radar"
            dragHandleProps={dragHandleProps}
          >
            <div className="signal-radar" aria-hidden="true">
              <span className="radar-ring ring-one" />
              <span className="radar-ring ring-two" />
              <span className="radar-ring ring-three" />
              <span className="radar-sweep" />
              <span className="signal-node node-one">Renewal</span>
              <span className="signal-node node-two">CFO</span>
              <span className="signal-node node-three">Ops</span>
              <span className="signal-node node-four">Risk</span>
            </div>
            <p className="radar-caption">Highest-ranked signal: renewal window plus cost control.</p>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.notes!}>
        {(dragHandleProps) => (
          <Panel
            className="competitor-panel"
            icon={<GeneratedIcon name="call-notes" />}
            title="Competitor Notes"
            dragHandleProps={dragHandleProps}
          >
            <CompactList items={["Legacy CRM add-on", "Manual reporting team", "No AI policy layer"]} />
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.risk!}>
        {(dragHandleProps) => (
          <Panel
            className="risk-panel"
            icon={<GeneratedIcon name="risk-flag" />}
            title="Risk Flags"
            dragHandleProps={dragHandleProps}
          >
            <CompactList items={["Procurement review", "Data access concern", "Pilot scope unclear"]} />
          </Panel>
        )}
      </DraggableWindow>
    </div>
  );
}

function FinanceReportWorkspace({ workflow }: { workflow: Workflow }) {
  const rects = workspaceRects["finance-report"];

  return (
    <div className="finance-workspace workspace-canvas">
      <WorkspaceHeading workflow={workflow} />

      <DraggableWindow rect={rects.metrics!}>
        {(dragHandleProps) => (
          <Panel
            className="roi-panel"
            icon={<GeneratedIcon name="finance-report" />}
            title="ROI Snapshot"
            dragHandleProps={dragHandleProps}
          >
            <div className="metric-grid">
              <MetricTile label="Time saved" value="11.4h" />
              <MetricTile label="Payback" value="4.8mo" />
              <MetricTile label="Risk cut" value="23%" />
              <MetricTile label="Teams" value="6" />
            </div>
            <p className="muted-copy">
              LayerOS built the first model from notes, tool usage, and assumptions.
            </p>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.assumptions!}>
        {(dragHandleProps) => (
          <Panel
            className="assumptions-panel"
            icon={<GeneratedIcon name="source-sheet" />}
            title="Assumptions"
            dragHandleProps={dragHandleProps}
          >
            <AssumptionRow label="Users" value="240" />
            <AssumptionRow label="Hourly cost" value="$68" />
            <AssumptionRow label="Adoption" value="62%" />
            <AssumptionRow label="Setup" value="3 weeks" />
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.memo!}>
        {(dragHandleProps) => (
          <Panel
            className="memo-panel"
            icon={<GeneratedIcon name="save-note" />}
            title="Memo Draft"
            dragHandleProps={dragHandleProps}
          >
            <div className="memo-sheet">
              <strong>Executive summary</strong>
              <p>
                Pilot with finance ops first. The strongest case is reclaiming review time and
                reducing approval lag before quarter close.
              </p>
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.sources!}>
        {(dragHandleProps) => (
          <Panel
            className="source-panel"
            icon={<GeneratedIcon name="next-steps" />}
            title="Source Checklist"
            dragHandleProps={dragHandleProps}
          >
            <div className="source-checks">
              <span>CRM export</span>
              <span>Call notes</span>
              <span>Pricing model</span>
            </div>
          </Panel>
        )}
      </DraggableWindow>
    </div>
  );
}

function PlanDayWorkspace({ workflow }: { workflow: Workflow }) {
  const rects = workspaceRects["plan-day"];

  return (
    <div className="day-workspace workspace-canvas">
      <WorkspaceHeading workflow={workflow} />

      <DraggableWindow rect={rects.timeline!}>
        {(dragHandleProps) => (
          <Panel
            className="timeline-panel"
            icon={<GeneratedIcon name="plan-day" />}
            title="Timeline"
            dragHandleProps={dragHandleProps}
          >
            <div className="day-timeline">
              <TimelineItem time="9:00" label="Inbox triage" />
              <TimelineItem time="10:30" label="Client prep" isFocus />
              <TimelineItem time="1:30" label="Team check-in" />
              <TimelineItem time="3:00" label="Finance report" isFocus />
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.priority!}>
        {(dragHandleProps) => (
          <Panel
            className="priority-panel"
            icon={<GeneratedIcon name="next-steps" />}
            title="Priority Stack"
            dragHandleProps={dragHandleProps}
          >
            <div className="priority-stack">
              {["Client call prep", "Finance assumptions", "Move admin work"].map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.34, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.focus!}>
        {(dragHandleProps) => (
          <Panel
            className="focus-panel"
            icon={<GeneratedIcon name="live-transcript" />}
            title="Focus Block"
            dragHandleProps={dragHandleProps}
          >
            <div className="focus-orbit">
              <strong>90 min</strong>
              <span>Protected analysis window</span>
            </div>
          </Panel>
        )}
      </DraggableWindow>

      <DraggableWindow rect={rects.prep!}>
        {(dragHandleProps) => (
          <Panel
            className="meeting-panel"
            icon={<GeneratedIcon name="call-notes" />}
            title="Meeting Prep"
            dragHandleProps={dragHandleProps}
          >
            <CompactList items={["Open notes", "Draft questions", "Send agenda"]} />
          </Panel>
        )}
      </DraggableWindow>
    </div>
  );
}

function WorkspaceHeading({ workflow }: { workflow: Workflow }) {
  return (
    <motion.div
      className="workspace-heading liquid-surface"
      initial={{ opacity: 0, y: -8, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
    >
      <span>{workflow.icon}</span>
      <strong>{workflow.label}</strong>
      <small>{workflow.description}</small>
    </motion.div>
  );
}

function CompactList({ items }: { items: string[] }) {
  return (
    <div className="compact-list">
      {items.map((item, index) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      className="metric-tile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <span>{label}</span>
      <strong>
        <AnimatedMetricValue value={value} />
      </strong>
    </motion.div>
  );
}

function AnimatedMetricValue({ value }: { value: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : "0");

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const match = value.match(/^([^0-9.-]*)([0-9.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const [, prefix, numericValue, suffix] = match;
    const target = Number(numericValue);
    const decimals = numericValue.includes(".") ? numericValue.split(".")[1].length : 0;
    const controls = animate(0, target, {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(`${prefix}${latest.toFixed(decimals)}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [shouldReduceMotion, value]);

  return displayValue;
}

function AssumptionRow({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      className="assumption-row"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.div>
  );
}

function TimelineItem({
  time,
  label,
  isFocus = false,
}: {
  time: string;
  label: string;
  isFocus?: boolean;
}) {
  return (
    <motion.div
      className={`timeline-item ${isFocus ? "is-focus" : ""}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <time>{time}</time>
      <span>{label}</span>
    </motion.div>
  );
}

function DraggableWindow({
  rect,
  children,
}: {
  rect: WindowRect;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
}) {
  const [zIndex, setZIndex] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  function startDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select, a, [data-no-drag]")) {
      return;
    }

    nextWindowZIndex += 1;
    setZIndex(nextWindowZIndex);
    controls.start(event.nativeEvent);
  }

  const maxX = Math.max(0, window.innerWidth - rect.width - 56);
  const maxY = Math.max(0, window.innerHeight - rect.height - 168);

  return (
    <motion.div
      className={`canvas-window ${isDragging ? "is-dragging" : ""}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex,
        x,
        y,
      }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.035}
      dragConstraints={{
        left: -rect.x - 18,
        right: maxX - rect.x,
        top: -rect.y,
        bottom: maxY - rect.y,
      }}
      onPointerDown={startDrag}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onDoubleClick={() => {
        animate(x, 0, { duration: shouldReduceMotion ? 0.01 : 0.34, ease: [0.16, 1, 0.3, 1] });
        animate(y, 0, { duration: shouldReduceMotion ? 0.01 : 0.34, ease: [0.16, 1, 0.3, 1] });
      }}
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {children({
        className: "window-drag-handle",
        "aria-label": "Drag module",
      })}
    </motion.div>
  );
}

function Panel({
  icon,
  title,
  children,
  className,
  dragHandleProps,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
  dragHandleProps?: DragHandleProps;
}) {
  return (
    <article className={`workspace-panel liquid-surface ${className ?? ""}`}>
      <header {...dragHandleProps}>
        <span>{icon}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </article>
  );
}

function TranscriptLine({
  speaker,
  time,
  children,
}: {
  speaker: string;
  time: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="transcript-line"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <span>{speaker}</span>
        <time>{time}</time>
      </div>
      <p>{children}</p>
    </motion.div>
  );
}

function ActionItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <motion.div
      className="action-item"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <span>{icon}</span>
      <p>{label}</p>
    </motion.div>
  );
}

function GeneratedIcon({ name }: { name: string }) {
  return (
    <img
      className="generated-icon"
      src={`/icons/generated/${name}.png`}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default App;
