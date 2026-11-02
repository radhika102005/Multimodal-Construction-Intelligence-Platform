import React, { useState } from 'react';
import {
  CalendarRange,
  Clock,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FolderKanban,
  PieChart as PieIcon,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { PlanningRequest, PlanningResponse } from '../types';

const BUDGET_COLORS = ['#EA580C', '#0284C7', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'];

export const ProjectPlanning: React.FC = () => {
  const [formData, setFormData] = useState<PlanningRequest>({
    project_name: 'Metropolis Tower Residencies',
    project_type: 'Residential High-rise',
    location: 'North Bay Waterfront',
    built_up_area_sqft: 85000,
    plot_area_sqft: 25000,
    number_of_floors: 18,
    expected_start_date: '2026-06-01',
    expected_completion_date: '2027-11-30',
    estimated_budget: 12500000,
    currency: 'USD',
    project_description: '18-story reinforced concrete residential tower with 2 levels of basement parking and rooftop amenities.'
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanningResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.generateProjectPlan(formData);
      setPlan(res);
      setExpandedPhaseId(res.phases[0]?.phase_id || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Plan generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (id: number) => {
    setExpandedPhaseId(expandedPhaseId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <CalendarRange className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Construction Project Planning & WBS
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Work Breakdown Structure (WBS), Critical Path (CPM) duration modeling, milestones, and budget allocations.
          </p>
        </div>

        {plan && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Master Schedule
          </button>
        )}
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Planning Error"
          message={error}
        />
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-navy-900 flex items-center">
            <FolderKanban className="w-4 h-4 mr-2 text-construction-500" />
            Project Parameters
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                >
                  <option value="Residential High-rise">Residential High-rise</option>
                  <option value="Commercial Complex">Commercial Complex</option>
                  <option value="Residential Villa">Residential Villa</option>
                  <option value="Industrial Warehouse">Industrial Warehouse</option>
                  <option value="Infrastructure / Bridge">Infrastructure / Bridge</option>
                  <option value="Interior Fit-out">Interior Fit-out</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Built-up Area (Sq Ft)
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={formData.built_up_area_sqft}
                  onChange={(e) => setFormData({ ...formData, built_up_area_sqft: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Floors
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.number_of_floors}
                  onChange={(e) => setFormData({ ...formData, number_of_floors: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.expected_start_date}
                  onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Budget ($)
                </label>
                <input
                  type="number"
                  required
                  min="10000"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Scope & Execution Notes
              </label>
              <textarea
                rows={3}
                value={formData.project_description || ''}
                onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md shadow-construction-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing CPM Execution Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Construction Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          {!plan && !loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-16 h-16 bg-navy-50 text-navy-600 rounded-full flex items-center justify-center mb-4">
                <CalendarRange className="w-8 h-8 text-construction-500" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-1">
                Awaiting Planning Scope
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Specify project floors, area, and targets to generate a phased Gantt-style schedule, activity dependencies, and cost distribution.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px] space-y-4">
              <div className="w-12 h-12 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Computing Work Breakdown Structure
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Allocating critical paths and trade crew sequencing...
                </p>
              </div>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-5">
              {/* Overview Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Master Execution Plan
                    </span>
                    <h3 className="text-lg font-extrabold text-navy-950">{plan.project_name}</h3>
                    <p className="text-xs text-slate-500">{plan.location} • {plan.project_type}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Estimated Duration</span>
                      <span className="text-2xl font-black text-navy-900">
                        {plan.total_duration_days}
                        <span className="text-xs text-slate-400 font-normal"> Days</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                  {plan.project_summary}
                </p>

                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Critical Path Analysis:</span>
                  {plan.critical_path_notes}
                </div>
              </div>

              {/* Gantt / Phase Timeline View */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-navy-950 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-construction-500" />
                  Construction Phase Timeline & Milestones
                </h3>

                <div className="space-y-3">
                  {plan.phases.map((phase) => {
                    const isExpanded = expandedPhaseId === phase.phase_id;
                    const pctOfTotal = ((phase.duration_days / plan.total_duration_days) * 100).toFixed(0);

                    return (
                      <div
                        key={phase.phase_id}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                      >
                        {/* Phase Header Bar */}
                        <div
                          onClick={() => togglePhase(phase.phase_id)}
                          className="p-4 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                            <span className="w-7 h-7 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {phase.phase_id}
                            </span>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-navy-900 truncate">
                                {phase.phase_name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Day {phase.start_day} to Day {phase.end_day} ({phase.duration_days} days) • {phase.estimated_cost_share_pct}% budget
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700">
                              ${phase.estimated_cost.toLocaleString()}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Visual Gantt Bar */}
                        <div className="px-4 pb-3">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-construction-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.max(15, parseInt(pctOfTotal))}%` }}
                            />
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs space-y-3">
                            <div>
                              <span className="font-semibold text-slate-700 block mb-1">
                                Core Activities:
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                {phase.suggested_activities.map((act, i) => (
                                  <li key={i}>{act}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                              <div>
                                <span className="font-semibold text-slate-700 block">Milestones:</span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                                  {phase.milestones.map((m, i) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <span className="font-semibold text-slate-700 block">Key Resources:</span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                                  {phase.resource_requirements.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60">
                              <span className="font-semibold text-slate-700 block">Risk Mitigation:</span>
                              <p className="text-slate-600">{phase.mitigation_strategy}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget Allocation Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-navy-950 mb-4 flex items-center">
                  <PieIcon className="w-4 h-4 mr-2 text-construction-500" />
                  Cost Distribution by Trade Package
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {plan.budget_allocation.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: BUDGET_COLORS[idx % BUDGET_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-700">{b.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-navy-900 block">${b.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">{b.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Planning Disclaimer */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700 block mb-0.5">Planning Notice:</span>
                {plan.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
