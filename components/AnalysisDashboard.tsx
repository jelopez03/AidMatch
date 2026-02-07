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
  Info
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
  onReset: () => void;
  onApplicationSubmit: (app: ApplicationRecord) => void;
}

// --- Sub-Components ---

const ProgramModal: React.FC<{ 
  program: ProgramEligibility | null; 
  onClose: () => void;
  onApply: (p: ProgramEligibility) => void;
}> = ({ program, onClose, onApply }) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {program.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{program.program_name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Eligibility Status */}
          <div className={`p-4 rounded-xl border ${program.eligible ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-start gap-3">
              {program.eligible ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h4 className={`font-semibold ${program.eligible ? 'text-green-800' : 'text-red-800'}`}>
                  {program.eligible ? 'You Likely Qualify' : 'Not Eligible Based on Current Data'}
                </h4>
                <p className={`text-sm mt-1 ${program.eligible ? 'text-green-700' : 'text-red-700'}`}>
                  {program.reason_eligible}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          {program.eligible && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Est. Benefit</p>
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
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Processing Time</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {program.processing_days} Days
                </div>
              </div>
            </div>
          )}

          {/* Docs Checklist (Static for POC) */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-slate-500" />
              Documents Likely Required
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Proof of Identity (ID, Driver's License)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Proof of Income (Pay stubs, Tax returns)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Proof of Residency (Lease, Utility bill)
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          {program.eligible && (
            <button 
              onClick={() => { onClose(); onApply(program); }}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              Start Application <ArrowRight size={16} />
            </button>
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
    }, 2500);
  };

  if (status === 'success' && generatedApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
        className="mb-6 text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {status === 'submitting' ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Submitting Application...</h2>
          <p className="text-slate-500">Securely transmitting your data to the {program.category} department.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-blue-400" />
              <div className="text-xs font-semibold tracking-wider text-blue-200 uppercase border border-blue-400/30 px-2 py-1 rounded">
                Official Application Portal
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Apply for {program.program_name}</h1>
            <p className="text-slate-300">Complete the final review to submit your request for assistance.</p>
          </div>

          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-3/4"></div>
                </div>
              </div>
              <span className="ml-4 text-sm font-medium text-slate-500">Step 3 of 3: Review</span>
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
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  Application Details
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-4 flex justify-between">
                    <span className="text-slate-600">Assistance Type</span>
                    <span className="font-medium text-slate-900">{program.category}</span>
                  </div>
                  <div className="p-4 flex justify-between">
                    <span className="text-slate-600">Est. Monthly Value</span>
                    <span className="font-medium text-slate-900">
                      ${program.estimated_monthly_benefit || 'Determined upon review'}
                    </span>
                  </div>
                  <div className="p-4 flex justify-between">
                    <span className="text-slate-600">Priority Level</span>
                    <span className="font-medium text-green-600">High (Based on Hardship)</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-slate-600">
                  I certify that the information provided in my assessment is true and correct to the best of my knowledge. 
                  I understand that this is a simulated submission for demonstration purposes.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-4">
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
                  ${!agreed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:scale-[1.02] active:scale-95'}
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
  onLearnMore: (p: ProgramEligibility) => void;
  onApply: (p: ProgramEligibility) => void;
}> = ({ program, onLearnMore, onApply }) => {
  const isEligible = program.eligible;
  const confidenceColor = 
    program.approval_likelihood_percent >= 80 ? 'bg-green-500' :
    program.approval_likelihood_percent >= 50 ? 'bg-yellow-500' : 
    'bg-red-500';

  return (
    <div className={`rounded-xl border p-5 transition-all flex flex-col h-full ${isEligible ? 'bg-white border-green-200 shadow-sm hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-90'}`}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400" />
            )}
            <h4 className={`font-bold ${isEligible ? 'text-slate-800' : 'text-slate-500'}`}>{program.program_name}</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {program.category}
            </span>
            {isEligible && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                {program.approval_likelihood_percent}% Approval Chance
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 mb-3 leading-relaxed line-clamp-2">
            {program.reason_eligible}
          </p>

          {isEligible && (
            <div className="flex items-center gap-4 text-sm mt-4 pt-3 border-t border-dashed border-slate-200">
              {(program.estimated_monthly_benefit || program.estimated_annual_benefit) && (
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span>
                    {program.estimated_monthly_benefit 
                      ? `$${program.estimated_monthly_benefit.toLocaleString()}/mo` 
                      : `$${program.estimated_annual_benefit?.toLocaleString()}/yr`}
                  </span>
                  <span className="text-xs font-normal text-slate-400 ml-1">est.</span>
                </div>
              )}
              {program.processing_days > 0 && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{program.processing_days} days</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEligible && (
          <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px]">
            <div className="h-16 w-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`w-full ${confidenceColor} rounded-full transition-all duration-1000`} 
                style={{ height: `${program.approval_likelihood_percent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Match</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
        <button 
          onClick={() => onLearnMore(program)}
          className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          Learn More
        </button>
        {isEligible && (
          <button 
            onClick={() => onApply(program)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
          >
            Apply Now <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onReset, onApplicationSubmit }) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramEligibility | null>(null);
  const [applyingProgram, setApplyingProgram] = useState<ProgramEligibility | null>(null);

  const getPovertyColor = (percent: number) => {
    if (percent <= 50) return '#ef4444'; // Red - Very Low
    if (percent <= 100) return '#f97316'; // Orange - Low
    if (percent <= 150) return '#eab308'; // Yellow - Moderate
    return '#22c55e'; // Green - Okay
  };

  const getDeficitColor = (deficit: number) => {
    return deficit > 0 ? '#ef4444' : '#22c55e';
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
        onClose={() => setSelectedProgram(null)} 
        onApply={(p) => setApplyingProgram(p)}
      />

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financial Analysis Report</h1>
          <p className="text-slate-500 mt-2">Generated based on your provided household profile</p>
        </div>
        <button 
          onClick={onReset}
          className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Key Metrics Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Poverty Level Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Poverty Level Indicator</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  barSize={20} 
                  data={povertyData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 200]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-3xl font-bold text-slate-800">{result.poverty_level_percent}%</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">of Poverty Line</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${result.poverty_classification === 'very_low' ? 'bg-red-100 text-red-700' : 
                  result.poverty_classification === 'low' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'}`}>
                {result.poverty_classification.replace('_', ' ').toUpperCase()} Income
              </span>
            </div>
          </div>

          {/* Monthly Deficit Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Monthly Shortfall
             </h3>
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500">Net Balance</span>
                <span className={`text-2xl font-bold ${result.monthly_deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.monthly_deficit > 0 ? '-' : '+'}${Math.abs(result.monthly_deficit).toLocaleString()}
                </span>
             </div>
             <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={financialData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide width={10} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             {result.monthly_deficit > 0 && (
               <p className="text-sm text-red-600 mt-2 flex items-start gap-1">
                 <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                 Your expenses exceed your reported income. Immediate assistance may be required to stabilize housing and food security.
               </p>
             )}
          </div>

           {/* Hardships Summary */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Identified Hardships
              </h3>
              <ul className="space-y-3">
                {result.primary_hardships.map((hardship, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="capitalize">{hardship.replace(/_/g, ' ')}</span>
                  </li>
                ))}
                {result.primary_hardships.length === 0 && (
                  <li className="text-slate-400 italic">No primary hardships identified in high-priority categories.</li>
                )}
              </ul>
            </div>

        </div>

        {/* Detailed Breakdown Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Program Eligibility Section */}
          {result.program_eligibility && result.program_eligibility.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BadgeCheck className="w-6 h-6 text-blue-600" />
                  Recommended Assistance Programs
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                  AI Estimated
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {result.program_eligibility
                  .sort((a, b) => (Number(b.eligible) - Number(a.eligible)) || (b.approval_likelihood_percent - a.approval_likelihood_percent))
                  .map((program) => (
                  <ProgramCard 
                    key={program.program_id} 
                    program={program} 
                    onLearnMore={setSelectedProgram}
                    onApply={setApplyingProgram}
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Household Context & Vulnerabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Family Profile</h4>
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">Household Size: <strong>{result.household_size}</strong></span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">Dependents: <strong>{result.dependents}</strong></span>
                 </div>
                  {result.is_single_parent && (
                  <div className="flex items-center gap-2 text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Single Parent Household</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                 <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Vulnerability Flags</h4>
                 {result.family_vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <span>{vuln}</span>
                  </div>
                ))}
                {result.family_vulnerabilities.length === 0 && !result.is_single_parent && (
                  <p className="text-slate-400 italic text-sm">No specific high-risk vulnerability flags detected.</p>
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