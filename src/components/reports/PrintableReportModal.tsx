import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COMPANY_INFO } from '../../types';
import { CompanyLogo } from '../common/CompanyLogo';
import { printDocumentElement, exportElementToPdf, downloadAsPrintableHtml } from '../../utils/printHelper';
import { 
  Printer, Download, X, FileText, Calendar, Building, 
  TrendingUp, Users, Wrench, DollarSign, CheckCircle2, Loader2 
} from 'lucide-react';

interface PrintableReportModalProps {
  reportType: 'DAILY' | 'MONTHLY' | 'ANNUAL' | 'TECHNICIAN' | 'PARTS';
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({ reportType, onClose }) => {
  const { jobCards, technicians, spareParts, dutyLogs } = useApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const totalJobs = jobCards.length;
  const completedJobs = jobCards.filter(j => j.status === 'COMPLETED').length;
  const totalInvoiced = jobCards.reduce((sum, j) => sum + j.totalAmount, 0);
  const totalCollected = jobCards.reduce((sum, j) => sum + j.paidAmount, 0);
  const totalOutstanding = jobCards.reduce((sum, j) => sum + j.outstandingBalance, 0);

  const titleMap = {
    DAILY: 'Daily Field Operations & Dispatch Log',
    MONTHLY: 'Monthly Revenue, Billing & Accounts Audit',
    ANNUAL: 'Annual Maintenance & Service Overview',
    TECHNICIAN: 'Field Engineer Productivity & Labor KPIs',
    PARTS: 'Spare Parts Inventory & Depletion Audit',
  };

  const reportTitle = titleMap[reportType] || 'Executive Service Audit Report';
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const handlePrint = () => {
    printDocumentElement('printable-report-doc-area', `BubbleUp_Report_${reportType}`);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf('printable-report-doc-area', `BubbleUp_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadAsPrintableHtml('printable-report-doc-area', `BubbleUp_Report_${reportType}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-950 text-white gap-2 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 text-sky-400 rounded-lg border border-sky-700/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{reportTitle}</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                  A4 FORMAT
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Executive Technical Audit & Operations Intelligence</span>
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

        {/* Printable Report Document */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 text-slate-800 text-sm bg-white" id="printable-report-doc-area">
          
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
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block">EXECUTIVE SERVICE AUDIT</span>
                  <span className="font-mono text-base font-black text-sky-950 block">{reportType} REPORT</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 text-right">
                  <p><span className="font-semibold text-slate-700">Generated:</span> {currentDate}</p>
                  <p><span className="font-semibold text-slate-700">Currency:</span> Qatar Riyals (QAR)</p>
                  <p><span className="font-semibold text-slate-700">System Status:</span> Active ERP</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Dashboard Strip */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Job Orders</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{totalJobs}</span>
              <span className="text-[10px] text-emerald-700 font-bold">{completedJobs} Completed</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Invoiced</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">QAR {totalInvoiced.toFixed(0)}</span>
              <span className="text-[10px] text-slate-500">Gross Billed</span>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl text-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Collected Revenue</span>
              <span className="text-lg font-black text-emerald-800 font-mono mt-0.5 block">QAR {totalCollected.toFixed(0)}</span>
              <span className="text-[10px] text-emerald-700 font-bold">{totalInvoiced > 0 ? ((totalCollected/totalInvoiced)*100).toFixed(0) : 0}% Realized</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl text-center">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">Outstanding Balance</span>
              <span className="text-lg font-black text-amber-800 font-mono mt-0.5 block">QAR {totalOutstanding.toFixed(0)}</span>
              <span className="text-[10px] text-amber-700">Accounts Due</span>
            </div>
          </div>

          {/* Main Table for Report Type */}
          {reportType === 'TECHNICIAN' ? (
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-xs">
                Field Engineer Productivity & Labor Metrics
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-2.5 font-bold">Technician</th>
                    <th className="p-2.5 font-bold">Emp ID</th>
                    <th className="p-2.5 font-bold">Specialization</th>
                    <th className="p-2.5 font-bold text-center">Assigned</th>
                    <th className="p-2.5 font-bold text-center">Completed</th>
                    <th className="p-2.5 font-bold text-right">Revenue (QAR)</th>
                    <th className="p-2.5 font-bold text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {technicians.map((t) => {
                    const techJobs = jobCards.filter(j => j.assignedTechnicianId === t.id);
                    const techCompleted = techJobs.filter(j => j.status === 'COMPLETED');
                    const techRev = techJobs.reduce((sum, j) => sum + j.paidAmount, 0);

                    return (
                      <tr key={t.id}>
                        <td className="p-2.5 font-bold text-slate-900">{t.fullName}</td>
                        <td className="p-2.5 font-mono text-slate-600">{t.employeeId}</td>
                        <td className="p-2.5 text-slate-600">{t.specialization.split(',')[0]}</td>
                        <td className="p-2.5 text-center font-mono">{techJobs.length}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{techCompleted.length}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">QAR {techRev.toFixed(2)}</td>
                        <td className="p-2.5 text-center font-bold text-amber-600">★ {t.rating.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : reportType === 'PARTS' ? (
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-xs">
                Spare Parts Inventory & Stock Valuation
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-2.5 font-bold">Part Name</th>
                    <th className="p-2.5 font-bold">Part #</th>
                    <th className="p-2.5 font-bold">Category</th>
                    <th className="p-2.5 font-bold text-center">In Stock</th>
                    <th className="p-2.5 font-bold text-center">Min Level</th>
                    <th className="p-2.5 font-bold text-right">Selling Price</th>
                    <th className="p-2.5 font-bold text-right">Inventory Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {spareParts.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{p.partNumber}</td>
                      <td className="p-2.5 text-slate-600">{p.category}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{p.quantityInStock}</td>
                      <td className="p-2.5 text-center font-mono text-slate-500">{p.minimumStockLevel}</td>
                      <td className="p-2.5 text-right font-mono">QAR {p.sellingPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        QAR {(p.quantityInStock * p.sellingPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-xs">
                Active Job Cards & Field Service Summary
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-2.5 font-bold">Job #</th>
                    <th className="p-2.5 font-bold">Customer & Location</th>
                    <th className="p-2.5 font-bold">Equipment</th>
                    <th className="p-2.5 font-bold">Engineer</th>
                    <th className="p-2.5 font-bold text-center">Status</th>
                    <th className="p-2.5 font-bold text-right">Amount (QAR)</th>
                    <th className="p-2.5 font-bold text-right">Paid (QAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jobCards.slice(0, 15).map((j) => (
                    <tr key={j.id}>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{j.jobCardNumber}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{j.customerName}</p>
                        <p className="text-[10px] text-slate-500">{j.customerArea}</p>
                      </td>
                      <td className="p-2.5 text-slate-700">{j.machineBrand} {j.machineModel}</td>
                      <td className="p-2.5 text-slate-700">{j.assignedTechnicianName}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {j.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-medium">QAR {j.totalAmount.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">QAR {j.paidAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {jobCards.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                        No service records registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Sign-off */}
          <div className="border-t-2 border-slate-300 pt-4 flex justify-between items-center text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800">Bubble Up Trading Operations Management</p>
              <p className="text-[10px] text-slate-500">Doha, State of Qatar • Confidential Internal Audit</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Verified System Report</p>
              <p className="text-[10px] text-slate-500">Page 1 of 1 • Standard A4 Format</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
