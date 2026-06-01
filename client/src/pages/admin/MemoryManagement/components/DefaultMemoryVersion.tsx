import React, { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Pencil, X, Check, Trash2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MOCK_GROUPS as MOCK_ONEID_GROUPS, MOCK_MANUAL_GROUPS } from '../../MemberManagement/mock';
import { buildGroupTree, findGroupNode, type GroupTreeNode } from '../../MemberManagement/health';
import type { UserGroup } from '../../MemberManagement/types';

// 默认记忆版本类型
export type DefaultMemoryVersionType = 'none' | 'free' | 'pro';

// 策略规则类型 —— 与网盘管理模块的 PolicyRule<T> 保持一致
export interface MemoryVersionRule {
  id: string;
  groupIds: string[];
  value: DefaultMemoryVersionType;
}

interface DefaultMemoryVersionProps {
  /** 策略规则列表：第 1 条 groupIds 为空数组的为「预设策略」（fallback），其余为分组例外 */
  rules: MemoryVersionRule[];
  /** 规则变化回调；返回 false 可阻止保存 */
  onRulesChange: (rules: MemoryVersionRule[]) => boolean | void;
  /** Pro 服务是否已开通 */
  isProActive: boolean;
  /** Pro 配额是否充足 */
  isProQuotaAvailable: boolean;
}

// ─── 行容器样式常量（与 FileManagement 保持一致） ───────────────────────────
const ROW_CLASS = 'flex items-center gap-3 px-3 h-10';
const EDIT_ROW_CLASS = 'flex items-start gap-3 px-3 min-h-10 py-1.5';

// ─── 版本视觉映射 ───────────────────────────────────────────────────────────
const VERSION_META: Record<DefaultMemoryVersionType, {
  label: string;
  textClass: string;
  description: string;
}> = {
  none: {
    label: '关闭',
    textClass: 'text-gray-500',
    description: '新建 Agent 不自动开启记忆',
  },
  free: {
    label: 'Free 版',
    textClass: 'text-blue-600',
    description: '新建 Agent 自动开启 Free 版',
  },
  pro: {
    label: 'Pro 版',
    textClass: 'text-purple-600',
    description: '新建 Agent 自动开启 Pro 版',
  },
};

