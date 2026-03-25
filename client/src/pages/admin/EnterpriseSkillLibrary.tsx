import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import SkillListTab from './SkillLibrary/SkillListTab';
import CategoryManagementTab from './SkillLibrary/CategoryManagementTab';
import BucketManagementTab from './SkillLibrary/BucketManagementTab';
import EnableCOSDialog from './SkillLibrary/EnableCOSDialog';

export default function EnterpriseSkillLibrary() {
  const [cosEnabled, setCosEnabled] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);

  const handleEnableCOS = () => {
    setCosEnabled(true);
    setEnableDialogOpen(false);
  };

  if (!cosEnabled) {
    return (
      <div className="space-y-6">
        {/* 标题和说明 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">企业技能库</h2>
          <p className="text-sm text-gray-600">上传和管理企业内部私有技能，可用于初始技能包配置和用户端技能安装</p>
        </div>

        {/* 提示区域 */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">企业专属 Skill 库需要开启 COS 对象存储服务</p>
            <p className="text-xs text-amber-700 mt-2">
              开启后，将会在您的账号下的 广州 地域创建一个存储桶用于存放上传的 Skill 文件，更安全可控；会根据实际使用收取存储费和上传下载流量费。
              <a href="https://buy.cloud.tencent.com/price/cos/overview" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline ml-1 hover:text-amber-900">
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
                  支持企业自定义 Skill 压缩包上传与版本控制，构建企业私有技能仓库，确保核心资产仅限内部调用
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和说明 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">企业技能库</h2>
        <p className="text-sm text-gray-600">上传和管理企业内部私有技能，可用于初始技能包配置和用户端技能安装</p>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="skills">Skill 列表</TabsTrigger>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
          <TabsTrigger value="bucket">存储桶管理</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillListTab />
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
