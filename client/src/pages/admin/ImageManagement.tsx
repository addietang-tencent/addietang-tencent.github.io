/**
 * ImageManagement - 管控端镜像管理页
 * 支持三种系统预设 Agent 类型（OpenClaw / Hermes Agent / LightClaw ACE）
 * 每个类型独立管理镜像，可设置启用镜像和用户端首选类型
 * 删除镜像后重新导入自动回填上次的 type/version（可编辑）
 */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Info, RefreshCw, ExternalLink, Search, ChevronsUpDown, Star, ChevronDown, ChevronRight, Plus, Pencil } from "lucide-react";

// ─── Agent 类型定义（仅系统预设，本期不支持自定义）─────────────────────────────
interface AgentTypeConfig {
  value: string;
  label: string;
  versionPlaceholder: string;
  versionRegex: RegExp;
}

const AGENT_TYPES: AgentTypeConfig[] = [
  { value: "OpenClaw", label: "OpenClaw", versionPlaceholder: "如 2026.4.2", versionRegex: /^\d{4}\.\d{1,2}\.\d{1,2}$/ },
  { value: "HermesAgent", label: "Hermes Agent", versionPlaceholder: "如 0.8.0", versionRegex: /^\d+\.\d+\.\d+$/ },
  { value: "LightClawACE", label: "LightClaw ACE", versionPlaceholder: "如 1.0.2", versionRegex: /^\d+\.\d+\.\d+$/ },
];

const getTypeConfig = (value: string) => AGENT_TYPES.find((t) => t.value === value);
const getTypeLabel = (value: string) => getTypeConfig(value)?.label ?? value;

function validateVersion(config: AgentTypeConfig, version: string): boolean {
  if (!config.versionRegex.test(version)) return false;
  if (config.value === "Agent") {
    const [y, m, d] = version.split(".").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }
  return true;
}

// ─── Mock 镜像数据 ─────────────────────────────────────────────────────────────
const PUBLIC_IMAGES = [
  { id: "img-agent-official", name: "云服务器 Agent 镜像", group: "public" as const, agentType: "Agent", agentVersion: "2026.3.28" },
  { id: "img-hermes-official", name: "Hermes Agent 官方镜像", group: "public" as const, agentType: "HermesAgent", agentVersion: "0.8.0" },
  { id: "img-lightclaw-official", name: "LightClaw ACE 官方镜像", group: "public" as const, agentType: "LightClawACE", agentVersion: "1.0.2" },
];

const CUSTOM_IMAGES = [
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", group: "custom" as const },
  { id: "img-cust-e5f6g7h8", name: "hermes-custom-v0.7", group: "custom" as const },
  { id: "img-cust-i9j0k1l2", name: "lightclaw-prod-2025Q4", group: "custom" as const },
  { id: "img-cust-m3n4o5p6", name: "openclaw-dev-latest", group: "custom" as const },
  { id: "img-cust-q7r8s9t0", name: "agent-test-v2.0", group: "custom" as const },
];

type ImageType = "public" | "custom";

interface ImageRow {
  id: string;
  name: string;
  status: string;
  type: ImageType;
  agentType: string;
  agentVersion: string;
  os: string;
  createTime: string;
  active: boolean;
}

// 删除历史记录：记住镜像上次的 type + version
interface DeletedImageHistory {
  agentType: string;
  agentVersion: string;
}

const PUBLIC_IMAGE_ROWS: ImageRow[] = PUBLIC_IMAGES.map((p) => ({
  id: p.id, name: p.name, status: "available", type: "public" as ImageType,
  agentType: p.agentType, agentVersion: p.agentVersion, os: "CentOS 7.9 64位",
  createTime: "2025-12-01 10:30:00", active: true,
}));

