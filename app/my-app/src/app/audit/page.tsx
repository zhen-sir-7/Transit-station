'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import FilterBar from '@/components/FilterBar';
import AuditTable from '@/components/AuditTable';
import RevokeDialog from '@/components/RevokeDialog';
import ToastContainer from '@/components/ToastContainer';
import { AuditRecord, AuditFilters, Toast } from '@/types';
import { getAuditLogs, revokeAuthorization } from '@/lib/auditSDK';
import { exportCSV } from '@/lib/utils';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function AuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    status: 'All',
    resourceTypes: [],
    dateFrom: '',
    dateTo: '',
  });
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exporting, setExporting] = useState(false);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 10);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load records
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAuditLogs(filters)
      .then((data) => {
        if (!cancelled) {
          setRecords(data);
          setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          addToast('error', err instanceof Error ? err.message : 'Failed to load records');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, addToast]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return records.slice(start, start + PAGE_SIZE);
  }, [records, page]);

  // Revoke handler
  const handleRevokeClick = (id: string) => {
    setRevokeTarget(id);
  };

  const handleRevokeConfirm = async (id: string) => {
    setRevokeTarget(null);
    try {
      const result = await revokeAuthorization(id);
      if (result.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: 'Revoked' as const, revokedAt: new Date().toISOString() }
              : r
          )
        );
        addToast('success', `Authorization ${id} has been revoked`);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to revoke');
    }
  };

  // Export handler
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportCSV(records);
      setExporting(false);
      addToast('success', `Exported ${records.length} records to CSV`);
    }, 300);
  };

  return (
    <div
      className="mx-auto px-4 md:px-6 lg:px-8"
      style={{ maxWidth: 1200, marginTop: 72, paddingBottom: 48 }}
    >
      {/* Header */}
      <div
        className="mb-6"
        style={{
          animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
          opacity: 0,
        }}
      >
        <h1
          className="font-mono font-bold text-arc-text uppercase"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '0.05em' }}
        >
          AUDIT DASHBOARD
        </h1>
        <p className="text-sm text-arc-text-secondary mt-1">
          Review and manage your data authorizations
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          animation: 'fadeInUp 0.5s ease-out 0.35s forwards',
          opacity: 0,
        }}
      >
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div
        data-demo-target="audit-table"
        className="mt-4"
        style={{
          animation: 'fadeIn 0.6s ease-out 0.5s forwards',
          opacity: 0,
        }}
      >
        <AuditTable records={pagedRecords} loading={loading} onRevoke={handleRevokeClick} />
      </div>

      {/* Footer */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1"
        style={{
          animation: 'fadeIn 0.6s ease-out 0.6s forwards',
          opacity: 0,
        }}
      >
        {/* Record count */}
        <div className="font-mono text-xs text-arc-text-secondary uppercase tracking-wider">
          SHOWING{' '}
          <span className="text-arc-accent">
            {records.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} - {Math.min(page * PAGE_SIZE, records.length)}
          </span>{' '}
          OF <span className="text-arc-accent">{records.length}</span> RECORDS
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exporting || records.length === 0}
          className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-arc-accent/10"
          style={{
            color: '#66FCF1',
            borderColor: '#66FCF1',
            background: 'transparent',
          }}
        >
          <Download size={14} />
          {exporting ? 'GENERATING...' : 'EXPORT_CSV'}
        </button>

        {/* Pagination */}
        {records.length > PAGE_SIZE && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-arc-surface-elevated"
              style={{ color: '#8A9199' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-arc-text-secondary uppercase">
              PAGE <span className="text-arc-accent">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-arc-surface-elevated"
              style={{ color: '#8A9199' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <RevokeDialog
        recordId={revokeTarget}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevokeTarget(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
