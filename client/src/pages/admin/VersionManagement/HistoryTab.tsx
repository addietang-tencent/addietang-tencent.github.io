/**
 * HistoryTab - 运维记录（审计视角）
 *
 * 方案一：版本管理 + 命令下发统一在此审计
 *   - 「运维内容」列动态展示：
 *     · agent-upgrade  → "Agent 升级 X.X → Y.Y"
 *     · command-execute → "命令：清理临时日志"
 *   - 「类型」筛选：全部 / Agent 升级 / 命令执行
 *   - 详情弹窗按 action 类型分发：升级走原版字段，命令走 stdout/stderr/exitCode
 *
 * 通过 scope prop 控制范围：
 *   - "all"             → 全部记录（独立运维任务页用，已下线）
 *   - "agent-upgrade"   → 只看 Agent 升级（用于 Agent 版本页 → 更新记录 Tab）
 *   - "command-execute" → 只看命令执行（用于 命令下发页 → 执行记录 Tab）
 * scope 锁定时，类型筛选下拉会被隐藏。
 *
 * 样式对齐设计规范：rounded-2xl + 双层 boxShadow + h-9 控件
 */
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import {
  Search, Sparkles, User, CheckCircle2, XCircle, Loader2, RefreshCw,
  ArrowUpRight, Code2, FlaskConical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MOCK_HISTORY,
  HISTORY_ACTION_LABEL,
  type HistoryRecord,
  type HistoryAction,
} from "./mockData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActionCell } from "@/components/ui/table";
import CopyableId from "./components/CopyableId";

type ActionFilter = "all" | HistoryAction;
type OperatorFilter = "all" | "manual" | "auto";

interface Props {
  /** 记录范围：all=全部；agent-upgrade=仅 Agent 升级；command-execute=仅命令执行 */
  scope?: "all" | HistoryAction;
}

