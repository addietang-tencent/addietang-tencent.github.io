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
> **优先级**: 最高——所有分支合并时，组件样式以此规范为准，不允许其他人修改组件源文件  
> **组件源码路径**: `client/src/components/ui/`  
> **CSS 变量定义**: `client/src/index.css`

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
| `claw-outline` / `outline` | 白色 | `#e5e5e5` | `#020617` | `bg-[#f5f5f5]` | 文字`rgba(2,6,23,0.3)` |
| `destructive` | `#d42a1e` | 无 | 白色 | `#b91c1c` | 40%透明 |
| `ghost` | 无 | 无 | `#020617` | `bg-[#f5f5f5]` | 文字30%透明 |
| `link` | 无 | 无 | `#355EF1` | 加下划线 | 40%透明 |

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

## 10.5 Tab 切换卡（筛选标签按钮）

> Figma: node 1061:7458 (ClawPro 项目设计)
> 用于分类筛选场景（如技能库分类、技能列表分类等）

**使用标准 Button 组件实现**：`<Button variant="claw-primary"/"claw-outline" size="claw-sm">`

### 四种状态

| 状态 | 背景 | 边框 | 文字 | 说明 |
|------|------|------|------|------|
| **Active（选中）** | `#F6F8FE` | `#1447E6`（品牌蓝） | `#1447E6` | 浅蓝底+蓝边+蓝字 |
| **Hover（悬停）** | `#ffffff` | `#1447E6`（品牌蓝） | `#000000` | 白底+蓝边+黑字 |
| **Normal（默认）** | `#ffffff` | `#e4e4e4` | `#000000` | 白底+灰边+黑字 |
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
{/* 使用标准 Button 组件 */}
<div className="flex items-center gap-2 flex-wrap">
  <Button
    variant={isActive ? "claw-primary" : "claw-outline"}
    size="claw-sm"
    onClick={() => setCategory(cat.id)}
    disabled={cat.disabled}
  >
    {cat.name}
  </Button>
</div>
```

**注意**：设计稿中 Active 态的颜色是 `#165DFC`，但在代码实现中统一映射到 `claw-primary` variant（使用品牌渐变）。如需精确还原设计稿的纯蓝色 Active 态，可使用 className 覆盖。

---

## 11. 其他组件速查

| 组件 | 关键样式 |
|------|---------|
| Tabs | 活跃态 `#355EF1` + 底色 `#f3f3f4` |
| Segment | 活跃态 `#020617 font-semibold` 白底阴影 + 底色 `#f3f3f4` |
| StatusTag | green `#E9F8EB/#008236` · gray `#F5F5F5/#0A0A0A` · blue `#E8ECFE/#1447E6` |
| Textarea | 与 Input 一致 |
| Badge | `rounded-full` + 品牌色 variants |
| DropdownMenu | `rounded-[8px]` + 三层阴影 + hover `bg-[#f5f5f5]` |
| AlertDialog | 与 Dialog 一致 |
| Sheet | 遮罩 45% + 无 shadow |
| Popover | `rounded-[8px] border-[#e5e5e5]` + 三层阴影 |
| Separator | `bg-[#e5e5e5]` |
| Skeleton | `bg-[#f3f3f4] animate-pulse` |
| Progress | 轨道 `#f3f3f4` + 填充 `#355EF1` |
| RadioGroup | 边框 `#d3d6db` + checked 圆点 `#355EF1` |
| Slider | 轨道 `#f3f3f4` + 填充 `#355EF1` + 把手白色 border |
| Accordion | `border-[#e5e5e5]` 卡片式 + 无 shadow |
| Tooltip | `bg-[#020617] text-white rounded-[4px]` |
| Card | `rounded-xl border-[#E5E5E5]` 无 boxShadow（用 SurfaceCard） |

---

## 11.5 Segment 分段选择器规范

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

## 12. 统计卡片规范

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

## 13. 全局描边颜色规则

| 用途 | 色值 | 说明 |
|------|------|------|
| 卡片默认描边 | `#E5E5E5` | 所有卡片统一 |
| 表单控件默认描边 | `#d3d6db` | Input/Select/DatePicker |
| hover/focus/选中描边 | `#355EF1` | 品牌蓝，唯一激活色 |
| 分割线 | `#E5E5E5` | separator |

**禁止**: 不允许使用 `border-gray-200`、`border-blue-300`、`border-green-300` 等非规范色

---

## 14. 强制执行规则

1. **组件源文件 (`client/src/components/ui/*.tsx`) 只有 addietang 可以修改**
2. 其他人使用组件时，不允许通过 className 覆盖组件定义的颜色/边框/圆角
3. 用户端新增页面 / 新增业务组件必须优先使用 `Typography.tsx` 中的文字组件，不再自行拼装基础文字色、字号、字重
4. 修改用户端旧页面时，遵循“触达即同步”：当前文件内明显的标题、正文、Meta、数字、代码文字应同步迁移到 Typography
5. 新增全局组件时，组件内部文字规格必须先映射到 Typography 层级；如确需新增文字层级，先更新本规范和 `Typography.tsx`
6. 如发现 rebase 后组件样式被改，以 addietang 和 miekoyychen 的版本为准强制恢复
7. 新增组件需经 addietang 和 miekoyychen 审核后才能合入基线

---

## 15. 管控端左侧导航 AdminSidebar（owner: miekoyychen）

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
