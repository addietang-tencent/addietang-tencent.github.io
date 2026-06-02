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

## 📚 配套规范（必读）

本文件是**全平台共享**的基础组件规范。在以下场景中必须叠加加载额外规范：

| 场景 | 必读规范 | 冲突优先级 |
|------|----------|------------|
| 用户端（Tenant）页面 / 组件 | 📄 [SKILL-TENANT.md](./SKILL-TENANT.md) | **Tenant > 本文件**（仅在用户端） |
| 管控端（Admin）页面 / 组件 | 📄 [SKILL.md](./SKILL.md) | 本文件 > SKILL.md |
| 设计语言 / 色彩 / 布局通则 | 📄 [SKILL.md](./SKILL.md) | — |

**用户端共享组件扩展约束**：用户端如需对 Button / Card / Tabs 等共享组件做差异化样式，**必须新增 `tenant-*` 变体**，禁止覆盖现有 `claw-*` 变体或默认样式，避免影响管控端。具体规则见 `SKILL-TENANT.md`。

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
| `primary` | `text-gray-900` | `#171717` | 标题、卡片标题、主内容 |
| `emphasis` | `text-gray-950` | `#0A0A0A` | 强调文字、按钮文字、关键字段 |
| `body` | `text-gray-900` | `#171717` | 正文主内容、表格内容 |
| `secondary` | `text-gray-700` | `#404040` | 同字号描述性正文、补充说明、次级信息 |
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
| `BodyText` | `p` | 14px / Regular / 1.5 | `body` | 普通正文、表格内容；描述行用 `tone="secondary"` |
| `BodyMedium` | `span` | 14px / Medium / 1.5 | `emphasis` | 按钮、Tab、Label、列表主字段 |
| `CompactText` | `span` | 13px / Regular / 1.5 | `secondary` | 紧凑列表、空间不足的轻量描述 |
| `MiniBodyText` | `span` | 12px / Regular / 1.5 | `body` | 紧凑表格正文、高密度列表主内容 |
| `MetaText` | `span` | 12px / Regular / 1.5 | `muted` | 时间、ID、Tooltip、辅助说明、空状态 |
| `MetaMedium` | `span` | 12px / Medium / 1.5 | `muted` | 表头、次级强调 |
| `SmallBodyText` | `span` | 12px / Medium / 12px / tracking 0.18px | `emphasis` | `StatusTag` 内文字、小型信息标签 |
| `TinyText` | `span` | 10px / Semibold / Open Sans | `brand` | `New` / `Beta` / 小角标 |
| `StatNumber` | `span` | 24px / Bold / DIN | `emphasis` | 统计数字、额度数字 |
| `InlineNumber` | `span` | 14px / DIN / tabular | `body` | 表格内 Token 数、请求数、百分比 |
| `CodeText` | `code` | 12px / Menlo | `secondary` | ID、Token、路径、命令、代码片段 |
| `StepText` | `span` | 14px / Medium / Menlo | `brand` | Step 1 / Step 2 / 步骤编号 |
| `UrlText` | `span` | 14px / Regular / PingFang SC / 1.5 / `break-all` / `#020617` | `inherit` | URL、回调地址、外链链接、版本号字符串等需要中性等宽呈现的引用文本 |

### 0.4 使用方式

```tsx
import {
  TenantPageTitle,
  PanelTitle,
  CardTitle,
  BodyText,
  BodyMedium,
  MetaText,
  SmallBodyText,
  StatNumber,
  CodeText,
  UrlText,
} from "@/components/ui/Typography";

<TenantPageTitle>Agent 详情</TenantPageTitle>
<BodyText>这里是当前 Agent 的模型、通道和技能配置说明。</BodyText>
<BodyText tone="secondary">这是同字号描述性文字，颜色浅一档。</BodyText>
<PanelTitle as="h3">模型使用汇总</PanelTitle>
<CardTitle>Alice 的技术助手</CardTitle>
<BodyMedium tone="brand">查看详情</BodyMedium>
<MetaText>更新于 2026-05-21 21:14</MetaText>
<SmallBodyText>用户</SmallBodyText>
<StatNumber>128,000</StatNumber>
<CodeText>ins-g71c6vud</CodeText>
<UrlText>https://api.example.com/v1/chat/completions</UrlText>
```

### 0.5 组件作者如何受影响

新建或修改全局组件时，按下面规则处理组件内部文字：

| 组件类型 | 内部文字推荐 |
|----------|--------------|
| Button / Tab / Segment item | `BodyMedium` 对应规格：14px / Medium / `emphasis`；组件内部可直接写等效 class，但不得偏离 Typography token |
| Dialog / Sheet 标题 | `PanelTitle` |
| Card 标题 | `CardTitle` |
| 表格表头 | 标准版用 `BodyMedium`（14px / Medium / `emphasis`）；紧凑版用 `MetaMedium` |
| 表格内容 | 标准版用 `BodyText` 或 `InlineNumber`（默认 `body`）；紧凑版用 `MiniBodyText`；同字号描述行用对应组件的 `tone="secondary"` |
| 空状态说明 | `MetaText tone="weak"` |
| Badge / New / Beta | `TinyText` 或 `MetaMedium`，英文 Badge 优先 `TinyText` |
| StatusTag / 小型信息标签 | `SmallBodyText` 对应规格：12px / Medium / `emphasis` / tracking 0.18px |
| 统计卡数字 | `StatNumber` |
| ID / Token / 路径 | `CodeText` |
| URL / 回调地址 / 外链 | `UrlText` |

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
2. **不破坏色阶**：仍应使用 `#0A0A0A / #171717 / #404040 / #737373 / #A3A3A3 / #1447E6` 等既有 token。
3. **不新增无说明的字体族**：禁止新增 inline `fontFamily`；数字 / 代码 / 英文 Badge 优先使用 `font-din` / `font-mono` / `font-en`。
4. **不扩大豁免范围**：特殊内容区只豁免内容正文，不豁免页面标题、模块标题、Meta、数字、ID / Token / 路径。
5. **形成通用模式时反向沉淀**：如果某个例外被多个页面复用，应补充到 `Typography.tsx` 与本规范，而不是长期散落在页面里。

常见可豁免场景：Markdown 正文渲染、聊天消息正文、代码编辑器、图表坐标轴 / 图例、第三方富文本内容、极小空间内的特定角标。

---

## 1. 品牌色系

| 色值 | 变量/用途 |
|------|----------|
| `#355EF1` | 品牌蓝（`--color-blue-500`），hover/focus/选中态统一用色 |
| `#0A0A0A` | 强调文字（gray-950） |
| `#171717` | 主文字 / 正文（gray-900） |
| `#404040` | 次级文字（gray-700） |
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
| `claw-primary` / `default` | 纯黑 `#0A0A0A` | 无 | 白色 | `#1a1a1a` | `#0A0A0A/40` + 文字50% |
| `dialog-confirm` | 纯黑 `#0A0A0A` | 无 | 白色 | `bg-[#404040]` | `bg-[#A3A3A3]` 白字 |
| `claw-outline` / `outline` | 白色 | `#EAEEF4` | `#020617` | `bg-[#f5f5f5]` | 文字`rgba(2,6,23,0.3)` |
| `destructive` | `#d42a1e` | 无 | 白色 | `#b91c1c` | 40%透明 |
| `ghost` | 无 | 无 | `#020617` | `bg-[#f5f5f5]` | 文字30%透明 |
| `plain` | 白色 | `#e4e4e4` | `#020617` | `border-[#020617]` | 文字`rgba(0,0,0,0.3)` |
| `link` | 无 | 无 | `#355EF1` | 加下划线 | 40%透明 |
| `link-dark` | 无 | 无 | `#020617` | 文字`#525252` | 文字`rgba(2,6,23,0.3)` |

