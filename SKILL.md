---
name: openclawdesign
description: >
  OpenClaw Enterprise 设计系统规范。当用户要求创建、修改或审查 OpenClaw Enterprise 平台的
  前端页面、组件或 UI 时，必须加载此 Skill 以确保视觉风格、交互模式和代码实现与现有页面完全一致。
  适用于 React + TypeScript + Tailwind CSS v4 + shadcn/ui 技术栈。
---

# OpenClaw Enterprise Design System

> 设计语言：「流动蓝图」Fluid Blueprint
> 技术栈：React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (new-york style) · wouter · lucide-react · recharts · sonner · framer-motion

你是 OpenClaw Enterprise 平台的专属 UI 设计师和前端工程师。你的职责是确保所有新页面、新组件、UI 修改都严格遵循以下设计规范，与现有页面保持视觉和交互的完全一致。

---

## ⚠️ 全局组件样式规范（强制引用）

**所有 UI 组件的颜色、描边、圆角、阴影、交互状态必须遵循独立的全局组件规范文件：**

📄 **[SKILL-GLOBAL-COMPONENTS.md](./SKILL-GLOBAL-COMPONENTS.md)**

该文件由 **addietang** 维护，优先级最高。任何人写页面时：
1. 组件样式以该文件为唯一标准
2. 不允许通过 className 覆盖组件定义的颜色/边框/圆角
3. 不允许修改 `client/src/components/ui/*.tsx` 组件源文件（除 addietang 外）
4. rebase 后如组件样式被改，以 addietang 版本为准强制恢复

---

## 🎨 用户端（Tenant）专属规范（强制引用）

**自 2025-05-22 起，用户端与管控端在按钮圆角、Tab 样式、卡片圆角、装饰背景、顶部导航等方面出现差异，用户端页面必须额外遵循：**

📄 **[SKILL-TENANT.md](./SKILL-TENANT.md)**

加载与覆盖规则：
1. **写用户端（Tenant）页面/组件** → 必须同时加载 `SKILL.md` + `SKILL-GLOBAL-COMPONENTS.md` + `SKILL-TENANT.md`，**冲突时以 `SKILL-TENANT.md` 为准**。
2. **写管控端（Admin）页面/组件** → 加载 `SKILL.md` + `SKILL-GLOBAL-COMPONENTS.md`，**忽略** `SKILL-TENANT.md`。
3. `SKILL-TENANT.md` 只描述用户端**差异点**，未列出的内容沿用本文件 + `SKILL-GLOBAL-COMPONENTS.md`。
4. 共享组件（按钮 / Tab / 卡片）通过新增 `tenant-*` 变体扩展，**禁止**直接覆盖 `claw-*` 变体或修改默认样式以免破坏管控端。

---

## 1. 色彩系统

### 1.1 品牌色

| 名称 | 值 | 用途 |
|------|-----|------|
| Brand Blue | `#007AFF` | 主色，活跃态，链接，主按钮 |
| Brand Purple | `#5856D6` | 副色，渐变终点 |

**品牌渐变**（全局统一）：
```css
background: linear-gradient(135deg, #007AFF, #5856D6);
```
用于：Logo 容器、Avatar fallback、主 CTA 按钮、活跃分页按钮。

### 1.2 语义色

| 语义 | 色值 | Tailwind 类 | 用途 |
|------|------|-------------|------|
| 成功/运行中 | `#16A34A` | `bg-green-500` (dot), `text-green-600` | 状态徽章、在线指示 |
| 错误/停用 | `#DC2626` | `bg-red-500` (dot), `text-red-600` | 停止状态、危险操作 |
| 警告/待处理 | `#F59E0B` | `bg-yellow-500` (dot), `text-yellow-600` | 待处理状态 |
| 信息提示 | — | `bg-blue-50 border-blue-100 text-blue-600` | 提示横幅 |
| 警告提示 | — | `bg-amber-50 border-amber-100 text-amber-700` | 警告横幅 |

### 1.3 背景色

| 区域 | 色值 | 说明 |
|------|------|------|
| Admin 主背景 | `#F0F2F8` | 通过 inline style 设置 |
| Tenant 主背景 | `#FAFBFF` | 通过 inline style 设置 |
| 卡片/面板 | `#FFFFFF` | 纯白 |
| 表格斑马纹 | `bg-gray-50/50` | hover 态 |
| 表头 | `bg-gray-50/50` | 极浅灰 |

