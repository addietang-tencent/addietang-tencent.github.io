import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OcInstance } from './InstanceTable';

// 一键升级：异步任务模型
//   打开弹窗 → 异步检测当前企业下需要升级的实例
//   - 检测中：loading 态
//   - 有可升级实例：展示数量 + 列表 + 影响说明 + 二次确认
//   - 全部已是最新：友好提示，用户关闭即可
//   用户点"确认升级"后，弹窗立即关闭，任务在后台异步执行；
//   实例的升级进度通过列表"记忆管理"列的「插件升级中」loading 体现，
//   完成后列表自动回到稳态。本弹窗不再承载进度态 / 结果汇总。

interface OneClickUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 当前企业下所有"已开启记忆服务且未处于升级中"的候选实例。
  // 控制台不预判哪些真的需要升级——该判断由后端在升级动作发起后完成。
  // 本组件打开时会对这个集合进行一次异步"检测"，按结果呈现不同状态。
  candidateInstances: OcInstance[];
  // 异步提交升级任务。返回后弹窗立即关闭，不再等待任务执行结果。
  onConfirm: (targets: OcInstance[]) => void | Promise<void>;
}

type DetectStatus = 'detecting' | 'has-upgradable' | 'all-latest';

export const OneClickUpgradeDialog: React.FC<OneClickUpgradeDialogProps> = ({
  open,
  onOpenChange,
  candidateInstances,
  onConfirm,
}) => {
  const [status, setStatus] = useState<DetectStatus>('detecting');
  const [upgradableInstances, setUpgradableInstances] = useState<OcInstance[]>([]);
  const [expanded, setExpanded] = useState(false);

  // 每次打开弹窗都重新检测
  useEffect(() => {
    if (!open) {
      setStatus('detecting');
      setUpgradableInstances([]);
      setExpanded(false);
      return;
    }

    // Mock：异步检测（真实场景由后端返回"需要升级的实例清单"）
    // 为了让开发预览能稳定看到"有可升级"主路径，这里采用确定性挑选：
    //   - 候选集为空 → 全部最新
    //   - 候选集非空 → 取前 60%（至少 1 个）作为需要升级
    // 真实接入时整段替换为后端检测接口即可。
    setStatus('detecting');
    const timer = setTimeout(() => {
      if (candidateInstances.length === 0) {
        setUpgradableInstances([]);
        setStatus('all-latest');
        return;
      }
      const pickCount = Math.max(
        1,
        Math.round(candidateInstances.length * 0.6)
      );
      const picked = candidateInstances.slice(0, pickCount);
      setUpgradableInstances(picked);
      setStatus('has-upgradable');
    }, 800);

    return () => clearTimeout(timer);
  }, [open, candidateInstances]);

  const pendingCount = upgradableInstances.length;

  // 列表是否默认展开：≤5 个时直接展开，否则收起
  useEffect(() => {
    if (status === 'has-upgradable') {
      setExpanded(pendingCount > 0 && pendingCount <= 5);
    }
  }, [status, pendingCount]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (pendingCount === 0) {
      onOpenChange(false);
      return;
    }
    // 异步下发任务：立即关闭弹窗，由上层负责 toast 提示与实例状态切换
    onConfirm(upgradableInstances);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg w-[520px] max-w-[92vw] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">一键升级</h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* ========== 状态 1：检测中 ========== */}
          {status === 'detecting' && (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">正在检测需要升级的实例...</p>
              <p className="text-xs text-gray-400">请稍候</p>
            </div>
          )}

          {/* ========== 状态 2：全部已是最新 ========== */}
          {status === 'all-latest' && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                当前所有记忆服务实例均为最新版本
              </p>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[360px]">
                您无需进行任何操作。Pro 版实例（OpenClaw 类型）已具备短期记忆压缩能力。
              </p>
            </div>
          )}

          {/* ========== 状态 3：有可升级实例 ========== */}
          {status === 'has-upgradable' && (
            <>
              <p className="text-sm text-gray-600 leading-relaxed">
                检测到 <span className="font-semibold text-blue-600">{pendingCount}</span> 个记忆服务实例可升级至最新版本，升级后 <span className="font-medium text-gray-900">OpenClaw 类型 Pro 实例</span>可使用短期记忆压缩能力。
              </p>

              {/* 待升级实例详情（可折叠） */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    查看待升级实例详情（{pendingCount}）
                  </span>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expanded && (
                  <ul className="border-t border-gray-100 max-h-44 overflow-y-auto divide-y divide-gray-50">
                    {upgradableInstances.map(i => {
                      const agentType = i.agentType ?? 'openclaw';
                      const isHermes = agentType === 'hermes';
                      return (
                        <li
                          key={i.id}
                          className="px-4 py-2 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-gray-800 truncate">
                              {i.name}
                            </span>
                            <span
                              className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isHermes
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}
                            >
                              {isHermes ? 'Hermes' : 'OpenClaw'}
                            </span>
                            <span
                              className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                i.memoryStatus === 'pro'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-gray-50 text-gray-700 border border-gray-100'
                              }`}
                            >
                              {i.memoryStatus === 'pro' ? 'Pro' : 'Free'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {i.id}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 影响说明 —— 只讲操作本身的副作用与边界 */}
              <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-amber-800">升级影响说明</span>
                </div>
                <ul className="space-y-1.5 pl-6 text-xs text-amber-800 leading-relaxed list-disc">
                  <li>升级过程中，对应实例的 Gateway 服务会有短暂中断（约 10–30 秒）</li>
                  <li>升级任务将在后台异步执行，执行期间实例将暂时锁定相关操作</li>
                  <li>本次升级仅升级记忆服务版本，不改变 Free / Pro 版本档位</li>
                  <li>正在进行记忆读写的会话可能需要重试</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          {status === 'has-upgradable' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <ArrowUpCircle className="w-4 h-4" />
                确认升级 {pendingCount} 个实例
              </button>
            </>
          )}
          {status === 'all-latest' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-blue-500 hover:bg-blue-600"
            >
              我知道了
            </button>
          )}
          {status === 'detecting' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneClickUpgradeDialog;
