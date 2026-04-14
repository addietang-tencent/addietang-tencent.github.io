/**
 * SkillRolesTab - 角色设定管理
 * 功能：拖拽排序、开关可见性、编辑角色、删除角色、新增自定义角色、应用范围
 */
import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  RefreshCw,
  Package,
  Star,
  ChevronDown,
  Edit2,
} from "lucide-react";
import {
  MOCK_ROLES,
} from "@/lib/mockData";
import type { Role, RoleSkill } from "@/lib/mockData";
import { PUBLIC_SKILLS, type PublicSkill } from "./SkillLibrary/publicSkillMockData";
import { MOCK_SKILLS, DEFAULT_CATEGORIES, MOCK_GROUPS } from "./SkillLibrary/mockData";
import type { SkillScope } from "./SkillLibrary/types";

// ── 应用范围展示徽章 ──────────────────────────────────────
function ScopeBadges({ role }: { role: Role }) {
  const isPublic = role.scope === 'public' || !role.groupIds || role.groupIds.length === 0;
  if (isPublic) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
        全部用户
      </span>
    );
  }
  const groupNames = role.groupIds.map(gid => MOCK_GROUPS.find(g => g.id === gid)?.name || gid);
  const firstName = groupNames[0] || '';
  const rest = groupNames.length - 1;
  const tooltipText = groupNames.join('，');

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-default">
          <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full max-w-[100px] truncate">
            {firstName}
          </span>
          {rest > 0 && (
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full whitespace-nowrap">
              +{rest}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

// ── 编辑应用范围 Popover（列表行内编辑）──────────────────────
function EditRoleScopePopover({
  role,
  onConfirm,
}: {
  role: Role;
  onConfirm: (scope: SkillScope, groupIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<SkillScope>('public');
  const [draftGroupIds, setDraftGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDraftScope(role.scope || 'public');
      setDraftGroupIds([...(role.groupIds || [])]);
      setSearchQuery('');
    }
    setOpen(v);
  };

  const filteredGroups = MOCK_GROUPS.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroup = (gid: string) => {
    setDraftGroupIds(prev =>
      prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]
    );
  };

  const isConfirmDisabled = draftScope === 'private' && draftGroupIds.length === 0;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm(draftScope, draftScope === 'public' ? [] : draftGroupIds);
    setOpen(false);
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <ScopeBadges role={role} />
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 text-gray-400 hover:text-gray-900 rounded transition-colors flex-shrink-0"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">编辑应用范围</TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-68 p-0"
          align="start"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3.5 pt-3.5 pb-2.5 space-y-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={() => setDraftScope('public')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftScope === 'public'
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                全部用户
              </button>
              <button
                onClick={() => setDraftScope('private')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  draftScope === 'private'
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                按分组
              </button>
            </div>
            {draftScope === 'private' && (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索分组…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                  {filteredGroups.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-3">无匹配分组</p>
                  ) : (
                    filteredGroups.map((group) => {
                      const checked = draftGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                            checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                          }`}>
                            {checked && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="text-xs text-gray-700 truncate">{group.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] text-gray-400">已选 {draftGroupIds.length} 个分组</p>
                  {draftGroupIds.length > 0 && (
                    <button onClick={() => { setDraftGroupIds([]); setSearchQuery(''); }} className="text-[11px] text-blue-500 hover:text-blue-600 hover:underline">
                      清除筛选
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-gray-100">
            <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setOpen(false)}>取消</Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              style={isConfirmDisabled ? undefined : { background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
            >
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ── Sortable Row ────────────────────────────────────────
function SortableRoleRow({
  role,
  onToggle,
  onEdit,
  onDelete,
  onScopeChange,
}: {
  role: Role;
  onToggle: (id: string) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onScopeChange: (id: string, scope: SkillScope, groupIds: string[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isDragging ? "bg-blue-50/30 shadow-sm" : ""}`}
    >
      {/* Drag Handle */}
      <td className="w-10 px-3 py-4">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      {/* Name — clickable to open edit */}
      <td className="px-4 py-4">
        <button
          onClick={() => onEdit(role)}
          className="font-semibold text-sm text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left"
        >
          {role.name}
        </button>
      </td>
      {/* Description */}
      <td className="px-4 py-4 max-w-[320px]">
        <div className="text-xs text-gray-400 truncate">{role.description}</div>
      </td>
      {/* 应用范围 */}
      <td className="px-4 py-4">
        <EditRoleScopePopover
          role={role}
          onConfirm={(scope, groupIds) => onScopeChange(role.id, scope, groupIds)}
        />
      </td>
      {/* Visible toggle */}
      <td className="px-4 py-4">
        <Switch
          checked={role.visible}
          onCheckedChange={() => onToggle(role.id)}
        />
      </td>
      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(role)}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="编辑"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(role)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── 公共技能库添加弹窗（与初始技能包交互一致）──────────────
const MOCK_FAVORITES: PublicSkill[] = PUBLIC_SKILLS.slice(0, 5);

function RoleAddPublicSkillDialog({
  open,
  existingSkillNames,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  existingSkillNames: string[];
  onConfirm: (skills: RoleSkill[]) => void;
  onCancel: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSkill = (skillId: string) => {
    setSelectedIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleConfirm = () => {
    const newSkills: RoleSkill[] = selectedIds.map(id => {
      const skill = MOCK_FAVORITES.find(s => s.id === id)!;
      return { name: skill.name, version: `v${skill.version}`, source: "公共" as const };
    });
    onConfirm(newSkills);
    setSelectedIds([]);
  };

  const handleCancel = () => {
    setSelectedIds([]);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <DialogContent className="!max-w-4xl p-0 overflow-hidden" style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle>从公共技能库添加</DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            我的收藏
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {MOCK_FAVORITES.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">还没有收藏任何技能</p>
              <p className="text-xs mt-1">可先前往公共技能库收藏技能</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {MOCK_FAVORITES.map(skill => {
                const isAlreadyAdded = existingSkillNames.includes(skill.name);
                const isSelected = selectedIds.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => !isAlreadyAdded && toggleSkill(skill.id)}
                    className={`relative rounded-lg border p-3 transition-all ${
                      isAlreadyAdded
                        ? 'border-gray-200 bg-gray-100 opacity-40 cursor-not-allowed'
                        : isSelected
                          ? 'border-blue-400 bg-blue-50 cursor-pointer'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isAlreadyAdded && (
                      <div className="absolute top-2 right-2 text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">已添加</div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5 pr-8">
                      <span className="font-mono font-medium text-sm text-gray-900 truncate min-w-0">{skill.name}</span>
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">v{skill.version}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{skill.descriptionZh}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-gray-100 shrink-0">
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            确认添加{selectedIds.length > 0 ? `（${selectedIds.length} 个）` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 企业技能库添加弹窗（支持应用范围筛选）──────────────

function RoleAddEnterpriseSkillDialog({
  open,
  existingSkillNames,
  onConfirm,
  onCancel,
  /** 当前角色的应用范围，用于预设筛选 */
  roleScope,
  roleGroupIds,
}: {
  open: boolean;
  existingSkillNames: string[];
  onConfirm: (skills: RoleSkill[]) => void;
  onCancel: () => void;
  roleScope?: SkillScope;
  roleGroupIds?: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 应用范围多选筛选
  const [scopeFilters, setScopeFilters] = useState<string[]>([]);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState('');
  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target as Node)) {
        setScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开时根据角色应用范围预设筛选
  useEffect(() => {
    if (open) {
      if (roleScope === 'private' && roleGroupIds && roleGroupIds.length > 0) {
        setScopeFilters([...roleGroupIds]);
      } else if (roleScope === 'public') {
        setScopeFilters(['__public__']);
      } else {
        setScopeFilters([]);
      }
      setScopeDropdownOpen(false);
      setScopeSearchQuery('');
    }
  }, [open, roleScope, roleGroupIds]);

  const toggleSkill = (skillId: string) => {
    setSelectedIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleConfirm = () => {
    const newSkills: RoleSkill[] = selectedIds.map(id => {
      const skill = MOCK_SKILLS.find(s => s.id === id)!;
      return { name: skill.name, version: `v${skill.version}`, source: "企业" as const };
    });
    onConfirm(newSkills);
    setSelectedIds([]);
    setActiveCategory('all');
    setSearchQuery('');
    setScopeFilters([]);
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setActiveCategory('all');
    setSearchQuery('');
    setScopeFilters([]);
    setScopeDropdownOpen(false);
    setScopeSearchQuery('');
    onCancel();
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedIds([]);
    setScopeFilters([]);
    setScopeDropdownOpen(false);
    setScopeSearchQuery('');
  };

  const filteredSkills = MOCK_SKILLS.filter(s => {
    const matchCategory = activeCategory === 'all' || s.categories.includes(activeCategory);
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = q === '' || s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q);
    // 应用范围筛选
    let matchScope = true;
    if (scopeFilters.length > 0) {
      const allIds = ['__public__', ...MOCK_GROUPS.map(g => g.id)];
      const allSelected = allIds.every(id => scopeFilters.includes(id));
      if (!allSelected) {
        matchScope = false;
        if (scopeFilters.includes('__public__') && s.scope === 'public') {
          matchScope = true;
        }
        const selectedGroupIds = scopeFilters.filter(f => f !== '__public__');
        if (selectedGroupIds.length > 0 && s.groupIds) {
          if (selectedGroupIds.some(gid => s.groupIds.includes(gid))) {
            matchScope = true;
          }
        }
      }
    }
    return matchCategory && matchSearch && matchScope;
  });

  // 获取筛选显示文本
  const getScopeFilterLabel = () => {
    const allIds = ['__public__', ...MOCK_GROUPS.map(g => g.id)];
    const allSelected = allIds.every(id => scopeFilters.includes(id));
    if (scopeFilters.length === 0 || allSelected) return '全部应用范围';
    if (scopeFilters.includes('__public__') && scopeFilters.length === 1) return '全部用户';
    return `已选 ${scopeFilters.filter(f => f !== '__public__').length + (scopeFilters.includes('__public__') ? 1 : 0)} 项`;
  };

  const renderSkillCard = (skill: typeof MOCK_SKILLS[0]) => {
    const isAlreadyAdded = existingSkillNames.includes(skill.name);
    const isSelected = selectedIds.includes(skill.id);
    return (
      <div
        key={skill.id}
        onClick={() => !isAlreadyAdded && toggleSkill(skill.id)}
        className={`relative rounded-lg border p-3 transition-all ${
          isAlreadyAdded
            ? 'border-gray-200 bg-gray-100 opacity-40 cursor-not-allowed'
            : isSelected
              ? 'border-blue-400 bg-blue-50 cursor-pointer'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
        }`}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        {isAlreadyAdded && (
          <div className="absolute top-2 right-2 text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">已添加</div>
        )}
        <div className="flex items-center gap-2 mb-1.5 pr-8">
          <span className="font-medium text-sm text-gray-900 truncate min-w-0">{skill.name}</span>
          <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">v{skill.version}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <DialogContent className="!max-w-4xl p-0 overflow-hidden" style={{ height: '640px', display: 'flex', flexDirection: 'column' }} onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle>从企业技能库添加</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 搜索框 + 应用范围筛选 + 刷新 */}
          <div className="px-5 pt-3 pb-2 shrink-0 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索技能名称或描述..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            {/* 应用范围多选下拉 */}
            <div className="relative" ref={scopeDropdownRef}>
              <button
                type="button"
                onClick={() => setScopeDropdownOpen(prev => !prev)}
                className="flex items-center justify-between gap-1 w-32 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="truncate text-left text-xs">{getScopeFilterLabel()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {scopeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <div className="px-2 pb-1.5 pt-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        placeholder="搜索..."
                        value={scopeSearchQuery}
                        onChange={(e) => setScopeSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-2 h-7 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {/* 全部应用范围 */}
                  {(!scopeSearchQuery || '全部应用范围'.includes(scopeSearchQuery)) && (() => {
                    const allIds = ['__public__', ...MOCK_GROUPS.map(g => g.id)];
                    const allSelected = allIds.every(id => scopeFilters.includes(id));
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (allSelected) setScopeFilters([]);
                          else setScopeFilters(allIds);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                          allSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                        }`}>
                          {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="truncate text-left">全部应用范围</span>
                      </button>
                    );
                  })()}
                  {/* 全部用户 */}
                  {(!scopeSearchQuery || '全部用户'.includes(scopeSearchQuery)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setScopeFilters(prev => {
                          if (prev.includes('__public__')) return prev.filter(f => f !== '__public__');
                          return [...prev, '__public__'];
                        });
                      }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                        scopeFilters.includes('__public__') ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                        {scopeFilters.includes('__public__') && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className="truncate text-left">全部用户</span>
                    </button>
                  )}
                  {/* 分组列表 */}
                  <div className="max-h-48 overflow-y-auto">
                    {MOCK_GROUPS
                      .filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase()))
                      .map(group => {
                        const checked = scopeFilters.includes(group.id);
                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setScopeFilters(prev => {
                                if (prev.includes(group.id)) return prev.filter(f => f !== group.id);
                                return [...prev, group.id];
                              });
                            }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                              checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                            }`}>
                              {checked && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <span className="truncate text-left" title={group.name}>{group.name}</span>
                          </button>
                        );
                      })}
                  </div>
                  {/* 底部计数+清除 */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 mt-1">
                    <span className="text-[11px] text-gray-400">
                      已选 {scopeFilters.filter(f => f !== '__public__').length + (scopeFilters.includes('__public__') ? 1 : 0)} 项
                    </span>
                    {scopeFilters.length > 0 && (
                      <button onClick={() => setScopeFilters([])} className="text-[11px] text-gray-400 hover:text-gray-600">
                        清除
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-3 shrink-0 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {DEFAULT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-3">
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredSkills.map(skill => renderSkillCard(skill))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无匹配的技能</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="px-5 py-3 border-t border-gray-100 shrink-0">
          <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            确认添加{selectedIds.length > 0 ? `（${selectedIds.length} 个）` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit/Create Role Modal ──────────────────────────────
const NAME_MAX_LEN = 8;

function RoleEditModal({
  open,
  role,
  onClose,
  onSave,
}: {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSave: (role: Role) => void;
}) {
  const isNew = role === null;
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [soul, setSoul] = useState("");
  const [skills, setSkills] = useState<RoleSkill[]>([]);
  const [visible, setVisible] = useState(true);
  const [scope, setScope] = useState<SkillScope>('public');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showAddPublicDialog, setShowAddPublicDialog] = useState(false);
  const [showAddEnterpriseDialog, setShowAddEnterpriseDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Reset form when dialog opens
  if (open && !initialized) {
    setName(role?.name ?? "");
    setNameError("");
    setDescription(role?.description ?? "");
    setSoul(role?.soul ?? "");
    setSkills(role?.skills ? [...role.skills] : []);
    setVisible(role?.visible ?? true);
    setScope(role?.scope ?? 'public');
    setGroupIds(role?.groupIds ? [...role.groupIds] : []);
    setGroupSearchQuery('');
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  const handleNameChange = (val: string) => {
    if (val.length > NAME_MAX_LEN) {
      setNameError(`角色名称不超过 ${NAME_MAX_LEN} 个字`);
      return;
    }
    setName(val);
    setNameError("");
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("请输入角色名称");
      return;
    }
    if (name.trim().length > NAME_MAX_LEN) {
      toast.error(`角色名称不超过 ${NAME_MAX_LEN} 个字`);
      return;
    }
    onSave({
      id: role?.id ?? `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      soul: soul.trim(),
      skills,
      visible,
      scope,
      groupIds: scope === 'public' ? [] : groupIds,
    });
    onClose();
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddSkills = (newSkills: RoleSkill[]) => {
    setSkills([...skills, ...newSkills]);
    setShowAddPublicDialog(false);
    setShowAddEnterpriseDialog(false);
  };

  const filteredGroupsForEdit = MOCK_GROUPS.filter(g =>
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "自定义角色" : `编辑角色 — ${role?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                角色名称
                <span className="text-xs text-gray-300 font-normal ml-1.5">{name.length}/{NAME_MAX_LEN}</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="例如：营养师、法律顾问..."
                className={`mt-1.5 bg-gray-50 ${nameError ? "border-red-400" : ""}`}
                autoFocus={isNew}
                maxLength={NAME_MAX_LEN}
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>

            {/* Description — use Textarea for auto wrap */}
            <div>
              <Label className="text-sm font-medium text-gray-700">角色描述</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="一句话描述角色的核心能力"
                className="mt-1.5 min-h-[60px] resize-none bg-gray-50"
                rows={2}
              />
            </div>

            {/* Soul */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                角色灵魂
                <span className="text-gray-400 font-normal ml-1.5">— 定义智能体的人格、价值观与行为准则</span>
              </Label>
              <Textarea
                value={soul}
                onChange={(e) => setSoul(e.target.value)}
                placeholder="描述角色的人格特质、专业领域和行为准则..."
                className="mt-1.5 min-h-[80px] resize-none bg-gray-50"
                rows={3}
              />
            </div>

            {/* 应用范围 — 放在角色技能上面 */}
            <div>
              <Label className="text-sm font-medium text-gray-700">应用范围</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setScope('public'); setGroupIds([]); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      scope === 'public'
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    全部用户
                  </button>
                  <button
                    onClick={() => setScope('private')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      scope === 'private'
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    按分组
                  </button>

                  {/* 选择按分组后，右侧出现下拉选择器 */}
                  {scope === 'private' && (
                    <Popover>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors min-w-[120px]">
                              <span className="truncate">
                                {groupIds.length > 0
                                  ? `已选 ${groupIds.length} 个分组`
                                  : '选择分组…'}
                              </span>
                              <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        {groupIds.length > 0 && (
                          <TooltipContent side="bottom" className="max-w-[280px]">
                            <p className="text-xs leading-relaxed">
                              {groupIds.map(gid => MOCK_GROUPS.find(g => g.id === gid)?.name || gid).join('，')}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <PopoverContent className="w-64 p-0" align="start" sideOffset={6}>
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              placeholder="搜索分组…"
                              value={groupSearchQuery}
                              onChange={(e) => setGroupSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {filteredGroupsForEdit.map(group => {
                            const checked = groupIds.includes(group.id);
                            return (
                              <button
                                key={group.id}
                                onClick={() => {
                                  setGroupIds(prev =>
                                    prev.includes(group.id)
                                      ? prev.filter(id => id !== group.id)
                                      : [...prev, group.id]
                                  );
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                  checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                }`}>
                                  {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                </span>
                                <span className="text-xs text-gray-700 truncate">{group.name}</span>
                              </button>
                            );
                          })}
                          {filteredGroupsForEdit.length === 0 && (
                            <p className="text-[11px] text-gray-400 py-3 text-center">无匹配分组</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                          <p className="text-[11px] text-gray-400">
                            已选 {groupIds.length} 个分组
                          </p>
                          {groupIds.length > 0 && (
                            <button
                              onClick={() => setGroupIds([])}
                              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              清除
                            </button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                角色技能
                <span className="text-gray-400 font-normal ml-1.5">— 赋予智能体专业执行能力的技能工具</span>
              </Label>
              <div className="mt-1.5 border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-sm font-medium text-gray-600">
                  技能列表（共 {skills.length} 个）
                </div>
                {skills.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-400">
                    暂无技能，请从技能库添加
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {skills.map((skill, idx) => (
                      <div key={`${skill.name}-${idx}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className={`px-1.5 rounded text-xs font-medium ${skill.source === "公共" ? "text-blue-500 bg-blue-50" : "text-green-600 bg-green-50"}`}>
                              {skill.source}
                            </span>
                            {skill.version}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSkill(idx)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddPublicDialog(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    从公共技能库添加
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddEnterpriseDialog(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    从企业技能库添加
                  </Button>
                </div>
              </div>
            </div>

            {/* Visible */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">用户可见</Label>
                <p className="text-xs text-gray-400 mt-0.5">启用后，员工创建 OpenClaw 时可选择此角色</p>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button
              onClick={handleSave}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RoleAddPublicSkillDialog
        open={showAddPublicDialog}
        existingSkillNames={skills.map(s => s.name)}
        onConfirm={handleAddSkills}
        onCancel={() => setShowAddPublicDialog(false)}
      />

      <RoleAddEnterpriseSkillDialog
        open={showAddEnterpriseDialog}
        existingSkillNames={skills.map(s => s.name)}
        onConfirm={handleAddSkills}
        onCancel={() => setShowAddEnterpriseDialog(false)}
        roleScope={scope}
        roleGroupIds={groupIds}
      />
    </>
  );
}

// ── Main Tab ────────────────────────────────────────────
export default function SkillRolesTab() {
  const [roles, setRoles] = useState<Role[]>([...MOCK_ROLES]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isNewRole, setIsNewRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  // 应用范围筛选
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState('');
  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 点击外部关闭应用范围下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target as Node)) {
        setScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRoles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggle = (id: string) => {
    setRoles(roles.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)));
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsNewRole(false);
    setShowEdit(true);
  };

  const handleNew = () => {
    setEditingRole(null);
    setIsNewRole(true);
    setShowEdit(true);
  };

  const handleSave = (saved: Role) => {
    if (isNewRole) {
      setRoles([saved, ...roles]);
      toast.success(`角色「${saved.name}」已创建`);
    } else {
      setRoles(roles.map((r) => (r.id === saved.id ? saved : r)));
      toast.success(`角色「${saved.name}」已更新`);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRoles(roles.filter((r) => r.id !== deleteTarget.id));
    toast.success(`角色「${deleteTarget.name}」已删除`);
    setDeleteTarget(null);
  };

  const handleScopeChange = (id: string, scope: SkillScope, groupIds: string[]) => {
    setRoles(roles.map(r => r.id === id ? { ...r, scope, groupIds } : r));
    toast.success('应用范围修改成功');
  };

  // 筛选后的角色列表
  const filteredRoles = roles.filter(role => {
    if (selectedScope === null) return true;
    if (selectedScope === 'public') {
      return role.scope === 'public' || !role.groupIds || role.groupIds.length === 0;
    }
    // 按特定分组筛选
    return role.scope === 'private' && role.groupIds?.includes(selectedScope);
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-bold text-gray-900">角色列表</div>
        <div className="flex items-center gap-3">
          {/* 应用范围筛选 */}
          <div className="relative" ref={scopeDropdownRef}>
            <Tooltip delayDuration={1000} open={scopeDropdownOpen ? false : undefined}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setScopeDropdownOpen(prev => !prev)}
                  className="flex items-center justify-between gap-1 w-40 h-9 px-3 border border-gray-200 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate text-left">
                    {selectedScope === null
                      ? '全部应用范围'
                      : selectedScope === 'public'
                        ? '全部用户'
                        : MOCK_GROUPS.find(g => g.id === selectedScope)?.name || selectedScope}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[280px]">
                <p className="break-words">
                  {selectedScope === null
                    ? '全部应用范围'
                    : selectedScope === 'public'
                      ? '全部用户'
                      : MOCK_GROUPS.find(g => g.id === selectedScope)?.name || selectedScope}
                </p>
              </TooltipContent>
            </Tooltip>
            {scopeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <div className="px-2 pb-1.5 pt-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      placeholder="搜索..."
                      value={scopeSearchQuery}
                      onChange={(e) => setScopeSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 h-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {/* 全部应用范围 */}
                {(!scopeSearchQuery || '全部应用范围'.includes(scopeSearchQuery)) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedScope(null); setScopeDropdownOpen(false); setScopeSearchQuery(''); }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedScope === null ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate text-left">全部应用范围</span>
                    {selectedScope === null && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                )}
                {/* 全部用户 */}
                {(!scopeSearchQuery || '全部用户'.includes(scopeSearchQuery)) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedScope('public'); setScopeDropdownOpen(false); setScopeSearchQuery(''); }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedScope === 'public' ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate text-left">全部用户</span>
                    {selectedScope === 'public' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                )}
                {/* 分组列表 */}
                <div className="max-h-60 overflow-y-auto">
                  {MOCK_GROUPS
                    .filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase()))
                    .map(group => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => { setSelectedScope(group.id); setScopeDropdownOpen(false); setScopeSearchQuery(''); }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedScope === group.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate text-left" title={group.name}>{group.name}</span>
                        {selectedScope === group.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(scopeSearchQuery.toLowerCase())).length === 0 && scopeSearchQuery && (
                    <p className="text-xs text-gray-400 py-2 text-center">没有匹配的分组</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleNew}
            className="text-white"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            自定义角色
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-3 py-3" />
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">角色名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">角色描述</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">应用范围</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">用户可见</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">操作</th>
              </tr>
            </thead>
            <SortableContext
              items={filteredRoles.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {filteredRoles.map((role) => (
                  <SortableRoleRow
                    key={role.id}
                    role={role}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                    onScopeChange={handleScopeChange}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
        <div className="px-4 py-3 border-t border-gray-50 text-sm text-gray-400">
          共 {filteredRoles.length} 个角色{selectedScope !== null ? `（筛选中，全部 ${roles.length} 个）` : ''}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <RoleEditModal
        open={showEdit}
        role={isNewRole ? null : editingRole}
        onClose={() => setShowEdit(false)}
        onSave={handleSave}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除角色「{deleteTarget?.name}」吗？删除后，已选择该角色的 OpenClaw 不受影响，但新创建的 OpenClaw 将无法再选择此角色。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
