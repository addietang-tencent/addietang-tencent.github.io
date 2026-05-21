# Tab Component Visual & File Guide

## 🎨 Visual Component Hierarchy

```
Tab/Segment Components
├── Segment Component (client/src/components/ui/segment.tsx)
│   ├── Controlled Mode:
│   │   ├── <Segment> - Root wrapper with state management
│   │   ├── <SegmentList> - Container for triggers
│   │   ├── <SegmentItem> - Individual trigger button
│   │   └── <SegmentContent> - Content panels
│   │
│   └── Independent Mode:
│       ├── <SegmentGroup> - Container for options
│       └── <SegmentOption> - Individual option (manual state)
│
├── Tabs Component (client/src/components/ui/tabs.tsx)
│   ├── <Tabs> - Root wrapper
│   ├── <TabsList> - Container for triggers
│   ├── <TabsTrigger> - Individual trigger
│   └── <TabsContent> - Content panels
│
└── ViewModeSegmented (client/src/components/agent/ViewModeSegmented.tsx)
    └── Custom implementation for view switching
```

---

## 📊 Visual Rendering

### Segment Component Style
```
┌─────────────────────────────────────┐
│ Background: #f3f3f4                  │
│ ┌──────────┐  ┌──────────┐          │
│ │  Active  │  │ Inactive │          │
│ │ (White)  │  │ (Gray)   │          │
│ │ #020617  │  │ #7b818f  │          │
│ └──────────┘  └──────────┘          │
│ Height: 36px                        │
│ Radius: 6px                         │
└─────────────────────────────────────┘

Active State:
  - Background: #FFFFFF (white)
  - Text: #020617 (dark black) - Semibold
  - Shadow: 0px 1px 2px rgba(0,0,0,0.05)
  - Radius: 4px

Inactive State:
  - Background: transparent
  - Text: #7b818f (medium gray) - Normal
  - Hover Text: #4b5563 (darker gray)
```

### Tabs Component Style
```
┌─────────────────────────────────────┐
│ Similar to Segment but:              │
│ - Active text is #355EF1 (blue)      │
│ - Focus ring uses #355EF1/20         │
│ - Otherwise identical styling        │
└─────────────────────────────────────┘
```

### ViewModeSegmented Component Style
```
┌─────────────────────────────────────┐
│ Background: #F5F5F5                  │
│ ┌──────────┐  ┌──────────┐          │
│ │ Icon+Txt │  │ Icon+Txt │          │
│ │ (White)  │  │ (Gray)   │          │
│ │ #0A0A0A  │  │ #737373  │          │
│ └──────────┘  └──────────┘          │
│ Padding: 4px 12px per item          │
│ Gap: 4px (between icon and text)    │
└─────────────────────────────────────┘
```

---

## 📁 Full Directory Tree

```
openclaw-enterprise/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   │   ├── segment.tsx          ⭐ PRIMARY TAB COMPONENT
│       │   │   │   ├── export: Segment
│       │   │   │   ├── export: SegmentList
│       │   │   │   ├── export: SegmentItem
│       │   │   │   ├── export: SegmentContent
│       │   │   │   ├── export: SegmentGroup
│       │   │   │   └── export: SegmentOption
│       │   │   ├── tabs.tsx             ⭐ STANDARD TAB COMPONENT
│       │   │   │   ├── export: Tabs
│       │   │   │   ├── export: TabsList
│       │   │   │   ├── export: TabsTrigger
│       │   │   │   └── export: TabsContent
│       │   │   └── ...other UI components
│       │   ├── agent/
│       │   │   ├── ViewModeSegmented.tsx ⭐ CUSTOM VIEW SWITCHER
│       │   │   └── ...other agent components
│       │   ├── topnav/
│       │   │   ├── NotificationPanel.tsx  (uses: Tabs)
│       │   │   ├── HelpPanel.tsx          (uses: Tabs)
│       │   │   └── ...other nav components
│       │   └── ...other components
│       └── pages/
│           ├── admin/
│           │   ├── SkillLibrary/
│           │   │   ├── SkillDetail.tsx        (uses: Tabs)
│           │   │   ├── PluginListTab.tsx      (uses: SegmentGroup)
│           │   │   ├── SkillListTab.tsx       
│           │   │   └── ...skill pages
│           │   ├── EnterpriseSkillLibrary.tsx (uses: Tabs)
│           │   ├── MemberManagement.tsx
│           │   ├── TokensMonitor.tsx
│           │   ├── AgentToolLibrary.tsx
│           │   └── ...admin pages
│           ├── tenant/
│           │   ├── SkillSquare.tsx       (uses: Tabs)
│           │   ├── MyOpenClaw.tsx        (uses: SegmentGroup)
│           │   ├── OpenClawDetail.tsx
│           │   └── ...tenant pages
│           ├── ComponentPreview.tsx      (uses: Tabs - demo)
│           └── ...other pages
│
├── TAB_COMPONENT_ANALYSIS.md            📄 Main analysis report
├── TAB_COMPONENT_CODE_REFERENCE.md      📄 Code examples
├── COMPONENT_VISUAL_GUIDE.md            📄 This file
└── ...other root files
```

---

## 🔗 Import Paths

### Segment Component
```tsx
// All variants from one file
import { 
  Segment, 
  SegmentList, 
  SegmentItem, 
  SegmentContent,
  SegmentGroup,
  SegmentOption 
} from '@/components/ui/segment';
```

### Tabs Component
```tsx
// All variants from one file
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
```

### ViewModeSegmented
```tsx
import { ViewModeSegmented } from '@/components/agent/ViewModeSegmented';
```

