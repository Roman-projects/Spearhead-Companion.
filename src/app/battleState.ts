export type PhaseId = "hero" | "movement" | "shooting" | "charge" | "combat" | "end";
export type TurnSide = "own" | "opponent";

export interface BattleState {
  round: number;
  turnNumber: number;
  underdog: TurnSide;
  leftScore: number;
  rightScore: number;
  turn: TurnSide;
  phase: PhaseId;
}

export const PHASES: { id: PhaseId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "movement", label: "Movement" },
  { id: "shooting", label: "Shooting" },
  { id: "charge", label: "Charge" },
  { id: "combat", label: "Combat" },
  { id: "end", label: "End of Turn" },
];