---
name: clawpro-global-components
description: >
  ClawPro 全局组件样式规范（owner: addietang）。
  此文件定义所有基础 UI 组件的视觉规范，包括字体、颜色、描边、圆角、阴影、交互状态。
  任何人修改页面时，组件样式必须严格遵循此规范，不允许覆盖或自由发挥。
  如有冲突，以此文件为准。
---

# ClawPro 全局组件样式规范

> **Owner**: addietang  
> **全局样式修改人**: addietang, miekoyychen  
> **优先级**: 最高——所有分支合并时，组件样式以此规范为准，不允许其他人修改组件源文件  
> **组件源码路径**: `client/src/components/ui/`  
> **CSS 变量定义**: `client/src/index.css`  
> **说明**: miekoyychen 负责全局样式的后续修改和调整，与 addietang 共同维护本规范

---

## 0. Typography 字体组件（用户端基础文字入口）

**文件**: `client/src/components/ui/Typography.tsx`  
**研究页**: `client/public/research/tenant-typography-audit.html`  
**适用范围**: 所有用户端（Tenant）页面、用户端共享组件、后续新增业务组件。管控端可按需复用数字 / 代码类组件，但管控端导航等已有专属规范的组件以自身规范为准。

### 0.1 设计原则

1. **文字不再只按字号写 class，而按语义选组件**：页面标题用 `TenantPageTitle`，卡片标题用 `CardTitle`，正文用 `BodyText`，辅助信息用 `MetaText`。
2. **默认色必须由 Typography 组件提供**：业务侧默认不要再手写 `text-gray-*` / `text-[#...]` 表达基础文字色。
3. **字号、字重、行高、字体族、默认颜色绑定在同一个组件里**：避免同一个 `text-sm` 在正文、按钮、Tab、表格中语义漂移。
4. **组件内部文字也应优先复用 Typography token**：新写 Button、Card、Dialog、Popover、表格、空状态、状态标签时，先判断文字是否可映射到 Typography 层级。
5. **只允许通过 `tone` 切换语义色**：不要用 `className` 覆盖颜色；`className` 主要用于布局（如 `mt-1`、`truncate`、`text-center`）。

### 0.2 颜色 token

| `tone` | Tailwind token | 色值 | 用途 |
|--------|----------------|------|------|
| `primary` | `text-gray-900` | `#0A0A0A` | 标题、卡片标题、主内容 |
| `emphasis` | `text-gray-950` | `#020617` | 强调文字、按钮文字、关键字段 |
| `secondary` | `text-gray-700` | `#334155` | 正文、表格内容、ID、说明正文 |
| `muted` | `text-gray-500` | `#737373` | 时间、描述、辅助说明、表头 |
| `weak` | `text-gray-400` | `#A3A3A3` | 占位、空状态、极弱提示 |
| `brand` | `text-[var(--brand-blue)]` | `#1447E6` | 链接、活跃态、步骤标识、英文 Badge |
| `danger` | `text-red-600` | `#DC2626` | 危险操作、错误提示 |
| `inherit` | `text-inherit` | 继承 | 放在已定义颜色的父级中 |

### 0.3 组件层级

| 组件 | 默认标签 | 字号 / 字重 / 行高 | 默认 tone | 使用场景 |
|------|----------|--------------------|------------|----------|
| `TenantHeroTitle` | `h1` | 26px / Medium / 35.56px | `primary` | 用户端 Hero 标题，如模型额度、技能广场 |
| `TenantPageTitle` | `h1` | 24px / Medium / 1.4 | `primary` | 页面标题、详情页主标题 |
| `TenantDocTitle` | `h1` | 20px / Semibold / 1.4 | `primary` | 帮助文档、文章标题 |
| `SectionTitle` | `h2` | 18px / Medium / 1.4 | `primary` | 页面内大模块标题 |
| `PanelTitle` | `h2` | 16px / Semibold / 1.4 | `primary` | Dialog / Sheet / 卡片区块 / 表格区块标题 |
| `CardTitle` | `h3` | 14px / Medium / 1.5 | `primary` | Agent 卡片名、技能卡标题、模型名、列表项标题 |
| `BodyText` | `p` | 14px / Regular / 1.5 | `secondary` | 普通正文、说明、表格内容 |
| `BodyMedium` | `span` | 14px / Medium / 1.5 | `emphasis` | 按钮、Tab、Label、列表主字段 |
| `CompactText` | `span` | 13px / Regular / 1.5 | `secondary` | 紧凑列表、空间不足的轻量描述 |
| `MetaText` | `span` | 12px / Regular / 1.5 | `muted` | 时间、ID、Tooltip、辅助说明、空状态 |
| `MetaMedium` | `span` | 12px / Medium / 1.5 | `muted` | 表头、状态标签内文字、次级强调 |
| `TinyText` | `span` | 10px / Semibold / Open Sans | `brand` | `New` / `Beta` / 小角标 |
| `StatNumber` | `span` | 24px / Bold / DIN | `emphasis` | 统计数字、额度数字 |
| `InlineNumber` | `span` | 14px / DIN / tabular | `secondary` | 表格内 Token 数、请求数、百分比 |
| `CodeText` | `code` | 12px / Menlo | `secondary` | ID、Token、路径、命令、代码片段 |
| `StepText` | `span` | 14px / Medium / Menlo | `brand` | Step 1 / Step 2 / 步骤编号 |

### 0.4 使用方式

```tsx
import {
  TenantPageTitle,
  PanelTitle,
  CardTitle,
  BodyText,
  BodyMedium,
  MetaText,
  StatNumber,
  CodeText,
} from "@/components/ui/Typography";

<TenantPageTitle>Agent 详情</TenantPageTitle>
<BodyText>这里是当前 Agent 的模型、通道和技能配置说明。</BodyText>
<PanelTitle as="h3">模型使用汇总</PanelTitle>
<CardTitle>Alice 的技术助手</CardTitle>
<BodyMedium tone="brand">查看详情</BodyMedium>
<MetaText>更新于 2026-05-21 21:14</MetaText>
<StatNumber>128,000</StatNumber>
<CodeText>ins-g71c6vud</CodeText>
```

### 0.5 组件作者如何受影响

新建或修改全局组件时，按下面规则处理组件内部文字：

| 组件类型 | 内部文字推荐 |
|----------|--------------|
| Button / Tab / Segment item | `BodyMedium` 对应规格：14px / Medium / `emphasis`；组件内部可直接写等效 class，但不得偏离 Typography token |
| Dialog / Sheet 标题 | `PanelTitle` |
| Card 标题 | `CardTitle` |
| 表格表头 | `MetaMedium` |
| 表格内容 | `BodyText` 或 `InlineNumber` |
| 空状态说明 | `MetaText tone="weak"` |
| Badge / New / Beta | `TinyText` 或 `MetaMedium`，英文 Badge 优先 `TinyText` |
| 统计卡数字 | `StatNumber` |
| ID / Token / 路径 | `CodeText` |

> 注意：基础组件源码里不一定必须直接 import Typography（避免 Button 等低层组件依赖过深），但视觉参数必须与 Typography token 保持一致。业务页面与业务组件应优先直接使用 Typography 组件。

### 0.6 禁止事项

- 禁止在用户端新增页面中继续散落书写 `text-gray-900/700/500/400` 表达基础文字色；应改用 Typography 默认色或 `tone`。
- 禁止新增 inline `style={{ fontFamily: ... }}`；数字用 `StatNumber` / `InlineNumber`，代码用 `CodeText`，英文 Badge 用 `TinyText`。
- 禁止把 `text-[10px]` / `text-[11px]` 用于正文；只能用于 Badge、角标、通知小时间戳等极小信息。
- 禁止用 `className` 覆盖 Typography 组件颜色，除非是特殊业务状态色，并需能说明原因。
- 禁止直接全仓机械替换 `text-sm` / `text-xs`；必须按语义映射逐步迁移。

### 0.7 迁移策略

