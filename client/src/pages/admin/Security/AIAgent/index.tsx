import React, { useState, useEffect, useRef, useMemo } from 'react';
// import AgentlessVulAssetDetail from '@src/modules/Agentless/VulAsset/AgentlessVulAssetDetail';
import { DescribeBashEventsNew, DescribeRiskDnsEventList, DescribeVersionStatistics } from '@/pages/admin/Security/api';
// import { ECsipVersion } from '@src/constants';

import AIAgentTips from './Tips';
import AIAgentOverview from './Overview';
import ContentTables from './ContentTables';
import { ASSETS } from './constants';
import AssetDetail from './Assets/AssetDetail';

export default function AIAgent({
  hasTrialNum,
  showTipsPanel,
  setShowTipsPanel,
  getAllMachines,
  aiAgentHostList,
  setAiAgentHostList,
  isGetAllMachinesLoading,
  storageGroupData,
  isHideLogTalkTab,
  rencentScanTime,
  setOpenTrialModalVisible,
  showTrialBtn,
  setSelectedType,
  selectedAgentIds,
  setSelectedAgentIds,
  setOpenProtectModalVisible,
}: any) {
  const tabRef = useRef(null);
  const agentlessVulAssetDetailRef = useRef(null);

  // const isUltimateVersion = useMemo(() => csipUserInfo?.version === ECsipVersion.Ultimate, [csipUserInfo?.version]);
  const isUltimateVersion = false;

  const [activeTab, setActiveTab] = useState(ASSETS);
  const [hasFilterAlarm, setHasFilterAlarm] = useState(false);
  const [riskHostCount, setRiskHostCount] = useState(0);

  const [bashAlarmsCount, setBashAlarmsCount] = useState(0);
  const [maliciousAlarmsCount, setMaliciousAlarmsCount] = useState(0);
  const [machineVersionCount, setMachineVersionCount] = useState({} as any);
  const [selectedAssetItem, setSelectedAssetItem] = useState({} as any);
  const [assetDetailDrawerVisible, setAssetDetailDrawerVisible] = useState(false);

  const getInitAlarmCount = async (hosts = aiAgentHostList) => {
    if (!hosts?.length) {
      return;
    }
    const res: any = await Promise.all([
      DescribeVersionStatistics(),
      DescribeBashEventsNew({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: 'Status', Values: ['0'] },
          { Name: 'InstanceID', Values: hosts?.map?.((d: { InstanceID: any; }) => d.InstanceID) },
        ],
      }),
      DescribeRiskDnsEventList({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: 'HandleStatus', Values: ['0'] },
          { Name: 'InstanceID', Values: hosts?.map?.((d: { InstanceID: any; }) => d.InstanceID) },
        ],
      }),
    ]);
    setMachineVersionCount(res?.[0] || {});
    setBashAlarmsCount(res?.[1]?.TotalCount || 0);
    setMaliciousAlarmsCount(res?.[2]?.TotalCount || 0);
  };

  useEffect(() => {
    if (!isGetAllMachinesLoading) {
      getInitAlarmCount(aiAgentHostList);
    }
  }, [isGetAllMachinesLoading]);

  return (
    <div className="flex flex-col gap-[20px]">
      <AIAgentTips showTipsPanel={showTipsPanel} setShowTipsPanel={setShowTipsPanel} />
      <AIAgentOverview
        tabRef={tabRef}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasFilterAlarm={hasFilterAlarm}
        setHasFilterAlarm={setHasFilterAlarm}
        aiAgentHostList={aiAgentHostList}
        riskHostCount={riskHostCount}
        bashAlarmsCount={bashAlarmsCount}
        maliciousAlarmsCount={maliciousAlarmsCount}
      />
      <ContentTables
        tabRef={tabRef}
        hasTrialNum={hasTrialNum}
        getInitAlarmCount={getInitAlarmCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        machineVersionCount={machineVersionCount}
        getAllMachines={getAllMachines}
        aiAgentHostList={aiAgentHostList}
        setAiAgentHostList={setAiAgentHostList}
        setRiskHostCount={setRiskHostCount}
        storageGroupData={storageGroupData}
        isUltimateVersion={isUltimateVersion}
        hasFilterAlarm={hasFilterAlarm}
        setHasFilterAlarm={setHasFilterAlarm}
        isHideLogTalkTab={isHideLogTalkTab}
        rencentScanTime={rencentScanTime}
        showTrialBtn={showTrialBtn}
        setSelectedType={setSelectedType}
        selectedAgentIds={selectedAgentIds}
        setSelectedAgentIds={setSelectedAgentIds}
        setOpenProtectModalVisible={setOpenProtectModalVisible}
        isGetAllMachinesLoading={isGetAllMachinesLoading}
        setOpenTrialModalVisible={setOpenTrialModalVisible}
        openExposedDetailDrawer={(item: { InstanceID: any; }) => {
          // agentlessVulAssetDetailRef.current?.show?.({
          //   data: {
          //     key: item?.InstanceID,
          //   },
          // });
        }}
        openAssetDetail={(item: any, tabId = undefined, alarmTabId = undefined) => {
          setSelectedAssetItem({ ...(item || {}), tabId, alarmTabId });
          setAssetDetailDrawerVisible(true);
        }}
      />

      {assetDetailDrawerVisible && (
        <AssetDetail
          visible={assetDetailDrawerVisible}
          onClose={() => setAssetDetailDrawerVisible(false)}
          selectedItem={selectedAssetItem}
          aiAgentHostList={aiAgentHostList}
          isGetAllMachinesLoading={isGetAllMachinesLoading}
          machineVersionCount={machineVersionCount}
          isUltimateVersion={isUltimateVersion}
          isHideLogTalkTab={isHideLogTalkTab}
          openExposedDetailDrawer={(item: { InstanceID: any; }) => {
            // agentlessVulAssetDetailRef.current?.show?.({
            //   data: {
            //     key: item?.InstanceID,
            //   },
            // });
          }}
        />
      )}

      {/* <AgentlessVulAssetDetail isFromAiAgent ref={agentlessVulAssetDetailRef} history={history} /> */}
    </div>
  );
}
