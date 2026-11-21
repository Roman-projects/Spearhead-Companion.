import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { PHASES, type PhaseId, type TurnSide } from "../battleState";

type ViewMode = "reduced" | "complete";
type ContentBlock = { heading: string; items: string[] };
type ScoreDraft = { objectives: number; tactics: number; twist: number };

const phases = PHASES;
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
    own: [{ heading: "Weapons", items: ["Night Runners · Slings and Poisoned Stars"] }],
    opponent: [],
    fullOwn: [{ heading: "Weapons", items: ["Night Runners · Slings and Poisoned Stars"] }, { heading: "Rules", items: ["Shoot", "Shoot in Combat"] }],
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
    own: [{ heading: "Abilities", items: ["End of Turn abilities"] }],
    opponent: [{ heading: "Abilities", items: ["End of Turn abilities"] }],
    fullOwn: [{ heading: "Abilities", items: ["End of Turn abilities"] }, { heading: "Rules", items: ["Resolve applicable end-of-turn effects"] }],
    fullOpponent: [{ heading: "Abilities", items: ["End of Turn abilities"] }, { heading: "Rules", items: ["Resolve applicable end-of-turn effects"] }],
  },
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.4 0 9.8 6 9.8 6a16 16 0 0 1-3.1 3.7M6.2 6.3C3.6 8 2.2 12 2.2 12s3.4 6 9.8 6c1.3 0 2.5-.3 3.5-.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

