
import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center text-xs font-medium text-slate-500 space-x-1.5">
            <span>Enterprise Construction Intelligence</span>
            <span>/</span>
            <span className="text-navy-900 font-semibold">
              Decision Support System
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
