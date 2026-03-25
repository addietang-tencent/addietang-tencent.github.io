export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
  uploadTime: Date;
  content?: string;
  fileContent?: string;
  files?: Array<{ name: string; size: number }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface OpenClawInstance {
  id: string;
  name: string;
  createdBy: string;
  status?: 'success' | 'failed' | 'pending';
}

export interface DistributionRecord {
  id: string;
  skillId: string;
  timestamp: Date;
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: 'completed' | 'partial' | 'in_progress';
  instances: OpenClawInstance[];
}

export interface BucketInfo {
  name: string;
  region: string;
  storageGB: number;
}
