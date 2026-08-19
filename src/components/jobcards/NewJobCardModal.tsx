import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPriority, ServiceType, MachineCategory } from '../../types';
import { X, Plus, Wrench, Building, User, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NewJobCardModalProps {
  onClose: () => void;
}

export const NewJobCardModal: React.FC<NewJobCardModalProps> = ({ onClose }) => {
  const { customers, machines, technicians, createJobCard } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>(technicians[0]?.id || '');
  const [priority, setPriority] = useState<JobPriority>('MEDIUM');
  const [serviceType, setServiceType] = useState<ServiceType>('BREAKDOWN_REPAIR');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>('09:30 AM');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [customerComplaint, setCustomerComplaint] = useState<string>('');
  const [laborCharges, setLaborCharges] = useState<number>(200);
  const [travelCharges, setTravelCharges] = useState<number>(60);
  const [advancePaid, setAdvancePaid] = useState<number>(0);

  // Available machines for the selected customer
  const customerMachines = machines.filter(m => m.customerId === selectedCustomerId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Auto-select first machine if not set or if customer changes
  React.useEffect(() => {
    if (customerMachines.length > 0) {
      setSelectedMachineId(customerMachines[0].id);
    } else {
      setSelectedMachineId('');
    }
  }, [selectedCustomerId]);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  const selectedTech = technicians.find(t => t.id === assignedTechnicianId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    createJobCard({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.companyName,
      customerContact: selectedCustomer.contactPerson,
      customerPhone: selectedCustomer.mobile,
      customerEmail: selectedCustomer.email,
      customerAddress: selectedCustomer.address,
      customerArea: selectedCustomer.area,
      customerCity: selectedCustomer.city,
      customerTaxNumber: selectedCustomer.taxVatNumber,

      machineId: selectedMachine ? selectedMachine.id : 'temp-mach',
      machineBrand: selectedMachine ? selectedMachine.brand : 'Commercial Brand',
      machineModel: selectedMachine ? selectedMachine.model : 'Standard Equipment',
      machineSerial: selectedMachine ? selectedMachine.serialNumber : 'PENDING-SN',
      machineCategory: selectedMachine ? selectedMachine.category : 'COMMERCIAL_WASHER_EXTRACTOR',
      machineCapacity: selectedMachine ? selectedMachine.capacityKg : 20,
      machineLocation: selectedMachine ? selectedMachine.machineLocation : 'Plant Floor',
      warrantyStatus: selectedMachine ? selectedMachine.warrantyStatus : 'ACTIVE',
      warrantyEndDate: selectedMachine?.warrantyEndDate,

      serviceRequestDate: new Date().toISOString().split('T')[0],
      scheduledDate,
      scheduledTime,
      assignedTechnicianId: selectedTech ? selectedTech.id : '',
      assignedTechnicianName: selectedTech ? selectedTech.fullName : 'Unassigned',
      priority,
      serviceType,
      problemDescription,
      customerComplaint: customerComplaint || problemDescription,
      laborCharges,
      travelCharges,
      advancePaid,
      paidAmount: advancePaid,
      partsUsed: [],
      photos: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Service Job Card</h2>
              <p className="text-xs text-slate-400">Generate a sequential job card for commercial laundry equipment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Customer Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Building className="w-4 h-4 text-sky-700" />
              Select Customer / Commercial Facility
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.city} - {c.customerType})
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                <div><span className="font-semibold text-slate-700">Contact:</span> {selectedCustomer.contactPerson}</div>
                <div><span className="font-semibold text-slate-700">Mobile:</span> {selectedCustomer.mobile}</div>
                <div><span className="font-semibold text-slate-700">City / Area:</span> {selectedCustomer.city}, {selectedCustomer.area}</div>
              </div>
            )}
          </div>

          {/* Machine & Equipment Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Wrench className="w-4 h-4 text-sky-700" />
              Select Installed Laundry Equipment
            </label>
            
            {customerMachines.length > 0 ? (
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                {customerMachines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.model} (SN: {m.serialNumber} | {m.capacityKg}kg | {m.machineLocation})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                No pre-registered machines for this customer. A generic equipment profile will be created.
              </div>
            )}

            {selectedMachine && (
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                <div><span className="font-semibold text-slate-700">Type:</span> {selectedMachine.category.replace(/_/g, ' ')}</div>
                <div><span className="font-semibold text-slate-700">Serial No:</span> <span className="font-mono font-bold text-slate-900">{selectedMachine.serialNumber}</span></div>
                <div><span className="font-semibold text-slate-700">Warranty:</span> <span className="font-bold text-sky-800">{selectedMachine.warrantyStatus}</span></div>
              </div>
            )}
          </div>

          {/* Priority & Service Type Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as JobPriority)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
              >
                <option value="EMERGENCY">EMERGENCY (Critical Plant Halt)</option>
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="LOW">Low (Routine / Planned)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
              >
                <option value="BREAKDOWN_REPAIR">Breakdown & Fault Repair</option>
                <option value="PREVENTATIVE_MAINTENANCE">Preventative Maintenance (PM)</option>
                <option value="INSTALLATION">New Machine Installation & Commissioning</option>
                <option value="WARRANTY_SERVICE">OEM Warranty Service</option>
                <option value="SAFETY_INSPECTION">Steam / Pressure Safety Inspection</option>
                <option value="EMERGENCY_CALLOUT">24/7 Emergency Callout</option>
              </select>
            </div>
          </div>

          {/* Schedule & Technician Assignment */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Scheduled Time
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Assign Technician
              </label>
              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.position} - {t.currentDutyStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Customer Complaint / Problem Description *
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={3}
              placeholder="Detail the reported symptoms, error codes (e.g., Error E21 Inverter Trip, bearing rumble, water inlet leak, heating failure)..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Financial Quote / Base Charges */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Labor / Service Fee (QAR)</label>
              <input
                type="number"
                value={laborCharges}
                onChange={(e) => setLaborCharges(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fleet Callout / Travel (QAR)</label>
              <input
                type="number"
                value={travelCharges}
                onChange={(e) => setTravelCharges(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Advance Received (QAR)</label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Generate Job Card
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
