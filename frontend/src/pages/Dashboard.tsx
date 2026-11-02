import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  ShieldCheck,
  SearchCheck,
  Building2,
  CloudSun,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { DashboardSummary } from '../types';

const RISK_COLORS = ['#E11D48', '#EA580C', '#0284C7', '#10B981'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await apiService.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard intelligence summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Compiling site intelligence and active metrics...
        </p>
      </div>
    );
  }

  const projectStatusData = data
    ? [
        { name: 'Planning', count: data.project_status_overview.planning },
        { name: 'Foundation', count: data.project_status_overview.foundation },
        { name: 'Superstructure', count: data.project_status_overview.superstructure },
        { name: 'MEP & Finishes', count: data.project_status_overview.mep_finishes },
        { name: 'Commissioning', count: data.project_status_overview.commissioning },
      ]
    : [];

  const safetyRiskData = data
    ? [
        { name: 'Critical Risk', value: data.safety_summary.critical },
        { name: 'High Risk', value: data.safety_summary.high },
        { name: 'Medium Risk', value: data.safety_summary.medium },
        { name: 'Low / Safe', value: data.safety_summary.low + data.safety_summary.safe_audits },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
            Construction Intelligence Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multimodal site monitoring, crack forensics, scheduling CPM, and decision telemetry.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Data Synchronization Error"
          message={error}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monitored Projects"
          value={data?.total_projects || 0}
          changePct={12.5}
          trend="up"
          period="vs prior quarter"
          icon={FolderKanban}
          accentColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Safety Audits Run"
          value={data?.safety_analyses_performed || 0}
          changePct={28.4}
          trend="up"
          period="this quarter"
          icon={ShieldCheck}
          accentColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Structural Crack Audits"
          value={data?.structural_crack_analyses || 0}
          changePct={18.2}
          trend="up"
          period="this quarter"
          icon={SearchCheck}
          accentColor="text-construction-600 bg-construction-50"
        />
        <StatCard
          title="Property Valuations"
          value={data?.property_valuations || 0}
          changePct={15.0}
          trend="up"
          period="this month"
          icon={Building2}
          accentColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Charts Section: Project Distribution & Safety Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Pipeline Chart (Bar) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                Active Projects by Execution Stage
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking across civil development lifecycles
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
              {data?.active_projects || 0} Active Sites
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B192C',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#EA580C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Risk Breakdown (Donut) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-navy-900">Safety Risk Distribution</h3>
            <p className="text-xs text-slate-500">Audit findings categorized by OSHA severity</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safetyRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {safetyRiskData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B192C',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {safetyRiskData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: RISK_COLORS[idx % RISK_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-navy-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Bottom Section: Proactive AI Recommendations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proactive AI Recommendations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">
                Proactive AI Site Recommendations
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-construction-600 bg-construction-50 px-2.5 py-0.5 rounded-full border border-construction-200">
              Priority Feed
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recent_recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {rec.category}
                  </span>
                  <StatusBadge status={rec.urgency} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-navy-900 mb-1">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.action}</p>
                <div className="mt-2 flex items-center text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{rec.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Activity Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Platform Telemetry</h3>
            <span className="text-xs text-slate-400 font-medium">Session Feed</span>
          </div>

          <div className="space-y-2.5 flex-1">
            {data?.recent_activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs uppercase">
                    {act.module.slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-navy-900">{act.title}</h5>
                    <p className="text-[11px] text-slate-500">{act.site_name}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {act.timestamp}
                    </span>
                  </div>
                </div>

                {act.severity && <StatusBadge status={act.severity} size="sm" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
