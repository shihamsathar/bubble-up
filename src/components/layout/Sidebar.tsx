import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Briefcase, Truck, Users, 
  Building, Wrench, Package, FileText, BarChart3, 
  Shield, KeyRound, DollarSign, Terminal, Settings
} from 'lucide-react';

export type NavTab = 
  | 'DASHBOARD' 
  | 'JOBCARDS' 
  | 'TECH_JOBS' 
  | 'TECH_VEHICLE_DUTY' 
  | 'CUSTOMERS' 
  | 'EQUIPMENT' 
  | 'FLEET' 
  | 'TECHNICIANS' 
  | 'INVENTORY' 
  | 'FINANCE' 
  | 'REPORTS';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDeliverables: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onOpenDeliverables }) => {
  const { currentRole, jobCards, technicians, vehicles, spareParts } = useApp();

  const pendingJobsCount = jobCards.filter(j => j.status !== 'COMPLETED').length;
  const onDutyCount = technicians.filter(t => t.currentDutyStatus === 'ON_DUTY').length;

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex flex-col justify-between shrink-0 space-y-6">
      
      <div className="space-y-6">
        
        {/* Role Indicator Card */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Current Workspace
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              {currentRole === 'ADMIN' ? (
                <>
                  <Shield className="w-4 h-4 text-sky-400" />
                  Admin Console
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Technician Portal
                </>
              )}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentRole === 'ADMIN' ? 'bg-sky-900/60 text-sky-300 border border-sky-700' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
            }`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs font-semibold">
          
          {/* ADMIN NAVIGATION */}
          {currentRole === 'ADMIN' && (
            <>
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block py-1.5">
                Overview & Operations
              </span>

              <button
                onClick={() => onTabChange('DASHBOARD')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'DASHBOARD' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Executive Dashboard
                </span>
              </button>

              <button
                onClick={() => onTabChange('JOBCARDS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'JOBCARDS' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4" />
                  Service Job Cards
                </span>
                {pendingJobsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-sky-800 text-white rounded text-[10px] font-mono">
                    {pendingJobsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('CUSTOMERS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'CUSTOMERS' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Building className="w-4 h-4" />
                  Customers & Plants
                </span>
              </button>

              <button
                onClick={() => onTabChange('EQUIPMENT')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'EQUIPMENT' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4" />
                  Equipment Registry
                </span>
              </button>

              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block pt-4 pb-1">
                Fleet & Logistics
              </span>

              <button
                onClick={() => onTabChange('FLEET')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'FLEET' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  Fleet & Vehicles
                </span>
              </button>

              <button
                onClick={() => onTabChange('TECHNICIANS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'TECHNICIANS' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  Technicians & Staff
                </span>
                {onDutyCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-800 text-emerald-100 rounded text-[10px] font-mono">
                    {onDutyCount} on duty
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('INVENTORY')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'INVENTORY' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  Spare Parts Stock
                </span>
              </button>

              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block pt-4 pb-1">
                Accounts & Reports
              </span>

              <button
                onClick={() => onTabChange('FINANCE')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'FINANCE' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4" />
                  Invoices & Payments
                </span>
              </button>

              <button
                onClick={() => onTabChange('REPORTS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'REPORTS' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  Executive Reports
                </span>
              </button>
            </>
          )}

          {/* TECHNICIAN FIELD PORTAL NAVIGATION */}
          {currentRole === 'TECHNICIAN' && (
            <>
              <span className="px-3 text-[10px] font-bold text-emerald-400 uppercase tracking-wider block py-1.5">
                Field Technician Workflow
              </span>

              <button
                onClick={() => onTabChange('TECH_VEHICLE_DUTY')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'TECH_VEHICLE_DUTY' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4" />
                  1. Assign Vehicle & Duty
                </span>
              </button>

              <button
                onClick={() => onTabChange('TECH_JOBS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'TECH_JOBS' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4" />
                  2. Assigned Work Orders
                </span>
              </button>

              <button
                onClick={() => onTabChange('INVENTORY')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'INVENTORY' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  Van Spare Parts Stock
                </span>
              </button>

              <button
                onClick={() => onTabChange('EQUIPMENT')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'EQUIPMENT' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4" />
                  Machine Manuals & Specs
                </span>
              </button>
            </>
          )}

        </nav>
      </div>

      {/* Footer Deliverables Shortcut */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Deliverables Ready</span>
        </div>
        <button
          onClick={onOpenDeliverables}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Python Backend & Build</span>
        </button>
      </div>

    </aside>
  );
};
