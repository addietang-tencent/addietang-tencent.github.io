import React, { useState, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, Brain, Search, Link2, Layers, CheckCircle2, Loader2, Info, AlertTriangle, AlertOctagon } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: '记忆更稳定', desc: '自动记住你的偏好和习惯，无需手动设置', color: '#007AFF' },
  { icon: Layers, title: '理解更深刻', desc: '不只记住你说过什么，更理解你是谁、你想要什么', color: '#7C3AED' },
  { icon: Search, title: '检索更精准', desc: '需要时精准找到相关记忆，减少重复沟通', color: '#F59E0B' },
  { icon: Link2, title: '跨会话不断线', desc: '换个聊天窗口也不会忘记之前的对话', color: '#16A34A' },
];

// 开启步骤
const ENABLE_STEPS = [
  '启动开启任务',
  '执行进度',
  '检查执行结果',
  '完成',
];

// 关闭步骤
const DISABLE_STEPS = [
  '启动关闭任务',
  '执行进度',
  '检查执行结果',
  '完成',
];

const TOTAL_INSTANCES = 42; // mock 总实例数

export const FreeVersionCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  // 确认弹窗
  const [confirmType, setConfirmType] = useState<'enable' | 'disable' | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // 进度弹窗
  const [showProgress, setShowProgress] = useState(false);
  const [progressType, setProgressType] = useState<'enable' | 'disable'>('enable');
  const [stepsDone, setStepsDone] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = progressType === 'enable' ? ENABLE_STEPS : DISABLE_STEPS;

  const handleToggleChange = (checked: boolean) => {
    setConfirmType(checked ? 'enable' : 'disable');
    setConfirmChecked(false);
  };

  const handleConfirm = () => {
    const type = confirmType!;
    setConfirmType(null);
    setConfirmChecked(false);
    setProgressType(type);
    setStepsDone(0);
    setProgressCount(0);
    setResultCount(0);
    setIsRunning(true);
    setShowProgress(true);

    // 模拟 4 步进度
    let done = 0;
    let progress = 0;
    let result = 0;

    const runNext = () => {
      if (done >= 4) {
        setIsRunning(false);
        setIsEnabled(type === 'enable');
        toast.success(type === 'enable' ? '记忆功能已开启' : '记忆功能已关闭');
        return;
      }

      const delay = 800 + Math.random() * 1500;
      timerRef.current = setTimeout(() => {
        done += 1;
        setStepsDone(done);

        // Step 2: 模拟执行进度
        if (done === 2) {
          progress = TOTAL_INSTANCES;
          setProgressCount(progress);
        }
        // Step 3: 模拟检查结果
        if (done === 3) {
          result = TOTAL_INSTANCES;
          setResultCount(result);
        }

        runNext();
      }, delay);
    };
    runNext();
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const getStepLabel = (step: string, idx: number) => {
    if (idx === 1) return `${step} ${progressCount}/${TOTAL_INSTANCES} 台`;
    if (idx === 2) return `${step}，成功 ${resultCount}/${TOTAL_INSTANCES} 台`;
    return step;
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="p-7">
          {/* Header — 标题 + 开关同一行 */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Memory Free 版</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isEnabled ? '#16A34A' : '#d0d0e0' }}
                />
                <span className={`text-sm font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {isEnabled ? '已启用' : '未启用'}
                </span>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleChange}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6 ml-12">
            基于实例本地存储，自动提取对话记忆，跨会话精准召回，免费即开即用。
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-4 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-center hover:border-gray-200 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ background: `${f.color}12` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 确认弹窗 — 开启 */}
      <Dialog open={confirmType === 'enable'} onOpenChange={(o) => { if (!o) setConfirmType(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>开启 Memory Free 版</DialogTitle>
            <DialogDescription className="sr-only">确认开启记忆功能</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700 leading-relaxed space-y-1">
                <p>• 新创建的 OpenClaw 实例将<strong>默认安装并启用</strong>记忆插件。</p>
                <p>• 所有现有实例将<strong>自动安装</strong>此插件，安装过程需重启 Gateway 服务。</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                安装过程中 Gateway 服务将重启，<strong>服务短暂中断（约 1 分钟/实例）</strong>，建议避开业务高峰期。
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-600">我已了解上述说明，确认开启</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmType(null)}>取消</Button>
            <Button onClick={handleConfirm} disabled={!confirmChecked} className="text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
              确认开启
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认弹窗 — 关闭 */}
      <Dialog open={confirmType === 'disable'} onOpenChange={(o) => { if (!o) setConfirmType(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>关闭 Memory Free 版</DialogTitle>
            <DialogDescription className="sr-only">确认关闭记忆功能</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed space-y-1">
                <p>• 新创建的实例将<strong>不再默认启用</strong>记忆功能。</p>
                <p>• 所有现有实例的记忆插件将被<strong>禁用</strong>（插件保留，但停止工作）。</p>
                <p>• 已有记忆数据不会删除，重新开启后可恢复。</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertOctagon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-800 leading-relaxed">
                关闭后所有实例将<strong>立即失去记忆能力</strong>，请务必提前通知用户。
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="w-4 h-4 rounded accent-red-600" />
              <span className="text-sm text-gray-600">我已了解上述说明，确认关闭</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmType(null)}>取消</Button>
            <Button onClick={handleConfirm} disabled={!confirmChecked} className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
              确认关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 执行进度弹窗 */}
      <Dialog open={showProgress} onOpenChange={(o) => { if (!o && !isRunning) handleCloseProgress(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {progressType === 'enable' ? '正在开启记忆功能' : '正在关闭记忆功能'}
            </DialogTitle>
            <DialogDescription className="sr-only">执行进度</DialogDescription>
          </DialogHeader>
          <div className="mt-1 space-y-2.5 py-1 pb-3">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isDone = stepsDone >= stepNum;
              const isActive = stepsDone === idx;
              return (
                <div key={step} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <span className={`text-sm ${
                    isDone ? 'text-gray-600' : isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}>
                    [步骤{stepNum}] {getStepLabel(step, idx)}
                  </span>
                </div>
              );
            })}
          </div>
          {!isRunning && (
            <DialogFooter>
              <Button onClick={handleCloseProgress} className="text-white" style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}>
                完成
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
