import React, { useState } from 'react';
import {
  SearchCheck,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Printer,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { CrackAnalysisResponse } from '../types';

export const CrackAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [elementType, setElementType] = useState('Column');
  const [ageYears, setAgeYears] = useState<number>(8);
  const [notes, setNotes] = useState('Observed diagonal fissure near upper beam-column junction');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CrackAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or upload a structural photo for defect evaluation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.analyzeStructuralCrack(
        selectedFile,
        elementType,
        ageYears,
        notes
      );
      setReport(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Forensic crack analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <SearchCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Structural Crack & Defect Forensics
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visual non-destructive preliminary analysis of concrete cracks, spalling, shear stress, and rebar corrosion.
          </p>
        </div>

        {report && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Export Forensic Sheet
          </button>
        )}
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Analysis Could Not Proceed"
          message={error}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-navy-900 flex items-center">
            <Layers className="w-4 h-4 mr-2 text-construction-500" />
            Structural Element Specifications
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Element Under Inspection
              </label>
              <select
                value={elementType}
                onChange={(e) => setElementType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              >
                <option value="Column">Column (Compressive Member)</option>
                <option value="Beam">Beam (Flexural / Shear Member)</option>
                <option value="Slab">Floor / Roof Slab</option>
                <option value="Wall">Reinforced Concrete / Masonry Wall</option>
                <option value="Foundation">Foundation / Grade Beam</option>
                <option value="Joint">Expansion / Construction Joint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Structure Age (Estimated Years)
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={ageYears}
                onChange={(e) => setAgeYears(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Field Observations & Location Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Diagonal stepped crack visible after heavy rainfall"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50 resize-none"
              />
            </div>

            <ImageUploader
              onImageSelected={(file) => setSelectedFile(file)}
              onImageCleared={() => {
                setSelectedFile(null);
                setReport(null);
              }}
              label="Structural Defect Photo"
              helperText="Capture close-up of crack including surrounding structural context"
            />

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3 px-4 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md shadow-construction-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Forensic Indicators...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Structural Cracks</span>
                </>
              )}
            </button>
          </form>

          {/* Forensic Scope Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">Forensic Screening Protocol:</span>
            <p>
              Differentiates between superficial shrinkage micro-crazing and load-induced shear or foundation settlement cracks.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          {!report && !loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-16 h-16 bg-navy-50 text-navy-600 rounded-full flex items-center justify-center mb-4">
                <SearchCheck className="w-8 h-8 text-construction-500" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-1">
                Awaiting Structural Image
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Upload a photograph of a cracked beam, column, or wall to analyze orientation, estimated width category, and forensic hypotheses.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px] space-y-4">
              <div className="w-12 h-12 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Running Forensic Multimodal Classification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Correlating crack geometry with structural failure modes...
                </p>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-5">
              {/* Integrity Assessment Summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Element Evaluated
                    </span>
                    <h3 className="text-lg font-extrabold text-navy-950">
                      {report.element_type} Defect Assessment
                    </h3>
                    <p className="text-xs text-slate-500">{report.timestamp}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Risk Level</span>
                      <StatusBadge status={report.structural_integrity_risk} size="lg" />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-navy-900 mb-1 uppercase tracking-wider">
                    Forensic Diagnosis
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.overall_assessment}
                  </p>
                </div>

                {report.surface_deterioration_notes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-150">
                    <span className="font-semibold text-slate-800">Surface Degradation: </span>
                    {report.surface_deterioration_notes}
                  </div>
                )}

                {report.moisture_corrosion_indicators && (
                  <div className="mt-2 p-3 bg-blue-50/50 rounded-xl text-xs text-blue-900 border border-blue-150">
                    <span className="font-semibold text-blue-950">Moisture & Leaching: </span>
                    {report.moisture_corrosion_indicators}
                  </div>
                )}
              </div>

              {/* Detected Defects */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-navy-950">
                  Characterized Crack Defects ({report.detected_defects.length})
                </h3>

                <div className="space-y-4">
                  {report.detected_defects.map((defect, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-navy-950">{defect.defect_type}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Location: {defect.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700">
                            {defect.visual_width_category}
                          </span>
                          <StatusBadge status={defect.severity} size="sm" />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Trajectory: </span>
                        {defect.pattern_and_orientation}
                      </div>

                      {/* Hypotheses */}
                      <div className="bg-white p-3 rounded-lg border border-slate-150 text-xs">
                        <span className="font-semibold text-slate-800 block mb-1">
                          Plausible Causal Hypotheses:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {defect.possible_causes.map((cause, cIdx) => (
                            <li key={cIdx}>{cause}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Steps */}
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 block mb-1">
                          Recommended Engineering Next Steps:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {defect.recommended_actions.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Warning Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center space-x-2 font-bold mb-1 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Mandatory Professional Structural Disclaimer</span>
                </div>
                <p>{report.engineering_disclaimer}</p>
                {report.requires_professional_inspection && (
                  <div className="mt-2 font-semibold text-amber-800 flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Formal on-site core/NDT testing by a Licensed Structural Engineer (PE) is recommended.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
