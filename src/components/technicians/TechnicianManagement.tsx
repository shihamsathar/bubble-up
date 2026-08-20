import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Technician, TechnicianStatus, DutyStatus } from '../../types';
import { DutyStatusBadge } from '../jobcards/JobCardStatusBadge';
import { ItemRemovalModal } from '../common/ItemRemovalModal';
import { RemovalLogsModal } from '../common/RemovalLogsModal';
import { 
  Users, Plus, Search, Phone, Mail, Award, 
  Clock, Truck, CheckCircle, X, Edit, KeyRound, Star, DollarSign,
  Trash2, ClipboardList, ShieldCheck, UserX, UserCheck, Power
} from 'lucide-react';

export const TechnicianManagement: React.FC = () => {
  const { 
    technicians, 
    vehicles, 
    jobCards, 
    addTechnician, 
    updateTechnician, 
    updateTechnicianPassword,
    deleteTechnician, 
    removalLogs, 
    showNotification,
    currentRole
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [techToRemove, setTechToRemove] = useState<Technician | null>(null);
  const [techPasswordToChange, setTechPasswordToChange] = useState<Technician | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showLogsModal, setShowLogsModal] = useState(false);

  // New Tech Form State
  const [empId, setEmpId] = useState(`TECH-${Date.now().toString().slice(-4)}`);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('tech123');
  const [position, setPosition] = useState('Senior Laundry Service Engineer');
  const [specialization, setSpecialization] = useState('VFDs, Steam Heating, Hydraulic Controls');
  const [hourlyRate, setHourlyRate] = useState(85);
  const [assignedVehicleId, setAssignedVehicleId] = useState<string>('');

  const filteredTechs = technicians.filter(t => {
    const specStr = Array.isArray(t.specialization) ? t.specialization.join(' ') : (t.specialization || '');
    const matchesSearch = 
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter || t.currentDutyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find(v => v.id === assignedVehicleId);

    addTechnician({
      employeeId: empId,
      fullName,
      mobile,
      email,
      username: username || fullName.toLowerCase().replace(/\s+/g, '.'),
      password,
      position,
      specialization,
      hourlyRate,
      status: 'ACTIVE',
      currentDutyStatus: 'OFF_DUTY',
      assignedVehicleId: assignedVehicleId || undefined,
      currentDutyVehicleReg: targetVeh?.registrationNumber,
      rating: 5.0
    });

    setShowAddModal(false);
    setFullName('');
    setMobile('');
    setEmail('');
    setUsername('');
    setAssignedVehicleId('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;
    const targetVeh = vehicles.find(v => v.id === editingTech.assignedVehicleId);

    updateTechnician(editingTech.id, {
      fullName: editingTech.fullName,
      mobile: editingTech.mobile,
      email: editingTech.email,
      username: editingTech.username,
      password: editingTech.password,
      position: editingTech.position,
      specialization: editingTech.specialization,
      hourlyRate: editingTech.hourlyRate,
      status: editingTech.status,
      assignedVehicleId: editingTech.assignedVehicleId,
      currentDutyVehicleReg: targetVeh ? targetVeh.registrationNumber : undefined
    });
    setEditingTech(null);
    showNotification('Technician details and credentials updated successfully');
  };

  const handleConfirmRemoval = (reason: string, details?: string) => {
    if (!techToRemove) return;
    deleteTechnician(techToRemove.id, reason, details);
    setTechToRemove(null);
  };

  const handleToggleStatus = (tech: Technician) => {
    const newStatus: TechnicianStatus = tech.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateTechnician(tech.id, { status: newStatus });
    showNotification(`Technician ${tech.fullName} marked as ${newStatus}`);
  };

  const techLogsCount = removalLogs.filter(l => l.itemType === 'TECHNICIAN').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Field Engineering Staff & Technician Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer service technicians, access credentials, QAR hourly rates, assigned service vans, and live shift duty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            title="View Decommissioned Technicians Audit Log"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>Removal Logs ({techLogsCount})</span>
          </button>

          <button
            onClick={() => {
              setEmpId(`TECH-${Date.now().toString().slice(-4)}`);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Technician
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Engineer name, ID, username, or specialization..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Staff ({technicians.length})</option>
            <option value="ACTIVE">Active Status</option>
            <option value="INACTIVE">Inactive / Suspended</option>
            <option value="ON_DUTY">Currently On Duty</option>
            <option value="OFF_DUTY">Currently Off Duty</option>
          </select>
        </div>
      </div>

      {/* Tech Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechs.map((tech) => {
          const techJobs = jobCards.filter(j => j.assignedTechnicianId === tech.id);
          const completedJobs = techJobs.filter(j => j.status === 'COMPLETED');
          const inProgressJobs = techJobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ON_THE_WAY' || j.status === 'ARRIVED');

          return (
            <div key={tech.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded text-xs border border-sky-200">
                    {tech.employeeId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tech.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tech.status}
                    </span>
                    <DutyStatusBadge status={tech.currentDutyStatus} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {tech.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{tech.fullName}</h3>
                    <span className="text-xs text-slate-500 font-medium block truncate">{tech.position}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Username:</span>
                    <strong className="font-mono text-slate-800">{tech.username}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Password:</span>
                    <span className="font-mono text-slate-700 font-semibold">{tech.password || 'tech123'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Contact Mobile:</span>
                    <span className="font-medium text-slate-800">{tech.mobile}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Labor Charge Rate:</span>
                    <span className="font-mono font-bold text-emerald-700">QAR {tech.hourlyRate}/hr</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Assigned Van:</span>
                    <span className="font-semibold text-slate-900">{tech.currentDutyVehicleReg || 'No Vehicle Assigned'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Active / In-Progress:</span>
                    <span className="font-bold text-sky-800">{inProgressJobs.length} active jobs</span>
                  </p>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  <strong className="text-slate-700">Specialization:</strong> {Array.isArray(tech.specialization) ? tech.specialization.join(', ') : tech.specialization}
                </p>
              </div>

              {/* Action & Control Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span><strong>{completedJobs.length}</strong> Done</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {tech.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setTechPasswordToChange(tech);
                      setNewPasswordInput(tech.password || 'tech123');
                    }}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-xs font-semibold border border-amber-300 transition-colors cursor-pointer"
                    title="Change or Reset Technician Login Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(tech)}
                    className={`p-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                      tech.status === 'ACTIVE'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}
                    title={tech.status === 'ACTIVE' ? 'Deactivate Staff' : 'Activate Staff'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEditingTech(tech)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setTechToRemove(tech)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 rounded text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                    title="Remove / Decommission Technician with Reason"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tech Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">Add Field Service Technician</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+974 5512 3456"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tariq@bubbleuptrading.qa"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tariq.m"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Labor Rate (QAR / hr)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Fleet Van (Optional)</label>
                  <select
                    value={assignedVehicleId}
                    onChange={(e) => setAssignedVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="">No Vehicle Assigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.make} {v.model} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Technical Skills & Specializations</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. PLC Inverters, Steam Valving, Industrial Burners"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Create Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tech Modal */}
      {editingTech && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">Admin Control: Edit {editingTech.fullName}</h2>
              <button onClick={() => setEditingTech(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingTech.fullName}
                    onChange={(e) => setEditingTech({ ...editingTech, fullName: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={editingTech.mobile}
                    onChange={(e) => setEditingTech({ ...editingTech, mobile: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username (Login ID)</label>
                  <input
                    type="text"
                    value={editingTech.username}
                    onChange={(e) => setEditingTech({ ...editingTech, username: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reset Password / PIN</label>
                  <input
                    type="text"
                    value={editingTech.password || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, password: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingTech.position}
                    onChange={(e) => setEditingTech({ ...editingTech, position: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Labor Rate (QAR/hr)</label>
                  <input
                    type="number"
                    value={editingTech.hourlyRate}
                    onChange={(e) => setEditingTech({ ...editingTech, hourlyRate: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={editingTech.status}
                    onChange={(e) => setEditingTech({ ...editingTech, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE / SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Vehicle</label>
                  <select
                    value={editingTech.assignedVehicleId || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, assignedVehicleId: e.target.value || undefined })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    <option value="">No Vehicle Assigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Specialization & Skills</label>
                  <input
                    type="text"
                    value={editingTech.specialization}
                    onChange={(e) => setEditingTech({ ...editingTech, specialization: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Technician Password Modal */}
      {techPasswordToChange && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Set Technician Password</h2>
                  <span className="text-[11px] text-slate-400">{techPasswordToChange.fullName} ({techPasswordToChange.employeeId})</span>
                </div>
              </div>
              <button 
                onClick={() => setTechPasswordToChange(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPasswordInput.trim()) return;
                updateTechnicianPassword(techPasswordToChange.id, newPasswordInput.trim());
                setTechPasswordToChange(null);
              }}
              className="p-6 space-y-4 text-xs text-slate-700"
            >
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician:</span>
                  <span className="font-bold text-slate-900">{techPasswordToChange.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Login Username:</span>
                  <span className="font-mono font-bold text-sky-800">@{techPasswordToChange.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Saved Password:</span>
                  <span className="font-mono text-slate-700">{techPasswordToChange.password || 'tech123'}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  New Password / PIN *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (e.g. tech123 or custom)..."
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput('tech123')}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
                >
                  Quick Default: "tech123"
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTechPasswordToChange(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Technician Modal */}
      {techToRemove && (
        <ItemRemovalModal
          item={{
            id: techToRemove.id,
            type: 'TECHNICIAN',
            name: techToRemove.fullName,
            identifier: techToRemove.employeeId,
            category: techToRemove.position,
            location: techToRemove.currentDutyVehicleReg ? `Van: ${techToRemove.currentDutyVehicleReg}` : 'No Vehicle',
            extraInfo: `Username: ${techToRemove.username} | Rate: QAR ${techToRemove.hourlyRate}/hr | Status: ${techToRemove.status}`
          }}
          onClose={() => setTechToRemove(null)}
          onConfirm={handleConfirmRemoval}
        />
      )}

      {/* Removal Logs Audit Modal */}
      {showLogsModal && (
        <RemovalLogsModal
          defaultFilter="TECHNICIAN"
          onClose={() => setShowLogsModal(false)}
        />
      )}

    </div>
  );
};
