import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog';
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
      <DialogContent
        className="sm:max-w-md"
        style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader>
          <DialogTitle>修改分类</DialogTitle>
          {skillName && (
            <p className="text-sm text-[#737373] mt-2">请选择 {skillName} Skill 的分类</p>
          )}
        </DialogHeader>

        <DialogBody className="flex-1">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <Button key={cat.id} variant="plain" size="sm" data-state={isSelected ? "active" : undefined} onClick={() => handleToggleCategory(cat.id)}>
                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    {cat.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogBody>

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
