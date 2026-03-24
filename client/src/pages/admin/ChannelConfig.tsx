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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare, Plus, Trash2, ChevronDown, ChevronRight, Settings2, AlertCircle } from "lucide-react";
import {
  type CustomChannel,
  type CredentialField,
  loadCustomChannels,
  saveCustomChannels,
  onCustomChannelsChange,
} from "@/lib/customChannelStore";

// ─── 图标组件 ────────────────────────────────────────────────────────────────────

function WeworkIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1EB955" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M8.5 10.5c-.83 0-1.5-.67-1.5-1.5S7.67 7.5 8.5 7.5 10 8.17 10 9s-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.36C8.44 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.67 0-3.22-.49-4.53-1.33l-.32-.2-3.01.81.82-2.95-.21-.33A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    </div>
  );
}

function QQIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#12B7F5" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
  );
}

function FeishuIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#3370FF" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18L18 8v8l-6 3.75L6 16V8l6-3.82z"/>
        <path d="M12 7l-4 2.5v5L12 17l4-2.5v-5L12 7zm0 2.18l2 1.25v2.5L12 14.32l-2-1.25v-2.5L12 9.18z"/>
      </svg>
    </div>
  );
}

function DingtalkIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1677FF" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H7.5c-.83 0-1.5-.67-1.5-1.5v-5C6 8.67 6.67 8 7.5 8h9c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zm-7-6v4h1.5v-1.5H12V16h1.5v-4H12v1.5h-1v-1.5H9.5z"/>
      </svg>
    </div>
  );
}

function WechatIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5" style={{ background: "#07C160" }}>
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663415970324/bygiZj33T3TUvGMBPvApKE/wechat_logo_transparent_11985bb7.png"
        alt="微信"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

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

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  wework: <WeworkIcon />,
  qq: <QQIcon />,
  feishu: <FeishuIcon />,
  dingtalk: <DingtalkIcon />,
  wechat: <WechatIcon />,
};

// ─── 内置通道列表 ─────────────────────────────────────────────────────────────────

