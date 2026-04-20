'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DemoStep } from '@/types';

const STEPS: DemoStep[] = [
  {
    target: 'chat-input',
    title: 'Send a Message',
    description: 'Type your question here and press Enter to start a secure conversation with the AI.',
  },
  {
    target: 'send-button',
    title: 'Submit Your Query',
    description: 'Click the send button or press Enter to transmit your message securely.',
  },
  {
    target: 'ai-message',
    title: 'AI Response',
    description: 'The AI processes your request and returns a response. All data is handled securely.',
  },
  {
    target: 'operator-toggle',
    title: 'Debug Panel',
    description: 'Toggle the Operator View to inspect system prompts, token usage, and raw API responses.',
  },
  {
    target: 'operator-panel',
    title: 'System Prompts & Metrics',
    description: 'View and edit the system prompt. Monitor token consumption, latency, and model parameters.',
  },
  {
    target: 'nav-audit',
    title: 'Audit Dashboard',
    description: 'Navigate to the Audit Dashboard to review and manage all your data authorizations.',
  },
  {
    target: 'audit-table',
    title: 'Authorization Records',
    description: 'View all authorization records. Filter by status, resource type, or date range. Revoke access when needed.',
  },
];

interface Props {
  isActive: boolean;
  onComplete: () => void;
  operatorOpen: boolean;
  onOpenOperator: () => void;
  hasMessages: boolean;
}

export default function DemoGuide({ isActive, onComplete, operatorOpen, onOpenOperator, hasMessages }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<'bottom' | 'top' | 'left'>('bottom');

  const currentStep = STEPS[step];

  const findTarget = useCallback((targetId: string): HTMLElement | null => {
    if (targetId === 'operator-panel' && !operatorOpen) return null;
    return document.querySelector(`[data-demo-target="${targetId}"]`) as HTMLElement | null;
  }, [operatorOpen]);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Auto-open operator panel for steps 4-5
    if ((step === 3 || step === 4) && !operatorOpen) {
      onOpenOperator();
    }

    const attemptFind = () => {
      const el = findTarget(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setHighlightRect(rect);

        // Determine tooltip position
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 200 && spaceAbove > 200) {
          setTooltipPos('top');
        } else if (rect.right > window.innerWidth - 350) {
          setTooltipPos('left');
        } else {
          setTooltipPos('bottom');
        }
      }
    };

    // Retry a few times for dynamic elements
    attemptFind();
    const timers = [100, 300, 500].map((ms) => setTimeout(attemptFind, ms));

    const handleResize = () => attemptFind();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isActive, step, currentStep, findTarget, operatorOpen, onOpenOperator]);

  const handleNext = () => {
    if (step === 5) {
      // Navigate to audit page before showing step 7
      router.push('/audit');
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('arc-demo-progress', JSON.stringify({ currentStep: step, completed: true }));
    } catch {
      // ignore
    }
    onComplete();
  };

  if (!isActive || !currentStep) return null;

  const tooltipTop =
    tooltipPos === 'bottom'
      ? (highlightRect?.bottom ?? 0) + 16
      : tooltipPos === 'top'
        ? (highlightRect?.top ?? 0) - 16
        : (highlightRect?.top ?? 0);

  const tooltipLeft =
    tooltipPos === 'left'
      ? (highlightRect?.left ?? 0) - 340
      : Math.min(
          highlightRect?.left ?? 0,
          window.innerWidth - 340
        );

  const tooltipTransform = tooltipPos === 'top' ? 'translateY(-100%)' : 'none';

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ background: 'rgba(11, 12, 16, 0.85)' }}
    >
      {/* Highlight box */}
      {highlightRect && (
        <div
          className="guide-highlight fixed pointer-events-none"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            border: '2px solid #66FCF1',
            zIndex: 101,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[102] font-mono"
        style={{
          top: tooltipTop,
          left: Math.max(16, tooltipLeft),
          transform: tooltipTransform,
          background: '#1F2833',
          border: '1px solid #66FCF1',
          padding: 20,
          maxWidth: 320,
          width: 'calc(100vw - 32px)',
        }}
      >
        {/* Step indicator */}
        <div className="text-xs text-arc-accent uppercase tracking-[0.1em] mb-2">
          STEP {step + 1}/7
        </div>

        {/* Title */}
        <div className="text-base font-semibold text-arc-text-heading mb-2">
          {currentStep.title}
        </div>

        {/* Description */}
        <p className="text-sm text-arc-text leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={handleSkip}
            className="text-xs text-arc-text-secondary hover:text-arc-text transition-colors uppercase tracking-wider"
          >
            SKIP
          </button>
          <div className="flex-1" />
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-arc-accent/10"
            style={{ color: '#66FCF1', borderColor: '#66FCF1', background: 'transparent' }}
          >
            PREV
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-accent/10"
            style={{ color: '#0B0C10', borderColor: '#66FCF1', background: '#66FCF1' }}
          >
            {step === STEPS.length - 1 ? 'COMPLETE' : 'NEXT'}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="transition-all duration-200"
              style={{
                width: 8,
                height: 8,
                background:
                  i < step ? '#66FCF1' : i === step ? '#45A29E' : '#1F2833',
                border:
                  i === step
                    ? '1px solid #66FCF1'
                    : i > step
                      ? '1px solid #8A9199'
                      : '1px solid #66FCF1',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
