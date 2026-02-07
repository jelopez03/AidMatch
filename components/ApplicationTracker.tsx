import React, { useState } from 'react';
import { ApplicationRecord, AppNotification, ApplicationStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Bell, 
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  Hourglass,
  X,
  FileBadge
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: ApplicationRecord[];
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onFindPrograms: () => void;
}

// --- Sub-Components ---

const ApplicationDetailsModal: React.FC<{ 
  app: ApplicationRecord | null; 
  onClose: () => void; 
}> = ({ app, onClose }) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{app.category}</span>
            <h3 className="text-xl font-bold text-slate-900">{app.program_name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Current Status</p>
              <div className="mt-1">
                <StatusBadge status={app.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-medium">Confirmation #</p>
              <p className="font-mono font-bold text-slate-800">{app.confirmation_number}</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between border-b border-slate-100 pb-3">
               <span className="text-slate-600">Submitted Date</span>
               <span className="font-medium text-slate-900">{new Date(app.submitted_date).toLocaleDateString()}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-3">
               <span className="text-slate-600">Last Updated</span>
               <span className="font-medium text-slate-900">{new Date(app.last_updated).toLocaleDateString()}</span>
             </div>
             {app.estimated_decision_date && (
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Est. Decision Date</span>
                  <span className="font-medium text-blue-700">{new Date(app.estimated_decision_date).toLocaleDateString()}</span>
                </div>
             )}
             {app.benefit_amount && (
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Benefit Amount</span>
                  <span className="font-bold text-green-700">{app.benefit_amount}</span>
                </div>
             )}
          </div>

          {app.next_steps && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
               <h4 className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
                 <AlertCircle size={16} /> Next Steps Required
               </h4>
               <p className="text-sm text-amber-800">{app.next_steps}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const config = {
    approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, text: 'Approved' },
    under_review: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, text: 'Under Review' },
    waitlisted: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Hourglass, text: 'Waitlisted' },
    action_required: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, text: 'Action Required' },
    denied: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertCircle, text: 'Denied' },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

const NotificationItem: React.FC<{ notification: AppNotification }> = ({ notification }) => {
  const icons = {
    success: <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><CheckCircle2 size={16} className="text-green-600" /></div>,
    action: <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><AlertCircle size={16} className="text-red-600" /></div>,
    warning: <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><AlertCircle size={16} className="text-amber-600" /></div>,
    info: <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-blue-600" /></div>,
  };

  return (
    <div className={`flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/40' : ''}`}>
      {icons[notification.type]}
      <div>
        <div className="flex justify-between items-start w-full">
          <h4 className={`text-sm font-semibold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notification.date}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notification.message}</p>
      </div>
    </div>
  );
};

const ApplicationCard: React.FC<{ 
  app: ApplicationRecord;
  onClick: () => void;
}> = ({ app, onClick }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{app.category}</span>
          <h3 className="font-bold text-slate-900 text-lg mt-0.5">{app.program_name}</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mb-4">
        <StatusBadge status={app.status} />
      </div>

      <div className="space-y-3 mb-4 flex-grow">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Submitted</span>
          <span className="text-slate-700 font-medium">{new Date(app.submitted_date).toLocaleDateString()}</span>
        </div>
        
        {app.estimated_decision_date && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Est. Decision</span>
            <span className="text-slate-700 font-medium">{new Date(app.estimated_decision_date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
          <span className="text-slate-500">Conf. Number</span>
          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{app.confirmation_number}</span>
        </div>

        {app.status === 'action_required' && app.next_steps && (
          <div className="bg-red-50 text-red-800 text-xs p-2.5 rounded-lg mt-2 border border-red-100 flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{app.next_steps}</span>
          </div>
        )}

        {app.status === 'approved' && app.benefit_amount && (
           <div className="bg-green-50 text-green-800 text-xs p-2.5 rounded-lg mt-2 border border-green-100 flex gap-2">
             <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
             <span className="font-semibold">Benefit: {app.benefit_amount}</span>
           </div>
        )}
      </div>

      <button 
        onClick={onClick}
        className="w-full mt-auto py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
      >
        View Details <ChevronRight size={14} />
      </button>
    </div>
  );
};

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ 
  applications, 
  notifications, 
  onMarkAllRead,
  onFindPrograms
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.program_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.confirmation_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <ApplicationDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
              <p className="text-slate-500 text-sm mt-1">Track the status of your financial assistance requests</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search applications..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <ApplicationCard 
                key={app.id} 
                app={app} 
                onClick={() => setSelectedApp(app)}
              />
            ))}
            
            {/* Find New Programs Card */}
            <div 
              onClick={onFindPrograms}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group min-h-[300px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <ArrowUpRight size={24} />
              </div>
              <h3 className="font-semibold text-slate-600 group-hover:text-blue-700">Find New Programs</h3>
              <p className="text-xs mt-1 max-w-[200px]">Check eligibility for other assistance opportunities available in your area.</p>
            </div>
          </div>
        </div>

        {/* Sidebar / Notifications */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bell size={16} className="text-blue-600" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="p-2">
                    <NotificationItem notification={notif} />
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 text-center">
                <button 
                  onClick={onMarkAllRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-default"
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Our case workers are available to assist with your applications.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicationTracker;