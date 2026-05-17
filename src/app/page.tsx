'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import ConfigPanel from '@/components/ConfigPanel';
import ToastContainer from '@/components/ToastContainer';
import { useWorkflowStore } from '@/store/workflowStore';

// Canvas uses ReactFlow which needs client-only rendering
const Canvas = dynamic(() => import('@/components/Canvas'), { ssr: false });

export default function Home() {
  const { loadWorkflows, loadOllamaModels } = useWorkflowStore();

  useEffect(() => {
    loadWorkflows();
    loadOllamaModels();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar */}
        <Sidebar />

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden">
          <Canvas />
        </main>

        {/* Right config panel */}
        <ConfigPanel />
      </div>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
