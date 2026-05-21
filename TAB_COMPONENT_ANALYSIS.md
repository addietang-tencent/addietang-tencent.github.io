# Tab Switching Component Analysis Report
**Codebase:** `/Users/addietang/Documents/cvm/openclaw-enterprise`  
**Date:** 2026-05-21

---

## 📋 Executive Summary

The codebase contains **two main tab/segment switching components**:

1. **`Segment` Component** - Specialized segment selector with multiple variants
2. **`Tabs` Component** - Standard tab interface using Radix UI
3. **`ViewModeSegmented` Component** - Custom view mode switcher

The search did **NOT find specific "合同" (contract) and "模版" (template) tabs** in dedicated components. However, the **PluginListTab.tsx** file contains the Chinese characters "合同" in description text.

---

## 🎯 Component Locations

### 1. **Segment Component (Recommended for Card/List Views)**
**File:** `/Users/addietang/Documents/cvm/openclaw-enterprise/client/src/components/ui/segment.tsx`

**Purpose:** Segmented selector component that provides two interaction modes:
- **Controlled Mode**: Works with `Segment` wrapper using Radix Tabs
- **Independent Mode**: Standalone `SegmentGroup` for pure styling

**Key Features:**
- Light gray background (`#f3f3f4`)
- White background for active state
- Padding: 4px 16px per item
- Height: 36px (h-9)
- Border radius: 6px (container), 4px (items)
- Smooth transitions and hover effects
- Focus ring support: 3px ring at `#355EF1/20`

**Design Tokens:**
```
Container: #f3f3f4 bg, 6px radius, 36px height
Item Active: White bg, #020617 text (semibold), shadow
Item Inactive: #7b818f text, hover -> #4b5563
Item Disabled: #d3d6db text
```

**Usage Examples:**

```tsx
// Controlled Mode with TabsContent
<Segment defaultValue="basic">
  <SegmentList>
    <SegmentItem value="basic">基础配置</SegmentItem>
    <SegmentItem value="tools">工具管理</SegmentItem>
  </SegmentList>
  <SegmentContent value="basic">...</SegmentContent>
  <SegmentContent value="tools">...</SegmentContent>
</Segment>

// Independent Mode (Pure Styling)
<SegmentGroup>
  <SegmentOption active={mode === "all"} onClick={() => setMode("all")}>
    全部
  </SegmentOption>
  <SegmentOption active={mode === "group"} onClick={() => setMode("group")}>
    分组
  </SegmentOption>
</SegmentGroup>
```

**Real Usage in Codebase:**
- Used in `/pages/admin/SkillLibrary/PluginListTab.tsx` for view mode switching (card/list view)
- Used in `/pages/tenant/MyOpenClaw.tsx` for display mode selection

**Exported Components:**
- `Segment` - Root wrapper
- `SegmentList` - Trigger list container
- `SegmentItem` - Individual trigger
- `SegmentContent` - Content container
- `SegmentGroup` - Independent mode container
- `SegmentOption` - Independent mode item

---

### 2. **Tabs Component (Standard Tab Interface)**
**File:** `/Users/addietang/Documents/cvm/openclaw-enterprise/client/src/components/ui/tabs.tsx`

**Purpose:** Standard tab navigation based on Radix UI primitives

**Key Features:**
- Built on `@radix-ui/react-tabs`
- Active state styling: white background + blue text (`#355EF1`)
- Inactive text: `#7b818f`
- Container: `#f3f3f4` background
- Focus ring support
- Full-width or fixed width layouts

**Design Tokens:**
```
Container: #f3f3f4, 36px height, 4px radius
Item Active: White bg, #355EF1 text (semibold), shadow
Item Inactive: #7b818f text
Focus Ring: 3px @ #355EF1/20
```

**Usage:**
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

