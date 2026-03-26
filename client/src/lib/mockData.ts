// Mock data for the OpenClaw Enterprise Platform

export const SITE_CONFIG = {
  name: "A企业企业版OpenClaw",
  description: "快速创建属于你的24小时AI私人助理",
  logo: "🦞",
  region: "广州",
  ip: "43.128.xx.xx",
  domain: "openclaw.a-company.com",
  tencentUin: "3205597606",
  websiteDescription: "企业级AI助理平台，让每位员工都拥有专属AI助手",
};

export const MOCK_OPENCLAW_LIST = [
  {
    id: "oc-1",
    instanceId: "ins-s03n7heo",
    name: "工作助手",
    status: "running",
    createdAt: "2026-03-01 10:23:45",
    model: "腾讯云 DeepSeek",
    modelVersion: "DeepSeek V3 0324",
    channels: ["飞书", "QQ"],
    skills: [
      "tavily-search 1.0.0",
      "summarize 1.0.0",
      "agent-browser 0.2.0",
      "find-skills 0.1.0",
      "github 1.0.0",
      "obsidian 1.0.0",
      "notion 1.0.0",
      "weather 1.0.0",
      "tencentcloud-lighthouse-skill 1.0.0",
      "tencent-docs 1.0.3",
    ],
  },
  {
    id: "oc-002",
    instanceId: "ins-r92m6gdn",
    name: "代码助手",
    status: "running",
    createdAt: "2026-03-03 14:12:00",
    model: "腾讯云 Coding Plan",
    modelVersion: "自动",
    channels: ["企业微信机器人"],
    skills: ["github 1.0.0", "agent-browser 0.2.0"],
  },
  {
    id: "oc-003",
    instanceId: "ins-k7p2xf1a",
    name: "文档整理助手",
    status: "STOPPED",
    createdAt: "2026-03-05 09:00:00",
    model: "腾讯云混元",
    modelVersion: "混元 Turbo",
    channels: [],
    skills: ["notion 1.0.0", "tencent-docs 1.0.3"],
  },
  {
    id: "oc-004",
    instanceId: "ins-b5fcm1l5",
    name: "数据分析助手",
    status: "running",
    createdAt: "2026-03-13 08:30:00",
    model: "腾讯云 DeepSeek",
    modelVersion: "DeepSeek V3 0324",
    channels: ["钉钉"],
    skills: [],
  },
  {
    id: "oc-005",
    instanceId: "ins-x4ebl9qw",
    name: "客服助手",
    status: "RESCUE_MODE",
    createdAt: "2026-03-10 16:45:00",
    model: "腾讯云混元",
    modelVersion: "混元 Pro",
    channels: ["企业微信机器人"],
    skills: ["tavily-search 1.0.0"],
  },
  {
    id: "oc-006",
    instanceId: "ins-n6gdn2yt",
    name: "运营助手",
    status: "LAUNCH_FAILED",
    createdAt: "2026-03-12 11:20:00",
    model: "腾讯云 DeepSeek",
    modelVersion: "DeepSeek R1",
    channels: [],
    skills: [],
  },
];

export const MOCK_MEMBERS = [
  {
    id: "alice@acompany.com",
    name: "Alice",
    role: "admin",
    status: "active",
    openclawLimit: 5,
    tokenLimit: 100000,
    openclawCount: 2,
    createdAt: "2026-01-15",
  },
  {
    id: "lisi@a-company.com",
    role: "member",
    status: "active",
    openclawLimit: 3,
    tokenLimit: 50000,
    openclawCount: 1,
    createdAt: "2026-01-20",
  },
  {
    id: "wangwu@a-company.com",
    role: "member",
    status: "active",
    openclawLimit: 3,
    tokenLimit: 50000,
    openclawCount: 3,
    createdAt: "2026-02-01",
  },
  {
    id: "zhaoliu@a-company.com",
    role: "member",
    status: "disabled",
    openclawLimit: 3,
    tokenLimit: 50000,
    openclawCount: 0,
    createdAt: "2026-02-10",
  },
];

export const MOCK_MODELS = [
  {
    id: "model-001",
    name: "腾讯云 DeepSeek",
    version: "DeepSeek V3 0324",
    apiKey: "sk-**********************a1b2",
    status: "connected",
    visible: true,
    dailyTokenLimit: 500000,
  },
  {
    id: "model-002",
    name: "腾讯云混元",
    version: "混元 Turbo",
    apiKey: "sk-**********************c3d4",
    status: "connected",
    visible: true,
    dailyTokenLimit: 300000,
  },
  {
    id: "model-003",
    name: "腾讯云 Coding Plan",
    version: "自动",
    apiKey: "sk-**********************e5f6",
    status: "disconnected",
    visible: false,
    dailyTokenLimit: 200000,
  },
];

