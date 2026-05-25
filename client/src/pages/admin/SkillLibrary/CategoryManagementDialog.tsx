/**
 * CategoryManagementDialog - 标签分类管理弹窗
 * 替代原来的 CategoryManagementTab，将分类管理改为弹窗形式
 * 通过 props 共享 categories 状态，使分类筛选与分类管理保持同步
 *
 * 草稿态：所有新增 / 内联编辑 / 删除操作先在本地草稿中生效，
 *  - 点击「保存」时一次性提交到父组件
 *  - 点击「取消」或关闭弹窗时丢弃改动
 *
 * 表格内分类名称 / 描述列默认以 Input 组件展示，可直接行内编辑。
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category, Skill } from './types';
import AddCategoryDialog from './AddCategoryDialog';

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  skills: Skill[];
}

export default function CategoryManagementDialog({
  open,
  onOpenChange,
  categories,
  setCategories,
  skills,
}: CategoryManagementDialogProps) {
  // 弹窗内的草稿状态：保存前所有改动只在本地生效
  const [draftCategories, setDraftCategories] = useState<Category[]>(categories);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 弹窗每次打开时，把最新的父级 categories 同步到草稿
  useEffect(() => {
    if (open) {
      setDraftCategories(categories);
    }
  }, [open, categories]);

  // 计算每个分类下的技能数量
  const getSkillCountByCategory = (categoryId: string) => {
    return skills.filter((skill: any) => skill.categories.includes(categoryId)).length;
  };

  const handleAddCategory = (newCategory: Category) => {
    setDraftCategories(prev => [...prev, newCategory]);
    setAddDialogOpen(false);
  };

  const updateCategoryField = (id: string, field: 'name' | 'description', value: string) => {
    setDraftCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, [field]: value } : cat)),
    );
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setDraftCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
    }
  };

  const openDeleteConfirm = (category: Category) => {
    setSelectedCategory(category);
    setDeleteConfirmOpen(true);
  };

  const handleCancel = () => {
    // 丢弃草稿态：关闭后会通过 useEffect 重新同步
    onOpenChange(false);
  };

  const handleSave = () => {
    // 保存前校验：分类名称不能为空，且不能重复
    const trimmed = draftCategories.map(cat => ({ ...cat, name: cat.name.trim() }));
    const hasEmpty = trimmed.some(cat => !cat.name);
    if (hasEmpty) {
      toast.error('分类名称不能为空');
      return;
    }
    const nameSet = new Set<string>();
    for (const cat of trimmed) {
      if (nameSet.has(cat.name)) {
        toast.error(`存在重复的分类名称：${cat.name}`);
        return;
      }
      nameSet.add(cat.name);
    }
    setCategories(trimmed);
    toast.success('标签分类已保存');
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) handleCancel();
          else onOpenChange(true);
        }}
      >
        <DialogContent className="sm:max-w-[960px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>标签分类管理</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-start mb-4">
            <Button variant="claw-outline" size="claw-sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              新增分类
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0A0A0A] whitespace-nowrap w-16">序号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0A0A0A] whitespace-nowrap" style={{ width: '240px' }}>分类名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">描述</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0A0A0A] whitespace-nowrap w-24">技能数量</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0A0A0A] whitespace-nowrap w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {draftCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#737373]">
                      暂无分类，点击右上角「新增分类」开始添加
                    </td>
                  </tr>
                ) : (
                  draftCategories.map((category, index) => (
                    <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50/60 last:border-0">
                      <td className="px-4 py-3 text-sm text-[#0A0A0A] align-middle">{index + 1}</td>
                      <td className="px-4 py-3 align-middle">
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategoryField(category.id, 'name', e.target.value)}
                          placeholder="请输入分类名称"
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Input
                          value={category.description || ''}
                          onChange={(e) => updateCategoryField(category.id, 'description', e.target.value)}
                          placeholder="请输入分类描述"
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#737373] align-middle">{getSkillCountByCategory(category.id)}</td>
                      <td className="px-4 py-3 text-sm align-middle">
                        <button
                          onClick={() => openDeleteConfirm(category)}
                          className="text-[#A3A3A3] hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="claw-outline" size="claw-sm" onClick={handleCancel}>
              取消
            </Button>
            <Button variant="dialog-confirm" size="claw-sm" onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增分类弹窗 */}
      <AddCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onConfirm={handleAddCategory}
        existingCategories={draftCategories}
      />

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#d42a1e]">删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类「{selectedCategory?.name}」吗？该分类下共有 {selectedCategory ? getSkillCountByCategory(selectedCategory.id) : 0} 个技能，删除此分类后对应 skill 将移除该分类。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className={buttonVariants({ variant: 'destructive' })}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
