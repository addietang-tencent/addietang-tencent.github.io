/**
 * SkillRolesTab - 角色设定管理
 * 功能：拖拽排序、开关可见性、编辑角色、删除角色、新增自定义角色
 */
import { useState } from "react";
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
} from "lucide-react";
import {
  MOCK_ROLES,
} from "@/lib/mockData";
import type { Role, RoleSkill } from "@/lib/mockData";
import { PUBLIC_SKILLS, type PublicSkill } from "./SkillLibrary/publicSkillMockData";
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from "./SkillLibrary/mockData";

// ── Sortable Row ────────────────────────────────────────
function SortableRoleRow({
  role,
  onToggle,
  onEdit,
  onDelete,
}: {
  role: Role;
  onToggle: (id: string) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
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

// ── 企业技能库添加弹窗（与初始技能包交互一致）──────────────

function RoleAddEnterpriseSkillDialog({
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setActiveCategory('all');
    setSearchQuery('');
    onCancel();
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedIds([]);
  };

  const filteredSkills = MOCK_SKILLS.filter(s => {
    const matchCategory = activeCategory === 'all' || s.categories.includes(activeCategory);
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = q === '' || s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-bold text-gray-900">角色列表</div>
        <Button
          onClick={handleNew}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          自定义角色
        </Button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">用户可见</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">操作</th>
              </tr>
            </thead>
            <SortableContext
              items={roles.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {roles.map((role) => (
                  <SortableRoleRow
                    key={role.id}
                    role={role}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
        <div className="px-4 py-3 border-t border-gray-50 text-sm text-gray-400">
          共 {roles.length} 个角色
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
