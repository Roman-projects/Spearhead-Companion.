import { useState } from "react";
import { AppShell } from "./AppShell";
import type { MainSection } from "./navigation";
import type { BattleState } from "./battleState";

export default function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("battle");
  const [battleState, setBattleState] = useState<BattleState>({
    round: 2,
    leftScore: 8,
    rightScore: 6,
    turn: "own",
    phase: "hero",
  });

  return (
    <AppShell
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
}