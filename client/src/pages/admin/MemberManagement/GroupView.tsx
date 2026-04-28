/**
 * 分组视图容器（v2.0）
 *
 * 布局：
 *   - 常驻 Alert：当存在任何多归属用户时显示（不可关闭，§4.1）
 *   - 主体：左多层级树（含正常/异常筛选、搜索、健康圆点）+ 右内容面板（成员 / 配置总览）
 *   - 组织架构区域：初始空白，管理员点击"同步组织架构作为分组"后才同步全部
 *   - 底部固定"未分组"项
 */
import React, { useMemo, useState, useCallback } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";

import GroupList, { UNASSIGNED_GROUP_ID } from "./GroupList";
import NodeContentPanel from "./NodeContentPanel";
import { GroupFormDialog, DeleteGroupDialog } from "./GroupDialog";

import type { UserGroup, UserOrg, UserOverrideInfo } from "./types";
import {
  countMultiGroupUsers,
  getUsersOfGroupDeep,
  buildGroupTree,
  findGroupNode,
} from "./health";
import { MOCK_GROUPS, MOCK_MANUAL_GROUPS, MOCK_USERS_MANUAL } from "./mock";

// OneID 全量组织架构 mock（同步时一次性全部拉取）
const ONEID_ALL_DEPT_NODES: Array<{
  id: string;
  name: string;
  parentId: string | null;
}> = [
  { id: "dept-root", name: "全公司", parentId: null },
  { id: "dept-tech", name: "技术部", parentId: "dept-root" },
  { id: "dept-fe", name: "前端组", parentId: "dept-tech" },
  { id: "dept-be", name: "后端组", parentId: "dept-tech" },
  { id: "dept-ai", name: "AI 组", parentId: "dept-tech" },
  { id: "dept-devops", name: "运维组", parentId: "dept-tech" },
  { id: "dept-qa", name: "测试组", parentId: "dept-tech" },
  { id: "dept-product", name: "产品部", parentId: "dept-root" },
  { id: "dept-pm", name: "产品策划", parentId: "dept-product" },
  { id: "dept-design", name: "设计组", parentId: "dept-product" },
  { id: "dept-operation", name: "运营组", parentId: "dept-product" },
  { id: "dept-hr", name: "人力资源", parentId: "dept-root" },
  { id: "dept-finance", name: "财务部", parentId: "dept-root" },
  { id: "dept-legal", name: "法务部", parentId: "dept-root" },
];

interface GroupViewProps {
  /** 是否开启 OneID 模式。OneID：使用 oneid-dept + oneid-group；普通：使用 manual */
  hasOneid: boolean;
  users: UserOrg[];
  overrides: Record<string, UserOverrideInfo>;
  onResolveConflict: (userId: string, winnerResourceId: string) => void;
}