// ─── 分组选择器（与 FileManagement.FMGroupTagSelector 完全对齐） ─────────────
function GroupTagSelector({
  selectedIds,
  disabledIds = [],
  onChange,
}: {
  selectedIds: string[];
  disabledIds?: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allGroups: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];
  const tree: GroupTreeNode[] = buildGroupTree(allGroups);

  // 已选 chip 上展示完整父级路径（如「研发组 / 研发-后端」），便于区分同名子节点
  const getGroupPath = (id: string) => findGroupNode(tree, id)?.path ?? id;

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
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => !disabled && toggle(node.id)}
        >
          {node.children.length > 0 ? (
            <button className="p-0.5 text-gray-400 shrink-0" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-4 shrink-0" />}
          <Checkbox checked={checked} disabled={disabled} className="w-3.5 h-3.5 shrink-0" onChange={() => {}} />
          <span className="text-xs text-gray-700 truncate">{node.name}</span>
        </div>
        {expanded && node.children.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  const filtered = filterTree(tree, search.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="min-h-7 flex flex-wrap gap-1 items-center px-2 py-1 border border-gray-200 rounded-md cursor-pointer hover:border-blue-400 transition-colors bg-white">
          {selectedIds.length === 0
            ? <span className="text-xs text-gray-400">选择分组…</span>
            : selectedIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px]">
                {getGroupPath(id)}
                <button onClick={(e) => { e.stopPropagation(); toggle(id); }} className="hover:text-blue-900"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-2">
        <Input placeholder="搜索分组…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-xs mb-2" />
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-xs text-gray-400 text-center py-4">无匹配分组</p>
            : filtered.map((n) => <TreeNode key={n.id} node={n} />)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── 分组名称展示（与 FileManagement.FMGroupBadges 完全对齐） ───────────────
function GroupBadges({ groupIds }: { groupIds: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moreRef = useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = useState(groupIds.length);

  const allGroups: UserGroup[] = [...MOCK_ONEID_GROUPS, ...MOCK_MANUAL_GROUPS];
  const tree = buildGroupTree(allGroups);
  // 展示完整父级路径（如「研发组 / 研发-后端」），避免同名子节点歧义
  const paths = groupIds.map((id) => findGroupNode(tree, id)?.path ?? id);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const computeVisible = () => {
      const available = container.offsetWidth;
      const gap = 4;
      let w = 0; let fitCount = 0;
      for (let i = 0; i < paths.length; i++) {
        const el = tagRefs.current[i];
        if (!el) continue;
        const add = el.offsetWidth + (i === 0 ? 0 : gap);
        if (w + add > available) break;
        w += add; fitCount++;
      }
      if (fitCount === paths.length) { setVisibleCount(paths.length); return; }
      const moreEl = moreRef.current;
      if (!moreEl) { setVisibleCount(Math.max(1, fitCount)); return; }
      for (let n = fitCount; n >= 1; n--) {
        let tw = 0;
        for (let i = 0; i < n; i++) { const el = tagRefs.current[i]; if (!el) continue; tw += el.offsetWidth + (i === 0 ? 0 : gap); }
        moreEl.textContent = `…共 ${paths.length} 个分组`;
        if (tw + gap + moreEl.offsetWidth <= available) { setVisibleCount(n); return; }
      }
      setVisibleCount(1);
    };
    computeVisible();
    const observer = new ResizeObserver(computeVisible);
    observer.observe(container);
    return () => observer.disconnect();
  }, [paths, groupIds.length]);

  if (groupIds.length === 0) return <span className="text-xs text-gray-500 font-medium">预设策略</span>;
  const omitted = paths.length - visibleCount;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={containerRef} className="flex items-center gap-1 w-full overflow-hidden cursor-default">
          {paths.slice(0, visibleCount).map((p, i) => (
            <span key={i} ref={(el) => { tagRefs.current[i] = el; }} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] whitespace-nowrap shrink-0">{p}</span>
          ))}
          {omitted > 0 && <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] text-gray-500 whitespace-nowrap shrink-0">…共 {paths.length} 个分组</span>}
          <div aria-hidden="true" className="absolute invisible pointer-events-none whitespace-nowrap" style={{ left: -99999, top: -99999 }}>
            {paths.map((p, i) => <span key={`m-${i}`} ref={(el) => { tagRefs.current[i] = el; }} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] whitespace-nowrap">{p}</span>)}
            <span ref={moreRef} className="inline-flex items-center px-1.5 py-0.5 text-[11px] text-gray-500 whitespace-nowrap" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{paths.join('、')}</p></TooltipContent>
    </Tooltip>
  );
}

// ─── 版本选择编辑器（用于 fallback 与 group rule 的 value 切换） ──────────
// excludeValues：当为分组规则编辑时传入需要隐藏的候选项集合，包含两类：
//   ① 预设策略的当前值（与预设相同不构成例外）
//   ② 已被其他分组规则占用的值（同值分组应合并到一条规则，避免重复创建）
function VersionValueEditor({
  value,
  onChange,
  isProActive,
  isProQuotaAvailable,
  excludeValues = [],
}: {
  value: DefaultMemoryVersionType;
  onChange: (v: DefaultMemoryVersionType) => void;
  isProActive: boolean;
  isProQuotaAvailable: boolean;
  excludeValues?: DefaultMemoryVersionType[];
}) {
  const proDisabled = !isProActive || !isProQuotaAvailable;
  const proDisabledReason = !isProActive
    ? '请先开通 Memory Pro 服务'
    : !isProQuotaAvailable
      ? 'Pro 记忆空间已用完'
      : undefined;

  const allItems: Array<{ key: DefaultMemoryVersionType; activeClass: string; idleClass: string; disabled?: boolean; reason?: string }> = [
    { key: 'none' as DefaultMemoryVersionType, activeClass: 'border-gray-400 bg-gray-100 text-gray-700 font-medium', idleClass: 'border-gray-200 text-gray-500' },
    { key: 'free' as DefaultMemoryVersionType, activeClass: 'border-blue-400 bg-blue-50 text-blue-700 font-medium', idleClass: 'border-gray-200 text-gray-500' },
    { key: 'pro' as DefaultMemoryVersionType,  activeClass: 'border-purple-400 bg-purple-50 text-purple-700 font-medium', idleClass: 'border-gray-200 text-gray-500', disabled: proDisabled, reason: proDisabledReason },
  ];
  const items = allItems.filter((it) => !excludeValues.includes(it.key));

  return (
    <div className="flex items-center gap-1">
      {items.map((it) => {
        const selected = value === it.key;
        const btn = (
          <button
            key={it.key}
            disabled={it.disabled && !selected}
            onClick={() => { if (!(it.disabled && !selected)) onChange(it.key); }}
            className={`text-xs h-7 px-2 rounded-md border transition-colors ${selected ? it.activeClass : it.disabled ? 'border-gray-100 text-gray-300 cursor-not-allowed' : it.idleClass + ' hover:border-gray-300'}`}
          >
            {VERSION_META[it.key].label}
          </button>
        );
        if (it.disabled && it.reason && !selected) {
          return (
            <Tooltip key={it.key}>
              <TooltipTrigger asChild>{btn}</TooltipTrigger>
              <TooltipContent side="top"><p className="text-xs">{it.reason}</p></TooltipContent>
            </Tooltip>
          );
        }
        return btn;
      })}
    </div>
  );
}

// ─── 版本只读展示 ───────────────────────────────────────────────────────────
function VersionDisplay({ value }: { value: DefaultMemoryVersionType }) {
  const meta = VERSION_META[value];
  return (
    <span className={`inline-flex items-center text-xs font-medium ${meta.textClass}`}>
      {meta.label}
    </span>
  );
}

/**
 * 新实例默认记忆版本 - 支持「预设策略 + 分组例外」
 *
 * 设计参考管控端·网盘管理模块「新增实例是否自动绑定网盘」的策略卡片：
 * - 预设策略（fallback）：唯一一条 groupIds 为空的规则，作为兜底
 * - 分组例外：允许针对指定分组配置不同的默认值，分组之间互斥
 * - 切换预设策略时若已存在分组例外，需二次确认；确认后分组例外将全部清空（语义：例外是相对预设的偏移，预设变更则偏移失效）
 */
export const DefaultMemoryVersion: React.FC<DefaultMemoryVersionProps> = ({
  rules,
  onRulesChange,
  isProActive,
  isProQuotaAvailable,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [draftValue, setDraftValue] = useState<DefaultMemoryVersionType>('none');
  const [addingNew, setAddingNew] = useState(false);
  // 切换预设策略的二次确认草稿值；非 null 时弹窗打开
  const [confirmFallbackDraft, setConfirmFallbackDraft] = useState<DefaultMemoryVersionType | null>(null);

  const fallbackRule = rules.find((r) => r.groupIds.length === 0)!;
  const groupRules = rules.filter((r) => r.groupIds.length > 0);

  const getDisabledIds = (excludeRuleId?: string) =>
    groupRules.filter((r) => r.id !== excludeRuleId).flatMap((r) => r.groupIds);

  const startEdit = (rule: MemoryVersionRule) => {
    setEditingId(rule.id);
    setDraftGroupIds([...rule.groupIds]);
    setDraftValue(rule.value);
    setAddingNew(false);
  };
  const startAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setDraftGroupIds([]);
    // 默认草稿值：排除预设值与已被其他分组规则占用的值，确保「例外」语义且不重复
    const usedValues = new Set<DefaultMemoryVersionType>([fallbackRule.value, ...groupRules.map((r) => r.value)]);
    const candidates: DefaultMemoryVersionType[] = ['free', 'pro', 'none'];
    const defaultDraft = candidates.find((v) => {
      if (usedValues.has(v)) return false;
      if (v === 'pro' && (!isProActive || !isProQuotaAvailable)) return false;
      return true;
    }) ?? 'none';
    setDraftValue(defaultDraft);
  };
  const cancelEdit = () => { setEditingId(null); setAddingNew(false); };

  const saveEdit = (ruleId?: string) => {
    if (addingNew) {
      if (draftGroupIds.length === 0) { toast.error('请选择至少一个分组'); return; }
      if (draftValue === fallbackRule.value) { toast.error('分组策略需与预设策略不同'); return; }
      if (groupRules.some((r) => r.value === draftValue)) { toast.error('该版本已存在分组策略，请直接编辑现有规则'); return; }
      const result = onRulesChange([
        ...groupRules,
        { id: `mem-rule-${Date.now()}`, groupIds: draftGroupIds, value: draftValue },
        fallbackRule,
      ]);
      if (result === false) return;
      toast.success('策略已保存'); cancelEdit(); return;
    }
    if (!ruleId) return;

    if (ruleId === fallbackRule.id) {
      // 切换预设策略：若已存在分组例外且预设值实际变更，先弹窗二次确认
      if (draftValue !== fallbackRule.value && groupRules.length > 0) {
        setConfirmFallbackDraft(draftValue);
        return;
      }
      const result = onRulesChange(rules.map((r) => (r.id === ruleId ? { ...r, value: draftValue } : r)));
      if (result === false) return;
      toast.success('策略已保存'); cancelEdit(); return;
    }

    // 编辑分组规则
    if (draftGroupIds.length === 0) { toast.error('请选择至少一个分组'); return; }
    if (draftValue === fallbackRule.value) { toast.error('分组策略需与预设策略不同'); return; }
    if (groupRules.some((r) => r.id !== ruleId && r.value === draftValue)) { toast.error('该版本已存在分组策略，请直接编辑现有规则'); return; }
    const result = onRulesChange(rules.map((r) => (r.id === ruleId ? { ...r, groupIds: draftGroupIds, value: draftValue } : r)));
    if (result === false) return;
    toast.success('策略已保存'); cancelEdit();
  };

  const handleConfirmFallbackSwitch = () => {
    if (confirmFallbackDraft === null) return;
    // 确认切换：清空所有分组例外，仅保留更新后的预设策略
    const result = onRulesChange([{ ...fallbackRule, value: confirmFallbackDraft }]);
    if (result !== false) { toast.success('已更新预设策略，分组策略已清空'); cancelEdit(); }
    setConfirmFallbackDraft(null);
  };

  const deleteRule = (ruleId: string) => {
    const result = onRulesChange(rules.filter((r) => r.id !== ruleId));
    if (result === false) return;
    toast.success('策略已删除');
  };

  return (
    <TooltipProvider>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-1.5">
            <img src="/assets/admin-memory-management/version-compare/pro-icon.svg" alt="" className="w-8 h-8 rounded-lg p-1.5 bg-[#355EF1] shrink-0" />
            <h3 className="text-[14px] font-semibold text-[#020617] flex-1">新建 Agent 默认记忆版本</h3>
          </div>
          <p className="text-[12px] text-[#737373] leading-relaxed">
            可设置全局「预设策略」，并对指定分组配置不同的默认版本（例如：全局关闭，但对研发分组默认开启 Free 版）。
          </p>
        </div>

        <div className="px-5 pb-4">
          {(groupRules.length > 0 || addingNew) && (
            <div className={`${ROW_CLASS} border-b border-gray-100`}>
              <span className="flex-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">分组</span>
              <span className="w-44 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wide">默认版本</span>
              <span className="w-14 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wide">操作</span>
            </div>
          )}

          {groupRules.map((rule) => (
            <div key={rule.id}>
              {editingId === rule.id ? (
                <div className={EDIT_ROW_CLASS}>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <GroupTagSelector selectedIds={draftGroupIds} disabledIds={getDisabledIds(rule.id)} onChange={setDraftGroupIds} />
                  </div>
                  <div className="w-44 flex items-center justify-end gap-1 h-7 pt-0.5">
                    <VersionValueEditor value={draftValue} onChange={setDraftValue} isProActive={isProActive} isProQuotaAvailable={isProQuotaAvailable} excludeValues={[fallbackRule.value, ...groupRules.filter((r) => r.id !== rule.id).map((r) => r.value)]} />
                  </div>
                  <div className="w-14 flex items-center justify-end gap-1 h-7 pt-0.5">
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X className="w-3 h-3" /></button>
                    <button onClick={() => saveEdit(rule.id)} className="text-blue-500 hover:text-blue-700 transition-colors p-1"><Check className="w-3 h-3" /></button>
                  </div>
                </div>
              ) : (
                <div className={`${ROW_CLASS} border-b border-gray-50 hover:bg-gray-50/50 transition-colors`}>
                  <div className="flex-1 min-w-0"><GroupBadges groupIds={rule.groupIds} /></div>
                  <div className="w-44 text-right">
                    <VersionDisplay value={rule.value} />
                  </div>
                  <div className="w-14 flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(rule)} className="text-gray-400 hover:text-blue-500 transition-colors p-1"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => deleteRule(rule.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingNew ? (
            <div className={EDIT_ROW_CLASS}>
              <div className="flex-1 min-w-0 pt-0.5">
                <GroupTagSelector selectedIds={draftGroupIds} disabledIds={getDisabledIds()} onChange={setDraftGroupIds} />
              </div>
              <div className="w-44 flex items-center justify-end gap-1 h-7 pt-0.5">
                <VersionValueEditor value={draftValue} onChange={setDraftValue} isProActive={isProActive} isProQuotaAvailable={isProQuotaAvailable} excludeValues={[fallbackRule.value, ...groupRules.map((r) => r.value)]} />
              </div>
              <div className="w-14 flex items-center justify-end gap-1 h-7 pt-0.5">
                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X className="w-3 h-3" /></button>
                <button onClick={() => saveEdit()} className="text-blue-500 hover:text-blue-700 transition-colors p-1"><Check className="w-3 h-3" /></button>
              </div>
            </div>
          ) : (() => {
            // 版本值上限随 Pro 可用性变化：Pro 可用 → 3 种（关闭/Free/Pro），不可用 → 2 种（关闭/Free）
            // 扣除 1 条预设后，分组规则上限 = 当前可用版本数 - 1；达到上限直接隐藏入口
            const maxGroupRules = isProActive && isProQuotaAvailable ? 2 : 1;
            if (groupRules.length >= maxGroupRules) return null;
            return (
              <button onClick={startAdd} className="flex items-center gap-1.5 px-3 h-10 text-xs text-[#355EF1] hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />添加分组策略
              </button>
            );
          })()}

          <div className="border-t border-dashed border-gray-200 mt-2 pt-2">
            {editingId === fallbackRule.id ? (
              <div className="flex items-center gap-3 rounded-[4px] bg-[#fafafa] px-4 min-h-[44px]">
                <div className="flex-1 min-w-0"><span className="text-xs text-[#737373] font-medium">预设策略</span></div>
                <div className="w-44 flex items-center justify-end gap-1">
                  <VersionValueEditor value={draftValue} onChange={setDraftValue} isProActive={isProActive} isProQuotaAvailable={isProQuotaAvailable} />
                </div>
                <div className="w-14 flex items-center justify-end gap-1">
                  <button onClick={cancelEdit} className="text-[#A3A3A3] hover:text-[#737373] transition-colors p-1"><X className="w-3 h-3" /></button>
                  <button onClick={() => saveEdit(fallbackRule.id)} className="text-[#355EF1] hover:text-blue-700 transition-colors p-1"><Check className="w-3 h-3" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[4px] bg-[#fafafa] px-4 min-h-[44px]">
                <div className="flex-1 min-w-0"><span className="text-xs text-[#737373] font-medium">预设策略</span></div>
                <div className="w-44 text-right">
                  <VersionDisplay value={fallbackRule.value} />
                </div>
                <div className="w-14 flex items-center justify-end">
                  <button onClick={() => startEdit(fallbackRule)} className="text-[#A3A3A3] hover:text-[#355EF1] transition-colors p-1"><Pencil className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={confirmFallbackDraft !== null} onOpenChange={(o) => { if (!o) setConfirmFallbackDraft(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>切换后将清空分组策略</AlertDialogTitle>
            <AlertDialogDescription>
              分组策略是基于「预设策略」的例外设置。切换「预设策略」后，现有分组策略将全部清空，需重新添加。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFallbackSwitch}>确认切换</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
