/**
 * 公共技能库 Tab —— 外壳容器
 *
 * 职责：在「公共技能库」一级 Tab 下，提供二级 Tab 切换器：
 *  - 公共技能（PublicSkillTab）：原有单 Skill 列表（零行为变更）
 *  - 公共技能包（PublicSkillPackageTab）：新增的 Skill 组合模板浏览
 *
 * 设计说明：
 * - 二级 Tab 使用项目标准 SegmentGroup / SegmentOption（白底滑块 + 黑色文字 active）
 * - 两个子 Tab 各自维护内部状态（搜索、分类、收藏、详情页），互不干扰
 */
import { useState } from 'react';
import { SegmentGroup, SegmentOption } from '@/components/ui/segment';
import PublicSkillTab from './PublicSkillTab';
import PublicSkillPackageTab from './PublicSkillPackageTab';

interface PublicSkillLibraryTabProps {
  packages: Array<{ id: string; name: string; isActive: boolean }>;
  onAddSkillToPackage: (skillId: string, packageId: string) => void;
}

export default function PublicSkillLibraryTab({
  packages,
  onAddSkillToPackage,
}: PublicSkillLibraryTabProps) {
  const [subTab, setSubTab] = useState<'skill' | 'package'>('skill');

  return (
    <div className="space-y-4">
      <SegmentGroup className="w-full">
        <SegmentOption
          active={subTab === 'skill'}
          onClick={() => setSubTab('skill')}
          className="flex-1"
        >
          公共技能
        </SegmentOption>
        <SegmentOption
          active={subTab === 'package'}
          onClick={() => setSubTab('package')}
          className="flex-1"
        >
          公共技能包
        </SegmentOption>
      </SegmentGroup>

      {subTab === 'skill' && (
        <PublicSkillTab
          packages={packages}
          onAddSkillToPackage={onAddSkillToPackage}
        />
      )}
      {subTab === 'package' && <PublicSkillPackageTab />}
    </div>
  );
}