1. **新增页面 / 新增组件必须直接使用 Typography**。
2. **触达即同步**：修改用户端旧页面时，顺手把当前文件中明显的标题、正文、Meta、数字、代码文字替换为 Typography。
3. **优先迁移共享组件**：`components/topnav/**`、`components/agent/**`、用户端卡片/状态/空状态组件。
4. **再迁移核心页面**：`MyOpenClaw.tsx`、`OpenClawDetailGuide.tsx`、`SkillSquare.tsx`、`ModelQuota.tsx`。
5. **大型复杂页渐进处理**：`OpenClawDetail.tsx`、`ChatView.tsx` 按业务迭代逐步替换，避免一次性大重构。

### 0.8 Typography 迁移顺序

> 原则：不要从最大页面开始，不要全仓机械替换 `text-sm` / `text-xs`；先建立示范，再影响共享组件，最后通过“触达即同步”覆盖复杂页面。

| 阶段 | 优先级 | 范围 | 目标 |
|------|--------|------|------|
| 1. 示范 PR | 最高 | `components/agent/AgentCard.tsx` 或 `components/topnav/NotificationPanel.tsx` | 建立团队可复制的 import、`tone`、数字、ID、时间处理范式 |
| 2. 共享组件 | 高 | `client/src/components/topnav/**`、`client/src/components/agent/**`、用户端状态 / 空状态 / 卡片 / 表格区块组件 | 改一次，多处生效，快速统一用户端基础观感 |
| 3. 用户端核心页 | 中高 | `MyOpenClaw.tsx`、`OpenClawDetailGuide.tsx`、`SkillSquare.tsx`、`ModelQuota.tsx` | 覆盖用户高频主路径，让 Typography 的视觉收益尽快可见 |
| 4. 复杂大页 | 渐进 | `OpenClawDetail.tsx`、`ChatView.tsx`、`AgentChat.tsx` | 不做一次性大重构，改到哪个区块就同步哪个区块 |

复杂页面迁移时优先替换：页面标题、模块标题、卡片标题、Meta 信息、统计数字、ID / Token / 路径；聊天消息正文、Markdown 正文等内容型排版可按 §0.12 例外机制处理。

### 0.9 Vibe Coding / AI 辅助开发提示

同事使用 AI 生成用户端页面或组件时，必须在 prompt 中明确引用 Typography，而不是只说“注意字体规范”。推荐使用以下提示：

```text
这是 ClawPro 用户端页面 / 组件，请按 `SKILL-GLOBAL-COMPONENTS.md` 的 Typography 规范实现。

开工前必须读取：
1. `SKILL-GLOBAL-COMPONENTS.md`
2. `client/src/components/ui/Typography.tsx`
3. `client/public/research/typography-guideline.html`

要求：
- 优先使用 `@/components/ui/Typography`
- 不要自行发明字号、字重和基础文字色
- 不要新增 inline `fontFamily`
- 不要随意新增 `text-[xxpx]`
- 页面标题、卡片标题、正文、Meta、数字、代码文字必须按语义映射到 Typography 组件
- 如果现有 Typography 层级不满足，先说明原因，不要直接在页面里写新样式
```

更短版：

```text
这是用户端页面 / 组件，请遵循 `SKILL-GLOBAL-COMPONENTS.md` 的 Typography 规范，优先使用 `@/components/ui/Typography`，不要自行拼装基础文字样式。
```

### 0.10 Typography PR Review Checklist

用户端页面 / 组件提交时，Review 必须检查：

- 页面标题是否使用 `TenantHeroTitle` / `TenantPageTitle`。
- 大模块标题是否使用 `SectionTitle`。
- Dialog / Sheet / 表格区块 / 卡片区块标题是否使用或对齐 `PanelTitle`。
- 卡片对象名、Agent 名、技能名、模型名是否使用 `CardTitle`。
- 普通正文、说明、表格内容是否使用 `BodyText`。
- Label、Tab、按钮文字、列表主字段是否使用或对齐 `BodyMedium`。
- 时间、ID、Tooltip、描述、空状态是否使用 `MetaText` / `MetaMedium`。
- 统计大数字是否使用 `StatNumber`，表格内数字是否使用 `InlineNumber`。
- Token、路径、命令、实例 ID 是否使用 `CodeText`。
- 是否新增了散落的 `text-gray-*` / `text-[#...]` 表达基础文字色。
- 是否新增了 inline `style={{ fontFamily: ... }}`。
- 是否新增了无规范来源的 `text-[10px]` / `text-[11px]` / `text-[15px]` / 其他任意字号。

### 0.11 Typography 接入边界

| 类型 | 接入方式 | 说明 |
|------|----------|------|
| 用户端页面 | 直接 import Typography | 页面标题、正文、Meta、数字、代码必须优先使用 Typography |
| 用户端业务组件 | 直接 import Typography | Agent 卡、技能卡、模型卡、状态说明、空状态等应直接使用 |
| 用户端共享组件 | 优先直接 import Typography | `topnav`、`agent` 等共享组件改一次影响多处，优先接入 |
| 底层 UI 组件 | 不强制 import，但必须对齐 token | `Button`、`Input`、`Select`、`Dialog`、`Tabs`、`Segment` 等可写等效 class，避免依赖过深 |
| 特殊内容区 | 可局部豁免 | Markdown、聊天消息正文、代码编辑器、图表坐标轴等可保留专属排版，但标题 / Meta / 数字 / 代码仍应接入 Typography |

> 关键判断：业务层能直接使用 Typography 就直接使用；底层组件即使不 import，也必须能映射回 §0.3 的 Typography 层级。

### 0.12 Typography 例外机制

允许特殊场景例外，但必须满足以下条件：

1. **说明原因**：现有 Typography 层级为什么不适合该场景。
2. **不破坏色阶**：仍应使用 `#0A0A0A / #020617 / #334155 / #737373 / #A3A3A3 / #1447E6` 等既有 token。
3. **不新增无说明的字体族**：禁止新增 inline `fontFamily`；数字 / 代码 / 英文 Badge 优先使用 `font-din` / `font-mono` / `font-en`。
4. **不扩大豁免范围**：特殊内容区只豁免内容正文，不豁免页面标题、模块标题、Meta、数字、ID / Token / 路径。
5. **形成通用模式时反向沉淀**：如果某个例外被多个页面复用，应补充到 `Typography.tsx` 与本规范，而不是长期散落在页面里。

常见可豁免场景：Markdown 正文渲染、聊天消息正文、代码编辑器、图表坐标轴 / 图例、第三方富文本内容、极小空间内的特定角标。

---

## 1. 品牌色系

| 色值 | 变量/用途 |
|------|----------|
| `#355EF1` | 品牌蓝（`--color-blue-500`），hover/focus/选中态统一用色 |
| `#020617` | 主文字色（gray-950） |
| `#0A0A0A` | 标题色（gray-900） |
| `#334155` | 次级文字（gray-700） |
| `#737373` | 辅助文字（gray-500） |
| `#b0b6c3` | placeholder 色 |
| `#d3d6db` | 默认描边色 |
| `#E5E5E5` | 卡片描边色（gray-200） |
| `#F5F5F5` | 浅背景（gray-100） |
| `#f3f3f4` | disabled 背景 |
| `#d42a1e` | 错误/危险色 |

---

## 2. 圆角规范

| 组件 | 圆角 | 说明 |
|------|------|------|
| Button / Input / Select / DatePicker | `rounded-[4px]` | 4px，统一所有表单控件 |
| Dialog / Popover / DropdownMenu | `rounded-[8px]` | 8px，浮层类 |
| Card（SurfaceCard） | `rounded-xl`（12px） | 卡片容器 |
| Badge（状态徽章） | `rounded-full` | 圆形 |

**禁止**: 不允许使用 `rounded-lg`、`rounded-xl`、`rounded-2xl` 用在 Button/Input 上

---

## 3. 阴影规范

| 层级 | 值 | 用途 |
|------|-----|------|
| L1 卡片 | `0px 1px 4px rgba(0,0,0,0.05), 0px 0px 2px rgba(0,0,0,0.1)` | SurfaceCard |
| L2 内嵌 | `none` | 卡片内子卡 |
| L3 浮层 | `0px 4px 16px -2px rgba(0,0,0,0.08), 0px 2px 6px rgba(0,0,0,0.06)` | Dialog/Popover |
| L5 指示器 | `var(--shadow-segment)` | Tab 滑块 |

**禁止**: 不允许在组件上使用 inline `boxShadow`，统一用 CSS 变量

