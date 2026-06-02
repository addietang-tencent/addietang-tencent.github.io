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
  FlaskConical, Server, Code2, Search,
  Loader2, CheckCircle2, XCircle, ArrowRight, X as XIcon,
  Info, AlertTriangle, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Stepper as UiStepper } from "@/components/ui/stepper";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioCard } from "@/components/ui/radio-card";
import { SurfaceCard, SurfaceInner } from "@/components/ui/Surface";
import { StatusTag } from "@/components/ui/status-tag";
import {
  Collapsible, CollapsibleContent,
} from "@/components/ui/collapsible";
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
const INSTANCE_PAGE_SIZE = 50;

const STEP_DEFS: { id: StepId; label: string; desc: string }[] = [
  { id: 1, label: "选命令",     desc: "" },
  { id: 2, label: "选执行对象", desc: "" },
  { id: 3, label: "执行策略",   desc: "" },
];

export default function DispatchCommandDialog({
  open, onOpenChange, command, presetInstanceIds, onDispatched,
}: Props) {
  // ── 命令选择 ─────────────────────────────────────────────
  const [pickedCommand, setPickedCommand] = useState<CommandTemplate | null>(command);
  const [commandSearch, setCommandSearch] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  // 命令模板列表是否已收起（选完命令后自动收起，仍可手动展开重选）
  const [templateListCollapsed, setTemplateListCollapsed] = useState<boolean>(!!command);

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
      // 入口已带 command（路径 A）→ 列表默认收起；否则展开等待用户选择
      setTemplateListCollapsed(!!command);
      setCommandSearch("");
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
            {phase === "testing" && "灰度执行中"}
            {phase === "review" && "灰度执行结果"}
            {(phase === "prepare" || phase === "submitting") && (
              pickedCommand ? `下发命令：${pickedCommand.name}` : "命令下发"
            )}
          </DialogTitle>
          <DialogDescription>
            {phase === "testing" && "正在 1 台实例上跑命令，预计 1~2 秒返回结果。"}
            {phase === "review" && "请确认输出无异常后，再下发到剩余实例。"}
            {phase === "prepare" && STEP_DEFS[currentStep - 1].desc}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1">

        {/* ── prepare 阶段：Stepper + 当前步骤内容 ───────────── */}
        {phase === "prepare" && (
          <div className="space-y-4">
            <UiStepper
              current={currentStep}
              steps={STEP_DEFS.map((s) => ({ label: s.label }))}
            />

            {currentStep === 1 && (
              <Step1PickCommand
                pickedCommand={pickedCommand}
                onPick={(c) => {
                  setPickedCommand(c);
                  // 选中命令模板后，自动收起模板列表
                  if (c) setTemplateListCollapsed(true);
                  else setTemplateListCollapsed(false);
                }}
                commandSearch={commandSearch}
                onSearchChange={setCommandSearch}
                filteredCommands={filteredCommands}
                paramValues={paramValues}
                onParamChange={(k, v) => setParamValues((prev) => ({ ...prev, [k]: v }))}
                missingParamKeys={missingParamKeys}
                renderedContent={renderedContent}
                danger={danger}
                templateListCollapsed={templateListCollapsed}
                onToggleTemplateList={() => setTemplateListCollapsed((v) => !v)}
              />
            )}

            {currentStep === 2 && (
              <Step2PickInstances
                agentTypeFilter={agentTypeFilter}
                onAgentTypeChange={setAgentTypeFilter}
                instanceSearch={instanceSearch}
                onInstanceSearchChange={setInstanceSearch}
                pagedInstances={pagedInstances}
                totalFiltered={filteredInstances.length}
                page={instancePage}
                totalPages={totalInstancePages}
                onPageChange={setInstancePage}
                selected={selected}
                onToggle={toggleInstance}
                onToggleAll={toggleAllInstances}
                allChecked={allInstancesChecked}
                partialChecked={partialInstancesChecked}
              />
            )}

            {currentStep === 3 && pickedCommand && (
              <Step3Policy
                pickedCommand={pickedCommand}
                selectedCount={selected.size}
                useCanary={useCanary}
                onUseCanaryChange={setUseCanary}
                canaryInstanceId={canaryInstanceId}
                onCanaryInstanceChange={setCanaryInstanceId}
                selectedInstanceIds={Array.from(selected)}
              />
            )}
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
            <Alert variant="info">
              <Info />
              <AlertDescription>
                {testResult.status === "success"
                  ? `请确认输出无异常。点击「继续下发」会向剩余 ${selected.size - 1} 台实例发送同样的命令。`
                  : "灰度执行失败，建议检查命令后重新提交；剩余实例不会被执行。"}
              </AlertDescription>
            </Alert>

            <Alert variant={testResult.status === "success" ? "operation-info" : "destructive"}>
              {testResult.status === "success" ? <CheckCircle2 /> : <XCircle />}
              <AlertTitle>
                灰度机 <span className="font-mono">{canaryInstanceName}</span> {testResult.status === "success" ? "执行成功" : "执行失败"}
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
                <pre className="text-xs font-mono text-[#0A0A0A] bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-3 max-h-[160px] overflow-auto whitespace-pre-wrap break-all">
                  {testResult.stdout}
                </pre>
              </div>
            )}

            {testResult.stderr && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-red-600 block">错误输出 (stderr)</Label>
                <pre className="text-xs font-mono text-red-600 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[4px] p-3 max-h-[160px] overflow-auto whitespace-pre-wrap break-all">
                  {testResult.stderr}
                </pre>
              </div>
            )}
          </div>
        )}
        </DialogBody>

        {/* ── Footer：根据阶段渲染不同按钮（testing/submitting 阶段无 footer） ── */}
        {phase === "prepare" && (
          <DialogFooter>
            <div className="flex-1 text-xs text-[#525252] self-center">
              {currentStep === 3 && useCanary && canaryInstanceId && selected.size > 1 && (
                <>先在 <span className="font-medium text-[#0A0A0A]">{canaryInstanceName}</span> 灰度，确认后再下发到剩余 {selected.size - 1} 台</>
              )}
              {currentStep === 3 && useCanary && canaryInstanceId && selected.size === 1 && (
                <>仅 1 台实例，将作为灰度机执行</>
              )}
              {currentStep === 3 && !useCanary && selected.size > 0 && (
                <>将一次性下发到 <span className="font-medium text-[#0A0A0A] tabular-nums">{selected.size}</span> 台实例</>
              )}
            </div>
            <Button variant="claw-outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            {currentStep > 1 && (
              <Button variant="claw-outline" onClick={prevStep}>
                上一步
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                variant="dialog-confirm"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !step1Done) ||
                  (currentStep === 2 && !step2Done)
                }
              >
                下一步
              </Button>
            ) : (
              <Button
                variant="dialog-confirm"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {useCanary ? "在灰度机上执行" : "立即下发"}
              </Button>
            )}
          </DialogFooter>
        )}

        {phase === "review" && testResult && (
          <DialogFooter>
            <Button variant="claw-outline" onClick={abortAfterCanary}>
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
// Step 1 - 选命令 + 填参数
// ────────────────────────────────────────────────────────────
function Step1PickCommand(props: {
  pickedCommand: CommandTemplate | null;
  onPick: (c: CommandTemplate | null) => void;
  commandSearch: string;
  onSearchChange: (v: string) => void;
  filteredCommands: CommandTemplate[];
  paramValues: Record<string, string>;
  onParamChange: (k: string, v: string) => void;
  missingParamKeys: string[];
  renderedContent: string;
  danger: { dangerous: boolean; reasons: string[] };
  templateListCollapsed: boolean;
  onToggleTemplateList: () => void;
}) {
  const {
    pickedCommand, onPick, commandSearch, onSearchChange,
    filteredCommands,
    paramValues, onParamChange, missingParamKeys, renderedContent, danger,
    templateListCollapsed, onToggleTemplateList,
  } = props;

  return (
    <>
      {/* 命令选择列表（始终显示，但选中后默认收起） */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1">
            选择命令模板 <span className="text-red-500">*</span>
            {pickedCommand && (
              <span className="ml-2 text-xs text-[#737373] font-normal">
                · 已选「<span className="text-[#0A0A0A]">{pickedCommand.name}</span>」
              </span>
            )}
          </Label>
          <div className="flex items-center gap-3">
            {pickedCommand && (
              <button
                type="button"
                onClick={onToggleTemplateList}
                className="text-xs text-[#1447E6] hover:underline inline-flex items-center gap-0.5"
              >
                {templateListCollapsed ? (
                  <>
                    重新选择
                    <ChevronDown className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    收起
                    <ChevronUp className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <Collapsible open={!templateListCollapsed}>
          <CollapsibleContent
            className="overflow-hidden duration-150 ease-out
              data-[state=closed]:animate-accordion-up
              data-[state=open]:animate-accordion-down"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <Input
                  value={commandSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="搜索命令名称、ID、内容、备注"
                  className="h-9 pl-9"
                />
              </div>
              {/* 固定高度溢出滚动区 */}
              <div
                className="max-h-[320px] overflow-y-auto pr-1
                  [&::-webkit-scrollbar]:w-[6px]
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-transparent
                  [&::-webkit-scrollbar-track]:bg-transparent
                  hover:[&::-webkit-scrollbar-thumb]:bg-[#D4D4D4]"
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#A3A3A3]">
                    {commandSearch ? "没有匹配的命令" : "暂无命令模板"}
                    <div className="text-[#D4D4D4] mt-1">
                      请先到「执行命令」页创建命令
                    </div>
                  </div>
                ) : (
                  <RadioGroup
                    value={pickedCommand?.id ?? ""}
                    onValueChange={(v) => {
                      const t = filteredCommands.find((c) => c.id === v);
                      if (t) onPick(t);
                    }}
                    className="gap-2"
                  >
                    {filteredCommands.map((t) => {
                      const isChecked = pickedCommand?.id === t.id;
                      return (
                        <RadioCard
                          key={t.id}
                          id={`cmd-tpl-${t.id}`}
                          value={t.id}
                          checked={isChecked}
                        title={
                          <div className="flex items-center gap-2 flex-wrap">
                            <Code2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-sm font-medium text-[#0A0A0A] truncate">{t.name}</span>
                            <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
                            <span className="text-xs text-[#737373]">{t.id}</span>
                            {t.useParams && t.params && t.params.length > 0 && (
                              <>
                                <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
                                <StatusTag
                                  variant="gray"
                                  mode="fill"
                                  className="h-[18px] px-1.5 text-[10px]"
                                >
                                  需要填写 {t.params.length} 个参数
                                </StatusTag>
                              </>
                            )}
                            </div>
                          }
                          description={
                            <code className="text-xs font-mono text-[#737373] truncate block">
                              {t.content.split("\n")[0]}
                              {t.content.includes("\n") && <span className="text-[#A3A3A3] ml-1">…</span>}
                            </code>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 已选命令卡片（位于命令列表 与 命令参数 之间） */}
      <div
        className={
          pickedCommand
            ? "rounded-[4px] border border-[#1447E6] bg-[#1447E6]/5 p-3 space-y-2"
            : "rounded-[4px] border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2.5"
        }
      >
        {pickedCommand ? (
          <>
            <div className="flex items-center gap-2 text-xs text-[#737373] flex-wrap">
              <Code2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="text-sm font-medium text-[#0A0A0A]">{pickedCommand.name}</span>
              <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
              <span className="text-xs text-[#737373]">{pickedCommand.id}</span>
              <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
              <span>类型：<span className="font-medium text-[#525252]">SHELL</span></span>
              <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
              <span>执行用户：<span className="font-mono text-[#525252]">{pickedCommand.runAsUser}</span></span>
              <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
              <span>路径：<span className="font-mono text-[#525252]">{pickedCommand.workingDir}</span></span>
              <span aria-hidden className="w-px h-3 bg-[#E5E5E5] shrink-0" />
              <span>超时：<span className="tabular-nums text-[#525252]">{pickedCommand.timeoutSec}</span> 秒</span>
            </div>
            <pre className="text-xs font-mono text-[#525252] bg-white rounded p-2 max-h-[100px] overflow-auto whitespace-pre-wrap break-all border border-[#E5E5E5]">
              {pickedCommand.content}
            </pre>
          </>
        ) : (
          <div className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            尚未选择命令模板，请在上方列表中选择
          </div>
        )}
      </div>

      {/* 危险命令告警 */}
      {pickedCommand && danger.dangerous && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-3 py-2 flex gap-2">
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
        <div className="space-y-3">
          {/* 小标题：输入命令参数 */}
          <Label className="text-sm font-medium text-[#0A0A0A] flex items-center gap-1">
            输入命令参数 <span className="text-red-500">*</span>
          </Label>

          <SurfaceCard className="flex flex-col gap-3 py-4">
            <div className="px-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-gray-700 inline-flex items-center gap-1.5 flex-wrap">
                  <Code2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  命令参数
                  <span className="text-xs text-gray-400 font-normal">
                    （命令内容中 <span className="font-mono">{"{{key}}"}</span> 占位符的实际值）
                  </span>
                </div>
                {missingParamKeys.length === 0 && (
                  <span className="text-[11px] text-green-600 inline-flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    参数已就绪
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 space-y-4">
              <Table
                density="compact"
                autoFixedColumns={false}
                containerClassName="border border-gray-100 rounded-[4px] overflow-hidden bg-white"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[42%]">参数名</TableHead>
                    <TableHead>参数值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickedCommand.params.map((p) => {
                    const missing = !(paramValues[p.key] ?? "").trim();
                    return (
                      <TableRow key={p.key}>
                        <TableCell>
                          <span className="font-medium text-[#0A0A0A]">{p.key}</span>
                          {p.description && (
                            <>
                              <span className="mx-2 text-[#D4D4D4]">｜</span>
                              <span className="text-[#737373]">{p.description}</span>
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            id={`param-input-${p.key}`}
                            value={paramValues[p.key] ?? ""}
                            onChange={(e) => onParamChange(p.key, e.target.value)}
                            placeholder={p.defaultValue ? `默认：${p.defaultValue}` : "请输入参数值"}
                            className={`h-7 ${missing ? "border-red-300" : ""}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

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
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">
                    替换后的命令内容
                  </Label>
                  <pre className="text-xs font-mono text-gray-700 bg-[#FAFAFA] rounded p-2.5 max-h-[120px] overflow-auto whitespace-pre-wrap break-all border border-gray-100">
                    {renderedContent}
                  </pre>
                </div>
              )}
            </div>
          </SurfaceCard>
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
          选择目标实例 <span className="text-red-500">*</span>
          {selected.size > 0 && (
            <span className="ml-1 text-xs text-[#737373] tabular-nums font-normal">
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

      <Table
        density="compact"
        autoFixedColumns={false}
        containerClassName="border border-gray-100 rounded-[4px] overflow-hidden"
      >
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
                <span className="ml-1 text-gray-400 font-normal">
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
              <TableCell colSpan={5} className="text-center py-10 text-gray-400">
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
                    <span>{i.name}</span>
                    <span aria-hidden className="inline-block w-px h-3 bg-[#E5E5E5] align-middle mx-2" />
                    <span className="text-gray-500">{i.instanceId}</span>
                  </TableCell>
                  <TableCell>
                    {AGENT_TYPE_LABEL[i.agentType]}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {i.agentVersion}
                  </TableCell>
                  <TableCell className="truncate max-w-[140px]">
                    {i.owner}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

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
      {/* 不勾选灰度时的警示提示 — 放在内容区最上方 */}
      {!useCanary && (
        <Alert variant="warning">
          <AlertCircle />
          <AlertDescription>
            不选择灰度执行，将一次性下发到全部 {selectedCount} 台实例，如命令有误可能同时影响所有实例，请谨慎操作。
          </AlertDescription>
        </Alert>
      )}

      {/* 任务摘要标题 */}
      <Label className="text-sm font-medium text-[#0A0A0A]">
        即将对 <span className="font-bold text-[#1447E6] tabular-nums">{selectedCount} 台</span> 实例 执行 <span className="font-bold text-[#1447E6]">{pickedCommand.name}</span> 命令
      </Label>

      {/* 灰度执行 — 多选卡片样式 */}
      <SurfaceCard
        className={`flex flex-col gap-3 py-4 transition-colors ${
          useCanary
            ? "border-[#1447E6] bg-[#1447E6]/5"
            : "border-[#E5E5E5] bg-white"
        }`}
      >
        <div className="px-4 space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={useCanary}
              onCheckedChange={(v) => onUseCanaryChange(v === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-900 font-medium">
                灰度执行（先跑 1 台，推荐）
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                先在 1 台实例上跑命令，看输出无异常后再下发到剩余 {selectedCount > 1 ? selectedCount - 1 : 0} 台；如果灰度机失败会自动中止，<span className="text-amber-700 font-medium">不会影响其他实例</span>。
              </p>
            </div>
          </label>

          {useCanary && (
            <div className="ml-6 space-y-3">
              {/* 流程示意图 — 弧形连接的分支流程图 */}
              <SurfaceInner className="p-3">
                <div className="flex items-center gap-2">
                  {/* 源节点 */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-50 border border-amber-200 shrink-0">
                    <FlaskConical className="w-3 h-3 text-amber-600" />
                    <span className="text-amber-800 font-medium text-xs">1 台灰度机</span>
                  </div>

                  {/* SVG 弧形连接线 */}
                  <svg
                    width="44"
                    height="56"
                    viewBox="0 0 44 56"
                    className="shrink-0 text-[#D4D4D4]"
                    aria-hidden
                  >
                    {/* 上分支弧线：源 (0, 28) → (44, 12) */}
                    <path
                      d="M 0 28 C 22 28, 22 12, 44 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* 下分支弧线：源 (0, 28) → (44, 44) */}
                    <path
                      d="M 0 28 C 22 28, 22 44, 44 44"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  {/* 分支节点 */}
                  <div className="flex flex-col gap-2 text-xs flex-1">
                    <div className="flex items-center gap-2 h-6">
                      <span className="text-green-600 font-medium shrink-0">成功</span>
                      <span className="text-[#0A0A0A] shrink-0">下发到</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 w-fit">
                        <Server className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-800 font-medium">
                          剩余 {selectedCount > 1 ? selectedCount - 1 : 0} 台
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 h-6">
                      <span className="text-red-600 font-medium shrink-0">失败</span>
                      <span className="text-[#0A0A0A]">
                        自动中止，剩余实例不会执行
                      </span>
                    </div>
                  </div>
                </div>
              </SurfaceInner>

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
                          <span>{inst?.name ?? iid}</span>
                          <span aria-hidden className="inline-block w-px h-3 bg-[#E5E5E5] align-middle mx-2" />
                          <span className="text-xs text-[#737373]">{iid}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!useCanary && (
            <div className="ml-6 text-xs text-[#737373]">
              已关闭灰度执行。
            </div>
          )}
        </div>
      </SurfaceCard>
    </>
  );
}
