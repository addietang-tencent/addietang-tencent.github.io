import React, { useState, useRef, useLayoutEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription, AlertInfoIcon } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StatusTag } from "@/components/ui/status-tag";
import { toast } from "sonner";
import { 
  Search, 
  Bot,
  Building,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CircleAlert,
  Info,
  ChevronLeft,
  Link,
  ShoppingCart,
  Trash2,
  RotateCcw,
  Plus,
  Pencil,
  X,
  Check,
  Clock,
} from "lucide-react";
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from "./MemberManagement/mock";
import { buildGroupTree, type GroupTreeNode } from "./MemberManagement/health";
import type { UserGroup, GroupSource } from "./MemberManagement/types";
import { MOCK_GROUP_TREE_MANUAL, type GroupNode } from "@/lib/mockData";
import { AdminPageHeader } from "@/components/ui/admin-page-header";

// ─── creator → 分组 ID 映射（普通模式下，与 MemberManagement mock 对齐） ──────
const CREATOR_GROUP_MAP: Record<string, string> = {
  "noah@acompany.com":  "mgrp-rd",
  "mia@acompany.com":   "mgrp-design",
  "leo@acompany.com":   "mgrp-product",
  "emma@acompany.com":  "mgrp-rd-fe",
  "alice@acompany.com": "mgrp-product",
  "bob@acompany.com":   "mgrp-rd-be",
  "carol@acompany.com": "mgrp-design",
  "david@acompany.com": "mgrp-ops",
  "frank@acompany.com": "mgrp-rd-fe",
  "grace@acompany.com": "mgrp-rd-be",
  "helen@acompany.com": "mgrp-rd-fe",
  "ivan@acompany.com":  "mgrp-rd-fe",
  "jason@acompany.com": "mgrp-rd-be",
  "kelly@acompany.com": "mgrp-rd-be",
  "lisa@acompany.com":  "mgrp-design",
  "tom@acompany.com":   "mgrp-ops",
  "amy@acompany.com":   "mgrp-product",
  "mike@acompany.com":  "mgrp-rd-be",
  "kate@acompany.com":  "mgrp-rd-fe",
  "ryan@acompany.com":  "mgrp-rd",
};

