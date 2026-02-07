import React, { useState, useEffect } from 'react';
import { UserProfile, AnalysisResult, ApplicationRecord, AppNotification, ApplicationStatus } from './types';
import FinancialForm from './components/FinancialForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import ApplicationTracker from './components/ApplicationTracker';
import { analyzeFinancialProfile, checkProgramEligibility } from './services/geminiService';
import { 
  saveAssessment, 
  fetchApplications, 
  createApplication, 
  fetchNotifications, 
  createNotification,
  markAllNotificationsRead 
} from './services/dbService';
import { Database, LayoutDashboard, Calculator, FileText } from 'lucide-react';
import { isSupabaseConfigured } from './services/supabaseClient';
import { Logo } from './components/Logo';

type ViewState = 'assessment' | 'tracker';

// Initial Mock Data (Fallback)
const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'APP-8921-SNAP',
    program_name: 'SNAP Food Benefits',
    category: 'Food',
    status: 'approved',
    submitted_date: '2025-04-10',
    last_updated: '2025-04-24',
    confirmation_number: 'SNAP-2025-CA-8921',
    benefit_amount: '$291/mo',
    estimated_decision_date: '2025-04-24'
  },
  {
    id: 'APP-3321-LIHEAP',
    program_name: 'LIHEAP Energy Assistance',
    category: 'Utilities',
    status: 'under_review',
    submitted_date: '2025-05-02',
    last_updated: '2025-05-03',
    confirmation_number: 'LIH-9928-3321',
    estimated_decision_date: '2025-05-22'
  },
  {
    id: 'APP-7712-HCV',
    program_name: 'Housing Choice Voucher (Section 8)',
    category: 'Housing',
    status: 'waitlisted',
    submitted_date: '2025-03-15',
    last_updated: '2025-03-20',
    confirmation_number: 'HCV-WA-7712',
    next_steps: 'Waitlist position: #432. Annual check-in required.',
    estimated_decision_date: 'Unknown'
  },
  {
    id: 'APP-1120-WIC',
    program_name: 'WIC Program',
    category: 'Food/Health',
    status: 'approved',
    submitted_date: '2025-04-28',
    last_updated: '2025-05-01',
    confirmation_number: 'WIC-2210-1120',
    benefit_amount: 'Vouchers Active'
  },
  {
    id: 'APP-0092-TANF',
    program_name: 'Temporary Assistance (TANF)',
    category: 'Cash Assistance',
    status: 'action_required',
    submitted_date: '2025-05-01',
    last_updated: '2025-05-04',
    confirmation_number: 'TANF-NY-0092',
    next_steps: 'Upload proof of residency document.'
  },
  {
    id: 'APP-5543-MED',
    program_name: 'Medicaid / CHIP',
    category: 'Healthcare',
    status: 'under_review',
    submitted_date: '2025-05-04',
    last_updated: '2025-05-04',
    confirmation_number: 'MED-5543-XX',
    estimated_decision_date: '2025-06-18'
  }
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOT-1',
    type: 'action',
    title: 'Action Required: TANF Application',
    message: 'Please upload your proof of residency to complete your TANF application review.',
    date: '2 hours ago',
    read: false
  },
  {
    id: 'NOT-2',
    type: 'success',
    title: 'SNAP Benefits Approved',
    message: 'Your application for SNAP has been approved. Your card will arrive in 5-7 business days.',
    date: '1 day ago',
    read: false
  },
  {
    id: 'NOT-3',
    type: 'info',
    title: 'LIHEAP Application Received',
    message: 'We have received your application for Energy Assistance. Current processing time is 15 days.',
    date: '3 days ago',
    read: true
  },
  {
    id: 'NOT-4',
    type: 'warning',
    title: 'Housing Waitlist Update',
    message: 'Annual check-in required to maintain your position on the Section 8 waitlist.',
    date: '1 week ago',
    read: true
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('assessment');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | null>(null);

  // Shared State
  const [applications, setApplications] = useState<ApplicationRecord[]>(MOCK_APPLICATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Hydrate data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseConfigured()) {
        setIsDbConnected(true);
        try {
          // Load Applications
          const apps = await fetchApplications();
          if (apps && apps.length > 0) {
            setApplications(apps);
          } else {
            // Optional: Seed initial data if DB is empty, or just leave it empty
            // For now, if empty, we might show empty state or keep mock data if we want a demo feel
             if (apps) setApplications(apps); // If array is empty, set empty
          }

          // Load Notifications
          const notifs = await fetchNotifications();
          if (notifs && notifs.length > 0) {
            setNotifications(notifs);
          } else {
             if (notifs) setNotifications(notifs);
          }
        } catch (e) {
          console.error("Failed to load DB data", e);
        }
      }
    };
    loadData();
  }, []);

  const handleFormSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    setLoadingStage('Analyzing financial profile...');
    setError(null);
    setSaveStatus(null);

    try {
      // Step 1: Basic Analysis
      const baseResult = await analyzeFinancialProfile(data);
      
      setLoadingStage('Matching with assistance programs...');
      
      // Step 2: Detailed Program Eligibility Check
      const eligibilityResult = await checkProgramEligibility(data, baseResult);
      
      // Combine results
      const finalResult: AnalysisResult = {
        ...baseResult,
        program_eligibility: eligibilityResult
      };

      setAnalysisResult(finalResult);

      // Step 3: Save to Database (if configured)
      if (isSupabaseConfigured()) {
        setLoadingStage('Saving results...');
        const saved = await saveAssessment(data, finalResult);
        if (saved) {
          setSaveStatus('saved');
        } else {
          console.warn("Could not save to database");
        }
      }

    } catch (err) {
      setError("Failed to analyze profile. Please try again or check your API key.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setSaveStatus(null);
  };

  const handleApplicationSubmit = async (app: ApplicationRecord) => {
    // Optimistic Update
    setApplications(prev => [app, ...prev]);

    const newNotif: AppNotification = {
      id: `temp-${Date.now()}`, // Temporary ID for UI
      type: 'info',
      title: 'Application Submitted',
      message: `Your application for ${app.program_name} has been received.`,
      date: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Persist to DB if connected
    if (isSupabaseConfigured()) {
      await createApplication(app);
      await createNotification({
        type: newNotif.type,
        title: newNotif.title,
        message: newNotif.message
      });
      // In a real app we might re-fetch here to get the DB IDs
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    if (isSupabaseConfigured()) {
      await markAllNotificationsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentView('assessment')}
            >
              <Logo className="h-10 w-10" />
              <span className="text-2xl font-bold text-slate-800 tracking-tight">AidMatch</span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Desktop Nav Links */}
              <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 mr-2">
                <button 
                  onClick={() => setCurrentView('assessment')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    currentView === 'assessment' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {analysisResult ? <FileText size={16} /> : <Calculator size={16} />}
                  {analysisResult ? 'Current Assessment' : 'New Assessment'}
                </button>
                <button 
                  onClick={() => setCurrentView('tracker')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    currentView === 'tracker' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  My Applications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {isDbConnected && (
                <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  <Database size={12} />
                  <span>Cloud Connected</span>
                </div>
              )}
              
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 cursor-pointer">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'tracker' ? (
            <ApplicationTracker 
              applications={applications}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onFindPrograms={() => setCurrentView('assessment')}
            />
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {!analysisResult ? (
                <div className="flex flex-col items-center">
                  <div className="text-center mb-10 max-w-2xl">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                      Check Your Eligibility & <br className="hidden sm:block" />
                      <span className="text-blue-600">Discover Financial Assistance</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                      Discover and apply for financial assistance you're eligible for—automatically.
                    </p>
                  </div>
                  <FinancialForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                  {isLoading && loadingStage && (
                     <div className="mt-4 text-slate-500 font-medium animate-pulse">{loadingStage}</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {saveStatus === 'saved' && (
                    <div className="flex justify-end animate-in fade-in duration-500">
                       <span className="text-xs text-slate-400 flex items-center gap-1">
                         <Database size={10} />
                         Assessment saved to database
                       </span>
                    </div>
                  )}
                  <AnalysisDashboard 
                    result={analysisResult} 
                    onReset={handleReset} 
                    onApplicationSubmit={handleApplicationSubmit}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} AidMatch. This tool provides estimates only and is not an official government determination.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;