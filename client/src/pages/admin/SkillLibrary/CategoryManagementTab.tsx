import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from './types';
import { DEFAULT_CATEGORIES } from './mockData';
import AddCategoryDialog from './AddCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';

export default function CategoryManagementTab() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const openDeleteConfirm = (category: Category) => {
    setSelectedCategory(category);
    setDeleteConfirmOpen(true);
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
              <div className="bg-white rounded-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">删除分类</h3>
                <p className="text-sm text-gray-600 mb-4">
                  该分类下共有 0 个技能，请谨慎操作。
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOpen(false)}
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
