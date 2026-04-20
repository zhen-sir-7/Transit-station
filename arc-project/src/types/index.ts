export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metrics?: MessageMetrics;
}

export interface MessageMetrics {
  tokens: number;
  latency: number;
  model: string;
  timestamp: string;
}

export interface AuditRecord {
  id: string;
  userAddress: string;
  resourceType: 'Identity' | 'Location' | 'Financial' | 'Health' | 'Behavioral' | 'Communications';
  action: 'Read' | 'Write' | 'Delete' | 'Admin';
  authTime: string;
  status: 'Active' | 'Revoked' | 'Expired' | 'Pending';
  revokedAt?: string;
}

export interface AuditFilters {
  status: 'All' | 'Active' | 'Revoked' | 'Expired' | 'Pending';
  resourceTypes: string[];
  dateFrom: string;
  dateTo: string;
}

export interface DemoStep {
  target: string;
  title: string;
  description: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
