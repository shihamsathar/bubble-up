import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import laundryFacilityBg from './assets/images/laundry_facility_bg_1787139064485.jpg';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { JobCardsList } from './components/jobcards/JobCardsList';
import { TechnicianJobsList } from './components/technician/TechnicianJobsList';
import { VehicleDutyTab } from './components/technician/VehicleDutyTab';
import { CustomersList } from './components/customers/CustomersList';
import { EquipmentRegistry } from './components/equipment/EquipmentRegistry';
import { VehicleManagement } from './components/fleet/VehicleManagement';
import { TechnicianManagement } from './components/technicians/TechnicianManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { InvoicesPayments } from './components/finance/InvoicesPayments';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { StandaloneDeliverablesModal } from './components/deployment/StandaloneDeliverablesModal';
import { LoginModal } from './components/auth/LoginModal';
import { AuthGateway } from './components/auth/AuthGateway';

const MainContent: React.FC = () => {
  const { currentRole, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>(currentRole === 'ADMIN' ? 'DASHBOARD' : 'TECH_VEHICLE_DUTY');
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Sync tab when switching roles
  React.useEffect(() => {
    if (currentRole === 'TECHNICIAN') {
      const techAllowedTabs: NavTab[] = ['TECH_JOBS', 'TECH_VEHICLE_DUTY', 'INVENTORY', 'EQUIPMENT'];
      if (!techAllowedTabs.includes(activeTab)) {
        setActiveTab('TECH_JOBS');
      }
    } else {
      const adminAllowedTabs: NavTab[] = ['DASHBOARD', 'JOBCARDS', 'CUSTOMERS', 'EQUIPMENT', 'FLEET', 'TECHNICIANS', 'INVENTORY', 'FINANCE', 'REPORTS'];
      if (!adminAllowedTabs.includes(activeTab)) {
        setActiveTab('DASHBOARD');
      }
    }
  }, [currentRole]);

  // If user is not logged in, enforce Admin / Technician Login Gateway first
  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <div 
      className="min-h-screen bg-slate-900 bg-cover bg-center bg-fixed flex flex-col text-slate-800 antialiased font-sans relative"
      style={{ backgroundImage: `url(${laundryFacilityBg})` }}
    >
      {/* Semi-transparent professional layer for optimal contrast & readability */}
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Content Body */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top App Header */}
        <Header 
          onOpenDeliverables={() => setShowDeliverables(true)}
          onOpenLogin={() => setShowLogin(true)}
        />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-5">
          
          {/* Sidebar Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onOpenDeliverables={() => setShowDeliverables(true)}
          />

          {/* Dynamic Center Stage Views */}
          <main className="flex-1 min-w-0">
            {activeTab === 'DASHBOARD' && (
              <AdminDashboard onNavigateToJobs={() => setActiveTab('JOBCARDS')} />
            )}

            {activeTab === 'JOBCARDS' && (
              <JobCardsList />
            )}

            {activeTab === 'TECH_JOBS' && (
              <TechnicianJobsList />
            )}

            {activeTab === 'TECH_VEHICLE_DUTY' && (
              <VehicleDutyTab />
            )}

            {activeTab === 'CUSTOMERS' && (
              <CustomersList />
            )}

            {activeTab === 'EQUIPMENT' && (
              <EquipmentRegistry />
            )}

            {activeTab === 'FLEET' && (
              <VehicleManagement />
            )}

            {activeTab === 'TECHNICIANS' && (
              <TechnicianManagement />
            )}

            {activeTab === 'INVENTORY' && (
              <InventoryManagement />
            )}

            {activeTab === 'FINANCE' && (
              <InvoicesPayments />
            )}

            {activeTab === 'REPORTS' && (
              <ReportsAnalytics />
            )}
          </main>

        </div>

        {/* Standalone Python & SQL Deliverables Modal */}
        {showDeliverables && (
          <StandaloneDeliverablesModal onClose={() => setShowDeliverables(false)} />
        )}

        {/* Login & Role Switcher Modal */}
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} />
        )}

      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
