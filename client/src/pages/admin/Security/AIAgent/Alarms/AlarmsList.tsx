import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Base64 } from 'js-base64';
import { useUnmount } from 'ahooks';
import { RefreshCw, Search, Info, Loader2, ChevronDown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import Pagination from '@/components/Pagination';

import { DescribeBashEventsNew, DescribeRiskDnsEventList } from '@/pages/admin/Security/api';

import {
  BASH_ALARM,
  MALICIOUS_ALARM,
  BASH_LEVEL_MAP,
  POLICY_TYPES,
  statusObjMapNew,
  BASH_LEVEL_DATA,
  BASH_STATUS_DATA,
  MALICIOUS_STATUS_DATA,
  MALICIOUS_STATUS_VAL_MAP,
  batchTitleMap,
  RISK_TYPE_BASH,
  RISK_TYPE_MALICIOUS,
} from '../constants';
import { getSelectionRows, modifyEventsStatus, getBatchStatus } from '../Common/CommonRiskHandleFunc';
import { renderAgentItem } from '../Assets/AgentAssetsList';

import MaliciousOperate from './MaliciousOperate';
import BatchOperatorDialog from './BatchOperatorDialog';
import BashOperate from './BashOperate';
import AlarmDetail from './AlarmDetail';

/** 威胁等级渲染 */
export const getRuleLevelText = (level: any) => (
  <span
    className={`malware-level-wrap bash-level-${level}`}
    style={{ color: !BASH_LEVEL_MAP[level] ? '#000' : '', borderRadius: '3px' }}
  >
    {BASH_LEVEL_MAP[level] || '无'}
  </span>
);

/** 策略类型渲染 */
export const renderPolicyType = (item: any) =>
(item?.RuleCategory === 0 || item?.RuleCategory === 1 ? (
  <span className="maliciousRequest-alarmList-policyType inline-flex items-center gap-1">
    {POLICY_TYPES[item?.RuleCategory] || '--'}
    {String(item?.RuleCategory) === '0' && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" style={{ verticalAlign: 'middle' }} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          系统策略为腾讯OpenClaw运营专家与算法专家经过多模型沉淀的规则配置，适用于大部分的高危命令检测。
        </TooltipContent>
      </Tooltip>
    )}
  </span>
) : (
  '--'
));

