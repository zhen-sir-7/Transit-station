'use client';

interface Props {
  recordId: string | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

export default function RevokeDialog({ recordId, onConfirm, onCancel }: Props) {
  if (!recordId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(11, 12, 16, 0.8)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="font-mono w-full"
        style={{
          background: '#1F2833',
          border: '1px solid #66FCF1',
          padding: 24,
          maxWidth: 400,
          margin: '0 16px',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <h3 className="text-base font-semibold text-arc-text-heading uppercase tracking-wider">
          CONFIRM_REVOKE
        </h3>
        <p className="text-sm text-arc-text leading-relaxed mt-3">
          Are you sure you want to revoke authorization{' '}
          <span className="text-arc-accent font-mono">{recordId}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-accent/10"
            style={{ color: '#66FCF1', borderColor: '#66FCF1', background: 'transparent' }}
          >
            CANCEL
          </button>
          <button
            onClick={() => onConfirm(recordId)}
            className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-danger/10"
            style={{ color: '#F44336', borderColor: '#F44336', background: 'transparent' }}
          >
            REVOKE
          </button>
        </div>
      </div>
    </div>
  );
}
