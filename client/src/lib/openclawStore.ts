/**
 * agentStore - Agent 实例数据共享 store
 * 使用 localStorage 在 MyAgent 与 AgentDetail 之间同步数据（含 roleName 等动态字段）。
 */

import { MOCK_OPENCLAW_LIST } from "./mockData";

const STORAGE_KEY = "openclaw_list";

export interface AgentItem {
  id: string;
  instanceId: string;
  name: string;
  status: string;
  agentType?: "openclaw" | "hermes" | "lightclawace";
  createdAt: string;
  model: string;
  modelVersion: string;
  channels: any[];
  skills: any[];
  op?: string;
  roleName?: string;
  memoryStatus?: 'none' | 'free' | 'pro';
  groupId?: string;
  groupName?: string;
}

/** 从 localStorage 读取列表，首次使用 MOCK 数据初始化 */
export function loadClawList(): AgentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AgentItem[];
  } catch {
    // ignore
  }
  // 首次：用 mock 数据初始化
  const initial = MOCK_OPENCLAW_LIST as unknown as AgentItem[];
  saveClawList(initial);
  return initial;
}

/** 保存列表到 localStorage */
export function saveClawList(list: AgentItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** 根据 id 查询单个 claw */
export function findClawById(id: string): AgentItem | undefined {
  const list = loadClawList();
  return list.find((c) => c.id === id);
}

// 事件通知机制：当列表变更时通知订阅者
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function onClawListChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyClawListChange() {
  listeners.forEach((fn) => fn());
}
