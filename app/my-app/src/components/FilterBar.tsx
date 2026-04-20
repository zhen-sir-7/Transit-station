'use client';

import { AuditFilters } from '@/types';
import { ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const RESOURCE_TYPES = ['Identity', 'Location', 'Financial', 'Health', 'Behavioral', 'Communications'];
const STATUSES = ['All', 'Active', 'Revoked', 'Expired', 'Pending'] as const;

interface Props {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleReset = () => {
    onChange({
      status: 'All',
      resourceTypes: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  const toggleResourceType = (type: string) => {
    const next = filters.resourceTypes.includes(type)
      ? filters.resourceTypes.filter((t) => t !== type)
      : [...filters.resourceTypes, type];
    onChange({ ...filters, resourceTypes: next });
  };

  const selectedResourceLabel =
    filters.resourceTypes.length === 0
      ? 'All Types'
      : filters.resourceTypes.length === 1
        ? filters.resourceTypes[0]
        : `${filters.resourceTypes.length} Selected`;

  return (
    <div
      className="flex flex-wrap items-start gap-3"
      style={{
        background: '#1F2833',
        border: '1px solid #1F2833',
        padding: 16,
      }}
    >
      {/* Status Filter */}
      <div>
        <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-1">
          STATUS
        </label>
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as AuditFilters['status'] })}
            className="appearance-none bg-arc-surface border border-arc-border text-arc-text font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200 pr-8 cursor-pointer"
            style={{ padding: '8px 12px', width: 160 }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-arc-accent"
          />
        </div>
      </div>

      {/* Resource Type Multi-select */}
      <div ref={dropdownRef}>
        <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-1">
          RESOURCE_TYPE
        </label>
        <button
          onClick={() => setResourceDropdownOpen(!resourceDropdownOpen)}
          className="flex items-center justify-between bg-arc-surface border border-arc-border text-arc-text font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200 cursor-pointer"
          style={{ padding: '8px 12px', width: 160 }}
        >
          <span>{selectedResourceLabel}</span>
          <ChevronDown size={14} className="text-arc-accent" />
        </button>
        {resourceDropdownOpen && (
          <div
            className="absolute z-20 mt-1"
            style={{
              background: '#1F2833',
              border: '1px solid #2A3545',
              padding: '8px 12px',
              maxHeight: 200,
              overflowY: 'auto',
              minWidth: 180,
            }}
          >
            {RESOURCE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-arc-accent transition-colors"
                style={{ fontSize: '0.8125rem', color: '#C5C6C7' }}
              >
                <input
                  type="checkbox"
                  checked={filters.resourceTypes.includes(type)}
                  onChange={() => toggleResourceType(type)}
                  className="w-4 h-4 accent-arc-accent"
                />
                <span className="font-mono uppercase text-xs tracking-wider">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div>
        <label className="block font-mono text-xs text-arc-text-secondary uppercase tracking-wider mb-1">
          DATE_RANGE
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="bg-arc-surface border border-arc-border text-arc-text font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200"
            style={{ padding: '7px 10px', width: 140 }}
          />
          <span className="text-arc-text-secondary text-sm">→</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="bg-arc-surface border border-arc-border text-arc-text font-mono text-sm focus:border-arc-accent outline-none transition-colors duration-200"
            style={{ padding: '7px 10px', width: 140 }}
          />
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider border transition-all duration-200 hover:bg-arc-accent/10"
          style={{
            color: '#66FCF1',
            borderColor: '#66FCF1',
            background: 'transparent',
          }}
        >
          <X size={12} />
          RESET
        </button>
      </div>
    </div>
  );
}
