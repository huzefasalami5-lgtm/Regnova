import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<Props> = ({
  message = 'Loading meteorological data...',
  className = '',
}) => {
  return (
    <div className={`w-full min-h-[260px] flex flex-col items-center justify-center space-y-3 bg-[#0D2233]/40 rounded-xl border border-[#28475C] p-6 text-center ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-[#12304A] border-t-[#42D9F5] animate-spin" />
        <Loader2 className="w-5 h-5 text-[#42D9F5] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-xs text-[#A6BACD] font-medium tracking-wide">{message}</p>
    </div>
  );
};
