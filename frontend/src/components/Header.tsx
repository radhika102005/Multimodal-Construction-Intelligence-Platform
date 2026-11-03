
import React from 'react';
import { Menu, Zap, AlertCircle } from 'lucide-react';
import { HealthStatus } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  health: HealthStatus | null;
  isBackendAwake: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  health,
  isBackendAwake
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
            <span className="text-navy-900 font-semibold">Decision Support System</span>
          </div>
        </div>
      </div>

      {/* Right section: System health and AI status */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Render Backend Connection Indicator */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isBackendAwake
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
          }`}
          title={
            isBackendAwake
              ? 'Render FastAPI backend connected & responding'
              : 'Render free instance may be cold starting. Requests will wake it up automatically.'
          }
        >
          {isBackendAwake ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Backend:</span>
              <span className="font-semibold">Online</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">Connecting / Cold Start</span>
            </>
          )}
        </div>

        {/* AI Model Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-800 border border-navy-200">
          <Zap className="w-3.5 h-3.5 text-construction-500" />
          <span>Model:</span>
          <span className="font-semibold">
            {health?.ai_configured ? health.ai_model : 'Civil Heuristic Fallback'}
          </span>
        </div>
      </div>
    </header>
  );
};
