/**
 * ModelConfig - 管控端模型配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActionCell } from "@/components/ui/table";
import { StatusTag } from "@/components/ui/status-tag";
import { PanelTitle, BodyText } from "@/components/ui/Typography";
import { Textarea } from "@/components/ui/textarea";
import { SurfaceCard } from "@/components/ui/Surface";
import {
  Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Plus, Info, Pencil, Trash2, X, AlertTriangle,
} from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/mockData";
import type { UserGroup } from "./MemberManagement/types";
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import {
  CUSTOM_PROVIDER_VALUE,
  useAdminModelsState,
  type ModelRow,
} from "@/lib/modelConfigStore";
import { ScopeEditPopover, type ScopeType } from "@/components/ScopeEditPopover";

// 模型配置页不区分 OneID/普通模式，合并展示所有分组
const ALL_GROUPS: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];

// 每个厂商对应的子版本列表
const PROVIDER_VERSIONS: Record<string, string[]> = {};
AVAILABLE_MODELS.forEach((m) => {
  PROVIDER_VERSIONS[m.value] = m.versions;
});

// 自定义模型选项值 / 模型行类型 / 默认数据均迁移到 lib/modelConfigStore.ts，
// 这里只继续维护"下拉选项"等纯 UI 派生数据。

// 下拉选项：厂商 + 自定义模型
const PROVIDER_OPTIONS = [
  ...AVAILABLE_MODELS.map((m) => ({ value: m.value, label: m.label })),
  { value: CUSTOM_PROVIDER_VALUE, label: "自定义模型" },
];

// localStorage key，供用户端读取
const DEFAULT_MODEL_STORAGE_KEY = "adminDefaultModelId";

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

// ─── 分组路径工具函数 ─────────────────────────────────────
/** 获取分组的完整路径（如 "全公司/技术部/前端组"） */
function getGroupPath(groupId: string, groups: UserGroup[]): string {
  const map = new Map(groups.map((g) => [g.id, g]));
  const chain: string[] = [];
  let cur = map.get(groupId);
  while (cur) {
    chain.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return chain.join("/");
}

// 应用范围 Popover 编辑面板（复用通用 ScopeEditPopover 组件）
function ScopePopover({
  model,
  groups,
  onSave,
}: {
  model: ModelRow;
  groups: UserGroup[];
  onSave: (id: string, scope: ScopeType, groupIds: string[]) => void;
}) {
  const selectedGroupPaths = useMemo(() => (
    model.visibilityGroupIds
      .map((gid) => getGroupPath(gid, groups))
      .filter(Boolean)
  ), [groups, model.visibilityGroupIds]);

  const renderScopeText = () => {
    if (model.visibilityScope === "all" || selectedGroupPaths.length === 0) {
      return <span className="text-sm font-normal text-[#0A0A0A]">全部用户</span>;
    }

    const firstName = selectedGroupPaths[0];
    const rest = selectedGroupPaths.length - 1;
    const tooltipText = selectedGroupPaths.join("\n");

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex max-w-full items-center gap-1 cursor-default text-sm font-normal text-[#0A0A0A]">
            <span className="truncate">{firstName}</span>
            {rest > 0 && <span className="shrink-0">+{rest}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] text-xs leading-relaxed whitespace-pre-line">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5 min-h-[20px] max-w-[220px]">
      {renderScopeText()}
      <ScopeEditPopover
        scope={model.visibilityScope}
        selectedGroupIds={model.visibilityGroupIds}
        groups={groups}
        showBadges={false}
        align="start"
        trigger={
          <button
            type="button"
            className="self-center text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
            title="编辑应用范围"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="w-3 h-3" />
          </button>
        }
        onConfirm={(scope, groupIds) => {
          onSave(model.id, scope, groupIds);
          toast.success("应用范围已更新");
        }}
      />
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
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>编辑配额 — {model.name}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex-1">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[#525252]">每日 Tokens 数量上限</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="claw-outline" size="claw-sm" onClick={onClose}>取消</Button>
          <Button
            variant="dialog-confirm"
            size="claw-sm"
            onClick={() => { onSave(model.id, limit); onClose(); }}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ModelConfig() {
  const [models, setModels] = useAdminModelsState();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customInputMode, setCustomInputMode] = useState<"json" | "form">("form");
  // 删除二次确认弹窗
  const [deleteConfirmModel, setDeleteConfirmModel] = useState<ModelRow | null>(null);

  // 编辑配额弹窗
  const [editQuotaModel, setEditQuotaModel] = useState<ModelRow | null>(null);
  const [showEditQuota, setShowEditQuota] = useState(false);

  // 多模态切换二次确认弹窗
  const [multimodalConfirm, setMultimodalConfirm] = useState<{ model: ModelRow; enable: boolean } | null>(null);

  // 连通性检测
  const [connectTesting, setConnectTesting] = useState(false);
  const [connectFailResult, setConnectFailResult] = useState<string | null>(null);

  // Add form state — 统一用一个 provider 字段，默认选第一个厂商
  const [newModel, setNewModel] = useState({
    provider: PROVIDER_OPTIONS[0]?.value ?? "", version: "", modelUrl: "", dailyLimit: 100000,
  });
  const [customForm, setCustomForm] = useState({
    provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "", dailyLimit: 100000, isMultimodal: false,
  });
  const [customJson, setCustomJson] = useState(DEFAULT_JSON);

  // 连通性检测：校验必填字段后模拟请求
  const handleConnectTest = async () => {
    // 校验：厂商模型需要 version + modelUrl；自定义模型（表单）需要 base_url + api_key + model_id
    if (isCustomProvider) {
      if (customInputMode === "form") {
        if (!customForm.base_url || !customForm.api_key || !customForm.model_id) {
          toast.error("请填写完整的模型配置信息");
          return;
        }
      } else {
        if (!customJson.trim()) {
          toast.error("请填写完整的模型配置信息");
          return;
        }
      }
    } else {
      if (!newModel.version || !newModel.modelUrl) {
        toast.error("请填写完整的模型配置信息");
        return;
      }
    }
    setConnectTesting(true);
    // 模拟网络请求（实际接入后替换为真实 API 调用）
    await new Promise((r) => setTimeout(r, 1500));
    setConnectTesting(false);
    // 模拟检测失败，展示错误弹窗
    setConnectFailResult(JSON.stringify({
      error: {
        message: "Invalid API Key",
        param: "Please provide valid API Key",
        code: "401",
        type: "invalid_key",
      }
    }, null, 2));
  };

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

  // 切换多模态属性（仅自定义模型）
  const handleToggleMultimodal = (id: string, value: boolean) => {
    const target = models.find((m) => m.id === id);
    if (!target) return;
    setModels(models.map((m) => m.id === id ? { ...m, isMultimodal: value } : m));
    toast.success(value ? `已为「${target.name}」开启多模态` : `已为「${target.name}」关闭多模态`);
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

  const visibleModelCount = useMemo(() => models.filter((model) => model.visible).length, [models]);
  const defaultModel = useMemo(() => models.find((model) => model.isDefault), [models]);
  const scopedModelCount = useMemo(() => models.filter((model) => model.visibilityScope === "groups").length, [models]);

  return (
    <>
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">模型配置</h1>
          <p className="mt-2 text-sm text-[#737373]">统一管理平台可用模型、接入地址、每日配额与应用范围。</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <SurfaceCard className="p-4">
            <p className="text-xs text-[#737373]">已配置模型</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums font-din text-[#020617]">{models.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-[#737373]">用户可见</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums font-din text-[#020617]">{visibleModelCount}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-[#737373]">默认模型</p>
            <p className="mt-2 truncate text-sm font-medium text-[#0A0A0A]">
              {defaultModel ? `${defaultModel.name} · ${defaultModel.version}` : "未设置"}
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-[#737373]">按分组可见</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums font-din text-[#020617]">{scopedModelCount}</p>
          </SurfaceCard>
        </div>

        <div className="flex items-center justify-between !mt-16">
          <div>
            <PanelTitle>模型列表</PanelTitle>
            <BodyText as="p" tone="muted" className="mt-1">集中管理模型接入、配额、用户可见性与默认配置。</BodyText>
          </div>
          <Button variant="claw-primary" size="claw-sm" onClick={openAddDialog}>
            <Plus className="w-3.5 h-3.5" />
            添加模型
          </Button>
        </div>

        <SurfaceCard className="overflow-hidden">
          <Table scrollX={1406}>
            <TableHeader>
              <TableRow>
                <TableHead fixed="left" style={{ width: 220, minWidth: 220, maxWidth: 220 }}>模型信息</TableHead>
                <TableHead className="w-[280px]">接入地址</TableHead>
                <TableHead className="w-[150px]">每日配额</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-1">
                    用户可见
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          <Info className="w-3 h-3 text-[#A3A3A3]" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
                        开启后，该模型会展示在用户端的模型选项列表中。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-1">
                    默认配置
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          <Info className="w-3 h-3 text-[#A3A3A3]" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                        用户在创建新实例时，该模型将被自动预添加，用户无需手动配置。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="w-[160px]">是否启用多模态</TableHead>
                <TableHead className="w-[220px]">
                  <div className="flex items-center gap-1">
                    应用范围
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          <Info className="w-3 h-3 text-[#A3A3A3]" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                        应用范围决定哪些用户可以看到该模型，以及哪些用户创建新的 Agent 时自动预添加该模型。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead fixed="right" style={{ width: 96, minWidth: 96, maxWidth: 96 }}>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => {
                const canToggleMultimodal = model.provider === CUSTOM_PROVIDER_VALUE;

                return (
                  <TableRow key={model.id}>
                    <TableCell fixed="left" style={{ width: 220, minWidth: 220, maxWidth: 220 }}>
                      <div className="min-w-0 space-y-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium text-[#0A0A0A]">{model.name}</p>
                          {model.isDefault && <StatusTag mode="fill" variant="blue">默认</StatusTag>}
                        </div>
                        <p className="truncate text-xs text-[#737373]">{model.version}</p>
                      </div>
                    </TableCell>
                    <TableCell className="w-[280px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex max-w-[248px] cursor-default rounded-[4px] border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 font-mono text-xs text-[#334155]">
                            <span className="truncate">{model.modelUrl}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px] text-xs font-mono break-all">
                          {model.modelUrl}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium tabular-nums text-[#020617]">{model.dailyLimit.toLocaleString()}</span>
                        <button
                          type="button"
                          className="inline-flex items-center text-[#A3A3A3] transition-colors hover:text-[#1447E6]"
                          onClick={() => openEditQuota(model)}
                          aria-label="编辑每日配额"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="flex min-h-9 items-center">
                        <Switch
                          checked={model.visible}
                          onCheckedChange={(v) => handleToggleVisible(model.id, v)}
                          aria-label={model.visible ? "关闭用户可见" : "开启用户可见"}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="flex min-h-9 items-center">
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
                      </div>
                    </TableCell>
                    <TableCell className="w-[160px]">
                      <div className="flex min-h-9 items-center">
                        {canToggleMultimodal ? (
                          <Switch
                            checked={model.isMultimodal}
                            onCheckedChange={(value) => setMultimodalConfirm({ model, enable: value })}
                            aria-label={model.isMultimodal ? "关闭多模态" : "开启多模态"}
                          />
                        ) : (
                          <span className="text-sm font-normal text-[#737373]">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[220px]">
                      <ScopePopover
                        model={model}
                        groups={ALL_GROUPS}
                        onSave={(id, scope, groupIds) => {
                          setModels((prev) =>
                            prev.map((m) =>
                              m.id === id ? { ...m, visibilityScope: scope, visibilityGroupIds: groupIds } : m
                            )
                          );
                        }}
                      />
                    </TableCell>
                    <TableActionCell fixed="right" style={{ width: 96, minWidth: 96, maxWidth: 96 }} actionsClassName="justify-start">
                      <Button variant="link" size="sm" className="text-[14px]" onClick={() => setDeleteConfirmModel(model)}>
                        删除
                      </Button>
                    </TableActionCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SurfaceCard>


      </div>

      {/* Add Model Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 模型厂商选择（含自定义模型） */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#525252]">模型厂商</Label>
              <Select
                value={newModel.provider}
                onValueChange={(v) => setNewModel({ ...newModel, provider: v, version: "" })}
              >
                <SelectTrigger className="w-full rounded-[4px] border-[#E5E5E5] bg-white">
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#525252]">模型名称</Label>
                  {selectedProviderData && selectedProviderData.versions.length > 0 ? (
                    <Select value={newModel.version} onValueChange={(v) => setNewModel({ ...newModel, version: v })}>
                      <SelectTrigger className="w-full rounded-[4px] border-[#E5E5E5] bg-white">
                        <SelectValue placeholder="选择模型版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProviderData.versions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="w-full px-3 py-2 rounded-[4px] border border-[#E5E5E5] bg-[#FAFAFA] text-[#A3A3A3] text-sm">
                      暂无可用的模型版本
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#525252]">模型 URL</Label>
                  <Input
                    type="text"
                    placeholder="请输入模型 URL地址"
                    value={newModel.modelUrl}
                    onChange={(e) => setNewModel({ ...newModel, modelUrl: e.target.value })}
                    className="rounded-[4px] border-[#E5E5E5] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#525252]">每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={newModel.dailyLimit}
                    onChange={(e) => setNewModel({ ...newModel, dailyLimit: Number(e.target.value) })}
                    className="rounded-[4px] border-[#E5E5E5] bg-white"
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
                      className="font-mono text-xs rounded-[4px] border-[#E5E5E5] bg-white min-h-48"
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
                        className="rounded-[4px] border-[#E5E5E5] bg-white"
                      />
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#525252]">每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={customForm.dailyLimit}
                    onChange={(e) => setCustomForm({ ...customForm, dailyLimit: Number(e.target.value) })}
                    className="rounded-[4px] border-[#E5E5E5] bg-white"
                  />
                </div>
                <div className="rounded-[4px] border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">多模态模型</p>
                    <p className="text-xs text-[#737373] mt-0.5">支持图片、文字多模态输入</p>
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
            <Button variant="claw-outline" size="claw-sm" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button variant="claw-primary" size="claw-sm" onClick={handleAddModel}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog —— 遵循项目标准警示弹窗规范：
            - 标题使用黑色（#0A0A0A）
            - 正文普通文字使用黑色
            - 强调文字使用告警色 #d42a1e
            - 主按钮使用 destructive variant（红底白字）
            - 右上角带关闭按钮
       */}
      <AlertDialog open={!!deleteConfirmModel} onOpenChange={(open) => { if (!open) setDeleteConfirmModel(null); }}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setDeleteConfirmModel(null)}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">
              确认删除模型？
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-sm text-[#0A0A0A]">确定要删除模型 <span className="font-medium">{deleteConfirmModel?.name}</span>（{deleteConfirmModel?.version}）吗？<span className="text-[#DC2626]">{deleteConfirmModel?.isDefault && '该模型当前为默认模型，删除后将取消默认设置。'}删除后用户将无法使用该模型，此操作不可撤销。</span></p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant="claw-outline" size="claw-sm" onClick={() => setDeleteConfirmModel(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              size="claw-sm"
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* 多模态切换二次确认弹窗 */}
      <Dialog open={!!multimodalConfirm} onOpenChange={(open) => { if (!open) setMultimodalConfirm(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#0A0A0A]">
              {multimodalConfirm?.enable ? "开启多模态" : "关闭多模态"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#334155] leading-relaxed">
              {multimodalConfirm?.enable
                ? `确认开启「${multimodalConfirm.model.name}」的多模态属性么？开启后用户可在对话中上传图片等多模态内容`
                : `确认关闭「${multimodalConfirm?.model.name}」的多模态属性么？关闭后用户将无法在该模型下上传图片等多模态内容。`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="claw-outline" onClick={() => setMultimodalConfirm(null)}>取消</Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                if (multimodalConfirm) {
                  handleToggleMultimodal(multimodalConfirm.model.id, multimodalConfirm.enable);
                  setMultimodalConfirm(null);
                }
              }}
            >
              {multimodalConfirm?.enable ? "确认开启" : "确认关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 连通性检测失败弹窗 */}
      <Dialog open={!!connectFailResult} onOpenChange={() => setConnectFailResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              模型连接失败
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <pre className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
              {connectFailResult}
            </pre>
          </div>
          <DialogFooter>
            <Button
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              className="text-white"
              onClick={() => setConnectFailResult(null)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
