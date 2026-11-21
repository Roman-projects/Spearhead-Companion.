import { useMemo, useState } from "react";

type PhaseId = "hero" | "movement" | "shooting" | "charge" | "combat" | "end";
type TurnSide = "own" | "opponent";
type ViewMode = "reduced" | "complete";

const phases: { id: PhaseId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "movement", label: "Movement" },
  { id: "shooting", label: "Shooting" },
  { id: "charge", label: "Charge" },
  { id: "combat", label: "Combat" },
  { id: "end", label: "End of Turn" },
];

const phaseContent: Record<PhaseId, { title: string; description: string; own: string[]; opponent: string[]; fullOwn: string[]; fullOpponent: string[] }> = {
  hero: {
    title: "Hero Phase",
    description: "Abilities and effects available during the Hero Phase.",
    own: ["Go-Go, Hunt Them Down"],
    opponent: [],
    fullOwn: ["Go-Go, Hunt Them Down", "General rules and phase sequence"],
    fullOpponent: ["No Crixxit’s Kill-Pack Hero Phase abilities in the opponent’s turn."],
  },
  movement: {
    title: "Movement Phase",
    description: "Movement profiles and reinforcement procedures.",
    own: ["Deathmaster Crixxit · Move 7”", "Deathmaster · Move 7”", "Gutter Runners 1 · Move 7”", "Gutter Runners 2 · Move 7”", "Night Runners · Move 7”", "Reinforcements · Gutter Runners 1", "Reinforcements · Gutter Runners 2", "Reinforcements · Night Runners"],
    opponent: [],
    fullOwn: ["All five units · Move 7”", "Reinforcements · Gutter Runners 1", "Reinforcements · Gutter Runners 2", "Reinforcements · Night Runners", "Normal Move · Run · Retreat · Call for Reinforcements"],
    fullOpponent: ["Deathmaster Crixxit · Move 7” (unavailable)", "Deathmaster · Move 7” (unavailable)", "Gutter Runners 1 · Move 7” (unavailable)", "Gutter Runners 2 · Move 7” (unavailable)", "Night Runners · Move 7” (unavailable)"],
  },
  shooting: {
    title: "Shooting Phase",
    description: "Ranged weapons and shooting abilities.",
    own: ["Night Runners · Slings and Poisoned Stars"],
    opponent: [],
    fullOwn: ["Night Runners · Slings and Poisoned Stars", "Shoot · Shoot in Combat"],
    fullOpponent: ["Night Runners · Slings and Poisoned Stars (unavailable)"],
  },
  charge: {
    title: "Charge Phase",
    description: "Charge rolls, charge modifiers and charge-phase abilities.",
    own: ["Gutter Runners 1 · Bomb Rats", "Gutter Runners 2 · Bomb Rats"],
    opponent: [],
    fullOwn: ["Deathmaster Crixxit · Charge 2D6", "Deathmaster · Charge 2D6", "Gutter Runners 1 · Charge 2D6", "Gutter Runners 2 · Charge 2D6", "Night Runners · Charge 2D6", "Bomb Rats · Gutter Runners 1 and 2 when token is present", "Charge"],
    fullOpponent: ["All units · Charge actions unavailable"],
  },
  combat: {
    title: "Combat Phase",
    description: "Melee profiles, combat abilities and passive effects.",
    own: ["Deathmaster Crixxit · Blades of Thirteen Cuts", "Deathmaster · Weeping Blade", "Gutter Runners 1 and 2 · Eshin Specialist Blades", "Night Runners · Poisoned Blades", "Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs", "Shadowy Killers · Passive"],
    opponent: ["All melee profiles", "Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs", "Shadowy Killers · Passive"],
    fullOwn: ["All units and melee weapon profiles", "Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs", "Shadowy Killers · Passive", "Master of Shadows · modifies Cloaked in Shadow", "Fight · Pile-in"],
    fullOpponent: ["All units and melee weapon profiles", "Cloaked in Shadow", "Way of the Fiendish Claw", "Smoke Bombs", "Shadowy Killers · Passive", "Master of Shadows · modifies Cloaked in Shadow", "Fight · Pile-in"],
  },
  end: {
    title: "End of Turn",
    description: "Resolve effects and review temporary states that expire at the end of this turn.",
    own: ["End-of-turn checks"],
    opponent: ["End-of-turn checks"],
    fullOwn: ["Review temporary effects and states", "Resolve end-of-turn rules"],
    fullOpponent: ["Review temporary effects and states", "Resolve end-of-turn rules"],
  },
};