### 1.4 文字层级

| 层级 | Tailwind 类 | 用途 |
|------|-------------|------|
| 一级 | `text-gray-900` | 标题、卡片标题、关键数据 |
| 二级 | `text-gray-700` | 正文、表格内容 |
| 三级 | `text-gray-500` | 描述、辅助文字 |
| 四级 | `text-gray-400` | 占位符、极弱提示 |
| 活跃 | `text-blue-600` | 活跃导航、链接 |
| 危险 | `text-red-400 hover:text-red-600` | 删除按钮 |

### 1.5 渐变 Icon 容器配色

每种功能使用固定渐变，不可混用：

| 渐变 | 用途 |
|------|------|
| `from-blue-500 to-blue-600` | 模型、总数统计 |
| `from-green-500 to-green-600` | 通道、运行中 |
| `from-purple-500 to-purple-600` | 技能、输出 |
| `from-indigo-500 to-indigo-600` | 输入 Tokens |
| `from-blue-600 to-purple-600` | 总 Tokens |
| `from-orange-500 to-red-500` | 全局配额消耗 |
| `from-gray-400 to-gray-500` | 已停用 |

---

## 2. 排版系统

### 2.1 字体

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
- 正文字体：**Inter**（权重 400/500/600/700/800）
- 等宽字体：**DM Mono**（用于 API Key、JSON、代码片段）
- 渲染：开启 `antialiased`

### 2.2 字号与字重

| 用途 | Tailwind 类 | 等效值 |
|------|-------------|--------|
| 页面标题 h1 | `text-2xl font-bold` | 24px / 700 |
| 卡片标题 h2 | `font-semibold text-gray-900` | 16px / 600 |
| 统计大数字 | `text-2xl font-bold` | 24px / 700 |
| 正文/表格 | `text-sm` | 14px |
| 标签 Label | `text-sm font-medium text-gray-700` | 14px / 500 |
| 描述 | `text-sm text-gray-500` | 14px |
| 分组标题 | `text-xs font-semibold text-gray-400 uppercase tracking-wider` | 12px / 600 |
| 表头 | `text-xs font-medium text-gray-500 uppercase tracking-wide` | 12px / 500 |
| Badge 文字 | `text-xs font-medium` | 12px / 500 |
| Dialog 标题 | `text-lg leading-none font-semibold` | 18px / 600 |

### 2.3 数字排版

所有数字内容使用 `tabular-nums` 确保等宽对齐。

---

## 3. 间距系统

### 3.1 页面级

| 区域 | 间距 |
|------|------|
| Admin 内容区 padding | `p-8` (32px) |
| Tenant 内容区 padding | `px-6 py-8` (24px/32px) |
| 标题区到内容区 | `mb-6` 或 `mb-8` |
| Admin max-width | `max-w-3xl`（表单页）/ `max-w-5xl`（列表页）/ 不限（监控页） |
| Tenant max-width | `max-w-6xl` 或 `max-w-7xl` |

### 3.2 卡片内

| 位置 | 间距 |
|------|------|
| 表单卡片 | `p-8` |
| 普通卡片 | `p-5` 或 `p-6` |
| 卡片 header | `px-6 py-5` |
| 表格 header cells | `px-6 py-3` |
| 表格 body cells | `px-6 py-4` |

### 3.3 元素间

| 上下文 | 间距 |
|--------|------|
| 表单字段间 | `space-y-6` 或 `space-y-4` |
| Label 到 Input | `space-y-2` |
| 按钮组 gap | `gap-3` |
| 图标与文字 | `gap-2` 或 `gap-2.5` |
| 统计卡片 grid | `gap-4` |
| 导航项间 | `space-y-0.5` |

---

## 4. 圆角系统

| 组件 | 圆角 |
|------|------|
| 主卡片/表格容器 | `rounded-2xl` (16px) |
| 图标容器(大) | `rounded-xl` (12px) |
| 导航项/输入框/Logo | `rounded-lg` (8px) |
| 按钮/Badge | `rounded-md` (6px) |
| 状态徽章/进度条 | `rounded-full` |
| Dialog | `rounded-lg` (8px) |

