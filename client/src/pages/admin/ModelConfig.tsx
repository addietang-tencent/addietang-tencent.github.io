/**
 * ModelConfig - 管控端模型配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertOperationInfoIcon } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { StatusTag } from "@/components/ui/status-tag";
import {
  Plus, Trash2, Info, Pencil,
  Check, X, ChevronRight, ChevronDown, Minus,
} from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/mockData";
import type { UserGroup } from "./MemberManagement/types";
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import { buildGroupTree, type GroupTreeNode } from "./MemberManagement/health";
import {
  CUSTOM_PROVIDER_VALUE,
  useAdminModelsState,
  type ModelRow,
} from "@/lib/modelConfigStore";

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

// ─── 树形多选节点的选中状态 ─────────────────────────────
type CheckState = "checked" | "unchecked" | "indeterminate";

function getCheckState(
  node: GroupTreeNode,
  selectedIds: Set<string>
): CheckState {
  if (selectedIds.has(node.id)) return "checked";
  if (node.children.length === 0) return "unchecked";
  let hasChecked = false;
  let hasUnchecked = false;
  for (const c of node.children) {
    const s = getCheckState(c, selectedIds);
    if (s === "checked") hasChecked = true;
    else if (s === "unchecked") hasUnchecked = true;
    else { hasChecked = true; hasUnchecked = true; }
    if (hasChecked && hasUnchecked) return "indeterminate";
  }
  if (hasChecked && !hasUnchecked) return "checked";
  if (!hasChecked && hasUnchecked) return "unchecked";
  return "indeterminate";
}

/** 获取子孙所有 id（含自身） */
function getDescendantIds(node: GroupTreeNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...getDescendantIds(c)));
  return ids;
}

