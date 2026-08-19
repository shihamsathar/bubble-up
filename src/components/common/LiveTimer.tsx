import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, CheckCircle2, Timer } from 'lucide-react';

interface LiveTimerProps {
  startTime?: string;
  endTime?: string;
  isRunning?: boolean;
  pausedDurationMinutes?: number;
  label?: string;
  variant?: 'duty' | 'job' | 'compact' | 'badge' | 'large';
  className?: string;
  showIcon?: boolean;
}

/**
 * Calculates elapsed seconds between a start ISO string and now (or end ISO string).
 */
export function getElapsedSeconds(startTime?: string, endTime?: string): number {
  if (!startTime) return 0;
  const startMs = new Date(startTime).getTime();
  if (isNaN(startMs)) return 0;

  const endMs = endTime ? new Date(endTime).getTime() : Date.now();
  const diffMs = Math.max(0, endMs - startMs);
  return Math.floor(diffMs / 1000);
}

/**
 * Formats total seconds into HH:MM:SS string
 */
export function formatHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats seconds into readable "Xh Ym Zs" or "Xm Ys"
 */
export function formatReadableDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Live duration hook that updates every second if running
 */
export function useLiveTimer(startTime?: string, endTime?: string, isRunning: boolean = true) {
  const [seconds, setSeconds] = useState<number>(() => getElapsedSeconds(startTime, endTime));

  useEffect(() => {
    // Initial calculation
    setSeconds(getElapsedSeconds(startTime, endTime));

    if (!isRunning || endTime || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds(startTime, endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, isRunning]);

  return {
    seconds,
    minutes: Math.floor(seconds / 60),
    formattedHMS: formatHMS(seconds),
    formattedReadable: formatReadableDuration(seconds)
  };
}

export const LiveTimer: React.FC<LiveTimerProps> = ({
  startTime,
  endTime,
  isRunning = true,
  label,
  variant = 'badge',
  className = '',
  showIcon = true
}) => {
  const { seconds, formattedHMS, formattedReadable } = useLiveTimer(startTime, endTime, isRunning);

  if (!startTime) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-400 text-xs font-mono ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-slate-300" />}
        <span>00:00</span>
      </span>
    );
  }

  const isCompleted = !!endTime;

  // Variant: LARGE STOPWATCH (for Job Execution Modal & Shift Headings)
  if (variant === 'large') {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
        isRunning && !isCompleted
          ? 'bg-slate-900 text-white border-slate-700 shadow-md'
          : 'bg-slate-100 text-slate-800 border-slate-300'
      } ${className}`}>
        {label && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
            {isRunning && !isCompleted && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
            {label}
          </span>
        )}
        <div className="flex items-center gap-2">
          {showIcon && <Timer className={`w-5 h-5 ${isRunning && !isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />}
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight">
            {formattedHMS}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
          {isRunning && !isCompleted ? 'Active live timer' : isCompleted ? 'Logged duration' : 'Paused'}
        </span>
      </div>
    );
  }

  // Variant: DUTY SHIFT TIMER (Next to Technician name & assigned vehicle in Admin Dashboard)
  if (variant === 'duty') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono ${
        isRunning && !isCompleted
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-xs'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      } ${className}`}>
        {showIcon && (
          <span className="relative flex h-2 w-2">
            {isRunning && !isCompleted && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning && !isCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </span>
        )}
        <div className="flex flex-col text-left">
          {label && <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-emerald-400 leading-none mb-0.5">{label}</span>}
          <span className="text-xs font-bold font-mono tracking-tight leading-none text-white">
            {formattedHMS}
          </span>
        </div>
      </div>
    );
  }

  // Variant: JOB WORK TIMER (Next to technician and job card)
  if (variant === 'job') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
        isRunning && !isCompleted
          ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold'
          : isCompleted
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      } ${className}`}>
        {showIcon && (
          <span className="relative flex h-2 w-2 shrink-0">
            {isRunning && !isCompleted && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isRunning && !isCompleted ? 'bg-sky-500' : isCompleted ? 'bg-emerald-500' : 'bg-slate-400'
            }`}></span>
          </span>
        )}
        <span>{formattedHMS}</span>
      </div>
    );
  }

  // Variant: COMPACT / BADGE
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${
      isRunning && !isCompleted ? 'text-sky-700' : 'text-slate-600'
    } ${className}`}>
      {showIcon && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {isRunning && !isCompleted && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isRunning && !isCompleted ? 'bg-sky-500' : 'bg-slate-400'
          }`}></span>
        </span>
      )}
      <span>{formattedHMS}</span>
    </span>
  );
};
