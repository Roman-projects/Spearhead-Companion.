import { useState } from "react";
import { AppShell } from "./AppShell";
import type { MainSection } from "./navigation";
import type { BattleState } from "./battleState";

export default function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("battle");
  const [battleState, setBattleState] = useState<BattleState>({
    round: 1,
    turnNumber: 1,
    leftScore: 0,
    rightScore: 0,
    underdog: "own",
    turn: "own",
    phase: "hero",
  });

  return (
    <AppShell
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      battleState={battleState}
      onBattleStateChange={setBattleState}
    />
  );
}