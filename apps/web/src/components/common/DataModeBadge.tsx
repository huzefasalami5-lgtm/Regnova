import React from 'react';
import { DataMode } from '../../types';

interface Props {
  mode: DataMode;
  className?: string;
}

export const DataModeBadge: React.FC<Props> = ({ mode, className = '' }) => {
  const getBadgeStyle = () => {
    switch (mode) {
      case 'LIVE_VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'HISTORICAL_REPLAY':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SYNTHETIC_DEMO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UNAVAILABLE':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'LIVE_VERIFIED':
        return '● LIVE / VERIFIED';
      case 'HISTORICAL_REPLAY':
        return '↺ HISTORICAL REPLAY';
      case 'SYNTHETIC_DEMO':
        return '⚡ SYNTHETIC DEMO';
      case 'UNAVAILABLE':
        return '✕ UNAVAILABLE';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider border ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
