import { useState } from "react";
import { AppShell } from "./AppShell";
import type { MainSection } from "./navigation";

export default function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("battle");

  return (
    <AppShell
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
}