// ─── 分组筛选器组件（与 TokensMonitor 同款） ────────────────────────────────
function FMGroupFilter({
  groups, value, onChange,
}: {
  groups: GroupNode[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  React.useEffect(() => { if (open) { setTempValue(value); setSearch(""); } }, [open, value]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const handleConfirm = () => { onChange(tempValue); setOpen(false); };
  const handleCancel = () => { setTempValue(value); setOpen(false); };

  const findNode = (nodes: GroupNode[], id: string): GroupNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) { const found = findNode(n.children, id); if (found) return found; }
    }
  };
  const triggerNode = value ? findNode(groups, value) : undefined;
  const selectedNode = tempValue ? findNode(groups, tempValue) : undefined;

  function TreeNode({ node, level = 0 }: { node: GroupNode; level?: number }) {
    const hasChildren = !!node.children?.length;
    const isExpanded = expanded.has(node.id);
    const isSelected = tempValue === node.id;
    const matchSearch = !search || node.name.includes(search);
    const childMatch = search ? (node.children || []).some(c => c.name.includes(search)) : true;
    if (!matchSearch && !childMatch) return null;
    return (
      <div>
        <div
          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-[#eff4ff]" : "hover:bg-[#f5f5f5]"}`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => setTempValue(node.id)}
        >
          {hasChildren ? (
            <button className="p-0.5 text-[var(--text-weak)] shrink-0" onClick={e => { e.stopPropagation(); toggleExpand(node.id); }}>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-4 shrink-0" />}
          <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#355EF1] font-medium" : ""}`}>{node.name}</span>
          {isSelected && <Check className="w-4 h-4 ml-auto text-[#355EF1] flex-shrink-0" />}
        </div>
        {hasChildren && (isExpanded || !!search) && node.children!.map(c => <TreeNode key={c.id} node={c} level={level + 1} />)}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox"
          className={`w-[140px] justify-between bg-white text-sm font-normal h-9 ${triggerNode ? "text-foreground" : "text-muted-foreground"}`}>
          <span className="truncate">{triggerNode?.name || "全部分组"}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="p-2 border-b border-[#EAEEF4]">
          <Input
            placeholder="搜索分组" value={search} onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${tempValue === "" ? "bg-[#eff4ff]" : "hover:bg-[#f5f5f5]"}`} onClick={() => setTempValue("")}>
            <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#355EF1] font-medium" : "text-[var(--text-secondary)]"}`}>全部分组</span>
            {tempValue === "" && <Check className="w-4 h-4 text-[#355EF1] flex-shrink-0" />}
          </div>
          {groups.map(g => <TreeNode key={g.id} node={g} />)}
        </div>
        <div className="border-t border-[#EAEEF4] px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 text-xs overflow-hidden">
            {tempValue === "" ? (
              <span className="text-[var(--text-weak)] truncate">全部分组</span>
            ) : selectedNode ? (
              <span className="text-[var(--text-weak)] truncate">已选 {selectedNode.name}</span>
            ) : (
              <span className="text-[var(--text-weak)] truncate">未选择</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={handleCancel}>取消</Button>
            <Button variant="dialog-confirm" size="sm" className="text-xs h-7 px-3" onClick={handleConfirm}>确认</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── PolicyRule 类型 ─────────────────────────────────────────────────────────

interface PolicyRule<T> {
  id: string;
  groupIds: string[];
  value: T;
}

// ─── 行容器样式常量 ──────────────────────────────────────────────────────────
const FM_ROW_CLASS = "flex items-center gap-3 px-3 h-10";
const FM_EDIT_ROW_CLASS = "flex items-start gap-3 px-3 min-h-10 py-1.5";

// ─── 分组选择器 ──────────────────────────────────────────────────────────────
function FMGroupTagSelector({
  selectedIds,
  disabledIds = [],
  onChange,
}: {
  selectedIds: string[];
  disabledIds?: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allGroups: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];
  const tree: GroupTreeNode[] = buildGroupTree(allGroups);

  const getGroupName = (id: string) => allGroups.find((g) => g.id === id)?.name ?? id;

  const toggle = (id: string) => {
    if (disabledIds.includes(id)) return;
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const filterTree = (nodes: GroupTreeNode[], q: string): GroupTreeNode[] => {
    if (!q) return nodes;
    return nodes.reduce<GroupTreeNode[]>((acc, node) => {
      const children = filterTree(node.children, q);
      if (node.name.includes(q) || children.length > 0) acc.push({ ...node, children });
      return acc;
    }, []);
  };

  function TreeNode({ node, depth = 0 }: { node: GroupTreeNode; depth?: number }) {
    const [expanded, setExpanded] = useState(true);
    const checked = selectedIds.includes(node.id);
    const disabled = disabledIds.includes(node.id);
    return (
      <div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[#fafafa]"}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => !disabled && toggle(node.id)}
        >
          {node.children.length > 0 ? (
            <button className="p-0.5 text-[var(--text-weak)] shrink-0" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-4 shrink-0" />}
          <Checkbox checked={checked} disabled={disabled} className="w-3.5 h-3.5 shrink-0" onChange={() => {}} />
          <span className="text-xs text-[var(--text-secondary)] truncate">{node.name}</span>
        </div>
        {expanded && node.children.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  const filtered = filterTree(tree, search.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="min-h-7 flex flex-wrap gap-1 items-center px-2 py-1 border border-[#EAEEF4] rounded-md cursor-pointer hover:border-[#355EF1] transition-colors bg-white">
          {selectedIds.length === 0
            ? <span className="text-xs text-[var(--text-weak)]">选择分组…</span>
            : selectedIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#355EF1] text-[11px]">
                {getGroupName(id)}
                <button onClick={(e) => { e.stopPropagation(); toggle(id); }} className="hover:text-[var(--text-title)]"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-2">
        <Input placeholder="搜索分组…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-xs mb-2" />
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-xs text-[var(--text-weak)] text-center py-4">无匹配分组</p>
            : filtered.map((n) => <TreeNode key={n.id} node={n} />)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 分组名称展示 ────────────────────────────────────────────────────────────
function FMGroupBadges({ groupIds }: { groupIds: string[] }) {
  const allGroups: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];
  const paths = groupIds.map((id) => allGroups.find((g) => g.id === id)?.name ?? id);

  if (groupIds.length === 0) return <span className="text-xs text-[var(--text-muted)] font-medium">预设策略</span>;

  const firstName = paths[0];
  const rest = paths.length - 1;
  const tooltipText = paths.join("\n");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="max-w-full cursor-default">
          <span className="truncate">{firstName}</span>
          {rest > 0 && <span className="shrink-0 ml-0.5">+{rest}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px] text-xs leading-relaxed whitespace-pre-line">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── 策略概览卡片 ─────────────────────────────────────────────────────────────
interface PolicyOverviewCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  fallbackValue: boolean;
  groupCount: number;
  onClick?: () => void;
}

function PolicyOverviewCard({ icon, iconBg, title, description, fallbackValue, groupCount, onClick }: PolicyOverviewCardProps) {
  return (
    <Card className="overflow-hidden py-0 gap-0 flex flex-col cursor-pointer hover:border-[#1447E6] transition-colors" onClick={onClick}>
      <div className="px-5 pt-5 pb-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 ${iconBg ? `w-8 h-8 rounded-[4px] flex items-center justify-center ${iconBg}` : ''}`}>{icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-[var(--text-emphasis)] truncate">{title}</h3>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed mt-1 line-clamp-2">{description}</p>
          </div>
        </div>

        {/* 底部灰色摘要条 */}
        <div className="mt-4 rounded-[4px] bg-[#FAFAFA] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-[var(--text-muted)] inline-flex items-center gap-1">预设策略：<StatusTag mode="fill" variant={fallbackValue ? "green" : "gray"}>{fallbackValue ? "开启" : "关闭"}</StatusTag></span>
            <span className="text-[var(--text-muted)]">分组策略：<span className="text-[var(--text-emphasis)] font-medium">{groupCount} 条</span></span>
          </div>
          <span className="text-[12px] text-[#1447E6] inline-flex items-center gap-0.5">
            编辑策略<ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── TogglePolicyCard ────────────────────────────────────────────────────────
interface TogglePolicyCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  rules: PolicyRule<boolean>[];
  onRulesChange: (rules: PolicyRule<boolean>[]) => boolean | void;
}

function FMTogglePolicyCard({ icon, iconBg, title, description, rules, onRulesChange }: TogglePolicyCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [draftValue, setDraftValue] = useState<boolean>(true);
  const [addingNew, setAddingNew] = useState(false);
  const [confirmFallbackDraft, setConfirmFallbackDraft] = useState<boolean | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getDisabledIds = (excludeRuleId?: string) =>
    rules.filter((r) => r.groupIds.length > 0 && r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const fallbackRule = rules.find((r) => r.groupIds.length === 0)!;
  const groupRules = rules.filter((r) => r.groupIds.length > 0);
  const groupRuleValue = !fallbackRule.value;

  const startEdit = (rule: PolicyRule<boolean>) => {
    setEditingId(rule.id);
    setDraftGroupIds([...rule.groupIds]);
    setDraftValue(rule.groupIds.length === 0 ? rule.value : groupRuleValue);
    setAddingNew(false);
  };
  const startAdd = () => { setAddingNew(true); setEditingId(null); setDraftGroupIds([]); setDraftValue(groupRuleValue); };
  const cancelEdit = () => { setEditingId(null); setAddingNew(false); };

  const saveEdit = (ruleId?: string) => {
    if (addingNew) {
      if (draftGroupIds.length === 0) { toast.error("请选择至少一个分组"); return; }
      const result = onRulesChange([...groupRules, { id: `rule-${Date.now()}`, groupIds: draftGroupIds, value: groupRuleValue }, fallbackRule]);
      if (result === false) return;
      toast.success("策略已保存"); cancelEdit(); return;
    }
    if (!ruleId) return;
    if (ruleId === fallbackRule.id) {
      if (draftValue !== fallbackRule.value && groupRules.length > 0) { setConfirmFallbackDraft(draftValue); return; }
      const result = onRulesChange(rules.map((r) => r.id === ruleId ? { ...r, value: draftValue } : r));
      if (result === false) return;
      toast.success("策略已保存"); cancelEdit(); return;
    }
    const result = onRulesChange(rules.map((r) => r.id === ruleId ? { ...r, groupIds: draftGroupIds, value: groupRuleValue } : r));
    if (result === false) return;
    toast.success("策略已保存"); cancelEdit();
  };

  const handleConfirmFallbackSwitch = () => {
    if (confirmFallbackDraft === null) return;
    const result = onRulesChange([{ ...fallbackRule, value: confirmFallbackDraft }]);
    if (result !== false) { toast.success("已更新预设策略，分组策略已清空"); cancelEdit(); }
    setConfirmFallbackDraft(null);
  };

  const deleteRule = (ruleId: string) => {
    const result = onRulesChange(rules.filter((r) => r.id !== ruleId));
    if (result === false) return;
    toast.success("策略已删除");
  };

  return (
    <>
      {/* ── 卡片 ── */}
      <PolicyOverviewCard
        icon={icon}
        iconBg={iconBg}
        title={title}
        description={description}
        fallbackValue={fallbackRule.value}
        groupCount={groupRules.length}
        onClick={() => setDialogOpen(true)}
      />

      {/* ── 弹窗：表格行内编辑 ── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) cancelEdit(); }}>
        <DialogContent className="sm:max-w-[960px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              {/* 汇总行 */}
              <div className="flex items-center gap-4 text-[13px]">
                <span className="text-[var(--text-muted)] inline-flex items-center gap-1">预设策略：<StatusTag mode="fill" variant={fallbackRule.value ? "green" : "gray"}>{fallbackRule.value ? "开启" : "关闭"}</StatusTag></span>
                <span className="text-[var(--text-muted)]">分组策略：<span className="text-[var(--text-emphasis)] font-medium">{groupRules.length} 个</span></span>
              </div>

              {/* 表格 */}
              <div className="rounded-[4px] bg-white border border-[#EAEEF4]">
                <Table density="compact">
                  <colgroup><col style={{ width: 90 }} /><col /><col style={{ width: 100 }} /><col style={{ width: 100 }} /></colgroup>
                  <TableHeader>
                    <TableRow><TableHead className="align-middle">策略类型</TableHead><TableHead className="align-middle">应用范围</TableHead><TableHead className="align-middle">权限</TableHead><TableHead className="align-middle">操作</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 预设策略行 */}
                    <TableRow className="hover:bg-transparent border-0">
                      <TableCell className="text-[13px] text-[var(--text-muted)] align-middle">预设策略</TableCell>
                      <TableCell className="text-[13px] text-[var(--text-emphasis)] align-middle">
                        {groupRules.length > 0 ? "全部用户(分组策略用户除外)" : "全部用户"}
                      </TableCell>
                      <TableCell className="align-middle">
                        {editingId === fallbackRule.id ? (
                          <Select value={draftValue ? "on" : "off"} onValueChange={(v) => setDraftValue(v === "on")}>
                            <SelectTrigger className="h-7 w-[80px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on">开启</SelectItem>
                              <SelectItem value="off">关闭</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <StatusTag mode="fill" variant={fallbackRule.value ? "green" : "gray"}>{fallbackRule.value ? "开启" : "关闭"}</StatusTag>
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        {editingId === fallbackRule.id ? (
                          <div className="flex items-center gap-2">
                            <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={cancelEdit}>取消</Button>
                            <Button variant="link" size="sm" className="h-auto px-0 text-[12px] text-[#1447E6]" onClick={() => saveEdit(fallbackRule.id)}>保存</Button>
                          </div>
                        ) : (
                          <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => startEdit(fallbackRule)}>编辑</Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* 分割线 */}
                    {(groupRules.length > 0 || addingNew) && (
                      <tr className="h-0 border-0">
                        <td colSpan={4} className="p-0 border-0"><div className="h-px bg-[#E5E5E5]" /></td>
                      </tr>
                    )}

                    {/* 分组策略行 */}
                    {groupRules.map((rule, idx) => (
                      <TableRow key={rule.id} className="hover:bg-transparent border-0">
                        <TableCell className="text-[13px] text-[var(--text-muted)] align-middle">分组策略{idx + 1}</TableCell>
                        <TableCell className="align-middle">
                          {editingId === rule.id ? (
                            <FMGroupTagSelector selectedIds={draftGroupIds} disabledIds={getDisabledIds(rule.id)} onChange={setDraftGroupIds} />
                          ) : (
                            <FMGroupBadges groupIds={rule.groupIds} />
                          )}
                        </TableCell>
                        <TableCell className="align-middle">
                          <StatusTag mode="fill" variant={groupRuleValue ? "green" : "gray"}>{groupRuleValue ? "开启" : "关闭"}</StatusTag>
                        </TableCell>
                        <TableCell className="align-middle">
                          {editingId === rule.id ? (
                            <div className="flex items-center gap-2">
                              <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={cancelEdit}>取消</Button>
                              <Button variant="link" size="sm" className="h-auto px-0 text-[12px] text-[#1447E6]" onClick={() => saveEdit(rule.id)}>保存</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={() => startEdit(rule)}>编辑</Button>
                              <Button variant="link" size="sm" className="h-auto px-0 text-[12px] text-red-500" onClick={() => deleteRule(rule.id)}>删除</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* 新增行 */}
                    {addingNew && (
                      <TableRow className="hover:bg-transparent border-0">
                        <TableCell className="text-[13px] text-[var(--text-muted)] align-middle">分组策略{groupRules.length + 1}</TableCell>
                        <TableCell className="align-middle">
                          <FMGroupTagSelector selectedIds={draftGroupIds} disabledIds={getDisabledIds()} onChange={setDraftGroupIds} />
                        </TableCell>
                        <TableCell className="align-middle">
                          <StatusTag mode="fill" variant={groupRuleValue ? "green" : "gray"}>{groupRuleValue ? "开启" : "关闭"}</StatusTag>
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2">
                            <Button variant="link" size="sm" className="h-auto px-0 text-[12px]" onClick={cancelEdit}>取消</Button>
                            <Button variant="link" size="sm" className={`h-auto px-0 text-[12px] ${draftGroupIds.length === 0 ? "text-[var(--text-weak)] pointer-events-none" : "text-[#1447E6]"}`} disabled={draftGroupIds.length === 0} onClick={() => saveEdit()}>保存</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* 添加分组策略按钮 */}
                <button
                  type="button"
                  onClick={startAdd}
                  disabled={editingId !== null || addingNew}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[13px] text-[var(--text-emphasis)] bg-white border-t border-dashed border-[#EAEEF4] hover:bg-[#FAFAFA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />添加分组策略
                </button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmFallbackDraft !== null} onOpenChange={(o) => { if (!o) setConfirmFallbackDraft(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>切换后将清空分组策略</AlertDialogTitle>
            <AlertDialogDescription>分组策略是基于「预设策略」的例外设置。切换「预设策略」后，现有分组策略将全部清空，需重新添加。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFallbackSwitch}>确认切换</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Updated Mock Data for Enterprise Spaces
const ENTERPRISE_SPACES = [
  { id: "ent-001", name: "Agent 工具库", type: "公共", used: "12GB", quota: "50GB", expiry: "永久有效" },
  { id: "ent-002", name: "初始技能包", type: "公共", used: "8GB", quota: "50GB", expiry: "永久有效" },
];

// Mock Data for Personal Spaces (Flat Structure) - 已去重
const PERSONAL_SPACES_DATA = [
  { id: "user-ins-1", instanceId: "ins-u25p9jqg", instanceName: "Noah的分析助手", creator: "noah@acompany.com", avatar: "N", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false, wasEnabled: true, deletedDaysAgo: 20 }, // 永久删除状态（超过15天）
  { id: "user-ins-3", instanceId: "ins-v88x2kww", instanceName: "Noah的测试沙盒", creator: "noah@acompany.com", avatar: "N", type: "个人", used: "2GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-4", instanceId: "ins-t14o8ipf", instanceName: "Mia的新助手", creator: "mia@acompany.com", avatar: "M", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-6", instanceId: "ins-s03n7heo", instanceName: "Leo的项目助手", creator: "leo@acompany.com", avatar: "L", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-7", instanceId: "ins-x11m9zzz", instanceName: "Leo的文档库", creator: "leo@acompany.com", avatar: "L", type: "个人", used: "15GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-9", instanceId: "ins-p99k3mnn", instanceName: "Emma的数据分析", creator: "emma@acompany.com", avatar: "E", type: "个人", used: "7GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-10", instanceId: "ins-q22l4roo", instanceName: "David的代码助手", creator: "david@acompany.com", avatar: "D", type: "个人", used: "9GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-11", instanceId: "ins-r33m5spp", instanceName: "Sarah的研究工具", creator: "sarah@acompany.com", avatar: "S", type: "个人", used: "4GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-12", instanceId: "ins-t44n6tqq", instanceName: "Jack的文案助手", creator: "jack@acompany.com", avatar: "J", type: "个人", used: "6GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-13", instanceId: "ins-u55o7urr", instanceName: "Lisa的设计工具", creator: "lisa@acompany.com", avatar: "L", type: "个人", used: "11GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-14", instanceId: "ins-v66p8vss", instanceName: "Tom的营销助手", creator: "tom@acompany.com", avatar: "T", type: "个人", used: "8GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-15", instanceId: "ins-w77q9wtt", instanceName: "Amy的翻译工具", creator: "amy@acompany.com", avatar: "A", type: "个人", used: "3GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-16", instanceId: "ins-x88r0xuu", instanceName: "Mike的产品分析", creator: "mike@acompany.com", avatar: "M", type: "个人", used: "13GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-17", instanceId: "ins-y99s1yvv", instanceName: "Kate的客服助手", creator: "kate@acompany.com", avatar: "K", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-18", instanceId: "ins-z00t2zww", instanceName: "Ryan的技术文档", creator: "ryan@acompany.com", avatar: "R", type: "个人", used: "10GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-19", instanceId: "ins-a11u3axv", instanceName: "这是一个名称非常非常长的智能助手用来测试超长文本截断效果", creator: "longname-user@very-long-domain-example.com", avatar: "L", type: "个人", used: "8GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-20", instanceId: "ins-b22v4byw", instanceName: "GPULab产品线专属AI智能运营分析与决策支持系统", creator: "product-ops-admin@enterprise-acompany.com", avatar: "G", type: "个人", used: "22GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
];

function EnterpriseSpaceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 2.25C15.7824 2.25 16.417 2.88459 16.417 3.66699V12.333C16.417 14.22 14.887 15.75 13 15.75H1.58301V6.91699H6.25V3.66699C6.25 2.88459 6.88459 2.25 7.66699 2.25H15ZM3.08398 14.25H4.33398C5.39207 14.2497 6.2506 13.392 6.25098 12.334V9H6.25V8.41699H3.08398V14.25ZM7.75 6.91699H7.75098V12.334C7.75084 13.0442 7.53321 13.7036 7.16211 14.25H13C14.0585 14.25 14.917 13.3916 14.917 12.333V3.75H7.75V6.91699ZM13.667 9.08301H9V7.58301H13.667V9.08301ZM13.667 6.41699H9V4.91699H13.667V6.41699Z" fill="url(#paint0_linear_enterprise_space)"/>
      <defs>
        <linearGradient id="paint0_linear_enterprise_space" x1="15.1949" y1="15.9039" x2="7.92473" y2="6.96759" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0080FF"/>
          <stop offset="0.240385" stopColor="#0869C9"/>
          <stop offset="1" stopColor="#202020"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function AgentDiskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.50781 11.1562C4.97366 11.1563 5.35156 11.534 5.35156 11.9999C5.3515 12.4657 4.97362 12.8435 4.50781 12.8437H4.5C4.03405 12.8437 3.65631 12.4659 3.65625 11.9999C3.65625 11.5339 4.03401 11.1562 4.5 11.1562H4.50781Z" fill="url(#paint0_linear_agent_disk)"/>
      <path d="M7.50781 11.1562C7.97366 11.1563 8.35156 11.534 8.35156 11.9999C8.3515 12.4657 7.97362 12.8435 7.50781 12.8437H7.5C7.03405 12.8437 6.65631 12.4659 6.65625 11.9999C6.65625 11.5339 7.03401 11.1562 7.5 11.1562H7.50781Z" fill="url(#paint1_linear_agent_disk)"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M9 2.15616C9.46599 2.15616 9.84375 2.53392 9.84375 2.99991C9.84369 3.46585 9.46595 3.84366 9 3.84366H5.43066L5.33984 3.8505C5.24975 3.86312 5.16284 3.894 5.08496 3.9423C4.98124 4.00664 4.89709 4.09862 4.84277 4.20792L2.86133 8.16593H15.1387L14.9795 7.84757C14.771 7.43094 14.9399 6.92434 15.3564 6.71573C15.7731 6.50728 16.2797 6.67608 16.4883 7.09269L17.0957 8.3046C17.2589 8.63039 17.3437 8.99001 17.3438 9.35441V13.4999C17.3437 14.1215 17.0967 14.7176 16.6572 15.1571C16.2177 15.5966 15.6216 15.8437 15 15.8437H3C2.37843 15.8437 1.78231 15.5966 1.34277 15.1571C0.903263 14.7176 0.656281 14.1215 0.65625 13.4999V9.35441C0.656306 8.99001 0.74106 8.63039 0.904297 8.3046L3.33301 3.45499C3.52705 3.06543 3.82544 2.73712 4.19531 2.50773C4.56588 2.27793 4.99365 2.15639 5.42969 2.15616H9ZM2.34375 13.4999C2.34378 13.6739 2.41309 13.8407 2.53613 13.9638C2.6592 14.0868 2.82598 14.1562 3 14.1562H15C15.174 14.1562 15.3408 14.0868 15.4639 13.9638C15.5869 13.8407 15.6562 13.6739 15.6562 13.4999V9.85343H2.34375V13.4999Z" fill="url(#paint2_linear_agent_disk)"/>
      <path d="M13.3721 1.04776C13.4631 0.801787 13.8103 0.801787 13.9014 1.04776L14.5908 2.90909L16.4521 3.59855C16.698 3.68964 16.698 4.03679 16.4521 4.12784L14.5908 4.8173L13.9014 6.67862C13.816 6.90922 13.5051 6.92344 13.3916 6.72159L13.3721 6.67862L12.6826 4.8173L10.8213 4.12784C10.5753 4.03682 10.5753 3.68957 10.8213 3.59855L12.6826 2.90909L13.3721 1.04776Z" fill="url(#paint3_linear_agent_disk)"/>
      <defs>
        <linearGradient id="paint0_linear_agent_disk" x1="17" y1="16.5" x2="6.44431" y2="6.59202" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0080FF"/><stop offset="1" stopColor="#202020"/>
        </linearGradient>
        <linearGradient id="paint1_linear_agent_disk" x1="17" y1="16.5" x2="6.44431" y2="6.59202" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0080FF"/><stop offset="1" stopColor="#202020"/>
        </linearGradient>
        <linearGradient id="paint2_linear_agent_disk" x1="17" y1="16.5" x2="6.44431" y2="6.59202" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0080FF"/><stop offset="1" stopColor="#202020"/>
        </linearGradient>
        <linearGradient id="paint3_linear_agent_disk" x1="17" y1="16.5" x2="6.44431" y2="6.59202" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0080FF"/><stop offset="1" stopColor="#202020"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const StatCard = ({ title, value, icon: IconComponent }: { title: string; value: number; icon: React.FC }) => (
  <div className="bg-white rounded-[4px] border border-[#EAEEF4] px-6 py-5 flex flex-col gap-4">
    <div className="flex items-center gap-1">
      <IconComponent />
      <span className="text-sm font-medium text-[var(--text-title)] leading-[22px] tracking-[0.07px]">{title}</span>
    </div>
    <p className="text-2xl font-bold text-[var(--text-title)] leading-normal" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>{value}</p>
  </div>
);

export default function FileManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [autoBindRules, setAutoBindRules] = useState<PolicyRule<boolean>[]>([
    { id: "autobind-fallback", groupIds: [], value: true },
  ]);
  const [allowSelfEnableRules, setAllowSelfEnableRules] = useState<PolicyRule<boolean>[]>([
    { id: "selfopen-fallback", groupIds: [], value: true },
  ]);
  const [instancesEnabled, setInstancesEnabled] = useState<Record<string, boolean>>(
    PERSONAL_SPACES_DATA.reduce((acc, item) => {
      acc[item.id] = item.enabled;
      return acc;
    }, {} as Record<string, boolean>)
  );
  // 追踪曾经启用过的实例（用于显示"可恢复"状态）
  const [instancesEverEnabled, setInstancesEverEnabled] = useState<Record<string, boolean>>(
    PERSONAL_SPACES_DATA.reduce((acc, item) => {
      // @ts-ignore - 使用 wasEnabled 字段初始化
      acc[item.id] = item.wasEnabled !== undefined ? item.wasEnabled : item.enabled;
      return acc;
    }, {} as Record<string, boolean>)
  );
  // 追踪实例的关闭时间（用于计算剩余天数）
  const [instancesDisabledTime, setInstancesDisabledTime] = useState<Record<string, Date>>(
    PERSONAL_SPACES_DATA.reduce((acc, item) => {
      // @ts-ignore - 如果有 deletedDaysAgo 字段，计算关闭时间
      if (item.deletedDaysAgo !== undefined) {
        const disabledDate = new Date();
        // @ts-ignore
        disabledDate.setDate(disabledDate.getDate() - item.deletedDaysAgo);
        acc[item.id] = disabledDate;
      }
      return acc;
    }, {} as Record<string, Date>)
  );
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [instanceToDisable, setInstanceToDisable] = useState<{ id: string; name: string } | null>(null);
  const [batchEnableDialogOpen, setBatchEnableDialogOpen] = useState(false);
  const [singleEnableDialogOpen, setSingleEnableDialogOpen] = useState(false);
  const [instanceToEnable, setInstanceToEnable] = useState<{ id: string; name: string } | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [instanceToPurchase, setInstanceToPurchase] = useState<{ id: string; name: string } | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string>("50GB");
  const [selectedDuration, setSelectedDuration] = useState<string>("3");
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [instanceToRenew, setInstanceToRenew] = useState<{ id: string; name: string } | null>(null);
  const [renewDuration, setRenewDuration] = useState<string>("3");
  const [expandDialogOpen, setExpandDialogOpen] = useState(false);
  const [instanceToExpand, setInstanceToExpand] = useState<{ id: string; name: string } | null>(null);
  const [expandCapacity, setExpandCapacity] = useState<string>("100GB");
  const [recyclebinOpen, setRecyclebinOpen] = useState(false);
  const [enableChoiceDialogOpen, setEnableChoiceDialogOpen] = useState(false);
  const [instanceToEnableChoice, setInstanceToEnableChoice] = useState<{ id: string; name: string } | null>(null);
  const [recyclebinRecoverDialogOpen, setRecyclebinRecoverDialogOpen] = useState(false);
  const [instanceToRecoverFromRecyclebin, setInstanceToRecoverFromRecyclebin] = useState<{ id: string; name: string } | null>(null);
  const [recyclebinDeleteDialogOpen, setRecyclebinDeleteDialogOpen] = useState(false);
  const [instanceToDeletePermanently, setInstanceToDeletePermanently] = useState<{ id: string; name: string } | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [instanceToTransfer, setInstanceToTransfer] = useState<{ id: string; name: string; instanceId: string } | null>(null);
  const [selectedTargetInstance, setSelectedTargetInstance] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleToggleInstance = (instanceId: string, instanceName: string, currentEnabled: boolean, wasEverEnabled: boolean) => {
    if (currentEnabled) {
      // 如果当前是开启状态，尝试关闭时弹出确认对话框
      setInstanceToDisable({ id: instanceId, name: instanceName });
      setDisableDialogOpen(true);
    } else {
      // 如果当前是关闭状态
      // 检查回收站中是否有该实例自己的网盘（15天内可恢复）
      const hasOwnRecyclableSpace = wasEverEnabled && !isPermanentlyDeleted(instanceId);
      
      if (hasOwnRecyclableSpace) {
        // 回收站中有该实例自己的网盘，弹出选择弹窗（新启用 vs 恢复之前的）
        setInstanceToEnableChoice({ id: instanceId, name: instanceName });
        setEnableChoiceDialogOpen(true);
      } else {
        // 回收站中没有该实例自己的网盘，直接弹出首次启用确认对话框（不再检查其他实例）
        setInstanceToEnable({ id: instanceId, name: instanceName });
        setSingleEnableDialogOpen(true);
      }
    }
  };

  const handleConfirmDisable = () => {
    if (instanceToDisable) {
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceToDisable.id]: false
      }));
      // 记录关闭时间
      setInstancesDisabledTime(prev => ({
        ...prev,
        [instanceToDisable.id]: new Date()
      }));
    }
    setDisableDialogOpen(false);
    setInstanceToDisable(null);
  };

  const handleCancelDisable = () => {
    setDisableDialogOpen(false);
    setInstanceToDisable(null);
  };

  const handleBatchEnable = () => {
    if (selectedInstances.size > 0) {
      setBatchEnableDialogOpen(true);
    }
  };

  const handleConfirmBatchEnable = () => {
    // 启用所有选中的实例
    const newEnabled = { ...instancesEnabled };
    const newEverEnabled = { ...instancesEverEnabled };
    const newDisabledTimes = { ...instancesDisabledTime };
    selectedInstances.forEach(instanceId => {
      newEnabled[instanceId] = true;
      newEverEnabled[instanceId] = true; // 标记为曾经启用过
      delete newDisabledTimes[instanceId]; // 清除关闭时间
    });
    setInstancesEnabled(newEnabled);
    setInstancesEverEnabled(newEverEnabled);
    setInstancesDisabledTime(newDisabledTimes);
    setSelectedInstances(new Set()); // 清空选中状态
    setBatchEnableDialogOpen(false);
  };

  const handleCancelBatchEnable = () => {
    setBatchEnableDialogOpen(false);
  };

  const handleConfirmSingleEnable = () => {
    if (instanceToEnable) {
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceToEnable.id]: true
      }));
      setInstancesEverEnabled(prev => ({
        ...prev,
        [instanceToEnable.id]: true // 标记为曾经启用过
      }));
    }
    setSingleEnableDialogOpen(false);
    setInstanceToEnable(null);
  };

  const handleCancelSingleEnable = () => {
    setSingleEnableDialogOpen(false);
    setInstanceToEnable(null);
  };

  // 选择新启用
  const handleChooseNewEnable = () => {
    if (instanceToEnableChoice) {
      setInstanceToEnable({ id: instanceToEnableChoice.id, name: instanceToEnableChoice.name });
      setEnableChoiceDialogOpen(false);
      setInstanceToEnableChoice(null);
      setSingleEnableDialogOpen(true);
    }
  };

  // 选择恢复已有
  const handleChooseRecoverExisting = () => {
    if (!instanceToEnableChoice) {
      setEnableChoiceDialogOpen(false);
      setInstanceToEnableChoice(null);
      return;
    }
    
    // 直接恢复该实例自己的网盘（因为只有该实例自己有网盘时才会显示选择弹窗）
    handleDirectRecover(instanceToEnableChoice.id);
    
    setEnableChoiceDialogOpen(false);
    setInstanceToEnableChoice(null);
  };

  // 取消选择
  const handleCancelEnableChoice = () => {
    setEnableChoiceDialogOpen(false);
    setInstanceToEnableChoice(null);
  };


  const handleConfirmPurchase = () => {
    if (instanceToPurchase) {
      // 启用实例
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceToPurchase.id]: true
      }));
      setInstancesEverEnabled(prev => ({
        ...prev,
        [instanceToPurchase.id]: true
      }));
      // 清除关闭时间记录
      setInstancesDisabledTime(prev => {
        const newTimes = { ...prev };
        delete newTimes[instanceToPurchase.id];
        return newTimes;
      });
    }
    setPurchaseDialogOpen(false);
    setInstanceToPurchase(null);
    // 重置选择
    setSelectedCapacity("50GB");
    setSelectedDuration("3");
  };

  const handleCancelPurchase = () => {
    setPurchaseDialogOpen(false);
    setInstanceToPurchase(null);
    // 重置选择
    setSelectedCapacity("50GB");
    setSelectedDuration("3");
  };

  // 计算购买价格
  const calculatePrice = () => {
    const capacityPrices: Record<string, number> = {
      "50GB": 2,
      "100GB": 4,
      "500GB": 8
    };
    const basePrice = capacityPrices[selectedCapacity] || 0;
    const duration = parseInt(selectedDuration);
    return basePrice * duration;
  };

  // 处理续费
  const handleRenew = (instanceId: string, instanceName: string) => {
    setInstanceToRenew({ id: instanceId, name: instanceName });
    setRenewDialogOpen(true);
  };

  const handleConfirmRenew = () => {
    if (instanceToRenew) {
      // TODO: 实现续费逻辑
      console.log('确认续费', instanceToRenew.id, '时长', renewDuration);
    }
    setRenewDialogOpen(false);
    setInstanceToRenew(null);
    setRenewDuration("3");
  };

  const handleCancelRenew = () => {
    setRenewDialogOpen(false);
    setInstanceToRenew(null);
    setRenewDuration("3");
  };

  // 计算续费价格
  const calculateRenewPrice = () => {
    const basePrice = 2; // 假设当前容量为50GB，单价2元/月
    const duration = parseInt(renewDuration);
    return basePrice * duration;
  };

  // 处理扩容
  const handleExpand = (instanceId: string, instanceName: string) => {
    setInstanceToExpand({ id: instanceId, name: instanceName });
    setExpandDialogOpen(true);
  };

  const handleConfirmExpand = () => {
    if (instanceToExpand) {
      // TODO: 实现扩容逻辑
      console.log('确认扩容', instanceToExpand.id, '容量', expandCapacity);
    }
    setExpandDialogOpen(false);
    setInstanceToExpand(null);
    setExpandCapacity("50GB");
  };

  const handleCancelExpand = () => {
    setExpandDialogOpen(false);
    setInstanceToExpand(null);
    setExpandCapacity("100GB");
  };

  // 生成扩容容量选项（以50GB为步长，最多显示6个档位）
  const generateExpandCapacityOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      const capacity = i * 50;
      options.push({
        value: `${capacity}GB`,
        label: `${capacity}GB`,
        price: `¥${i * 2}`
      });
    }
    return options;
  };

  // 计算扩容价格（一次性费用，不涉及时长）
  // 规则：每50GB = ¥2
  const calculateExpandPrice = () => {
    const match = expandCapacity.match(/^(\d+)GB$/);
    if (match) {
      const capacity = parseInt(match[1]);
      return (capacity / 50) * 2;
    }
    return 0;
  };

  // 计算可恢复的剩余天数
  const getRemainingDays = (instanceId: string): number => {
    const disabledTime = instancesDisabledTime[instanceId];
    if (!disabledTime) return 15; // 如果没有关闭时间记录，默认显示15天
    
    const now = new Date();
    const diffTime = now.getTime() - disabledTime.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = 15 - diffDays;
    
    return Math.max(0, remainingDays); // 确保不返回负数
  };

  // 获取回收站中的实例（已关闭的实例）
  const getRecyclebinInstances = () => {
    return PERSONAL_SPACES_DATA.filter(item => {
      const isDisabled = !instancesEnabled[item.id];
      const wasEnabled = instancesEverEnabled[item.id];
      return isDisabled && wasEnabled;
    }).map(item => ({
      ...item,
      remainingDays: getRemainingDays(item.id),
      isPermanentlyDeleted: isPermanentlyDeleted(item.id)
    }));
  };

  // 从回收站永久删除实例
  const handlePermanentDelete = (instanceId: string) => {
    // 这里可以调用后端API永久删除数据
    console.log('永久删除实例:', instanceId);
    // 从instancesEverEnabled中移除，表示彻底删除
    setInstancesEverEnabled(prev => {
      const newEnabled = { ...prev };
      delete newEnabled[instanceId];
      return newEnabled;
    });
  };

  // 确认永久删除
  const handleConfirmPermanentDelete = () => {
    if (instanceToDeletePermanently) {
      handlePermanentDelete(instanceToDeletePermanently.id);
    }
    setRecyclebinDeleteDialogOpen(false);
    setInstanceToDeletePermanently(null);
  };

  // 取消永久删除
  const handleCancelPermanentDelete = () => {
    setRecyclebinDeleteDialogOpen(false);
    setInstanceToDeletePermanently(null);
  };

  // 直接恢复实例（免费）
  const handleDirectRecover = (instanceId: string) => {
    console.log('直接恢复实例:', instanceId);
    setInstancesEnabled(prev => ({
      ...prev,
      [instanceId]: true
    }));
    // 清除关闭时间记录
    setInstancesDisabledTime(prev => {
      const newTimes = { ...prev };
      delete newTimes[instanceId];
      return newTimes;
    });
  };

  // 从回收站恢复实例
  const handleRestoreFromRecyclebin = (instanceId: string, instanceName: string) => {
    // 打开恢复确认弹窗
    setInstanceToRecoverFromRecyclebin({ id: instanceId, name: instanceName });
    setRecyclebinRecoverDialogOpen(true);
  };

  // 确认从回收站恢复
  const handleConfirmRecyclebinRecover = () => {
    if (instanceToRecoverFromRecyclebin) {
      handleDirectRecover(instanceToRecoverFromRecyclebin.id);
    }
    setRecyclebinRecoverDialogOpen(false);
    setInstanceToRecoverFromRecyclebin(null);
  };

  // 取消从回收站恢复
  const handleCancelRecyclebinRecover = () => {
    setRecyclebinRecoverDialogOpen(false);
    setInstanceToRecoverFromRecyclebin(null);
  };

  // 打开转接对话框
  const handleOpenTransfer = (instanceId: string, instanceName: string, instanceIdString: string) => {
    setInstanceToTransfer({ id: instanceId, name: instanceName, instanceId: instanceIdString });
    setSelectedTargetInstance("");
    setTransferDialogOpen(true);
  };

  // 确认转接
  const handleConfirmTransfer = () => {
    if (!instanceToTransfer || !selectedTargetInstance) {
      return;
    }
    
    // 执行转接逻辑
    console.log('转接网盘:', instanceToTransfer.id, '目标实例:', selectedTargetInstance);
    
    // 1. 将原实例的网盘标记为永久删除
    setInstancesEverEnabled(prev => {
      const newEnabled = { ...prev };
      delete newEnabled[instanceToTransfer.id];
      return newEnabled;
    });
    
    // 2. 将目标实例启用并标记为曾经启用过
    setInstancesEnabled(prev => ({
      ...prev,
      [selectedTargetInstance]: true
    }));
    setInstancesEverEnabled(prev => ({
      ...prev,
      [selectedTargetInstance]: true
    }));
    
    // 3. 清除目标实例的关闭时间（如果有）
    setInstancesDisabledTime(prev => {
      const newTimes = { ...prev };
      delete newTimes[selectedTargetInstance];
      return newTimes;
    });
    
    // 关闭对话框
    setTransferDialogOpen(false);
    setInstanceToTransfer(null);
    setSelectedTargetInstance("");
  };

  // 取消转接
  const handleCancelTransfer = () => {
    setTransferDialogOpen(false);
    setInstanceToTransfer(null);
    setSelectedTargetInstance("");
  };

  // 获取可转接的目标实例列表（排除当前实例）
  const getAvailableTargetInstances = () => {
    if (!instanceToTransfer) return [];
    return PERSONAL_SPACES_DATA.filter(item => 
      item.id !== instanceToTransfer.id && // 排除当前实例
      !instancesEnabled[item.id] && // 只显示未启用的实例
      !instancesEverEnabled[item.id] // 排除曾经启用过的实例
    );
  };


  // 检查实例是否已永久删除（超过15天）
  const isPermanentlyDeleted = (instanceId: string): boolean => {
    const disabledTime = instancesDisabledTime[instanceId];
    if (!disabledTime) return false;
    
    const now = new Date();
    const diffTime = now.getTime() - disabledTime.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 15; // 超过或等于15天则永久删除
  };

  // 计算未启用的实例数量（排除永久删除的）
  const disabledInstancesCount = React.useMemo(() => {
    return PERSONAL_SPACES_DATA.filter(item => 
      !instancesEnabled[item.id] && !isPermanentlyDeleted(item.id)
    ).length;
  }, [instancesEnabled, instancesDisabledTime]);

  // 获取所有未启用的实例ID（排除永久删除的）
  const allDisabledInstanceIds = React.useMemo(() => {
    return PERSONAL_SPACES_DATA.filter(item => 
      !instancesEnabled[item.id] && !isPermanentlyDeleted(item.id)
    ).map(item => item.id);
  }, [instancesEnabled, instancesDisabledTime]);

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInstances(new Set(allDisabledInstanceIds));
    } else {
      setSelectedInstances(new Set());
    }
  };

  // 处理单个实例选中
  const handleSelectInstance = (instanceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInstances);
    if (checked) {
      newSelected.add(instanceId);
    } else {
      newSelected.delete(instanceId);
    }
    setSelectedInstances(newSelected);
  };

  // 判断是否全选
  const isAllSelected = allDisabledInstanceIds.length > 0 && 
    allDisabledInstanceIds.every(id => selectedInstances.has(id));

  // 判断是否部分选中
  const isIndeterminate = selectedInstances.size > 0 && 
    selectedInstances.size < allDisabledInstanceIds.length;

  // 计算统计数据
  const stats = React.useMemo(() => {
    // 计算企业公共空间数量
    const enterpriseSpacesCount = ENTERPRISE_SPACES.length;

    // 计算个人空间实例总数（只计算enabled=true的记录）
    const totalPersonalInstances = PERSONAL_SPACES_DATA.filter(item => instancesEnabled[item.id]).length;

    return {
      enterpriseSpacesCount,
      totalPersonalInstances
    };
  }, [instancesEnabled]);

  // 搜索过滤
  const filteredPersonalSpaces = React.useMemo(() => {
    let result = PERSONAL_SPACES_DATA;
    // 分组筛选
    if (groupFilter) {
      // 收集所选分组及其子孙 ID
      const collectIds = (nodes: GroupNode[], targetId: string): string[] => {
        const ids: string[] = [];
        const collect = (node: GroupNode) => { ids.push(node.id); node.children?.forEach(collect); };
        const find = (list: GroupNode[]): boolean => {
          for (const n of list) {
            if (n.id === targetId) { collect(n); return true; }
            if (n.children && find(n.children)) return true;
          }
          return false;
        };
        find(nodes);
        return ids;
      };
      const allowedGroupIds = collectIds(MOCK_GROUP_TREE_MANUAL, groupFilter);
      result = result.filter(item => {
        const g = CREATOR_GROUP_MAP[item.creator];
        return g && allowedGroupIds.includes(g);
      });
    }
    // 关键词搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.instanceName.toLowerCase().includes(query) ||
        item.instanceId.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query)
      );
    }
    return result;
  }, [searchQuery, groupFilter]);

  // 计算总页数
  const totalPages = Math.ceil(filteredPersonalSpaces.length / itemsPerPage);

  // 获取当前页数据
  const paginatedPersonalSpaces = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPersonalSpaces.slice(startIndex, endIndex);
  }, [filteredPersonalSpaces, currentPage]);

  // 当搜索或分组条件变化时重置到第一页
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, groupFilter]);

  return (
    <div className="page-enter space-y-8 w-full">
      <AdminPageHeader
        title="网盘管理"
        description="为您提供专属、安全的云存储空间，由腾讯云存储 Agent Storage 服务提供支持"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-5">
        <StatCard
          title="企业公共空间"
          value={stats.enterpriseSpacesCount}
          icon={EnterpriseSpaceIcon}
        />
        <StatCard
          title="已开通智能体网盘"
          value={stats.totalPersonalInstances}
          icon={AgentDiskIcon}
        />
      </div>

      {/* Enterprise Public Space Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-[var(--text-title)]">企业公共空间</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">默认开启,为您赠送 50GB + 50GB 永久免费空间,用于存放 Agent 工具库和初始技能包</p>
        </div>

        <div
          className="bg-white rounded-[4px] border border-[#EAEEF4] overflow-hidden"
        >
          <Table variant="elevated-white">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">空间名称</TableHead>
                <TableHead className="w-[18%]">类型</TableHead>
                <TableHead className="w-[28%]">已用/存储容量</TableHead>
                <TableHead className="w-[19%]">有效期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENTERPRISE_SPACES.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <span className="tabular-nums">
                      {item.used}/<span className="font-semibold">{item.quota}</span>
                    </span>
                    <StatusTag mode="fill" variant="green" className="ml-2">免费</StatusTag>
                  </TableCell>
                  <TableCell className="tabular-nums">{item.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* AI Agent Private Space Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-[var(--text-title)]">智能体网盘</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">开启后,为您赠送每个 OpenClaw 实例 3个月50GB 免费额度,到期后可以通过购买资源包进行续租</p>
        </div>

        {/* 网盘配置卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <FMTogglePolicyCard
            icon={<img src="/assets/admin-disk-management/auto-bind-disk.svg" alt="" className="w-8 h-8" />}
            iconBg=""
            title="新增实例是否自动绑定网盘"
            description="开启后,新创建的 AI 智能体实例将自动分配网盘空间"
            rules={autoBindRules}
            onRulesChange={setAutoBindRules}
          />
          <FMTogglePolicyCard
            icon={<img src="/assets/admin-disk-management/self-enable-disk.svg" alt="" className="w-8 h-8" />}
            iconBg=""
            title="允许用户自行开启网盘"
            description="开启后,用户可在自己的实例中自主开启网盘服务"
            rules={allowSelfEnableRules}
            onRulesChange={setAllowSelfEnableRules}
          />
        </div>

        {/* 工具栏（独立于表格） */}
        <div className="flex items-center justify-between mb-4 mt-4">
            <div className="flex items-center gap-3">
              <Button
                variant="dialog-confirm"
                onClick={handleBatchEnable}
                disabled={selectedInstances.size === 0}
              >
                批量启用网盘服务{selectedInstances.size > 0 && `(${selectedInstances.size})`}
              </Button>
              <Button
                variant="claw-outline"
                size="claw"
                className="gap-2"
                onClick={() => setRecyclebinOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                回收站{getRecyclebinInstances().length > 0 && `(${getRecyclebinInstances().length})`}
              </Button>
              <span className="text-[14px] text-[var(--text-muted)]">共计 <span className="font-semibold text-[var(--text-title)] tabular-nums">{stats.totalPersonalInstances}</span> 个 OpenClaw 实例启用了该服务</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-weak)]" />
                <Input
                  placeholder="搜索名称、ID或创建人"
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <FMGroupFilter
                groups={MOCK_GROUP_TREE_MANUAL}
                value={groupFilter}
                onChange={(v) => setGroupFilter(v)}
              />
            </div>
        </div>

        <div
          className="bg-white rounded-[4px] border border-[#EAEEF4] overflow-hidden"
        >

          {/* Flat Table */}
          <Table variant="elevated-white">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '56px', minWidth: '56px' }}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={disabledInstancesCount === 0}
                      className={disabledInstancesCount === 0 ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
                      aria-label="全选"
                    />
                  </div>
                </TableHead>
                <TableHead style={{ width: '220px', minWidth: '220px' }}>OpenClaw 实例</TableHead>
                <TableHead style={{ width: '220px', minWidth: '220px' }}>创建人</TableHead>
                <TableHead style={{ minWidth: '80px' }}>类型</TableHead>
                <TableHead style={{ minWidth: '200px' }}>已用/存储容量</TableHead>
                <TableHead style={{ minWidth: '120px' }}>有效期</TableHead>
                <TableHead style={{ minWidth: '100px' }}>启用网盘</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPersonalSpaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-[var(--text-weak)]" />
                      <p className="text-sm text-[var(--text-muted)]">未找到匹配的记录</p>
                      <p className="text-xs text-[var(--text-weak)]">请尝试其他搜索关键词</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPersonalSpaces.map((item) => {
                  const isEnabled = instancesEnabled[item.id];
                  const wasEverEnabled = instancesEverEnabled[item.id];
                  const isSelected = selectedInstances.has(item.id);
                  const isDeleted = wasEverEnabled && isPermanentlyDeleted(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-[#fafafa]/50 transition-colors ${!(isEnabled || isDeleted) ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (!(isEnabled || isDeleted)) {
                          handleSelectInstance(item.id, !isSelected);
                        }
                      }}
                    >
                      <td className="px-4 py-3 align-middle" style={{ width: '56px', minWidth: '56px' }}>
                        <div className="flex items-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectInstance(item.id, checked as boolean)}
                            disabled={isEnabled || isDeleted}
                            className={(isEnabled || isDeleted) ? "opacity-60 cursor-not-allowed pointer-events-none bg-gray-300 border-gray-500" : ""}
                            aria-label={`选择 ${item.instanceName}`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ width: '220px', minWidth: '220px' }}>
                        <div className="flex flex-col min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium text-[var(--text-title)] truncate max-w-[180px]">{item.instanceName}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs break-all">{item.instanceName}</TooltipContent>
                            </Tooltip>
                            <span className="text-xs font-mono text-[#355EF1]">{item.instanceId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ width: '220px', minWidth: '220px' }}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-[var(--text-title)] truncate block max-w-[200px]">{item.creator}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs max-w-xs break-all">{item.creator}</TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3 text-[14px] text-[#09090b]">
                          {item.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {isEnabled ? (
                          <span className="tabular-nums">
                            {item.used}/{<span className="font-semibold">{item.quota}</span>}
                            <span className="ml-2 px-2 py-0.5 rounded-[4px] text-xs font-medium bg-emerald-50 text-emerald-600">
                              免费
                            </span>
                          </span>
                        ) : wasEverEnabled && !isPermanentlyDeleted(item.id) ? (
                          <span className="tabular-nums flex items-center gap-1">
                            <span>
                              {item.used}/{<span className="font-semibold">{item.quota}</span>}
                              <span className="ml-2 px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#eff4ff] text-[#355EF1]">
                                可恢复
                              </span>
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-[#355EF1] cursor-help shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">剩余 {getRemainingDays(item.id)} 天可恢复</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </span>
                        ) : (
                          <span className="text-[var(--text-weak)]">未启用</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)] tabular-nums">
                        {isEnabled ? item.expiry : <span className="text-[var(--text-weak)]">-</span>}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Switch 
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleInstance(item.id, item.instanceName, isEnabled, wasEverEnabled)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-4 py-2 border-t border-[#EAEEF4]">
            <Pagination
              total={filteredPersonalSpaces.length}
              current={currentPage}
              pageSize={itemsPerPage}
              showTotal={(total) => `共 ${total} 条记录`}
              className="w-full justify-between"
              hideOnSinglePage
              onChange={(page) => { setCurrentPage(page); }}
            />
          </div>
        </div>
      </div>

      {/* Disable Confirmation Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)]">
              确认关闭网盘
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              您确定要关闭 <span className="font-bold text-[var(--text-title)]">"{instanceToDisable?.name}"</span> 的网盘功能吗？
            </p>
            <div className="p-3 bg-[#fafafa] border border-[#EAEEF4] rounded-[4px]">
              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold">关闭网盘后：</p>
                <div className="space-y-0.5 ml-1">
                  <p>• 该实例将无法访问网盘中的文件</p>
                  <p>• 15天内网盘数据可恢复</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDisable}>取消</Button>
            <Button onClick={handleConfirmDisable} variant="destructive">
              确认关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Enable Confirmation Dialog */}
      <Dialog open={batchEnableDialogOpen} onOpenChange={setBatchEnableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)]">
              批量启用网盘服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              您确定要为选中的 <span className="font-semibold text-[var(--text-title)] tabular-nums">{selectedInstances.size}</span> 个实例启用网盘服务吗?
            </p>
            <div className="bg-[#fafafa] border border-[#EAEEF4] rounded-[4px] px-3 py-2.5">
              <div className="text-xs text-[var(--text-secondary)] space-y-1 leading-relaxed">
                <p className="font-semibold">启用后：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>每个实例将获得 3个月50GB 免费额度</li>
                  <li>实例可以访问专属网盘空间</li>
                  <li>到期后可购买资源包续租</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelBatchEnable}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleConfirmBatchEnable}>
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Choice Dialog - 选择新启用或恢复已有 */}
      <Dialog open={enableChoiceDialogOpen} onOpenChange={setEnableChoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)]">
              选择启用方式
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              检测到回收站中有该实例之前的网盘空间（15天内可恢复），您可以选择：
            </p>
            
            <div className="space-y-3">
              {/* 新启用网盘 */}
              <button
                onClick={handleChooseNewEnable}
                className="w-full group relative overflow-hidden rounded-[4px] border-2 border-[#EAEEF4] hover:border-[#355EF1] bg-white p-5 text-left transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-[4px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-title)] mb-1">新启用网盘</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      为该实例创建新的网盘空间
                    </p>
                  </div>
                </div>
              </button>

              {/* 恢复已有网盘 */}
              <button
                onClick={handleChooseRecoverExisting}
                className="w-full group relative overflow-hidden rounded-[4px] border-2 border-[#EAEEF4] hover:border-green-400 bg-white p-5 text-left transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-[4px] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-title)] mb-1">恢复已有网盘</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      恢复该实例之前的网盘空间，保留原有文件和数据
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEnableChoice}>取消</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Enable Confirmation Dialog */}
      <Dialog open={singleEnableDialogOpen} onOpenChange={setSingleEnableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)]">
              启用网盘服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              您确定要为 <span className="font-bold text-[var(--text-title)]">"{instanceToEnable?.name}"</span> 启用网盘服务吗?
            </p>
            <div className="bg-[#fafafa] border border-[#EAEEF4] rounded-[4px] px-3 py-2.5">
              <div className="text-xs text-[var(--text-secondary)] space-y-1 leading-relaxed">
                <p className="font-semibold">启用后：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>该实例将获得 3个月50GB 免费额度</li>
                  <li>实例可以访问专属网盘空间</li>
                  <li>到期后可以进行续租</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSingleEnable}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleConfirmSingleEnable}>
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Storage Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              购买网盘容量
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="bg-[#eff4ff] border border-[#355EF1] rounded-[4px] px-3 py-2.5">
              <p className="text-xs text-[#355EF1] leading-relaxed">
                为 <span className="font-semibold">"{instanceToPurchase?.name}"</span> 购买网盘容量
              </p>
            </div>

            {/* 选择存储容量 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[var(--text-title)]">选择存储容量</Label>
              <RadioGroup value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "50GB", label: "50GB", price: "¥2/月" },
                    { value: "100GB", label: "100GB", price: "¥4/月" },
                    { value: "500GB", label: "500GB", price: "¥8/月" }
                  ].map((item) => (
                    <div key={item.value} className="flex items-center">
                      <RadioGroupItem value={item.value} id={item.value} className="peer sr-only" />
                      <Label
                        htmlFor={item.value}
                        className="flex flex-1 flex-col items-center justify-center rounded-[4px] border-2 border-[#EAEEF4] bg-white p-3 hover:bg-[#fafafa] cursor-pointer peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 transition-all"
                      >
                        <span className="text-sm font-semibold text-[var(--text-title)]">{item.label}</span>
                        <span className="text-xs text-[var(--text-muted)] mt-1">{item.price}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* 选择购买时长 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[var(--text-title)]">选择购买时长</Label>
              <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
                <div className="space-y-2">
                  {[
                    { value: "1", label: "1个月" },
                    { value: "3", label: "3个月" },
                    { value: "6", label: "6个月" },
                    { value: "12", label: "12个月" }
                  ].map((item) => (
                    <div key={item.value} className="flex items-center">
                      <RadioGroupItem value={item.value} id={`duration-${item.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`duration-${item.value}`}
                        className="flex flex-1 items-center justify-between rounded-[4px] border-2 border-[#EAEEF4] bg-white p-3 hover:bg-[#fafafa] cursor-pointer peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 transition-all"
                      >
                        <span className="text-sm font-medium text-[var(--text-title)]">{item.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* 价格汇总 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-[4px] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">合计金额：</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-600 tabular-nums">¥{calculatePrice()}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                购买后立即生效，有效期 {selectedDuration} 个月
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPurchase}>取消</Button>
            <Button
              onClick={handleConfirmPurchase}
              className="gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              确认购买
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Storage Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#355EF1]" />
              续费网盘
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="bg-[#eff4ff] border border-[#355EF1] rounded-[4px] px-3 py-2.5">
              <p className="text-xs text-[#355EF1] leading-relaxed">
                为 <span className="font-semibold">"{instanceToRenew?.name}"</span> 续费网盘服务
              </p>
            </div>

            <div className="bg-[#fafafa] border border-[#EAEEF4] rounded-[4px] px-3 py-2.5">
              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold">当前配置：</p>
                <p>• 存储容量：50GB</p>
                <p>• 到期时间：2026-06-30</p>
              </div>
            </div>

            {/* 选择续费时长 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[var(--text-title)]">选择续费时长</Label>
              <RadioGroup value={renewDuration} onValueChange={setRenewDuration}>
                <div className="space-y-2">
                  {[
                    { value: "1", label: "1个月" },
                    { value: "3", label: "3个月" },
                    { value: "6", label: "6个月" },
                    { value: "12", label: "12个月" }
                  ].map((item) => (
                    <div key={item.value} className="flex items-center">
                      <RadioGroupItem value={item.value} id={`renew-duration-${item.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`renew-duration-${item.value}`}
                        className="flex flex-1 items-center justify-between rounded-[4px] border-2 border-[#EAEEF4] bg-white p-3 hover:bg-[#fafafa] cursor-pointer peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-[#eff4ff] transition-all"
                      >
                        <span className="text-sm font-medium text-[var(--text-title)]">{item.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* 价格汇总 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-[#355EF1] rounded-[4px] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">续费金额：</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#355EF1] tabular-nums">¥{calculateRenewPrice()}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                续费后有效期延长 {renewDuration} 个月
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRenew}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleConfirmRenew}>
              确认续费
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expand Storage Dialog */}
      <Dialog open={expandDialogOpen} onOpenChange={setExpandDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-title)] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              扩容网盘
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="bg-purple-50 border border-purple-100 rounded-[4px] px-3 py-2.5">
              <p className="text-xs text-purple-600 leading-relaxed">
                为 <span className="font-semibold">"{instanceToExpand?.name}"</span> 扩容网盘空间
              </p>
            </div>

            <div className="bg-[#fafafa] border border-[#EAEEF4] rounded-[4px] px-3 py-2.5">
              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold">当前配置：</p>
                <p>• 存储容量：50GB</p>
                <p>• 到期时间：2026-06-30</p>
              </div>
            </div>

            {/* 选择扩容容量 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[var(--text-title)]">选择扩容容量</Label>
              <RadioGroup value={expandCapacity} onValueChange={setExpandCapacity}>
                <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto pr-2">
                  {generateExpandCapacityOptions().map((item) => (
                    <div key={item.value} className="flex items-center">
                      <RadioGroupItem value={item.value} id={`expand-${item.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`expand-${item.value}`}
                        className="flex flex-1 flex-col items-center justify-center rounded-[4px] border-2 border-[#EAEEF4] bg-white p-3 hover:bg-[#fafafa] cursor-pointer peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 transition-all"
                      >
                        <span className="text-sm font-semibold text-[var(--text-title)]">{item.label}</span>
                        <span className="text-xs text-[var(--text-muted)] mt-1">{item.price}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* 价格汇总 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-[4px] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">扩容费用：</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-600 tabular-nums">¥{calculateExpandPrice()}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                扩容 {expandCapacity}，立即生效，不延长有效期
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelExpand}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleConfirmExpand}>
              确认扩容
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recycle Bin Sheet（右侧非模态侧边栏） */}
      <Sheet open={recyclebinOpen} onOpenChange={setRecyclebinOpen} modal={false}>
        <SheetContent
          side="right"
          showOverlay={false}
          className="w-full sm:max-w-[640px] p-0 gap-0 flex flex-col"
          onInteractOutside={(e) => {
            // 点击在二次确认 Dialog/AlertDialog 等其他 Radix Portal 内时，阻止关闭侧边栏；
            // 真正点击页面正文（非任何 portal）时允许默认关闭行为。
            const target = e.target as HTMLElement | null;
            if (target?.closest("[data-slot='dialog-content'], [data-slot='alert-dialog-content'], [data-radix-popper-content-wrapper]")) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader className="px-6 pt-6 pb-4 gap-1.5">
            <SheetTitle className="text-base font-semibold text-[var(--text-title)]">回收站</SheetTitle>
            <SheetDescription className="text-sm text-[var(--text-muted)]">
              {getRecyclebinInstances().length > 0 ? (
                <>共 <span className="text-[var(--text-emphasis)] font-medium tabular-nums">{getRecyclebinInstances().length}</span> 个网盘空间待处理 · 关闭后保留 15 天，逾期自动永久删除</>
              ) : (
                <>关闭后的网盘空间将在此保留 15 天，逾期自动永久删除</>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2" style={{ scrollbarGutter: "stable" }}>
            {getRecyclebinInstances().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-white border border-[#EAEEF4] flex items-center justify-center mb-4">
                  <Trash2 className="w-7 h-7 text-[var(--text-weak)]" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-[var(--text-title)]">回收站为空</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">没有待恢复的网盘空间</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getRecyclebinInstances().map((instance) => {
                  const days = instance.remainingDays;
                  // 紧迫度色阶：≤3天 红色 / ≤7天 橙色 / >7天 中性灰
                  const urgency =
                    days <= 3
                      ? { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", iconColor: "text-[#DC2626]" }
                      : days <= 7
                      ? { bg: "bg-[#FFF7ED]", text: "text-[#C2410C]", iconColor: "text-[#EA580C]" }
                      : { bg: "bg-[#F5F5F5]", text: "text-[#525252]", iconColor: "text-[var(--text-muted)]" };

                  return (
                    <div
                      key={instance.id}
                      className="bg-white border border-[#EAEEF4] rounded-[4px] px-4 py-3.5 hover:border-[#1447E6]/30 transition-colors"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* 头像 */}
                          <div className="w-10 h-10 rounded-[4px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {instance.avatar}
                          </div>
                          {/* 主信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-[var(--text-title)] truncate">
                                {instance.instanceName}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[11px] font-medium tabular-nums shrink-0 ${urgency.bg} ${urgency.text}`}
                              >
                                <Clock className={`w-3 h-3 ${urgency.iconColor}`} strokeWidth={2} />
                                {days === 0 ? "今日永久删除" : `${days} 天后永久删除`}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-[var(--text-muted)]">
                              <span className="truncate">{instance.creator}</span>
                              <span className="mx-2 text-[#D4D4D4]">·</span>
                              <span className="tabular-nums whitespace-nowrap">{instance.used} / {instance.quota}</span>
                              <span className="mx-2 text-[#D4D4D4]">·</span>
                              <span className="font-mono text-[11px] truncate">{instance.instanceId}</span>
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮区 */}
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 gap-1.5 text-[#525252] hover:text-[#1447E6]"
                            onClick={() => handleRestoreFromRecyclebin(instance.id, instance.instanceName)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            恢复
                          </Button>
                          <div className="w-px h-4 bg-[#E5E5E5]" />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 gap-1.5 text-[#525252] hover:text-[var(--text-title)]"
                            onClick={() => handleOpenTransfer(instance.id, instance.instanceName, instance.instanceId)}
                          >
                            <Link className="w-3.5 h-3.5" />
                            转接
                          </Button>
                          <div className="w-px h-4 bg-[#E5E5E5]" />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 gap-1.5 text-[var(--text-muted)] hover:text-[#DC2626]"
                            onClick={() => {
                              setInstanceToDeletePermanently({ id: instance.id, name: instance.instanceName });
                              setRecyclebinDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            永久删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <SheetFooter className="h-4 p-0 mt-0" />
        </SheetContent>
      </Sheet>

      {/* Recyclebin Recover Confirmation Dialog */}
      <Dialog open={recyclebinRecoverDialogOpen} onOpenChange={setRecyclebinRecoverDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>恢复网盘空间</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <Alert variant="info">
                <AlertInfoIcon />
                <AlertDescription>
                  <ul className="space-y-0.5">
                    <li>• 恢复后将继续使用之前的网盘空间</li>
                    <li>• 原有文件和数据将保持不变</li>
                    <li>• 恢复操作完全免费</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-[var(--text-title)]">
                确定要恢复 <span className="font-medium text-[var(--text-title)]">"{instanceToRecoverFromRecyclebin?.name}"</span> 的网盘服务吗？
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRecyclebinRecover}>取消</Button>
            <Button variant="dialog-confirm" onClick={handleConfirmRecyclebinRecover}>
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recyclebin Permanent Delete Confirmation - 警示弹窗 */}
      <AlertDialog open={recyclebinDeleteDialogOpen} onOpenChange={setRecyclebinDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={handleCancelPermanentDelete}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-title)] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--text-title)]">永久删除网盘空间</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <Alert variant="warning">
                  <CircleAlert />
                  <AlertTitle>注意事项</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-0.5">
                      <li>• 网盘中所有文件和数据将被永久删除</li>
                      <li>• 删除后无法恢复任何内容</li>
                      <li>• 请谨慎操作</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-[var(--text-title)]">
                  确定要永久删除 <span className="font-medium text-[var(--text-title)]">"{instanceToDeletePermanently?.name}"</span> 的网盘空间吗？
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPermanentDelete}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPermanentDelete}>永久删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Dialog - 转接网盘 */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent
          className="sm:max-w-[720px] flex flex-col"
          style={{ maxHeight: "min(90vh, 780px)" }}
        >
          <DialogHeader>
            <DialogTitle>转接网盘空间</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="space-y-4">
              {/* Alert 提示置顶 */}
              <Alert variant="info">
                <AlertInfoIcon />
                <AlertDescription>
                  <ul className="space-y-0.5">
                    <li>• 转接后，网盘空间将绑定到新实例</li>
                    <li>• 原实例将无法再访问此网盘</li>
                    <li>• 网盘中的文件和数据将完整保留</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* 待转接的网盘信息卡片：白底黑字 */}
              <div className="bg-white border border-[#EAEEF4] rounded-[4px] p-4">
                <p className="text-sm text-[var(--text-title)] leading-relaxed">
                  将 <span className="font-medium text-[var(--text-title)]">"{instanceToTransfer?.name}"</span> 的网盘空间转接给其他实例
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  实例ID：<span className="font-mono text-[var(--text-title)]">{instanceToTransfer?.instanceId}</span>
                </p>
              </div>

              {/* 选择目标实例 */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--text-title)]">选择目标实例</div>
                {getAvailableTargetInstances().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[var(--text-weak)]">
                    <Bot className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">暂无可转接的目标实例</p>
                    <p className="text-xs mt-1">只能转接给未启用过网盘的实例</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarGutter: "stable" }}>
                    {getAvailableTargetInstances().map((item) => {
                      const isSelected = selectedTargetInstance === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTargetInstance(item.id)}
                          className={`w-full text-left flex items-center gap-3 rounded-[4px] border bg-white p-4 transition-colors ${
                            isSelected
                              ? "border-[#355EF1] bg-[#F5F8FF]"
                              : "border-[#EAEEF4] hover:border-[#355EF1]"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-[4px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {item.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium truncate ${isSelected ? "text-[#355EF1]" : "text-[var(--text-title)]"}`}>
                                {item.instanceName}
                              </h4>
                              <StatusTag mode="fill" variant="gray">未启用</StatusTag>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                              <span>创建人: {item.creator}</span>
                              <span className="font-mono">{item.instanceId}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#355EF1] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelTransfer}>取消</Button>
            <Button
              variant="dialog-confirm"
              onClick={handleConfirmTransfer}
              disabled={!selectedTargetInstance}
            >
              确认转接
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
