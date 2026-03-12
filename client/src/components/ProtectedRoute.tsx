/**
 * ProtectedRoute - 路由保护组件
 * 未登录时显示登录弹窗，登录后渲染子内容
 */
import { useState, useEffect } from "react";
import { useUserRole } from "@/contexts/UserRoleContext";
import LoginModal from "./LoginModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isLoggedIn, isAdmin } = useUserRole();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <>
        {/* 背景遮罩（模糊效果） */}
        <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm" />
        <LoginModal open={showLogin} onSuccess={() => setShowLogin(false)} />
      </>
    );
  }

  // 已登录但需要管理员权限
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">无访问权限</h2>
          <p className="text-sm text-gray-500">此页面仅限管理员访问</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
