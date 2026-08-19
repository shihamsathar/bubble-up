import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard } from '../../types';
import { JobStatusBadge, PriorityBadge, WarrantyBadge } from '../jobcards/JobCardStatusBadge';
import { JobExecutionModal } from './JobExecutionModal';
import { JobCameraCaptureModal, JOB_PHOTO_STEPS } from './JobCameraCaptureModal';
import { PrintableJobCard } from '../jobcards/PrintableJobCard';
import { 
  Wrench, Building, Calendar, Clock, MapPin, Phone, 
  ArrowRight, CheckCircle2, AlertTriangle, Printer, Search, Camera
} from 'lucide-react';

export const TechnicianJobsList: React.FC = () => {
  const { jobCards, currentUser, technicians } = useApp();

  const currentTech = technicians.find(t => t.id === currentUser.technicianId || t.username === currentUser.username) || technicians[0];
  const [selectedJob, setSelectedJob] = useState<ServiceJobCard | null>(null);
  const [cameraJob, setCameraJob] = useState<ServiceJobCard | null>(null);
  const [printJob, setPrintJob] = useState<ServiceJobCard | null>(null);
  const [filterTab, setFilterTab] = useState<'TODAY' | 'ALL' | 'COMPLETED'>('TODAY');

  // Filter jobs for this technician
  const myJobs = jobCards.filter(j => j.assignedTechnicianId === currentTech?.id);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = myJobs.filter(j => j.scheduledDate === todayStr || j.status === 'IN_PROGRESS' || j.status === 'ARRIVED');
  const completedJobs = myJobs.filter(j => j.status === 'COMPLETED');

  const displayedJobs = filterTab === 'TODAY' ? todayJobs : filterTab === 'COMPLETED' ? completedJobs : myJobs;

  return (
    <div className="space-y-6">
      
      {/* Technician Welcome Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technician Daily Duty & Job Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View assigned work orders, client locations, commercial equipment specs, and execute 1-by-1 photo audit on-site.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterTab('TODAY')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${filterTab === 'TODAY' ? 'bg-white text-sky-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Today's Assigned ({todayJobs.length})
          </button>
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${filterTab === 'ALL' ? 'bg-white text-sky-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Work Orders ({myJobs.length})
          </button>
          <button
            onClick={() => setFilterTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${filterTab === 'COMPLETED' ? 'bg-white text-sky-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Completed ({completedJobs.length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedJobs.map((job) => {
          const completedStepsCount = JOB_PHOTO_STEPS.filter(
            s => job.photos.some(p => p.type === s.photoType)
          ).length;

          return (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                      {job.jobCardNumber}
                    </span>
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <JobStatusBadge status={job.status} size="sm" />
                </div>

                {/* Customer */}
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-sky-700 transition-colors">
                  {job.customerName}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.customerArea}, {job.customerCity}</span>
                </p>
              </div>

              {/* Machine & Problem info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-sky-700" />
                    {job.machineBrand} {job.machineModel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{job.machineCapacity}kg</span>
                </div>
                <p className="text-slate-600 line-clamp-2 text-[11px]">
                  {job.problemDescription || job.customerComplaint}
                </p>

                {/* 1-by-1 Photo Audit Status Ribbon */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-sky-700" />
                    4-Step Photo Audit:
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    completedStepsCount === 4 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {completedStepsCount} of 4 Completed
                  </span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.scheduledTime}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-700">{job.serviceType.replace(/_/g, ' ')}</span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setCameraJob(job)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Launch 1-by-1 Phone Camera"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                  <button
                    onClick={() => setPrintJob(job)}
                    className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded"
                    title="Print Job Card"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    Open Job
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {displayedJobs.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No pending jobs in this view</h3>
            <p className="text-xs text-slate-500 mt-1">All service orders for this queue have been completed or none are scheduled.</p>
          </div>
        )}
      </div>

      {/* Execution Modal */}
      {selectedJob && (
        <JobExecutionModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* Direct 1-by-1 Camera Capture Modal */}
      {cameraJob && (
        <JobCameraCaptureModal
          job={cameraJob}
          initialStepIndex={0}
          onClose={() => setCameraJob(null)}
        />
      )}

      {/* Printable Modal */}
      {printJob && (
        <PrintableJobCard job={printJob} onClose={() => setPrintJob(null)} />
      )}

    </div>
  );
};