export const MOCK_CHANNELS = [
  { id: "wework-bot", name: "企业微信机器人", icon: "💼", visible: true },
  { id: "wework-app", name: "企业微信应用", icon: "📱", visible: true },
  { id: "qq", name: "QQ", icon: "🐧", visible: true },
  { id: "feishu", name: "飞书", icon: "🪶", visible: true },
  { id: "dingtalk", name: "钉钉", icon: "📌", visible: false },
];

export const MOCK_DOCS = [
  {
    id: "doc-001",
    title: "OpenClaw 概念介绍",
    addedAt: "2026-01-01",
    addedBy: "系统默认",
    visible: true,
    isDefault: true,
  },
  {
    id: "doc-002",
    title: "企业版 OpenClaw 的功能与特色",
    addedAt: "2026-01-01",
    addedBy: "系统默认",
    visible: true,
    isDefault: true,
  },
  {
    id: "doc-003",
    title: "部署 OpenClaw 指引",
    addedAt: "2026-01-01",
    addedBy: "系统默认",
    visible: true,
    isDefault: true,
  },
  {
    id: "doc-004",
    title: "OpenClaw 进阶玩法",
    addedAt: "2026-01-01",
    addedBy: "系统默认",
    visible: true,
    isDefault: true,
  },
];

export const MOCK_IMAGES = [
  {
    id: "img-001",
    imageId: "img-20260101-001",
    name: "OpenClaw-Enterprise-v2.1",
    status: "active",
    disk: "系统盘 150GiB",
    os: "CentOS 7.9 64位",
    createdAt: "2026-01-15 10:00:00",
    active: true,
  },
  {
    id: "img-002",
    imageId: "img-20260201-002",
    name: "OpenClaw-Enterprise-v2.0",
    status: "inactive",
    disk: "系统盘 100GiB",
    os: "CentOS 7.9 64位",
    createdAt: "2026-02-01 14:30:00",
    active: false,
  },
];