// 应用范围 Popover 编辑面板（树形多选版）
function ScopePopover({
  model,
  groups,
  onSave,
}: {
  model: ModelRow;
  groups: UserGroup[];
  onSave: (id: string, scope: "all" | "groups", groupIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<"all" | "groups">(model.visibilityScope);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>(model.visibilityGroupIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 按展示分区分桶构建树（oneid-group + manual 合并为 "custom"）
  type DisplayBucket = "dept" | "custom";
  const groupsByBucket = useMemo(() => {
    const buckets: Record<DisplayBucket, UserGroup[]> = { dept: [], custom: [] };
    groups.forEach((g) => {
      if (g.source === "oneid-dept") buckets.dept.push(g);
      else buckets.custom.push(g);
    });
    return buckets;
  }, [groups]);

  const activeBuckets = useMemo(() => {
    const order: DisplayBucket[] = ["dept", "custom"];
    return order.filter((b) => groupsByBucket[b].length > 0);
  }, [groupsByBucket]);

  const BUCKET_LABELS: Record<DisplayBucket, string> = { dept: "部门", custom: "自定义分组" };

  // 每个分区的树
  const treesMap = useMemo(() => {
    const map: Record<string, GroupTreeNode[]> = {};
    activeBuckets.forEach((b) => { map[b] = buildGroupTree(groupsByBucket[b]); });
    return map;
  }, [activeBuckets, groupsByBucket]);

  // 是否有可展示的分组
  const hasGroups = activeBuckets.length > 0;

  // 每次打开时同步当前模型的状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(model.visibilityScope);
      setDraftGroupIds([...model.visibilityGroupIds]);
      setSearchQuery("");
      // 默认展开所有已选分组的祖先
      const expandSet = new Set<string>();
      const groupMap = new Map(groups.map((g) => [g.id, g]));
      model.visibilityGroupIds.forEach((gid) => {
        let cur = groupMap.get(gid);
        while (cur && cur.parentId) {
          expandSet.add(cur.parentId);
          cur = groupMap.get(cur.parentId);
        }
      });
      // 也展开根节点
      activeBuckets.forEach((b) => {
        treesMap[b]?.forEach((root) => expandSet.add(root.id));
      });
      setExpanded(expandSet);
    }
    setOpen(v);
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 树节点 check/uncheck 逻辑
  const toggleNode = (node: GroupTreeNode) => {
    const ids = new Set(draftGroupIds);
    const state = getCheckState(node, ids);
    const descendants = getDescendantIds(node);
    if (state === "checked") {
      // 取消自身及所有子孙
      descendants.forEach((d) => ids.delete(d));
    } else {
      // 选中自身及所有子孙
      descendants.forEach((d) => ids.add(d));
    }
    setDraftGroupIds(Array.from(ids));
  };

  const handleClearSelection = () => {
    setDraftGroupIds([]);
    setSearchQuery("");
  };

  // 确认按钮是否可点击：按分组时至少选了一个分组
  const isConfirmDisabled = draftScope === "groups" && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onSave(
      model.id,
      draftScope,
      draftScope === "all" ? [] : draftGroupIds,
    );
    setOpen(false);
    toast.success("应用范围已更新");
  };

  // 搜索过滤：扁平匹配
  const matchedGroupIds = useMemo(() => {
    if (!searchQuery.trim()) return null; // null = 不过滤
    const q = searchQuery.toLowerCase();
    return new Set(
      groups
        .filter((g) => g.name.toLowerCase().includes(q) || getGroupPath(g.id, groups).toLowerCase().includes(q))
        .map((g) => g.id)
    );
  }, [searchQuery, groups]);

  // 判断节点或其子孙是否匹配搜索
  const isNodeVisible = (node: GroupTreeNode): boolean => {
    if (!matchedGroupIds) return true;
    if (matchedGroupIds.has(node.id)) return true;
    return node.children.some(isNodeVisible);
  };

  // 渲染一个树节点
  const renderTreeNode = (node: GroupTreeNode, depth: number) => {
    if (!isNodeVisible(node)) return null;

    const selectedSet = new Set(draftGroupIds);
    const checkState = getCheckState(node, selectedSet);
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id}>
        <button
          onClick={() => toggleNode(node)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] hover:bg-[#f5f5f5] transition-colors text-left"
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {/* 展开/折叠 */}
          {hasChildren ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-[#A3A3A3] hover:text-[#737373] shrink-0 cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          {/* Checkbox 三态 */}
          <span
            className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
              checkState === "checked"
                ? "bg-[#eff4ff]0 border-blue-500"
                : checkState === "indeterminate"
                  ? "bg-[#eff4ff]0 border-blue-500"
                  : "border-gray-300 bg-white"
            }`}
          >
            {checkState === "checked" && <Check className="w-2.5 h-2.5 text-white" />}
            {checkState === "indeterminate" && <Minus className="w-2.5 h-2.5 text-white" />}
          </span>
          <span className="text-xs text-[#334155] truncate">{node.name}</span>
        </button>
        {hasChildren && isExpanded && node.children.map((c) => renderTreeNode(c, depth + 1))}
      </div>
    );
  };

  // 已选分组标签（子孙全选时自动合并为父分组）
  const selectedTags = useMemo(() => {
    const selectedSet = new Set(draftGroupIds);
    // 利用树结构找到"有效最高节点"：如果一个节点的所有子孙都被选中，则该节点代表它们
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") {
          result.push(node.id);
        } else if (state === "indeterminate") {
          result.push(...collectEffective(node.children));
        }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => ({ id: gid, path: getGroupPath(gid, groups) }));
  }, [draftGroupIds, groups, activeBuckets, treesMap]);

  // 解析已选分组名（用于表格徽章展示）
  const selectedGroupPaths = useMemo(() => {
    const selectedSet = new Set(model.visibilityGroupIds);
    const collectEffective = (nodes: GroupTreeNode[]): string[] => {
      const result: string[] = [];
      for (const node of nodes) {
        const state = getCheckState(node, selectedSet);
        if (state === "checked") {
          result.push(node.id);
        } else if (state === "indeterminate") {
          result.push(...collectEffective(node.children));
        }
      }
      return result;
    };
    const effectiveIds: string[] = [];
    activeBuckets.forEach((b) => { effectiveIds.push(...collectEffective(treesMap[b] || [])); });
    return effectiveIds.map((gid) => getGroupPath(gid, groups));
  }, [groups, model.visibilityGroupIds, activeBuckets, treesMap]);

  // 徽章区域
  const renderBadges = () => {
    if (model.visibilityScope === "all") {
      return (
        <StatusTag mode="fill" variant="blue">
          全部用户
        </StatusTag>
      );
    }

    if (selectedGroupPaths.length === 0) {
      return (
        <StatusTag mode="fill" variant="blue">
          全部用户
        </StatusTag>
      );
    }

    // 按分组：第一个分组完整路径 + +N
    const firstName = selectedGroupPaths[0];
    const rest = selectedGroupPaths.length - 1;
    const tooltipText = selectedGroupPaths.join("\n");

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <StatusTag mode="fill" variant="gray" className="max-w-[140px] truncate">
              {firstName}
            </StatusTag>
            {rest > 0 && (
              <StatusTag mode="fill" variant="gray">
                +{rest}
              </StatusTag>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] text-xs leading-relaxed whitespace-pre-line">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5 min-h-[20px] max-w-[160px]">
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="self-center text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
            title="编辑应用范围"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 flex flex-col max-h-[420px]" align="start" sideOffset={6}>
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-0">
            {/* Segment 切换（标准分段选择器） */}
            <SegmentGroup className="w-full">
              <SegmentOption
                active={draftScope === "all"}
                onClick={() => setDraftScope("all")}
                className="flex-1"
              >
                全部用户
              </SegmentOption>
              <SegmentOption
                active={draftScope === "groups"}
                onClick={() => setDraftScope("groups")}
                className="flex-1"
              >
                按分组
              </SegmentOption>
            </SegmentGroup>

            {/* 分组列表（仅 groups 模式） */}
            {draftScope === "groups" && (
              <div className="space-y-1.5">
                {!hasGroups ? (
                  /* 无分组空状态 */
                  <div className="text-center py-5 px-2">
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      暂无分组，请前往
                      <a
                        href="/admin/members"
                        className="text-[#355EF1] hover:text-[#355EF1] hover:underline mx-0.5"
                        onClick={(e) => { e.preventDefault(); setOpen(false); window.location.href = "/admin/members"; }}
                      >
                        用户管理
                      </a>
                      建立分组
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 合并搜索框 + 已选标签 */}
                    <div
                      className="group relative flex flex-wrap items-center gap-1 px-2 py-1.5 border border-[#e5e5e5] rounded-[4px] bg-[#fafafa] focus-within:border-[#355EF1] focus-within:ring-1 focus-within:ring-blue-100 transition-colors max-h-[80px] overflow-y-auto"
                    >
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#eff4ff] text-[#355EF1] text-[10px] rounded-[4px] border border-blue-100 shrink-0 max-w-[200px]"
                        >
                          <span className="truncate">{tag.path}</span>
                          <button
                            onClick={() => {
                              const findNode = (nodes: GroupTreeNode[]): GroupTreeNode | undefined => {
                                for (const n of nodes) {
                                  if (n.id === tag.id) return n;
                                  const found = findNode(n.children);
                                  if (found) return found;
                                }
                                return undefined;
                              };
                              let targetNode: GroupTreeNode | undefined;
                              for (const b of activeBuckets) {
                                targetNode = findNode(treesMap[b] || []);
                                if (targetNode) break;
                              }
                              const idsToRemove = targetNode ? new Set(getDescendantIds(targetNode)) : new Set([tag.id]);
                              setDraftGroupIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
                            }}
                            className="text-[#355EF1] hover:text-[#355EF1] shrink-0"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder={selectedTags.length === 0 ? "请输入分组名称" : ""}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 min-w-[60px] text-xs bg-transparent outline-none placeholder:text-[#A3A3A3]"
                      />
                      {/* 清除全部按钮：hover 时显示 */}
                      {(selectedTags.length > 0 || searchQuery) && (
                        <button
                          onClick={handleClearSelection}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity"
                          title="清除全部"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 分组树形列表（按分区 + 小标题） */}
                    <div className="max-h-[220px] overflow-y-auto">
                      {activeBuckets.map((bucket) => {
                        const trees = treesMap[bucket];
                        if (!trees || trees.length === 0) return null;
                        const anyVisible = trees.some(isNodeVisible);
                        if (!anyVisible) return null;
                        return (
                          <div key={bucket} className="mb-1">
                            <div className="px-2 py-1 text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wider">
                              {BUCKET_LABELS[bucket]}
                            </div>
                            {trees.map((root) => renderTreeNode(root, 0))}
                          </div>
                        );
                      })}
                    </div>

                  </>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-[#e5e5e5] shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
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
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            variant="dialog-confirm"
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

  return (
    <>
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">模型配置</h1>
          <Alert variant="operation-info" className="mt-2">
            <AlertOperationInfoIcon />
            <AlertDescription>
              <p>
                <span className="font-semibold">用户可见：</span>开启后，该模型会展示在用户端的模型选项列表中。
              </p>
              <p>
                <span className="font-semibold">默认配置：</span>用户在创建新实例时，该模型将被自动预添加，用户无需手动配置。
              </p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Part 1: Model List */}
        <div className="space-y-16">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0A0A0A]">模型列表</h2>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              添加模型
            </Button>
          </div>

          <div className="bg-white rounded-[4px] border border-[#e5e5e5] overflow-hidden">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[22%]">模型名称</TableHead>
                <TableHead className="w-[28%]">模型 URL</TableHead>
                <TableHead className="w-[13%]">每日 Tokens 上限</TableHead>
                <TableHead className="w-[8%]">用户可见</TableHead>
                <TableHead className="w-[10%]">默认配置</TableHead>
                <TableHead className="w-[10%]">
                  <div className="flex items-center gap-1">
                    应用范围
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">
                          <Info className="w-3 h-3 text-[#A3A3A3]" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                        应用范围决定了哪些用户可以看到该模型，以及哪些用户创建新的 Agent 时自动预添加该模型。「全部用户」表示所有人可见并自动预添加，「按分组」仅对指定分组用户可见并自动预添加。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="w-[5%]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">{model.name}</p>
                      <p className="text-xs text-[#A3A3A3]">{model.version}</p>
                      <div className="mt-1">
                        {model.provider === CUSTOM_PROVIDER_VALUE ? (
                          // 自定义模型：Toggle Tag，点击弹出二次确认
                          model.isMultimodal ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setMultimodalConfirm({ model, enable: false })}
                                  className="group inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#eff4ff] text-[#355EF1] border border-blue-100 hover:bg-red-50 hover:text-red-400 hover:border-red-100 transition-colors cursor-pointer"
                                >
                                  <span className="group-hover:hidden">多模态</span>
                                  <span className="hidden group-hover:inline-flex items-center gap-0.5">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    关闭多模态
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">点击关闭多模态</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setMultimodalConfirm({ model, enable: true })}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-[#A3A3A3] border border-dashed border-gray-300 hover:text-[#355EF1] hover:border-[#355EF1] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                  多模态
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">点击开启多模态</TooltipContent>
                            </Tooltip>
                          )
                        ) : model.isMultimodal ? (
                          // 非自定义模型：只读 Badge
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#eff4ff] text-[#355EF1] border border-blue-100">多模态</span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#737373] font-mono whitespace-nowrap">{model.modelUrl}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-[#334155]">{model.dailyLimit.toLocaleString()}</span>
                      <button
                        onClick={() => openEditQuota(model)}
                        className="text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
                        title="编辑配额"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={model.visible}
                      onCheckedChange={(v) => handleToggleVisible(model.id, v)}
                    />
                  </TableCell>

                  {/* 默认模型单选 */}
                  <TableCell>
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
                  </TableCell>
                  {/* 应用范围 */}
                  <TableCell>
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
                  <TableCell>
                    <button
                      onClick={() => setDeleteConfirmModel(model)}
                      className="text-[#A3A3A3] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>


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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleAddModel}>
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
            <Button variant="outline" onClick={() => setDeleteConfirmModel(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
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
              variant="claw-primary"
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
    </>
  );
}
