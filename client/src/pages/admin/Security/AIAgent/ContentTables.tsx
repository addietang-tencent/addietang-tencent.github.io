import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SurfaceCard } from '@/components/ui/Surface';

import LogsIndex from './Logs/index';
import SecurityGroups from './Groups/index';
import { ASSETS, CONTROL, LOGS, ALARMS, SKILLS } from './constants';
import AgentAssetsList from './Assets/AgentAssetsList';
import AlarmsList from './Alarms/AlarmsList';
import SkillsList from './Skills';

export default function ContentTables({
  tabRef,
  hasTrialNum,
  getInitAlarmCount,
  activeTab,
  setActiveTab,
  machineVersionCount,
  getAllMachines,
  aiAgentHostList,
  setAiAgentHostList,
  setRiskHostCount,
  storageGroupData,
  isUltimateVersion,
  hasFilterAlarm,
  setHasFilterAlarm,
  isHideLogTalkTab,
  rencentScanTime,
  isGetAllMachinesLoading,
  setOpenTrialModalVisible,
  openExposedDetailDrawer,
  openAssetDetail,
  showTrialBtn,
  setSelectedType,
  selectedAgentIds,
  setSelectedAgentIds,
  setOpenProtectModalVisible,
}: any) {
  return (
    <div className="AIAgent-contentTables">
      <Tabs
        ref={tabRef}
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab?.(value);
          setHasFilterAlarm?.(false);
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value={ASSETS}>AI Agent资产</TabsTrigger>
          <TabsTrigger value={CONTROL}>管控配置</TabsTrigger>
          <TabsTrigger value={LOGS}>审计日志</TabsTrigger>
          <TabsTrigger value={SKILLS}>恶意Skills</TabsTrigger>
          <TabsTrigger value={ALARMS}>威胁告警</TabsTrigger>
        </TabsList>

        <SurfaceCard className="overflow-hidden">
            <TabsContent value={ASSETS} forceMount className={activeTab !== ASSETS ? 'hidden' : ''}>
              <AgentAssetsList
                getInitAlarmCount={getInitAlarmCount}
                getAllMachines={getAllMachines}
                aiAgentHostList={aiAgentHostList}
                setAiAgentHostList={setAiAgentHostList}
                setRiskHostCount={setRiskHostCount}
                isGetAllMachinesLoading={isGetAllMachinesLoading}
                openAssetDetail={openAssetDetail}
                storageGroupData={storageGroupData}
                isUltimateVersion={isUltimateVersion}
                hasFilterAlarm={hasFilterAlarm}
                setHasFilterAlarm={setHasFilterAlarm}
                openExposedDetailDrawer={openExposedDetailDrawer}
                rencentScanTime={rencentScanTime}
                setOpenTrialModalVisible={setOpenTrialModalVisible}
                hasTrialNum={hasTrialNum}
                showTrialBtn={showTrialBtn}
                setSelectedType={setSelectedType}
                selectedAgentIds={selectedAgentIds}
                setSelectedAgentIds={setSelectedAgentIds}
                setOpenProtectModalVisible={setOpenProtectModalVisible}
              />
            </TabsContent>
            <TabsContent value={CONTROL}>
              <SecurityGroups
                aiAgentHostList={aiAgentHostList}
                isGetAllMachinesLoading={isGetAllMachinesLoading}
                storageGroupData={storageGroupData}
              />
            </TabsContent>
            <TabsContent value={LOGS}>
              <LogsIndex
                aiAgentHostList={aiAgentHostList}
                isGetAllMachinesLoading={isGetAllMachinesLoading}
                openAssetDetail={openAssetDetail}
                isHideLogTalkTab={isHideLogTalkTab}
              />
            </TabsContent>
            <TabsContent value={SKILLS}>
              <SkillsList
                aiAgentHostList={aiAgentHostList}
                isGetAllMachinesLoading={isGetAllMachinesLoading}
                getAllMachines={getAllMachines}
                openAssetDetail={openAssetDetail}
                rencentScanTime={rencentScanTime}
              />
            </TabsContent>
            <TabsContent value={ALARMS}>
              <AlarmsList
                machineVersionCount={machineVersionCount}
                aiAgentHostList={aiAgentHostList}
                openAssetDetail={openAssetDetail}
              />
            </TabsContent>
        </SurfaceCard>
      </Tabs>
    </div>
  );
}
