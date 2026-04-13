/**
 * 编辑应用范围弹窗
 * - 一行内：全部用户 / 按分组 胶囊按钮 + 按分组时右侧下拉多选
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Users, ChevronDown, Search, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type SkillScope, type Group } from './types';

interface EditScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: Group[];
  currentScope: SkillScope;
  currentGroupIds: string[];
  skillName?: string;
  onConfirm: (scope: SkillScope, groupIds: string[]) => void;
}

export default function EditScopeDialog({
  open,
  onOpenChange,
  groups,
  currentScope,
  currentGroupIds,
  skillName,
  onConfirm,
}: EditScopeDialogProps) {
  const [scope, setScope] = useState<SkillScope>('public');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setScope(currentScope);
      setSelectedGroupIds([...currentGroupIds]);
      setSearchQuery('');
    }
  }, [open, currentScope, currentGroupIds]);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleConfirm = () => {
    onConfirm(scope, scope === 'public' ? [] : selectedGroupIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const selectedGroupNames = groups
    .filter(g => selectedGroupIds.includes(g.id))
    .map(g => g.name);

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改应用范围</DialogTitle>
          {skillName && (
            <p className="text-sm text-gray-600 mt-2">请设置 {skillName} Skill 的应用范围</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* 一行：范围切换 + 下拉 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScope('public')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                scope === 'public'
                  ? 'bg-blue-50 text-blue-600 font-medium border-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              全部用户
            </button>
            <button
              onClick={() => setScope('private')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                scope === 'private'
                  ? 'bg-blue-50 text-blue-600 font-medium border-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              按分组
            </button>

            {scope === 'private' && (
              <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                <Tooltip delayDuration={1000} open={groupPopoverOpen ? false : undefined}>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors max-w-[200px]">
                          <span className="truncate text-left">
                            {selectedGroupIds.length === 0
                              ? '选择分组'
                              : selectedGroupNames.join('、')}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-white text-gray-700 text-xs border border-gray-200 shadow-sm max-w-[280px]">
                      <p className="break-words">
                        {selectedGroupIds.length === 0
                          ? '选择分组'
                          : selectedGroupNames.join('、')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                <PopoverContent className="w-52 p-2" align="start" sideOffset={4}>
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      placeholder="搜索分组..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 h-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {filteredGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleToggleGroup(group.id)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selectedGroupIds.includes(group.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedGroupIds.includes(group.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="truncate text-left" title={group.name}>{group.name}</span>
                      </button>
                    ))}
                    {filteredGroups.length === 0 && (
                      <p className="text-xs text-gray-400 py-2 text-center">没有匹配的分组</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={scope === 'private' && selectedGroupIds.length === 0}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
