import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard, JobStatus, PaymentMethod, CustomerSatisfactionRating } from '../../types';
import { JobStatusBadge, PriorityBadge, WarrantyBadge, PaymentBadge } from '../jobcards/JobCardStatusBadge';
import { PrintableJobCard } from '../jobcards/PrintableJobCard';
import { JobCameraCaptureModal, JOB_PHOTO_STEPS } from './JobCameraCaptureModal';
import { JobEscalationModal } from '../jobcards/JobEscalationModal';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { LiveTimer } from '../common/LiveTimer';
import { 
  X, CheckCircle, ChevronRight, Wrench, Building, Camera, 
  DollarSign, FileText, AlertCircle, Plus, Trash2, PenTool, CheckCheck, MapPin, Phone,
  CheckCircle2, Sparkles, Upload, Check, Play, Pause, Square, Clock, CheckSquare,
  ShieldAlert, Users, Star, ThumbsUp, ThumbsDown, MessageSquare, Printer
} from 'lucide-react';

interface JobExecutionModalProps {
  job: ServiceJobCard;
  onClose: () => void;
}

export const JobExecutionModal: React.FC<JobExecutionModalProps> = ({ job, onClose }) => {
  const { 
    updateJobCard, updateJobStatus, addPartToJob, removePartFromJob, 
    addPhotoToJob, recordJobPayment, spareParts, showNotification,
    startJobWorkTimer, pauseJobWorkTimer, stopJobWorkTimer
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIAGNOSIS' | 'PARTS' | 'PHOTOS' | 'SIGNATURE' | 'INVOICE'>('OVERVIEW');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [cameraInitialStep, setCameraInitialStep] = useState(0);

  // Digital Signature Canvas Modal States
  const [signingParty, setSigningParty] = useState<'CUSTOMER' | 'TECHNICIAN' | null>(null);

  // Customer Satisfaction & Feedback state
  const [custSatisfaction, setCustSatisfaction] = useState<CustomerSatisfactionRating>(
    job.customerSatisfaction || 'SATISFIED'
  );
  const [custSatisfactionNotes, setCustSatisfactionNotes] = useState(
    job.customerSatisfactionNotes || ''
  );

  // Diagnosis state
  const [initialDiag, setInitialDiag] = useState(job.initialDiagnosis || '');
  const [faultCause, setFaultCause] = useState(job.faultCause || '');
  const [repairRequired, setRepairRequired] = useState(job.repairRequired || '');
  const [workPerformed, setWorkPerformed] = useState(job.workPerformed || '');
  const [techRemarks, setTechRemarks] = useState(job.technicianRemarks || '');
  const [customerRemarks, setCustomerRemarks] = useState(job.customerRemarks || '');

  // Parts state
  const [selectedPartId, setSelectedPartId] = useState<string>(spareParts[0]?.id || '');
  const [partQty, setPartQty] = useState<number>(1);

  // Photos state
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [photoType, setPhotoType] = useState<'BEFORE_REPAIR' | 'FAULT_POINT' | 'PARTS_REPLACED' | 'AFTER_REPAIR'>('BEFORE_REPAIR');

  // Signature state
  const [custSignatureUrl, setCustSignatureUrl] = useState<string>(job.customerSignature || '');
  const [custSignName, setCustSignName] = useState(job.customerSignedByName || job.customerContact || '');
  const [techSignatureUrl, setTechSignatureUrl] = useState<string>(job.technicianSignature || '');
  const [techSignName, setTechSignName] = useState(job.technicianSignedByName || job.assignedTechnicianName || '');
  const [isSigned, setIsSigned] = useState(Boolean(job.customerSignature));

  // Payment state
  const [payAmount, setPayAmount] = useState<number>(job.outstandingBalance);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');

  const handleSaveDiagnosis = () => {
    updateJobCard(job.id, {
      initialDiagnosis: initialDiag,
      faultCause,
      repairRequired,
      workPerformed,
      technicianRemarks: techRemarks,
      customerRemarks
    });
    showNotification('Technical service report saved');
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty <= 0) return;
    addPartToJob(job.id, selectedPartId, partQty);
    setPartQty(1);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    addPhotoToJob(job.id, {
      url: photoUrl,
      caption: photoCaption || 'Field service photo',
      type: photoType
    });
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleSaveCustomerSignature = (sigDataUrl: string, name: string) => {
    setCustSignatureUrl(sigDataUrl);
    setCustSignName(name);
    setSigningParty(null);
    updateJobCard(job.id, {
      customerSignature: sigDataUrl,
      customerSignedByName: name,
      customerSatisfaction: custSatisfaction,
      customerSatisfactionNotes: custSatisfactionNotes,
      signatureDate: new Date().toISOString()
    });
    showNotification('Customer digital signature & satisfaction recorded');
  };

  const handleSaveTechnicianSignature = (sigDataUrl: string, name: string) => {
    setTechSignatureUrl(sigDataUrl);
    setTechSignName(name);
    setSigningParty(null);
    updateJobCard(job.id, {
      technicianSignature: sigDataUrl,
      technicianSignedByName: name,
      signatureDate: new Date().toISOString()
    });
    showNotification('Technician digital signature saved');
  };

  const handleSaveSignaturesAndFeedback = () => {
    updateJobCard(job.id, {
      customerSignature: custSignatureUrl || custSignName,
      customerSignedByName: custSignName,
      technicianSignature: techSignatureUrl || techSignName,
      technicianSignedByName: techSignName,
      customerSatisfaction: custSatisfaction,
      customerSatisfactionNotes: custSatisfactionNotes,
      customerSatisfactionGivenAt: new Date().toISOString(),
      signatureDate: new Date().toISOString()
    });
    setIsSigned(true);
    showNotification('Signatures & Customer Satisfaction confirmed on Job Card');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    recordJobPayment(job.id, payAmount, payMethod);
  };

  // Open camera at specific step
  const openCameraAtStep = (stepIdx: number) => {
    setCameraInitialStep(stepIdx);
    setShowCameraModal(true);
  };

  // Check completion of 4 required photo steps
  const completedPhotoCount = JOB_PHOTO_STEPS.filter(
    s => job.photos.some(p => p.type === s.photoType)
  ).length;

  // Status progression buttons
  const stepActions: { label: string; nextStatus: JobStatus; color: string }[] = [
    { label: 'Accept Job', nextStatus: 'ACCEPTED', color: 'bg-cyan-700 hover:bg-cyan-800' },
    { label: 'On The Way', nextStatus: 'ON_THE_WAY', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Arrived on Site', nextStatus: 'ARRIVED', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Start Diagnostics / Repair', nextStatus: 'IN_PROGRESS', color: 'bg-purple-700 hover:bg-purple-800' },
    { label: 'Mark Complete', nextStatus: 'COMPLETED', color: 'bg-emerald-700 hover:bg-emerald-800' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
          
          {/* Modal Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    Job #{job.jobCardNumber}
                  </h2>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    {job.serviceType.replace(/_/g, ' ')}
                  </span>
                  {job.escalationStatus && job.escalationStatus !== 'NONE' && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {job.escalationStatus.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {job.customerName} • {job.machineBrand} {job.machineModel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Escalate / Chief Tech Pathway Button */}
              <button
                type="button"
                onClick={() => setShowEscalationModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Arrange Chief Technician or Team Support if you cannot complete alone"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Arrange Chief Tech / Team</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Print Job Card / PDF"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* LIVE TIMER BANNER */}
          <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">On-Site Work Clock:</span>
              </div>
              <LiveTimer
                startTime={job.workStartedAt}
                isRunning={job.isWorkTimerRunning}
                recordedMinutes={job.actualWorkDurationMinutes}
                size="md"
              />
            </div>

            {/* Timer Actions & Finish Button */}
            <div className="flex items-center gap-2">
              {job.status !== 'COMPLETED' ? (
                <>
                  {job.isWorkTimerRunning ? (
                    <button
                      type="button"
                      onClick={() => pauseJobWorkTimer(job.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause Timer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startJobWorkTimer(job.id)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start / Resume Timer</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      stopJobWorkTimer(job.id, true);
                      setActiveTab('SIGNATURE');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Stop timer, finalize duration, and proceed to Customer Sign-off"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Complete Job & Sign-off</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Job Finished & Timer Finalized</span>
                </div>
              )}
            </div>
          </div>

          {/* Field Status Quick Bar */}
          <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Current Status:</span>
              <JobStatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
            </div>

            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1.5">
              {stepActions.map((step) => (
                <button
                  key={step.nextStatus}
                  onClick={() => updateJobStatus(job.id, step.nextStatus)}
                  className={`px-2.5 py-1 rounded text-white font-semibold text-[11px] transition-colors cursor-pointer ${
                    job.status === step.nextStatus ? 'ring-2 ring-slate-900 opacity-90' : step.color
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'OVERVIEW' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              1. Site & Machine Specs
            </button>
            <button
              onClick={() => setActiveTab('DIAGNOSIS')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'DIAGNOSIS' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              2. Diagnosis & Work Done
            </button>
            <button
              onClick={() => setActiveTab('PARTS')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'PARTS' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              3. Spare Parts Used ({job.partsUsed.length})
            </button>
            <button
              onClick={() => setActiveTab('PHOTOS')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'PHOTOS' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              <span>4. 1-by-1 Photos ({job.photos.length})</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${completedPhotoCount === 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {completedPhotoCount}/4
              </span>
            </button>
            <button
              onClick={() => setActiveTab('SIGNATURE')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'SIGNATURE' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>5. Satisfaction & Signatures</span>
            </button>
            <button
              onClick={() => setActiveTab('INVOICE')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'INVOICE' ? 'border-sky-700 text-sky-900 font-bold bg-white' : 'border-transparent hover:text-slate-900'}`}
            >
              6. Invoice & Payment
            </button>
          </div>

          {/* Modal Tab Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                
                {/* Chief Tech / Team Support Alert Banner if active */}
                {job.escalationStatus && job.escalationStatus !== 'NONE' && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs">
                        {job.escalationStatus === 'CHIEF_TECHNICIAN_REQUESTED' ? 'Escalated to Chief Technician' : 'Team Support Crew Active'}
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {job.escalatedToChiefTechName ? `Supervisor: ${job.escalatedToChiefTechName}` : ''}
                        {job.escalationReason ? ` • Reason: ${job.escalationReason}` : ''}
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
                )}

                {/* Machine & Customer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-sky-700" />
                      Customer Facility Info
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{job.customerName}</h3>
                    <p className="text-slate-600"><strong>Contact:</strong> {job.customerContact} ({job.customerPhone})</p>
                    <p className="text-slate-600"><strong>Site Address:</strong> {job.customerAddress}, {job.customerArea}, {job.customerCity}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`tel:${job.customerPhone}`}
                        className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1 text-[11px]"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        Call Client
                      </a>
                    </div>
                  </div>

                  {/* Machine Card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-sky-700" />
                      Equipment Specifications
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{job.machineBrand} {job.machineModel}</h3>
                    <p className="text-slate-600"><strong>Category:</strong> {job.machineCategory.replace(/_/g, ' ')}</p>
                    <p className="text-slate-600"><strong>Serial #:</strong> <span className="font-mono font-bold text-slate-900">{job.machineSerial}</span></p>
                    <p className="text-slate-600"><strong>Capacity:</strong> {job.machineCapacity} kg</p>
                    <p className="text-slate-600"><strong>Plant Location:</strong> {job.machineLocation}</p>
                  </div>
                </div>

                {/* Complaint */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 text-xs block">Customer Reported Fault:</span>
                  <p className="text-amber-950 font-medium">{job.customerComplaint || job.problemDescription}</p>
                </div>

                {/* Pathway Button Banner */}
                <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Field Support Pathway (Chief Engineer & Team Assistance)
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Cannot complete this repair alone? Instantly dispatch Chief Technical Supervisor or team backup.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEscalationModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Arrange Chief Tech / Team
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DIAGNOSIS & WORK DONE */}
            {activeTab === 'DIAGNOSIS' && (
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">Initial Diagnosis & Observation</label>
                  <textarea
                    rows={2}
                    value={initialDiag}
                    onChange={(e) => setInitialDiag(e.target.value)}
                    placeholder="E.g. Inverter displaying code E-14 overvoltage error, bearing noise at high spin..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">Root Cause of Failure</label>
                  <input
                    type="text"
                    value={faultCause}
                    onChange={(e) => setFaultCause(e.target.value)}
                    placeholder="E.g. Water ingress onto main motor PCB / worn carbon brushes"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">Work Performed / Corrective Action</label>
                  <textarea
                    rows={3}
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    placeholder="E.g. Disassembled inverter housing, replaced main switching transistors, calibrated spin cycle..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">Technician Recommendations & Remarks</label>
                  <textarea
                    rows={2}
                    value={techRemarks}
                    onChange={(e) => setTechRemarks(e.target.value)}
                    placeholder="E.g. Recommend preventative descaling of steam valves within 60 days."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDiagnosis}
                    className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Technical Notes
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SPARE PARTS */}
            {activeTab === 'PARTS' && (
              <div className="space-y-4">
                <form onSubmit={handleAddPart} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Select Spare Part from Truck Inventory</label>
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    >
                      {spareParts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.partNumber} — {p.name} (Stock: {p.stockQuantity} | QAR {p.sellingPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={partQty}
                      onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-center font-mono font-bold"
                    />
                  </div>

                  <div className="pt-5">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Job
                    </button>
                  </div>
                </form>

                {/* Parts Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Part #</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit (QAR)</th>
                        <th className="py-2.5 px-3 text-right">Total (QAR)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {job.partsUsed.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.partNumber}</td>
                          <td className="py-2.5 px-3 text-slate-800">{p.partName}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{p.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{p.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-900">{p.totalPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removePartFromJob(job.id, p.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {job.partsUsed.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 italic">No parts added yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span>Parts Total</span>
                  <span className="font-mono text-sm text-sky-900">QAR {job.partsTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* TAB 4: 1-BY-1 PHOTOS */}
            {activeTab === 'PHOTOS' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-sky-400" />
                      Mandatory 4-Step Photo Audit
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      1. Machine photo → 2. Repair place & parts → 3. Replacement parts → 4. Repaired complete photo
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCameraAtStep(0)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Phone Camera (1 by 1)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {JOB_PHOTO_STEPS.map((step, idx) => {
                    const stepPhotos = job.photos.filter(p => p.type === step.photoType);
                    const isCompleted = stepPhotos.length > 0;

                    return (
                      <div 
                        key={step.stepNumber} 
                        className={`rounded-xl border p-4 space-y-3 transition-all ${
                          isCompleted 
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}>
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.stepNumber}
                            </span>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">{step.title}</h4>
                              <p className="text-[11px] text-slate-500">{step.subtitle}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openCameraAtStep(idx)}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{isCompleted ? 'Add/Retake' : 'Capture'}</span>
                          </button>
                        </div>

                        {stepPhotos.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {stepPhotos.map((ph) => (
                              <div key={ph.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                                <img
                                  src={ph.url}
                                  alt={ph.caption}
                                  className="w-full h-24 object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = step.sampleUrl;
                                  }}
                                />
                                <div className="p-1.5 text-[10px]">
                                  <p className="text-slate-700 font-semibold truncate">{ph.caption}</p>
                                  <span className="text-slate-400 block">{ph.timestamp}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            onClick={() => openCameraAtStep(idx)}
                            className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-lg p-4 text-center cursor-pointer bg-white transition-colors"
                          >
                            <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                            <span className="text-xs font-semibold text-slate-600 block">No photo taken yet</span>
                            <span className="text-[10px] text-sky-600 font-medium">Click to snap with phone camera</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOMER SATISFACTION & DIGITAL SIGNATURES */}
            {activeTab === 'SIGNATURE' && (
              <div className="space-y-6">
                
                {/* 1. CUSTOMER SATISFACTION (Put a Tick) */}
                <div className="border-2 border-slate-300 rounded-2xl p-5 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Customer Satisfaction Rating (Put a Tick)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Ask the customer / facility manager to select their service satisfaction rating
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Mandatory Completion Sign-off
                    </span>
                  </div>

                  {/* Interactive Tick Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* Satisfied */}
                    <button
                      type="button"
                      onClick={() => setCustSatisfaction('SATISFIED')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        custSatisfaction === 'SATISFIED'
                          ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        custSatisfaction === 'SATISFIED' ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                      }`}>
                        {custSatisfaction === 'SATISFIED' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-none mb-1">✔ Satisfied</span>
                        <span className="text-[10px] text-slate-500 font-normal">Work completed per standard</span>
                      </div>
                    </button>

                    {/* Highly Satisfied */}
                    <button
                      type="button"
                      onClick={() => setCustSatisfaction('HIGHLY_SATISFIED')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        custSatisfaction === 'HIGHLY_SATISFIED'
                          ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        custSatisfaction === 'HIGHLY_SATISFIED' ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                      }`}>
                        {custSatisfaction === 'HIGHLY_SATISFIED' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-none mb-1">✔ Highly Satisfied</span>
                        <span className="text-[10px] text-slate-500 font-normal">Exceptional speed & quality</span>
                      </div>
                    </button>

                    {/* Neutral */}
                    <button
                      type="button"
                      onClick={() => setCustSatisfaction('NEUTRAL')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        custSatisfaction === 'NEUTRAL'
                          ? 'bg-slate-200 border-slate-600 ring-2 ring-slate-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        custSatisfaction === 'NEUTRAL' ? 'bg-slate-800 text-white' : 'border border-slate-400'
                      }`}>
                        {custSatisfaction === 'NEUTRAL' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-none mb-1">✔ Neutral</span>
                        <span className="text-[10px] text-slate-500 font-normal">Satisfactory repair</span>
                      </div>
                    </button>

                    {/* Dissatisfied / Needs Follow-up */}
                    <button
                      type="button"
                      onClick={() => setCustSatisfaction('DISSATISFIED')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        custSatisfaction === 'DISSATISFIED'
                          ? 'bg-rose-100 border-rose-600 ring-2 ring-rose-500 text-rose-950 font-bold shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        custSatisfaction === 'DISSATISFIED' ? 'bg-rose-600 text-white' : 'border border-slate-400'
                      }`}>
                        {custSatisfaction === 'DISSATISFIED' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-none mb-1">✔ Dissatisfied</span>
                        <span className="text-[10px] text-slate-500 font-normal">Requires revisit or issue noted</span>
                      </div>
                    </button>

                  </div>

                  {/* Feedback Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Customer Feedback Comments / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={custSatisfactionNotes}
                      onChange={(e) => setCustSatisfactionNotes(e.target.value)}
                      placeholder="E.g. Verified by Facility Manager Mr. Tariq, machine running smoothly under full load..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. DIGITAL SIGNATURES (Finger / Stylus Pad) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Customer Signature Box */}
                  <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-emerald-700" />
                          Customer Digital Signature (Finger / Stylus)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Stylus & Touch Ready
                        </span>
                      </div>

                      {/* Interactive Canvas Trigger / Preview Area */}
                      <div 
                        onClick={() => setSigningParty('CUSTOMER')}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 bg-white cursor-pointer min-h-24 flex flex-col items-center justify-center text-center transition-colors group shadow-2xs"
                      >
                        {custSignatureUrl ? (
                          <div className="space-y-1 w-full">
                            <img
                              src={custSignatureUrl}
                              alt="Customer Signature"
                              className="h-16 mx-auto object-contain"
                            />
                            <span className="text-[10px] text-emerald-600 font-bold block group-hover:underline">
                              ✓ Click to resign with stylus/finger
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-slate-500">
                            <PenTool className="w-6 h-6 mx-auto text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-xs font-bold text-slate-700 block">Tap here to sign with finger or stylus</span>
                            <span className="text-[10px] text-slate-400">Opens touch-sensitive signature canvas</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer / Signer Full Name:</label>
                        <input
                          type="text"
                          value={custSignName}
                          onChange={(e) => setCustSignName(e.target.value)}
                          placeholder="E.g. Tariq Mehmood (General Manager)"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technician Signature Box */}
                  <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-sky-700" />
                          Technician Digital Signature
                        </span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                          Stylus & Touch Ready
                        </span>
                      </div>

                      <div 
                        onClick={() => setSigningParty('TECHNICIAN')}
                        className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-3 bg-white cursor-pointer min-h-24 flex flex-col items-center justify-center text-center transition-colors group shadow-2xs"
                      >
                        {techSignatureUrl ? (
                          <div className="space-y-1 w-full">
                            <img
                              src={techSignatureUrl}
                              alt="Technician Signature"
                              className="h-16 mx-auto object-contain"
                            />
                            <span className="text-[10px] text-sky-600 font-bold block group-hover:underline">
                              ✓ Click to resign with stylus/finger
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-slate-500">
                            <PenTool className="w-6 h-6 mx-auto text-slate-400 group-hover:text-sky-600 transition-colors" />
                            <span className="text-xs font-bold text-slate-700 block">Tap here to sign with finger or stylus</span>
                            <span className="text-[10px] text-slate-400">Opens touch-sensitive signature canvas</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Technician Full Name:</label>
                        <input
                          type="text"
                          value={techSignName}
                          onChange={(e) => setTechSignName(e.target.value)}
                          placeholder="Lead Field Engineer Name"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save Signatures Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Signatures and satisfaction tick will be permanently rendered on the official Job Card and printable PDF.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveSignaturesAndFeedback}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Confirm Signatures & Customer Feedback</span>
                  </button>
                </div>

              </div>
            )}

            {/* TAB 6: INVOICE & PAYMENT */}
            {activeTab === 'INVOICE' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs">On-Site Invoice #{job.invoiceNumber}</span>
                    <PaymentBadge status={job.paymentStatus} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Labor + Travel</span>
                      <span className="font-mono text-xs font-bold text-slate-800">QAR {(job.laborCharges + job.travelCharges).toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Spare Parts</span>
                      <span className="font-mono text-xs font-bold text-slate-800">QAR {job.partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Total Due (inc. 5% VAT)</span>
                      <span className="font-mono text-xs font-bold text-sky-900">QAR {job.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Outstanding Balance</span>
                      <span className={`font-mono text-xs font-black ${job.outstandingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        QAR {job.outstandingBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Record Payment */}
                <form onSubmit={handlePayment} className="bg-white p-4 rounded-lg border border-slate-300 space-y-3">
                  <span className="font-bold text-slate-900 text-xs block">Record On-Site Client Payment</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Amount Collected (QAR)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
                      >
                        <option value="CASH">Cash Collected On Site</option>
                        <option value="CREDIT_CARD">Credit / Debit POS Card</option>
                        <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                        <option value="CHEQUE">Cheque Handed to Tech</option>
                        <option value="CREDIT_ACCOUNT">Credit / Monthly Billing</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Confirm & Settle Amount
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Stylus / Touch Finger Signature Pad Modal */}
      {signingParty && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <DigitalSignaturePad
            title={signingParty === 'CUSTOMER' ? 'Customer Acceptance Signature' : 'Lead Engineer Signature'}
            signeeRole={signingParty === 'CUSTOMER' ? 'Customer Representative' : 'Lead Field Engineer'}
            signeeName={signingParty === 'CUSTOMER' ? custSignName : techSignName}
            initialSignature={signingParty === 'CUSTOMER' ? custSignatureUrl : techSignatureUrl}
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

      {/* 1-by-1 Camera Capture Modal */}
      {showCameraModal && (
        <JobCameraCaptureModal
          job={job}
          initialStepIndex={cameraInitialStep}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* Chief Tech & Team Escalation Pathway Modal */}
      {showEscalationModal && (
        <JobEscalationModal
          job={job}
          onClose={() => setShowEscalationModal(false)}
        />
      )}

      {/* Printable Job Card & Direct PDF Modal */}
      {showPrintModal && (
        <PrintableJobCard job={job} onClose={() => setShowPrintModal(false)} />
      )}
    </>
  );
};
