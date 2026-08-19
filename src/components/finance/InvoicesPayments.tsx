import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard, PaymentMethod } from '../../types';
import { PaymentBadge } from '../jobcards/JobCardStatusBadge';
import { PrintableJobCard } from '../jobcards/PrintableJobCard';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';
import { 
  DollarSign, Search, Calendar, FileText, Printer, 
  CheckCircle, ArrowDownLeft, CreditCard, Building, User, Download, Plus, Receipt
} from 'lucide-react';

export const InvoicesPayments: React.FC = () => {
  const { jobCards, recordJobPayment, showNotification } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedJobForPay, setSelectedJobForPay] = useState<ServiceJobCard | null>(null);
  const [printInvoiceJob, setPrintInvoiceJob] = useState<ServiceJobCard | null>(null);
  const [printJobCard, setPrintJobCard] = useState<ServiceJobCard | null>(null);

  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');

  const invoicedJobs = jobCards.filter(j => j.invoiceNumber);

  const filteredInvoices = invoicedJobs.filter(j => {
    const matchesSearch = 
      j.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.jobCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = paymentFilter === 'ALL' || j.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoicedJobs.reduce((sum, j) => sum + j.totalAmount, 0);
  const totalCollected = invoicedJobs.reduce((sum, j) => sum + j.paidAmount, 0);
  const totalOutstanding = invoicedJobs.reduce((sum, j) => sum + j.outstandingBalance, 0);

  const handleOpenPay = (job: ServiceJobCard) => {
    setSelectedJobForPay(job);
    setPayAmount(job.outstandingBalance);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForPay || payAmount <= 0) return;
    recordJobPayment(selectedJobForPay.id, payAmount, payMethod);
    setSelectedJobForPay(null);
    showNotification('Payment collected and invoice reconciled successfully');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoices & Accounts Receivable</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track service billing, parts invoicing, customer payments, outstanding balances, and VAT receipts.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Invoiced Amount</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            QAR {totalInvoiced.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Includes 5% Tax/VAT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-700 font-semibold block">Collected / Paid Revenue</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
            QAR {totalCollected.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Cash, Card, & Bank Transfers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-amber-700 font-semibold block">Outstanding Balance Due</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
            QAR {totalOutstanding.toFixed(2)}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block">Accounts receivable aging</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice #, Job #, or Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Payment States</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="UNPAID">Unpaid / Due</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Job Reference</th>
                <th className="py-3 px-4 font-semibold">Customer / Facility</th>
                <th className="py-3 px-4 font-semibold">Technician</th>
                <th className="py-3 px-4 font-semibold text-right">Labor + Travel</th>
                <th className="py-3 px-4 font-semibold text-right">Parts</th>
                <th className="py-3 px-4 font-semibold text-right">Total (QAR)</th>
                <th className="py-3 px-4 font-semibold text-right">Paid</th>
                <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-900">
                    {job.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {job.jobCardNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{job.customerName}</span>
                    <span className="text-[11px] text-slate-500">{job.customerCity}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {job.assignedTechnicianName}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {(job.laborCharges + job.travelCharges).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {job.partsTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {job.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {job.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                    {job.outstandingBalance.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <PaymentBadge status={job.paymentStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {job.outstandingBalance > 0 && (
                        <button
                          onClick={() => handleOpenPay(job)}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold cursor-pointer"
                          title="Record Payment"
                        >
                          Settle
                        </button>
                      )}
                      <button
                        onClick={() => setPrintInvoiceJob(job)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                        title="Print A4 Tax Invoice / Billing Statement"
                      >
                        <Receipt className="w-3.5 h-3.5 text-sky-700" />
                        <span>A4 Invoice</span>
                      </button>
                      <button
                        onClick={() => setPrintJobCard(job)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Print A4 Service Job Card"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Payment Modal */}
      {selectedJobForPay && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <h2 className="text-sm font-bold text-white">Record Payment for {selectedJobForPay.invoiceNumber}</h2>
              <button onClick={() => setSelectedJobForPay(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Customer:</span>
                  <span className="font-bold text-slate-900">{selectedJobForPay.customerName}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Invoice Total:</span>
                  <span className="font-mono">QAR {selectedJobForPay.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-700">
                  <span>Current Outstanding:</span>
                  <span className="font-mono">QAR {selectedJobForPay.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount to Collect (QAR) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedJobForPay.outstandingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CREDIT_CARD">Credit / Debit POS Card</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedJobForPay(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printInvoiceJob && (
        <PrintableInvoiceModal job={printInvoiceJob} onClose={() => setPrintInvoiceJob(null)} />
      )}

      {/* Printable Job Card Modal */}
      {printJobCard && (
        <PrintableJobCard job={printJobCard} onClose={() => setPrintJobCard(null)} />
      )}

    </div>
  );
};
