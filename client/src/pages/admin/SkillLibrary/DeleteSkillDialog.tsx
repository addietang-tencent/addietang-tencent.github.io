/**
 * 删除 Skill 确认对话框（F-04）
 * - 被技能包引用时，列出包名称 + 警告
 * - 无引用时，简洁确认
 * - 使用 AlertDialog 实现危险操作确认
 *
 * 遵循项目标准警示弹窗规范：
 *  - 标题使用黑色（#0A0A0A）
 *  - 正文普通文字使用黑色
 *  - 强调文字使用告警色 #d42a1e
 *  - 警示信息使用 Alert destructive 变体（带 AlertTriangle 图标）
 *  - 主按钮使用 destructive variant（红底白字）
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  /** 引用了该 Skill 的技能包名称列表 */
  referencedPackages?: string[];
  onConfirm: () => void;
}

export default function DeleteSkillDialog({
  open,
  onOpenChange,
  skillName,
  referencedPackages = [],
  onConfirm,
}: DeleteSkillDialogProps) {
  const hasReferences = referencedPackages.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#0A0A0A]">确认删除</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {hasReferences ? (
                <>
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">该 Skill 被以下技能包引用：</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {referencedPackages.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-[#0A0A0A]">
                    删除后将自动从上述技能包中移除该技能。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#0A0A0A]">
                    确定要删除 Skill「<span className="font-medium text-[#d42a1e]">{skillName}</span>」吗？
                  </p>
                  <p className="text-sm font-medium text-[#d42a1e]">此操作不可撤销。</p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: 'destructive' })}
          >
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
