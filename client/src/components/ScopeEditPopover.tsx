/**
 * ScopeEditPopover - 通用应用范围编辑下拉面板
 *
 * 规范：
 *   - SegmentGroup 切换「全部用户 / 按分组」（白底黑字选中态）
 *   - Checkbox 组件选择分组（树结构）
 *   - 确认按钮使用 dialog-confirm（纯黑底白字）
 *   - 取消按钮使用 outline
 *   - 已选计数在 footer 左端
 */
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusTag } from "@/components/ui/status-tag";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, X, ChevronRight, ChevronDown } from "lucide-react";

// ─── 类型定义 ────────────────────────────────────────────────
export interface ScopeGroup {
  id: string;
  name: string;
  parentId?: string | null;
}

export type ScopeType = "all" | "groups";

export interface ScopeEditPopoverProps {
  /** 当前应用范围 */
  scope: ScopeType;
  /** 当前选中的分组 id 列表 */
  selectedGroupIds: string[];
  /** 所有可选分组 */
  groups: ScopeGroup[];
  /** 保存回调 */
  onConfirm: (scope: ScopeType, groupIds: string[]) => void;
  /** 触发器自定义渲染（默认为铅笔图标按钮） */
  trigger?: React.ReactNode;
  /** Popover 对齐方式 */
  align?: "start" | "center" | "end";
  /** 是否显示范围徽章 */
  showBadges?: boolean;
  /** 已选范围的展示标签（默认使用 group name） */
  scopeLabels?: string[];
}

// ─── 树结构工具 ────────────────────────────────────────────
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