---

## 4. Button 组件

**文件**: `client/src/components/ui/button.tsx`

### 4.1 变体

| variant | 背景 | 边框 | 文字 | hover | disabled |
|---------|------|------|------|-------|----------|
| `claw-primary` / `default` | 黑蓝渐变 `#020617→#355EF1` | 无 | 白色 | 渐变加深 | 叠白30%+文字50% |
| `dialog-confirm` | 纯黑 `#0A0A0A` | 无 | 白色 | `bg-[#404040]` | `bg-[#A3A3A3]` 白字 |
| `claw-outline` / `outline` | 白色 | `#e5e5e5` | `#020617` | `bg-[#f5f5f5]` | 文字`rgba(2,6,23,0.3)` |
| `destructive` | `#d42a1e` | 无 | 白色 | `#b91c1c` | 40%透明 |
| `ghost` | 无 | 无 | `#020617` | `bg-[#f5f5f5]` | 文字30%透明 |
| `plain` | 白色 | `#e4e4e4` | `#020617` | `border-[#020617]` | 文字`rgba(0,0,0,0.3)` |
| `link` | 无 | 无 | `#355EF1` | 加下划线 | 40%透明 |
| `link-dark` | 无 | 无 | `#020617` | 文字`#525252` | 文字`rgba(2,6,23,0.3)` |

### 4.2 尺寸

| size | 高度 | padding |
|------|------|---------|
| `claw-lg` / `lg` | 40px | px-6 |
| `claw` / `default` | 36px | px-6 |
| `claw-sm` / `sm` | 32px | px-4 |
| `icon` | 36×36 | — |
| `icon-sm` | 32×32 | — |

### 4.3 约束

- 同行所有控件高度必须一致（如 Input h-9 + Button h-9）
- disabled 态有 `cursor-not-allowed`，不用全局 `opacity-50`
- **刷新按钮标准写法**: `<Button variant="claw-outline" size="icon" className="w-9 h-9">`
- **表格操作列**：操作列必须使用 `<TableActionCell>` 组件包裹，内部按钮自动强制应用 `link-dark` 黑色文字样式。也可手动使用 `variant="link-dark"`。禁止在操作列使用 outline、default、ghost 或自定义样式。

```tsx
import { TableActionCell } from "@/components/ui/table";

// 推荐：使用 TableActionCell 自动应用 link-dark 样式
<TableActionCell>
  <Button onClick={...}>编辑</Button>
  <Button onClick={...}>查看详情</Button>
  <Button onClick={...} disabled>删除</Button>
</TableActionCell>

// 也可手动指定 variant
<TableCell>
  <Button variant="link-dark" size="sm">编辑</Button>
  <Button variant="link-dark" size="sm">查看详情</Button>
</TableCell>
```

### link-dark 四种状态

| 状态 | 文字色 | 效果 |
|------|--------|------|
| Normal | `#020617` | 黑色文字，无背景无边框 |
| Hover | `#525252` | 文字变深灰 |
| Active/Click | `#020617` + 下划线 | 点击反馈 |
| Disabled | `rgba(2,6,23,0.3)` | 浅灰，无下划线 |

### 4.4 Plain 普通按钮（弹窗内筛选按钮）

**用途**：弹窗（Dialog）内的分类筛选切换按钮，交互风格与 §10.5 Tab 切换卡一致。

**四种状态（与 Tab 切换卡对齐）：**

| 状态 | 背景 | 边框 | 文字 |
|------|------|------|------|
| **Normal** | `#ffffff` | `#e4e4e4` | `#020617` |
| **Hover** | `#ffffff` | `#020617` | `#020617` |
| **Active（选中）** | `#020617` | `#020617` | 白色 |
| **Disabled** | `#ffffff` | `#e4e4e4` | `rgba(0,0,0,0.3)` |

**使用方式**：通过 `data-state="active"` 标记选中态。

```tsx
import { Button } from "@/components/ui/button";

// 弹窗内分类筛选按钮组
<div className="flex items-center gap-2 flex-wrap">
  {categories.map((cat) => (
    <Button
      key={cat.id}
      variant="plain"
      size="sm"
      data-state={activeCategory === cat.id ? "active" : undefined}
      onClick={() => setActiveCategory(cat.id)}
    >
      {cat.name}
    </Button>
  ))}
</div>
```

**适用场景**：
- 弹窗内的分类筛选（如技能分类、标签筛选）
- 需要多选/单选切换的按钮组
- 任何需要 active 态为黑底白字的切换场景

**与 Tab 切换卡的区别**：
- Tab 切换卡（§10.5）用原生 `<button>` 实现，适用于页面级分类筛选
- Plain 按钮用 `<Button variant="plain">` 实现，适用于弹窗内筛选，带有 Button 组件的标准圆角和尺寸

### 4.5 SmallIconStateButton（小图标按钮）

**文件**: `client/src/components/ui/button.tsx`（owner: miekoyychen）

用于列表行内的迷你操作按钮（如"添加"、"移除"），带图标 + 文字。

| 属性 | 说明 |
|------|------|
| 高度 | `h-6`（24px） |
| 圆角 | `rounded-[4px]` |
| padding | `px-2` |
| 字号 | `text-xs font-medium` |
| 图标 | `w-3 h-3`，与文字 `gap-1.5` |

| state | 边框 | 背景 | 文字 | hover |
|-------|------|------|------|-------|
| `default` | `#D4D4D4` | 白色 | `#0A0A0A` | `border-[#C9C9C9] bg-[#FAFAFA]` active:`bg-[#F5F5F5]` |
| `disabled` | `#D4D4D4` | 白色 | `#A3A3A3` | — |

**用法**:
```tsx
import { SmallIconStateButton } from "@/components/ui/button";

<SmallIconStateButton icon={Plus} label="添加" state="default" />
<SmallIconStateButton icon={Minus} label="移除" state="disabled" />
```

---

## 5. Input 组件

**文件**: `client/src/components/ui/input.tsx`

| 状态 | 边框 | 其他 |
|------|------|------|
| 默认 | `border-[#d3d6db]` | `rounded-[4px] h-9 px-3 text-[#020617]` |
| hover | `border-[#355EF1]` | — |
| focus | `border-[#355EF1]` | **无 ring、无 shadow** |
| 报错 | `border-[#d42a1e]` | — |
| disabled | `border-[#d3d6db]` | `bg-[#f3f3f4] text-[#b0b6c3]` |
| placeholder | — | `text-[#b0b6c3]` |

---

## 6. Select 组件

**文件**: `client/src/components/ui/select.tsx`

### Trigger
- 与 Input 完全一致：`h-9 rounded-[4px] border-[#d3d6db]`，hover/open 变 `border-[#355EF1]`

### Content（下拉面板）
- `bg-white rounded-[4px]` 无 border
- 阴影: `0px 0px 2px rgba(0,0,0,0.1), 0px 4px 16px rgba(0,0,0,0.12)`
- padding: `p-2`

### Item
- `h-8 rounded-[6px] px-3` hover: `bg-[#f3f3f4]`
- 选中态: `text-[#355EF1] font-medium` + 蓝色勾号

---

## 7. Dialog 组件

**文件**: `client/src/components/ui/dialog.tsx`

| 属性 | 值 |
|------|-----|
| 圆角 | `8px` |
| 遮罩 | `rgba(0,0,0,0.45)` |
| 阴影 | 三层阴影（见 L3） |
| 分割线 | **无**（Header/Footer 均无分割线） |
| 标题 | `16px font-semibold rgba(0,0,0,0.88)` |
| 关闭按钮 | `20px #7b818f` 右上角 `top-5 right-5` |
| Header | `pt-6 pb-3 -mx-6 px-6` |
| Footer | `pt-4 pb-6 -mx-6 px-6` 右对齐 |

### 7.1 内嵌组件强制规范（不可违反）

> 对话框 / 弹窗内出现的任何基础组件，**必须直接复用本设计 SKILL 中已定义的规范样式，禁止在弹窗内重新编造一套样式**。

