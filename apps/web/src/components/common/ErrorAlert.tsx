import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<Props> = ({
  title = 'API Communication Error',
  message = 'Failed to retrieve real-time meteorological post-processing data from backend server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl text-xs space-y-2.5 ${className}`}>
      <div className="flex items-center space-x-2 text-[#F07178] font-bold text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-[#A6BACD] leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#12304A] hover:bg-[#19384B] border border-[#28475C] text-[#F5FAFF] font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#42D9F5]" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
