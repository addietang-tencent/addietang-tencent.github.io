/**
 * ImageStatusBadge - 镜像状态徽章（圆点 + 文案）
 *
 * 状态映射：
 *   - available → 可用（绿）
 *   - creating  → 创建中（黄）
 *   - failed / error → 异常（红）
 *
 * 主表行（AgentTypesTable）与切换镜像弹窗（SwitchImageDialog）共用。
 */
const STATUS_MAP: Record<
  string,
  { text: string; dotClass: string; textClass: string }
> = {
  available: { text: "可用", dotClass: "bg-green-500", textClass: "text-gray-600" },
  creating: { text: "创建中", dotClass: "bg-amber-500", textClass: "text-amber-600" },
  failed: { text: "异常", dotClass: "bg-red-500", textClass: "text-red-600" },
  error: { text: "异常", dotClass: "bg-red-500", textClass: "text-red-600" },
};

export function ImageStatusBadge({ status }: { status: string }) {
  const c = STATUS_MAP[status] ?? STATUS_MAP.available;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${c.textClass} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dotClass}`} />
      {c.text}
    </span>
  );
}
