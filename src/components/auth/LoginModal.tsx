import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import { Shield, Truck, KeyRound, Lock, User, X, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { loginAs, technicians } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username.');
      return;
    }
    const matchedTech = technicians.find(t => t.username === username || t.id === username);
    loginAs(username, role, matchedTech?.id);
    onClose();
  };

  const selectQuickAccount = (user: string, pass: string, targetRole: UserRole) => {
    setUsername(user);
    setPassword(pass);
    setRole(targetRole);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <CompanyLogo variant="badge" size="sm" />
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Authentication & Role Switch</h2>
              <span className="text-[11px] text-slate-400">Bubble Up Trading Enterprise System</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Accounts Selection */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            1-Tap Instant Switch or Select Account:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAs('admin', 'ADMIN');
                onClose();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                loginAs('admin', 'ADMIN');
                onClose();
              }}
              className="p-2.5 rounded-lg border border-sky-600 bg-sky-50 text-left text-xs transition-all cursor-pointer touch-manipulation hover:bg-sky-100 min-h-[44px]"
            >
              <div className="flex items-center gap-1.5 font-bold text-sky-950">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Administrator
              </div>
              <span className="text-[10px] text-sky-700 font-medium block">Switch to Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loginAs('tariq.m', 'TECHNICIAN', 'tech-1');
                onClose();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                loginAs('tariq.m', 'TECHNICIAN', 'tech-1');
                onClose();
              }}
              className="p-2.5 rounded-lg border border-emerald-600 bg-emerald-50 text-left text-xs transition-all cursor-pointer touch-manipulation hover:bg-emerald-100 min-h-[44px]"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Technician (Tariq)
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block">Switch to Tech</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Access Role</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer ${role === 'ADMIN' ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold' : 'border-slate-200'}`}>
                <input
                  type="radio"
                  name="role"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="text-sky-600"
                />
                <span>Administrator</span>
              </label>

              <label className={`border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer ${role === 'TECHNICIAN' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'}`}>
                <input
                  type="radio"
                  name="role"
                  checked={role === 'TECHNICIAN'}
                  onChange={() => setRole('TECHNICIAN')}
                  className="text-emerald-600"
                />
                <span>Technician</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Username / ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Sign In & Switch Profile
          </button>
        </form>

      </div>
    </div>
  );
};
