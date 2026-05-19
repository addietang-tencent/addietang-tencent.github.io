import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SkillListTab from './SkillLibrary/SkillListTab';
import CategoryManagementTab from './SkillLibrary/CategoryManagementTab';

interface EnterpriseSkillLibraryProps {
  securityServiceActive?: boolean;
}

export default function EnterpriseSkillLibrary({ securityServiceActive }: EnterpriseSkillLibraryProps) {
  return (
    <div className="page-enter">

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50">
          <TabsTrigger value="skills">Skill 列表</TabsTrigger>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillListTab securityServiceActive={securityServiceActive} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagementTab />
        </TabsContent>
      </Tabs>


    </div>
  );
}
