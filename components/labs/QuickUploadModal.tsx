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
          // 📱 Mobile: fullscreen dan reset transform Radix agar tidak geser
          'fixed inset-0 left-0 top-0 z-[9999] m-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden overscroll-contain',
          // 🌫️ Glassmorphism
          'bg-white/5 dark:bg-[#020618]/2 text-sidebar-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-white/10',
          'border border-white/5 ring-1 ring-white/15 shadow-2xl transition-all duration-300 ease-in-out',
          // 💻 Desktop: boxed modal di tengah layar
          'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-[1100px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl'
        )}
      >
        {/* 🔹 Header Sticky */}
        <DialogHeader className="sticky rounded-2xl top-0 z-10 space-y-1 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-xl font-semibold">Quick Upload Lab</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Access the full lab upload workflow without leaving your dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* 🔹 Form Container (Scroll Area) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 pb-[max(env(safe-area-inset-bottom),0px)]">
          {/* Memanggil ulang UploadPage dengan variant modal agar form + step logic tetap aktif */}
          <UploadPage variant="modal" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
