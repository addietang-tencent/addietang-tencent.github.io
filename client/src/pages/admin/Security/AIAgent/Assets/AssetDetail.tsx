import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import moment from "moment";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Pagination from "@/components/Pagination";
import {
  DescribeBashPolicies,
  DescribeMalWareList,
  DescribeRiskDnsPolicyList,
  DescribeAIAgentSkillList,
  DescribeBashEventsNew,
  DescribeRiskDnsEventList,
} from "@/pages/admin/Security/api";
import {
  FORMAT_NOW,
  NETWORK_OPTIONS_MAP,
  MALICIOUS_ALARM,
  IDENTITY_MODE_MAP,
  EXPOSED_TYPE_MAP,
  MODEL_ICON_MAP,
  MALICIOUS_STATUS_VAL_MAP,
} from "../constants";
import AlarmsList from "../Alarms/AlarmsList";
import { getRuleLevelText } from "../Alarms/AlarmsList";
import SkillsList from "../Skills/index";
import LogsIndex from "../Logs/index";
import HostGroupList from "../Groups/HostGroupList";

const TAB_ITEMS = [
  { id: "summary", label: "资产摘要" },
  // { id: "asset", label: "资产信息" },
  { id: "skills", label: "恶意Skills" },
  { id: "alarms", label: "威胁告警" },
  { id: "logs", label: "审计日志" },
  { id: "policys", label: "管控策略" },
];

const STATUS_VARIANT_MAP: Record<
  string,
  "destructive" | "default" | "secondary" | "outline"
> = {
  error: "destructive",
  success: "default",
  warning: "outline",
  default: "secondary",
};

function formatDateTime(value: any) {
  if (!value) return "-";
  const formatted = moment(value);
  return formatted.isValid() ? formatted.format(FORMAT_NOW) : "-";
}

function VerticalDivider() {
  return (
    <span className="mx-3 inline-block h-4 w-px bg-gray-200 align-middle" />
  );
}

function OverflowText({
  text,
  className = "",
  tooltipClassName = "",
}: {
  text?: string;
  className?: string;
  tooltipClassName?: string;
}) {
  if (!text) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`block truncate ${className}`}>{text}</span>
      </TooltipTrigger>
      <TooltipContent className={tooltipClassName || "max-w-md break-all"}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function DetailField({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="min-h-5 text-sm leading-6 text-gray-700 break-all">
        {children || "-"}
      </div>
    </div>
  );
}

function SummaryMetricCard({
  className,
  title,
  count,
  onClick,
  danger,
}: {
  className?: string;
  title: React.ReactNode;
  count: number;
  onClick?: () => void;
  danger?: boolean;
}) {
  const clickable = typeof onClick === "function";
  const countColor = danger
    ? "text-[#B42C3F]"
    : count > 0
      ? "text-gray-900"
      : "text-gray-400";
  const Wrapper = clickable ? "button" : "div";

  return (
    <Wrapper
      type={clickable ? "button" : undefined}
      className={`${className} rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-4 text-left transition ${clickable
        ? "cursor-pointer hover:border-blue-200 hover:bg-blue-50/40"
        : ""
        }`}
      onClick={onClick}
    >
      <div
        className="text-xs text-gray-400"
      // style={{ marginTop: className?.indexOf?.("allSkills") >= 0 ? 12 : 5 }}
      >
        {title}
      </div>
      <div className="mt-2 text-sm text-gray-600" style={{ marginTop: 1 }}>
        <span className={`mr-1 text-2xl font-semibold ${countColor}`}>
          {count || 0}
        </span>
        个
      </div>
    </Wrapper>
  );
}

