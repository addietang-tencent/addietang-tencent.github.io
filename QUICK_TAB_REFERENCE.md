# Quick Tab/Segment Component Reference

**Last Updated**: 2026-05-21

## 🎯 Choose Your Component in 30 Seconds

### Question 1: Do you need built-in state management?
- **YES** → Go to Q2
- **NO** → Use **SegmentGroup** (manual state control)

### Question 2: Which visual style fits your design?
- **Modern dark (black text on light gray)** → Use **Segment**
- **Traditional blue accent** → Use **Tabs**

---

## Component Quick Specs

### 🔷 Segment (RECOMMENDED for modern UIs)
```tsx
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

<Segment defaultValue="tab1">
  <SegmentList>
    <SegmentItem value="tab1">Tab 1</SegmentItem>
    <SegmentItem value="tab2">Tab 2</SegmentItem>
  </SegmentList>
  <SegmentContent value="tab1">Content 1</SegmentContent>
  <SegmentContent value="tab2">Content 2</SegmentContent>
</Segment>
```
- **Active Color**: `#020617` (dark) on white bg
- **Inactive Color**: `#7b818f` (gray)
- **Height**: 36px
- **Files**: 
  - `/client/src/components/ui/segment.tsx` (164 lines)
  - Used in: `PluginListTab.tsx`, `SkillListTab.tsx`

### 🔵 Tabs (TRADITIONAL)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```
- **Active Color**: `#355EF1` (blue)
- **Shadow**: `0px 1px 2px rgba(0,0,0,0.05)` on active
- **Height**: 36px
- **Files**:
  - `/client/src/components/ui/tabs.tsx` (65 lines)
  - Used in: `SkillDetail.tsx`, `EnterpriseSkillLibrary.tsx`

### 🎛️ SegmentGroup (FOR MANUAL CONTROL)
```tsx
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';

const [mode, setMode] = useState('option1');

<SegmentGroup>
  <SegmentOption active={mode === 'option1'} onClick={() => setMode('option1')}>
    Option 1
  </SegmentOption>
  <SegmentOption active={mode === 'option2'} onClick={() => setMode('option2')}>
    Option 2
  </SegmentOption>
</SegmentGroup>

// Manual rendering
{mode === 'option1' && <Content1 />}
{mode === 'option2' && <Content2 />}
```
- **Same styling as Segment**
- **Manual state management**
- **Used in**: `PluginListTab.tsx` (view mode switching), `SkillListTab.tsx`

---

## Real Usage Examples from Codebase

### Example 1: SkillDetail.tsx (Tabs with hidden TabsList)
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="hidden">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="files">Files</TabsTrigger>
    <TabsTrigger value="distribution">Distribution</TabsTrigger>
  </TabsList>
  {/* Uses custom segment controls elsewhere */}
  <TabsContent value="overview">{...}</TabsContent>
</Tabs>
```

### Example 2: PluginListTab.tsx (SegmentGroup for view mode)
```tsx
const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

<SegmentGroup>
  <SegmentOption active={viewMode === 'card'} onClick={() => setViewMode('card')}>
    <Grid3x3Icon /> Grid
  </SegmentOption>
  <SegmentOption active={viewMode === 'list'} onClick={() => setViewMode('list')}>
    <ListIcon /> List
  </SegmentOption>
</SegmentGroup>
```

### Example 3: EnterpriseSkillLibrary.tsx (Tabs with TabsList visible)
```tsx
<Tabs defaultValue="skills" className="w-full">
  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50">
    <TabsTrigger value="skills">Skill 列表</TabsTrigger>
    <TabsTrigger value="categories">分类管理</TabsTrigger>
  </TabsList>
  <TabsContent value="skills"><SkillListTab /></TabsContent>
  <TabsContent value="categories"><CategoryManagementTab /></TabsContent>
</Tabs>
```

---

## Implementation Checklist

### For Segment Component:
- [ ] Import `Segment`, `SegmentList`, `SegmentItem`, `SegmentContent`
- [ ] Wrap content in `<Segment defaultValue="...">` 
- [ ] Add `<SegmentList>` with multiple `<SegmentItem>` elements
- [ ] Add `<SegmentContent>` for each tab's content
- [ ] State automatically managed by Radix UI
- [ ] Set `className="mt-6"` on SegmentContent for spacing

### For Tabs Component:
- [ ] Import `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- [ ] Create state: `const [activeTab, setActiveTab] = useState('tab1')`
- [ ] Wrap in `<Tabs value={activeTab} onValueChange={setActiveTab}>`
- [ ] Use `<TabsTrigger value="tabX">` for each trigger
- [ ] Use `<TabsContent value="tabX">` for each content panel
- [ ] Optional: Hide TabsList with `className="hidden"`

### For SegmentGroup:
- [ ] Import `SegmentGroup`, `SegmentOption`
- [ ] Create state: `const [mode, setMode] = useState('option1')`
- [ ] Add `<SegmentOption active={mode === 'X'} onClick={() => setMode('X')}>`
- [ ] Manually render content based on state

