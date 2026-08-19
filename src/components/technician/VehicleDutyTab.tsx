import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleStatusBadge, DutyStatusBadge } from '../jobcards/JobCardStatusBadge';
import { LiveTimer } from '../common/LiveTimer';
import { 
  Truck, CheckCircle, Clock, Navigation, AlertCircle, ShieldAlert, 
  MapPin, Gauge, KeyRound, ArrowRight, CheckCheck, History, Calendar
} from 'lucide-react';

export const VehicleDutyTab: React.FC = () => {
  const { 
    vehicles, technicians, dutyLogs, currentUser, 
    startTechnicianDuty, endTechnicianDuty, currentRole 
  } = useApp();

  // Find active technician record
  const currentTech = technicians.find(t => t.id === currentUser.technicianId || t.username === currentUser.username) || technicians[0];
  const assignedVehicle = vehicles.find(v => v.id === currentTech?.assignedVehicleId);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles.find(v => v.status === 'AVAILABLE')?.id || vehicles[0]?.id || '');
  const [startMileageInput, setStartMileageInput] = useState<number>(0);
  const [startNotes, setStartNotes] = useState<string>('');

  const [endMileageInput, setEndMileageInput] = useState<number>(0);
  const [endNotes, setEndNotes] = useState<string>('');

  const targetSelectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Sync mileage input when selecting vehicle
  React.useEffect(() => {
    if (targetSelectedVehicle) {
      setStartMileageInput(targetSelectedVehicle.currentMileage);
    }
  }, [selectedVehicleId]);

  // Sync end mileage default when assigned vehicle exists
  React.useEffect(() => {
    if (assignedVehicle) {
      setEndMileageInput(assignedVehicle.currentMileage + 15);
    }
  }, [assignedVehicle]);

  const handleStartDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTech || !selectedVehicleId || startMileageInput <= 0) return;
    startTechnicianDuty(currentTech.id, selectedVehicleId, startMileageInput, startNotes);
  };

  const handleEndDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTech || endMileageInput <= 0) return;
    endTechnicianDuty(currentTech.id, endMileageInput, endNotes);
  };

  // Filter logs for this technician
  const techDutyLogs = dutyLogs.filter(d => d.technicianId === currentTech?.id);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technician Vehicle & Duty Assignment</h1>
            <DutyStatusBadge status={currentTech?.currentDutyStatus || 'OFF_DUTY'} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign service van, record departure mileage, start duty timer, and close duty upon return.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div className="w-8 h-8 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
            {currentTech?.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{currentTech?.fullName}</span>
            <span className="text-[11px] text-slate-500">{currentTech?.employeeId} — {currentTech?.position}</span>
          </div>
        </div>
      </div>

      {/* Main Duty Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Duty Controller */}
        <div className="lg:col-span-7 space-y-6">
          
          {currentTech?.currentDutyStatus === 'ON_DUTY' ? (
            
            /* ON DUTY ACTIVE CARD */
            <div className="bg-emerald-950 text-white rounded-xl p-6 shadow-md border border-emerald-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-700/80 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-emerald-200 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Active Field Duty in Progress</span>
                    <h2 className="text-xl font-black tracking-tight text-white">{currentTech.currentDutyVehicleReg}</h2>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-800 text-emerald-100 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE ON-DUTY
                </span>
              </div>

              {assignedVehicle && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/50 text-xs">
                    <div>
                      <span className="text-emerald-400 block text-[11px]">Vehicle:</span>
                      <span className="font-semibold text-white">{assignedVehicle.make} {assignedVehicle.model}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block text-[11px]">Start Mileage:</span>
                      <span className="font-mono font-bold text-white">{currentTech.dutyStartMileage || assignedVehicle.currentMileage} km</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block text-[11px]">Assigned At:</span>
                      <span className="font-semibold text-white">
                        {currentTech.dutyStartTime ? new Date(currentTech.dutyStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'}
                      </span>
                    </div>
                  </div>

                  {/* Live Shift Stopwatch */}
                  <div className="bg-emerald-900/90 p-3 rounded-lg border border-emerald-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-300" />
                      <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">Live Shift Timer:</span>
                    </div>
                    <LiveTimer
                      startTime={currentTech.dutyStartTime}
                      isRunning={true}
                      showIcon={false}
                      className="text-base font-black font-mono text-white tracking-wider"
                    />
                  </div>
                </div>
              )}

              {/* End Duty Form */}
              <form onSubmit={handleEndDuty} className="bg-white text-slate-800 p-4 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    Complete Shift & Return Vehicle
                  </span>
                  <span className="text-xs text-slate-500 font-mono">End of Duty Procedure</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-xs text-slate-700 block mb-1">
                      Final Odometer / End Mileage (km) *
                    </label>
                    <input
                      type="number"
                      min={currentTech.dutyStartMileage || 0}
                      value={endMileageInput}
                      onChange={(e) => setEndMileageInput(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Distance covered: {Math.max(0, endMileageInput - (currentTech.dutyStartMileage || 0))} km
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-xs text-slate-700 block mb-1">
                      Closing Shift Remarks / Handover Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fuel topped up, tools intact, vehicle clean..."
                      value={endNotes}
                      onChange={(e) => setEndNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  Confirm Return & End Shift
                </button>
              </form>

            </div>

          ) : (

            /* START DUTY FORM */
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-lg bg-sky-700 text-white flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 1: Select Service Fleet Vehicle</h2>
                  <p className="text-xs text-slate-500">Pick an available workshop van and confirm starting mileage to activate duty status</p>
                </div>
              </div>

              <form onSubmit={handleStartDuty} className="space-y-4">
                
                {/* Vehicle Selector */}
                <div>
                  <label className="font-semibold text-xs text-slate-700 block mb-1">
                    Available Company Vehicles
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicles.map((v) => {
                      const isAvail = v.status === 'AVAILABLE';
                      const isSelected = selectedVehicleId === v.id;

                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            if (isAvail) setSelectedVehicleId(v.id);
                          }}
                          className={`p-3 rounded-lg border text-xs transition-all ${
                            isAvail ? 'cursor-pointer' : 'opacity-60 bg-slate-50 cursor-not-allowed'
                          } ${
                            isSelected && isAvail
                              ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-slate-900 text-sm">{v.registrationNumber}</span>
                            <VehicleStatusBadge status={v.status} />
                          </div>
                          <p className="font-medium text-slate-700">{v.make} {v.model} ({v.year})</p>
                          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                            <span>Odometer: <strong className="font-mono">{v.currentMileage} km</strong></span>
                            <span>{v.vehicleType.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {targetSelectedVehicle && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Selected Vehicle: {targetSelectedVehicle.registrationNumber} ({targetSelectedVehicle.make} {targetSelectedVehicle.model})</span>
                      <span className="text-slate-500">Service Due: {targetSelectedVehicle.serviceDueDate}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Starting Odometer Mileage (km) *
                        </label>
                        <input
                          type="number"
                          value={startMileageInput}
                          onChange={(e) => setStartMileageInput(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Daily Route / Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dubai Marina & Palm Jumeirah routes..."
                          value={startNotes}
                          onChange={(e) => setStartNotes(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                  </div>
                )}

                <button
                  type="submit"
                  disabled={!targetSelectedVehicle || targetSelectedVehicle.status !== 'AVAILABLE'}
                  className="w-full py-3 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  Assign Vehicle & Start Field Duty
                </button>
              </form>

            </div>

          )}

        </div>

        {/* Right Column: Active Fleet Status & Tech Duty History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fleet Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-700" />
              Company Fleet Status ({vehicles.length})
            </h3>

            <div className="space-y-2.5">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{v.registrationNumber}</span>
                      <span className="text-slate-600 font-medium">{v.make} {v.model}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {v.assignedTechnicianName ? `Driver: ${v.assignedTechnicianName}` : 'No driver assigned'} • {v.currentMileage} km
                    </span>
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Shift Duty Log History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-sky-700" />
              Duty History Logs ({currentTech?.fullName})
            </h3>

            <div className="space-y-2 text-xs">
              {techDutyLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="font-mono text-sky-900">{log.vehicleReg}</span>
                    <span className="text-slate-500 font-normal">{log.date}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 flex justify-between">
                    <span>Times: {log.startTime} {log.endTime ? `→ ${log.endTime}` : '(Active)'}</span>
                    {log.distanceCoveredKm !== undefined && (
                      <span className="font-bold text-emerald-700 font-mono">{log.distanceCoveredKm} km ({log.durationMinutes} mins)</span>
                    )}
                  </div>
                </div>
              ))}

              {techDutyLogs.length === 0 && (
                <p className="text-slate-400 italic text-center py-4">No duty logs recorded yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
