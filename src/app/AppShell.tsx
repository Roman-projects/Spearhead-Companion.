import { MAIN_SECTIONS, type MainSection } from "./navigation";

interface AppShellProps {
  activeSection: MainSection;
  onSectionChange: (section: MainSection) => void;
}

const battle = {
  name: "Ciudad de Ceniza",
  round: 2,
  left: { faction: "SKAVEN", army: "Crixxit’s Kill-Pack", score: 8 },
  right: { faction: "NIGHTHAUNT", army: "Cursed Shacklehorde", score: 6 },
};

export function AppShell({ activeSection, onSectionChange }: AppShellProps) {
  return (
    <main className="app-root">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-content">
        <header className="brand-header">
          <div className="brand-emblem" aria-hidden="true">✥</div>
          <div className="brand-copy">
            <h1>Spearhead Companion</h1>
            <p>Warhammer Age of Sigmar</p>
          </div>
        </header>

        <section className="battle-heading" aria-label="Current battle">
          <h2>{battle.name}</h2>
          <button className="menu-button" type="button" aria-label="Battle settings">
            <span />
            <span />
            <span />
          </button>
        </section>

        <section className="battle-scoreboard" aria-label="Battle scoreboard">
          <article className="army-banner army-banner--skaven">
            <div className="army-details">
              <p className="faction-name"><span aria-hidden="true">⚒</span>{battle.left.faction}</p>
              <h3>{battle.left.army}</h3>
            </div>
            <div className="army-score">{battle.left.score}</div>
          </article>

          <div className="round-marker" aria-label={`Round ${battle.round}`}>
            <div className="round-label">Round</div>
            <div className="round-number">{battle.round}</div>
          </div>

          <article className="army-banner army-banner--nighthaunt">
            <div className="army-score">{battle.right.score}</div>
            <div className="army-details army-details--right">
              <p className="faction-name">{battle.right.faction}<span aria-hidden="true">☠</span></p>
              <h3>{battle.right.army}</h3>
            </div>
          </article>
        </section>

        <nav className="main-navigation" aria-label="Main sections">
          {MAIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              aria-current={activeSection === section.id ? "page" : undefined}
              className={activeSection === section.id ? "nav-item is-active" : "nav-item"}
              onClick={() => onSectionChange(section.id)}
            >
              <span className={`nav-icon nav-icon--${section.id}`} aria-hidden="true">
                {section.id === "battle" ? "⚔" : section.id === "army" ? "♟" : "▤"}
              </span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <section className="section-placeholder" aria-live="polite">
          <h2>{MAIN_SECTIONS.find((section) => section.id === activeSection)?.label}</h2>
          <p>Section content will be built here.</p>
        </section>
      </div>
    </main>
  );
}