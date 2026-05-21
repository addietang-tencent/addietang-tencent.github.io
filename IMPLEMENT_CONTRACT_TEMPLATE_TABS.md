# Implementing Contract/Template Tabs Feature

A practical implementation guide for creating a contract (合同) and template (模版) tabbed interface using existing components.

## Quick Start

### Option 1: Using Segment (Recommended for this feature)

The `Segment` component is ideal for this use case because it has both controlled and independent modes, making it flexible for various implementations.

```tsx
// ContractTemplateManager.tsx
import { useState } from 'react';
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

export default function ContractTemplateManager() {
  return (
    <div className="page-enter">
      <Segment defaultValue="contract">
        <SegmentList>
          <SegmentItem value="contract">合同</SegmentItem>
          <SegmentItem value="template">模版</SegmentItem>
        </SegmentList>

        <SegmentContent value="contract">
          <ContractContent />
        </SegmentContent>

        <SegmentContent value="template">
          <TemplateContent />
        </SegmentContent>
      </Segment>
    </div>
  );
}

function ContractContent() {
  return (
    <div className="mt-6">
      {/* Contract list/management content */}
      <h2 className="text-lg font-semibold">合同管理</h2>
      {/* Add contract listing and management UI here */}
    </div>
  );
}

function TemplateContent() {
  return (
    <div className="mt-6">
      {/* Template list/management content */}
      <h2 className="text-lg font-semibold">模版管理</h2>
      {/* Add template listing and management UI here */}
    </div>
  );
}
```

### Option 2: Using Tabs

If you prefer the standard Tabs component with blue active state:

```tsx
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ContractTemplateManager() {
  const [activeTab, setActiveTab] = useState('contract');

  return (
    <div className="page-enter">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="contract">合同</TabsTrigger>
          <TabsTrigger value="template">模版</TabsTrigger>
        </TabsList>

        <TabsContent value="contract">
          <ContractContent />
        </TabsContent>

        <TabsContent value="template">
          <TemplateContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Option 3: Using Independent SegmentGroup

For maximum control over styling and state management:

```tsx
import { useState } from 'react';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';

export default function ContractTemplateManager() {
  const [mode, setMode] = useState<'contract' | 'template'>('contract');

  return (
    <div className="page-enter">
      <div className="mb-6">
        <SegmentGroup>
          <SegmentOption 
            active={mode === 'contract'} 
            onClick={() => setMode('contract')}
          >
            合同
          </SegmentOption>
          <SegmentOption 
            active={mode === 'template'} 
            onClick={() => setMode('template')}
          >
            模版
          </SegmentOption>
        </SegmentGroup>
      </div>

      <div>
        {mode === 'contract' && <ContractContent />}
        {mode === 'template' && <TemplateContent />}
      </div>
    </div>
  );
}
```

## Step-by-Step Integration

### 1. Create the Page Component

File: `/client/src/pages/admin/ContractTemplateManagement.tsx`

```tsx
import { useState } from 'react';
import { Segment, SegmentList, SegmentItem, SegmentContent } from '@/components/ui/segment';

type TabMode = 'contract' | 'template';

interface ContractItem {
  id: string;
  name: string;
  lastModified: string;
  status: 'active' | 'inactive';
}

interface TemplateItem {
  id: string;
  name: string;
  createdDate: string;
  usageCount: number;
}

export default function ContractTemplateManagement() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  return (
    <div className="page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#020617]">合同与模版管理</h1>
        <p className="text-sm text-[#7b818f] mt-2">
          统一管理企业合同和可复用模版
        </p>
      </div>

      <Segment defaultValue="contract">
        <SegmentList>
          <SegmentItem value="contract">
            合同 ({contracts.length})
          </SegmentItem>
          <SegmentItem value="template">
            模版 ({templates.length})
          </SegmentItem>
        </SegmentList>

        <SegmentContent value="contract" className="mt-6">
          <ContractTab items={contracts} onItemsChange={setContracts} />
        </SegmentContent>

        <SegmentContent value="template" className="mt-6">
          <TemplateTab items={templates} onItemsChange={setTemplates} />
        </SegmentContent>
      </Segment>
    </div>
  );
}

