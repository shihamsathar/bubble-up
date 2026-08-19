import React, { useState, useRef, useEffect } from 'react';
import { ServiceJobCard, JobPhoto } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Camera, X, CheckCircle2, ChevronRight, ChevronLeft, 
  FlipHorizontal, RefreshCw, Upload, Sparkles, AlertCircle, 
  Eye, Trash2, Check, ShieldCheck, MapPin, Clock, Wrench
} from 'lucide-react';

export interface PhotoStepDef {
  stepNumber: number;
  stageKey: 'MACHINE_OVERVIEW' | 'REPAIR_PLACE' | 'REPLACEMENT_PARTS' | 'REPAIRED_COMPLETE';
  photoType: 'BEFORE_REPAIR' | 'FAULT_POINT' | 'PARTS_REPLACED' | 'AFTER_REPAIR';
  title: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  required: boolean;
  sampleUrl: string;
  defaultCaption: string;
}

export const JOB_PHOTO_STEPS: PhotoStepDef[] = [
  {
    stepNumber: 1,
    stageKey: 'MACHINE_OVERVIEW',
    photoType: 'BEFORE_REPAIR',
    title: 'Step 1: Machine Identification Photo',
    shortLabel: '1. Machine Photo',
    subtitle: 'Overall unit, nameplate, brand & serial tag in facility',
    description: 'Capture the full machine showing model and location before starting diagnostics or disassembly.',
    required: true,
    sampleUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
    defaultCaption: 'Pre-service machine inspection & installation area overview'
  },
  {
    stepNumber: 2,
    stageKey: 'REPAIR_PLACE',
    photoType: 'FAULT_POINT',
    title: 'Step 2: Repair Place & Defective Parts',
    shortLabel: '2. Repair Place',
    subtitle: 'Close-up of breakdown point, leak, worn bearing, or burnt board',
    description: 'Capture the exact point of breakdown, worn component, seal leakage, or damaged electrical board.',
    required: true,
    sampleUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    defaultCaption: 'Defective mechanical assembly / fault point inspection'
  },
  {
    stepNumber: 3,
    stageKey: 'REPLACEMENT_PARTS',
    photoType: 'PARTS_REPLACED',
    title: 'Step 3: Replacement Spare Parts',
    shortLabel: '3. Replacement Spares',
    subtitle: 'New unboxed OEM parts & spares ready for mounting',
    description: 'Capture the new OEM replacement spare parts with legible part numbers and packaging before installation.',
    required: true,
    sampleUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    defaultCaption: 'Genuine replacement parts unboxed for installation'
  },
  {
    stepNumber: 4,
    stageKey: 'REPAIRED_COMPLETE',
    photoType: 'AFTER_REPAIR',
    title: 'Step 4: Repaired & Complete Photo',
    shortLabel: '4. Repaired Complete',
    subtitle: 'Machine fully assembled, clean site & operational load test',
    description: 'Capture the finished installation, running spin cycle test, clean work area, and final operational status.',
    required: true,
    sampleUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
    defaultCaption: 'Repair complete, machine tested under operating load and clean site verified'
  }
];

interface JobCameraCaptureModalProps {
  job: ServiceJobCard;
  onClose: () => void;
  initialStepIndex?: number;
}