> **注**：`link` / `link-dark` 是**纯内联文字**形态，**强制清零 padding 与高度**（`!px-0 !py-0 !h-auto`），不受 `size` 影响——所以无论传 `size="default"` / `size="sm"`，按钮都是纯文字尺寸，方便在表格操作列、行内提示等场景与周围文字基线对齐。如果需要给 link 增加点击热区，请用外层包装容器自行加 `padding`。

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
- **表格操作列**：操作列必须使用 `<TableActionCell>` 组件包裹，内部按钮**必须**显式声明 `variant="link"`（品牌蓝文字按钮 `#355EF1`）。`TableActionCell` 内置 `flex items-center gap-3` 容器，**操作项间距固定 12px**，且与表头 `<TableHead>` 的 `px-4` 完全对齐，业务侧无需再手写外层 `<div>` wrapper。禁止省略 variant（会得到默认 claw-primary 实心按钮），禁止使用 outline、default、ghost、link-dark 或自定义样式。

```tsx
import { TableActionCell } from "@/components/ui/table";

// ✅ 正确：直接把 Button 平铺为 children，TableActionCell 自动应用 flex + gap-3 + 左对齐
<TableActionCell>
  <Button variant="link" onClick={onEdit}>编辑</Button>
  <Button variant="link" onClick={onView}>查看详情</Button>
  <Button variant="link" onClick={onDelete} disabled>删除</Button>
</TableActionCell>

// ✅ 删除按钮也统一蓝色 link，**不再用红色覆盖**（语义差异由二次确认 Dialog 承担）
<TableActionCell>
  <Button variant="link" onClick={onEdit}>编辑</Button>
  <Button variant="link" onClick={onDelete}>删除</Button>
</TableActionCell>

// ✅ 给内置 flex 容器追加 className（如固定高度让按钮组高度一致）
<TableActionCell actionsClassName="h-5">
  <Button variant="link">终端</Button>
  <Button variant="link">关机</Button>
</TableActionCell>

// ✅ 特殊布局（多行 / 自定义 wrapper）：设 rawChildren 关闭内置 flex 容器
<TableActionCell rawChildren>
  <div className="grid grid-cols-2 gap-2">...</div>
</TableActionCell>

// ❌ 错误：再嵌套 <div className="flex items-center gap-3"> wrapper（多余且会与内置容器叠加）
<TableActionCell>
  <div className="flex items-center gap-3">
    <Button variant="link">编辑</Button>
  </div>
</TableActionCell>

// ❌ 错误：省略 variant 会得到 claw-primary 实心纯黑按钮
<TableActionCell>
  <Button onClick={onEdit}>编辑</Button>
</TableActionCell>

// ❌ 错误：禁止再使用 link-dark
<TableActionCell>
  <Button variant="link-dark" onClick={onEdit}>编辑</Button>
</TableActionCell>
```

### link 四种状态（操作列按钮的标准色阶，对齐 button.tsx variant="link"）

| 状态 | 文字色 | 效果 |
|------|--------|------|
| Normal | `#355EF1` | 品牌蓝文字，无背景无边框 |
| Hover | `#355EF1` + 下划线 | 鼠标移入加下划线 |
| Active/Click | `#0a226f` | 点击反馈：深蓝 |
| Disabled | `rgba(20,71,230,0.4)` | 40% 透明蓝，无下划线 |

> **历史变更**：v2026.05 之前 TableActionCell 操作列约定 `variant="link-dark"`（黑色文字），已弃用。新规范一律改为 `variant="link"`（品牌蓝），与 Ant Design 等主流后台风格对齐。如发现存量页面里 TableActionCell 内还写着 `variant="link-dark"`，按"触达即同步"机制顺手换成 `variant="link"`。
>
> **为什么 TableActionCell 不自动应用 link 样式？** Tailwind v4 + CVA 生成的 utility class specificity 相同（均为 0,1,0），父级选择器 `[&_[data-slot=button]]:text-...` 无法稳定覆盖 Button 自身 `variant` 携带的色值/背景/边框。强行用 `:where()` 降权又会破坏业务覆盖优先级。最稳的方式是要求业务侧显式声明 `variant="link"`。

### 4.4 Plain 普通按钮（弹窗内筛选按钮）

**用途**：弹窗（Dialog）内的分类筛选切换按钮，交互风格与 §10.5 Tab 切换卡一致。

**四种状态（与 Tab 切换卡对齐）：**

| 状态 | 背景 | 边框 | 文字 |
|------|------|------|------|
| **Normal** | `#ffffff` | `#EAEEF4` | `#020617` |
| **Hover** | `#ffffff` | `#020617` | `#020617` |
| **Active（选中）** | `#020617` | `#020617` | 白色 |
| **Disabled** | `#ffffff` | `#EAEEF4` | `rgba(0,0,0,0.3)` |

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
| Table / 表格 | 见第 11.6 节 Table 表格组件规范 | 表头、行高、分割线、空状态等必须沿用全局 Table 规范，禁止在弹窗内自定义新表格样式 |

**强制条款**：

1. 弹窗内的 Input、Select（下拉）、Table 三类组件**必须** `import` 自 `@/components/ui/*`，禁止以 `<input>` / `<select>` / `<table>` 原生标签 + 临时 class 的方式拼凑。
2. **严禁**为弹窗内的 Input、Select 重新调色或重写样式；尤其：
   - **默认状态禁止加任何底色**（如 `bg-gray-50`、`bg-[#F5F5F5]`、`bg-[#FAFAFA]` 等），必须保持白底 + `border-[#d3d6db]`。
   - **禁用（disabled）状态禁止再添加 hover 样式**（不允许 `disabled:hover:*`、不允许在 disabled 下出现边框变蓝、底色加深等任何 hover 反馈）；disabled 视觉锁死为 `border-[#d3d6db] bg-[#f3f3f4] text-[#b0b6c3] cursor-not-allowed`。
3. 弹窗内 Table 必须沿用全局 Table 表头 / 行 / 边框 / 空状态样式，禁止重新定义表头底色、行高、分割线颜色。
4. 若弹窗内确有特殊视觉需求，**必须在本 SKILL 文档中扩展规范**后再使用，禁止在业务代码内单点编造样式绕过规范。

### 7.2 Drawer / 右侧抽屉（管控端详情类）

**文件**: `client/src/components/ui/drawer.tsx`  
**适用场景**: 管控端详情查看 / 局部配置编辑，如 `OpenClawMonitor.tsx` 的「Agent 详情」抽屉。

> 右侧详情抽屉必须优先使用 shadcn `Drawer`（`direction="right"`），禁止继续手写 `fixed inset-0` + 自定义遮罩 + `shadow-lg` 结构。抽屉本体圆角固定为 `0`。

| 区域 | 规范 |
|------|------|
| Root | `<Drawer direction="right" open={open} onOpenChange={...}>` |
| Content | `w-[480px] sm:max-w-none max-w-[calc(100vw-24px)] h-full rounded-none bg-background p-0`；信息密度特别高时可扩到 `560px`，需说明原因 |
| Header | `flex flex-row items-center justify-between gap-4 p-4 bg-background text-left`；**不加底部分割线** |
| Title | `DrawerTitle asChild` + `PanelTitle`；不要手写 `text-lg font-semibold` |
| Header actions | 仅图标按钮用 `Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-900 hover:text-gray-950"`；默认色对齐 Typography `primary`（`#171717`）；按钮间距 `gap-1` |
| Body | 优先使用 `<DrawerBody>`；等效样式为 `flex-1 overflow-y-auto bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`，内部 `p-4 space-y-6`；抽屉内容区必须隐藏滚动条但保留滚动能力 |
| 对象标题 | 使用 `PanelTitle`（较重要）或 `BodyMedium`（普通对象名）；下方 ID 使用 `CodeText`，链接使用 `MetaText tone="brand"` |
| 分组标题 | 使用 `MetaText`，如「已应用模型（0）」；右侧轻量操作也使用 `MetaText as="button" tone="brand"` |
| 空状态 | 使用 `MetaText tone="weak"` + `border border-dashed`，不要手写大字号灰字；添加入口默认放分组标题右侧，除非设计明确要求框内引导 |

#### 快速 Checklist

