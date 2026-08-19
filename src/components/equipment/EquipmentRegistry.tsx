import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Machine, MachineCategory, WarrantyStatus } from '../../types';
import { WarrantyBadge } from '../jobcards/JobCardStatusBadge';
import { ItemRemovalModal } from '../common/ItemRemovalModal';
import { RemovalLogsModal } from '../common/RemovalLogsModal';
import { 
  Wrench, Plus, Search, Building, Calendar, 
  Clock, ShieldCheck, QrCode, AlertTriangle, X, CheckCircle,
  Trash2, ClipboardList, Tag
} from 'lucide-react';

export const EquipmentRegistry: React.FC = () => {
  const { 
    machines, customers, addMachine, updateMachine, deleteMachine, 
    removalLogs, machineCategories, addMachineCategory 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [machineToRemove, setMachineToRemove] = useState<Machine | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // New Machine Form State
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [category, setCategory] = useState<string>(machineCategories[0]?.id || 'COMMERCIAL_WASHER_EXTRACTOR');
  const [brand, setBrand] = useState('Primus');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacityKg, setCapacityKg] = useState<number>(20);
  const [powerSupply, setPowerSupply] = useState('380V / 3-Phase Steam Heated');
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyStartDate, setWarrantyStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus>('ACTIVE');
  const [machineLocation, setMachineLocation] = useState('Main Laundry Area');

  const filteredMachines = machines.filter(m => {
    const matchesSearch = 
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machineLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    addMachine({
      customerId: cust.id,
      customerName: cust.companyName,
      category: category as any,
      brand,
      model,
      serialNumber,
      capacityKg,
      powerSupply,
      installationDate,
      warrantyStartDate,
      warrantyEndDate: warrantyEndDate || '2027-01-01',
      warrantyStatus,
      machineLocation,
      status: 'OPERATIONAL',
      qrCodeId: `QR-${brand.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
    });

    setShowAddModal(false);
    setModel('');
    setSerialNumber('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.trim().toUpperCase().replace(/\s+/g, '_');
    addMachineCategory(catId, newCatName.trim());
    setCategory(catId);
    setNewCatName('');
    setShowAddCategoryModal(false);
  };

  const handleConfirmRemoval = (reason: string, details?: string) => {
    if (!machineToRemove) return;
    deleteMachine(machineToRemove.id, reason, details);
    setMachineToRemove(null);
  };

  const machineLogsCount = removalLogs.filter(l => l.itemType === 'MACHINE').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Installed Equipment Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of commercial washer-extractors, tumble dryers, barrier washers, ironers, and steam generators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            title="Create a new machinery category"
          >
            <Tag className="w-3.5 h-3.5 text-sky-700" />
            <span>+ Add Machine Category</span>
          </button>

          <button
            onClick={() => setShowLogsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            title="View Decommissioned / Removed Machines Audit Log"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>Removal Logs ({machineLogsCount})</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Machine
          </button>
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
            placeholder="Search by Machine Model, Serial Number, Brand, or Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Categories ({machines.length})</option>
            {machineCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Equipment Brand & Model</th>
                <th className="py-3 px-4 font-semibold">Category & Capacity</th>
                <th className="py-3 px-4 font-semibold">Serial Number & QR</th>
                <th className="py-3 px-4 font-semibold">Installed Facility</th>
                <th className="py-3 px-4 font-semibold">Location on Site</th>
                <th className="py-3 px-4 font-semibold">Warranty Status</th>
                <th className="py-3 px-4 font-semibold text-center">Service Calls</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMachines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-sm block">{m.brand} {m.model}</span>
                    <span className="text-[11px] text-slate-500">{m.powerSupply}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700">{m.category.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-sky-800 font-bold block text-[11px]">{m.capacityKg} kg / load</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {m.serialNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{m.qrCodeId}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{m.customerName}</span>
                    <span className="text-[11px] text-slate-500 block">Installed: {m.installationDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {m.machineLocation}
                  </td>
                  <td className="py-3.5 px-4">
                    <WarrantyBadge status={m.warrantyStatus} />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Exp: {m.warrantyEndDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {m.totalServiceCount || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setMachineToRemove(m)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 rounded border border-rose-200 transition-colors cursor-pointer"
                      title="Decommission / Remove Equipment with Reason"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">Register Commercial Laundry Machine</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Customer / Facility Name *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.facilityType.replace(/_/g, ' ')})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[10px] text-sky-700 font-bold hover:underline flex items-center gap-0.5"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    {machineCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Primus, Speed Queen, Unimac..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model Name / Number *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. RX-180 High Spin"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. PR-2023-8849"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capacity (KG) *</label>
                  <input
                    type="number"
                    required
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Power / Heating Supply</label>
                  <input
                    type="text"
                    value={powerSupply}
                    onChange={(e) => setPowerSupply(e.target.value)}
                    placeholder="380V / 3-Phase Steam Heated"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Warranty End Date</label>
                  <input
                    type="date"
                    value={warrantyEndDate}
                    onChange={(e) => setWarrantyEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Specific Location Inside Facility</label>
                  <input
                    type="text"
                    value={machineLocation}
                    onChange={(e) => setMachineLocation(e.target.value)}
                    placeholder="Basement Laundry Plant - Line 1 Washer Bay"
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
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Machine Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                Add New Machinery Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Tunnel Continuous Washers, Folder Stackers"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700 mb-1">Existing Categories:</p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {machineCategories.map((c) => (
                    <span key={c.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Machine with Reason Modal */}
      {machineToRemove && (
        <ItemRemovalModal
          item={{
            id: machineToRemove.id,
            type: 'MACHINE',
            name: `${machineToRemove.brand} ${machineToRemove.model}`,
            identifier: machineToRemove.serialNumber,
            category: machineToRemove.category.replace(/_/g, ' '),
            customerName: machineToRemove.customerName,
            location: machineToRemove.machineLocation,
            extraInfo: `Capacity: ${machineToRemove.capacityKg} kg | Power: ${machineToRemove.powerSupply}`
          }}
          onClose={() => setMachineToRemove(null)}
          onConfirm={handleConfirmRemoval}
        />
      )}

      {/* Removal Logs Modal */}
      {showLogsModal && (
        <RemovalLogsModal
          defaultFilter="MACHINE"
          onClose={() => setShowLogsModal(false)}
        />
      )}

    </div>
  );
};

