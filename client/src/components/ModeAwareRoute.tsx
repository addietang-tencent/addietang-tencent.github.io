/**
 * ModeAwareRoute - 模式感知路由包装组件
 * 根据当前管控端模式（标准/自定义）渲染不同的页面组件
 */
import { useAdminMode } from "@/contexts/AdminModeContext";
import { ReactNode } from "react";

interface ModeAwareRouteProps {
  standard: ReactNode;
  custom: ReactNode;
}

export default function ModeAwareRoute({ standard, custom }: ModeAwareRouteProps) {
  const { isStandard } = useAdminMode();
  return <>{isStandard ? standard : custom}</>;
}
