import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from './types';
import { DEFAULT_CATEGORIES } from './mockData';
import AddCategoryDialog from './AddCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CategoryManagementTab() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newCategoryForSkills, setNewCategoryForSkills] = useState<string>('');

  const handleAddCategory = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
    setAddDialogOpen(false);
  };

  const handleEditCategory = (updatedCategory: Category) => {
    setCategories(categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    setEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
      setNewCategoryForSkills('');
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const openDeleteConfirm = (category: Category) => {
    setSelectedCategory(category);
    setDeleteConfirmOpen(true);
    setNewCategoryForSkills('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">分类管理</h2>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增分类
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">序号</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">分类名称</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">描述</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{category.description}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(category)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(category)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onConfirm={handleAddCategory}
        existingCategories={categories}
      />

      {selectedCategory && (
        <>
          <EditCategoryDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            category={selectedCategory}
            onConfirm={handleEditCategory}
          />

          {/* 删除确认对话框 */}
          {deleteConfirmOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">删除分类</h3>
                <p className="text-sm text-gray-600 mb-4">
                  该分类下共有 0 个技能，删除此分类后对应skill将移除该分类，可选择为对应skill增加新分类。
                </p>

                {/* 新分类选择 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">
                    新分类（可选）
                  </Label>
                  <Select value={newCategoryForSkills} onValueChange={setNewCategoryForSkills}>
                    <SelectTrigger className="w-full bg-white border border-gray-200">
                      <SelectValue placeholder="选择新分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.id !== selectedCategory?.id)
                        .map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setNewCategoryForSkills('');
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteCategory}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
