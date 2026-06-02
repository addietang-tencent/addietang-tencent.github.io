/**
 * 共享列头筛选组件
 * - DepartmentColumnFilter：表头部门筛选 popover 内容
 * - GroupColumnFilter：表头分组筛选 popover 内容（按 source 分桶）
 *
 * 抽自 OpenClawMonitor.tsx，便于在 MemberManagement / 其它管控页复用。
 * 行为/样式与原实现保持一致（搜索 + 树形 + 取消/确认）。
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { type DepartmentNode } from "@/lib/mockData";
import type { UserGroup, GroupSource } from "@/pages/admin/MemberManagement/types";
import { buildGroupTree, type GroupTreeNode } from "@/pages/admin/MemberManagement/health";

// 按 source 分桶标题（与 OpenClawMonitor 中保持一致）
const GROUP_SOURCE_LABELS: Record<GroupSource, string> = {
  "oneid-dept": "部门",
  "oneid-group": "自定义分组",
  manual: "自定义分组",
};

// ─── 列头筛选下拉里复用的行样式（避免重复硬编码） ────────────────────────
// 「树节点行」：gap-1，含展开 chevron 占位；选中态文字 #1447E6 + 浅灰底
const treeRowBaseClass =
  "flex items-center gap-1 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors";
const treeRowSelectedClass = "bg-[#F5F5F5] text-[#1447E6]";
const treeRowIdleClass = "text-[#334155] hover:bg-[#F5F5F5]";
const treeRowClass = (selected: boolean) =>
  `${treeRowBaseClass} ${selected ? treeRowSelectedClass : treeRowIdleClass}`;

// 「根选项行」：gap-2，"全部 X" 一类；文字色由内部 span 控制
const rootRowBaseClass =
  "flex items-center gap-2 py-1.5 px-2 rounded-[4px] cursor-pointer transition-colors";
const rootRowSelectedClass = "bg-[#F5F5F5]";
const rootRowIdleClass = "hover:bg-[#F5F5F5]";
const rootRowClass = (selected: boolean) =>
  `${rootRowBaseClass} ${selected ? rootRowSelectedClass : rootRowIdleClass}`;

// ─── 部门列头筛选面板 ─────────────────────────────────────────────────────
export function DepartmentColumnFilter({
  departments,
  value,
  onConfirm,
  onCancel,
}: {
  departments: DepartmentNode[];
  value: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
}) {
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isNodeVisible = (node: DepartmentNode): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (node.name.toLowerCase().includes(q)) return true;
    return (node.children || []).some(isNodeVisible);
  };

  const renderNode = (node: DepartmentNode, level: number) => {
    if (!isNodeVisible(node)) return null;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = tempValue === node.id;
    return (
      <div key={node.id}>
        <div
          className={treeRowClass(isSelected)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setTempValue(node.id)}
        >
          {hasChildren ? (
            <button
              className="w-4 h-4 flex items-center justify-center flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4D4D4]" />
            </span>
          )}
          <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#1447E6] font-medium" : ""}`}>{node.name}</span>
          {isSelected && <Check className="w-4 h-4 ml-auto text-[#1447E6] flex-shrink-0" />}
        </div>
        {hasChildren && isExpanded && node.children!.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <>
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3] pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索部门"
            className="h-8 pl-8"
          />
        </div>
      </div>
      <div className="max-h-[280px] overflow-y-auto px-2 pb-2">
        <div
          className={rootRowClass(tempValue === "")}
          onClick={() => setTempValue("")}
        >
          <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#1447E6] font-medium" : "text-[#334155]"}`}>全部部门</span>
          {tempValue === "" && <Check className="w-4 h-4 text-[#1447E6] flex-shrink-0" />}
        </div>
        {departments.map((d) => renderNode(d, 0))}
      </div>
      <div className="border-t border-[#E5E5E5] p-2 flex gap-2">
        <Button variant="claw-outline" size="claw-sm" className="flex-1" onClick={onCancel}>
          取消
        </Button>
        <Button variant="dialog-confirm" size="claw-sm" className="flex-1" onClick={() => onConfirm(tempValue)}>
          确认
        </Button>
      </div>
    </>
  );
}

// ─── 分组列头筛选树节点（递归） ──────────────────────────────────────────
function GroupTreeNodeItem({
  node,
  level,
  selected,
  expanded,
  onToggle,
  onSelect,
}: {
  node: GroupTreeNode;
  level: number;
  selected: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  return (
    <div>
      <div
        className={treeRowClass(isSelected)}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4D4D4]" />
          </span>
        )}
        <span className={`text-sm truncate flex-1 ${isSelected ? "text-[#1447E6] font-medium" : ""}`}>{node.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-auto text-[#1447E6] flex-shrink-0" />}
      </div>
      {hasChildren && isExpanded &&
        node.children.map((child) => (
          <GroupTreeNodeItem
            key={child.id}
            node={child}
            level={level + 1}
            selected={selected}
            expanded={expanded}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

// ─── 分组列头筛选面板 ─────────────────────────────────────────────────────
export function GroupColumnFilter({
  groups,
  value,
  hasOneid,
  onConfirm,
  onCancel,
}: {
  groups: UserGroup[];
  value: string;
  hasOneid: boolean;
  onConfirm: (v: string) => void;
  onCancel: () => void;
}) {
  const [tempValue, setTempValue] = useState(value);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { activeSources, treesMap } = useMemo(() => {
    if (hasOneid) {
      const buckets: Record<string, UserGroup[]> = { "oneid-dept": [], "oneid-group": [] };
      groups.forEach((g) => {
        if (buckets[g.source]) buckets[g.source].push(g);
      });
      const order: GroupSource[] = ["oneid-dept", "oneid-group"];
      const active = order.filter((s) => (buckets[s] || []).length > 0);
      const tMap: Record<string, GroupTreeNode[]> = {};
      active.forEach((s) => {
        tMap[s] = buildGroupTree(buckets[s]);
      });
      return { activeSources: active, treesMap: tMap };
    } else {
      const trees = buildGroupTree(groups);
      return { activeSources: ["manual" as GroupSource], treesMap: { manual: trees } };
    }
  }, [groups, hasOneid]);

  const isNodeVisible = (node: GroupTreeNode): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (node.name.toLowerCase().includes(q)) return true;
    return node.children.some(isNodeVisible);
  };

  return (
    <>
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3] pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索分组"
            className="h-8 pl-8"
          />
        </div>
      </div>
      <div className="max-h-[280px] overflow-y-auto px-2 pb-2">
        <div
          className={rootRowClass(tempValue === "")}
          onClick={() => setTempValue("")}
        >
          <span className={`text-sm flex-1 ${tempValue === "" ? "text-[#1447E6] font-medium" : "text-[#334155]"}`}>全部分组</span>
          {tempValue === "" && <Check className="w-4 h-4 text-[#1447E6] flex-shrink-0" />}
        </div>
        {activeSources.map((source) => (
          <div key={source}>
            {hasOneid && (
              <div className="px-2 pt-3 pb-1">
                <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
                  {GROUP_SOURCE_LABELS[source]}
                </span>
              </div>
            )}
            {(treesMap[source] || []).map((root) =>
              isNodeVisible(root) ? (
                <GroupTreeNodeItem
                  key={root.id}
                  node={root}
                  level={0}
                  selected={tempValue}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onSelect={setTempValue}
                />
              ) : null,
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-[#E5E5E5] p-2 flex gap-2">
        <Button variant="claw-outline" size="claw-sm" className="flex-1" onClick={onCancel}>
          取消
        </Button>
        <Button variant="dialog-confirm" size="claw-sm" className="flex-1" onClick={() => onConfirm(tempValue)}>
          确认
        </Button>
      </div>
    </>
  );
}

/** 根据部门 id 在部门树中查找该节点及其所有子孙 id */
export function findDeptAndChildren(nodes: DepartmentNode[], targetId: string): string[] {
  if (!targetId) return [];
  const collect = (n: DepartmentNode): string[] => {
    const ids = [n.id];
    (n.children || []).forEach((c) => ids.push(...collect(c)));
    return ids;
  };
  for (const n of nodes) {
    if (n.id === targetId) return collect(n);
    const found = findDeptAndChildren(n.children || [], targetId);
    if (found.length > 0) return found;
  }
  return [];
}