function PhaseContent({ phase, turn, mode }: { phase: PhaseId; turn: TurnSide; mode: ViewMode }) {
  const data = phaseContent[phase];
  const items = mode === "complete"
    ? (turn === "own" ? data.fullOwn : data.fullOpponent)
    : (turn === "own" ? data.own : data.opponent);
  const unavailable = (item: string) => item.includes("(unavailable)");
  const visibleItems = items.filter((item) => mode === "complete" || !unavailable(item));

  return (
    <section className="battle-phase-content" aria-live="polite">
      <div className="battle-phase-heading">
        <div>
          <p className="battle-eyebrow">{turn === "own" ? "Your turn" : "Opponent’s turn"} · {mode === "reduced" ? "Reduced view" : "Complete view"}</p>
          <h2>{data.title}</h2>
          <p className="battle-phase-description">{data.description}</p>
        </div>
      </div>
      {visibleItems.length > 0 ? (
        <div className="battle-action-list">
          {visibleItems.map((item, index) => (
            <article className={`battle-action-card ${unavailable(item) ? "is-unavailable" : ""}`} key={`${phase}-${index}`}>
              <span className="battle-action-marker" aria-hidden="true">{unavailable(item) ? "—" : "◆"}</span>
              <span>{item.replace(" (unavailable)", "")}</span>
              {unavailable(item) && <span className="battle-unavailable-label">Unavailable</span>}
            </article>
          ))}
        </div>
      ) : (
        <div className="battle-empty-state">
          <span className="battle-empty-ornament" aria-hidden="true">✧</span>
          <p>No unit-specific actions to show in this phase.</p>
          {mode === "reduced" && <span>Switch to Complete view to inspect unavailable actions and phase rules.</span>}
        </div>
      )}
    </section>
  );
}

export function BattleBody() {
  const [phase, setPhase] = useState<PhaseId>("hero");
  const [turn, setTurn] = useState<TurnSide>("own");
  const [mode, setMode] = useState<ViewMode>("reduced");
  const currentIndex = useMemo(() => phases.findIndex((item) => item.id === phase), [phase]);

  return (
    <div className="battle-body">
      <div className="battle-controls">
        <div className="battle-control-group battle-turn-control" role="group" aria-label="Turn">
          <button type="button" className={turn === "own" ? "is-selected" : ""} onClick={() => setTurn("own")}>Your turn</button>
          <button type="button" className={turn === "opponent" ? "is-selected" : ""} onClick={() => setTurn("opponent")}>Opponent</button>
        </div>
        <div className="battle-control-group battle-view-control" role="group" aria-label="View mode">
          <button type="button" className={mode === "reduced" ? "is-selected" : ""} onClick={() => setMode("reduced")}>Reduced</button>
          <button type="button" className={mode === "complete" ? "is-selected" : ""} onClick={() => setMode("complete")}>Complete</button>
        </div>
      </div>

      <nav className="battle-phase-nav" aria-label="Battle phases">
        {phases.map((item, index) => (
          <button key={item.id} type="button" className={phase === item.id ? "is-selected" : ""}
            aria-current={phase === item.id ? "step" : undefined} onClick={() => setPhase(item.id)}>
            <span className="battle-phase-number">{index + 1}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="battle-phase-pager">
        <button type="button" disabled={currentIndex === 0} onClick={() => setPhase(phases[currentIndex - 1].id)}>‹ Previous</button>
        <span>Phase {currentIndex + 1} of {phases.length}</span>
        <button type="button" disabled={currentIndex === phases.length - 1} onClick={() => setPhase(phases[currentIndex + 1].id)}>Next ›</button>
      </div>

      <PhaseContent phase={phase} turn={turn} mode={mode} />
    </div>
  );
}
