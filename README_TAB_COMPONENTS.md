# Tab & Segment Components Documentation

Complete documentation for tab and segment switching components in the OpenClaw Enterprise codebase.

**Date**: 2026-05-21  
**Codebase**: `/Users/addietang/Documents/cvm/openclaw-enterprise`

## 📚 Documentation Files

This directory contains comprehensive documentation for tab/segment components:

### 1. **QUICK_TAB_REFERENCE.md** ⚡ START HERE
- **Purpose**: Quick lookup and decision guide
- **Best for**: Developers who need to pick a component fast
- **Time to read**: 5-10 minutes
- **Contents**:
  - 30-second decision tree
  - Component quick specs
  - Real usage examples
  - Implementation checklists
  - Design tokens reference
  - Common patterns
  - Accessibility guide

### 2. **TAB_COMPONENT_ANALYSIS.md** 📊
- **Purpose**: Comprehensive analysis of all tab components
- **Best for**: Understanding component differences and design system integration
- **Time to read**: 15-20 minutes
- **Contents**:
  - Executive summary
  - Segment component deep dive
  - Tabs component analysis
  - ViewModeSegmented component
  - Search results and file locations
  - Design system integration
  - Comparison table
  - Recommendations
  - Directory structure overview

### 3. **TAB_COMPONENT_CODE_REFERENCE.md** 💻
- **Purpose**: Complete API reference with code examples
- **Best for**: Implementation and troubleshooting
- **Time to read**: 20-30 minutes
- **Contents**:
  - Example 1: Basic SegmentGroup
  - Example 2: Controlled Segment
  - Example 3: Standard Tabs
  - Example 4: Real usage (PluginListTab)
  - Example 5: Rich content (SkillDetail)
  - Complete API reference for all components
  - Styling guide with colors and spacing
  - Best practices
  - Common issues and solutions
  - Testing checklist

### 4. **IMPLEMENT_CONTRACT_TEMPLATE_TABS.md** 🛠️
- **Purpose**: Step-by-step implementation guide for contract/template tabs
- **Best for**: Implementing new tabbed features
- **Time to read**: 25-35 minutes
- **Contents**:
  - Quick start options (3 approaches)
  - Step-by-step integration guide
  - Complete component implementation
  - Navigation configuration
  - Router setup
  - Component comparison table
  - Styling customization
  - Accessibility features
  - Error handling
  - Performance optimization
  - Testing examples
  - Common issues & solutions
  - Next steps checklist

### 5. **COMPONENT_VISUAL_GUIDE.md** 🎨
- **Purpose**: Visual reference and styling guide
- **Best for**: Understanding visual appearance and styling options
- **Time to read**: 15-20 minutes
- **Contents**:
  - Component hierarchy diagram
  - Visual rendering of each style
  - Full directory tree
  - Import paths
  - Usage map (which files use what)
  - Selection guide
  - Styling tokens reference
  - Quick navigation table
  - Pro tips
  - FAQ
  - Figma reference (if applicable)

### 6. **README_TAB_COMPONENTS.md** (This File)
- **Purpose**: Master index and navigation guide
- **Best for**: Orienting yourself and finding the right resource

---

## 🚀 Getting Started

### I need to quickly pick a component (5 minutes)
→ Read **QUICK_TAB_REFERENCE.md** - Decision tree at the top

### I'm implementing a new feature with tabs (30 minutes)
→ Follow **IMPLEMENT_CONTRACT_TEMPLATE_TABS.md** - Full walkthrough with code examples

### I want to understand the components deeply (45 minutes)
→ Read in this order:
1. TAB_COMPONENT_ANALYSIS.md (overview)
2. TAB_COMPONENT_CODE_REFERENCE.md (API and examples)
3. COMPONENT_VISUAL_GUIDE.md (styling and visuals)

### I need to troubleshoot an issue (10-15 minutes)
→ Check these sections in order:
1. QUICK_TAB_REFERENCE.md - Common Patterns section
2. TAB_COMPONENT_CODE_REFERENCE.md - Common Issues & Solutions
3. IMPLEMENT_CONTRACT_TEMPLATE_TABS.md - Common Issues & Solutions table

### I want to check the code directly
→ See section "File Locations" in **QUICK_TAB_REFERENCE.md**

---

## 📋 Three Main Components

### Segment ✨ (Recommended for modern UIs)
```tsx
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

<Segment defaultValue="tab1">
  <SegmentList>
    <SegmentItem value="tab1">Tab 1</SegmentItem>
  </SegmentList>
  <SegmentContent value="tab1">Content</SegmentContent>
</Segment>
```
- **Active style**: Dark text on white background
- **State**: Built-in (Radix UI managed)
- **File**: `/client/src/components/ui/segment.tsx` (164 lines)
- **Used in**: PluginListTab, SkillListTab

### Tabs 📑 (Traditional blue style)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs value={active} onValueChange={setActive}>
  <TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```
- **Active style**: Blue accent with shadow
- **State**: Manually controlled
- **File**: `/client/src/components/ui/tabs.tsx` (65 lines)
- **Used in**: SkillDetail, EnterpriseSkillLibrary

### SegmentGroup 🎛️ (Manual control)
```tsx
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';

<SegmentGroup>
  <SegmentOption active={mode === 'a'} onClick={() => setMode('a')}>Option A</SegmentOption>
