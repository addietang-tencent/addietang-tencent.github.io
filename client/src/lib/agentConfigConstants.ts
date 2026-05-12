/**
 * agentConfigConstants.ts
 * Agent 模型 / 通道 配置共享常量
 * 同时被用户端 (tenant/OpenClawDetail) 与管控端 (admin/OpenClawMonitor) 引用，
 * 避免重复定义导致后续维护漂移。
 */

// ─── 通道配置类型与选项 ────────────────────────────────────────────────────────

export type ChannelField = {
  key: string;
  label: string;
  /** true = 加密显示（保留前3字符） */
  secret: boolean;
};

export type ChannelConfig = {
  value: string;
  label: string;
  descText: string;
  detailUrl: string;
  hasInfoIcon?: boolean;
  fields?: ChannelField[];
  /** 飞书特殊处理（用户端：快捷/手动 Tab + 二维码） */
  feishuMode?: true;
  /** 企业微信特殊处理（用户端：快捷/手动 Tab） */
  weworkMode?: true;
  /** 微信特殊处理（用户端：扫码授权） */
  wechatMode?: true;
  /** 管控端配置的自定义通道（用户端动态注入） */
  adminCustomMode?: true;
  adminCustomId?: string;
  /** 对应管控端内置通道 ID，用于可见性过滤 */
  builtinId?: string;
};

export const CHANNEL_OPTIONS: ChannelConfig[] = [
  {
    value: "wework",
    label: "企业微信",
    descText: "企业微信是一款高效协同办公的企业通讯与办公工具。",
    detailUrl: "#",
    hasInfoIcon: true,
    weworkMode: true,
    fields: [
      { key: "botId", label: "企业微信机器人的botId", secret: false },
      { key: "secret", label: "企业微信机器人的secret", secret: true },
    ],
  },
  {
    value: "qq",
    label: "QQ",
    descText: "一键解锁智能玩法，开启你的个性化QQ机器人之旅。",
    detailUrl: "#",
    fields: [
      { key: "appId", label: "QQ机器人的App ID", secret: false },
      { key: "appSecret", label: "QQ机器人的App Secret", secret: true },
    ],
  },
  {
    value: "wework-app",
    label: "企业微信应用",
    descText: "通过企业微信应用接口，将 Agent 接入企业微信应用，支持消息互动与业务集成。",
    detailUrl: "#",
    fields: [
      { key: "corpId",         label: "企业微信应用的Corp ID",           secret: false },
      { key: "corpSecret",     label: "企业微信应用的Corp Secret",       secret: true  },
      { key: "agentId",        label: "企业微信应用的Agent ID",          secret: false },
      { key: "token",          label: "企业微信应用的Token",             secret: false },
      { key: "encodingAesKey", label: "企业微信应用的Encoding AES Key", secret: true  },
    ],
    builtinId: "wework-app",
  },
  {
    value: "feishu",
    label: "飞书",
    descText: "飞书是字节跳动推出的一站式先进协作平台，AI 赋能助力高效办公。",
    detailUrl: "#",
    feishuMode: true,
    // 快捷配置和手动配置都存 appId + appSecret
    fields: [
      { key: "appId", label: "飞书应用的App ID", secret: false },
      { key: "appSecret", label: "飞书应用的App Secret", secret: true },
    ],
  },
  {
    value: "dingtalk",
    label: "钉钉",
    descText: "钉钉是阿里打造的智能办公平台，驱动组织数字化管理升级。",
    detailUrl: "#",
    fields: [
      { key: "clientId", label: "钉钉应用的Client ID", secret: false },
      { key: "clientSecret", label: "钉钉应用的Client Secret", secret: true },
    ],
  },
  {
    value: "wechat",
    label: "微信",
    descText: "通过微信扫码授权，将 Agent 接入微信，支持微信消息交互。",
    detailUrl: "#",
    wechatMode: true,
  },
];

// ─── 模型配置类型与选项 ────────────────────────────────────────────────────────

export type ModelVersion = {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
};

export type ModelProvider = {
  value: string;
  label: string;
  versions: ModelVersion[];
};

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    value: "tencent-deepseek",
    label: "腾讯云 DeepSeek",
    versions: [
      { value: "deepseek-v3", label: "DeepSeek V3 0324" },
      { value: "deepseek-r1", label: "DeepSeek R1" },
    ],
  },
  {
    value: "tencent-hunyuan",
    label: "腾讯云混元",
    versions: [
      { value: "hunyuan-turbos", label: "混元 TurboS Latest" },
      { value: "hunyuan-pro", label: "混元 Pro" },
    ],
  },
  {
    value: "custom",
    label: "自定义模型",
    versions: [
      { value: "custom", label: "自定义模型", badge: "需自费", badgeColor: "bg-amber-50 text-amber-600 border-amber-100" },
    ],
  },
];

export const DEFAULT_CUSTOM_JSON = `{
  "provider": "provider_name",
  "base_url": "baseurl",
  "api": "API协议",
  "api_key": "your-api-key-here",
  "model": {
    "id": "model_id",
    "name": "model_name"
  }
}`;
