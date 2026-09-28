import React from 'react';
import { Database } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<Props> = ({
  title = 'No Records Found',
  message = 'No data is currently available for this query or horizon.',
  action,
  className = '',
}) => {
  return (
    <div className={`p-8 bg-[#0D2233]/40 border border-dashed border-[#28475C] rounded-xl text-center space-y-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#12304A] text-[#42D9F5] flex items-center justify-center mx-auto">
        <Database className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5FAFF]">{title}</h3>
      <p className="text-xs text-[#A6BACD] max-w-sm mx-auto">{message}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
