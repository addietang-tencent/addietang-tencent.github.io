/**
 * CreateCommandDialog - 新建/编辑命令模板（参考 TAT 命令管理）
 *
 * 字段（v1 范围 - 简化版）：
 *   - 命令名称（必填，≤60 字节）
 *   - 命令类型（仅 SHELL，灰显）
 *   - 执行路径（非必填，留空时下发时按默认 /root）
 *   - 执行用户（非必填，留空时下发时按默认 root）
 *   - 超时时间（秒，默认 60，范围 1~86400）
 *   - 命令内容（必填，多行文本）
 *   - 使用参数（开关，开启后可在命令内容中以 {{key}} 引用变量；下发时支持覆盖默认值）
 *   - 备注
 *
 * 危险命令检测：保存前调用 detectDangerousCommand，命中则给出二次确认
 */
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Info, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CommandTemplate, type CommandParam, detectDangerousCommand, MOCK_COMMAND_TEMPLATES,
} from "../mockData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 编辑模式：传入已有模板；新建模式：不传 */
  template?: CommandTemplate;
  /** 保存后回调，传出新建/更新后的命令模板 */
  onSaved: (template: CommandTemplate) => void;
}

const NAME_REGEX = /^[\u4e00-\u9fa5A-Za-z0-9_\-.]+$/;
const PARAM_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

type DraftTemplate = Omit<CommandTemplate, "id" | "createdAt" | "updatedAt" | "totalRuns"> & {
  useParams: boolean;
  params: CommandParam[];
};

function emptyDraft(): DraftTemplate {
  return {
    name: "",
    description: "",
    type: "SHELL",
    workingDir: "",     // 留空，下发时按默认 /root
    runAsUser: "",      // 留空，下发时按默认 root
    timeoutSec: 60,
    content: "",
    useParams: false,
    params: [],
    createdBy: "admin@acompany.com",
  };
}

function fromTemplate(t: CommandTemplate): DraftTemplate {
  return {
    name: t.name,
    description: t.description ?? "",
    type: t.type,
    workingDir: t.workingDir,
    runAsUser: t.runAsUser,
    timeoutSec: t.timeoutSec,
    content: t.content,
    useParams: t.useParams ?? false,
    params: t.params ? t.params.map((p) => ({ ...p })) : [],
    createdBy: t.createdBy,
  };
}

/** 从命令内容中提取所有 {{key}} 占位符 */
function extractRefKeys(content: string): string[] {
  const re = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) set.add(m[1]);
  return Array.from(set);
}