---

## 5. 阴影系统

| 场景 | 阴影值 |
|------|--------|
| **主卡片**（最常用） | `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)` |
| Glass card | `0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)` |
| 强调卡片 | `0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)` |
| 主按钮 hover glow | `0 4px 14px rgba(0,122,255,0.3)` |
| Sidebar | `1px 0 0 0 rgba(0,0,0,0.04)` |

**注意**：通过 inline `style={{ boxShadow: "..." }}` 设置，不使用 Tailwind shadow 类。

---

## 6. 动画系统

### 6.1 页面切换

所有页面根元素必须包含 `page-enter` class：

```css
.page-enter {
  animation: pageEnter 0.25s ease-out;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 6.2 交互过渡

| 场景 | 类 |
|------|-----|
| 通用 hover | `transition-all duration-150` |
| 颜色变化 | `transition-colors` |
| 卡片 hover | `transition-all duration-200 hover:-translate-y-0.5` |
| 按钮 glow | `transition: box-shadow 0.2s ease` |

### 6.3 Dialog 动画

- 打开：`animate-in fade-in-0 zoom-in-95 duration-200`
- 关闭：`animate-out fade-out-0 zoom-out-95 duration-200`

---

## 7. 布局系统

### 7.1 Admin 布局

```
+--[ Sidebar w-64 fixed ]--+--[ Main ml-64 flex-1 p-8 ]--+
|  Logo(h-16 px-5)         |  bg: #F0F2F8                |
|  前往员工端链接            |  page-enter 内容区          |
|  Nav Groups(可折叠)       |                              |
|  User Footer(p-3)        |                              |
+---------------------------+------------------------------+
```

- Sidebar：`w-64`, `fixed`, `bg-white`, `border-r border-gray-100`
- 导航项：`px-3 py-2 rounded-lg text-sm font-medium gap-2.5`
- 活跃项：`text-blue-600 bg-blue-50` + `border-left: 2px solid #007AFF`
- 分组标题：`text-xs font-semibold text-gray-400 uppercase tracking-wider`
- 导航 icon：`w-4 h-4`

### 7.2 Tenant 布局

```
+--[ Navbar h-16 fixed z-50 bg-white/90 backdrop-blur-md ]--+
|  Logo  |  Nav Items  |  管理后台按钮 + User               |
+-----------------------------------------------------------+
|  pt-16 min-h-screen                                       |
|  max-w-7xl mx-auto px-6 内容区                             |
+-----------------------------------------------------------+
```

- Navbar：`h-16`, `fixed`, `z-50`, `bg-white/90`, `backdrop-blur-md`, `border-b border-gray-100`
- 导航项：`px-4 py-2 rounded-lg text-sm font-medium`
- 活跃：`text-blue-600 bg-blue-50`
- 非活跃：`text-gray-600 hover:text-gray-900 hover:bg-gray-50`

### 7.2.1 导航栏响应式断点规则

导航栏分为三个区域：左侧 Logo、中央 Segmented Tabs、右侧功能按钮（操作指南/消息通知/切换管控端/用户账号）。

**区域压缩策略**：

| 区域 | 压缩策略 |
|------|---------|
| Logo（ClawPro） | 永不压缩（`flex-shrink-0`） |
| 中央 Tabs | 按断点切换定位方式 + Tab 按钮文字可收缩 |
| 右侧功能按钮 | 按断点分阶段折叠文字 |

**间距规则**：区域之间最小间距 24px（`gap: 24px`），不允许堆叠或折行。

**断点行为**：

| 屏幕宽度 | 中央 Tabs | 右侧按钮文字 | 用户账号 |
|----------|-----------|-------------|---------|
| > 1400px | 绝对定位屏幕水平正中心 | 图标 + 完整文字 + 徽章 | 头像 + 完整用户名 + 箭头 |
| 1070–1400px | 仍然绝对居中 | 图标不变，文字 `max-width: 3em` 溢出省略，与中央 Tab 保持至少 24px 距离 | 用户名溢出省略 |
| < 1070px | 回到 flex 流（弹簧后面） | 文字和徽章隐藏（`max-width: 0` + `opacity: 0`），仅保留图标 | 仅保留头像 |

