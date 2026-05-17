'use client';

import React, { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useWorkflowStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const cfg = {
          success: { icon: <CheckCircle2 size={15} />, color: '#00e5a0', bg: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.3)' },
          error:   { icon: <XCircle size={15} />,      color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)',  border: 'rgba(255,77,109,0.3)' },
          info:    { icon: <Info size={15} />,          color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.3)' },
          warning: { icon: <AlertTriangle size={15} />, color: '#ffb547', bg: 'rgba(255,181,71,0.1)',  border: 'rgba(255,181,71,0.3)' },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 px-4 py-3 rounded-2xl pointer-events-auto animate-fade-up"
            style={{
              background: `${cfg.bg}`,
              border: `1px solid ${cfg.border}`,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: 260,
              maxWidth: 360,
            }}
          >
            <span style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">{toast.title}</div>
              {toast.message && <div className="text-[11px] mt-0.5 truncate" style={{ color: '#8b8fb3' }}>{toast.message}</div>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 rounded flex-shrink-0" style={{ color: '#4a4e78' }}>
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
