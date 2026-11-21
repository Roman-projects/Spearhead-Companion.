import { MAIN_SECTIONS, type MainSection } from "./navigation";
import { BattleBody } from "./sections/BattleBody";
import { TrackingBody } from "./sections/TrackingBody";
import type { BattleState } from "./battleState";

interface AppShellProps {
  activeSection: MainSection;
  onSectionChange: (section: MainSection) => void;
  battleState: BattleState;
  onBattleStateChange: (state: BattleState) => void;
}

type ArmyStatusTag = { id: string; label: string };

const battle = {
  name: "Ciudad de Ceniza",
  round: 2,
  left: { faction: "SKAVEN", army: "Crixxit’s Kill-Pack", score: 8, isActive: true, temporaryTags: [] as ArmyStatusTag[] },
  right: { faction: "NIGHTHAUNT", army: "Cursed Shacklehorde", score: 6, isActive: false, temporaryTags: [] as ArmyStatusTag[] },
};

function TurnTracker({ turnNumber }: { turnNumber: number }) {
  return (
    <div className="turn-tracker" role="group" aria-label={`Battle turn ${turnNumber} of 8`}>
      {Array.from({ length: 8 }, (_, index) => {
        const turn = index + 1;
        const status = turn < turnNumber ? "is-complete" : turn === turnNumber ? "is-current" : "is-upcoming";
        return <span className={`turn-tracker-icon ${status}`} key={turn} title={`Turn ${turn}`} aria-label={`Turn ${turn}${turn === turnNumber ? ", current" : turn < turnNumber ? ", completed" : ", upcoming"}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4l11 11M8 3l-5 5M4 8l-1 4 4-1M19 4L8 15M16 3l5 5M20 8l1 4-4-1M9 14l-3 6M15 14l3 6M6 20h4M14 20h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>;
      })}
    </div>
  );
}

function RoundSpear({ round }: { round: number }) {
  return (
    <div className="round-spear" aria-label={`Round ${round}`}>
      <svg className="spear-art" viewBox="0 0 80 340" role="img" aria-label="Ornate vertical spear">
        <defs><linearGradient id="spearGold" x1="0" x2="1">
          <stop offset="0" stopColor="#70451a" /><stop offset=".28" stopColor="#f8dc91" />
          <stop offset=".52" stopColor="#9b6828" /><stop offset=".76" stopColor="#f4d27e" /><stop offset="1" stopColor="#583715" />
        </linearGradient></defs>
        <path d="M40 4 L57 82 L49 104 L71 129 L51 139 L48 178 L40 194 L32 178 L29 139 L9 129 L31 104 L23 82 Z" fill="url(#spearGold)" stroke="#f0c66e" strokeWidth="2"/>
        <path d="M40 18 L45 91 L40 111 L35 91 Z" fill="#fff0bd" opacity=".85"/>
        <path d="M40 194 L48 225 L45 306 L40 334 L35 306 L32 225 Z" fill="url(#spearGold)" stroke="#d6a34e" strokeWidth="1.5"/>
        <path d="M40 199 L40 327" stroke="#5b241b" strokeWidth="5" strokeDasharray="12 7"/>
        <path d="M22 125 L58 125 M27 142 L53 142 M30 179 L50 179 M32 219 L48 219" stroke="#f3d18a" strokeWidth="3"/>
        <path d="M40 4 L40 334" stroke="#fff0bd" strokeWidth="1" opacity=".6"/>
      </svg>
      <div className="round-medallion"><span className="round-caption">Ronda</span><strong>{round}</strong></div>
    </div>
  );
}

function ArmyPanel({ side, faction, army, score, isActive, temporaryTags }: {
  side: "left" | "right"; faction: string; army: string; score: number; isActive: boolean; temporaryTags: ArmyStatusTag[];
}) {
  return (
    <article className={`army-banner army-banner--${side} ${isActive ? "is-turn-active" : "is-turn-inactive"}`}
      aria-label={`${army}, ${isActive ? "active turn" : "inactive turn"}`}>
      <div className="army-heading">
        <p className="faction-name">
          {side === "left" && <span aria-hidden="true">⚒</span>}{faction}
          {side === "right" && <span aria-hidden="true">☠</span>}
        </p>
        <h3>{army}</h3>
      </div>
      {temporaryTags.length > 0 && <div className="army-status-tags" aria-label="Temporary army status">
        {temporaryTags.map((tag) => <span className="army-status-tag" key={tag.id}>{tag.label}</span>)}
      </div>}
      <div className="army-score">{score}</div>
    </article>
  );
}

export function AppShell({ activeSection, onSectionChange, battleState, onBattleStateChange }: AppShellProps) {
  return (
    <main className="app-root">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-content">
        <header className="brand-header">
          <div className="brand-lockup">
            <div className="brand-emblem" aria-hidden="true">✥</div>
            <div className="brand-copy"><h1>Spearhead Companion</h1><p>Warhammer Age of Sigmar</p></div>
          </div>
          <button className="menu-button" type="button" aria-label="Battle settings"><span /><span /><span /></button>
        </header>

        <section className="battle-heading" aria-label="Current battle"><TurnTracker turnNumber={battleState.turnNumber} /><h2>{battle.name}</h2></section>

        <section className="battle-scoreboard" aria-label="Battle scoreboard">
          <ArmyPanel side="left" {...battle.left} temporaryTags={battleState.underdog === "own" ? [{ id: "underdog", label: "Underdog" }] : []} score={battleState.leftScore} isActive={battleState.turn === "own"} />
          <ArmyPanel side="right" {...battle.right} temporaryTags={battleState.underdog === "opponent" ? [{ id: "underdog", label: "Underdog" }] : []} score={battleState.rightScore} isActive={battleState.turn === "opponent"} />
          <RoundSpear round={battleState.round} />
        </section>

        <nav className="main-navigation" aria-label="Main sections">
          {MAIN_SECTIONS.map((section) => <button key={section.id} type="button"
            aria-current={activeSection === section.id ? "page" : undefined}
            className={activeSection === section.id ? "nav-item is-active" : "nav-item"}
            onClick={() => onSectionChange(section.id)}>
            <span className={`nav-icon nav-icon--${section.id}`} aria-hidden="true">
              {section.id === "battle" ? "⚔" : section.id === "army" ? "♟" : "▤"}
            </span><span>{section.label}</span>
          </button>)}
        </nav>

        {activeSection === "battle" ? (
          <BattleBody
            battleRound={battleState.round}
            turnNumber={battleState.turnNumber}
            underdog={battleState.underdog}
            turn={battleState.turn}
            phase={battleState.phase}
            roundStarter={battleState.roundStarter}
            onTurnChange={(turn) => onBattleStateChange({ ...battleState, turn })}
            leftScore={battleState.leftScore}
            rightScore={battleState.rightScore}
            onPhaseChange={(phase) => onBattleStateChange({ ...battleState, phase })}
            onTurnEnd={(turnNumber, turn, phase) => onBattleStateChange({ ...battleState, turnNumber, turn, phase, ...(phase === "end" && battleState.leftScore !== battleState.rightScore ? { underdog: battleState.leftScore < battleState.rightScore ? "own" : "opponent" } : {}) })}
            onCompleteRound={(nextStarter, result) => onBattleStateChange({
              ...battleState,
              round: battleState.round + 1,
              turn: nextStarter,
              roundStarter: nextStarter,
              underdog: result.underdog,
              priorityWinner: result.priorityWinner,
              seizedInitiative: result.seizedInitiative,
              doubleTurn: result.doubleTurn,
              tacticsDrawBlocked: result.tacticsDrawBlocked,
              tacticsCardsRecovered: result.tacticsCardsRecovered,
              phase: "hero",
            })}
            onScoreChange={(side, score) => onBattleStateChange({ ...battleState, [side === "own" ? "leftScore" : "rightScore"]: battleState[side === "own" ? "leftScore" : "rightScore"] + score })}
          />
        ) : activeSection === "tracking" ? (
          <TrackingBody
            battleState={battleState}
            onChange={(updates) => onBattleStateChange({ ...battleState, ...updates })}
          />
        ) : (
          <section className="section-placeholder" aria-live="polite">
            <h2>Army</h2>
            <p>Section content will be built here.</p>
          </section>
        )}
      </div>
    </main>
  );
}