**实现方式**：

- 中央 Tabs 通过 CSS class `.nav-center-tabs` 控制，`@media (min-width: 1070px)` 时 `position: absolute; left: 50%; transform: translate(-50%, -50%)`
- 右侧按钮文字通过 CSS class `.nav-btn-label` 控制断点隐藏
- 按钮容器通过 `.nav-icon-btn` 在 <1070px 时 `gap: 0; padding: 6px` 让图标居中于分隔线之间
- 用户菜单通过 `.nav-user-btn` 在 <1070px 时 `gap: 0; padding: 0` 去掉多余空白
- 过渡动画：`.nav-btn-label` 设置 `transition: max-width 0.3s ease, opacity 0.3s ease, padding 0.3s ease`，无垂直位移

**hover 样式统一**：所有导航栏按钮（含用户账号）hover 为 `hover:bg-[#F5F5F5]` + 文字变深 `#020617`

**CSS 规则位置**：定义在 `client/src/index.css` 文件末尾

### 7.3 响应式网格

| 场景 | 列数 |
|------|------|
| OpenClaw 卡片 | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| 统计卡片 | `grid-cols-3` 或 `grid-cols-5` |
| 帮助文档 | `grid-cols-1 md:grid-cols-2` |

---

## 8. 组件规范

### 8.1 按钮

**变体（variant）**：

| 变体 | 用途 | normal | hover | active | disabled |
|------|------|--------|-------|--------|----------|
| `default` / `claw-primary` | 主操作 | 黑蓝渐变 #020617→#355EF1 | 渐变加深→#0A226F | 叠加白20% | 叠加白30%+文字50% |
| `outline` / `claw-outline` | 次要操作 | 白底+#e5e5e5边 | #f5f5f5底+#e3e3e3边 | 白底+#e3e3e3边 | 文字rgba(2,6,23,0.3) |
| `destructive` | 危险操作 | #d42a1e | #b91c1c | #991b1b | 40%透明度 |
| `ghost` | 辅助操作 | 无背景 | #f5f5f5底 | #ebebeb底 | 文字30%透明 |
| `link` | 链接样式 | #355EF1 | 加下划线 | #0a226f | 40%透明 |

**尺寸（size）**：

| 尺寸 | 高度 | 类名 | 用途 |
|------|------|------|------|
| lg / claw-lg | 40px (`h-10`) | `size="lg"` | 突出 CTA、页面主操作 |
| default / claw | 36px (`h-9`) | `size="default"` | 常规操作（默认） |
| sm / claw-sm | 32px (`h-8`) | `size="sm"` | 表格行操作、紧凑场景 |
| icon | 36px (`size-9`) | `size="icon"` | 纯图标按钮 |

**关键约束**：
1. **同行高度一致**：按钮与 Input、Select 等组件在同一行时，必须使用相同高度档位（如搜索栏中 Input h-9 + Button h-9），禁止出现高度不对齐
2. 所有 disabled 态必须有 `cursor-not-allowed` 禁用手势
3. 不再使用全局 `opacity-50` 表示禁用，每个变体有独立的禁用视觉
4. 主按钮不再使用旧的 `linear-gradient(135deg, #007AFF, #5856D6)`，统一使用黑蓝渐变

```jsx
// 主操作
<Button>创建 Agent</Button>
// 次要操作
<Button variant="outline">详细配置</Button>
// 危险操作
<Button variant="destructive">删除</Button>
// 搜索栏（与 Input 同行同高）
<div className="flex gap-3 items-center">
  <Input className="w-64" placeholder="搜索..." />
  <Button variant="outline" size="default">搜索</Button>  {/* 都是 h-9 */}
</div>
```

### 8.2 输入框 Input

基于 shadcn/ui Input 组件，视觉刷新后的统一规范：

| 属性 | 值 | 说明 |
|------|-----|------|
| 高度 | `h-9`（36px） | 与同行组件保持一致 |
| 圆角 | `rounded-[4px]` | 4px |
| 边框 | `border-[#d3d6db]` | 默认态 |
| hover 边框 | `border-[#355EF1]` | 蓝色 |
| focus 边框 | `border-[#355EF1]` | 蓝色，无 ring/shadow |
| 报错边框 | `border-[#d42a1e]` | 红色 |
| placeholder | `text-[#b0b6c3]` | 浅灰 |
| 文字色 | `text-[#020617]` | 近黑 |
| disabled 背景 | `bg-[#f3f3f4]` | 浅灰底，不用 opacity |
| disabled 文字 | `text-[#b0b6c3]` | 浅灰 |
| 内边距 | `px-3 py-[5px]` | 左右12px |

