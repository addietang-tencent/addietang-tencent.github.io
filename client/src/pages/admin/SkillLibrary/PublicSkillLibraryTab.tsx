/**
 * 公共技能库 Tab —— 外壳容器
 *
 * 职责：在「公共技能库」一级 Tab 下，提供二级 Tab 切换器：
 *  - 公共技能（PublicSkillTab）：原有单 Skill 列表（零行为变更）
 *  - 公共技能包（PublicSkillPackageTab）：新增的 Skill 组合模板浏览
 *
 * 设计说明：
 * - 二级 Tab 视觉风格与「企业技能库」(EnterpriseSkillLibrary) 的二级 Tab 保持一致：
 *   `grid w-full grid-cols-2 bg-gray-50` —— 灰底容器 + 等宽两栏 + active 时白底蓝字
 * - 两个子 Tab 各自维护内部状态（搜索、分类、收藏、详情页），互不干扰
 */
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  return (
    <Tabs defaultValue="skill" className="w-full">
      {/* 二级 Tab 切换器 —— 与「企业技能库」二级 Tab 保持完全一致的视觉风格 */}
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50">
        <TabsTrigger value="skill">公共技能</TabsTrigger>
        <TabsTrigger value="package">公共技能包</TabsTrigger>
      </TabsList>

      {/* 公共技能 —— 原有逻辑搬迁，零行为变更 */}
      <TabsContent value="skill">
        <PublicSkillTab packages={packages} onAddSkillToPackage={onAddSkillToPackage} />
      </TabsContent>

      {/* 公共技能包 —— 新增 */}
      <TabsContent value="package">
        <PublicSkillPackageTab />
      </TabsContent>
    </Tabs>
  );
}
