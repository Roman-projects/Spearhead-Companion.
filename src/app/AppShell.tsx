import { MAIN_SECTIONS, type MainSection } from "./navigation";

interface AppShellProps {
  activeSection: MainSection;
  onSectionChange: (section: MainSection) => void;
}

/**
 * Temporary structural shell.
 * The final visual composition must be reproduced from the approved reference image.
 */
export function AppShell({
  activeSection,
  onSectionChange,
}: AppShellProps) {
  return (
    <main className="app-root">
      <header className="app-header">
        <h1>Spearhead Companion</h1>
      </header>

      <nav className="main-navigation" aria-label="Main sections">
        {MAIN_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-current={activeSection === section.id ? "page" : undefined}
            className={activeSection === section.id ? "nav-item is-active" : "nav-item"}
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <section className="section-placeholder" aria-live="polite">
        <h2>{MAIN_SECTIONS.find((section) => section.id === activeSection)?.label}</h2>
        <p>Structural foundation in progress.</p>
      </section>
    </main>
  );
}