</SegmentGroup>
```
- **Active style**: Same as Segment (dark)
- **State**: Fully manual (you control it)
- **File**: `/client/src/components/ui/segment.tsx` (lines 80-164)
- **Used in**: PluginListTab view mode switching

---

## 🎯 Quick Decision Guide

**Use SEGMENT when:**
- ✅ You want modern dark styling (black text on light background)
- ✅ You need built-in state management
- ✅ You want automatic content switching
- ✅ You're building an admin or modern UI

**Use TABS when:**
- ✅ You want blue accent styling
- ✅ You're familiar with traditional tab interfaces
- ✅ You want explicit state control
- ✅ You need a more traditional appearance

**Use SEGMENTGROUP when:**
- ✅ You need complete control over styling and behavior
- ✅ You're building a view mode switcher (card/list)
- ✅ You want to manually handle state
- ✅ You need complex interactions

---

## 🔍 Real Examples in Codebase

### Example 1: PluginListTab.tsx (View Mode Switching)
Located at: `/client/src/pages/admin/SkillLibrary/PluginListTab.tsx` (lines 282-289)
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

### Example 2: SkillDetail.tsx (Tabs with Hidden TabsList)
Located at: `/client/src/pages/admin/SkillLibrary/SkillDetail.tsx` (lines 824-1149)
- Uses standard Tabs component with TabsContent
- TabsList is hidden with `className="hidden"`
- Custom segment controls used for tab switching

### Example 3: EnterpriseSkillLibrary.tsx (Simple Tabs)
Located at: `/client/src/pages/admin/EnterpriseSkillLibrary.tsx`
```tsx
<Tabs defaultValue="skills">
  <TabsList className="grid w-full grid-cols-2 mb-6">
    <TabsTrigger value="skills">Skill 列表</TabsTrigger>
    <TabsTrigger value="categories">分类管理</TabsTrigger>
  </TabsList>
  <TabsContent value="skills"><SkillListTab /></TabsContent>
  <TabsContent value="categories"><CategoryManagementTab /></TabsContent>
</Tabs>
```

---

## 🎨 Design Tokens

### Active States
- **Segment**: `#020617` text on `#ffffff` background
- **Tabs**: `#355EF1` text on `#ffffff` background + shadow

### Inactive States
- **Text**: `#7b818f` (gray)
- **Background**: `#f3f3f4` (light gray)

### Dimensions
- **Height**: 36px
- **Border radius**: 4px or 6px
- **Padding**: 2px 8px (items), 3px (container)

For complete design tokens, see **COMPONENT_VISUAL_GUIDE.md**

---

## 📦 Files Included

```
/Users/addietang/Documents/cvm/openclaw-enterprise/
├── README_TAB_COMPONENTS.md (this file)
├── QUICK_TAB_REFERENCE.md
├── TAB_COMPONENT_ANALYSIS.md
├── TAB_COMPONENT_CODE_REFERENCE.md
├── IMPLEMENT_CONTRACT_TEMPLATE_TABS.md
├── COMPONENT_VISUAL_GUIDE.md
└── client/src/components/ui/
    ├── segment.tsx (164 lines)
    ├── tabs.tsx (65 lines)
```

---

## 🔗 Component Dependencies

All components are built on:
- **Base**: `@radix-ui/react-tabs` (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Framework**: React 18+ with TypeScript

---

## 💡 Common Implementation Paths

### Path 1: New Admin Page with Tabs (15 minutes)
1. Copy IMPLEMENT_CONTRACT_TEMPLATE_TABS.md Step 1 (Component creation)
2. Replace "合同" and "模版" with your own tab names
3. Add navigation entry in adminNav.ts (5 lines)
4. Add route to router (3 lines)

### Path 2: Add View Mode Switcher (5 minutes)
1. Reference QUICK_TAB_REFERENCE.md "With Icons" pattern
2. Use SegmentGroup for manual state
3. Add click handlers for mode switching

### Path 3: Migrate from HTML to Component (10 minutes)
1. Use QUICK_TAB_REFERENCE.md decision tree
2. Pick Segment or Tabs based on styling needs
3. Follow API reference in TAB_COMPONENT_CODE_REFERENCE.md

### Path 4: Customize Styling (5-10 minutes)
1. Check styling tokens in COMPONENT_VISUAL_GUIDE.md
2. Add Tailwind className overrides
3. Test with real content

---

## ✅ Quality Checklist

Before committing tab component code:
- [ ] Component chosen using decision tree
- [ ] Keyboard navigation tested (Tab, Arrow keys)
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Styling verified against design tokens
- [ ] Content switches correctly
- [ ] Error states handled
- [ ] Loading states handled (if async)
- [ ] Mobile responsive tested
- [ ] Unit tests pass
- [ ] Documentation updated

---

## 🤝 Support & Questions

### Quick Questions?
→ Check QUICK_TAB_REFERENCE.md sections in order:
1. Common Patterns
2. Common Issues
3. Accessibility

### Implementation Help?
→ Follow IMPLEMENT_CONTRACT_TEMPLATE_TABS.md step by step

### API Reference Needed?
→ Go to TAB_COMPONENT_CODE_REFERENCE.md

### Visual Reference?
→ See COMPONENT_VISUAL_GUIDE.md

### Deep Dive?
→ Read TAB_COMPONENT_ANALYSIS.md

---

## 📅 Documentation Updates

- **Created**: 2026-05-21
- **Components analyzed**: Segment, Tabs, SegmentGroup, ViewModeSegmented
- **Examples included**: 5+ real-world implementations
- **Test coverage**: Keyboard, screen reader, mobile
- **Radix UI version**: Latest (tab primitives)
- **TypeScript version**: 5.0+

---

## 🚀 Next Steps

1. **Read QUICK_TAB_REFERENCE.md** (5 minutes)
2. **Pick your component** using the decision tree
3. **Find your use case** in the documentation
4. **Copy the example** that matches your needs
5. **Implement** following the step-by-step guides
6. **Test** using the checklist provided
7. **Reference** as needed for styling and API details

---

**Happy coding! 🎉**

For the fastest path forward, start with **QUICK_TAB_REFERENCE.md**.

