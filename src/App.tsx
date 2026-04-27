import {
  ArrowUp,
  ChevronRight,
  Monitor,
  Plus,
  Settings,
  X,
} from "lucide-react";
import {
  CSSProperties,
  FormEvent,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
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
  const [prompt, setPrompt] = useState("");

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === activeWorkflow),
    [activeWorkflow]
  );

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
    <main
      className={`os-shell ${activeWorkflow ? "has-workspace" : "is-idle"} ${
        isPaletteOpen ? "has-palette" : ""
      }`}
      aria-label="LayerOS demo"
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <TopChrome />
      <DesktopRail />

      <section className="workspace-stage" aria-live="polite">
        {selectedWorkflow ? (
          <>
            <WorkspaceExit workflow={selectedWorkflow} onReset={resetWorkspace} />
            <Workspace workflow={selectedWorkflow} />
          </>
        ) : (
          <div className="empty-canvas" aria-label="Blank LayerOS canvas" />
        )}
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
  );
}

function DesktopRail() {
  return (
    <aside className="desktop-rail" aria-label="Desktop shortcuts">
      <button type="button" className="desktop-shortcut" aria-label="Open workspace folder">
        <span>
          <GeneratedIcon name="workspace-stack" />
        </span>
        <small>Workspaces</small>
      </button>
      <button type="button" className="desktop-shortcut" aria-label="Open call notes">
        <span>
          <GeneratedIcon name="call-notes" />
        </span>
        <small>Call Notes</small>
      </button>
      <button type="button" className="desktop-shortcut" aria-label="Open calendar">
        <span>
          <GeneratedIcon name="calendar-tile" />
        </span>
        <small>Calendar</small>
      </button>
    </aside>
  );
}

function TopChrome() {
  return (
    <>
      <div className="top-pill brand-pill liquid-surface" aria-label="LayerOS">
        <GeneratedIcon name="layer-mark" />
        <strong>LayerOS</strong>
        <span className="status-dot" />
      </div>

      <div className="top-pill time-pill liquid-surface" aria-label="Time">
        <strong>11:43 PM</strong>
        <span>UTC</span>
      </div>

      <div className="top-pill system-pill liquid-surface" aria-label="System controls">
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
      </div>
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
    <button
      type="button"
      className={`workspace-exit liquid-surface ${isCall ? "is-call" : ""}`}
      onClick={onReset}
      aria-label={isCall ? "End client call and return to blank canvas" : "Close workspace and return to blank canvas"}
    >
      <GeneratedIcon name={isCall ? "end-call" : "reset-canvas"} />
      <span>{isCall ? "End Call" : "Close"}</span>
    </button>
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
    <div className="control-deck">
      {!activeWorkflow && !isPaletteOpen && (
        <nav className="dock liquid-surface" aria-label="Starter workflows">
          {workflows.map((workflow) => (
            <button key={workflow.id} type="button" onClick={() => onSelectWorkflow(workflow.id)}>
              <span className="dock-icon">{workflow.icon}</span>
              <span>{workflow.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="composer-wrap">
        {isPaletteOpen && (
          <CommandPalette onSelectWorkflow={onSelectWorkflow} onClose={onTogglePalette} />
        )}

        <form className="composer liquid-surface" onSubmit={onPromptSubmit}>
          <button
            type="button"
            className={`plus-button ${isPaletteOpen ? "is-active" : ""}`}
            onClick={onTogglePalette}
            aria-label={isPaletteOpen ? "Hide workflow templates" : "Open workflow templates"}
            aria-expanded={isPaletteOpen}
          >
            <Plus />
          </button>
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
          <button type="submit" className="send-button" aria-label="Submit command">
            <ArrowUp />
          </button>
        </form>
      </div>
    </div>
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
    <div className="palette liquid-surface" role="menu" aria-label="Workflow templates">
      <div className="palette-header">
        <span>Starter Templates</span>
        <button type="button" onClick={onClose} aria-label="Close workflow templates">
          <X />
        </button>
      </div>
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          type="button"
          className="palette-row"
          onClick={() => onSelectWorkflow(workflow.id)}
          role="menuitem"
        >
          <span className="palette-icon">{workflow.icon}</span>
          <span>
            <strong>{workflow.label}</strong>
            <small>{workflow.description}</small>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
      ))}
      <span className="palette-pointer" />
    </div>
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
              <span>Client call prep</span>
              <span>Finance assumptions</span>
              <span>Move admin work</span>
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
    <div className="workspace-heading liquid-surface">
      <span>{workflow.icon}</span>
      <strong>{workflow.label}</strong>
      <small>{workflow.description}</small>
    </div>
  );
}

function CompactList({ items }: { items: string[] }) {
  return (
    <div className="compact-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AssumptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="assumption-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
    <div className={`timeline-item ${isFocus ? "is-focus" : ""}`}>
      <time>{time}</time>
      <span>{label}</span>
    </div>
  );
}

function DraggableWindow({
  rect,
  children,
}: {
  rect: WindowRect;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
}) {
  const [position, setPosition] = useState({ x: rect.x, y: rect.y });
  const [zIndex, setZIndex] = useState(1);
  const [drag, setDrag] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function startDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select, a, [data-no-drag]")) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    nextWindowZIndex += 1;
    setZIndex(nextWindowZIndex);
    setDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    });
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const maxX = Math.max(0, window.innerWidth - rect.width - 56);
    const maxY = Math.max(0, window.innerHeight - rect.height - 168);
    setPosition({
      x: clamp(drag.originX + event.clientX - drag.startX, -18, maxX),
      y: clamp(drag.originY + event.clientY - drag.startY, 0, maxY),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag?.pointerId === event.pointerId) {
      setDrag(null);
    }
  }

  const style = {
    "--window-x": `${position.x}px`,
    "--window-y": `${position.y}px`,
    "--window-width": `${rect.width}px`,
    "--window-height": `${rect.height}px`,
    zIndex,
  } as CSSProperties;

  return (
    <div
      className={`canvas-window ${drag ? "is-dragging" : ""}`}
      style={style}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={startDrag}
      onDoubleClick={() => setPosition({ x: rect.x, y: rect.y })}
    >
      {children({
        className: "window-drag-handle",
        "aria-label": "Drag module",
      })}
    </div>
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
    <div className="transcript-line">
      <div>
        <span>{speaker}</span>
        <time>{time}</time>
      </div>
      <p>{children}</p>
    </div>
  );
}

function ActionItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="action-item">
      <span>{icon}</span>
      <p>{label}</p>
    </div>
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
