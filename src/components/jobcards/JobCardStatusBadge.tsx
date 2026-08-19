import React from 'react';
import { JobStatus, JobPriority, PaymentStatus, VehicleStatus, TechnicianDutyStatus, WarrantyStatus } from '../../types';

export const JobStatusBadge: React.FC<{ status: JobStatus; size?: 'sm' | 'md' | 'lg' }> = ({ status, size = 'md' }) => {
  const styles: Record<JobStatus, { bg: string; text: string; border: string; label: string }> = {
    NEW: { bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200', text: 'text-blue-700', label: 'New Request' },
    ASSIGNED: { bg: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200', text: 'text-indigo-700', label: 'Assigned' },
    ACCEPTED: { bg: 'bg-cyan-50 text-cyan-700', border: 'border-cyan-200', text: 'text-cyan-700', label: 'Accepted' },
    ON_THE_WAY: { bg: 'bg-amber-50 text-amber-700', border: 'border-amber-200', text: 'text-amber-700', label: 'On The Way' },
    ARRIVED: { bg: 'bg-orange-50 text-orange-700', border: 'border-orange-200', text: 'text-orange-700', label: 'Arrived at Site' },
    IN_PROGRESS: { bg: 'bg-purple-50 text-purple-700', border: 'border-purple-200', text: 'text-purple-700', label: 'In Progress' },
    PARTS_REQUIRED: { bg: 'bg-rose-50 text-rose-700', border: 'border-rose-200', text: 'text-rose-700', label: 'Parts Required' },
    WAITING_FOR_CUSTOMER: { bg: 'bg-yellow-50 text-yellow-800', border: 'border-yellow-200', text: 'text-yellow-800', label: 'Waiting for Customer' },
    COMPLETED: { bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Completed' },
    INCOMPLETE: { bg: 'bg-zinc-100 text-zinc-700', border: 'border-zinc-300', text: 'text-zinc-700', label: 'Incomplete' },
    REVISIT_REQUIRED: { bg: 'bg-red-50 text-red-700', border: 'border-red-200', text: 'text-red-700', label: 'Revisit Required' },
    ESCALATED_TO_CHIEF: { bg: 'bg-amber-50 text-amber-900', border: 'border-amber-400', text: 'text-amber-900', label: 'Escalated to Chief Tech' },
    TEAM_SUPPORT_ACTIVE: { bg: 'bg-sky-50 text-sky-900', border: 'border-sky-400', text: 'text-sky-900', label: 'Team Support Active' },
    REASSIGNED: { bg: 'bg-slate-100 text-slate-700', border: 'border-slate-300', text: 'text-slate-700', label: 'Reassigned' },
    CANCELLED: { bg: 'bg-gray-100 text-gray-500', border: 'border-gray-300', text: 'text-gray-500', label: 'Cancelled' },
  };

  const current = styles[status] || styles.NEW;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1 font-semibold' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${current.bg} ${current.border} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {current.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const config: Record<JobPriority, { bg: string; text: string; label: string }> = {
    EMERGENCY: { bg: 'bg-red-600 text-white font-bold animate-pulse', text: 'text-white', label: 'EMERGENCY' },
    HIGH: { bg: 'bg-amber-100 text-amber-800 font-semibold border border-amber-300', text: 'text-amber-800', label: 'High Priority' },
    MEDIUM: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', text: 'text-blue-700', label: 'Medium' },
    LOW: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', text: 'text-gray-600', label: 'Low' },
  };

  const item = config[priority] || config.MEDIUM;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${item.bg}`}>
      {item.label}
    </span>
  );
};

export const PaymentBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const config: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
    PAID: { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300', text: 'text-emerald-800', label: 'Paid Full' },
    PARTIAL: { bg: 'bg-amber-100 text-amber-800 border border-amber-300', text: 'text-amber-800', label: 'Partial Paid' },
    UNPAID: { bg: 'bg-red-50 text-red-700 border border-red-200', text: 'text-red-700', label: 'Unpaid' },
    REFUNDED: { bg: 'bg-purple-100 text-purple-800 border border-purple-200', text: 'text-purple-800', label: 'Refunded' },
    CREDIT_ACCOUNT: { bg: 'bg-blue-100 text-blue-800 border border-blue-200', text: 'text-blue-800', label: 'Credit Account' },
  };
  const item = config[status] || config.UNPAID;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${item.bg}`}>
      {item.label}
    </span>
  );
};

export const VehicleStatusBadge: React.FC<{ status: VehicleStatus }> = ({ status }) => {
  const config: Record<VehicleStatus, { bg: string; label: string }> = {
    AVAILABLE: { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-200', label: 'Available' },
    ASSIGNED: { bg: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'On Duty / Assigned' },
    UNDER_MAINTENANCE: { bg: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'In Workshop' },
    INACTIVE: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', label: 'Inactive' },
  };
  const item = config[status] || config.AVAILABLE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.bg}`}>
      {item.label}
    </span>
  );
};

export const DutyStatusBadge: React.FC<{ status: TechnicianDutyStatus }> = ({ status }) => {
  const config: Record<TechnicianDutyStatus, { bg: string; dot: string; label: string }> = {
    ON_DUTY: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 animate-pulse', label: 'ON DUTY' },
    OFF_DUTY: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400', label: 'OFF DUTY' },
    ON_BREAK: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'ON BREAK' },
    IN_TRANSIT: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500 animate-ping', label: 'IN TRANSIT' },
  };
  const item = config[status] || config.OFF_DUTY;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.bg}`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${item.dot}`} />
      {item.label}
    </span>
  );
};

export const WarrantyBadge: React.FC<{ status: WarrantyStatus }> = ({ status }) => {
  const config: Record<WarrantyStatus, { bg: string; label: string }> = {
    ACTIVE: { bg: 'bg-teal-50 text-teal-700 border border-teal-200', label: 'Under Warranty' },
    EXPIRED: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', label: 'Warranty Expired' },
    EXTENDED_WARRANTY: { bg: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Extended AMC' },
    VOID: { bg: 'bg-red-50 text-red-700 border border-red-200', label: 'Warranty Void' },
  };
  const item = config[status] || config.ACTIVE;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.bg}`}>
      {item.label}
    </span>
  );
};
