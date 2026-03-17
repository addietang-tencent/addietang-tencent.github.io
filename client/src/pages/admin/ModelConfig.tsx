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
import { toast } from "sonner";
import {
  Plus, Trash2, Info, Brain, Zap, Pencil, AlertTriangle,
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

interface ModelRow {
  id: string;
  name: string;
  version: string;
  modelUrl: string;
  visible: boolean;
  dailyLimit: number;
  provider: string; // 对应 AVAILABLE_MODELS.value
  versions: string[]; // 该厂商可用的版本列表
}

const MOCK_MODELS: ModelRow[] = [
  {
    id: "1", name: "腾讯云 DeepSeek", version: "DeepSeek V3 0324",
    modelUrl: "https://api.lkeap.cloud.tencent.com/v1", visible: true, dailyLimit: 500000,
    provider: "tencent-deepseek",
    versions: ["DeepSeek V3 0324", "DeepSeek R1", "DeepSeek V2.5"],
  },
  {
    id: "2", name: "腾讯云混元", version: "混元 TurboS Latest",
    modelUrl: "https://hunyuan.tencentcloudapi.com", visible: true, dailyLimit: 200000,
    provider: "tencent-hunyuan",
    versions: ["混元 TurboS Latest", "混元 Pro", "混元 Standard"],
  },
  {
    id: "3", name: "腾讯云 DeepSeek", version: "DeepSeek R1",
    modelUrl: "https://api.lkeap.cloud.tencent.com/v1", visible: false, dailyLimit: 100000,
    provider: "tencent-deepseek",
    versions: ["DeepSeek V3 0324", "DeepSeek R1", "DeepSeek V2.5"],
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
    provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "", dailyLimit: 100000,
  });
  const [customJson, setCustomJson] = useState(DEFAULT_JSON);

  // Global quota
  const [globalLimitMode, setGlobalLimitMode] = useState<"unlimited" | "custom">("unlimited"); // 无限制或自定义
  const [globalLimit, setGlobalLimit] = useState(1000000);
  const [globalLimitEditing, setGlobalLimitEditing] = useState(false);
  const [globalLimitDraft, setGlobalLimitDraft] = useState(1000000);
  const [allowCustomModel, setAllowCustomModel] = useState(false);
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
        modelUrl: customForm.base_url || "", visible: true, dailyLimit: customForm.dailyLimit,
        provider: CUSTOM_PROVIDER_VALUE, versions: [],
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
        modelUrl: newModel.modelUrl, visible: true,
        dailyLimit: newModel.dailyLimit,
        provider: newModel.provider, versions,
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

  return (
    <>
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型配置</h1>
          <p className="text-sm text-gray-500 mt-1">
            配置企业用户可使用的大模型。配置好的模型会展示在企业用户的模型选择里；如果只有一个模型，企业用户将直接使用，无需选择。
          </p>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">模型名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[38%]">模型 URL</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[20%]">每日 Tokens 上限</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[13%]">用户可见</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[7%]">操作</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-400">{model.version}</p>
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
                  <td className="px-4 py-4">
                    <Switch
                      checked={model.visible}
                      onCheckedChange={(v) => {
                        setModels(models.map((m) => m.id === model.id ? { ...m, visible: v } : m));
                        toast.success(v ? "已对用户可见" : "已对用户隐藏");
                      }}
                    />
                  </td>
                  <td className="px-4 py-4">
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

          {/* 允许用户自定义模型开关 — 列表末尾 */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <Switch
              checked={allowCustomModel}
              onCheckedChange={(v) => { setAllowCustomModel(v); toast.success(v ? "已允许用户添加自定义模型" : "已禁止用户添加自定义模型"); }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">允许用户添加自定义模型</p>
              <p className="text-xs text-gray-400 mt-0.5">
                开启后，用户可在 OpenClaw 中自行添加自定义模型，不在企业管控和 Tokens 覆盖范围内
              </p>
            </div>
          </div>
        </div>

        {/* Part 2: Global Quota */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">全局配额设置</h2>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              每日全局 TOKENS 上限
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  全局 Tokens 指所有企业用户使用所有模型所消耗的总 Tokens 数量，达到上限后当日将暂停服务
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select
              value={globalLimitMode}
              onValueChange={(v) => {
                setGlobalLimitMode(v as "unlimited" | "custom");
                setGlobalLimitEditing(false);
                toast.success(v === "unlimited" ? "已设置为无限制" : "已切换为自定义数量");
              }}
            >
              <SelectTrigger className="bg-gray-50 w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlimited">无限制</SelectItem>
                <SelectItem value="custom">自定义数量</SelectItem>
              </SelectContent>
            </Select>
            {/* 当选择「自定义数量」时，显示数量输入框 */}
            {globalLimitMode === "custom" && (
              <div className="mt-4 space-y-3">
                {globalLimitEditing ? (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={globalLimitDraft}
                      onChange={(e) => setGlobalLimitDraft(Number(e.target.value))}
                      className="bg-gray-50 border-gray-200 max-w-xs"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => { setGlobalLimit(globalLimitDraft); setGlobalLimitEditing(false); toast.success("全局配额已保存"); }}
                      style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setGlobalLimitDraft(globalLimit); setGlobalLimitEditing(false); }}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-700">{globalLimit.toLocaleString()}</span>
                    <button
                      onClick={() => { setGlobalLimitDraft(globalLimit); setGlobalLimitEditing(true); }}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="编辑全局配额"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
                {selectedProviderData && selectedProviderData.versions.length > 0 && (
                  <div className="space-y-2">
                    <Label>模型名称</Label>
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
                  </div>
                )}
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
            <p className="text-sm text-red-500 font-medium">删除后用户将无法使用该模型，此操作不可撤销。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmModel(null)}>取消</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
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