**错误状态**需配合提示文字：
```jsx
<div className="space-y-2">
  <Input aria-invalid placeholder="请输入企业邮箱" />
  <p className="text-xs text-[#d42a1e] leading-5">请输入正确企业邮箱</p>
</div>
```

**关键约束**：
- hover/focus 仅变边框颜色，不加 ring 或 box-shadow
- disabled 态用背景色区分，不用 opacity
- 报错信息字号 12px，颜色 `#d42a1e`
- **同行高度一致**：与 Button、Select 在同一行时，必须使用相同高度档位（默认都是 h-9 = 36px）

### 8.2.1 下拉选择 Select

基于 shadcn/ui Select (Radix) 组件，视觉刷新后的统一规范：

**SelectTrigger（触发器）**：

| 属性 | 值 | 说明 |
|------|-----|------|
| 高度 | `h-9`（36px） | 与 Input 一致 |
| 圆角 | `rounded-[4px]` | 4px |
| 边框 | `border-[#d3d6db]` | 默认态 |
| hover/展开 边框 | `border-[#355EF1]` | 蓝色 |
| placeholder | `text-[#b0b6c3]` | 未选择时 |
| 已选值 | `text-black` | 选中后 |
| disabled | `bg-[#f3f3f4] border-[#d3d6db] text-[#b0b6c3]` | |
| 箭头图标 | `text-[#7b818f]`，展开时旋转180° | |

**SelectContent（下拉面板）**：

| 属性 | 值 |
|------|-----|
| 背景 | `bg-white` |
| 圆角 | `rounded-[4px]` |
| 阴影 | `0px 0px 2px rgba(0,0,0,0.1), 0px 4px 16px rgba(0,0,0,0.12)` |
| 内边距 | `p-2`（8px） |
| 无 border | — |

**SelectItem（选项条目）**：

| 属性 | 值 |
|------|-----|
| 高度 | `h-8`（32px） |
| 圆角 | `rounded-[6px]` |
| 内边距 | `px-3 py-[9px]` |
| hover 背景 | `bg-[#f3f3f4]` |
| 字号 | 14px，PingFang SC |
| 选中态 | `text-[#355EF1] font-medium` + 蓝色勾号 |

```jsx
<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="请选择所属行业" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="gov">政务</SelectItem>
    <SelectItem value="internet">互联网</SelectItem>
    <SelectItem value="finance">金融</SelectItem>
  </SelectContent>
</Select>
```

### 8.2.2 状态徽章

**必须使用自定义 class，不要自己发明新的状态样式**：

```jsx
// 运行中
<span className="badge-running">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
  运行中
</span>

// 已停止
<span className="badge-stopped">...</span>

// 待处理
<span className="badge-pending">...</span>
```

CSS 定义：
```css
.badge-running { background: rgba(52,199,89,0.12); color: #1a8c3a; }
.badge-stopped { background: rgba(255,59,48,0.1); color: #c0392b; }
.badge-pending { background: rgba(255,149,0,0.1); color: #b8640a; }
```

### 8.3 卡片

**绝大多数卡片使用原生 div，不使用 shadcn Card**：

```jsx
<div
  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
>
  {/* 可选 header */}
  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
    <h2 className="font-semibold text-gray-900">标题</h2>
  </div>
  {/* 内容 */}
</div>
```

### 8.4 表格

**使用原生 `<table>`，不使用 shadcn Table**：

```jsx
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-50 bg-gray-50/50">
      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
        列名
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-50">
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-700">内容</td>
    </tr>
  </tbody>
</table>
```

### 8.5 统计卡片

```jsx
<div className="bg-white rounded-2xl border border-gray-100 p-5"
  style={{ boxShadow: "..." }}>
  <div className="flex items-center gap-3 mb-3">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
      <IconName className="w-5 h-5 text-white" />
    </div>
    <span className="text-sm text-gray-500">标签</span>
  </div>
  <div className="text-2xl font-bold text-gray-900">数值</div>
</div>
```

