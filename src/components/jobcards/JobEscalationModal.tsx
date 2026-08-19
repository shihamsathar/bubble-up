import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJobCard, Technician, JobEscalationType } from '../../types';
import { 
  Users, ShieldAlert, Wrench, AlertTriangle, ArrowRight, 
  CheckCircle2, X, Sparkles, MessageSquare, Phone 
} from 'lucide-react';

interface JobEscalationModalProps {
  job: ServiceJobCard;
  onClose: () => void;
}

export const JobEscalationModal: React.FC<JobEscalationModalProps> = ({ job, onClose }) => {
  const { technicians, updateJobCard, addJobComment, showNotification, currentUser } = useApp();

  const chiefTechs = technicians.filter(t => t.isChiefTechnician || t.roleGrade === 'CHIEF_TECHNICIAN' || t.position.toLowerCase().includes('chief') || t.position.toLowerCase().includes('supervisor'));
  const otherTechs = technicians.filter(t => t.id !== job.assignedTechnicianId);

  const [escalationType, setEscalationType] = useState<JobEscalationType>('CHIEF_TECHNICIAN_REQUESTED');
  const [selectedChiefId, setSelectedChiefId] = useState(chiefTechs[0]?.id || technicians[0]?.id || '');
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
  const [escalationReasonCategory, setEscalationReasonCategory] = useState('COMPLEX_ELECTRONIC_PLC');
  const [reasonNotes, setReasonNotes] = useState('');
  const [urgency, setUrgency] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleTeamMember = (id: string) => {
    setSelectedTeamMemberIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonNotes.trim()) return;

    setIsSubmitting(true);

    const chosenChief = technicians.find(t => t.id === selectedChiefId);
    const chosenTeamMembers = technicians
      .filter(t => selectedTeamMemberIds.includes(t.id))
      .map(t => ({
        technicianId: t.id,
        technicianName: t.fullName,
        role: t.position,
        assignedAt: new Date().toISOString(),
        notes: 'Assigned as field support team member'
      }));

    const updatedStatus = escalationType === 'CHIEF_TECHNICIAN_REQUESTED' 
      ? 'ESCALATED_TO_CHIEF' 
      : 'TEAM_SUPPORT_ACTIVE';

    const reasonFull = `[${escalationReasonCategory.replace(/_/g, ' ')}] ${reasonNotes.trim()}`;

    updateJobCard(job.id, {
      status: updatedStatus,
      escalationStatus: escalationType,
      escalatedToChiefTechId: escalationType === 'CHIEF_TECHNICIAN_REQUESTED' ? chosenChief?.id : undefined,
      escalatedToChiefTechName: escalationType === 'CHIEF_TECHNICIAN_REQUESTED' ? chosenChief?.fullName : undefined,
      escalationReason: reasonFull,
      escalatedAt: new Date().toISOString(),
      teamSupportMembers: chosenTeamMembers.length > 0 ? chosenTeamMembers : undefined,
      teamSupportNotes: reasonNotes.trim()
    });

    // Add high-priority comment on job log
    addJobComment(
      job.id,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      `🚨 ESCALATION / TEAM SUPPORT ARRANGED: ${reasonFull}. ${
        escalationType === 'CHIEF_TECHNICIAN_REQUESTED' 
          ? `Arranged Chief Supervisor: ${chosenChief?.fullName || 'Chief Engineer'}` 
          : `Team backup members requested: ${chosenTeamMembers.map(m => m.technicianName).join(', ')}`
      }`,
      true
    );

    showNotification(
      escalationType === 'CHIEF_TECHNICIAN_REQUESTED'
        ? `Job escalated to Chief Technician (${chosenChief?.fullName || 'Chief Engineer'})`
        : `Team support pathway activated with ${chosenTeamMembers.length} technician(s)`
    );

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Chief Technician & Team Support Pathway</h2>
              <span className="text-[11px] text-slate-400">Job #{job.jobCardNumber} • {job.customerName}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <strong>Field Assistance Pathway:</strong> If you are unable to complete the repair due to complex diagnostic codes, safety certifications, heavy hoist needs, or specialized parts, you can immediately arrange a <strong>Chief Technician</strong> to take over supervision or request <strong>support team members</strong> to join on site.
          </div>

          {/* Support Pathway Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Select Support Pathway:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEscalationType('CHIEF_TECHNICIAN_REQUESTED')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  escalationType === 'CHIEF_TECHNICIAN_REQUESTED'
                    ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500 text-sky-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">Chief Technician</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">
                  Escalate to Master Engineer / Technical Supervisor
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEscalationType('TEAM_BACKUP_REQUESTED')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  escalationType === 'TEAM_BACKUP_REQUESTED'
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs">Team Backup / Crew</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">
                  Assign additional technicians to assist on site
                </p>
              </button>
            </div>
          </div>

          {/* Chief Technician Selection */}
          {escalationType === 'CHIEF_TECHNICIAN_REQUESTED' ? (
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Designated Chief Technician / Supervisor:
              </label>
              <select
                value={selectedChiefId}
                onChange={(e) => setSelectedChiefId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 font-semibold"
              >
                {chiefTechs.map(t => (
                  <option key={t.id} value={t.id}>
                    ★ {t.fullName} — {t.position} ({t.mobile})
                  </option>
                ))}
                {technicians.filter(t => !chiefTechs.some(c => c.id === t.id)).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} — {t.position}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Select Team Members to Join On-Site:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {otherTechs.map(t => {
                  const isChecked = selectedTeamMemberIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTeamMember(t.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className="block text-xs leading-none">{t.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{t.position}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reason Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Reason Category
              </label>
              <select
                value={escalationReasonCategory}
                onChange={(e) => setEscalationReasonCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="COMPLEX_ELECTRONIC_PLC">Complex PCB / PLC & Inverter Diagnostics</option>
                <option value="HIGH_PRESSURE_STEAM">Steam Boiler / Pressure Vessel Specialist Needed</option>
                <option value="HEAVY_MECHANICAL_HOIST">Bearing Pulling / Heavy Drum Hoist Crew</option>
                <option value="SPECIALIZED_TOOL_REQUIRED">Specialized Diagnostics Calibration Kit Needed</option>
                <option value="SAFETY_HAZARD_INSPECTION">Structural / Gas Burner Safety Inspection</option>
                <option value="MULTI_MAN_OPERATION">Multi-Person Installation / Heavy Overhaul</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="URGENT">🚨 Immediate Urgent Dispatch</option>
                <option value="HIGH">High Priority (Within 2 Hours)</option>
                <option value="NORMAL">Standard Team Support</option>
              </select>
            </div>
          </div>

          {/* Explanation Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Field Notes & Issue Description for Chief / Team *
            </label>
            <textarea
              required
              rows={3}
              value={reasonNotes}
              onChange={(e) => setReasonNotes(e.target.value)}
              placeholder="Describe why you cannot complete the job alone (e.g. Inverter error code E-94 requires master board diagnostics, or drum bearing seized requiring secondary hydraulic press)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reasonNotes.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Arranging Support...' : 'Confirm Pathway & Request Team'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
