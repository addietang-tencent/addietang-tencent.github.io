/**
 * modelConfigStore.ts
 * 管控端「模型配置」共享状态存储
 * 与 customChannelStore 同款模式：localStorage 持久化 + window 事件广播。
 *
 * 用于在管控端"模型配置"页与"Agent 列表 / 抽屉"页之间共享同一份模型数据。
 */

import { useEffect, useState, useCallback } from "react";

/** 自定义模型在 ModelRow.provider 上的占位值 */
export const CUSTOM_PROVIDER_VALUE = "__custom__";

export interface ModelRow {
  id: string;
  /** 厂商名（如"腾讯云 DeepSeek" / "自定义模型" / "OpenAI GPT-4o"） */
  name: string;
  /** 版本名（如"DeepSeek V3 0324"） */
  version: string;
  modelUrl: string;
  visible: boolean;
  isDefault: boolean;
  dailyLimit: number;
  /** 厂商标识，对应 AVAILABLE_MODELS.value；自定义模型为 __custom__ */
  provider: string;
  /** 该厂商可用的版本列表（非自定义模型才有意义） */
  versions: string[];
  isMultimodal?: boolean;
  /** 应用范围：全部用户 / 按分组 */
  visibilityScope: "all" | "groups";
  /** 按分组时选中的分组 id */
  visibilityGroupIds: string[];
}

// ─── 默认数据 ────────────────────────────────────────────────────────────────
// 与原 ModelConfig.tsx 的 MOCK_MODELS 保持一致，确保首次进入页面体验不变。

export const DEFAULT_ADMIN_MODELS: ModelRow[] = [
  {
    id: "1", name: "腾讯云 DeepSeek", version: "DeepSeek V3 0324",
    modelUrl: "https://api.lkeap.cloud.tencent.com/v1", visible: true, isDefault: true, isMultimodal: false, dailyLimit: 500000,
    provider: "tencent-deepseek",
    versions: ["DeepSeek V3 0324", "DeepSeek R1", "DeepSeek V2.5"],
    visibilityScope: "all", visibilityGroupIds: [],
  },
  {
    id: "2", name: "腾讯云混元", version: "混元 TurboS Latest",
    modelUrl: "https://hunyuan.tencentcloudapi.com", visible: true, isDefault: false, isMultimodal: false, dailyLimit: 200000,
    provider: "tencent-hunyuan",
    versions: ["混元 TurboS Latest", "混元 Pro", "混元 Standard"],
    visibilityScope: "groups",
    visibilityGroupIds: ["dept-tech", "dept-fe", "og-ai-core"],
  },
  {
    id: "3", name: "腾讯云 DeepSeek", version: "DeepSeek R1",
    modelUrl: "https://api.lkeap.cloud.tencent.com/v1", visible: false, isDefault: false, isMultimodal: false, dailyLimit: 100000,
    provider: "tencent-deepseek",
    versions: ["DeepSeek V3 0324", "DeepSeek R1", "DeepSeek V2.5"],
    visibilityScope: "all", visibilityGroupIds: [],
  },
  {
    id: "4", name: "OpenAI GPT-4o", version: "GPT-4o 2024-05-13",
    modelUrl: "https://api.openai.com/v1", visible: true, isDefault: false, isMultimodal: true, dailyLimit: 300000,
    provider: CUSTOM_PROVIDER_VALUE,
    versions: [],
    visibilityScope: "groups",
    visibilityGroupIds: ["dept-ai", "og-ai-core"],
  },
];

// ─── 存储 & 广播 ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "openclaw_admin_models";
const CHANGE_EVENT = "openclaw_admin_models_changed";

/** 读取所有模型；首次访问时用默认数据初始化 */
export function loadAdminModels(): ModelRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_ADMIN_MODELS];
    const parsed = JSON.parse(raw) as ModelRow[];
    if (!Array.isArray(parsed)) return [...DEFAULT_ADMIN_MODELS];
    return parsed;
  } catch {
    return [...DEFAULT_ADMIN_MODELS];
  }
}

/** 保存所有模型并广播变更 */
export function saveAdminModels(models: ModelRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch {
    // 静默忽略（如 quota exceed），demo 场景下不应阻塞 UI
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** 监听模型变更（同页面 + 跨页面） */
export function onAdminModelsChange(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT, handler);
  // 跨标签页同步：localStorage 在其他标签页修改时只触发 storage 事件
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

// ─── React Hook ──────────────────────────────────────────────────────────────

/**
 * Hook：作为 useState<ModelRow[]> 的替代品。
 * setter 自动 save + broadcast；同时订阅其他来源的变更并 sync 到本地 state。
 *
 * 用法：
 *   const [models, setModels] = useAdminModelsState();
 */
export function useAdminModelsState(): [ModelRow[], (next: ModelRow[] | ((prev: ModelRow[]) => ModelRow[])) => void] {
  const [models, setModelsState] = useState<ModelRow[]>(() => loadAdminModels());

  // 订阅外部变更（如另一个页面/组件改了 store）
  useEffect(() => {
    return onAdminModelsChange(() => {
      setModelsState(loadAdminModels());
    });
  }, []);

  const setModels = useCallback((next: ModelRow[] | ((prev: ModelRow[]) => ModelRow[])) => {
    setModelsState(prev => {
      const resolved = typeof next === "function" ? (next as (p: ModelRow[]) => ModelRow[])(prev) : next;
      saveAdminModels(resolved);
      return resolved;
    });
  }, []);

  return [models, setModels];
}

/**
 * Hook：只读订阅模型列表，自动响应变更。
 * 适合 Agent 抽屉这类只消费、不修改的场景。
 */
export function useAdminModels(): ModelRow[] {
  const [models, setModels] = useState<ModelRow[]>(() => loadAdminModels());
  useEffect(() => {
    return onAdminModelsChange(() => setModels(loadAdminModels()));
  }, []);
  return models;
}
