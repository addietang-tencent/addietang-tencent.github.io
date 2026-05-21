---
name: clawpro-global-components
description: >
  ClawPro 全局组件样式规范（owner: addietang）。
  此文件定义所有基础 UI 组件的视觉规范，包括颜色、描边、圆角、阴影、交互状态。
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

### 4.4 SmallIconStateButton（小图标按钮）

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

## 10.6 树结构组件（GroupTree / FileTree）

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
3. 如发现 rebase 后组件样式被改，以 addietang 的版本为准强制恢复
4. 新增组件需经 addietang 审核后才能合入基线

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