export default function CreateCommandDialog({ open, onOpenChange, template, onSaved }: Props) {
  const [draft, setDraft] = useState<DraftTemplate>(() => template ? fromTemplate(template) : emptyDraft());
  const [showDangerConfirm, setShowDangerConfirm] = useState<{ reasons: string[] } | null>(null);

  // 弹窗每次打开时重置 draft（避免上次残留）
  useEffect(() => {
    if (open) {
      setDraft(template ? fromTemplate(template) : emptyDraft());
    }
  }, [open, template]);

  // 命令内容里实际引用到的 {{key}}
  const refKeys = useMemo(() => extractRefKeys(draft.content), [draft.content]);
  // 已定义但内容里没引用到的参数（提示用户清理）
  const unusedKeys = useMemo(() => {
    if (!draft.useParams) return [];
    return draft.params.map((p) => p.key).filter((k) => k && !refKeys.includes(k));
  }, [draft.useParams, draft.params, refKeys]);
  // 内容里引用了但未定义的 {{key}}（提示用户补全）
  const undefinedKeys = useMemo(() => {
    if (!draft.useParams) return refKeys; // 未开启参数但写了 {{}}，全部算未定义提示
    const definedSet = new Set(draft.params.map((p) => p.key));
    return refKeys.filter((k) => !definedSet.has(k));
  }, [draft.useParams, draft.params, refKeys]);

  // 校验
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const name = draft.name.trim();
    if (!name) e.name = "命令名称不能为空";
    else if (new TextEncoder().encode(name).length > 60) e.name = "名称不能超过 60 个字节";
    else if (!NAME_REGEX.test(name)) e.name = "仅支持中文、英文、数字、下划线、分隔符\"-\"、小数点";
    if (!draft.content.trim()) e.content = "命令内容不能为空";
    if (draft.timeoutSec < 1 || draft.timeoutSec > 86400) e.timeoutSec = "超时时间需在 1~86400 秒之间";
    // 参数校验
    if (draft.useParams) {
      const seen = new Set<string>();
      for (let i = 0; i < draft.params.length; i++) {
        const p = draft.params[i];
        if (!p.key.trim()) {
          e[`param_${i}`] = "变量名不能为空";
        } else if (!PARAM_KEY_REGEX.test(p.key)) {
          e[`param_${i}`] = "变量名仅支持字母、数字、下划线，且不能以数字开头";
        } else if (seen.has(p.key)) {
          e[`param_${i}`] = "变量名重复";
        }
        seen.add(p.key);
      }
    }
    return e;
  }, [draft]);

  const update = <K extends keyof DraftTemplate>(key: K, value: DraftTemplate[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const updateParam = (idx: number, patch: Partial<CommandParam>) => {
    setDraft((d) => ({
      ...d,
      params: d.params.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
  };

  const addParam = (prefilledKey?: string) => {
    setDraft((d) => ({
      ...d,
      params: [...d.params, { key: prefilledKey ?? "", defaultValue: "", description: "" }],
    }));
  };

  const removeParam = (idx: number) => {
    setDraft((d) => ({ ...d, params: d.params.filter((_, i) => i !== idx) }));
  };

  /** 一键导入命令内容里检测到但未定义的 {{key}} */
  const importUndefinedKeys = () => {
    if (undefinedKeys.length === 0) return;
    setDraft((d) => ({
      ...d,
      params: [
        ...d.params,
        ...undefinedKeys.map((k) => ({ key: k, defaultValue: "", description: "" })),
      ],
    }));
    toast.success(`已导入 ${undefinedKeys.length} 个变量`);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      toast.error("请修正表单错误后再保存");
      return;
    }
    // 危险命令检测
    const detect = detectDangerousCommand(draft.content);
    if (detect.dangerous) {
      setShowDangerConfirm({ reasons: detect.reasons });
      return;
    }
    finalizeSave();
  };

  const finalizeSave = () => {
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const persistedParams = draft.useParams ? draft.params.map((p) => ({ ...p })) : undefined;
    const persistedUseParams = draft.useParams && draft.params.length > 0 ? true : false;

    if (template) {
      // 编辑
      const updated: CommandTemplate = {
        ...template,
        name: draft.name,
        description: draft.description,
        type: draft.type,
        workingDir: draft.workingDir,
        runAsUser: draft.runAsUser,
        timeoutSec: draft.timeoutSec,
        content: draft.content,
        useParams: persistedUseParams,
        params: persistedParams,
        updatedAt: now,
      };
      const idx = MOCK_COMMAND_TEMPLATES.findIndex((x) => x.id === template.id);
      if (idx >= 0) MOCK_COMMAND_TEMPLATES[idx] = updated;
      toast.success("命令已更新");
      onSaved(updated);
    } else {
      // 新建
      const created: CommandTemplate = {
        name: draft.name,
        description: draft.description,
        type: draft.type,
        workingDir: draft.workingDir,
        runAsUser: draft.runAsUser,
        timeoutSec: draft.timeoutSec,
        content: draft.content,
        useParams: persistedUseParams,
        params: persistedParams,
        createdBy: draft.createdBy,
        id: `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
        totalRuns: 0,
      };
      MOCK_COMMAND_TEMPLATES.unshift(created);
      toast.success("命令已创建", { description: "可在右侧操作中直接「下发执行」" });
      onSaved(created);
    }
    setShowDangerConfirm(null);
    onOpenChange(false);
  };

  const isEdit = !!template;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg leading-none font-semibold">
              {isEdit ? "编辑命令" : "创建命令"}
            </DialogTitle>
            <DialogDescription>
              命令将沉淀为可复用的命令模板，支持后续重复下发。
            </DialogDescription>
          </DialogHeader>

          {/* 信息提示（参考 TAT 已创建数提示） */}
          <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            您已创建 <span className="font-semibold">{MOCK_COMMAND_TEMPLATES.length}</span> 个命令（最多 500 个）
          </div>

          <div className="space-y-4">
            {/* 命令名称 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                命令名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="名称仅支持中文、英文、数字、下划线、分隔符&quot;-&quot;、小数点，最大长度不能超过60个字节"
                className="h-9"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* 命令类型 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">命令类型</Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 h-9 rounded-md border border-blue-200 bg-blue-50 text-sm font-medium text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  SHELL
                </span>
              </div>
            </div>

            {/* 执行路径 + 执行用户（一行） */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5">执行路径</Label>
                <Input
                  value={draft.workingDir}
                  onChange={(e) => update("workingDir", e.target.value)}
                  placeholder="非必填，默认为 /root"
                  className="h-9 font-mono"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5">执行用户</Label>
                <Input
                  value={draft.runAsUser}
                  onChange={(e) => update("runAsUser", e.target.value)}
                  placeholder="非必填，默认为 root"
                  className="h-9 font-mono"
                />
              </div>
            </div>

            {/* 超时时间（带 Tooltip 解释） */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                超时时间
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[260px] text-xs leading-relaxed">
                    可设置范围 1~86400 秒，默认 60 秒。超时后，会强制终止命令执行进程。
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center gap-2 max-w-[240px]">
                <Input
                  type="number"
                  min={1}
                  max={86400}
                  value={draft.timeoutSec}
                  onChange={(e) => update("timeoutSec", Number(e.target.value) || 60)}
                  className="h-9 tabular-nums"
                />
                <span className="text-sm text-gray-500">秒</span>
              </div>
              {errors.timeoutSec && <p className="text-xs text-red-600 mt-1">{errors.timeoutSec}</p>}
            </div>

            {/* 命令内容 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                命令内容 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={draft.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder={
                  draft.useParams
                    ? "#!/bin/bash\necho 'hello {{name}}'"
                    : "#!/bin/bash\necho 'hello world'"
                }
                className="font-mono text-xs leading-5 min-h-[180px] bg-gray-50 border-gray-200"
                style={{ resize: "vertical" }}
              />
              {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content}</p>}
            </div>

            {/* 使用参数（开关 + 变量定义表格） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  使用参数
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[280px] text-xs leading-relaxed">
                      您在命令中设置的变量值，以 <span className="font-mono">{"{{key}}"}</span> 的形式表示。下发命令时可覆盖默认值，便于一份命令复用到不同场景。
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  checked={draft.useParams}
                  onCheckedChange={(v) => update("useParams", v)}
                />
              </div>

              {draft.useParams && (
                <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
                  {/* 未定义的 {{key}} 提示 */}
                  {undefinedKeys.length > 0 && (
                    <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-md px-2.5 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <div className="flex-1 text-amber-700 leading-relaxed">
                        命令内容中引用了
                        {undefinedKeys.map((k, i) => (
                          <span key={k}>
                            {i > 0 && "、"}
                            <span className="font-mono mx-0.5">{`{{${k}}}`}</span>
                          </span>
                        ))}
                        ，但尚未定义。
                      </div>
                      <button
                        type="button"
                        onClick={importUndefinedKeys}
                        className="text-amber-700 hover:text-amber-900 underline shrink-0"
                      >
                        一键添加
                      </button>
                    </div>
                  )}

                  {/* 已定义但内容里没用到的 key 提示 */}
                  {unusedKeys.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 px-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 leading-relaxed">
                        变量
                        {unusedKeys.map((k, i) => (
                          <span key={k}>
                            {i > 0 && "、"}
                            <span className="font-mono mx-0.5 text-gray-700">{k}</span>
                          </span>
                        ))}
                        未在命令内容中引用，可以删除或改用 <span className="font-mono">{"{{key}}"}</span> 引用。
                      </div>
                    </div>
                  )}

                  {/* 参数列表表头 */}
                  {draft.params.length > 0 && (
                    <div className="grid grid-cols-12 gap-2 px-1 text-[11px] text-gray-400 font-medium">
                      <div className="col-span-3">变量名</div>
                      <div className="col-span-4">默认值</div>
                      <div className="col-span-4">说明</div>
                      <div className="col-span-1" />
                    </div>
                  )}

                  {/* 参数列表 */}
                  {draft.params.map((p, idx) => {
                    const err = errors[`param_${idx}`];
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-3">
                          <Input
                            value={p.key}
                            onChange={(e) => updateParam(idx, { key: e.target.value })}
                            placeholder="如 port"
                            className={`h-8 text-xs font-mono ${err ? "border-red-400" : ""}`}
                          />
                          {err && <p className="text-[10px] text-red-600 mt-0.5">{err}</p>}
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={p.defaultValue}
                            onChange={(e) => updateParam(idx, { defaultValue: e.target.value })}
                            placeholder="默认值"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={p.description ?? ""}
                            onChange={(e) => updateParam(idx, { description: e.target.value })}
                            placeholder="选填，下发时给操作者看的提示"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeParam(idx)}
                            className="h-8 w-8 inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="删除变量"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 添加参数按钮 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => addParam()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加变量
                  </Button>
                </div>
              )}
            </div>

            {/* 备注 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5">备注</Label>
              <Input
                value={draft.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="选填，用于团队成员理解命令用途"
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              {isEdit ? "保存修改" : "创建命令"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 危险命令二次确认 */}
      <Dialog open={!!showDangerConfirm} onOpenChange={(v) => !v && setShowDangerConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg leading-none font-semibold text-red-600">
              检测到高危命令
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-700">命令内容中包含以下高危操作：</p>
            <ul className="text-sm text-red-700 space-y-1 pl-4 list-disc bg-red-50 rounded-lg p-3">
              {showDangerConfirm?.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500">
              建议先开启「灰度执行」在 1 台实例上验证，再批量下发到生产环境。
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDangerConfirm(null)}>
              返回修改
            </Button>
            <Button variant="destructive" onClick={finalizeSave}>
              我已了解，仍然保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
