/**
 * ChannelConfig - 管控端通道配置页
 * 支持内置通道（微信/QQ/企业微信/钉钉/飞书）可见性管理
 * 以及自定义通道的添加、可见性控制（不支持编辑，仅删除）
 */
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { ScopePopover } from "@/components/ScopePopover";
import type { UserGroup } from "./MemberManagement/types";
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import {
  type CustomChannel,
  type CredentialField,
  loadCustomChannels,
  saveCustomChannels,
  onCustomChannelsChange,
  loadBuiltinChannelVisibility,
  saveBuiltinChannelVisibility,
  onBuiltinChannelVisibilityChange,
} from "@/lib/customChannelStore";

// 合并所有分组（与模型配置页保持一致）
const ALL_GROUPS: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];

// ─── 图标资源 ────────────────────────────────────────────────────────────────────

const CHANNEL_ICON_SRC: Record<string, string> = {
  wechat: "/assets/admin-channel-icons/channel-wechat.svg",
  qq: "/assets/admin-channel-icons/channel-qq.svg",
  wework: "/assets/admin-channel-icons/channel-wecom.svg",
  "wework-app": "/assets/admin-channel-icons/channel-wecom-app.svg",
  dingtalk: "/assets/admin-channel-icons/channel-dingtalk.svg",
  feishu: "/assets/admin-channel-icons/channel-feishu.svg",
};

/** 自定义通道图标（用首字母生成彩色图标） */
function CustomChannelIcon({ name, color }: { name: string; color: string }) {
  const letter = name ? name.charAt(0).toUpperCase() : "C";
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base select-none"
      style={{ background: color }}
    >
      {letter}
    </div>
  );
}


// ─── 内置通道列表 ─────────────────────────────────────────────────────────────────

const BUILTIN_CHANNELS = [
  { id: "wechat", name: "微信" },
  { id: "qq", name: "QQ" },
  { id: "wework", name: "企业微信" },
  { id: "wework-app", name: "企业微信应用" },
  { id: "dingtalk", name: "钉钉" },
  { id: "feishu", name: "飞书" },
];

// ─── Tab 定义（与 SkillConfig 同款） ─────────────────────────────────────────────
const CHANNEL_TABS = [
  {
    id: "builtin",
    label: "内置通道",
    description:
      "通过微信、QQ 等机器人接入，可实现与对应渠道的智能机器人对话，满足全场景下的个人沟通与企业服务需求，覆盖不同团队多样化协作场景。",
  },
  {
    id: "custom",
    label: "自定义通道",
    description:
      "企业可配置自研 IM 通道信息，添加后用户可在 Agent 配置页选择对应通道并填写凭证。开启「用户可见」后通道才会对用户展示。目前自定义通道仅支持 WebSocket 长连接方式接入。",
  },
];

// 预设颜色列表
const ICON_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B",
  "#10B981", "#3B82F6", "#EF4444", "#14B8A6",
];

// 凭证字段 placeholder 循环列表
const FIELD_PLACEHOLDERS = ["accessKey", "secretKey"];

let colorIdx = 0;
function nextColor() {
  const c = ICON_COLORS[colorIdx % ICON_COLORS.length];
  colorIdx++;
  return c;
}

// ─── 空白表单 ─────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  channelId: string;
  serverUrl: string;
  wsUrl: string;
  credentialFields: CredentialField[];
};

