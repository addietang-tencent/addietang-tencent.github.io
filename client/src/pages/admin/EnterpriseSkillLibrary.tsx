import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillListTab from './SkillLibrary/SkillListTab';
import CategoryManagementTab from './SkillLibrary/CategoryManagementTab';
import SkillDetail from './SkillLibrary/SkillDetail';

interface EnterpriseSkillLibraryProps {
  onSelectSkill?: (skillId: string) => void;
}

export default function EnterpriseSkillLibrary({ onSelectSkill }: EnterpriseSkillLibraryProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // 当返回到列表时，清空 selectedSkillId
  const handleBackFromDetail = () => {
    setSelectedSkillId(null);
  };

  return (
    <div className="page-enter">
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50">
          <TabsTrigger value="skills">Skill 列表</TabsTrigger>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillListTab onSelectSkill={onSelectSkill || setSelectedSkillId} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagementTab />
        </TabsContent>
      </Tabs>


    </div>
  );
}
