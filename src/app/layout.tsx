import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowMind — Visual Workflow Automation',
  description: 'Build powerful AI automation workflows with drag-and-drop. Powered by LangGraph, LangChain, and Ollama for local LLM orchestration.',
  keywords: ['workflow automation', 'AI', 'LangGraph', 'Ollama', 'no-code', 'LLM'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