### 8.6 搜索筛选栏

```jsx
<div className="flex flex-wrap gap-3 mb-4 items-center">
  {/* 搜索框 */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input placeholder="搜索..." className="pl-9 bg-white w-64" />
  </div>
  {/* 刷新按钮 */}
  <button className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300">
    <RefreshCw className="w-4 h-4" />
  </button>
</div>
```

### 8.7 Dialog（弹窗组件规范）

#### 8.7.1 通用规范

| 属性 | 值 |
|------|-----|
| 圆角 | `8px` |
| 遮罩 | `rgba(0,0,0,0.45)` |
| 阴影 | `0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)` |
| 分割线 | **无**（Header/Footer 均无分割线） |
| 标题 | `16px font-semibold text-[#0A0A0A]` |
| 关闭按钮 | 右上角 `#737373` → hover `#0A0A0A` |
| 最大高度 | `maxHeight: min(90vh, 780px)`，高度自适应内容，不出现大面积空白 |
| 内容区滚动 | 使用 `DialogBody` 管理滚动，设置 `scrollbarGutter: "stable"` |
| 元素间距 | 内容区元素间距可取 **8px**（`space-y-2`）、**12px**（`space-y-3`）、**16px**（`space-y-4`）三档；默认两个一级模块之间取 **16px**；**严禁**两个元素紧贴在一起无任何间距 |
| Alert 位置 | Alert 提示必须放在内容区（DialogBody）**最上方** |
| 表单组件 | 下拉框和 Input 必须引用项目规范组件（`@/components/ui/select`、`@/components/ui/input`），禁止自行编造样式 |

**尺寸规范**：
- 小确认框：`sm:max-w-sm`
- 中表单：`sm:max-w-md` / `sm:max-w-[532px]`
- 大表单：`sm:max-w-lg` / `sm:max-w-[640px]`
- 详情查看：`sm:max-w-2xl`

**关键约束**：
- 不加 Header/Footer 分割线
- Footer 按钮右对齐，取消在左确认在右
- 取消按钮统一使用 `variant="outline"`

**强制规范（不可违反）**：
1. 项目中的弹窗**只能使用普通弹窗或警示弹窗**两种变体，禁止自行产出新样式
2. 弹窗内的下拉组件、Input 组件、按钮组件等**必须使用项目规范组件样式**（`@/components/ui/*`），禁止自行编造
3. 弹窗内的一级标题和说明文字**必须保持字体属性一致**（标题 `text-base font-semibold text-[#0A0A0A]`，说明 `text-sm text-[#525252]`）
4. 如果弹窗内有 info 图标，**必须使用相同的 SVG**（统一使用 `lucide-react` 的 `Info` / `AlertTriangle` 等图标组件）
5. 如果弹窗内有 Alert 组件，**Alert 必须位于内容区最上方**
6. 弹窗左上角大标题旁边**不使用图标**，标题保持纯文字
7. 弹窗内的 Input 和 Select 组件统一使用**灰色边框白色底**（`border-[#E5E5E5] bg-white`），禁止加入灰色底色（如 `bg-gray-50`、`bg-[#FAFAFA]`）
8. 弹窗内容区元素间距**只能在 8px / 12px / 16px 三档中选取**（对应 `space-y-2` / `space-y-3` / `space-y-4`）：
   - 默认情况下，两个**一级模块**之间使用 **16px**（`space-y-4`）
   - 同一模块内子元素可使用 **12px**（`space-y-3`）或 **8px**（`space-y-2`）
   - **严禁**两个元素紧贴（即间距为 0），所有相邻元素必须保留可见间距
9. **弹窗和对话框右上角必须有关闭按钮**（X 图标，`top-5 right-5`，`#737373` → hover `#0A0A0A`，尺寸 `size-5`）：
   - 普通 `Dialog`（`@/components/ui/dialog`）已内置该关闭按钮，**禁止移除**
   - `AlertDialog`（`@/components/ui/alert-dialog`）**未自带**关闭按钮，必须**手动**在 `AlertDialogContent` 内添加：
     ```jsx
     <button
       type="button"
       aria-label="关闭"
       onClick={onClose}
       className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
     >
       <X className="size-5" />
       <span className="sr-only">关闭</span>
     </button>
     ```
   - 关闭按钮与底部「取消」按钮的行为一致（关闭弹窗，不提交任何数据）
   - 关闭按钮**位于标题左侧时不允许**（如返回箭头）；返回操作请通过底部「上一步」按钮承载

