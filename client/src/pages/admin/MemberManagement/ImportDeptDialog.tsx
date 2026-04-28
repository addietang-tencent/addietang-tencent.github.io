/**
 * OneID 组织架构导入弹窗
 *
 * 场景：在分组视图左列上方点「导入组织架构」→ 打开此弹窗
 *   - 展示 OneID 全量组织架构（mock：固定列表），树状多选
 *   - 已同步的节点显示「已同步」徽标，checkbox 默认勾选且不可取消（取消同步请到列表）
 *   - 勾选包含子孙开关：默认勾选
 *   - 确定后调用 onImport，回传"需新增的节点 id 列表"
 *
 * 注意：本期仅提供 UI + 交互，实际同步由父组件调用 mock 落地。
 */
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ─── OneID 全量组织架构 mock（包含当前未同步节点） ──
interface OneidDeptNode {
  id: string; // 对应 externalId
  name: string;
  parentId: string | null;
}

// 这里 mock 给比当前已同步略多几个节点，便于演示"新增"
const ONEID_FULL_DEPTS: OneidDeptNode[] = [
  { id: "dept-root", name: "全公司", parentId: null },
  { id: "dept-tech", name: "技术部", parentId: "dept-root" },
  { id: "dept-fe", name: "前端组", parentId: "dept-tech" },
  { id: "dept-be", name: "后端组", parentId: "dept-tech" },
  { id: "dept-ai", name: "AI 组", parentId: "dept-tech" },
  // ↓ 未同步的新部门（用于演示"导入新增"）
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

// ─── 树结构 ─────────────────────────────────────────────
interface TreeNode extends OneidDeptNode {
  children: TreeNode[];
  depth: number;
}

function buildTree(nodes: OneidDeptNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [], depth: 0 }));
  const roots: TreeNode[] = [];
  nodes.forEach((n) => {
    const tn = map.get(n.id)!;
    if (n.parentId && map.has(n.parentId)) {
      const p = map.get(n.parentId)!;
      p.children.push(tn);
      tn.depth = p.depth + 1;
    } else {
      roots.push(tn);
    }
  });
  return roots;
}

interface ImportDeptDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 当前已同步的 externalId 集合 */
  syncedIds: Set<string>;
  /** 确认导入；入参为需新增的节点 id 数组 */
  onImport: (addedIds: string[]) => void;
}

export default function ImportDeptDialog({
  open,
  onOpenChange,
  syncedIds,
  onImport,
}: ImportDeptDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    new Set(ONEID_FULL_DEPTS.filter((n) => n.parentId === null).map((n) => n.id))
  );
  // 用户主动勾选的 id（不包含已同步的——它们自动计入）
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(ONEID_FULL_DEPTS), []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const isSelected = (id: string) =>
    syncedIds.has(id) || selected.has(id);

  const toggleSelect = (id: string, includeDescendants: boolean) => {
    if (syncedIds.has(id)) return; // 已同步不可取消
    setSelected((prev) => {
      const n = new Set(prev);
      const willAdd = !n.has(id);
      const collect = (nodeId: string) => {
        const node = ONEID_FULL_DEPTS.find((d) => d.id === nodeId);
        if (!node) return;
        if (!syncedIds.has(nodeId)) {
          if (willAdd) n.add(nodeId);
          else n.delete(nodeId);
        }
        if (includeDescendants) {
          ONEID_FULL_DEPTS.filter((d) => d.parentId === nodeId).forEach((c) =>
            collect(c.id)
          );
        }
      };
      collect(id);
      return n;
    });
  };

  const matchKw = (name: string) =>
    !keyword.trim() ||
    name.toLowerCase().includes(keyword.trim().toLowerCase());

  const renderNode = (n: TreeNode): React.ReactNode => {
    const hasChildren = n.children.length > 0;
    const isExpanded = expanded.has(n.id);
    const synced = syncedIds.has(n.id);
    const checked = isSelected(n.id);

    // 搜索命中自身或子孙才显示
    const selfMatch = matchKw(n.name);
    const childRenders = n.children.map(renderNode).filter(Boolean);
    if (!selfMatch && childRenders.length === 0) return null;

    return (
      <div key={n.id}>
        <div
          className="flex items-center gap-2 h-9 pr-3 hover:bg-gray-50 rounded-lg transition-colors"
          style={{ paddingLeft: 8 + n.depth * 20 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(n.id)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}

          <Checkbox
            checked={checked}
            disabled={synced}
            onCheckedChange={() => toggleSelect(n.id, true)}
          />
          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-800 flex-1 truncate">{n.name}</span>
          {synced && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              已同步
            </span>
          )}
        </div>
        {hasChildren && isExpanded && <div>{childRenders}</div>}
      </div>
    );
  };

  const addedCount = selected.size;

  const handleConfirm = () => {
    if (addedCount === 0) {
      toast.info("未选择任何新节点");
      onOpenChange(false);
      return;
    }
    onImport(Array.from(selected));
    toast.success(`已同步 ${addedCount} 个 OneID 组织架构节点`);
    setSelected(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle>从 OneID 导入组织架构</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            勾选需要同步到本地的组织架构节点。同步进来的节点在本地只读，变更请在 OneID 侧操作。
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="搜索部门名称..."
              className="pl-9 h-8 text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div
          className="mx-6 my-3 border border-gray-100 rounded-xl overflow-y-auto"
          style={{ height: 360 }}
        >
          <div className="py-2">{tree.map(renderNode)}</div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500 mr-auto">
            本次新增 <span className="text-gray-900 font-medium">{addedCount}</span> 项；
            已同步 <span className="text-gray-900 font-medium">{syncedIds.size}</span> 项
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            size="sm"
            className="text-white"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            onClick={handleConfirm}
          >
            确定导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
