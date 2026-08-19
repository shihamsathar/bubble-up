import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobStatusBadge, PriorityBadge, DutyStatusBadge } from '../jobcards/JobCardStatusBadge';
import { LiveTimer } from '../common/LiveTimer';
import { JobCardDetailModal } from '../jobcards/JobCardDetailModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { ServiceJobCard, Technician, Vehicle } from '../../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts';
import { 
  Briefcase, CheckCircle2, Clock, AlertTriangle, Users, 
  Truck, DollarSign, TrendingUp, ShieldCheck, Wrench, ArrowUpRight, 
  Activity, MapPin, Phone, User, Gauge, Calendar, Eye, ChevronRight,
  Radio, KeyRound, RotateCcw, Trash2, Plus, Lock, AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigateToJobs: () => void }> = ({ onNavigateToJobs }) => {
  const { 
    jobCards, technicians, vehicles, spareParts, customers, clearAllRecords
  } = useApp();

  const [selectedJob, setSelectedJob] = useState<ServiceJobCard | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Statistics calculation
  const totalJobs = jobCards.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = jobCards.filter(j => j.scheduledDate === todayStr || j.createdAt.startsWith(todayStr));
  const completedJobs = jobCards.filter(j => j.status === 'COMPLETED');
  const inProgressJobs = jobCards.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ARRIVED');
  const pendingJobs = jobCards.filter(j => j.status === 'NEW' || j.status === 'ASSIGNED' || j.status === 'ACCEPTED');
  const revisitJobs = jobCards.filter(j => j.status === 'REVISIT_REQUIRED' || j.status === 'PARTS_REQUIRED');

  // Active jobs with work timers (in progress or assigned with timer)
  const activeTimerJobs = jobCards.filter(j => 
    j.status === 'IN_PROGRESS' || j.status === 'ARRIVED' || j.isWorkTimerRunning
  );

  const onDutyTechs = technicians.filter(t => t.currentDutyStatus === 'ON_DUTY');
  const assignedVehicles = vehicles.filter(v => v.status === 'ASSIGNED');
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');

  const totalRevenue = jobCards.reduce((sum, j) => sum + j.paidAmount, 0);
  const totalOutstanding = jobCards.reduce((sum, j) => sum + j.outstandingBalance, 0);

  // Chart Data: Dynamic calculation based on actual system records
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const recentMonths = [
    monthNames[(currentMonthIdx - 3 + 12) % 12],
    monthNames[(currentMonthIdx - 2 + 12) % 12],
    monthNames[(currentMonthIdx - 1 + 12) % 12],
    monthNames[currentMonthIdx],
  ];

  const monthlyRevenueData = recentMonths.map(m => ({
    month: m,
    revenue: m === monthNames[currentMonthIdx] ? totalRevenue : 0,
    parts: m === monthNames[currentMonthIdx] ? jobCards.reduce((s, j) => s + (j.partsCost || 0), 0) : 0,
    labor: m === monthNames[currentMonthIdx] ? jobCards.reduce((s, j) => s + (j.laborCost || 0), 0) : 0,
  }));

  // Status breakdown data
  const statusPieData = totalJobs > 0 ? [
    { name: 'Completed', value: completedJobs.length, color: '#10b981' },
    { name: 'In Progress', value: inProgressJobs.length, color: '#8b5cf6' },
    { name: 'Pending / Assigned', value: pendingJobs.length, color: '#0ea5e9' },
    { name: 'Parts / Revisit', value: revisitJobs.length, color: '#f43f5e' },
  ].filter(d => d.value > 0) : [
    { name: 'No Active Orders', value: 1, color: '#94a3b8' }
  ];

  // Technician performance data
  const techWorkloadData = technicians.map(t => {
    const assignedCount = jobCards.filter(j => j.assignedTechnicianId === t.id).length;
    const completedCount = jobCards.filter(j => j.assignedTechnicianId === t.id && j.status === 'COMPLETED').length;
    return {
      name: t.fullName.split(' ')[0],
      assigned: assignedCount,
      completed: completedCount,
      rating: t.rating
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs border border-sky-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              OPERATIONS CONTROL TOWER
            </span>
            <span className="text-xs text-slate-400">Live Telemetry & Field Duty Sync (Admin Monitor)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Laundry Equipment Service Management
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time live duty timers for technicians & assigned vehicles, and automated job card work timers controlled on technician dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">On-Duty Fleet</span>
              <span className="font-mono font-black text-emerald-400 text-sm">{onDutyTechs.length} Technicians Active</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Repairs</span>
              <span className="font-mono font-black text-sky-400 text-sm">{activeTimerJobs.length} Jobs Running</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Change your administrator login password anytime"
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => setIsConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Clear all example and demo data to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today's Jobs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Today's Jobs</span>
            <Briefcase className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{todayJobs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total in system: {totalJobs}</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>In Progress</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{inProgressJobs.length}</div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">Active field work</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{completedJobs.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Passed safety test</div>
        </div>

        {/* Active Techs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Techs On Duty</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{onDutyTechs.length} / {technicians.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Live shift running</div>
        </div>

        {/* Fleet Assigned */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Vans Assigned</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{assignedVehicles.length} / {vehicles.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Fleet on road</div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Outstanding</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 font-mono">QAR {totalOutstanding.toFixed(0)}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Pending billing</div>
        </div>
      </div>

      {/* SECTION 1: LIVE TECHNICIAN DUTY & ASSIGNED VEHICLE SHIFT TRACKER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Technician Duty & Vehicle Assignment Monitor
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {onDutyTechs.length} Active Shift{onDutyTechs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live telemetry: Duty timer starts when the technician assigns a vehicle on their dashboard and reflects in real-time until they return to office and stop the timer.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Admin Live Monitor (Read-Only)</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => {
              const isOnDuty = tech.currentDutyStatus === 'ON_DUTY';
              const assignedVehicle = vehicles.find(v => v.id === tech.assignedVehicleId);
              const activeTechJobs = jobCards.filter(j => j.assignedTechnicianId === tech.id && (j.status === 'IN_PROGRESS' || j.status === 'ARRIVED'));

              return (
                <div 
                  key={tech.id} 
                  className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                    isOnDuty 
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white border-emerald-600/60 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div>
                    {/* Top Row: Tech Identity & Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {tech.profilePhoto ? (
                          <img 
                            src={tech.profilePhoto} 
                            alt={tech.fullName} 
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-sky-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {tech.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className={`font-bold text-sm leading-tight ${isOnDuty ? 'text-white' : 'text-slate-900'}`}>
                              {tech.fullName}
                            </h3>
                          </div>
                          <span className={`text-[11px] block mt-0.5 ${isOnDuty ? 'text-slate-400' : 'text-slate-500'}`}>
                            {tech.employeeId} • {tech.position}
                          </span>
                        </div>
                      </div>

                      <DutyStatusBadge status={tech.currentDutyStatus} />
                    </div>

                    {/* ASSIGNED VEHICLE & LIVE DUTY TIMER ROW */}
                    {isOnDuty ? (
                      <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3.5 space-y-3 mb-3">
                        
                        {/* Vehicle Number Display */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-400" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-400 block leading-none">
                                Assigned Vehicle
                              </span>
                              <span className="font-mono font-black text-sm text-white">
                                {tech.currentDutyVehicleReg || assignedVehicle?.registrationNumber || 'QA-5821'}
                              </span>
                            </div>
                          </div>

                          {/* LIVE DUTY SHIFT TIMER */}
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block leading-none mb-0.5">
                              Live Duty Time
                            </span>
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <LiveTimer 
                                startTime={tech.dutyStartTime} 
                                isRunning={true} 
                                showIcon={false}
                                className="text-sm font-black font-mono text-emerald-200 tracking-tight"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Shift Departure Details */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/80 text-[11px]">
                          <div>
                            <span className="text-emerald-400/80 block text-[10px]">Shift Started:</span>
                            <span className="text-slate-200 font-mono font-semibold">
                              {tech.dutyStartTime ? new Date(tech.dutyStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400/80 block text-[10px]">Start Mileage:</span>
                            <span className="text-slate-200 font-mono font-semibold">
                              {tech.dutyStartMileage ? `${tech.dutyStartMileage.toLocaleString()} km` : '42,100 km'}
                            </span>
                          </div>
                        </div>

                        {assignedVehicle && (
                          <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                            <span className="truncate">{assignedVehicle.make} {assignedVehicle.model}</span>
                            <span className="font-mono text-slate-400">{assignedVehicle.vehicleType}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 mb-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">No Vehicle Assigned</span>
                          <span className="font-mono text-[11px] text-slate-400">Shift Inactive / At Office</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Duty timer is stopped. Technician starts vehicle duty from their mobile portal.
                        </p>
                      </div>
                    )}

                    {/* Active Jobs info for this tech */}
                    <div className={`text-xs p-2.5 rounded-lg mb-2 flex items-center justify-between ${
                      isOnDuty ? 'bg-slate-800/80 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                        <span>Active Orders in Field:</span>
                      </span>
                      <span className="font-bold text-sky-400 font-mono">
                        {activeTechJobs.length} In-Progress
                      </span>
                    </div>
                  </div>

                  {/* Read-Only Status Note for Admin */}
                  <div className={`text-[11px] text-center py-1.5 px-2 rounded-lg font-medium ${
                    isOnDuty 
                      ? 'bg-emerald-950/40 text-emerald-300/90 border border-emerald-800/50' 
                      : 'bg-slate-200/60 text-slate-500'
                  }`}>
                    {isOnDuty ? '🟢 Active in field (Controlled by tech in portal)' : '⚪ Off duty (Technician will start upon vehicle assignment)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE ACTIVE JOB CARDS & WORK DURATION TIMERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Active Job Cards & Work Duration Timers
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[11px] font-bold border border-sky-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                {activeTimerJobs.length} Active Repair{activeTimerJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live job timers running under the assigned technician's name. Technicians manage and finish jobs on their dashboards; real-time status reflects here automatically.
            </p>
          </div>

          <button
            onClick={onNavigateToJobs}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All {jobCards.length} Job Cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6">
          {activeTimerJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeTimerJobs.map((job) => {
                const assignedTech = technicians.find(t => t.id === job.assignedTechnicianId);

                return (
                  <div 
                    key={job.id}
                    className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Job Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-sky-50 text-sky-900 px-2.5 py-0.5 rounded border border-sky-200">
                              {job.jobCardNumber}
                            </span>
                            <PriorityBadge priority={job.priority} />
                            <JobStatusBadge status={job.status} size="sm" />
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-1.5">{job.customerName}</h3>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {job.customerArea}, {job.customerCity}
                          </span>
                        </div>

                        {/* LIVE JOB WORK TIMER DISPLAY */}
                        <div className="text-right bg-sky-50/80 border border-sky-200 p-2.5 rounded-xl shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block leading-none mb-1">
                            Live Work Timer
                          </span>
                          <div className="flex items-center gap-1.5 justify-end">
                            {job.isWorkTimerRunning && job.status !== 'COMPLETED' ? (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                              </span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                            )}
                            <LiveTimer 
                              startTime={job.workStartedAt}
                              endTime={job.workCompletedAt}
                              isRunning={job.isWorkTimerRunning && job.status !== 'COMPLETED'}
                              showIcon={false}
                              className="text-base font-black font-mono text-sky-950 tracking-tight"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {job.status === 'COMPLETED' ? 'Work Completed' : job.isWorkTimerRunning ? 'Active in Progress' : 'Paused by Technician'}
                          </span>
                        </div>
                      </div>

                      {/* Equipment & Problem */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100 my-3">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Equipment:</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-sky-700" />
                            {job.machineBrand} {job.machineModel}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">SN: {job.machineSerial}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Assigned Technician:</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-[10px]">
                              {job.assignedTechnicianName?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-slate-900">{job.assignedTechnicianName}</span>
                          </div>
                          {assignedTech?.currentDutyVehicleReg && (
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                              <Truck className="w-3 h-3 text-slate-400" />
                              Van: {assignedTech.currentDutyVehicleReg}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Problem summary */}
                      <p className="text-xs text-slate-600 line-clamp-2">
                        <strong className="text-slate-800">Fault: </strong>
                        {job.problemDescription || job.customerComplaint}
                      </p>
                    </div>

                    {/* Read-Only Admin Controls Bar: No start/stop buttons for Admin */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          ⏱️ Timer controlled by {job.assignedTechnicianName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Field Work in Progress</h4>
              <p className="text-xs text-slate-500 mt-1">All scheduled job cards are either completed or awaiting technician dispatch.</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Charts (Revenue Trend + Job Status Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-700" />
                Service Revenue & Spare Parts Trend (QAR)
              </h3>
              <p className="text-xs text-slate-500">Monthly billing breakdown between technical labor & replacement parts</p>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Total Recorded: QAR {totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorParts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`QAR ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="parts" name="Parts Invoiced" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorParts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Job Order Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution of active workload</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {statusPieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Technician Workload Bar Chart + Low Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tech Workload Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Technician Dispatch & Completion Workload</h3>
              <p className="text-xs text-slate-500">Number of assigned vs completed jobs per engineer</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="assigned" name="Assigned Orders" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Parts & Emergency Dispatches */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-rose-600" />
              Critical Inventory Stock Alerts
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Min Level Threshold</span>
          </div>

          <div className="space-y-2.5">
            {spareParts.slice(0, 4).map((p) => {
              const isLow = p.stockQuantity <= p.minStockLevel;
              return (
                <div key={p.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{p.partNumber}</span>
                    <p className="text-slate-600 truncate text-[11px] max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.stockQuantity} in stock
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Min: {p.minStockLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Full Job Card Detail Modal */}
      {selectedJob && (
        <JobCardDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* Change Admin Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}

      {/* Clear Records Confirmation Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Clear All Dashboard Records?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will wipe all existing customer records, job cards, machines, parts, and vehicles so you can start completely fresh with real enterprise data.
              </p>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllRecords();
                    setIsConfirmClearOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Yes, Clear All Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
