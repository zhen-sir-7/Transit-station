'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
  operatorOpen: boolean;
  onToggleOperator: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ChatInput({ onSend, isLoading, operatorOpen, onToggleOperator, inputRef }: Props) {
  const [text, setText] = useState('');
  const localRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef || localRef;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [text, textareaRef]);

  return (
    <div
      className="flex items-end gap-3"
      style={{
        borderTop: '1px solid #1F2833',
        padding: '16px 24px',
        background: '#0B0C10',
      }}
    >
      {/* Operator Toggle */}
      <button
        onClick={onToggleOperator}
        title="Toggle Operator View"
        data-demo-target="operator-toggle"
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 transition-all duration-200"
        style={{
          background: operatorOpen ? 'rgba(102, 252, 241, 0.1)' : 'transparent',
          color: operatorOpen ? '#66FCF1' : '#8A9199',
        }}
        onMouseEnter={(e) => {
          if (!operatorOpen) e.currentTarget.style.color = '#C5C6C7';
          e.currentTarget.style.background = operatorOpen ? 'rgba(102, 252, 241, 0.15)' : '#1F2833';
        }}
        onMouseLeave={(e) => {
          if (!operatorOpen) e.currentTarget.style.color = '#8A9199';
          e.currentTarget.style.background = operatorOpen ? 'rgba(102, 252, 241, 0.1)' : 'transparent';
        }}
      >
        <Terminal size={18} />
      </button>

      {/* Text Input */}
      <textarea
        ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isLoading}
        rows={1}
        data-demo-target="chat-input"
        className="flex-1 resize-none bg-arc-surface border border-arc-border text-arc-text placeholder-arc-text-secondary font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200"
        style={{
          padding: '12px 16px',
          minHeight: 44,
          lineHeight: 1.5,
        }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        data-demo-target="send-button"
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 transition-all duration-200"
        style={{
          background: text.trim() && !isLoading ? '#66FCF1' : '#2A3545',
          color: text.trim() && !isLoading ? '#0B0C10' : '#8A9199',
        }}
        onMouseEnter={(e) => {
          if (text.trim() && !isLoading) {
            e.currentTarget.style.background = '#45A29E';
          }
        }}
        onMouseLeave={(e) => {
          if (text.trim() && !isLoading) {
            e.currentTarget.style.background = '#66FCF1';
          }
        }}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