function PhaseContent({ phase, currentPhase, turn, mode, battleRound, usedActions, setUsedActions, onScore, onFinishTurn }: {
  phase: PhaseId; currentPhase: PhaseId; turn: TurnSide; mode: ViewMode; battleRound: number; usedActions: Record<string, boolean>; setUsedActions: Dispatch<SetStateAction<Record<string, boolean>>>; onScore: (total: number) => void; onFinishTurn: (nextTurn?: TurnSide) => void;
}) {
  const data = phaseContent[phase];
  const blocks = mode === "complete" ? (turn === "own" ? data.fullOwn : data.fullOpponent) : (turn === "own" ? data.own : data.opponent);
  const visibleBlocks = blocks.filter((block) => block.items.length > 0)
    .filter((block) => block.heading !== "Reinforcement" || battleRound >= 3);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<ScoreDraft>({ objectives: 0, tactics: 0, twist: 0 });
  const [scored, setScored] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [transitionStep, setTransitionStep] = useState<number | null>(null);
  const [nextStarter, setNextStarter] = useState<TurnSide>("own");
  const [underdogChecked, setUnderdogChecked] = useState(false);
  const [cardsChecked, setCardsChecked] = useState(false);

  useEffect(() => {
    setCollapsed({});
    setExpandedItems({});
    setDraft({ objectives: 0, tactics: 0, twist: 0 });
    setScored(false);
    setScoringOpen(false);
    setTransitionStep(null);
    setNextStarter("own");
    setUnderdogChecked(false);
    setCardsChecked(false);
  }, [phase, turn]);

  const updateDraft = (key: keyof ScoreDraft, delta: number, max: number) => {
    setDraft((value) => ({ ...value, [key]: Math.max(0, Math.min(max, value[key] + delta)) }));
  };

  if (phase === "end" && transitionStep !== null) {
    const steps = [
      { title: "Priority roll", body: "Make the priority roll to determine who has won the initiative for the new battle round." },
      { title: "Choose the first turn", body: "The winner of the priority roll chooses which player takes the first turn of the new battle round." },
      { title: "Determine the Underdog", body: "Check both players’ victory points and determine the Underdog. If the result requires a tie-break, make the appropriate roll-off." },
      { title: "Twist and battle tactics cards", body: "Draw the new Twist card. Draw or discard and replenish battle tactics cards as required by the battlepack and its conditions." },
    ];
    const step = steps[transitionStep];
    return <section className="battle-round-transition">
      <p className="battle-eyebrow">NEW BATTLE ROUND</p>
      <h2>{step.title}</h2>
      <p>{step.body}</p>
      <div className="battle-transition-progress">{steps.map((item, index) => <span key={item.title} className={index <= transitionStep ? "is-complete" : ""} />)}</div>
      {transitionStep === 1 && <div className="battle-choice-row">
        <button type="button" className={nextStarter === "own" ? "is-selected" : ""} onClick={() => setNextStarter("own")}>Your turn first</button>
        <button type="button" className={nextStarter === "opponent" ? "is-selected" : ""} onClick={() => setNextStarter("opponent")}>Opponent first</button>
      </div>}
      {transitionStep === 2 && <label className="battle-confirm-check"><input type="checkbox" checked={underdogChecked} onChange={(event) => setUnderdogChecked(event.target.checked)} /> Underdog verified (including any required tie-break)</label>}
      {transitionStep === 3 && <label className="battle-confirm-check"><input type="checkbox" checked={cardsChecked} onChange={(event) => setCardsChecked(event.target.checked)} /> Twist and battle tactics cards resolved</label>}
      <div className="battle-transition-actions">
        <button type="button" className="battle-secondary-button" onClick={() => setTransitionStep(Math.max(0, transitionStep - 1))} disabled={transitionStep === 0}>Back</button>
        {transitionStep < 3 ? <button type="button" className="battle-primary-button" disabled={transitionStep === 2 && !underdogChecked} onClick={() => setTransitionStep(transitionStep + 1)}>Continue</button> :
          <button type="button" className="battle-primary-button" disabled={!cardsChecked} onClick={() => { onFinishTurn(nextStarter); }}>Complete round setup</button>}
      </div>
    </section>;
  }

  return (
    <section className="battle-phase-content" aria-live="polite">
      {visibleBlocks.map((block, blockIndex) => {
        const key = `${phase}-${block.heading}-${blockIndex}`;
        const isCollapsed = collapsed[key] ?? false;
        return <section className="battle-content-block" key={key}>
          <button type="button" className="battle-block-toggle" aria-expanded={!isCollapsed} onClick={() => setCollapsed((value) => ({ ...value, [key]: !isCollapsed }))}>
            <h3>{block.heading}</h3><span>{isCollapsed ? "+" : "−"}</span>
          </button>
          {!isCollapsed && <div className="battle-action-list">
            {block.items.map((item, index) => {
              const unavailable = item.includes("(unavailable)") || phase !== currentPhase;
              const itemKey = `${phase}-${item.replace(" (unavailable)", "")}`;
              const cleanItem = item.replace(" (unavailable)", "");
              const isExpanded = !!expandedItems[itemKey];
              const isMovement = block.heading === "Movement";
              const isWeapon = block.heading === "Weapons" && (phase === "shooting" || phase === "combat");
              const actionLabel = block.heading === "Charge" ? "Charge" : block.heading === "Abilities" ? "Use" : null;
              const movementOptions = ["Normal Move", "Run · Move + 1D6", "Retreat · 1D3 mortal damage"];
              const weaponOptions = phase === "shooting" ? ["Slings", "Poisoned Stars"] : ["Melee weapon profile"];
              const options = isMovement ? movementOptions : isWeapon ? weaponOptions : [];
              const unitName = isMovement ? cleanItem.split(" · ")[0] : cleanItem;
              const isGroupUsed = options.some((option) => usedActions[`${itemKey}-${option}`]);
              const canUse = !!actionLabel && !unavailable;
              return <article className={`battle-action-card battle-action-card-expandable ${unavailable ? "is-unavailable" : ""} ${usedActions[itemKey] || isGroupUsed ? "is-used" : ""}`} key={itemKey}>
                <div className="battle-action-main">
                  <span className="battle-action-marker" aria-hidden="true">{unavailable ? "—" : usedActions[itemKey] || isGroupUsed ? "✓" : "◆"}</span>
                  <button type="button" className="battle-item-toggle" aria-expanded={isExpanded} onClick={() => setExpandedItems((value) => ({ ...value, [itemKey]: !isExpanded }))}>
                    <span className="battle-action-name">{unitName}</span><span className="battle-item-chevron" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                  </button>
                  {unavailable && <span className="battle-unavailable-label">Unavailable</span>}
                  {canUse && <button type="button" className="battle-use-button" disabled={unavailable || !!usedActions[itemKey]} aria-pressed={!!usedActions[itemKey]} onClick={() => setUsedActions((value) => ({ ...value, [itemKey]: true }))}>{usedActions[itemKey] ? "Used" : actionLabel}</button>}
                </div>
                {isExpanded && <div className="battle-item-details">
                  {isMovement ? <><p>Move characteristic: 7”</p><div className="battle-option-list">{movementOptions.map((option) => {
                    const optionKey = `${itemKey}-${option}`;
                    const optionUsed = !!usedActions[optionKey] || isGroupUsed;
                    return <div className="battle-option-row" key={option}><span>{option}</span><button type="button" className="battle-use-button" disabled={phase !== currentPhase || isGroupUsed} aria-pressed={optionUsed} onClick={() => setUsedActions((value) => ({ ...value, [optionKey]: true }))}>{optionUsed ? "Used" : "Use"}</button></div>;
                  })}</div></> :
                  isWeapon ? <div className="battle-option-list">{weaponOptions.map((option) => {
                    const optionKey = `${itemKey}-${option}`;
                    const optionUsed = !!usedActions[optionKey];
                    return <div className="battle-option-row" key={option}><span>{option}</span><button type="button" className="battle-use-button" disabled={phase !== currentPhase || optionUsed} aria-pressed={optionUsed} onClick={() => setUsedActions((value) => ({ ...value, [optionKey]: true }))}>{optionUsed ? "Used" : "Use"}</button></div>;
                  })}</div> : <p>Information will be added here.</p>}
                </div>}
              </article>;
            })}
          </div>}
        </section>;
      })}
      {phase === "end" && <section className="battle-scoring">
        <button type="button" className="battle-score-toggle" aria-expanded={scoringOpen} onClick={() => setScoringOpen((open) => !open)}>Puntuar <span>{scoringOpen ? "−" : "+"}</span></button>\n        {scoringOpen && <>
        <p className="battle-eyebrow">END OF TURN SCORING</p>
        <h3>Victory points</h3>
        {([
          ["objectives", "Objectives", 3],
          ["tactics", "Battle tactics cards", 3],
          ["twist", "Twist cards", 4],
        ] as const).map(([key, label, max]) => <div className="battle-score-row" key={key}>
          <div><strong>{label}</strong><span>0–{max} points</span></div>
          <div className="battle-score-controls">
            <button type="button" disabled={scored || draft[key] <= 0} onClick={() => updateDraft(key, -1, max)}>−</button>
            <output>{draft[key]}</output>
            <button type="button" disabled={scored || draft[key] >= max} onClick={() => updateDraft(key, 1, max)}>+</button>
          </div>
        </div>)}
        <div className="battle-score-total">Total this turn <strong>{draft.objectives + draft.tactics + draft.twist}</strong></div>
        <div className="battle-scoring-actions">
          <button type="button" className="battle-primary-button" disabled={scored} onClick={() => { onScore(draft.objectives + draft.tactics + draft.twist); setScored(true); }}>{scored ? "Scoring confirmed" : "Puntuar"}</button>
          {scored && <button type="button" className="battle-primary-button" onClick={() => turn === "own" ? onFinishTurn() : setTransitionStep(0)}>Terminar turno</button>}
        </div>
        <p className="battle-scoring-note">Confirm your score even when all three categories are 0. You can only score once per turn.</p>
      </section>}
    </section>
  );
}

export function BattleBody({ battleRound, turn, phase, onTurnChange, onPhaseChange, onRoundChange, onScoreChange }: {
  battleRound: number; turn: TurnSide; phase: PhaseId;
  onTurnChange: (turn: TurnSide) => void; onPhaseChange: (phase: PhaseId) => void;
  onRoundChange: (round: number) => void; onScoreChange: (turn: TurnSide, score: number) => void;
}) {
  const [viewedPhase, setViewedPhase] = useState<PhaseId>(phase);
  const [mode, setMode] = useState<ViewMode>("reduced");
  const [turnMenuOpen, setTurnMenuOpen] = useState(false);
  const [usedActions, setUsedActions] = useState<Record<string, boolean>>({});
  useEffect(() => { setUsedActions({}); }, [turn]);
  useEffect(() => { setViewedPhase(phase); }, [phase]);
  const currentIndex = phases.findIndex((item) => item.id === phase);
  const isViewingCurrent = phase === viewedPhase;

  const stepPhase = (direction: -1 | 1) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < phases.length) {
      const nextPhase = phases[nextIndex].id;
      onPhaseChange(nextPhase);
      setViewedPhase(nextPhase);
    } else if (direction === -1 && phase === "hero") {
      onTurnChange(turn === "own" ? "opponent" : "own");
      onPhaseChange("end");
      setViewedPhase("end");
    }
  };

  const finishTurn = (nextTurn?: TurnSide) => {
    if (turn === "own") {
      onTurnChange("opponent");
      onPhaseChange("hero");
      setViewedPhase("hero");
    } else {
      onRoundChange(battleRound + 1);
      onTurnChange(nextTurn ?? "own");
      onPhaseChange("hero");
      setViewedPhase("hero");
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
            <button type="button" role="option" aria-selected={turn === "own"} onClick={() => { onTurnChange("own"); setTurnMenuOpen(false); }}>Your turn</button>
            <button type="button" role="option" aria-selected={turn === "opponent"} onClick={() => { onTurnChange("opponent"); setTurnMenuOpen(false); }}>Opponent’s turn</button>
          </div>}
        </div>
        <button type="button" className="battle-view-toggle" aria-label={mode === "reduced" ? "Reduced view. Switch to complete view" : "Complete view. Switch to reduced view"} aria-pressed={mode === "complete"} onClick={() => setMode((value) => value === "reduced" ? "complete" : "reduced")}><EyeIcon open={mode === "complete"} /></button>
      </div>
      <nav className="battle-phase-nav" aria-label="Battle phases">
        {phases.map((item) => <button key={item.id} type="button" className={`${phase === item.id ? "is-current" : ""} ${viewedPhase === item.id ? "is-viewed" : ""}`} aria-current={phase === item.id ? "step" : undefined} onClick={() => setViewedPhase(item.id)}>
          <span>{item.label}</span>{phase === item.id && <span className="battle-current-indicator" title="Current phase" />}
        </button>)}
      </nav>
      <div className={`battle-phase-pager ${isViewingCurrent ? "" : "is-inspecting"}`}>
        {isViewingCurrent ? <><button type="button" disabled={currentIndex === 0} onClick={() => stepPhase(-1)}>‹ Previous</button><span aria-hidden="true" />{phase !== "end" && <button type="button" onClick={() => stepPhase(1)}>Next ›</button>}</> :
          <><span aria-hidden="true" /><button type="button" className="battle-back-current" onClick={() => setViewedPhase(phase)}>Back to actual phase</button><span aria-hidden="true" /></>}
      </div>
      {isViewingCurrent && phase === "end" ? <PhaseContent phase={viewedPhase} currentPhase={phase} turn={turn} mode={mode} battleRound={battleRound} usedActions={usedActions} setUsedActions={setUsedActions} onScore={(score) => onScoreChange(turn, score)} onFinishTurn={finishTurn} /> :
        <PhaseContent phase={viewedPhase} turn={turn} mode={mode} battleRound={battleRound} onScore={() => {}} onFinishTurn={finishTurn} />}
      {isViewingCurrent && phase === "end" && <div className="battle-hidden-finish-hook" aria-hidden="true" />}
    </div>
  );
}