---

## Design Tokens Reference

### Colors (from design system)
```
Active Text:       #020617 (Segment) | #355EF1 (Tabs)
Active Background: #ffffff
Inactive Text:     #7b818f
Inactive BG:       #f3f3f4
Container BG:      #f3f3f4
Border:            #e5e7eb
Focus Ring:        #355EF1/20 (3px)
```

### Sizing
```
Height:            36px (h-9)
Padding (list):    3px
Padding (item):    2px 8px
Border Radius:     6px or 4px
Gap:               2px (internal)
```

### Typography
```
Font Size:         14px (text-sm)
Font Weight:       500 (font-medium)
Line Height:       1.5
Letter Spacing:    0.07px
```

---

## Common Patterns

### With Icons
```tsx
<SegmentItem value="grid">
  <Grid3x3Icon className="w-4 h-4" />
  <span>Grid View</span>
</SegmentItem>
```

### With Badge/Count
```tsx
<SegmentItem value="contracts">
  Contracts ({contracts.length})
</SegmentItem>
```

### Disabled State
```tsx
<SegmentItem value="advanced" disabled>
  Advanced (Locked)
</SegmentItem>
```

### Custom Styling
```tsx
<Segment className="bg-white border border-gray-200">
  <SegmentList className="bg-white">
    <SegmentItem className="text-blue-600">Custom</SegmentItem>
  </SegmentList>
</Segment>
```

---

## Accessibility

All components have built-in accessibility:
- ✅ ARIA roles and labels
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Screen reader support
- ✅ Focus indicators (3px ring)

**Testing:**
```bash
# Keyboard navigation
1. Tab into component
2. Left/Right arrows to switch tabs
3. Enter/Space to activate

# Screen readers
- Mac: VoiceOver (Cmd+F5)
- Windows: NVDA or JAWS
```

---

## Performance Tips

1. **Lazy load content** if tabs are heavy:
```tsx
import { lazy, Suspense } from 'react';

const Tab1 = lazy(() => import('./Tab1'));

<Suspense fallback={<LoadingSpinner />}>
  <Tab1 />
</Suspense>
```

2. **Use key prop** for dynamic tabs:
```tsx
{tabs.map((tab) => (
  <SegmentItem key={tab.id} value={tab.id}>{tab.label}</SegmentItem>
))}
```

3. **Memoize content** to prevent re-renders:
```tsx
const MemoTab = React.memo(function TabContent() {
  return <ExpensiveComponent />;
});
```

---

## File Locations

| Component | File Path | Lines | Used In |
|-----------|-----------|-------|---------|
| Segment | `/client/src/components/ui/segment.tsx` | 164 | PluginListTab, SkillListTab |
| Tabs | `/client/src/components/ui/tabs.tsx` | 65 | SkillDetail, EnterpriseSkillLibrary |
| SegmentGroup | `/client/src/components/ui/segment.tsx` | Lines 80-164 | PluginListTab, ViewModeSegmented |
| ViewModeSegmented | `/client/src/components/agent/ViewModeSegmented.tsx` | 52 | Custom view switcher |

---

## Documentation References

- **Detailed Analysis**: See `TAB_COMPONENT_ANALYSIS.md`
- **Full API Reference**: See `TAB_COMPONENT_CODE_REFERENCE.md`
- **Visual Guide**: See `COMPONENT_VISUAL_GUIDE.md`
- **Implementation Guide**: See `IMPLEMENT_CONTRACT_TEMPLATE_TABS.md`

---

## Radix UI Base Libraries

- **Segment/Tabs**: Built on `@radix-ui/react-tabs`
- **Documentation**: https://www.radix-ui.com/docs/primitives/components/tabs

---

## Quick Decision Tree

```
Need tabs?
├─ YES
│  ├─ Built-in state?
│  │  ├─ YES
│  │  │  ├─ Modern dark style?
│  │  │  │  ├─ YES → USE SEGMENT ✅✅✅
│  │  │  │  └─ NO (blue accent needed)
│  │  │  │     └─ USE TABS ✅✅
│  │  │  └─ NO
│  │  │     └─ USE SEGMENT GROUP with manual state ✅
│  │  └─ NO → USE SEGMENT GROUP ✅
│  └─ Custom component needed?
│     └─ USE VIEW MODE SEGMENTED ✅
└─ NO
   └─ Consider ToggleGroup instead
```

---

## Getting Help

1. Check this quick reference first (you're reading it!)
2. Look at real examples in the codebase
3. Read the full documentation files
4. Check `/client/src/components/ui/` for source code
5. Test keyboard navigation and accessibility

**Component paths:**
- Segment & SegmentGroup: `/client/src/components/ui/segment.tsx`
- Tabs: `/client/src/components/ui/tabs.tsx`
- ViewModeSegmented: `/client/src/components/agent/ViewModeSegmented.tsx`

---

Last verified: 2026-05-21
Component versions: Radix UI latest + Tailwind CSS + TypeScript 5+
