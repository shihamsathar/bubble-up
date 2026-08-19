import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2, UserCheck, FileText } from 'lucide-react';

export interface ItemToRemove {
  id: string;
  type: 'MACHINE' | 'SPARE_PART' | 'TECHNICIAN';
  name: string;
  identifier: string; // Serial #, Part #, or Employee ID
  category?: string;
  location?: string;
  extraInfo?: string;
}

interface ItemRemovalModalProps {
  item: ItemToRemove;
  onClose: () => void;
  onConfirm: (reason: string, details?: string) => void;
}

export const ItemRemovalModal: React.FC<ItemRemovalModalProps> = ({ item, onClose, onConfirm }) => {
  const { currentUser, currentRole } = useApp();

  const machinePresets = [
    'Decommissioned by Client Facility',
    'Scrapped due to End of Operational Life',
    'Replaced by Higher Capacity Modern Unit',
    'Structural Bearing Failure / Uneconomic to Repair',
    'Transferred to Central Scrap Yard'
  ];

  const partPresets = [
    'Defective / Damaged in Transit',
    'Obsolete Part / Discontinued Model',
    'Material Degradation / Expired Seal Quality',
    'Inventory Audit Variance Write-Off',
    'Factory Recall / Scrapped Batch'
  ];

  const techPresets = [
    'Resigned from Company Service',
    'Employment Contract Completed',
    'Transferred to Central Maintenance Depot',
    'Technical License or Visa Expired',
    'Disciplinary Action / Decommissioned Account'
  ];

  const presets = item.type === 'MACHINE' 
    ? machinePresets 
    : item.type === 'SPARE_PART' 
      ? partPresets 
      : techPresets;

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const finalReason = selectedPreset 
    ? (customReason.trim() ? `${selectedPreset} - ${customReason.trim()}` : selectedPreset)
    : customReason.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalReason) {
      setError('Please provide or select a mandatory reason for removal.');
      return;
    }
    if (!isConfirmed) {
      setError('Please check the confirmation box to authorize removal.');
      return;
    }

    onConfirm(finalReason, details);
  };

  const itemTitle = item.type === 'MACHINE' 
    ? 'Equipment' 
    : item.type === 'SPARE_PART' 
      ? 'Spare Part' 
      : 'Technician Staff';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-900 text-white border-b border-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-800/80 border border-rose-700 text-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Authorize {itemTitle} Removal
              </h2>
              <p className="text-xs text-rose-200">
                Audit Logging Required for {currentRole === 'ADMIN' ? 'Administrator' : 'Field Technician'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          
          {/* Target Item Details Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.type === 'MACHINE' ? 'Equipment Asset to Remove' : item.type === 'SPARE_PART' ? 'Spare Part to Write-off' : 'Technician to Decommission'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                {item.identifier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              {item.category && (
                <div><span className="font-semibold text-slate-700">Category / Role:</span> {item.category}</div>
              )}
              {item.location && (
                <div><span className="font-semibold text-slate-700">Location / Van:</span> {item.location}</div>
              )}
              {item.extraInfo && (
                <div className="col-span-2"><span className="font-semibold text-slate-700">Info:</span> {item.extraInfo}</div>
              )}
            </div>
          </div>

          {/* User Audit Signature Badge */}
          <div className="flex items-center gap-2 p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-900">
            <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="font-bold">Logged Auditor:</span> {currentUser.name} (
              <span className="font-semibold text-sky-800 uppercase">{currentRole}</span>)
            </div>
          </div>

          {/* Quick Preset Reasons */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Select Preset Reason *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(isSelected ? '' : preset);
                      setError('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors text-left ${
                      isSelected 
                        ? 'bg-rose-700 text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Reason Text */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Detailed Reason / Justification *
            </label>
            <textarea
              required
              rows={2}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setError('');
              }}
              placeholder="State the technical reason, customer authorization, or physical inspection findings..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Internal Storage / Disposal Notes (Optional)
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Disposed via scrap contractor #4812, warehouse bay cleared"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>

          {/* Confirmation Checkbox */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  setError('');
                }}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-[11px] text-amber-900 leading-snug">
                I confirm this removal is authorized. An immutable audit record will be logged with my credentials (<strong>{currentUser.name}</strong>) and timestamp.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Confirm & Log Removal
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
