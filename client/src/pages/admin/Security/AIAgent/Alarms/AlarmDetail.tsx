import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Copy, Info, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DescribeBashEventsInfoNew, DescribeMachines, DescribeRiskDnsEventInfo } from '@/pages/admin/Security/api';

import {
  BASH_ALARM,
  POLICY_TYPES,
  statusObjMapNew,
  MALICIOUS_STATUS_VAL_MAP,
  DATA_SOURCE_MAP,
  FORMAT_NOW,
  renderLinkMap,
} from '../constants';
import { parseJsonStr, parseBase64Str } from '../Common/CommonRiskHandleFunc';

import MaliciousOperate from './MaliciousOperate';
import BashOperate from './BashOperate';
import { getRuleLevelText } from './AlarmsList';

/* ---------- tiny copy helper ---------- */
const CopyBtn = ({ text }: { text?: string }) => {
  if (!text) return null;
  return (
    <Copy
      className="inline-block w-3 h-3 ml-1 text-gray-400 hover:text-blue-500 cursor-pointer align-middle"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
      }}
    />
  );
};

export const getTitle = (item: any) => {
  const arr = item?.exe?.split?.('/');
  return `${arr?.[arr?.length - 1]}(${item?.pid})`;
};

export const getUserInfo = (account: string = '') => {
  const info = account?.split?.(':');
  return {
    user: info?.[0],
    group: info?.[1],
  };
};

export const renderBashDetailTags = (record: { Tags: any[] }) =>
  record?.Tags?.length ? (
    <div className="flex flex-wrap gap-1">
      {record?.Tags?.slice(0, 2)?.map((tag: any, i: number) => (
        <Badge key={i} variant="outline" className="max-w-[250px] truncate">
          {tag}
        </Badge>
      ))}
    </div>
  ) : (
    '--'
  );

