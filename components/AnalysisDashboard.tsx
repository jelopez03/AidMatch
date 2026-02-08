import React, { useState, useEffect } from 'react';
import { AnalysisResult, ProgramEligibility, ApplicationRecord } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wallet,
  ShieldAlert,
  Users,
  BadgeCheck,
  XCircle,
  Clock,
  HelpCircle,
  ArrowRight,
  X,
  FileCheck,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Building2,
  Info,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  applications: ApplicationRecord[];
  onReset: () => void;
  onApplicationSubmit: (app: ApplicationRecord) => void;
  onViewApplication: () => void;
}

// --- Sub-Components ---

const ProgramModal: React.FC<{
  program: ProgramEligibility | null;
  existingApplication?: ApplicationRecord;
  onClose: () => void;
  onApply: (p: ProgramEligibility) => void;
  onViewStatus: () => void;
}> = ({ program, existingApplication, onClose, onApply, onViewStatus }) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {program.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{program.program_name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Eligibility Status */}
          <div className={`p-4 rounded-xl border-l-4 shadow-sm ${program.eligible ? 'bg-emerald-50/50 border-emerald-500' : 'bg-red-50/50 border-red-500'}`}>
            <div className="flex items-start gap-3">
              {program.eligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h4 className={`font-bold ${program.eligible ? 'text-emerald-900' : 'text-red-900'}`}>
                  {program.eligible ? 'You Likely Qualify' : 'Not Eligible Based on Current Data'}
                </h4>
                <p className={`text-sm mt-1 leading-relaxed ${program.eligible ? 'text-emerald-800' : 'text-red-800'}`}>
                  {program.reason_eligible}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          {program.eligible && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Est. Benefit</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  {program.estimated_monthly_benefit
                    ? `$${program.estimated_monthly_benefit}/mo`
                    : program.estimated_annual_benefit
                      ? `$${program.estimated_annual_benefit}/yr`
                      : 'Varies'
                  }
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Processing Time</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {program.processing_days} Days
                </div>
              </div>
            </div>
          )}

          {/* Existing Application Status Alert */}
          {existingApplication && (
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Application Active</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Status: <span className="font-bold uppercase">{existingApplication.status.replace('_', ' ')}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Submitted: {new Date(existingApplication.submitted_date).toLocaleDateString()}</p>
                </div>
             </div>
          )}

          {/* Docs Checklist (Static for POC) */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-500" />
              Documents Likely Required
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Proof of Identity (ID, Driver's License)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Proof of Income (Pay stubs, Tax returns)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Proof of Residency (Lease, Utility bill)
              </li>
            </ul>
          </div>

          {program.official_website_url && (
            <div className="pt-2">
               <a
                href={program.official_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors group"
               >
                 Visit Official Program Website <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
               </a>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>

          {existingApplication ? (
            <button
              onClick={() => { onClose(); onViewStatus(); }}
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <LayoutDashboard size={18} /> View Status
            </button>
          ) : (
            program.eligible && (
              <button
                onClick={() => { onClose(); onApply(program); }}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                Start Application <ArrowRight size={18} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationSimulation: React.FC<{
  program: ProgramEligibility;
  onBack: () => void;
  onSuccess: (app: ApplicationRecord) => void;
}> = ({ program, onBack, onSuccess }) => {
  const [status, setStatus] = useState<'review' | 'submitting' | 'success'>('review');
  const [agreed, setAgreed] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<ApplicationRecord | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = () => {
    if (!agreed) return;
    setStatus('submitting');

    // Simulate network request
    setTimeout(() => {
      const confirmId = `APP-${Math.floor(Math.random() * 1000000)}`;
      const estDecisionDate = new Date(Date.now() + program.processing_days * 24 * 60 * 60 * 1000).toISOString();

      const newApp: ApplicationRecord = {
        id: confirmId,
        program_name: program.program_name,
        category: program.category,
        status: 'under_review',
        submitted_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        confirmation_number: confirmId,
        estimated_decision_date: estDecisionDate,
        benefit_amount: program.estimated_monthly_benefit ? `$${program.estimated_monthly_benefit}/mo` : undefined
      };

      setGeneratedApp(newApp);
      setStatus('success');
      onSuccess(newApp);
    }, 2000);
  };

  if (status === 'success' && generatedApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
        <p className="text-lg text-slate-600 mb-8">
          Your application for <span className="font-semibold text-slate-900">{program.program_name}</span> has been successfully received.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 max-w-md mx-auto text-left">
          <div className="flex justify-between mb-2">
            <span className="text-slate-500 text-sm">Confirmation ID</span>
            <span className="font-mono font-medium text-slate-900">{generatedApp.confirmation_number}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-500 text-sm">Date Submitted</span>
            <span className="font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Est. Response By</span>
            <span className="font-medium text-slate-900">
              {new Date(generatedApp.estimated_decision_date || '').toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="mb-6 text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      {status === 'submitting' ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Submitting Application...</h2>
          <p className="text-slate-500">Securely transmitting your data to the {program.category} department.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 text-white p-8 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-slate-900/90"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-bold tracking-wider text-blue-200 uppercase border border-blue-400/30 px-2 py-1 rounded bg-blue-900/50 backdrop-blur-md">
                    Official Application Portal
                </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Apply for {program.program_name}</h1>
                <p className="text-slate-300">Complete the final review to submit your request for assistance.</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                </div>
              </div>
              <span className="ml-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Step 3 of 3</span>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Applicant Summary
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Based on your assessment profile, we have pre-filled Form 1040-X for the <strong>{program.program_name}</strong>.
                  Please verify that your household income and hardship status remain current as of today.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Application Details
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600 font-medium">Assistance Type</span>
                    <span className="font-bold text-slate-900">{program.category}</span>
                  </div>
                  <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600 font-medium">Est. Monthly Value</span>
                    <span className="font-bold text-slate-900">
                      ${program.estimated_monthly_benefit || 'Determined upon review'}
                    </span>
                  </div>
                  <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600 font-medium">Priority Level</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">High Priority</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-all"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  I certify that the information provided in my assessment is true and correct to the best of my knowledge.
                  I understand that this is a simulated submission for demonstration purposes.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!agreed}
                className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2
                  ${!agreed ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-blue-700 hover:scale-[1.02] active:scale-95'}
                `}
              >
                Submit Application <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgramCard: React.FC<{
  program: ProgramEligibility;
  existingApplication?: ApplicationRecord;
  onLearnMore: (p: ProgramEligibility) => void;
  onApply: (p: ProgramEligibility) => void;
  onViewStatus: () => void;
}> = ({ program, existingApplication, onLearnMore, onApply, onViewStatus }) => {
  const isEligible = program.eligible;
  const confidenceColor =
    program.approval_likelihood_percent >= 80 ? 'bg-emerald-500' :
    program.approval_likelihood_percent >= 50 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className={`group rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden
      ${isEligible
        ? 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
        : 'bg-slate-50 border-slate-200 opacity-75 grayscale-[0.5] hover:grayscale-0'
      }`}>

      {/* Decorative Top Gradient */}
      {isEligible && <div className={`h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0`}></div>}

      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-bold text-lg leading-tight ${isEligible ? 'text-slate-900' : 'text-slate-500'}`}>
                {program.program_name}
              </h4>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {program.category}
              </span>

              {/* Status or Eligibility Badge */}
              {existingApplication ? (
                 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                   <Clock size={10} /> {existingApplication.status.replace('_', ' ')}
                 </span>
              ) : (
                isEligible && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {program.approval_likelihood_percent}% Match
                  </span>
                )
              )}
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-2 min-h-[40px]">
              {program.reason_eligible}
            </p>

            {isEligible && (
              <div className="grid grid-cols-2 gap-3 text-sm pt-4 border-t border-dashed border-slate-100">
                {(program.estimated_monthly_benefit || program.estimated_annual_benefit) && (
                  <div>
                     <span className="text-xs text-slate-400 block mb-0.5 font-medium uppercase">Value</span>
                     <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Wallet className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                            {program.estimated_monthly_benefit
                            ? `$${program.estimated_monthly_benefit.toLocaleString()}/mo`
                            : `$${program.estimated_annual_benefit?.toLocaleString()}/yr`}
                        </span>
                     </div>
                  </div>
                )}
                {program.processing_days > 0 && (
                   <div>
                    <span className="text-xs text-slate-400 block mb-0.5 font-medium uppercase">Wait Time</span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{program.processing_days} days</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Circular Confidence Meter */}
          {isEligible && !existingApplication && (
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className={`${program.approval_likelihood_percent >= 80 ? 'text-emerald-500' : 'text-amber-500'}`} strokeDasharray={`${program.approval_likelihood_percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               </svg>
               <span className="absolute text-[10px] font-bold text-slate-700">{program.approval_likelihood_percent}%</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex gap-3">
          {/* Official Website Link for quick access */}
          {program.official_website_url && (
            <a
              href={program.official_website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
              title="Official Website"
            >
              <ExternalLink size={18} />
            </a>
          )}

          <button
            onClick={() => onLearnMore(program)}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm"
          >
            Details
          </button>

          {isEligible && (
             existingApplication ? (
              <button
                onClick={onViewStatus}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-200"
              >
                <LayoutDashboard size={14} /> Status
              </button>
             ) : (
              <button
                onClick={() => onApply(program)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Apply <ArrowRight size={14} />
              </button>
             )
          )}
        </div>
      </div>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, applications, onReset, onApplicationSubmit, onViewApplication }) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramEligibility | null>(null);
  const [applyingProgram, setApplyingProgram] = useState<ProgramEligibility | null>(null);

  const getPovertyColor = (percent: number) => {
    if (percent <= 50) return '#ef4444'; // Red - Very Low
    if (percent <= 100) return '#f97316'; // Orange - Low
    if (percent <= 150) return '#eab308'; // Yellow - Moderate
    return '#10b981'; // Green - Okay
  };

  const getDeficitColor = (deficit: number) => {
    return deficit > 0 ? '#ef4444' : '#10b981';
  };

  // Data for Poverty Radial Chart
  const povertyData = [{
    name: 'Poverty Level',
    value: Math.min(result.poverty_level_percent, 200),
    fill: getPovertyColor(result.poverty_level_percent)
  }];

  // Financial Health Data
  const financialData = [
    { name: 'Monthly Deficit', amount: result.monthly_deficit, fill: getDeficitColor(result.monthly_deficit) }
  ];

  // Helper to find matching existing application
  const findExistingApp = (programName: string) => {
    return applications.find(app =>
        app.program_name === programName ||
        // Loose fuzzy match just in case logic varies slightly
        app.program_name.includes(programName) ||
        programName.includes(app.program_name)
    );
  };

  // If in application mode, replace dashboard view
  if (applyingProgram) {
    return (
      <ApplicationSimulation
        program={applyingProgram}
        onBack={() => setApplyingProgram(null)}
        onSuccess={onApplicationSubmit}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Modal */}
      <ProgramModal
        program={selectedProgram}
        existingApplication={selectedProgram ? findExistingApp(selectedProgram.program_name) : undefined}
        onClose={() => setSelectedProgram(null)}
        onApply={(p) => setApplyingProgram(p)}
        onViewStatus={onViewApplication}
      />

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-end gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
             <BadgeCheck size={14} /> AI Analysis Complete
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Financial Health Report</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            We've analyzed your household profile against <span className="font-semibold text-slate-900">federal and state databases</span> to identify immediate assistance opportunities.
          </p>
        </div>
        <div className="relative z-10">
            <button
            onClick={onReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
            >
            <ArrowLeft size={18} /> New Assessment
            </button>
        </div>
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Key Metrics Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Poverty Level Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center hover:shadow-md transition-shadow duration-300">
            <div className="w-full flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">Poverty Status</h3>
                <Info size={16} className="text-slate-300 hover:text-slate-500 cursor-help" />
            </div>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  barSize={16}
                  data={povertyData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 200]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={30} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-4xl font-extrabold text-slate-900">{result.poverty_level_percent}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">of FPL</span>
              </div>
            </div>
            <div className="text-center -mt-4">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border
                ${result.poverty_classification === 'very_low' ? 'bg-red-50 text-red-700 border-red-100' :
                  result.poverty_classification === 'low' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                  'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                {result.poverty_classification.replace('_', ' ').toUpperCase()} INCOME
              </span>
            </div>
          </div>

          {/* Monthly Deficit Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Wallet size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700">Monthly Gap</h3>
                </div>
                <span className={`text-2xl font-extrabold ${result.monthly_deficit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {result.monthly_deficit > 0 ? '-' : '+'}${Math.abs(result.monthly_deficit).toLocaleString()}
                </span>
             </div>

             <div className="h-24 w-full mb-2">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={financialData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide width={0} />
                    <Tooltip
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={32}>
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             {result.monthly_deficit > 0 ? (
               <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                 <TrendingDown size={14} className="flex-shrink-0" />
                 Expenses exceed income. Action needed.
               </p>
             ) : (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <TrendingDown size={14} className="flex-shrink-0 rotate-180" />
                    Budget is currently stable.
                </p>
             )}
          </div>

           {/* Hardships Summary */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Identified Hardships
              </h3>
              <ul className="space-y-2">
                {result.primary_hardships.map((hardship, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    <span className="capitalize">{hardship.replace(/_/g, ' ')}</span>
                  </li>
                ))}
                {result.primary_hardships.length === 0 && (
                  <li className="text-slate-400 italic text-sm">No primary hardships identified in high-priority categories.</li>
                )}
              </ul>
            </div>

        </div>

        {/* Detailed Breakdown Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Detailed Program Eligibility Section */}
          {result.program_eligibility && result.program_eligibility.length > 0 && (
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    Recommended Programs
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Based on your eligibility score, you should prioritize these applications.</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
                   <BadgeCheck size={14} className="text-blue-600" /> AI Verified
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {result.program_eligibility
                  .sort((a, b) => (Number(b.eligible) - Number(a.eligible)) || (b.approval_likelihood_percent - a.approval_likelihood_percent))
                  .map((program) => (
                  <ProgramCard
                    key={program.program_id}
                    program={program}
                    existingApplication={findExistingApp(program.program_name)}
                    onLearnMore={setSelectedProgram}
                    onApply={setApplyingProgram}
                    onViewStatus={onViewApplication}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fallback to simple list if no detailed data */}
          {(!result.program_eligibility || result.program_eligibility.length === 0) && (
             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                  <BadgeCheck className="w-6 h-6 text-indigo-600" />
                  Estimated Program Eligibility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.estimated_eligibility_categories.map((program, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mt-0.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{program}</span>
                        <span className="text-xs text-slate-500">Likely Qualified</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* Family Vulnerabilities & Context */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              Household Profile Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demographics</h4>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-2 rounded-md shadow-sm text-slate-500">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Household Size</p>
                        <p className="text-slate-900 font-bold">{result.household_size} Members</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-2 rounded-md shadow-sm text-slate-500">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Dependents</p>
                        <p className="text-slate-900 font-bold">{result.dependents} Children</p>
                    </div>
                 </div>
                  {result.is_single_parent && (
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-sm">Single Parent Household</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Factors</h4>
                 {result.family_vulnerabilities.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                        {result.family_vulnerabilities.map((vuln, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                <span>{vuln}</span>
                            </div>
                        ))}
                     </div>
                 ) : (
                    !result.is_single_parent && (
                        <p className="text-slate-400 italic text-sm">No specific high-risk vulnerability flags detected in the assessment.</p>
                    )
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;