function RenderTagList({ tags = [] }: { tags?: string[] }) {
  if (!tags?.length) {
    return <span className="text-gray-400">-</span>;
  }

  const visibleTags = tags.slice(0, 2);
  const hiddenTags = tags.slice(2);

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTags.map((tag, index) => (
        <Badge
          key={tag}
          variant={index === 0 ? "destructive" : "secondary"}
          className="max-w-[160px] truncate rounded-sm px-2 py-0.5"
        >
          {tag}
        </Badge>
      ))}
      {hiddenTags.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-default rounded-sm px-2 py-0.5 text-gray-500"
            >
              +{hiddenTags.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm break-all">
            {hiddenTags.join("、")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function AssetDetail({
  visible,
  onClose,
  selectedItem,
  aiAgentHostList,
  isGetAllMachinesLoading,
  machineVersionCount,
  openExposedDetailDrawer,
  isUltimateVersion,
  isHideLogTalkTab,
}: any) {
  const [item, setItem] = useState({} as any);
  const [activeTab, setActiveTab] = useState("summary");
  const [alarmTabId, setAlarmTabId] = useState(null);
  const [bashPolicyCount, setBashPolicyCount] = useState(0);
  const [maliciousPolicyCount, setMaliciousPolicyCount] = useState(0);
  const [unHandleBashCount, setUnHandleBashCount] = useState(0);
  const [unHandleMaliciousCount, setUnHandleMaliciousCount] = useState(0);
  const [unHandleMalwareCount, setUnHandleMalwareCount] = useState(0);
  const [allMalwareModalVisible, setAllMalwareModalVisible] = useState(false);
  const [allMalwarePage, setAllMalwarePage] = useState(1);
  const [allMalwarePageSize] = useState(10);
  const [allMalwareLoading, setAllMalwareLoading] = useState(false);
  const [allSkillsList, setAllSkillsList] = useState([] as any);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const modelKey = useMemo(
    () =>
      Object.keys(MODEL_ICON_MAP).filter(d =>
        item?.AgentModel?.some?.(
          (a: string) => a?.toLowerCase?.()?.indexOf?.(d) >= 0
        )
      )?.[0],
    [item?.AgentModel]
  );

  const alarmCount = (unHandleBashCount || 0) + (unHandleMaliciousCount || 0);

  const scrollToSection = useCallback((tabId: string) => {
    setActiveTab(tabId);
    window.document
      ?.getElementById?.(`csip-AIAgent-assetDetail-${tabId}`)
      ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, []);

  const handleScroll = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;

    const bodyRect = body.getBoundingClientRect();
    let current = "summary";

    TAB_ITEMS.forEach(({ id }) => {
      const el = window.document?.getElementById?.(
        `csip-AIAgent-assetDetail-${id}`
      );
      if (!el) return;
      const elRect = el.getBoundingClientRect();
      if (elRect.top - bodyRect.top <= 24) {
        current = id;
      }
    });

    setActiveTab(current);
  }, []);

  const getAllInitAlarmCount = async () => {
    const res: any = await Promise.all([
      DescribeBashEventsNew({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: "Status", Values: ["0"] },
          { Name: "InstanceID", Values: [selectedItem?.InstanceID] },
        ],
      }),
      DescribeRiskDnsEventList({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: "HandleStatus", Values: ["0"] },
          { Name: "InstanceID", Values: [selectedItem?.InstanceID] },
        ],
      }),
    ]);
    setUnHandleBashCount(res?.[0]?.TotalCount || 0);
    setUnHandleMaliciousCount(res?.[1]?.TotalCount || 0);
  };

  const getInitPolicyCount = async () => {
    const res: any = await Promise.all([
      DescribeBashPolicies({ Offset: 0, Limit: 1 }),
      DescribeRiskDnsPolicyList({ Offset: 0, Limit: 1 }),
    ]);
    setBashPolicyCount(Math.max((res?.[0]?.TotalCount || 0) - 1, 0));
    setMaliciousPolicyCount(Math.max((res?.[1]?.TotalCount || 0) - 1, 0));

    if (selectedItem?.tabId) {
      setActiveTab(selectedItem?.tabId);
      setTimeout(() => scrollToSection(selectedItem?.tabId), 0);
    }

    if (selectedItem?.alarmTabId) {
      setAlarmTabId(MALICIOUS_ALARM);
    }
  };

  const getAllMalwareCount = async () => {
    const res: any = await DescribeMalWareList({
      Limit: 1,
      Offset: 0,
      Filters: [
        { Name: "Status", Values: ["4"] },
        { Name: "VirusType", Values: ["AgentSkill"] },
        { Name: "InstanceID", Values: [selectedItem?.InstanceID] },
      ],
    });
    setUnHandleMalwareCount(res?.TotalCount || 0);
  };

  const loadAllMalwareList = useCallback(async () => {
    setAllMalwareLoading(true);
    try {
      const resp: any = await DescribeAIAgentSkillList({ InstanceID: selectedItem?.InstanceID, AgentName: selectedItem?.AgentName });
      const list = resp?.SkillList || [];
      setAllSkillsList(list);
    } finally {
      setAllMalwareLoading(false);
    }
  }, [allMalwarePage, allMalwarePageSize, selectedItem?.InstanceID, selectedItem?.AgentName]);

  useEffect(() => {
    if (!visible) return;
    setActiveTab("summary");
    setAlarmTabId(null);
    setAllMalwareModalVisible(false);
    setAllMalwarePage(1);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setItem(
        aiAgentHostList?.find?.(
          (d: { InstanceID: any }) => d?.InstanceID === selectedItem?.InstanceID
        )
      );
    }
  }, [visible, aiAgentHostList, selectedItem?.InstanceID]);

  useEffect(() => {
    if (visible) {
      setItem(selectedItem);
      getInitPolicyCount();
      getAllMalwareCount();
      getAllInitAlarmCount();
    }
  }, [visible, selectedItem]);

  useEffect(() => {
    if (visible) {
      loadAllMalwareList();
    }
  }, [loadAllMalwareList, visible]);

  return (
    <>
      <Dialog
        open={visible}
        onOpenChange={open => {
          if (!open) {
            onClose?.();
          }
        }}
      >
        <DialogContent className="!left-auto !right-0 !top-0 !translate-x-0 !translate-y-0 h-screen w-[min(1200px,100vw)] !max-w-none gap-0 overflow-hidden rounded-none border-l bg-white p-0 shadow-2xl">
          <DialogHeader className="shrink-0 border-b border-gray-100 bg-white px-6 py-5 text-left">
            <div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 leading-8">
                  {`${selectedItem?.OpenClawName || ''} 详情`}
                </DialogTitle>
              </div>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={scrollToSection}
              className="mt-5"
              style={{ margin: "5px 0 -20px" }}
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-gray-100 p-1">
                {TAB_ITEMS.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-none px-3 py-1.5 text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </DialogHeader>

          <div
            ref={bodyRef}
            onScroll={handleScroll}
            className="csip-AIAgent-assetDetail-body flex-1 overflow-y-auto bg-gray-50/60 px-6 py-6"
          >
            <div className="space-y-6">
              <section
                id="csip-AIAgent-assetDetail-summary"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    资产摘要
                  </h4>
                </div>
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-center text-sm leading-7 text-gray-700">
                    <span className="inline-flex items-center pr-1">
                      <span>{item?.OpenClawName || "-"}</span>
                      {IDENTITY_MODE_MAP[item?.IdentityMethod] ? (
                        <Badge
                          variant="outline"
                          className="ml-2 rounded-sm border-gray-200 bg-white text-gray-600"
                        >
                          {`${IDENTITY_MODE_MAP[item?.IdentityMethod]}识别`}
                        </Badge>
                      ) : null}
                    </span>
                    <VerticalDivider />
                    <span className="text-gray-400">调用模型：</span>
                    <span
                      className="csip-AIAgent-model ml-1 inline-block max-w-[320px] truncate align-middle"
                      style={{
                        backgroundImage: `url(${MODEL_ICON_MAP[modelKey]})`,
                        ...(item?.AgentModel?.length ? {} : { paddingLeft: 0 }),
                      }}
                    >
                      {item?.AgentModel?.length ? item?.AgentModel?.join?.("、") : "-"}
                    </span>
                    <VerticalDivider />
                    <span className="text-gray-400">ID：</span>
                    <span className="ml-1 inline-block max-w-[320px] truncate align-middle">
                      {item?.InstanceID || '-'}
                    </span>
                  </div>

                  <div className="my-5 border-t border-dashed border-gray-200" />

                  <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr_1fr]">
                    <SummaryMetricCard
                      title="关联告警（高危命令/恶意请求）"
                      count={alarmCount}
                      danger={alarmCount > 0}
                      onClick={() => scrollToSection("alarms")}
                    />

                    {/* <div className="grid gap-4 sm:grid-cols-2"> */}
                      <SummaryMetricCard
                        title="恶意Skills"
                        count={unHandleMalwareCount || 0}
                        danger={unHandleMalwareCount > 0}
                        onClick={() => scrollToSection("skills")}
                      />
                      <SummaryMetricCard
                        title="全部Skills"
                        count={allSkillsList?.length || 0}
                        onClick={
                          allSkillsList?.length
                            ? () => {
                              setAllMalwarePage(1);
                              setAllMalwareModalVisible(true);
                            }
                            : undefined
                        }
                      />
                    {/* </div> */}

                    {/* <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-4">
                      <div
                        className="text-xs text-gray-400"
                        style={{ marginTop: 5 }}
                      >
                        metadata识别
                      </div>
                      <div
                        className="mt-2 flex flex-wrap gap-2"
                        style={{ marginTop: 3 }}
                      >
                        {renderMeta(item)}
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-6">
                      <h5 className="mb-4 text-sm font-semibold text-gray-900">
                        metadata识别
                      </h5>
                    </div> */}
                  </div>

                  {/* <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <DetailField label="识别结果">
                        <div className="flex flex-wrap gap-2">
                          {renderMeta(item)}
                        </div>
                      </DetailField>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <DetailField label="路径">
                        <OverflowText
                          text={selectedItem?.MetadataRiskURL || "-"}
                          className="max-w-full"
                        />
                      </DetailField>
                    </div>
                  </div> */}
                </div>
              </section>

              {/* <section
                id="csip-AIAgent-assetDetail-asset"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                  </h4>
                </div>
                <div className="space-y-6 px-5 py-5">
                  <div className="border-t border-dashed border-gray-200 pt-6">
                    <h5 className="mb-4 text-sm font-semibold text-gray-900">
                      metadata识别
                    </h5>
                    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                        <DetailField label="识别结果">
                          <div className="flex flex-wrap gap-2">
                            {renderMeta(item)}
                          </div>
                        </DetailField>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                        <DetailField label="路径">
                          <OverflowText
                            text={selectedItem?.MetadataRiskURL || "-"}
                            className="max-w-full"
                          />
                        </DetailField>
                      </div>
                    </div>
                  </div>
                </div>
              </section> */}

              <section
                id="csip-AIAgent-assetDetail-skills"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    恶意Skills
                  </h4>
                </div>
                <div className="px-5 py-5 text-sm text-gray-600" style={{ paddingLeft: 0, paddingRight: 0, marginTop: -20 }}>
                  <SkillsList
                    aiAgentHostList={aiAgentHostList}
                    isGetAllMachinesLoading={isGetAllMachinesLoading}
                    InstanceId={selectedItem?.InstanceID}
                    getAllMalwareCount={getAllMalwareCount}
                  />
                </div>
              </section>

              <section
                id="csip-AIAgent-assetDetail-alarms"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    威胁告警
                  </h4>
                </div>
                <div className="px-5 py-5" style={{ paddingLeft: 0, paddingRight: 0, marginTop: -20 }}>
                  <AlarmsList
                    machineVersionCount={machineVersionCount}
                    aiAgentHostList={aiAgentHostList}
                    InstanceId={selectedItem?.InstanceID}
                    alarmTabId={alarmTabId}
                    getAllInitAlarmCount={getAllInitAlarmCount}
                  />
                </div>
              </section>

              <section
                id="csip-AIAgent-assetDetail-logs"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    审计日志
                  </h4>
                </div>
                <div className="px-5 py-5 text-sm text-gray-600" style={{ paddingLeft: 0, paddingRight: 0, marginTop: -20 }}>
                  <LogsIndex
                    from="detail"
                    aiAgentHostList={aiAgentHostList}
                    isGetAllMachinesLoading={isGetAllMachinesLoading}
                    InstanceIds={[selectedItem?.InstanceID]}
                    isHideLogTalkTab={isHideLogTalkTab}
                  />
                </div>
              </section>

              <section
                id="csip-AIAgent-assetDetail-policys"
                className="rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    管控策略
                  </h4>
                </div>
                <div className="px-5 py-5 text-sm text-gray-600" style={{ paddingLeft: 0, paddingRight: 0, marginTop: -20 }}>
                  <HostGroupList
                    isFromDetail
                    bashPolicyCount={bashPolicyCount}
                    maliciousPolicyCount={maliciousPolicyCount}
                    getInitPolicyCount={getInitPolicyCount}
                    aiAgentHostList={aiAgentHostList}
                  />
                </div>
                <div className="hidden">
                  {isGetAllMachinesLoading
                    ? "loading"
                    : isHideLogTalkTab
                      ? "hideLogTalkTab"
                      : ""}
                </div>
                <div className="hidden">
                  {bashPolicyCount + maliciousPolicyCount}
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={allMalwareModalVisible}
        onOpenChange={open => {
          if (!open) {
            setAllMalwareModalVisible(false);
          }
        }}
      >
        <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0" style={{ maxWidth: 1200 }}>
          <DialogHeader className="border-b border-gray-100 px-6 py-4 text-left">
            <DialogTitle>全部Skills</DialogTitle>
          </DialogHeader>

          <div className="min-h-[240px] px-6 py-5" style={{ maxHeight: 700, overflowY: 'auto' }}>
            {allMalwareLoading ? (
              <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载中...
              </div>
            ) : allSkillsList?.length ? (
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4">Skill名称</TableHead>
                      <TableHead className="px-4">路径</TableHead>
                      <TableHead className="px-4">Skill版本</TableHead>
                      <TableHead className="px-4">描述</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSkillsList.map((malware: any) => {
                      return (
                        <TableRow key={malware?.Name}>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <OverflowText text={malware?.Name || '-'}/>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <OverflowText text={malware?.Path || '-'} className="max-w-[300px]"/>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <OverflowText text={malware?.Version || '-'} />
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <OverflowText text={malware?.Description || '-'} className="max-w-[400px]" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
