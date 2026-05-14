/**
 * AgentAvatar - 按角色身份渲染的 48x48 头像
 * Figma 中不同角色对应不同的头像底图（设计师/通用助手/开发/数据师）。
 * 这里用「底色 + 角色首字 + 可选龙虾 mark」的组合来近似，避免外部图片依赖。
 */
const ROLE_PALETTE: Record<string, { bg: string; fg: string }> = {
  设计师: { bg: "linear-gradient(135deg, #FFE2E0, #FFB8B0)", fg: "#B43A2C" },
  通用助手: { bg: "linear-gradient(135deg, #DDE7FF, #B6CBFF)", fg: "#1447E6" },
  开发: { bg: "linear-gradient(135deg, #E1F2E5, #A6DEC2)", fg: "#1A8C3A" },
  数据师: { bg: "linear-gradient(135deg, #FFE7C2, #FFC585)", fg: "#B8640A" },
  数据分析师: { bg: "linear-gradient(135deg, #FFE7C2, #FFC585)", fg: "#B8640A" },
  客服助手: { bg: "linear-gradient(135deg, #E0F4FF, #A5DBFF)", fg: "#0F6BB3" },
  技术顾问: { bg: "linear-gradient(135deg, #E1F2E5, #A6DEC2)", fg: "#1A8C3A" },
  运营助手: { bg: "linear-gradient(135deg, #F2E7FF, #D2B5FF)", fg: "#5C2FB7" },
  产品经理: { bg: "linear-gradient(135deg, #FFE2E0, #FFB8B0)", fg: "#B43A2C" },
  文案创作: { bg: "linear-gradient(135deg, #FFF6CC, #FFE07A)", fg: "#8C6D00" },
};

const DEFAULT_PALETTE = { bg: "linear-gradient(135deg, #DDE7FF, #B6CBFF)", fg: "#1447E6" };

interface AgentAvatarProps {
  /** 角色名，如「设计师」「通用助手」 */
  roleName?: string;
  /** Agent 名称，作为兜底首字符来源 */
  agentName?: string;
  /** 尺寸，默认 48 */
  size?: number;
  /** 是否灰显（停用/失败/已关机） */
  grayed?: boolean;
  className?: string;
}

export const AgentAvatar = ({
  roleName,
  agentName,
  size = 48,
  grayed = false,
  className = "",
}: AgentAvatarProps) => {
  const palette = (roleName && ROLE_PALETTE[roleName]) || DEFAULT_PALETTE;
  const initial = (roleName?.[0] || agentName?.[0] || "A").toUpperCase();

  return (
    <div
      className={`flex-shrink-0 rounded-[4px] flex items-center justify-center overflow-hidden transition-opacity ${
        grayed ? "opacity-40 grayscale" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        background: palette.bg,
        color: palette.fg,
      }}
      aria-label={roleName || agentName || "Agent 头像"}
    >
      <span style={{ fontSize: size * 0.42, fontWeight: 600, lineHeight: 1 }}>
        {initial}
      </span>
    </div>
  );
};
