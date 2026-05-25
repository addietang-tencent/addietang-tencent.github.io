---
name: clawpro-tenant
description: >
  ClawPro 用户端（Tenant）专属设计规范。自 2026-05-22 起，用户端与管控端的视觉规范开始分化，
  本文件仅记录"用户端独有 / 与管控端或全局不同"的差异点；未列出的项目一律沿用
  `SKILL.md`（全局设计系统）和 `SKILL-GLOBAL-COMPONENTS.md`（全局组件样式）。
  适用范围：`client/src/pages/tenant/**`、`client/src/components/topnav/**`
  以及任何由 `<TenantLayout>` 包裹的页面。
---

# ClawPro 用户端设计规范（Tenant Skill）

> **设计来源**：Figma《ClawPro 项目设计》"0522 修改点"分区  
> （`figma.com/design/1PraDigxMbE8KrBayR1bbb?node-id=1141-11612`）  
> **作用域**：用户端（Tenant）所有业务页 + 用户端共享组件  
> **优先级**：本文件 > `SKILL.md` > `SKILL-GLOBAL-COMPONENTS.md`（用户端范围内冲突时以本文件为准）  
> **管控端**：本文件不适用，管控端继续沿用 `SKILL.md` 和 `SKILL-GLOBAL-COMPONENTS.md`

---

## 0. 何时加载本 Skill

只要满足下列任一条件，**必须**加载本 Skill：

- 修改 / 新增 `client/src/pages/tenant/**` 下任意页面
- 修改 / 新增 `client/src/components/topnav/**` 下任意组件
- 修改任何使用 `<TenantLayout>` 的业务页面
- 用户端共享组件（Agent 卡片、技能卡片、模型额度卡片等）

如果只改管控端（`client/src/pages/admin/**`、`AdminLayout`、`AdminSidebar` 等），**不要**加载本文件——继续沿用 `SKILL.md` 即可。

---

## 1. 与全局规范的关系

```
┌──────────────────────────────────────────────────────────┐
│  SKILL-GLOBAL-COMPONENTS.md  （addietang/miekoyychen 维护）│
│  · 基础组件（Button/Input/Select/Dialog/Table/...）       │
│  · 全局色阶、圆角、阴影、Typography 字体系统               │
└──────────────────────────────────────────────────────────┘
                              ▲
                              │ 继承
              ┌───────────────┴───────────────┐
              │                               │
┌─────────────┴────────────┐   ┌──────────────┴───────────┐
│        SKILL.md          │   │     SKILL-TENANT.md      │
│  全局通用 + 管控端规范     │   │  用户端差异化规范（本文）  │
│  · 管控端布局/侧边栏        │   │  · 用户端按钮：全圆角     │
│  · 管控端配置卡 0.5px 描边  │   │  · 用户端卡片：12px 圆角  │
│  · 管控端右侧背景图        │   │  · 顶部导航：透明 + 模糊  │
│                          │   │  · 移除点阵装饰背景       │
└──────────────────────────┘   └──────────────────────────┘
```

**判定原则**：

1. 如果本文件**有**该项规范 → 用户端按本文件执行（覆盖全局）
2. 如果本文件**没有**该项规范 → 沿用 `SKILL.md` 或 `SKILL-GLOBAL-COMPONENTS.md`
3. **禁止**在用户端使用任何"管控端专属"规范（如管控端 0.5px 描边的 `<SurfaceConfig>`、AdminSidebar 渐变选中态等）

---

## 2. 用户端核心差异点（0522 修改）

> 本节为"快速对比表"，详细规范见后续章节。任何用户端页面的视觉刷新都必须按本表逐项检查。

| 维度 | 用户端（Tenant，本文件） | 管控端 / 全局（SKILL.md） |
|---|---|---|
| **按钮圆角** | **`rounded-full`（全圆角胶囊）** | `rounded-[4px]`（4px 直角小圆角） |
| **Tab 切换** | **胶囊滑块（80px 圆角 + 滑动指示器）** | 矩形切换（4px 圆角） |
| **业务卡片圆角** | **`rounded-[12px]`** | `rounded-[4px]` |
| **业务卡片描边** | **`#E5E5E5`（normal）/ 无描边（hover）** | `#E5E5E5`（统一） |
| **卡片阴影** | **normal / hover / 无操作态 三档**（见 §5） | 仅 `var(--shadow-card)` 一档 |
| **顶部导航背景** | **`rgba(255,255,255,0.4)` + `backdrop-blur`（半透明毛玻璃）** | 不适用（管控端无顶部 navbar） |
| **页面背景** | **白底 + 两团极淡蓝雾**（左上 `(20%,12%)` rgba(220,234,248,0.5)；右下 `(75%,80%)` rgba(214,230,247,0.55)；范围分别 `55%×40%` / `38%×30%`）；无顶白底灰渐变、无点阵、无装饰横竖线 | 管控端 `#F0F2F8` 纯色背景 |
| **占位带 / 装饰** | **取消** §7.5 点阵 + 贯穿线规则 | 管控端不适用此规则 |
| **步骤条背景** | **使用图片素材**（参考 `clawpro背景素材` 文件夹） | 管控端不使用 |
| **左侧导航** | 用户端无侧边栏（仅顶部 navbar） | 管控端使用 `AdminSidebar`（沿用规范不变） |

---

## 3. 按钮（Button）

> **核心差异**：用户端业务页按钮**全部使用全圆角（`rounded-full`，对应 80px / 40px 圆角）**，状态机制（normal/hover/active/disabled）保持现有不变。

### 3.1 强制规则

1. 用户端业务页（`pages/tenant/**`）所有 `<Button>` 必须以 **`rounded-full`** 作为外形，**不再**使用 `rounded-[4px]`。
2. 推荐做法：在 `client/src/components/ui/button.tsx` 中**新增**一组 `tenant-*` 变体（`tenant-primary` / `tenant-outline` / `tenant-destructive` / `tenant-ghost`），保持 `claw-*` 变体给管控端使用。详见 §3.3。
3. **不允许**通过 `className="rounded-full"` 覆盖现有 `claw-*` 变体——否则会同时改掉管控端样式。必须走变体级别的区分。
4. 颜色 / 渐变 / 文字色与全局保持一致（黑→蓝渐变主按钮、白底 #E5E5E5 边次级按钮、#d42a1e 危险按钮）。