export default function HistoryTab({ scope = "all" }: Props) {
  const [search, setSearch] = useState("");
  // scope 锁定时，actionFilter 跟随 scope；scope=all 时由用户控制
  const [actionFilter, setActionFilter] = useState<ActionFilter>(scope === "all" ? "all" : scope);
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>("all");
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null);

  // scope 变化时重置 actionFilter
  useEffect(() => {
    setActionFilter(scope === "all" ? "all" : scope);
  }, [scope]);

  // 支持从 URL ?action=command-execute 直接过滤（仅 scope=all 时生效，否则 scope 优先）
  const searchStr = useSearch();
  useEffect(() => {
    if (scope !== "all") return;
    const params = new URLSearchParams(searchStr);
    const a = params.get("action");
    if (a === "agent-upgrade" || a === "command-execute") {
      setActionFilter(a);
    }
  }, [searchStr, scope]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_HISTORY.filter((r) => {
      // scope 锁定的优先级最高
      if (scope !== "all" && r.action !== scope) return false;
      if (actionFilter !== "all" && r.action !== actionFilter) return false;
      if (operatorFilter === "manual" && r.isAuto) return false;
      if (operatorFilter === "auto" && !r.isAuto) return false;
      if (q) {
        const hit =
          r.assetName.toLowerCase().includes(q) ||
          r.operator.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.taskId.toLowerCase().includes(q) ||
          (r.commandExtra?.commandContent ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [search, actionFilter, operatorFilter, scope]);

  return (
    <div className="space-y-4">
      {/* 筛选栏（标准尺寸 h-9）*/}
      <div className="flex flex-wrap items-center gap-3">
        {/* scope 锁定时隐藏类型下拉，避免误导用户该页可以切类型 */}
        {scope === "all" && (
          <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionFilter)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="agent-upgrade">Agent 更新</SelectItem>
              <SelectItem value="command-execute">命令执行</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={operatorFilter} onValueChange={(v) => setOperatorFilter(v as OperatorFilter)}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部执行方</SelectItem>
            <SelectItem value="manual">管理员手动</SelectItem>
            <SelectItem value="auto">平台自动更新</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            placeholder="搜索内容、操作人、记录 ID 或命令"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-white"
          />
        </div>

        <button
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-[#A3A3A3] hover:text-[#355EF1] hover:border-blue-300 flex items-center justify-center transition-colors"
          title="刷新列表"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 记录表格 */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[14%]">
                  任务 ID
                </TableHead>
                {scope === "all" && (
                  <TableHead className="w-[10%] min-w-[110px]">
                    类型
                  </TableHead>
                )}
                <TableHead className="w-[28%]">
                  运维内容
                </TableHead>
                <TableHead className="w-[12%]">
                  执行方
                </TableHead>
                <TableHead className="w-[14%]">
                  执行时间
                </TableHead>
                <TableHead className="w-[15%]">
                  结果
                </TableHead>
                <TableHead className="text-right w-[8%]">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={scope === "all" ? 7 : 6} className="px-6 py-16 text-center text-sm text-[#A3A3A3]">
                    暂无符合条件的记录
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <HistoryRow key={r.id} record={r} showType={scope === "all"} onDetail={() => setDetailRecord(r)} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 详情弹窗 */}
      <HistoryDetailDialog record={detailRecord} onClose={() => setDetailRecord(null)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 类型标签颜色
// ────────────────────────────────────────────────────────────────
function getActionTagColor(action: HistoryAction): string {
  switch (action) {
    case "agent-upgrade":
      return "text-[#355EF1] bg-blue-50";
    case "command-execute":
      return "text-purple-700 bg-purple-50";
    default:
      return "text-[#334155] bg-gray-50";
  }
}

/** 综合状态徽标（参考 TAT，分级：成功/部分成功/失败/进行中） */
function getOverallStatus(record: HistoryRecord): {
  label: string;
  color: string;
} {
  const { totalInstances, successCount, failedCount } = record;
  const running = totalInstances - successCount - failedCount;
  if (running > 0) return { label: "进行中", color: "text-[#355EF1] bg-blue-50" };
  if (failedCount === 0) return { label: "成功", color: "text-green-600 bg-green-50" };
  if (successCount === 0) return { label: "失败", color: "text-red-600 bg-red-50" };
  return { label: "部分成功", color: "text-amber-700 bg-amber-50" };
}

function HistoryRow({
  record,
  showType,
  onDetail,
}: {
  record: HistoryRecord;
  showType: boolean;
  onDetail: () => void;
}) {
  const successRate = record.totalInstances > 0
    ? Math.round((record.successCount / record.totalInstances) * 100)
    : 0;
  const overall = getOverallStatus(record);

  return (
    <TableRow>
      {/* 任务 ID（可复制） */}
      <TableCell>
        <CopyableId id={record.taskId} primary />
      </TableCell>

      {/* 类型（仅 scope=all 显示） */}
      {showType && (
        <TableCell>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${getActionTagColor(record.action)}`}>
            {record.action === "command-execute" && <Code2 className="w-3 h-3 mr-1" />}
            {record.action === "agent-upgrade" && <ArrowUpRight className="w-3 h-3 mr-1" />}
            {HISTORY_ACTION_LABEL[record.action]}
          </span>
        </TableCell>
      )}

      {/* 运维内容（按类型动态展示） */}
      <TableCell>
        {record.action === "agent-upgrade" && (
          <div className="space-y-0.5">
            <div className="text-sm text-[#0A0A0A] truncate max-w-[280px]">{record.assetName}</div>
            {record.fromVersion && record.toVersion ? (
              <div className="text-xs font-mono text-[#737373] tabular-nums">
                {record.fromVersion} <span className="text-[#A3A3A3]">→</span>{" "}
                <span className="text-[#334155] font-semibold">{record.toVersion}</span>
              </div>
            ) : record.toVersion ? (
              <div className="text-xs font-mono text-[#737373] tabular-nums">
                → <span className="text-[#334155] font-semibold">{record.toVersion}</span>
              </div>
            ) : null}
          </div>
        )}
        {record.action === "command-execute" && (
          <div className="space-y-0.5">
            <div className="text-sm text-[#0A0A0A] truncate max-w-[280px]">
              {record.assetName}
              {record.commandExtra?.testInstanceId && (
                <span className="ml-1.5 inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 align-middle">
                  <FlaskConical className="w-2.5 h-2.5 mr-0.5" />
                  灰度执行
                </span>
              )}
            </div>
            {record.commandExtra?.commandContent && (
              <code className="text-xs font-mono text-[#737373] truncate block max-w-[280px]">
                {record.commandExtra.commandContent.split("\n")[0]}
                {record.commandExtra.commandContent.includes("\n") && (
                  <span className="text-[#A3A3A3] ml-1">…</span>
                )}
              </code>
            )}
          </div>
        )}
      </TableCell>

      {/* 执行方 */}
      <TableCell>
        {record.isAuto ? (
          <div className="inline-flex items-center gap-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#355EF1]" />
            <span className="text-[#355EF1]">{record.operator}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-sm">
            <User className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span className="text-[#334155] truncate max-w-[120px]">{record.operator}</span>
          </div>
        )}
      </TableCell>

      {/* 执行时间 */}
      <TableCell>
        <div className="text-sm text-[#737373] tabular-nums whitespace-nowrap">
          {record.operatedAt}
        </div>
        {record.scheduledAt && (
          <div className="text-[10px] text-[#A3A3A3] mt-0.5">
            计划：{record.scheduledAt}
          </div>
        )}
      </TableCell>

      {/* 结果（综合状态徽标 + 进度条 + 数字） */}
      <TableCell>
        <div className="space-y-1.5">
          <span className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${overall.color}`}>
            {overall.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  record.failedCount === 0
                    ? "bg-green-500"
                    : successRate >= 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
            <span className="text-xs text-[#334155] font-mono tabular-nums shrink-0 whitespace-nowrap">
              {record.successCount}/{record.totalInstances}
            </span>
          </div>
        </div>
      </TableCell>

      {/* 操作 */}
      <TableActionCell className="text-right">
        <button
          onClick={onDetail}
          className="text-sm text-[#355EF1] hover:text-[#355EF1] font-medium"
        >
          详情
        </button>
      </TableActionCell>
    </TableRow>
  );
}

// ────────────────────────────────────────────────────────────────
// 详情弹窗（按 action 类型分发渲染）
// ────────────────────────────────────────────────────────────────
function HistoryDetailDialog({ record, onClose }: { record: HistoryRecord | null; onClose: () => void }) {
  if (!record) return null;
  return (
    <Dialog open={!!record} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[920px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg leading-none font-semibold flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${getActionTagColor(record.action)}`}>
              {HISTORY_ACTION_LABEL[record.action]}
            </span>
            <span>{record.assetName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 基本信息 - 网格 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50/60 rounded-xl">
            <Field label="任务 ID" value={record.taskId} mono />
            <Field label="记录 ID" value={record.id} mono />
            <Field label="执行方" value={record.isAuto ? `${record.operator}（自动）` : record.operator} />
            <Field label="执行时间" value={record.operatedAt} />
            {record.scheduledAt && <Field label="计划执行时间" value={record.scheduledAt} />}
            <Field label="影响 Agent" value={`${record.totalInstances} 个`} />
            <Field label="成功" value={`${record.successCount}`} highlight="success" />
            <Field label="失败" value={record.failedCount > 0 ? `${record.failedCount}` : "0"}
              highlight={record.failedCount > 0 ? "error" : undefined} />
            {record.action === "agent-upgrade" && record.fromVersion && (
              <Field label="原版本" value={record.fromVersion} mono />
            )}
            {record.action === "agent-upgrade" && record.toVersion && (
              <Field label="目标版本" value={record.toVersion} mono />
            )}
          </div>

          {/* 命令执行专属：命令详情 */}
          {record.action === "command-execute" && record.commandExtra && (
            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-500" />
                命令详情
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <Field label="命令类型" value={record.commandExtra.commandType} small />
                <Field label="执行用户" value={record.commandExtra.runAsUser} mono small />
                <Field label="执行路径" value={record.commandExtra.workingDir} mono small />
                <Field label="超时时间" value={`${record.commandExtra.timeoutSec} 秒`} small />
              </div>
              <div>
                <div className="text-xs text-[#737373] mb-1">命令内容</div>
                <pre className="text-xs font-mono text-[#334155] bg-gray-50 rounded-lg p-3 max-h-[180px] overflow-auto whitespace-pre-wrap break-all border border-gray-100">
                  {record.commandExtra.commandContent}
                </pre>
              </div>

              {/* 命令参数值（仅本次任务用到了参数化命令时显示） */}
              {record.commandExtra.paramValues && Object.keys(record.commandExtra.paramValues).length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">命令参数</div>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[36%]">
                            参数名
                          </TableHead>
                          <TableHead>
                            参数值
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(record.commandExtra.paramValues).map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell className="font-mono text-gray-900 break-all">{k}</TableCell>
                            <TableCell className="font-mono text-gray-700 break-all">{v}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {record.commandExtra.commandContentTemplate && (
                    <details className="text-xs mt-2">
                      <summary className="text-gray-500 cursor-pointer hover:text-blue-600">
                        查看命令模板原始内容（含 {"{{key}}"}）
                      </summary>
                      <pre className="text-xs font-mono text-gray-500 bg-gray-50/60 rounded p-2 mt-1.5 max-h-[120px] overflow-auto whitespace-pre-wrap break-all border border-gray-100">
                        {record.commandExtra.commandContentTemplate}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* 灰度执行结果 */}
              {record.commandExtra.testInstanceId && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                    record.commandExtra.testStatus === "success"
                      ? "bg-amber-50 border border-amber-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  <FlaskConical
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      record.commandExtra.testStatus === "success" ? "text-amber-600" : "text-red-500"
                    }`}
                  />
                  <div className="text-xs">
                    <div
                      className={`font-medium ${
                        record.commandExtra.testStatus === "success" ? "text-amber-800" : "text-red-700"
                      }`}
                    >
                      灰度机验证：
                      {record.commandExtra.testStatus === "success" ? "通过" : "失败"}
                    </div>
                    {record.commandExtra.testMessage && (
                      <div className="text-[#737373] mt-0.5">{record.commandExtra.testMessage}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 每台 Agent 的结果 */}
          {record.perInstanceResult && record.perInstanceResult.length > 0 && (
            <div>
              <div className="text-sm font-medium text-[#334155] mb-2">
                每个 Agent 执行结果（{record.perInstanceResult.length}）
              </div>
              <div
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Agent
                      </TableHead>
                      <TableHead className="w-[16%]">
                        状态
                      </TableHead>
                      {record.action === "command-execute" ? (
                        <>
                          <TableHead className="w-[10%]">
                            退出码
                          </TableHead>
                          <TableHead className="w-[10%]">
                            耗时
                          </TableHead>
                          <TableHead>
                            输出
                          </TableHead>
                        </>
                      ) : (
                        <TableHead>
                          备注
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.perInstanceResult.map((r) => (
                      <TableRow key={r.instanceId}>
                        <TableCell>
                          <div className="text-sm text-[#0A0A0A]">{r.instanceName}</div>
                          <div className="text-xs text-[#A3A3A3] font-mono mt-0.5">{r.instanceId}</div>
                        </TableCell>
                        <TableCell>
                          {r.status === "success" && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 成功
                            </span>
                          )}
                          {r.status === "failed" && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-3.5 h-3.5" /> 失败
                            </span>
                          )}
                          {r.status === "running" && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#355EF1]">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> 进行中
                            </span>
                          )}
                        </TableCell>
                        {record.action === "command-execute" ? (
                          <>
                            <TableCell className="text-sm text-[#334155] font-mono tabular-nums">
                              {r.exitCode ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-[#737373] tabular-nums">
                              {r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-[#737373]">
                              {r.stderr ? (
                                <code className="text-xs text-red-600 font-mono break-all">{r.stderr}</code>
                              ) : r.stdout ? (
                                <code className="text-xs text-[#334155] font-mono break-all">{r.stdout}</code>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className="text-sm text-[#737373]">{r.message || "—"}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, value, mono, highlight, small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "success" | "error";
  small?: boolean;
}) {
  const valueColor =
    highlight === "success" ? "text-green-600"
      : highlight === "error" ? "text-red-600"
      : "text-[#0A0A0A]";
  return (
    <div>
      <div className={`${small ? "text-[11px]" : "text-xs"} text-[#737373] mb-1`}>{label}</div>
      <div className={`${small ? "text-xs" : "text-sm"} font-semibold ${valueColor} ${mono ? "font-mono tabular-nums" : ""}`}>
        {value}
      </div>
    </div>
  );
}

