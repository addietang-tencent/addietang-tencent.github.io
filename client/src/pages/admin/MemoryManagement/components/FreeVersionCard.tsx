import React, { useState } from 'react';
import { BenchmarkTable } from './BenchmarkTable';
import { Switch } from '@/components/ui/switch';
import { EnableConfirmDialog } from './EnableConfirmDialog';
import { DisableConfirmDialog } from './DisableConfirmDialog';

/**
 * Free 版介绍卡片
 * 
 * 包含：
 * - 卡片头部（图标 + 标题）
 * - 描述文字
 * - PersonaMem 评测结果表格
 * - 状态标签
 */
export const FreeVersionCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [pendingToggleState, setPendingToggleState] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setPendingToggleState(checked);
    if (checked) {
      setEnableDialogOpen(true);
    } else {
      setDisableDialogOpen(true);
    }
  };

  const handleEnableConfirm = () => {
    setIsEnabled(true);
    setEnableDialogOpen(false);
  };

  const handleDisableConfirm = () => {
    setIsEnabled(false);
    setDisableDialogOpen(false);
  };
  return (
    <div className="bg-white rounded-[14px] border border-[#e8eaf0] p-[24px_28px] mb-5 shadow-[0_1px_4px_rgba(0,0,0,.03)]">
      {/* 卡片头部 */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">🧠</span>
        </div>
        <h2 className="text-[17px] font-semibold text-[#1a1a2e]">
          TDAI-Memory Free 版
        </h2>
      </div>

      {/* 描述文字 */}
      <p className="text-[13.5px] text-[#8c8ca1] leading-relaxed mb-5">
        完整多层记忆能力，以插件方式安装，数据存储在 OpenClaw 实例本地，免费使用，即开即用。
      </p>

      {/* 评测结果标题 */}
      <div className="mb-3.5">
        <h3 className="text-[14px] font-semibold text-[#1a1a2e] mb-1">
          📊 PersonaMem 评测结果
        </h3>
        <p className="text-[12.5px] text-[#8c8ca1]">
          基于 20 个模拟用户画像、6462 条消息、589 道测评题
        </p>
      </div>

      {/* 评测表格 */}
      <BenchmarkTable />

      {/* 底部 - 状态标签 + 启用按钮 */}
      <div className="mt-5 pt-5 border-t border-[#f0f0f5] flex items-center justify-between">
        <span className={`inline-block px-3 py-1 rounded text-[12px] font-medium ${
          isEnabled
            ? 'bg-[#dcfce7] text-[#166534]'
            : 'bg-[#f0f0f5] text-[#8c8ca1]'
        }`}>
          {isEnabled ? '已启用' : '未启用'}
        </span>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggleChange}
          disabled={enableDialogOpen || disableDialogOpen}
        />
      </div>

      {/* 确认弹窗 */}
      <EnableConfirmDialog
        open={enableDialogOpen}
        onConfirm={handleEnableConfirm}
        onCancel={() => setEnableDialogOpen(false)}
      />
      <DisableConfirmDialog
        open={disableDialogOpen}
        onConfirm={handleDisableConfirm}
        onCancel={() => setDisableDialogOpen(false)}
      />
    </div>
  );
};
