import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PrintableReportModal } from './PrintableReportModal';
import { 
  FileText, Download, Calendar, Printer, TrendingUp, 
  Users, Wrench, DollarSign, CheckCircle2, AlertTriangle, Eye 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, CartesianGrid, LineChart, Line 
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const { jobCards, technicians, spareParts, dutyLogs, customers } = useApp();

  const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY' | 'ANNUAL' | 'TECHNICIAN' | 'PARTS'>('DAILY');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [showPrintableReport, setShowPrintableReport] = useState(false);

  // Summary calculations
  const totalJobs = jobCards.length;
  const completedJobs = jobCards.filter(j => j.status === 'COMPLETED').length;
  const totalRevenue = jobCards.reduce((sum, j) => sum + j.paidAmount, 0);
  const totalInvoiced = jobCards.reduce((sum, j) => sum + j.totalAmount, 0);
  const totalOutstanding = jobCards.reduce((sum, j) => sum + j.outstandingBalance, 0);

  // Performance data per technician
  const techKPIs = technicians.map(tech => {
    const techJobs = jobCards.filter(j => j.assignedTechnicianId === tech.id);
    const techCompleted = techJobs.filter(j => j.status === 'COMPLETED');
    const techRev = techJobs.reduce((sum, j) => sum + j.paidAmount, 0);
    const techDuty = dutyLogs.filter(d => d.technicianId === tech.id);
    const totalDistance = techDuty.reduce((sum, d) => sum + (d.distanceCoveredKm || 0), 0);

    return {
      name: tech.fullName,
      employeeId: tech.employeeId,
      assignedCount: techJobs.length,
      completedCount: techCompleted.length,
      revenueGenerated: techRev,
      distanceKm: totalDistance,
      rating: tech.rating
    };
  });

  const exportReportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'TECHNICIAN') {
      headers = ['Technician Name', 'Employee ID', 'Assigned Jobs', 'Completed', 'Revenue (QAR)', 'Distance (KM)', 'Rating'];
      rows = techKPIs.map(t => [t.name, t.employeeId, t.assignedCount, t.completedCount, t.revenueGenerated.toFixed(2), t.distanceKm, t.rating]);
    } else {
      headers = ['Job Number', 'Date', 'Customer', 'Equipment', 'Technician', 'Status', 'Total (QAR)', 'Paid (QAR)', 'Balance (QAR)'];
      rows = jobCards.map(j => [j.jobCardNumber, j.scheduledDate, `"${j.customerName}"`, `"${j.machineBrand} ${j.machineModel}"`, `"${j.assignedTechnicianName}"`, j.status, j.totalAmount.toFixed(2), j.paidAmount.toFixed(2), j.outstandingBalance.toFixed(2)]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bubble_up_trading_report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Management Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of service dispatches, financial profitability, technician fleet efficiency, and spare parts depletion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintableReport(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer ring-1 ring-sky-500/40 hover:scale-[1.02]"
            title="Open Official A4 Print & PDF Preview Station"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Report / PDF</span>
          </button>
          <button
            onClick={exportReportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div id="printable-report-area" className="space-y-6">

      {/* Report Selection Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 text-xs font-semibold text-slate-600 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setReportType('DAILY')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${reportType === 'DAILY' ? 'border-sky-700 text-sky-900 font-bold' : 'border-transparent hover:text-slate-900'}`}
        >
          Daily Service Operations Log
        </button>
        <button
          onClick={() => setReportType('MONTHLY')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${reportType === 'MONTHLY' ? 'border-sky-700 text-sky-900 font-bold' : 'border-transparent hover:text-slate-900'}`}
        >
          Monthly Revenue & Accounts
        </button>
        <button
          onClick={() => setReportType('TECHNICIAN')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${reportType === 'TECHNICIAN' ? 'border-sky-700 text-sky-900 font-bold' : 'border-transparent hover:text-slate-900'}`}
        >
          Technician Fleet & Labor KPIs
        </button>
        <button
          onClick={() => setReportType('PARTS')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${reportType === 'PARTS' ? 'border-sky-700 text-sky-900 font-bold' : 'border-transparent hover:text-slate-900'}`}
        >
          Spare Parts Consumption
        </button>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Job Orders</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalJobs}</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">{completedJobs} completed ({((completedJobs/totalJobs)*100).toFixed(0)}%)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Invoiced Revenue</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">QAR {totalInvoiced.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Service orders + parts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-700 font-medium block">Reconciled Cash & Bank</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">QAR {totalRevenue.toFixed(2)}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Collected in bank</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-amber-700 font-medium block">Total Outstanding Due</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">QAR {totalOutstanding.toFixed(2)}</span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Unsettled client invoices</span>
        </div>
      </div>

      {/* REPORT CONTENT BODY */}
      {reportType === 'TECHNICIAN' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
            Technician Productivity & Van Travel Efficiency Report
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4 text-center">Assigned Jobs</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
                <th className="py-3 px-4 text-right">Distance Driven</th>
                <th className="py-3 px-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {techKPIs.map(t => (
                <tr key={t.employeeId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{t.employeeId}</td>
                  <td className="py-3 px-4 text-center font-bold">{t.assignedCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">{t.completedCount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sky-900">QAR {t.revenueGenerated.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{t.distanceKm} km</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600">{t.rating.toFixed(1)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(reportType === 'DAILY' || reportType === 'MONTHLY') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800 flex justify-between items-center">
            <span>Service Job Orders Ledger</span>
            <span className="text-slate-500 font-normal">{jobCards.length} Total Registered Calls</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="py-3 px-4">Job #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Facility / Customer</th>
                <th className="py-3 px-4">Machine & Serial</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total QAR</th>
                <th className="py-3 px-4 text-right">Paid QAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobCards.map(j => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-sky-900">{j.jobCardNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{j.scheduledDate}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{j.customerName}</td>
                  <td className="py-3 px-4 text-slate-700">{j.machineBrand} {j.machineModel}</td>
                  <td className="py-3 px-4 text-slate-700">{j.assignedTechnicianName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                      {j.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{j.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{j.paidAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'PARTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
            Spare Parts Consumption & Re-Order Levels
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="py-3 px-4">Part Number</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost (QAR)</th>
                <th className="py-3 px-4 text-right">Selling Price (QAR)</th>
                <th className="py-3 px-4 text-center">Remaining Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {spareParts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-sky-900">{p.partNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.category}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{(p.costPrice ?? p.unitCost ?? 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{p.sellingPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{p.stockQuantity}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{p.minStockLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      </div>

      {/* Printable A4 Report Modal */}
      {showPrintableReport && (
        <PrintableReportModal
          reportType={reportType}
          onClose={() => setShowPrintableReport(false)}
        />
      )}

    </div>
  );
};
