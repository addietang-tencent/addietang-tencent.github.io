/**
 * AllUsersTag - 「全部用户」标签组件
 *
 * 管控端所有"全部用户"展示均使用此组件，确保全局样式一致。
 * 基于 StatusTag variant="gray"（灰底黑字）。
 *
 * 用法：
 *   <AllUsersTag />
 */
import { StatusTag } from "@/components/ui/status-tag";

function AllUsersTag() {
  return <StatusTag variant="blue">全部用户</StatusTag>;
}

export { AllUsersTag };
