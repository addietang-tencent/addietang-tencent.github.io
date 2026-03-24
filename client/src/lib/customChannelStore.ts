/**
 * customChannelStore.ts
 * 自定义通道共享状态存储
 * 用于管控端（ChannelConfig）和用户端（OpenClawDetail）之间的数据共享
 * 使用 localStorage 持久化，通过 window 事件广播变更
 */

export type CredentialField = {
  id: string;
  key: string;   // 写入配置文件的字段名，如 accessKey
  label: string; // 用户看到的标签，如「访问公鉅」
};

export type CustomChannel = {
  id: string;
  name: string;
  channelId: string;
  serverUrl: string;
  wsUrl: string;
  credentialFields: CredentialField[];
  visible: boolean;
  color: string;
};

const STORAGE_KEY = "openclaw_custom_channels";
const CHANGE_EVENT = "openclaw_custom_channels_changed";

/** 读取所有自定义通道 */
export function loadCustomChannels(): CustomChannel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomChannel[];
  } catch {
    return [];
  }
}

/** 保存所有自定义通道 */
export function saveCustomChannels(channels: CustomChannel[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** 读取用户可见的自定义通道 */
export function loadVisibleCustomChannels(): CustomChannel[] {
  return loadCustomChannels().filter((ch) => ch.visible);
}

/** 监听自定义通道变更 */
export function onCustomChannelsChange(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}
