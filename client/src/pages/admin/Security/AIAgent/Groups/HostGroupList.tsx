import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BASH_POLICY, MALICIOUS_POLICY } from '../constants';

import { MaliciousPolicyList } from './MaliciousPolicy/MaliciousPolicyList';
import { BashPolicyList } from './BashPolicy/BashPolicyList';

export default function HostGroupList({
  bashPolicyCount,
  maliciousPolicyCount,
  getInitPolicyCount,
  aiAgentHostList,
  isFromDetail = false,
}: any) {
  const [selectedType, setSelectedType] = useState(BASH_POLICY);

  return (
    <div>
      <div style={{ margin: '10px 0 20px' }}>
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList style={{ marginLeft: 10 }}>
            <TabsTrigger value={BASH_POLICY}>{`命令管控策略（${bashPolicyCount}）`}</TabsTrigger>
            <TabsTrigger value={MALICIOUS_POLICY}>{`IP/DNS管控策略（${maliciousPolicyCount}）`}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {selectedType === BASH_POLICY ? (
        <BashPolicyList
          isFromDetail={isFromDetail}
          hasFlagship={aiAgentHostList?.some?.((d: { ProtectType: string; }) => d?.ProtectType === 'Flagship')}
          getInitPolicyCount={getInitPolicyCount}
          aiAgentHostList={aiAgentHostList}
        />
      ) : (
        <MaliciousPolicyList
          hasFlagship={aiAgentHostList?.some?.((d: { ProtectType: string; }) => d?.ProtectType === 'Flagship')}
          getInitPolicyCount={getInitPolicyCount}
          aiAgentHostList={aiAgentHostList}
        />
      )}
    </div>
  );
}
