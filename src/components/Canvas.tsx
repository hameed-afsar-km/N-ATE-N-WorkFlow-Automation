'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, BackgroundVariant,
  NodeTypes, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { NODE_DEF_MAP } from '@/lib/nodeDefinitions';
import { NodeTypeId } from '@/types/workflow';
import FlowNodeComponent from '@/components/nodes/FlowNode';
import { FlowNode } from '@/types/workflow';

const nodeTypes: NodeTypes = { flowNode: FlowNodeComponent as never };

function CanvasInner() {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    selectNode, addNode,
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // ── Drag-and-drop from sidebar ──────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType') as NodeTypeId;
    if (!nodeType) return;
    const def = NODE_DEF_MAP[nodeType];
    if (!def) return;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(def, position);
  }, [screenToFlowPosition, addNode]);

  // ── Node click ──────────────────────────────────────────

  const onNodeClick = useCallback((_: React.MouseEvent, node: unknown) => {
    selectNode(node as FlowNode);
  }, [selectNode]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const isValidConnection = useCallback(
    (connection: import('@xyflow/react').Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;
      // In a real DAG, we would walk the edges to ensure no cycles.
      // For now, prevent immediate reverse connections A -> B -> A
      const hasReverse = edges.some(
        (e) => e.source === connection.target && e.target === connection.source
      );
      if (hasReverse) return false;
      return true;
    },
    [edges]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#6c63ff', strokeWidth: 2.5 },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(108,99,255,0.15)"
        />
        <Controls
          position="bottom-right"
          style={{ bottom: 100, right: 16 }}
        />
        <MiniMap
          position="bottom-right"
          style={{ bottom: 16, right: 16 }}
          nodeColor={(n) => {
            const data = n.data as { color?: string };
            return data?.color ?? '#6c63ff';
          }}
          maskColor="rgba(10,11,20,0.85)"
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="flex flex-col items-center gap-4 opacity-40">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(108,99,255,0.12)', border: '2px dashed rgba(108,99,255,0.3)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-white mb-1">Empty Canvas</p>
                <p className="text-sm" style={{ color: '#4a4e78' }}>Drag nodes from the sidebar or click a node to add it</p>
              </div>
            </div>
          </div>
        )}
      </ReactFlow>

      {/* Edge style injection for animated execution edges */}
      <style>{`
        .react-flow__edge-path {
          transition: stroke 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
