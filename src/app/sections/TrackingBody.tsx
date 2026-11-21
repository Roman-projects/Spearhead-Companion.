import type { BattleState, TurnSide } from "../battleState";
import { PHASES } from "../battleState";

interface TrackingBodyProps {
  battleState: BattleState;
  onChange: (updates: Partial<BattleState>) => void;
}

function CounterRow({ label, value, onDecrease, onIncrease, disabledDecrease = false, disabledIncrease = false }: {
  label: string;
  value: string | number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabledDecrease?: boolean;
  disabledIncrease?: boolean;
}) {
  return (
    <div className="tracking-counter-row">
      <div className="tracking-counter-copy">
        <span className="tracking-counter-label">{label}</span>
        <strong className="tracking-counter-value">{value}</strong>
      </div>
      <div className="tracking-counter-actions">
        <button type="button" aria-label={`Decrease ${label}`} onClick={onDecrease} disabled={disabledDecrease}>−</button>
        <button type="button" aria-label={`Increase ${label}`} onClick={onIncrease} disabled={disabledIncrease}>+</button>
      </div>
    </div>
  );
}

export function TrackingBody({ battleState, onChange }: TrackingBodyProps) {
  const phaseIndex = PHASES.findIndex((phase) => phase.id === battleState.phase);
  const phaseLabel = PHASES[phaseIndex]?.label ?? "Hero";
  const changePhase = (direction: -1 | 1) => {
    const next = Math.max(0, Math.min(PHASES.length - 1, phaseIndex + direction));
    onChange({ phase: PHASES[next].id });
  };
  const setTurn = (turn: TurnSide) => onChange({ turn });

  return (
    <section className="tracking-body">
      <div className="tracking-intro">
        <p className="tracking-eyebrow">TEST CONTROLS</p>
        <h2>Battle counters</h2>
        <p>Temporary controls to validate the shared battle state. Changes are reflected in the scoreboard and Battle tab.</p>
      </div>

      <section className="tracking-group" aria-labelledby="tracking-markers-title">
        <h3 id="tracking-markers-title">Markers</h3>
        <CounterRow label="Skaven · Crixxit’s Kill-Pack" value={battleState.leftScore}
          onDecrease={() => onChange({ leftScore: Math.max(0, battleState.leftScore - 1) })}
          onIncrease={() => onChange({ leftScore: battleState.leftScore + 1 })}
          disabledDecrease={battleState.leftScore <= 0} />
        <CounterRow label="Nighthaunt · Cursed Shacklehorde" value={battleState.rightScore}
          onDecrease={() => onChange({ rightScore: Math.max(0, battleState.rightScore - 1) })}
          onIncrease={() => onChange({ rightScore: battleState.rightScore + 1 })}
          disabledDecrease={battleState.rightScore <= 0} />
      </section>

      <section className="tracking-group" aria-labelledby="tracking-round-title">
        <h3 id="tracking-round-title">Round</h3>
        <CounterRow label="Current round" value={battleState.round}
          onDecrease={() => onChange({ round: Math.max(1, battleState.round - 1) })}
          onIncrease={() => onChange({ round: battleState.round + 1 })}
          disabledDecrease={battleState.round <= 1} />
      </section>

      <section className="tracking-group" aria-labelledby="tracking-turn-number-title">
        <h3 id="tracking-turn-number-title">Turn counter</h3>
        <CounterRow label="Current turn number" value={battleState.turnNumber}
          onDecrease={() => onChange({ turnNumber: Math.max(1, battleState.turnNumber - 1) })}
          onIncrease={() => onChange({ turnNumber: Math.min(8, battleState.turnNumber + 1) })}
          disabledDecrease={battleState.turnNumber <= 1}
          disabledIncrease={battleState.turnNumber >= 8} />
      </section>

      <section className="tracking-group" aria-labelledby="tracking-turn-title">
        <h3 id="tracking-turn-title">Current turn</h3>
        <div className="tracking-turn-options">
          <button type="button" className={battleState.turn === "own" ? "is-selected" : ""}
            aria-pressed={battleState.turn === "own"} onClick={() => setTurn("own")}>Your turn</button>
          <button type="button" className={battleState.turn === "opponent" ? "is-selected" : ""}
            aria-pressed={battleState.turn === "opponent"} onClick={() => setTurn("opponent")}>Opponent’s turn</button>
        </div>
      </section>

      <section className="tracking-group" aria-labelledby="tracking-underdog-title">
        <h3 id="tracking-underdog-title">Underdog marker</h3>
        <div className="tracking-turn-options">
          <button type="button" className={battleState.underdog === "own" ? "is-selected" : ""}
            aria-pressed={battleState.underdog === "own"} onClick={() => onChange({ underdog: "own" })}>Crixxit</button>
          <button type="button" className={battleState.underdog === "opponent" ? "is-selected" : ""}
            aria-pressed={battleState.underdog === "opponent"} onClick={() => onChange({ underdog: "opponent" })}>Cursed Shacklehorde</button>
        </div>
      </section>

      <section className="tracking-group" aria-labelledby="tracking-phase-title">
        <h3 id="tracking-phase-title">Current phase</h3>
        <CounterRow label="Battle phase" value={phaseLabel}
          onDecrease={() => changePhase(-1)}
          onIncrease={() => changePhase(1)}
          disabledDecrease={phaseIndex <= 0}
          disabledIncrease={phaseIndex >= PHASES.length - 1} />
      </section>
      <p className="tracking-note">Temporary testing panel. These values are held in app memory and reset when the page is reloaded.</p>
    </section>
  );
}
