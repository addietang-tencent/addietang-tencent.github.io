/**
 * DispatchCommandDialog - 命令下发执行弹窗
 *
 * 流程（单一弹窗内的状态机）：
 *   prepare    → 选命令、选目标实例、选是否启用「测试机优先」、选测试机
 *   testing    → 仅在启用测试机时进入；前端 mock 1.5s 模拟测试机执行
 *   review     → 展示测试机 stdout / exitCode / 耗时；用户决定 [继续下发剩余 N 台] / [终止]
 *   submitting → 短暂态，用于禁用按钮防止重复提交（关 Dialog 后由 toast 反馈结果）
 *
 * 不启用测试机时：prepare → submitting，直接全部下发。
 *
 * 提交后：写入 MOCK_HISTORY 一条 command-execute 记录，并 toast 跳转入口。
 *
 * 两种打开方式：
 *   A. 先选命令 → 选实例：传 command，presetInstanceIds 不传或为空
 *   B. 先选实例 → 选命令：传 presetInstanceIds，command 传 null（顶部展开命令搜索）
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
import {
  MOCK_INSTANCES, AGENT_TYPE_LABEL, MOCK_HISTORY, MOCK_COMMAND_TEMPLATES, detectDangerousCommand,
  type CommandTemplate, type AgentTypeKey, type HistoryRecord,
} from "../mockData";

type Phase = "prepare" | "testing" | "review" | "submitting";

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
  /** 命令模板。若为 null，弹窗会展开「选择命令」区块让用户挑选 */
  command: CommandTemplate | null;
  /** 预选实例 ID 列表（来自 Agent 列表勾选） */
  presetInstanceIds?: string[];
  onDispatched?: (record: HistoryRecord) => void;
}

const AGENT_TYPES: AgentTypeKey[] = ["OpenClaw", "Hermes", "LightclawACE", "MyAgent"];

