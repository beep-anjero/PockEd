'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <Fragment>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          
          <div className={cn('relative w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl transform transition-all', sizes[size])}>
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[var(--border)]">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 id="modal-title" className="text-xl font-semibold text-[var(--foreground)] font-display flex items-center gap-2">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
            
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}