---

#### 8.7.2 普通弹窗

主按钮使用 **`variant="dialog-confirm"`**（纯黑底白字）：
- 默认：`bg-[#0A0A0A] text-white`
- hover：`bg-[#404040]`
- disabled：`bg-[#A3A3A3] text-white`

```jsx
<Dialog>
  <DialogContent className="sm:max-w-md" style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}>
    <DialogHeader>
      <DialogTitle>确认操作</DialogTitle>
    </DialogHeader>
    <DialogBody className="flex-1">
      {/* Alert 提示放在最上方 */}
      <div className="space-y-4">
        {/* 内容区域 */}
      </div>
    </DialogBody>
    <DialogFooter>
      <Button variant="outline">取消</Button>
      <Button variant="dialog-confirm">确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### 8.7.3 警示弹窗

用于删除、危险操作等场景。关键调整：
- 主按钮使用 **`variant="destructive"`**（红色底白字：`bg-[#d42a1e]`）
- 右上角**必须有关闭按钮**
- 标题保持黑色（不用红色）
- 警示文字用 `text-[#DC2626]` 红色强调

```jsx
<AlertDialog>
  <AlertDialogContent className="sm:max-w-sm">
    {/* 右上角关闭按钮 */}
    <button
      className="absolute top-5 right-5 size-5 rounded-sm text-[#737373] hover:text-[#0A0A0A]"
      onClick={onClose}
    >
      <X className="size-5" />
    </button>
    <AlertDialogHeader>
      <AlertDialogTitle className="text-[#0A0A0A]">
        确认删除？
      </AlertDialogTitle>
      <AlertDialogDescription asChild>
        <p className="text-sm text-[#0A0A0A]">
          确定要删除 XXX 吗？<span className="text-[#DC2626]">此操作不可撤销。</span>
        </p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction className="bg-[#d42a1e] hover:bg-[#b91c1c] text-white">
        确认删除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 8.8 提示横幅

```jsx
{/* 信息提示 */}
<div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
  <p className="text-xs text-blue-600 leading-relaxed">提示文字</p>
</div>

{/* 警告提示 */}
<div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
  <p className="text-xs text-amber-700 leading-relaxed">警告文字</p>
</div>
```

### 8.9 分页

活跃页码使用品牌渐变：
```jsx
<button
  style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
  className="w-7 h-7 rounded-lg text-white text-xs font-medium"
>
  {page}
</button>
```
非活跃页码：`variant="ghost" size="sm"`, `w-7 h-7 text-xs text-gray-500`

### 8.10 进度条

```jsx
<div className="w-full bg-gray-100 rounded-full h-1.5">
  <div
    className={`h-1.5 rounded-full transition-all ${
      pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-blue-500"
    }`}
    style={{ width: `${pct}%` }}
  />
</div>
```

### 8.11 毛玻璃卡片

```css
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}
```

---

## 9. 图标规范

**唯一图标库**：`lucide-react`。禁止使用 emoji、FontAwesome 或其他图标库。

| 用途 | 尺寸 |
|------|------|
| 导航项 | `w-4 h-4` |
| 按钮内 | `w-4 h-4` |
| 统计 icon 容器内 | `w-5 h-5` |
| 表格行操作 | `w-3.5 h-3.5` |
| 空状态 | `w-12 h-12 text-gray-200` |

### 导航图标映射

| 页面 | 图标 |
|------|------|
| 基础信息 | `Settings` |
| 成员管理 | `Users` |
| 模型配置 | `Brain` |
| 通道配置 | `MessageSquare` |
| 技能配置 | `Puzzle` |
| 镜像管理 | `HardDrive` |
| 安全组 | `ShieldCheck` |
| OpenClaw 监控 | `Activity` |
| Tokens 监控 | `BarChart3` |
| 审计日志 | `ClipboardList` |
| 帮助文档 | `FileText` |

---

## 10. 状态模式

### 10.1 空状态

```jsx
<div className="text-center py-24">
  <Bot className="w-12 h-12 text-gray-200 mx-auto mb-4" />
  <p className="text-gray-400 mb-4">暂无数据描述</p>
  <Button variant="outline">操作按钮</Button>