| 组件 | 必须引用 | 关键约束 |
|------|----------|----------|
| Input | `client/src/components/ui/input.tsx`（见第 5 节） | 默认状态**禁止加底色**（无 `bg-gray-*` / `bg-[#FAFAFA]` 等），统一 `border-[#d3d6db]` + 白底 |
| Select / 下拉 | `client/src/components/ui/select.tsx`（见第 6 节） | Trigger 与 Input 完全一致，默认状态**禁止加底色**；`Content` 面板沿用统一阴影 |
| Table / 表格 | 见第 11.1 节 Table 表格组件规范 | 表头、行高、分割线、空状态等必须沿用全局 Table 规范，禁止在弹窗内自定义新表格样式 |

**强制条款**：

1. 弹窗内的 Input、Select（下拉）、Table 三类组件**必须** `import` 自 `@/components/ui/*`，禁止以 `<input>` / `<select>` / `<table>` 原生标签 + 临时 class 的方式拼凑。
2. **严禁**为弹窗内的 Input、Select 重新调色或重写样式；尤其：
   - **默认状态禁止加任何底色**（如 `bg-gray-50`、`bg-[#F5F5F5]`、`bg-[#FAFAFA]` 等），必须保持白底 + `border-[#d3d6db]`。
   - **禁用（disabled）状态禁止再添加 hover 样式**（不允许 `disabled:hover:*`、不允许在 disabled 下出现边框变蓝、底色加深等任何 hover 反馈）；disabled 视觉锁死为 `border-[#d3d6db] bg-[#f3f3f4] text-[#b0b6c3] cursor-not-allowed`。
3. 弹窗内 Table 必须沿用全局 Table 表头 / 行 / 边框 / 空状态样式，禁止重新定义表头底色、行高、分割线颜色。
4. 若弹窗内确有特殊视觉需求，**必须在本 SKILL 文档中扩展规范**后再使用，禁止在业务代码内单点编造样式绕过规范。

---

## 8. Checkbox 组件

**文件**: `client/src/components/ui/checkbox.tsx`

| 状态 | 样式 |
|------|------|
| 默认 | `border-[#d3d6db]` 无 shadow |
| hover | 边框变蓝 `border-[#355EF1]` |
| checked | `bg-[#355EF1] border-[#355EF1]` + 白勾 |
| disabled | 灰底，去掉 `opacity-50` |

---

## 9. Switch (Toggle) 组件

**文件**: `client/src/components/ui/switch.tsx`

| 状态 | 样式 |
|------|------|
| unchecked | `bg-[#d3d6db]` 轨道 |
| checked | `bg-[#355EF1]` 轨道 |
| thumb | 白色圆形 4px 内缩 |
| 尺寸 | `h-5 w-9` |

---

## 10. DatePicker 组件

**文件**: `client/src/components/ui/date-picker.tsx`

- Popover + Calendar 组合
- Trigger 与 Input 一致：`h-9 rounded-[4px] border-[#d3d6db]`
- hover/focus/open: `border-[#355EF1]`，**无外层 shadow**
- 右侧日历图标 `text-[#b0b6c3]`
- Calendar 选中日: `bg-[#355EF1] text-white`

---

## 11. Tab 切换卡（筛选标签按钮）

> Figma: node 1086:6426 (ClawPro 项目设计)
> 用于分类筛选场景（如技能库分类、技能列表分类等）

**使用原生 `<button>` 实现**（不使用 Button 组件，避免内置 hover 样式干扰）

### 四种状态

| 状态 | 背景 | 边框 | 文字 | 说明 |
|------|------|------|------|------|
| **Active（选中）** | `#020617` | `#020617` | 白色 | 黑底+黑边+白字 |
| **Hover（悬停）** | `#ffffff` | `#020617` | `#020617` | 白底+黑边+黑字 |
| **Normal（默认）** | `#ffffff` | `#e4e4e4` | `#020617` | 白底+灰边+黑字 |
| **Disabled（禁用）** | `#ffffff` | `#e4e4e4` | `rgba(0,0,0,0.3)` | 白底+灰边+淡字 |

### 视觉参数

| 属性 | 值 |
|------|-----|
| 高度 | `32px` (h-8) |
| 圆角 | `4px` (rounded-[4px]) |
| 内边距 | `px-4 py-[10px]` |
| 字号 | `14px` |
| 字重 | Regular (400) |
| 间距 | 标签之间 `gap-2`（8px） |

### 代码示例

```jsx
<div className="flex items-center gap-2 flex-wrap">
  <button
    onClick={() => setCategory(cat.id)}
    className={`h-8 px-4 rounded-[4px] text-sm leading-[22px] tracking-[0.07px] border transition-colors ${
      isActive
        ? 'bg-[#020617] border-[#020617] text-white'
        : 'bg-white border-[#e4e4e4] text-[#020617] hover:border-[#020617]'
    }`}
  >
    {cat.name}
  </button>
</div>
```

**注意**：设计稿中 Active 态的颜色是 `#165DFC`，但在代码实现中统一映射到 `claw-primary` variant（使用品牌渐变）。如需精确还原设计稿的纯蓝色 Active 态，可使用 className 覆盖。

---

## 12. Alert 提示组件

**文件**: `client/src/components/ui/alert.tsx`  
**Token 定义**: `client/src/index.css`

### 基础规则

所有页面信息提示、操作信息提示、警告提示、产品动态通知必须使用 shadcn Alert 标准结构，不允许在业务页面手写 `bg-blue-50` / `bg-amber-50` / `border-*` / `rounded-*` 拼装。

统一视觉参数：圆角使用 `--alert-radius: var(--radius)`（当前为 `4px`，组件内为 `rounded-[var(--alert-radius)]`）、`px-4 py-2.5`（上下各 `10px`）、图标 `16px`、图标列固定 `16px`、图标与文字间距 `8px`。图标使用 `translate-y-px`，与 12px / 18px 行高文字首行视觉居中。标题与描述必须拆成 `AlertTitle` / `AlertDescription` 两个兄弟节点，默认 `gap-y-1`，标题与描述上下间距 `4px`。字体必须受 Typography 组件约束：`AlertDescription` 使用 `MetaText`（12px / regular / 1.5 / `tone="inherit"`），`AlertTitle` 使用 `MetaMedium`（12px / medium / 1.5 / `tone="inherit"`）。正文默认保持 inline flow，允许文案中的 `span` 在同一行展示。

| Token | 值 | 用途 |
|------|-----|------|
| `--alert-radius` | `var(--radius)`（当前 `4px`） | Alert 容器圆角 |

### Info 类型（标准信息提示）

用于页面常驻说明、表单辅助提示、非阻断的信息告知。

```tsx
import { Alert, AlertDescription, AlertInfoIcon } from "@/components/ui/alert";

<Alert variant="info">
  <AlertInfoIcon />
  <AlertDescription>提示文案</AlertDescription>
</Alert>
```

Info 标准图标必须使用 `AlertInfoIcon`，不要在业务侧直接引入 lucide `Info` 拼装。

| Token | 值 | 用途 |
|------|-----|------|
| `--alert-info-bg` | `#F0F3FC` | Info 背景 |
| `--alert-info-border` | `#BFCFFE` | Info 描边 |
| `--alert-info-foreground` | `#0A0A0A` | Info 正文 |
| `--alert-info-icon` | `#1447E6` | Info 图标 |

### 操作 Info 类型（标准操作说明）

用于操作前后的辅助说明、勾选确认说明、批量操作说明、表单内非警告的操作提示。必须使用 `Alert variant="operation-info"`，左侧图标必须使用 `AlertOperationInfoIcon`；该图标复用 `AlertInfoIcon`，与普通 `info` 类型图标形状完全一致，仅颜色由 `--alert-operation-info-icon` 控制。

```tsx
import { Alert, AlertDescription, AlertOperationInfoIcon, AlertTitle } from "@/components/ui/alert";

<Alert variant="operation-info">
  <AlertOperationInfoIcon />
  <AlertTitle>操作说明标题</AlertTitle>
  <AlertDescription>操作说明描述</AlertDescription>
</Alert>
```

| Token | 值 | 用途 |
|------|-----|------|
| `--alert-operation-info-bg` | `#FFFFFF` | 操作 Info 背景 |
| `--alert-operation-info-border` | `#E5E5E5` | 操作 Info 描边 |
| `--alert-operation-info-foreground` | `var(--alert-info-foreground)` | 操作 Info 正文 |
| `--alert-operation-info-icon` | `#737373` | 操作 Info 图标 |