- 右侧详情抽屉：`Drawer direction="right"` + `DrawerContent rounded-none`。
- 抽屉宽度默认 `480px`；只有复杂高密度内容才扩到 `560px`。
- Header 不加底部分割线；右上角图标按钮用 `ghost`，不使用 `outline`。
- Body 优先使用 `<DrawerBody>`；如需手写容器，必须包含 `overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`，隐藏滚动条但保留滚动能力。
- 标题、分组、正文、ID、链接必须映射到 Typography 组件，不直接手写文字 class。
- 添加入口默认放分组标题右侧，使用 link 蓝色文字按钮；空态框内保留弱提示文案。
- 编辑态确认按钮统一 `dialog-confirm`，不使用 primary / 渐变主按钮。

#### 详情抽屉内容模式

1. **避免装饰性大 icon**：详情抽屉首屏信息以文本为主，不放蓝色圆形机器人 / 资源 icon；除非 icon 是识别对象类型的必要信息。
2. **列表信息优先紧凑化**：仅展示名称的重复列表（如已安装技能）不要一项一张大卡片；使用 `Table density="compact"` 或紧凑信息块承载。
3. **分组添加入口**：添加模型 / 添加通道等轻量入口默认放在分组标题右侧，使用 `MetaText as="button" tone="brand"` + `Plus` 图标，颜色与「编辑凭证」等轻量操作统一；空态框内保留 `MetaText tone="weak"` 提示文案。若设计明确要求框内引导，可例外放入虚线空态框内。
4. **凭证 / Key-Value 信息块**：使用聚合卡片，不要把操作按钮放在右下角。
   - 外层：`border-t border-[#e5e5e5] bg-muted/30 p-3`
   - 内层：`rounded-[4px] border border-[#e5e5e5] bg-background overflow-hidden`
   - 顶部：左侧 `MetaMedium`（如「凭证信息」），右侧 `MetaText as="button" tone="brand"`（如「编辑凭证」）
   - 行布局：`grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 px-3 py-2`
   - 字段名：`MetaText`；字段值：`CodeText tone="emphasis"`
   - 密钥可见性 icon 紧跟值文本后方，使用 `text-gray-500 hover:text-gray-900`，不要贴到整行最右。
   - 编辑态确认按钮（如「保存」）使用 `Button variant="dialog-confirm"`，颜色走 confirm 语义；不要使用默认 primary / `claw-primary`。
5. **内联编辑表单**：如「已应用模型」新增 / 替换态、「已接入通道」新增态，视觉结构必须与凭证编辑保持一致。
   - 外层：`bg-muted/30 p-3`
   - 内层：`rounded-[4px] border border-[#e5e5e5] bg-background overflow-hidden`
   - 顶部标题：`MetaMedium`（如「模型配置」/「通道配置」）+ `border-b border-[#f0f0f0] px-3 py-2`
   - 字段行：`px-3 py-2 space-y-1.5`，字段之间用 `divide-y divide-[#f0f0f0]`
   - Select / Input：优先使用 `bg-background border-[#e5e5e5] h-8 text-xs`
   - 底部操作栏：`border-t border-[#f0f0f0] px-3 py-2`；取消用 `ghost`，保存用 `dialog-confirm`
   - 禁止使用蓝色激活边框（如 `border-[#355EF1]`）包裹整块编辑表单。

#### 推荐写法

```tsx
<Drawer direction="right" open={open} onOpenChange={setOpen}>
  <DrawerContent className="data-[vaul-drawer-direction=right]:w-[480px] data-[vaul-drawer-direction=right]:sm:max-w-none max-w-[calc(100vw-24px)] h-full rounded-none bg-background p-0">
    <DrawerHeader className="flex flex-row items-center justify-between gap-4 p-4 bg-background text-left">
      <DrawerTitle asChild>
        <PanelTitle as="h2">Agent 详情</PanelTitle>
      </DrawerTitle>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-900 hover:text-gray-950" aria-label="刷新">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <DrawerClose asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-900 hover:text-gray-950" aria-label="关闭">
            <X className="w-4 h-4" />
          </Button>
        </DrawerClose>
      </div>
    </DrawerHeader>

    <DrawerBody>
      <div className="p-4 space-y-6">
        <section className="min-w-0 space-y-1.5">
          <PanelTitle as="div" className="truncate leading-tight">对象名称</PanelTitle>
          <div className="flex items-center gap-2">
            <CodeText>ins-xxxx</CodeText>
            <MetaText as="button" tone="brand">去控制台管理</MetaText>
          </div>
        </section>

        <section>
          <MetaText as="div" className="mb-2">已安装技能（7）</MetaText>
          <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-background">
            <Table density="compact">
              <TableHeader><TableRow><TableHead>技能名称</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell><MiniBodyText>feishu-doc</MiniBodyText></TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </DrawerBody>
  </DrawerContent>
</Drawer>
```

**禁止事项**：
- 禁止右侧详情抽屉使用 `shadow-lg` 手写浮层；阴影与动画交给 `DrawerContent`。
- 禁止 Header 图标按钮使用 `outline` 边框态；详情抽屉头部操作一律 `ghost`。
- 禁止用单项大卡片堆叠纯文本列表；优先紧凑表格 / 紧凑信息块。
- 禁止在 Drawer 内散落 `text-xs text-[#737373]` / `text-sm text-[#0A0A0A]`，必须优先映射到 Typography 组件。
- 禁止将 Drawer 内编辑态确认按钮做成默认 primary / 渐变主按钮；确认动作使用 `dialog-confirm`。
- 禁止无故隐藏分组标题右侧的添加入口；添加模型 / 添加通道等入口默认保留在标题右侧，除非设计明确要求框内引导。

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
| **Normal（默认）** | `#ffffff` | `#EAEEF4` | `#020617` | 白底+灰边+黑字 |
| **Disabled（禁用）** | `#ffffff` | `#EAEEF4` | `rgba(0,0,0,0.3)` | 白底+灰边+淡字 |

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
        : 'bg-white border-[#EAEEF4] text-[#020617] hover:border-[#020617]'
    }`}
  >
    {cat.name}
  </button>
</div>
```

**注意**：设计稿中 Active 态的颜色是 `#165DFC`，但在代码实现中统一映射到 `claw-primary` variant（使用纯黑背景）。如需精确还原设计稿的纯蓝色 Active 态，可使用 className 覆盖。

---

## 11.5 LineTabs（线性标签页 / 下划线式）

> 使用场景：**仅限**页面标题下方的一级导航 Tab，用于切换同一页面内的不同内容区域。
> 不可用于卡片内部、弹窗内部或表格工具栏（那些场景用 §11 Tab 切换卡）。

### 视觉参数

| 属性 | 值 |
|------|-----|
| 容器 | `flex items-center gap-1 border-b border-[#dbe6ff]` |
| 单项 padding | `px-4 py-3` |
| 字号 | `text-[14px] font-medium` |
| 选中态 | `text-[var(--text-title)] border-b-2 border-[#0A0A0A] -mb-px` |
| 默认态 | `text-[var(--text-muted)]` |
| Hover | `hover:text-[var(--text-title)]` |

### 代码示例

