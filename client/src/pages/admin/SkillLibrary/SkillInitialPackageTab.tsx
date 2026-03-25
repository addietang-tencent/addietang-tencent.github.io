/**
 * 技能初始包 Tab
 * 设计风格：浅色主题，草稿+发布分离，生效开关
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  CheckCircle2, Clock, ChevronRight, X, AlertCircle
} from 'lucide-react';
import { INITIAL_SKILL_PACKAGES_DEFAULT, PUBLIC_SKILLS, type SkillInitialPackage, type PackageSkillItem } from './publicSkillMockData';

// ─── 新建技能包对话框 ──────────────────────────────────────────────────────────

interface CreatePackageDialogProps {
  open: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function CreatePackageDialog({ open, onConfirm, onCancel }: CreatePackageDialogProps) {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim());
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
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>应用范围：全部成员（暂不支持修改）</span>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => { setName(''); onCancel(); }}>取消</Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>创建</Button>
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
          <DialogTitle>确认发布修改</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 my-2">
          {isActive ? (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">发布后将立即对用户生效</p>
                <p className="text-xs">「{packageName}」当前正在生效中，发布后修改将立即对所有成员生效，请确认无误后再发布。</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              将保存「{packageName}」的修改。该技能包当前未生效，发布后等待生效时才对用户可见。
            </p>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm} className={isActive ? 'bg-amber-600 hover:bg-amber-700' : ''}>
            确认发布
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
  newPackageHasDraft: boolean;
  onConfirmDirect: () => void;
  onGoPublish: () => void;
  onCancel: () => void;
}

function ActivateConfirmDialog({
  open, currentActiveName, newPackageName, newPackageHasDraft,
  onConfirmDirect, onGoPublish, onCancel
}: ActivateConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认切换生效技能包</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 my-2">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>切换后，「{currentActiveName}」将停止生效，「{newPackageName}」将对所有成员生效。</p>
            </div>
          </div>
          {newPackageHasDraft && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">「{newPackageName}」有未发布的修改</p>
                <p className="text-xs">你可以直接用草稿内容生效，或先前往发布修改后再生效。</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onCancel} className="flex-1">取消</Button>
          {newPackageHasDraft && (
            <Button variant="outline" onClick={onGoPublish} className="flex-1">
              前往发布修改
            </Button>
          )}
          <Button onClick={onConfirmDirect} className="flex-1">
            {newPackageHasDraft ? '直接用草稿生效' : '确认切换'}
          </Button>
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

  return (
    <div className="space-y-4">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回技能初始包列表
        </button>
        <div className="flex items-center gap-2">
          {pkg.hasDraft && (
            <Button
              size="sm"
              onClick={() => setShowPublishConfirm(true)}
              className={pkg.isActive ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              发布修改
            </Button>
          )}
          {!pkg.hasDraft && (
            <Button size="sm" variant="outline" disabled className="opacity-50">
              发布修改
            </Button>
          )}
        </div>
      </div>

      {/* 技能包信息 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-semibold text-gray-900">{pkg.name}</h2>
              {pkg.isActive && (
                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                  🟢 生效中
                </Badge>
              )}
              {pkg.hasDraft && (
                <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                  🟠 有修改未发布
                </Badge>
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
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            技能列表（共 {pkg.skills.length} 个）
          </span>
        </div>

        {pkg.skills.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {pkg.skills.map(skill => (
              <div key={skill.skillId} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-800">{skill.skillName}</span>
                    {skill.skillNameZh && (
                      <span className="text-xs text-gray-400">{skill.skillNameZh}</span>
                    )}
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
                  onClick={() => onRemoveSkill(pkg.id, skill.skillId)}
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            从企业技能库添加
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            从公共技能库添加
          </Button>
        </div>
      </div>

      {/* 发布确认弹窗 */}
      <PublishConfirmDialog
        open={showPublishConfirm}
        packageName={pkg.name}
        isActive={pkg.isActive}
        onConfirm={() => { setShowPublishConfirm(false); onPublish(pkg.id); }}
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">技能初始包</h3>
          <p className="text-xs text-gray-400 mt-0.5">新建 OpenClaw 时将预装生效中的技能包内所有技能</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-1.5">
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
              className={`bg-white rounded-xl border p-4 transition-all ${
                pkg.isActive
                  ? 'border-green-200 shadow-sm'
                  : 'border-gray-100'
              }`}
              style={{ boxShadow: pkg.isActive ? '0 1px 6px rgba(34,197,94,0.1)' : '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3">
                {/* 图标 */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  pkg.isActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Package className={`w-5 h-5 ${pkg.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900">{pkg.name}</span>
                    {pkg.isActive && (
                      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        🟢 生效中
                      </Badge>
                    )}
                    {pkg.hasDraft && (
                      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                        🟠 有修改未发布
                      </Badge>
                    )}
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
                <div className="flex items-center gap-2 shrink-0">
                  {/* 生效开关 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">生效</span>
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={(v) => handleToggleActive(pkg.id, v)}
                    />
                  </div>

                  {/* 查看详情 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    查看
                    <ChevronRight className="w-3 h-3" />
                  </Button>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => {
                      if (pkg.isActive) return; // 生效中禁止删除
                      setDeleteTarget(pkg.id);
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      pkg.isActive
                        ? 'text-gray-200 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title={pkg.isActive ? '生效中的技能包不可删除，请先关闭生效开关' : '删除技能包'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
        onConfirm={handleCreate}
        onCancel={() => setShowCreateDialog(false)}
      />

      {/* 切换生效确认 */}
      {activateTargetPkg && (
        <ActivateConfirmDialog
          open={!!activateTarget}
          currentActiveName={activePackage?.name || ''}
          newPackageName={activateTargetPkg.name}
          newPackageHasDraft={activateTargetPkg.hasDraft}
          onConfirmDirect={handleActivateConfirm}
          onGoPublish={handleGoPublish}
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
