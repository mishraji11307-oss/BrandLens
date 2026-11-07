export type UserRole = 'ADMIN' | 'CREATOR' | 'REVIEWER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  org_id?: string;
  org_name?: string;
  is_demo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface BrandRule {
  id: string;
  brand_kit_id: string;
  rule_code: string;
  category: 'terminology' | 'tone' | 'claims' | 'disclaimer' | 'accessibility';
  title: string;
  description: string;
  rule_type: string;
  prohibited_term?: string;
  preferred_term?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: string;
  suggested_fix?: string;
  evidence_citation?: string;
  is_active: boolean;
}

export interface ApprovedFact {
  id: string;
  brand_kit_id: string;
  fact_code: string;
  name: string;
  approved_value: string;
  supporting_source?: string;
  effective_date?: string;
  expiry_date?: string;
  status: string;
}

export interface ApprovedClaim {
  id: string;
  brand_kit_id: string;
  claim_code: string;
  approved_statement: string;
  conditions?: string;
  supporting_evidence?: string;
  source_document?: string;
  applicable_product?: string;
  status: string;
}

export interface BrandAsset {
  id: string;
  brand_kit_id: string;
  asset_type: string;
  name: string;
  value?: string;
  file_path?: string;
  metadata_json?: any;
}

export interface BrandKit {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  industry?: string;
  target_audience?: string;
  brand_personality?: string;
  writing_style?: string;
  is_default: boolean;
  rules: BrandRule[];
  approved_facts: ApprovedFact[];
  approved_claims: ApprovedClaim[];
  assets: BrandAsset[];
}

export interface Finding {
  id: string;
  submission_id: string;
  rule_id?: string;
  category: 'terminology' | 'tone' | 'claims' | 'disclaimer' | 'accessibility' | 'visual';
  title: string;
  description: string;
  original_text: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  explanation: string;
  source_document?: string;
  source_section?: string;
  source_page?: number;
  rule_code?: string;
  evidence_text?: string;
  suggested_fix?: string;
  custom_fix?: string;
  status: 'open' | 'accepted' | 'edited' | 'dismissed' | 'disputed';
  action_reason?: string;
  detection_layer: 'deterministic' | 'ai_contextual';
}

export interface ComplianceDeduction {
  title: string;
  severity: string;
  status: string;
  points_deducted: number;
  reason: string;
}

export interface ComplianceScoreDetails {
  score: number;
  status: string;
  color: string;
  base_score: number;
  total_penalty: number;
  total_findings: number;
  unresolved_count: number;
  critical_unresolved: number;
  high_unresolved: number;
  accepted_count: number;
  dismissed_count: number;
  is_capped: boolean;
  explanation: string;
  deductions: ComplianceDeduction[];
}

export interface ContentSubmission {
  id: string;
  org_id: string;
  brand_kit_id: string;
  creator_id: string;
  title: string;
  campaign_name?: string;
  content_category: string;
  publishing_channel: string;
  original_text: string;
  working_text: string;
  status: 'Draft' | 'Reviewing' | 'Changes Requested' | 'Resubmitted' | 'Pending Approval' | 'Approved' | 'Rejected';
  compliance_score: number;
  compliance_details?: ComplianceScoreDetails;
  current_revision_number: number;
  created_at: string;
  updated_at: string;
  findings: Finding[];
}

export interface ApprovalRequest {
  id: string;
  submission_id: string;
  submission_title?: string;
  creator_name?: string;
  requested_by_id: string;
  reviewed_by_id?: string;
  revision_number: number;
  status: string;
  decision?: string;
  decision_reason?: string;
  creator_notes?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  submission_id: string;
  author_id: string;
  author_name?: string;
  comment_text: string;
  comment_type: string;
  created_at: string;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'recommendation' | 'rule_dispute' | 'campaign_alert';
  title: string;
  message: string;
  action_prompt: string;
  severity: string;
}

export interface GovernanceInsights {
  total_submissions: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  critical_violations_caught: number;
  average_compliance_score: number;
  category_distribution: Record<string, number>;
  severity_distribution: Record<string, number>;
  weekly_activity: Array<{ day: string; submissions: number; violations: number; approved: number }>;
  most_violated_rules: Array<{ rule_code: string; title: string; violations: number }>;
  smart_insights: SmartInsight[];
}

export interface RewriteOption {
  title: string;
  text: string;
  explanation: string;
}

export interface ContrastAnalysis {
  ratio: number;
  aa_normal_pass: boolean;
  aa_large_pass: boolean;
  aaa_normal_pass: boolean;
  status: string;
  feedback: string;
}

export interface VisualAuditResult {
  is_compliant: boolean;
  dominant_colors: Array<{ hex: string; percentage: number; name?: string }>;
  contrast_analysis: ContrastAnalysis;
  findings: Array<{
    type: string;
    severity: string;
    title: string;
    expected: string;
    actual: string;
    confidence: number;
    suggestion: string;
  }>;
}

