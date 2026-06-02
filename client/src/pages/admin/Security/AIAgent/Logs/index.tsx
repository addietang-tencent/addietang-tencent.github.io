/**
 * Logs/index.tsx - 审计日志占位组件
 * 该模块尚未在本仓库中实现，待后续 PR 补充。
 */
import React from 'react';
import { FileText } from 'lucide-react';

interface LogsIndexProps {
  aiAgentHostList?: any[];
  isGetAllMachinesLoading?: boolean;
  openAssetDetail?: (item: any) => void;
  isHideLogTalkTab?: boolean;
  from?: string;
  InstanceIds?: string[];
}

export default function LogsIndex(_props: LogsIndexProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FileText className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm">审计日志功能即将开放</p>
    </div>
  );
}
