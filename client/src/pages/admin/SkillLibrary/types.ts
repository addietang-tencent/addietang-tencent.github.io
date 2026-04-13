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
  failed:          { label: '下发失败', color: 'text-red-700 bg-red-50' },
};

/** 版本历史记录 */
export interface SkillVersionRecord {
  version: string;
  date: string; // ISO 日期字符串
  changeLog?: string;
  files?: Array<{ name: string; size: number; content?: string }>;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
  /** 应用范围：public=全部用户，private=按分组 */
  scope: SkillScope;
  /** 当 scope=private 时，关联的分组 ID 列表 */
  groupIds: string[];
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
  /** 版本历史记录 */
  versionHistory?: SkillVersionRecord[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

/** 分组（Group） */
export interface Group {
  id: string;
  name: string;
  description?: string;
}

/** 应用范围类型 */
export type SkillScope = 'public' | 'private';

/** 实例运行状态 */
export type InstanceStatus = 'running' | 'stopped' | 'starting' | 'error';

/** 实例运行状态显示映射 */
export const INSTANCE_STATUS_MAP: Record<InstanceStatus, { label: string; color: string }> = {
  running:  { label: '运行中', color: 'text-green-700 bg-green-50' },
  stopped:  { label: '已停止', color: 'text-gray-500 bg-gray-50' },
  starting: { label: '启动中', color: 'text-blue-600 bg-blue-50' },
  error:    { label: '异常', color: 'text-red-700 bg-red-50' },
};

export interface OpenClawInstance {
  id: string;
  name: string;
  createdBy: string;
  status: InstanceStatus;
  createdAt: string; // ISO 日期字符串
  distributionStatus?: DistributionStatus;
  /** 已下发的版本号（用于判断"待更新"状态） */
  distributedVersion?: string;
  /** 所属分组 ID 列表（可能属于多个分组） */
  groupIds: string[];
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
