export type MainSection = "battle" | "army" | "tracking";

export const MAIN_SECTIONS: ReadonlyArray<{
  id: MainSection;
  label: string;
}> = [
  { id: "battle", label: "Battle" },
  { id: "army", label: "Army" },
  { id: "tracking", label: "Tracking" },
];