</div>
```

表格空状态：
```jsx
<td colSpan={N} className="px-6 py-12 text-center text-sm text-gray-400">
  暂无符合条件的记录
</td>
```

### 10.2 操作反馈

- **成功**：`toast.success("操作成功")`
- **错误**：`toast.error("操作失败")`
- **加载**：按钮 `disabled` + 图标 `animate-spin`
- **刷新**：`setTimeout(..., 1000)` 模拟 + `toast.success("列表已刷新")`

### 10.3 禁用态

- 停用 OpenClaw：`opacity-40 cursor-not-allowed`
- 不可操作按钮：`disabled` + Tooltip 说明原因
- 只读输入：`bg-gray-100 cursor-not-allowed select-none text-gray-400`

### 10.4 危险操作确认

使用 `AlertDialog`（非 `Dialog`），参见 **8.7.3 警示弹窗** 规范：
- 主按钮使用 `variant="destructive"`（`bg-[#d42a1e]`）
- 右上角必须有关闭按钮
- 警示文字用 `text-[#DC2626]`

```jsx
<AlertDialogAction className="bg-[#d42a1e] hover:bg-[#b91c1c] text-white">
  确认删除
</AlertDialogAction>
```

---

## 11. 图表规范

统一使用 **recharts**（LineChart 为主）：

```jsx
<LineChart>
  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
  <XAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
  <Line stroke="#6366f1" strokeWidth={2} name="输入" />
  <Line stroke="#8b5cf6" strokeWidth={2} name="输出" />
</LineChart>
```

---

## 12. 关键约束（必须遵守）

1. **不要引入新的 CSS 框架或 UI 库**。所有组件基于 Tailwind CSS + shadcn/ui + 自定义样式实现。
2. **不要修改 Landing Page（`client/src/pages/landing/`）**。落地页使用自定义样式，全局组件改动不应涉及该目录下的任何文件。
3. **不要使用 shadcn Card 替代原生 div 卡片**。项目中卡片使用 `<div className="bg-white rounded-2xl border border-gray-100">` + inline boxShadow。
4. **不要使用 shadcn Table 替代原生 table**。项目中表格使用原生 `<table>` + 自定义类。
4. **不要发明新的状态颜色**。运行/停止/待处理严格使用 `badge-running` / `badge-stopped` / `badge-pending`。
5. **不要使用 emoji 作为图标**。统一使用 `lucide-react`。
6. **所有页面根元素必须包含 `page-enter` class**。
7. **品牌渐变通过 inline style 设置**，不要用 Tailwind gradient 类近似模拟。
8. **卡片阴影通过 inline style 设置**，使用统一的双层阴影值。
9. **toast 通知统一使用 sonner**，不要使用 alert() 或自定义 notification。
10. **每个页面组件自行包裹 Layout**（`<AdminLayout>` 或 `<TenantLayout>`），不要在路由层嵌套。
11. **中文 UI**：所有界面文案使用简体中文。
12. **数据操作通过 useState + mock 数据**，不直接调用后端 API。

---

## 13. 新页面 Checklist

创建任何新页面前，逐项确认：

- [ ] 选择正确的 Layout（Admin/Tenant）
- [ ] 根元素包含 `page-enter` class
- [ ] 卡片使用 `rounded-2xl` + 统一 boxShadow
- [ ] 表格使用原生 `<table>` + 规范的 thead/tbody 类
- [ ] 按钮使用正确的 variant 和 size
- [ ] 状态徽章使用 `badge-running/stopped/pending`
- [ ] 图标来自 lucide-react，尺寸正确
- [ ] 间距遵循系统（p-8/p-6/gap-4 等）
- [ ] 页面标题使用 `text-2xl font-bold` + `text-sm text-gray-500` 描述
- [ ] 操作反馈使用 `toast.success/error`
- [ ] 空状态有友好提示
- [ ] 危险操作使用 AlertDialog 确认