export const JobCameraCaptureModal: React.FC<JobCameraCaptureModalProps> = ({ 
  job, 
  onClose,
  initialStepIndex = 0 
}) => {
  const { addPhotoToJob, showNotification } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStepIndex);
  
  // Camera stream states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewCapturedImage, setPreviewCapturedImage] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentStep = JOB_PHOTO_STEPS[currentStepIndex];

  // Check which photos are already attached for each step
  const getPhotosForStep = (step: PhotoStepDef) => {
    return job.photos.filter(p => p.type === step.photoType);
  };

  const currentStepExistingPhotos = getPhotosForStep(currentStep);

  // Set default caption when step changes
  useEffect(() => {
    setCaptionInput(currentStep.defaultCaption);
    setPreviewCapturedImage(null);
  }, [currentStepIndex]);

  // Start / Stop camera stream
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported by browser. Please use the phone camera upload button.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access camera device. Please use phone camera file capture.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Toggle front / rear camera
  const toggleFacingMode = () => {
    const newFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(newFacing);
    if (isCameraActive) {
      startCamera(newFacing);
    }
  };

  // Capture frame from live video
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add watermark banner on image
    const now = new Date();
    const timestampStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Draw subtle bottom watermark bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvas.height - 48, canvas.width, 48);

    ctx.fillStyle = '#38bdf8'; // Sky-400
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`BUBBLE UP TRADING • ${job.jobCardNumber} • ${currentStep.shortLabel}`, 16, canvas.height - 26);

    ctx.fillStyle = '#cbd5e1'; // Slate-300
    ctx.font = '13px sans-serif';
    ctx.fillText(`${job.machineBrand} ${job.machineModel} | ${timestampStr}`, 16, canvas.height - 10);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle native phone camera file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewCapturedImage(dataUrl);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick sample photo for desktop testing
  const useSamplePhoto = () => {
    setPreviewCapturedImage(currentStep.sampleUrl);
    stopCamera();
  };

  // Save the captured photo to the Job Card
  const handleConfirmAndSavePhoto = () => {
    if (!previewCapturedImage) return;

    addPhotoToJob(job.id, {
      url: previewCapturedImage,
      caption: captionInput || currentStep.defaultCaption,
      type: currentStep.photoType
    });

    showNotification(`${currentStep.title} successfully attached to Job Card`);
    setPreviewCapturedImage(null);

    // If there is a next step, advance automatically
    if (currentStepIndex < JOB_PHOTO_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const completedStepsCount = JOB_PHOTO_STEPS.filter(s => getPhotosForStep(s).length > 0).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-700 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-none">Technician 1-by-1 Photo Audit</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {completedStepsCount} of {JOB_PHOTO_STEPS.length} Completed
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{job.jobCardNumber} — {job.customerName}</span>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-by-1 Step Progress Indicator */}
        <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {JOB_PHOTO_STEPS.map((step, idx) => {
              const photosCount = getPhotosForStep(step).length;
              const isDone = photosCount > 0;
              const isCurrent = currentStepIndex === idx;

              return (
                <button
                  key={step.stepNumber}
                  onClick={() => {
                    stopCamera();
                    setCurrentStepIndex(idx);
                  }}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isCurrent 
                      ? 'bg-sky-600/30 border-sky-500 text-white shadow-sm ring-1 ring-sky-500'
                      : isDone
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Step {step.stepNumber}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <span className="text-xs font-semibold block truncate leading-tight">
                    {step.shortLabel.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Guide Banner */}
        <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-700/60 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-sky-500 text-slate-950 font-mono">
                STAGE {currentStep.stepNumber} / 4
              </span>
              <h3 className="text-sm font-bold text-white">{currentStep.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentStep.description}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Wrench className="w-3.5 h-3.5 text-sky-400" />
            <span>{job.machineBrand} {job.machineModel}</span>
          </div>
        </div>

        {/* Modal Main Viewport Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CAMERA / PREVIEW / CAPTURE CONTAINER */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 min-h-[300px] flex flex-col items-center justify-center">
            
            {/* Live Camera Viewfinder */}
            {isCameraActive && !previewCapturedImage && (
              <div className="relative w-full h-[360px] sm:h-[400px] bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Crosshair / Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-sky-400/40 m-4 rounded-xl flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center text-[11px] font-mono text-sky-300 bg-slate-950/70 px-2.5 py-1 rounded backdrop-blur-xs w-fit">
                    <span>LIVE CAMERA • {cameraFacingMode.toUpperCase()}</span>
                  </div>
                  <div className="self-center text-center">
                    <div className="w-16 h-16 border-2 border-dashed border-sky-400/60 rounded-full mx-auto" />
                    <span className="text-[10px] text-sky-200 mt-1 block font-semibold drop-shadow-md">
                      Align {currentStep.shortLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-xs w-fit">
                    {job.jobCardNumber}
                  </div>
                </div>

                {/* Camera Top Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-md cursor-pointer"
                    title="Switch Front/Rear Camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-rose-400 border border-slate-700 shadow-md cursor-pointer"
                    title="Close Live Stream"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Live Shutter Bar */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="w-16 h-16 rounded-full bg-white hover:bg-sky-100 border-4 border-sky-500 shadow-xl flex items-center justify-center text-slate-900 transition-transform active:scale-95 cursor-pointer"
                    title="Snap Photo"
                  >
                    <div className="w-11 h-11 rounded-full bg-sky-600 flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Captured Photo Preview / Staging */}
            {previewCapturedImage && (
              <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                <img
                  src={previewCapturedImage}
                  alt="Captured frame"
                  className="w-full h-full object-contain"
                />

                {/* Staged Badge */}
                <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Photo Ready for {currentStep.shortLabel}</span>
                </div>

                {/* Retake button */}
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCapturedImage(null);
                      startCamera();
                    }}
                    className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold border border-slate-700 shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inactive Camera State / Selection Center */}
            {!isCameraActive && !previewCapturedImage && (
              <div className="p-6 sm:p-8 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-sky-400 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">Take {currentStep.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentStep.subtitle}
                  </p>
                </div>

                {cameraError && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Camera Launch Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  
                  {/* Option A: Start Live Camera Stream */}
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Phone Camera Stream</span>
                  </button>

                  {/* Option B: Native Device Camera / File picker */}
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>Camera Roll / Snap</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Option C: Quick Sample Demo */}
                  <button
                    type="button"
                    onClick={useSamplePhoto}
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Use sample reference image for quick testing"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto Sample</span>
                  </button>

                </div>
              </div>
            )}

          </div>

          {/* Caption & Metadata Input Form */}
          {previewCapturedImage && (
            <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Photo Notes / Description for {currentStep.shortLabel}:</span>
                <span className="text-[10px] text-slate-400 font-normal">Included in official Job Card</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder={`Describe ${currentStep.shortLabel.toLowerCase()}...`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleConfirmAndSavePhoto}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Photos Already Attached for this Step */}
          {currentStepExistingPhotos.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Attached Photos for {currentStep.shortLabel} ({currentStepExistingPhotos.length}):
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentStepExistingPhotos.map((photo) => (
                  <div key={photo.id} className="relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-24 sm:h-28 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2 bg-slate-900/90 text-xs">
                      <p className="text-[11px] text-slate-200 font-medium truncate">{photo.caption}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{photo.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-t border-slate-800 text-xs">
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={() => {
              stopCamera();
              setCurrentStepIndex(prev => Math.max(0, prev - 1));
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Step {currentStepIndex + 1} of {JOB_PHOTO_STEPS.length}
            </span>
          </div>

          {currentStepIndex < JOB_PHOTO_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setCurrentStepIndex(prev => Math.min(JOB_PHOTO_STEPS.length - 1, prev + 1));
              }}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
            >
              <span>Next: Step {currentStepIndex + 2}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish Photo Audit</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
