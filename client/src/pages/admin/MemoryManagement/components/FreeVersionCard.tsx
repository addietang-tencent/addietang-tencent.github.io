import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Zap, Info, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react';
import { RadarWidget } from './RadarWidget';

// 评测数据
const BENCHMARK_DATA = [
  { label: '记住变化原因', tip: '知道你为什么改了主意', native: 70.97, free: 88.89, improvement: 25.25 },
  { label: '记住你说过的事', tip: '你提过的信息不会忘', native: 29.63, free: 79.07, improvement: 166.86 },
  { label: '记住关键信息', tip: '准确回忆对话中的事实', native: 25.00, free: 76.47, improvement: 205.88 },
  { label: '个性化推荐', tip: '基于你的习惯给出建议', native: 46.67, free: 76.36, improvement: 63.62 },
  { label: '跨场景理解', tip: '工作聊的事，生活场景也能用', native: 31.58, free: 78.95, improvement: 150.00 },
  { label: '跟踪偏好变化', tip: '你的喜好变了，它跟着变', native: 66.67, free: 83.45, improvement: 25.17 },
  { label: '创意启发', tip: '基于了解你给出新点子', native: 24.00, free: 45.16, improvement: 88.17 },
];

const TOTAL = { native: 47.85, free: 76.10, improvement: 59.04 };

