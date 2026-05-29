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
import { Input } from "@/components/ui/input";
import { StatusTag } from "@/components/ui/status-tag";
import { Badge } from "@/components/ui/badge";
import { AllUsersTag } from "@/components/ui/all-users-tag";
import { SegmentGroup, SegmentOption } from "@/components/ui/segment";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Search, X, ChevronRight, ChevronDown } from "lucide-react";

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
  /** 最多展示几个分组 tag，超出折叠为 +N（默认 1） */
  maxVisibleBadges?: number;
  /** 「全部用户」对应的用户总数，未传时不展示说明文字 */
  totalUserCount?: number;
  /** 隐藏「全部用户 / 按分组」Segment 切换，强制按分组（业务约束：分组策略「全部用户」由预设策略承担） */
  hideAllOption?: boolean;
  /** 禁用选择的分组 id 集合（已被其它策略占用等场景） */
  disabledIds?: Set<string>;
  /** 禁用项的 Tooltip 提示文案 */
  disabledTooltip?: string;
  /** 未选分组时显示为下拉框 trigger（含此 placeholder 文案）；传值则启用，否则保留默认 tag + 铅笔形态 */
  emptyPlaceholder?: string;
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
  maxVisibleBadges = 1,
  totalUserCount,
  hideAllOption = false,
  disabledIds,
  disabledTooltip,
  emptyPlaceholder,
}: ScopeEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<ScopeType>("all");
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const disabledSet = useMemo(() => disabledIds ?? new Set<string>(), [disabledIds]);

  // 下拉框模式：emptyPlaceholder 启用时，trigger 永远是下拉框形态（无论是否有值）
  // 该模式下勾选/取消立即生效（onConfirm 即时调用），并隐藏 footer 的取消/确认按钮
  const isSelectMode = !!emptyPlaceholder && scope === "groups";

  // 树结构
  const tree = useMemo(() => buildTree(groups), [groups]);

  // 打开时同步状态
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(hideAllOption ? "groups" : scope);
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

  // 切换分组选择（select 模式下立即生效，调用 onConfirm；默认模式下进入 draft，等待"确认"按钮提交）
  const toggleGroup = (gid: string) => {
    if (disabledSet.has(gid)) return;
    setDraftGroupIds((prev) => {
      const next = prev.includes(gid)
        ? prev.filter((id) => id !== gid)
        : [...prev, gid];
      if (isSelectMode) {
        onConfirm("groups", next);
      }
      return next;
    });
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
    const isDisabled = disabledSet.has(node.id);
    const nameSpan = (
      <span className={`text-sm truncate ${isDisabled ? "text-[#a1a1aa]" : "text-[#09090b]"}`}>{node.name}</span>
    );
    return (
      <div key={node.id}>
        <div
          className={`group w-full flex items-center gap-1.5 h-8 px-2.5 rounded-[4px] transition-colors ${
            isDisabled
              ? "opacity-60 cursor-not-allowed"
              : `cursor-pointer ${checked ? "bg-[#f4f4f5] font-medium" : "hover:bg-[#f4f4f5]"}`
          }`}
          style={{ paddingLeft: 8 + depth * 16 }}
          onClick={() => !isDisabled && toggleGroup(node.id)}
        >
          {/* 展开/收起箭头 */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-[#71717a] hover:text-[#09090b] shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <Checkbox
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={() => toggleGroup(node.id)}
            onClick={(e) => e.stopPropagation()}
          />
          {isDisabled && disabledTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>{nameSpan}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="text-xs max-w-[260px] leading-relaxed">
                {disabledTooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            nameSpan
          )}
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
        <AllUsersTag />
      );
    }

    const labels = scopeLabels || selectedGroupIds.map((gid) => {
      const g = groups.find((gr) => gr.id === gid);
      return g?.name || gid;
    });

    if (labels.length === 0) {
      return (
        <Badge variant="outline">
          未选分组
        </Badge>
      );
    }

    const visibleCount = Math.max(1, maxVisibleBadges);
    const visibleLabels = labels.slice(0, visibleCount);
    const rest = labels.length - visibleLabels.length;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default flex-wrap">
            {visibleLabels.map((label, idx) => (
              <Badge
                key={`${label}-${idx}`}
                variant="outline"
                className="max-w-[140px]"
              >
                <span className="block truncate max-w-[124px]">{label}</span>
              </Badge>
            ))}
            {rest > 0 && (
              <Badge variant="outline">
                +{rest}
              </Badge>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
          {labels.join("，")}
        </TooltipContent>
      </Tooltip>
    );
  };

  // 当前已选分组（用于在 trigger 中展示 tag chips）
  const selectedGroupNodes = isSelectMode
    ? selectedGroupIds
        .map((id) => groups.find((g) => g.id === id))
        .filter((g): g is ScopeGroup => !!g)
    : [];

  // 删除单个已选分组（同步 onConfirm，不需要打开 Popover 编辑）
  const removeSelectedGroup = (gid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm("groups", selectedGroupIds.filter((id) => id !== gid));
  };

  return (
    <div className={isSelectMode ? "w-full" : "inline-flex items-center gap-1.5"}>
      {!isSelectMode && renderBadges()}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {isSelectMode ? (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              className="w-full min-h-9 px-3 py-1 flex items-center justify-between gap-2 rounded-[4px] border border-[#E5E5E5] bg-white text-sm hover:border-[#1447E6] focus:border-[#1447E6] focus:outline-none transition-colors cursor-pointer"
            >
              {selectedGroupNodes.length === 0 ? (
                <span className="truncate text-[#A3A3A3]">{emptyPlaceholder}</span>
              ) : (
                <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0 py-1">
                  {selectedGroupNodes.map((g) => (
                    <span
                      key={g.id}
                      className="inline-flex items-center gap-0.5"
                    >
                      <StatusTag variant="gray" className="pr-1 gap-0.5">
                        <span className="inline-flex items-center gap-0.5">
                          <span className="truncate max-w-[120px]">{g.name}</span>
                          <button
                            type="button"
                            onClick={(e) => removeSelectedGroup(g.id, e)}
                            className="inline-flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] shrink-0"
                            aria-label={`移除 ${g.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      </StatusTag>
                    </span>
                  ))}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-[#A3A3A3] shrink-0" />
            </div>
          ) : (
            trigger || (
              <button
                onClick={(e) => e.stopPropagation()}
                className="self-center text-[#A3A3A3] hover:text-[#355EF1] transition-colors"
                title="编辑应用范围"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )
          )}
        </PopoverTrigger>
        <PopoverContent
          className={`${isSelectMode ? "w-[var(--radix-popover-trigger-width)] h-[400px]" : "w-72"} p-0 flex flex-col`}
          align={align}
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 内容区 */}
          <div className={`px-4 pt-4 pb-3 ${isSelectMode ? "flex flex-col flex-1 min-h-0" : "space-y-3"}`}>
            {/* Segment 切换：全部用户 / 按分组 */}
            {!hideAllOption && (
              <SegmentGroup className="w-full shrink-0">
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
            )}

            {/* 按分组内容 */}
            {draftScope === "groups" && (
              <div className={isSelectMode ? "flex flex-col flex-1 min-h-0 gap-2.5" : "space-y-2.5"}>
                {/* 输入框：select 模式下仅作搜索；默认模式下保留「已选标签 + 搜索输入」组合形态 */}
                {isSelectMode ? (
                  <div className="relative shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] pointer-events-none" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="搜索分组"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[#71717a] hover:text-[#09090b]"
                        aria-label="清空搜索"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap items-center gap-1 px-2.5 py-1.5 min-h-[36px] max-h-[80px] overflow-y-auto border border-[#E5E5E5] rounded-[4px] bg-white focus-within:border-[#1447E6] transition-colors cursor-text shrink-0"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {draftGroupIds.map((gid) => {
                      const g = groups.find((gr) => gr.id === gid);
                      if (!g) return null;
                      return (
                        <StatusTag key={gid} variant="gray" className="pr-1 gap-0.5">
                          <span className="inline-flex items-center gap-0.5">
                            <span className="truncate max-w-[100px]">{g.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(gid);
                              }}
                              className="inline-flex items-center justify-center text-[#737373] hover:text-[#0A0A0A] shrink-0"
                              aria-label={`移除 ${g.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
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
                )}

                {/* 分组树形列表：select 模式下占满剩余高度 + 内容溢出滚动；默认模式仍用 max-h
                    onWheel：手动处理滚轮，避免被外层 Dialog/Popover 的 scroll-lock 拦截 */}
                <div
                  className={
                    isSelectMode
                      ? "flex-1 min-h-0 overflow-y-auto pr-1"
                      : "max-h-[224px] overflow-y-auto pr-1"
                  }
                  onWheel={(e) => {
                    const el = e.currentTarget;
                    const canScrollDown = el.scrollHeight - el.clientHeight - el.scrollTop > 0;
                    const canScrollUp = el.scrollTop > 0;
                    if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
                      e.stopPropagation();
                      el.scrollTop += e.deltaY;
                      e.preventDefault();
                    }
                  }}
                >
                  {tree.length === 0 ? (
                    <p className="text-[12px] text-[#a1a1aa] text-center py-4">
                      暂无分组
                    </p>
                  ) : (
                    (() => {
                      const visibleNodes = tree.filter(isNodeVisible);
                      if (visibleNodes.length === 0) {
                        return (
                          <p className="text-[12px] text-[#a1a1aa] text-center py-4">
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

            {draftScope === "all" && typeof totalUserCount === "number" && (
              <p className="text-xs text-[#737373] leading-relaxed">
                用户管理列表中添加的共计 <span className="font-medium text-[#0A0A0A] tabular-nums">{totalUserCount}</span> 名用户
              </p>
            )}
          </div>

          {/* 底部：已选计数 + 按钮（select 模式下勾选即时生效，仅保留已选计数，无操作按钮） */}
          {isSelectMode ? (
            <div className="flex items-center px-4 py-2.5 border-t border-[#E5E5E5] shrink-0 min-h-[40px]">
              {draftGroupIds.length > 0 && (
                <span className="text-[12px] text-[#737373]">
                  已选 {draftGroupIds.length} 个分组
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center px-4 py-3 border-t border-[#E5E5E5] shrink-0">
              <span className="text-[12px] text-[#737373] flex-1">
                {draftScope === "groups" && draftGroupIds.length > 0
                  ? `已选 ${draftGroupIds.length} 个分组`
                  : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="claw-sm"
                  variant="claw-outline"
                  onClick={() => setOpen(false)}
                >
                  取消
                </Button>
                <Button
                  size="claw-sm"
                  variant="dialog-confirm"
                  disabled={isConfirmDisabled}
                  onClick={handleConfirm}
                >
                  确认
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
