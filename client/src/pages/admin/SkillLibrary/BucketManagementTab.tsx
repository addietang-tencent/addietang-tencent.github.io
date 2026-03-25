import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { BucketInfo } from './types';

export default function BucketManagementTab() {
  // 假数据
  const bucketInfo: BucketInfo = {
    name: 'clawpro-skills-1-1251783334',
    region: 'ap-guangzhou',
    storageGB: 2.5,
  };

  const handleTestToggleCOS = () => {
    const currentState = localStorage.getItem('cos_enabled') === 'true';
    localStorage.setItem('cos_enabled', String(!currentState));
    window.location.reload();
  };

  const handleViewDetails = () => {
    const url = `https://console.cloud.tencent.com/cos/bucket?bucket=${bucketInfo.name}&region=${bucketInfo.region}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">存储桶信息</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">存储桶名称</span>
            <span className="text-sm font-semibold text-gray-900">{bucketInfo.name}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">存储量</span>
            <span className="text-sm font-semibold text-gray-900">{bucketInfo.storageGB} GB</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-gray-600">地域</span>
            <span className="text-sm font-semibold text-gray-900">
              {bucketInfo.region === 'ap-guangzhou' ? '广州' : bucketInfo.region}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleViewDetails} className="flex items-center gap-2">
            查看详情
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleTestToggleCOS}
            variant="outline"
            className="text-xs text-gray-500 border-gray-300"
          >
            【测试用按钮，正式环境需要删除】
          </Button>
        </div>
      </div>
    </div>
  );
}