const MOCK_IMAGES: ImageRow[] = [
  ...PUBLIC_IMAGE_ROWS,
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", status: "available", type: "custom", agentType: "OpenClaw", agentVersion: "2025.9.1", os: "CentOS 7.9 64位", createTime: "2025-09-15 14:22:35", active: false },
  { id: "img-cust-legacy-001", name: "legacy-image-v1", status: "available", type: "custom", agentType: "", agentVersion: "", os: "CentOS 7.9 64位", createTime: "2025-06-01 12:00:00", active: false },
  { id: "img-cust-legacy-002", name: "legacy-image-active", status: "available", type: "custom", agentType: "OpenClaw", agentVersion: "", os: "CentOS 7.9 64位", createTime: "2025-05-15 09:00:00", active: false },
];

function normalizeImages(imgs: ImageRow[]): ImageRow[] {
  return imgs.map((img) => img.agentType ? img : { ...img, agentType: "Agent" });
}

// ─── 主组件 ────────────────────────────────────────────────────────────────────
export default function ImageManagement() {
  const [images, setImages] = useState<ImageRow[]>(() => normalizeImages(MOCK_IMAGES));
  // 已添加到页面的类型列表，初始只展示有镜像的
  const [addedTypes, setAddedTypes] = useState<string[]>(() => {
    return Array.from(new Set(normalizeImages(MOCK_IMAGES).map((i) => i.agentType).filter(Boolean)));
  });
  const [defaultAgentType, setDefaultAgentType] = useState("Agent");
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(new Set());

  // 删除历史：imageId -> { agentType, agentVersion }
  const [deletedHistory, setDeletedHistory] = useState<Map<string, DeletedImageHistory>>(new Map());

  // 导入弹窗
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [importAgentType, setImportAgentType] = useState("");
  const [importAgentVersion, setImportAgentVersion] = useState("");
  const [versionError, setVersionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showImageList, setShowImageList] = useState(false);
  const imageListRef = useRef<HTMLDivElement>(null);
  // 标记当前是否为历史回填（回填后仍可编辑）
  const [isHistoryPrefilled, setIsHistoryPrefilled] = useState(false);

  // 添加类型弹窗（仅预设选择，无自定义）
  const [showAddTypeDialog, setShowAddTypeDialog] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState("");

  // 编辑自定义镜像弹窗
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingImageId, setEditingImageId] = useState("");
  const [editAgentType, setEditAgentType] = useState("");
  const [editAgentVersion, setEditAgentVersion] = useState("");
  const [editVersionError, setEditVersionError] = useState("");

  // 导入弹窗的目标 agentType 上下文
  const [importTargetAgentType, setImportTargetAgentType] = useState("");

  const selectedImage = CUSTOM_IMAGES.find((img) => img.id === selectedImageId);

  // 页面展示的类型顺序
  const displayTypes = addedTypes.filter((v) => AGENT_TYPES.some((c) => c.value === v));

  // 尚未添加到页面的预设类型
  const availablePresets = AGENT_TYPES.filter((t) => !addedTypes.includes(t.value));

  const toggleCollapse = (type: string) => {
    setCollapsedTypes((prev) => { const n = new Set(prev); if (n.has(type)) n.delete(type); else n.add(type); return n; });
  };

  const addPresetToPage = (value: string) => {
    if (addedTypes.includes(value)) { toast.error("该类型已添加"); return; }
    setAddedTypes([...addedTypes, value]);
    toast.success(`已添加「${getTypeLabel(value)}」`);
  };

  const handleRemoveType = (value: string) => {
    if (images.some((i) => i.agentType === value)) { toast.error("该类型下还有镜像，请先删除所有镜像"); return; }
    if (defaultAgentType === value) { toast.error("不能删除用户端默认类型"); return; }
    setAddedTypes(addedTypes.filter((v) => v !== value));
    toast.success("已移除该 Agent 类型");
  };

  // ─── 导入弹窗 ───
  const handleDialogOpenChange = (open: boolean) => {
    setShowImportDialog(open);
    if (!open) {
      setSelectedImageId(""); setImportAgentType(""); setImportAgentVersion("");
      setVersionError(""); setSearchQuery(""); setShowImageList(false);
      setIsHistoryPrefilled(false); setImportTargetAgentType("");
    }
  };

  const handleClickOutsideImageList = (e: React.MouseEvent) => {
    if (imageListRef.current && !imageListRef.current.contains(e.target as Node)) setShowImageList(false);
  };

  const filteredImportImages = CUSTOM_IMAGES.filter((img) =>
    img.id.toLowerCase().includes(searchQuery.toLowerCase()) || img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustom = filteredImportImages;

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => { setRefreshing(false); toast.success("镜像列表已刷新"); }, 1200); };

  const formatNow = () => {
    const d = new Date(); const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleSelectImage = (imgId: string) => {
    setSelectedImageId(imgId); setShowImageList(false); setSearchQuery("");
    // 自定义镜像：检查是否有删除历史，有则自动回填（可编辑）
    const history = deletedHistory.get(imgId);
    if (history && history.agentType) {
      setImportAgentType(history.agentType);
      setImportAgentVersion(history.agentVersion || "");
      setIsHistoryPrefilled(true);
      setVersionError("");
    } else {
      // 如果有目标 agentType 上下文（从分组按钮进来），自动设置
      setImportAgentType(importTargetAgentType || "");
      setImportAgentVersion("");
      setVersionError(""); setIsHistoryPrefilled(false);
    }
  };

  const handleVersionChange = (v: string) => {
    setImportAgentVersion(v);
    if (v && importAgentType) {
      const config = getTypeConfig(importAgentType);
      if (config && !config.versionRegex.test(v)) {
        setVersionError(`格式不正确，请输入 ${config.versionPlaceholder.replace("如 ", "")} 格式`);
      } else if (importAgentType === "Agent" && config && !validateVersion(config, v)) {
        setVersionError("日期不合法");
      } else { setVersionError(""); }
    } else { setVersionError(""); }
  };

  const handleImport = () => {
    if (!selectedImageId) { toast.error("请选择要导入的镜像"); return; }
    if (!importAgentType) { toast.error("请选择 Agent 类型"); return; }
    if (!importAgentVersion.trim()) { toast.error("请填写 Agent 版本"); return; }
    const config = getTypeConfig(importAgentType);
    if (config && !validateVersion(config, importAgentVersion)) { toast.error("版本格式不正确"); return; }
    if (images.some((img) => img.id === selectedImageId)) { toast.error("该镜像已在列表中"); return; }
    const img = CUSTOM_IMAGES.find((i) => i.id === selectedImageId)!;
    setImages([...images, {
      id: img.id, name: img.name, status: "available",
      type: "custom",
      agentType: importAgentType, agentVersion: importAgentVersion.trim(),
      os: "CentOS 7.9 64位", createTime: formatNow(), active: false,
    }]);
    // 自动添加类型到页面
    if (!addedTypes.includes(importAgentType)) setAddedTypes([...addedTypes, importAgentType]);
    // 清除该镜像的删除历史
    if (deletedHistory.has(selectedImageId)) {
      const newHistory = new Map(deletedHistory);
      newHistory.delete(selectedImageId);
      setDeletedHistory(newHistory);
    }
    handleDialogOpenChange(false);
    toast.success(`镜像「${img.name}」已导入至 ${getTypeLabel(importAgentType)}`);
  };

  // ─── 启用/首选/删除 ───
  const handleToggleActive = (imgId: string, agentType: string, enable: boolean) => {
    if (!enable) {
      if (agentType === defaultAgentType) { toast.error("用户端默认类型必须有一个启用的镜像，无法取消"); return; }
      setImages(images.map((i) => i.id === imgId ? { ...i, active: false } : i));
      toast.success("已取消启用"); return;
    }
    setImages(images.map((i) => i.agentType === agentType ? { ...i, active: i.id === imgId } : i));
    const img = images.find((i) => i.id === imgId);
    toast.success(`「${img?.name}」已启用为 ${getTypeLabel(agentType)} 的目标镜像`);
  };

  const handleSetDefaultType = (agentType: string) => {
    if (!images.some((i) => i.agentType === agentType && i.active)) { toast.error(`请先为 ${getTypeLabel(agentType)} 启用一个镜像`); return; }
    setDefaultAgentType(agentType);
    toast.success(`已将「${getTypeLabel(agentType)}」设为用户端默认类型`);
  };

  const handleDelete = (imgId: string) => {
    const img = images.find((i) => i.id === imgId);
    if (!img) return;
    if (img.active && img.agentType === defaultAgentType) { toast.error("该镜像为用户端默认类型的启用镜像，无法删除"); return; }
    // 记录删除历史（type + version），下次导入同一镜像时自动回填
    if (img.agentType || img.agentVersion) {
      const newHistory = new Map(deletedHistory);
      newHistory.set(imgId, { agentType: img.agentType, agentVersion: img.agentVersion });
      setDeletedHistory(newHistory);
    }
    setImages(images.filter((i) => i.id !== imgId));
    toast.success("镜像已删除");
  };

  const canImport = selectedImageId && importAgentType && importAgentVersion.trim() && !versionError;

  const openImportForType = (agentType: string) => {
    setImportTargetAgentType(agentType);
    setImportAgentType(agentType);
    setShowImportDialog(true);
  };

  const openEditDialog = (img: ImageRow) => {
    setEditingImageId(img.id);
    setEditAgentType(img.agentType);
    setEditAgentVersion(img.agentVersion);
    setEditVersionError("");
    setShowEditDialog(true);
  };

  const handleEditVersionChange = (v: string) => {
    setEditAgentVersion(v);
    if (v && editAgentType) {
      const config = getTypeConfig(editAgentType);
      if (config && !config.versionRegex.test(v)) {
        setEditVersionError(`格式不正确，请输入 ${config.versionPlaceholder.replace("如 ", "")} 格式`);
      } else if (editAgentType === "OpenClaw" && config && !validateVersion(config, v)) {
        setEditVersionError("日期不合法");
      } else { setEditVersionError(""); }
    } else { setEditVersionError(""); }
  };

  const handleEditSave = () => {
    if (!editAgentType) { toast.error("请选择 Agent 类型"); return; }
    if (!editAgentVersion.trim()) { toast.error("请填写 Agent 版本"); return; }
    const config = getTypeConfig(editAgentType);
    if (config && !validateVersion(config, editAgentVersion)) { toast.error("版本格式不正确"); return; }
    setImages(images.map((i) => i.id === editingImageId ? { ...i, agentType: editAgentType, agentVersion: editAgentVersion.trim() } : i));
    if (!addedTypes.includes(editAgentType)) setAddedTypes([...addedTypes, editAgentType]);
    setShowEditDialog(false);
    toast.success("镜像信息已更新");
  };

  return (
    <>
      <div className="page-enter max-w-[1100px]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">镜像管理</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理不同 Agent 类型的运行环境镜像。启用镜像后该类型在用户端可选，未启用则不可选。
          </p>
        </div>

        {/* 按 agentType 分组展示 */}
        <div className="space-y-6">
          {displayTypes.map((agentType) => {
            const typeImages = images.filter((i) => i.agentType === agentType).sort((a, b) => {
              if (a.type === "public" && b.type !== "public") return -1;
              if (a.type !== "public" && b.type === "public") return 1;
              return 0;
            });
            const isDefault = defaultAgentType === agentType;
            const isCollapsed = collapsedTypes.has(agentType);
            const activeImg = typeImages.find((i) => i.active);

            return (
              <div
                key={agentType}
                className={`rounded-2xl border overflow-hidden transition-all ${isDefault ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-100"}`}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
              >
                {/* 标题栏 */}
                <div className={`flex items-center justify-between px-6 py-4 ${isDefault ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100" : "bg-white border-b border-gray-50"}`}>
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => toggleCollapse(agentType)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <h2 className="font-semibold text-gray-900">{getTypeLabel(agentType)}</h2>
                    <span className="text-xs text-gray-400">{typeImages.length} 个镜像</span>
                    {/* 用户端状态 */}
                    {activeImg ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100 cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> 用户端可选
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                          当前启用：{activeImg.name}{activeImg.agentVersion ? `（${activeImg.agentVersion}）` : ""}，支持用户创建该类型 Agent；一键升级将此镜像版本作为升级目标版本
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" /> 用户端不可选
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                          未启用镜像，用户端无法选择此类型创建 Agent。启用一个镜像即可开放
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {/* 用户端首选 */}
                    {isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white cursor-default" style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                            <Star className="w-3 h-3" /> 用户端默认
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
                          用户创建 Agent 时会默认选此类型，也支持手动切换
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isDefault && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleSetDefaultType(agentType)}>
                            <Star className="w-3 h-3 mr-1" /> 设为用户端默认
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs leading-relaxed">设为用户端默认选择的 Agent 类型</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleRemoveType(agentType)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>移除此 Agent 类型</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* 镜像列表 */}
                {!isCollapsed && (
                  <div className="bg-white">
                    {typeImages.length > 0 ? (
                    <>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">镜像名称 / ID</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 tracking-wide">Agent 版本</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">镜像类型</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作系统</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">导入时间</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {typeImages.map((img) => (
                            <tr key={img.id} className={`hover:bg-gray-50/50 transition-colors ${img.type === "public" ? "bg-blue-50/40" : ""}`}
                              style={img.type === "public" ? { borderLeft: "3px solid #3B82F6" } : { borderLeft: "3px solid transparent" }}>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{img.name}</p>
                                  <p className="text-xs text-gray-400 font-mono">{img.id}</p>
                                  {img.type === "public" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap mt-1 cursor-default">腾讯云维护</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">由腾讯云维护，自动跟进平台程序版本更新，无需企业自行维护</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {img.agentVersion ? (
                                  <span className="text-sm text-gray-700 font-mono">{img.agentVersion}</span>
                                ) : img.active ? (
                                  <div className="flex items-start gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                      ⚠ 未填写版本
                                    </span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 cursor-help shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                                        该镜像正在使用中但缺少版本信息，可能影响用户端版本显示。建议尽快删除后重新导入并填写版本
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                ) : (
                                  <div className="text-xs leading-tight">
                                    <span className="text-orange-500">未填写</span><br />
                                    <span className="text-gray-400">请编辑版本信息</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {img.type === "public" ? (
                                  <Tooltip><TooltipTrigger asChild><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 cursor-default">公共</span></TooltipTrigger>
                                    <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由腾讯云维护，自动跟进平台程序版本更新，无需企业自行维护</TooltipContent></Tooltip>
                                ) : (
                                  <Tooltip><TooltipTrigger asChild><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100 cursor-default">自定义</span></TooltipTrigger>
                                    <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由企业自行制作和维护，腾讯云不负责版本更新和维护</TooltipContent></Tooltip>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {img.status === "available" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> 可用</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> 创建中</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{img.os}</td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-500 leading-tight">
                                  <span className="whitespace-nowrap">{img.createTime.split(" ")[0]}</span><br />
                                  <span className="text-xs text-gray-400 whitespace-nowrap">{img.createTime.split(" ")[1]}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">启用</span>
                                    {!img.agentVersion && !img.active ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex"><Switch checked={false} disabled className="opacity-40 cursor-not-allowed" /></span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
                                          缺少 Agent 版本信息，无法启用。请删除后重新导入并填写版本
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : !img.agentVersion && img.active ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex"><Switch checked={true} onCheckedChange={(v) => handleToggleActive(img.id, agentType, v)} /></span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                                          <span className="text-amber-500 font-medium">⚠ 该镜像缺少版本信息</span>，建议尽快删除后重新导入并填写版本
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <Switch checked={img.active} onCheckedChange={(v) => handleToggleActive(img.id, agentType, v)} />
                                    )}
                                  </div>
                                  {img.type === "custom" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={() => openEditDialog(img)} className="text-gray-400 hover:text-blue-500 transition-colors" title="编辑镜像信息">
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>编辑 Agent 类型和版本</TooltipContent>
                                    </Tooltip>
                                  )}
                                  {img.type === "public" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex cursor-not-allowed"><Trash2 className="w-4 h-4 text-gray-200" /></span>
                                      </TooltipTrigger>
                                      <TooltipContent side="left">公共镜像不可删除</TooltipContent>
                                    </Tooltip>
                                  ) : img.active ? (
                                    <Tooltip><TooltipTrigger asChild><span className="inline-flex cursor-not-allowed"><Trash2 className="w-4 h-4 text-gray-200" /></span></TooltipTrigger>
                                      <TooltipContent side="left">启用中的镜像无法删除</TooltipContent></Tooltip>
                                  ) : (
                                    <button onClick={() => handleDelete(img.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="删除镜像"><Trash2 className="w-4 h-4" /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-6 py-3 border-t border-gray-50 flex justify-start">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => openImportForType(agentType)}>
                              <Plus className="w-3 h-3 mr-1" /> 添加自定义镜像
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[240px] text-xs leading-relaxed">由企业自行制作和维护，腾讯云不负责版本更新和维护</TooltipContent>
                        </Tooltip>
                      </div>
                    </>
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <p className="text-sm text-gray-400 mb-2">暂无镜像</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => openImportForType(agentType)}>
                          <Plus className="w-3 h-3 mr-1" /> 添加自定义镜像
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* 底部：添加 Agent 类型（仅从预设选择） */}
          {availablePresets.length > 0 && (
            <button
              onClick={() => { setShowAddTypeDialog(true); setSelectedPresetType(""); }}
              className="w-full rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 transition-all py-6 flex flex-col items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold transition-colors" style={{ color: "#5856D6" }}>添加 Agent 类型</span>
              <span className="text-xs text-gray-500">从系统预设中选择（{availablePresets.map((t) => t.label).join("、")}）</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 添加 Agent 类型弹窗（仅预设） ─── */}
      <Dialog open={showAddTypeDialog} onOpenChange={setShowAddTypeDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>添加 Agent 类型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {availablePresets.length > 0 ? (
              <div className="space-y-2">
                <Label>选择预设类型</Label>
                <Select value={selectedPresetType} onValueChange={setSelectedPresetType}>
                  <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="请选择" /></SelectTrigger>
                  <SelectContent>
                    {availablePresets.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-400">所有预设类型均已添加</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTypeDialog(false)}>取消</Button>
            <Button
              onClick={() => {
                if (!selectedPresetType) { toast.error("请选择一个类型"); return; }
                addPresetToPage(selectedPresetType);
                setShowAddTypeDialog(false);
              }}
              disabled={!selectedPresetType}
              style={selectedPresetType ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
            >添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 导入镜像弹窗 ─── */}
      <Dialog open={showImportDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加自定义镜像</DialogTitle></DialogHeader>

          <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5 -mt-1">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              以下镜像均为已在腾讯云创建好的镜像。若需要创建新镜像，请前往{" "}
              <a href="https://console.cloud.tencent.com/cvm/image" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5">
                腾讯云云服务器控制台 <ExternalLink className="w-3 h-3" />
              </a>{" "}操作后，再回此处刷新并导入。
            </p>
          </div>

          <div className="space-y-4 py-1" onClick={handleClickOutsideImageList}>
            {/* Step 1: 选择镜像 */}
            <div className="space-y-2">
              <Label>选择镜像 <span className="text-red-400">*</span></Label>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowImageList(!showImageList)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left flex items-center justify-between">
                  <span>{selectedImageId ? selectedImage?.name : "请选择要导入的镜像"}</span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={handleRefresh} disabled={refreshing}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50" title="刷新镜像列表">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400">镜像大小不允许超过50GiB</p>
              {showImageList && (
                <div ref={imageListRef} className="border border-gray-200 rounded-lg bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="relative p-2 border-b border-gray-100">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="搜索镜像 ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus onClick={(e) => e.stopPropagation()} />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCustom.length > 0 && (<div>
                      <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0">自定义镜像 <span className="text-gray-400 font-normal">（企业维护）</span></div>
                      {filteredCustom.map((img) => (
                        <div key={img.id} onClick={(e) => { e.stopPropagation(); handleSelectImage(img.id); }}
                          className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${selectedImageId === img.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-900 truncate">{img.name}</span>
                            <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                          </div></div>))}
                    </div>)}
                    {filteredImportImages.length === 0 && (<div className="px-3 py-8 text-center text-sm text-gray-400">未找到匹配的镜像</div>)}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Agent 类型 */}
            <div className="space-y-2">
              <Label>Agent 类型 <span className="text-red-400">*</span></Label>
              <div className="space-y-1">
                <Select value={importAgentType} onValueChange={(v) => { setImportAgentType(v); setImportAgentVersion(""); setVersionError(""); }}>
                  <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="请选择 Agent 类型" /></SelectTrigger>
                  <SelectContent>
                    {AGENT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                {isHistoryPrefilled && importAgentType && (
                  <p className="text-xs text-blue-500">已自动填入上次配置，可修改</p>
                )}
              </div>
            </div>

            {/* Step 3: 版本 */}
            <div className="space-y-2">
              <Label>Agent 版本 <span className="text-red-400">*</span></Label>
              <Input placeholder={importAgentType ? (getTypeConfig(importAgentType)?.versionPlaceholder || "请输入版本号") : "请先选择 Agent 类型"}
                value={importAgentVersion} onChange={(e) => handleVersionChange(e.target.value)}
                className={`bg-gray-50 font-mono ${versionError ? "border-red-300 focus-visible:ring-red-500" : ""}`} disabled={!importAgentType} />
              {versionError && <p className="text-xs text-red-500">{versionError}</p>}
              {importAgentType && !versionError && getTypeConfig(importAgentType)?.versionRegex && (
                <p className="text-xs text-gray-400">格式：{getTypeConfig(importAgentType)?.versionPlaceholder}</p>
              )}
              {isHistoryPrefilled && importAgentVersion && !versionError && (
                <p className="text-xs text-blue-500">已自动填入上次版本，可修改</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>取消</Button>
            <Button onClick={handleImport} disabled={!canImport} style={canImport ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 编辑自定义镜像弹窗 ─── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>编辑镜像信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(() => { const editImg = images.find((i) => i.id === editingImageId); return editImg ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">镜像名称 / ID</p>
                  <p className="text-sm font-semibold text-gray-900">{editImg.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{editImg.id}</p>
                </div>
                <div className="px-4 py-2.5 flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">当前类型</span>
                    <span className="font-medium text-gray-700">{editImg.agentType ? getTypeLabel(editImg.agentType) : "未设置"}</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">当前版本</span>
                    <span className="font-medium text-gray-700 font-mono">{editImg.agentVersion || "未设置"}</span>
                  </div>
                </div>
              </div>
            ) : null; })()}
            <div className="space-y-2">
              <Label>Agent 类型 <span className="text-red-400">*</span></Label>
              <Select value={editAgentType} onValueChange={(v) => { setEditAgentType(v); setEditAgentVersion(""); setEditVersionError(""); }}>
                <SelectTrigger className="bg-gray-50 w-full"><SelectValue placeholder="请选择 Agent 类型" /></SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agent 版本 <span className="text-red-400">*</span></Label>
              <Input placeholder={editAgentType ? (getTypeConfig(editAgentType)?.versionPlaceholder || "请输入版本号") : "请先选择 Agent 类型"}
                value={editAgentVersion} onChange={(e) => handleEditVersionChange(e.target.value)}
                className={`bg-gray-50 font-mono ${editVersionError ? "border-red-300 focus-visible:ring-red-500" : ""}`} disabled={!editAgentType} />
              {editVersionError && <p className="text-xs text-red-500">{editVersionError}</p>}
              {editAgentType && !editVersionError && getTypeConfig(editAgentType)?.versionRegex && (
                <p className="text-xs text-gray-400">格式：{getTypeConfig(editAgentType)?.versionPlaceholder}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button
              onClick={handleEditSave}
              disabled={!editAgentType || !editAgentVersion.trim() || !!editVersionError}
              style={editAgentType && editAgentVersion.trim() && !editVersionError ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
            >保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
