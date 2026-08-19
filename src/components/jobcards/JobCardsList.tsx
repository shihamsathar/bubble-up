import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard, JobStatus, JobPriority, ServiceType } from '../../types';
import { JobStatusBadge, PriorityBadge, WarrantyBadge, PaymentBadge } from './JobCardStatusBadge';
import { NewJobCardModal } from './NewJobCardModal';
import { JobCardDetailModal } from './JobCardDetailModal';
import { PrintableJobCard } from './PrintableJobCard';
import { LiveTimer } from '../common/LiveTimer';
import { 
  Plus, Search, Filter, Printer, Eye, Calendar, Clock, 
  User, Building, Wrench, ChevronDown, Download, AlertTriangle, ArrowUpDown
} from 'lucide-react';

export const JobCardsList: React.FC = () => {
  const { jobCards, customers, technicians } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL');

  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ServiceJobCard | null>(null);
  const [printJob, setPrintJob] = useState<ServiceJobCard | null>(null);

  // Filtered jobs
  const filteredJobs = jobCards.filter((job) => {
    const matchesSearch = 
      job.jobCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.machineBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.machineSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.invoiceNumber && job.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || job.priority === priorityFilter;
    const matchesTech = technicianFilter === 'ALL' || job.assignedTechnicianId === technicianFilter;
    const matchesType = serviceTypeFilter === 'ALL' || job.serviceType === serviceTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTech && matchesType;
  });

  const exportCSV = () => {
    const headers = [
      'Job Number', 'Date', 'Customer', 'Equipment', 'Serial No', 
      'Technician', 'Priority', 'Status', 'Total QAR', 'Paid QAR', 'Balance QAR', 'Invoice Ref'
    ];
    const rows = filteredJobs.map(j => [
      j.jobCardNumber,
      j.scheduledDate,
      `"${j.customerName}"`,
      `"${j.machineBrand} ${j.machineModel}"`,
      j.machineSerial,
      `"${j.assignedTechnicianName}"`,
      j.priority,
      j.status,
      j.totalAmount.toFixed(2),
      j.paidAmount.toFixed(2),
      j.outstandingBalance.toFixed(2),
      j.invoiceNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bubble_up_trading_jobcards_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Job Cards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management of laundry equipment installations, breakdown diagnostics, maintenance & repairs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => setShowNewJobModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Job Card
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Job #, Customer, Machine, Serial, or Invoice..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses ({jobCards.length})</option>
              <option value="NEW">New Request</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PARTS_REQUIRED">Parts Required</option>
              <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVISIT_REQUIRED">Revisit Required</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Filter Counters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 overflow-x-auto">
          <span className="font-semibold text-slate-700">Quick Filters:</span>
          <button
            onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${statusFilter === 'ALL' && priorityFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            All Jobs ({jobCards.length})
          </button>
          <button
            onClick={() => { setPriorityFilter('EMERGENCY'); setStatusFilter('ALL'); }}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${priorityFilter === 'EMERGENCY' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
          >
            Emergency ({jobCards.filter(j => j.priority === 'EMERGENCY').length})
          </button>
          <button
            onClick={() => { setStatusFilter('IN_PROGRESS'); setPriorityFilter('ALL'); }}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${statusFilter === 'IN_PROGRESS' ? 'bg-purple-700 text-white font-bold' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
          >
            In Progress ({jobCards.filter(j => j.status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => { setStatusFilter('COMPLETED'); setPriorityFilter('ALL'); }}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${statusFilter === 'COMPLETED' ? 'bg-emerald-700 text-white font-bold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            Completed ({jobCards.filter(j => j.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => { setStatusFilter('PARTS_REQUIRED'); setPriorityFilter('ALL'); }}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${statusFilter === 'PARTS_REQUIRED' ? 'bg-rose-700 text-white font-bold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
          >
            Parts Required ({jobCards.filter(j => j.status === 'PARTS_REQUIRED').length})
          </button>
        </div>
      </div>

      {/* Job Cards Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Job Card #</th>
                <th className="py-3 px-4 font-semibold">Date & Priority</th>
                <th className="py-3 px-4 font-semibold">Customer / Site</th>
                <th className="py-3 px-4 font-semibold">Machine / Equipment</th>
                <th className="py-3 px-4 font-semibold">Assigned Tech</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Total (QAR)</th>
                <th className="py-3 px-4 font-semibold text-center">Payment</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  
                  {/* Job Card Number */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sky-900 group-hover:text-sky-700 text-sm block">
                      {job.jobCardNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {job.serviceType.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Scheduled Date & Priority */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {job.scheduledDate}
                    </div>
                    <div>
                      <PriorityBadge priority={job.priority} />
                    </div>
                  </td>

                  {/* Customer / Site */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 line-clamp-1">{job.customerName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>{job.customerArea}, {job.customerCity}</span>
                    </div>
                  </td>

                  {/* Machine / Equipment */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {job.machineBrand} {job.machineModel}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      SN: {job.machineSerial} ({job.machineCapacity}kg)
                    </div>
                  </td>

                  {/* Assigned Tech */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      {job.assignedTechnicianName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {job.scheduledTime}
                    </div>
                    {/* Live Work Timer or Duration */}
                    {job.isWorkTimerRunning && job.status !== 'COMPLETED' ? (
                      <div className="mt-1">
                        <LiveTimer
                          startTime={job.workStartedAt}
                          isRunning={true}
                          variant="badge"
                        />
                      </div>
                    ) : job.actualWorkDurationMinutes ? (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{job.actualWorkDurationMinutes} mins logged</span>
                      </div>
                    ) : null}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <JobStatusBadge status={job.status} size="sm" />
                  </td>

                  {/* Total & Balance */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-slate-900">
                      QAR {job.totalAmount.toFixed(2)}
                    </div>
                    {job.outstandingBalance > 0 ? (
                      <div className="text-[10px] font-mono text-amber-700 font-semibold">
                        Due: {job.outstandingBalance.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                        Settled
                      </div>
                    )}
                  </td>

                  {/* Payment Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <PaymentBadge status={job.paymentStatus} />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                        title="View & Edit Job Card"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPrintJob(job)}
                        className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                        title="Print Official Job Card"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No service job cards found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredJobs.length} of {jobCards.length} Job Cards</span>
          <span className="font-mono">Bubble Up Trading Management System v2.6</span>
        </div>
      </div>

      {/* New Job Card Modal */}
      {showNewJobModal && (
        <NewJobCardModal onClose={() => setShowNewJobModal(false)} />
      )}

      {/* Job Card Details & Workflow Modal */}
      {selectedJob && (
        <JobCardDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* Printable Modal */}
      {printJob && (
        <PrintableJobCard job={printJob} onClose={() => setPrintJob(null)} />
      )}

    </div>
  );
};
