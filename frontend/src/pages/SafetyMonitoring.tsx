import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  MapPin,
  HelpCircle,
  Clock,
  HardHat,
  ArrowRight
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { SafetyAnalysisResponse } from '../types';

export const SafetyMonitoring: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [siteName, setSiteName] = useState('Skyline Tower - Sector 3');
  const [inspectionType, setInspectionType] = useState('PPE & Fall Hazard Audit');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SafetyAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload an image before initiating the safety audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.analyzeSafetyImage(
        selectedFile,
        siteName,
        inspectionType
      );
      setReport(result);
    } catch (err: any) {
      const detail = err?.response?.data?.message || err?.message || 'Failed to complete safety audit.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Site Safety Monitoring
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Multimodal visual audit for PPE compliance, guardrails, scaffolding, and OSHA hazard identification.
          </p>
        </div>

        {report && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / Export Audit
          </button>
        )}
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Analysis Unsuccessful"
          message={error}
        />
      )}

      {/* Upload and Control Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-navy-900 flex items-center">
            <HardHat className="w-4 h-4 mr-2 text-construction-500" />
            New Inspection Input
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Site or Zone Designation
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Apex High-Rise Level 14 Deck"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Inspection Focus
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              >
                <option value="PPE & Fall Hazard Audit">PPE & Fall Hazard Audit</option>
                <option value="Scaffolding & Edge Protection">Scaffolding & Edge Protection</option>
                <option value="Electrical & Housekeeping">Electrical & Housekeeping</option>
                <option value="Full Comprehensive Site Audit">Full Comprehensive Site Audit</option>
              </select>
            </div>

            <ImageUploader
              onImageSelected={(file) => setSelectedFile(file)}
              onImageCleared={() => {
                setSelectedFile(null);
                setReport(null);
              }}
              label="Site Photograph"
              helperText="Upload clear daylight photo of active work zone, scaffolding, or personnel"
            />

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3 px-4 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md shadow-construction-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing Multimodal Vision Audit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Multimodal Safety Audit</span>
                </>
              )}
            </button>
          </form>

          {/* Guidelines box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-500 space-y-1.5">
            <span className="font-semibold text-slate-700 block">Analysis Capabilities:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Hard hats, high-vis vests, harnesses & eye protection.</li>
              <li>Perimeter guardrails, open penetrations, ladder angles.</li>
              <li>Scaffolding ties, base plates, uncoiled electrical cables.</li>
            </ul>
          </div>
        </div>

        {/* Audit Results View */}
        <div className="lg:col-span-7">
          {!report && !loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 bg-navy-50 text-navy-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-construction-500" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-1">
                No Inspection Active
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Upload a construction site photograph and click "Run Multimodal Safety Audit" to evaluate visible occupational hazards.
              </p>
              <div className="inline-flex items-center text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Audits generate in ~2 to 4 seconds
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-12 h-12 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Processing Multimodal Reasoning
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Scanning image features against OSHA safety checklists...
                </p>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-5">
              {/* Score & Risk Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Audit Scorecard
                    </span>
                    <h3 className="text-lg font-extrabold text-navy-950">
                      {report.site_name}
                    </h3>
                    <p className="text-xs text-slate-500">{report.timestamp}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Safety Score</span>
                      <span className="text-2xl font-black text-navy-900">
                        {report.overall_safety_score}
                        <span className="text-xs text-slate-400 font-normal">/100</span>
                      </span>
                    </div>

                    <StatusBadge status={report.risk_level} size="lg" />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-navy-900 mb-1 uppercase tracking-wider">
                    Executive Assessment
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.overall_assessment}
                  </p>
                </div>

                {report.warning && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    {report.warning}
                  </div>
                )}
              </div>

              {/* Detected Hazards List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-950 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-500" />
                    Identified Site Hazards ({report.detected_hazards.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Confidence: {(report.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>

                {report.detected_hazards.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    No critical safety violations visually detected in the framed perspective.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.detected_hazards.map((h, i) => (
                      <div
                        key={h.id || i}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-900">{h.title}</span>
                          <StatusBadge status={h.severity} size="sm" />
                        </div>

                        <p className="text-xs text-slate-600">{h.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-200/60">
                          <div>
                            <span className="font-semibold text-slate-700 block">
                              Immediate Corrective Action:
                            </span>
                            <span className="text-slate-600">{h.corrective_action}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 block">
                              Preventive Measure:
                            </span>
                            <span className="text-slate-600">{h.preventive_measure}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {h.location_in_image}
                          </span>
                          <span className="font-mono">{h.regulatory_reference}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Positive Observations & Legal Disclaimer */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-navy-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Positive Site Controls Observed
                </h4>
                <ul className="space-y-1">
                  {report.positive_observations.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    Official Inspection Disclaimer:
                  </span>
                  {report.inspection_disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
