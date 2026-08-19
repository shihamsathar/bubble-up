import React, { useState } from 'react';
import { ServiceJobCard, COMPANY_INFO } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import { PaymentBadge } from '../jobcards/JobCardStatusBadge';
import { printDocumentElement, exportElementToPdf, downloadAsPrintableHtml } from '../../utils/printHelper';
import { 
  Printer, Download, X, FileText, CheckCircle2, ShieldCheck, 
  Building, Calendar, Phone, Mail, Loader2, DollarSign, CreditCard 
} from 'lucide-react';

interface PrintableInvoiceModalProps {
  job: ServiceJobCard;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({ job, onClose }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const invoiceNumber = job.invoiceNumber || `INV-${job.jobCardNumber.replace('JC-', '')}`;

  const handlePrint = () => {
    printDocumentElement('printable-invoice-area', `BubbleUp_Invoice_${invoiceNumber}`);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf('printable-invoice-area', `BubbleUp_Tax_Invoice_${invoiceNumber}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadAsPrintableHtml('printable-invoice-area', `BubbleUp_Invoice_${invoiceNumber}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 text-white gap-2 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg border border-emerald-700/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Tax Invoice: {invoiceNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  A4 FORMAT
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Official Commercial Tax Invoice & Payment Receipt</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer ring-1 ring-sky-400/40 hover:scale-[1.02]"
              title="Send directly to physical A4 printer"
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

        {/* Printable A4 Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 text-slate-800 text-sm bg-white" id="printable-invoice-area">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="mb-2">
                  <CompanyLogo variant="badge" size="md" />
                </div>
                <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">{COMPANY_INFO.nameEn} ({COMPANY_INFO.nameAr})</p>
                  <p>{COMPANY_INFO.address}</p>
                  <p>Tel / WhatsApp: <span className="font-bold text-slate-800">{COMPANY_INFO.mobile}</span> | Email: {COMPANY_INFO.email}</p>
                  <p>Commercial Registration (CR): <span className="font-mono font-bold text-slate-900">{COMPANY_INFO.crNumber}</span></p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block bg-slate-50 border-2 border-slate-900 rounded-xl p-3.5 text-right shadow-2xs">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block">COMMERCIAL TAX INVOICE</span>
                  <span className="font-mono text-xl font-black text-sky-950 block">{invoiceNumber}</span>
                  <div className="mt-1 flex justify-end">
                    <PaymentBadge status={job.paymentStatus} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600 text-right">
                  <p><span className="font-semibold text-slate-700">Invoice Date:</span> {job.scheduledDate}</p>
                  <p><span className="font-semibold text-slate-700">Job Ref:</span> <span className="font-mono font-bold text-slate-900">{job.jobCardNumber}</span></p>
                  <p><span className="font-semibold text-slate-700">Payment Terms:</span> Due on Presentation (NET 30)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Equipment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                <Building className="w-4 h-4 text-sky-700" />
                Billed To Customer
              </div>
              <h3 className="font-black text-slate-900 text-sm">{job.customerName}</h3>
              <div className="mt-1 text-xs text-slate-700 space-y-1">
                <p><span className="font-bold text-slate-800">Attention:</span> {job.customerContact}</p>
                <p><span className="font-bold text-slate-800">Address:</span> {job.customerAddress}, {job.customerArea}, {job.customerCity}</p>
                <p><span className="font-bold text-slate-800">Phone:</span> {job.customerPhone}</p>
                <p><span className="font-bold text-slate-800">Email:</span> {job.customerEmail}</p>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                <CreditCard className="w-4 h-4 text-sky-700" />
                Service Summary & Reference
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p><span className="font-bold text-slate-800">Serviced Equipment:</span> {job.machineBrand} {job.machineModel} ({job.machineCapacity} kg)</p>
                <p><span className="font-bold text-slate-800">Machine S/N:</span> <span className="font-mono font-bold">{job.machineSerial}</span></p>
                <p><span className="font-bold text-slate-800">Service Category:</span> {job.serviceCategory.replace(/_/g, ' ')}</p>
                <p><span className="font-bold text-slate-800">Assigned Engineer:</span> {job.assignedTechnicianName}</p>
              </div>
            </div>
          </div>

          {/* Line Item Breakdown Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
            <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-xs flex justify-between items-center">
              <span>Itemized Services, Labor & Replacement Parts (QAR)</span>
              <span className="text-[11px] text-slate-300 font-normal">All values in Qatar Riyals</span>
            </div>
            
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold w-12">#</th>
                  <th className="p-3 font-bold">Description</th>
                  <th className="p-3 font-bold text-center w-24">Type</th>
                  <th className="p-3 font-bold text-center w-16">Qty</th>
                  <th className="p-3 font-bold text-right w-28">Rate (QAR)</th>
                  <th className="p-3 font-bold text-right w-28">Total (QAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Labor Line */}
                <tr>
                  <td className="p-3 text-slate-500 font-mono">1</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">Technical Field Labor & Diagnostics</p>
                    <p className="text-[11px] text-slate-500">Service duration: {job.laborHours || 1.5} hrs @ QAR {job.laborRate || 85}/hr</p>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Labor</span>
                  </td>
                  <td className="p-3 text-center font-mono">{job.laborHours || 1.5}</td>
                  <td className="p-3 text-right font-mono font-medium">QAR {(job.laborRate || 85).toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">QAR {job.laborCost.toFixed(2)}</td>
                </tr>

                {/* Parts Lines */}
                {job.partsUsed.map((p, idx) => (
                  <tr key={p.partId || idx}>
                    <td className="p-3 text-slate-500 font-mono">{idx + 2}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{p.partName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Part #{p.partNumber}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Parts</span>
                    </td>
                    <td className="p-3 text-center font-mono">{p.quantity}</td>
                    <td className="p-3 text-right font-mono font-medium">QAR {p.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">QAR {p.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}

                {job.partsUsed.length === 0 && (
                  <tr>
                    <td className="p-3 text-slate-500 font-mono">2</td>
                    <td className="p-3 text-slate-600 italic">No replacement parts required for this service call.</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-right font-mono">QAR 0.00</td>
                    <td className="p-3 text-right font-mono font-bold">QAR 0.00</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full sm:w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Bank Account & Remittance Details:</span>
              <p className="text-slate-600"><strong>Account Name:</strong> BUBBLE UP TRADING</p>
              <p className="text-slate-600"><strong>Bank:</strong> Qatar Islamic Bank (QIB) / QNB</p>
              <p className="text-slate-600"><strong>IBAN:</strong> QA54 QNBA 0000 0000 1810 8700 01</p>
              <p className="text-slate-600"><strong>Currency:</strong> Qatari Riyal (QAR)</p>
            </div>

            <div className="w-full sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Labor Total:</span>
                <span className="font-mono font-bold">QAR {job.laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Parts & Materials Total:</span>
                <span className="font-mono font-bold">QAR {job.partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">QAR {job.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT (5%):</span>
                <span className="font-mono font-bold">QAR {job.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-800 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Invoice Amount:</span>
                <span className="font-mono text-sky-950 text-base">QAR {job.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono">QAR {job.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-700 font-bold border-t border-slate-200 pt-1">
                <span>Outstanding Balance Due:</span>
                <span className="font-mono">QAR {job.outstandingBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Official Stamp */}
          <div className="border-t-2 border-slate-300 pt-4 grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Authorized Accounts Signature:</span>
              <div className="h-16 border-b border-slate-400 flex items-end pb-1">
                <span className="text-slate-400 font-mono text-[11px]">Bubble Up Finance Dept.</span>
              </div>
              <p className="text-[10px] text-slate-500">Bubble Up Trading Official Seal & Stamp</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Customer Acceptance & Stamp:</span>
              <div className="h-16 border-b border-slate-400 flex items-end pb-1">
                {job.customerSignature ? (
                  <img src={job.customerSignature} alt="Customer Sig" className="max-h-14 object-contain" />
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">Authorized Customer Representative</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">Received in good order and approved for payment</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
