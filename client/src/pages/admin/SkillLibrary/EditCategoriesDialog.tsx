import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Category } from './types';

interface EditCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategoryIds: string[];
  skillName?: string;
  onConfirm: (selectedCategoryIds: string[]) => void;
}

export default function EditCategoriesDialog({
  open,
  onOpenChange,
  categories,
  selectedCategoryIds,
  skillName,
  onConfirm,
}: EditCategoriesDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected(selectedCategoryIds);
    }
  }, [open, selectedCategoryIds]);

  const handleToggleCategory = (categoryId: string) => {
    setSelected(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改分类</DialogTitle>
          {skillName && (
            <p className="text-sm text-gray-600 mt-2">请选择 {skillName} Skill 的分类</p>
          )}
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selected.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                      : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="dialog-confirm" onClick={handleConfirm}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
