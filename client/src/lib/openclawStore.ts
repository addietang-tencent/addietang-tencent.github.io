/**
 * agentStore - Agent 实例数据共享 store
 * 使用 localStorage 在 MyAgent 与 AgentDetail 之间同步数据（含 roleName 等动态字段）。
 */

import { MOCK_OPENCLAW_LIST } from "./mockData";

const STORAGE_KEY = "openclaw_list";

// [006] 分页验证用：URL 带 ?_pagingDemo=1 时，自动把 15 条 mock 扩到 80 条，方便验证分页控件
function maybeExpandForPagingDemo(list: AgentItem[]): AgentItem[] {
  if (typeof window === "undefined") return list;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("_pagingDemo") !== "1") return list;
  } catch {
    return list;
  }
  // 复制 5 份（15 * 5 = 75 条），给每条 id / instanceId / name 加后缀避免冲突
  const expanded: AgentItem[] = [];
  for (let copy = 1; copy <= 5; copy++) {
    list.forEach((item, idx) => {
      expanded.push({
        ...item,
        id: copy === 1 ? item.id : `${item.id}-copy${copy}`,
        instanceId: copy === 1 ? item.instanceId : `${item.instanceId}-c${copy}`,
        name: copy === 1 ? item.name : `${item.name} #${copy}`,
        // 时间依次往前递推，保证排序有变化
        createdAt: `2026-03-${String(20 - copy).padStart(2, "0")} ${String(10 + idx).padStart(2, "0")}:00:00`,
      });
    });
  }
  return expanded;
}

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
  // [006] 分页验证模式：每次都以扩展后的 mock 为准（忽略 localStorage 缓存），避免旧数据干扰
  if (typeof window !== "undefined") {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("_pagingDemo") === "1") {
        const expanded = maybeExpandForPagingDemo(MOCK_OPENCLAW_LIST as unknown as AgentItem[]);
        saveClawList(expanded);
        return expanded;
      }
    } catch {
      // ignore
    }
  }
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
