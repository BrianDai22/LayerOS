import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  Layers3,
  Mail,
  Monitor,
  Paperclip,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Waves,
} from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type WorkflowId = "client-call" | "company-research" | "finance-report" | "plan-day";
type SimpleWorkflowId = Exclude<WorkflowId, "client-call">;

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
    icon: <Phone />,
    promptHints: ["call", "client", "transcript", "sales", "deal"],
  },
  {
    id: "company-research",
    label: "Company Research",
    description: "Summarize signals and risks",
    icon: <Search />,
    promptHints: ["company", "research", "market", "competitor", "risk"],
  },
  {
    id: "finance-report",
    label: "Finance Report",
    description: "Build model and memo",
    icon: <BarChart3 />,
    promptHints: ["finance", "report", "model", "memo", "roi"],
  },
  {
    id: "plan-day",
    label: "Plan My Day",
    description: "Prioritize work and meetings",
    icon: <CalendarDays />,
    promptHints: ["day", "plan", "schedule", "meeting", "priority"],
  },
];

const fallbackWorkflow: WorkflowId = "client-call";

const simpleWorkspaceContent: Record<
  SimpleWorkflowId,
  {
    title: string;
    lead: string;
    primary: string;
    items: string[];
    icon: ReactNode;
  }
> = {
  "company-research": {
    title: "Research Brief",
    lead: "LayerOS gathered a clean company snapshot from public filings, customer signals, and competitor notes.",
    primary: "Top signal: finance teams are consolidating workflow tools before renewal season.",
    items: ["Summarize industry headwinds", "Pull competitor positioning", "Draft questions for discovery"],
    icon: <Building2 />,
  },
  "finance-report": {
    title: "Finance Report",
    lead: "LayerOS prepared the model outline, memo sections, and source checklist for a fast first draft.",
    primary: "Focus: compare implementation cost against expected time saved per team.",
    items: ["Build ROI snapshot", "Create assumptions tab", "Write executive summary"],
    icon: <BarChart3 />,
  },
  "plan-day": {
    title: "Daily Plan",
    lead: "LayerOS sorted meetings, deadlines, and deep-work windows into one simple operating view.",
    primary: "Best next move: finish the client prep before the afternoon check-in.",
    items: ["Protect 90 minutes for analysis", "Move low-priority admin", "Prep call notes by 1:30 PM"],
    icon: <Clock3 />,
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
    <main className="os-shell" aria-label="LayerOS demo">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <TopChrome activeWorkflow={selectedWorkflow} onReset={resetWorkspace} />

      <section className="workspace-stage" aria-live="polite">
        {selectedWorkflow ? (
          <Workspace workflow={selectedWorkflow} />
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

function TopChrome({
  activeWorkflow,
  onReset,
}: {
  activeWorkflow: Workflow | undefined;
  onReset: () => void;
}) {
  return (
    <>
      <div className="top-pill brand-pill liquid-surface" aria-label="LayerOS">
        <Layers3 aria-hidden="true" />
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

      {activeWorkflow && (
        <button
          type="button"
          className="session-pill liquid-surface"
          onClick={onReset}
          aria-label="Clear active workspace"
        >
          {activeWorkflow.id === "client-call" ? (
            <>
              <Phone aria-hidden="true" />
              End Call
            </>
          ) : (
            <>
              <RotateCcw aria-hidden="true" />
              Blank Canvas
            </>
          )}
        </button>
      )}
    </>
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
          <CommandPalette onSelectWorkflow={onSelectWorkflow} />
        )}

        <form className="composer liquid-surface" onSubmit={onPromptSubmit}>
          <button
            type="button"
            className={`plus-button ${isPaletteOpen ? "is-active" : ""}`}
            onClick={onTogglePalette}
            aria-label="Open workflow templates"
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
}: {
  onSelectWorkflow: (id: WorkflowId) => void;
}) {
  return (
    <div className="palette liquid-surface" role="menu" aria-label="Workflow templates">
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
    return <ClientCallWorkspace />;
  }

  return <SimpleWorkspace workflow={workflow} />;
}

function ClientCallWorkspace() {
  return (
    <div className="client-workspace workspace-grid">
      <div className="call-status liquid-surface">
        <Phone aria-hidden="true" />
        <strong>Client Call</strong>
        <span className="live-dot" />
        <span>00:04:28</span>
      </div>

      <Panel className="transcript-panel" icon={<Waves />} title="Live Transcript">
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

      <Panel className="suggestion-panel" icon={<Sparkles />} title="Suggested Response">
        <div className="response-card">
          <p>Anchor on time saved.</p>
          <p>Offer a small pilot with measurable milestones.</p>
        </div>
        <div className="action-row">
          <button type="button">
            <RotateCcw />
            Rephrase
          </button>
          <button type="button">
            <FileText />
            Save note
          </button>
        </div>
      </Panel>

      <Panel className="next-panel" icon={<CheckSquare />} title="Next Steps">
        <ActionItem icon={<Mail />} label="Draft follow-up email" />
        <ActionItem icon={<Paperclip />} label="Attach ROI snapshot" />
        <ActionItem icon={<AlertTriangle />} label="Log pricing concern" />
      </Panel>
    </div>
  );
}

function SimpleWorkspace({ workflow }: { workflow: Workflow }) {
  const workspaceContent = simpleWorkspaceContent[workflow.id as SimpleWorkflowId];

  return (
    <div className="simple-workspace">
      <div className="workspace-heading liquid-surface">
        <span>{workflow.icon}</span>
        <strong>{workflow.label}</strong>
        <small>{workflow.description}</small>
      </div>

      <Panel className="simple-primary-panel" icon={workspaceContent.icon} title={workspaceContent.title}>
        <p className="muted-copy">{workspaceContent.lead}</p>
        <div className="response-card compact">
          <p>{workspaceContent.primary}</p>
        </div>
      </Panel>

      <Panel className="simple-side-panel" icon={<CheckSquare />} title="LayerOS Next Steps">
        {workspaceContent.items.map((item) => (
          <ActionItem key={item} icon={<Circle />} label={item} />
        ))}
      </Panel>
    </div>
  );
}

function Panel({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`workspace-panel liquid-surface ${className ?? ""}`}>
      <header>
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

export default App;