### 3.2 视觉规格（对照 Figma 0522 修改点 / 节点 `1141:11617` ~ `1141:11909`）

#### 主按钮（tenant-primary）

| 属性 | 值 |
|---|---|
| 背景 | `linear-gradient(90deg, #020617 70%, #1447E6 100%)` |
| 文字 | `#FFFFFF` |
| 圆角 | **`40px`（`rounded-full`）** |
| 高度 | `40px`（页面顶部 CTA） / `36px`（行内主按钮） |
| 内边距 | `px-[18px]`（lg）/ `px-6`（claw）/ `px-4`（sm） |
| 字号 | `14px / 24.44px / Regular` |
| Hover | 渐变加深至 `#0A226F` |
| Disabled | 叠白 30% + 文字 50% 透明 |

#### 次级按钮（tenant-outline）

| 属性 | 值 |
|---|---|
| 背景 | `#FFFFFF` |
| 边框 | `1px #E5E5E5` |
| 文字 | `#020617` |
| 圆角 | **`80px`（`rounded-full`）** |
| 高度 | `36px`（默认）/ `32px`（sm） |
| Hover | `bg-[#F5F5F5]` + `border-[#E3E3E3]` + `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` |
| Disabled | 文字 `rgba(2,6,23,0.3)` |

#### 危险按钮（tenant-destructive）

| 属性 | 值 |
|---|---|
| 背景 | `#D42A1E` |
| 文字 | `#FFFFFF` |
| 圆角 | **`80px`（`rounded-full`）** |
| 高度 | `36px` |
| Hover | `#B91C1C` |

### 3.3 推荐 Variant 组织

为保持兼容（不破坏现有管控端代码），建议在 `button.tsx` 新增独立变体：

```tsx
// client/src/components/ui/button.tsx
const buttonVariants = cva(/* ... */, {
  variants: {
    variant: {
      // ─── 管控端 / 全局（保持不变）───
      "claw-primary": "rounded-[4px] bg-gradient-to-r from-[#020617] to-[#1447E6] text-white ...",
      "claw-outline": "rounded-[4px] bg-white border border-[#E5E5E5] text-[#020617] ...",

      // ─── 用户端（新增，全圆角）───
      "tenant-primary":     "rounded-full bg-gradient-to-r from-[#020617] to-[#1447E6] text-white hover:opacity-90 ...",
      "tenant-outline":     "rounded-full bg-white border border-[#E5E5E5] text-[#020617] hover:bg-[#F5F5F5] ...",
      "tenant-destructive": "rounded-full bg-[#D42A1E] text-white hover:bg-[#B91C1C] ...",
      "tenant-ghost":       "rounded-full bg-transparent text-[#020617] hover:bg-[#F5F5F5] ...",
    }
  }
});
```

> 仅 **addietang / miekoyychen** 可新增 / 修改 `tenant-*` 变体；业务侧只能调用，不能 className 覆盖圆角。

### 3.4 调用示例

```tsx
import { Button } from "@/components/ui/button";

// 用户端「我的 Agent」页面顶部 CTA
<Button variant="tenant-primary" size="claw-lg">
  <Plus className="w-4 h-4" />
  创建 Agent
</Button>

// 用户端 Agent 卡片底部「详细配置」
<Button variant="tenant-outline" size="claw">
  <Settings className="w-3.5 h-3.5" />
  详细配置
</Button>

// 用户端弹窗的取消 / 确认
<Button variant="tenant-outline" size="claw-sm">取消</Button>
<Button variant="tenant-primary" size="claw-sm">确认</Button>

// 危险操作
<Button variant="tenant-destructive" size="claw">删除</Button>
```

### 3.5 旧写法 ➜ 新写法对照

| ❌ 用户端旧写法 | ✅ 用户端新写法 |
|---|---|
| `<Button variant="claw-primary">` | `<Button variant="tenant-primary">` |
| `<Button variant="claw-outline">` | `<Button variant="tenant-outline">` |
| `<Button className="rounded-full">` | `<Button variant="tenant-outline">`（变体级别处理） |
| inline `style={{ borderRadius: "80px" }}` | 使用 `tenant-*` 变体 |

### 3.6 操作文字（非按钮的轻量动作）

行内的「查看详情」「操作文字」等文字按钮（非真正按钮），保持现状不变：

```tsx
<button className="text-sm text-[#020617] hover:underline">查看详情</button>
<button className="text-sm text-[#1447E6] hover:underline">操作文字</button>
```

---

## 4. Tab 切换（Segmented Control）

> **核心差异**：用户端 Tab 必须使用**胶囊形带滑块**（`80px` 圆角容器 + `40px` 圆角滑块），与 Figma 节点 `1141:14378` / `1141:11692` 对齐。管控端继续使用 `SKILL.md §8.6` 的矩形 Segment（`4px` 圆角）。

### 4.1 视觉规格

| 属性 | 值 |
|---|---|
| 容器背景 | **`rgba(219, 221, 228, 0.32)`**（半透明灰，对应 Figma `fill_2EZS44`） |
| 容器圆角 | **`80px`（`rounded-full`）** |
| 容器内边距 | `padding: 0`（滑块自带 4px 偏移） |
| 容器高度 | **`36px`** |
| 滑块（active 指示器） | `bg-white`，`border 1px #CDD4DC`，`shadow: 0 1px 4px rgba(0,0,0,0.05)`，圆角 `40px`（`rounded-full`） |
| Tab 内边距 | `px-3 py-1`（即 `padding: 4px 12px`） |
| Tab 字号 | `14px / line-height 22.22px` |
| Active 文字 | `#020617`，`font-medium`（PingFang SC Medium） |
| Inactive 文字 | `#334155`，`font-normal` |
| Hover 文字 | `#020617` |
| 滑块过渡 | `transition: transform 0.2s ease` |

### 4.2 标准实现（顶部导航中央 Tabs）

