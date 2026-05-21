# Tab Component Code Reference Guide

## Quick Start Examples

### Example 1: Basic Segment Switcher (Recommended for Simple Toggle)

**File Location:** `client/src/components/ui/segment.tsx`

```tsx
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { useState } from 'react';

export default function ContractTemplateView() {
  const [activeTab, setActiveTab] = useState<'contract' | 'template'>('contract');

  return (
    <div>
      {/* Tab Switcher */}
      <SegmentGroup>
        <SegmentOption 
          active={activeTab === 'contract'} 
          onClick={() => setActiveTab('contract')}
        >
          合同
        </SegmentOption>
        <SegmentOption 
          active={activeTab === 'template'} 
          onClick={() => setActiveTab('template')}
        >
          模版
        </SegmentOption>
      </SegmentGroup>

      {/* Content Area */}
      <div className="mt-4">
        {activeTab === 'contract' && <ContractContent />}
        {activeTab === 'template' && <TemplateContent />}
      </div>
    </div>
  );
}
```

---

### Example 2: Controlled Segment (With Built-in Content Switching)

**File Location:** `client/src/components/ui/segment.tsx`

```tsx
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

export default function ContractTemplatePage() {
  return (
    <div>
      <Segment defaultValue="contract">
        {/* Tab Switcher */}
        <SegmentList>
          <SegmentItem value="contract">合同</SegmentItem>
          <SegmentItem value="template">模版</SegmentItem>
        </SegmentList>

        {/* Contract Content */}
        <SegmentContent value="contract">
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h2>合同管理</h2>
            <p>合同内容区域...</p>
          </div>
        </SegmentContent>

        {/* Template Content */}
        <SegmentContent value="template">
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h2>模版管理</h2>
            <p>模版内容区域...</p>
          </div>
        </SegmentContent>
      </Segment>
    </div>
  );
}
```

---

### Example 3: Standard Tabs Component