```jsx
<div className="flex items-center gap-1 border-b border-[#dbe6ff]">
  {TABS.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`relative px-4 py-3 text-[14px] font-medium transition-colors whitespace-nowrap ${
        activeTab === tab.id
          ? "text-[var(--text-title)] border-b-2 border-[#0A0A0A] -mb-px"
          : "text-[var(--text-muted)] hover:text-[var(--text-title)]"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### 使用场景约束

| 场景 | 使用 |
|------|------|
| 页面标题下方一级导航 | ✅ 使用本组件 |
| 弹窗/卡片内切换 | ❌ 用 §11 Tab 切换卡（黑底白字按钮式） |
| 表格工具栏筛选 | ❌ 用 §11 Tab 切换卡 |

---

## 11.6 Table 表格组件规范

**文件**: `client/src/components/ui/table.tsx`  
**展示台**: `client/src/pages/DesignSystemComponents.tsx` 的 Table 示例

### 设计原则

1. 表格统一使用 `@/components/ui/table` 的 `Table / TableHeader / TableBody / TableRow / TableHead / TableCell / TableActionCell`，禁止在业务页面用原生 `<table>` + 临时 class 拼装。
2. 表格支持两种信息密度：标准版与紧凑版。`density="compact"` 只调整文字规格、纵向高度与纵向 padding；**左右两端内容到表格边框的安全距离固定为 16px**，圆角、边框、分割线、hover、selected 状态必须与标准版完全一致。
3. 圆角由表格外壳容器统一控制，保持 `rounded-[4px]` / `--radius` 风格；表格组件内部不因密度变化新增圆角。
4. 边框与分割线统一使用 `border-gray-200` / `#E5E5E5`，紧凑版不得单独换色或减弱。
5. 表格正文颜色统一使用 `text-gray-900` / `#171717`，对齐 Typography 的 `body` 正文 token；关键字段可使用 `text-gray-950` / `#0A0A0A`。

### 密度规格

| 属性 | 标准版（默认） | 紧凑版 `density="compact"` |
|------|----------------|------------------------------|
| 表格字号 | `text-sm`（14px） | `text-xs`（12px） |
| 表头高度 | `h-10`（40px） | `h-9`（36px） |
| 表头文字 | `BodyMedium` 对应：14px / Medium / `text-gray-900` | `MetaMedium` 对应：12px / Medium / `text-gray-500` |
| 表头 padding | `px-4`（左右 16px） | `px-4`（左右 16px） |
| 正文单元格 | `h-[54px] px-4 py-3 text-sm` | `h-10 px-4 py-2 text-xs` |
| 正文颜色 | `text-gray-900` / `#171717` | 同标准版 |
| 纯文本行高 | 最小 54px，复杂内容允许自然撑高 | 最小 40px，复杂内容允许自然撑高 |
| 行分割线 | `border-gray-200` | 同标准版 |
| hover / selected | 全局 TableRow 状态 | 同标准版 |

### 使用方式

```tsx
import {
  Table,
  TableActionCell,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 标准版（默认）
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>组件</TableHead>
      <TableHead>分类</TableHead>
      <TableHead className="text-right">数量</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Button</TableCell>
      <TableCell>操作组件</TableCell>
      <TableCell className="text-right tabular-nums">42</TableCell>
    </TableRow>
  </TableBody>
</Table>

// 紧凑版：只改变密度，不改变圆角 / 边框 / 分割线 / 状态色
<Table density="compact">
  {/* 同样的 TableHeader / TableBody 结构 */}
</Table>
```

### 外壳写法

```tsx
<div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white">
  <Table density="compact">...</Table>
</div>
```

### 表格底部数量统计 + 分页器

当表格底部同时展示数量统计与分页器时，必须使用统一页脚布局：

```tsx
<div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2 border-t border-[#f0f0f0]">
  <span className="justify-self-start text-sm leading-[1.5] text-[#737373]">
    共 {total} 条
  </span>
  <Pagination
    total={total}
    current={page}
    pageSize={PAGE_SIZE}
    className="justify-self-end justify-end flex-nowrap"
    onChange={setPage}
  />
</div>
```

规则：
- 页脚横向 padding 固定 `px-4`（16px），必须与 `TableHead` / `TableCell` 的左右 padding 对齐；禁止继续使用 `px-6`。
- 纵向 padding 固定 `py-3`，顶部使用 `border-t border-[#f0f0f0]`。
- 数量统计固定左对齐：`justify-self-start`，文字 `text-sm leading-[1.5] text-[#737373]`。
- 分页器固定右对齐：`justify-self-end justify-end flex-nowrap`，避免换行和居中漂移。
- 不要把数量统计塞进 `Pagination showTotal` 来做左右分布；数量统计与分页器必须作为两个独立区域分别对齐。

### 禁止事项

- 禁止为紧凑版单独设置新的圆角、边框色、分割线色、hover 色或 selected 色。
- 禁止把紧凑版首尾列横向 padding 缩到 `px-2`、`px-3` 等小于 16px 的值；标准版与紧凑版的左右贴边距离都必须保持 16px。
- 禁止在业务页面通过覆盖 `TableHead` / `TableCell` 的 padding 来临时制造第三种密度；如确有新密度需求，必须先扩展全局 Table 规范。
- 禁止将紧凑版正文改为 `text-gray-500` / `#737373`，紧凑正文仍是正文主内容，必须保持 `#0A0A0A`。

---

## 12. Alert 提示组件

**文件**: `client/src/components/ui/alert.tsx`、`client/src/components/ui/admin-notice-alert.tsx`  
**Token 定义**: `client/src/index.css`

### 基础规则

所有页面信息提示、操作信息提示、警告提示、产品动态通知必须使用 shadcn Alert 标准结构，不允许在业务页面手写 `bg-blue-50` / `bg-amber-50` / `border-*` / `rounded-*` 拼装。管控端顶部常驻公告条必须使用 `AdminNoticeAlert`，不要替换页面内普通 Alert。

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

用于配置缺失、配额不足、风险提示、需要处理但非阻断的警告信息。页面内警告提示使用 `Alert variant="warning"`；管控端顶部常驻公告条不要使用该变体，统一使用 `AdminNoticeAlert`。

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

### 管控端彩色背景公告条（AdminNoticeAlert）

用于管控端顶部常驻通知条，设计稿场景包含「产品动态」「待配置」「资源告警」。必须使用 `AdminNoticeAlert`，只替换 `AdminNoticeBar` 这类顶部公告，不要迁移页面内普通 `Alert`。

```tsx
import { AdminNoticeAlert } from "@/components/ui/admin-notice-alert";

<AdminNoticeAlert type="product-news" controls={<span>4/5</span>}>
  <span>OpenClaw v2.4.0 已发布：记忆管理功能上线。</span>
</AdminNoticeAlert>

<AdminNoticeAlert type="pending-config" controls={<span>1/5</span>}>
  <span>有 3 项基础配置未完成，</span>
  <span className="font-medium text-[#020617] underline underline-offset-2">前往基础信息配置处理</span>
</AdminNoticeAlert>

<AdminNoticeAlert type="resource-alert" controls={<span>2/5</span>}>
  <span>私有网络（VPC）配额已耗尽，</span>
  <span className="text-[#020617] underline underline-offset-2">前往腾讯云控制台提交工单</span>
</AdminNoticeAlert>
```

| 类型 | 标签文案 | 图标 / 颜色 | 用途 |
|------|----------|-------------|------|
| `product-news` | 产品动态 | 星光图标 / 蓝色 | 产品发布、版本更新、功能上线 |
| `pending-config` | 待配置 | 感叹号图标 / 橙色 | 基础配置未完成 |
| `resource-alert` | 资源告警 | 感叹号图标 / 橙色 | VPC、云服务器机型等资源配额告警 |

视觉规则：外层高度 `40px`、圆角 `4px`、半透明白底 `rgba(255,255,255,0.76)`、白色描边、12px 正文；左侧标签高度 `22px`、圆角 `2px`、11px 文案；右侧操作区宽 `80.07px`，翻页控件宽 `44.07px`，关闭按钮位于 `left:64.07px; top:2px` 且 `16px` 常驻展示，颜色为 `#020617` / 50% 透明度，翻页控件仅在多条通知时展示。资源告警复用待配置的橙色标签样式和 icon，仅标签文案显示为「资源告警」。

### 普通 Alert 带右侧操作区写法

页面内普通 Alert 如需增加第三列操作区，可通过 `className` 扩展；颜色、字体、图标和基础间距必须由 Alert variant 与 token 控制。管控端顶部常驻公告条仍使用 `AdminNoticeAlert`。

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

> 对齐 shadcn Radix UI 规范（https://ui.shadcn.com/docs/components/radix/badge）。
> 用于 New / Beta / 标签语义、轻量信息标识。**不要用于表达运行状态**（运行状态请使用 `StatusTag`，详见 §16）。

### 14.1 通用样式

| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-full` |
| padding | `px-2.5 py-0.5` |
| 字号 | `text-xs` / Medium |
| 图标 | `[&>svg]:size-3` / `gap-1` |
| focus ring | `ring-[3px] ring-ring/50` |

### 14.2 Variant（默认 4 种，严格对齐 shadcn 截图）

| variant | 背景 | 文字 | 描边 | hover |
|---------|------|------|------|-------|
| `default` | `#0A0A0A` | 白色 | 无 | `bg/90` |
| `secondary` | `#F5F5F5` | `#0A0A0A` | 无 | `#EDEDED` |
| `destructive` | `red-100/60` | `red-600` | 无 | `red-100` |
| `outline` | 白色 | `#0A0A0A` | `#E5E5E5` | `#F5F5F5` |

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### 14.3 Custom Colors（仅四色，使用 `color` prop）

设置 `color` 后会覆盖 `variant` 视觉样式，仅保留尺寸/字号；对应 shadcn 官方 Custom Colors 示例。

| color | 背景 | 文字 | dark 模式 |
|-------|------|------|-----------|
| `blue` | `bg-[#E8ECFE]` | `text-[#1447E6]` | `bg-blue-950/40 text-blue-300` |
| `green` | `bg-green-50` | `text-green-700` | `bg-green-950/40 text-green-300` |
| `purple` | `bg-purple-50` | `text-purple-700` | `bg-purple-950/40 text-purple-300` |
| `red` | `bg-red-50` | `text-red-700` | `bg-red-950/40 text-red-300` |

```tsx
<Badge color="blue">Blue</Badge>
<Badge color="green">Green</Badge>
<Badge color="purple">Purple</Badge>
<Badge color="red">Red</Badge>
```

### 14.4 使用规则与禁止事项

- Custom Colors **仅允许 blue / green / purple / red** 四种；新增颜色需先在组件层补 token，禁止在业务侧自拼 `bg-xxx-50 text-xxx-700`。
- 表达运行/开关/任务状态（正常 / 禁用 / 失败 / 已弃用 / 当前版本 等）必须使用 `StatusTag`（详见 §16），禁止用 `Badge color="green"` 替代。
- 表达类型/范围/版本/分类等"信息标签"建议优先使用 `StatusTag mode="fill"`；当语义偏向 New / Beta / 通用强调时使用 `Badge`。
- 禁止覆盖组件圆角、字号、padding；如需自定义尺寸应在组件层扩展 `size` variant。
- 禁止在业务侧使用 `Badge variant="default"` 配合 `className="bg-xxx"` 改色；改色统一通过 `color` prop。

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
| head cell / height | 标准版 `40px`（`h-10`）；紧凑版 `36px`（`h-9`） |
| head cell / padding | `px-4` |
| head cell / font | 统一 `text-xs font-medium text-[#737373]`（次级灰，不区分密度） |
| body row / border | `border-b border-[#f0f0f0]` |
| body row / hover | `hover:bg-[#fafafa]` |
| body row / selected | `bg-[rgba(53,94,241,0.06)]` |
| body cell / height | 标准版最小视觉高度 `54px`；紧凑版最小视觉高度 `40px`；复杂内容允许自然撑高 |
| body cell / padding | 标准版 `px-4 py-3`；紧凑版 `px-4 py-2` |
| body cell / font | 标准版 `text-sm`（14px）；紧凑版 `text-xs`（12px） |
| footer / layout | `grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2 border-t border-[#f0f0f0]` |
| footer / total | `justify-self-start text-sm leading-[1.5] text-[#737373]` |
| footer / pagination | `justify-self-end justify-end flex-nowrap` |

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
          <TableCell><StatusTag mode="text" variant="green">运行中</StatusTag></TableCell>
          <TableCell className="text-right tabular-nums">{item.count}</TableCell>
          <TableActionCell>
            <Button onClick={...}>编辑</Button>
            <Button onClick={...}>删除</Button>
          </TableActionCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  {/* 表格页脚：数量统计左对齐，分页器右对齐 */}
  <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2 border-t border-[#f0f0f0]">
    <span className="justify-self-start text-sm leading-[1.5] text-[#737373]">
      共 {data.length} 条
    </span>
    <Pagination
      total={data.length}
      current={page}
      pageSize={PAGE_SIZE}
      className="justify-self-end justify-end flex-nowrap"
      onChange={setPage}
    />
  </div>
</div>
```

**操作列规则（强制）：**
- 操作列必须使用 `<TableActionCell>` 包裹 —— 内置 `flex items-center gap-6` 容器，**操作项间距固定 24px**，且与表头 `<TableHead>` 的 `px-4` 完全对齐
- 操作列必须使用**文字按钮**（如"编辑"、"删除"、"终端"、"关机"），禁止使用纯 icon 按钮
- **每个 Button 必须显式 `variant="link"`**（品牌蓝文字按钮）——不显式声明会得到默认 claw-primary 实心按钮（纯黑 + 白字）
- **删除按钮也统一蓝色 link**，不再用红色覆盖；危险操作的语义由文案 + AlertDialog 二次确认承担（参考 Ant Design 等现代后台规范）。禁止再加 `text-red-600` / `hover:text-red-700` / `disabled:text-red-300` 等红色样式
- **禁止业务侧再手写 `<div className="flex items-center gap-6">` wrapper**，直接把 Button 平铺为 TableActionCell 的 children 即可。如需在内置容器上追加 className（如固定高度 `h-5`），用 `actionsClassName` prop
- 特殊布局（多行 / 自定义 wrapper）：设 `rawChildren` 关闭内置 flex 容器
- 禁止在操作列使用 ghost、outline、default、link-dark 或自定义按钮样式
- **横向滚动固定**：当表格列过多需横向滚动时，操作列必须 `fixed="right"` 固定在最右侧。**统一使用 `<Table scrollX={...}>` + `fixed` 属性**，不允许手写 sticky + bg 的写法（详见下方「固定列（Fixed Columns）」章节）。

**单元格对齐规则（强制）：**
- **垂直对齐**：组件默认 `align-middle`（垂直居中），**禁止业务侧使用 `align-top` 覆盖**。多行内容（如名称 + slug 两行）可自然撑高行高，仍保持居中。
- **禁止使用原生 `<table>`**：所有数据表格必须使用标准 Table 组件，禁止裸写 `<table>` + 自定义 class。

**Variant 视觉变体：**

| variant | 表头背景 | 外边框 | 阴影 | 适用场景 |
|---------|---------|--------|------|----------|
| `"default"`（默认） | `bg-gray-50`（#FAFAFA） | 继承外层容器 | 无 | 白色背景容器（SurfaceCard）内的表格 |
| `"gray-header"` | 同 default | 同 default | 无 | 显式别名，等同 default |
| `"elevated-white"` | `bg-white` | `border-white` | `shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]`（占位，待设计确认） | 蓝色渐变等非白色页面背景上的表格 |

```tsx
// 白色背景容器内（默认灰色表头）
<Table>...</Table>

// 蓝色渐变背景页面（白色表头）
<Table variant="elevated-white">...</Table>
```

⚠️ **`variant="elevated-white"` 使用限制：**
- 禁止在 Dialog / AlertDialog / Sheet / Drawer 等弹窗/抽屉内使用
- 禁止在白色背景（`bg-white`）容器上使用——白底上白边框无法形成视觉层次，必须使用默认 variant

**表头样式规则（强制）：**
- 表头行**禁止 hover 变色**（组件已内置 `[thead_&]:hover:bg-transparent`）
- 固定列（`fixed="left"` / `fixed="right"`）表头背景色**必须与非固定列保持一致**（通过 `bg-inherit` 继承 `<thead>` 背景色，禁止单独覆盖）
- 表头背景色统一由 `<TableHeader>` 组件根据 variant 自动控制，业务侧禁止手写 `bg-*` 覆盖

**表格内状态/标签样式规则（强制）：**
- **状态列**（运行状态、下发状态）：必须使用 `StatusTag mode="text"`（纯文字变色，无底色无圆点），禁止在表格内使用 `mode="dot"` 或 `mode="fill"`。
- **版本号**：使用纯文字（如 `v2.1.0`），禁止使用 `StatusTag mode="fill" variant="gray"` 包裹。
- **镜像来源 / 类型标签**（公共/自定义）：拆为独立列，纯文字显示，禁止使用彩色 `StatusTag` fill 标签。
- **辅助信息**（如"腾讯云维护更新"）：使用 `text-xs text-gray-400` 纯文字，禁止用 `StatusTag` 包裹。
- **总原则**：表格行内只允许「状态列」有颜色文字（通过 `StatusTag mode="text"`），其余列一律黑白灰纯文字层次，保持表格整洁。

### 15.1 固定列（Fixed Columns）

> 参考 Ant Design Table fixed columns（https://ant.design/components/table-cn#table-demo-fixed-header），但视觉与交互严格使用项目自身规范。
> 适用场景：列数较多、需要左右横向滚动，但首列（如"名称/Full Name"）或末列（操作列）需要常驻可见。

**核心 API：**

| API | 类型 | 说明 |
|-----|------|------|
| `<Table scrollX>` | `number \| string` | 表格最小内宽（数字 → px，字符串 → 直接作为 min-width，如 `"max-content"`）。**只要传了 scrollX，即开启横向滚动模式**。不需要固定列也可使用。 |
| `<TableHead fixed>` | `"left" \| "right"` | 表头单元格固定到左侧或右侧。 |
| `<TableHead fixedShadow>` | `boolean`，默认 `true` | 是否允许该边界列显示 1px 分隔线 + 滚动阴影。组件会自动根据横向滚动状态控制实际显隐：无横滚不显示；在最左侧不显示 left 分隔线/阴影；在最右侧不显示 right 分隔线/阴影。多列同侧固定时（如复选框 + 名称列同时 `fixed="left"`），**只保留最外侧那一列为 `true`**，其余列设 `false`，否则中间会出现多余的分隔线/阴影。 |
| `<TableCell fixed>` | `"left" \| "right"` | 内容单元格固定到左侧或右侧。 |
| `<TableCell fixedShadow>` | `boolean`，默认 `true` | 同 `TableHead`。 |
| `<TableActionCell fixed>` | `"left" \| "right"` | 操作单元格固定到左侧或右侧（操作列固定时使用 `fixed="right"`）。 |
| `<TableActionCell fixedShadow>` | `boolean`，默认 `true` | 同上。 |

**多列同侧固定的偏移规则**：第 2 个及后续的同侧固定列必须用 `style={{ left: <累计宽度> }}`（左固定）或 `style={{ right: <累计宽度> }}`（右固定）错开，组件内部默认 `left:0` / `right:0` 会被 inline style 覆盖。

**强制约束：**

1. 必须配合 `<Table scrollX={...}>` 使用，单独给单元格加 `fixed` 但不开启 scrollX 没有意义。
2. 同一列的 `<TableHead>` 与 `<TableCell>` 的 `fixed` 必须**完全一致**（要么都不固定，要么固定在同一侧），否则表头与内容会错位。
3. 操作列在固定模式下必须使用 `<TableActionCell fixed="right">`，禁止改用 `<TableCell>` + 手写按钮样式绕过 link-dark 规范。
4. 固定列的视觉效果（hover 跟随 / 阴影分隔 / 表头底色 / 单元格白底 / 选中态）由组件内部 token 自动处理，**禁止业务侧再手写 `sticky right-0 z-10 bg-white` 之类的 className**。
5. 表头底色固定为 `#fafafa`、单元格底色固定为 `#fff`、行 hover/选中 时固定列底色自动跟随，由组件内部基于 `group-hover` / `group-data-[state=selected]` 实现。

**视觉细节（已内置，无需手动处理）：**

- 固定列与滚动区之间的分隔线：1px / `#f0f0f0`（与表格其他分隔线一致）；仅在对应方向存在可滚动内容时出现（最左隐藏 left 分隔线，最右隐藏 right 分隔线，无横滚全部隐藏）
- 滚动阴影：6px 渐变（`linear-gradient(rgba(0,0,0,0.06) → transparent)`），向滚动方向渐隐；同样仅在对应方向存在可滚动内容时出现（最左隐藏 left shadow，最右隐藏 right shadow，无横滚全部隐藏）
- 表头处于固定模式时仍保持 `bg-[#fafafa]` 灰底；单元格白底，并通过 `group-hover` 自动跟随行 hover 变成 `#fafafa`、selected 变成 `rgba(53,94,241,0.06)`
- 横向滚动模式下 `<table>` 自动切换为 `border-separate border-spacing-0`，单元格自身补下分隔线，避免 `<tr>` border 在 separate 模式下失效
- **滚动条隐藏策略**：横向滚动模式下，容器默认应用全局 `.scrollbar-on-hover` 工具类——**滚动条默认隐藏**，仅当鼠标 hover 表格区域或正在滚动时才出现，离开后自动隐藏。无需业务侧手动处理。
- **z-index 分层**：表头固定列 `z-50`、body 固定列 `z-20`。**业务表头 / 单元格内部如需 `position:relative` + `z-*`（如带 Popover 筛选的列），`z-*` 必须 ≤ `z-40`**，否则会浮在固定列上方导致"滚动穿透"。Popover/Dialog 等浮层因为是 `fixed` / Portal 定位，不在表格 stacking context 内，不受此约束。

**标准用法：**

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActionCell,
} from "@/components/ui/table";

