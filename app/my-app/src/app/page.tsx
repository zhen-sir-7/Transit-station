'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatMessage, { TypingIndicator } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import OperatorPanel from '@/components/OperatorPanel';
import DemoGuide from '@/components/DemoGuide';
import ToastContainer from '@/components/ToastContainer';
import { ChatMessage as ChatMessageType, AuditRecord } from '@/types';
import { useToast } from '@/hooks/useToast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateId } from '@/lib/utils';

const DEFAULT_SYSTEM_PROMPT = `You are ARC, a privacy-focused AI assistant. You help users understand their data authorizations, audit logs, and privacy settings. You are concise, technical, and security-aware. Always format responses in a clear, structured manner.`;

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [demoState, setDemoState] = useLocalStorage<{ currentStep: number; completed: boolean }>('arc-demo-progress', {
    currentStep: 0,
    completed: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Store demo audit records for step 7
  const [demoAuditRecords] = useState<AuditRecord[]>([
    {
      id: 'AUTH_DEMO_1',
      userAddress: '0xDemo7F3aB12cD4E56F7890a1B2c3D4e5F6789A0b1C2d',
      resourceType: 'Identity',
      action: 'Read',
      authTime: '2026-04-18T09:32:17Z',
      status: 'Active',
    },
    {
      id: 'AUTH_DEMO_2',
      userAddress: '0xDemo2E8d4C56a7B8901c2D3e4F5a6B7c8D9e0F1a2B3c',
      resourceType: 'Financial',
      action: 'Write',
      authTime: '2026-04-17T14:22:08Z',
      status: 'Revoked',
      revokedAt: '2026-04-19T08:15:00Z',
    },
  ]);

  // Expose demo records for audit page
  useEffect(() => {
    if (demoAuditRecords.length > 0) {
      try {
        sessionStorage.setItem('arc-demo-records', JSON.stringify(demoAuditRecords));
      } catch {
        // ignore
      }
    }
  }, [demoAuditRecords]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const startTime = Date.now();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let aiContent = '';
        const aiMsgId = generateId();

        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = line.slice(2);
              aiContent += text;
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: aiContent } : m))
              );
            }
          }
        }

        const latency = Date.now() - startTime;
        const tokens = Math.ceil(aiContent.length / 4);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: aiContent,
                  metrics: {
                    tokens,
                    latency,
                    model: 'deepseek-chat',
                    timestamp: new Date().toISOString(),
                  },
                }
              : m
          )
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get response';
        // Fallback: simulate a demo response for static deployment
        const demoResponse = `[DEMO MODE] API server not available in static deployment.\n\nTo use the AI chat:\n1. Run 'npm run dev' or 'npm start' locally\n2. Set DEEPSEEK_API_KEY in .env.local\n3. Or deploy to a serverful platform (Vercel, etc.)\n\nYou asked: "${content}"\n\nThe audit dashboard is fully functional in this demo.`;
        const latency = Date.now() - startTime;
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content: demoResponse,
            timestamp: new Date().toISOString(),
            metrics: {
              tokens: Math.ceil(demoResponse.length / 4),
              latency,
              model: 'deepseek-chat (demo)',
              timestamp: new Date().toISOString(),
            },
          },
        ]);
        addToast('info', 'Running in demo mode - API not available in static export');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, systemPrompt, addToast]
  );

  const handleStartDemo = () => {
    setDemoState({ currentStep: 0, completed: false });
    setDemoActive(true);
  };

  const handleDemoComplete = () => {
    setDemoActive(false);
    setDemoState({ currentStep: 0, completed: true });
  };

  return (
    <div className="flex flex-row" style={{ height: 'calc(100vh - 56px)', marginTop: 56 }}>
      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 24px' }}>
          {messages.length === 0 && !isLoading ? (
            <div
              className="scanlines flex flex-col items-center justify-center h-full"
              style={{
                animation: 'fadeIn 0.8s ease-out 0.4s forwards',
                opacity: 0,
              }}
            >
              <h1
                className="font-mono font-bold text-arc-text text-center uppercase"
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  letterSpacing: '0.1em',
                }}
              >
                ARC PRIVACY INTERFACE
              </h1>
              <p className="text-sm text-arc-text-secondary text-center mt-2">
                Secure AI conversation with full data transparency
              </p>
              <button
                onClick={handleStartDemo}
                className="mt-6 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-arc-accent-secondary"
                style={{
                  background: '#66FCF1',
                  color: '#0B0C10',
                  border: 'none',
                }}
              >
                INITIALIZE DEMO SEQUENCE
              </button>
            </div>
          ) : (
            <div
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.3s forwards',
                opacity: 0,
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  data-demo-target={msg.role === 'assistant' ? 'ai-message' : undefined}
                  data-demo-ai-index={msg.role === 'assistant' ? index : undefined}
                >
                  <ChatMessage message={msg} />
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            animation: 'fadeInUp 0.5s ease-out 0.5s forwards',
            opacity: 0,
          }}
        >
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            operatorOpen={operatorOpen}
            onToggleOperator={() => setOperatorOpen(!operatorOpen)}
            inputRef={undefined}
          />
        </div>
      </div>

      {/* Operator View */}
      <div className="hidden lg:block">
        <OperatorPanel
          isOpen={operatorOpen}
          onClose={() => setOperatorOpen(false)}
          systemPrompt={systemPrompt}
          onUpdatePrompt={setSystemPrompt}
          messages={messages}
        />
      </div>

      {/* Mobile Operator View Overlay */}
      {operatorOpen && (
        <div className="lg:hidden fixed inset-0 z-40" style={{ marginTop: 56 }}>
          <OperatorPanel
            isOpen={operatorOpen}
            onClose={() => setOperatorOpen(false)}
            systemPrompt={systemPrompt}
            onUpdatePrompt={setSystemPrompt}
            messages={messages}
          />
        </div>
      )}

      {/* Demo Guide */}
      <DemoGuide
        isActive={demoActive}
        onComplete={handleDemoComplete}
        operatorOpen={operatorOpen}
        onOpenOperator={() => setOperatorOpen(true)}
        hasMessages={messages.length > 0}
      />

      {/* Nav audit link marker for demo */}
      <div data-demo-target="nav-audit" className="hidden" />

      {/* Audit table marker for demo */}
      <div data-demo-target="audit-table" className="hidden" />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