export default function DispatchCommandDialog({
  open, onOpenChange, command, presetInstanceIds, onDispatched,
}: Props) {
  // ── 命令选择 ─────────────────────────────────────────────
  const [pickedCommand, setPickedCommand] = useState<CommandTemplate | null>(command);
  const [commandSearch, setCommandSearch] = useState("");

  // ── 实例选择 ─────────────────────────────────────────────
  const [agentTypeFilter, setAgentTypeFilter] = useState<AgentTypeKey | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── 测试机优先 ───────────────────────────────────────────
  const [useTestRun, setUseTestRun] = useState(true);
  const [testInstanceId, setTestInstanceId] = useState<string | null>(null);

  // ── 阶段状态机 ───────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("prepare");
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);

  // 弹窗每次打开重置
  useEffect(() => {
    if (open) {
      setPickedCommand(command);
      setCommandSearch("");
      setAgentTypeFilter("all");
      setSearch("");
      // 预选实例（仅取仍在运行中的实例，避免无效项卡住测试机选择）
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
      setUseTestRun(true);
      setTestInstanceId(null);
      setPhase("prepare");
      setTestResult(null);
    }
  }, [open, command, presetInstanceIds]);

  // 命令搜索结果
  const commandCandidates = useMemo(() => {
    const q = commandSearch.trim().toLowerCase();
    if (!q) return MOCK_COMMAND_TEMPLATES;
    return MOCK_COMMAND_TEMPLATES.filter((t) => (
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q)
    ));
  }, [commandSearch]);

  // 候选实例
  const candidateInstances = useMemo(() => {
    return MOCK_INSTANCES.filter((i) => {
      if (i.status !== "running") return false;
      if (agentTypeFilter !== "all" && i.agentType !== agentTypeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.instanceId.toLowerCase().includes(q) ||
          i.owner.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agentTypeFilter, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        if (testInstanceId === id) setTestInstanceId(null);
      } else n.add(id);
      return n;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const ids = candidateInstances.map((i) => i.instanceId);
      setSelected(new Set([...Array.from(selected), ...ids]));
    } else {
      const ids = new Set(candidateInstances.map((i) => i.instanceId));
      setSelected(new Set(Array.from(selected).filter((id) => !ids.has(id))));
    }
  };

  const allChecked =
    candidateInstances.length > 0 &&
    candidateInstances.every((i) => selected.has(i.instanceId));
  const partialChecked =
    candidateInstances.some((i) => selected.has(i.instanceId)) && !allChecked;

  const danger = pickedCommand ? detectDangerousCommand(pickedCommand.content) : { dangerous: false, reasons: [] };

  // 准备阶段是否可以"开始下发"
  const canStart =
    !!pickedCommand &&
    selected.size > 0 &&
    (!useTestRun || (testInstanceId && selected.has(testInstanceId)));

  // ── 写入历史记录（最终提交） ──────────────────────────────
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
        commandContent: pickedCommand.content,
        workingDir: pickedCommand.workingDir,
        runAsUser: pickedCommand.runAsUser,
        timeoutSec: pickedCommand.timeoutSec,
        testInstanceId: testInfo?.instanceId,
        testStatus: testInfo?.status,
        testMessage: testInfo
          ? testInfo.status === "success"
            ? `测试机执行成功（exit=${testInfo.exitCode}，耗时 ${testInfo.durationMs}ms）`
            : `测试机执行失败：${testInfo.stderr ?? "未知错误"}`
          : undefined,
      },
      perInstanceResult: selectedIds.map((iid) => {
        const inst = MOCK_INSTANCES.find((x) => x.instanceId === iid);
        // 如果是测试机本身，复用测试结果
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

  // ── 测试机执行（mock） ───────────────────────────────────
  const runTestInstance = () => {
    if (!testInstanceId || !pickedCommand) return;
    setPhase("testing");
    // mock 1.2~1.8s 的执行延时
    const delay = 1200 + Math.random() * 600;
    setTimeout(() => {
      // 危险命令前缀也按 success 处理（演示用）；真实接入后由后端返回
      const success = true;
      setTestResult({
        status: success ? "success" : "failed",
        stdout: success
          ? `[mock] 命令执行成功\n命令：${pickedCommand.content.split("\n")[0]}\n输出已记录，共 ${Math.floor(Math.random() * 8 + 1)} 行`
          : "",
        stderr: success ? undefined : "exit code 1: permission denied",
        exitCode: success ? 0 : 1,
        durationMs: Math.floor(delay),
      });
      setPhase("review");
    }, delay);
  };

  // ── 用户在 review 阶段点「继续下发剩余 N 台」 ─────────────
  const proceedAfterTest = () => {
    if (!testResult || !testInstanceId) return;
    setPhase("submitting");
    const record = writeHistoryRecord({
      ...testResult,
      instanceId: testInstanceId,
    });
    const remaining = selected.size - 1;
    toast.success(`命令已下发到 ${selected.size} 台 Agent`, {
      description: remaining > 0
        ? `测试机验证通过，继续下发到剩余 ${remaining} 台`
        : "仅 1 台测试机，已完成",
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

  // ── 用户在 review 阶段点「终止」 ─────────────────────────
  const abortAfterTest = () => {
    toast.info("已终止下发", {
      description: "测试机执行结果已记录，剩余实例未执行",
    });
    onOpenChange(false);
  };

  // ── 主提交按钮（prepare 阶段） ───────────────────────────
  const handleStart = () => {
    if (!canStart) return;
    if (useTestRun) {
      runTestInstance();
    } else {
      // 不启用测试机：直接下发
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

  // ── 阻止 testing/submitting 阶段被意外关闭 ───────────────
  const handleOpenChange = (v: boolean) => {
    if (!v && (phase === "testing" || phase === "submitting")) return;
    onOpenChange(v);
  };

  if (!open) return null;

  const testInstanceName = testInstanceId
    ? MOCK_INSTANCES.find((x) => x.instanceId === testInstanceId)?.name ?? testInstanceId
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
            {phase === "testing" && "正在测试机上执行命令，预计 1~2 秒返回结果。"}
            {phase === "review" && "请确认测试机输出无异常后，再下发到剩余实例。"}
            {phase === "prepare" && (pickedCommand
              ? "选择执行对象，命令将通过 Agent 控制通道下发到目标实例。"
              : `已选择 ${selected.size} 台实例，请先选择要下发的命令模板。`
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
                    {commandCandidates.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#A3A3A3]">
                        没有匹配的命令；请前往「命令下发」页面创建新命令。
                      </div>
                    ) : (
                      commandCandidates.map((t) => (
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
                  <StatusTag variant="blue" className="ml-1 text-[10px] h-4 px-1.5">
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索实例名 / ID / 创建人"
                  className="h-9 flex-1"
                />
              </div>

              <div className="rounded-xl border border-[#E5E5E5] overflow-hidden max-h-[280px] overflow-y-auto scrollbar-on-hover">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#FAFAFA] z-10">
                    <tr className="border-b border-[#E5E5E5]">
                      <th className="px-3 py-2.5 w-[1%]">
                        <Checkbox
                          checked={allChecked ? true : partialChecked ? "indeterminate" : false}
                          onCheckedChange={(v) => toggleAll(!!v)}
                          className="size-4"
                        />
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#525252] font-medium">实例</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#525252] font-medium w-[16%]">类型</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#525252] font-medium w-[16%]">版本</th>
                      <th className="text-left px-3 py-2.5 text-xs text-[#525252] font-medium w-[20%]">创建人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F5]">
                    {candidateInstances.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-sm text-[#A3A3A3]">
                          没有符合条件的实例
                        </td>
                      </tr>
                    ) : (
                      candidateInstances.map((i) => {
                        const checked = selected.has(i.instanceId);
                        return (
                          <tr key={i.instanceId} className={checked ? "bg-[#E8ECFE]/40" : "hover:bg-[#FAFAFA]"}>
                            <td className="px-3 py-2.5">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggle(i.instanceId)}
                                className="size-4"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="text-sm text-[#0A0A0A]">{i.name}</div>
                              <div className="text-[11px] text-[#A3A3A3] font-mono">{i.instanceId}</div>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-[#525252]">
                              {AGENT_TYPE_LABEL[i.agentType]}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-[#525252] font-mono tabular-nums">
                              {i.agentVersion}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-[#737373] truncate max-w-[140px]">
                              {i.owner}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 测试机优先 */}
            <section className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={useTestRun}
                  onCheckedChange={(v) => setUseTestRun(v === true)}
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

              {useTestRun && (
                <div className="mt-3 ml-7 space-y-2">
                  <Label className="text-xs font-medium text-[#525252] block">从已选实例中选择测试机</Label>
                  <Select
                    value={testInstanceId ?? ""}
                    onValueChange={(v) => setTestInstanceId(v)}
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

        {/* ── testing 阶段：执行中态 ──────────────────────── */}
        {phase === "testing" && (
          <div className="py-12 flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-[#F59E0B] animate-spin" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-[#0A0A0A]">
                正在 <span className="text-[#B45309]">{testInstanceName}</span> 上执行
              </div>
              <div className="text-sm text-[#525252]">
                超时 {pickedCommand?.timeoutSec ?? 60} 秒，请勿关闭弹窗
              </div>
            </div>
          </div>
        )}

        {/* ── review 阶段：测试结果 ───────────────────────── */}
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
                测试机 <span className="font-mono">{testInstanceName}</span> {testResult.status === "success" ? "执行成功" : "执行失败"}
              </AlertTitle>
              <AlertDescription>
                <span>退出码：<span className="font-mono tabular-nums">{testResult.exitCode}</span></span>
                <span className="mx-2">·</span>
                <span>耗时：<span className="font-mono tabular-nums">{testResult.durationMs}ms</span></span>
              </AlertDescription>
            </Alert>

            {/* stdout */}
            {testResult.stdout && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#525252] block">执行结果 (stdout)</Label>
                <pre className="text-xs font-mono text-[#0A0A0A] bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3 max-h-[160px] overflow-auto whitespace-pre-wrap break-all">
                  {testResult.stdout}
                </pre>
              </div>
            )}

            {/* stderr */}
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
              {useTestRun && testInstanceId && selected.size > 1 && (
                <>先在 <span className="font-medium text-[#0A0A0A]">{testInstanceName}</span> 验证，确认后再下发到剩余 {selected.size - 1} 台</>
              )}
              {useTestRun && testInstanceId && selected.size === 1 && (
                <>仅 1 台实例，将作为测试机执行</>
              )}
              {!useTestRun && selected.size > 0 && (
                <>将立即下发到 <span className="font-medium text-[#0A0A0A] tabular-nums">{selected.size}</span> 台实例</>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleStart}
              disabled={!canStart}
            >
              {useTestRun ? "在测试机上执行" : "立即下发"}
            </Button>
          </DialogFooter>
        )}

        {phase === "review" && testResult && (
          <DialogFooter>
            <Button variant="outline" onClick={abortAfterTest}>
              <XIcon className="w-3.5 h-3.5 mr-1" />
              终止下发
            </Button>
            {testResult.status === "success" && selected.size > 1 && (
              <Button
                variant="dialog-confirm"
                onClick={proceedAfterTest}
              >
                继续下发剩余 {selected.size - 1} 台
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {testResult.status === "success" && selected.size === 1 && (
              <Button
                variant="dialog-confirm"
                onClick={proceedAfterTest}
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
