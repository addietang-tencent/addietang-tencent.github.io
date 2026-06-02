import React, { useEffect, useState, useMemo, useCallback } from 'react';
import moment from 'moment';
import { Info, RefreshCw, Search, Copy, Bot, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableActionCell,
} from '@/components/ui/table';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import Pagination from '@/components/Pagination';

import { hostVersionMap } from '../Groups/BashPolicy/Constants';
import {
  FORMAT_NOW,
  IDENTITY_MODE_MAP,
  META_DATA_MAP,
  ProtectLevelVersionMap,
  AGENT_STATUS_MAP,
  EXPOSED_TYPE_MAP,
  META_DATA_DESC_MAP,
} from '../constants';
import { executeInstallTasksWithDelay } from '../Common/CommonRiskHandleFunc';

import SyncAssetBtn from './SyncAssetBtn';

/** 文本溢出省略 + tooltip */
const OverflowText = ({
  children,
  tooltip,
  className = '',
  onClick,
  copyable,
  style,
}: {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  copyable?: boolean;
  style?: React.CSSProperties;
}) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children);
    }
  };

  const content = (
    <span
      className={`block truncate max-w-full ${onClick ? 'text-[#1447E6] cursor-pointer hover:underline' : 'text-[#0A0A0A]'} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
      {copyable && (
        <Copy
          className="inline-block w-3 h-3 ml-1 text-[#A3A3A3] hover:text-[#1447E6] cursor-pointer align-middle"
          onClick={handleCopy}
        />
      )}
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export const renderAgentItem = (item: any, clickHandle: any) => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-[4px] bg-[#F5F8FF] text-[#1447E6] flex items-center justify-center flex-shrink-0">
      <Bot className="w-3.5 h-3.5" />
    </div>
    <div className="min-w-0">
      <OverflowText
        tooltip={item?.OpenClawName}
        className={clickHandle ? 'text-[#1447E6] cursor-pointer hover:underline' : 'text-[#0A0A0A]'}
        onClick={clickHandle || undefined}
      >
        {item?.OpenClawName || '-'}
      </OverflowText>
      <div>
        <OverflowText
          tooltip={item?.AgentModel?.length ? item?.AgentModel?.join?.('、') : undefined}
          style={{ color: 'rgba(0,0,0,0.45)' }}
        >
          {item?.AgentModel?.length ? item?.AgentModel?.join?.('、') : '-'}
        </OverflowText>
      </div>
    </div>
  </div>
);

export const renderMeta = (item: any, _style = {}) =>
(item?.MetadataRiskList?.length ? (
  <div className="flex items-center gap-2 flex-wrap">
    {item?.MetadataRiskList?.map?.((d: string | number) => (
      <div className="flex items-center gap-1" key={String(d)}>
        {/* <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${d === 'AK_TMP' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
          {d === 'AK_TMP' ? <KeyRound className="w-3 h-3 text-white" /> : <UserRound className="w-3 h-3 text-white" />}
        </div> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help text-sm" style={{ textDecoration: 'underline dashed rgba(0,0,0,0.3)', textUnderlineOffset: '5px' }}>{META_DATA_MAP[d] || d}</span>
          </TooltipTrigger>
          <TooltipContent>{META_DATA_DESC_MAP[d]}</TooltipContent>
        </Tooltip>
      </div>
    ))}
  </div>
) : (
  <span style={{ color: 'rgba(0,0,0,0.5)' }}>不包含</span>
));

export default function AgentAssetsList({
  getInitAlarmCount,
  getAllMachines,
  aiAgentHostList,
  setAiAgentHostList,
  setRiskHostCount,
  isGetAllMachinesLoading,
  openAssetDetail,
  storageGroupData,
  isUltimateVersion,
  hasFilterAlarm,
  setHasFilterAlarm,
  openExposedDetailDrawer,
  rencentScanTime,
  setOpenTrialModalVisible,
  hasTrialNum,
  showTrialBtn,
  setSelectedType,
  selectedAgentIds,
  setSelectedAgentIds,
  setOpenProtectModalVisible,
}: any) {
  const [isInit, setIsInit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [query] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState<'InstanceID' | 'MachineName'>('InstanceID');

  const getAgentRowKey = useCallback((item: any) => item?.InstanceID, []);

  const refreshTable = useCallback(() => {
    setHasFilterAlarm?.(false);
    getAllMachines?.();
    getInitAlarmCount?.();
  }, [setHasFilterAlarm, getAllMachines, getInitAlarmCount]);

  const getMachinesData = async (hosts: any) => {
    setIsLoading(true);
    setHasFilterAlarm?.(false);
    let list = hosts;
    const MAX_REQUEST = 16;
    const paramsArr = hosts
      .map((d: any) => [
        {
          regionId: 1,
          serviceType: 'cwp',
          cmd: 'DescribeBashEventsNew',
          data: {
            Offset: 0,
            Limit: 1,
            Filters: [
              { Name: 'Status', Values: ['0'] },
              { Name: 'InstanceID', Values: [d?.InstanceID] },
            ],
          },
        },
        {
          regionId: 1,
          serviceType: 'cwp',
          cmd: 'DescribeRiskDnsEventList',
          data: {
            Offset: 0,
            Limit: 1,
            Filters: [
              { Name: 'HandleStatus', Values: ['0'] },
              { Name: 'InstanceID', Values: [d?.InstanceID] },
            ],
          },
        },
        {
          regionId: 1,
          serviceType: 'cwp',
          cmd: 'DescribeMalWareList',
          data: {
            Offset: 0,
            Limit: 1,
            Filters: [
              { Name: 'VirusType', Values: ['AgentSkill'] },
              { Name: 'Status', Values: ['4'] },
              { Name: 'InstanceID', Values: [d?.InstanceID] },
            ],
          },
        },
        d?.ProtectType === 'Flagship' && d?.MachineType === 'CVM'
          ? {
            cmd: 'DescribeInstances',
            data: {
              InstanceIds: [d?.InstanceID],
            },
            regionId: d?.RegionInfo?.RegionId || 1,
            serviceType: 'cvm',
          }
          : null,
      ])
      .flat(2)
      .reduce((pre: any, cur: any, i: any) => {
        const index = Math.ceil((i + 1) / MAX_REQUEST) - 1;
        if (pre[index]) {
          if (pre[index]?.length < MAX_REQUEST) {
            pre[index] = pre[index].concat(cur);
          } else {
            pre[index + 1] = [cur];
          }
        } else {
          pre[index] = [cur];
        }
        return pre;
      }, []);
    console.log(44001, paramsArr);
    await executeInstallTasksWithDelay(paramsArr, 600)
      .then(res => {
        console.log(44002, res);
        list = list.map((d: any, i: any) => {
          const ids = res?.[i * 4 + 3]?.InstanceSet?.[0]?.SecurityGroupIds || [];
          const rules = res?.[i * 4 + 3]?.FirewallRuleSet || [];
          return {
            ...d,
            BashCount: res?.[i * 4]?.TotalCount || 0,
            MaliciousCount: res?.[i * 4 + 1]?.TotalCount || 0,
            SkillsCount: res?.[i * 4 + 2]?.TotalCount || 0,
            SecurityGroupIds: ids,
            FirewallRuleSet: rules,
            hasOpenNetPolicy:
              (d?.MachineType === 'CVM'
                && ids?.length
                && ids?.some?.((x: any) => x === storageGroupData?.[d?.RegionInfo?.RegionId]?.SecurityGroupId))
            ,
          };
        });
      })
      .catch(err => console.log(err));
    if (isInit) {
      setRiskHostCount?.(
        list?.filter?.((d: any) => d?.BashCount > 0 || d?.MaliciousCount > 0 || d?.SkillsCount > 0)?.length || 0,
      );
      setIsInit(false);
    }
    console.log(200033, storageGroupData, list);
    setAiAgentHostList?.(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isGetAllMachinesLoading && aiAgentHostList?.length) {
      getMachinesData(aiAgentHostList);
    }
  }, [isGetAllMachinesLoading]);

  // 筛选 + 分页
  const filteredData = useMemo(() => {
    let data = aiAgentHostList || [];

    // 告警筛选
    if (hasFilterAlarm) {
      data = data.filter(
        (d: any) => d?.SkillsCount > 0 || d?.BashCount > 0 || d?.MaliciousCount > 0,
      );
    }

    // 搜索筛选
    if (searchText.trim()) {
      data = data.filter((d: any) =>
        d?.[searchField]?.indexOf?.(searchText.trim()) >= 0,
      );
    }

    // query 筛选 (TagSearch compatibility)
    if (Object.keys(query).length) {
      data = data.filter((d: any) =>
        Object.keys(query)
          .map(a => query[a]?.some?.((x: any) => d?.[a]?.indexOf?.(x) >= 0))
          ?.every?.((v: any) => v),
      );
    }

    return data;
  }, [aiAgentHostList, hasFilterAlarm, searchText, searchField, query]);

  const pagedData = useMemo(
    () => filteredData?.slice?.((page - 1) * pageSize, page * pageSize) || [],
    [filteredData, page, pageSize],
  );

  const selectedAgents = useMemo(
    () => filteredData?.filter?.((item: any) => selectedAgentIds.includes(getAgentRowKey(item))) || [],
    [filteredData, selectedAgentIds, getAgentRowKey],
  );

  const pageSelectableIds = useMemo<string[]>(
    () => pagedData?.map?.((item: any) => getAgentRowKey(item))?.filter?.(Boolean) || [],
    [pagedData, getAgentRowKey],
  );

  const isPageAllSelected = pageSelectableIds.length > 0 && pageSelectableIds.every((id: string) => selectedAgentIds.includes(id));
  const isPagePartSelected = pageSelectableIds.some((id: string) => selectedAgentIds.includes(id)) && !isPageAllSelected;

  const toggleSelectAllPage = useCallback((checked: boolean) => {
    setSelectedAgentIds((prev: any) => {
      if (checked) {
        return Array.from(new Set([...prev, ...pageSelectableIds]));
      }
      return prev.filter((id: any) => !pageSelectableIds.includes(id));
    });
  }, [pageSelectableIds, setSelectedAgentIds]);

  const toggleSelectAgent = useCallback((item: any, checked: boolean) => {
    const id = getAgentRowKey(item);
    if (!id) {
      return;
    }
    setSelectedAgentIds((prev: any) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((itemId: any) => itemId !== id)));
  }, [getAgentRowKey, setSelectedAgentIds]);

  const handleBatchOpenProtect = useCallback(() => {
    if (!selectedAgents.length) {
      return;
    }
    setSelectedType?.('batch');
    setOpenProtectModalVisible?.(true);
  }, [selectedAgents.length, setSelectedType, setOpenProtectModalVisible]);

  useEffect(() => {
    const validIds = new Set((aiAgentHostList || []).map((item: any) => getAgentRowKey(item)).filter(Boolean));
    setSelectedAgentIds((prev: any) => prev.filter((id: any) => validIds.has(id)));
  }, [aiAgentHostList, getAgentRowKey, setSelectedAgentIds]);

  const tableLoading = isGetAllMachinesLoading || isLoading;

  const columns: {
    key: string;
    header: React.ReactNode;
    width?: string;
    fixedWidth?: number;
    sticky?: 'right';
    stickyRight?: number;
    render: (item: any) => React.ReactNode;
  }[] = (() => {
    const cols: {
      key: string;
      header: React.ReactNode;
      width?: string;
      fixedWidth?: number;
      sticky?: 'right';
      stickyRight?: number;
      render: (item: any) => React.ReactNode;
    }[] = [
        {
          key: 'Selection',
          header: (
            <Checkbox
              checked={isPageAllSelected ? true : isPagePartSelected ? 'indeterminate' : false}
              onCheckedChange={value => toggleSelectAllPage(Boolean(value))}
              aria-label="选择当前页AI Agent资产"
            />
          ),
          fixedWidth: 55,
          render: (item: any) => (
            <Checkbox
              checked={selectedAgentIds.includes(getAgentRowKey(item))}
              onCheckedChange={value => toggleSelectAgent(item, Boolean(value))}
              aria-label="选择AI Agent资产"
            />
          ),
        },
        {
          key: 'AgentName',
          header: 'AI Agent/调用模型',
          width: '15%',
          render: (item: any) => renderAgentItem(item, () => openAssetDetail(item)),
        },
        // {
        //   key: 'InstanceID',
        //   header: '资产ID/名称',
        //   width: '12%',
        //   render: (item: any) => (
        //     <div>
        //       <OverflowText copyable tooltip={item?.InstanceID}>
        //         {item?.InstanceID || '-'}
        //       </OverflowText>
        //       <div>
        //         <OverflowText copyable tooltip={item?.MachineName || item?.InstanceName}>
        //           {item?.MachineName || item?.InstanceName || '-'}
        //         </OverflowText>
        //       </div>
        //     </div>
        //   ),
        // },
      ];

    if (isUltimateVersion) {
      cols.push({
        key: 'ExposureStatus',
        header: '暴露情况',
        // width: '9%',
        render: (item: any) => (
          <div
            style={{
              display: 'inline-block',
              ...(item?.ExposureStatus === 'EXPOSED' ? { cursor: 'pointer' } : { color: '#888' }),
            }}
            onClick={() => {
              if (item?.ExposureStatus === 'EXPOSED') {
                openExposedDetailDrawer?.(item);
              }
            }}
          >
            <img
              style={{ display: 'inline-block', margin: '1px 4px 0 0', verticalAlign: 'top' }}
              src={`https://test-1256299843.cos.ap-shanghai.myqcloud.com/FEConsoleImage/icon_${item?.ExposureStatus === 'EXPOSED' ? '' : "un"}expose.svg`}
              alt="expose"
            />
            {EXPOSED_TYPE_MAP[item?.ExposureStatus] || '未知'}
          </div>
        ),
      });
    }

    cols.push(
      {
        key: 'SkillsCount',
        header: 'Skills风险',
        width: '8%',
        render: (item: any) => (
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm ${item?.SkillsCount ? 'text-red-500 cursor-pointer' : 'text-gray-400'}`}
              onClick={() => {
                if (item?.SkillsCount) {
                  openAssetDetail(item, 'skills');
                }
              }}
            >
              {item?.SkillsCount || 0}
            </span>
          </div>
        ),
      },
      {
        key: 'BashCount',
        header: '告警（高危命令/恶意请求）',
        width: '14%',
        render: (item: any) => (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`text-sm ${item?.BashCount ? 'text-red-500 cursor-pointer' : 'text-gray-400'}`}
                    onClick={() => {
                      if (item?.BashCount) {
                        openAssetDetail(item, 'alarms');
                      }
                    }}
                  >
                    {item?.BashCount || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent>高危命令</TooltipContent>
              </Tooltip>
            </div>/
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`text-sm ${item?.MaliciousCount ? 'text-red-500 cursor-pointer' : 'text-gray-400'}`}
                    onClick={() => {
                      if (item?.MaliciousCount) {
                        openAssetDetail(item, 'alarms', 'maslicious');
                      }
                    }}
                  >
                    {item?.MaliciousCount || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent>恶意请求</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ),
      },
      // {
      //   key: 'MetadataRiskList',
      //   header: 'metadata识别',
      //   width: '11%',
      //   render: (item: any) => renderMeta(item, { display: 'block', margin: 0 }),
      // },
      {
        key: 'IdentityTimeFirst',
        header: '识别时间',
        // width: '15%',
        render: (item: any) => (
          <span className="whitespace-nowrap text-xs">{moment(item?.IdentityTimeLast).format(FORMAT_NOW) || '-'}</span>
        ),
      },
      {
        key: 'IdentityMethod',
        header: (
          <span className="inline-flex items-center gap-1">
            识别来源
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <ul className="list-disc pl-4 text-xs">
                  <li>
                    <strong>OpenClaw指纹识别：</strong>
                    基于OpenClaw/进程指纹，识别服务器上是否运行 AI Agent 相关组件与服务。
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </span>
        ),
        // width: '10%',
        render: (item: any) => IDENTITY_MODE_MAP[item?.IdentityMethod] || '-',
      },
      {
        key: 'ProtectType',
        header: 'OpenClaw版本',
        // width: '10%',
        render: (item: any) =>
        (item?.AgentStatus === AGENT_STATUS_MAP?.UNINSTALLED?.code || item?.ProtectType === '-' || !item?.ProtectType ? (
          '-'
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`vulDetail-version-${ProtectLevelVersionMap?.[item?.ProtectType]} ${item?.ProtectType !== 'Flagship' ? 'cwp-hover-underline' : ''
                  }`}
              >
                {hostVersionMap[item?.ProtectType]}
              </div>
            </TooltipTrigger>
            {item?.ProtectType === 'BASIC_VERSION' ? showTrialBtn && hasTrialNum ? (
              <TooltipContent>
                <div>
                  <div>
                    当前主机为基础版，需升级旗舰版，以解锁完整能力。
                  </div>
                  <div>
                    基础版主机：
                    <strong>
                      {aiAgentHostList?.filter?.((d: any) => d?.ProtectType === 'BASIC_VERSION')?.length || 0}台（可申请试用）
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right', margin: '4px 0' }}>
                    <a style={{ color: '#fff', cursor: 'pointer' }} onClick={() => setOpenTrialModalVisible?.(true)}>
                      申请试用
                    </a>
                  </div>
                </div>
              </TooltipContent>
            ) : (
              <TooltipContent>
                <div>
                  <div style={{fontSize:14, fontWeight: 500}}>
                    升级旗舰版，解锁完整能力
                  </div>
                  <div style={{ color:'#fff' }}>
                    当前主机为基础版，需升级旗舰版，以解锁完整能力。
                  </div>
                  <div style={{ textAlign: 'right', margin: '4px 0' }}>
                    <a style={{ color: '#fff', cursor: 'pointer' }} onClick={() => {
                      setSelectedAgentIds([item?.InstanceID]);
                      setSelectedType?.('single');
                      setOpenProtectModalVisible?.(true);
                    }}>
                      开启防护
                    </a>
                  </div>
                </div>
              </TooltipContent>
            ) : item?.ProtectType !== 'Flagship' ? (
              <TooltipContent>请绑定旗舰版，解锁完整AI Agent防护能力</TooltipContent>
            ) : null}
          </Tooltip>
        )),
      },
      {
        key: 'hasOpenNetPolicy',
        header: '内网管控',
        // fixedWidth: STICKY_COL_NET_POLICY_W,
        // sticky: 'right',
        // stickyRight: STICKY_COL_OPERATE_W,
        render: (item: any) =>
        (item?.ProtectType !== 'Flagship' || item?.MachineType !== 'CVM' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-sm text-gray-500 csip-AIAgent-assets-ztag cursor-help">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                <span style={{ textDecoration: 'underline dashed rgba(0,0,0,0.3)', textUnderlineOffset: '5px' }}>不支持</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {item?.ProtectType !== 'Flagship'
                ? '非旗舰版暂不支持开启内网管控'
                : '非云服务器暂不支持开启内网管控'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className={`inline-flex items-center gap-1 text-sm csip-AIAgent-assets-ztag ${item?.hasOpenNetPolicy ? 'text-green-600' : 'text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item?.hasOpenNetPolicy ? 'bg-green-500' : 'bg-gray-400'}`} />
            {item?.hasOpenNetPolicy ? '已开启' : '未开启'}
          </span>
        )),
      },
      {
        key: 'Operate',
        header: '操作',
        // fixedWidth: STICKY_COL_OPERATE_W,
        // sticky: 'right',
        // stickyRight: 0,
        render: (item: any) =>
          (item?.ProtectType !== 'Flagship' && item?.ProtectType !== 'BASIC_VERSION' ? (
            '-'
          ) : item?.ProtectType === 'Flagship' ? (
            <Button variant="link" className="px-0 h-auto" onClick={() => openAssetDetail(item)}>
              详情
            </Button>
          ) : showTrialBtn && hasTrialNum ? (
            <Button variant="link" className="px-0 h-auto" onClick={() => setOpenTrialModalVisible?.(true)}>
              申请试用
            </Button>
          ) : (
            <Button variant="link" className="px-0 h-auto" onClick={() => {
              setSelectedType?.('single');
              setOpenProtectModalVisible?.(true);
            }}>
              开启防护
            </Button>
          )),
      },
    );

    return cols;
  })();

  return (
    <>
      {/* 操作栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEEF4]">
        <div className="flex items-center gap-2">
          <SyncAssetBtn refreshTable={refreshTable} rencentScanTime={rencentScanTime} />
          <Button
            variant="outline"
            disabled={!selectedAgents.length}
            onClick={handleBatchOpenProtect}
          >
            批量开启防护
          </Button>
          {selectedAgents.length > 0 && (
            <span className="text-sm text-[#525252] ml-2">
              已选择 <span className="font-semibold text-[#1447E6]">{selectedAgents.length}</span> 个 Agent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshTable}
                aria-label="刷新表格"
              >
                <RefreshCw className={tableLoading ? 'animate-spin' : ''} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>刷新</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 表格 */}
      <div className="relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        <Table autoFixedColumns={false}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={col.fixedWidth ? { width: col.fixedWidth } : col.width ? { width: col.width } : undefined}
                  fixed={col.sticky}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length > 0 ? (
              pagedData.map((item: any, idx: number) => (
                <TableRow
                  key={item?.InstanceID || idx}
                  data-state={selectedAgentIds.includes(getAgentRowKey(item)) ? 'selected' : undefined}
                >
                  {columns.map((col) => {
                    if (col.key === 'Operate') {
                      return (
                        <TableActionCell key={col.key} fixed={col.sticky}>
                          {col.render(item)}
                        </TableActionCell>
                      );
                    }
                    return (
                      <TableCell key={col.key} fixed={col.sticky}>
                        {col.render(item)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="!px-0 !py-0">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Inbox />
                      </EmptyMedia>
                      <EmptyTitle>暂无 AI Agent 资产</EmptyTitle>
                      <EmptyDescription>
                        点击「同步资产」从 OpenClaw 主机中识别 AI Agent
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="px-4 py-3 border-t border-[#EAEEF4]">
          <Pagination
            page={page}
            total={filteredData?.length || 0}
            pageSize={10}
            onChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