<div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
  <Table scrollX={1500}>
    <TableHeader>
      <TableRow>
        {/* 左固定 */}
        <TableHead fixed="left" className="w-[120px]">Full Name</TableHead>
        {/* 中间滚动列 */}
        <TableHead className="w-[140px]">Column 1</TableHead>
        <TableHead className="w-[140px]">Column 2</TableHead>
        <TableHead className="w-[140px]">Column 3</TableHead>
        <TableHead className="w-[140px]">Column 4</TableHead>
        <TableHead className="w-[140px]">Column 5</TableHead>
        <TableHead className="w-[140px]">Column 6</TableHead>
        <TableHead className="w-[140px]">Column 7</TableHead>
        <TableHead className="w-[140px]">Column 8</TableHead>
        {/* 右固定（操作列） */}
        <TableHead fixed="right" className="w-[140px]">操作</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell fixed="left" className="font-medium">{row.name}</TableCell>
          <TableCell>{row.col1}</TableCell>
          <TableCell>{row.col2}</TableCell>
          <TableCell>{row.col3}</TableCell>
          <TableCell>{row.col4}</TableCell>
          <TableCell>{row.col5}</TableCell>
          <TableCell>{row.col6}</TableCell>
          <TableCell>{row.col7}</TableCell>
          <TableCell>{row.col8}</TableCell>
          <TableActionCell fixed="right">
            <Button variant="link" onClick={...}>编辑</Button>
            <Button variant="link" onClick={...}>删除</Button>
          </TableActionCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