function ContractTab({ 
  items, 
  onItemsChange 
}: { 
  items: ContractItem[], 
  onItemsChange: (items: ContractItem[]) => void 
}) {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">合同列表</h2>
        <button className="px-4 py-2 bg-[#355EF1] text-white rounded-lg hover:bg-[#2447d6]">
          上传合同
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
          <p className="text-[#9ca3af]">暂无合同记录</p>
        </div>
      ) : (
        <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#020617]">
                  合同名称
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#020617]">
                  最后修改
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#020617]">
                  状态
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#020617]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 text-sm text-[#020617]">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7280]">
                    {new Date(item.lastModified).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.status === 'active' 
                        ? 'bg-[#d1f2eb] text-[#065f46]' 
                        : 'bg-[#fee2e2] text-[#7f1d1d]'
                    }`}>
                      {item.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#355EF1] text-sm hover:underline">
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TemplateTab({ 
  items, 
  onItemsChange 
}: { 
  items: TemplateItem[], 
  onItemsChange: (items: TemplateItem[]) => void 
}) {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">模版列表</h2>
        <button className="px-4 py-2 bg-[#355EF1] text-white rounded-lg hover:bg-[#2447d6]">
          创建模版
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
          <p className="text-[#9ca3af]">暂无模版记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border border-[#e5e7eb] rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-[#020617] mb-2">{item.name}</h3>
              <p className="text-xs text-[#6b7280] mb-3">
                创建时间: {new Date(item.createdDate).toLocaleDateString('zh-CN')}
              </p>
              <p className="text-xs text-[#6b7280] mb-4">
                使用次数: {item.usageCount}
              </p>
              <button className="w-full px-3 py-2 border border-[#355EF1] text-[#355EF1] rounded text-sm hover:bg-[#355EF1]/5">
                查看详情
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Update Navigation Configuration

File: `/client/src/config/adminNav.ts`

Add a new entry to your Admin navigation:

```ts
{
  label: "合同与模版",
  href: "/admin/contract-template",
  iconSrc: `${ADMIN_SIDEBAR_ICON_BASE}/contract-template.svg`,
  badge: "new"
}
```

### 3. Update Router

In your routing configuration, add:

```tsx
import ContractTemplateManagement from '@/pages/admin/ContractTemplateManagement';

// Add to your routes
{
  path: '/admin/contract-template',
  element: <ContractTemplateManagement />,
}
```

## Component Comparison for This Use Case

| Aspect | Segment | Tabs | SegmentGroup |
|--------|---------|------|--------------|
| Built-in state | ✅ Yes | ✅ Yes | ❌ Manual |
| Styling | Dark (modern) | Blue accent | Flexible |
| Content switching | ✅ Automatic | ✅ Automatic | ❌ Manual |
| Best for | Modern UI | Traditional tabs | Custom control |
| Recommended | ✅ ✅ ✅ | ✅ ✅ | ⚠️ Complex cases |

**Recommendation: Use Segment (Option 1)** for this feature as it provides:
- Clean, modern appearance matching the admin UI
- Built-in state management
- Automatic content switching
- Consistent with other admin pages

## Styling Customization

### Dark Theme (Segment default)
- Background: `#f3f3f4`
- Active text: `#020617` (dark)
- Active background: white
- Inactive text: `#7b818f` (gray)

### Blue Theme (Tabs)
- Active text: `#355EF1` (blue)
- Active background: white
- Shadow on active: `0px 1px 2px rgba(0,0,0,0.05)`

### Custom Styling

Override with Tailwind classes:

```tsx
<Segment defaultValue="contract" className="custom-segment">
  <SegmentList className="bg-white border border-[#e5e7eb]">
    <SegmentItem value="contract" className="text-blue-600">
      合同
    </SegmentItem>
  </SegmentList>
</Segment>
```

## Accessibility Features

Both components include:
- ✅ ARIA attributes for screen readers
- ✅ Keyboard navigation (arrow keys)
- ✅ Focus indicators
- ✅ Semantic HTML

Test with:
```bash
# Keyboard test
- Tab: Navigate to component
- Left/Right arrows: Switch tabs
- Enter/Space: Activate

# Screen reader test
- VoiceOver (Mac): Cmd+F5
- NVDA (Windows): Insert key
- JAWS: Alt+Insert
```

## Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

async function loadContracts() {
  try {
    const data = await fetchContracts();
    setContracts(data);
  } catch (err) {
    setError('Failed to load contracts. Please try again.');
  }
}

// In render:
{error && (
  <div className="mb-4 p-4 bg-[#fee2e2] text-[#991b1b] rounded-lg">
    {error}
  </div>
)}
```

## Performance Optimization

```tsx
// Lazy load tab content
import { lazy, Suspense } from 'react';

const ContractContent = lazy(() => import('./ContractTab'));
const TemplateContent = lazy(() => import('./TemplateTab'));

function TabContent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {mode === 'contract' ? <ContractContent /> : <TemplateContent />}
    </Suspense>
  );
}
```

## Testing

```tsx
// Example test for tab switching
import { render, screen, fireEvent } from '@testing-library/react';

describe('ContractTemplateManagement', () => {
  it('switches between contract and template tabs', () => {
    render(<ContractTemplateManagement />);
    
    const contractTab = screen.getByRole('tab', { name: /合同/ });
    const templateTab = screen.getByRole('tab', { name: /模版/ });
    
    expect(contractTab).toHaveAttribute('data-state', 'active');
    
    fireEvent.click(templateTab);
    expect(templateTab).toHaveAttribute('data-state', 'active');
  });
});
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Tabs not switching | State not updating | Check `onValueChange` handler |
| Styling doesn't apply | CSS specificity | Use `!important` or higher specificity |
| Content flickers | Lazy loading | Add loading state/skeleton |
| Keyboard not working | ARIA attributes missing | Verify Radix primitives wrapping |

## Next Steps

1. Create `/client/src/pages/admin/ContractTemplateManagement.tsx`
2. Update `/client/src/config/adminNav.ts`
3. Add route to router configuration
4. Implement contract/template fetching logic
5. Add API endpoints for CRUD operations
6. Test keyboard navigation and accessibility
7. Add loading and error states
8. Deploy and monitor

## Related Files & Components

- **Segment Component**: `/client/src/components/ui/segment.tsx`
- **Tabs Component**: `/client/src/components/ui/tabs.tsx`
- **SkillLibrary Reference**: `/client/src/pages/admin/SkillLibrary/SkillDetail.tsx`
- **Example Implementation**: `/client/src/pages/admin/EnterpriseSkillLibrary.tsx`

---

For more details on component APIs, see:
- `TAB_COMPONENT_ANALYSIS.md` - Component comparison
- `TAB_COMPONENT_CODE_REFERENCE.md` - API reference
- `COMPONENT_VISUAL_GUIDE.md` - Visual styling guide