`client/src/components/topnav/CenterTabs.tsx` 必须**重构**为胶囊滑块形态：

```tsx
// CenterTabs.tsx（用户端 0522 后唯一形态）
import { useRef, useEffect, useState } from "react";

export function CenterTabs({ items, activeValue, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // 计算 active item 的位置和宽度
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-active="true"]`);
    if (!activeBtn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setThumb({ left: btnRect.left - containerRect.left, width: btnRect.width });
  }, [activeValue, items]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center h-9 rounded-full px-1"
      style={{ background: "rgba(219, 221, 228, 0.32)" }}
    >
      {/* 滑块 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-[28px] rounded-full bg-white border border-[#CDD4DC] transition-[left,width] duration-200 ease-out"
        style={{
          left: `${thumb.left}px`,
          width: `${thumb.width}px`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
        aria-hidden
      />
      {/* Tab 项 */}
      {items.map((item) => {
        const active = item.value === activeValue;
        return (
          <button
            key={item.value}
            data-active={active}
            onClick={() => onChange(item.value)}
            className={`relative z-10 px-3 py-1 text-sm rounded-full transition-colors ${
              active
                ? "text-[#020617] font-medium"
                : "text-[#334155] font-normal hover:text-[#020617]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
```

### 4.3 适用范围

| 场景 | 用什么 |
|---|---|
| 用户端顶部导航中央 Tabs（我的 Agent / 技能广场 / 模型额度） | **本节胶囊滑块** |
| 用户端业务页内的子分类切换（如技能广场分类、Agent 详情子页） | **本节胶囊滑块** |
| 弹窗内的分类切换 | 沿用 `SKILL-GLOBAL-COMPONENTS.md §10.5` 矩形 Tab（保持不变） |
| 管控端任何 Tab | 沿用 `SKILL.md §8.6` Segment / 矩形 Tab |

### 4.4 禁止事项

- ❌ 不允许在用户端业务页继续使用 `client/src/components/ui/segment.tsx` 的矩形 Segment 形态
- ❌ 不允许 inline 拼装 `<div className="rounded-full bg-gray-100">`，必须复用 `<CenterTabs>` 或新建用户端版 `<TenantSegment>` 组件
- ❌ 不允许去掉滑块的 `transition`，滑块必须有平滑动画

### 4.5 文字切换器 `<TextSwitch>`（Figma `1077:33980`，0523 新增）

弱切换语义专用：当切换的两个状态属于"配套主操作的辅助开关"（如《我的 Agent》页右上「普通 / 多分组」），**不要**用胶囊版 `<SegmentGroup>`，应使用纯文字版 `<TextSwitch>`。

**视觉规格（对齐 Figma `1077:33980`）：**

| Token | Value |
|---|---|
| 容器 | 横排 row + `gap 12px`，无背景、无圆角、无内边距 |
| active 字色 | `#020617`（文字主色） |
| inactive 字色 | `#A7A7A7` |
| 分隔符 `/` 字色 | `#E2E8F0` |
| 字号 / 字重 | `14px / 400`（active / inactive 字重一致，仅靠颜色区分） |
| line-height | `22px` |
| letter-spacing | `0.5%` |
| inactive hover | 字色升 `#020617`，无背景变化 |

**用法：**

```tsx
import { TextSwitch, TextSwitchOption } from "@/components/ui/segment";

<TextSwitch>
  <TextSwitchOption active={mode === "normal"} onClick={() => setMode("normal")}>
    普通
  </TextSwitchOption>
  <TextSwitchOption active={mode === "multi-group"} onClick={() => setMode("multi-group")}>
    多分组
  </TextSwitchOption>
</TextSwitch>
```

> 分隔符 `/` 由组件内部在相邻 `TextSwitchOption` 之间自动渲染，业务侧**不要**手动写 `<span>/</span>`。

**适用范围：**

| 场景 | 用什么 |
|---|---|
| 主导航 / 主分类切换（强切换） | `<CenterTabs>` 胶囊滑块（§4.1） |
| 配套主按钮的辅助状态切换、次要属性切换（弱切换） | **`<TextSwitch>` 文字版** |
| 普通双向 Toggle（开/关） | `<Switch>` 开关 |

**禁止事项：**

- ❌ 不允许 inline 拼装 `<div className="flex gap-3"><button>普通</button><span>/</span><button>多分组</button></div>`
- ❌ 不允许把 active / inactive 的字重改成不同值（Figma 字重均为 400，靠颜色拉差异）
- ❌ 不允许在弱切换场景继续套 `<SegmentGroup>` 胶囊版（视觉过重，喧宾夺主）

---

## 5. 卡片（Card）

> **核心差异**：用户端业务卡片圆角统一升级到 **`12px`**，并区分 **normal / hover / 无操作态** 三种视觉。与 Figma 节点 `1141:11921` / `1141:12016` / `1141:11970` 对齐。

### 5.1 三种状态对照

| 状态 | 适用场景 | 圆角 | 描边 | 阴影 | 内边距 / 行间距 |
|---|---|---|---|---|---|
| **客户端卡片：normal** | Agent 卡片、技能卡片、模型额度卡片的默认态 | `12px` | `1px #E2E8F0` | `var(--shadow-tenant-card)`（**`0px 1px 4px 0px rgba(0,0,0,0.05)` 单层**，对齐 Figma `1077:33987` `effect_KNJ2UO`） | **`padding 20px`** + **`column gap 24px`**（默认值，对齐 AgentCard / Figma `1077:33986`）|
| **客户端卡片：hover** | 同上，鼠标悬停 | `12px` | **无描边**（border-transparent） | **加强阴影** `0 4px 24px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.1)` | 同 normal |
| **客户端卡片：无操作态** | 静态信息卡（如纯展示，不可点击） | `12px` | `1px #E5E5E5` | 无阴影 | 同 normal |

> ⚠️ 用户端卡片 normal/active 阴影使用 **`--shadow-tenant-card`** 单层值，**不要**复用管理端的 `--shadow-card`。
> 后者额外叠了一层 `0px 0px 2px rgba(0,0,0,0.1)` 环形描边阴影，在 12px 大圆角上会形成"灰圈感"，
> 与 Figma 不符。修改单层 token 即可批量影响所有 `<TenantCard>`，无需跨文件搜索替换。

> ⚠️ 用户端业务列表卡的内边距（`padding 20px`）与子元素纵向间距（`gap 24px`）由 `<TenantCard>` 的 `padding="default"` 默认承担，
> **业务侧不要再 inline 写 `style={{ padding: "20px", gap: "24px" }}`**。如需更紧凑（如统计小卡），传 `padding="compact"`（16/12）；
> 如需完全自定义（如带表头的复合容器），传 `padding="none"` 后通过 className 自己控制。

### 5.2 推荐组件封装（✅ 已实现于 `client/src/components/ui/Surface.tsx`，0523）

`<TenantCard>` 已在 `Surface.tsx` 落地，业务侧直接 import 即可。**严禁**再用 `<SurfaceCard>` 作为用户端业务列表卡——后者实际圆角是 `4px`（受 `--radius-xl=4px` 控制），与 Figma 12px 不符。

```tsx
// 实际签名（摘自 Surface.tsx）
interface TenantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 卡片状态。normal=默认 + 描边 + 阴影 / hover=已悬停（一般由 interactive 自动驱动）/ static=纯展示无阴影 */
  state?: "normal" | "hover" | "static";
  /** 是否启用 hover 动效（无描边 + 加强阴影 + 微抬 + cursor-pointer）。仅 state=normal 生效 */
  interactive?: boolean;
  /** 透明背景（让卡片融入页面背景，仅保留圆角 + 描边） */
  bare?: boolean;
  /**
   * 内边距 + 子元素纵向间距预设（0523-2 新增）：
   *   - "default"（默认）：padding 20px + flex column + gap 24px。AgentCard / 技能网格卡 / DOC 入口卡。
   *   - "compact"：padding 16px + gap 12px。次级密集型卡（暂未使用，预留）。
   *   - "none"：不设 padding / 不设 flex / 不设 gap，业务侧完全自定义（适用于带表头的容器卡 / 内部已有自己纵向流的小卡）。
   */
  padding?: "default" | "compact" | "none";
}
```

实现要点：
- 圆角：`rounded-[var(--radius-card)]` = 12px（与管理端的 `rounded-xl=4px` 通过 token 分流）
- normal 态：`border #E2E8F0` + `var(--shadow-tenant-card)`（单层 `0px 1px 4px rgba(0,0,0,0.05)`，对齐 Figma `1077:33987`）
- hover 态（interactive=true 自动触发）：`border-transparent` + `0 4px 24px rgba(0,0,0,0.08)` + `-translate-y-0.5`
- active 态：复用 `var(--shadow-tenant-card)`，避免按下瞬间出现 2px 环形阴影闪烁
- static 态：`border #E5E5E5` + 无阴影
- 默认 `padding="default"`：组件自带 `flex flex-col p-5 gap-6`（即 20px / 24px），与 AgentCard 完全一致

### 5.3 调用示例

```tsx
import { TenantCard } from "@/components/ui/Surface";

// ✅ 用户端业务列表卡（最常用，默认 padding 20 + gap 24）
<TenantCard interactive onClick={handleClick}>
  <div>头部行</div>
  <div>元信息行</div>
  <div>底部行</div>
</TenantCard>

// ✅ 静态展示卡（无 hover 阴影 + 无 hover 描边过渡）
<TenantCard state="static">
  <h3>配额说明</h3>
</TenantCard>

// ✅ 自定义内部布局（含表头分割、内部自己控制 padding）
<TenantCard padding="none">
  <header className="px-5 py-4 border-b border-[#E5E5E5]">表头</header>
  <div className="p-5">内容</div>
</TenantCard>

// ❌ 错误：不要再 inline 写 padding/gap，会与默认值冲突或冗余
<TenantCard interactive style={{ padding: "20px", gap: "24px" }}>…</TenantCard>
```

### 5.4 与全局 `<SurfaceCard>` 的关系

| 组件 | 圆角 | token | 用途 |
|---|---|---|---|
| `<SurfaceCard>` | **`4px`** | `--radius-xl` | **管理端**所有卡片（用户端禁用作为业务列表卡） |
| `<TenantCard>` | **`12px`** | `--radius-card` | **用户端**所有业务列表卡（Agent / 技能 / 模型 / 帮助文档） |
| `<SurfaceConfig>` | `4px` + `0.5px` 描边 | `--radius-xl` | **仅管理端**配置卡，用户端禁用 |

> ⚠️ 历史误注释：`Surface.tsx` 早期版本注释里写过"`SurfaceCard` 圆角 12px"，**那是错的**——本项目 `--radius-xl` 被压到 4px（见 `index.css` 注释"控件层上限"）。`SurfaceCard` 实际渲染圆角 = 4px。用户端 12px 必须走 `<TenantCard>`。

### 5.5 触达即同步：迁移要点

修改用户端旧页面时，按以下规则替换：

```tsx
// ❌ 旧（错误：实际渲染 4px 圆角，与 Figma 12px 不符）
import { SurfaceCard } from "@/components/ui/Surface";
<SurfaceCard hover className="p-5">…</SurfaceCard>
<SurfaceCard hover className="p-6" style={{ padding: "20px", gap: "16px" }}>…</SurfaceCard>

// ✅ 新（用户端列表项卡片，12px 圆角 + Figma 间距 SOP）
import { TenantCard } from "@/components/ui/Surface";
<TenantCard interactive>…</TenantCard>          // padding/gap 走默认 20/24
<TenantCard padding="none" className="p-5">…</TenantCard>  // 内部自己控制布局（如统计卡）
```

**判断依据 — 是否要迁移（0523-3 修订）：**

| 场景 | 用什么 |
|---|---|
| 用户端「业务列表卡」「网格卡」（Agent / 技能 / DOC 入口 / 模型统计） | ✅ **必须** `<TenantCard>`（默认 padding 20/gap 24） |
| 用户端**表格容器**（ModelQuota 的"模型使用汇总""详细使用记录"） | ✅ **必须** `<TenantCard padding="none">`（外框走 12px，表头分割保留 inline `px-5 py-4` + `border-b border-[#E2E8F0]`） |
| 用户端**详情页 Tabs 容器卡**（SkillSquare 详情 overview/files/distribution） | ✅ **必须** `<TenantCard padding="none">`（外框统一，内部 inline 控制） |
| 用户端**详情页配置卡**（OpenClawDetailGuide 的 3 列 模型/通道/技能 + 记忆 + 龙虾医生） | ✅ **必须** `<TenantCard padding="none">`（保留 inline `flex flex-col p-6 gap-4` 等定制密度） |
| 用户端**详情页内容卡**（HelpDocs 详情 `p-8` 文章块） | ✅ **必须** `<TenantCard padding="none" className="p-8">` |
| 用户端**整页骨架级大容器**（FileSpace / ToolsMcpPanel） | ⏸️ 暂留 `<SurfaceCard>`（顶层骨架，含 inline `rounded-[4px]` 主动选择，待单独评估） |
| 弹窗（Dialog/Sheet）**内嵌**的小信息块 | ⏸️ 保留 `<SurfaceCard>`（弹窗内紧凑感） |

> 修订前（0523-2）把"表格容器/Tabs 容器/详情配置卡"归在保留 SurfaceCard，是**错误判断**——
> 用户视觉口径是「**用户端外框统一**」，外框（圆角 / 阴影 / 描边色）必须按 AgentCard（Figma `1077:33986/33987`）走，
> 内部布局（padding/gap/分割线）由业务侧 inline 决定。`<TenantCard padding="none">` 就是为这个场景设计的。

> 简单记忆：**用户端业务页面里见到的"白色面板"，外框一律走 `<TenantCard>`**；
> 仅 `<SurfaceCard>` 当下还合法的：① 整页骨架级大容器（`FileSpace` / `ToolsMcpPanel`），② Dialog/Sheet 内的紧凑信息块。

**已完成迁移的页面（0523-2 + 0523-3）：**
- ✅ `components/agent/AgentCard.tsx`（Agent 列表卡，Figma `1077:33986`）
- ✅ `pages/tenant/SkillSquare.tsx` 技能网格卡 + 列表视图容器 + 详情 Tabs 三处（overview/files/distribution）
- ✅ `pages/tenant/HelpDocs.tsx` DOC 入口卡 + 详情文章容器
- ✅ `pages/tenant/ModelQuota.tsx` 顶部 4 张统计卡 + 配额卡 + **模型使用汇总表格 + 详细使用记录表格（0523-3）**
- ✅ `pages/tenant/OpenClawDetailGuide.tsx` 模型/通道/技能 3 列配置卡 + 记忆 Tab 容器 + 龙虾医生 2 块（0523-3）

---

## 6. 页面背景

> **核心差异**：用户端**移除全部点阵、贯穿横线、贯穿竖线装饰**，回归纯粹的"白→灰渐变"背景。与 Figma 节点 `1141:14111`（"客户端去掉了网格和点阵背景"）对齐。

### 6.1 强制规则

1. **删除** `SKILL.md §7.5` 在用户端的全部应用：
   - ❌ 不再添加点阵 `radial-gradient(circle, #DFE2E5 1px, ...)`
   - ❌ 不再添加左右贯穿竖线 `top-0 bottom-0 ... bg-[#E2E8F0]`
   - ❌ 不再添加上下贯穿横线 `width: 100vw + bg-[#E2E8F0]`
   - ❌ 不再使用 `ResizeObserver` 动态计算 `dotsTop / dotsBottom`
2. **保留** `SKILL.md §7.4` 的最低/最大宽度（`min-w-[1200px]` + `max-w-[1920px]`），但**改用单层 `padding: 0 120px`** 控制左右内边距，**不再使用** `w-20 占位带 + 段内 px-[42px]` 双层缩进。
3. 页面背景由 `<TenantLayout>` 统一提供，**白底 + 两团极淡蓝雾（v3.1）**：
   ```css
   background-color: #FFFFFF;
   background-image:
     radial-gradient(ellipse 55% 40% at 20% 12%, rgba(220, 234, 248, 0.5) 0%, rgba(220, 234, 248, 0) 70%),
     radial-gradient(ellipse 38% 30% at 75% 80%, rgba(214, 230, 247, 0.55) 0%, rgba(214, 230, 247, 0) 70%);
   background-repeat: no-repeat;
   background-attachment: fixed;
   ```
   > 历史方案：v2 `linear-gradient(180deg, #FFFFFF→#F5F5F5)` 整体偏暗 → 废弃；v2.5 在 v2 基础上叠 `rgba(207,224,245, 0.55/0.45)` 双蓝雾，叠加灰底依旧偏暗 → 废弃；v3 纯白 `#FFFFFF` 又过白、缺少 Figma 的呼吸感 → 由 v3.1 取代。新页面禁止再叠加任何额外渐变 / 灰底。
4. 业务页**不要**在页面内再套额外背景层。

### 6.1.1 段落左右对齐（强制）

> 与 Figma 节点 `1077:33419` 对齐：所有主区块（HeroBanner / QuickStartGuide / Section header / 卡片网格 / 列表 / 分页器）统一左对齐到 x=120、宽 1680（即视口左右各留白 120px）。

| 规则 | 强制要求 |
|---|---|
| 单层 padding | 页面外层一次性写 `paddingLeft: 120px; paddingRight: 120px` |
| 禁止双层缩进 | ❌ `w-20 占位带 + 段内 px-[42px]`（叠加 122px，不等于 120） |
| 段内零缩进 | 所有子段（Hero/QuickStart/Section header/卡片网格…）**自身 padding-left/right = 0** |
| 例外 | 段落自身的视觉装饰 padding（如 QuickStartGuide 内部 `padding: 20px 24px 20px 42px`）属于组件内部布局，不算段落对齐 padding |

### 6.2 标准实现（用户端业务页骨架，0523 单层 120px 版）

```tsx
import TenantLayout from "@/components/TenantLayout";

export default function MyTenantPage() {
  return (
    <TenantLayout>
      {/* §7.4 宽度上下限保留，骨架改为单层 120px padding */}
      <div className="min-w-[1200px]">
        <div className="max-w-[1920px] mx-auto page-enter">
          <div
            className="relative min-h-[calc(100vh-64px)]"
            style={{ paddingLeft: "120px", paddingRight: "120px", paddingBottom: "75px" }}
          >
            {/* … 业务内容（各段自身 padding-left/right = 0） … */}
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
```

> 旧的 `w-20 占位带 + flex-1 + 段内 px-[42px]` 三层结构已废弃，迁移见 §6.4。

### 6.3 步骤条 / 引导背景例外

> 部分业务（如 OpenClaw 详情页的 QuickStartGuide 步骤条）仍需要装饰背景。**改用图片素材**，不再使用 CSS 点阵。

- 素材路径：`client/public/landing-assets/clawpro背景素材/`（与 Figma `1141:12754` 对齐，`fill_J3HZQ2` 引用的图片）
- 使用方式：`<div className="bg-[url('/landing-assets/clawpro背景素材/step-bg.png')] bg-cover">`
- **禁止**自行用 CSS 重新拼装点阵 + 渐变模拟图片背景

### 6.4 触达即同步：迁移已有页面

| 已有页面 | 处理方式 |
|---|---|
| `MyOpenClaw.tsx` | ✅ 已迁移到单层 120px padding（0523） |
| `OpenClawDetailGuide.tsx` | 删除点阵 + 贯穿线 + ResizeObserver；改用单层 120px padding |
| `SkillSquare.tsx` | 同上 |
| `ModelQuota.tsx` | 同上 |
| 任何带 `radial-gradient(circle, #DFE2E5` 的页面 | 触达即同步删除 |
| 任何带 `w-20 self-stretch` + 段内 `px-[42px]` 的页面 | 触达即同步重构为单层 `padding: 0 120px` |

---

## 7. 顶部导航栏（TopNav）

> **核心差异**：导航栏背景从不透明 `bg-white/95` 调整为**半透明 `rgba(255,255,255,0.4)` + `backdrop-blur`**，整体更"透气"。与 Figma 节点 `1141:14374`（`fill_MYREIC`）对齐。

### 7.1 视觉规格更新

| 属性 | 0522 前 | **0522 后（强制）** |
|---|---|---|
| 背景 | `bg-white/95` | **`bg-[rgba(255,255,255,0.4)]`** |
| 背景滤镜 | `backdrop-blur-md` | **`backdrop-blur-md`**（保持） |
| 底边 | `1px solid #E2E8F0` | **`1.11px solid #E2E8F0`**（与 Figma 1.111111 px 对齐） |
| 高度 | 64px | **64px**（保持） |
| 内边距 | `px-10`（40px） | **`px-7`（28px）**（与 Figma `12px 28px` 对齐） |
| 内部 padding-y | — | **`py-3`（12px）** |

### 7.2 实现位置

修改 `client/src/components/topnav/TopNav.tsx`：

```tsx
<header
  className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
  style={{
    background: "rgba(255, 255, 255, 0.4)",
    borderBottom: "1.111px solid #E2E8F0",
  }}
>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-7 py-3 min-w-[1200px]">
    {/* 左 | 中 | 右 */}
  </div>
</header>
```

### 7.3 中央 Tabs 与右侧功能区

- 中央 Tabs：使用 §4 胶囊滑块形态（`<CenterTabs>` 已升级）
- 右侧功能按钮（HelpPanel / NotificationPanel / 切换管控端 / UserMenu）规格保持 `SKILL.md §7.2.1` 不变
- 各功能按钮之间仍使用 `<NavDivider>`（1px × 14px，`#E2E8F0`）分隔

### 7.4 切换管控端按钮

文字从「管控端」更新为 **「切换管控端」**（与 Figma `1141:14388` 对齐）。

```tsx
<NavIconButton icon={<SwitchAdminIcon />} label="切换管控端" />
```

### 7.5 操作条 hover 状态

> Figma 节点 `1141:14464`「操作条 hover 状态更新」

右侧功能按钮的 hover 视觉调整为：
- 背景：`bg-[#F5F5F5]`（保持）
- 文字色：`#020617`（保持）
- **移除**之前可能存在的"边框变蓝 / 渐变背景"hover 视觉
- hover 过渡：`transition: background 0.15s ease`

---

## 8. 排版与图标（沿用全局）

用户端的字体、文字色阶、图标库**完全沿用** `SKILL-GLOBAL-COMPONENTS.md §0 Typography` 与 `SKILL.md §9`：

- 字体优先使用 `client/src/components/ui/Typography.tsx` 提供的语义组件（`TenantPageTitle / CardTitle / BodyText / MetaText` 等）
- 主品牌色：`#1447E6`
- 文字层级：`#0A0A0A / #020617 / #334155 / #737373 / #A3A3A3`
- 图标库：`lucide-react`（唯一）

> 用户端不引入任何自有的 Typography token 或字体；如有新场景需扩充，必须先更新 `SKILL-GLOBAL-COMPONENTS.md`，让管控端也能复用。

---

## 9. 表单组件（沿用全局）

Input / Select / DatePicker / Checkbox / Switch / Textarea / RadioGroup 等表单组件**完全沿用** `SKILL-GLOBAL-COMPONENTS.md §5 ~ §10` 的样式（`rounded-[4px]` + `border-[#d3d6db]` + `hover/focus #355EF1`）。

> ⚠️ **特别说明**：表单控件不进入"全圆角"范围。即使在用户端，Input / Select 仍保持 `4px` 圆角，**不**改成 `rounded-full`。全圆角仅作用于**按钮**和**Tab 容器**。

---

## 10. 弹窗（Dialog）

弹窗 / AlertDialog 的容器、关闭按钮、Footer 布局**完全沿用** `SKILL-GLOBAL-COMPONENTS.md §7` 与 `SKILL.md §8.7`。

唯一差异：

| 维度 | 用户端 Dialog 内按钮 | 管控端 Dialog 内按钮 |
|---|---|---|
| 取消 / 确认按钮变体 | **`tenant-outline` / `tenant-primary`** | `claw-outline` / `dialog-confirm` |
| 按钮圆角 | **`rounded-full`** | `rounded-[4px]` |

```tsx
// 用户端弹窗
<DialogFooter>
  <Button variant="tenant-outline" size="claw-sm">取消</Button>
  <Button variant="tenant-primary" size="claw-sm">确认</Button>
</DialogFooter>
```

---

## 11. 表格（沿用全局）

用户端表格继续使用 `SKILL-GLOBAL-COMPONENTS.md §11.1` 的标准 Table 组件（`<Table> / <TableHeader> / <TableRow> / <TableActionCell>`），**不做差异化**。

> 操作列内的按钮统一使用 `<TableActionCell>` 自动包裹的 `link-dark` 样式（黑色文字按钮），与全局保持一致。

---

## 12. 提示横幅（Alert）

沿用 `SKILL-GLOBAL-COMPONENTS.md §10.6 Alert` 组件，圆角保持 `4px`（`var(--alert-radius)`），**不**改成全圆角。

---

## 13. 状态徽章（Badge）

沿用 `SKILL.md §8.2`：

```css
.badge-running { background: rgba(52,199,89,0.12); color: #1a8c3a; border-radius: 2px; padding: 2px 8px; }
.badge-stopped { background: rgba(255,59,48,0.1); color: #c0392b; border-radius: 2px; padding: 2px 8px; }
.badge-pending { background: rgba(255,149,0,0.1); color: #b8640a; border-radius: 2px; padding: 2px 8px; }
.badge-new     { background: #1447E6; color: #fff; border-radius: 2px; padding: 1px 6px; font-family: 'Open Sans', sans-serif; font-size: 10px; }
```

> 状态徽章的小圆角（2px）属于"信息密度型"组件，不参与全圆角化。

---

## 14. 用户端新页面 Checklist

创建任何用户端新页面前，逐项确认：

- [ ] 选择 `<TenantLayout>`，**不要**用 `<AdminLayout>`
- [ ] 应用 §6 的页面骨架（`min-w-[1200px]` + `max-w-[1920px]` + 80px 占位带，**无点阵无装饰**）
- [ ] 根元素包含 `page-enter` class
- [ ] 卡片使用 `<TenantCard>`（12px 圆角 + 三种状态），**不要**用 `<SurfaceCard>` 作为业务列表卡
- [ ] 按钮使用 `tenant-primary / tenant-outline / tenant-destructive` 变体（全圆角）
- [ ] 顶部导航中央 Tabs 使用 §4 胶囊滑块形态
- [ ] 表单控件保持 `4px` 圆角（Input / Select / DatePicker 等）
- [ ] 文字优先使用 `@/components/ui/Typography` 语义组件
- [ ] 图标来自 lucide-react，颜色用 `currentColor` 或文字色阶
- [ ] 切换管控端按钮文案为「切换管控端」
- [ ] 顶部导航背景使用 `rgba(255,255,255,0.4) + backdrop-blur-md`
- [ ] **不**引入任何点阵 / 贯穿横线 / 贯穿竖线装饰

---

## 15. 触达即同步：用户端旧页面迁移规则

每次修改 `client/src/pages/tenant/**` 下文件时，**在动手实现需求之前**，先按以下清单同步：

### 15.1 必检项

1. **按钮**：是否有 `variant="claw-primary"` / `variant="claw-outline"` / 手写 `rounded-[4px]` 按钮？→ 全部改为 `tenant-*` 变体
2. **卡片**：是否有手写 `rounded-[4px]` + `bg-white` 的卡片？是否有 `<SurfaceCard>` 用作业务列表卡？→ 改为 `<TenantCard>`，区分 normal/hover/static
3. **Tab**：是否有 `<Segment>` 或矩形 Tab 用作页面级分类？→ 改为胶囊滑块（§4）
4. **背景**：是否有点阵 / `radial-gradient(circle, #DFE2E5` / `top-0 bottom-0 ... bg-[#E2E8F0]` / 100vw 贯穿横线？→ 全部删除
5. **导航栏**：是否仍是 `bg-white/95`？是否仍写「管控端」而非「切换管控端」？→ 同步刷新

### 15.2 拆分原则

- 如果上述 5 项中任一项的修改量**远大于**主诉本身，先告知用户：列出违规清单 + 预估改动量，让用户决定"本次只做主诉 / 一起刷 / 单独排期"。
- 如果违规属于"小动小改一次性能解决"（< 30 行），跟随主诉一并刷新，不必额外征求许可。

### 15.3 例外注释

如果确有合理理由保留旧写法（如临时回滚、A/B 实验），加行级注释：

```tsx
// allow-tenant-legacy: 此页处于 A/B 实验灰度，2026-06-15 前不刷新
<Button variant="claw-primary">…</Button>
```

CI / Code Review 见到 `// allow-tenant-legacy:` 注释时放行；必须写明理由和预计清理日期。

---

## 16. 强制执行规则

1. **本文件优先级最高**：用户端范围内与 `SKILL.md` / `SKILL-GLOBAL-COMPONENTS.md` 冲突时以本文件为准
2. **新增 `tenant-*` 变体**：仅 `addietang / miekoyychen` 可在 `button.tsx` / `Surface.tsx` 中新增 `tenant-*` 变体；业务侧只能调用，禁止覆盖样式
3. **管控端禁止使用 `tenant-*` 变体**：`pages/admin/**` 下任何文件出现 `tenant-primary / tenant-outline / TenantCard` 等都属于规范违反
4. **触达即同步**：见 §15
5. **新页面必须按 §14 Checklist 自检**

---

## 17. 参考实现

> 以下文件作为本规范的"参考实现锚点"，新页面优先模仿这些文件的写法：
>
> - `client/src/components/topnav/TopNav.tsx`：导航栏壳子（半透明 + 模糊）
> - `client/src/components/topnav/CenterTabs.tsx`：中央胶囊滑块 Tabs
> - `client/src/components/ui/Surface.tsx`：`<TenantCard>` 卡片组件（✅ 已实现，0523）
> - `client/src/components/ui/button.tsx`：`tenant-*` 按钮变体
> - `client/src/components/agent/AgentCard.tsx`：用户端业务卡参考实现（使用 `<TenantCard interactive>`）
> - `client/src/pages/tenant/MyOpenClaw.tsx`：完整业务页（应用 §6 简化骨架 + §3 按钮 + §5 卡片）
>
> 如发现这些文件与本规范不一致，**以本规范为准**——这些文件需要被刷新。

---

## 18. 版本日志

| 日期 | 变更 | 来源 |
|------|------|------|
| 2026-05-22 | 创建本文件，从 `SKILL.md` 中分化出用户端规范 | Figma 0522 修改点 / node `1141:11612` |
| | 按钮全圆角化（§3） | Figma `1141:11617` ~ `1141:11909` |
| | Tab 胶囊滑块化（§4） | Figma `1141:14378` / `1141:11692` |
| | 卡片圆角升级到 12px + 三状态（§5） | Figma `1141:11921` / `1141:12016` / `1141:11970` |
| | 移除点阵 + 贯穿线背景（§6） | Figma `1141:14111` "客户端去掉了网格和点阵背景" |
| | 顶部导航半透明 + 模糊（§7） | Figma `1141:14368` "客户端顶部工具条更新+透明效果" |
| 2026-05-23 | **`<TenantCard>` 落地实现**（§5.2）：在 `Surface.tsx` 新增 L6 档卡片，圆角 `var(--radius-card)=12px`，三状态 normal/hover/static。修正 `index.css` 圆角档位注释（rounded-xl 实测 4px，不是 12px） | Figma `1077:33986` AgentCard 修订版 |
| | AgentCard 容器从 `<SurfaceCard>` 切换到 `<TenantCard interactive>`（修圆角 4px→12px） | 同上 |
| | §5.4 关系表：明确 `<SurfaceCard>` = 4px（管理端）/ `<TenantCard>` = 12px（用户端），删除"用户端特殊场景仍可用 SurfaceCard"的口子 | 同上 |
| | **页面段落统一 120px padding**（§6.1.1 / §6.2 / §6.4）：废弃 `w-20 + 段内 px-[42px]` 双层缩进，改用单层 `padding: 0 120px`；`MyOpenClaw.tsx` 已迁移 | Figma `1077:33419` |
| | **QuickStartGuide 步骤条改稿**：圆角 12px，渐变 `#E4F0FF→#E5F6FF→#BBD9FF`，移除底边线，与 HeroBanner 通过段间距分离 | Figma `1077:33857` |
| | **用户端页面背景回归纯白 `#FFFFFF`**（§6.1 / §3 对齐表）：废弃 v2 的 `linear-gradient(180deg, #FFFFFF→#F5F5F5)` 与 v2.5 的双团 `rgba(207,224,245)` 蓝雾，整体明度恢复到设计稿水平 | Figma `1077:33419` 根节点 fills |
| | **背景微调 v3.1**：在 v3 纯白基础上加回左上 `(20%,12%)` / 右下 `(75%,80%)` 两团极淡蓝雾（rgba(220,234,248,0.5) / rgba(214,230,247,0.55)，范围 55%×40% / 38%×30%），还原 Figma 的呼吸感但保持高亮度 | 用户参考图 `image.e46c601bc5` |
| | **TenantCard 阴影对齐 Figma `1077:33987`**（§5.1 / §5.2）：normal/active 态新增 `--shadow-tenant-card` token = 单层 `0px 1px 4px rgba(0,0,0,0.05)`，替换原先复用管理端的 `--shadow-card`（含 2px 环形描边阴影，在 12px 圆角上呈现"灰圈感"），AgentCard 等用户端业务卡观感更干净 | Figma `1077:33987` `effect_KNJ2UO` |
| | **`<TextSwitch>` 文字切换器**（§4.5 新章节）：新增用户端弱切换组件 `TextSwitch / TextSwitchOption`（`segment.tsx`），active `#020617` / inactive `#A7A7A7` / 分隔符 `/` `#E2E8F0`，字号 14/400/lh22/letter 0.5%；《我的 Agent》页右上「普通 / 多分组」从胶囊版 `<SegmentGroup>` 替换为本组件 | Figma `1077:33980` |
| | **TenantCard padding/gap SOP 内置**（§5.1 / §5.2 / §5.5）：`<TenantCard>` 新增 `padding` prop（`default` / `compact` / `none`），默认 `default = padding 20px + flex column gap 24px`，与 AgentCard 完全一致，业务侧不再 inline 写。同步迁移 `SkillSquare` 技能网格卡 / `HelpDocs` DOC 入口卡 / `ModelQuota` 顶部统计卡 4 张+配额卡，从 `<SurfaceCard hover>`（4px 圆角 + 双层阴影）改为 `<TenantCard interactive>`（12px + 单层阴影），AgentCard 自身去掉 inline `style={{padding,gap)}` 走默认值；§5.5 增补"判断依据"表格清楚标注哪些场景要迁移、哪些保留 SurfaceCard | Figma `1077:33986` / `1077:33987` |
| | **用户端"外框统一"扩展（0523-3 修订）**（§5.5 修订）：把 0523-2 错误归在「保留 SurfaceCard」的**表格容器 / Tabs 容器 / 详情配置卡 / 详情文章容器**统一刷为 `<TenantCard padding="none">`——外框走 12px 圆角 + `--shadow-tenant-card` 单层阴影 + `#E2E8F0` 描边色，内部布局保留 inline；具体迁移：`ModelQuota` 模型使用汇总 + 详细使用记录两张表格、`SkillSquare` 列表视图容器 + 详情页 overview/files/distribution 三处 Tabs 容器、`HelpDocs` 详情文章容器、`OpenClawDetailGuide` 3 列配置卡 + 记忆 Tab + 龙虾医生 2 块（共 6 处）；§5.5 表格全面修订，明确"用户端业务页面外框一律 TenantCard，仅整页骨架级容器与 Dialog 内嵌信息块保留 SurfaceCard" | Figma `1077:33986` / `1077:33987` |
