import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard, JobStatus, PaymentMethod, JobComment, CustomerSatisfactionRating } from '../../types';
import { JobStatusBadge, PriorityBadge, WarrantyBadge, PaymentBadge } from './JobCardStatusBadge';
import { PrintableJobCard } from './PrintableJobCard';
import { JobEscalationModal } from './JobEscalationModal';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { LiveTimer } from '../common/LiveTimer';
import { createWhatsAppLink, createMailtoLink } from '../../utils/contactHelpers';
import { 
  X, Printer, Edit, Trash2, Plus, Wrench, Building, User, Calendar, 
  Clock, CheckCircle, ShieldCheck, DollarSign, Camera, FileText, ChevronRight, AlertCircle,
  Play, Pause, CheckSquare, CheckCircle2, MessageSquare, Send, AlertTriangle, Mail, Phone,
  ShieldAlert, Star, Check, PenTool, ThumbsUp, Users
} from 'lucide-react';

interface JobCardDetailModalProps {
  job: ServiceJobCard;
  onClose: () => void;
}

export const JobCardDetailModal: React.FC<JobCardDetailModalProps> = ({ job, onClose }) => {
  const { 
    updateJobCard, updateJobStatus, addPartToJob, removePartFromJob, 
    addPhotoToJob, recordJobPayment, deleteJobCard, spareParts, technicians, currentRole,
    currentUser, startJobWorkTimer, pauseJobWorkTimer, stopJobWorkTimer, addJobComment,
    showNotification
  } = useApp();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string>(spareParts[0]?.id || '');
  const [partQty, setPartQty] = useState<number>(1);
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(job.outstandingBalance);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [photoType, setPhotoType] = useState<'BEFORE_REPAIR' | 'FAULT_POINT' | 'PARTS_REPLACED' | 'AFTER_REPAIR'>('AFTER_REPAIR');
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Digital Signature Canvas Modal
  const [signingParty, setSigningParty] = useState<'CUSTOMER' | 'TECHNICIAN' | null>(null);

  // Customer Satisfaction state
  const [custSatisfaction, setCustSatisfaction] = useState<CustomerSatisfactionRating>(
    job.customerSatisfaction || 'SATISFIED'
  );
  const [custSatisfactionNotes, setCustSatisfactionNotes] = useState(
    job.customerSatisfactionNotes || ''
  );

  // Editable diagnosis & repair fields
  const [initialDiag, setInitialDiag] = useState(job.initialDiagnosis || '');
  const [workDone, setWorkDone] = useState(job.workPerformed || '');
  const [techRemarks, setTechRemarks] = useState(job.technicianRemarks || '');
  const [isEditingReport, setIsEditingReport] = useState(false);

  // Job Comment form state
  const [commentText, setCommentText] = useState('');
  const [commentUrgent, setCommentUrgent] = useState(false);

  const handleSaveReport = () => {
    updateJobCard(job.id, {
      initialDiagnosis: initialDiag,
      workPerformed: workDone,
      technicianRemarks: techRemarks,
      customerSatisfaction: custSatisfaction,
      customerSatisfactionNotes: custSatisfactionNotes
    });
    setIsEditingReport(false);
    showNotification('Job card technical report updated');
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty <= 0) return;
    addPartToJob(job.id, selectedPartId, partQty);
    setPartQty(1);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    addPhotoToJob(job.id, {
      url: photoUrl,
      caption: photoCaption || 'Service progress photo',
      type: photoType
    });
    setPhotoUrl('');
    setPhotoCaption('');
    setShowAddPhoto(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    recordJobPayment(job.id, payAmount, payMethod);
    setShowPaymentInput(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addJobComment(
      job.id,
      commentText.trim(),
      currentUser?.name || (currentRole === 'ADMIN' ? 'Operations Admin' : 'Technician'),
      currentRole,
      commentUrgent
    );

    setCommentText('');
    setCommentUrgent(false);
  };

  const handleSaveCustomerSignature = (sigDataUrl: string, name: string) => {
    setSigningParty(null);
    updateJobCard(job.id, {
      customerSignature: sigDataUrl,
      customerSignedByName: name,
      customerSatisfaction: custSatisfaction,
      customerSatisfactionNotes: custSatisfactionNotes,
      signatureDate: new Date().toISOString()
    });
    showNotification('Customer digital signature & satisfaction rating saved');
  };

  const handleSaveTechnicianSignature = (sigDataUrl: string, name: string) => {
    setSigningParty(null);
    updateJobCard(job.id, {
      technicianSignature: sigDataUrl,
      technicianSignedByName: name,
      signatureDate: new Date().toISOString()
    });
    showNotification('Technician digital signature saved');
  };

  const handleSatisfactionChange = (rating: CustomerSatisfactionRating) => {
    setCustSatisfaction(rating);
    updateJobCard(job.id, {
      customerSatisfaction: rating,
      customerSatisfactionGivenAt: new Date().toISOString()
    });
    showNotification(`Customer satisfaction rating updated to: ${rating}`);
  };

  const allStatuses: JobStatus[] = [
    'NEW', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 
    'IN_PROGRESS', 'PARTS_REQUIRED', 'WAITING_FOR_CUSTOMER', 
    'COMPLETED', 'REVISIT_REQUIRED', 'CANCELLED'
  ];

  const waCustomerUrl = createWhatsAppLink(
    job.customerPhone,
    `Hello ${job.customerContact}, this is Bubble Up Trading & Contracting regarding Job Card #${job.jobCardNumber} for your ${job.machineBrand} ${job.machineModel}. Current Status: ${job.status.replace(/_/g, ' ')}.`
  );

  const mailCustomerUrl = createMailtoLink(
    job.customerEmail,
    `Update on Service Job Card #${job.jobCardNumber} - Bubble Up Trading Qatar`,
    `Dear ${job.customerContact},\n\nWe would like to provide an update regarding Job Card #${job.jobCardNumber} at ${job.customerName}.\n\nEquipment: ${job.machineBrand} ${job.machineModel} (SN: ${job.machineSerial})\nStatus: ${job.status.replace(/_/g, ' ')}\nTechnician: ${job.assignedTechnicianName}\n\nPlease let us know if you have any questions.\n\nBest regards,\nBubble Up Trading & Contracting\nDoha - Qatar\nTel / WhatsApp: +97 4 3339 335`
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-sky-700 rounded-md font-mono text-sm font-bold tracking-tight">
                {job.jobCardNumber}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-none">{job.customerName}</h2>
                <span className="text-[11px] text-slate-400">{job.machineBrand} {job.machineModel} ({job.machineLocation})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Arrange Chief Tech / Team Support */}
              <button
                type="button"
                onClick={() => setShowEscalationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Arrange Chief Technician or Team Support"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Chief Tech / Team</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              {currentRole === 'ADMIN' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this job card permanently?')) {
                      deleteJobCard(job.id);
                      onClose();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete Job Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600">Status:</span>
              <select
                value={job.status}
                onChange={(e) => updateJobStatus(job.id, e.target.value as JobStatus)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-2xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <PriorityBadge priority={job.priority} />
              <WarrantyBadge status={job.warrantyStatus} />
              {job.escalationStatus && job.escalationStatus !== 'NONE' && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  {job.escalationStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Work Duration:</span>
                <LiveTimer
                  startTime={job.workStartedAt}
                  isRunning={job.isWorkTimerRunning}
                  recordedMinutes={job.actualWorkDurationMinutes}
                  size="sm"
                />
              </div>

              {/* Timer Control Buttons */}
              {job.status !== 'COMPLETED' ? (
                <div className="flex items-center gap-1">
                  {job.isWorkTimerRunning ? (
                    <button
                      onClick={() => pauseJobWorkTimer(job.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Pause className="w-3 h-3 text-amber-400" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => startJobWorkTimer(job.id)}
                      className="px-2 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3 h-3" />
                      Start Timer
                    </button>
                  )}
                  <button
                    onClick={() => stopJobWorkTimer(job.id, true)}
                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Stop timer and mark COMPLETED"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Finish Job
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Job Finalized
                </span>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
            
            {/* Escalation Alert Banner if active */}
            {job.escalationStatus && job.escalationStatus !== 'NONE' && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs">
                      {job.escalationStatus === 'CHIEF_TECHNICIAN_REQUESTED' ? 'Chief Technician Escalation Active' : 'Team Support Crew Active'}
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {job.escalatedToChiefTechName ? `Assigned Supervisor: ${job.escalatedToChiefTechName}` : ''}
                      {job.escalationReason ? ` • Notes: ${job.escalationReason}` : ''}
                    </p>
                    {job.teamSupportMembers && job.teamSupportMembers.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {job.teamSupportMembers.map(m => (
                          <span key={m.technicianId} className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-medium text-[10px]">
                            {m.technicianName} ({m.role})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Manage Pathway
                </button>
              </div>
            )}

            {/* Grid 1: Customer & Machine Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Customer Box */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Building className="w-4 h-4 text-sky-700" />
                    Customer & Facility Details
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={waCustomerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Send Job Card WhatsApp update to customer"
                    >
                      <Phone className="w-3 h-3" />
                      WhatsApp
                    </a>
                    <a
                      href={mailCustomerUrl}
                      className="px-2 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Send Email update to customer"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{job.customerName}</p>
                  <p><strong className="text-slate-600">Contact Person:</strong> {job.customerContact}</p>
                  <p><strong className="text-slate-600">Phone / WhatsApp:</strong> {job.customerPhone}</p>
                  <p><strong className="text-slate-600">Email:</strong> {job.customerEmail}</p>
                  <p><strong className="text-slate-600">Site Location:</strong> {job.customerAddress}, {job.customerArea}, {job.customerCity}</p>
                </div>
              </div>

              {/* Machine Box */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Wrench className="w-4 h-4 text-sky-700" />
                    Laundry / Dry Clean Equipment
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">SN: {job.machineSerial}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{job.machineBrand} {job.machineModel}</p>
                  <p><strong className="text-slate-600">Equipment Type:</strong> {job.machineCategory.replace(/_/g, ' ')}</p>
                  <p><strong className="text-slate-600">Drum / Load Capacity:</strong> {job.machineCapacity} kg</p>
                  <p><strong className="text-slate-600">Location in Facility:</strong> {job.machineLocation}</p>
                  <p><strong className="text-slate-600">Assigned Technician:</strong> <span className="font-bold text-sky-900">{job.assignedTechnicianName}</span></p>
                </div>
              </div>

            </div>

            {/* Problem & Fault Reported */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 space-y-1">
              <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Customer Problem / Defect Description:
              </span>
              <p className="text-slate-800 pl-5">{job.customerComplaint || job.problemDescription}</p>
            </div>

            {/* CUSTOMER SATISFACTION & DIGITAL SIGNATURES CARD */}
            <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50 space-y-4">
              
              {/* Satisfaction Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900 text-xs">
                    Customer Satisfaction Rating & Sign-Off (Tick Choice)
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Customer Verified
                </span>
              </div>

              {/* Satisfaction Rating Choices */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Satisfied */}
                <button
                  type="button"
                  onClick={() => handleSatisfactionChange('SATISFIED')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    job.customerSatisfaction === 'SATISFIED'
                      ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    job.customerSatisfaction === 'SATISFIED' ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                  }`}>
                    {job.customerSatisfaction === 'SATISFIED' && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-none">✔ Satisfied</span>
                    <span className="text-[10px] text-slate-500 font-normal">Work completed per standard</span>
                  </div>
                </button>

                {/* Highly Satisfied */}
                <button
                  type="button"
                  onClick={() => handleSatisfactionChange('HIGHLY_SATISFIED')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    job.customerSatisfaction === 'HIGHLY_SATISFIED'
                      ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    job.customerSatisfaction === 'HIGHLY_SATISFIED' ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                  }`}>
                    {job.customerSatisfaction === 'HIGHLY_SATISFIED' && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-none">✔ Highly Satisfied</span>
                    <span className="text-[10px] text-slate-500 font-normal">Flawless & rapid</span>
                  </div>
                </button>

                {/* Neutral */}
                <button
                  type="button"
                  onClick={() => handleSatisfactionChange('NEUTRAL')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    job.customerSatisfaction === 'NEUTRAL'
                      ? 'bg-slate-200 border-slate-600 ring-2 ring-slate-500 text-slate-950 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    job.customerSatisfaction === 'NEUTRAL' ? 'bg-slate-800 text-white' : 'border border-slate-400'
                  }`}>
                    {job.customerSatisfaction === 'NEUTRAL' && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-none">✔ Neutral</span>
                    <span className="text-[10px] text-slate-500 font-normal">Standard operation</span>
                  </div>
                </button>

                {/* Dissatisfied */}
                <button
                  type="button"
                  onClick={() => handleSatisfactionChange('DISSATISFIED')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    job.customerSatisfaction === 'DISSATISFIED'
                      ? 'bg-rose-100 border-rose-600 ring-2 ring-rose-500 text-rose-950 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    job.customerSatisfaction === 'DISSATISFIED' ? 'bg-rose-600 text-white' : 'border border-slate-400'
                  }`}>
                    {job.customerSatisfaction === 'DISSATISFIED' && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-none">✔ Dissatisfied</span>
                    <span className="text-[10px] text-slate-500 font-normal">Requires revisit/follow-up</span>
                  </div>
                </button>

              </div>

              {/* Digital Signatures Box (Stylus / Touch Finger) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Customer Signature */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                      Customer Digital Signature (Stylus / Finger)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSigningParty('CUSTOMER')}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {job.customerSignature ? 'Resign Pad' : 'Sign Now'}
                    </button>
                  </div>

                  <div 
                    onClick={() => setSigningParty('CUSTOMER')}
                    className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-2 bg-slate-50 min-h-16 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {job.customerSignature ? (
                      <img src={job.customerSignature} alt="Customer Sig" className="h-12 object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Tap to draw digital signature with finger / stylus</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Signer:</strong> {job.customerSignedByName || job.customerContact || 'Customer Facility Manager'}
                  </div>
                </div>

                {/* Technician Signature */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-sky-700" />
                      Lead Field Engineer Signature
                    </span>
                    <button
                      type="button"
                      onClick={() => setSigningParty('TECHNICIAN')}
                      className="text-[10px] font-bold text-sky-700 hover:underline cursor-pointer"
                    >
                      {job.technicianSignature ? 'Resign Pad' : 'Sign Now'}
                    </button>
                  </div>

                  <div 
                    onClick={() => setSigningParty('TECHNICIAN')}
                    className="border border-dashed border-slate-300 hover:border-sky-500 rounded-lg p-2 bg-slate-50 min-h-16 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {job.technicianSignature ? (
                      <img src={job.technicianSignature} alt="Tech Sig" className="h-12 object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Tap to draw digital signature with finger / stylus</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Engineer:</strong> {job.technicianSignedByName || job.assignedTechnicianName}
                  </div>
                </div>

              </div>

            </div>

            {/* Technical Service Report */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-sky-700" />
                  Technical Service Findings & Work Done
                </span>
                {!isEditingReport ? (
                  <button
                    onClick={() => setIsEditingReport(true)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    Edit Notes
                  </button>
                ) : (
                  <button
                    onClick={handleSaveReport}
                    className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Save Notes
                  </button>
                )}
              </div>

              {!isEditingReport ? (
                <>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Initial Diagnosis & Observation:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-800">
                      {job.initialDiagnosis || <span className="italic text-slate-400">No diagnosis recorded yet.</span>}
                    </p>
                  </div>

                  {job.workPerformed && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Work Performed / Corrective Action:</span>
                      <p className="p-2 bg-emerald-50/50 rounded border border-emerald-200/60 text-slate-800">
                        {job.workPerformed}
                      </p>
                    </div>
                  )}

                  {job.technicianRemarks && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Technician Remarks & Maintenance Advisory:</span>
                      <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700 italic">
                        "{job.technicianRemarks}"
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Diagnosis & Fault Analysis</label>
                    <textarea
                      value={initialDiag}
                      onChange={(e) => setInitialDiag(e.target.value)}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                      placeholder="Enter technician diagnosis..."
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Work Performed</label>
                    <textarea
                      value={workDone}
                      onChange={(e) => setWorkDone(e.target.value)}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                      placeholder="Detail the mechanical or electrical repair steps..."
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Technician Recommendations</label>
                    <textarea
                      value={techRemarks}
                      onChange={(e) => setTechRemarks(e.target.value)}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                      placeholder="e.g. Schedule next belt change, grease bearings..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Spare Parts Section */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Wrench className="w-4 h-4 text-sky-700" />
                  Spare Parts Used ({job.partsUsed.length})
                </span>
                <span className="font-mono font-bold text-slate-800">Total Parts: QAR {job.partsTotal.toFixed(2)}</span>
              </div>

              {/* Add Part Form */}
              <form onSubmit={handleAddPart} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    {spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.partNumber} — {p.name} (Stock: {p.stockQuantity} | QAR {p.sellingPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-center font-mono"
                    placeholder="Qty"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Part
                </button>
              </form>

              {/* Parts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Part #</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total (QAR)</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {job.partsUsed.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono font-medium text-slate-900">{p.partNumber}</td>
                        <td className="py-2 px-3 text-slate-800">{p.partName}</td>
                        <td className="py-2 px-3 text-center font-medium">{p.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">{p.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{p.totalPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => removePartFromJob(job.id, p.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Remove & Return to stock"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {job.partsUsed.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 text-center text-slate-400 italic">No parts added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Photos Section */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Camera className="w-4 h-4 text-sky-700" />
                  4-Step Photo Audit Evidence ({job.photos.length})
                </span>
                <button
                  onClick={() => setShowAddPhoto(!showAddPhoto)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddPhoto ? 'Cancel' : 'Attach Photo'}
                </button>
              </div>

              {showAddPhoto && (
                <form onSubmit={handleAddPhotoSubmit} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="url"
                      placeholder="Photo Image URL (https://...)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="col-span-2 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      required
                    />
                    <select
                      value={photoType}
                      onChange={(e) => setPhotoType(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    >
                      <option value="BEFORE_REPAIR">1. Machine Photo</option>
                      <option value="FAULT_POINT">2. Repair Place & Parts</option>
                      <option value="PARTS_REPLACED">3. Replacement Parts</option>
                      <option value="AFTER_REPAIR">4. Repaired Complete</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Short Caption / Notes..."
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Save Photo
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {job.photos.map((ph) => (
                  <div key={ph.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <img 
                      src={ph.url} 
                      alt={ph.caption} 
                      className="w-full h-28 object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&fit=crop';
                      }}
                    />
                    <div className="p-2">
                      <span className="text-[10px] font-bold text-sky-800 uppercase block">
                        {ph.type === 'BEFORE_REPAIR' ? '1. Machine Photo' :
                         ph.type === 'FAULT_POINT' ? '2. Repair Place & Parts' :
                         ph.type === 'PARTS_REPLACED' ? '3. Replacement Parts' :
                         ph.type === 'AFTER_REPAIR' ? '4. Repaired Complete' : ph.type.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[11px] text-slate-700 truncate font-medium">{ph.caption}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{ph.timestamp}</span>
                    </div>
                  </div>
                ))}
                {job.photos.length === 0 && (
                  <p className="col-span-full text-center text-slate-400 italic py-4">No audit photos attached to this job card yet.</p>
                )}
              </div>
            </div>

            {/* Financial Summary & Payment Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  Financial Summary & Billing Details
                </span>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={job.paymentStatus} />
                  <span className="font-mono text-xs font-semibold text-slate-700">Invoice: {job.invoiceNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Labor + Callout</span>
                  <span className="font-mono text-xs font-bold text-slate-800">QAR {(job.laborCharges + job.travelCharges).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Spare Parts</span>
                  <span className="font-mono text-xs font-bold text-slate-800">QAR {job.partsTotal.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Total + 5% VAT</span>
                  <span className="font-mono text-xs font-bold text-sky-900">QAR {job.totalAmount.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Outstanding Balance</span>
                  <span className={`font-mono text-xs font-black ${job.outstandingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    QAR {job.outstandingBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Record Payment Button / Form */}
              {!showPaymentInput ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setPayAmount(job.outstandingBalance);
                      setShowPaymentInput(true);
                    }}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Record Payment / Settle Invoice
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="bg-white p-3 rounded-lg border border-slate-300 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-600 block mb-0.5">Amount to Pay (QAR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs font-mono font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-600 block mb-0.5">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer (EFT)</option>
                      <option value="CASH">Cash</option>
                      <option value="CREDIT_CARD">Credit / Debit Card</option>
                      <option value="CHEQUE">Company Cheque</option>
                      <option value="CREDIT_ACCOUNT">Corporate Credit Account</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentInput(false)}
                      className="px-3 py-1 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Stylus / Touch Finger Signature Modal */}
      {signingParty && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <DigitalSignaturePad
            title={signingParty === 'CUSTOMER' ? 'Customer Acceptance Signature' : 'Lead Engineer Signature'}
            signeeRole={signingParty === 'CUSTOMER' ? 'Customer Representative' : 'Lead Field Engineer'}
            signeeName={signingParty === 'CUSTOMER' ? (job.customerSignedByName || job.customerContact) : (job.technicianSignedByName || job.assignedTechnicianName)}
            initialSignature={signingParty === 'CUSTOMER' ? job.customerSignature : job.technicianSignature}
            onSave={(dataUrl, signerName) => {
              if (signingParty === 'CUSTOMER') {
                handleSaveCustomerSignature(dataUrl, signerName);
              } else {
                handleSaveTechnicianSignature(dataUrl, signerName);
              }
            }}
            onCancel={() => setSigningParty(null)}
          />
        </div>
      )}

      {/* Chief Tech & Team Escalation Pathway Modal */}
      {showEscalationModal && (
        <JobEscalationModal
          job={job}
          onClose={() => setShowEscalationModal(false)}
        />
      )}

      {/* Printable Job Card Document Modal */}
      {showPrintModal && (
        <PrintableJobCard job={job} onClose={() => setShowPrintModal(false)} />
      )}
    </>
  );
};