**多列同侧固定（如复选框列 + 名称列同时固定左侧）：**

```tsx
<Table scrollX={1500}>
  <TableHeader>
    <TableRow>
      {/* 第 1 列：复选框（非边界列，关闭阴影） */}
      <TableHead fixed="left" fixedShadow={false} style={{ width: 56, minWidth: 56 }}>
        <Checkbox ... />
      </TableHead>
      {/* 第 2 列：名称（边界列，保留阴影），用 left:56 错开 */}
      <TableHead fixed="left" style={{ left: 56, minWidth: 240 }}>名称 / ID</TableHead>
      {/* 中间滚动列 ... */}
      <TableHead fixed="right" style={{ width: 200 }}>操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell fixed="left" fixedShadow={false} style={{ width: 56, minWidth: 56 }}>
          <Checkbox ... />
        </TableCell>
        <TableCell fixed="left" style={{ left: 56, minWidth: 240 }}>{row.name}</TableCell>
        {/* 中间滚动列 ... */}
        <TableActionCell fixed="right">...</TableActionCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**禁止事项：**

- ❌ 禁止业务侧手写 `<th className="sticky right-0 z-10 bg-[#fafafa]">` 来模拟固定列；必须使用 `fixed="left|right"` 属性。
- ❌ 禁止手写阴影分隔线（`<div style={{ background: "linear-gradient(...)" }} />` 等）；阴影由组件内部 `before` 伪元素提供，且与表格分隔线对齐。
- ❌ 禁止在 `fixed` 列上覆盖背景色（如 `bg-blue-50`）；固定列底色严格遵循表头 `#fafafa` / 单元格 `#fff` / 行 hover `#fafafa` / 选中 `rgba(53,94,241,0.06)`。
- ❌ 禁止只给 `<TableHead fixed>` 不给同列的 `<TableCell fixed>`，或反过来。
- ❌ 多列同侧固定时，禁止全部保留 `fixedShadow={true}`（默认值），否则列之间会出现多余的分隔线/滚动阴影；只在最外侧的边界列保留 true，其余内部固定列必须设 `fixedShadow={false}`。