function buildTree(groups: ScopeGroup[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  groups.forEach((g) => map.set(g.id, { id: g.id, name: g.name, children: [] }));
  const roots: TreeNode[] = [];
  groups.forEach((g) => {
    const node = map.get(g.id)!;
    if (g.parentId && map.has(g.parentId)) {
      map.get(g.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function ScopeEditPopover({
  scope,
  selectedGroupIds,
  groups,
  onConfirm,
  trigger,
  align = "start",
  showBadges = true,
  scopeLabels,
}: ScopeEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<ScopeType>("all");
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // 树结构
  const tree = useMemo(() => buildTree(groups), [groups]);

  // 打开时同步状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(scope);
      setDraftGroupIds([...selectedGroupIds]);
      setSearchQuery("");
      // 默认展开已选分组的祖先 + 根节点
      const expandSet = new Set<string>();
      const groupMap = new Map(groups.map((g) => [g.id, g]));
      selectedGroupIds.forEach((gid) => {
        let cur = groupMap.get(gid);
        while (cur && cur.parentId) {
          expandSet.add(cur.parentId);
          cur = groupMap.get(cur.parentId);
        }
      });
      tree.forEach((root) => expandSet.add(root.id));
      setExpanded(expandSet);
    }
    setOpen(v);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 搜索过滤
  const matchedIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return new Set(groups.filter((g) => g.name.toLowerCase().includes(q)).map((g) => g.id));
  }, [groups, searchQuery]);

  const isNodeVisible = (node: TreeNode): boolean => {
    if (!matchedIds) return true;
    if (matchedIds.has(node.id)) return true;
    return node.children.some(isNodeVisible);
  };

  // 切换分组选择
  const toggleGroup = (gid: string) => {
    setDraftGroupIds((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
    );
  };

  // 清除选择
  const handleClearSelection = () => {
    setDraftGroupIds([]);
    setSearchQuery("");
  };

  // 确认按钮禁用条件
  const isConfirmDisabled = draftScope === "groups" && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm(draftScope, draftScope === "all" ? [] : draftGroupIds);
    setOpen(false);
  };

  // 渲染树节点
  const renderTreeNode = (node: TreeNode, depth: number): React.ReactNode => {
    if (!isNodeVisible(node)) return null;
    const checked = draftGroupIds.includes(node.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    return (
      <div key={node.id}>
        <div
          className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] transition-colors cursor-pointer ${
            checked ? "bg-[#EBF4FF]" : "hover:bg-[#fafafa]"
          }`}
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => toggleGroup(node.id)}
        >
          {/* 展开/收起箭头 */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-[#A3A3A3] hover:text-[#525252] shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <Checkbox
            checked={checked}
            onCheckedChange={() => toggleGroup(node.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-[13px] text-[#020617] truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && node.children.map((c) => renderTreeNode(c, depth + 1))}
      </div>
    );
  };

  // 渲染范围徽章
  const renderBadges = () => {
    if (!showBadges) return null;

    if (scope === "all") {
      return (
        <StatusTag variant="gray">
          全部用户
        </StatusTag>
      );
    }

    const labels = scopeLabels || selectedGroupIds.map((gid) => {
      const g = groups.find((gr) => gr.id === gid);
      return g?.name || gid;
    });

    if (labels.length === 0) {
      return (
        <StatusTag variant="gray">
          未选分组
        </StatusTag>
      );
    }

    const firstName = labels[0];
    const rest = labels.length - 1;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <StatusTag variant="gray" className="max-w-[120px] truncate">
              {firstName}
            </StatusTag>
            {rest > 0 && (
              <StatusTag variant="gray">
                +{rest}
              </StatusTag>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
          {labels.join("，")}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {trigger || (
            <button
              onClick={(e) => e.stopPropagation()}
              className="self-center text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
              title="编辑应用范围"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-0 flex flex-col"
          align={align}
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 内容区 */}
          <div className="px-4 pt-4 pb-3 space-y-3">
            {/* Segment 切换：全部用户 / 按分组 */}
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

            {/* 按分组内容 */}
            {draftScope === "groups" && (
              <div className="space-y-2.5">
                {/* 输入框：已选标签 + 搜索输入 */}
                <div
                  className="flex flex-wrap items-center gap-1 px-2.5 py-1.5 min-h-[36px] max-h-[80px] overflow-y-auto border border-[#E5E5E5] rounded-[4px] bg-white focus-within:border-[#1447E6] transition-colors cursor-text"
                  onClick={() => inputRef.current?.focus()}
                >
                  {draftGroupIds.map((gid) => {
                    const g = groups.find((gr) => gr.id === gid);
                    if (!g) return null;
                    return (
                      <StatusTag key={gid} variant="gray" className="gap-0.5 pr-1">
                        <span className="truncate max-w-[100px]">{g.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(gid);
                          }}
                          className="text-[#737373] hover:text-[#0A0A0A] shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </StatusTag>
                    );
                  })}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={draftGroupIds.length === 0 ? "搜索分组…" : ""}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-[60px] h-5 text-[13px] bg-transparent outline-none placeholder:text-[#a3a3a3]"
                  />
                  {(draftGroupIds.length > 0 || searchQuery) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelection();
                      }}
                      className="text-[#a3a3a3] hover:text-[#525252] shrink-0 ml-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 分组树形列表 */}
                <div className="max-h-[220px] overflow-y-auto">
                  {tree.length === 0 ? (
                    <p className="text-[12px] text-[#a3a3a3] text-center py-4">
                      暂无分组
                    </p>
                  ) : (
                    (() => {
                      const visibleNodes = tree.filter(isNodeVisible);
                      if (visibleNodes.length === 0) {
                        return (
                          <p className="text-[12px] text-[#a3a3a3] text-center py-4">
                            无匹配分组
                          </p>
                        );
                      }
                      return visibleNodes.map((node) => renderTreeNode(node, 0));
                    })()
                  )}
                </div>
              </div>
            )}

            {draftScope === "all" && null}
          </div>

          {/* 底部：已选计数 + 按钮 */}
          <div className="flex items-center px-4 py-3 border-t border-[#E5E5E5] shrink-0">
            <span className="text-[12px] text-[#737373] flex-1">
              {draftScope === "groups" && draftGroupIds.length > 0
                ? `已选 ${draftGroupIds.length} 个分组`
                : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[13px] px-4"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                size="sm"
                variant="dialog-confirm"
                className="h-8 text-[13px] px-4"
                disabled={isConfirmDisabled}
                onClick={handleConfirm}
              >
                确认
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