const BUILTIN_CHANNELS = [
  { id: "wechat", name: "微信" },
  { id: "qq", name: "QQ" },
  { id: "wework", name: "企业微信" },
  { id: "dingtalk", name: "钉钉" },
  { id: "feishu", name: "飞书" },
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
  // 内置通道可见性
  const [builtinVisibility, setBuiltinVisibility] = useState<Record<string, boolean>>({
    wechat: true, qq: true, wework: true, dingtalk: false, feishu: true,
  });

  // 自定义通道列表（从 localStorage 初始化）
  const [customChannels, setCustomChannels] = useState<CustomChannel[]>(() => loadCustomChannels());

  // 监听其他标签页的变更
  useEffect(() => {
    const unsub = onCustomChannelsChange(() => {
      setCustomChannels(loadCustomChannels());
    });
    return unsub;
  }, []);

  // 弹窗状态（仅用于新增）
  const [dialogOpen, setDialogOpen] = useState(false);

  // 表单状态
  const [form, setForm] = useState<FormState>(emptyForm());

  // 删除确认弹窗
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 展开/折叠通道详情（展示 IM 服务器地址 + 用户凭证字段）
  const [expandedCustomId, setExpandedCustomId] = useState<string | null>(null);

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
    <div className="page-enter max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">通道配置</h1>
        <p className="text-sm text-gray-500 mt-1">
          配置用户可以为 OpenClaw 选择接入的即时通讯工具。开启「用户可见」后，用户可在 OpenClaw 配置中选择对应通道。
        </p>
      </div>

      {/* ── 内置通道 ── */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-50">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">内置通道</h2>
        </div>
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-500">通过微信、QQ 等机器人接入，可实现与对应渠道的智能机器人对话，满足全场景下的个人沟通与企业服务需求，覆盖不同团队多样化协作场景</p>
        </div>

        <div className="divide-y divide-gray-50">
          {BUILTIN_CHANNELS.map((ch) => (
            <div key={ch.id} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                {CHANNEL_ICONS[ch.id]}
                <div>
                  <p className="text-sm font-medium text-gray-900">{ch.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">用户可见</span>
                <Switch
                  checked={builtinVisibility[ch.id] || false}
                  onCheckedChange={(v) => {
                    setBuiltinVisibility({ ...builtinVisibility, [ch.id]: v });
                    toast.success(`${ch.name} 已${v ? "开启" : "关闭"}`);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 自定义通道 ── */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">自定义通道</h2>
          </div>
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
        {/* ① 修改1：补充「仅支持长连接」说明 */}
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            企业可配置自研 IM 通道信息，添加后用户可在 OpenClaw 配置页选择对应通道并填写凭证。开启「用户可见」后通道才会对用户展示。目前自定义通道仅支持 WebSocket 长连接方式接入。
            <a
              href="#"
              className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 ml-1 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              自定义通道配置指引
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </p>
        </div>

        {customChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
              <Settings2 className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 mb-1">暂无自定义通道</p>
            <p className="text-xs text-gray-400">点击「添加通道」配置企业自研 IM 通道</p>
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
                    {/* ⑦ 修改7：去掉编辑按钮，只保留删除 */}
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => setDeleteConfirmId(ch.id)}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ⑥ 修改6：展开后展示两部分：IM 服务器地址 + 用户凭证字段 */}
                {expandedCustomId === ch.id && (
                  <div className="px-6 pb-4">
                    <div className="ml-14 space-y-3">
                      {/* IM 服务器地址 */}
                      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
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
                      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
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

      {/* ── 新增自定义通道弹窗 ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加自定义通道</DialogTitle>
            <DialogDescription>
              配置企业自研 IM 通道信息，保存后可在通道列表中管理可见性。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* ② 修改2：顶部提醒条 */}
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                使用自定义通道前，企业需先开发与 OpenClaw 适配的 IM 插件，并前往<span className="font-medium">镜像管理</span>页面，导入内置该插件的自定义镜像并将其设为生效版本，方可正常使用。
              </p>
            </div>

            {/* ── 第一部分：通道基础信息 ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">1</div>
                <h3 className="text-sm font-semibold text-gray-800">通道基础信息</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">通道名称 <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="展示给用户的通道名字，如「内部 IM」"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-gray-50 border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Channel ID <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="写入 openclaw.json 的 key，需与插件名一致"
                    value={form.channelId}
                    onChange={(e) => setForm(f => ({ ...f, channelId: e.target.value }))}
                    className="bg-gray-50 border-gray-200 text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">仅支持英文字母、数字和下划线，需与对应插件名保持一致</p>
                </div>
              </div>
            </div>

            {/* ── 第二部分：IM 服务器地址 ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">2</div>
                <h3 className="text-sm font-semibold text-gray-800">IM 服务器地址</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Server URL <span className="text-red-400">*</span></label>
                  {/* ③ 修改3：Server URL 不举例 */}
                  <Input
                    placeholder="自定义 IM 的 HTTP API 地址"
                    value={form.serverUrl}
                    onChange={(e) => setForm(f => ({ ...f, serverUrl: e.target.value }))}
                    className="bg-gray-50 border-gray-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">WebSocket URL <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="自定义 IM 的长连接地址，可与 Server URL 相同"
                    value={form.wsUrl}
                    onChange={(e) => setForm(f => ({ ...f, wsUrl: e.target.value }))}
                    className="bg-gray-50 border-gray-200 text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">WebSocket 地址可与 Server URL 相同，系统会自动处理协议转换</p>
                </div>
              </div>
            </div>

            {/* ── 第三部分：用户凭证字段 ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">3</div>
                  <h3 className="text-sm font-semibold text-gray-800">用户凭证字段</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs flex items-center gap-1"
                  onClick={addCredentialField}
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加字段
                </Button>
              </div>

              <div className="pl-7 space-y-2">
                {form.credentialFields.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 border border-dashed border-gray-200 px-4 py-3 text-center">
                    <p className="text-xs text-gray-400">暂未添加凭证字段</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 表头 */}
                    <div className="flex items-center gap-2">
                      <span className="w-5 shrink-0" />{/* 序号占位 */}
                      <div className="flex gap-2 flex-1">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600">字段 Key</p>
                          <p className="text-xs text-gray-400">写入配置文件的字段名</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600">字段名称</p>
                          <p className="text-xs text-gray-400">用户看到的字段名称</p>
                        </div>
                      </div>
                      <span className="w-7 shrink-0" />{/* 删除按钮占位 */}
                    </div>
                    {/* 字段行 */}
                    {form.credentialFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}.</span>
                        <div className="flex gap-2 flex-1">
                          <Input
                            placeholder={FIELD_PLACEHOLDERS[idx % FIELD_PLACEHOLDERS.length]}
                            value={field.key}
                            onChange={(e) => updateCredentialFieldKey(field.id, e.target.value)}
                            className="flex-1 bg-gray-50 border-gray-200 text-sm font-mono"
                          />
                          <Input
                            placeholder={idx % 2 === 0 ? "访问公鉅" : "访问私鉅"}
                            value={field.label}
                            onChange={(e) => updateCredentialFieldLabel(field.id, e.target.value)}
                            className="flex-1 bg-gray-50 border-gray-200 text-sm"
                          />
                        </div>
                        <button
                          className="w-7 shrink-0 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center"
                          onClick={() => removeCredentialField(field.id)}
                          title="删除此字段"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 leading-relaxed pt-1">
                  用户凭证字段和名称会展示在用户端，用户选择该通道后会看到对应的输入框
                </p>
              </div>
            </div>

            {/* ── 操作按钮 ── */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleSave}
              >
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 删除确认弹窗 ── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后，该自定义通道将从用户端通道列表中移除，已接入该通道的 OpenClaw 配置不受影响。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