export default function GroupView({
  hasOneid,
  users,
  overrides,
  onResolveConflict,
}: GroupViewProps) {
  // OneID 模式下，组织架构初始未同步，需管理员手动触发
  const [deptSynced, setDeptSynced] = useState(false);
  const [isSyncingDepts, setIsSyncingDepts] = useState(false);

  // OneID 模式下，用户组初始也未同步
  const [ogSynced, setOgSynced] = useState(false);
  const [isRefreshingOg, setIsRefreshingOg] = useState(false);

  // 分组集合：OneID 模式初始为空（组织架构和用户组都需要手动同步），组织架构需要同步后才加入
  const [groups, setGroups] = useState<UserGroup[]>(() => {
    if (hasOneid) {
      // 初始为空，组织架构和用户组都需要手动触发
      return [];
    }
    return MOCK_MANUAL_GROUPS;
  });

  // OneID 切换时切换分组集合
  React.useEffect(() => {
    if (hasOneid) {
      // 重置为初始状态：空
      setGroups([]);
      setDeptSynced(false);
      setOgSynced(false);
    } else {
      setGroups(MOCK_MANUAL_GROUPS);
      setDeptSynced(false);
      setOgSynced(false);
    }
  }, [hasOneid]);

  // 用户数据源
  const effectiveUsers = useMemo<UserOrg[]>(
    () => (hasOneid ? users : MOCK_USERS_MANUAL),
    [hasOneid, users]
  );

  const [selectedId, setSelectedId] = useState<string>(() => groups[0]?.id ?? "");

  // 选中项回退保护
  React.useEffect(() => {
    if (
      selectedId !== UNASSIGNED_GROUP_ID &&
      !groups.find((g) => g.id === selectedId)
    ) {
      setSelectedId(groups[0]?.id ?? "");
    }
  }, [groups, selectedId]);

  const selectedGroup = selectedId === UNASSIGNED_GROUP_ID
    ? null
    : groups.find((g) => g.id === selectedId);
  const tree = useMemo(() => buildGroupTree(groups), [groups]);
  const selectedNode = selectedGroup
    ? findGroupNode(tree, selectedGroup.id)
    : null;

  // 节点成员统计（含子孙聚合）
  const groupUsers = useMemo(() => {
    if (selectedId === UNASSIGNED_GROUP_ID) {
      // 未分组用户：不属于当前已加载分组的用户
      const loadedGroupIds = new Set(groups.map((g) => g.id));
      if (loadedGroupIds.size === 0) return effectiveUsers; // 没有分组 → 全部
      return effectiveUsers.filter(
        (u) => !u.groupIds.some((gid) => loadedGroupIds.has(gid))
      );
    }
    return selectedGroup
      ? getUsersOfGroupDeep(selectedGroup.id, groups, effectiveUsers)
      : [];
  }, [selectedId, selectedGroup, groups, effectiveUsers]);

  const multiGroupCount = useMemo(
    () => countMultiGroupUsers(effectiveUsers),
    [effectiveUsers]
  );

  // 一键同步全部组织架构
  const handleSyncDepts = () => {
    setIsSyncingDepts(true);
    // 模拟同步延迟
    setTimeout(() => {
      const deptGroups: UserGroup[] = ONEID_ALL_DEPT_NODES.map((n) => ({
        id: n.id,
        name: n.name,
        parentId: n.parentId,
        source: "oneid-dept" as const,
        readonly: true,
        externalId: n.id,
        syncBatchId: "oneid-org",
        createdAt: new Date().toISOString(),
      }));
      setGroups((prev) => {
        // 移除旧的 oneid-dept，加入全量
        const withoutDept = prev.filter((g) => g.source !== "oneid-dept");
        return [...withoutDept, ...deptGroups];
      });
      setDeptSynced(true);
      setIsSyncingDepts(false);
      toast.success(`已同步 ${ONEID_ALL_DEPT_NODES.length} 个组织架构节点`);
    }, 1200);
  };

  // 刷新用户组（mock：加载 oneid-group 类型的分组数据）
  const handleRefreshOg = () => {
    setIsRefreshingOg(true);
    setTimeout(() => {
      const ogGroups = MOCK_GROUPS.filter((g) => g.source === "oneid-group");
      setGroups((prev) => {
        const withoutOg = prev.filter((g) => g.source !== "oneid-group");
        return [...withoutOg, ...ogGroups];
      });
      setOgSynced(true);
      setIsRefreshingOg(false);
      toast.success(`已刷新 ${ogGroups.length} 个用户组`);
    }, 800);
  };

  // ─── 分组 CRUD（普通模式） ────────────────────────────────
  type FormMode = "create" | "edit" | "addChild";
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formTarget, setFormTarget] = useState<{
    id: string;
    name: string;
    parentId: string | null;
  } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 新建分组
  const handleCreateGroup = () => {
    setFormMode("create");
    setFormTarget(null);
    setFormOpen(true);
  };

  // 添加子分组
  const handleAddChildGroup = (parentId: string) => {
    const parent = groups.find((g) => g.id === parentId);
    if (!parent) return;
    setFormMode("addChild");
    setFormTarget({ id: parent.id, name: parent.name, parentId: parent.parentId });
    setFormOpen(true);
  };

  // 编辑分组
  const handleEditGroup = (groupId: string) => {
    const g = groups.find((g) => g.id === groupId);
    if (!g) return;
    setFormMode("edit");
    setFormTarget({ id: g.id, name: g.name, parentId: g.parentId });
    setFormOpen(true);
  };

  // 确认新建/编辑/添加子分组
  const handleFormConfirm = (name: string, parentId: string | null) => {
    if (formMode === "edit" && formTarget) {
      // 编辑
      setGroups((prev) =>
        prev.map((g) =>
          g.id === formTarget.id ? { ...g, name, parentId } : g
        )
      );
      toast.success("分组已更新");
    } else {
      // 新建 / 添加子分组
      const newGroup: UserGroup = {
        id: `manual-${Date.now()}`,
        name,
        parentId,
        source: "manual",
        readonly: false,
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newGroup]);
      setSelectedId(newGroup.id);
      toast.success("分组已创建");
    }
    setFormOpen(false);
  };

  // 删除分组
  const handleOpenDelete = (groupId: string) => {
    const g = groups.find((g) => g.id === groupId);
    if (!g) return;
    setDeleteTarget({ id: g.id, name: g.name });
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = (groupId: string) => {
    // 删除该分组及其所有子孙
    const toDelete = new Set<string>();
    const addDescendants = (id: string) => {
      toDelete.add(id);
      groups.filter((g) => g.parentId === id).forEach((g) => addDescendants(g.id));
    };
    addDescendants(groupId);

    setGroups((prev) => prev.filter((g) => !toDelete.has(g.id)));
    setDeleteOpen(false);
    setDeleteTarget(null);
    if (toDelete.has(selectedId)) {
      const remaining = groups.filter((g) => !toDelete.has(g.id));
      setSelectedId(remaining.length > 0 ? remaining[0].id : UNASSIGNED_GROUP_ID);
    }
    toast.success("分组已删除，用户保留");
  };

  // 删除时的成员数统计
  const deleteMemberCount = useMemo(() => {
    if (!deleteTarget) return 0;
    return getUsersOfGroupDeep(deleteTarget.id, groups, effectiveUsers).length;
  }, [deleteTarget, groups, effectiveUsers]);

  // ─── 用户操作（普通模式） ────────────────────────────────
  const [, setUsersVersion] = useState(0);

  // 添加用户到分组
  const handleAddUsersToGroup = useCallback(
    (userIds: string[]) => {
      if (!selectedId || selectedId === UNASSIGNED_GROUP_ID) return;
      // 将 selectedId 加入这些用户的 groupIds
      const usersToUpdate = new Set(userIds);
      const updatedUsers = effectiveUsers.map((u) => {
        if (usersToUpdate.has(u.userId) && !u.groupIds.includes(selectedId)) {
          return { ...u, groupIds: [...u.groupIds, selectedId] };
        }
        return u;
      });
      // 因为 MOCK_USERS_MANUAL 是引用，直接更新对象属性来模拟后端操作
      updatedUsers.forEach((u, idx) => {
        if (usersToUpdate.has(u.userId)) {
          effectiveUsers[idx] = u;
        }
      });
      setUsersVersion((v) => v + 1);
      toast.success(`已添加 ${userIds.length} 名用户到分组`);
    },
    [selectedId, effectiveUsers]
  );

  // 从分组中移除用户
  const handleRemoveFromGroup = useCallback(
    (userId: string) => {
      if (!selectedId || selectedId === UNASSIGNED_GROUP_ID) return;
      const idx = effectiveUsers.findIndex((u) => u.userId === userId);
      if (idx >= 0) {
        effectiveUsers[idx] = {
          ...effectiveUsers[idx],
          groupIds: effectiveUsers[idx].groupIds.filter(
            (gid) => gid !== selectedId
          ),
        };
        setUsersVersion((v) => v + 1);
        toast.success("已从分组中移除");
      }
    },
    [selectedId, effectiveUsers]
  );

  return (
    <div className="space-y-3">
      {/* 常驻多分组 Alert */}
      {multiGroupCount > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-amber-800">
              检测到 <span className="tabular-nums">{multiGroupCount}</span> 位用户同时归属于多个分组
            </div>
            <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              用户端将向这些用户展示其所归属的全部分组列表，由用户自行选择使用哪个分组。请注意：分组名称会直接暴露给终端用户，建议确保分组命名规范、无敏感信息。
            </div>
          </div>
        </div>
      )}

      {/* 主体：左树 + 右内容 */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "288px 1fr" }}
      >
        {/* 左列表 */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            height: "calc(100vh - 220px)",
          }}
        >
          <GroupList
            groups={groups}
            users={effectiveUsers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            deptSynced={hasOneid ? deptSynced : undefined}
            onSyncDepts={handleSyncDepts}
            isSyncingDepts={isSyncingDepts}
            ogSynced={hasOneid ? ogSynced : undefined}
            onRefreshOg={handleRefreshOg}
            isRefreshingOg={isRefreshingOg}
            isManualMode={!hasOneid}
            onCreateGroup={handleCreateGroup}
            onAddChildGroup={handleAddChildGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleOpenDelete}
          />
        </div>

        {/* 右内容 */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            height: "calc(100vh - 220px)",
          }}
        >
          {selectedId === UNASSIGNED_GROUP_ID ? (
            <NodeContentPanel
              nodeId={UNASSIGNED_GROUP_ID}
              nodeName="未分组"
              nodeSource="manual"
              nodeReadonly={false}
              groups={groups}
              nodePath="未分组"
              users={groupUsers}
              hasOneid={hasOneid}
              isManualMode={!hasOneid}
            />
          ) : selectedGroup ? (
            <NodeContentPanel
              nodeId={selectedGroup.id}
              nodeName={selectedGroup.name}
              nodeSource={selectedGroup.source}
              nodeReadonly={selectedGroup.readonly}
              groups={groups}
              nodePath={selectedNode?.path ?? selectedGroup.name}
              users={groupUsers}
              hasOneid={hasOneid}
              isManualMode={!hasOneid}
              allUsers={effectiveUsers}
              onAddUsersToGroup={handleAddUsersToGroup}
              onRemoveFromGroup={handleRemoveFromGroup}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              请选择分组
            </div>
          )}
        </div>
      </div>

      {/* 新建 / 编辑 / 添加子分组弹窗 */}
      <GroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        groups={groups}
        mode={formMode}
        target={formTarget}
        onConfirm={handleFormConfirm}
      />

      {/* 删除分组确认弹窗 */}
      <DeleteGroupDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        group={deleteTarget}
        memberCount={deleteMemberCount}
        groups={groups}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
