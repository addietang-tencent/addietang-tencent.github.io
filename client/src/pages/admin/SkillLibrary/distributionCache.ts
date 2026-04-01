/**
 * 下发状态缓存管理模块
 * 统一管理列表页和详情页的下发状态，数据持久化到 localStorage
 */
import { type DistributionStatus } from './types';

// ========== 缓存 Key ==========
const DISTRIBUTION_RECORDS_KEY = 'skillhub_distribution_records';

// ========== 类型定义 ==========
export interface CachedDistributionInstance {
  id: string;
  name: string;
  createdBy: string;
  distributionStatus: DistributionStatus;
}

export interface CachedDistributionRecord {
  id: string;
  skillId: string;
  timestamp: string; // ISO string，方便序列化
  totalCount: number;
  successCount: number;
  failedCount: number;
  inProgressCount: number;
  status: DistributionStatus;
  instances: CachedDistributionInstance[];
}

/** 每个 skill 的下发摘要（用于列表页展示） */
export interface SkillDistributionSummary {
  lastDistributionStatus: DistributionStatus;
  lastDistributionProgress: number;
  lastDistributionTime: string; // ISO string
  lastDistributionInstanceCount: number;
  lastDistributionSuccessCount: number;
  hasInProgress: boolean; // 是否有进行中的任务
}

// ========== 缓存读写 ==========

/** 获取所有下发记录 */
export function getAllDistributionRecords(): CachedDistributionRecord[] {
  try {
    const cached = localStorage.getItem(DISTRIBUTION_RECORDS_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('读取下发记录缓存失败:', e);
  }
  return [];
}

/** 获取某个 skill 的所有下发记录 */
export function getDistributionRecords(skillId: string): CachedDistributionRecord[] {
  return getAllDistributionRecords().filter(r => r.skillId === skillId);
}

/** 保存所有下发记录 */
function saveAllDistributionRecords(records: CachedDistributionRecord[]) {
  try {
    localStorage.setItem(DISTRIBUTION_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('保存下发记录缓存失败:', e);
  }
}

/** 添加一条下发记录 */
export function addDistributionRecord(record: CachedDistributionRecord) {
  const all = getAllDistributionRecords();
  all.unshift(record); // 新记录放前面
  saveAllDistributionRecords(all);
  // 触发 storage 事件，通知其他组件（同页面需要自定义事件）
  window.dispatchEvent(new CustomEvent('distribution-cache-updated'));
}

/** 更新一条下发记录 */
export function updateDistributionRecord(
  recordId: string,
  updater: (record: CachedDistributionRecord) => CachedDistributionRecord
) {
  const all = getAllDistributionRecords();
  const idx = all.findIndex(r => r.id === recordId);
  if (idx !== -1) {
    all[idx] = updater(all[idx]);
    saveAllDistributionRecords(all);
    window.dispatchEvent(new CustomEvent('distribution-cache-updated'));
  }
}

/** 获取某个 skill 的下发摘要（用于列表页） */
export function getSkillDistributionSummary(skillId: string): SkillDistributionSummary | null {
  const records = getDistributionRecords(skillId);
  if (records.length === 0) return null;

  // 最新一条记录
  const latest = records[0];
  const hasInProgress = records.some(r => r.status === 'distributing');

  const progress = latest.totalCount > 0
    ? Math.round((latest.successCount / latest.totalCount) * 100)
    : 0;

  return {
    lastDistributionStatus: latest.status,
    lastDistributionProgress: progress,
    lastDistributionTime: latest.timestamp,
    lastDistributionInstanceCount: latest.totalCount,
    lastDistributionSuccessCount: latest.successCount,
    hasInProgress,
  };
}

/** 检查某个 skill 是否有进行中的下发任务 */
export function hasInProgressDistribution(skillId: string): boolean {
  const records = getDistributionRecords(skillId);
  return records.some(r => r.status === 'distributing');
}

/** 创建一个新的下发记录 ID */
export function createDistributionRecordId(): string {
  return 'dist-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}
