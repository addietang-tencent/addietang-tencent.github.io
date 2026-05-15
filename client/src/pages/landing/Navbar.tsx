/**
 * Navbar - 顶部导航栏
 * 滚动时通过 .is-scrolled 切换样式（由 index.tsx 监听 scroll 注入）
 *
 * 登录交互：点击「登录」直接在当前 Landing 页弹出 SSO 登录弹窗，
 * 不再跳转到独立的登录页（避免与旧版 Landing 共存）。
 */
import { useState } from "react";
import SsoLoginDialog from "@/components/SsoLoginDialog";

export default function Navbar() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleLoginKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/landing-assets/60.svg" alt="ClawPro" width={28} height={28} />
          <span>ClawPro</span>
        </div>
        <div
          className="navbar-login"
          onClick={handleLogin}
          onKeyDown={handleLoginKeyDown}
          role="button"
          tabIndex={0}
        >
          登录
        </div>
      </nav>

      <SsoLoginDialog
        visible={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
      />
    </>
  );
}
