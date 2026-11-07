import axios from 'axios';
import {
  AuthResponse,
  User,
  BrandKit,
  BrandRule,
  ContentSubmission,
  Finding,
  ApprovalRequest,
  Comment,
  GovernanceInsights,
  RewriteOption,
  VisualAuditResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('brandlens_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  demoLogin: async (role: 'CREATOR' | 'REVIEWER' | 'ADMIN' = 'CREATOR'): Promise<AuthResponse> => {
    const res = await api.post(`/auth/demo-login?role=${role}`);
    return res.data;
  },
  register: async (userData: any): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('brandlens_token');
    localStorage.removeItem('brandlens_user');
  }
};

export const brandKitService = {
  getAll: async (): Promise<BrandKit[]> => {
    const res = await api.get('/brand-kits');
    return res.data;
  },
  getById: async (id: string): Promise<BrandKit> => {
    const res = await api.get(`/brand-kits/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<BrandKit>): Promise<BrandKit> => {
    const res = await api.put(`/brand-kits/${id}`, data);
    return res.data;
  },
  addRule: async (id: string, rule: any): Promise<BrandRule> => {
    const res = await api.post(`/brand-kits/${id}/rules`, rule);
    return res.data;
  },
  addFact: async (id: string, fact: any) => {
    const res = await api.post(`/brand-kits/${id}/facts`, fact);
    return res.data;
  },
  addClaim: async (id: string, claim: any) => {
    const res = await api.post(`/brand-kits/${id}/claims`, claim);
    return res.data;
  },
  uploadDocument: async (id: string, formData: FormData) => {
    const res = await api.post(`/brand-kits/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  generateFromUrl: async (url: string, applyToKitId?: string) => {
    const res = await api.post('/brand-kits/generate-from-url', {
      url,
      apply_to_kit_id: applyToKitId
    });
    return res.data;
  }
};

export const contentService = {
  list: async (channel?: string, statusFilter?: string): Promise<ContentSubmission[]> => {
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (statusFilter) params.append('status_filter', statusFilter);
    const res = await api.get(`/content?${params.toString()}`);
    return res.data;
  },
  getById: async (id: string): Promise<ContentSubmission> => {
    const res = await api.get(`/content/${id}`);
    return res.data;
  },
  upload: async (formData: FormData): Promise<ContentSubmission> => {
    const res = await api.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  runReview: async (id: string): Promise<ContentSubmission> => {
    const res = await api.post(`/content/review/${id}`);
    return res.data;
  },
  getRewrites: async (text: string, brand_kit_id?: string): Promise<Record<string, RewriteOption>> => {
    const res = await api.post('/content/rewrite', { text, brand_kit_id });
    return res.data.options;
  },
  submitApproval: async (id: string, notes?: string) => {
    const res = await api.post(`/content/${id}/submit-approval`, { notes });
    return res.data;
  }
};

export const findingsService = {
  accept: async (id: string): Promise<Finding> => {
    const res = await api.post(`/findings/${id}/accept`);
    return res.data;
  },
  edit: async (id: string, custom_fix: string, reason?: string): Promise<Finding> => {
    const res = await api.post(`/findings/${id}/edit`, { action_type: 'EDIT', custom_fix, reason });
    return res.data;
  },
  dismiss: async (id: string, reason: string): Promise<Finding> => {
    const res = await api.post(`/findings/${id}/dismiss`, { action_type: 'DISMISS', reason });
    return res.data;
  },
  dispute: async (id: string, reason: string): Promise<Finding> => {
    const res = await api.post(`/findings/${id}/dispute`, { action_type: 'DISPUTE', reason });
    return res.data;
  }
};

export const approvalService = {
  getPending: async (): Promise<ApprovalRequest[]> => {
    const res = await api.get('/approvals/pending');
    return res.data;
  },
  approve: async (id: string, reason: string, comments?: string): Promise<ApprovalRequest> => {
    const res = await api.post(`/approvals/${id}/approve`, {
      decision: 'APPROVED',
      decision_reason: reason,
      comments
    });
    return res.data;
  },
  reject: async (id: string, reason: string, comments?: string): Promise<ApprovalRequest> => {
    const res = await api.post(`/approvals/${id}/reject`, {
      decision: 'REJECTED',
      decision_reason: reason,
      comments
    });
    return res.data;
  },
  requestChanges: async (id: string, reason: string, comments?: string): Promise<ApprovalRequest> => {
    const res = await api.post(`/approvals/${id}/request-changes`, {
      decision: 'CHANGES_REQUESTED',
      decision_reason: reason,
      comments
    });
    return res.data;
  },
  getComments: async (submissionId: string): Promise<Comment[]> => {
    const res = await api.get(`/approvals/${submissionId}/comments`);
    return res.data;
  },
  addComment: async (submissionId: string, comment_text: string, comment_type: string = 'review_note'): Promise<Comment> => {
    const res = await api.post(`/approvals/${submissionId}/comments`, { comment_text, comment_type });
    return res.data;
  }
};

export const insightsService = {
  getOverview: async (): Promise<GovernanceInsights> => {
    const res = await api.get('/insights/overview');
    return res.data;
  }
};

export const visualService = {
  check: async (textColor: string, bgColor: string, imageFile?: File): Promise<VisualAuditResult> => {
    const formData = new FormData();
    formData.append('text_color', textColor);
    formData.append('background_color', bgColor);
    if (imageFile) {
      formData.append('file', imageFile);
    }
    const res = await api.post('/visual/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export const auditService = {
  getLogs: async (limit: number = 50, action?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (action) params.append('action', action);
    const res = await api.get(`/audit-logs?${params.toString()}`);
    return res.data;
  }
};