---

## 📍 Usage Map

### Component Usage By File

```
SegmentGroup/SegmentOption Usage:
├── PluginListTab.tsx (Line 282-289)
│   └── View mode switching (card/list)
└── MyOpenClaw.tsx (Line ~450+)
    └── Display mode selection

Tabs/TabsList/TabsTrigger Usage:
├── SkillDetail.tsx (Line 824-1149)
│   └── Overview, Files, Distribution tabs
├── SkillSquare.tsx
│   └── Overview, Files, Distribution tabs
├── EnterpriseSkillLibrary.tsx (Line 14-27)
│   └── Skills, Categories tabs
├── NotificationPanel.tsx (components/topnav)
│   └── Notification categories
├── HelpPanel.tsx (components/topnav)
│   └── Help documentation
└── ComponentPreview.tsx
    └── Component demo page

ViewModeSegmented Usage:
└── Used in agent-related pages
    └── Management vs Chat view switching
```

---

## 🎯 Selection Guide

### Choose **SegmentGroup** if:
- ✅ You need a simple 2-4 option switcher
- ✅ You want full control over state management
- ✅ You don't need built-in content switching
- ✅ You prefer minimal dependencies

### Choose **Segment** (Controlled) if:
- ✅ You want Radix UI's managed state
- ✅ You need built-in content switching with SegmentContent
- ✅ You want accessibility features
- ✅ You have 2-4 related sections

### Choose **Tabs** if:
- ✅ You're building traditional tab navigation
- ✅ You need multiple content panels
- ✅ You want standard tab interface patterns
- ✅ You need keyboard navigation support

### Choose **ViewModeSegmented** if:
- ✅ You need icons + text labels
- ✅ You want a custom appearance
- ✅ You're switching between view modes
- ✅ You need different styling than default

---

## 🎨 Styling Tokens Reference

### Colors
```
#f3f3f4  - Default background (light gray)
#F5F5F5  - ViewModeSegmented background
#FFFFFF  - Active item background
#020617  - Active text (Segment)
#355EF1  - Active text (Tabs) / Focus ring
#7b818f  - Inactive text
#4b5563  - Hover text
#d3d6db  - Disabled text
```

### Dimensions
```
Height:        36px (h-9)
Item Height:   calc(100% - 1px)
Item Padding:  4px 16px
Item Radius:   4px
Container Radius: 6px
Container Padding: 3px
```

### Typography
```
Font Size:     14px (text-sm)
Active Weight: semibold (600)
Inactive Weight: normal (400)
```

### Effects
```
Active Shadow:  0px 1px 2px rgba(0,0,0,0.05)
Focus Ring:     3px solid #355EF1/20
Transition:     all (smooth)
```

---

## 🚀 Quick Navigation

| Need | File | Component |
|------|------|-----------|
| Simple toggle | `segment.tsx` | SegmentGroup |
| Tab navigation | `tabs.tsx` | Tabs |
| Auto content | `segment.tsx` | Segment |
| View switching | `ViewModeSegmented.tsx` | ViewModeSegmented |
| Example usage | `PluginListTab.tsx` | SegmentGroup |
| Example usage | `SkillDetail.tsx` | Tabs |
| Example usage | `ComponentPreview.tsx` | Tabs |

---

## 💡 Pro Tips

### Tip 1: Combine with Icons
```tsx
// SegmentGroup works great with icons
<SegmentGroup>
  <SegmentOption active={view === 'grid'}>
    <Grid3x3 className="w-4 h-4" />
  </SegmentOption>
  <SegmentOption active={view === 'list'}>
    <List className="w-4 h-4" />
  </SegmentOption>
</SegmentGroup>
```

### Tip 2: Hide Default TabsList
```tsx
// In SkillDetail.tsx pattern:
<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* Hide default TabsList */}
  <TabsList className="hidden" />
  
  {/* Use your custom segment controls */}
  <CustomSegmentControl />
  
  {/* Keep TabsContent for state management */}
  <TabsContent value="tab1">...</TabsContent>
</Tabs>
```

### Tip 3: Responsive Behavior
```tsx
// Add responsive classes
<SegmentGroup className="hidden md:inline-flex">
  {/* Only show on medium screens and up */}
</SegmentGroup>
```

### Tip 4: Custom Styling
```tsx
// Override any style using className
<SegmentOption 
  className="px-6 py-2 text-lg font-bold"
  active={active}
>
  Custom
</SegmentOption>
```

---

## 📚 Related Documentation Files

- **TAB_COMPONENT_ANALYSIS.md** - Detailed analysis & comparisons
- **TAB_COMPONENT_CODE_REFERENCE.md** - Code examples & API reference
- **COMPONENT_VISUAL_GUIDE.md** - This file (visual & structural overview)

---

## ❓ FAQ

**Q: Where are the tab components?**
A: `/client/src/components/ui/segment.tsx` and `/client/src/components/ui/tabs.tsx`

**Q: Can I use tabs with "合同" and "模版"?**
A: Yes! The components don't have built-in text, so you can use any language.

**Q: Which should I use for a contract/template switcher?**
A: Use `SegmentGroup + SegmentOption` for a simple switcher or `Segment + SegmentItem` for auto content switching.

**Q: Are these components accessible?**
A: Yes, all components use ARIA attributes and support keyboard navigation.

**Q: Can I style them differently?**
A: Yes, use the `className` prop to override styles with Tailwind CSS.

---

**Last Updated:** 2026-05-21
**Framework:** React + TypeScript + Radix UI + Tailwind CSS