操作 Info 与普通 `info` 的区别：`info` 用于蓝色页面说明或功能告知；`operation-info` 用于白底灰边的操作上下文说明。两者图标形状一致，颜色分别由 `--alert-info-icon` / `--alert-operation-info-icon` 控制。禁止用手写白底灰边容器替代。

### Warning 类型（标准警告提示）

用于配置缺失、配额不足、风险提示、需要处理但非阻断的警告信息。管控端公告栏中除「产品动态」外，其余公告均使用 `Alert variant="warning"`。

```tsx
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert variant="warning">
  <CircleAlert />
  <AlertTitle>警告标题</AlertTitle>
  <AlertDescription>警告描述</AlertDescription>
</Alert>
```

Warning 标准图标必须使用 `CircleAlert`，禁止使用 `AlertTriangle` 作为标准 warning 横幅图标。仅危险确认、错误态等非 Alert 横幅场景可按语义单独使用 `AlertTriangle`。

| Token | 值 | 用途 |
|------|-----|------|
| `--alert-warning-bg` | `#FFF7ED` | Warning 背景 |
| `--alert-warning-border` | `#FED7AA` | Warning 描边 |
| `--alert-warning-foreground` | `#0A0A0A` | Warning 正文 |
| `--alert-warning-icon` | `#FF6900` | Warning 图标 |

### 产品动态类型

用于管控端顶部产品发布、版本更新、功能上线等非阻断动态告知。必须使用 `Alert variant="product-news"`，左侧图标必须使用设计稿沉淀的 `AlertProductNewsIcon`。颜色 token 通过产品动态语义变量映射到 Info 色值，禁止在业务组件中硬编码蓝色或改用 lucide `Sparkles`。

```tsx
import { Alert, AlertDescription, AlertProductNewsIcon } from "@/components/ui/alert";

<Alert variant="product-news">
  <AlertProductNewsIcon />
  <AlertDescription>【产品动态】提示文案</AlertDescription>
</Alert>
```

| Token | 值 | 用途 |
|------|-----|------|
| `--alert-product-news-bg` | `var(--alert-info-bg)` | 产品动态背景 |
| `--alert-product-news-border` | `var(--alert-info-border)` | 产品动态描边 |
| `--alert-product-news-foreground` | `var(--alert-info-foreground)` | 产品动态正文 |
| `--alert-product-news-icon` | `var(--alert-info-icon)` | 产品动态图标 |

### 带右侧操作区的公告栏写法

顶部常驻通知条可通过 `className` 增加第三列操作区，但颜色、字体、图标和基础间距必须由 Alert variant 与 token 控制。

```tsx
<Alert
  variant="warning"
  className="has-[>svg]:grid-cols-[16px_minmax(0,1fr)_auto] gap-y-0"
>
  <CircleAlert />
  <AlertDescription className="flex min-w-0 items-baseline flex-wrap gap-x-1 leading-[1.5]">
    警告文案
  </AlertDescription>
  <div className="col-start-3 shrink-0">操作区</div>
</Alert>
```

### 禁止事项

- 禁止业务页面继续手写 info / operation-info / warning / product-news 提示条样式。
- 禁止使用 warning/amber 样式承载普通信息提示；普通说明必须使用 `variant="info"` 或 `variant="operation-info"`。
- 禁止在业务组件中硬编码 Alert 色值，必须通过 `client/src/index.css` 的 `--alert-*` token。
- 禁止在 Alert 上使用 `rounded-lg` / `rounded-xl` / `shadow-*` / inline `boxShadow`。

---

## 13. 树结构组件（GroupTree / FileTree）

> 参考: shadcn/ui Collapsible FileTree（https://ui.shadcn.com/docs/components/base/collapsible#file-tree）
> 实现文件: `client/src/pages/admin/MemberManagement/GroupList.tsx`、`client/src/pages/admin/SkillLibrary/SkillDetail.tsx`

用于分组管理、文件树、目录导航等层级结构场景。**必须与 shadcn FileTree 完全一致。**

### 颜色规范（严格对齐 shadcn）

| 元素 | 颜色值 | CSS 变量语义 |
|------|--------|------|
| 文字（默认 & 选中） | `#09090b` | `text-foreground` |
| hover / 选中背景 | `#f4f4f5` | `bg-accent` |
| 箭头 / 图标（Chevron、Folder、File） | `#71717a` | `text-muted-foreground` |
| 计数 / 辅助文字 | `#a1a1aa` | `text-muted` |
| 禁用文字 | `#a1a1aa` + `opacity-60` | — |

### 图标规范

| 图标 | 用途 | 尺寸 | 颜色 |
|------|------|------|------|
| `ChevronRight` / `ChevronDown` | 展开/收起 | `w-4 h-4`（含在按钮中）或 `w-3.5 h-3.5` | `#71717a`（muted-foreground） |
| `FolderIcon` / `FolderOpen` | 文件夹 | `w-4 h-4` | `#71717a`（muted-foreground） |
| `FileIcon` / `FileText` | 文件 | `w-4 h-4` | `#71717a`（muted-foreground） |

> **重点**：所有图标统一使用 `text-[#71717a]`（muted-foreground），**不使用** gray-400 或其他灰色。

### 视觉参数

| 属性 | 值 |
|------|-----|
| 行高 | `h-8`（32px） |
| 圆角 | `rounded-[4px]` |
| 缩进 | shadcn 用 `ml-5`（20px），自定义实现用 `paddingLeft: 8 + depth * 16` |
| 行间距 | `gap-1`（4px）或 `mb-0.5` |
| 图标与文字间距 | `gap-1.5`（6px）或 `gap-2`（8px） |

### 交互状态

| 状态 | 样式 | 对应 shadcn class |
|------|------|------|
| 默认 | `text-[#09090b] bg-transparent` | `text-foreground` |
| Hover | `bg-[#f4f4f5] text-[#09090b]` | `hover:bg-accent hover:text-accent-foreground` |
| 选中（Active） | `bg-[#f4f4f5] text-[#09090b] font-medium` | `bg-accent text-accent-foreground` |
| 展开箭头旋转 | `transition-transform group-data-[state=open]:rotate-90` | shadcn 原生 |
| 禁用 | `text-[#a1a1aa] cursor-not-allowed opacity-60` | — |

### shadcn 标准实现（Collapsible 方式）

```tsx
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// 文件夹节点
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm" className="group w-full justify-start gap-2 text-[#09090b] hover:bg-[#f4f4f5] hover:text-[#09090b]">
      <ChevronRightIcon className="w-4 h-4 text-[#71717a] transition-transform group-data-[state=open]:rotate-90" />
      <FolderIcon className="w-4 h-4 text-[#71717a]" />
      {folderName}
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="ml-5">
    <div className="flex flex-col gap-1">
      {children}
    </div>
  </CollapsibleContent>
</Collapsible>

// 文件节点
<Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[#09090b] hover:bg-[#f4f4f5]">
  <FileIcon className="w-4 h-4 text-[#71717a]" />
  {fileName}
</Button>

// 文件节点（选中态）
<Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[#09090b] bg-[#f4f4f5] font-medium">
  <FileIcon className="w-4 h-4 text-[#71717a]" />
  {fileName}
</Button>
```

### 自定义实现（非 Collapsible 方式，如 GroupList）

```jsx
<div
  className={`group flex items-center gap-1.5 h-8 pr-3 text-sm cursor-pointer rounded-[4px] mx-3 mb-0.5 transition-colors ${
    isActive
      ? "bg-[#f4f4f5] text-[#09090b] font-medium"
      : "text-[#09090b] hover:bg-[#f4f4f5]"
  }`}
  style={{ paddingLeft: 8 + depth * 16 }}
>
  {/* 展开箭头 */}
  {hasChildren ? (
    <button className="w-4 h-4 flex items-center justify-center text-[#71717a] hover:text-[#09090b] shrink-0">
      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  ) : (
    <span className="w-4 h-4 shrink-0" />
  )}
  <FolderIcon className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
  <span className="truncate">{name}</span>
  <span className="text-[11px] tabular-nums shrink-0 text-[#a1a1aa]">({count})</span>
</div>
```

