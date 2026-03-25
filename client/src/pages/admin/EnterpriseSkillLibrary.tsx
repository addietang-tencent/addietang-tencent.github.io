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
  const [cosEnabled, setCosEnabled] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('skills');

  const handleEnableCOS = () => {
    setCosEnabled(true);
    setEnableDialogOpen(false);
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
                了解详情
              </a>
            </p>
          </div>
        </div>

        {/* 开启按钮 */}
        <Button
          onClick={() => setEnableDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          开启 COS 对象存储服务
        </Button>

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
      {/* 第二层 Tab 始终显示 */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveSubTab('skills');
            setSelectedSkillId(null);
            if (onSelectSkill) onSelectSkill('');
          }}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeSubTab === 'skills'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Skill 列表
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeSubTab === 'categories'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          分类管理
        </button>
        <button
          onClick={() => setActiveSubTab('bucket')}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeSubTab === 'bucket'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          存储桶管理
        </button>
      </div>

      {/* 内容区域 */}
      <div>
        {activeSubTab === 'skills' && (
          <>
            {selectedSkillId ? (
              <SkillDetail
                skillId={selectedSkillId}
                onBack={() => {
                  setSelectedSkillId(null);
                  if (onSelectSkill) onSelectSkill('');
                }}
              />
            ) : (
              <SkillListTab onSelectSkill={onSelectSkill || setSelectedSkillId} />
            )}
          </>
        )}
        {activeSubTab === 'categories' && <CategoryManagementTab />}
        {activeSubTab === 'bucket' && <BucketManagementTab />}
      </div>

      <EnableCOSDialog
        open={enableDialogOpen}
        onOpenChange={setEnableDialogOpen}
        onConfirm={handleEnableCOS}
      />
    </div>
  );
}
