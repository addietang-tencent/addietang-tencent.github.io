import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
// import { getSecurityGroup, getSecurityGroupPolicies } from "../../api";
import {
  EGRESS_RULE,
  CSIP_AI_AGENT_NET_RULE,
} from "../constants";
import { setMaxRemoteStorage } from "../Common/tablePanelColumnUtil";
import { requestApi } from "../Common/requestApi";
import CvmSelectComponent from "../Common/CvmSelectComponent";

export default function NetGroupList({
  isGetAllMachinesLoading,
  aiAgentHostList,
  storageGroupData,
  isCVMEnable,
  setIsCVMEnable,
}: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [realAgentHosts, setRealAgentHosts] = useState([] as any);
  const [hostScope, setHostScope] = useState("0");
  const [currentStep, setCurrentStep] = useState("0");
  const [selectedRegion, setSelectedRegion] = useState([] as any);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [changeSecurityGroupModalVisible, setChangeSecurityGroupModalVisible] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState([] as any);
  const [selectedQuuidList, setSelectedQuuidList] = useState([] as any);
  const [tempSelectedQuuidList, setTempSelectedQuuidList] = useState([] as any);
  const [tempSelectedMachines, setTempSelectedMachines] = useState([] as any);
  const [selectHostModalVisible, setSelectHostModalVisible] = useState(false);
  const [groupsDataMap, setGroupsDataMap] = useState({} as any); // {1:{SecurityGroupId:"sg-jzecnxed",SecurityGroupName:''}, 8:{...}}
  const [groupsDataMapInstanceIds, setGroupsDataMapInstanceIds] = useState({} as any); // {1:["ins-089cnfcd", "..."],8:[...]]}
  const [groupRuleListMap, setGroupRuleListMap] = useState({} as any); // {1:[{"PolicyIndex":0,"Port":"ALL","CidrBlock":"10.0.0.0/8","Action":"DROP","PolicyDescription":"阻止内网IP","Protocol":"ALL"}...],8:[...]}
  const [groupRuleListModalVisible, setGroupRuleListModalVisible] = useState(false);
  const [lhGroupsData, setLhGroupsData] = useState({} as any); // {'lhins-***':[Action:'',Port:'']} 已开启的
  const [selectedMachinesModalVisible, setSelectedMachinesModalVisible] = useState(false);

  const delCVMRules = async () => {
    setChangeSecurityGroupModalVisible(false);
    setIsLoading(true);
    const regionIds = Object.keys(groupsDataMap || {});
    if (!regionIds?.length) {
      setIsLoading(false);
      return;
    }
    const res: any = await Promise.all(
      regionIds
        .map(d => [
          requestApi({
            cmd: "DeleteSecurityGroupPolicies",
            data: {
              SecurityGroupId: groupsDataMap[d]?.SecurityGroupId,
              SecurityGroupPolicySet: { Egress: EGRESS_RULE },
            },
            regionId: Number(d),
            serviceType: "vpc",
          }),
          requestApi({
            cmd: "DisassociateSecurityGroups",
            data: {
              InstanceIds: groupsDataMapInstanceIds[d],
              SecurityGroupIds: [groupsDataMap?.[d]?.SecurityGroupId],
            },
            regionId: Number(d),
            serviceType: "cvm",
          }),
        ])
        .flat(2)
    );
    if (res?.some?.((d: { code: number }) => d?.code === 0)) {
      await Promise.all(
        regionIds.map(d =>
          requestApi({
            cmd: "DeleteSecurityGroup",
            data: {
              SecurityGroupId: groupsDataMap[d]?.SecurityGroupId,
            },
            regionId: Number(d),
            serviceType: "vpc",
          })
        )
      );
      setMaxRemoteStorage(
        CSIP_AI_AGENT_NET_RULE,
        JSON.stringify("{}"),
        3650 * 24 * 3600
      );
    }
    const ids = Array.from(
      new Set(realAgentHosts?.map?.((d: any) => d?.RegionInfo?.RegionId) || [])
    );
    getCVMSecurityGroups(ids);
    setIsLoading(false);
  };

  const getCVMSecurityGroups = async (regionIds: any[]) => {
    setIsLoading(true);
    if (!regionIds?.length) {
      setIsLoading(false);
      return;
    }
    console.log(6677, storageGroupData, regionIds);
    if (
      storageGroupData &&
      typeof storageGroupData === "object" &&
      Object.keys(storageGroupData)?.length > 0 &&
      Object.keys(storageGroupData)?.some?.(
        d => storageGroupData[d]?.SecurityGroupId
      )
    ) {
      const regionIdArr = regionIds.filter(
        (d: string | number) => storageGroupData[d]?.SecurityGroupId
      );
      if (regionIdArr?.length) {
        // 查询该安全组是否存在
        const res: any = await Promise.all(
          regionIdArr
            .map((d: string | number) => [
              requestApi({
                cmd: 'DescribeSecurityGroups',
                data: {
                  Filters: [{ Name: 'security-group-id', Values: [storageGroupData[d]?.SecurityGroupId] }],
                  Limit: '1',
                  Offset: '0',
                },
                regionId: Number(d),
                serviceType: 'vpc',
                showInnerTips: false,
              }),
              requestApi({
                cmd: "DescribeInstances",
                data: {
                  Filters: [
                    {
                      Name: "security-group-id",
                      Values: [storageGroupData[d]?.SecurityGroupId],
                    },
                  ],
                  Limit: 100,
                  Offset: 0,
                },
                regionId: Number(d),
                serviceType: "cvm",
                showInnerTips: false,
              }),
              // getSecurityGroupPolicies();
              requestApi({
                cmd: "DescribeSecurityGroupPolicies",
                data: {
                  SecurityGroupId: storageGroupData[d]?.SecurityGroupId,
                },
                regionId: Number(d),
                serviceType: "vpc",
                showInnerTips: false,
              }),
            ])
            .flat(2)
        );
        const realObj =
          regionIdArr.reduce(
            (pre: { [x: string]: any }, cur: string | number, i: number) => {
              if (
                res[i * 3]?.SecurityGroupSet?.[0]
                  ?.SecurityGroupId
              ) {
                pre[cur] = res[i * 3]?.SecurityGroupSet?.[0];
              }
              return pre;
            },
            {}
          ) || {};
        const isEnable =
          realObj &&
          typeof realObj === "object" &&
          Object.keys(realObj)?.length > 0;
        const insObj =
          regionIdArr?.reduce?.(
            (pre: { [x: string]: any }, cur: string | number, i: number) => {
              pre[cur] =
                res[i * 3 + 1]?.InstanceSet?.map?.(
                  (d: { InstanceId: any }) => d?.InstanceId
                ) || [];
              return pre;
            },
            {}
          ) || {};
        const rulesObj =
          regionIdArr?.reduce?.(
            (pre: { [x: string]: any }, cur: string | number, i: number) => {
              pre[cur] =
                res[i * 3 + 2]?.SecurityGroupPolicySet
                  ?.Egress || [];
              return pre;
            },
            {}
          ) || {};
        console.log(6688, res, realObj, insObj, rulesObj);
        setGroupsDataMap(realObj);
        setIsCVMEnable(isEnable);
        setGroupsDataMapInstanceIds(insObj);
        setGroupRuleListMap(rulesObj);
      }
    }
    setIsLoading(false);
  };

  const createGroupAndLinkHosts = async () => {
    setChangeSecurityGroupModalVisible(false);
    if (hostScope === "1" && !selectedMachines?.length) {
      return;
    }
    const regionIds = Array.from(
      new Set(selectedRegion.map((d: any) => d?.RegionId))
    );
    console.log(668899, hostScope, regionIds, selectedMachines);
    if (!regionIds?.length) {
      return;
    }
    try {
      const addRegionIds: any = regionIds?.filter?.(
        d => !Object.keys(groupsDataMap)?.includes?.(String(d))
      );
      console.log(31144, addRegionIds);
      // 创建安全组
      if (addRegionIds?.length) {
        const res: any = await Promise.all(
          addRegionIds.map((d: any) =>
            requestApi({
              cmd: "CreateSecurityGroupWithPolicies",
              data: {
                GroupDescription: "",
                GroupName: `云安全中心AI Agent内网管控安全组`,
                ProjectId: "0",
                SecurityGroupPolicySet: { Ingress: [], Egress: EGRESS_RULE },
                Tags: [],
              },
              regionId: Number(d),
              serviceType: "vpc",
            })
          )
        );
        console.log(30044, res);
        const resObj: any = {
          ...(groupsDataMap || {}),
          ...(res?.reduce?.(
            (pre: any, cur: any, i: any) => {
              if (
                typeof cur?.SecurityGroup === "object" &&
                Object.keys(cur?.SecurityGroup || {})?.length > 0
              ) {
                pre[addRegionIds[i]] = cur?.SecurityGroup || {};
              }
              return pre;
            },
            {}
          ) || {}),
        };
        console.log(30054, resObj);
        if (Object.keys(resObj)?.length) {
          setIsCVMEnable(true);
          await setMaxRemoteStorage(
            CSIP_AI_AGENT_NET_RULE,
            JSON.stringify(resObj),
            3650 * 24 * 3600
          );
        }
        setGroupsDataMap(resObj);
        setGroupRuleListMap(
          regionIds.reduce((pre: any, cur: any) => {
            pre[cur] = EGRESS_RULE;
            return pre;
          }, {})
        );
        // 绑定机器
        await Promise.all(
          regionIds.map(regionId =>
            requestApi({
              cmd: "AssociateSecurityGroups",
              data: {
                InstanceIds: (hostScope === "0"
                  ? realAgentHosts
                  : selectedMachines
                )
                  ?.filter?.(
                    (host: any) =>
                      host?.RegionInfo?.RegionId === Number(regionId)
                  )
                  ?.map?.(
                    (host: any) =>
                      host?.MachineExtraInfo?.InstanceID || host?.InstanceID
                  ),
                SecurityGroupIds: [resObj?.[regionId as any]?.SecurityGroupId],
              },
              regionId: Number(regionId),
              serviceType: "cvm",
            })
          )
        );
        const insObj =
          regionIds.reduce((pre: any, cur: any) => {
            pre[cur] = (hostScope === "0" ? realAgentHosts : selectedMachines)
              ?.filter?.((d: any) => d?.RegionInfo?.RegionId === Number(cur))
              ?.map?.(
                (d: any) => d?.MachineExtraInfo?.InstanceID || d?.InstanceID
              );
            return pre;
          }, {}) || {};
        setGroupsDataMapInstanceIds(insObj);
      } else {
        // 绑定或解绑
        const addHostsMap =
          Object.keys(groupsDataMapInstanceIds)?.reduce?.((pre: any, cur) => {
            const insIds = (
              hostScope === "0" ? realAgentHosts : selectedMachines
            )
              ?.filter?.((d: any) => d?.RegionInfo?.RegionId === Number(cur))
              ?.map?.(
                (d: any) => d?.MachineExtraInfo?.InstanceID || d?.InstanceID
              );
            const addInsIds = insIds?.filter?.(
              (d: any) => !groupsDataMapInstanceIds[cur]?.includes?.(d)
            );
            if (addInsIds?.length) {
              pre[cur] = addInsIds;
            }
            return pre;
          }, {}) || {}; // {1:['ins-*', ''], 8:[]}
        const delHostsMap =
          Object.keys(groupsDataMapInstanceIds)?.reduce?.((pre: any, cur) => {
            const insIds = (
              hostScope === "0" ? realAgentHosts : selectedMachines
            )
              ?.filter?.((d: any) => d?.RegionInfo?.RegionId === Number(cur))
              ?.map?.(
                (d: any) => d?.MachineExtraInfo?.InstanceID || d?.InstanceID
              );
            const delInsIds = groupsDataMapInstanceIds[cur]?.filter?.(
              (d: any) => !insIds?.includes?.(d)
            );
            if (delInsIds?.length) {
              pre[cur] = delInsIds;
            }
            return pre;
          }, {}) || {}; // {1:['ins-*', ''], 8:[]}
        console.log(300887, addHostsMap, delHostsMap);
        if (
          Object.keys(addHostsMap)?.length ||
          Object.keys(delHostsMap)?.length
        ) {
          await Promise.all(
            Object.keys(addHostsMap)
              .map(d =>
                requestApi({
                  cmd: "AssociateSecurityGroups",
                  data: {
                    InstanceIds: addHostsMap[d],
                    SecurityGroupIds: [groupsDataMap?.[d]?.SecurityGroupId],
                  },
                  regionId: Number(d),
                  serviceType: "cvm",
                })
              )
              ?.concat?.(
                Object.keys(delHostsMap).map(d =>
                  requestApi({
                    cmd: "DisassociateSecurityGroups",
                    data: {
                      InstanceIds: delHostsMap[d],
                      SecurityGroupIds: [groupsDataMap?.[d]?.SecurityGroupId],
                    },
                    regionId: Number(d),
                    serviceType: "cvm",
                  })
                )
              )
          );
          setGroupsDataMapInstanceIds(
            (hostScope === "0" ? realAgentHosts : selectedMachines)?.reduce?.(
              (pre: any, cur: any) => {
                const regionId = cur?.RegionInfo?.RegionId;
                pre[regionId] = Array.isArray(pre[regionId])
                  ? pre[regionId]?.concat?.(
                    cur?.MachineExtraInfo?.InstanceID || cur?.InstanceID
                  )
                  : [cur?.MachineExtraInfo?.InstanceID || cur?.InstanceID];
                return pre;
              },
              {}
            ) || {}
          );
        }
      }
      toast.success("操作成功");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (changeSecurityGroupModalVisible) {
      setHostScope("0");
      setCurrentStep("0");
      setSelectedRegion(
        realAgentHosts?.map?.((d: { RegionInfo: any }) => d?.RegionInfo) || []
      );
    }
  }, [changeSecurityGroupModalVisible]);

  useEffect(() => {
    if (!isGetAllMachinesLoading) {
      const realCVMData =
        aiAgentHostList?.filter?.(
          (d: any) =>
            d?.ProtectType === "Flagship" && d?.MachineType === "CVM"
        ) || [];
      const regionIds = Array.from(
        new Set(
          realCVMData?.map?.(
            (d: { RegionInfo: { RegionId: any } }) => d?.RegionInfo?.RegionId
          ) || []
        )
      );
      setHostScope("0");
      setRealAgentHosts(realCVMData);
      setSelectedRegion(
        realCVMData?.map?.((d: { RegionInfo: any }) => d?.RegionInfo) || []
      );
      getCVMSecurityGroups(regionIds);
    }
  }, [isGetAllMachinesLoading]);

  return (
    <div className="csip-AIAgent-netGroup-content">
      <div className={`head-panel ${isCVMEnable ? "open" : "close"}`}>
        <div className={`title-panel ${isCVMEnable ? "open" : "close"}`}>
          <h3 style={{ fontSize: 16 }}>
            <strong>AI Agent内网管控安全组规则</strong>
          </h3>
          <div className="tips">
            开启后，将自动为 AI Agent旗舰版资产添加安全组规则：默认阻止内网访问，防止内网攻击面扩大。
          </div>
          {isCVMEnable ? (
            <div className="switch">
              <Pencil
                className="w-4 h-4"
                onClick={() => setChangeSecurityGroupModalVisible(true)}
                style={{ margin: "2px 0 0 10px", cursor: "pointer" }}
              />
            </div>
          ) : (
            <div className="switch">
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-400 bg-yellow-50"
                style={{ position: "relative", top: -2 }}
              >
                {"未开启，推荐开启"}
              </Badge>
              <Switch
                checked={false}
                onCheckedChange={() => setChangeSecurityGroupModalVisible(true)}
                style={{ marginLeft: 10 }}
              />
            </div>
          )}
        </div>
        <hr style={{ margin: "16px 0" }} />
        <div style={{ fontSize: 13 }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 120px" }}>
              <div style={{ color: "#888" }}>安全组规则</div>
            </div>
            <div style={{ flex: 1 }}>
              {isCVMEnable ? (
                <>
                  内网访问默认阻止（出站规则：
                  <a
                    style={{ color: 'var(--primary)' }}
                    onClick={() => setGroupRuleListModalVisible(true)}
                  >
                    {(
                      Object.keys(groupRuleListMap)?.reduce?.((pre, cur) => {
                        pre = pre.concat?.(
                          groupRuleListMap[cur]?.map?.((d: any) => ({
                            ...d,
                            RegionId: Number(cur),
                            RegionName: aiAgentHostList?.find?.(
                              (d: { RegionInfo: { RegionId: number } }) =>
                                d?.RegionInfo?.RegionId === Number(cur)
                            )?.RegionName,
                          }))
                        );
                        return pre;
                      }, []) || []
                    )?.length || 0}
                  </a>
                  {"）"}
                </>
              ) : (
                "内网访问默认阻止"
              )}
            </div>
            <div style={{ flex: "0 0 120px", paddingTop: 4 }}>
              <div style={{ color: "#888" }}>{"生效资产"}</div>
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              {!isCVMEnable ? (
                "0台"
              ) : (
                <span
                  className={
                    (
                      Object.values(groupsDataMapInstanceIds || {})?.flat?.(
                        2
                      ) || []
                    )?.length
                      ? "text-primary cursor-pointer"
                      : "text-muted-foreground"
                  }
                  onClick={() => setSelectedMachinesModalVisible(true)}
                >
                  {Object.values(groupsDataMapInstanceIds || {})?.flat?.(2)
                    ?.length || 0}{" "}
                  台
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={changeSecurityGroupModalVisible}
        onOpenChange={setChangeSecurityGroupModalVisible}
      >
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              {isCVMEnable
                ? "编辑 AI Agent内网管控安全组 策略"
                : "确认开启 AI Agent内网管控安全组 策略？"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <div style={{ color: "#202020" }}>
              {`${isCVMEnable ? "确认" : "开启"}后，将自动为 AI Agent 旗舰版资产添加安全组规则：默认阻止内网访问，防止内网攻击面扩大。`}
            </div>
            <hr style={{ margin: "20px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                margin: "16px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: currentStep === "0" ? "#0052d9" : "#e6e9ef",
                    color: currentStep === "0" ? "#fff" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  1
                </div>
                <span
                  style={{ color: currentStep === "0" ? "#0052d9" : "#888" }}
                >
                  选择防护资产
                </span>
              </div>
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: "#e6e9ef",
                  alignSelf: "center",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: currentStep === "1" ? "#0052d9" : "#e6e9ef",
                    color: currentStep === "1" ? "#fff" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  2
                </div>
                <span
                  style={{ color: currentStep === "1" ? "#0052d9" : "#888" }}
                >
                  确认安全组策略
                </span>
              </div>
            </div>
            {currentStep === "0" ? (
              <>
                <div
                  className="maliciousRequest-editPolicy"
                  style={{ margin: "25px 0" }}
                >
                  <div className="mg-bt-16">
                    <div className="label-txt">{"选择资产"}</div>
                    <div className="content">
                      <RadioGroup
                        disabled={isLoading}
                        value={hostScope}
                        onValueChange={value => {
                          setHostScope(value);
                          if (value === "1") {
                            setTempSelectedQuuidList(selectedQuuidList);
                            setTempSelectedMachines(selectedMachines);
                            setSelectHostModalVisible(true);
                          } else {
                            setSelectedRegion(
                              realAgentHosts?.map?.(
                                (d: { RegionInfo: any }) => d?.RegionInfo
                              )
                            );
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="scope-all" />
                          <Label htmlFor="scope-all">{`全部AI Agent旗舰版资产`}</Label>
                        </div>
                        <div className="flex items-center space-x-2" onClick={() => {
                          setTempSelectedQuuidList(selectedQuuidList);
                          setTempSelectedMachines(selectedMachines);
                          setSelectHostModalVisible(true);
                        }}>
                          <RadioGroupItem value="1" id="scope-select" />
                          <Label htmlFor="scope-select">
                            <span className="cwp-hover-underline">
                              {"直接选择"}
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                      <div
                        style={{
                          margin: "15px 0 0 ",
                          padding: "15px 16px",
                          borderLeft: "2px solid #0052d9",
                          background: "rgba(227, 236, 255, 0.3)",
                        }}
                      >
                        <span className="text-muted-foreground">
                          {"已选资产："}
                        </span>
                        <span
                          className={
                            (hostScope === "0"
                              ? realAgentHosts
                              : selectedMachines
                            )?.length
                              ? "text-primary cursor-pointer"
                              : "text-muted-foreground"
                          }
                          onClick={() => {
                            if (
                              (hostScope === "0"
                                ? realAgentHosts
                                : selectedMachines
                              )?.length
                            ) {
                              setSelectedMachinesModalVisible(true);
                            }
                          }}
                        >
                          {`${hostScope === "0" ? realAgentHosts?.length || 0 : selectedMachines?.length || 0}个`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#F7F8FB", padding: 20 }}>
                  {hostScope === "1" && !selectedMachines?.length ? (
                    <div style={{ margin: "0 0 12px 0", color: "#202020" }}>
                      {"您当前未选择任何资产，将移除您已有的安全组策略"}
                    </div>
                  ) : (
                    <div style={{ margin: "0 0 12px 0", color: "#202020" }}>
                      {`将为您创建/编辑下述安全组策略：`}
                    </div>
                  )}
                  <div>
                    {Object.keys(groupsDataMap)?.length && Array.from(new Set(selectedRegion.map((d: any) => d?.RegionId)))?.every?.((d: any) =>
                      Object.keys(groupsDataMap)?.includes?.(String(d)),
                    ) ? null : (
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            padding: "12px 15px 15px",
                            border: "1px solid #E6E9EF",
                          }}
                        >
                          <span className="csip-AIAgent-netGroup-tag">
                            <span className="zstack-security-tag-dot" />
                            {"创建安全组："}
                          </span>
                          {Array.from(
                            new Set(
                              selectedRegion.map((d: any) => d?.RegionId)
                            )
                          )?.filter?.(d => !Object.keys(groupsDataMap)?.includes?.(String(d)))?.map?.(d => (
                            <div style={{ margin: "10px 0 0 0" }}>
                              {`云安全中心AI Agent内网管控安全组`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Object.keys(groupsDataMap)?.some?.((d: any) =>
                      Array.from(
                        new Set(
                          selectedRegion.map(
                            (d: { RegionId: any }) => d?.RegionId
                          )
                        )
                      )?.includes?.(Number(d))
                    )
                      ? (Object.keys(groupsDataMap)
                        ?.filter?.((d: any) =>
                          Array.from(
                            new Set(
                              selectedRegion.map(
                                (d: { RegionId: any }) => d?.RegionId
                              )
                            )
                          )?.includes?.(Number(d))
                        )
                        ?.map?.((d: any) => (
                          <div style={{ width: "100%" }}>
                            <div
                              style={{
                                padding: "12px 15px 15px",
                                border: "1px solid #E6E9EF",
                              }}
                            >
                              <span className="csip-AIAgent-netGroup-tag">
                                <span className="zstack-security-tag-dot" />
                                {"编辑安全组（当前已有安全组）："}
                              </span>
                              <div style={{ margin: "10px 0 0 0" }}>
                                {groupsDataMap?.[d]?.SecurityGroupName}
                              </div>
                            </div>
                          </div>
                        )) as any)
                      : null}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div
                  style={{
                    margin: "20px 0 0",
                    padding: 20,
                    background: "#F7F8FB",
                  }}
                >
                  <div style={{ color: "#202020" }}>
                    {`将${hostScope === "1" && !selectedMachines?.length ? "移除" : "创建/编辑"}下述安全组：`}
                  </div>
                  {(hostScope === '1' && !selectedMachines?.length
                    ? Object.keys(groupsDataMap)
                    : Array.from(new Set(selectedRegion.map((d: any) => d?.RegionId)))
                  ).map(d => (
                    <div
                      style={{
                        margin: "10px 0 0",
                        padding: "15px 20px",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          borderLeft: "1px solid #e6e9ef",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="csip-AIAgent-group-name-icon">
                            <div style={{ color: "#888" }}>{"安全组名称"}</div>
                            <div style={{ fontWeight: 600 }}>
                              {`云安全中心AI Agent内网管控安全组`}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ flex: 1, borderLeft: "1px solid #e6e9ef" }}
                        >
                          <div style={{ padding: "12px 0 0 15px" }}>
                            <span style={{ color: "#888" }}>{"规则内容"}</span>
                            <span style={{ margin: "0 0 0 20px" }}>
                              {"出站规则"}
                              <a
                                style={{ margin: "0 0 0 3px", color: 'var(--primary)' }}
                                onClick={() => setGroupRuleListModalVisible(true)}
                              >
                                (
                                {isCVMEnable
                                  ? Object.values(groupRuleListMap)?.flat?.(2)
                                    ?.length || 0
                                  : EGRESS_RULE.length}
                                )
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {currentStep === "0" ? (
              <Button
                disabled={isGetAllMachinesLoading || isLoading}
                onClick={() => {
                  if (!realAgentHosts?.length) {
                    toast.error("暂无AI Agent旗舰版资产");
                    return;
                  }
                  if (!isCVMEnable && hostScope === '1' && !selectedMachines?.length) {
                    toast.error("请至少选择一台OpenClaw");
                    return;
                  }
                  setCurrentStep("1");
                }}
              >
                {"下一步"}
              </Button>
            ) : currentStep === "1" ? (
              <>
                <Button
                  disabled={isGetAllMachinesLoading || isLoading}
                  onClick={() => {
                    if (hostScope === "1" && !selectedMachines?.length) {
                      delCVMRules();
                    } else {
                      createGroupAndLinkHosts();
                    }
                  }}
                >
                  {"保存"}
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep("0")}>
                  {"上一步"}
                </Button>
              </>
            ) : null}
            <Button
              variant="outline"
              onClick={() => setChangeSecurityGroupModalVisible(false)}
            >
              {"取消"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectHostModalVisible}
        onOpenChange={setSelectHostModalVisible}
      >
        <DialogContent className="sm:max-w-[960px]">
          <DialogHeader>
            <DialogTitle>{"选择OpenClaw"}</DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: -15 }}>
            <CvmSelectComponent
              layout="fixed"
              isAllMachineSelectable
              QuuidList={tempSelectedQuuidList}
              setFetchLoading={setFetchLoading}
              onChange={(keys: any, rows: any) =>
                setTempSelectedMachines(rows)
              }
              leftTitle={"选择OpenClaw"}
              showProjectFilter={false}
              isCVM={true}
              isQrcodeSetting={false}
              aiAgentHostList={aiAgentHostList}
              filter={{
                Version: ["Flagship"],
                Quuid: realAgentHosts?.filter?.((d: any) => d?.Quuid)?.map?.((d: any) => d?.Quuid),
              }}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={fetchLoading}
              onClick={() => {
                if (!isCVMEnable && !tempSelectedMachines?.length) {
                  toast.error("请至少选择一台OpenClaw");
                  return;
                }
                const hosts = tempSelectedMachines?.map?.(
                  (d: {
                    InstanceID: any;
                    MachineExtraInfo: { InstanceID: any };
                  }) =>
                    aiAgentHostList?.find?.(
                      (a: { InstanceID: any }) =>
                        a?.InstanceID ===
                        (d?.InstanceID || d?.MachineExtraInfo?.InstanceID)
                    )
                );
                setSelectedRegion(
                  hosts?.map?.((d: { RegionInfo: any }) => d?.RegionInfo)
                );
                setSelectedMachines(hosts);
                setSelectedQuuidList(
                  hosts
                    ?.filter?.((d: { Quuid: any }) => d?.Quuid)
                    ?.map?.((d: { Quuid: any }) => d?.Quuid)
                );
                setSelectHostModalVisible(false);
              }}
            >
              <span>{"保存"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectHostModalVisible(false)}
            >
              <span>{"取消"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={groupRuleListModalVisible}
        onOpenChange={setGroupRuleListModalVisible}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{`安全组规则-出站规则（${!isCVMEnable ? EGRESS_RULE.length : Object.values(groupRuleListMap)?.flat?.(2)?.length || 0}）`}</DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: -5 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>来源</TableHead>
                  <TableHead>协议端口</TableHead>
                  <TableHead>策略</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead>修改时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!isCVMEnable
                  ? EGRESS_RULE
                  : ((Object.keys(groupRuleListMap)?.reduce?.((pre, cur) => {
                    pre = pre.concat?.(
                      groupRuleListMap[cur]?.map?.((d: any) => ({
                        ...d,
                        RegionId: Number(cur),
                        RegionName: aiAgentHostList?.find?.(
                          (d: { RegionInfo: { RegionId: number } }) =>
                            d?.RegionInfo?.RegionId === Number(cur)
                        )?.RegionName,
                      }))
                    );
                    return pre;
                  }, []) || []) as any)
                )?.map?.((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item?.CidrBlock || "--"}</TableCell>
                    <TableCell>{item?.Port || "--"}</TableCell>
                    <TableCell>
                      {item?.Action === "DROP" ? (
                        <Badge variant="destructive">{"拒绝"}</Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">
                          {"允许"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item?.PolicyDescription || "--"}</TableCell>
                    <TableCell>{item?.ModifyTime || "--"}</TableCell>
                  </TableRow>
                ))}
                {!(
                  !isCVMEnable
                    ? EGRESS_RULE
                    : ((Object.keys(groupRuleListMap)?.reduce?.((pre, cur) => {
                      pre = pre.concat?.(groupRuleListMap[cur] || []);
                      return pre;
                    }, []) || []) as any)
                )?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        {"暂无数据"}
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedMachinesModalVisible}
        onOpenChange={setSelectedMachinesModalVisible}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{`已选资产（${(changeSecurityGroupModalVisible
              ? hostScope === "0"
                ? realAgentHosts || []
                : selectedMachines
              : !isCVMEnable
                ? realAgentHosts
                : Object.values(groupsDataMapInstanceIds || {})?.flat?.(2)
            )?.length || 0
              }台）`}</DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: -5 }}>
            <Alert>
              <AlertDescription>
                {
                  "您正在设置动态选择方式，仅展示当前匹配资产，后续资产范围将基于所选内容范围变化而变化。"
                }
              </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OpenClaw 名称</TableHead>
                  {/* <TableHead>IP地址</TableHead> */}
                  <TableHead>资产类型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(changeSecurityGroupModalVisible
                  ? hostScope === "0"
                    ? realAgentHosts || []
                    : selectedMachines || []
                  : !isCVMEnable
                    ? realAgentHosts || []
                    : Object.values(groupsDataMapInstanceIds || {})
                      ?.flat?.(2)
                      ?.map?.(d =>
                        aiAgentHostList?.find?.(
                          (a: { InstanceID: unknown }) => a?.InstanceID === d
                        )
                      )
                )?.map?.((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        {/* <span
                          className="text-sm"
                          title={
                            item?.InstanceID ||
                            item?.MachineExtraInfo?.InstanceID
                          }
                        >
                          {item?.InstanceID ||
                            item?.MachineExtraInfo?.InstanceID ||
                            "-"}
                        </span> */}
                        <div>
                          <span
                            className="text-sm"
                            title={item?.OpenClawName}
                          >
                            {item?.OpenClawName || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div style={{ color: "rgba(0,0,0,0.9)" }}>
                        {"公："}
                        {item?.MachineExtraInfo?.WanIP ||
                          item?.MachineWanIp ||
                          "-"}
                      </div>
                      <div style={{ color: "rgba(0,0,0,0.9)" }}>
                        {"内："}
                        {item?.MachineExtraInfo?.PrivateIP ||
                          item?.MachineIp ||
                          "-"}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <Database
                        className="w-4 h-4 inline-block"
                        style={{ margin: "-3px 3px 0 0" }}
                      />
                      {item?.MachineType === "LH"
                        ? "Lighthouse"
                        : item?.MachineType}
                    </TableCell>
                  </TableRow>
                ))}
                {!(
                  changeSecurityGroupModalVisible
                    ? hostScope === "0"
                      ? realAgentHosts || []
                      : selectedMachines || []
                    : !isCVMEnable
                      ? realAgentHosts || []
                      : Object.values(groupsDataMapInstanceIds || {})
                        ?.flat?.(2)
                        ?.map?.(d =>
                          aiAgentHostList?.find?.(
                            (a: { InstanceID: unknown }) =>
                              a?.InstanceID === d
                          )
                        )
                )?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        {"暂无数据"}
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
