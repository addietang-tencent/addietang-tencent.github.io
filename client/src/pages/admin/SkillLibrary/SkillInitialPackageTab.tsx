/**
 * 技能初始包 Tab
 * 设计风格：浅色主题，草稿+发布分离，生效开关
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Trash2, ArrowLeft, Package, Globe, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, X, AlertCircle, Sparkles
} from 'lucide-react';
import { INITIAL_SKILL_PACKAGES_DEFAULT, PUBLIC_SKILLS, type PublicSkill, type SkillInitialPackage, type PackageSkillItem } from './publicSkillMockData';
import { Star } from 'lucide-react';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check } from 'lucide-react';

// ─── 公共技能库添加弹窗 ──────────────────────────────────────────────────────────

// 公共技能库收藏列表（mock）
const MOCK_FAVORITES: PublicSkill[] = PUBLIC_SKILLS.slice(0, 5);

interface AddPublicSkillDialogProps {
  open: boolean;
  existingSkillIds: string[];
  onConfirm: (skills: PackageSkillItem[]) => void;
  onCancel: () => void;
}

function AddPublicSkillDialog({ open, existingSkillIds, onConfirm, onCancel }: AddPublicSkillDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSkill = (skillId: string) => {
    setSelectedIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleConfirm = () => {
    const newSkills: PackageSkillItem[] = selectedIds.map(id => {
      const skill = MOCK_FAVORITES.find(s => s.id === id)!;
      return {
        skillId: skill.id,
        skillName: skill.slug,
        skillNameZh: skill.nameZh,
        source: 'public' as const,
        version: skill.version,
        addedAt: new Date(),
      };
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

        {/* 收藏分区标题 */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            我的收藏
          </div>
        </div>

        {/* 技能列表 */}
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
                const isAlreadyAdded = existingSkillIds.includes(skill.id);
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
                    {/* 技能名称（英文）+ 版本号 */}
                    <div className="flex items-center gap-2 mb-1.5 pr-8">
                      <span className="font-mono font-medium text-sm text-gray-900 truncate min-w-0">{skill.name}</span>
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">v{skill.version}</span>
                    </div>
                    {/* 描述（中文） */}
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

// ─── 企业技能库添加弹窗 ──────────────────────────────────────────────────────────

interface AddEnterpriseSkillDialogProps {
  open: boolean;
  existingSkillIds: string[];
  onConfirm: (skills: PackageSkillItem[]) => void;
  onCancel: () => void;
}

