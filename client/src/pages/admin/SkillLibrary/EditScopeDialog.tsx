/**
 * 编辑应用范围 Popover 气泡
 * 基于通用 ScopeEditPopover 封装，适配技能库类型
 */
import { ScopeEditPopover, type ScopeType } from '@/components/ScopeEditPopover';
import { type SkillScope, type Group } from './types';

interface EditScopePopoverProps {
  groups: Group[];
  currentScope: SkillScope;
  currentGroupIds: string[];
  onConfirm: (scope: SkillScope, groupIds: string[]) => void;
  /** 应用范围展示标签 */
  scopeLabels: string[];
  /** 是否是 public 范围 */
  isPublic: boolean;
}

export default function EditScopePopover({
  groups,
  currentScope,
  currentGroupIds,
  onConfirm,
  scopeLabels,
}: EditScopePopoverProps) {
  const mapScope = (s: SkillScope): ScopeType => (s === "public" ? "all" : "groups");
  const reverseScope = (s: ScopeType): SkillScope => (s === "all" ? "public" : "private");

  return (
    <ScopeEditPopover
      scope={mapScope(currentScope)}
      selectedGroupIds={currentGroupIds}
      groups={groups}
      scopeLabels={scopeLabels}
      showBadges={true}
      onConfirm={(scope, groupIds) => {
        onConfirm(reverseScope(scope), groupIds);
      }}
    />
  );
}