export const replaceStrLink = (str: any) => {
  if (typeof str === 'string') {
    let temp = str;
    temp
      .match(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'*+,;=.]+/g)
      ?.forEach?.(
        d =>
          (temp = temp.replace(
            d,
            `<a
            href=${d}
            target="_blank"
            rel="noopener noreferrer"
            style="text-decoration:underline"
          >${d}</a>`,
          )),
      );
    return temp;
  }
  return str;
};

/* ---------- helpers for tree rendering ---------- */

/** A single row inside a process tree node: two‑column layout */
const TreeRow = ({
  left,
  leftCopy,
  right,
  rightCopy,
}: {
  left: string;
  leftCopy?: string;
  right: string;
  rightCopy?: string;
}) => (
  <div className="grid grid-cols-2 gap-2 pl-2.5 pt-2.5">
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-gray-500 truncate">{left}</div>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-h-[500px] overflow-y-auto">
        <div>
          {left}
          <CopyBtn text={leftCopy} />
        </div>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-gray-500 truncate">{right}</div>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-h-[500px] overflow-y-auto">
        <div className="whitespace-pre-wrap break-words">
          {right}
          <CopyBtn text={rightCopy} />
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
);

/** Build child detail rows for a single process tree node */
const buildTreeChildren = (psTree: any[], index: number) => {
  const rows: React.ReactNode[] = [];
  const info = getUserInfo(psTree?.[index]?.account);

  if (info?.user || psTree?.[index]?.exe) {
    rows.push(
      <TreeRow
        key={`${index}-1`}
        left={`进程所属用户：${info?.user || '-'}`}
        leftCopy={info?.user}
        right={`进程文件路径：${psTree?.[index]?.exe || '-'}`}
        rightCopy={psTree?.[index]?.exe}
      />,
    );
  }

  if (info?.group || psTree?.[index]?.cmdline) {
    rows.push(
      <TreeRow
        key={`${index}-2`}
        left={`进程所属用户组：${info?.group || '-'}`}
        leftCopy={info?.group}
        right={`进程命令行：${psTree?.[index]?.cmdline || '-'}`}
        rightCopy={psTree?.[index]?.cmdline}
      />,
    );
  }

  if (psTree?.[index]?.ssh_service || psTree?.[index]?.ssh_source) {
    rows.push(
      <TreeRow
        key={`${index}-3`}
        left={`SSH服务：${psTree?.[index]?.ssh_service || '-'}`}
        leftCopy={psTree?.[index]?.ssh_service}
        right={`登录源：${psTree?.[index]?.ssh_source || '-'}`}
        rightCopy={psTree?.[index]?.ssh_source}
      />,
    );
  }

  if (psTree?.[index]?.start_time) {
    const timeStr = moment(psTree[index].start_time * 1000).format(FORMAT_NOW);
    rows.push(
      <Tooltip key={`${index}-4`}>
        <TooltipTrigger asChild>
          <div className="aialrm-tree-item pl-2.5 pt-2.5 text-gray-500 truncate">
            {`进程启动时间：${timeStr}`}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-h-[500px] overflow-y-auto">
          <div>
            {`进程启动时间：${timeStr}`}
            <CopyBtn text={timeStr} />
          </div>
        </TooltipContent>
      </Tooltip>,
    );
  }

  return rows;
};

/** A single tree node (process) with collapsible children */
const TreeNode = ({
  label,
  copyText,
  children,
  level,
  danger,
}: {
  label: string;
  copyText?: string;
  children: React.ReactNode;
  level: number;
  danger?: boolean;
}) => (
  <div
    className={`aialarm-detail-tree${level}`}
    style={{ paddingLeft: level === 0 ? 0 : level === 1 ? 18 : 36 }}
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          {danger && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
          <strong style={danger ? { color: '#B42C3F' } : undefined}>
            {danger ? '风险进程：' : '进程：'}
            {label}
          </strong>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-h-[500px] overflow-y-auto">
        <div>
          {label}
          <CopyBtn text={copyText} />
        </div>
      </TooltipContent>
    </Tooltip>
    {children}
  </div>
);

export default function AlarmDetail({
  visible,
  onClose,
  selectedAlarmType,
  item,
  aiAgentHostList,
  refreshTable,
  clearSelected,
  hasFlagship,
}: any) {
  const TAB_KEYS = ['summary', 'detail', 'scope', 'suggestion'];

  const [activeTab, setActiveTab] = useState('summary');
  const [record, setRecord] = useState({} as any);
  const [hasPsTree, setHasPsTree] = useState(false);
  const [psTree, setPsTree] = useState(null as any);
  const [machineInfo, setMachineInfo] = useState({} as any);

  const agentItemData = aiAgentHostList?.find?.(
    (d: { InstanceID: any }) => d?.InstanceID === item?.MachineExtraInfo?.InstanceID,
  );

  const scrollToSection = (key: string) => {
    setActiveTab(key);
    document.getElementById(`csip-AIAgent-detail-${key}`)?.scrollIntoView?.({ behavior: 'smooth' });
  };

  const handleScroll = useCallback(() => {
    const body = document.querySelector('.csip-AIAgent-alarmDetail-body');
    if (!body) return;
    const bodyRect = body.getBoundingClientRect();
    let current = 'summary';
    for (const key of TAB_KEYS) {
      const el = document.getElementById(`csip-AIAgent-detail-${key}`);
      if (el) {
        const elRect = el.getBoundingClientRect();
        if (elRect.top - bodyRect.top <= 10) {
          current = key;
        }
      }
    }
    setActiveTab(current);
  }, []);

  const getDetail = async (item: {
    Id: any;
    MachineExtraInfo: { InstanceID: any };
    InstanceID: any;
    InstanceId: any;
  }) => {
    const res: any = await Promise.all([
      selectedAlarmType === BASH_ALARM
        ? DescribeBashEventsInfoNew({ Id: item.Id })
        : DescribeRiskDnsEventInfo({ Id: item.Id }),
      DescribeMachines({
        Offset: 0,
        Limit: 1,
        MachineRegion: 'all-regions',
        MachineType: 'ALL',
        Filters: [
          {
            Name: 'InstanceIds',
            Values: [item?.MachineExtraInfo?.InstanceID || item?.InstanceID || item?.InstanceId],
          },
        ],
      }),
    ]);
    const data = res?.[0]?.[selectedAlarmType === BASH_ALARM ? 'BashEventsInfo' : 'Info'] || {};
    const info = {
      ...data,
      SuggestScheme: data?.SuggestScheme ? replaceStrLink(data?.SuggestScheme) : '暂无',
      SuggestSolution: data?.SuggestSolution ? replaceStrLink(data?.SuggestSolution) : '暂无',
    };
    const parsedPsTree =
      selectedAlarmType === BASH_ALARM ? parseJsonStr((parseBase64Str(info?.PsTree || '') || null) as any) : null;
    setRecord(info);
    setPsTree(parsedPsTree);
    setHasPsTree(
      selectedAlarmType === BASH_ALARM &&
        info?.PsTree?.length &&
        Array.isArray(parsedPsTree) &&
        parsedPsTree?.length > 0,
    );
    setMachineInfo(res?.[1]?.Machines?.[0] || {});
  };

  useEffect(() => {
    if (!visible) return undefined;
    let bindBody: Element | null = null;
    const timer = setTimeout(() => {
      const body = document.querySelector('.csip-AIAgent-alarmDetail-body');
      if (!body) return;
      bindBody = body;
      body.addEventListener('scroll', handleScroll);
    }, 100);
    return () => {
      clearTimeout(timer);
      if (bindBody) {
        bindBody.removeEventListener('scroll', handleScroll);
      }
    };
  }, [visible, handleScroll]);

  useEffect(() => {
    if (item.Id && visible) {
      getDetail(item);
    }
  }, [item, visible]);

  return (
    <Dialog
      open={visible}
      onOpenChange={open => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <DialogContent className="!left-auto !right-0 !top-0 !translate-x-0 !translate-y-0 h-screen w-[min(1000px,100vw)] !max-w-none gap-0 overflow-hidden rounded-none border-l bg-white p-0 shadow-2xl">
        {/* ---- header ---- */}
        <div className="csip-AIAgent-alarmDetail flex-shrink-0 border-b px-6 py-4">
          {/* 第一行：图标+标题+状态 左侧，更多操作 右侧 */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 min-w-0">
              <img
                src="https://test-1256299843.cos.ap-shanghai.myqcloud.com/FEConsoleImage/csip-AIAgent-detailDrawer-title.png"
                alt="alarm"
                className="w-8 h-8 flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                {/* 标题 + 状态 Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold leading-6">
                    {`${agentItemData?.OpenClawName||''}存在${selectedAlarmType === BASH_ALARM ? '高危命令' : '恶意请求'}`}
                  </span>
                  {selectedAlarmType === BASH_ALARM ? (
                    <Badge
                      variant={statusObjMapNew[item?.Status]?.theme === 'danger' ? 'destructive' : 'outline'}
                    >
                      {statusObjMapNew[item?.Status]?.text}
                    </Badge>
                  ) : (
                    <Badge
                      variant={
                        MALICIOUS_STATUS_VAL_MAP[item?.HandleStatus]?.theme === 'danger'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {MALICIOUS_STATUS_VAL_MAP[item?.HandleStatus]?.text}
                    </Badge>
                  )}
                </div>
                {/* 类型 + ID 紧跟标题下方 */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>
                    类型：
                    <span className="text-gray-900">
                      {selectedAlarmType === BASH_ALARM ? '高危命令' : '恶意请求'}
                    </span>
                  </span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span>
                    ID：<span className="text-gray-900">{item?.Id}</span>
                  </span>
                </div>
              </div>
            </div>
            {/* 操作按钮 - 右侧 */}
            <div className="flex-shrink-0 ml-4">
              {selectedAlarmType === BASH_ALARM ? (
                <BashOperate
                  record={item}
                  refreshTable={refreshTable}
                  clearSelected={clearSelected}
                  hasFlagship={hasFlagship}
                  aiAgentHostList={aiAgentHostList}
                  hasNoDetail
                />
              ) : (
                <MaliciousOperate
                  record={item}
                  refreshTable={refreshTable}
                  clearSelected={clearSelected}
                  hasFlagship={hasFlagship}
                  aiAgentHostList={aiAgentHostList}
                  hasNoDetail
                />
              )}
            </div>
          </div>

          {/* tabs nav */}
          <Tabs value={activeTab} onValueChange={scrollToSection} className="mt-4">
            <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b border-gray-200 bg-transparent p-0">
              {[
                { id: 'summary', label: '安全摘要' },
                { id: 'detail', label: '告警详情' },
                { id: 'scope', label: '影响范围' },
                { id: 'suggestion', label: '处置建议' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative rounded-none border-b-2 border-transparent px-1 pb-2 pt-1 text-sm font-normal text-gray-500 shadow-none data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* ---- scrollable body ---- */}
        <div className="csip-AIAgent-alarmDetail-body flex-1 overflow-y-auto px-6 py-4">
          <div>
            {/* 安全摘要 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3" id="csip-AIAgent-detail-summary">
                安全摘要
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {/* 危害描述 */}
                <div className="bg-blue-50 px-4 py-3 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                  <span className="text-orange-600 font-medium">危害描述：</span>
                  {record?.ThreatDesc || record?.HarmDescribe || '暂无'}
                </div>
                {/* info cards */}
                <div className={`grid ${selectedAlarmType === BASH_ALARM ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-gray-200 border-t border-gray-200`}>
                  {selectedAlarmType === BASH_ALARM ? (
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500 mb-1.5">威胁等级</div>
                      <div className="text-sm">{getRuleLevelText(item?.RuleLevel)}</div>
                    </div>
                  ) : null}
                  <div className="px-4 py-3">
                    <div className="text-xs text-gray-500 mb-1.5">关联策略</div>
                    <div className="text-sm">
                      <span
                        title={item?.[selectedAlarmType === BASH_ALARM ? 'RuleName' : 'PolicyName']}
                        className="inline-block max-w-[260px] truncate align-middle"
                      >
                        {item?.[selectedAlarmType === BASH_ALARM ? 'RuleName' : 'PolicyName']}
                      </span>

                      {item?.[selectedAlarmType === BASH_ALARM ? 'RuleCategory' : 'PolicyType'] === 0 ||
                      item?.[selectedAlarmType === BASH_ALARM ? 'RuleCategory' : 'PolicyType'] === 1 ? (
                        <span className="maliciousRequest-alarmList-policyType ml-1 align-middle">
                          {POLICY_TYPES[
                            item?.[selectedAlarmType === BASH_ALARM ? 'RuleCategory' : 'PolicyType']
                          ] || '--'}
                          {String(
                            item?.[selectedAlarmType === BASH_ALARM ? 'RuleCategory' : 'PolicyType'],
                          ) === '0' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline-block w-3.5 h-3.5 text-gray-400 align-middle ml-0.5 -mt-0.5 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                系统策略为腾讯OpenClaw运营专家与算法专家经过多模型沉淀的规则配置，适用于大部分的高危命令检测。
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {/* <div className="px-4 py-3">
                    <div className="text-xs text-gray-500 mb-1.5">受影响资产（ID/名称）</div>
                    <div className="text-sm">
                      <a href="#" className="text-blue-600 hover:underline">
                        {item?.MachineExtraInfo?.InstanceID ||
                          item?.InstanceID ||
                          item?.InstanceId ||
                          '--'}
                      </a>
                      <span className="inline-block w-px h-3 bg-gray-200 mx-2 align-middle" />
                      <span
                        title={item?.MachineName || item?.HostName || '-'}
                        className="inline-block max-w-[200px] truncate align-middle"
                      >
                        {item?.MachineName || item?.HostName || '-'}
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* 告警详情 */}
            <div className="mb-6">
              <h4
                className="text-sm font-semibold mb-3"
                id="csip-AIAgent-detail-detail"
                style={{ marginTop: 8 }}
              >
                告警详情
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
                <div className="flex items-start px-4 py-3">
                  <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">首次请求时间</span>
                  <span className="text-sm text-gray-900">
                    {record?.[selectedAlarmType === BASH_ALARM ? 'CreateTime' : 'FirstTime'] || '-'}
                  </span>
                </div>
                <div className="flex items-start px-4 py-3">
                  <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">最近请求时间</span>
                  <span className="text-sm text-gray-900">
                    {record?.[selectedAlarmType === BASH_ALARM ? 'ModifyTime' : 'LastTime'] || '-'}
                  </span>
                </div>
                {selectedAlarmType === BASH_ALARM ? (
                  <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">数据来源</span>
                    <span className="text-sm text-gray-900">{DATA_SOURCE_MAP?.[record.DetectBy] ?? '未知'}</span>
                  </div>
                ) : (
                  <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">恶意请求域名</span>
                    <span className="text-sm text-gray-900">
                      {record?.Domain || '--'}
                      <CopyBtn text={record?.Domain} />
                    </span>
                  </div>
                )}

                <div className="flex items-start px-4 py-3">
                  <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">标签特征</span>
                  <span className="text-sm text-gray-900">
                    {selectedAlarmType === BASH_ALARM ? (
                      renderBashDetailTags(record)
                    ) : record.Tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {record.Tags.map((tag: any, i: number) => (
                          <Badge key={i} variant="outline" className="max-w-[250px] truncate">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                {selectedAlarmType === BASH_ALARM ? (
                  <>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">登录用户</span>
                      <span className="text-sm text-gray-900">{record?.User || '-'}</span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">命令内容</span>
                      <span className="text-sm text-gray-900 flex-1 min-w-0">
                        <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                          {record?.BashCmd || '-'}
                          <CopyBtn text={record?.BashCmd} />
                        </div>
                      </span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">PID</span>
                      <span className="text-sm text-gray-900">{record?.Pid || '-'}</span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">行为特征</span>
                      <span className="text-sm text-gray-900">{record?.Tags?.[2] || '--'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">进程</span>
                      <span className="text-sm text-gray-900">
                        {record?.ProcessName || '--'}
                        <CopyBtn text={record?.ProcessName} />
                      </span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">命令行</span>
                      <span className="text-sm text-gray-900">
                        {record?.CmdLine || '--'}
                        <CopyBtn text={record?.CmdLine} />
                      </span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">MD5</span>
                      <span className="text-sm text-gray-900">
                        {record?.ProcessMd5
                          ? !String(record?.ProcessMd5)?.replace?.(/0/g, '')
                            ? '--'
                            : record?.ProcessMd5
                          : '--'}
                      </span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">请求次数</span>
                      <span className="text-sm text-gray-900">{record?.AccessCount || '--'}</span>
                    </div>
                    <div className="flex items-start px-4 py-3">
                      <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">PID</span>
                      <span className="text-sm text-gray-900">{record?.Pid || '--'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 影响范围 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3" id="csip-AIAgent-detail-scope">
                影响范围
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {/* 资产信息头部 */}
                {/* <div className="px-4 py-3">
                  <div className="mb-1">
                    {item?.MachineExtraInfo?.InstanceID &&
                    Object.keys(
                      renderLinkMap(
                        item?.MachineExtraInfo?.InstanceID,
                        agentItemData?.RegionInfo?.RegionId,
                      ),
                    )?.includes?.(agentItemData?.MachineType) ? (
                      <a
                        className="text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-1 font-medium"
                        onClick={() =>
                          window.open(
                            `${
                              renderLinkMap(
                                item?.MachineExtraInfo?.InstanceID,
                                agentItemData?.RegionInfo?.RegionId,
                              )?.[agentItemData?.MachineType]
                            }`,
                          )
                        }
                      >
                        {item?.MachineExtraInfo?.InstanceID}
                        <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-sm font-medium">{item?.MachineExtraInfo?.InstanceID || '-'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0 text-xs text-gray-500 flex-wrap">
                    <span>
                      资产类型：
                      <span className="text-gray-900">{machineInfo?.MachineType}</span>
                    </span>
                    <span className="inline-block w-px h-3 bg-gray-200 mx-3" />
                    <span>
                      资产名称：
                      <span className="text-gray-900">
                        {item?.MachineName || item?.HostName || '-'}
                      </span>
                    </span>
                    <span className="inline-block w-px h-3 bg-gray-200 mx-3" />
                    <span>
                      IP地址：
                      <span className="text-gray-900">
                        公：
                        {machineInfo?.MachineExtraInfo?.WanIP || machineInfo?.MachineWanIp || '-'}
                      </span>
                    </span>
                    <span className="text-gray-900 ml-2">
                      内：
                      {machineInfo?.MachineExtraInfo?.PrivateIP || machineInfo?.MachineIp || '-'}
                    </span>
                  </div>
                </div> */}
                {/* 详情行 */}
                <div className="divide-y divide-gray-200 border-t border-gray-200">
                  <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">AI Agent</span>
                    <span className="text-sm text-gray-900">{agentItemData?.OpenClawName || '-'}</span>
                  </div>
                  <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">关联告警（高危命令/<br/>恶意请求）</span>
                    <span className="text-sm text-gray-900">
                      <div className="csip-AiAgent-alarms-bash inline-flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                variant={agentItemData?.BashCount ? 'destructive' : 'outline'}
                                className={`csip-AiAgent-count-tag-${agentItemData?.BashCount ? 'red' : 'gray'}`}
                              >
                                {agentItemData?.BashCount || 0}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>高危命令关联告警</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="csip-AiAgent-alarms-malicious inline-flex items-center ml-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                variant={agentItemData?.MaliciousCount ? 'destructive' : 'outline'}
                                className={`csip-AiAgent-count-tag-${agentItemData?.MaliciousCount ? 'red' : 'gray'}`}
                              >
                                {agentItemData?.MaliciousCount || 0}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>恶意请求关联告警</TooltipContent>
                        </Tooltip>
                      </div>
                    </span>
                  </div>
                  <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">恶意Skills</span>
                    <span className="text-sm text-gray-900">
                      <div className="csip-AiAgent-skills-count inline-flex items-center">
                        <Badge
                          variant={agentItemData?.SkillsCount ? 'destructive' : 'outline'}
                          className={`csip-AiAgent-count-tag-${agentItemData?.SkillsCount ? 'red' : 'gray'}`}
                        >
                          {agentItemData?.SkillsCount || 0}
                        </Badge>
                      </div>
                    </span>
                  </div>
                  {/* <div className="flex items-start px-4 py-3">
                    <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">matedata识别</span>
                    <span className="text-sm text-gray-900">{renderMeta(agentItemData)}</span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* 处置建议 */}
            <div className="mb-6">
              <h4
                className="text-sm font-semibold mb-3"
                id="csip-AIAgent-detail-suggestion"
              >
                处置建议
              </h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
                <div className="flex items-start px-4 py-3">
                  <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">建议方案</span>
                  <div className="text-sm text-gray-900 flex-1 min-w-0">
                    <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html:
                            record?.[
                              selectedAlarmType === BASH_ALARM ? 'SuggestScheme' : 'SuggestSolution'
                            ] || '',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start px-4 py-3">
                  <span className="w-[120px] flex-shrink-0 text-sm text-gray-500">参考链接</span>
                  <span className="text-sm text-gray-900 flex-1 min-w-0">
                    <div style={{ wordBreak: 'break-all' }}>
                      {selectedAlarmType === BASH_ALARM
                        ? record?.References?.length
                          ? record?.References?.map?.((r: any, i: number) => (
                              <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                                {r}
                              </a>
                            ))
                          : '暂无'
                        : record?.ReferenceLink
                          ? record?.ReferenceLink
                          : '暂无'}
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* 进程树 */}
            {!hasPsTree ? null : (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">进程树</h4>
                <div className="process-tree cwp-progress-tree space-y-2">
                  {psTree?.[2] && (
                    <TreeNode
                      label={getTitle(psTree[2])}
                      copyText={getTitle(psTree[2])}
                      level={2}
                    >
                      {buildTreeChildren(psTree, 2)}
                    </TreeNode>
                  )}
                  {psTree?.[1] && (
                    <TreeNode
                      label={getTitle(psTree[1])}
                      copyText={getTitle(psTree[1])}
                      level={psTree?.[2] ? 1 : 0}
                    >
                      {buildTreeChildren(psTree, 1)}
                    </TreeNode>
                  )}
                  {psTree?.[0] && (
                    <TreeNode
                      label={getTitle(psTree[0])}
                      copyText={getTitle(psTree[0])}
                      level={!psTree?.[2] ? (psTree?.[1] ? 1 : 0) : 0}
                      danger
                    >
                      {buildTreeChildren(psTree, 0)}
                    </TreeNode>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
