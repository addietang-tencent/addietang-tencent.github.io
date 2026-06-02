

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DescribeBashPolicies,
  DescribeRiskDnsPolicyList,
} from "@/pages/admin/Security/api";

import NetGroupList from "./NetGroupList";
import HostGroupList from "./HostGroupList";

const SecurityGroups = ({
  isGetAllMachinesLoading,
  aiAgentHostList,
  storageGroupData,
}: any) => {
  const [bashPolicyCount, setBashPolicyCount] = useState(0);
  const [maliciousPolicyCount, setMaliciousPolicyCount] = useState(0);
  const [isCVMEnable, setIsCVMEnable] = useState(false);

  const getInitPolicyCount = async () => {
    const res: any = await Promise.all([
      DescribeBashPolicies({ Offset: 0, Limit: 1 }),
      DescribeRiskDnsPolicyList({ Offset: 0, Limit: 1 }),
    ]);
    setBashPolicyCount(Math.max((res?.[0]?.TotalCount || 0) - 1, 0));
    setMaliciousPolicyCount(Math.max((res?.[1]?.TotalCount || 0) - 1, 0));
  };

  useEffect(() => {
    getInitPolicyCount();
  }, []);

  return (
    <Tabs defaultValue="net" className="gap-4">
      <TabsList style={{margin:'20px 0 -10px 10px'}}>
        <TabsTrigger value="net">网络管控</TabsTrigger>
        <TabsTrigger value="host">OpenClaw管控</TabsTrigger>
      </TabsList>

      <TabsContent value="net">
        <NetGroupList
          aiAgentHostList={aiAgentHostList}
          isGetAllMachinesLoading={isGetAllMachinesLoading}
          storageGroupData={storageGroupData}
          isCVMEnable={isCVMEnable}
          setIsCVMEnable={setIsCVMEnable}
        />
      </TabsContent>

      <TabsContent value="host">
        <HostGroupList
          bashPolicyCount={bashPolicyCount}
          maliciousPolicyCount={maliciousPolicyCount}
          getInitPolicyCount={getInitPolicyCount}
          aiAgentHostList={aiAgentHostList}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SecurityGroups;
