'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ModalManagerContextValue = {
  quickUploadOpen: boolean;
  openQuickUpload: () => void;
  closeQuickUpload: () => void;
  setQuickUploadOpen: (open: boolean) => void;
};

const ModalManagerContext = createContext<ModalManagerContextValue | undefined>(
  undefined,
);

export function ModalManagerProvider({ children }: { children: ReactNode }) {
  const [quickUploadOpen, setQuickUploadOpenState] = useState(false);

  const openQuickUpload = useCallback(() => setQuickUploadOpenState(true), []);
  const closeQuickUpload = useCallback(() => setQuickUploadOpenState(false), []);
  const setQuickUploadOpen = useCallback(
    (open: boolean) => setQuickUploadOpenState(open),
    [],
  );

  const value = useMemo(
    () => ({
      quickUploadOpen,
      openQuickUpload,
      closeQuickUpload,
      setQuickUploadOpen,
    }),
    [quickUploadOpen, openQuickUpload, closeQuickUpload, setQuickUploadOpen],
  );

  return (
    <ModalManagerContext.Provider value={value}>
      {children}
    </ModalManagerContext.Provider>
  );
}

export function useModalManager() {
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error(
      'useModalManager must be used within a ModalManagerProvider',
    );
  }
  return context;
}
