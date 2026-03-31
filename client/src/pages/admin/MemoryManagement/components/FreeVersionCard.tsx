import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { EnableConfirmDialog } from './EnableConfirmDialog';
import { DisableConfirmDialog } from './DisableConfirmDialog';

/**
 * Memory Free 版本区块
 * 展示 Free 版本的功能特性、状态和启用/禁用开关
 */
export const FreeVersionCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  const features = [
    {
      emoji: '🧲',
      title: '记忆更稳定',
      description: '自动提取偏好、约束与任务状态，无需手动触发',
    },
    {
      emoji: '🔬',
      title: '理解更深刻',
      description: '四层记忆金字塔逐步提炼，从"记住你说过什么"到"理解你是谁"',
    },
    {
      emoji: '🎯',
      title: '检索更精准',
      description: '记忆分层组织、按场景归类，按需精准召回',
    },
    {
      emoji: '🔗',
      title: '跨会话不断线',
      description: '记忆跨聊天通道共享，不随上下文压缩丢失',
    },
  ];

  const handleToggleChange = (checked: boolean) => {
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
    <>
      <div className="bg-white rounded-[14px] border border-[#e8eaf0] shadow-[0_1px_4px_rgba(0,0,0,.03)] overflow-hidden mb-5">
        {/* 卡片头部 */}
        <div className="px-7 py-6 border-b border-[#f0f0f5]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <h2 className="text-[17px] font-semibold text-[#1a1a2e]">
              Memory Free 版
            </h2>
            <span className="text-xs text-[#007AFF] font-medium">由腾讯云数据库 AI 服务（TDAI）提供</span>
          </div>
          <p className="text-[13.5px] text-[#8c8ca1] leading-relaxed">
            <strong className="text-[#1a1a2e]">免费使用，一键升级</strong>——让 OpenClaw 从"能执行任务的 Agent"，进化为"持续懂你、跨会话不断线的长期可依赖 AI 助理"。
          </p>
        </div>

        {/* 功能特性网格 */}
        <div className="px-7 py-8">
          <div className="grid grid-cols-4 gap-5 mb-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[12px] bg-[#fafbfc] border border-[#e8eaf0] shadow-sm text-center hover:border-[#007AFF] hover:bg-[#f0f7ff] hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-2">{feature.title}</h3>
                <p className="text-xs text-[#8c8ca1] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* 底部 - 状态标签 + 启用按钮 */}
          <div className="pt-4 border-t border-[#f0f0f5] flex items-center justify-between">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-semibold ${
              isEnabled
                ? 'bg-[#dcfce7] text-[#166534]'
                : 'bg-[#fef3c7] text-[#92400e]'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isEnabled ? 'bg-[#16a34a]' : 'bg-[#d97706]'
              }`}></span>
              {isEnabled ? '已启用' : '未启用'}
            </div>
            <div className="scale-125 origin-right">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleChange}
                disabled={enableDialogOpen || disableDialogOpen}
              />
            </div>
          </div>
        </div>
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
    </>
  );
};
