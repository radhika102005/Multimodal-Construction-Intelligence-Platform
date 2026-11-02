import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCheck,
  Building2,
  CalendarRange,
  MessagesSquare,
  CloudSun,
  BookOpenCheck,
  HardHat,
  Cpu,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfigured: boolean;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/safety', label: 'Safety Monitoring', icon: ShieldAlert, badge: 'Multimodal' },
  { to: '/crack-analysis', label: 'Crack & Structural', icon: SearchCheck, badge: 'Vision AI' },
  { to: '/valuation', label: 'Property Valuation', icon: Building2 },
  { to: '/planning', label: 'Project Planning', icon: CalendarRange, badge: 'WBS / CPM' },
  { to: '/assistant', label: 'Daily Site Assistant', icon: MessagesSquare },
  { to: '/weather', label: 'Weather Advisory', icon: CloudSun, badge: 'Live Free' },
  { to: '/knowledge', label: 'Knowledge Assistant', icon: BookOpenCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, aiConfigured }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-950 text-slate-200 flex flex-col border-r border-navy-850 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-850 bg-navy-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-construction-600 to-construction-400 flex items-center justify-center text-white shadow-lg shadow-construction-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-wide flex items-center">
                CONSTRUCT<span className="text-construction-500 ml-0.5">IQ</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Multimodal Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-construction-500 text-white shadow-md shadow-construction-500/25 font-semibold'
                      : 'text-slate-300 hover:bg-navy-850 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-navy-800 text-construction-400 border border-navy-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!isActive && <ChevronRight className="w-4 h-4 text-slate-600" />}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System & AI Badge Footer */}
        <div className="p-4 border-t border-navy-850 bg-navy-900/60">
          <div className="rounded-xl p-3 bg-navy-850 border border-navy-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1 text-construction-400" />
                AI Inference Engine
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  aiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {aiConfigured
                ? 'Gemini Multimodal Vision Active'
                : 'Benchmark Civil Heuristics Mode'}
            </p>
            {!aiConfigured && (
              <p className="text-[10px] text-amber-400/90 mt-1">
                Set AI_API_KEY in backend/.env for live vision
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Render 512MB RAM Ready</span>
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center hover:text-slate-300 transition-colors"
            >
              Swagger Docs
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
