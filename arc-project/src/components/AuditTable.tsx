'use client';

import { AuditRecord } from '@/types';
import { formatDate, truncateAddress } from '@/lib/utils';

interface Props {
  records: AuditRecord[];
  loading: boolean;
  onRevoke: (id: string) => void;
}

const RESOURCE_COLORS: Record<string, string> = {
  Identity: '#66FCF1',
  Location: '#45A29E',
  Financial: '#4CAF50',
  Health: '#FF9800',
  Behavioral: '#9C27B0',
  Communications: '#2196F3',
};

const STATUS_ICONS: Record<string, string> = {
  Active: '●',
  Revoked: '✕',
  Expired: '○',
  Pending: '◐',
};

const STATUS_COLORS: Record<string, string> = {
  Active: '#4CAF50',
  Revoked: '#F44336',
  Expired: '#8A9199',
  Pending: '#FF9800',
};

export default function AuditTable({ records, loading, onRevoke }: Props) {
  if (loading) {
    return (
      <div style={{ background: '#1F2833', border: '1px solid #1F2833', overflowX: 'auto' }}>
        <table className="w-full" style={{ minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#0B0C10' }}>
              {['ID', 'USER_ADDRESS', 'RESOURCE_TYPE', 'ACTION', 'AUTH_TIME', 'STATUS', 'ACTIONS'].map((h) => (
                <th
                  key={h}
                  className="text-left font-mono text-xs font-semibold text-arc-text-secondary uppercase tracking-wider"
                  style={{ padding: '12px 16px', borderBottom: '2px solid #2A3545' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#1F2833' : '#252F3D' }}>
                {[
                  { w: 60 }, { w: 80 }, { w: 50 }, { w: 40 }, { w: 100 }, { w: 50 }, { w: 50 },
                ].map((c, j) => (
                  <td key={j} style={{ padding: '12px 16px' }}>
                    <div className="skeleton-bar" style={{ width: c.w }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          background: '#1F2833',
          border: '1px solid #1F2833',
          padding: '48px 24px',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8A9199" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="8" x2="14" y2="14" />
          <line x1="14" y1="8" x2="8" y2="14" />
        </svg>
        <p className="font-mono text-sm text-arc-text-secondary uppercase tracking-wider mt-3">
          NO_RECORDS_FOUND
        </p>
        <p className="text-sm text-arc-text-secondary mt-1">
          Try adjusting your filter criteria
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#1F2833', border: '1px solid #1F2833', overflowX: 'auto' }}>
      <table className="w-full" style={{ minWidth: 700 }}>
        <thead>
          <tr style={{ background: '#0B0C10' }}>
            {['ID', 'USER_ADDRESS', 'RESOURCE_TYPE', 'ACTION', 'AUTH_TIME', 'STATUS', 'ACTIONS'].map((h) => (
              <th
                key={h}
                className="text-left font-mono text-xs font-semibold text-arc-text-secondary uppercase tracking-wider select-none"
                style={{ padding: '12px 16px', borderBottom: '2px solid #2A3545' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const resColor = RESOURCE_COLORS[record.resourceType] || '#8A9199';
            const statusColor = STATUS_COLORS[record.status] || '#8A9199';
            const isRevoked = record.status === 'Revoked';

            return (
              <tr
                key={record.id}
                className="transition-colors duration-150 hover:bg-arc-surface-active cursor-default"
                style={{
                  background: index % 2 === 0 ? '#1F2833' : '#252F3D',
                  borderBottom: '1px solid #0B0C10',
                  animation: `fadeIn 0.15s ease-out ${index * 0.05}s forwards`,
                  opacity: 0,
                }}
              >
                <td className="font-mono text-sm text-arc-text" style={{ padding: '12px 16px' }}>
                  {truncateAddress(record.id, 8, 0)}
                </td>
                <td className="font-mono text-sm text-arc-text" style={{ padding: '12px 16px' }}>
                  {truncateAddress(record.userAddress, 6, 4)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    className="inline-block font-mono text-xs uppercase"
                    style={{
                      padding: '2px 8px',
                      borderLeft: `2px solid ${resColor}`,
                      background: `${resColor}1A`,
                      color: resColor,
                    }}
                  >
                    {record.resourceType}
                  </span>
                </td>
                <td className="font-mono text-sm text-arc-text uppercase" style={{ padding: '12px 16px' }}>
                  {record.action}
                </td>
                <td className="font-mono text-sm text-arc-text" style={{ padding: '12px 16px' }}>
                  {formatDate(record.authTime)}
                </td>
                <td className="text-center" style={{ padding: '12px 16px' }}>
                  <span
                    className="font-mono text-xs uppercase inline-flex items-center gap-1"
                    style={{
                      color: statusColor,
                      textDecoration: isRevoked ? 'line-through' : 'none',
                    }}
                  >
                    <span>{STATUS_ICONS[record.status]}</span>
                    {record.status}
                  </span>
                </td>
                <td className="text-center" style={{ padding: '12px 16px' }}>
                  {isRevoked ? (
                    <button
                      disabled
                      className="px-3 py-1 font-mono text-xs uppercase tracking-wider border cursor-not-allowed"
                      style={{
                        color: '#8A9199',
                        borderColor: '#8A9199',
                        background: 'transparent',
                      }}
                    >
                      REVOKED
                    </button>
                  ) : (
                    <button
                      onClick={() => onRevoke(record.id)}
                      className="px-3 py-1 font-mono text-xs uppercase tracking-wider border transition-all duration-200 hover:bg-arc-danger/10 active:scale-95"
                      style={{
                        color: '#F44336',
                        borderColor: '#F44336',
                        background: 'transparent',
                      }}
                    >
                      REVOKE
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
