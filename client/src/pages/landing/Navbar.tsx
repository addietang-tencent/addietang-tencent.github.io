/**
 * Navbar - 顶部导航栏
 * 滚动时通过 .is-scrolled 切换样式（由 index.tsx 监听 scroll 注入）
 */
import { useLocation } from "wouter";

export default function Navbar() {
  const [, navigate] = useLocation();

  const handleLogin = () => {
    // 跳转到 SSO 登录页（已有的 demo 路由）
    navigate("/demo/sso-login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/landing-assets/60.svg" alt="ClawPro" width={28} height={28} />
        <span>ClawPro</span>
      </div>
      <div className="navbar-login" onClick={handleLogin} role="button" tabIndex={0}>
        登录
      </div>
    </nav>
  );
}
