/**
 * TokensMonitor - 管控端 Tokens 监控页
 * 设计风格：与整体管控台保持一致，浅色卡片 + 蓝紫渐变强调色
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ChevronLeft, ChevronRight, Info, AlertCircle, ArrowUpRight, BarChart3, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OpenClawCombobox } from "@/components/OpenClawCombobox";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// ─── 工具函数 ────────────────────────────────────────────────────────────────
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return toDateStr(new Date());
}
function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}
function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}
function fmt(n: number) { return n.toLocaleString(); }

// ─── Mock 数据生成 ────────────────────────────────────────────────────────────
// 生成最近 60 天每天的数据
const DAYS_HISTORY = 60;
const BASE_DATE = addDays(todayStr(), -(DAYS_HISTORY - 1));

const MEMBERS = [
  "alice@acompany.com",
  "bob@acompany.com",
  "carol@acompany.com",
  "dave@acompany.com",
  "eve@acompany.com",
  "frank@acompany.com",
  "grace@acompany.com",
  "henry@acompany.com",
  "ivy@acompany.com",
  "jack@acompany.com",
  "karen@acompany.com",
  "leo@acompany.com",
];

const MODELS = [
  "腾讯云 DeepSeek (V3 0324)",
  "腾讯云混元 (Turbo)",
  "腾讯云 DeepSeek (R1)",
  "腾讯云混元 (Pro)",
];

// 每天每用户的 mock 数据
function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

interface DayRecord {
  date: string;
  memberId: string;
  modelName: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

const ALL_RECORDS: DayRecord[] = [];
for (let i = 0; i < DAYS_HISTORY; i++) {
  const date = addDays(BASE_DATE, i);
  MEMBERS.forEach((memberId, mi) => {
    MODELS.forEach((modelName, moi) => {
      const rand = seedRand(i * 1000 + mi * 100 + moi);
      const requests = Math.floor(rand() * 80 + 5);
      const inputTokens = Math.floor(rand() * 15000 + 2000);
      const outputTokens = Math.floor(rand() * 12000 + 1500);
      ALL_RECORDS.push({ date, memberId, modelName, requests, inputTokens, outputTokens });
    });
  });
}

// 今日全局配额（固定）
// 注意：GLOBAL_LIMIT 为 null 表示无限制
const TODAY_RECORDS = ALL_RECORDS.filter((r) => r.date === todayStr());
const TODAY_TOTAL_TOKENS = TODAY_RECORDS.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);

// ─── 进度条 ───────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, showTooltip, isUnlimited }: { value: number; max: number | null; showTooltip?: boolean; isUnlimited?: boolean }) {
  if (isUnlimited || max === null) {
    // 无限制时显示浅灰色进度条，不显示进度
    const bar = (
      <div className="w-full bg-gray-100 rounded-full h-1.5 cursor-default">
        <div className="h-1.5 rounded-full bg-gray-300 transition-all" style={{ width: "0%" }} />
      </div>
    );
    if (!showTooltip) return bar;
    return (
      <UITooltip>
        <UITooltipTrigger asChild>
          {bar}
        </UITooltipTrigger>
        <UITooltipContent side="bottom" className="text-xs font-medium">
          已消耗 {value.toLocaleString()} Tokens（无限制）
        </UITooltipContent>
      </UITooltip>
    );
  }
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-blue-500";
  const bar = (
    <div className="w-full bg-gray-100 rounded-full h-1.5 cursor-default">
      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
  if (!showTooltip) return bar;
  return (
    <UITooltip>
      <UITooltipTrigger asChild>
        {bar}
      </UITooltipTrigger>
      <UITooltipContent side="bottom" className="text-xs font-medium">
        {value.toLocaleString()} / {max.toLocaleString()} Tokens
      </UITooltipContent>
    </UITooltip>
  );
}

// ─── 翻页组件 ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safe = Math.min(page, totalPages);
  if (totalPages <= 1) return (
    <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">共 {total} 条记录</div>
  );
  return (
    <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
      <span className="text-xs text-gray-400">共 {total} 条记录，第 {safe} / {totalPages} 页</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, safe - 1))} disabled={safe <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === safe ? "text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            style={p === safe ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, safe + 1))} disabled={safe >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TokensMonitor() {
  const [, navigate] = useLocation(); // 在组件顶级调用 useLocation
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);
  const [deleteLogTopic, setDeleteLogTopic] = useState(false);
  const [showPluginUpgradeDialog, setShowPluginUpgradeDialog] = useState(false);
  const [selectedPluginVersion, setSelectedPluginVersion] = useState<any>(null);
  const [isUpgradingPlugin, setIsUpgradingPlugin] = useState(false);
  const [showClsAgreementDialog, setShowClsAgreementDialog] = useState(false);
  const [clsAgreed, setClsAgreed] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authCheckInterval, setAuthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFreeQuotaDialog, setShowFreeQuotaDialog] = useState(false);
  const [freeQuotaAgreed, setFreeQuotaAgreed] = useState(false);
  const [selectedOpenClaw, setSelectedOpenClaw] = useState(""); // OpenClaw 名称筛选
  const [globalLimit, setGlobalLimit] = useState<number | null>(() => {
    const mode = localStorage.getItem("globalLimitMode");
    if (mode === "unlimited") return null;
    const value = localStorage.getItem("globalLimit");
    return value ? parseInt(value, 10) : 2000000;
  });

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      } else if (e.key === "globalLimitMode" || e.key === "globalLimit") {
        const mode = localStorage.getItem("globalLimitMode");
        if (mode === "unlimited") {
          setGlobalLimit(null);
        } else {
          const value = localStorage.getItem("globalLimit");
          setGlobalLimit(value ? parseInt(value, 10) : 2000000);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 监听 clsOpenClicked 标记，显示协议弹窗
  useEffect(() => {
    const checkClsOpen = () => {
      if (localStorage.getItem('clsOpenClicked') === 'true') {
        localStorage.removeItem('clsOpenClicked');
        setShowClsAgreementDialog(true);
      }
    };
    
    // 页面加载时检查
    checkClsOpen();
    
    // 监听 focus 事件
    window.addEventListener('focus', checkClsOpen);
    return () => window.removeEventListener('focus', checkClsOpen);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("数据已刷新"); }, 1000);
  };

  const handleOpenCLS = () => {
    // 检查授权状态（从后台缓存数据中获取）
    const isAuthorized = localStorage.getItem('clsAuthorized') === 'true';
    
    if (!isAuthorized) {
      // 未授权，显示授权 Dialog
      setShowAuthDialog(true);
      // 启动自动检测授权状态
      setIsCheckingAuth(true);
      const interval = setInterval(() => {
        const authorized = localStorage.getItem('clsAuthorized') === 'true';
        if (authorized) {
          // 已授权，关闭 Dialog 并继续
          setShowAuthDialog(false);
          setIsCheckingAuth(false);
          clearInterval(interval);
          // 继续开启 CLS 日志服务
          proceedWithClsSetup();
        }
      }, 2000);
      setAuthCheckInterval(interval);
    } else {
      // 已授权，直接继续
      proceedWithClsSetup();
    }
  };

  const proceedWithClsSetup = () => {
    // 显示免费额度 Dialog
    setShowFreeQuotaDialog(true);
    setFreeQuotaAgreed(false);
  };

  const handleGoToAuth = () => {
    // Mock 授权流程：5 秒后自动检测授权完成
    // 不真正打开腾讯云页面，而是模拟授权完成
    // 先显示检测状态
    setIsCheckingAuth(true);
    setAuthCompleted(false);
    
    setTimeout(() => {
      localStorage.setItem('clsAuthorized', 'true');
      // 检测完成，显示完成状态
      setIsCheckingAuth(false);
      setAuthCompleted(true);
      // 1秒后自动关闭Dialog并进入下一步
      setTimeout(() => {
        setShowAuthDialog(false);
        setAuthCompleted(false);
        proceedWithClsSetup();
      }, 1000);
    }, 5000);
  };

  const handleCancelAuth = () => {
    setShowAuthDialog(false);
    setIsCheckingAuth(false);
    setAuthCompleted(false);
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      setAuthCheckInterval(null);
    }
  };

  const handleConfirmFreeQuota = () => {
    if (!freeQuotaAgreed) return;
    setShowFreeQuotaDialog(false);
    setIsEnablingCls(true);
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setFreeQuotaAgreed(false);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleGoToCalcDetail = () => {
    window.open('https://cloud.tencent.com/document/product/614/45802', '_blank');
  };

  const handleCancelFreeQuota = () => {
    setShowFreeQuotaDialog(false);
    setFreeQuotaAgreed(false);
  };

  const handleCloseClsConfirmCancel = () => {
    setShowCloseClsConfirm(false);
    setDeleteLogTopic(false);
  };

  const handleConfirmClsAgreement = () => {
    if (!clsAgreed) return;
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setShowClsAgreementDialog(false);
      setClsAgreed(false);
      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("globalClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
      setDeleteLogTopic(false);
      const message = deleteLogTopic ? "CLS 日志服务已关闭，日志主题资源已删除" : "CLS 日志服务已关闭";
      toast.success(message);
    }, 1000);
  };

  // 计算全局配额百分比
  const TODAY_GLOBAL_PCT = globalLimit === null ? "0" : ((TODAY_TOTAL_TOKENS / globalLimit) * 100).toFixed(1);
  const IS_GLOBAL_UNLIMITED = globalLimit === null;

  const handleFromChange = (v: string) => {
    setDateFrom(v);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
  };
  const handleToChange = (v: string) => {
    setDateTo(v);
    setMemberPage(1);
    setModelPage(1);
    setSessionPage(1);
  };

  // 有效时间范围
  const effectiveFrom = dateFrom || today;
  const effectiveTo = dateTo || today;
  const isSingleDay = effectiveFrom === effectiveTo;

  // 筛选范围内的记录
  const rangeRecords = useMemo(
    () => ALL_RECORDS.filter((r) => r.date >= effectiveFrom && r.date <= effectiveTo),
    [effectiveFrom, effectiveTo]
  );

  // 总览指标（随时间联动）
  const totalRequests = rangeRecords.reduce((s, r) => s + r.requests, 0);
  const totalInput = rangeRecords.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutput = rangeRecords.reduce((s, r) => s + r.outputTokens, 0);
  const totalTokens = totalInput + totalOutput;

  // 折线图数据
  const chartData = useMemo(() => {
    if (isSingleDay) {
      // 单日：展示最近 7 天
      return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today, i - 6);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5), // MM-DD
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    } else {
      // 时间段：展示每天
      const days = daysBetween(effectiveFrom, effectiveTo);
      return Array.from({ length: days + 1 }, (_, i) => {
        const date = addDays(effectiveFrom, i);
        const recs = ALL_RECORDS.filter((r) => r.date === date);
        return {
          date: date.slice(5),
          输入Tokens: recs.reduce((s, r) => s + r.inputTokens, 0),
          输出Tokens: recs.reduce((s, r) => s + r.outputTokens, 0),
        };
      });
    }
  }, [isSingleDay, effectiveFrom, effectiveTo, today]);

  // 按用户汇总（随时间联动），按总请求数降序
  const memberStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.memberId) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.memberId, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.requests - a.requests);
  }, [rangeRecords]);

  // 按模型汇总（随时间联动），按总请求数降序
  const modelStats = useMemo(() => {
    const map = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
    rangeRecords.forEach((r) => {
      const cur = map.get(r.modelName) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
      map.set(r.modelName, {
        requests: cur.requests + r.requests,
        inputTokens: cur.inputTokens + r.inputTokens,
        outputTokens: cur.outputTokens + r.outputTokens,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, total: v.inputTokens + v.outputTokens }))
      .sort((a, b) => b.requests - a.requests);
  }, [rangeRecords]);

  // 按会话汇总（高成本 TOP 5），按成本降序
  interface SessionStat {
    sessionId: string;
    sessionName: string;
    channel: string;
    model: string;
    lastActiveTime: string;
    rounds: number;
    tokens: number;
    cost: number;
    duration: string;
  }
  const sessionStats: SessionStat[] = [
    { sessionId: "fb766833", sessionName: "你能干啥 / 你管理一下我在伊朗的局势", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 21:06", rounds: 63, tokens: 1950000, cost: 0.2743, duration: "454m 1s" },
    { sessionId: "06468225", sessionName: "我感觉现在仅表盘可观测细节这人，...", channel: "Feishu Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-08 13:14", rounds: 51, tokens: 1880000, cost: 0.2700, duration: "28m 52s" },
    { sessionId: "a9c7eb8b", sessionName: "请帮我列出 /etc 目录下所有 .conf ...", channel: "Webchat", model: "deepseek-v3.2", lastActiveTime: "2026-03-04 20:23", rounds: 47, tokens: 1590000, cost: 0.2242, duration: "12m 5s" },
    { sessionId: "a46be600", sessionName: "nihao / 帮我看看你的session-cost...", channel: "QQ Dm", model: "deepseek-v3.2", lastActiveTime: "2026-03-07 23:29", rounds: 35, tokens: 965000, cost: 0.1359, duration: "679m 41s" },
    { sessionId: "7bec562c", sessionName: "你还在吗 / 我是觉得现在 openclaw 仍...", channel: "Feishu Group", model: "hunyuan-turbos-latest", lastActiveTime: "2026-03-08 21:58", rounds: 28, tokens: 755000, cost: 0.1076, duration: "548m 57s" },
  ];
  const sessionPaged = sessionStats.slice((sessionPage - 1) * PAGE_SIZE, sessionPage * PAGE_SIZE);

  // 翻页切片
  const memberPaged = memberStats.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE);
  const modelPaged = modelStats.slice((modelPage - 1) * PAGE_SIZE, modelPage * PAGE_SIZE);

  return (
      <div className="page-enter">
        {/* Header */}




        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tokens 监控</h1>
        </div>

        {/* 提示语区域 - 简化版本，第一行 + hover 显示详细文案 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-700">查看企业用户和模型的 Tokens 消耗情况。</span>
          <UITooltip>
            <UITooltipTrigger asChild>
              <button className="text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-help transition-colors">
                查看tokens统计规则
              </button>
            </UITooltipTrigger>
            <UITooltipContent side="right" className="max-w-sm text-xs">
              <div className="space-y-1.5">
                <p>统计数据为模型 API 处理的全量 Token，包含输入 Token(缓存未命中)、输入 Token(缓存命中)、输出 Token。</p>
                <p>缓存命中 Token 的实际计费价格通常远低于缓存未命中 Token。</p>
                <p>因此页面展示的总 Token 数不等于等额的实际计费成本。</p>
                <p>如需了解各模型的缓存输入 Token 定价，请参考对应模型提供商的官方计费文档。</p>
              </div>
            </UITooltipContent>
          </UITooltip>
        </div>

        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          {/* 时间范围筛选 + 刷新 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFromChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleToChange(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
              title="刷新数据"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Overview Cards - 始终显示 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* 随时间联动的四张卡片 */}
          {[
            { label: "总请求数", value: fmt(totalRequests), icon: TrendingUp, color: "from-blue-500 to-blue-600" },
            { label: "输入 Tokens", value: fmt(totalInput), icon: ArrowUp, color: "from-indigo-500 to-indigo-600" },
            { label: "输出 Tokens", value: fmt(totalOutput), icon: ArrowDown, color: "from-purple-500 to-purple-600" },
            { label: "总 Tokens", value: fmt(totalTokens), icon: Zap, color: "from-blue-600 to-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
          {/* 今日全局配额消耗（不随时间联动，放末尾） */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-400">今日全局配额消耗</p>
                <UITooltip>
                  <UITooltipTrigger asChild>
                    <span className="cursor-default">
                      <Info className="w-3 h-3 text-gray-300 hover:text-gray-400 transition-colors" />
                    </span>
                  </UITooltipTrigger>
                  <UITooltipContent side="top" className="max-w-[240px] text-xs">
                    {IS_GLOBAL_UNLIMITED ? "全局配额已设置为无限制，无需关注消耗占比" : "此处统计所有用户使用所有公司配置模型的总 Tokens 占每日全局 Tokens 上限的占比，按自然日统计和刷新"}
                  </UITooltipContent>
                </UITooltip>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{TODAY_GLOBAL_PCT}%</p>
              {IS_GLOBAL_UNLIMITED && <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-1.5 rounded-md">无限制</span>}
            </div>
            <ProgressBar value={TODAY_TOTAL_TOKENS} max={globalLimit} showTooltip isUnlimited={IS_GLOBAL_UNLIMITED} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <p className="text-sm font-medium text-gray-700 mb-4">
            {isSingleDay ? "最近 7 天 Tokens 趋势" : "所选时间段 Tokens 趋势"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString(), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="输入Tokens" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="输出Tokens" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detail Tabs */}
        <Tabs defaultValue="member">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="member">按用户</TabsTrigger>
              <TabsTrigger value="model">按模型</TabsTrigger>
              <TabsTrigger value="session" className="relative pr-3">
                按会话
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 按用户 */}
          <TabsContent value="member">
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个用户使用所有模型的消耗，按总请求数降序排列</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">用户 ID</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总请求数</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {memberPaged.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                  ) : memberPaged.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{m.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.requests)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{fmt(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={memberPage} total={memberStats.length} onChange={setMemberPage} />
            </div>
          </TabsContent>

          {/* 按模型 */}
          <TabsContent value="model">
            <p className="text-xs text-gray-400 mb-3">汇总所选时间范围内每个模型被所有企业用户使用的消耗，按总请求数降序排列</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型名称</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总请求数</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输入 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">输出 Tokens</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">总 Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modelPaged.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                  ) : modelPaged.map((m) => (
                    <tr key={m.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.requests)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.inputTokens)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(m.outputTokens)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{fmt(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={modelPage} total={modelStats.length} onChange={setModelPage} />
            </div>
          </TabsContent>

          {/* 按会话 */}
          <TabsContent value="session">
            {!clsEnabled && (
              <>
                {/* CLS 提示弹框 */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Tokens 监控（按会话）需要开启 CLS 日志服务</h3>
                      <p className="text-xs text-blue-700">开启后，为您赠送3个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 500台 OpenClaw 机器3个月的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
                    </div>
                    <Button
                      onClick={handleOpenCLS}
                      disabled={isEnablingCls}
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 whitespace-nowrap disabled:opacity-50"
                    >
                      {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
                    </Button>
                  </div>
                </div>

                {/* CLS 协议确认弹窗 */}
                <Dialog open={showClsAgreementDialog} onOpenChange={setShowClsAgreementDialog}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>确认免费额度</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="cls-agreement"
                          checked={clsAgreed}
                          onChange={(e) => setClsAgreed(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="cls-agreement" className="text-sm text-gray-700 cursor-pointer flex-1">
                          为您赠送三个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 700 台 OpenClaw 机器的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a>
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowClsAgreementDialog(false);
                          setClsAgreed(false);
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleConfirmClsAgreement}
                        disabled={!clsAgreed || isEnablingCls}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      >
                        {isEnablingCls ? "开启中..." : "确认"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* 卡片功能展示 */}
                <div className="space-y-6 mb-8">
                  {/* 第一块：高成本会话分析 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">开启CLS日志服务后您可以在此处获得以下会话数据：</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#F59E0B" }}>
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">高Token会话实时分析与管控</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">聚焦 TOP 会话的 Token 消耗、轮次分布与耗时特征，精准定位高Token交互，优化模型调用成本与资源效率</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#AF52DE" }}>
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">单会话全链路Token透视</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">拆解每轮交互的 Token 流量与耗时分布，可视化工具调用与上下文膨胀对成本的影响</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 分割线 */}
                  <div className="border-t border-gray-200" />

                  {/* 第二块：会话管理功能 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">开启CLS日志服务后您还可以在运维观测和会话管理页面中获得以下观测数据：</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#3B82F6" }}>
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">应用日志与 OTEL 指标全景洞察</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">多维度分析日志级别与模块分布，精细化追踪消息处理、队列状态与执行耗时</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#FF9500" }}>
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">会话详情与交互效率精细化分析</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">聚焦单会话 Token 消耗，可视化渠道与模型分布特征，精准定位高Token会话，优化资源配置与调用效率</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#10B981" }}>
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">业务运行健康度实时监控</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">聚焦消息处理总量、入队效率与卡死会话，保障系统稳定运行</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#34C759" }}>
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 mb-1">会话全局运行态势监控</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">聚合总会话数、平均轮次与工具调用量，多维度洞察渠道与模型分布，实现会话全生命周期可追溯、可分析</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
                  </div>
                </div>
              </div>
            )}
            {clsEnabled && (
              <>
              {/* 提示语区域 - 参考私有网络和子网样式 */}
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <ul className="text-xs text-blue-700 leading-relaxed space-y-1">
                  <li className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>查看所选时间范围内的模型 Token 使用情况。</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>统计数据为模型 API 处理的全量 Token，包含输入 Token(缓存未命中)、输入 Token(缓存命中)、输出 Token。</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>缓存命中 Token 的实际计费价格通常远低于缓存未命中 Token。</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>因此页面展示的总 Token 数不等于等额的实际计费成本。</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>如需了解各模型的缓存输入 Token 定价，请参考对应模型提供商的官方计费文档。</span>
                  </li>
                </ul>
              </div>
              {/* 顶部：关闭 CLS 按钮（右上角）+ OpenClaw 搜索框（左下方）*/}
              <div className="flex items-start justify-between mb-6 gap-4">
                {/* 左侧：OpenClaw 名称筛选 */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 block mb-2">OpenClaw名称：</label>
                  <OpenClawCombobox
                    value={selectedOpenClaw}
                    onValueChange={setSelectedOpenClaw}
                    className="max-w-xs"
                  />
                </div>
                 {/* 右侧：升级CLS插件 + 关闭CLS按钮 */}
                <div className="flex items-center gap-2 mt-6">
                  <Button
                    onClick={() => setShowPluginUpgradeDialog(true)}
                    variant="outline"
                    className="text-xs h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 bg-white"
                  >
                    升级CLS采集插件
                  </Button>
                  <Button
                    onClick={() => setShowCloseClsConfirm(true)}
                    variant="outline"
                    className="text-xs h-8 px-3 text-red-600 border-red-200 hover:bg-white bg-white"
                  >
                    关闭CLS服务
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">全部会话已按tokens排序，点击可查看会话详情</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">会话</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">渠道</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">最后活动时间</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">轮次</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">TOKENS</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">耗时</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessionPaged.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">暂无数据</td></tr>
                    ) : sessionPaged.map((s) => {
                      return (
                      <tr key={s.sessionId} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/session/${s.sessionId}`)}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{s.sessionName}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{s.sessionId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.channel}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.model}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.lastActiveTime}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{s.rounds}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right font-mono">{(s.tokens / 1000000).toFixed(2)}M</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">{s.duration}</td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/session/${s.sessionId}`);
                            }}
                            variant="outline"
                            className="text-xs h-7 px-3"
                          >
                            查看详情
                          </Button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={sessionPage} total={sessionStats.length} onChange={setSessionPage} />
              </div>
              </>
            )}
          </TabsContent>
        </Tabs>

      {/* CLS 授权 Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>开通服务授权</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {!isCheckingAuth && !authCompleted && (
              <p className="text-sm text-gray-700">开启CLS日志服务后您可以获取会话数据和观测数据</p>
            )}
            <div className="space-y-3 flex flex-col items-center min-h-16 justify-center">
              {isCheckingAuth ? (
                <>
                  {/* 检测中的旋转动画 */}
                  <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 text-center">检测中...</p>
                </>
              ) : authCompleted ? (
                <>
                  {/* 检测完成后显示完成 icon */}
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-xs text-gray-500 text-center">检测到已授权</p>
                </>
              ) : null}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelAuth}>
              取消
            </Button>
            <Button
              onClick={handleGoToAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              前往授权
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 免费额度 Dialog */}
      <Dialog open={showFreeQuotaDialog} onOpenChange={setShowFreeQuotaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>免费额度说明</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700">
                为您赠送<span className="font-semibold text-blue-600">3个月</span>ClawPro 专属 CLS 日志服务免费额度（共<span className="font-semibold text-blue-600">3000U</span>），预估可覆盖 <span className="font-semibold text-blue-600">500台</span> OpenClaw 机器<span className="font-semibold text-blue-600">3个月</span>的日志用量；超过免费额度达到上限或<span className="font-semibold text-blue-600">3个月</span>到期后，CLS 将按量计费。计费详情请参考{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoToCalcDetail();
                  }}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  计费详情
                </a>
                。
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freeQuotaAgreed}
                onChange={(e) => setFreeQuotaAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">我已阅读并同意免费额度说明</span>
            </label>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelFreeQuota}>
              取消
            </Button>
            <Button
              onClick={handleConfirmFreeQuota}
              disabled={!freeQuotaAgreed}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭CLS确认对话框 */}
       <Dialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确定要关闭 CLS 日志服务吗？</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <p className="text-sm text-gray-600">关闭后以下功能将无法使用：</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">运维观测：</span>
                <span>支持通过全链路性能监控采集核心运行指标</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">会话管理：</span>
                <span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</span>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-semibold text-red-700">Tokens 监控（按会话）：</span>
                <span>支持从按会话、消息维度查看 tokens、费用使用情况</span>
              </div>
            </div>

            {/* 删除日志主题资源选项 */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="deleteLogTopic" 
                  checked={deleteLogTopic}
                  onCheckedChange={(checked) => setDeleteLogTopic(checked === true)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="deleteLogTopic" className="text-sm font-medium text-gray-900 cursor-pointer">
                    删除关联的日志主题资源
                  </Label>
                  <div className="space-y-1.5">
                    <div className="flex gap-2 text-xs text-red-700 bg-red-50 p-2 rounded">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>勾选后将永久删除该日志主题及所有日志数据，数据不可恢复。</span>
                    </div>
                    <div className="flex gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>未删除的日志主题资源会持续产生存储费用。</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCloseClsConfirmCancel}>
              取消
            </Button>
            <Button
              onClick={handleCloseCls}
              disabled={isClosingCls}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
