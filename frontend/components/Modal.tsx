import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., 'max-w-3xl'
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidthClass = 'max-w-3xl' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidthClass} mx-4`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-prato-dark">{title}</h2>
          <button onClick={onClose} className="text-prato-muted hover:text-prato-dark">✕</button>
        </div>
        <div className="px-6 py-4 h-[400px] overflow-auto flex items-start justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};
