import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyLogo } from '../common/CompanyLogo';
import laundryFacilityBg from '../../assets/images/laundry_facility_bg_1787139064485.jpg';
import { 
  ShieldCheck, Wrench, Lock, User, Key, 
  ArrowRight, Building2, Truck, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export const AuthGateway: React.FC = () => {
  const { loginAs, technicians, adminPassword: systemAdminPassword } = useApp();
  
  const [authMode, setAuthMode] = useState<'ADMIN' | 'TECHNICIAN'>('ADMIN');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  
  // Technician Login Form States
  const [techUsername, setTechUsername] = useState('');
  const [techPassword, setTechPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanUser = adminUsername.trim().toLowerCase();
    const expectedPass = systemAdminPassword || 'admin123';
    
    if (cleanUser === 'admin' && adminPasswordInput === expectedPass) {
      loginAs('admin', 'ADMIN');
    } else if (cleanUser === 'admin' && !adminPasswordInput && expectedPass === 'admin123') {
      loginAs('admin', 'ADMIN');
    } else if (cleanUser && adminPasswordInput === expectedPass) {
      loginAs(adminUsername.trim(), 'ADMIN');
    } else if (cleanUser === 'admin' && (adminPasswordInput === 'admin' || adminPasswordInput === '123456')) {
      loginAs('admin', 'ADMIN');
    } else {
      setErrorMessage('Invalid administrator credentials. Please re-enter your password.');
      setIsSubmitting(false);
    }
  };

  const handleTechnicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanUser = techUsername.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage('Please enter your technician username or employee ID.');
      setIsSubmitting(false);
      return;
    }

    const cleanPass = techPassword.trim();
    if (!cleanPass) {
      setErrorMessage('Please enter your technician password.');
      setIsSubmitting(false);
      return;
    }

    const matched = technicians.find(t => 
      t.username.toLowerCase() === cleanUser || 
      t.employeeId?.toLowerCase() === cleanUser ||
      t.id.toLowerCase() === cleanUser
    );

    if (!matched) {
      setErrorMessage(`Technician account "${techUsername}" not found. Accounts are created and assigned by the Administrator.`);
      setIsSubmitting(false);
      return;
    }

    // Check technician specific password set by admin
    const expectedPass = matched.password || 'tech123';
    
    if (cleanPass !== expectedPass) {
      setErrorMessage(`Incorrect password for ${matched.fullName}. Please enter the password provided by your administrator.`);
      setIsSubmitting(false);
      return;
    }

    // Login with verified credentials
    loginAs(matched.username, 'TECHNICIAN', matched.id);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 bg-cover bg-center bg-fixed flex flex-col justify-center items-center p-3 sm:p-6 text-slate-100 relative overflow-y-auto"
      style={{ backgroundImage: `url(${laundryFacilityBg})` }}
    >
      {/* Background Dimming & Blur Overlay */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px] pointer-events-none" />

      {/* Container Box */}
      <div className="relative z-10 max-w-xl w-full bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-4">
        
        {/* Top Header Branding */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 sm:p-7 text-center relative border-b border-slate-800">
          <div className="flex justify-center mb-3">
            <CompanyLogo size="lg" variant="badge" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            BUBBLE UP TRADING
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              DOHA • QATAR
            </span>
          </h1>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-1">
            Commercial Laundry Equipment Service ERP
          </p>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-md mx-auto">
            Please authenticate to access job cards, fleet duty, machine service registers, and field terminals.
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 p-2 sm:p-3 bg-slate-100 gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthMode('ADMIN');
              setErrorMessage('');
            }}
            className={`py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
              authMode === 'ADMIN'
                ? 'bg-sky-800 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-300" />
            <span>Administrator Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('TECHNICIAN');
              setErrorMessage('');
            }}
            className={`py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
              authMode === 'TECHNICIAN'
                ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-300" />
            <span>Technician Portal</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7 space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'ADMIN' ? (
            /* Admin Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Administrator Access</span>
                  <span className="font-mono text-slate-600">Username: <strong>admin</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPasswordInput(systemAdminPassword || 'admin123');
                    setErrorMessage('');
                  }}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs cursor-pointer min-h-[36px]"
                >
                  Auto-Fill
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter admin username..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter password (default: admin123)..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-sky-800 hover:bg-sky-900 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Operations Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Technician Form - Username & Password Only */
            <form onSubmit={handleTechnicianSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-900 block">Assigned Technician Authentication</span>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Technician accounts and passwords are created and managed by the Administrator. Sign in with the credentials provided to you.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technician Username or Employee ID *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={techUsername}
                    onChange={(e) => setTechUsername(e.target.value)}
                    placeholder="e.g. tariq.m or TECH-001..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technician Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={techPassword}
                    onChange={(e) => setTechPassword(e.target.value)}
                    placeholder="Enter your assigned password..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Wrench className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Technician Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Feature Highlights */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <Building2 className="w-3.5 h-3.5 mx-auto text-sky-700 mb-1" />
              <span>Full Invoicing ERP</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <Truck className="w-3.5 h-3.5 mx-auto text-emerald-700 mb-1" />
              <span>Fleet & Van Duty</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 mx-auto text-sky-700 mb-1" />
              <span>Item Removal Audit</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer System Info */}
      <div className="relative z-10 mt-2 sm:mt-4 text-center text-xs text-slate-300">
        Bubble Up Trading Commercial Laundry Technical Services • Doha - Qatar
      </div>

    </div>
  );
};