export const DEFAULT_INBOUND_RULES = [
  { source: "全部IPv4地址", protocol: "ICMP", port: "ALL", policy: "允许", remark: "放通Ping服务" },
  { source: "全部IPv4地址", protocol: "TCP", port: "22", policy: "允许", remark: "放通Linux SSH登录" },
  { source: "全部IPv4地址", protocol: "TCP", port: "80", policy: "允许", remark: "Web服务HTTP (80)，如Apache、Nginx" },
  { source: "全部IPv4地址", protocol: "TCP", port: "443", policy: "允许", remark: "Web服务HTTPS (443)，如Apache、Nginx" },
  { source: "全部IPv4地址", protocol: "TCP", port: "3389", policy: "允许", remark: "Windows远程桌面登录" },
  { source: "全部IPv4地址", protocol: "UDP", port: "3389", policy: "允许", remark: "Windows远程桌面登录优化" },
  { source: "全部IPv4地址", protocol: "TCP", port: "18789", policy: "允许", remark: "" },
  { source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

export const DEFAULT_OUTBOUND_RULES = [
  { target: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "" },
  { target: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "log-001",
    operator: "alice@acompany.com",
    event: "UpdateBasicInfo",
    action: "/api/admin/basic-info",
    requestTime: "2026-03-09 10:23:45",
    responseTime: "2026-03-09 10:23:45",
    success: true,
    detail: {
      eventId: "6af57777-10bd-4032-b881-f2e2f8872cd0",
      request: '{"siteName":"A企业企业版OpenClaw","description":"企业级AI助理平台"}',
      startDate: "2026-03-09 10:23:45",
      endDate: "2026-03-09 10:23:45",
      duration: "158",
      invokerName: "alice@acompany.com",
      invokerId: "1001",
      action: "/api/admin/basic-info",
      sourceIp: "30.42.219.99",
      success: "true",
      userAgent: "Mozilla/5.0",
    },
  },
  {
    id: "log-002",
    operator: "alice@acompany.com",
    event: "AddMember",
    action: "/api/admin/members",
    requestTime: "2026-03-09 11:05:12",
    responseTime: "2026-03-09 11:05:12",
    success: true,
    detail: {
      eventId: "7bf68888-20cd-5143-c992-g3f3g9983de1",
      request: '{"memberId":"newuser@a-company.com","openclawLimit":3,"tokenLimit":50000}',
      startDate: "2026-03-09 11:05:12",
      endDate: "2026-03-09 11:05:12",
      duration: "92",
      invokerName: "alice@acompany.com",
      invokerId: "1001",
      action: "/api/admin/members",
      sourceIp: "30.42.219.99",
      success: "true",
      userAgent: "Mozilla/5.0",
    },
  },
  {
    id: "log-003",
    operator: "lisi@a-company.com",
    event: "DeleteModel",
    action: "/api/admin/models/model-003",
    requestTime: "2026-03-09 14:30:00",
    responseTime: "2026-03-09 14:30:01",
    success: false,
    detail: {
      eventId: "8cg79999-31de-6254-d003-h4g4h0094ef2",
      request: '{"modelId":"model-003"}',
      startDate: "2026-03-09 14:30:00",
      endDate: "2026-03-09 14:30:01",
      duration: "1203",
      invokerName: "lisi@a-company.com",
      invokerId: "1002",
      action: "/api/admin/models/model-003",
      sourceIp: "30.42.220.15",
      success: "false",
      userAgent: "Mozilla/5.0",
    },
  },
];

export const MOCK_TOKEN_STATS = {
  totalRequests: 12847,
  inputTokens: 3241580,
  outputTokens: 1876320,
  totalTokens: 5117900,
  globalTokenLimit: 10000000,
};

export const MOCK_TOKEN_BY_MEMBER = [
  { memberId: "alice@acompany.com", inputTokens: 1200000, outputTokens: 680000, totalTokens: 1880000, tokenLimit: 100000, ratio: 0.188 },
  { memberId: "lisi@a-company.com", inputTokens: 980000, outputTokens: 560000, totalTokens: 1540000, tokenLimit: 50000, ratio: 0.308 },
  { memberId: "wangwu@a-company.com", inputTokens: 760000, outputTokens: 420000, totalTokens: 1180000, tokenLimit: 50000, ratio: 0.236 },
  { memberId: "zhaoliu@a-company.com", inputTokens: 301580, outputTokens: 216320, totalTokens: 517900, tokenLimit: 50000, ratio: 0.104 },
];

export const MOCK_TOKEN_BY_MODEL = [
  { modelName: "腾讯云 DeepSeek", inputTokens: 1800000, outputTokens: 1000000, totalTokens: 2800000, tokenLimit: 500000, ratio: 0.56 },
  { modelName: "腾讯云混元", inputTokens: 1100000, outputTokens: 650000, totalTokens: 1750000, tokenLimit: 300000, ratio: 0.583 },
  { modelName: "腾讯云 Coding Plan", inputTokens: 341580, outputTokens: 226320, totalTokens: 567900, tokenLimit: 200000, ratio: 0.284 },
];

export const MOCK_OPENCLAW_MONITOR = [
  { id: "oc-001", name: "工作助手", creator: "alice@acompany.com", status: "running", createdAt: "2026-03-01 10:23:45" },
  { id: "oc-002", name: "代码助手", creator: "alice@acompany.com", status: "running", createdAt: "2026-03-03 14:12:00" },
  { id: "oc-003", name: "文档整理助手", creator: "lisi@a-company.com", status: "stopped", createdAt: "2026-03-05 09:00:00" },
  { id: "oc-004", name: "数据分析助手", creator: "wangwu@a-company.com", status: "running", createdAt: "2026-03-06 16:45:00" },
  { id: "oc-005", name: "客服助手", creator: "wangwu@a-company.com", status: "running", createdAt: "2026-03-07 11:20:00" },
];

export const AVAILABLE_MODELS = [
  { value: "tencent-deepseek", label: "腾讯云 DeepSeek", versions: ["DeepSeek V3 0324", "DeepSeek R1", "DeepSeek V2"] },
  { value: "tencent-hunyuan", label: "腾讯云混元", versions: ["混元 TurboS Latest", "混元 Pro", "混元 Lite"] },
  { value: "tencent-coding", label: "腾讯云 Coding Plan", versions: ["自动"] },
];

export const AVAILABLE_SKILLS = [
  "tavily-search 1.0.0",
  "summarize 1.0.0",
  "agent-browser 0.2.0",
  "find-skills 0.1.0",
  "github 1.0.0",
  "obsidian 1.0.0",
  "notion 1.0.0",
  "weather 1.0.0",
  "tencentcloud-lighthouse-skill 1.0.0",
  "tencent-docs 1.0.3",
  "xhs-skill 1.0.15",
  "ai-ppt-generator 1.1.2",
];
