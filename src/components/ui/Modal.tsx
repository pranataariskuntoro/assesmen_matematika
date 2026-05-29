import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-5 border border-slate-200/60 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl md:w-full",
            className
          )}
        >
          <div className="flex flex-col space-y-1.5 text-left border-b border-slate-100 pb-4 pr-8">
            <Dialog.Title className="text-base md:text-lg font-display font-extrabold tracking-tight text-slate-800">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                {description}
              </Dialog.Description>
            )}
          </div>
          
          <div className="py-1 max-h-[75vh] overflow-y-auto">
            {children}
          </div>
 
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-xl opacity-70 p-1.5 hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:pointer-events-none cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
