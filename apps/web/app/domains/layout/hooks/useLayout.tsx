import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { createContext, useContext } from "react";

interface LayoutState {
  sidebar: UseDisclosureReturn;
  assistant: UseDisclosureReturn;
}

const LayoutContext = createContext<LayoutState | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useDisclosure();
  const assistant = useDisclosure();

  return (
    <LayoutContext.Provider value={{ sidebar, assistant }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutState {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
