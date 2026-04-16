import React, { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// 默认记忆版本类型
export type DefaultMemoryVersionType = 'none' | 'free' | 'pro';

interface DefaultMemoryVersionProps {
  /** 当前选中的默认版本 */
  value: DefaultMemoryVersionType;
  /** 值变化回调 */
  onChange: (value: DefaultMemoryVersionType) => void;
  /** Pro 服务是否已开通 */
  isProActive: boolean;
  /** Pro 配额是否充足 */
  isProQuotaAvailable: boolean;
}

/**
 * 新实例默认记忆版本 - 三选一分段控制器
 * 
 * 遵循 Agent Enterprise 设计规范：
 * - 品牌渐变：linear-gradient(135deg, #007AFF, #5856D6)
 * - 卡片圆角：rounded-2xl (16px)
 * - 统一阴影：通过 inline style 设置
 * - 图标：仅使用 lucide-react
 */
export const DefaultMemoryVersion: React.FC<DefaultMemoryVersionProps> = ({
  value,
  onChange,
  isProActive,
  isProQuotaAvailable,
}) => {
  // 确认弹窗状态
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<DefaultMemoryVersionType | null>(null);

  const options: { 
    key: DefaultMemoryVersionType; 
    label: string;
    disabled?: boolean;
    disabledReason?: string;
  }[] = [
    { key: 'none', label: '关闭' },
    { key: 'free', label: 'Free版' },
    { 
      key: 'pro', 
      label: 'Pro版',
      disabled: !isProActive || !isProQuotaAvailable,
      disabledReason: !isProActive 
        ? '请先开通 Pro 服务' 
        : !isProQuotaAvailable 
          ? '记忆空间不足' 
          : undefined,
    },
  ];

  const getSliderPosition = () => {
    switch (value) {
      case 'none': return 'left-0.5';
      case 'free': return 'left-[calc(33.33%+1px)]';
      case 'pro': return 'left-[calc(66.66%+2px)]';
      default: return 'left-0.5';
    }
  };

  const getSliderBg = () => {
    switch (value) {
      case 'none': return 'bg-gray-500';
      case 'free': return 'bg-blue-500';
      case 'pro': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClick = (key: DefaultMemoryVersionType, disabled?: boolean) => {
    if (disabled) return;
    if (key === value) return; // 点击当前选中项不处理
    // 打开确认弹窗
    setPendingValue(key);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      onChange(pendingValue);
    }
    setConfirmDialogOpen(false);
    setPendingValue(null);
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingValue(null);
  };

  // 获取确认弹窗的文案
  const getConfirmContent = () => {
    let title = '';
    let description = '';
    
    if (pendingValue === 'none') {
      title = '新建 Agent 默认关闭记忆';
      description = '新建 Agent 将不会自动开启记忆功能。';
    } else if (pendingValue === 'free') {
      title = '新建 Agent 默认开启「Memory Free版」';
      description = '新建 Agent 将自动开启 Free 版记忆功能。';
    } else if (pendingValue === 'pro') {
      title = '新建 Agent 默认开启「Memory Pro版」';
      description = '新建 Agent 将自动开启 Pro 版记忆功能，并消耗相应配额。';
    }

    return {
      title,
      description,
    };
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">新建 Agent 默认记忆版本</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">新建 Agent 将自动开启所选版本的记忆功能</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* 三选一分段控制器 */}
        <div className="relative inline-flex bg-gray-100 rounded-full p-0.5 w-[240px]">
          {/* 滑块背景 */}
          <div
            className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(33.33%-2px)] rounded-full transition-all duration-200 ${getSliderPosition()} ${getSliderBg()}`}
          />
          
          {/* 选项按钮 */}
          {options.map((option) => {
            const isSelected = value === option.key;
            const isDisabled = option.disabled;
            
            const button = (
              <button
                key={option.key}
                onClick={() => handleClick(option.key, option.disabled)}
                disabled={isDisabled}
                className={`
                  relative z-10 flex-1 py-1.5 text-xs font-medium rounded-full transition-colors
                  ${isSelected 
                    ? 'text-white' 
                    : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                {option.label}
              </button>
            );
            
            // 如果禁用，包装 Tooltip 提示
            if (isDisabled && option.disabledReason) {
              return (
                <Tooltip key={option.key}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{option.disabledReason}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return button;
          })}
        </div>
        
        {/* 说明文字 */}
        <span className="text-xs text-gray-400">
          {value === 'none' && '新建 Agent 不自动开启记忆'}
          {value === 'free' && '新建 Agent 自动开启 Free版'}
          {value === 'pro' && '新建 Agent 自动开启 Pro版'}
        </span>
      </div>

      {/* 确认弹窗 */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{getConfirmContent().title}</DialogTitle>
            <DialogDescription className="pt-2">
              {getConfirmContent().description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleConfirm}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
