export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  profile_completion: number;
  state?: string;
  district?: string;
  college?: string;
  university?: string;
  course?: string;
  branch?: string;
  semester?: number;
  cgpa?: number;
  category?: string;
  religion?: string;
  is_minority: boolean;
  family_income?: number;
  has_disability: boolean;
  has_sports_quota: boolean;
  has_ncc: boolean;
  gender?: string;
  dob?: string;
  phone?: string;
  address?: string;
  profile_photo?: string;
  created_at: string;
}

export interface Scholarship {
  id: number;
  title: string;
  provider: string;
  provider_type: 'government' | 'private';
  amount?: number;
  amount_description?: string;
  last_date?: string;
  description?: string;
  official_website?: string;
  status: 'active' | 'inactive' | 'expired';
  min_cgpa?: number;
  max_income?: number;
  eligible_states?: string[];
  eligible_courses?: string[];
  eligible_categories?: string[];
  eligible_gender?: string;
  minority_only: boolean;
  disability_only: boolean;
  sports_quota: boolean;
  ncc_required: boolean;
  required_documents?: string[];
  created_at: string;
  updated_at: string;
  eligibility_status?: 'eligible' | 'partial' | 'not_eligible';
  eligibility_reasons?: string[];
  missing_documents?: string[];
  is_saved?: boolean;
  application_status?: string;
}

export interface Application {
  id: number;
  user_id: number;
  scholarship_id: number;
  status: 'draft' | 'submitted' | 'verified' | 'rejected' | 'approved' | 'completed';
  notes?: string;
  admin_remarks?: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  scholarship?: {
    id: number;
    title: string;
    provider: string;
    amount?: number;
    last_date?: string;
    provider_type: string;
  };
}

export interface Document {
  id: number;
  user_id: number;
  doc_type: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  is_expired: boolean;
  expiry_date?: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notif_type: 'info' | 'deadline' | 'document' | 'application' | 'scholarship';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AnalyticsStats {
  total_users: number;
  total_scholarships: number;
  govt_scholarships: number;
  private_scholarships: number;
  total_applications: number;
  pending_documents: number;
  verified_documents: number;
  rejected_documents: number;
  application_status_breakdown: Record<string, number>;
  popular_scholarships: { title: string; provider: string; applications: number }[];
  state_wise_users: { state: string; count: number }[];
  recent_users: { id: number; name: string; email: string; joined: string }[];
}

export type EligibilityStatus = 'eligible' | 'partial' | 'not_eligible';

export interface ScholarshipFilters {
  search?: string;
  state?: string;
  course?: string;
  category?: string;
  gender?: string;
  provider_type?: string;
  eligible_only?: boolean;
  saved_only?: boolean;
  deadlines_only?: boolean;
  sort_by?: string;
  order?: string;
}

export const DOCUMENT_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card' },
  { key: 'pan', label: 'PAN Card' },
  { key: 'income_certificate', label: 'Income Certificate' },
  { key: 'caste_certificate', label: 'Caste Certificate' },
  { key: 'bonafide', label: 'Bonafide Certificate' },
  { key: 'marks_card', label: 'Marks Card / Transcript' },
  { key: 'transfer_certificate', label: 'Transfer Certificate' },
  { key: 'passport_photo', label: 'Passport Photo' },
  { key: 'bank_passbook', label: 'Bank Passbook' },
] as const;

export type DocType = typeof DOCUMENT_TYPES[number]['key'];
