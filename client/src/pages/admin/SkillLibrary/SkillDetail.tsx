import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { MOCK_SKILLS, DEFAULT_CATEGORIES } from './mockData';
import BatchDistributeDialog from './BatchDistributeDialog';

interface SkillDetailProps {
  skillId: string;
  onBack: () => void;
}

export default function SkillDetail({ skillId, onBack }: SkillDetailProps) {
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const skill = MOCK_SKILLS.find(s => s.id === skillId);

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">技能未找到</p>
        <Button onClick={onBack} className="mt-4">返回列表</Button>
      </div>
    );
  }

  const getCategoryName = (catId: string) => {
    return DEFAULT_CATEGORIES.find((cat: any) => cat.id === catId)?.name || catId;
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      {/* 技能基本信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{skill.name}</h1>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                v{skill.version}
              </span>
              <div className="flex gap-1">
                {skill.categories.map((catId: string) => (
                  <span
                    key={catId}
                    className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">上传时间</p>
            <p className="text-sm font-semibold text-gray-900">
              {skill.uploadTime.toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{skill.description}</p>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={() => setDistributeDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            批量下发
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            下载 ZIP 包
          </Button>
        </div>
      </div>

      {/* 概述部分 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">概述</h2>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 whitespace-pre-wrap">{skill.content}</p>
        </div>
      </div>

      {/* 文件列表部分 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">文件列表</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">SKILL.md</span>
            <Button variant="outline" size="sm">预览</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">README.md</span>
            <Button variant="outline" size="sm">预览</Button>
          </div>
        </div>
      </div>

      {/* 下发记录部分 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">下发记录</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">还没有下发记录</p>
        </div>
      </div>

      <BatchDistributeDialog
        open={distributeDialogOpen}
        onOpenChange={setDistributeDialogOpen}
        skillName={skill.name}
      />
    </div>
  );
}
