'use client';

import { useEffect } from 'react';

import { useModalManager } from '@/context/ModalManagerContext';

export function GlobalHotkeys() {
  const { openQuickUpload } = useModalManager();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') {
        event.preventDefault();
        openQuickUpload();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [openQuickUpload]);

  return null;
}