**Real Usage in Codebase:**
- `/pages/admin/SkillLibrary/SkillDetail.tsx` - Overview, Files, Distribution tabs
- `/pages/tenant/SkillSquare.tsx` - Overview, Files, Distribution tabs
- `/pages/admin/EnterpriseSkillLibrary.tsx` - Skills, Categories tabs
- `/components/topnav/NotificationPanel.tsx` - Notification category tabs
- `/components/topnav/HelpPanel.tsx` - Help documentation tabs

**Exported Components:**
- `Tabs` - Root wrapper
- `TabsList` - Trigger list container
- `TabsTrigger` - Individual trigger
- `TabsContent` - Content container

---

### 3. **ViewModeSegmented Component (Custom Implementation)**
**File:** `/Users/addietang/Documents/cvm/openclaw-enterprise/client/src/components/agent/ViewModeSegmented.tsx`

**Purpose:** Custom view mode switcher (Management View / Chat View)

**Key Features:**
- Custom styling independent of Radix UI
- Icons + text labels
- Figma node reference: `358:2376`
- Background: `#F5F5F5`
- Hover effects and transitions

**Design:**
```
- Active: white bg, #0A0A0A text, shadow
- Inactive: #737373 text, hover -> #0A0A0A
- Padding: 4px 12px per item
- Gap: 4px between icon and text
```

**Usage:**
```tsx
<ViewModeSegmented 
  value={viewMode} 
  onChange={setViewMode} 
/>
```

---

## 🔍 Search Results Summary

### Keywords Searched:
- ✅ "tab", "Tabs", "TabsTrigger", "TabsList"
- ✅ "segment", "Segment", "SegmentGroup", "SegmentOption"
- ✅ "switch", "switcher", "Segmented"
- ✅ "合同" (contract)
- ✅ "模版" (template)

### Files Found:
**1. Component Definitions:**
- `segment.tsx` - Segment component (Primary)
- `tabs.tsx` - Tabs component (Secondary)
- `ViewModeSegmented.tsx` - Custom view mode (Tertiary)

**2. Usage Files (Top implementations):**
- `PluginListTab.tsx` - SegmentGroup for card/list view switching
- `SkillDetail.tsx` - Hidden TabsList + custom segment switching
- `MyOpenClaw.tsx` - SegmentGroup for view mode
- `EnterpriseSkillLibrary.tsx` - TabsList for Skill/Category navigation
- `SkillSquare.tsx` - TabsList for Overview/Files/Distribution

**3. Chinese Character "合同" (Contract) References:**
- Found in: `PluginListTab.tsx` (line 62)
- Context: Description text for "智能文档分析插件" (Intelligent Document Analysis Plugin)
- Usage: "适用于合同审查、财报分析、技术文档解读等企业级场景"
- NOT in a dedicated contract/template tab component

**4. Chinese Character "模版" (Template) References:**
- Found in: Multiple files
- Contexts: Template downloads, template forms, template management pages
- NOT in a dedicated tab switching component for contract/template selection

---

## 🎨 Design System Integration

### Color Palette:
```
Background: #f3f3f4 (light gray)
Active Text: #020617 (dark) / #355EF1 (blue for Tabs)
Inactive Text: #7b818f (medium gray)
Hover Text: #4b5563 (darker gray)
Disabled Text: #d3d6db (very light gray)
Active BG: #FFFFFF (white)
Shadow: 0px 1px 2px rgba(0,0,0,0.05)
Focus Ring: #355EF1/20 (blue with 20% opacity)
```

### Typography:
```
Font Size: 14px (text-sm)
Active State: Font-semibold
Inactive State: Font-normal
Disabled State: Font-normal with reduced color
```

### Spacing:
```
Container Padding: 3px
Item Padding: 4px 16px (vertical x horizontal)
Gap Between Items: 0px (adjacent)
Height: 36px (h-9)
Border Radius: 6px (container), 4px (items)
```

---

## 📊 Comparison Table

