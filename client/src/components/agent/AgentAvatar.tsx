/**
 * AgentAvatar - 按角色身份渲染的 48x48 头像
 *
 * 严格对齐 Figma node 317:879「头像」组件集合：
 *   每个角色头像由三层叠加而成：
 *   1) 灰色底圆     (#D9D9D9, 48×48, border-radius: 50%)
 *   2) 淡蓝色叠加圆 (#D9E7FF, 48×48, border-radius: 50%)
 *   3) 精灵图 PNG  (按角色对应一张精灵图 + 偏移量裁切对应人物)
 *
 * 精灵图与角色映射（来自 Figma Component Set 317:879 子节点 layout 数据）：
 *   ┌────────────┬─────────────────────────┬───────────┬───────────────┐
 *   │ 角色        │ 精灵图                  │ 显示尺寸   │ 偏移 (x, y)    │
 *   ├────────────┼─────────────────────────┼───────────┼───────────────┤
 *   │ 设计师      │ avatar-sprite-blue.png  │ 220×58    │ -20, 0        │
 *   │ 通用助手    │ avatar-sprite-blue.png  │ 220×58    │ -23, -1       │
 *   │ 运营        │ avatar-sprite-blue.png  │ 220×58    │ -84, 3.44     │
 *   │ 数据师      │ avatar-sprite-orange.png│ 192×51    │ -6, 3         │
 *   │ 开发        │ avatar-sprite-orange.png│ 192×51    │ -141, 3       │
 *   │ 报告        │ avatar-sprite-orange.png│ 192×51    │ -69, 3.44     │
 *   └────────────┴─────────────────────────┴───────────┴───────────────┘
 */
import spriteBlue from "@/assets/agent-card/avatar-sprite-blue.png";
import spriteOrange from "@/assets/agent-card/avatar-sprite-orange.png";

interface SpriteSpec {
  /** 精灵图 url */
  src: string;
  /** 精灵图整体在 48×48 容器内的显示宽度（CSS px） */
  width: number;
  /** 精灵图整体在 48×48 容器内的显示高度（CSS px） */
  height: number;
  /** 精灵图相对容器 (0,0) 的横向偏移（CSS px，通常为负值） */
  x: number;
  /** 精灵图相对容器 (0,0) 的纵向偏移（CSS px，通常为负值或小正值） */
  y: number;
}

/**
 * 角色名 → 精灵图配置。键值与业务侧的 roleName 完全一致；
 * 业务侧若出现别名（如「数据分析师」），在 ROLE_ALIAS 中映射到标准名。
 */
const ROLE_SPRITE: Record<string, SpriteSpec> = {
  设计师: { src: spriteBlue, width: 220, height: 58, x: -20, y: 0 },
  通用助手: { src: spriteBlue, width: 220, height: 58, x: -23, y: -1 },
  运营: { src: spriteBlue, width: 220, height: 58, x: -84, y: 3.44 },
  数据师: { src: spriteOrange, width: 192, height: 51, x: -6, y: 3 },
  开发: { src: spriteOrange, width: 192, height: 51, x: -141, y: 3 },
  报告: { src: spriteOrange, width: 192, height: 51, x: -69, y: 3.44 },
};

/** 业务侧角色别名 → Figma 标准名 */
const ROLE_ALIAS: Record<string, keyof typeof ROLE_SPRITE> = {
  数据分析师: "数据师",
  数据分析: "数据师",
  运营助手: "运营",
  产品经理: "通用助手",
  客服助手: "通用助手",
  技术顾问: "开发",
  文案创作: "通用助手",
  开发工程师: "开发",
  报告生成: "报告",
};

/** 默认兜底：通用助手 */
const DEFAULT_ROLE: keyof typeof ROLE_SPRITE = "通用助手";

interface AgentAvatarProps {
  /** 角色名，如「设计师」「通用助手」 */
  roleName?: string;
  /** Agent 名称（仅用于 aria-label 兜底） */
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
  // 1. 解析角色名 → SpriteSpec
  const resolvedRole: keyof typeof ROLE_SPRITE = roleName
    ? ROLE_SPRITE[roleName]
      ? (roleName as keyof typeof ROLE_SPRITE)
      : ROLE_ALIAS[roleName] ?? DEFAULT_ROLE
    : DEFAULT_ROLE;
  const spec = ROLE_SPRITE[resolvedRole];

  // 2. 自定义 size 时按比例缩放精灵图与偏移（默认 48）
  const scale = size / 48;

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden transition-opacity ${
        grayed ? "opacity-40 grayscale" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
      }}
      aria-label={roleName || agentName || "Agent 头像"}
    >
      {/* 第一层：灰色底圆 #D9D9D9 */}
      <div
        className="absolute inset-0"
        style={{ background: "#D9D9D9", borderRadius: "50%" }}
      />
      {/* 第二层：淡蓝叠加圆 #D9E7FF */}
      <div
        className="absolute inset-0"
        style={{ background: "#D9E7FF", borderRadius: "50%" }}
      />
      {/* 第三层：精灵图按偏移裁切，仅展示当前角色头像区域 */}
      <img
        src={spec.src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          left: spec.x * scale,
          top: spec.y * scale,
          width: spec.width * scale,
          height: spec.height * scale,
          maxWidth: "none",
          objectFit: "fill",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
};
