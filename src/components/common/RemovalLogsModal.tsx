import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ItemRemovalLog } from '../../types';
import { 
  ClipboardList, Search, Filter, Calendar, 
  User, ShieldAlert, X, Wrench, Package, ArrowDownRight 
} from 'lucide-react';

interface RemovalLogsModalProps {
  onClose: () => void;
  defaultFilter?: 'ALL' | 'MACHINE' | 'SPARE_PART' | 'TECHNICIAN';
}

export const RemovalLogsModal: React.FC<RemovalLogsModalProps> = ({ onClose, defaultFilter = 'ALL' }) => {
  const { removalLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MACHINE' | 'SPARE_PART' | 'TECHNICIAN'>(defaultFilter);

  const filteredLogs = removalLogs.filter(log => {
    const matchesType = typeFilter === 'ALL' || log.itemType === typeFilter;
    const matchesSearch = 
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.itemIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.removedByUserName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-rose-400 border border-slate-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Item Removal & Decommission Audit Logs</h2>
              <p className="text-xs text-slate-400">Complete historical trail of equipment, parts, and staff records removed with certified justifications</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit logs by Item Name, Serial/Part #, Reason, or Auditor..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              All ({removalLogs.length})
            </button>
            <button
              onClick={() => setTypeFilter('MACHINE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 'MACHINE' ? 'bg-sky-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Machines ({removalLogs.filter(l => l.itemType === 'MACHINE').length})
            </button>
            <button
              onClick={() => setTypeFilter('SPARE_PART')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 'SPARE_PART' ? 'bg-amber-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Spare Parts ({removalLogs.filter(l => l.itemType === 'SPARE_PART').length})
            </button>
            <button
              onClick={() => setTypeFilter('TECHNICIAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 'TECHNICIAN' ? 'bg-purple-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Technicians ({removalLogs.filter(l => l.itemType === 'TECHNICIAN').length})
            </button>
          </div>
        </div>

        {/* Logs Table / List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-200">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No removal records found matching your filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const formattedDate = new Date(log.removedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        log.itemType === 'MACHINE' 
                          ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                          : log.itemType === 'SPARE_PART'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {log.itemType === 'MACHINE' ? 'Machine Asset' : log.itemType === 'SPARE_PART' ? 'Spare Part' : 'Technician Staff'}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{log.itemName}</span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.itemIdentifier}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Removal Reason & User */}
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-rose-900 shrink-0">Reason for Removal:</span>
                      <span className="text-rose-800 font-medium">{log.reason}</span>
                    </div>

                    {log.details && (
                      <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-rose-300">
                        <strong>Disposal / Audit Notes:</strong> {log.details}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Authorized By: <strong className="text-slate-800">{log.removedByUserName}</strong> ({log.removedByUserRole})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Log ID: {log.id}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredLogs.length} audit records</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
          >
            Close Audit Logs
          </button>
        </div>

      </div>
    </div>
  );
};
