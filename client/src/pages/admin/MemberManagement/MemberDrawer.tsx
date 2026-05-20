/**
 * 用户查看配置抽屉
 * 展示用户的基本信息 + 归属分组 + 加法型资源 + 唯一型资源 + 最终生效值
 *
 * v2.0：数据模型改为 UserOrg { groupIds, primaryGroupId, primaryGroupValid }
 *   - 主部门：来自 primaryGroupId 对应的 oneid-dept 节点（全路径）
 *   - 兼任：groupIds 里剩余的 oneid-dept 节点
 *   - 用户组：groupIds 里的 oneid-group 节点
 *   - 自建分组：groupIds 里的 manual 节点
 */
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AlertTriangle } from "lucide-react";
import type { UserOrg, UserOverrideInfo, UserGroup } from "./types";
import {
  MOCK_EFFECTIVE_CONFIG,
  MOCK_GROUPS,
  getPrimaryDeptPath,
} from "./mock";

interface MemberDrawerProps {
  user: UserOrg | null;
  info?: UserOverrideInfo;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 可传入当前模式的分组集合（OneID 或 manual），默认为 MOCK_GROUPS */
  groups?: UserGroup[];
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </div>
      <div
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0">
      <div className="w-20 shrink-0 text-sm text-gray-500">{label}</div>
      <div className="flex-1 min-w-0 text-sm text-gray-900 break-words">
        {value}
      </div>
      {hint && (
        <div className="text-xs text-gray-400 shrink-0 tabular-nums">{hint}</div>
      )}
    </div>
  );
}

function getGroupPath(id: string, groups: UserGroup[]): string {
  const map = new Map(groups.map((g) => [g.id, g]));
  const chain: string[] = [];
  let cur = map.get(id);
  while (cur) {
    chain.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return chain.join(" / ");
}

export default function MemberDrawer({
  user,
  info,
  open,
  onOpenChange,
  groups = MOCK_GROUPS,
}: MemberDrawerProps) {
  if (!user) return null;

  const cfg = MOCK_EFFECTIVE_CONFIG[user.userId] ?? {};

  // 主部门（仅 OneID 模式）
  const primaryPath = getPrimaryDeptPath(user.primaryGroupId, groups);

  // 分离兼任部门 / 用户组 / 自建分组
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const secondaryDepts = user.groupIds
    .filter((gid) => {
      const g = groupMap.get(gid);
      return (
        g?.source === "oneid-dept" && gid !== user.primaryGroupId
      );
    })
    .map((gid) => getGroupPath(gid, groups));
  const oneidGroups = user.groupIds
    .filter((gid) => groupMap.get(gid)?.source === "oneid-group")
    .map((gid) => groupMap.get(gid)?.name ?? gid);
  const manualGroups = user.groupIds
    .filter((gid) => groupMap.get(gid)?.source === "manual")
    .map((gid) => groupMap.get(gid)?.name ?? gid);

  const hasConflict = info?.status === "groupConflict";
  const hasMissing = info?.status === "primaryDeptMissing";
  const isMultiGroup = user.groupIds.length >= 2;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[600px] !max-w-none p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-100">
          <SheetTitle className="text-lg">
            {user.displayName}
            <span className="ml-2 text-sm font-normal text-gray-500">
              {user.userId}
            </span>
          </SheetTitle>
          <div className="text-xs text-gray-500 mt-1">
            查看该用户的最终生效配置
          </div>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto px-6 py-5"
          style={{ background: "#FAFBFF" }}
        >
          {(hasConflict || hasMissing) && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 leading-relaxed">
                {hasMissing
                  ? "该用户主部门无效（为空 / 已被删除），请在 OneID 侧修正。"
                  : "该用户存在唯一型资源的分组冲突，当前按「最新绑定」兜底，建议管理员显式裁决。"}
              </p>
            </div>
          )}

          {/* 基本信息 */}
          <Section title="基本信息">
            {user.primaryGroupId !== null && (
              <Row
                label="主部门"
                value={
                  <div className="flex items-center gap-2">
                    <span>{primaryPath}</span>
                    {!user.primaryGroupValid && (
                      <span className="text-[10px] bg-red-50 text-red-600 rounded px-1.5 py-0.5">
                        无效
                      </span>
                    )}
                  </div>
                }
              />
            )}
            {secondaryDepts.length > 0 && (
              <Row
                label="兼任部门"
                value={
                  <div className="space-y-1">
                    {secondaryDepts.map((p, i) => (
                      <div key={i} className="text-sm text-gray-700">
                        {p}
                      </div>
                    ))}
                  </div>
                }
              />
            )}
            <Row
              label="所在分组"
              value={
                oneidGroups.length + manualGroups.length === 0 ? (
                  <span className="text-gray-400">未加入分组</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {oneidGroups.map((g) => (
                      <span
                        key={"og-" + g}
                        className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5"
                      >
                        {g}
                      </span>
                    ))}
                    {manualGroups.map((g) => (
                      <span
                        key={"mg-" + g}
                        className="text-xs bg-purple-50 text-purple-600 rounded-full px-2 py-0.5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )
              }
              hint={isMultiGroup ? "多归属" : undefined}
            />
          </Section>

          {/* 加法型资源 */}
          <Section title="加法型资源（并集）">
            <Row
              label="可见模型"
              value={
                (cfg.models ?? []).length === 0 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(cfg.models ?? []).map((m) => (
                      <span
                        key={m}
                        className="text-xs bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 border border-gray-100"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )
              }
              hint={`${(cfg.models ?? []).length} 项`}
            />
            <Row
              label="可见通道"
              value={
                (cfg.channels ?? []).length === 0 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(cfg.channels ?? []).map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 border border-gray-100"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )
              }
              hint={`${(cfg.channels ?? []).length} 项`}
            />
            <Row
              label="技能"
              value={<span className="text-gray-400">未配置</span>}
            />
            <Row
              label="工具"
              value={<span className="text-gray-400">未配置</span>}
            />
          </Section>

          {/* 唯一型资源 */}
          <Section title="唯一型资源（按优先级取首个）">
            <Row
              label="安全组"
              value={
                <span className="font-mono text-xs text-gray-900">
                  {cfg.securityGroup ?? "—"}
                </span>
              }
            />
            <Row
              label="VPC"
              value={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-900">
                    {cfg.vpc ?? "—"}
                  </span>
                  {hasConflict && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 rounded px-1.5 py-0.5">
                      未裁决
                    </span>
                  )}
                </div>
              }
            />
            <Row
              label="记忆"
              value={
                <span className="font-mono text-xs text-gray-900">
                  {cfg.memory ?? "—"}
                </span>
              }
            />
            <Row
              label="镜像"
              value={
                <span className="font-mono text-xs text-gray-900">
                  {cfg.image ?? "—"}
                </span>
              }
            />
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