**表头规则（强制，参照 /admin/audit-log 页面视觉）：**
- `TableHeader` 强制灰色背景 `bg-[#fafafa]`，不允许覆盖
- `TableHead` 强制样式：标准版 `text-xs font-medium text-[#737373] h-10 px-4 py-0 text-left`；紧凑版 `text-xs font-medium text-[#737373] h-9 px-4 py-0 text-left`
- `TableCell` / `TableActionCell` 强制样式：标准版 `text-sm h-[54px] px-4 py-3`；紧凑版 `text-xs h-10 px-4 py-2`；`h-*` 作为 table-cell 的最小视觉高度，复杂内容允许自然撑高
- **表头与单元格横向 padding 必须一致**：标准版和紧凑版都使用 `px-4`（16px），确保左右内容到边框的距离一致；纵向 padding 由单元格控制，标准版 `py-3`、紧凑版 `py-2`；禁止紧凑版横向改成 `px-2` / `px-3`
- **每列标题和内容必须左对齐**，禁止使用 `text-center` 或 `text-right`（数字列除外）
- **标准表格分页器推荐使用 Pagination 默认尺寸**：页面级表格底部分页默认沿用 `size="default"`，如无空间压力不建议切到 `small`
- 禁止通过 className 覆盖表头的字体颜色、字号、字重、对齐方式
- className 仅用于布局属性：宽度 `w-[xx%]`、sticky 定位
- 禁止在 TableHead 上使用 `text-xs`、`text-gray-500`、`uppercase`、`tracking-wide` 等非标准样式
- 禁止使用原生 `<th>` 替代 `<TableHead>`、原生 `<td>` 替代 `<TableCell>`

**禁止事项：**
- 禁止使用原生 `<table>` + 自定义 class（如 `text-xs font-medium text-gray-500 uppercase tracking-wide`）
- 禁止自定义表头背景色（如 `bg-gray-50/50`），统一使用 TableHeader 的 `bg-[#fafafa]`
- 禁止自定义行 hover 效果（如 `hover:bg-gray-50/50`），使用 TableRow 内置 `hover:bg-[#fafafa]`
- 禁止在操作列使用非 link-dark 按钮或自定义 `<button>`
- 分页器必须放在 Table 外部、容器内部，用 `<div className="px-4 py-2 border-t border-[#f0f0f0]">` 包裹
- 不建议把页面级标准表格分页器切到 `size="small"`；`small` 更适合 Dialog 内空间受限场景

---

## 16. StatusTag 状态标签规范

**文件**: `client/src/components/ui/status-tag.tsx`

> 用于表格、卡片、列表中表示状态（运行中/已停止/待处理）或分类属性（角色、范围、版本）的轻量标签。组件内部文字必须复用 `SmallBodyText` 对应 token。

### 16.1 分类与 API

| 分类 | API | 适用场景 |
|------|-----|----------|
| 文本状态类 | `<StatusTag mode="text" variant="green">正常</StatusTag>` | **表格状态列默认**：14px Medium 纯彩色文字，无底色、无圆点 |
| 状态点类 | `<StatusTag mode="dot" variant="green">正常</StatusTag>` | 详情/卡片/列表中的运行状态、开关状态、任务状态（非表格） |
| 填充信息类 | `<StatusTag mode="fill" variant="blue">全部用户</StatusTag>` | 范围、版本、类型、数量等辅助信息 |
| 角色类 | `<StatusTag preset="role-admin" />` / `<StatusTag preset="role-user" />` | 管控端「用户管理」表格角色列 |
| 自定义 icon 类 | `<StatusTag variant="role" icon={<SomeIcon />}>自定义</StatusTag>` | 低频自定义带 icon 标签；高频语义应沉淀为 `preset` |

### 16.2 颜色 token

> 同一颜色在 `mode="text"`、`mode="dot"`、`mode="fill"` 与 `mode="soft"` 中保持近似语义：text/dot 使用主色字，fill 使用同语义浅底色 + 主色文字，soft 使用浅底色 + 浅边框 + 深色字。后续新增颜色必须同时补齐 `text / bg / border / dot` 四个 token。

| variant | text / dot | fill bg | soft border | 使用场景 |
|---------|------------|---------|-------------|----------|
| `blue` | `#1447E6` | `#E8ECFE` | `#C7D7FE` | 进行中、全部用户、推荐/提示（对齐品牌蓝） |
| `green` | `#008236` | `#E9F8EB` | `#BFE8C8` | 正常、运行中、已完成、开启、生效 |
| `red` | `#DC2626` | `#FEF2F2` | `#FECACA` | 错误、失败、异常、风险 |
| `orange` | `#F59E0B` / `orange-700` | `orange-50` | `orange-200` | 警告、待处理、需关注（对齐全局 warning） |
| `gray` | `#0A0A0A` | `#F5F5F5` | `#E5E5E5` | 默认、待处理、关闭、版本、范围 |
| `slate` / `zinc` / `stone` | Tailwind 700 / 500 | Tailwind 50 | Tailwind 200 | 中性色分类标签，低饱和分组 |
| `yellow` / `amber` / `lime` | Tailwind 700 / 500 | Tailwind 50 | Tailwind 200 | 暖色/高亮分类标签 |
| `emerald` / `teal` / `cyan` / `sky` | Tailwind 700 / 500 | Tailwind 50 | Tailwind 200 | 冷色/服务/通道分类标签 |
| `indigo` / `violet` / `purple` / `fuchsia` / `pink` / `rose` | Tailwind 700 / 500 | Tailwind 50 | Tailwind 200 | 多分类彩色标签（如镜像标签），仅用于 `mode="soft"` 或需要稳定色彩分组的场景 |

### 16.3 文本状态类 `mode="text"`（表格状态列默认）

| Token | Value |
|-------|-------|
| background | 无 |
| border | 无 |
| padding | 无（`px-0 py-0`） |
| dot | 不展示 |
| font | `14px` (`text-sm`) / Medium / `leading-[1.5]` |
| color | 使用当前 `variant` 的 text 主色 |

**表格状态列必须使用 `mode="text"`。** 表格内禁止再使用 `mode="dot"` 或 `mode="fill"` 表达运行状态。

```tsx
<StatusTag mode="text" variant="green">正常</StatusTag>
<StatusTag mode="text" variant="red">禁用</StatusTag>
<StatusTag mode="text" variant="green">当前版本</StatusTag>
<StatusTag mode="text" variant="gray">已弃用</StatusTag>
```

### 16.4 状态点类 `mode="dot"`（详情/卡片场景）

| Token | Value |
|-------|-------|
| background | 无 |
| border | 无 |
| padding | 无左右间距（`px-0 py-0`） |
| layout | `inline-flex items-center gap-1` |
| dot size | `6px` (`w-1.5 h-1.5 rounded-full`) |
| font | `SmallBodyText`：12px / Medium / tracking 0.18px |
| color | 使用当前 `variant` 的 text / dot 主色 |

适用于详情页头部、设置卡片、运行状态弹窗等"非表格"场景；表格状态列禁止使用本模式。

```tsx
<StatusTag mode="dot" variant="green">正常</StatusTag>
<StatusTag mode="dot" variant="blue">进行中</StatusTag>
<StatusTag mode="dot" variant="gray">待处理</StatusTag>
<StatusTag mode="dot" variant="red">失败</StatusTag>
```

### 16.5 填充信息类 `mode="fill"`

| Token | Value |
|-------|-------|
| height | `20px` (`h-5`) |
| background | 使用当前 `variant` 的浅色 bg |
| border-radius | `full` (`rounded-full`) |
| padding | `px-2 py-[2px]` |
| dot | 不展示 |
| font | `SmallBodyText` |

```tsx
<StatusTag mode="fill" variant="blue">全部用户</StatusTag>
<StatusTag mode="fill" variant="gray">v1.2.0</StatusTag>
<StatusTag mode="fill" variant="green">已接入</StatusTag>
```

