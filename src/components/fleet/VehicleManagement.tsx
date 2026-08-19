import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehicleStatus } from '../../types';
import { VehicleStatusBadge } from '../jobcards/JobCardStatusBadge';
import { 
  Truck, Plus, Search, Calendar, Gauge, ShieldAlert, 
  Wrench, CheckCircle, X, Edit, Trash2 
} from 'lucide-react';

export const VehicleManagement: React.FC = () => {
  const { vehicles, dutyLogs, addVehicle, updateVehicle, deleteVehicle } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New vehicle form
  const [regNo, setRegNo] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('HiAce Service Van');
  const [year, setYear] = useState(2023);
  const [color, setColor] = useState('White');
  const [vin, setVin] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [insuranceExp, setInsuranceExp] = useState('2027-04-30');
  const [regExp, setRegExp] = useState('2027-04-15');
  const [serviceDue, setServiceDue] = useState('2026-10-30');
  const [mileage, setMileage] = useState(45000);
  const [notes, setNotes] = useState('');

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assignedTechnicianName && v.assignedTechnicianName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle({
      registrationNumber: regNo,
      vehicleType: 'SERVICE_VAN',
      make,
      model,
      year,
      color,
      vinChassisNumber: vin || `VIN-${Date.now()}`,
      engineNumber: engineNo || `ENG-${Date.now()}`,
      insuranceExpiry: insuranceExp,
      registrationExpiry: regExp,
      serviceDueDate: serviceDue,
      currentMileage: mileage,
      status: 'AVAILABLE',
      notes
    });

    setShowAddModal(false);
    setRegNo('');
    setVin('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Fleet & Vehicle Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet assignments, live field dispatch tracking, odometer logs, and vehicle workshop maintenance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Fleet Vehicle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Plate Number, Make, Model, or Driver..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Vehicle Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">On Duty / Assigned</option>
            <option value="UNDER_MAINTENANCE">In Workshop</option>
          </select>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-black text-slate-900 text-base bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                  {v.registrationNumber}
                </span>
                <VehicleStatusBadge status={v.status} />
              </div>

              <h3 className="font-bold text-slate-800 text-sm">{v.make} {v.model} ({v.year})</h3>
              <span className="text-[11px] text-slate-500">{v.vehicleType.replace(/_/g, ' ')} • {v.color}</span>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="flex justify-between">
                  <span>Current Mileage:</span>
                  <strong className="font-mono text-slate-900 font-bold">{v.currentMileage} km</strong>
                </p>
                <p className="flex justify-between">
                  <span>Assigned Driver:</span>
                  <strong className="text-sky-900">{v.assignedTechnicianName || 'None (Available in Depot)'}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Service Due Date:</span>
                  <span className="text-slate-700">{v.serviceDueDate}</span>
                </p>
                <p className="flex justify-between">
                  <span>Insurance Expiry:</span>
                  <span className="text-slate-700">{v.insuranceExpiry}</span>
                </p>
              </div>
            </div>

            {v.notes && (
              <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-200/50">
                "{v.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">Register Fleet Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Plate / Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. DXB-K-4921"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vehicle Make *</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Toyota, Ford, Isuzu..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model & Spec *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="HiAce High Roof Workshop Van"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Odometer (km) *</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">VIN / Chassis Number</label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="JT123..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Registration Expiry</label>
                  <input
                    type="date"
                    value={regExp}
                    onChange={(e) => setRegExp(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Service Due Date</label>
                  <input
                    type="date"
                    value={serviceDue}
                    onChange={(e) => setServiceDue(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Onboard Tools & Equipment Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Equipped with steam pressure testing kit, bearing pullers..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
