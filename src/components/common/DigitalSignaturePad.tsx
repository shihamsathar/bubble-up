import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool, Eraser, Sparkles, X } from 'lucide-react';

interface DigitalSignaturePadProps {
  title?: string;
  signeeName?: string;
  signeeRole?: string;
  initialSignature?: string;
  onSave: (signatureDataUrl: string, signeeName: string) => void;
  onCancel?: () => void;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  title = 'Digital Signature Pad',
  signeeName: defaultSigneeName = '',
  signeeRole = 'Customer Representative',
  initialSignature,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [name, setName] = useState(defaultSigneeName);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [inkColor, setInkColor] = useState('#0f172a'); // Deep slate/black ink
  const [penSize, setPenSize] = useState(2.5);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context to match CSS pixels
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penSize;

    // If there is an initial signature image, draw it
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  };

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penSize;
  }, [inkColor, penSize]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state for undo
    const dpr = window.devicePixelRatio || 1;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-10), currentState]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStrokeHistory([]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));
    if (strokeHistory.length <= 1) {
      setHasDrawn(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Export clean PNG
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, name.trim());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-lg w-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <span className="text-[11px] text-slate-400">Sign directly using touch finger, stylus pen, or mouse</span>
          </div>
        </div>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Signer Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {signeeRole} Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter full name of ${signeeRole.toLowerCase()}...`}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Signature Pad Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Sign in the box below:</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                Touch / Stylus / Mouse
              </span>
            </span>

            {/* Quick ink options */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInkColor('#0f172a')}
                className={`w-4 h-4 rounded-full bg-slate-900 border ${inkColor === '#0f172a' ? 'ring-2 ring-sky-500' : ''}`}
                title="Black/Charcoal Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor('#1e40af')}
                className={`w-4 h-4 rounded-full bg-blue-800 border ${inkColor === '#1e40af' ? 'ring-2 ring-sky-500' : ''}`}
                title="Royal Blue Ink"
              />
            </div>
          </div>

          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/60 overflow-hidden touch-none select-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair bg-transparent block"
              style={{ touchAction: 'none' }}
            />

            {/* Signature Baseline Guide */}
            <div className="absolute left-6 right-6 bottom-8 border-b border-slate-300/80 pointer-events-none flex items-center justify-between text-[10px] text-slate-400 select-none">
              <span className="font-serif italic">✕ Sign on the line</span>
              <span>Electronic Signature</span>
            </div>

            {!hasDrawn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1 opacity-70">
                <PenTool className="w-6 h-6 stroke-1" />
                <span className="text-xs font-medium">Draw signature here with finger or stylus</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeHistory.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasDrawn}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 disabled:opacity-40 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasDrawn || !name.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Confirm Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
