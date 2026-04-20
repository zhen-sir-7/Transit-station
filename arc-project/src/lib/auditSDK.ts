import { AuditRecord, AuditFilters } from '@/types';

const MOCK_DATA: AuditRecord[] = [
  {
    id: 'AUTH_7F3A9B',
    userAddress: '0x7F3aB12cD4E56F7890a1B2c3D4e5F6789A0b1C2d',
    resourceType: 'Identity',
    action: 'Read',
    authTime: '2026-04-18T09:32:17Z',
    status: 'Active',
  },
  {
    id: 'AUTH_2E8D4C',
    userAddress: '0x2E8d4C56a7B8901c2D3e4F5a6B7c8D9e0F1a2B3c',
    resourceType: 'Financial',
    action: 'Write',
    authTime: '2026-04-17T14:22:08Z',
    status: 'Active',
  },
  {
    id: 'AUTH_9A1B3D',
    userAddress: '0x9A1b3D45e6F7890a1B2c3D4e5F6789A0b1C2d3E4',
    resourceType: 'Location',
    action: 'Read',
    authTime: '2026-04-15T11:05:33Z',
    status: 'Revoked',
    revokedAt: '2026-04-19T08:15:00Z',
  },
  {
    id: 'AUTH_4C6E8F',
    userAddress: '0x4C6e8F12a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8',
    resourceType: 'Health',
    action: 'Admin',
    authTime: '2026-04-12T16:45:21Z',
    status: 'Active',
  },
  {
    id: 'AUTH_1D5F7A',
    userAddress: '0x1D5f7A89b0C1d2E3f4A5b6C7d8E9f0A1b2C3d4E5',
    resourceType: 'Behavioral',
    action: 'Read',
    authTime: '2026-04-10T08:12:55Z',
    status: 'Expired',
  },
  {
    id: 'AUTH_6B2C4E',
    userAddress: '0x6B2c4E56f7A8901b2C3d4E5f6A7b8C9d0E1f2A3b4',
    resourceType: 'Communications',
    action: 'Delete',
    authTime: '2026-04-08T19:28:47Z',
    status: 'Active',
  },
  {
    id: 'AUTH_3E9A5B',
    userAddress: '0x3E9a5B67c8D9012e3F4a5B6c7D8e9F0a1B2c3D4e5',
    resourceType: 'Identity',
    action: 'Write',
    authTime: '2026-04-05T13:18:39Z',
    status: 'Pending',
  },
  {
    id: 'AUTH_8F1D3A',
    userAddress: '0x8F1d3A45b6C7d8E9f0A1b2C3d4E5f6A7b8C9d0E1f',
    resourceType: 'Financial',
    action: 'Read',
    authTime: '2026-04-03T07:55:12Z',
    status: 'Active',
  },
  {
    id: 'AUTH_5C7E9D',
    userAddress: '0x5C7e9D12f3A4b5C6d7E8f9A0b1C2d3E4f5A6b7C8d',
    resourceType: 'Location',
    action: 'Admin',
    authTime: '2026-03-28T22:41:06Z',
    status: 'Revoked',
    revokedAt: '2026-04-16T10:30:00Z',
  },
  {
    id: 'AUTH_2A4B6C',
    userAddress: '0x2A4b6C78d9E0f1A2b3C4d5E6f7A8b9C0d1E2f3A4b',
    resourceType: 'Health',
    action: 'Write',
    authTime: '2026-03-25T15:33:29Z',
    status: 'Active',
  },
  {
    id: 'AUTH_7D9E1F',
    userAddress: '0x7D9e1F23a4B5c6D7e8F9a0B1c2D3e4F5a6B7c8D9e',
    resourceType: 'Behavioral',
    action: 'Read',
    authTime: '2026-03-20T09:17:58Z',
    status: 'Expired',
  },
  {
    id: 'AUTH_4F8A2B',
    userAddress: '0x4F8a2Bc3D4e5F6789A0b1C2d3E4f5A6b7C8d9E0f1',
    resourceType: 'Communications',
    action: 'Read',
    authTime: '2026-03-15T18:49:44Z',
    status: 'Active',
  },
];

export async function getAuditLogs(filters?: Partial<AuditFilters>): Promise<AuditRecord[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  let results = [...MOCK_DATA];

  if (filters) {
    if (filters.status && filters.status !== 'All') {
      results = results.filter((r) => r.status === filters.status);
    }

    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      results = results.filter((r) => filters.resourceTypes!.includes(r.resourceType));
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      results = results.filter((r) => new Date(r.authTime) >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      results = results.filter((r) => new Date(r.authTime) <= to);
    }
  }

  return results.sort((a, b) => new Date(b.authTime).getTime() - new Date(a.authTime).getTime());
}

export async function revokeAuthorization(id: string): Promise<{ success: boolean; record: AuditRecord }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  const record = MOCK_DATA.find((r) => r.id === id);
  if (!record) {
    throw new Error(`Authorization ${id} not found`);
  }

  if (record.status === 'Revoked') {
    throw new Error(`Authorization ${id} is already revoked`);
  }

  record.status = 'Revoked';
  record.revokedAt = new Date().toISOString();

  return { success: true, record };
}
