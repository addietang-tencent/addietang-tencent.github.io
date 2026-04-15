/**
 * ModelConfig - 管控端模型配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Plus, Trash2, Info, Brain, Pencil, AlertTriangle,
  Search, Check, X,
} from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/mockData";

// 每个厂商对应的子版本列表
const PROVIDER_VERSIONS: Record<string, string[]> = {};
AVAILABLE_MODELS.forEach((m) => {
  PROVIDER_VERSIONS[m.value] = m.versions;
});

// 自定义模型选项值
const CUSTOM_PROVIDER_VALUE = "__custom__";

// 下拉选项：厂商 + 自定义模型
const PROVIDER_OPTIONS = [
  ...AVAILABLE_MODELS.map((m) => ({ value: m.value, label: m.label })),
  { value: CUSTOM_PROVIDER_VALUE, label: "自定义模型" },
];

// localStorage key，供用户端读取
const DEFAULT_MODEL_STORAGE_KEY = "adminDefaultModelId";

interface ModelRow {
  id: string;
  name: string;
  version: string;
  modelUrl: string;
  visible: boolean;
  isDefault: boolean;
  dailyLimit: number;
  provider: string; // 对应 AVAILABLE_MODELS.value
  versions: string[]; // 该厂商可用的版本列表
  isMultimodal?: boolean; // 是否支持多模态输入
  visibilityScope: "all" | "groups"; // 应用范围：全部用户 / 按分组
  visibilityGroupIds: string[]; // 按分组时选中的分组 id
}

// Mock 分组数据，与用户管理页一致
interface MockGroup {
  id: string;
  name: string;
}
const MOCK_GROUPS: MockGroup[] = [
  { id: "g1", name: "产品组" },
  { id: "g2", name: "研发组" },
  { id: "g3", name: "设计组" },
  { id: "g4", name: "产品运营与市场推广团队" },
  { id: "g5", name: "前端工程组" },
  { id: "g6", name: "后端工程组" },
  { id: "g7", name: "数据分析组" },
  { id: "g8", name: "质量保障组" },
  { id: "g9", name: "安全团队" },
  { id: "g10", name: "基础架构组" },
  { id: "g11", name: "DevOps 组" },
  { id: "g12", name: "客户成功组" },
  { id: "g13", name: "商务拓展组" },
  { id: "g14", name: "内容运营组" },
  { id: "g15", name: "AI 研究组" },
];

const MOCK_MODELS: ModelRow[] = [
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
    visibilityScope: "groups", visibilityGroupIds: ["g1", "g2", "g5", "g7", "g15"],
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
    visibilityScope: "all", visibilityGroupIds: [],
  },
];

const DEFAULT_JSON = `{
  "provider": "provider_name",
  "base_url": "baseurl",
  "api": "API协议",
  "api_key": "your-api-key-here",
  "model": {
    "id": "model_id",
    "name": "model_name"
  }
}`;

// 应用范围 Popover 编辑面板
function ScopePopover({
  model,
  groups,
  onSave,
}: {
  model: ModelRow;
  groups: MockGroup[];
  onSave: (id: string, scope: "all" | "groups", groupIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<"all" | "groups">(model.visibilityScope);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>(model.visibilityGroupIds);
  const [searchQuery, setSearchQuery] = useState("");

  // 每次打开时同步当前模型的状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(model.visibilityScope);
      setDraftGroupIds([...model.visibilityGroupIds]);
      setSearchQuery("");
    }
    setOpen(v);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasGroups = groups.length > 0;

  const toggleGroup = (gid: string) => {
    setDraftGroupIds((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
    );
  };

  const handleClearSelection = () => {
    setDraftGroupIds([]);
    setSearchQuery("");
  };

  // 确认按钮是否可点击
  const isConfirmDisabled = draftScope === "groups" && (draftGroupIds.length === 0 || !hasGroups);

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onSave(model.id, draftScope, draftScope === "all" ? [] : draftGroupIds);
    setOpen(false);
    toast.success("应用范围已更新");
  };

  // 解析已选分组名（按 groups 原始顺序排列，确保展示第一个是列表中最靠前的）
  const selectedGroupNames = groups
    .filter((g) => model.visibilityGroupIds.includes(g.id))
    .map((g) => g.name);

  // 徽章区域
  const renderBadges = () => {
    if (model.visibilityScope === "all" || selectedGroupNames.length === 0) {
      return (
        <span className="badge-loading whitespace-nowrap">
          全部用户
        </span>
      );
    }

    // 按分组：灰色徽章 + Tooltip 展示完整名称
    const firstName = selectedGroupNames[0];
    const rest = selectedGroupNames.length - 1;
    const tooltipText = selectedGroupNames.join("，");

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <span className="badge-shutdown max-w-[100px] truncate inline-block align-middle">
              {firstName}
            </span>
            {rest > 0 && (
              <span className="badge-shutdown whitespace-nowrap">
                +{rest}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-end gap-1.5 min-h-[20px] max-w-[140px]">
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="self-center text-gray-300 hover:text-blue-500 transition-colors"
            title="编辑应用范围"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-68 p-0" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5">
            {/* Radio 切换 */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setDraftScope("all")}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftScope === "all"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                全部用户
              </button>
              <button
                onClick={() => setDraftScope("groups")}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftScope === "groups"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                按分组
              </button>
            </div>

            {/* 分组列表（仅 groups 模式） */}
            {draftScope === "groups" && (
              <div className="space-y-1.5">
                {!hasGroups ? (
                  /* 无分组空状态 */
                  <div className="text-center py-5 px-2">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      暂无分组，请前往
                      <a
                        href="/admin/members"
                        className="text-blue-500 hover:text-blue-600 hover:underline mx-0.5"
                        onClick={(e) => { e.preventDefault(); setOpen(false); window.location.href = "/admin/members"; }}
                      >
                        用户管理
                      </a>
                      建立分组
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 搜索框 */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索分组…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* 分组 checkbox 列表 */}
                    <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                      {filteredGroups.length === 0 ? (
                        <p className="text-[11px] text-gray-400 text-center py-3">无匹配分组</p>
                      ) : (
                        filteredGroups.map((group) => {
                          const checked = draftGroupIds.includes(group.id);
                          return (
                            <button
                              key={group.id}
                              onClick={() => toggleGroup(group.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                  checked
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {checked && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                              <span className="text-xs text-gray-700 truncate">{group.name}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                    {/* 已选数量 + 清除筛选 */}
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[11px] text-gray-400">
                        已选 {draftGroupIds.length} 个分组
                      </p>
                      {draftGroupIds.length > 0 && (
                        <button
                          onClick={handleClearSelection}
                          className="text-[11px] text-blue-500 hover:text-blue-600 hover:underline"
                        >
                          清除筛选
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-gray-100">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              style={isConfirmDisabled ? undefined : { background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// 编辑配额弹窗
function EditQuotaDialog({
  model,
  open,
  onClose,
  onSave,
}: {
  model: ModelRow | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, limit: number) => void;
}) {
  const [limit, setLimit] = useState(model?.dailyLimit ?? 100000);

  // 每次打开时同步
  if (!model) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>编辑配额 — {model.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>每日 Tokens 数量上限</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-gray-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            onClick={() => { onSave(model.id, limit); onClose(); }}
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ModelConfig() {
  const [models, setModels] = useState<ModelRow[]>(MOCK_MODELS);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customInputMode, setCustomInputMode] = useState<"json" | "form">("form");
  // 删除二次确认弹窗
  const [deleteConfirmModel, setDeleteConfirmModel] = useState<ModelRow | null>(null);

  // 编辑配额弹窗
  const [editQuotaModel, setEditQuotaModel] = useState<ModelRow | null>(null);
  const [showEditQuota, setShowEditQuota] = useState(false);

  // Add form state — 统一用一个 provider 字段，默认选第一个厂商
  const [newModel, setNewModel] = useState({
    provider: PROVIDER_OPTIONS[0]?.value ?? "", version: "", modelUrl: "", dailyLimit: 100000,
  });
  const [customForm, setCustomForm] = useState({
    provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "", dailyLimit: 100000, isMultimodal: false,
  });
  const [customJson, setCustomJson] = useState(DEFAULT_JSON);

  const isCustomProvider = newModel.provider === CUSTOM_PROVIDER_VALUE;
  const selectedProviderData = AVAILABLE_MODELS.find((m) => m.value === newModel.provider);

  // 打开添加弹窗时重置为默认第一个厂商
  const openAddDialog = () => {
    setNewModel({ provider: PROVIDER_OPTIONS[0]?.value ?? "", version: "", modelUrl: "", dailyLimit: 100000 });
    setShowAddDialog(true);
  };

  const handleAddModel = () => {
    if (isCustomProvider) {
      const name = customInputMode === "form" ? (customForm.provider || "自定义模型") : "自定义模型";
      setModels([...models, {
        id: String(Date.now()), name, version: customInputMode === "form" ? customForm.model_name : "自定义",
        modelUrl: customForm.base_url || "", visible: true, isDefault: false, isMultimodal: customForm.isMultimodal, dailyLimit: customForm.dailyLimit,
        provider: CUSTOM_PROVIDER_VALUE, versions: [],
        visibilityScope: "all", visibilityGroupIds: [],
      }]);
      setShowAddDialog(false);
      toast.success("自定义模型已添加");
    } else {
      if (!newModel.provider || !newModel.modelUrl) { toast.error("请填写完整信息"); return; }
      const providerLabel = selectedProviderData?.label || newModel.provider;
      const versions = selectedProviderData?.versions ?? [];
      setModels([...models, {
        id: String(Date.now()), name: providerLabel,
        version: newModel.version || (versions[0] ?? "自动"),
        modelUrl: newModel.modelUrl, visible: true, isDefault: false,
        dailyLimit: newModel.dailyLimit,
        provider: newModel.provider, versions,
        visibilityScope: "all", visibilityGroupIds: [],
      }]);
      setShowAddDialog(false);
      setNewModel({ provider: "", version: "", modelUrl: "", dailyLimit: 100000 });
      toast.success("模型已添加");
    }
  };

  const openEditQuota = (model: ModelRow) => {
    setEditQuotaModel(model);
    setShowEditQuota(true);
  };

  // 设置默认模型：单选，同时将其他模型的 isDefault 置为 false
  // 仅允许对「用户可见」的模型设为默认
  const handleSetDefault = (id: string, enable: boolean) => {
    const target = models.find((m) => m.id === id);
    if (!target) return;
    if (enable) {
      if (!target.visible) {
        toast.error("请先开启该模型的「用户可见」后再设为默认");
        return;
      }
      const updated = models.map((m) => ({ ...m, isDefault: m.id === id }));
      setModels(updated);
      localStorage.setItem(DEFAULT_MODEL_STORAGE_KEY, id);
      window.dispatchEvent(new StorageEvent("storage", {
        key: DEFAULT_MODEL_STORAGE_KEY,
        newValue: id,
        storageArea: localStorage,
      }));
      toast.success(`已将「${target.name} · ${target.version}」设为默认模型`);
    } else {
      const updated = models.map((m) => ({ ...m, isDefault: false }));
      setModels(updated);
      localStorage.removeItem(DEFAULT_MODEL_STORAGE_KEY);
      window.dispatchEvent(new StorageEvent("storage", {
        key: DEFAULT_MODEL_STORAGE_KEY,
        newValue: null,
        storageArea: localStorage,
      }));
      toast.success("已取消默认模型");
    }
  };

  // 当「用户可见」关闭时，若该模型是默认模型则自动取消默认
  const handleToggleVisible = (id: string, visible: boolean) => {
    const target = models.find((m) => m.id === id);
    if (!target) return;
    let updated = models.map((m) => m.id === id ? { ...m, visible } : m);
    if (!visible && target.isDefault) {
      updated = updated.map((m) => m.id === id ? { ...m, isDefault: false } : m);
      localStorage.removeItem(DEFAULT_MODEL_STORAGE_KEY);
      window.dispatchEvent(new StorageEvent("storage", {
        key: DEFAULT_MODEL_STORAGE_KEY,
        newValue: null,
        storageArea: localStorage,
      }));
      toast.warning(`「${target.name}」已隐藏，默认模型已自动取消`);
    } else {
      toast.success(visible ? "已对用户可见" : "已对用户隐藏");
    }
    setModels(updated);
  };

  return (
    <>
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型配置</h1>
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
            <svg className="mt-0.5 shrink-0 w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <div className="space-y-1">
              <p className="text-xs text-blue-600 leading-relaxed">
                <span className="font-semibold">用户可见：</span>开启后，该模型会展示在用户端的模型选项列表中。
              </p>
              <p className="text-xs text-blue-600 leading-relaxed">
                <span className="font-semibold">默认配置：</span>用户在创建新实例（仅限 OpenClaw，其他 Agent 暂不支持）时，该模型将被自动预添加，用户无需手动配置。
              </p>
            </div>
          </div>
        </div>

        {/* Part 1: Model List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">模型列表</h2>
            </div>
            <Button size="sm" onClick={openAddDialog}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              添加模型
            </Button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">模型名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[26%]">模型 URL</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[13%]">每日 Tokens 上限</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[8%]">用户可见</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[10%]">默认配置</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[10%]">
                  <div className="flex items-center gap-1">
                    应用范围
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          <Info className="w-3 h-3 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                        应用范围决定了哪些用户可以看到该模型，以及哪些用户创建新的 OpenClaw 时自动预添加该模型。「全部用户」表示所有人可见并自动预添加，「按分组」仅对指定分组用户可见并自动预添加。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[5%]">操作</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-400">{model.version}</p>
                      {model.provider === CUSTOM_PROVIDER_VALUE && model.isMultimodal && (
                        <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-500 border border-blue-100">
                          多模态
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 font-mono whitespace-nowrap">{model.modelUrl}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-700">{model.dailyLimit.toLocaleString()}</span>
                      <button
                        onClick={() => openEditQuota(model)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="编辑配额"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <Switch
                      checked={model.visible}
                      onCheckedChange={(v) => handleToggleVisible(model.id, v)}
                    />
                  </td>
                  {/* 默认模型单选 */}
                  <td className="px-4 py-4 align-middle">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Switch
                            checked={model.isDefault}
                            onCheckedChange={(v) => handleSetDefault(model.id, v)}
                            disabled={!model.visible && !model.isDefault}
                            aria-label={model.isDefault ? "当前默认模型" : "设为默认模型"}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {model.isDefault
                          ? "当前默认模型"
                          : model.visible
                            ? "点击设为默认模型"
                            : "需先开启「用户可见」才可设为默认"}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 应用范围 */}
                  <td className="px-4 py-4 align-middle">
                    <ScopePopover
                      model={model}
                      groups={model.id === "4" ? [] : MOCK_GROUPS}
                      onSave={(id, scope, groupIds) => {
                        setModels((prev) =>
                          prev.map((m) =>
                            m.id === id ? { ...m, visibilityScope: scope, visibilityGroupIds: groupIds } : m
                          )
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <button
                      onClick={() => setDeleteConfirmModel(model)}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


        </div>


      </div>

      {/* Add Model Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 模型厂商选择（含自定义模型） */}
            <div className="space-y-2">
              <Label>模型厂商</Label>
              <Select
                value={newModel.provider}
                onValueChange={(v) => setNewModel({ ...newModel, provider: v, version: "" })}
              >
                <SelectTrigger className="bg-gray-50 w-full">
                  <SelectValue placeholder="选择模型厂商或自定义模型" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 厂商模型：版本 + API Key + 每日上限 */}
            {newModel.provider && !isCustomProvider && (
              <>
                <div className="space-y-2">
                  <Label>模型名称</Label>
                  {selectedProviderData && selectedProviderData.versions.length > 0 ? (
                    <Select value={newModel.version} onValueChange={(v) => setNewModel({ ...newModel, version: v })}>
                      <SelectTrigger className="bg-gray-50 w-full">
                        <SelectValue placeholder="选择模型版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProviderData.versions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="bg-gray-50 w-full px-3 py-2 rounded-md border border-gray-200 text-gray-500 text-sm">
                      暂无可用的模型版本
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>模型 URL</Label>
                  <Input
                    type="text"
                    placeholder="请输入模型 URL地址"
                    value={newModel.modelUrl}
                    onChange={(e) => setNewModel({ ...newModel, modelUrl: e.target.value })}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={newModel.dailyLimit}
                    onChange={(e) => setNewModel({ ...newModel, dailyLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
              </>
            )}

            {/* 自定义模型：JSON 或表单 */}
            {isCustomProvider && (
              <>
                <Tabs value={customInputMode} onValueChange={(v) => setCustomInputMode(v as "json" | "form")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="json" className="flex-1">JSON 输入</TabsTrigger>
                    <TabsTrigger value="form" className="flex-1">表单输入</TabsTrigger>
                  </TabsList>
                  <TabsContent value="json" className="mt-3">
                    <Textarea
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      className="font-mono text-xs bg-gray-50 border-gray-200 min-h-48"
                    />
                  </TabsContent>
                  <TabsContent value="form" className="mt-3 space-y-3">
                    {[
                      { key: "provider", label: "请输入自定义模型 provider" },
                      { key: "base_url", label: "请输入自定义模型 base_url" },
                      { key: "api", label: "请输入自定义模型 api" },
                      { key: "api_key", label: "请输入自定义模型 api_key" },
                      { key: "model_id", label: "请输入自定义模型 model.id" },
                      { key: "model_name", label: "请输入自定义模型 model.name" },
                    ].map((field) => (
                      <Input
                        key={field.key}
                        placeholder={field.label}
                        value={(customForm as any)[field.key]}
                        onChange={(e) => setCustomForm({ ...customForm, [field.key]: e.target.value })}
                        className="bg-gray-50"
                      />
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="space-y-2">
                  <Label>每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={customForm.dailyLimit}
                    onChange={(e) => setCustomForm({ ...customForm, dailyLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">多模态模型</p>
                    <p className="text-xs text-gray-400 mt-0.5">支持图片、文字多模态输入</p>
                  </div>
                  <Switch
                    checked={customForm.isMultimodal}
                    onCheckedChange={(v) => setCustomForm({ ...customForm, isMultimodal: v })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button
              onClick={handleAddModel}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmModel} onOpenChange={(open) => { if (!open) setDeleteConfirmModel(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              确认删除模型
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              确定要删除模型 <span className="font-medium text-gray-900">{deleteConfirmModel?.name}</span>（{deleteConfirmModel?.version}）吗？
            </p>
            {deleteConfirmModel?.isDefault && (
              <p className="text-sm text-amber-600 font-medium">
                该模型当前为默认模型，删除后将取消默认设置。
              </p>
            )}
            <p className="text-sm text-red-500 font-medium">删除后用户将无法使用该模型，此操作不可撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmModel(null)}>取消</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteConfirmModel?.isDefault) {
                  localStorage.removeItem(DEFAULT_MODEL_STORAGE_KEY);
                }
                setModels(models.filter((m) => m.id !== deleteConfirmModel!.id));
                setDeleteConfirmModel(null);
                toast.success("模型已删除");
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quota Dialog */}
      <EditQuotaDialog
        model={editQuotaModel}
        open={showEditQuota}
        onClose={() => setShowEditQuota(false)}
        onSave={(id, limit) => {
          setModels(models.map((m) => m.id === id ? { ...m, dailyLimit: limit } : m));
          toast.success("配额已更新");
        }}
      />
    </>
  );
}
