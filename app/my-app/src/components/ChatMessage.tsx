'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={'group flex ' + (isUser ? 'justify-end' : 'justify-start')}
      style={{
        animation: `fadeInUp 0.3s ease-out`,
      }}
    >
      <div
        className={'relative ' + (isUser ? 'ml-auto' : 'mr-auto')}
        style={{
          maxWidth: isUser ? '60%' : '75%',
          background: isUser ? '#2A3F54' : '#1F2833',
          borderLeft: `2px solid ${isUser ? '#4A90D9' : '#66FCF1'}`,
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <p
          className="text-arc-text whitespace-pre-wrap break-words"
          style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
        >
          {message.content}
        </p>
        <div
          className="text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ fontSize: '0.75rem', color: '#8A9199', marginTop: 4 }}
        >
          {formatDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        style={{
          maxWidth: '75%',
          background: '#1F2833',
          borderLeft: '2px solid #66FCF1',
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <span className="font-mono text-sm" style={{ color: '#8A9199' }}>
          <span className="typing-dot-1 inline-block">.</span>
          <span className="typing-dot-2 inline-block">.</span>
          <span className="typing-dot-3 inline-block">.</span>
        </span>
      </div>
    </div>
  );
}