| Feature | Segment | Tabs | ViewModeSegmented |
|---------|---------|------|-------------------|
| **Based On** | Radix Tabs | Radix Tabs | Custom HTML |
| **Use Case** | General switching | Tab navigation | View mode toggle |
| **Modes** | Controlled + Independent | Controlled only | Controlled only |
| **Active Color** | White BG, #020617 text | White BG, #355EF1 text | White BG, #0A0A0A text |
| **Background** | #f3f3f4 | #f3f3f4 | #F5F5F5 |
| **Icons** | Optional | Not supported | Required |
| **Figma Reference** | Yes | Yes | Yes (358:2376) |
| **Accessibility** | ARIA compliant | ARIA compliant | ARIA compliant |

---

## 💡 Recommendations

### If You Need Contract/Template Tabs:

**Option 1: Use Existing Segment Component**
```tsx
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';

<SegmentGroup>
  <SegmentOption active={tab === 'contract'} onClick={() => setTab('contract')}>
    合同
  </SegmentOption>
  <SegmentOption active={tab === 'template'} onClick={() => setTab('template')}>
    模版
  </SegmentOption>
</SegmentGroup>
```

**Option 2: Use Controlled Segment with Content**
```tsx
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

<Segment defaultValue="contract">
  <SegmentList>
    <SegmentItem value="contract">合同</SegmentItem>
    <SegmentItem value="template">模版</SegmentItem>
  </SegmentList>
  <SegmentContent value="contract">
    {/* Contract content */}
  </SegmentContent>
  <SegmentContent value="template">
    {/* Template content */}
  </SegmentContent>
</Segment>
```

**Option 3: Use Standard Tabs**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="contract">
  <TabsList>
    <TabsTrigger value="contract">合同</TabsTrigger>
    <TabsTrigger value="template">模版</TabsTrigger>
  </TabsList>
  <TabsContent value="contract">Contract content</TabsContent>
  <TabsContent value="template">Template content</TabsContent>
</Tabs>
```

---

## 📂 Directory Structure

```
client/src/
├── components/
│   ├── ui/
│   │   ├── segment.tsx          ← Primary segment component
│   │   ├── tabs.tsx             ← Standard tabs component
│   │   └── ...other UI components
│   ├── agent/
│   │   ├── ViewModeSegmented.tsx ← Custom view mode switcher
│   │   └── ...other agent components
│   └── ...other components
└── pages/
    ├── admin/
    │   ├── SkillLibrary/
    │   │   ├── SkillDetail.tsx   ← Tab usage example
    │   │   ├── PluginListTab.tsx ← Segment usage + "合同" mention
    │   │   └── ...skill pages
    │   ├── EnterpriseSkillLibrary.tsx ← Tab usage
    │   └── ...admin pages
    └── tenant/
        ├── SkillSquare.tsx       ← Tab usage
        ├── MyOpenClaw.tsx        ← Segment usage
        └── ...tenant pages
```

---

## 🚀 Implementation Checklist

- [ ] Verify which component best fits your use case (Segment vs Tabs)
- [ ] Check design token alignment with Figma specs
- [ ] Implement accessibility requirements (ARIA labels, keyboard navigation)
- [ ] Test with both dark and light backgrounds
- [ ] Ensure mobile responsiveness
- [ ] Add focus indicators for keyboard navigation
- [ ] Test with different content lengths
- [ ] Verify shadow effects render correctly
- [ ] Check color contrast ratios (WCAG AA)

---

## 📝 Notes

1. **No Dedicated Contract/Template Component**: The specific "合同" (contract) and "模版" (template) tabs were NOT found as a dedicated component. These Chinese terms appear only in:
   - Plugin description text
   - Template-related feature labels
   - Download template functionality

2. **Naming Convention**: The codebase uses:
   - `Segment` for general switching (appears more versatile)
   - `Tabs` for standard tab navigation (appears more formal)
   - Custom components for specialized use cases

3. **Design System Alignment**: All components align with the same design system tokens, making them easily interchangeable.

4. **Figma Integration**: Components reference Figma node IDs for design-to-code alignment.

---

**Report Generated:** 2026-05-21  
**Search Scope:** `/Users/addietang/Documents/cvm/openclaw-enterprise/client/src`
