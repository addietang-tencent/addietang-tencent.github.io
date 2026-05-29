/**
 * DispatchCommandDialog - 命令下发执行弹窗（步骤式）
 *
 * 整体架构：单一弹窗内的 4 阶段状态机
 *
 *   ┌─ Step 1 ─┐    ┌─ Step 2 ─┐    ┌─ Step 3 ─┐
 *   │ 选命令   │ →  │ 选执行对象│ →  │ 执行策略 │
 *   └──────────┘    └──────────┘    └────┬─────┘
 *                                        │ 启用「灰度执行」？
 *                          ┌─────────────┴────────────┐
 *                          │ 是                       │ 否
 *                          ▼                          ▼
 *                    ┌──────────┐               ┌──────────┐
 *                    │ testing  │               │submitting│
 *                    └────┬─────┘               └──────────┘
 *                         │                          │
 *                         ▼                          ▼
 *                    ┌──────────┐               toast.success
 *                    │  review  │ → 终止/继续 → submitting
 *                    └──────────┘
 *
 * 两种打开方式：
 *   A. 先选命令 → 选实例：传 command，初始 step = 2
 *   B. 先选实例 → 选命令：传 presetInstanceIds、command=null，初始 step = 1
 */
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  FlaskConical, Server, Code2, Search, ChevronRight,
  Loader2, CheckCircle2, XCircle, ArrowRight, X as XIcon,
  CircleAlert, Info,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusTag } from "@/components/ui/status-tag";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  MOCK_INSTANCES, AGENT_TYPE_LABEL, MOCK_HISTORY, MOCK_COMMAND_TEMPLATES, detectDangerousCommand,
  type CommandTemplate, type AgentTypeKey, type HistoryRecord,
} from "../mockData";

type Phase = "prepare" | "testing" | "review" | "submitting";
type StepId = 1 | 2 | 3;

interface TestRunResult {
  status: "success" | "failed";
  stdout: string;
  stderr?: string;
  exitCode: number;
  durationMs: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 命令模板。若为 null，弹窗会从 Step 1 开始让用户挑选 */
  command: CommandTemplate | null;
  /** 预选实例 ID 列表（来自 Agent 列表勾选） */
  presetInstanceIds?: string[];
  onDispatched?: (record: HistoryRecord) => void;
}

// 命令下发场景下展示的 Agent 类型筛选项（剔除自研 MyAgent，只保留 3 大类标准 Agent）
const AGENT_TYPES: AgentTypeKey[] = ["OpenClaw", "Hermes", "LightclawACE"];
const COMMAND_PAGE_SIZE = 10;
const INSTANCE_PAGE_SIZE = 50;

const STEP_DEFS: { id: StepId; label: string; desc: string }[] = [
  { id: 1, label: "选命令",     desc: "挑选要下发的命令模板，并填写参数（如有）" },
  { id: 2, label: "选执行对象", desc: "选择目标 Agent 实例" },
  { id: 3, label: "执行策略",   desc: "决定是否先在 1 台实例上灰度，再批量下发" },
];

