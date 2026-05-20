/**
 * TopNav - 用户端顶部导航壳
 *
 * 设计来源：Figma 公共组件/导航（节点 358:2322 / 297:3719）
 * 视觉规范：
 *   - 容器：高 64px，padding 12px 28px，背景 #FFFFFF（带 95% 半透 + 模糊），
 *           底边 1px solid #E2E8F0
 *   - 布局：CSS Grid 三栏（左 Logo / 中 Tabs / 右功能区）
 *
 * 适配规则：
 *   - 三栏 Grid：1fr auto 1fr，中间栏 justify-self:center 天然居中
 *   - 左右栏内容固定不压缩，中间栏居中且不会与两侧重叠
 *   - < 1200px 时 min-width 锁死，出横向滚动条
 */
import React from "react";
import { Link } from "wouter";

export interface TopNavProps {
  /** 中央 Tab 列表（可选；不传则不渲染中央区） */
  center?: React.ReactNode;
  /** 右侧功能区（图标按钮 / 用户菜单等） */
  right?: React.ReactNode;
  /** 左侧 Logo 点击跳转，默认 "/" */
  logoHref?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 右侧图标按钮之间的竖向分隔线（Figma Vector 5/6/7）
 * 颜色 #E2E8F0，高 13.33px，宽 1px。
 */
export function NavDivider() {
  return (
    <span
      aria-hidden
      className="inline-block h-[14px] w-px bg-[#E2E8F0] flex-shrink-0"
    />
  );
}

export default function TopNav({
  center,
  right,
  logoHref = "/",
  className = "",
}: TopNavProps) {
  return (
    <header
      className={`sticky top-0 z-50 h-[64px] bg-white/95 backdrop-blur-md ${className}`}
      style={{
        borderBottom: "1px solid #E2E8F0",
        minWidth: "1200px",
      }}
    >
      {/* 三栏 Grid：左 1fr / 中 auto / 右 1fr — 中栏天然页面正中 */}
      <div
        className="h-full grid items-center px-10 min-w-[1200px]"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          gap: "24px",
        }}
      >
        {/* 左栏：Logo 靠左 */}
        <div className="justify-self-start min-w-0">
          <Link href={logoHref}>
            <div
              className="flex items-center cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ gap: 8 }}
            >
              <img
                src="/landing-assets/60.svg"
                alt="ClawPro"
                width={28}
                height={28}
                draggable={false}
                className="select-none"
              />
              <span
                className="select-none"
                style={{
                  fontSize: "22.12px",
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontWeight: 600,
                  color: "#000",
                  lineHeight: 1,
                }}
              >
                ClawPro
              </span>
            </div>
          </Link>
        </div>

        {/* 中栏：Segmented Tabs — auto 宽度，天然居中 */}
        <div className="whitespace-nowrap">
          {center}
        </div>

        {/* 右栏：功能图标 + 用户菜单靠右，min-w-0 防止撑开列宽 */}
        <div className="justify-self-end flex items-center gap-3 whitespace-nowrap min-w-0">
          {right}
        </div>
      </div>
    </header>
  );
}
