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
import { Badge } from "@/components/ui/badge";
import { PanelTitle, BodyText, UrlText, StatNumber } from "@/components/ui/Typography";
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
      return <Badge variant="outline">全部用户</Badge>;
    }

    const firstName = selectedGroupPaths[0];
    const rest = selectedGroupPaths.length - 1;
    const tooltipText = selectedGroupPaths.join("\n");

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="max-w-full cursor-default">
            <span className="truncate">{firstName}</span>
            {rest > 0 && <span className="shrink-0">+{rest}</span>}
          </Badge>
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
        align="end"
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
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1557 0.568474C11.2759 0.547602 11.3997 0.565694 11.5083 0.621208C11.6168 0.676751 11.7039 0.766463 11.7573 0.876091C11.8107 0.985788 11.8275 1.10986 11.8042 1.22961L10.77 6.39172L14.8227 7.91125C14.9089 7.94398 14.9857 7.99716 15.0464 8.06652C15.1071 8.13609 15.1505 8.2197 15.1714 8.30968C15.1922 8.39969 15.1905 8.4939 15.1665 8.58312C15.1425 8.67222 15.0968 8.75406 15.0337 8.8214H15.0366L7.1616 17.2589L7.09421 17.3204C7.0224 17.3757 6.9373 17.4131 6.84714 17.4288L6.7573 17.4366C6.69672 17.4373 6.63627 17.4288 6.57859 17.4103L6.49461 17.3751C6.386 17.3195 6.29798 17.2299 6.24461 17.1202C6.20472 17.0381 6.18625 16.9479 6.18894 16.8575L6.19871 16.7667L7.22996 11.6105L3.17722 10.089C3.11208 10.0646 3.05213 10.0285 3.00046 9.98254L2.95164 9.93273C2.9057 9.8803 2.86992 9.82011 2.84617 9.755L2.82664 9.68859C2.80577 9.59809 2.80709 9.50378 2.83152 9.41418C2.85597 9.32456 2.90234 9.2423 2.96629 9.17492L10.8413 0.737419C10.9247 0.648358 11.0355 0.589437 11.1557 0.568474ZM5.34324 9.09972L9.1655 10.5353L8.63035 13.2111L11.1528 10.5089H11.1401L12.6479 8.89758L8.83445 7.46789L9.37058 4.78527L5.34324 9.09972Z" fill="url(#mc_icon_0)"/><defs><radialGradient id="mc_icon_0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.81201 8.99836) scale(12.3738 747.725)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm text-[#737373]">已配置模型</span>
            </div>
            <StatNumber>{models.length}</StatNumber>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.02805 6.22195C4.86954 6.06344 4.78049 5.84846 4.78049 5.6243C4.78049 5.40013 4.86954 5.18515 5.02805 5.02664C5.18656 4.86813 5.40154 4.77908 5.6257 4.77908C5.84987 4.77908 6.06485 4.86813 6.22336 5.02664L8.15625 6.96094V1.6875C8.15625 1.46372 8.24514 1.24911 8.40338 1.09088C8.56161 0.932645 8.77622 0.84375 9 0.84375C9.22378 0.84375 9.43839 0.932645 9.59662 1.09088C9.75485 1.24911 9.84375 1.46372 9.84375 1.6875V6.96094L11.778 5.02594C11.9366 4.86743 12.1515 4.77838 12.3757 4.77838C12.5999 4.77838 12.8149 4.86743 12.9734 5.02594C13.1319 5.18445 13.2209 5.39943 13.2209 5.62359C13.2209 5.84776 13.1319 6.06274 12.9734 6.22125L9.59836 9.59625C9.51997 9.67491 9.42683 9.73732 9.32427 9.77991C9.22171 9.82249 9.11175 9.84442 9.0007 9.84442C8.88965 9.84442 8.7797 9.82249 8.67714 9.77991C8.57458 9.73732 8.48143 9.67491 8.40305 9.59625L5.02805 6.22195ZM15.75 8.15625H13.2188C12.995 8.15625 12.7804 8.24514 12.6221 8.40338C12.4639 8.56161 12.375 8.77622 12.375 9C12.375 9.22378 12.4639 9.43839 12.6221 9.59662C12.7804 9.75485 12.995 9.84375 13.2188 9.84375H15.4688V13.7812H2.53125V9.84375H4.78125C5.00503 9.84375 5.21964 9.75485 5.37787 9.59662C5.53611 9.43839 5.625 9.22378 5.625 9C5.625 8.77622 5.53611 8.56161 5.37787 8.40338C5.21964 8.24514 5.00503 8.15625 4.78125 8.15625H2.25C1.87704 8.15625 1.51935 8.30441 1.25563 8.56813C0.991908 8.83185 0.84375 9.18954 0.84375 9.5625V14.0625C0.84375 14.4355 0.991908 14.7931 1.25563 15.0569C1.51935 15.3206 1.87704 15.4688 2.25 15.4688H15.75C16.123 15.4688 16.4806 15.3206 16.7444 15.0569C17.0081 14.7931 17.1562 14.4355 17.1562 14.0625V9.5625C17.1563 9.18954 17.0081 8.83185 16.7444 8.56813C16.4806 8.30441 16.123 8.15625 15.75 8.15625ZM14.3438 11.8125C14.3438 11.59 14.2778 11.3725 14.1542 11.1875C14.0305 11.0025 13.8548 10.8583 13.6493 10.7731C13.4437 10.688 13.2175 10.6657 12.9993 10.7091C12.781 10.7525 12.5806 10.8597 12.4233 11.017C12.2659 11.1743 12.1588 11.3748 12.1154 11.593C12.072 11.8113 12.0942 12.0375 12.1794 12.243C12.2645 12.4486 12.4087 12.6243 12.5937 12.7479C12.7787 12.8715 12.9962 12.9375 13.2188 12.9375C13.5171 12.9375 13.8033 12.819 14.0142 12.608C14.2252 12.397 14.3438 12.1109 14.3438 11.8125Z" fill="url(#mc_icon_1)"/><defs><radialGradient id="mc_icon_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.843749 8.15625) scale(16.3125 647.966)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm text-[#737373]">用户可见</span>
            </div>
            <StatNumber>{visibleModelCount}</StatNumber>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6322 7.68155L12.2953 6.10444L10.7182 1.76757C10.6198 1.49691 10.4405 1.26309 10.2047 1.09786C9.9688 0.932629 9.68779 0.843994 9.39982 0.843994C9.11184 0.843994 8.83084 0.932629 8.59498 1.09786C8.35912 1.26309 8.17983 1.49691 8.08146 1.76757L6.50435 6.10444L2.16747 7.68155C1.89682 7.77992 1.66299 7.95921 1.49776 8.19507C1.33253 8.43093 1.2439 8.71193 1.2439 8.99991C1.2439 9.28789 1.33253 9.56889 1.49776 9.80475C1.66299 10.0406 1.89682 10.2199 2.16747 10.3183L6.50435 11.8954L8.08146 16.2323C8.17983 16.5029 8.35912 16.7367 8.59498 16.902C8.83084 17.0672 9.11184 17.1558 9.39982 17.1558C9.68779 17.1558 9.9688 17.0672 10.2047 16.902C10.4405 16.7367 10.6198 16.5029 10.7182 16.2323L12.2953 11.8954L16.6322 10.3183C16.9028 10.2199 17.1366 10.0406 17.3019 9.80475C17.4671 9.56889 17.5557 9.28789 17.5557 8.99991C17.5557 8.71193 17.4671 8.43093 17.3019 8.19507C17.1366 7.95921 16.9028 7.77992 16.6322 7.68155ZM11.3489 10.4441C11.2329 10.4863 11.1277 10.5533 11.0404 10.6405C10.9532 10.7278 10.8862 10.833 10.844 10.949L9.39982 14.9209L7.9556 10.949C7.91347 10.833 7.84643 10.7278 7.7592 10.6405C7.67198 10.5533 7.56669 10.4863 7.45075 10.4441L3.4788 8.99991L7.45075 7.55569C7.56669 7.51356 7.67198 7.44653 7.7592 7.3593C7.84643 7.27208 7.91347 7.16679 7.9556 7.05085L9.39982 3.0789L10.844 7.05085C10.8862 7.16679 10.9532 7.27208 11.0404 7.3593C11.1277 7.44653 11.2329 7.51356 11.3489 7.55569L15.3208 8.99991L11.3489 10.4441Z" fill="url(#mc_icon_2)"/><defs><radialGradient id="mc_icon_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.2439 8.99991) scale(16.3118 722.702)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm text-[#737373]">默认模型</span>
            </div>
            <p className="truncate text-sm leading-none font-medium text-[#0A0A0A]">
              {defaultModel ? `${defaultModel.name} · ${defaultModel.version}` : "未设置"}
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7085 0.84375C12.9323 0.84375 13.1469 0.932586 13.3052 1.09082C13.4634 1.24905 13.5522 1.46372 13.5522 1.6875V1.96875H14.9585C15.3315 1.96875 15.6889 2.11714 15.9526 2.38086C16.2164 2.64458 16.3647 3.00204 16.3647 3.375V14.625C16.3647 14.998 16.2164 15.3554 15.9526 15.6191C15.6889 15.8829 15.3315 16.0312 14.9585 16.0312H3.7085C3.33554 16.0312 2.97808 15.8829 2.71436 15.6191C2.45063 15.3554 2.30225 14.998 2.30225 14.625V3.375C2.30225 3.00204 2.45063 2.64458 2.71436 2.38086C2.97808 2.11714 3.33554 1.96875 3.7085 1.96875H5.11475V1.6875C5.11475 1.46372 5.20358 1.24905 5.36182 1.09082C5.52005 0.932587 5.73472 0.84375 5.9585 0.84375C6.18227 0.84375 6.39694 0.932587 6.55518 1.09082C6.71341 1.24905 6.80225 1.46372 6.80225 1.6875V1.96875H11.8647V1.6875C11.8647 1.46372 11.9536 1.24905 12.1118 1.09082C12.2701 0.932586 12.4847 0.84375 12.7085 0.84375ZM3.98975 3.65625V14.3438H14.6772V3.65625H13.5522C13.5522 3.88003 13.4634 4.0947 13.3052 4.25293C13.1469 4.41116 12.9323 4.5 12.7085 4.5C12.4847 4.5 12.2701 4.41116 12.1118 4.25293C11.9536 4.0947 11.8647 3.88003 11.8647 3.65625H6.80225C6.80225 3.88003 6.71341 4.0947 6.55518 4.25293C6.39694 4.41116 6.18227 4.5 5.9585 4.5C5.73472 4.5 5.52005 4.41116 5.36182 4.25293C5.20358 4.0947 5.11475 3.88003 5.11475 3.65625H3.98975ZM9.01709 5.70508C9.12582 5.41124 9.54117 5.41124 9.6499 5.70508L10.4731 7.92871L12.6968 8.75195C12.9905 8.86075 12.9906 9.27605 12.6968 9.38477L10.4731 10.208L9.6499 12.4316C9.54784 12.7068 9.1762 12.7242 9.04053 12.4834L9.01709 12.4316L8.19385 10.208L5.97021 9.38477C5.67641 9.27605 5.67647 8.86073 5.97021 8.75195L8.19385 7.92871L9.01709 5.70508Z" fill="url(#mc_icon_3)"/><defs><radialGradient id="mc_icon_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.30225 8.4375) scale(14.0625 672.888)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>
              <span className="text-sm text-[#737373]">按分组可见</span>
            </div>
            <StatNumber>{scopedModelCount}</StatNumber>
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
                          {model.isDefault && <Badge variant="secondary">默认</Badge>}
                        </div>
                        <p className="truncate text-xs text-[#737373]">{model.version}</p>
                      </div>
                    </TableCell>
                    <TableCell className="w-[280px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <UrlText className="block max-w-[248px] cursor-default truncate">
                            {model.modelUrl}
                          </UrlText>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <UrlText>{model.modelUrl}</UrlText>
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
              <Label className="text-xs font-medium text-[#525252]">模型厂商<span className="text-[#DC2626]">*</span></Label>
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
                  <Label className="text-xs font-medium text-[#525252]">模型名称<span className="text-[#DC2626]">*</span></Label>
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
                  <Label className="text-xs font-medium text-[#525252]">模型 URL<span className="text-[#DC2626]">*</span></Label>
                  <Input
                    type="text"
                    placeholder="请输入模型 URL地址"
                    value={newModel.modelUrl}
                    onChange={(e) => setNewModel({ ...newModel, modelUrl: e.target.value })}
                    className="rounded-[4px] border-[#E5E5E5] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#525252]">每日 Tokens 数量上限<span className="text-[#DC2626]">*</span></Label>
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
                  <Label className="text-xs font-medium text-[#525252]">每日 Tokens 数量上限<span className="text-[#DC2626]">*</span></Label>
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
            <Button
              variant="dialog-confirm"
              size="claw-sm"
              onClick={handleAddModel}
              disabled={(() => {
                if (!newModel.provider) return true;
                if (isCustomProvider) {
                  if (customInputMode === "form") {
                    if (!customForm.provider || !customForm.base_url || !customForm.api || !customForm.api_key || !customForm.model_id || !customForm.model_name) return true;
                  } else {
                    if (!customJson.trim()) return true;
                  }
                  if (!customForm.dailyLimit || customForm.dailyLimit <= 0) return true;
                } else {
                  if (!newModel.version || !newModel.modelUrl.trim()) return true;
                  if (!newModel.dailyLimit || newModel.dailyLimit <= 0) return true;
                }
                return false;
              })()}
            >
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