export default function DispatchCommandDialog({
  open, onOpenChange, command, presetInstanceIds, onDispatched,
}: Props) {
  // ── 命令选择 ─────────────────────────────────────────────
  const [pickedCommand, setPickedCommand] = useState<CommandTemplate | null>(command);
  const [commandSearch, setCommandSearch] = useState("");
  const [commandPage, setCommandPage] = useState(1);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  // ── 实例选择 ─────────────────────────────────────────────
  const [agentTypeFilter, setAgentTypeFilter] = useState<AgentTypeKey | "all">("all");
  const [instanceSearch, setInstanceSearch] = useState("");
  const [instancePage, setInstancePage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── 灰度执行 ─────────────────────────────────────────────
  const [useCanary, setUseCanary] = useState(true);
  const [canaryInstanceId, setCanaryInstanceId] = useState<string | null>(null);

  // ── 步骤 + 阶段状态机 ────────────────────────────────────
  // currentStep 仅在 phase=prepare 时有意义
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [phase, setPhase] = useState<Phase>("prepare");
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);

  // 弹窗每次打开重置
  useEffect(() => {
    if (open) {
      setPickedCommand(command);
      setCommandSearch("");
      setCommandPage(1);
      setAgentTypeFilter("all");
      setInstanceSearch("");
      setInstancePage(1);
      // 预选实例（仅取仍在运行中的实例）
      const presetSet = new Set<string>();
      if (presetInstanceIds && presetInstanceIds.length > 0) {
        const runningSet = new Set(
          MOCK_INSTANCES.filter((i) => i.status === "running").map((i) => i.instanceId),
        );
        presetInstanceIds.forEach((id) => {
          if (runningSet.has(id)) presetSet.add(id);
        });
      }
      setSelected(presetSet);
      setUseCanary(true);
      setCanaryInstanceId(null);
      setPhase("prepare");
      setTestResult(null);
      // 入口决定初始 step：传了 command → 跳过选命令，直接 Step 2
      setCurrentStep(command ? 2 : 1);
      // 初始化参数值
      if (command?.useParams && command.params) {
        const init: Record<string, string> = {};
        command.params.forEach((p) => {
          init[p.key] = p.defaultValue ?? "";
        });
        setParamValues(init);
      } else {
        setParamValues({});
      }
    }
  }, [open, command, presetInstanceIds]);

  // 命令切换时同步参数值
  useEffect(() => {
    if (pickedCommand?.useParams && pickedCommand.params) {
      const init: Record<string, string> = {};
      pickedCommand.params.forEach((p) => {
        init[p.key] = p.defaultValue ?? "";
      });
      setParamValues(init);
    } else {
      setParamValues({});
    }
  }, [pickedCommand]);

  // ── 命令搜索 + 分页 ───────────────────────────────────────
  const filteredCommands = useMemo(() => {
    const q = commandSearch.trim().toLowerCase();
    if (!q) return MOCK_COMMAND_TEMPLATES;
    return MOCK_COMMAND_TEMPLATES.filter((t) => (
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q)
    ));
  }, [commandSearch]);

  const totalCommandPages = Math.max(1, Math.ceil(filteredCommands.length / COMMAND_PAGE_SIZE));
  const pagedCommands = useMemo(() => {
    const start = (commandPage - 1) * COMMAND_PAGE_SIZE;
    return filteredCommands.slice(start, start + COMMAND_PAGE_SIZE);
  }, [filteredCommands, commandPage]);

  // 搜索变化时回到第 1 页
  useEffect(() => {
    setCommandPage(1);
  }, [commandSearch]);

  // ── 候选实例（过滤后的全集） ─────────────────────────────
  // 命令下发场景下排除 MyAgent（自研 Agent），仅面向 OpenClaw / Hermes / LightclawACE
  const filteredInstances = useMemo(() => {
    return MOCK_INSTANCES.filter((i) => {
      if (i.status !== "running") return false;
      if (i.agentType === "MyAgent") return false;
      if (agentTypeFilter !== "all" && i.agentType !== agentTypeFilter) return false;
      if (instanceSearch.trim()) {
        const q = instanceSearch.trim().toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.instanceId.toLowerCase().includes(q) ||
          i.owner.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agentTypeFilter, instanceSearch]);

  // 分页
  const totalInstancePages = Math.max(1, Math.ceil(filteredInstances.length / INSTANCE_PAGE_SIZE));
  const pagedInstances = useMemo(() => {
    const start = (instancePage - 1) * INSTANCE_PAGE_SIZE;
    return filteredInstances.slice(start, start + INSTANCE_PAGE_SIZE);
  }, [filteredInstances, instancePage]);

  // 搜索/筛选变化时回到第 1 页
  useEffect(() => {
    setInstancePage(1);
  }, [agentTypeFilter, instanceSearch]);

  const toggleInstance = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        if (canaryInstanceId === id) setCanaryInstanceId(null);
      } else n.add(id);
      return n;
    });
  };

  // 全局全选：勾选/取消所有【匹配当前筛选条件】的实例（不仅是当前页）
  const toggleAllInstances = (checked: boolean) => {
    const allFilteredIds = filteredInstances.map((i) => i.instanceId);
    if (checked) {
      setSelected(new Set([...Array.from(selected), ...allFilteredIds]));
    } else {
      const filteredSet = new Set(allFilteredIds);
      setSelected(new Set(Array.from(selected).filter((id) => !filteredSet.has(id))));
      // 取消勾选时若灰度机被取消了，清掉
      if (canaryInstanceId && filteredSet.has(canaryInstanceId)) {
        setCanaryInstanceId(null);
      }
    }
  };

  // 全选状态：基于「全部筛选结果」而非当前页
  const allInstancesChecked =
    filteredInstances.length > 0 &&
    filteredInstances.every((i) => selected.has(i.instanceId));
  const partialInstancesChecked =
    filteredInstances.some((i) => selected.has(i.instanceId)) && !allInstancesChecked;

  // ── 参数完整性 + 渲染后命令内容 ───────────────────────────
  const danger = pickedCommand ? detectDangerousCommand(pickedCommand.content) : { dangerous: false, reasons: [] };

  const missingParamKeys = useMemo(() => {
    if (!pickedCommand?.useParams || !pickedCommand.params) return [];
    return pickedCommand.params
      .map((p) => p.key)
      .filter((k) => !(paramValues[k] ?? "").trim());
  }, [pickedCommand, paramValues]);

  const renderedContent = useMemo(() => {
    if (!pickedCommand) return "";
    if (!pickedCommand.useParams || !pickedCommand.params?.length) return pickedCommand.content;
    return pickedCommand.content.replace(/\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g, (_m, k: string) => {
      return paramValues[k] ?? `{{${k}}}`;
    });
  }, [pickedCommand, paramValues]);

  // ── 各 Step 是否完成（用于 stepper 状态 + 下一步按钮 disable） ──
  const step1Done = !!pickedCommand && missingParamKeys.length === 0;
  const step2Done = selected.size > 0;
  const step3Done = !useCanary || (canaryInstanceId !== null && selected.has(canaryInstanceId));

  const canSubmit = step1Done && step2Done && step3Done;

  // ── 写入历史记录 ───────────────────────────────────────
  const writeHistoryRecord = (testInfo?: TestRunResult & { instanceId: string }) => {
    if (!pickedCommand) return null;
    const selectedIds = Array.from(selected);
    const now = new Date().toLocaleString("zh-CN", { hour12: false });

    const id = `h-${Date.now().toString(36)}`;
    const record: HistoryRecord = {
      id,
      taskId: `TASK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`,
      action: "command-execute",
      assetName: pickedCommand.name,
      operator: "admin@acompany.com",
      isAuto: false,
      operatedAt: now,
      totalInstances: selectedIds.length,
      successCount: selectedIds.length,
      failedCount: 0,
      commandExtra: {
        commandId: pickedCommand.id,
        commandName: pickedCommand.name,
        commandType: "SHELL",
        commandContent: renderedContent,
        commandContentTemplate: pickedCommand.useParams ? pickedCommand.content : undefined,
        paramValues: pickedCommand.useParams && Object.keys(paramValues).length > 0
          ? { ...paramValues }
          : undefined,
        workingDir: pickedCommand.workingDir,
        runAsUser: pickedCommand.runAsUser,
        timeoutSec: pickedCommand.timeoutSec,
        testInstanceId: testInfo?.instanceId,
        testStatus: testInfo?.status,
        testMessage: testInfo
          ? testInfo.status === "success"
            ? `灰度执行成功（exit=${testInfo.exitCode}，耗时 ${testInfo.durationMs}ms）`
            : `灰度执行失败：${testInfo.stderr ?? "未知错误"}`
          : undefined,
      },
      perInstanceResult: selectedIds.map((iid) => {
        const inst = MOCK_INSTANCES.find((x) => x.instanceId === iid);
        if (testInfo && iid === testInfo.instanceId) {
          return {
            instanceId: iid,
            instanceName: inst?.name ?? iid,
            status: "success" as const,
            stdout: testInfo.stdout,
            exitCode: testInfo.exitCode,
            durationMs: testInfo.durationMs,
          };
        }
        return {
          instanceId: iid,
          instanceName: inst?.name ?? iid,
          status: "success" as const,
          stdout: "ok",
          exitCode: 0,
          durationMs: Math.floor(800 + Math.random() * 2000),
        };
      }),
    };
    MOCK_HISTORY.unshift(record);
    return record;
  };

  // ── 灰度执行（mock） ────────────────────────────────────
  const runCanary = () => {
    if (!canaryInstanceId || !pickedCommand) return;
    setPhase("testing");
    const delay = 1200 + Math.random() * 600;
    setTimeout(() => {
      const success = true;
      setTestResult({
        status: success ? "success" : "failed",
        stdout: success
          ? `[mock] 命令执行成功\n命令：${renderedContent.split("\n")[0]}\n输出已记录，共 ${Math.floor(Math.random() * 8 + 1)} 行`
          : "",
        stderr: success ? undefined : "exit code 1: permission denied",
        exitCode: success ? 0 : 1,
        durationMs: Math.floor(delay),
      });
      setPhase("review");
    }, delay);
  };

  const proceedAfterCanary = () => {
    if (!testResult || !canaryInstanceId) return;
    setPhase("submitting");
    const record = writeHistoryRecord({
      ...testResult,
      instanceId: canaryInstanceId,
    });
    const remaining = selected.size - 1;
    toast.success(`命令已下发到 ${selected.size} 台 Agent`, {
      description: remaining > 0
        ? `灰度验证通过，继续下发到剩余 ${remaining} 台`
        : "仅 1 台实例，已完成",
      action: {
        label: "查看执行记录",
        onClick: () => {
          window.history.pushState(null, "", "/admin/agent-commands?tab=history");
          window.dispatchEvent(new PopStateEvent("popstate"));
        },
      },
    });
    if (record) onDispatched?.(record);
    onOpenChange(false);
  };

  const abortAfterCanary = () => {
    toast.info("已终止下发", {
      description: "灰度执行结果已记录，剩余实例未执行",
    });
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (useCanary) {
      runCanary();
    } else {
      setPhase("submitting");
      const record = writeHistoryRecord();
      toast.success(`命令已下发到 ${selected.size} 台 Agent`, {
        action: {
          label: "查看执行记录",
          onClick: () => {
            window.history.pushState(null, "", "/admin/agent-commands?tab=history");
            window.dispatchEvent(new PopStateEvent("popstate"));
          },
        },
      });
      if (record) onDispatched?.(record);
      onOpenChange(false);
    }
  };

  // ── 步骤导航 ─────────────────────────────────────────────
  const goToStep = (s: StepId) => {
    if (s === currentStep) return;
    // 只允许跳到已完成的 step 或下一步
    if (s < currentStep) {
      setCurrentStep(s);
      return;
    }
    // 前进时检查前置步骤是否完成
    if (s === 2 && !step1Done) return;
    if (s === 3 && (!step1Done || !step2Done)) return;
    setCurrentStep(s);
  };

  const nextStep = () => {
    if (currentStep === 1 && step1Done) setCurrentStep(2);
    else if (currentStep === 2 && step2Done) setCurrentStep(3);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as StepId);
  };

  // ── 阻止 testing/submitting 阶段被关闭 ────────────────────
  const handleOpenChange = (v: boolean) => {
    if (!v && (phase === "testing" || phase === "submitting")) return;
    onOpenChange(v);
  };

  if (!open) return null;

  const canaryInstanceName = canaryInstanceId
    ? MOCK_INSTANCES.find((x) => x.instanceId === canaryInstanceId)?.name ?? canaryInstanceId
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[920px]"
        style={{ maxHeight: "min(90vh, 780px)", display: "flex", flexDirection: "column" }}
      >
        <DialogHeader>
          <DialogTitle>
            {phase === "testing" && "测试机执行中"}
            {phase === "review" && "测试机执行结果"}
            {(phase === "prepare" || phase === "submitting") && (
              pickedCommand ? `下发命令：${pickedCommand.name}` : "命令下发"
            )}
          </DialogTitle>
          <DialogDescription>
            {phase === "testing" && "正在 1 台实例上跑命令，预计 1~2 秒返回结果。"}
            {phase === "review" && "请确认输出无异常后，再下发到剩余实例。"}
            {phase === "prepare" && (
              <>
                {STEP_DEFS[currentStep - 1].desc}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1">

        {/* ── prepare 阶段：完整表单 ───────────────────────── */}
        {phase === "prepare" && (
          <div className="space-y-4">
            {/* 危险命令告警（Alert 必须放在内容区最上方） */}
            {danger.dangerous && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>检测到高危命令</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {danger.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-medium">强烈建议先开启「测试机优先」验证后再下发。</p>
                </AlertDescription>
              </Alert>
            )}

            {/* 命令选择/预览 */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#737373]" />
                选择命令
                <span className="text-[#DC2626]">*</span>
              </h3>
              {!pickedCommand ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <Input
                      value={commandSearch}
                      onChange={(e) => setCommandSearch(e.target.value)}
                      placeholder="搜索命令名称、ID、内容"
                      className="h-9 pl-9"
                    />
                  </div>
                  <div className="rounded-xl border border-[#E5E5E5] bg-white max-h-[260px] overflow-y-auto divide-y divide-[#F5F5F5]">
                    {pagedCommands.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#A3A3A3]">
                        没有匹配的命令；请前往「命令下发」页面创建新命令。
                      </div>
                    ) : (
                      pagedCommands.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPickedCommand(t)}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#FAFAFA] transition-colors flex items-start gap-3 group"
                        >
                          <Code2 className="w-3.5 h-3.5 text-[#737373] mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#0A0A0A] truncate">{t.name}</span>
                              <span className="text-[10px] font-mono text-[#A3A3A3]">{t.id}</span>
                            </div>
                            <code className="text-xs font-mono text-[#737373] truncate block mt-0.5">
                              {t.content.split("\n")[0]}
                              {t.content.includes("\n") && <span className="text-[#A3A3A3] ml-1">…</span>}
                            </code>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#0A0A0A] mt-1 shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                  {totalCommandPages > 1 && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setCommandPage(Math.max(1, commandPage - 1))}
                        disabled={commandPage <= 1}
                        className="px-2 h-7 rounded border border-[#E5E5E5] bg-white text-[#525252] disabled:text-[#A3A3A3] disabled:cursor-not-allowed hover:border-[#1447E6] hover:text-[#1447E6]"
                      >
                        ‹
                      </button>
                      <span className="text-[#737373] tabular-nums">
                        {commandPage} / {totalCommandPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCommandPage(Math.min(totalCommandPages, commandPage + 1))}
                        disabled={commandPage >= totalCommandPages}
                        className="px-2 h-7 rounded border border-[#E5E5E5] bg-white text-[#525252] disabled:text-[#A3A3A3] disabled:cursor-not-allowed hover:border-[#1447E6] hover:text-[#1447E6]"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#525252]">
                    <span>类型：<span className="font-medium text-[#0A0A0A]">SHELL</span></span>
                    <span>执行用户：<span className="font-mono text-[#0A0A0A]">{pickedCommand.runAsUser}</span></span>
                    <span>路径：<span className="font-mono text-[#0A0A0A]">{pickedCommand.workingDir}</span></span>
                    <span>超时：<span className="tabular-nums text-[#0A0A0A]">{pickedCommand.timeoutSec}</span> 秒</span>
                    {!command && (
                      <button
                        type="button"
                        onClick={() => setPickedCommand(null)}
                        className="ml-auto text-[#1447E6] hover:text-[#0A0A0A] text-xs"
                      >
                        切换命令
                      </button>
                    )}
                  </div>
                  <pre className="text-xs font-mono text-[#0A0A0A] bg-[#FAFAFA] rounded-lg p-3 max-h-[120px] overflow-auto whitespace-pre-wrap break-all border border-[#E5E5E5]">
                    {pickedCommand.content}
                  </pre>
                </div>
              )}
            </section>

            {/* 执行对象选择 */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#737373]" />
                选择执行对象
                <span className="text-[#DC2626]">*</span>
                {selected.size > 0 && (
                  <StatusTag mode="fill" variant="blue" className="ml-1 text-[10px] h-4 px-1.5">
                    已选 {selected.size} 台
                  </StatusTag>
                )}
              </h3>

              <div className="flex items-center gap-2">
                <Select value={agentTypeFilter} onValueChange={(v) => setAgentTypeFilter(v as AgentTypeKey | "all")}>
                  <SelectTrigger className="h-9 w-[160px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部 Agent 类型</SelectItem>
                    {AGENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {AGENT_TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={instanceSearch}
                  onChange={(e) => setInstanceSearch(e.target.value)}
                  placeholder="搜索实例名 / ID / 创建人"
                  className="h-9 flex-1"
                />
              </div>

              <div className="rounded-xl border border-[#E5E5E5] overflow-hidden max-h-[280px] overflow-y-auto scrollbar-on-hover">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#FAFAFA] z-10">
                    <TableRow>
                      <TableHead className="w-[1%]">
                        <Checkbox
                          checked={allInstancesChecked ? true : partialInstancesChecked ? "indeterminate" : false}
                          onCheckedChange={(v) => toggleAllInstances(!!v)}
                          className="size-4"
                        />
                      </TableHead>
                      <TableHead>实例</TableHead>
                      <TableHead className="w-[16%]">类型</TableHead>
                      <TableHead className="w-[16%]">版本</TableHead>
                      <TableHead className="w-[20%]">创建人</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedInstances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-sm text-[#A3A3A3]">
                          没有符合条件的实例
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedInstances.map((i) => {
                        const checked = selected.has(i.instanceId);
                        return (
                          <TableRow
                            key={i.instanceId}
                            onClick={() => toggleInstance(i.instanceId)}
                            className={`cursor-pointer ${checked ? "bg-[#E8ECFE]/40" : "hover:bg-[#FAFAFA]"}`}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleInstance(i.instanceId)}
                                className="size-4"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-[#0A0A0A]">{i.name}</div>
                              <div className="text-[11px] text-[#A3A3A3] font-mono">{i.instanceId}</div>
                            </TableCell>
                            <TableCell className="text-xs text-[#525252]">
                              {AGENT_TYPE_LABEL[i.agentType]}
                            </TableCell>
                            <TableCell className="text-xs text-[#525252] font-mono tabular-nums">
                              {i.agentVersion}
                            </TableCell>
                            <TableCell className="text-xs text-[#737373] truncate max-w-[140px]">
                              {i.owner}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalInstancePages > 1 && (
                <div className="flex items-center justify-between text-xs text-[#737373]">
                  <span>
                    共 <span className="text-[#0A0A0A] font-medium tabular-nums">{filteredInstances.length}</span> 条 · 已选 <span className="text-[#1447E6] font-medium tabular-nums">{selected.size}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInstancePage(Math.max(1, instancePage - 1))}
                      disabled={instancePage <= 1}
                      className="px-2 h-7 rounded border border-[#E5E5E5] bg-white text-[#525252] disabled:text-[#A3A3A3] disabled:cursor-not-allowed hover:border-[#1447E6] hover:text-[#1447E6]"
                    >
                      ‹
                    </button>
                    <span className="tabular-nums">
                      {instancePage} / {totalInstancePages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInstancePage(Math.min(totalInstancePages, instancePage + 1))}
                      disabled={instancePage >= totalInstancePages}
                      className="px-2 h-7 rounded border border-[#E5E5E5] bg-white text-[#525252] disabled:text-[#A3A3A3] disabled:cursor-not-allowed hover:border-[#1447E6] hover:text-[#1447E6]"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 测试机优先 */}
            <section className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={useCanary}
                  onCheckedChange={(v) => setUseCanary(v === true)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium text-[#0A0A0A] inline-flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#F59E0B]" />
                    测试机优先（推荐）
                  </div>
                  <p className="text-sm text-[#525252]">
                    先在 1 台测试机上执行，确认输出正常后再下发到剩余实例；过程中你可随时终止。
                  </p>
                </div>
              </label>

              {useCanary && (
                <div className="mt-3 ml-7 space-y-2">
                  <Label className="text-xs font-medium text-[#525252] block">从已选实例中选择测试机</Label>
                  <Select
                    value={canaryInstanceId ?? ""}
                    onValueChange={(v) => setCanaryInstanceId(v)}
                  >
                    <SelectTrigger className="h-9 w-full max-w-[360px] text-sm">
                      <SelectValue placeholder={selected.size === 0 ? "请先选择执行对象" : "选择 1 台作为测试机"} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(selected).map((iid) => {
                        const inst = MOCK_INSTANCES.find((x) => x.instanceId === iid);
                        return (
                          <SelectItem key={iid} value={iid}>
                            {inst?.name ?? iid}
                            <span className="text-[#A3A3A3] ml-2 font-mono text-[11px]">{iid}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── testing 阶段 ─────────────────────────────────── */}
        {phase === "testing" && (
          <div className="py-12 flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-[#F59E0B] animate-spin" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-[#0A0A0A]">
                正在 <span className="text-[#B45309]">{canaryInstanceName}</span> 上执行
              </div>
              <div className="text-sm text-[#525252]">
                超时 {pickedCommand?.timeoutSec ?? 60} 秒，请勿关闭弹窗
              </div>
            </div>
          </div>
        )}

        {/* ── review 阶段 ─────────────────────────────────── */}
        {phase === "review" && testResult && (
          <div className="space-y-4">
            {/* 决策提示放在最上方（Alert 规范） */}
            <Alert variant="info">
              <Info />
              <AlertDescription>
                {testResult.status === "success"
                  ? `请确认输出无异常。点击「继续下发」会向剩余 ${selected.size - 1} 台实例发送同样的命令。`
                  : "测试机执行失败，建议检查命令后重新提交；剩余实例不会被执行。"}
              </AlertDescription>
            </Alert>

            {/* 测试机结果横幅 */}
            <Alert variant={testResult.status === "success" ? "operation-info" : "destructive"}>
              {testResult.status === "success" ? <CheckCircle2 /> : <XCircle />}
              <AlertTitle>
                测试机 <span className="font-mono">{canaryInstanceName}</span> {testResult.status === "success" ? "执行成功" : "执行失败"}
              </AlertTitle>
              <AlertDescription>
                <span>退出码：<span className="font-mono tabular-nums">{testResult.exitCode}</span></span>
                <span className="mx-2">·</span>
                <span>耗时：<span className="font-mono tabular-nums">{testResult.durationMs}ms</span></span>
              </AlertDescription>
            </Alert>

            {testResult.stdout && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#525252] block">执行结果 (stdout)</Label>
                <pre className="text-xs font-mono text-[#0A0A0A] bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3 max-h-[160px] overflow-auto whitespace-pre-wrap break-all">
                  {testResult.stdout}
                </pre>
              </div>
            )}

            {testResult.stderr && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#DC2626] block">错误输出 (stderr)</Label>
                <pre className="text-xs font-mono text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 max-h-[160px] overflow-auto whitespace-pre-wrap break-all">
                  {testResult.stderr}
                </pre>
              </div>
            )}
          </div>
        )}
        </DialogBody>

        {/* ── Footer：根据阶段渲染不同按钮（testing 阶段无 footer） ── */}
        {phase === "prepare" && (
          <DialogFooter>
            <div className="flex-1 text-xs text-[#525252] self-center">
              {useCanary && canaryInstanceId && selected.size > 1 && (
                <>先在 <span className="font-medium text-[#0A0A0A]">{canaryInstanceName}</span> 验证，确认后再下发到剩余 {selected.size - 1} 台</>
              )}
              {useCanary && canaryInstanceId && selected.size === 1 && (
                <>仅 1 台实例，将作为测试机执行</>
              )}
              {!useCanary && selected.size > 0 && (
                <>将立即下发到 <span className="font-medium text-[#0A0A0A] tabular-nums">{selected.size}</span> 台实例</>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {useCanary ? "在测试机上执行" : "立即下发"}
            </Button>
          </DialogFooter>
        )}

        {phase === "review" && testResult && (
          <DialogFooter>
            <Button variant="outline" onClick={abortAfterCanary}>
              <XIcon className="w-3.5 h-3.5 mr-1" />
              终止下发
            </Button>
            {testResult.status === "success" && selected.size > 1 && (
              <Button
                variant="dialog-confirm"
                onClick={proceedAfterCanary}
              >
                继续下发剩余 {selected.size - 1} 台
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {testResult.status === "success" && selected.size === 1 && (
              <Button
                variant="dialog-confirm"
                onClick={proceedAfterCanary}
              >
                完成
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// Stepper - 顶部步骤指示器
// ────────────────────────────────────────────────────────────
function Stepper({
  current,
  done,
  onJump,
}: {
  current: StepId;
  done: Record<StepId, boolean>;
  onJump: (s: StepId) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-1 pb-1">
      {STEP_DEFS.map((s, idx) => {
        const isCurrent = s.id === current;
        const isDone = done[s.id] && s.id !== current;
        const isPast = s.id < current;
        const reachable = s.id <= current || (s.id === current + 1 && done[current]);
        return (
          <div key={s.id} className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => reachable && onJump(s.id)}
              disabled={!reachable}
              className={`flex items-center gap-2 group ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${isCurrent
                    ? "bg-blue-500 text-white shadow-sm ring-2 ring-blue-100"
                    : isDone || isPast
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
                  }`}
              >
                {isDone || isPast ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span
                className={`text-sm font-medium truncate ${
                  isCurrent
                    ? "text-gray-900"
                    : isDone || isPast
                    ? "text-gray-700 group-hover:text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {idx < STEP_DEFS.length - 1 && (
              <div className={`flex-1 h-px ${done[s.id] ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Step 1 - 选命令 + 填参数
// ────────────────────────────────────────────────────────────
function Step1PickCommand(props: {
  pickedCommand: CommandTemplate | null;
  onPick: (c: CommandTemplate | null) => void;
  commandSearch: string;
  onSearchChange: (v: string) => void;
  pagedCommands: CommandTemplate[];
  totalCommands: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  paramValues: Record<string, string>;
  onParamChange: (k: string, v: string) => void;
  missingParamKeys: string[];
  renderedContent: string;
  danger: { dangerous: boolean; reasons: string[] };
  allowSwitchCommand: boolean;
}) {
  const {
    pickedCommand, onPick, commandSearch, onSearchChange,
    pagedCommands, totalCommands, page, totalPages, onPageChange,
    paramValues, onParamChange, missingParamKeys, renderedContent, danger,
    allowSwitchCommand,
  } = props;

  return (
    <>
      {/* 命令选择面板 / 已选命令预览 */}
      {!pickedCommand ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" />
              选择命令模板 <span className="text-red-500">*</span>
            </Label>
            <span className="text-xs text-gray-400">共 {totalCommands} 条</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={commandSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索命令名称、ID、内容、备注"
              className="h-9 pl-9 bg-white"
            />
          </div>
          <div className="rounded-lg border border-gray-100 bg-white divide-y divide-gray-50">
            {pagedCommands.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                {commandSearch ? "没有匹配的命令" : "暂无命令模板"}
                <div className="text-gray-300 mt-1">
                  请先到「执行命令」页创建命令
                </div>
              </div>
            ) : (
              pagedCommands.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onPick(t)}
                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50/60 transition-colors flex items-start gap-3 group"
                >
                  <Code2 className="w-3.5 h-3.5 text-purple-500 mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{t.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{t.id}</span>
                      {t.useParams && t.params && t.params.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                          {t.params.length} 参数
                        </span>
                      )}
                    </div>
                    <code className="text-xs font-mono text-gray-500 truncate block mt-0.5">
                      {t.content.split("\n")[0]}
                      {t.content.includes("\n") && <span className="text-gray-400 ml-1">…</span>}
                    </code>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-1 shrink-0" />
                </button>
              ))
            )}
          </div>
          {/* 分页器（仅在多于 1 页时显示） */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-2 h-7 rounded border border-gray-200 bg-white text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-blue-300 hover:text-blue-600"
              >
                ‹
              </button>
              <span className="text-gray-500 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-2 h-7 rounded border border-gray-200 bg-white text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-blue-300 hover:text-blue-600"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{pickedCommand.name}</span>
            <span className="text-[10px] font-mono text-gray-400">{pickedCommand.id}</span>
            <span>·</span>
            <span>类型：<span className="font-medium text-gray-700">SHELL</span></span>
            <span>·</span>
            <span>执行用户：<span className="font-mono text-gray-700">{pickedCommand.runAsUser}</span></span>
            <span>·</span>
            <span>路径：<span className="font-mono text-gray-700">{pickedCommand.workingDir}</span></span>
            <span>·</span>
            <span>超时：<span className="tabular-nums text-gray-700">{pickedCommand.timeoutSec}</span> 秒</span>
            {allowSwitchCommand && (
              <button
                type="button"
                onClick={() => onPick(null)}
                className="ml-auto text-blue-600 hover:text-blue-700 text-xs"
              >
                切换命令
              </button>
            )}
          </div>
          <pre className="text-xs font-mono text-gray-700 bg-white rounded p-2 max-h-[100px] overflow-auto whitespace-pre-wrap break-all border border-gray-100">
            {pickedCommand.content}
          </pre>
        </div>
      )}

      {/* 危险命令告警 */}
      {pickedCommand && danger.dangerous && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs text-red-700">
            <div className="font-medium mb-0.5">检测到高危命令：</div>
            <ul className="list-disc pl-4 space-y-0.5">
              {danger.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <div className="mt-1 text-red-600 font-medium">强烈建议在执行策略中开启「灰度执行」先验证。</div>
          </div>
        </div>
      )}

      {/* 命令参数填值 */}
      {pickedCommand?.useParams && pickedCommand.params && pickedCommand.params.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-purple-500" />
              命令参数 <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal ml-1">
                （命令内容中 <span className="font-mono">{"{{key}}"}</span> 占位符的实际值）
              </span>
            </Label>
            {missingParamKeys.length === 0 && (
              <span className="text-[11px] text-green-600 inline-flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                参数已就绪
              </span>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36%]">参数名</TableHead>
                  <TableHead>参数值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickedCommand.params.map((p) => {
                  const missing = !(paramValues[p.key] ?? "").trim();
                  return (
                    <TableRow key={p.key} className={missing ? "bg-red-50/30" : ""}>
                      <TableCell className="align-top">
                        <div className="font-mono text-xs text-gray-900 break-all">{p.key}</div>
                        {p.description && (
                          <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                            {p.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={paramValues[p.key] ?? ""}
                          onChange={(e) => onParamChange(p.key, e.target.value)}
                          placeholder={p.defaultValue ? `默认：${p.defaultValue}` : "请输入参数值"}
                          className={`h-8 text-sm ${missing ? "border-red-300" : ""}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {missingParamKeys.length > 0 && (
            <div className="text-xs text-red-600 inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              以下参数未填值：
              {missingParamKeys.map((k, i) => (
                <span key={k} className="font-mono">
                  {i > 0 && "、"}
                  {k}
                </span>
              ))}
            </div>
          )}

          {missingParamKeys.length === 0 && (
            <details className="text-xs">
              <summary className="text-gray-500 cursor-pointer hover:text-blue-600 inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                预览替换后的命令内容
              </summary>
              <pre className="text-xs font-mono text-gray-700 bg-white rounded p-2 mt-2 max-h-[100px] overflow-auto whitespace-pre-wrap break-all border border-gray-100">
                {renderedContent}
              </pre>
            </details>
          )}
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Step 2 - 选执行对象
// ────────────────────────────────────────────────────────────
function Step2PickInstances(props: {
  agentTypeFilter: AgentTypeKey | "all";
  onAgentTypeChange: (v: AgentTypeKey | "all") => void;
  instanceSearch: string;
  onInstanceSearchChange: (v: string) => void;
  pagedInstances: typeof MOCK_INSTANCES;
  totalFiltered: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  allChecked: boolean;
  partialChecked: boolean;
}) {
  const {
    agentTypeFilter, onAgentTypeChange, instanceSearch, onInstanceSearchChange,
    pagedInstances, totalFiltered, page, totalPages, onPageChange,
    selected, onToggle, onToggleAll, allChecked, partialChecked,
  } = props;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Server className="w-3.5 h-3.5" />
          选择目标实例 <span className="text-red-500">*</span>
          {selected.size > 0 && (
            <span className="ml-1 text-xs text-blue-600 tabular-nums">
              · 已选 {selected.size} 台
            </span>
          )}
        </Label>
        <span className="text-xs text-gray-400">
          共 {totalFiltered} 台运行中实例
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Select value={agentTypeFilter} onValueChange={(v) => onAgentTypeChange(v as AgentTypeKey | "all")}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部 Agent 类型</SelectItem>
            {AGENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {AGENT_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={instanceSearch}
          onChange={(e) => onInstanceSearchChange(e.target.value)}
          placeholder="搜索实例名 / ID / 创建人"
          className="h-9 flex-1"
        />
      </div>

      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[1%]">
                <Checkbox
                  checked={allChecked ? true : partialChecked ? "indeterminate" : false}
                  onCheckedChange={(v) => onToggleAll(!!v)}
                  className="size-4"
                />
              </TableHead>
              <TableHead>
                实例
                {(allChecked || partialChecked) && (
                  <span className="ml-1 text-[10px] text-gray-400 font-normal">
                    （表头勾选 = 全选所有匹配筛选的实例）
                  </span>
                )}
              </TableHead>
              <TableHead className="w-[16%]">类型</TableHead>
              <TableHead className="w-[16%]">版本</TableHead>
              <TableHead className="w-[20%]">创建人</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-xs text-gray-400">
                  没有符合条件的实例
                </TableCell>
              </TableRow>
            ) : (
              pagedInstances.map((i) => {
                const checked = selected.has(i.instanceId);
                return (
                  <TableRow
                    key={i.instanceId}
                    data-state={checked ? "selected" : undefined}
                    onClick={() => onToggle(i.instanceId)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => onToggle(i.instanceId)}
                        className="size-4"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{i.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{i.instanceId}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {AGENT_TYPE_LABEL[i.agentType]}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-mono tabular-nums">
                      {i.agentVersion}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 truncate max-w-[140px]">
                      {i.owner}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页器（仅 >1 页时显示） */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-gray-500 tabular-nums">
            第 {(page - 1) * 50 + 1} - {Math.min(page * 50, totalFiltered)} 条 / 共 {totalFiltered} 条
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-2 h-7 rounded border border-gray-200 bg-white text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-blue-300 hover:text-blue-600"
            >
              ‹
            </button>
            <span className="text-gray-500 tabular-nums px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-2 h-7 rounded border border-gray-200 bg-white text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:border-blue-300 hover:text-blue-600"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Step 3 - 执行策略
// ────────────────────────────────────────────────────────────
function Step3Policy(props: {
  pickedCommand: CommandTemplate;
  selectedCount: number;
  useCanary: boolean;
  onUseCanaryChange: (v: boolean) => void;
  canaryInstanceId: string | null;
  onCanaryInstanceChange: (id: string) => void;
  selectedInstanceIds: string[];
}) {
  const {
    pickedCommand, selectedCount,
    useCanary, onUseCanaryChange,
    canaryInstanceId, onCanaryInstanceChange,
    selectedInstanceIds,
  } = props;

  return (
    <>
      {/* 任务摘要 */}
      <div className="rounded-xl border border-gray-100 bg-blue-50/30 p-4">
        <div className="text-xs text-gray-500 mb-2">即将执行</div>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 text-xs w-14 shrink-0">命令：</span>
            <span className="font-medium text-gray-900">{pickedCommand.name}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 text-xs w-14 shrink-0">实例：</span>
            <span className="text-gray-700 tabular-nums">{selectedCount} 台</span>
          </div>
        </div>
      </div>

      {/* 灰度执行 */}
      <div className={`rounded-xl border p-4 space-y-3 transition-colors ${
        useCanary ? "border-amber-200 bg-amber-50/40" : "border-gray-200 bg-white"
      }`}>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={useCanary}
            onCheckedChange={(v) => onUseCanaryChange(v === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="text-sm text-gray-900 inline-flex items-center gap-1.5 font-medium">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              灰度执行（先跑 1 台，推荐）
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              先在 1 台实例上跑命令，看输出无异常后再下发到剩余 {selectedCount > 1 ? selectedCount - 1 : 0} 台。
              <br />
              如果灰度机失败会自动中止，<span className="text-amber-700 font-medium">不会影响其他实例</span>。
            </p>
          </div>
        </label>

        {useCanary && (
          <div className="ml-6 space-y-3">
            {/* 流程示意图 */}
            <div className="rounded-lg bg-white border border-amber-100 p-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200">
                  <FlaskConical className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-800 font-medium">1 台灰度机</span>
                </div>
                <div className="flex flex-col items-center text-[10px] text-gray-400 -mt-3">
                  <span className="text-green-600 font-medium">成功</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200">
                  <Server className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    剩余 {selectedCount > 1 ? selectedCount - 1 : 0} 台
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs mt-2 pl-1">
                <span className="text-red-600">✗ 失败</span>
                <span className="text-gray-400">→ 自动中止，剩余实例不会执行</span>
              </div>
            </div>

            {/* 灰度机选择 */}
            <div>
              <Label className="text-xs text-gray-600 mb-1.5 block">
                挑选 1 台作为灰度机
                <span className="text-gray-400 ml-1">（建议挑非生产环境的实例）</span>
              </Label>
              <Select
                value={canaryInstanceId ?? ""}
                onValueChange={onCanaryInstanceChange}
              >
                <SelectTrigger className="h-9 w-full max-w-[420px] text-sm bg-white">
                  <SelectValue placeholder={selectedCount === 0 ? "请先选择执行对象" : "从已选实例中选 1 台"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedInstanceIds.map((iid) => {
                    const inst = MOCK_INSTANCES.find((x) => x.instanceId === iid);
                    return (
                      <SelectItem key={iid} value={iid}>
                        {inst?.name ?? iid}
                        <span className="text-gray-400 ml-2 font-mono text-[11px]">{iid}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!useCanary && (
          <div className="ml-6 rounded-lg bg-red-50/50 border border-red-100 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">将一次性下发到全部 {selectedCount} 台实例。</div>
              <div className="text-red-600 mt-0.5">如命令有误可能同时影响所有实例，请谨慎。</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
