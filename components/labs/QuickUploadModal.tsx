'use client';

import UploadPage from '@/app/upload/page';
import { useModalManager } from '@/context/ModalManagerContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function QuickUploadModal() {
  const { quickUploadOpen, setQuickUploadOpen } = useModalManager();

  return (        
    <Dialog open={quickUploadOpen} onOpenChange={setQuickUploadOpen}>
      <DialogContent
        className={cn(
          'z-[9999] mx-2 flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-full flex-col overflow-y-auto border border-white/5 bg-sidebar text-sidebar-foreground p-0',
          'rounded-xl shadow-xl sm:mx-0 sm:h-auto sm:max-h-[90vh] sm:w-full lg:max-w-[1100px] sm:flex-1 sm:overflow-visible sm:rounded-2xl',
          'backdrop-blur supports-[backdrop-filter]:bg-sidebar/70',
        )}
      >
        <DialogHeader className="space-y-1 border-b border-white/5 bg-sidebar/80 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-xl font-semibold">Quick Upload Lab</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Access the full lab upload workflow without leaving your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
          <UploadPage variant="modal" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
