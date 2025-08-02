import { useState, createContext, useContext, ReactNode } from 'react';

interface AccessorySelectionState {
  selectedAccessory: string | null;
  pendingPlacement: boolean;
  selectAccessory: (accessoryId: string) => void;
  clearSelection: () => void;
  setPendingPlacement: (pending: boolean) => void;
}

const AccessorySelectionContext = createContext<AccessorySelectionState | null>(null);

export function useAccessorySelection() {
  const context = useContext(AccessorySelectionContext);
  if (!context) {
    throw new Error('useAccessorySelection must be used within AccessorySelectionProvider');
  }
  return context;
}

export function useAccessorySelectionProvider() {
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [pendingPlacement, setPendingPlacement] = useState(false);

  const selectAccessory = (accessoryId: string) => {
    setSelectedAccessory(accessoryId);
    setPendingPlacement(true);
  };

  const clearSelection = () => {
    setSelectedAccessory(null);
    setPendingPlacement(false);
  };

  return {
    selectedAccessory,
    pendingPlacement,
    selectAccessory,
    clearSelection,
    setPendingPlacement,
    AccessorySelectionContext
  };
}
