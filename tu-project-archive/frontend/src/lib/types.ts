export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';
export type AcademicLevel = 'YEAR_3' | 'YEAR_5' | 'FINAL_YEAR' | 'OTHER';
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  adminScope?: string | null;
  createdAt: string;
}

export interface UniversityLite {
  id: string;
  name: string;
  shortName: string;
}
export interface DepartmentLite {
  id: string;
  name: string;
  code: string;
}
export interface University extends UniversityLite {
  city?: string | null;
  departments: DepartmentLite[];
}

export interface ProjectCard {
  id: string;
  title: string;
  year: number;
  level: AcademicLevel;
  abstract: string;
  keywords: string[];
  authorsText: string;
  supervisorName: string | null;
  priceMmk: number;
  status: ProjectStatus;
  hasFile: boolean;
  hasConsent?: boolean;
  /** One-sentence AI summary of the abstract (present only when AI is enabled). */
  aiSummary?: string | null;
  /** How many times the detail page has been viewed (popularity signal). */
  viewCount?: number;
  university: UniversityLite;
  department: DepartmentLite;
  createdAt: string;
  /** First gallery (or spin) image, used as the tile thumbnail. */
  coverImageUrl?: string | null;
  imageCount?: number;
  /** Ordered public gallery image URLs. */
  gallery?: string[];
  /** Ordered 360° turntable frame URLs. */
  spin?: string[];
  /** Short demo videos (Cloudinary-hosted). Only present on the detail view. */
  videos?: ProjectVideo[];
}

export interface ProjectImageSet {
  gallery: { id: string; url: string }[];
  spin: { id: string; url: string }[];
}

export interface ProjectVideo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string;
  durationSec?: number;
  format?: string;
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
}

export interface SimilarityHit {
  kind: 'EXACT' | 'SIMILAR';
  percent: number;
  breakdown: { score: number; trigram: number; token: number; edit: number };
  project: {
    id: string;
    title: string;
    year: number;
    level: string;
    abstract: string;
    university: UniversityLite;
    department: DepartmentLite;
    priceMmk: number;
    hasFile: boolean;
    status: string;
  };
}

export interface SearchResult {
  query: string;
  normalizedQuery: string;
  total: number;
  results: SimilarityHit[];
}

export interface DuplicateCheck {
  normalizedQuery: string;
  hasExactOrNearDuplicate: boolean;
  verdict: 'DUPLICATE_RISK' | 'SIMILAR_EXISTS' | 'LIKELY_UNIQUE';
  exact: SimilarityHit[];
  similar: SimilarityHit[];
}

export interface PaymentOrder {
  id: string;
  amountMmk: number;
  method: string;
  txnRef: string;
  status: PaymentStatus;
  reviewNote?: string | null;
  /** Whether the buyer uploaded a payment screenshot (admin proof review). */
  hasProof?: boolean;
  createdAt: string;
  project: { id: string; title: string; priceMmk?: number };
  user?: { id: string; name: string; email: string };
}

export interface Purchase {
  id: string;
  createdAt: string;
  project: { id: string; title: string; year: number; hasFile: boolean };
}

export interface TopicBucket {
  label: string;
  value: number;
}

export interface Bookmark {
  id: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    year: number;
    level: AcademicLevel;
    authorsText?: string;
    supervisorName?: string | null;
    priceMmk: number;
    hasFile: boolean;
    university: UniversityLite;
    department: DepartmentLite;
    coverImageUrl?: string | null;
  };
}

export interface AdminStats {
  projects: number;
  published: number;
  pendingPayments: number;
  users: number;
  purchases: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string | null;
  createdAt: string;
  actor?: { name: string; email: string } | null;
}

export interface SearchLogEntry {
  id: string;
  kind: 'SEARCH' | 'CHECK';
  rawQuery: string;
  normalizedQuery: string;
  resultCount: number;
  topScore?: number | null;
  verdict?: string | null;
  actorId?: string | null;
  ip?: string | null;
  createdAt: string;
}

export interface SearchAnalytics {
  recent: SearchLogEntry[];
  stats: { totalSearches: number; totalChecks: number; duplicateRisks: number };
}

export interface DashboardData {
  totals: {
    projects: number;
    published: number;
    pendingPayments: number;
    users: number;
    purchases: number;
    totalPageViews: number;
    totalSearches: number;
    totalChecks: number;
  };
  series: { date: string; views: number; uniques: number; searches: number; checks: number }[];
  byUniversity: { label: string; value: number }[];
  topPaths: { path: string; count: number }[];
}

// ── Public archive stats (/stats page) ───────────────────────────────────────
export interface PublicStats {
  totals: { projects: number; universities: number; departments: number; withFile: number };
  byYear: { label: string; value: number }[];
  byLevel: { label: string; value: number }[];
  byUniversity: { label: string; value: number }[];
  byDepartment: { label: string; value: number }[];
  topViewed: { id: string; title: string; year: number; viewCount: number; deptCode: string }[];
  generatedAt: string;
}

// ── Ratings & reviews ────────────────────────────────────────────────────────
export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
}
export interface ReviewSummary {
  average: number;
  count: number;
  distribution: number[]; // [1★,2★,3★,4★,5★]
  mine: { id: string; rating: number; comment: string; createdAt: string } | null;
  reviews: ReviewItem[];
}
