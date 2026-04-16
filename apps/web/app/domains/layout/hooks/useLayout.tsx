import { useDisclosure } from "@chakra-ui/react";
import { createContext, useContext } from "react";

interface LayoutState {
  sidebarOpen: boolean;
  onSidebarOpen: () => void;
  onSidebarClose: () => void;
  onSidebarToggle: () => void;
}

const LayoutContext = createContext<LayoutState>({
  sidebarOpen: true,
  onSidebarOpen: () => {},
  onSidebarClose: () => {},
  onSidebarToggle: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { open, onOpen, onClose, onToggle } = useDisclosure({ defaultOpen: true });

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen: open,
        onSidebarOpen: onOpen,
        onSidebarClose: onClose,
        onSidebarToggle: onToggle,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutState {
  return useContext(LayoutContext);
}