function AddEnterpriseSkillDialog({ open, existingSkillIds, onConfirm, onCancel }: AddEnterpriseSkillDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('1');

  const toggleSkill = (skillId: string) => {
    setSelectedIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleConfirm = () => {
    const newSkills: PackageSkillItem[] = selectedIds.map(id => {
      const skill = MOCK_SKILLS.find(s => s.id === id)!;
      return {
        skillId: skill.id,
        skillName: skill.slug,
        skillNameZh: skill.name,
        source: 'enterprise' as const,
        version: skill.version,
        addedAt: new Date(),
      };
    });
    onConfirm(newSkills);
    setSelectedIds([]);
    setActiveCategory('1');
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setActiveCategory('1');
    onCancel();
  };

  const skillsByCategory = MOCK_SKILLS.filter(s => s.categories.includes(activeCategory));

  const renderSkillCard = (skill: typeof MOCK_SKILLS[0]) => {
    const isAlreadyAdded = existingSkillIds.includes(skill.id);
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
      <DialogContent className="!max-w-4xl p-0 overflow-hidden" style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle>从企业技能库添加</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧 Tab */}
          <Tabs defaultValue="all" className="flex flex-col w-full overflow-hidden">
            <div className="px-5 pt-3 shrink-0">
              <TabsList className="mb-3">
                <TabsTrigger value="all">全部 Skill</TabsTrigger>
                <TabsTrigger value="category">按分类</TabsTrigger>
              </TabsList>
            </div>

            {/* 全部 Skill */}
            <TabsContent value="all" className="flex-1 overflow-y-auto px-5 pb-3">
              <div className="grid grid-cols-2 gap-3">
                {MOCK_SKILLS.map(skill => renderSkillCard(skill))}
              </div>
            </TabsContent>

            {/* 按分类 */}
            <TabsContent value="category" className="flex-1 overflow-y-auto px-5 pb-3">
              {/* 分类标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
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
              {/* 技能卡片 */}
              {skillsByCategory.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {skillsByCategory.map(skill => renderSkillCard(skill))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">该分类下暂无技能</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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

// ─── 新建技能包对话框 ──────────────────────────────────────────────────────────

interface CreatePackageDialogProps {
  open: boolean;
  existingNames: string[];
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function CreatePackageDialog({ open, existingNames, onConfirm, onCancel }: CreatePackageDialogProps) {
  const [name, setName] = useState('');

  const trimmed = name.trim();

  const handleConfirm = () => {
    if (!trimmed) return;
    if (existingNames.includes(trimmed)) {
      toast.error('初始技能包名称不可重复');
      return;
    }
    onConfirm(trimmed);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setName(''); onCancel(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>新建初始技能包</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 my-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">技能包名称</label>
            <Input
              placeholder="例如：全员通用技能包"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>应用范围：全部成员</span>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => { setName(''); onCancel(); }}>取消</Button>
          <Button onClick={handleConfirm} disabled={!trimmed}>创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 发布确认对话框 ────────────────────────────────────────────────────────────

interface PublishConfirmDialogProps {
  open: boolean;
  packageName: string;
  isActive: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function PublishConfirmDialog({ open, packageName, isActive, onConfirm, onCancel }: PublishConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认保存修改</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <p className="text-sm text-gray-600">
            本次修改将<strong className="text-gray-800">应用于新创建的 OpenClaw</strong>，已创建的 OpenClaw 保持原有初始配置不受影响。
          </p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm}>
            确认保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 切换生效确认对话框 ────────────────────────────────────────────────────────

interface ActivateConfirmDialogProps {
  open: boolean;
  currentActiveName: string;
  newPackageName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ActivateConfirmDialog({
  open, currentActiveName, newPackageName,
  onConfirm, onCancel
}: ActivateConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认切换生效技能包</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <p className="text-sm text-gray-600 leading-relaxed">
            切换后，「{currentActiveName}」将<strong className="text-gray-900">停止生效</strong>，「{newPackageName}」将<strong className="text-gray-900">对所有新创建的 OpenClaw 生效</strong>，已创建的 OpenClaw 保持原有初始配置不受影响。
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 删除确认对话框 ────────────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  packageName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ open, packageName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <p className="text-sm text-gray-600">
            确定要删除「<span className="font-medium text-gray-800">{packageName}</span>」吗？删除后不可恢复。
          </p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">确认删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 技能包详情页 ─────────────────────────────────────────────────────────────

interface PackageDetailViewProps {
  pkg: SkillInitialPackage;
  onBack: () => void;
  onPublish: (pkgId: string) => void;
  onRemoveSkill: (pkgId: string, skillId: string) => void;
}

function PackageDetailView({ pkg, onBack, onPublish, onRemoveSkill }: PackageDetailViewProps) {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [localSkills, setLocalSkills] = useState(pkg.skills);
  const [showAddEnterpriseDialog, setShowAddEnterpriseDialog] = useState(false);
  const [showAddPublicDialog, setShowAddPublicDialog] = useState(false);

  // 当 pkg 变化时同步本地技能列表（例如切换包）
  const handleRemoveLocal = (skillId: string) => {
    setLocalSkills(prev => prev.filter(s => s.skillId !== skillId));
    setIsDirty(true);
  };

  const doSave = () => {
    // 找出被删除的技能并逐一调用 onRemoveSkill
    pkg.skills.forEach(s => {
      if (!localSkills.find(ls => ls.skillId === s.skillId)) {
        onRemoveSkill(pkg.id, s.skillId);
      }
    });
    setIsDirty(false);
    setShowPublishConfirm(false);
    toast.success('保存成功');
  };

  const handleSave = () => {
    if (pkg.isActive) {
      // 已生效的技能包：弹出二次确认
      setShowPublishConfirm(true);
    } else {
      // 未生效的技能包：直接保存
      doSave();
    }
  };

  const handleDiscard = () => {
    setLocalSkills(pkg.skills);
    setIsDirty(false);
  };

  const handleAddPublicSkills = (skills: PackageSkillItem[]) => {
    setLocalSkills(prev => [...prev, ...skills]);
    setIsDirty(true);
    setShowAddPublicDialog(false);
  };

  const handleAddEnterpriseSkills = (skills: PackageSkillItem[]) => {
    setLocalSkills(prev => [...prev, ...skills]);
    setIsDirty(true);
    setShowAddEnterpriseDialog(false);
  };

  return (
    <div className="space-y-4">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回初始技能包列表
        </button>
      </div>

      {/* 技能包信息 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#007AFF' }}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-semibold text-gray-900">{pkg.name}</h2>
              {pkg.isActive && (
                <span className="badge-running text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  生效中
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Globe className="w-3 h-3" />
              <span>{pkg.scope}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 技能列表 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-4 border-b border-gray-100 flex items-center justify-between" style={{ minHeight: '48px' }}>
          <span className="text-sm font-medium text-gray-700">
            技能列表（共 {localSkills.length} 个）
          </span>
          {isDirty && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="h-7 px-3 text-xs text-gray-500"
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                保存
              </Button>
            </div>
          )}
        </div>

        {localSkills.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {localSkills.map(skill => (
              <div key={skill.skillId} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-800">
                      {skill.source === 'enterprise' && skill.skillNameZh ? skill.skillNameZh : skill.skillName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        skill.source === 'public'
                          ? 'text-blue-600 border-blue-200 bg-blue-50'
                          : 'text-purple-600 border-purple-200 bg-purple-50'
                      }`}
                    >
                      {skill.source === 'public' ? '公共' : '企业'}
                    </Badge>
                    <span className="font-mono text-[10px] text-gray-400">v{skill.version}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLocal(skill.skillId)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="从技能包中移除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">该技能包还没有技能</p>
            <p className="text-xs mt-1">可从公共技能库或企业技能库添加</p>
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

      {/* 公共技能库添加弹窗 */}
      <AddPublicSkillDialog
        open={showAddPublicDialog}
        existingSkillIds={localSkills.map(s => s.skillId)}
        onConfirm={handleAddPublicSkills}
        onCancel={() => setShowAddPublicDialog(false)}
      />

      {/* 企业技能库添加弹窗 */}
      <AddEnterpriseSkillDialog
        open={showAddEnterpriseDialog}
        existingSkillIds={localSkills.map(s => s.skillId)}
        onConfirm={handleAddEnterpriseSkills}
        onCancel={() => setShowAddEnterpriseDialog(false)}
      />

      {/* 保存确认弹窗（仅已生效技能包触发） */}
      <PublishConfirmDialog
        open={showPublishConfirm}
        packageName={pkg.name}
        isActive={pkg.isActive}
        onConfirm={doSave}
        onCancel={() => setShowPublishConfirm(false)}
      />
    </div>
  );
}


// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface SkillInitialPackageTabProps {
  onPackagesChange?: (packages: Array<{ id: string; name: string; isActive: boolean }>) => void;
}

export default function SkillInitialPackageTab({ onPackagesChange }: SkillInitialPackageTabProps) {
  const [packages, setPackages] = useState<SkillInitialPackage[]>(INITIAL_SKILL_PACKAGES_DEFAULT);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activateTarget, setActivateTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const activePackage = packages.find(p => p.isActive);

  // 通知父组件 packages 变化
  const updatePackages = (newPackages: SkillInitialPackage[]) => {
    setPackages(newPackages);
    onPackagesChange?.(newPackages.map(p => ({ id: p.id, name: p.name, isActive: p.isActive })));
  };

  // 新建技能包
  const handleCreate = (name: string) => {
    const newPkg: SkillInitialPackage = {
      id: `pkg-${Date.now()}`,
      name,
      scope: '全部成员',
      isActive: false,
      hasDraft: false,
      skills: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    updatePackages([...packages, newPkg]);
    setShowCreateDialog(false);
  };

  // 切换生效开关
  const handleToggleActive = (pkgId: string, value: boolean) => {
    if (!value) {
      // 关闭生效
      updatePackages(packages.map(p => p.id === pkgId ? { ...p, isActive: false } : p));
      return;
    }
    // 打开生效 - 需要确认
    setActivateTarget(pkgId);
  };

  // 确认切换生效（直接用草稿）
  const handleActivateConfirm = () => {
    if (!activateTarget) return;
    updatePackages(packages.map(p => ({
      ...p,
      isActive: p.id === activateTarget,
      hasDraft: p.id === activateTarget ? false : p.hasDraft,
    })));
    setActivateTarget(null);
  };

  // 前往发布修改
  const handleGoPublish = () => {
    if (!activateTarget) return;
    setSelectedPackageId(activateTarget);
    setActivateTarget(null);
  };

  // 发布修改
  const handlePublish = (pkgId: string) => {
    updatePackages(packages.map(p => p.id === pkgId ? { ...p, hasDraft: false, updatedAt: new Date() } : p));
  };

  // 删除技能包
  const handleDelete = (pkgId: string) => {
    updatePackages(packages.filter(p => p.id !== pkgId));
    setDeleteTarget(null);
  };

  // 从技能包中移除技能
  const handleRemoveSkill = (pkgId: string, skillId: string) => {
    updatePackages(packages.map(p =>
      p.id === pkgId
        ? { ...p, skills: p.skills.filter(s => s.skillId !== skillId), hasDraft: true, updatedAt: new Date() }
        : p
    ));
  };

  // 如果选中了技能包，显示详情页
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  if (selectedPackage) {
    return (
      <PackageDetailView
        pkg={selectedPackage}
        onBack={() => setSelectedPackageId(null)}
        onPublish={handlePublish}
        onRemoveSkill={handleRemoveSkill}
      />
    );
  }

  const activateTargetPkg = packages.find(p => p.id === activateTarget);
  const deleteTargetPkg = packages.find(p => p.id === deleteTarget);

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-base font-bold text-gray-900 shrink-0">初始技能包列表</h3>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-600 min-w-0">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">由腾讯云存储 Agent Bucket 提供服务，ClawPro 用户独享 50G + 50G 专属免费空间</span>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-1.5 shrink-0" style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
          <Plus className="w-4 h-4" />
          新建
        </Button>
      </div>

      {/* 技能包列表 */}
      {packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-100 p-4 transition-all cursor-pointer group hover:shadow-md"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onClick={() => setSelectedPackageId(pkg.id)}
            >
              <div className="flex items-center gap-3">
                {/* 图标 */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#007AFF' }}>
                  <Package className="w-5 h-5 text-white" />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{pkg.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {pkg.scope}
                    </span>
                    <span>{pkg.skills.length} 个技能</span>
                  </div>
                </div>

                {/* 操作区 */}
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* 生效开关 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">设为生效</span>
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={(v) => handleToggleActive(pkg.id, v)}
                    />
                  </div>

                  {/* 删除按钮 */}
                  {pkg.isActive ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {}}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-gray-300 cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-900 text-white text-xs max-w-[200px] text-center">
                          生效中的技能包不可删除
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <button
                      onClick={() => setDeleteTarget(pkg.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">还没有初始技能包</p>
          <p className="text-xs mt-1">点击「新建」创建第一个初始技能包</p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            新建初始技能包
          </Button>
        </div>
      )}

      {/* 新建对话框 */}
      <CreatePackageDialog
        open={showCreateDialog}
        existingNames={packages.map(p => p.name)}
        onConfirm={handleCreate}
        onCancel={() => setShowCreateDialog(false)}
      />

      {/* 切换生效确认 */}
      {activateTargetPkg && (
        <ActivateConfirmDialog
          open={!!activateTarget}
          currentActiveName={activePackage?.name || ''}
          newPackageName={activateTargetPkg.name}
          onConfirm={handleActivateConfirm}
          onCancel={() => setActivateTarget(null)}
        />
      )}

      {/* 删除确认 */}
      {deleteTargetPkg && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          packageName={deleteTargetPkg.name}
          onConfirm={() => handleDelete(deleteTarget!)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
