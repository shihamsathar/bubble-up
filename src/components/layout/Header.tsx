import React from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';
import { COMPANY_INFO } from '../../types';
import { 
  Bell, User, LogOut, Shield, 
  Truck, Terminal, MapPin, Mail, Phone, MessageSquare
} from 'lucide-react';

interface HeaderProps {
  onOpenDeliverables: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDeliverables, onOpenLogin }) => {
  const { 
    currentUser, currentRole, setCurrentRole, logout, 
    technicians, notification 
  } = useApp();

  const currentTech = technicians.find(t => t.id === currentUser.technicianId || t.username === currentUser.username);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Company Info Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-1 px-4 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="font-semibold text-sky-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{COMPANY_INFO.address}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a 
              href={`mailto:${COMPANY_INFO.email}`} 
              className="hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{COMPANY_INFO.email}</span>
            </a>
            <a 
              href={`https://wa.me/${COMPANY_INFO.whatsappClean}`} 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-emerald-400 flex items-center gap-1 font-semibold text-emerald-400 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp: {COMPANY_INFO.mobile}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <CompanyLogo size="md" variant="badge" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">BUBBLE UP TRADING</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wider">
                  DOHA • QATAR
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block font-medium">Commercial Laundry Equipment Sales, Service & Job Cards</p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-3">
            
            {/* Quick Role Switcher Pill */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
              <button
                onClick={() => setCurrentRole('ADMIN')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'ADMIN' 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Mode</span>
                <span className="sm:hidden">Admin</span>
              </button>

              <button
                onClick={() => setCurrentRole('TECHNICIAN')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'TECHNICIAN' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Technician Portal</span>
                <span className="sm:hidden">Tech</span>
              </button>
            </div>

            {/* Standalone Deliverables Button */}
            <button
              onClick={onOpenDeliverables}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hidden md:flex"
              title="View Python Backend, PostgreSQL DDL & PyInstaller Build scripts"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Python & SQL Code</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block leading-none">{currentUser.name || 'User'}</span>
                <span className="text-[10px] text-slate-400">{currentUser.role === 'ADMIN' ? 'Operations Admin' : currentTech?.fullName || 'Field Tech'}</span>
              </div>

              <button
                onClick={onOpenLogin}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Switch Account"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Switch</span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
                title="Sign Out to Login Gateway"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Global Notification Toast Bar */}
      {notification && (
        <div className="bg-sky-700 text-white px-4 py-1.5 text-center text-xs font-semibold shadow-xs flex items-center justify-center gap-2">
          <span>{notification}</span>
        </div>
      )}
    </header>
  );
};
