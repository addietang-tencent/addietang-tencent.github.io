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
> **优先级**: 最高——所有分支合并时，组件样式以此规范为准，不允许其他人修改组件源文件  
> **组件源码路径**: `client/src/components/ui/`  
> **CSS 变量定义**: `client/src/index.css`

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

## 11. 其他组件速查

| 组件 | 关键样式 |
|------|---------|
| Tabs | 活跃态 `#355EF1` + 底色 `#f3f3f4` |
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
