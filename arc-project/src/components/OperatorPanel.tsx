'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ChatMessage } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onUpdatePrompt: (prompt: string) => void;
  messages: ChatMessage[];
}

export default function OperatorPanel({ isOpen, onClose, systemPrompt, onUpdatePrompt, messages }: Props) {
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const metrics = lastAiMessage?.metrics;

  const handleUpdate = () => {
    onUpdatePrompt(localPrompt);
  };

  const handleCopyJSON = () => {
    if (!lastAiMessage) return;
    const data = {
      message: lastAiMessage,
      metrics,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <aside
      data-demo-target="operator-panel"
      className="scanlines flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: 320,
        background: '#0B0C10',
        borderLeft: '1px solid #1F2833',
        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          background: '#1F2833',
          height: 48,
          padding: '0 16px',
          borderBottom: '1px solid #0B0C10',
        }}
      >
        <span className="font-mono text-sm font-semibold text-arc-accent tracking-[0.05em] uppercase">
          OPERATOR_VIEW
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 text-arc-text-secondary hover:text-arc-text hover:bg-arc-surface-elevated transition-all duration-200"
          aria-label="Close operator view"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
        {/* System Prompt */}
        <div style={{ marginBottom: 24 }}>
          <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-2">
            SYSTEM_PROMPT
          </label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="w-full resize-vertical bg-arc-surface border border-arc-border text-arc-text font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200"
            style={{
              padding: 12,
              minHeight: 120,
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={handleUpdate}
            className="mt-2 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-accent/10"
            style={{
              color: '#66FCF1',
              borderColor: '#66FCF1',
              background: 'transparent',
            }}
          >
            UPDATE
          </button>
        </div>

        {/* Message Metrics */}
        {metrics && (
          <div style={{ marginBottom: 24 }}>
            <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-2">
              LAST_MESSAGE_METRICS
            </label>
            <div
              className="font-mono text-sm"
              style={{
                background: '#1F2833',
                border: '1px solid #1F2833',
                padding: 12,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '4px 12px',
              }}
            >
              <span className="text-arc-text-secondary text-right">TOKENS:</span>
              <span className="text-arc-accent">{metrics.tokens}</span>
              <span className="text-arc-text-secondary text-right">LATENCY:</span>
              <span className="text-arc-accent">{metrics.latency}ms</span>
              <span className="text-arc-text-secondary text-right">MODEL:</span>
              <span className="text-arc-text">{metrics.model}</span>
              <span className="text-arc-text-secondary text-right">TIMESTAMP:</span>
              <span className="text-arc-text">{formatDate(metrics.timestamp)}</span>
            </div>
          </div>
        )}

        {/* JSON Copy */}
        {lastAiMessage && (
          <div>
            <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-2">
              RAW_RESPONSE
            </label>
            <div
              className="overflow-auto font-mono"
              style={{
                background: '#1F2833',
                border: '1px solid #1F2833',
                maxHeight: 200,
                padding: 12,
                fontSize: '0.75rem',
                lineHeight: 1.5,
              }}
            >
              <JSONDisplay data={{ message: lastAiMessage, metrics }} />
            </div>
            <button
              onClick={handleCopyJSON}
              className="mt-2 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-accent/10"
              style={{
                color: copyState === 'copied' ? '#4CAF50' : '#66FCF1',
                borderColor: copyState === 'copied' ? '#4CAF50' : '#66FCF1',
                background: 'transparent',
              }}
            >
              {copyState === 'copied' ? (
                <span className="flex items-center gap-1">
                  <Check size={12} /> COPIED
                </span>
              ) : (
                'COPY_JSON'
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function JSONDisplay({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre className="whitespace-pre-wrap break-all">
      {json.split('\n').map((line, i) => (
        <div key={i}>
          {line.split(/(".*?"|:|\d+|true|false|null)/).filter(Boolean).map((part, j) => {
            const trimmed = part.trim();
            if (trimmed === '' && part.startsWith('  ')) {
              return <span key={j}>{part}</span>;
            }
            if (/^".*?"$/.test(trimmed)) {
              return <span key={j} style={{ color: '#66FCF1' }}>{part}</span>;
            }
            if (trimmed === ':') {
              return <span key={j} style={{ color: '#8A9199' }}>{part}</span>;
            }
            if (/^\d+$/.test(trimmed)) {
              return <span key={j} style={{ color: '#45A29E' }}>{part}</span>;
            }
            if (['true', 'false', 'null'].includes(trimmed)) {
              return <span key={j} style={{ color: '#8A9199' }}>{part}</span>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      ))}
    </pre>
  );
}
