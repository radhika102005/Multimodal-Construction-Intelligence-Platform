import React, { useState } from 'react';
import {
  BookOpenCheck,
  Search,
  Sparkles,
  BookMarked,
  CheckSquare,
  FileCheck2,
  ShieldCheck,
  HelpCircle,
  Scale
} from 'lucide-react';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { KnowledgeRequest, KnowledgeResponse } from '../types';

export const KnowledgeAssistant: React.FC = () => {
  const [question, setQuestion] = useState('What causes concrete segregation and how to avoid it during slab casting?');
  const [category, setCategory] = useState('Materials & Quality Control');
  const [jurisdiction, setJurisdiction] = useState('ACI / ASTM Standards');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KnowledgeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.askKnowledge({
        question: q,
        category,
        jurisdiction_or_code: jurisdiction
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Knowledge query failed.');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    { label: "Concrete Segregation & Bleeding", q: "What causes concrete segregation and how to avoid it during slab casting?" },
    { label: "Clear Rebar Cover Requirements", q: "What is clear concrete cover and why is it necessary?" },
    { label: "Slump Cone Quality Procedure", q: "What is the procedure and tolerance for slump cone testing on site?" },
    { label: "Plastic Shrinkage vs Settlement", q: "How to distinguish between plastic shrinkage cracks and settlement cracks?" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Construction Knowledge Assistant
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative civil engineering repository, standards citations (ACI, ASTM, OSHA, Eurocodes), and QA/QC inspection protocols.
          </p>
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Query Service Error"
          message={error}
        />
      )}

      {/* Query Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about construction terms, standards (ACI 318, ASTM C94), testing procedures..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-2.5 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Query Knowledge Base</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="Materials & Quality Control">Materials & Quality Control</option>
                <option value="Structural Concrete & Rebar">Structural Concrete & Rebar</option>
                <option value="Substructure & Soil Mechanics">Substructure & Soil Mechanics</option>
                <option value="Safety & OSHA Compliance">Safety & OSHA Compliance</option>
                <option value="Building Codes & Standards">Building Codes & Standards</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Target Codal Framework
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="ACI / ASTM Standards">ACI / ASTM (American Concrete Institute)</option>
                <option value="Eurocodes (EN 1992)">Eurocodes (EN 1992 Structural Concrete)</option>
                <option value="IS Codes (IS 456 / IS 1893)">IS Codes (Bureau of Indian Standards)</option>
                <option value="General International Standards">General International Good Practice</option>
              </select>
            </div>
          </div>
        </form>

        {/* Quick query chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Frequent Technical Topics:</span>
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(item.q);
                handleQuery(item.q);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-10 h-10 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">
            Synthesizing civil engineering literature and verifying standard citations...
          </p>
        </div>
      )}

      {/* Answer Display */}
      {result && !loading && (
        <div className="space-y-5">
          {/* Main Answer Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-navy-50 text-navy-800 border border-navy-150">
                {result.category}
              </span>
              <span className="text-xs text-slate-400">{result.timestamp}</span>
            </div>

            <h2 className="text-lg font-bold text-navy-950">
              {result.query}
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </div>

            {/* Standards Citation Pills */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-navy-900 flex items-center">
                <BookMarked className="w-4 h-4 mr-1.5 text-construction-500" />
                Authoritative Engineering Standards Cited
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.standards_and_citations.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono border border-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* QA/QC Field Checklist */}
          {result.qa_inspection_checklist && result.qa_inspection_checklist.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-950 flex items-center">
                <CheckSquare className="w-4 h-4 mr-1.5 text-emerald-600" />
                QA/QC Inspection Acceptance Checklist
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.qa_inspection_checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-construction-600 block">
                      Step {idx + 1}: {item.step}
                    </span>
                    <p className="text-xs font-medium text-slate-800">
                      Purpose: {item.purpose}
                    </p>
                    <div className="pt-1 border-t border-slate-200/60 text-[11px] text-emerald-700 font-semibold">
                      Acceptance: {item.acceptance_criterion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Field Guidelines */}
          {result.field_guidelines && result.field_guidelines.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center">
                <FileCheck2 className="w-4 h-4 mr-1.5 text-construction-500" />
                Practical Field Implementation Directives
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.field_guidelines.map((g, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-construction-500 mt-1.5 mr-2 flex-shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Jurisdictional Limitation Warning */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center space-x-2 font-bold mb-1 text-amber-950">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Building Code Jurisdiction Notice</span>
            </div>
            <p>{result.jurisdictional_disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
