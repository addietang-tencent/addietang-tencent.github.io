/**
 * Footer - 永辉版页脚
 * Logo 由全局 brandLogo store 提供，与 Navbar、Hero 中央图标同步更新
 */
import { useBrandLogo } from "./useBrandLogo";

export default function Footer() {
  const logo = useBrandLogo();

  return (
    <footer className="yh-footer">
      <div className="yh-footer-inner">
        <div className="yh-footer-brand">
          <img
            src={logo}
            alt=""
            width={24}
            height={24}
            className="yh-footer-logo"
          />
          <span>永辉 AI Agent 管控平台</span>
        </div>
        <div className="yh-footer-copy">
          Copyright © 2013 - 2026 Tencent Cloud. All Rights Reserved. 腾讯云 版权所有
        </div>
      </div>
    </footer>
  );
}