### 配套元素

- **搜索框**: `h-8 rounded-[4px] border-[#E4E4E4] focus:border-[#020617]`
- **操作按钮**: `w-5 h-5 rounded text-[#d4d4d4] hover:text-[#09090b] hover:bg-[#f4f4f5]`
- **筛选按钮**: `w-8 h-8 rounded-[4px] border-[#E4E4E4]`，活跃态 `border-[#020617] bg-[#f5f5f5]`

---

## 14. Badge 徽标组件

**文件**: `client/src/components/ui/badge.tsx`

| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-full` |
| padding | `px-2.5 py-0.5` |
| 字号 | `text-xs` |
| 图标 | `size-3 gap-1` |

**变体：**

| variant | 背景 | 文字 |
|---------|------|------|
| `default` | `#355EF1` | 白色 |
| `secondary` | `#f3f3f4` | `#020617` |
| `destructive` | `#d42a1e` | 白色 |
| `outline` | 白色 + `border-[#E5E5E5]` | `#020617` |

```tsx
import { Badge } from "@/components/ui/badge";
<Badge>New</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">错误</Badge>
```

---

## 15. Table 表格组件规范

**文件**: `client/src/components/ui/table.tsx`

> 所有管控端/用户端的数据表格必须使用标准 Table 组件，禁止使用原生 `<table>` + 自定义 class。

**设计令牌：**

| Token | Value |
|-------|-------|
| container | `w-full caption-bottom text-[14px] text-[#09090b]` |
| header / bg | `bg-[#fafafa]` |
| header / border | `border-b border-[#f0f0f0]` |
| head cell / height | `54px` |
| head cell / padding | `px-4` |
| head cell / font | `text-[14px] font-semibold text-[#09090b]` |
| body row / border | `border-b border-[#f0f0f0]` |
| body row / hover | `hover:bg-[#fafafa]` |
| body row / selected | `bg-[rgba(53,94,241,0.06)]` |
| body cell / padding | `px-4 py-3` |
| body cell / font | `text-[14px] text-[#09090b]` |
| footer / bg | `bg-[#fafafa] border-t border-[#f0f0f0]` |

**组件导出：**

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActionCell,
  TableFooter,
  TableCaption,
} from "@/components/ui/table";
```

**标准用法：**

```tsx
<div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>名称</TableHead>
        <TableHead>状态</TableHead>
        <TableHead className="text-right">数量</TableHead>
        <TableHead>操作</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell><StatusTag variant="green" dot>运行中</StatusTag></TableCell>
          <TableCell className="text-right tabular-nums">{item.count}</TableCell>
          <TableActionCell>
            <Button onClick={...}>编辑</Button>
            <Button onClick={...}>删除</Button>
          </TableActionCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  {/* 分页器放在表格外部，带 padding 和 border-t */}
  <div className="px-4 py-3 border-t border-[#f0f0f0]">
    <Pagination total={data.length} current={page} pageSize={PAGE_SIZE} showTotal={(t) => `共 ${t} 条`} className="w-full justify-between" onChange={setPage} />
  </div>