function emptyForm(): FormState {
  return {
    name: "",
    channelId: "",
    serverUrl: "",
    wsUrl: "",
    credentialFields: [],
  };
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────────

export default function ChannelConfig() {
  // 内置通道可见性（从 localStorage 初始化，与租户端共享）
  const [builtinVisibility, setBuiltinVisibility] = useState<Record<string, boolean>>(
    () => loadBuiltinChannelVisibility()
  );

  // 自定义通道列表（从 localStorage 初始化）
  const [customChannels, setCustomChannels] = useState<CustomChannel[]>(() => loadCustomChannels());

  // 监听其他标签页的变更
  useEffect(() => {
    const unsub = onCustomChannelsChange(() => {
      setCustomChannels(loadCustomChannels());
    });
    return unsub;
  }, []);

  // 监听内置通道可见性的跨标签页变更
  useEffect(() => {
    const unsub = onBuiltinChannelVisibilityChange(() => {
      setBuiltinVisibility(loadBuiltinChannelVisibility());
    });
    return unsub;
  }, []);

  // 弹窗状态（仅用于新增）
  const [dialogOpen, setDialogOpen] = useState(false);

  // Tab 切换
  const [activeTab, setActiveTab] = useState("builtin");
  const currentTab = CHANNEL_TABS.find((t) => t.id === activeTab)!;

  // 表单状态
  const [form, setForm] = useState<FormState>(emptyForm());

  // 删除确认弹窗
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 展开/折叠通道详情（展示 IM 服务器地址 + 用户凭证字段）
  const [expandedCustomId, setExpandedCustomId] = useState<string | null>(null);

  // ── 通道应用范围状态（每个通道独立） ──
  // 内置通道：{ channelId: { scope, groupIds } }
  const [builtinScopes, setBuiltinScopes] = useState<Record<string, { scope: "all" | "groups"; groupIds: string[] }>>(
    () => {
      // 初始化：全部为"全部用户"
      const init: Record<string, { scope: "all" | "groups"; groupIds: string[] }> = {};
      BUILTIN_CHANNELS.forEach((ch) => { init[ch.id] = { scope: "all", groupIds: [] }; });
      return init;
    }
  );

  // 自定义通道：{ channelId: { scope, groupIds } }
  const [customScopes, setCustomScopes] = useState<Record<string, { scope: "all" | "groups"; groupIds: string[] }>>({});

  // ── 同步到 localStorage ──
  const updateChannels = (channels: CustomChannel[]) => {
    setCustomChannels(channels);
    saveCustomChannels(channels);
  };

  // ── 打开新增弹窗 ──
  const openAddDialog = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  // ── 保存（仅新增） ──
  const handleSave = () => {
    if (!form.name.trim()) { toast.error("请填写通道名称"); return; }
    if (!form.channelId.trim()) { toast.error("请填写 Channel ID"); return; }
    if (!form.serverUrl.trim()) { toast.error("请填写 Server URL"); return; }
    if (!form.wsUrl.trim()) { toast.error("请填写 WebSocket URL"); return; }
    for (const f of form.credentialFields) {
      if (!f.key.trim()) { toast.error("凭证字段 Key 不能为空"); return; }
      if (!f.label.trim()) { toast.error("凭证字段名称不能为空"); return; }
    }

    const newCh: CustomChannel = {
      id: `custom_${Date.now()}`,
      name: form.name,
      channelId: form.channelId,
      serverUrl: form.serverUrl,
      wsUrl: form.wsUrl,
      credentialFields: form.credentialFields,
      visible: false,
      color: nextColor(),
    };
    updateChannels([...customChannels, newCh]);
    toast.success(`「${form.name}」已添加，默认不可见，开启「用户可见」后用户即可选择`);
    setDialogOpen(false);
  };

  // ── 删除自定义通道 ──
  const handleDelete = (id: string) => {
    updateChannels(customChannels.filter(ch => ch.id !== id));
    setDeleteConfirmId(null);
    if (expandedCustomId === id) setExpandedCustomId(null);
    toast.success("通道已删除");
  };

  // ── 切换自定义通道可见性 ──
  const toggleCustomVisible = (id: string, v: boolean) => {
    const updated = customChannels.map(ch => ch.id === id ? { ...ch, visible: v } : ch);
    updateChannels(updated);
    const ch = customChannels.find(c => c.id === id);
    toast.success(`「${ch?.name}」已${v ? "开启用户可见" : "关闭用户可见"}`);
  };

  // ── 凭证字段操作 ──
  const addCredentialField = () => {
    setForm(f => ({
      ...f,
      credentialFields: [...f.credentialFields, { id: `field_${Date.now()}`, key: "", label: "" }],
    }));
  };

  const removeCredentialField = (fieldId: string) => {
    setForm(f => ({ ...f, credentialFields: f.credentialFields.filter(x => x.id !== fieldId) }));
  };

  const updateCredentialFieldKey = (fieldId: string, key: string) => {
    setForm(f => ({
      ...f,
      credentialFields: f.credentialFields.map(x => x.id === fieldId ? { ...x, key } : x),
    }));
  };

  const updateCredentialFieldLabel = (fieldId: string, label: string) => {
    setForm(f => ({
      ...f,
      credentialFields: f.credentialFields.map(x => x.id === fieldId ? { ...x, label } : x),
    }));
  };

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">通道配置</h1>
      </div>

      {/* Tab 切换器（与 SkillConfig 同款） */}
      <div className="flex items-center gap-1 mb-1 border-b border-gray-200">
        {CHANNEL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 描述（仅一行） */}
      <div className="flex items-center gap-3 mt-3 mb-6">
        <p className="text-sm text-gray-500 leading-relaxed">{currentTab.description}</p>
      </div>

      {/* ── 内置通道 Tab ── */}
      {activeTab === "builtin" && (
        <div
          className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
        >
          <div className="divide-y divide-gray-50">
            {BUILTIN_CHANNELS.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={CHANNEL_ICON_SRC[ch.id]} alt="" aria-hidden="true" className="h-10 w-10 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ch.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">用户可见</span>
                    <Switch
                      checked={builtinVisibility[ch.id] || false}
                      onCheckedChange={(v) => {
                        const updated = { ...builtinVisibility, [ch.id]: v };
                        setBuiltinVisibility(updated);
                        saveBuiltinChannelVisibility(updated);
                        toast.success(`${ch.name} 已${v ? "开启用户可见" : "关闭用户可见"}`);
                      }}
                    />
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <ScopePopover
                    visibilityScope={builtinScopes[ch.id]?.scope || "all"}
                    visibilityGroupIds={builtinScopes[ch.id]?.groupIds || []}
                    groups={ALL_GROUPS}
                    onSave={(scope, groupIds) => {
                      setBuiltinScopes((prev) => ({ ...prev, [ch.id]: { scope, groupIds } }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 自定义通道 Tab ── */}
      {activeTab === "custom" && (
        <div
          className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 underline underline-offset-2 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              自定义通道配置指引
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 text-sm"
              onClick={openAddDialog}
            >
              <Plus className="w-4 h-4" />
              添加通道
            </Button>
          </div>

          {customChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-[218px]">
                <img
                  src="/assets/admin-channel-icons/empty-custom-channel.svg"
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-[60px] w-[60px]"
                />
                <div className="mt-1">
                  <p className="text-sm font-semibold text-[#020617]">暂无自定义通道</p>
                  <p className="mt-1 text-xs font-normal tracking-[0.015em] text-gray-400">点击「添加通道」配置企业自研 IM 通道</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {customChannels.map((ch) => (
                <div key={ch.id} className="hover:bg-gray-50/30 transition-colors">
                  {/* 主行：仅展示通道名称 + Channel ID + 操作 */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <CustomChannelIcon name={ch.name} color={ch.color} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{ch.name}</p>
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                            {ch.channelId}
                          </span>
                        </div>
                        {/* 详情展开按钮：放在通道名称下方 */}
                        <button
                          className="mt-1 text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5 transition-colors"
                          onClick={() => setExpandedCustomId(expandedCustomId === ch.id ? null : ch.id)}
                          title="查看详情"
                        >
                          {expandedCustomId === ch.id
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />
                          }
                          <span>详情</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-gray-400">用户可见</span>
                      <Switch
                        checked={ch.visible}
                        onCheckedChange={(v) => toggleCustomVisible(ch.id, v)}
                      />
                      <div className="w-px h-4 bg-gray-200" />
                      <ScopePopover
                        visibilityScope={customScopes[ch.id]?.scope || "all"}
                        visibilityGroupIds={customScopes[ch.id]?.groupIds || []}
                        groups={ALL_GROUPS}
                        onSave={(scope, groupIds) => {
                          setCustomScopes((prev) => ({ ...prev, [ch.id]: { scope, groupIds } }));
                        }}
                      />
                      <div className="w-px h-4 bg-gray-200" />
                      {/* 去掉编辑按钮，只保留删除 */}
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => setDeleteConfirmId(ch.id)}
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 展开后展示两部分：IM 服务器地址 + 用户凭证字段 */}
                  {expandedCustomId === ch.id && (
                    <div className="px-6 pb-4">
                      <div className="ml-14 space-y-3">
                        {/* IM 服务器地址 */}
                        <div className="rounded-xl bg-gray-50 border border-[#e5e5e5] px-4 py-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">IM 服务器地址</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 w-24 shrink-0">Server URL</span>
                              <span className="text-gray-700 font-mono break-all">{ch.serverUrl || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 w-24 shrink-0">WebSocket URL</span>
                              <span className="text-gray-700 font-mono break-all">{ch.wsUrl || "—"}</span>
                            </div>
                          </div>
                        </div>
                        {/* 用户凭证字段 */}
                        <div className="rounded-xl bg-gray-50 border border-[#e5e5e5] px-4 py-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">用户凭证字段</p>
                          {ch.credentialFields.length === 0 ? (
                            <p className="text-xs text-gray-400">无凭证字段</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {ch.credentialFields.map((f, idx) => (
                                <span
                                  key={f.id}
                                  className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full"
                                >
                                  <span className="text-gray-400">{idx + 1}.</span>
                                  <span className="font-mono text-gray-500">{f.key}</span>
                                  <span className="text-gray-300">/</span>
                                  {f.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 新增自定义通道弹窗 ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[min(640px,90vh)]">
          <DialogHeader className="shrink-0 border-b border-[#F5F5F5]">
            <DialogTitle>添加自定义通道</DialogTitle>
            <DialogDescription>
              配置企业自研 IM 通道信息，保存后可在通道列表中管理可见性。
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            {/* 顶部提醒条 */}
            <div className="flex items-start gap-2 rounded-[4px] border border-[#FCD28C] bg-[#FFFBED] px-3 py-2">
              <AlertCircle className="w-4 h-4 text-[#FCA004] mt-0.5 shrink-0" />
              <p className="text-xs text-[#0A0A0A] leading-5">
                使用自定义通道前，企业需先开发与 Agent 适配的 IM 插件，并前往<span className="font-medium">镜像管理</span>页面，导入内置该插件的自定义镜像并将其设为生效版本，方可正常使用。
              </p>
            </div>

            {/* ── 第一部分：通道基础信息 ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">通道基础信息</h3>
              <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#525252]">
                    通道名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="展示给用户的通道名字，如「内部 IM」"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="rounded-[4px] border-[#E5E5E5] bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#525252]">
                    Channel ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="写入 agent.json 的 key，需与插件名一致"
                    value={form.channelId}
                    onChange={(e) => setForm(f => ({ ...f, channelId: e.target.value }))}
                    className="rounded-[4px] border-[#E5E5E5] bg-white font-mono"
                  />
                  <p className="text-xs text-[#737373] mt-1">仅支持英文字母、数字和下划线，需与对应插件名保持一致</p>
                </div>
              </div>
            </section>

            {/* ── 第二部分：IM 服务器地址 ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">IM 服务器地址</h3>
              <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#525252]">
                    Server URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="自定义 IM 的 HTTP API 地址"
                    value={form.serverUrl}
                    onChange={(e) => setForm(f => ({ ...f, serverUrl: e.target.value }))}
                    className="rounded-[4px] border-[#E5E5E5] bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#525252]">
                    WebSocket URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="自定义 IM 的长连接地址，可与 Server URL 相同"
                    value={form.wsUrl}
                    onChange={(e) => setForm(f => ({ ...f, wsUrl: e.target.value }))}
                    className="rounded-[4px] border-[#E5E5E5] bg-white font-mono"
                  />
                  <p className="text-xs text-[#737373] mt-1">WebSocket 地址可与 Server URL 相同，系统会自动处理协议转换</p>
                </div>
              </div>
            </section>

            {/* ── 第三部分：用户凭证字段 ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">用户凭证字段</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs flex items-center gap-1 rounded-[4px] border-[#E5E5E5]"
                  onClick={addCredentialField}
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加字段
                </Button>
              </div>

              <div className="space-y-2">
                {form.credentialFields.length === 0 ? (
                  <div className="rounded-[4px] bg-[#FAFAFA] border border-dashed border-[#E5E5E5] px-4 py-3 text-center">
                    <p className="text-xs text-[#737373]">暂未添加凭证字段</p>
                  </div>
                ) : (
                  <div className="rounded-[4px] bg-[#FAFAFA] border border-[#E5E5E5] p-3 space-y-2">
                    {/* 表头 */}
                    <div className="flex items-center gap-2">
                      <span className="w-5 shrink-0" />
                      <div className="flex gap-2 flex-1">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#525252]">字段 Key</p>
                          <p className="text-xs text-[#737373]">写入配置文件的字段名</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#525252]">字段名称</p>
                          <p className="text-xs text-[#737373]">用户看到的字段名称</p>
                        </div>
                      </div>
                      <span className="w-7 shrink-0" />
                    </div>
                    {/* 字段行 */}
                    {form.credentialFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="text-xs text-[#737373] w-5 text-right shrink-0">{idx + 1}.</span>
                        <div className="flex gap-2 flex-1">
                          <Input
                            placeholder={`如 ${FIELD_PLACEHOLDERS[idx % FIELD_PLACEHOLDERS.length]}`}
                            value={field.key}
                            onChange={(e) => updateCredentialFieldKey(field.id, e.target.value)}
                            className="flex-1 rounded-[4px] border-[#E5E5E5] bg-white font-mono"
                          />
                          <Input
                            placeholder={idx % 2 === 0 ? "如 机器人的AccessKey" : "如 机器人的SecretKey"}
                            value={field.label}
                            onChange={(e) => updateCredentialFieldLabel(field.id, e.target.value)}
                            className="flex-1 rounded-[4px] border-[#E5E5E5] bg-white"
                          />
                        </div>
                        <button
                          className="w-7 shrink-0 text-[#A3A3A3] hover:text-[#DC2626] transition-colors flex items-center justify-center"
                          onClick={() => removeCredentialField(field.id)}
                          title="删除此字段"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[#737373] leading-5 pt-0.5">
                  用户凭证的字段名称会展示在用户端，用户选择该通道后会看到对应的输入框
                </p>
              </div>
            </section>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button variant="dialog-confirm" onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 删除确认弹窗（危险操作改用 AlertDialog） ── */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后，该自定义通道将从用户端通道列表中移除，已接入该通道的 Agent 配置不受影响。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
