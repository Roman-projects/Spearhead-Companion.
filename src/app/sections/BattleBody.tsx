import { useState } from "react";

type PhaseId = "hero" | "movement" | "shooting" | "charge" | "combat" | "end";
type TurnSide = "own" | "opponent";
type ViewMode = "reduced" | "complete";
type ContentBlock = { heading: string; items: string[] };

const phases: { id: PhaseId; label: string }[] = [
  { id: "hero", label: "Hero" }, { id: "movement", label: "Movement" },
  { id: "shooting", label: "Shooting" }, { id: "charge", label: "Charge" },
  { id: "combat", label: "Combat" }, { id: "end", label: "End of Turn" },
];

const phaseContent: Record<PhaseId, { own: ContentBlock[]; opponent: ContentBlock[]; fullOwn: ContentBlock[]; fullOpponent: ContentBlock[] }> = {
  hero: {
    own: [{ heading: "Abilities", items: ["Go-Go, Hunt Them Down"] }],
    opponent: [],
    fullOwn: [{ heading: "Abilities", items: ["Go-Go, Hunt Them Down"] }, { heading: "Rules", items: ["General Hero Phase rules"] }],
    fullOpponent: [{ heading: "Rules", items: ["No Crixxit’s Kill-Pack Hero Phase abilities apply during the opponent’s turn."] }],
  },
  movement: {
    own: [
      { heading: "Reinforcement", items: ["Gutter Runners 1", "Gutter Runners 2", "Night Runners"] },
      { heading: "Movement", items: ["Deathmaster Crixxit · Move 7”", "Deathmaster · Move 7”", "Gutter Runners 1 · Move 7”", "Gutter Runners 2 · Move 7”", "Night Runners · Move 7”"] },
    ],
    opponent: [],
    fullOwn: [
      { heading: "Reinforcement", items: ["Gutter Runners 1", "Gutter Runners 2", "Night Runners"] },
      { heading: "Movement", items: ["Deathmaster Crixxit · Move 7”", "Deathmaster · Move 7”", "Gutter Runners 1 · Move 7”", "Gutter Runners 2 · Move 7”", "Night Runners · Move 7”"] },
      { heading: "Rules", items: ["Normal Move", "Run", "Retreat", "Call for Reinforcements"] },
    ],
    fullOpponent: [{ heading: "Movement", items: ["Deathmaster Crixxit · Move 7” (unavailable)", "Deathmaster · Move 7” (unavailable)", "Gutter Runners 1 · Move 7” (unavailable)", "Gutter Runners 2 · Move 7” (unavailable)", "Night Runners · Move 7” (unavailable)"] }],
  },
  shooting: {
    own: [{ heading: "Abilities", items: [] }, { heading: "Weapons", items: ["Night Runners · Slings and Poisoned Stars"] }],
    opponent: [],
    fullOwn: [{ heading: "Abilities", items: [] }, { heading: "Weapons", items: ["Night Runners · Slings and Poisoned Stars"] }, { heading: "Rules", items: ["Shoot", "Shoot in Combat"] }],
    fullOpponent: [{ heading: "Weapons", items: ["Night Runners · Slings and Poisoned Stars (unavailable)"] }],
  },
  charge: {
    own: [{ heading: "Abilities", items: ["Gutter Runners 1 · Bomb Rats", "Gutter Runners 2 · Bomb Rats"] }, { heading: "Charge", items: ["Deathmaster Crixxit · 2D6", "Deathmaster · 2D6", "Gutter Runners 1 · 2D6", "Gutter Runners 2 · 2D6", "Night Runners · 2D6"] }],
    opponent: [],
    fullOwn: [{ heading: "Abilities", items: ["Gutter Runners 1 · Bomb Rats", "Gutter Runners 2 · Bomb Rats"] }, { heading: "Charge", items: ["Deathmaster Crixxit · 2D6", "Deathmaster · 2D6", "Gutter Runners 1 · 2D6", "Gutter Runners 2 · 2D6", "Night Runners · 2D6"] }, { heading: "Rules", items: ["Charge"] }],
    fullOpponent: [{ heading: "Charge", items: ["All units · Charge actions unavailable"] }],
  },
  combat: {
    own: [
      { heading: "Abilities", items: ["Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs"] },
      { heading: "Passive abilities", items: ["Shadowy Killers", "Master of Shadows · modifies Cloaked in Shadow"] },
      { heading: "Weapons", items: ["Deathmaster Crixxit · Blades of Thirteen Cuts", "Deathmaster · Weeping Blade", "Gutter Runners 1 and 2 · Eshin Specialist Blades", "Night Runners · Poisoned Blades"] },
      { heading: "Rules", items: ["Fight", "Pile-in"] },
    ],
    opponent: [
      { heading: "Abilities", items: ["Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs"] },
      { heading: "Passive abilities", items: ["Shadowy Killers", "Master of Shadows · modifies Cloaked in Shadow"] },
      { heading: "Weapons", items: ["All melee profiles"] },
      { heading: "Rules", items: ["Fight", "Pile-in"] },
    ],
    fullOwn: [
      { heading: "Abilities", items: ["Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs"] },
      { heading: "Passive abilities", items: ["Shadowy Killers", "Master of Shadows · modifies Cloaked in Shadow"] },
      { heading: "Weapons", items: ["All units and melee weapon profiles"] },
      { heading: "Rules", items: ["Fight", "Pile-in"] },
    ],
    fullOpponent: [
      { heading: "Abilities", items: ["Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs"] },
      { heading: "Passive abilities", items: ["Shadowy Killers", "Master of Shadows · modifies Cloaked in Shadow"] },
      { heading: "Weapons", items: ["All units and melee weapon profiles"] },
      { heading: "Rules", items: ["Fight", "Pile-in"] },
    ],
  },
  end: {
    own: [{ heading: "Rules", items: ["End-of-turn checks"] }],
    opponent: [{ heading: "Rules", items: ["End-of-turn checks"] }],
    fullOwn: [{ heading: "Rules", items: ["Review temporary effects and states", "Resolve end-of-turn rules"] }],
    fullOpponent: [{ heading: "Rules", items: ["Review temporary effects and states", "Resolve end-of-turn rules"] }],
  },
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.4 0 9.8 6 9.8 6a16 16 0 0 1-3.1 3.7M6.2 6.3C3.6 8 2.2 12 2.2 12s3.4 6 9.8 6c1.3 0 2.5-.3 3.5-.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

function PhaseContent({ phase, turn, mode, battleRound }: { phase: PhaseId; turn: TurnSide; mode: ViewMode; battleRound: number }) {
  const data = phaseContent[phase];
  const blocks = mode === "complete" ? (turn === "own" ? data.fullOwn : data.fullOpponent) : (turn === "own" ? data.own : data.opponent);
  const visibleBlocks = blocks
    .filter((block) => block.items.length > 0)
    .filter((block) => block.heading !== "Reinforcement" || battleRound >= 3);
  return (
    <section className="battle-phase-content" aria-live="polite">
      {visibleBlocks.length ? visibleBlocks.map((block, blockIndex) => (
        <section className="battle-content-block" key={`${phase}-${block.heading}-${blockIndex}`}>
          <h3>{block.heading}</h3>
          <div className="battle-action-list">
            {block.items.map((item, index) => {
              const unavailable = item.includes("(unavailable)");
              return <article className={`battle-action-card ${unavailable ? "is-unavailable" : ""}`} key={`${block.heading}-${index}`}>
                <span className="battle-action-marker" aria-hidden="true">{unavailable ? "—" : "◆"}</span>
                <span>{item.replace(" (unavailable)", "")}</span>
                {unavailable && <span className="battle-unavailable-label">Unavailable</span>}
              </article>;
            })}
          </div>
        </section>
      )) : <div className="battle-empty-state"><span className="battle-empty-ornament" aria-hidden="true">✧</span><p>No unit-specific actions to show in this phase.</p></div>}
    </section>
  );
}

export function BattleBody({ battleRound }: { battleRound: number }) {
  const [currentPhase, setCurrentPhase] = useState<PhaseId>("hero");
  const [viewedPhase, setViewedPhase] = useState<PhaseId>("hero");
  const [turn, setTurn] = useState<TurnSide>("own");
  const [mode, setMode] = useState<ViewMode>("reduced");
  const [turnMenuOpen, setTurnMenuOpen] = useState(false);
  const currentIndex = phases.findIndex((item) => item.id === currentPhase);
  const isViewingCurrent = currentPhase === viewedPhase;

  const stepPhase = (direction: -1 | 1) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < phases.length) {
      const nextPhase = phases[nextIndex].id;
      setCurrentPhase(nextPhase);
      setViewedPhase(nextPhase);
    } else if (direction === 1 && currentPhase === "end") {
      setTurn((value) => value === "own" ? "opponent" : "own");
      setCurrentPhase("hero");
      setViewedPhase("hero");
    } else if (direction === -1 && currentPhase === "hero") {
      setTurn((value) => value === "own" ? "opponent" : "own");
      setCurrentPhase("end");
      setViewedPhase("end");
    }
  };

  return (
    <div className="battle-body">
      <div className="battle-controls">
        <div className="battle-turn-picker">
          <button type="button" className="battle-turn-list-button" aria-expanded={turnMenuOpen} aria-haspopup="listbox" onClick={() => setTurnMenuOpen((open) => !open)}>
            <span>{turn === "own" ? "Your turn" : "Opponent’s turn"}</span><span className="battle-chevron" aria-hidden="true">⌄</span>
          </button>
          {turnMenuOpen && <div className="battle-turn-menu" role="listbox" aria-label="Select turn">
            <button type="button" role="option" aria-selected={turn === "own"} onClick={() => { setTurn("own"); setTurnMenuOpen(false); }}>Your turn</button>
            <button type="button" role="option" aria-selected={turn === "opponent"} onClick={() => { setTurn("opponent"); setTurnMenuOpen(false); }}>Opponent’s turn</button>
          </div>}
        </div>
        <button type="button" className="battle-view-toggle" aria-label={mode === "reduced" ? "Reduced view. Switch to complete view" : "Complete view. Switch to reduced view"} aria-pressed={mode === "complete"} onClick={() => setMode((value) => value === "reduced" ? "complete" : "reduced")}>
          <EyeIcon open={mode === "complete"} />
        </button>
      </div>

      <nav className="battle-phase-nav" aria-label="Battle phases">
        {phases.map((item) => (
          <button key={item.id} type="button" className={`${currentPhase === item.id ? "is-current" : ""} ${viewedPhase === item.id ? "is-viewed" : ""}`}
            aria-current={currentPhase === item.id ? "step" : undefined}
            aria-label={`${item.label}${currentPhase === item.id ? ", current phase" : ""}${viewedPhase === item.id ? ", viewing" : ""}`}
            onClick={() => setViewedPhase(item.id)}>
            <span>{item.label}</span>
            {currentPhase === item.id && <span className="battle-current-indicator" title="Current phase" />}
          </button>
        ))}
      </nav>

      <div className={`battle-phase-pager ${isViewingCurrent ? "" : "is-inspecting"}`}>
        {isViewingCurrent ? <>
          <button type="button" disabled={currentIndex === 0} onClick={() => stepPhase(-1)}>‹ Previous</button>
          <span aria-hidden="true" />
          <button type="button" onClick={() => stepPhase(1)}>Next ›</button>
        </> : <>
          <span aria-hidden="true" />
          <button type="button" className="battle-back-current" onClick={() => setViewedPhase(currentPhase)}>Back to actual phase</button>
          <span aria-hidden="true" />
        </>}
      </div>

      <PhaseContent phase={viewedPhase} turn={turn} mode={mode} battleRound={battleRound} />
    </div>
  );
}