### 16.6 轻量彩色标签 `mode="soft"`

| Token | Value |
|-------|-------|
| height | `20px` (`h-5`) |
| background | 使用当前 `variant` 的浅色 bg |
| border | 使用当前 `variant` 的浅色 border |
| border-radius | `4px` (`rounded-[4px]`) |
| padding | `px-2 py-0` |
| icon | 可选；`size-3`，颜色跟随文字 |
| font | `SmallBodyText` |

适用于卡片顶部的分类 / 镜像 / 来源标签。需要稳定彩色分组时，从 `slate / zinc / stone / yellow / amber / lime / emerald / teal / cyan / sky / indigo / violet / purple / fuchsia / pink / rose` 中选色；禁止在业务代码中手写 `bg-*-50 text-*-700 border-*-200` 拼标签。

```tsx
<StatusTag mode="soft" variant="amber" icon={<Disc3 />}>
  OpenClaw on Ubuntu 24.04
</StatusTag>
<StatusTag mode="soft" variant="gray">最新版本</StatusTag>
```

### 16.7 角色类 StatusTag token（Figma 1300:6713 / 1300:6724）

| Token | 管理员 | 用户 |
|-------|--------|------|
| API | `preset="role-admin"` | `preset="role-user"` |
| width（设计稿） | `69px` | `57px` |
| height | `22px` | `22px` |
| background | `#FFFFFF` | `#FFFFFF` |
| border | `1px solid #E5E5E5` | `1px solid #E5E5E5` |
| border-radius | `20px` / `rounded-full` | `20px` / `rounded-full` |
| foreground | `#020617` | `#020617` |
| icon | `AdminRoleIcon` / `12px` | `UserRoleIcon` / `12px` |
| padding / gap | `px-2` / `gap-1` | `px-2` / `gap-1` |
| font | `SmallBodyText` | `SmallBodyText` |

```tsx
<StatusTag preset="role-admin" />
<StatusTag preset="role-user" />
```

### 16.7 兼容规则

旧写法仍兼容，但新代码不再推荐：

```tsx
// 旧：兼容，会自动等价为 mode="dot"
<StatusTag variant="green" dot>正常</StatusTag>

// 详情/卡片场景的推荐写法
<StatusTag mode="dot" variant="green">正常</StatusTag>

// 表格状态列的推荐写法
<StatusTag mode="text" variant="green">正常</StatusTag>
```

### 16.8 使用规则

- **表格状态列必须使用 `mode="text"`**（14px Medium 纯彩色文字），禁止使用 `mode="dot"` 或 `mode="fill"` 表达状态。
- 详情页、卡片、Popover 等非表格场景的运行状态使用 `mode="dot"`。
- 信息/分类/版本/范围类标签必须使用 `mode="fill"`，不带 dot。
- 角色列必须使用 `preset="role-admin"` / `preset="role-user"`，禁止业务侧自行拼 icon、描边和文字。
- `icon` 插槽只用于低频自定义标签；同一语义复用 2 次以上，应沉淀为 `preset`。
- 传入 `icon` 时，业务侧只提供形状；icon 必须支持 `currentColor`，不要在业务侧写颜色和尺寸。

### 16.9 禁止事项

- 禁止使用自定义的 `bg-blue-50 text-blue-600 rounded-xl` 或 `bg-green-50 text-green-600` 等样式替代 StatusTag。
- 禁止在表格状态列使用 `mode="dot"` 或 `mode="fill"`（有底色胶囊）。
- 禁止使用自定义的红/绿色纯文字 `span`（如 `text-green-600` / `text-red-500` / `text-[#008236]`）表示开关或运行状态；统一改为 `<StatusTag mode="text">`。
- 禁止自定义标签圆角（如 `rounded-xl`），统一使用组件内置圆角。
- 禁止在用户管理角色列自行拼装 `span + icon + border`，统一使用 `StatusTag preset`。

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

> 页面级表格通常使用 32px 默认尺寸；Dialog 内空间受限时优先考虑 24px small。

**表格场景补充规则：**
- 标准表格底部分页默认沿用 `size="default"`。
- Dialog / Drawer 等空间受限浮层内的表格分页，可按空间情况使用 `size="small"`。

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

## 27. Toast 通知组件

> 源码路径: `client/src/components/ui/sonner.tsx`  
> 基于: sonner 库  
> 全局 CSS 覆写: `client/src/index.css` 中 `[data-sonner-toast]` 规则

### 视觉规范

| 属性 | 值 |
|------|------|
| 背景色 | `#FFFFFF` |
| 文字色 | `#09090b` |
| 边框色 | `#EAEEF4` |
| 圆角 | `12px` (rounded-xl) |
| 内边距 | `12px 16px` |
| 字号 | `14px`，font-medium |
| 阴影 | shadow-lg |
| 定位 | 页面顶部居中 (top-center) |

### 布局结构

```
┌─────────────────────────────────────────┐
│  [icon]  消息文本内容          [×关闭]  │
└─────────────────────────────────────────┘
```

- **图标**：左侧，由 sonner 根据类型自动渲染（error=黑色感叹号，success=勾）
- **文本**：居中，14px font-medium
- **关闭按钮**：**右侧垂直居中**，20×20px，hover 时 bg-[#f4f4f5]

### 使用方式

```tsx
import { toast } from 'sonner';

toast.error("请输入用户 ID");
toast.success("操作成功");
toast("普通提示消息");
```

### 关键约束

- **关闭按钮必须在右侧**，禁止使用 sonner 默认的左上角定位
- 所有 toast 类型（error/success/info/warning）使用统一白色背景 + `#EAEEF4` 边框
- 禁止在业务代码中自行拼装弹出通知 UI，必须使用 `toast()` API
- Toast 层级固定 `z-index: 99999`，确保在 Dialog 之上

---

## 28. 全局描边颜色规则

| 用途 | 色值 | 说明 |
|------|------|------|
| 卡片默认描边 | `#E5E5E5` | 所有卡片统一 |
| 表单控件默认描边 | `#d3d6db` | Input/Select/DatePicker |
| hover/focus/选中描边 | `#355EF1` | 品牌蓝，唯一激活色 |
| 分割线 | `#E5E5E5` | separator |

**禁止**: 不允许使用 `border-gray-200`、`border-blue-300`、`border-green-300` 等非规范色

---

## 29. 强制执行规则

1. **组件源文件 (`client/src/components/ui/*.tsx`) 只有 addietang 可以修改**
2. 其他人使用组件时，不允许通过 className 覆盖组件定义的颜色/边框/圆角
3. 用户端新增页面 / 新增业务组件必须优先使用 `Typography.tsx` 中的文字组件，不再自行拼装基础文字色、字号、字重
4. 修改用户端旧页面时，遵循“触达即同步”：当前文件内明显的标题、正文、Meta、数字、代码文字应同步迁移到 Typography
5. 新增全局组件时，组件内部文字规格必须先映射到 Typography 层级；如确需新增文字层级，先更新本规范和 `Typography.tsx`
6. 如发现 rebase 后组件样式被改，以 addietang 和 miekoyychen 的版本为准强制恢复
7. 新增组件需经 addietang 和 miekoyychen 审核后才能合入基线
8. **对话框 / 弹窗 / 右侧抽屉内的 Input、下拉（Select）、Table 必须直接 import 自 `@/components/ui/*` 且与本 SKILL 第 5 / 6 / 11.1 / 7.2 节规范完全一致**：
   - 禁止在弹窗 / 抽屉中重新编造 Input / Select / Table / Drawer 样式
   - Input / Select **默认状态禁止加底色**（白底 + `border-[#d3d6db]`；Drawer 详情内可按第 7.2 节使用 `bg-background` 语义）
   - Input / Select **禁用（disabled）状态禁止添加任何 hover 样式**（不允许 `disabled:hover:*`，不允许出现边框变蓝、底色加深等反馈）
   - 右侧详情抽屉必须优先使用 `@/components/ui/drawer` 的 `Drawer direction="right"`，禁止手写 fixed 浮层结构

---

## 30. 管控端左侧导航 AdminSidebar（owner: miekoyychen）

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
