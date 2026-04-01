/**
 * 统一下发状态枚举
 * - not_distributed: 未下发
 * - distributing: 下发中
 * - success: 下发完成
 * - failed: 下发失败
 */
export type DistributionStatus = 'not_distributed' | 'distributing' | 'success' | 'failed';

/** 下发状态显示映射 */
export const DISTRIBUTION_STATUS_MAP: Record<DistributionStatus, { label: string; color: string }> = {
  not_distributed: { label: '未下发', color: 'text-gray-500 bg-gray-50' },
  distributing:    { label: '下发中', color: 'text-blue-600 bg-blue-50' },
  success:         { label: '成功', color: 'text-green-700 bg-green-50' },
  failed:          { label: '失败', color: 'text-red-700 bg-red-50' },
};

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
  versions?: string[];
  files?: Array<{ name: string; size: number; content?: string }>;
  lastDistributionStatus?: DistributionStatus;
  lastDistributionProgress?: number; // 0-100
  lastDistributionTime?: Date;
  lastDistributionInstanceCount?: number;
  lastDistributionSuccessCount?: number;
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
  distributionStatus?: DistributionStatus;
}

export interface DistributionRecord {
  id: string;
  skillId: string;
  timestamp: Date;
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: DistributionStatus;
  instances: OpenClawInstance[];
}

export interface BucketInfo {
  name: string;
  region: string;
  storageGB: number;
}
