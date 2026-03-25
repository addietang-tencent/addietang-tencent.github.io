import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import SkillListTab from './SkillLibrary/SkillListTab';
import CategoryManagementTab from './SkillLibrary/CategoryManagementTab';
import BucketManagementTab from './SkillLibrary/BucketManagementTab';
import EnableCOSDialog from './SkillLibrary/EnableCOSDialog';
import SkillDetail from './SkillLibrary/SkillDetail';

interface EnterpriseSkillLibraryProps {
  onSelectSkill?: (skillId: string) => void;
}

export default function EnterpriseSkillLibrary({ onSelectSkill }: EnterpriseSkillLibraryProps) {
  const [cosEnabled, setCosEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cos_enabled') === 'true';
    }
    return false;
  });
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const handleEnableCOS = () => {
    setCosEnabled(true);
    localStorage.setItem('cos_enabled', 'true');
    setEnableDialogOpen(false);
  };

  // 当返回到列表时，清空 selectedSkillId
  const handleBackFromDetail = () => {
    setSelectedSkillId(null);
  };

  if (!cosEnabled) {
    return (
      <div className="page-enter">
        {/* 提示区域 */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">企业专属 Skill 库需要开启 COS 对象存储服务</p>
            <p className="text-xs text-blue-800 mt-2">
              开启后，将会在您的账号下的 广州 地域创建一个存储桶用于存放上传的 Skill 文件，更安全可控；会根据实际使用收取存储费和上传下载流量费。
              <a href="https://cloud.tencent.com/document/product/436/16871" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline ml-1 hover:text-blue-900">
                计费详情
              </a>
            </p>
          </div>
          <Button
            onClick={() => setEnableDialogOpen(true)}
            className="shrink-0"
          >
            开启 COS 对象存储服务
          </Button>
        </div>

        {/* 卡片区域 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-xl">📤</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">上传企业 Skill</h3>
                <p className="text-sm text-gray-600">
                  支持企业自定义 Skill 压缩包上传与版本控制，构建企业私有技能仓库，确保核心资产仅限内部调用。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-xl">📢</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">批量下发控制</h3>
                <p className="text-sm text-gray-600">
                  支持多个 OpenClaw 批量下发 Skill 列表至 OpenClaw 终端，实现分钟级配置同步
                </p>
              </div>
            </div>
          </div>
        </div>
        <EnableCOSDialog
          open={enableDialogOpen}
          onOpenChange={setEnableDialogOpen}
          onConfirm={handleEnableCOS}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50">
          <TabsTrigger value="skills">Skill 列表</TabsTrigger>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
          <TabsTrigger value="bucket">存储桶管理</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillListTab onSelectSkill={onSelectSkill || setSelectedSkillId} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagementTab />
        </TabsContent>

        <TabsContent value="bucket">
          <BucketManagementTab />
        </TabsContent>
      </Tabs>

      <EnableCOSDialog
        open={enableDialogOpen}
        onOpenChange={setEnableDialogOpen}
        onConfirm={handleEnableCOS}
      />
    </div>
  );
}