/** 文本溢出省略 + tooltip + 可复制 */
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
      className={`block truncate max-w-full ${onClick ? 'text-blue-600 cursor-pointer hover:underline' : 'text-gray-700'} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
      {copyable && (
        <Copy
          className="inline-block w-3 h-3 ml-1 text-gray-400 hover:text-blue-500 cursor-pointer align-middle"
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

/** 状态 Badge 映射 - 将 tea 的 theme 映射为 shadcn Badge variant */
const STATUS_VARIANT_MAP: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  error: 'destructive',
  success: 'default',
  warning: 'outline',
  info: 'secondary',
};

/** 排序方向切换 */
type SortDir = 'asc' | 'desc' | '';
const nextSort = (cur: SortDir): SortDir => {
  if (cur === '') return 'desc';
  if (cur === 'desc') return 'asc';
  return '';
};

export default function AlarmsList({
  machineVersionCount,
  aiAgentHostList,
  openAssetDetail = undefined,
  InstanceId = undefined,
  alarmTabId = undefined,
  getAllInitAlarmCount = undefined,
}: any) {
  const [showTable, setShowTable] = useState(true);
  const [selectedAlarmType, setSelectedAlarmType] = useState(BASH_ALARM);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [curTableData, setCurTableData] = useState<any[]>([]);
  const [batchType, setBatchType] = useState('');
  const [batchTimer, setBatchTimer] = useState(0);
  const [selectedItem, setSelectedItem] = useState({} as any);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchHandleModalVisible, setBatchHandleModalVisible] = useState(false);
  const [alarmDetailDrawerVisible, setAlarmDetailDrawerVisible] = useState(false);
  const [unHandleBashCount, setUnHandleBashCount] = useState(0);
  const [unHandleMaliciousCount, setUnHandleMaliciousCount] = useState(0);

  // 分页 & 搜索 & 排序 & 筛选
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 搜索
  const [searchKey, setSearchKey] = useState('');
  const [searchField, setSearchField] = useState<string>(
    selectedAlarmType === BASH_ALARM ? 'MachineName' : 'MachineName',
  );

  // 排序
  const [sortBy, setSortBy] = useState(selectedAlarmType === BASH_ALARM ? 'CreateTime' : 'LastTime');
  const [sortOrder, setSortOrder] = useState<SortDir>('desc');

  // 筛选
  const [filterStatus, setFilterStatus] = useState<string[]>(['0']);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);

  const requestIdRef = useRef(0);

  const getInitAlarmCount = async () => {
    if (!aiAgentHostList?.length && !InstanceId) {
      return;
    }
    const res: any = await Promise.all([
      DescribeBashEventsNew({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: 'Status', Values: ['0'] },
          { Name: 'InstanceID', Values: InstanceId ? [InstanceId] : aiAgentHostList?.map?.((d: { InstanceID: any }) => d.InstanceID) },
        ],
      }),
      DescribeRiskDnsEventList({
        Offset: 0,
        Limit: 1,
        Filters: [
          { Name: 'HandleStatus', Values: ['0'] },
          { Name: 'InstanceID', Values: InstanceId ? [InstanceId] : aiAgentHostList?.map?.((d: { InstanceID: any }) => d.InstanceID) },
        ],
      }),
    ]);
    setUnHandleBashCount(res?.[0]?.TotalCount || 0);
    setUnHandleMaliciousCount(res?.[1]?.TotalCount || 0);
  };

  const clearSelected = useCallback(() => {
    setSelectedRows([]);
    setSelectedKeys([]);
  }, []);

  /** 数据请求 */
  const fetchData = useCallback(async () => {
    if (!aiAgentHostList?.length) {
      setTableData([]);
      setTotalCount(0);
      return;
    }
    setIsLoading(true);
    const reqId = ++requestIdRef.current;

    const isBash = selectedAlarmType === BASH_ALARM;
    const params: any = {
      Offset: (page - 1) * pageSize,
      Limit: pageSize,
      Filters: [],
    };

    // 排序
    if (sortBy && sortOrder) {
      params.Order = sortOrder;
      params.By = sortBy;
    } else {
      params.Order = 'desc';
      params.By = isBash ? 'CreateTime' : 'LastTime';
    }

    // 状态筛选
    if (isBash) {
      const statusValues = filterStatus?.length ? filterStatus : BASH_STATUS_DATA.map(x => x.value);
      params.Filters.push({ Name: 'Status', Values: statusValues });
    } else {
      const statusValues = filterStatus?.length ? filterStatus : [];
      if (statusValues.length) {
        params.Filters.push({ Name: 'HandleStatus', Values: statusValues });
      }
    }

    // 等级筛选 (仅高危命令)
    if (isBash && filterLevel?.length) {
      params.Filters.push({ Name: 'RuleLevel', Values: filterLevel });
    }

    // 搜索
    if (searchKey.trim()) {
      if (searchField === 'MachineName') {
        params.Filters.push({ Name: 'MachineName', Values: [searchKey.trim()] });
      } else if (searchField === 'InstanceID') {
        params.Filters.push({ Name: 'InstanceID', Values: [searchKey.trim()] });
      } else if (searchField === 'RuleName') {
        params.Filters.push({ Name: 'RuleName', Values: [searchKey.trim()] });
      } else if (searchField === 'Domain') {
        params.Filters.push({ Name: 'Domain', Values: [Base64.encode(searchKey.trim())] });
      }
    }

    // InstanceId
    if (InstanceId) {
      params.Filters = params.Filters.filter((d: any) => d?.Name !== 'InstanceID').concat({
        Name: 'InstanceID',
        Values: [InstanceId],
      });
    } else {
      const allIds = aiAgentHostList.map((d: { InstanceID: any }) => d.InstanceID);
      const insId = params.Filters.find((d: any) => d?.Name === 'InstanceID');
      if (!insId) {
        params.Filters.push({ Name: 'InstanceID', Values: allIds });
      } else {
        const exists = insId.Values.filter((d: any) => allIds.includes(d));
        if (!exists.length) {
          setTableData([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }
        params.Filters = params.Filters.filter((d: any) => d?.Name !== 'InstanceID').concat({
          Name: 'InstanceID',
          Values: exists,
        });
      }
    }

    try {
      const resp: any = await (isBash
        ? DescribeBashEventsNew(params)
        : DescribeRiskDnsEventList(params));

      if (reqId !== requestIdRef.current) return;

      const list = resp?.List?.map?.((d: any) => ({
        ...d,
        AgentName: aiAgentHostList?.find?.((a: { InstanceID: any }) => a.InstanceID === d?.MachineExtraInfo?.InstanceID)?.AgentName || '',
      })) || [];

      setCurTableData(list);
      setTableData(list);
      setTotalCount(resp?.TotalCount ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (reqId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [selectedAlarmType, page, pageSize, sortBy, sortOrder, filterStatus, filterLevel, searchKey, searchField, aiAgentHostList, InstanceId]);

  const refreshTable = useCallback(() => {
    fetchData();
    getInitAlarmCount?.();
    getAllInitAlarmCount?.();
  }, [fetchData, getInitAlarmCount, getAllInitAlarmCount]);

  // 加载数据
  useEffect(() => {
    if (showTable) {
      fetchData();
    }
  }, [fetchData, showTable]);

  useEffect(() => {
    getInitAlarmCount();
  }, [InstanceId]);

  useEffect(() => {
    if (alarmTabId === MALICIOUS_ALARM) {
      setSelectedAlarmType(MALICIOUS_ALARM);
    }
  }, [alarmTabId]);

  useEffect(() => {
    getBatchStatus(RISK_TYPE_BASH, setIsBatchLoading, refreshTable, setBatchTimer);
  }, []);

  useUnmount(() => {
    window.clearInterval(batchTimer);
  });

  // 切换告警类型
  const handleSwitchAlarmType = (type: string) => {
    if (type === selectedAlarmType) return;
    setSelectedAlarmType(type);
    setPage(1);
    clearSelected();
    setBatchTimer(0);
    setIsBatchLoading(false);
    setFilterStatus(['0']);
    setFilterLevel([]);
    setSearchKey('');
    setSortBy(type === BASH_ALARM ? 'CreateTime' : 'LastTime');
    setSortOrder('desc');
    getBatchStatus(
      type === BASH_ALARM ? RISK_TYPE_BASH : RISK_TYPE_MALICIOUS,
      setIsBatchLoading,
      refreshTable,
      setBatchTimer,
    );
  };

  // 全选 / 取消全选
  const allSelected = tableData.length > 0 && tableData.every((d: any) => selectedKeys.includes(String(d?.Id)));
  const someSelected = tableData.some((d: any) => selectedKeys.includes(String(d?.Id))) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      const ids = tableData.map((d: any) => String(d?.Id));
      setSelectedKeys(prev => prev.filter(k => !ids.includes(k)));
      setSelectedRows(prev => prev.filter((r: any) => !ids.includes(String(r?.Id))));
    } else {
      const ids = tableData.map((d: any) => String(d?.Id));
      const newKeys = Array.from(new Set([...selectedKeys, ...ids]));
      setSelectedKeys(newKeys);
      const newRows: any = getSelectionRows(selectedRows, newKeys, curTableData);
      setSelectedRows(newRows);
    }
  };

  const toggleSelectRow = (item: any) => {
    const id = String(item?.Id);
    const isSelected = selectedKeys.includes(id);
    let newKeys: string[];
    if (isSelected) {
      newKeys = selectedKeys.filter(k => k !== id);
    } else {
      newKeys = [...selectedKeys, id];
    }
    setSelectedKeys(newKeys);
    const newRows: any = getSelectionRows(selectedRows, newKeys, curTableData);
    setSelectedRows(newRows);
  };

  /** 搜索字段选项 */
  const searchFields = useMemo(() => {
    const fields = [
      // { value: 'MachineName', label: '资产名称' },
      // ...(InstanceId ? [] : [{ value: 'InstanceID', label: '资产ID' }]),
    ];
    if (selectedAlarmType === BASH_ALARM) {
      fields.push({ value: 'RuleName', label: '命中策略名称' });
    } else {
      fields.push({ value: 'Domain', label: '恶意请求域名' });
    }
    return fields;
  }, [selectedAlarmType, InstanceId]);

  /** 状态筛选选项 */
  const statusOptions = selectedAlarmType === BASH_ALARM ? BASH_STATUS_DATA : MALICIOUS_STATUS_DATA;

  return (
    <div style={{ position: 'relative' }}>
      {isBatchLoading && (
        <div className="manage-batch-loading flex items-center gap-2 p-2 mb-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>正在进行批量操作中...请稍候...</span>
        </div>
      )}

      {/* 告警类型切换 + 操作栏 */}
      <div className="flex items-center gap-2 mb-4 mt-[10px]" style={{ padding: '10px 25px 0' }}>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectedAlarmType === BASH_ALARM
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => handleSwitchAlarmType(BASH_ALARM)}
          >
            高危命令（{unHandleBashCount}）
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectedAlarmType === MALICIOUS_ALARM
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => handleSwitchAlarmType(MALICIOUS_ALARM)}
          >
            恶意请求（{unHandleMaliciousCount}）
          </button>
        </div>

        <Button
          size="sm"
          disabled={!selectedKeys?.length}
          onClick={() => {
            setBatchType('mark');
            setBatchHandleModalVisible(true);
          }}
        >
          标记已处理
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={!selectedKeys?.length}>
              更多操作
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              disabled={!selectedKeys?.length}
              onClick={() => {
                setBatchType('ignore');
                setBatchHandleModalVisible(true);
              }}
            >
              忽略
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedKeys?.length}
              onClick={() => {
                setBatchType('del');
                setBatchHandleModalVisible(true);
              }}
            >
              删除记录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 ml-auto">
          {/* 状态筛选 */}
          <Select
            value={filterStatus.length === 1 ? filterStatus[0] : '__all__'}
            onValueChange={val => {
              if (val === '__all__') {
                setFilterStatus([]);
              } else {
                setFilterStatus([val]);
              }
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[100px]">
              <SelectValue placeholder="处理状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部状态</SelectItem>
              {statusOptions.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.text}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 等级筛选 (仅高危命令) */}
          {selectedAlarmType === BASH_ALARM && (
            <Select
              value={filterLevel.length === 1 ? filterLevel[0] : '__all__'}
              onValueChange={val => {
                if (val === '__all__') {
                  setFilterLevel([]);
                } else {
                  setFilterLevel([val]);
                }
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[100px]">
                <SelectValue placeholder="威胁等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部等级</SelectItem>
                {BASH_LEVEL_DATA.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 搜索 */}
          {/* <Select value={searchField} onValueChange={val => { setSearchField(val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {searchFields.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="搜索..."
              value={searchKey}
              onChange={e => { setSearchKey(e.target.value); setPage(1); }}
              className="pl-8 h-8 w-[180px] bg-white text-xs"
            />
          </div> */}

          <button
            onClick={refreshTable}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors"
            title="刷新表格"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div
        className="relative bg-white border-t border-gray-100 overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 900, tableLayout: 'fixed' }}>
            {selectedAlarmType === BASH_ALARM ? (
              /* 高危命令: 3+12+8+10+14+14+11+11+8+9 = 100% */
              <colgroup>
                <col style={{ width: '3%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
            ) : (
              /* 恶意请求: 3+13+12+15+15+8+14+9+11 = 100% */
              <colgroup>
                <col style={{ width: '3%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '11%' }} />
              </colgroup>
            )}
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {/* 勾选列 */}
                <th className="w-10 pl-6 pr-3 py-3 align-middle">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleSelectAll}
                    style={{ position: 'relative', top: -4 }}
                  />
                </th>
                {/* 告警名称 */}
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  告警名称
                </th>
                {/* 威胁等级 (仅高危命令) */}
                {selectedAlarmType === BASH_ALARM && (
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    威胁等级
                  </th>
                )}
                {/* 命中策略 */}
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  命中策略
                </th>
                {/* AI Agent/调用模型 */}
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  AI Agent/调用模型
                </th>
                {/* 资产ID/名称 */}
                {/* <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  资产ID/名称
                </th> */}
                {/* 命令内容 或 恶意请求域名 + 请求次数 */}
                {selectedAlarmType === BASH_ALARM ? (
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    命令内容
                  </th>
                ) : (
                  <>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                      恶意请求域名
                    </th>
                    <th
                      className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap cursor-pointer select-none"
                      onClick={() => {
                        if (sortBy === 'AccessCount') {
                          const ns = nextSort(sortOrder);
                          setSortOrder(ns);
                          if (!ns) setSortBy('');
                        } else {
                          setSortBy('AccessCount');
                          setSortOrder('desc');
                        }
                        setPage(1);
                      }}
                    >
                      请求次数
                      {sortBy === 'AccessCount' && (
                        <span className="ml-1 text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </th>
                  </>
                )}
                {/* 时间列 */}
                {selectedAlarmType === BASH_ALARM ? (
                  <>
                    <th
                      className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap cursor-pointer select-none"
                      onClick={() => {
                        if (sortBy === 'CreateTime') {
                          const ns = nextSort(sortOrder);
                          setSortOrder(ns);
                          if (!ns) setSortBy('');
                        } else {
                          setSortBy('CreateTime');
                          setSortOrder('desc');
                        }
                        setPage(1);
                      }}
                    >
                      发生时间
                      {sortBy === 'CreateTime' && (
                        <span className="ml-1 text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </th>
                    <th
                      className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap cursor-pointer select-none"
                      onClick={() => {
                        if (sortBy === 'ModifyTime') {
                          const ns = nextSort(sortOrder);
                          setSortOrder(ns);
                          if (!ns) setSortBy('');
                        } else {
                          setSortBy('ModifyTime');
                          setSortOrder('desc');
                        }
                        setPage(1);
                      }}
                    >
                      处理时间
                      {sortBy === 'ModifyTime' && (
                        <span className="ml-1 text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </th>
                  </>
                ) : (
                  <th
                    className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap cursor-pointer select-none"
                    onClick={() => {
                      if (sortBy === 'LastTime') {
                        const ns = nextSort(sortOrder);
                        setSortOrder(ns);
                        if (!ns) setSortBy('');
                      } else {
                        setSortBy('LastTime');
                        setSortOrder('desc');
                      }
                      setPage(1);
                    }}
                  >
                    最近请求时间
                    {sortBy === 'LastTime' && (
                      <span className="ml-1 text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                )}
                {/* 处理状态 */}
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                  处理状态
                </th>
                {/* 操作 */}
                <th className="text-left pl-3 pr-6 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.length > 0 ? (
                tableData.map((item: any, idx: number) => {
                  const rowId = String(item?.Id);
                  const isSelected = selectedKeys.includes(rowId);
                  const statusMap = selectedAlarmType === BASH_ALARM ? statusObjMapNew : MALICIOUS_STATUS_VAL_MAP;
                  const statusKey = selectedAlarmType === BASH_ALARM ? item?.Status : item?.HandleStatus;
                  const statusInfo = statusMap[statusKey];
                  const rowBg = isSelected ? 'bg-blue-50/30' : 'bg-white';

                  return (
                    <tr key={item?.Id || idx} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      {/* 勾选 */}
                      <td className="w-10 pl-6 pr-3 py-3 align-middle">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(item)}
                        />
                      </td>
                      {/* 告警名称 */}
                      <td className="px-3 py-3 text-sm">
                        <Button
                          variant="link"
                          className="px-0 h-auto text-sm text-left justify-start whitespace-normal break-words max-w-full"
                          onClick={() => {
                            setSelectedItem(item);
                            setAlarmDetailDrawerVisible(true);
                          }}
                        >
                          <span className="break-words">
                            {aiAgentHostList?.find?.((d: any) => d?.InstanceID === item?.MachineExtraInfo?.InstanceID)?.OpenClawName || ''}存在{selectedAlarmType === BASH_ALARM ? '高危命令' : '恶意请求'}
                          </span>
                        </Button>
                      </td>
                      {/* 威胁等级 */}
                      {selectedAlarmType === BASH_ALARM && (
                        <td className="px-3 py-3 text-sm max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{getRuleLevelText(item?.RuleLevel)}</td>
                      )}
                      {/* 命中策略 */}
                      <td className="px-3 py-3 text-sm text-gray-700 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="block truncate">
                          {(selectedAlarmType === BASH_ALARM ? item?.RuleName : item?.PolicyName) || '--'}
                        </span>
                      </td>
                      {/* AI Agent */}
                      <td className="px-3 py-3 text-sm max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {renderAgentItem(
                          aiAgentHostList?.find?.((a: { InstanceID: any }) => a.InstanceID === item?.MachineExtraInfo?.InstanceID),
                          InstanceId ? undefined : () => openAssetDetail?.(aiAgentHostList?.find?.((a: { InstanceID: any }) => a.InstanceID === item?.MachineExtraInfo?.InstanceID)),
                        )}
                      </td>
                      {/* 资产ID/名称 */}
                      {/* <td className="px-3 py-3 text-sm max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        <div>
                          <OverflowText
                            copyable
                            tooltip={item?.MachineExtraInfo?.InstanceID || item?.InstanceID || item?.InstanceId}
                          >
                            {item?.MachineExtraInfo?.InstanceID || item?.InstanceID || item?.InstanceId || '-'}
                          </OverflowText>
                          <div>
                            <OverflowText copyable tooltip={item?.MachineName || item?.HostName}>
                              {item?.MachineName || item?.HostName || '-'}
                            </OverflowText>
                          </div>
                        </div>
                      </td> */}
                      {/* 命令内容 / 域名 + 请求次数 */}
                      {selectedAlarmType === BASH_ALARM ? (
                        <td className="px-3 py-3 text-sm text-gray-700 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate">{item?.BashCmd || '-'}</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm break-all">{item?.BashCmd}</TooltipContent>
                          </Tooltip>
                        </td>
                      ) : (
                        <>
                          <td className="px-3 py-3 text-sm text-gray-700 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                            {item?.Domain?.length ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block truncate">{item.Domain}</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm break-all">{item.Url}</TooltipContent>
                              </Tooltip>
                            ) : '--'}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item?.AccessCount ?? '--'}</td>
                        </>
                      )}
                      {/* 时间 */}
                      {selectedAlarmType === BASH_ALARM ? (
                        <>
                          <td className="px-3 py-3 text-sm text-gray-500">{item?.CreateTime || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-500">{item?.ModifyTime || '-'}</td>
                        </>
                      ) : (
                        <td className="px-3 py-3 text-sm text-gray-500">{item?.LastTime || '-'}</td>
                      )}
                      {/* 处理状态 */}
                      <td className="px-3 py-3 text-sm">
                        <Badge
                          variant={STATUS_VARIANT_MAP[statusInfo?.theme] || 'secondary'}
                        >
                          {statusInfo?.text || '未知'}
                        </Badge>
                      </td>
                      {/* 操作 */}
                      <td className="pl-3 pr-6 py-3 text-sm">
                        {
                          selectedAlarmType === BASH_ALARM ? (
                            <BashOperate
                              record={item}
                              refreshTable={refreshTable}
                              clearSelected={clearSelected}
                              aiAgentHostList={aiAgentHostList}
                              hasFlagship={machineVersionCount?.UltimateVersionNum > 0}
                              openDetail={() => {
                                setSelectedItem(item);
                                setAlarmDetailDrawerVisible(true);
                              }}
                            />
                          ) : (
                            <MaliciousOperate
                              record={item}
                              refreshTable={refreshTable}
                              clearSelected={clearSelected}
                              aiAgentHostList={aiAgentHostList}
                              hasFlagship={machineVersionCount?.UltimateVersionNum > 0}
                              openDetail={() => {
                                setSelectedItem(item);
                                setAlarmDetailDrawerVisible(true);
                              }}
                            />
                          )
                        }
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={selectedAlarmType === BASH_ALARM ? 11 : 10}
                    className="px-3 py-12 text-center text-sm text-gray-400"
                  >
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={totalCount}
          pageSize={10}
          onChange={setPage}
        />
      </div>

      {alarmDetailDrawerVisible && (
        <AlarmDetail
          visible={alarmDetailDrawerVisible}
          onClose={() => setAlarmDetailDrawerVisible(false)}
          selectedAlarmType={selectedAlarmType}
          item={selectedItem}
          aiAgentHostList={aiAgentHostList}
          refreshTable={refreshTable}
          clearSelected={clearSelected}
          hasFlagship={machineVersionCount?.UltimateVersionNum > 0}
        />
      )}

      <BatchOperatorDialog
        visible={batchHandleModalVisible}
        title={batchTitleMap[batchType]}
        okText={'确定'}
        onCancel={() => setBatchHandleModalVisible(false)}
        content={
          <div>
            {batchType != 'del'
              && selectedRows?.filter(
                item => String(item?.[selectedAlarmType === BASH_ALARM ? 'Status' : 'HandleStatus']) != '0',
              )?.length > 0 && (
                <p style={{ marginTop: 10 }}>
                  其中有{selectedRows?.filter(
                    item => String(item?.[selectedAlarmType === BASH_ALARM ? 'Status' : 'HandleStatus']) !== '0',
                  )?.length}条数据将不能执行操作。只有数据为"待处理"状态，才能执行{batchTitleMap[batchType]}操作
                </p>
              )}
            {((batchType != 'del'
              && selectedRows?.filter(
                item => String(item?.[selectedAlarmType === BASH_ALARM ? 'Status' : 'HandleStatus']) === '0',
              )?.length > 0)
              || batchType == 'del') && (
                <p style={{ marginTop: 10 }}>
                  您确定要对选中的数据进行{batchTitleMap[batchType]}操作吗？
                </p>
              )}
          </div>
        }
        disabled={
          batchType != 'del'
          && selectedRows?.filter(
            item => String(item?.[selectedAlarmType === BASH_ALARM ? 'Status' : 'HandleStatus']) === '0',
          )?.length == 0
        }
        onOk={() => {
          setBatchHandleModalVisible(false);
          const allIds = selectedKeys?.map?.(Id => Number(Id));
          const ids = selectedRows
            ?.filter(item => String(item?.[selectedAlarmType === BASH_ALARM ? 'Status' : 'HandleStatus']) === '0')
            ?.map((item: any) => Number(item?.Id));
          modifyEventsStatus(
            selectedAlarmType === BASH_ALARM ? RISK_TYPE_BASH : RISK_TYPE_MALICIOUS,
            batchType,
            batchType === 'del' ? allIds : ids,
            () => {
              refreshTable();
              clearSelected();
            },
            setBatchTimer,
            setIsBatchLoading,
          );
        }}
        renderItem={item => {
          const ip = (item?.MachineIp || item?.Hostip || item?.HostIp) ?? '-';
          return `OpenClaw：${ip} - 命中策略：${selectedAlarmType === BASH_ALARM ? item?.RuleName ?? '-' : item?.PolicyName ?? '-'}`;
        }}
        data={selectedRows}
      />
    </div>
  );
}
