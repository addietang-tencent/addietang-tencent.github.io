/**
 * CommandTaskTab - 「命令下发 → 命令列表」Tab 内容
 *
 * 内容：命令模板沉淀（参考 TAT 命令管理）
 *   - 列表：命令 ID/名称（ID 可复制）/ 类型 / 内容预览 / 创建人 / 最近执行 / 总执行次数 / 操作（下发/编辑/删除）
 *   - 顶部："创建命令"按钮 + 搜索
 *
 * 注：执行记录已拆为「命令下发 → 执行记录」独立 Tab，本组件不再展示。
 */
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Code2, MoreVertical, Edit2, Trash2, Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  MOCK_COMMAND_TEMPLATES,
  type CommandTemplate,
} from "./mockData";
import CreateCommandDialog from "./components/CreateCommandDialog";
import DispatchCommandDialog from "./components/DispatchCommandDialog";
import CopyableId from "./components/CopyableId";

export default function CommandTaskTab() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CommandTemplate | undefined>(undefined);
  const [dispatchTarget, setDispatchTarget] = useState<CommandTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommandTemplate | null>(null);
  const [tick, setTick] = useState(0); // 强制刷新 mock 列表

  const templates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_COMMAND_TEMPLATES.filter((t) => {
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        t.createdBy.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tick]);

  return (
    <div className="space-y-6">
      {/* ─── 命令库 ─────────────────────────────────────────── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
      >
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
          <Code2 className="w-4 h-4 text-blue-500" />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-base">命令库</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              沉淀团队的运维命令模板，便于复用与审计；当前共
              <span className="font-semibold tabular-nums text-gray-700 mx-1">
                {MOCK_COMMAND_TEMPLATES.length}
              </span>
              个命令
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索命令 ID、名称、内容、创建人"
                className="h-9 pl-9 bg-white"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditTarget(undefined);
                setCreateOpen(true);
              }}
              className="h-9 text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              <Plus className="w-4 h-4 mr-1" />
              创建命令
            </Button>
          </div>
        </div>

        {/* 列表 */}
        {templates.length === 0 ? (
          <div className="py-16 text-center">
            <Code2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {search ? "没有匹配的命令" : "暂无命令，点击「创建命令」开始沉淀团队 SOP"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">
                  命令 ID / 名称
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[8%]">
                  类型
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  命令内容
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[14%]">
                  创建人
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[14%]">
                  最近执行
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[14%]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {/* ID 上、名称下：参考 TAT 命令列表 */}
                    <CopyableId id={t.id} primary />
                    <div className="text-sm font-medium text-gray-900 mt-0.5">{t.name}</div>
                    {t.description && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded block truncate max-w-[420px]">
                            {t.content.split("\n")[0]}
                            {t.content.includes("\n") && (
                              <span className="text-gray-400 ml-1">…</span>
                            )}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[480px]">
                          <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">
                            {t.content}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 truncate max-w-[120px]">{t.createdBy}</div>
                    <div className="text-[11px] text-gray-400 tabular-nums">{t.createdAt.slice(0, 10)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {t.lastRunAt ? (
                      <div className="text-sm text-gray-700 tabular-nums">{t.lastRunAt.slice(5, 16)}</div>
                    ) : (
                      <span className="text-sm text-gray-300">从未执行</span>
                    )}
                    <div className="text-[11px] text-gray-400 tabular-nums">
                      共 {t.totalRuns} 次
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setDispatchTarget(t)}
                      >
                        <Play className="w-3.5 h-3.5 mr-0.5" />
                        下发
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditTarget(t);
                              setCreateOpen(true);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700"
                            onClick={() => setDeleteTarget(t)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 子弹窗 */}
      <CreateCommandDialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) setEditTarget(undefined);
        }}
        template={editTarget}
        onSaved={() => setTick((t) => t + 1)}
      />

      <DispatchCommandDialog
        open={!!dispatchTarget}
        onOpenChange={(v) => !v && setDispatchTarget(null)}
        command={dispatchTarget}
        onDispatched={() => setTick((t) => t + 1)}
      />

      {/* 删除确认 */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg leading-none font-semibold">
              删除命令？
            </DialogTitle>
            <DialogDescription>
              即将删除「<span className="font-medium text-gray-700">{deleteTarget?.name}</span>」，已存在的执行记录不会被删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  const idx = MOCK_COMMAND_TEMPLATES.findIndex((x) => x.id === deleteTarget.id);
                  if (idx >= 0) MOCK_COMMAND_TEMPLATES.splice(idx, 1);
                  toast.success("命令已删除");
                  setDeleteTarget(null);
                  setTick((t) => t + 1);
                }
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
