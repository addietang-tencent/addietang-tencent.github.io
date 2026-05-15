/**
 * SsoLoginDemo - 已废弃
 *
 * 此页面原本是旧版 Landing 的"未登录态克隆体"（A企业企业版OpenClaw + 龙虾 + 立刻创建），
 * 与新版 Landing（pages/landing/index.tsx）共存造成混淆。
 *
 * 现已废弃：访问 /demo/sso-login 会立即重定向到新版 Landing 首页 `/`。
 *
 * 注意：保留本文件是为了不修改 App.tsx 的路由表。
 */
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SsoLoginDemo() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // 立即重定向到新版 Landing 首页
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