</div>
```

**操作列规则（强制）：**
- 操作列必须使用 `<TableActionCell>` 包裹 —— 内部按钮自动应用 `link-dark` 黑色文字按钮样式
- 也可在 `<TableCell>` 中手动使用 `<Button variant="link-dark">`
- 操作按钮之间用 `gap-3` 或 `gap-4` 分隔
- 禁止在操作列使用 ghost、outline、default 或自定义按钮样式

**禁止事项：**
- 禁止使用原生 `<table>` + 自定义 class（如 `text-xs font-medium text-gray-500 uppercase tracking-wide`）
- 禁止自定义表头背景色（如 `bg-gray-50/50`），统一使用 TableHeader 的 `bg-[#fafafa]`
- 禁止自定义行 hover 效果（如 `hover:bg-gray-50/50`），使用 TableRow 内置 `hover:bg-[#fafafa]`
- 禁止在操作列使用非 link-dark 按钮或自定义 `<button>`
- 分页器必须放在 Table 外部、容器内部，用 `<div className="px-4 py-3 border-t border-[#f0f0f0]">` 包裹

---

## 16. StatusTag 状态标签规范

**文件**: `client/src/components/ui/status-tag.tsx`

> 用于表格、卡片、列表中表示状态（运行中/已停止/待处理）或分类属性（管理员/用户/个人）的轻量标签。

**设计令牌：**

| Token | Value |
|-------|-------|
| height | `20px` (h-5) |
| border-radius | `full` (rounded-full) |
| padding | `px-2 py-[2px]` |
| font | `text-xs (12px) leading-3 tracking-[0.18px]` |
| dot size | `6px` (w-1.5 h-1.5 rounded-full) |
| gap (dot ↔ text) | `4px` (gap-1) |

**变体色板：**

| variant | 背景 | 文字/圆点 | 使用场景 |
|---------|------|-----------|----------|
| `green` | `#E9F8EB` | `#008236` | 正常、运行中、已完成、开启 |
| `gray` | `#F5F5F5` | `#0A0A0A` | 默认、待处理、关闭、用户角色 |
| `blue` | `#E8ECFE` | `#1447E6` | 管理员、进行中、类型标签 |
| `red` | `#FEF2F2` | `#DC2626` | 错误、失败、异常 |

**使用方式：**

```tsx
import { StatusTag } from "@/components/ui/status-tag";

// 带圆点（状态指示）
<StatusTag variant="green" dot>运行中</StatusTag>
<StatusTag variant="gray" dot>已停止</StatusTag>
<StatusTag variant="red" dot>异常</StatusTag>

// 无圆点（分类属性）
<StatusTag variant="blue">管理员</StatusTag>
<StatusTag variant="gray">用户</StatusTag>
<StatusTag variant="blue">个人</StatusTag>
```

**使用规则：**
- 表格中状态列必须使用 `StatusTag`，禁止自定义 `<span>` + 颜色 class
- 开启/关闭状态：`variant="green" dot` / `variant="gray" dot`
- 角色/类型标签：`variant="blue"` 或 `variant="gray"`（无 dot）
- 错误/失败状态：`variant="red" dot`

**禁止事项：**
- 禁止使用自定义的 `bg-blue-50 text-blue-600 rounded-xl` 或 `bg-green-50 text-green-600` 等样式替代 StatusTag
- 禁止使用红/绿色纯文字（如 `text-green-600` / `text-red-500`）表示开关状态
- 禁止自定义标签圆角（如 `rounded-xl`），统一使用组件内置的 `rounded-full`

---

## 17. DropdownMenu 下拉菜单规范

**文件**: `client/src/components/ui/dropdown-menu.tsx`

| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-[8px]` |
| 最小宽度 | `min-w-[8rem]` |
| padding (content) | `p-1` |
| padding (item) | `py-1.5 px-2 text-sm` |
| hover | `bg-[#f5f5f5]` |
| 文字 | `#020617` |
| 图标色 | `#7b818f` |
| disabled | `#d3d6db` |
| 分割线 | `bg-[#e5e5e5]` |
| 阴影 | `0_6px_16px rgba(0,0,0,0.08), 0_3px_6px rgba(0,0,0,0.12), 0_9px_28px rgba(0,0,0,0.05)` |

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
```

---

## 18. Tooltip 提示浮层规范

**文件**: `client/src/components/ui/tooltip.tsx`

| 属性 | 值 |
|------|-----|
| 背景 | `#020617` |
| 文字 | 白色 |
| 圆角 | `rounded-[4px]` |
| padding | `px-3 py-1.5` |
| 字号 | `text-xs leading-relaxed` |

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger asChild><span>hover me</span></TooltipTrigger>
  <TooltipContent side="top" className="text-xs">提示文字</TooltipContent>
</Tooltip>
```

**禁止事项：**
- 禁止用 `p-0` 重置 padding 后自定义内部间距
- 禁止使用过大的 Tooltip（如需展示多行内容，应改用 Popover）

---

## 19. Popover 气泡卡片规范

**文件**: `client/src/components/ui/popover.tsx`

| 属性 | 值 |
|------|-----|
| 背景 | 白色 |
| 边框 | `border-[#e5e5e5]` |
| 圆角 | `rounded-[8px]` |
| 默认宽度 | `w-72` |
| padding | `p-4` |
| 阴影 | 与 DropdownMenu 一致（三层） |
| sideOffset | `4px` |

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
```

---

## 20. Card 卡片规范

**文件**: `client/src/components/ui/card.tsx`

| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-xl` |
| 边框 | `border-[#e5e5e5]` |
| 内间距 | header/content/footer 各 `px-6`，整体 `py-6 gap-6` |
| 阴影 | 无（如需阴影请使用 `SurfaceCard`） |

**子组件：** `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` / `CardAction`

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
```

---

## 21. RadioGroup 单选组规范

**文件**: `client/src/components/ui/radio-group.tsx`

| 属性 | 值 |
|------|-----|
| 尺寸 | `size-4` (16px) |
| 圆角 | `rounded-full` |
| 边框默认 | `#E5E5E5` |
| 边框 hover/checked | `#1447E6` |
| 圆点填充 | `#355EF1` (size-2) |
| focus ring | `#355EF1/20` |
| disabled | `bg-[#f3f3f4] cursor-not-allowed` |
| 组间距 | `gap-3` |

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="a" id="a" />
    <Label htmlFor="a">选项 A</Label>
  </div>
</RadioGroup>
```

---

## 22. Avatar 头像规范

**文件**: `client/src/components/ui/avatar.tsx`

| 属性 | 值 |
|------|-----|
| 默认尺寸 | `size-8` (32px) |
| 圆角 | `rounded-full` |
| fallback 背景 | `bg-muted` |

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src={url} />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

---

## 23. Label 标签规范

**文件**: `client/src/components/ui/label.tsx`

| 属性 | 值 |
|------|-----|
| 字号 | `text-xs` |
| 字重 | `font-medium` |
| 颜色 | `#525252` |
| 行高 | `leading-none` |
| disabled | `opacity-50 cursor-not-allowed` |

```tsx
import { Label } from "@/components/ui/label";
<Label htmlFor="email">邮箱地址</Label>
```

---

## 24. Empty 空白页/空状态规范

**文件**: `client/src/components/ui/empty.tsx`

| 属性 | 值 |
|------|-----|
| 边框 | `border-dashed border-[#e5e5e5]` |
| 圆角 | `rounded-[4px]` |
| padding | `p-6` (移动端) / `md:p-12` (桌面端) |
| 标题 | `text-lg font-medium` |
| 描述 | `text-sm text-muted-foreground` |
| 图标区域 | `size-10 bg-muted rounded-[4px]` + `size-6` 图标 |

```tsx
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

<Empty>
  <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
  <EmptyHeader>
    <EmptyTitle>暂无数据</EmptyTitle>
    <EmptyDescription>当前没有可显示的内容</EmptyDescription>
  </EmptyHeader>
</Empty>
```

**Upload 上传区域**与 Empty 共享相同的 dashed 边框样式，额外约束：边框 `1px`，禁止使用默认 Upload 图标。

---

## 25. Segment 分段选择器规范

文件：`client/src/components/ui/segment.tsx`

> Segment 与 Tabs 的区别：Tabs 活跃态为品牌蓝 `#355EF1`；Segment 活跃态为深色 `#020617` + `font-semibold` + 白底浮起。Segment 适用于内容区域的子分类切换（如详情页各 Tab）。

**设计令牌（对齐 Figma）：**

| Token | Value |
|-------|-------|
| container / bg | `#f3f3f4` |
| container / radius | `6px` |
| container / padding | `3px` |
| container / height | `36px` (h-9) |
| item / active bg | `#FFFFFF` |
| item / active text | `#020617` (font-semibold) |
| item / active shadow | `0px 1px 2px rgba(0,0,0,0.05)` |
| item / active radius | `4px` |
| item / inactive text | `#7b818f` (font-normal) |
| item / hover text | `#4b5563` |
| item / padding | `4px 16px` |
| item / disabled text | `#d3d6db` |

**使用方式：**
```jsx
import { Segment, SegmentList, SegmentItem, SegmentContent } from "@/components/ui/segment";

<Segment defaultValue="basic">
  <SegmentList>
    <SegmentItem value="basic">基础配置</SegmentItem>
    <SegmentItem value="tools">工具管理</SegmentItem>
    <SegmentItem value="memory">记忆管理</SegmentItem>
  </SegmentList>
  <SegmentContent value="basic">...</SegmentContent>
  <SegmentContent value="tools">...</SegmentContent>
</Segment>
```

**禁止事项：**
- 禁止用 className 覆盖 Segment 组件样式
- 页面内分类切换统一使用 Segment，不再自行写 button + border-l 的竖向导航

---

## 26. Pagination 分页器规范

文件：`client/src/components/ui/pagination.tsx`

> 全局统一分页组件，参考 Ant Design Pagination 风格，使用项目品牌色。所有页面和弹窗中的分页必须使用此组件，禁止自行实现内联分页。

**设计令牌：**

| Token | Value |
|-------|-------|
| item / size (default) | `32px` (h-8 min-w-[32px]) |
| item / size (small) | `24px` (h-6 min-w-[24px]) |
| item / border-radius | `8px` (rounded-lg) |
| item / border (inactive) | `#e5e5e5` |
| item / bg (inactive) | `#FFFFFF` |
| item / text (inactive) | `#000000e0` |
| item / hover bg | `#f5f5f5` |
| item / active border | `#1447E6` |
| item / active text | `#355EF1` |
| item / active bg | `#FFFFFF` |
| item / disabled text | `#00000040` |
| arrow / border | `#e5e5e5` |
| arrow / hover bg | `#f5f5f5` |
| focus ring | `border-[#1447E6] shadow-[0_0_0_2px_rgba(53,94,241,0.1)]` |
| sizeChanger / hover border | `#1447E6` |

**使用方式：**

```tsx
import { Pagination } from "@/components/ui/pagination";

// 基础用法
<Pagination total={100} current={page} pageSize={10} onChange={(p) => setPage(p)} />

// 完整功能（带总数、每页条数选择、快速跳转）
<Pagination
  total={500}
  current={page}
  pageSize={pageSize}
  showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
  showSizeChanger
  pageSizeOptions={[10, 20, 50, 100]}
  showQuickJumper
  onChange={(p, size) => { setPage(p); setPageSize(size); }}
/>

// 简洁模式（仅 < 1/5 >）
<Pagination total={50} current={page} pageSize={10} simple onChange={(p) => setPage(p)} />

// 小尺寸 + 平铺布局
<Pagination
  total={total}
  current={page}
  pageSize={PAGE_SIZE}
  size="small"
  showTotal={(total) => `共 ${total} 条`}
  className="w-full justify-between"
  onChange={(p) => setPage(p)}
/>
```

**Props 速查：**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `total` | `number` | — | 数据总条数（必填） |
| `current` | `number` | `1` | 当前页码（受控） |
| `pageSize` | `number` | `10` | 每页条数 |
| `onChange` | `(page, pageSize) => void` | — | 页码/条数变化回调 |
| `showTotal` | `(total, [start, end]) => ReactNode` | — | 左侧总数文案 |
| `showSizeChanger` | `boolean` | `false` | 显示每页条数选择器 |
| `pageSizeOptions` | `number[]` | `[10,20,50,100]` | 条数选项 |
| `showQuickJumper` | `boolean` | `false` | 显示跳页输入框 |
| `simple` | `boolean` | `false` | 简洁模式 |
| `size` | `"default" \| "small"` | `"default"` | 尺寸 |
| `hideOnSinglePage` | `boolean` | `false` | 单页时隐藏 |
| `disabled` | `boolean` | `false` | 禁用 |
| `className` | `string` | — | 外层 nav 额外样式 |

**尺寸使用规则（强制）：**

| 尺寸 | 值 | 使用场景 |
|------|-----|---------|
| `size="default"`（默认） | **32px** (h-8) | 页面级表格底部分页，所有常规列表 |
| `size="small"` | **24px** (h-6) | **仅限**弹窗（Dialog）内的表格分页 |

> ⚠️ 页面表格一律使用 32px 默认尺寸，不允许使用 small。只有 Dialog 内空间受限时才用 24px。

**禁止事项：**
- 禁止在页面中自行实现分页按钮逻辑（内联 prev/next button、Array.from 页码循环等）
- 禁止自定义分页样式覆盖组件样式（如蓝色填充背景 `bg-[#355EF1] text-white`）
- 新页面/弹窗中出现列表分页，必须直接使用此组件
- 现有页面修改时如发现内联分页，应顺手替换为标准组件

设计稿样式（适用于 OpenClawMonitor/TokensMonitor/FileManagement/SecurityManagement）：

```jsx
<div className="bg-white rounded-[4px] border border-[#E5E5E5] px-6 py-5 flex flex-col gap-4">
  <div className="flex items-center gap-1">
    {/* 18x18 SVG 图标（渐变色 #202020→#0080FF） */}
    <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">标签</span>
  </div>
  <p className="text-2xl font-bold text-black" style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}>数值</p>
</div>
```

---

## 27. 全局描边颜色规则

| 用途 | 色值 | 说明 |
|------|------|------|
| 卡片默认描边 | `#E5E5E5` | 所有卡片统一 |
| 表单控件默认描边 | `#d3d6db` | Input/Select/DatePicker |
| hover/focus/选中描边 | `#355EF1` | 品牌蓝，唯一激活色 |
| 分割线 | `#E5E5E5` | separator |

**禁止**: 不允许使用 `border-gray-200`、`border-blue-300`、`border-green-300` 等非规范色

---

## 28. 强制执行规则

1. **组件源文件 (`client/src/components/ui/*.tsx`) 只有 addietang 可以修改**
2. 其他人使用组件时，不允许通过 className 覆盖组件定义的颜色/边框/圆角
3. 用户端新增页面 / 新增业务组件必须优先使用 `Typography.tsx` 中的文字组件，不再自行拼装基础文字色、字号、字重
4. 修改用户端旧页面时，遵循“触达即同步”：当前文件内明显的标题、正文、Meta、数字、代码文字应同步迁移到 Typography
5. 新增全局组件时，组件内部文字规格必须先映射到 Typography 层级；如确需新增文字层级，先更新本规范和 `Typography.tsx`
6. 如发现 rebase 后组件样式被改，以 addietang 和 miekoyychen 的版本为准强制恢复
7. 新增组件需经 addietang 和 miekoyychen 审核后才能合入基线
8. **对话框 / 弹窗内的 Input、下拉（Select）、Table 必须直接 import 自 `@/components/ui/*` 且与本 SKILL 第 5 / 6 / 11.1 节规范完全一致**：
   - 禁止在弹窗中重新编造 Input / Select / Table 样式
   - Input / Select **默认状态禁止加底色**（白底 + `border-[#d3d6db]`）
   - Input / Select **禁用（disabled）状态禁止添加任何 hover 样式**（不允许 `disabled:hover:*`，不允许出现边框变蓝、底色加深等反馈）

---

## 29. 管控端左侧导航 AdminSidebar（owner: miekoyychen）

> **Owner**: miekoyychen  
> **源文件**: `client/src/components/ui/admin-sidebar.tsx`  
> **CSS 变量**: `client/src/index.css` 中 `--admin-sidebar-*` 部分  
> **修改权限**: 仅 miekoyychen 可修改 sidebar 相关源文件和 CSS 变量

### 15.1 CSS Token（定义在 `:root`）

| Token | 值 | 说明 |
|-------|-----|------|
| `--admin-sidebar-width` | `232px` | 展开宽度 |
| `--admin-sidebar-width-collapsed` | `64px` | 收起宽度 |
| `--admin-sidebar-header-height` | `72px` | 头部高度 |
| `--admin-sidebar-footer-height` | `72px` | 底部高度 |
| `--admin-sidebar-bg` | `#ffffff` | 背景色 |
| `--admin-sidebar-border` | `#e5e5e5` | 边框色 |
| `--admin-sidebar-foreground` | `#0a0a0a` | 主文字色 |
| `--admin-sidebar-muted` | `#737373` | 辅助文字色（分组标题、badge） |
| `--admin-sidebar-item-height` | `32px` | 菜单项高度 |
| `--admin-sidebar-item-radius` | `4px` | 菜单项圆角 |
| `--admin-sidebar-item-hover-bg` | `#f5f5f5` | 菜单项 hover 背景 |
| `--admin-sidebar-item-active-bg` | `linear-gradient(90deg, #EBF4FF 0%, #DCE8FE 100%)` | 活跃项渐变背景 |
| `--admin-sidebar-action-bg` | `#ffffff` | 头部操作按钮背景 |
| `--admin-sidebar-action-border` | `#e3e3e3` | 头部操作按钮边框 |
| `--admin-sidebar-action-hover-bg` | `#f5f5f5` | 头部操作按钮 hover 背景 |
| `--admin-sidebar-action-hover-border` | `#e3e3e3` | 头部操作按钮 hover 边框 |
| `--admin-sidebar-badge-bg` | `#f5f5f5` | badge 背景 |

### 15.2 结构组件

| 组件 | 样式 |
|------|------|
| `AdminSidebar` | `fixed inset-y-0 left-0 z-40 flex flex-col border-r` + 宽度过渡 300ms |
| `AdminSidebarHeader` | `h-[72px] px-4 border-b border-[--admin-sidebar-border]` |
| `AdminSidebarContent` | `flex-1 overflow-y-auto px-4 py-4` + 自定义滚动条（`.scrollbar-on-hover`） |
| `AdminSidebarFooter` | `h-[72px] px-6 border-t border-[--admin-sidebar-border]` |
| `AdminSidebarInset` | `flex-1 min-w-0 overflow-x-hidden` + `margin-left` 跟随侧边栏宽度 |

### 15.3 菜单项样式

| 状态 | 样式 |
|------|------|
| Normal | `h-[32px] px-2 gap-2 rounded-[4px] text-[13px] text-[--admin-sidebar-foreground]` |
| Hover | `background: var(--admin-sidebar-item-hover-bg)` (#f5f5f5) |
| Active | `background: var(--admin-sidebar-item-active-bg)` (蓝色渐变) + `font-medium` |
| Icon | `size-4 shrink-0` |
| 文字 | `tracking-[0.005em] leading-5` |

### 15.4 分组标题

- `text-xs font-normal tracking-[0.015em] text-[--admin-sidebar-muted]`
- 带折叠/展开箭头（ChevronUp/Down `size-3`）
- hover: `text-gray-900`

### 15.5 Badge（New/即将开放）

- `h-[18px] rounded-[2px] px-1 text-[10px] font-semibold`
- 背景: `var(--admin-sidebar-badge-bg)` (#f5f5f5)
- 文字: `var(--admin-sidebar-muted)` (#737373)

### 15.6 头部品牌区

- Logo: 36×28 SVG
- 品牌名: `text-sm font-medium text-[--admin-sidebar-foreground]` hover → `#355EF1`
- 副标题: `text-xs font-normal text-[--admin-sidebar-muted]` hover → `#355EF1`

### 15.7 头部操作按钮（前往用户端）

- `size-8 rounded-[4px] border` 
- Normal: `bg-[--admin-sidebar-action-bg] border-[--admin-sidebar-action-border]`
- Hover: `bg-[--admin-sidebar-action-hover-bg] border-[--admin-sidebar-action-hover-border]`
- Icon: `size-4`

### 15.8 底部用户区

- Avatar: `size-8 rounded-md bg-gradient-to-br from-green-600 to-green-700` + 白字
- 用户名: `text-sm font-medium text-[--admin-sidebar-foreground]`
- 角色: `text-xs font-normal text-[--admin-sidebar-foreground]`
- 更多按钮: `size-8 rounded-lg` hover → `bg-gray-50 text-gray-900`

### 15.9 过渡动画

- 侧边栏展开/收起: `transition-[width] duration-300`
- 内容区跟随: `transition-[margin-left] duration-300`
- 菜单项交互: `transition-all duration-150`

### 15.10 强制规则

1. **`admin-sidebar.tsx` 及 `index.css` 中 `--admin-sidebar-*` 变量仅 miekoyychen 可修改**
2. 其他人不得覆盖 sidebar 组件的样式、token 或结构
3. 如需新增侧边栏功能，需经 miekoyychen 审核
