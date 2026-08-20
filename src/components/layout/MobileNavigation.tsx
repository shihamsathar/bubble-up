import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from './Sidebar';
import { 
  LayoutDashboard, Briefcase, Truck, Users, 
  Building, Wrench, Package, FileText, BarChart3, 
  Shield, Menu, X, Terminal, LogOut, User, KeyRound, DollarSign
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDeliverables: () => void;
  onOpenLogin: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenDeliverables,
  onOpenLogin
}) => {
  const { currentRole, jobCards, technicians, logout, currentUser } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const pendingJobsCount = jobCards.filter(j => j.status !== 'COMPLETED').length;
  const onDutyCount = technicians.filter(t => t.currentDutyStatus === 'ON_DUTY').length;
  const currentTech = technicians.find(t => t.id === currentUser.technicianId || t.username === currentUser.username);
  const myPendingJobs = jobCards.filter(j => j.assignedTechnicianId === currentTech?.id && j.status !== 'COMPLETED').length;

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Top Mobile Quick-Scroll Pill Strip */}
      <div className="lg:hidden bg-slate-950/90 border-b border-slate-800 p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0 sticky top-16 z-30 shadow-xs">
        {currentRole === 'ADMIN' ? (
          <>
            <button
              onClick={() => handleSelectTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectTab('JOBCARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'JOBCARDS'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Cards</span>
              {pendingJobsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                  {pendingJobsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab('TECHNICIANS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'TECHNICIANS'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Technicians</span>
              {onDutyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-bold">
                  {onDutyCount} Live
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab('FLEET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'FLEET'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Fleet Vans</span>
            </button>

            <button
              onClick={() => handleSelectTab('FINANCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'FINANCE'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Invoices</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-slate-800 text-sky-400 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>More...</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSelectTab('TECH_VEHICLE_DUTY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'TECH_VEHICLE_DUTY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Van & Duty Shift</span>
            </button>

            <button
              onClick={() => handleSelectTab('TECH_JOBS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'TECH_JOBS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>My Job Orders</span>
              {myPendingJobs > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                  {myPendingJobs}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab('INVENTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'INVENTORY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Van Stock</span>
            </button>

            <button
              onClick={() => handleSelectTab('EQUIPMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                activeTab === 'EQUIPMENT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Machine Specs</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </>
        )}
      </div>

      {/* Fixed Bottom Dock on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {currentRole === 'ADMIN' ? (
          <>
            <button
              onClick={() => handleSelectTab('DASHBOARD')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer ${
                activeTab === 'DASHBOARD' ? 'text-sky-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'DASHBOARD' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectTab('JOBCARDS')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer relative ${
                activeTab === 'JOBCARDS' ? 'text-sky-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className={`w-5 h-5 mb-0.5 ${activeTab === 'JOBCARDS' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Jobs</span>
              {pendingJobsCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => handleSelectTab('TECHNICIANS')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer relative ${
                activeTab === 'TECHNICIANS' ? 'text-sky-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'TECHNICIANS' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Techs</span>
              {onDutyCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleSelectTab('FLEET')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer ${
                activeTab === 'FLEET' ? 'text-sky-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className={`w-5 h-5 mb-0.5 ${activeTab === 'FLEET' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>Fleet</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span>More</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSelectTab('TECH_VEHICLE_DUTY')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer ${
                activeTab === 'TECH_VEHICLE_DUTY' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className={`w-5 h-5 mb-0.5 ${activeTab === 'TECH_VEHICLE_DUTY' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Shift Van</span>
            </button>

            <button
              onClick={() => handleSelectTab('TECH_JOBS')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer relative ${
                activeTab === 'TECH_JOBS' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className={`w-5 h-5 mb-0.5 ${activeTab === 'TECH_JOBS' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Work Orders</span>
              {myPendingJobs > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => handleSelectTab('INVENTORY')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer ${
                activeTab === 'INVENTORY' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className={`w-5 h-5 mb-0.5 ${activeTab === 'INVENTORY' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Van Stock</span>
            </button>

            <button
              onClick={() => handleSelectTab('EQUIPMENT')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] transition-colors cursor-pointer ${
                activeTab === 'EQUIPMENT' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className={`w-5 h-5 mb-0.5 ${activeTab === 'EQUIPMENT' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Machines</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold min-w-[56px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer / More Menu Modal */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Full Module Navigation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                  {currentRole}
                </span>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="p-4 space-y-2 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-2">
                All Modules:
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {currentRole === 'ADMIN' ? (
                  <>
                    <button
                      onClick={() => handleSelectTab('DASHBOARD')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'DASHBOARD' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('JOBCARDS')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'JOBCARDS' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Job Cards</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('CUSTOMERS')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'CUSTOMERS' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Building className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Customers</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('EQUIPMENT')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'EQUIPMENT' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Equipment</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('TECHNICIANS')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'TECHNICIANS' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Users className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Technicians</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('FLEET')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'FLEET' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Fleet Vans</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('INVENTORY')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'INVENTORY' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Package className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Spare Parts</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('FINANCE')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'FINANCE' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Invoices & Billing</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('REPORTS')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer col-span-2 ${
                        activeTab === 'REPORTS' ? 'bg-sky-600 text-white border-sky-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Analytics & PDF Reports</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleSelectTab('TECH_VEHICLE_DUTY')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'TECH_VEHICLE_DUTY' ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Van & Shift</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('TECH_JOBS')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'TECH_JOBS' ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>My Job Orders</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('INVENTORY')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'INVENTORY' ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Van Spare Parts</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('EQUIPMENT')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeTab === 'EQUIPMENT' ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Machine Registry</span>
                    </button>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenDeliverables();
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>View Python Backend & SQL DDL</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenLogin();
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Switch Role</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      logout();
                    }}
                    className="py-2.5 px-3 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-rose-800/80 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
