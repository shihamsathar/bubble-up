import React, { useState } from 'react';
import { ServiceJobCard, COMPANY_INFO, CustomerSatisfactionRating } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import { JobStatusBadge, PriorityBadge, WarrantyBadge } from './JobCardStatusBadge';
import { printDocumentElement, exportElementToPdf, downloadAsPrintableHtml } from '../../utils/printHelper';
import { 
  Printer, Download, X, CheckCircle2, ShieldCheck, Wrench, 
  Building, Calendar, Phone, Mail, FileText, CheckSquare, 
  Square, ThumbsUp, ThumbsDown, Star, AlertCircle, Users, ShieldAlert, Loader2 
} from 'lucide-react';

interface PrintableJobCardProps {
  job: ServiceJobCard;
  onClose: () => void;
}

export const PrintableJobCard: React.FC<PrintableJobCardProps> = ({ job, onClose }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    printDocumentElement('printable-jobcard-area', `BubbleUp_JobCard_${job.jobCardNumber}`);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf('printable-jobcard-area', `BubbleUp_JobCard_${job.jobCardNumber}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadAsPrintableHtml('printable-jobcard-area', `BubbleUp_JobCard_${job.jobCardNumber}.html`);
  };

  const isSatisfied = job.customerSatisfaction === 'SATISFIED' || job.customerSatisfaction === 'HIGHLY_SATISFIED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        
        {/* Action Header - Hidden during print */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 text-white gap-2 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-900/60 text-sky-400 rounded-lg border border-sky-700/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Job Card: {job.jobCardNumber}</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                  A4 FORMAT
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Direct A4 Printer Output & Verified PDF Export</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer ring-1 ring-sky-400/40 hover:scale-[1.02]"
              title="Open A4 Print Station (Direct to Physical Printer)"
            >
              <Printer className="w-4 h-4" />
              <span>Print to A4 Printer</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="Download High-Resolution A4 PDF File"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download A4 PDF'}</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Download Standalone Self-Printing HTML"
            >
              <span>Export HTML</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 text-slate-800 text-sm bg-white" id="printable-jobcard-area">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="mb-2">
                  <CompanyLogo variant="badge" size="md" />
                </div>
                <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                  <p className="font-bold text-slate-900">{COMPANY_INFO.nameEn} ({COMPANY_INFO.nameAr})</p>
                  <p>{COMPANY_INFO.address}</p>
                  <p>Tel / WhatsApp: <span className="font-bold text-slate-800">{COMPANY_INFO.mobile}</span> | Email: {COMPANY_INFO.email}</p>
                  <p>Commercial Registration (CR): <span className="font-mono font-bold text-slate-900">{COMPANY_INFO.crNumber}</span></p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-right shadow-2xs">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">OFFICIAL SERVICE JOB CARD</span>
                  <span className="font-mono text-xl font-black text-sky-950 block">{job.jobCardNumber}</span>
                  <div className="mt-1 flex flex-col items-end gap-1">
                    <JobStatusBadge status={job.status} size="sm" />
                    <PriorityBadge priority={job.priority} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-700">Date:</span> {job.scheduledDate} {job.scheduledTime}</p>
                  <p><span className="font-semibold text-slate-700">Invoice:</span> <span className="font-mono font-bold text-slate-900">{job.invoiceNumber || 'PENDING'}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Machine Info 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            
            {/* Customer Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                <Building className="w-4 h-4 text-sky-700" />
                Customer & Site Details
              </div>
              <h3 className="font-black text-slate-900 text-sm">{job.customerName}</h3>
              <div className="mt-1 text-xs text-slate-700 space-y-1">
                <p><span className="font-bold text-slate-800">Contact Person:</span> {job.customerContact}</p>
                <p><span className="font-bold text-slate-800">Mobile / Tel:</span> {job.customerPhone}</p>
                <p><span className="font-bold text-slate-800">Email:</span> {job.customerEmail}</p>
                <p><span className="font-bold text-slate-800">Site Address:</span> {job.customerAddress}, {job.customerArea}, {job.customerCity}</p>
                {job.customerTaxNumber && (
                  <p><span className="font-bold text-slate-800">Customer TRN/CR:</span> {job.customerTaxNumber}</p>
                )}
              </div>
            </div>

            {/* Machine Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
                  <Wrench className="w-4 h-4 text-sky-700" />
                  Machine Equipment Data
                </div>
                <WarrantyBadge status={job.warrantyStatus} />
              </div>
              <h3 className="font-black text-slate-900 text-sm">{job.machineBrand} - {job.machineModel}</h3>
              <div className="mt-1 text-xs text-slate-700 space-y-1">
                <p><span className="font-bold text-slate-800">Equipment Type:</span> {job.machineCategory.replace(/_/g, ' ')}</p>
                <p><span className="font-bold text-slate-800">Serial Number:</span> <span className="font-mono font-black text-slate-900">{job.machineSerial}</span></p>
                <p><span className="font-bold text-slate-800">Capacity:</span> {job.machineCapacity} kg</p>
                <p><span className="font-bold text-slate-800">Plant Location:</span> {job.machineLocation}</p>
                <p><span className="font-bold text-slate-800">Lead Field Engineer:</span> <span className="font-black text-sky-950">{job.assignedTechnicianName}</span></p>
              </div>
            </div>

          </div>

          {/* Chief Technician / Team Escalation Record (if active) */}
          {(job.escalationStatus === 'CHIEF_TECHNICIAN_REQUESTED' || job.escalationStatus === 'TEAM_BACKUP_REQUESTED' || job.status === 'ESCALATED_TO_CHIEF' || job.status === 'TEAM_SUPPORT_ACTIVE') && (
            <div className="border border-amber-300 bg-amber-50/80 rounded-xl p-3.5 mb-5 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider border-b border-amber-200 pb-1.5 mb-2 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Technical Supervisor & Team Support Pathway Record
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-amber-900">Arranged Supervisor:</span> {job.escalatedToChiefTechName || 'Chief Technical Supervisor'}
                </div>
                <div>
                  <span className="font-bold text-amber-900">Escalation Status:</span> {job.escalationStatus?.replace(/_/g, ' ')}
                </div>
                {job.escalationReason && (
                  <div className="sm:col-span-2">
                    <span className="font-bold text-amber-900">Field Technical Reason:</span> {job.escalationReason}
                  </div>
                )}
                {job.teamSupportMembers && job.teamSupportMembers.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="font-bold text-amber-900">Team Crew Assigned:</span> {job.teamSupportMembers.map(m => m.technicianName).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Problem & Diagnosis Details */}
          <div className="border border-slate-300 rounded-xl p-4 mb-5 space-y-2.5 bg-white">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
              <FileText className="w-4 h-4 text-sky-700" />
              Technical Diagnostic & Service Report
            </div>

            <div>
              <span className="font-bold text-xs text-slate-800 block">Customer Reported Fault / Complaint:</span>
              <p className="text-xs text-slate-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200 mt-0.5 font-medium">
                {job.customerComplaint || job.problemDescription}
              </p>
            </div>

            {job.initialDiagnosis && (
              <div>
                <span className="font-bold text-xs text-slate-800 block">Initial Diagnosis & Root Cause:</span>
                <p className="text-xs text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-0.5">
                  {job.initialDiagnosis} {job.faultCause ? `— Root Cause: ${job.faultCause}` : ''}
                </p>
              </div>
            )}

            {job.workPerformed && (
              <div>
                <span className="font-bold text-xs text-slate-800 block">Work Performed / Corrective Action:</span>
                <p className="text-xs text-slate-900 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 mt-0.5 font-medium">
                  {job.workPerformed}
                </p>
              </div>
            )}

            {job.technicianRemarks && (
              <div>
                <span className="font-bold text-xs text-slate-800 block">Technician Technical Remarks:</span>
                <p className="text-xs text-slate-700 italic mt-0.5">
                  "{job.technicianRemarks}"
                </p>
              </div>
            )}
          </div>

          {/* Spare Parts Installed Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
            <div className="bg-slate-100 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200">
              Spare Parts & Materials Replaced
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-bold">#</th>
                  <th className="py-2 px-3 font-bold">Part Number</th>
                  <th className="py-2 px-3 font-bold">Description / OEM Specs</th>
                  <th className="py-2 px-3 font-bold text-center">Qty</th>
                  <th className="py-2 px-3 font-bold text-right">Unit Price (QAR)</th>
                  <th className="py-2 px-3 font-bold text-right">Total (QAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {job.partsUsed.length > 0 ? (
                  job.partsUsed.map((part, idx) => (
                    <tr key={part.id || idx}>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{part.partNumber}</td>
                      <td className="py-2 px-3 text-slate-900 font-medium">{part.partName}</td>
                      <td className="py-2 px-3 text-center font-bold">{part.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{part.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{part.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-2.5 px-4 text-center text-slate-400 italic">
                      No replacement parts billed (Labor / Preventative service session only)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing & Financial Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
            <div className="w-full sm:w-1/2 text-xs text-slate-600 space-y-1 border border-slate-300 rounded-xl p-3 bg-slate-50/70">
              <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">Warranty & Service Terms:</span>
              <p>1. 90-day warranty on all OEM mechanical parts installed by Bubble Up authorized engineers.</p>
              <p>2. Customer confirms machine has been tested under operational load and certified safe.</p>
              <p>3. Outstanding balance is payable in Qatar Riyals (QAR) according to payment terms.</p>
            </div>

            <div className="w-full sm:w-1/2 border border-slate-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-1.5 px-3.5 text-slate-700 font-medium">Labor & Diagnostic Charges</td>
                    <td className="py-1.5 px-3.5 text-right font-mono font-medium">QAR {job.laborCharges.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3.5 text-slate-700 font-medium">Service Fleet Travel / Call-out</td>
                    <td className="py-1.5 px-3.5 text-right font-mono font-medium">QAR {job.travelCharges.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3.5 text-slate-700 font-medium">Spare Parts Subtotal</td>
                    <td className="py-1.5 px-3.5 text-right font-mono font-medium">QAR {job.partsTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-100">
                    <td className="py-1.5 px-3.5 text-slate-800 font-bold">Subtotal</td>
                    <td className="py-1.5 px-3.5 text-right font-mono font-bold">QAR {job.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3.5 text-slate-700">VAT ({job.taxRatePercent}%)</td>
                    <td className="py-1.5 px-3.5 text-right font-mono">QAR {job.taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-sky-50 text-sky-950 font-black border-t-2 border-slate-900">
                    <td className="py-2 px-3.5 text-sm">TOTAL AMOUNT (QAR)</td>
                    <td className="py-2 px-3.5 text-right font-mono text-sm">QAR {job.totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3.5 text-slate-700">Amount Paid / Advance</td>
                    <td className="py-1.5 px-3.5 text-right font-mono text-emerald-700 font-bold">- QAR {job.paidAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-amber-50 font-bold text-amber-950">
                    <td className="py-2 px-3.5">OUTSTANDING BALANCE DUE</td>
                    <td className="py-2 px-3.5 text-right font-mono">QAR {job.outstandingBalance.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CUSTOMER SATISFACTION TICK BOX SECTION */}
          <div className="border-2 border-slate-300 rounded-xl p-4 mb-5 bg-slate-50/70">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Customer Satisfaction & Work Completion Sign-off (Put a Tick)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Customer Feedback Confirmation</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              
              {/* Satisfied */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                job.customerSatisfaction === 'SATISFIED' 
                  ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}>
                {job.customerSatisfaction === 'SATISFIED' ? (
                  <CheckSquare className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold block leading-none">✔ Satisfied</span>
                  <span className="text-[10px] text-slate-500">Good Work / Operational</span>
                </div>
              </div>

              {/* Highly Satisfied */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                job.customerSatisfaction === 'HIGHLY_SATISFIED' 
                  ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}>
                {job.customerSatisfaction === 'HIGHLY_SATISFIED' ? (
                  <CheckSquare className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold block leading-none">✔ Highly Satisfied</span>
                  <span className="text-[10px] text-slate-500">Excellent & Prompt</span>
                </div>
              </div>

              {/* Neutral */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                job.customerSatisfaction === 'NEUTRAL' 
                  ? 'bg-slate-200 border-slate-500 text-slate-950 font-bold' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}>
                {job.customerSatisfaction === 'NEUTRAL' ? (
                  <CheckSquare className="w-5 h-5 text-slate-700 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold block leading-none">✔ Neutral</span>
                  <span className="text-[10px] text-slate-500">Standard Service</span>
                </div>
              </div>

              {/* Dissatisfied / Needs Follow-up */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                job.customerSatisfaction === 'DISSATISFIED' || job.customerSatisfaction === 'NEEDS_FOLLOW_UP'
                  ? 'bg-rose-100 border-rose-500 text-rose-950 font-bold' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}>
                {job.customerSatisfaction === 'DISSATISFIED' || job.customerSatisfaction === 'NEEDS_FOLLOW_UP' ? (
                  <CheckSquare className="w-5 h-5 text-rose-700 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold block leading-none">
                    {job.customerSatisfaction === 'NEEDS_FOLLOW_UP' ? '✔ Needs Follow-up' : '✔ Dissatisfied'}
                  </span>
                  <span className="text-[10px] text-slate-500">Issues / Revisit Required</span>
                </div>
              </div>

            </div>

            {job.customerSatisfactionNotes && (
              <div className="mt-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Customer Feedback Notes: </span>
                <span>"{job.customerSatisfactionNotes}"</span>
              </div>
            )}
          </div>

          {/* DIGITAL SIGNATURES SECTION (Fingers / Stylus Touch Pad) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t-2 border-slate-900">
            
            {/* Service Engineer Signature */}
            <div className="border border-slate-300 rounded-xl p-3.5 text-center bg-slate-50/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Lead Service Engineer Signature
              </span>
              
              <div className="h-20 flex items-center justify-center my-1 bg-white border border-slate-200 rounded-lg p-1">
                {job.technicianSignature && job.technicianSignature.startsWith('data:image/') ? (
                  <img
                    src={job.technicianSignature}
                    alt="Technician Digital Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="font-serif text-slate-800 italic font-black text-lg">
                    {job.technicianSignature || job.assignedTechnicianName}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-300 pt-1.5 mt-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-900">{job.technicianSignedByName || job.assignedTechnicianName}</p>
                <p className="text-[10px] text-slate-500">Field Technical Specialist • Date: {job.completedAt?.slice(0, 10) || job.scheduledDate}</p>
              </div>
            </div>

            {/* Customer Signature & Seal */}
            <div className="border border-slate-300 rounded-xl p-3.5 text-center bg-slate-50/50 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Customer Acceptance Digital Signature (Stylus / Finger)
              </span>

              <div className="h-20 flex items-center justify-center my-1 bg-white border border-slate-200 rounded-lg p-1">
                {job.customerSignature && job.customerSignature.startsWith('data:image/') ? (
                  <img
                    src={job.customerSignature}
                    alt="Customer Digital Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="font-serif text-slate-800 italic font-black text-lg">
                    {job.customerSignature || job.customerContact}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-300 pt-1.5 mt-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-900">{job.customerSignedByName || job.customerContact}</p>
                <p className="text-[10px] text-slate-500">Authorized Facility Manager • Verified Digital Sign-off</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