**File Location:** `client/src/components/ui/tabs.tsx`

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ContractTemplateAdmin() {
  return (
    <div>
      <Tabs defaultValue="contract" className="w-full">
        {/* Tab List */}
        <TabsList>
          <TabsTrigger value="contract">合同</TabsTrigger>
          <TabsTrigger value="template">模版</TabsTrigger>
        </TabsList>

        {/* Contract Tab Content */}
        <TabsContent value="contract" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">合同列表</h3>
            {/* Contract list implementation */}
          </div>
        </TabsContent>

        {/* Template Tab Content */}
        <TabsContent value="template" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">模版列表</h3>
            {/* Template list implementation */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### Example 4: Real Usage from Codebase (PluginListTab.tsx)

**Location:** `client/src/pages/admin/SkillLibrary/PluginListTab.tsx` (lines 282-289)

```tsx
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import { Grid3x3, List } from 'lucide-react';

export default function PluginListTab() {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  return (
    <div className="space-y-4">
      {/* Toolbar with view mode switcher */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <SegmentGroup>
            <SegmentOption 
              active={viewMode === 'card'} 
              onClick={() => setViewMode('card')} 
              title="卡片视图"
            >
              <Grid3x3 className="w-4 h-4" />
            </SegmentOption>
            <SegmentOption 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')} 
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </SegmentOption>
          </SegmentGroup>

          <Button variant="claw-primary" size="claw-sm" onClick={() => setUploadDialogOpen(true)}>
            + 发布插件
          </Button>
        </div>
      </div>

      {/* Content renders based on viewMode */}
      {viewMode === 'card' && <CardView plugins={sortedPlugins} />}
      {viewMode === 'list' && <ListView plugins={sortedPlugins} />}
    </div>
  );
}
```

---

### Example 5: Using TabsContent for Rich Content (SkillDetail.tsx)

**Location:** `client/src/pages/admin/SkillLibrary/SkillDetail.tsx` (lines 824-1149)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function SkillDetail({ skillId }: { skillId: string }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Hidden TabsList - using custom segmented control instead */}
      <TabsList className="hidden">
        <TabsTrigger value="overview">概述</TabsTrigger>
        <TabsTrigger value="files">文件列表</TabsTrigger>
        <TabsTrigger value="distribution">下发记录</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="mt-0 p-0">
        <div className="space-y-6">
          <SkillOverviewSection skillId={skillId} />
        </div>
      </TabsContent>

      {/* Files Tab */}
      <TabsContent value="files" className="mt-0 p-0">
        <div className="space-y-6">
          <FileExplorerSection skillId={skillId} />
        </div>
      </TabsContent>

      {/* Distribution Tab */}
      <TabsContent value="distribution" className="mt-0 p-0">
        <div className="space-y-6">
          <DistributionRecordsSection skillId={skillId} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

---

## Component API Reference

### Segment Component

```tsx
// Root wrapper - manages state
<Segment 
  defaultValue="basic"           // Initial active value
  value={activeTab}              // Controlled value
  onValueChange={setActiveTab}   // Change handler
  className="..."                // Additional CSS classes
/>

// Tab list container
<SegmentList className="..." />

// Individual tab trigger
<SegmentItem 
  value="basic"      // Unique identifier
  disabled={false}   // Optional: disable state
  className="..."    // Additional CSS classes
>
  基础配置
</SegmentItem>

// Content container (paired with value)
<SegmentContent 
  value="basic"
  className="..." 
>
  Content goes here
</SegmentContent>

// Independent group (for manual state management)
<SegmentGroup className="..." />

// Independent option
<SegmentOption 
  active={true}                    // Required for styling
  onClick={() => setMode('all')}   // Click handler
  disabled={false}                 // Optional: disable state
  className="..."                  // Additional CSS classes
>
  全部
</SegmentOption>
```

### Tabs Component

```tsx
// Root wrapper
<Tabs
  defaultValue="tab1"              // Initial active tab
  value={activeTab}                // Controlled value
  onValueChange={setActiveTab}     // Change handler
  orientation="horizontal"         // or "vertical"
  className="..."                  // Additional CSS classes
/>

// Tab list (similar to TabBar)
<TabsList className="..." />

// Individual tab trigger
<TabsTrigger 
  value="tab1"       // Unique identifier
  disabled={false}   // Optional: disable state
  className="..."    // Additional CSS classes
>
  Tab 1
</TabsTrigger>

// Content panel
<TabsContent 
  value="tab1"
  className="..."
>
  Content for Tab 1
</TabsContent>
```

---

## Styling Guide

### Default Colors and Spacing

```css
/* Container */
background: #f3f3f4;
border-radius: 6px;
padding: 3px;
height: 36px;

/* Items */
padding: 4px 16px;
border-radius: 4px;
font-size: 14px;

/* States */
Active: white bg, #020617 text, semibold
Inactive: #7b818f text, normal weight
Hover: #4b5563 text
Disabled: #d3d6db text
Focus: 3px ring @ #355EF1/20
```

### Custom Styling Example

```tsx
// Override default styles
<SegmentGroup className="bg-blue-100 rounded-lg">
  <SegmentOption 
    active={active} 
    className="px-6 py-2 text-base font-bold"
  >
    Custom Styled Option
  </SegmentOption>
</SegmentGroup>
```

---

## Best Practices

### 1. Choose the Right Component

- **SegmentGroup + SegmentOption**: Best for simple switches (2-3 options)
- **Segment + SegmentItem + SegmentContent**: Best for 2-4 related sections
- **Tabs + TabsTrigger + TabsContent**: Best for traditional tab navigation

### 2. Accessibility

```tsx
// Always provide meaningful labels
<SegmentGroup aria-label="选择查看模式">
  <SegmentOption role="tab" aria-selected={active}>
    选项
  </SegmentOption>
</SegmentGroup>

// Use aria-label for icon-only buttons
<SegmentOption aria-label="卡片视图">
  <CardIcon />
</SegmentOption>
```

### 3. Keyboard Navigation

- All components support keyboard navigation by default
- Tab through options, Enter/Space to select
- Ensure focus indicators are visible

### 4. Content Updates

```tsx
// Use debouncing for expensive operations
import { debounce } from 'lodash-es';

const handleTabChange = debounce((value) => {
  // Fetch data or perform expensive operations
  loadTabContent(value);
}, 300);

<Tabs onValueChange={handleTabChange} />
```

---

## Common Issues & Solutions

### Issue 1: Content flashing on tab change

**Solution:** Use `TabsContent` instead of conditional rendering
```tsx
// Bad ❌
{activeTab === 'contract' && <ContractContent />}

// Good ✅
<TabsContent value="contract"><ContractContent /></TabsContent>
```

### Issue 2: Controlled vs Uncontrolled

**Solution:** Either use `defaultValue` OR both `value` + `onValueChange`
```tsx
// Uncontrolled (use this if you don't need to control from outside)
<Segment defaultValue="contract" />

// Controlled (use this if you need to manage state externally)
<Segment value={tab} onValueChange={setTab} />
```

### Issue 3: Styling not applying

**Solution:** Check if you're using className correctly
```tsx
// Make sure to import and use with the component
import { SegmentGroup } from '@/components/ui/segment';

<SegmentGroup className="my-custom-class" />
```

---

## File Locations Summary

| Component | File | Exports |
|-----------|------|---------|
| **Segment** | `components/ui/segment.tsx` | Segment, SegmentList, SegmentItem, SegmentContent, SegmentGroup, SegmentOption |
| **Tabs** | `components/ui/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| **ViewModeSegmented** | `components/agent/ViewModeSegmented.tsx` | ViewModeSegmented |

---

## Testing Checklist

```tsx
// Test controlled component
<Segment value={tab} onValueChange={setTab}>
  {/* ... */}
</Segment>

// Test with different tab counts
<Tabs>
  <TabsList>
    <TabsTrigger>Tab 1</TabsTrigger>
    <TabsTrigger>Tab 2</TabsTrigger>
    <TabsTrigger>Tab 3</TabsTrigger>
    <TabsTrigger>Tab 4</TabsTrigger>
  </TabsList>
</Tabs>

// Test disabled state
<SegmentOption active={false} disabled>
  Disabled Option
</SegmentOption>

// Test keyboard navigation
// - Press Tab to focus
// - Press Left/Right arrow to navigate
// - Press Enter/Space to select
```

---

**Last Updated:** 2026-05-21
**Scope:** OpenClaw Enterprise Frontend
**Framework:** React + TypeScript + Tailwind CSS