// 动画计数器
function AnimatedCounter({
  value,
  duration = 1500,
  decimals = 2,
  suffix = '%',
  delay = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now() + delay;
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(eased * value);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// 紧凑维度行 — 单行双条形
function DimensionRow({
  data,
  index,
  isEnabled,
  radarHovered,
  waitingForExpand,
}: {
  data: (typeof BENCHMARK_DATA)[0];
  index: number;
  isEnabled: boolean;
  radarHovered: boolean;
  waitingForExpand: boolean;
}) {
  return (
    <div className="group">
      {/* Label row */}
      <div className="flex items-center justify-between mb-0.5">
        <span
          className="text-sm truncate transition-colors duration-300"
          style={{ color: radarHovered ? '#374151' : '#6b7280' }}
        >
          {data.label}
        </span>
        <AnimatePresence>
          {radarHovered && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ delay: index * 0.03 }}
              className="text-[11px] font-semibold text-green-600 ml-2 flex-shrink-0"
            >
              +{data.improvement.toFixed(0)}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Dual bars stacked */}
      <div className="space-y-[2px]">
        {/* OpenClaw bar */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-[4px] rounded-full overflow-hidden bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ background: '#d0d0e0', width: `${data.native}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-gray-400 w-[34px] text-right flex-shrink-0">
            {data.native.toFixed(0)}%
          </span>
        </div>

        {/* Free bar — progressive reveal */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-[4px] rounded-full overflow-hidden bg-gray-100 relative">
            {/* Ghost dashed (idle) — 不在等待展开期间显示 */}
            {!radarHovered && !waitingForExpand && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, rgba(0,122,255,0.12) 0px, rgba(0,122,255,0.12) 3px, transparent 3px, transparent 6px)',
                  width: `${data.free}%`,
                }}
              />
            )}
            {/* Solid bar (hovered/expanded) */}
            <motion.div
              className="h-full rounded-full relative z-10"
              style={{
                background: isEnabled
                  ? 'linear-gradient(90deg, #007AFF, #5856D6)'
                  : 'linear-gradient(90deg, #93b8f0, #a8b5e0)',
                boxShadow: radarHovered && isEnabled ? '0 0 6px rgba(0,122,255,0.25)' : 'none',
              }}
              initial={false}
              animate={{ width: radarHovered ? `${data.free}%` : '0%' }}
              transition={{
                delay: radarHovered ? 0.06 + index * 0.03 : 0,
                duration: radarHovered ? 0.4 : 0,
                ease: 'easeOut',
              }}
            />
          </div>
          <span
            className="text-[11px] font-mono font-semibold w-[34px] text-right flex-shrink-0 transition-colors duration-300"
            style={{ color: radarHovered ? '#007AFF' : 'rgba(0,122,255,0.25)' }}
          >
            {radarHovered ? `${data.free.toFixed(0)}%` : '??%'}
          </span>
        </div>
      </div>
    </div>
  );
}

export const FreeVersionCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    try { return localStorage.getItem('memory-free-enabled') === 'true'; } catch { return false; }
  });
  const [radarHovered, setRadarHovered] = useState(false);
  // 启用后进入页面时，延迟自动展开（复现 hover 动画）
  const [autoExpanded, setAutoExpanded] = useState(false);

  // 持久化启用状态
  useEffect(() => {
    try { localStorage.setItem('memory-free-enabled', String(isEnabled)); } catch {}
  }, [isEnabled]);

  // 启用状态下，页面挂载后延迟触发展开动画
  useEffect(() => {
    if (isEnabled) {
      const timer = setTimeout(() => setAutoExpanded(true), 600);
      return () => clearTimeout(timer);
    } else {
      setAutoExpanded(false);
    }
  }, [isEnabled]);
  const [confirmType, setConfirmType] = useState<'enable' | 'disable' | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setConfirmType(checked ? 'enable' : 'disable');
    setConfirmChecked(false);
  };

  const handleConfirm = () => {
    const type = confirmType!;
    setConfirmType(null);
    setConfirmChecked(false);
    setIsEnabled(type === 'enable');
    toast.success(
      type === 'enable'
        ? '已开启 Memory Free 版，正在为所有实例开启记忆插件'
        : '已关闭 Memory Free 版'
    );
  };

  const handleRadarHover = useCallback((h: boolean) => {
    setRadarHovered(h);
  }, []);

  // 启用后自动展开数据，无需 hover（autoExpanded 延迟触发，有动画效果）
  const showExpanded = autoExpanded || radarHovered;

  return (
    <>
      <div
        className="bg-white rounded-2xl border overflow-hidden mb-5 transition-all duration-500"
        style={{
          boxShadow: showExpanded
            ? '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          borderColor: showExpanded ? 'rgba(0,122,255,0.2)' : 'rgba(229,231,235,1)',
        }}
      >
        <div className="p-7">
          {/* Header: 图标 + 标题 + 开关 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Memory Free 版</h2>
                <p className="text-xs text-gray-400">基于实例本地存储，自动提取对话记忆，跨会话精准召回，免费即开即用。</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isEnabled ? '#16A34A' : '#d0d0e0' }}
                />
                <span className={`text-sm font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {isEnabled ? '已启用' : '未启用'}
                </span>
              </div>
              <Switch checked={isEnabled} onCheckedChange={handleToggleChange} />
            </div>
          </div>

          {/* 主体：左侧雷达图 + 右侧内容 */}
          <div className="flex gap-4">
            {/* 左侧：雷达图 — 垂直居中，固定宽度给足空间 */}
            <div className="w-[528px] flex-shrink-0 flex flex-col items-center justify-center">
              <RadarWidget hovered={showExpanded} onHoverChange={handleRadarHover} />

              {/* 图例 */}
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-400">OpenClaw 原生</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
                  />
                  <span className="text-xs text-gray-400">Memory Free 版</span>
                </div>
              </div>

              {/* Idle hint */}
              <AnimatePresence>
                {!showExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2"
                  >
                    <motion.p
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-xs text-blue-400"
                    >
                      悬停雷达图查看对比详情
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 右侧：总分 + 维度卡片 */}
            <div className="flex-1 min-w-0">
              {/* 总分对比 Hero */}
              <div className="flex items-center gap-4 mb-5">
                {/* 原生分数 */}
                <div className="flex-1 text-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">OpenClaw 原生</p>
                  <p className="text-2xl font-bold text-gray-400 font-mono">
                    <AnimatedCounter value={TOTAL.native} delay={200} duration={1800} />
                  </p>
                </div>

                {/* VS */}
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">VS</span>
                </div>

                {/* Free 版分数 */}
                <div
                  className="flex-1 text-center px-4 py-3 rounded-xl border transition-all duration-500"
                  style={{
                    background: showExpanded ? 'rgba(0,122,255,0.04)' : 'rgba(0,122,255,0.02)',
                    borderColor: showExpanded ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.08)',
                  }}
                >
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#007AFF' }}>
                    Memory Free 版
                  </p>
                  <p className="text-2xl font-bold font-mono transition-colors duration-300" style={{ color: showExpanded ? '#007AFF' : '#c7d2fe' }}>
                    {showExpanded ? (
                      <AnimatedCounter value={TOTAL.free} delay={0} duration={800} />
                    ) : (
                      '??%'
                    )}
                  </p>
                </div>

                {/* 提升徽章 */}
                <AnimatePresence>
                  {showExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex-shrink-0"
                    >
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
                        <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          +<AnimatedCounter value={TOTAL.improvement} delay={200} duration={1000} decimals={1} />
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7 个维度对比 — 紧凑行内条形 */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/30 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">各维度记忆能力对比</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <span className="text-[11px] text-gray-400">原生</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: '#007AFF' }} />
                      <span className="text-[11px] text-gray-400">Free 版</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {BENCHMARK_DATA.map((d, i) => (
                    <DimensionRow
                      key={d.label}
                      data={d}
                      index={i}
                      isEnabled={isEnabled}
                      radarHovered={showExpanded}
                      waitingForExpand={isEnabled && !autoExpanded}
                    />
                  ))}
                </div>
              </div>
            </div>
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
                <p>• 新创建的 OpenClaw 实例将<strong>默认开启</strong>记忆插件。</p>
                <p>• 所有现有实例将<strong>自动开启</strong>此插件，整个过程将持续数分钟至数十分钟，具体时长取决于实例数量，建议避开业务高峰期操作。</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-gray-600">我已了解上述说明，确认开启</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmType(null)}>
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!confirmChecked}
              className="text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)' }}
            >
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
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600"
              />
              <span className="text-sm text-gray-600">我已了解上述说明，确认关闭</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmType(null)}>
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!confirmChecked}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              确认关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};
