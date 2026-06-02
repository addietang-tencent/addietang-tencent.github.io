/*  */


import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Base64 } from 'js-base64';
import { toast } from 'sonner';
import { Info, RefreshCw, ChevronUp, ChevronDown, Search, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem as SelectOption,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import Pagination from '@/components/Pagination';
import { ModifyRiskDnsPolicyStatus, DescribeRiskDnsPolicyList, DeleteRiskDnsPolicy } from '@/pages/admin/Security/api';

import { BLOCK_DEEP_ID, SYSTEM_STANDARD_ID, BLOCK_STANDARD_ID } from '../BashPolicy/Constants';
import { AUTHORIZE_ROUTE, PRODUCT_NAME } from '../../constants';
import { fetchInitStorageShowColKeys, saveColKeys } from '../../Common/tablePanelColumnUtil';
import ExportCsv from '../../Common/ExportCsv';
import { getSelectionRows } from '../../Common/CommonRiskHandleFunc';

import { PolicyDetailDrawer } from './PolicyDetailDrawer';
import { EditPolicyDrawer } from './EditPolicyDrawer';
import {
  POLICY_TYPES,
  ALL_POLICY_TYPES_DATA,
  GetHostTypeText,
  getPolicyActionsData,
  getPolicyActionMap,
  POLICY_ACTION_THEME_MAP,
} from './CommonType';

const PAGE = 'MALICIOUSREQUEST_POLICYLIST';
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

export const renderSegOptions = (isShowIcon: boolean, isSelectStandard: boolean, setShowCloseBubble = (d: any) => d) => [
  {
    text: (
      <span className="inner">
        <span>{'标准模式'}</span>
        {isShowIcon ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className={`inline-block w-3.5 h-3.5 ml-0.5 align-middle cursor-help ${isSelectStandard ? 'text-blue-500' : 'text-muted-foreground'}`}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              {'综合多个引擎检测结果，仅针对高置信度的风险进行自动防护，更适合日常安全运营使用。'}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </span>
    ),
    value: '0',
  },
  {
    text: (
      <span className="inner">
        <span>{'重保模式'}</span>
        {isShowIcon ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className={`inline-block w-3.5 h-3.5 ml-0.5 align-middle cursor-help ${!isSelectStandard ? 'text-blue-500' : 'text-muted-foreground'}`}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              <div>
                {'综合多个引擎检测结果，针对中、高置信度的风险进行自动防护。'}
                <br />
                <span style={{ color: '#E24C55' }}>{'可能存在误拦截风险'}</span>
                {'，适合重保防护，请谨慎启用。'}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </span>
    ),
    value: '1',
  },
];

export const renderSegOptionsNew = (isShowIcon: boolean, isSelectStandard: boolean, setShowCloseBubble = (d: any) => d) => [
  {
    text: (
      <span className="inner">
        <span>{'标准模式'}</span>
      </span>
    ),
    tooltip: isShowIcon ? '综合多个引擎检测结果，仅针对高置信度的风险进行自动防护，更适合日常安全运营使用。' : null,
    value: '0',
  },
  {
    text: (
      <span className="inner">
        <span>{'重保模式'}</span>
      </span>
    ),
    tooltip: isShowIcon ? '综合多个引擎检测结果，针对中、高置信度的风险进行自动防护。可能存在误拦截风险，适合重保防护，请谨慎启用。' : null,
    value: '1',
  },
];

/** 列定义 */
interface ColDef {
  key: string;
  header: string;
  width?: number | string;
  isAlwaysShow?: boolean;
  render?: (item: any, rowKey: string, index: number) => React.ReactNode;
}

export function MaliciousPolicyList({ hasFlagship, getInitPolicyCount, aiAgentHostList }: any) {
  const requestIdRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isInit, setIsInit] = useState(true);
  const [handleType, setHandleType] = useState('');
  const [selectItem, setSelectItem] = useState({} as any);
  const [confirmModal, setConfirmModal] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([] as any);
  const [selectedRows, setSelectedRows] = useState([] as any);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingList, setLoadingList] = useState([] as any);
  const [tableshow, setTableshow] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalProtectMode, setModalProtectMode] = useState('0');
  const [autoBlockModalVisible, setAutoBlockModalVisible] = useState(false);
  const [modalAutoBlockSwitch, setModalAutoBlockSwitch] = useState(false);
  const [downloadParams, setDownloadParams] = useState({} as any);
  const [initColKeys, setInitColKeys] = useState<string[]>([]);
  const [changeModePopVisible, setChangeModePopVisible] = useState(false);
  const [standardBlockPolicy, setStandardBlockPolicy] = useState({} as any);
  const [importantBlockPolicy, setImportantBlockPolicy] = useState({} as any);
  const [closeAutoBlockModal, setCloseAutoBlockModal] = useState(false);
  const [columnSettingOpen, setColumnSettingOpen] = useState(false);

  // 筛选状态
  const [filterPolicyType, setFilterPolicyType] = useState('');
  const [filterPolicyAction, setFilterPolicyAction] = useState('');
  const [filterIsEnabled, setFilterIsEnabled] = useState('');
  const [searchField, setSearchField] = useState('PolicyName');
  const [searchKey, setSearchKey] = useState('');

  const refreshTable = useCallback(() => {
    // trigger refetch
    fetchTableData();
    getInitPolicyCount?.();
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedKeys([]);
    setSelectedRows([]);
  }, []);

  const getInitColKeys = async () => {
    const colKeys = await fetchInitStorageShowColKeys(PAGE);
    setInitColKeys(colKeys ?? []);
  };

  const getAutoBlockData = async () => {
    const res: any = await DescribeRiskDnsPolicyList({
      Offset: 0,
      Limit: 5,
      Filters: [{ Name: 'PolicyType', Values: ['0'] }],
    });
    const data = res?.List?.filter?.((item: any) => String(item?.PolicyAction) === '2');
    const standPolocy = data?.filter?.((item: any) => item?.PolicyId === BLOCK_STANDARD_ID)?.[0] || {};
    const importantPolicy = data?.filter?.((item: any) => item?.PolicyId === BLOCK_DEEP_ID)?.[0] || {};
    setStandardBlockPolicy(standPolocy);
    setImportantBlockPolicy(importantPolicy);
    fetchTableData(standPolocy, importantPolicy);
    setIsInit(false);
  };

  const handleSwitchChange = async (item: { PolicyId: any; IsEnabled: any; }, index = loadingIndex) => {
    setLoadingList((prev: boolean[]) => [...prev?.slice?.(0, index), true, ...prev?.slice?.(index + 1)]);
    const res: any = await ModifyRiskDnsPolicyStatus({
      PolicyId: item?.PolicyId,
      IsEnabled: String(item?.IsEnabled) === '0' ? 1 : 0,
    });
    if (res) {
      toast.success('操作成功');
      clearSelected();
      getAutoBlockData();
    }
  };

  const handleDelPolicy = async (item: any = undefined) => {
    setDetailVisible(false);
    const handleSelectedKeys = selectedKeys.map((k: string) => Number(k));
    const params = {
      PolicyIds: item?.PolicyId ? [Number(item?.PolicyId)] : handleSelectedKeys,
    };
    const res: any = await DeleteRiskDnsPolicy(params);
    if (res) {
      toast.success('操作成功');
      setDetailVisible(false);
      getAutoBlockData();
      clearSelected();
    }
  };

  const handleAutoBlockChange = async (isOpen: boolean, mode: string) => {
    setAutoBlockModalVisible(false);
    setLoadingList((prev: boolean[]) => [...prev?.slice?.(0, loadingIndex), true, ...prev?.slice?.(loadingIndex + 1)]);
    const firstCloseId = isOpen
      ? mode === '0'
        ? importantBlockPolicy?.PolicyId
        : standardBlockPolicy?.PolicyId
      : standardBlockPolicy?.PolicyId;
    const res: any = await ModifyRiskDnsPolicyStatus({
      PolicyId: firstCloseId,
      IsEnabled: 1,
    });
    const res1: any = await ModifyRiskDnsPolicyStatus({
      PolicyId:
        firstCloseId === standardBlockPolicy?.PolicyId ? importantBlockPolicy?.PolicyId : standardBlockPolicy?.PolicyId,
      IsEnabled: isOpen ? 0 : 1,
    });
    if (res && res1) {
      toast.success('操作成功');
    }
    getAutoBlockData();
  };

  /** 数据请求 — 替代原 TablePanel 的 request */
  const fetchTableData = useCallback(async (standPolocy = undefined, importantPolicy = undefined) => {
    // if (isInit) {
    //   getAutoBlockData();
    //   setIsInit(false);
    //   return;
    // }
    const rid = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const filters: any[] = [];
      if (filterPolicyType) filters.push({ Name: 'PolicyType', Values: [filterPolicyType] });
      if (filterPolicyAction) filters.push({ Name: 'PolicyAction', Values: [filterPolicyAction] });
      if (filterIsEnabled && filterIsEnabled !== 'undefined') filters.push({ Name: 'IsEnabled', Values: [filterIsEnabled] });
      if (searchKey) {
        const val = searchField === 'Domain' ? Base64.encode(searchKey) : searchKey;
        filters.push({ Name: searchField, Values: [val] });
      }

      const params: any = {
        Offset: 0,
        Limit: 100,
        Filters: filters,
        Order: 'DESC',
        By: 'UpdateTime',
      };
      setDownloadParams({ Filters: filters, Order: 'DESC', By: 'UpdateTime' });

      const res: any = await DescribeRiskDnsPolicyList(params);
      if (rid !== requestIdRef.current) return;

      let list = res?.List || [];
      if (res?.TotalCount > 100) {
        const num = Math.min(Math.ceil((res?.TotalCount - 100) / 100), 19);
        const resMore = await Promise.all(
          new Array(num)
            .fill(1)
            .map((d, index) => DescribeRiskDnsPolicyList({ ...params, Offset: 100 * (index + 1), Limit: 100 })),
        );
        if (rid !== requestIdRef.current) return;
        list = list?.concat?.(resMore?.map?.((item: any) => item?.List ?? [])?.flat?.(3));
      }

      // 拦截策略特殊处理
      const block = list?.filter?.((item: any) => String(item?.PolicyType) === '0' && String(item?.PolicyAction) === '2');
      list = (!block?.length
        ? []
        : (filterIsEnabled
          && ((String(filterIsEnabled) === '1'
            && [standPolocy || standardBlockPolicy, importantPolicy || importantBlockPolicy]?.every?.(d => String(d?.IsEnabled) === '1'))
            || (String(filterIsEnabled) === '0' && block?.length > 0)))
          || !filterIsEnabled
          || filterIsEnabled === 'undefined'
          ? [importantPolicy || importantBlockPolicy]
          : []
      )?.concat?.(list?.filter?.((item: any) => !(String(item?.PolicyType) === '0' && String(item?.PolicyAction) === '2')));

      if (detailVisible && selectItem?.PolicyId) {
        const found = list?.filter?.((item: { PolicyId: any; }) => item?.PolicyId === selectItem?.PolicyId)?.[0] || {};
        setSelectItem(found);
      }

      setAllData(list);
      setTotalCount(list?.length || 0);

      const offset = (page - 1) * pageSize;
      const currentData = list?.slice?.(offset, offset + pageSize) || [];
      setLoadingList(currentData.map(() => false));
      setTableData(currentData);
    } catch {
      // error handled
    } finally {
      if (rid === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [filterPolicyType, filterPolicyAction, filterIsEnabled, searchField, searchKey, page, pageSize, standardBlockPolicy, importantBlockPolicy, detailVisible, selectItem?.PolicyId]);

  // Re-slice when page/pageSize changes (from allData)
  useEffect(() => {
    if (!allData.length) return;
    const offset = (page - 1) * pageSize;
    const currentData = allData?.slice?.(offset, offset + pageSize) || [];
    setLoadingList(currentData.map(() => false));
    setTableData(currentData);
  }, [page, pageSize, allData]);

  useEffect(() => {
    if (autoBlockModalVisible) {
      const isOpen = String(standardBlockPolicy?.IsEnabled) === '0' || String(importantBlockPolicy?.IsEnabled) === '0';
      setModalAutoBlockSwitch(true);
      setModalProtectMode(isOpen ? String(standardBlockPolicy?.IsEnabled) : '0');
    }
  }, [autoBlockModalVisible]);

  useEffect(() => {
    getInitColKeys();
    getAutoBlockData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!isInit) {
      setPage(1);
      fetchTableData();
    }
  }, [filterPolicyType, filterPolicyAction, filterIsEnabled, searchKey]);

  // 列定义
  const allColumns: ColDef[] = useMemo(() => [
    {
      key: 'PolicyName',
      header: '策略名称',
      isAlwaysShow: true,
      render: (item, rowKey, recordIndex) =>
      (String(item?.PolicyType) === '0' ? (
        item?.PolicyName
      ) : (
        <Button
          variant="link"
          className="p-0 h-auto"
          title={item?.PolicyName}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            padding: 0
          }}
          onClick={() => {
            setSelectItem(item);
            setLoadingIndex(recordIndex);
            setDetailVisible(true);
          }}
        >
          {item?.PolicyName}
        </Button>
      )),
    },
    {
      key: 'PolicyType',
      header: '策略类型',
      render: item =>
      (item?.PolicyType === 0 || item?.PolicyType === 1 ? (
        <span className="maliciousRequest-alarmList-policyType">
          {POLICY_TYPES[item?.PolicyType] || '--'}
          {String(item?.PolicyType) === '0' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="inline-block w-3.5 h-3.5 text-muted-foreground ml-0.5 align-middle cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[320px]">
                {'系统策略为腾讯OpenClaw运营专家与算法专家经过多模型沉淀的规则配置，适用于大部分的恶意请求检测。'}
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      ) : (
        '--'
      )),
    },
    {
      key: 'CreateTime',
      header: '黑/白名单',
      width: 110,
      render: item =>
      (String(item?.PolicyAction) === '1' ? (
        <span className="maliciousRequest-alarmList-white">{'白名单'}</span>
      ) : (
        <span className="maliciousRequest-alarmList-black">{'黑名单'}</span>
      )),
    },
    {
      key: 'Domains',
      header: '域名详情',
      render: (item, rowKey, recordIndex) =>
      (String(item?.PolicyType) === '0' ? (
        '腾讯云恶意域名库'
      ) : item?.Domains?.length <= 1 ? (
        item?.Domains?.join?.('、') || '--'
      ) : (
        <span>
          {'共'}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => {
              setSelectItem(item);
              setLoadingIndex(recordIndex);
              setDetailVisible(true);
            }}
            style={{ verticalAlign: 'top', margin: 0 }}
          >
            <span>{item?.Domains?.length}</span>
          </Button>
          <span>{'个'}</span>
        </span>
      )),
    },
    {
      key: 'HostScope',
      header: '生效OpenClaw',
      render: (item, rowKey, recordIndex) => (
        <div className="maliciousRequest-policy-host">
          {String(item?.HostScope) !== '0' ? (
            GetHostTypeText(item?.HostScope)
          ) : (
            <span>
              {item?.HostIds?.length ? (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    setSelectItem(item);
                    setLoadingIndex(recordIndex);
                    setDetailVisible(true);
                  }}
                >
                  <span>{`${item?.HostIds?.length}`}</span>
                </Button>
              ) : (
                <span>0</span>
              )}
              <span>{'台'}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'UpdateTime',
      header: '更新时间',
    },
    {
      key: 'PolicyAction',
      header: '执行动作',
      width: 250,
      render: (item, text, index) => (
        <div>
          <Badge variant="secondary" className="csip-AIAgent-policyAction-dot">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${POLICY_ACTION_THEME_MAP[item?.PolicyAction] === 'success' ? 'bg-green-500'
              : POLICY_ACTION_THEME_MAP[item?.PolicyAction] === 'danger' ? 'bg-red-500'
                : 'bg-gray-400'
              }`} />
            {getPolicyActionMap()?.[item?.PolicyAction]}
          </Badge>
          {String(item?.PolicyType) === '0' && String(item?.PolicyAction) === '2' ? (
            (String(standardBlockPolicy?.IsEnabled) === '1' && String(importantBlockPolicy?.IsEnabled) === '1')
              || loadingList[index] ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block" style={{ margin: '3px 0 0 0', display: 'block' }}>
                    <ToggleGroup
                      type="single"
                      value="0"
                      className="autoBlock-protect-mode-segment pointer-events-none opacity-50"
                    >
                      {renderSegOptions(true, true).map(opt => (
                        <ToggleGroupItem key={opt.value} value={opt.value} style={{ height: 30 }}>
                          {opt.text}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {loadingList[index] ? null : !hasFlagship ? (
                    <span>
                      <span>{'恶意请求自动拦截属于旗舰版功能，开启后将自动拦截检测出的系统恶意请求，点击 '}</span>
                      <a style={{ color: 'var(--primary)' }} onClick={() => window.open(AUTHORIZE_ROUTE)}>
                        {'升级版本'}
                      </a>
                      <span>{'，一键开启拦截。'}</span>
                    </span>
                  ) : (
                    <span>
                      {'策略未开启，暂无法进行模式切换，可点击 '}
                      <a style={{ color: 'var(--primary)' }}
                        onClick={() => setAutoBlockModalVisible(true)}
                      >
                        {'开启策略'}
                      </a>
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <AlertDialog open={changeModePopVisible} onOpenChange={setChangeModePopVisible}>
                <AlertDialogTrigger asChild>
                  <span className="inline-block" style={{ margin: '3px 0 0 0', display: 'block' }}>
                    <ToggleGroup
                      type="single"
                      value={String(standardBlockPolicy?.IsEnabled)}
                      onValueChange={val => {
                        if (val && val !== String(standardBlockPolicy?.IsEnabled)) {
                          setChangeModePopVisible(true);
                        }
                      }}
                      className="autoBlock-protect-mode-segment"
                    >
                      {renderSegOptions(true, String(standardBlockPolicy?.IsEnabled) === '0').map(opt => (
                        <ToggleGroupItem key={opt.value} value={opt.value} style={{ height: 30 }}>
                          {opt.text}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {String(importantBlockPolicy?.IsEnabled) === '0'
                        ? '确认切换为标准模式？'
                        : '确认切换为重保模式？'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {String(importantBlockPolicy?.IsEnabled) === '0'
                        ? '确认后，将切换为标准模式，综合多个引擎检测结果，仅针对高置信度的风险进行自动防护，更适合日常安全运营使用。'
                        : (
                          <span>
                            {'确认后，将切换为重保模式，综合多个引擎检测结果，针对高、中置信度的风险进行自动防护，'}
                            <span style={{ color: '#E24C55' }}>{'可能存在误拦截风险'}</span>
                            {'，适合重保防护，请谨慎启用。'}
                          </span>
                        )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{'取消'}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      setLoadingIndex(index);
                      handleAutoBlockChange?.(true, String(importantBlockPolicy?.IsEnabled) === '0' ? '0' : '1');
                    }}>
                      {'确定'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          ) : null}
        </div>
      ),
    },
    {
      key: 'IsEnabled',
      header: '开关',
      width: 100,
      render: (item, rowKey, recordIndex) =>
      (String(item?.PolicyType) === '0'
        && String(item?.PolicyAction) !== '2'
        && String(item?.PolicyId) === String(SYSTEM_STANDARD_ID) ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Switch disabled checked style={{ marginLeft: 5 }} />
            </span>
          </TooltipTrigger>
          <TooltipContent>{'系统默认告警策略默认生效，不支持关闭'}</TooltipContent>
        </Tooltip>
      ) : String(item?.PolicyAction) === '2' && String(item?.PolicyType) === '0' ? (
        !hasFlagship ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Switch
                  disabled
                  checked={
                    String(standardBlockPolicy?.IsEnabled) === '0' || String(importantBlockPolicy?.IsEnabled) === '0'
                  }
                  style={{ marginLeft: 5 }}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>
                <span>{'恶意请求自动拦截属于旗舰版功能，开启后将自动拦截检测出的系统恶意请求，点击 '}</span>
                <a style={{ color: 'var(--primary)' }} onClick={() => window.open(AUTHORIZE_ROUTE)}>
                  {'升级版本'}
                </a>
                <span>{'，一键开启拦截。'}</span>
              </span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Switch
            disabled={loadingList[recordIndex]}
            checked={String(standardBlockPolicy?.IsEnabled) === '0' || String(importantBlockPolicy?.IsEnabled) === '0'}
            style={{ marginLeft: 5 }}
            onCheckedChange={() => {
              if (String(standardBlockPolicy?.IsEnabled) === '0' || String(importantBlockPolicy?.IsEnabled) === '0') {
                setCloseAutoBlockModal(true);
              } else {
                setAutoBlockModalVisible(true);
              }
            }}
          />
        )
      ) : String(item?.PolicyAction) === '2' && !hasFlagship ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Switch disabled checked={String(item?.IsEnabled) === '0'} style={{ marginLeft: 5 }} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <span>
              <span>{'当前暂无旗舰版OpenClaw，无法设置拦截策略，可'}</span>
              <a onClick={() => window.open(AUTHORIZE_ROUTE)} className="text-white underline cursor-pointer">
                {'点击升级版本'}
              </a>
            </span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <span>
              <Switch
                disabled={loadingList[recordIndex]}
                checked={String(item?.IsEnabled) === '0'}
                style={{ marginLeft: 5 }}
              />
            </span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{`确定${String(item?.IsEnabled) === '0' ? '关闭' : '开启'}此策略？`}</AlertDialogTitle>
              <AlertDialogDescription>
                {String(item?.IsEnabled) === '0'
                  ? '确认后，将关闭此策略，后续命中策略内容时，将不再执行相应动作，请谨慎操作。'
                  : '确认后，将开启此策略，后续命中策略内容时，将对应执行相应动作。'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{'取消'}</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleSwitchChange(item, recordIndex)}>
                {'确定'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )),
    },
    {
      key: 'Action',
      header: '操作',
      width: 100,
      isAlwaysShow: true,
      render: item => (
        <span>
          {String(item?.PolicyAction) === '2' && !hasFlagship ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="link" className="p-0 h-auto" disabled>
                    {'编辑'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <span>
                  {'当前暂无旗舰版OpenClaw，无法设置拦截策略，可'}
                  <a
                    onClick={() => window.open(AUTHORIZE_ROUTE)}
                    className="text-white underline cursor-pointer"
                  >
                    {'点击升级版本'}
                  </a>
                </span>
              </TooltipContent>
            </Tooltip>
          ) : String(item?.PolicyType) === '0' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="link" className="p-0 h-auto" disabled>
                    {'编辑'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{'系统策略不支持编辑'}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => {
                setHandleType('edit');
                setSelectItem(item);
                setSettingVisible(true);
              }}
            >
              {'编辑'}
            </Button>
          )}
          {String(item?.PolicyType) === '0' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="link" className="p-0 h-auto ml-2" disabled>
                    {'删除'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{'系统策略不支持删除'}</TooltipContent>
            </Tooltip>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto ml-2">{'删除'}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{'确认删除此策略？'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {'确认后，策略将被删除，无法恢复，策略范围内的资产将不再生效，请谨慎操作。'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{'取消'}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelPolicy(item)}>
                    {'确定'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </span>
      ),
    },
  ], [standardBlockPolicy, importantBlockPolicy, hasFlagship, loadingList, changeModePopVisible]);

  // 根据列设置过滤显示列
  const visibleColumns = useMemo(() => {
    if (!initColKeys?.length) return allColumns;
    return allColumns.filter(col => col.isAlwaysShow || initColKeys.includes(col.key));
  }, [allColumns, initColKeys]);

  // 行选择逻辑
  const selectableRows = useMemo(() => tableData.filter(d => String(d?.PolicyType) === '1'), [tableData]);
  const allSelected = selectableRows.length > 0 && selectableRows.every(d => selectedKeys.includes(String(d?.PolicyId)));
  const someSelected = !allSelected && selectableRows.some(d => selectedKeys.includes(String(d?.PolicyId)));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelected();
    } else {
      const keys = selectableRows.map(d => String(d?.PolicyId));
      const rows = getSelectionRows(selectedRows, keys, tableData, 'PolicyId');
      setSelectedKeys(keys);
      setSelectedRows(rows);
    }
  }, [allSelected, selectableRows, selectedRows, tableData, clearSelected]);

  const toggleSelectRow = useCallback((item: any) => {
    const key = String(item?.PolicyId);
    const isSelected = selectedKeys.includes(key);
    const newKeys = isSelected ? selectedKeys.filter((k: string) => k !== key) : [...selectedKeys, key];
    const newRows = getSelectionRows(selectedRows, newKeys, tableData, 'PolicyId');
    setSelectedKeys(newKeys);
    setSelectedRows(newRows);
  }, [selectedKeys, selectedRows, tableData]);

  return (
    <div>
      {/* ===== 工具栏 ===== */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3" style={{ padding: '0 12px' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            className="policy-create-btn"
            onClick={() => {
              setHandleType('create');
              setSelectItem({});
              setSettingVisible(true);
            }}
          >
            {'创建策略'}
          </Button>
          <Button
            variant="outline"
            disabled={selectedKeys?.length === 0}
            onClick={() => {
              setHandleType('del');
              setSelectItem({});
              setTableshow(false);
              setConfirmModal(true);
            }}
          >
            {'删除'}
          </Button>
          <Select value={filterPolicyType || 'undefined'} onValueChange={val => { setFilterPolicyType(val === 'undefined' ? '' : val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs" style={{ width: 130 }}>
              <SelectValue placeholder="请选择策略类型" />
            </SelectTrigger>
            <SelectContent>
              {ALL_POLICY_TYPES_DATA.map((d: any) => (
                <SelectOption key={d.value ?? '__all__'} value={d.value || '__all__'}>{d.text}</SelectOption>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPolicyAction || 'undefined'} onValueChange={val => { setFilterPolicyAction(val === 'undefined' ? '' : val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="请选择执行动作" />
            </SelectTrigger>
            <SelectContent>
              {getPolicyActionsData().map((d: any) => (
                <SelectOption key={d.value} value={String(d.value)}>{d.text}</SelectOption>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterIsEnabled || '__all__'} onValueChange={val => { setFilterIsEnabled(val === '__all__' ? '' : val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs" style={{ width: 130 }}>
              <SelectValue placeholder="请选择生效状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="__all__">全部生效状态</SelectOption>
              <SelectOption value="0">已生效</SelectOption>
              <SelectOption value="1">未生效</SelectOption>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={searchField} onValueChange={val => { setSearchField(val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="PolicyName">策略名称</SelectOption>
              <SelectOption value="Domain">域名</SelectOption>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="请输入关键字搜索"
              value={searchKey}
              onChange={e => { setSearchKey(e.target.value); setPage(1); }}
              className="pl-8 h-8 w-[180px] bg-white text-xs"
            />
          </div>
          <button
            onClick={() => getAutoBlockData()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors"
            title="刷新表格"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {/* 列设置 */}
          {/* <DropdownMenu open={columnSettingOpen} onOpenChange={setColumnSettingOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors"
                title="自定义展示列"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs text-gray-500">{`已勾选${initColKeys?.length || allColumns.filter(c => !c.isAlwaysShow).length}个`}</div>
              <DropdownMenuSeparator />
              {allColumns.filter(c => !c.isAlwaysShow).map(col => (
                <DropdownMenuItem
                  key={col.key}
                  className="text-xs"
                  onSelect={e => {
                    e.preventDefault();
                    const newKeys = initColKeys.includes(col.key)
                      ? initColKeys.filter(k => k !== col.key)
                      : [...initColKeys, col.key];
                    setInitColKeys(newKeys);
                    saveColKeys(PAGE, newKeys);
                  }}
                >
                  <Checkbox
                    checked={!initColKeys?.length || initColKeys.includes(col.key)}
                    className="mr-2"
                  />
                  {col.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportCsv
            requestApi="ExportRiskDnsPolicyList"
            params={downloadParams}
            reportTag={`${PRODUCT_NAME}.manage.maliciousRequest.policy.download`}
            onFinish={data => {
              window.location.href = data.DownloadUrl;
              return false;
            }}
          /> */}
        </div>
      </div>

      {/* ===== 表格 ===== */}
      <div className="relative bg-white border-t border-gray-100 overflow-hidden table-panel-searchTag">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1100 }}>
            <colgroup>
              <col style={{ width: 40 }} />
              {visibleColumns.map(col => (
                <col key={col.key} style={{ width: col.width || 'auto' }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                {visibleColumns.map(col => (
                  <th
                    key={col.key}
                    className="text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.length > 0 ? (
                tableData.map((item: any, idx: number) => {
                  const rowId = String(item?.PolicyId);
                  const isSelected = selectedKeys.includes(rowId);
                  const isSelectable = String(item?.PolicyType) === '1';
                  return (
                    <tr key={item?.PolicyId || idx} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      <td className="w-10 px-3 py-3">
                        {isSelectable ? (
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelectRow(item)} />
                        ) : (
                          <Checkbox disabled checked={false} />
                        )}
                      </td>
                      {visibleColumns.map(col => (
                        <td key={col.key} className="px-3 py-3 text-sm">
                          {col.render
                            ? col.render(item, rowId, idx)
                            : (item?.[col.key] ?? '--')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="text-center py-16 text-gray-400 text-sm">
                    {'暂无数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        <Pagination page={page} total={totalCount} pageSize={10} onChange={setPage} />
        {/* <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">每页</span>
            <Select value={String(pageSize)} onValueChange={val => { setPageSize(Number(val)); setPage(1); }}>
              <SelectTrigger className="h-7 text-xs w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(s => (
                  <SelectOption key={s} value={String(s)}>{s}条</SelectOption>
                ))}
              </SelectContent>
            </Select>
          </div> */}
      </div>

      <EditPolicyDrawer
        visible={settingVisible}
        setVisible={setSettingVisible}
        type={handleType}
        selectItem={selectItem}
        refreshTable={() => getAutoBlockData()}
        hasFlagship={hasFlagship}
        aiAgentHostList={aiAgentHostList}
      />

      <PolicyDetailDrawer
        loading={loadingList[loadingIndex]}
        selectItem={selectItem}
        detailVisible={detailVisible}
        setDetailVisible={setDetailVisible}
        hasFlagship={hasFlagship}
        setHandleType={setHandleType}
        handleDelPolicy={handleDelPolicy}
        handleSwitchChange={handleSwitchChange}
        setSettingVisible={setSettingVisible}
        aiAgentHostList={aiAgentHostList}
      />

      {/* 关闭自动拦截确认弹窗 */}
      <Dialog open={closeAutoBlockModal} onOpenChange={setCloseAutoBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'确认关闭自动拦截？'}</DialogTitle>
          </DialogHeader>
          <p style={{ color: '#444', marginTop: 10 }}>
            {'关闭该功能后，OpenClaw将不再自动拦截检测到的恶意域名/IP访问，可能造成被入侵风险，请谨慎操作。'}
          </p>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                handleAutoBlockChange(false, '0');
                setCloseAutoBlockModal(false);
              }}
            >
              {'确定'}
            </Button>
            <Button variant="outline" onClick={() => setCloseAutoBlockModal(false)}>
              {'取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量操作确认弹窗 */}
      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {`确定${handleType === 'del' ? '删除' : String(selectItem?.IsEnabled) === '0' ? '关闭' : '开启'}${selectedKeys?.length > 0 ? `选中的 ${selectedKeys?.length || 0}个 ` : '此'}策略吗？`}
            </DialogTitle>
          </DialogHeader>
          <div>
            <p style={{ color: '#444', marginTop: 10 }}>
              {handleType === 'del'
                ? '确认后，策略将被删除，无法恢复，策略范围内的资产将不再生效，请谨慎操作。'
                : String(selectItem?.IsEnabled) === '0'
                  ? `确认后，策略将被关闭，生效范围内的OpenClaw将不再${selectItem?.PolicyAction == 2
                    ? '进行拦截'
                    : selectItem?.PolicyAction == 1
                      ? '放行'
                      : '进行告警'}。`
                  : `确认后，策略将生效，生效范围内的OpenClaw将${selectItem?.PolicyAction == 2
                    ? '开启拦截'
                    : selectItem?.PolicyAction == 1
                      ? '开启放行'
                      : '开启告警'}，请谨慎操作。`}
            </p>
            {selectedKeys?.length > 0 && !selectItem?.PolicyId && selectedRows?.length > 0 && handleType !== 'del' && (
              <div style={{ marginTop: 10 }}>
                <p>
                  您已选择
                  <span style={{ color: '#0ABF5B', margin: '0 3px' }}>
                    {selectedRows?.length}个
                  </span>
                  策略，
                  <Button variant="link" className="p-0 h-auto" onClick={() => setTableshow(!tableshow)} style={{ verticalAlign: 'top' }}>
                    查看详情
                    {tableshow ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}
                  </Button>
                </p>
                <div style={{ padding: tableshow ? '10px 0' : '' }}>
                  <div style={{ display: tableshow ? 'block' : 'none' }}>
                    <ScrollArea className="max-h-[360px]">
                      <Table>
                        <TableBody>
                          {(selectedRows || []).map((record: any, recordIndex: number) => (
                            <TableRow key={recordIndex}>
                              <TableCell className="w-[50px]">{recordIndex + 1}</TableCell>
                              <TableCell>{record?.PolicyName ?? '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                setConfirmModal(false);
                if (handleType === 'del') {
                  handleDelPolicy();
                } else {
                  handleSwitchChange(selectItem);
                }
              }}
            >
              {'确定'}
            </Button>
            <Button variant="outline" onClick={() => setConfirmModal(false)}>
              {'取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 恶意请求自动拦截设置弹窗 */}
      <Dialog open={autoBlockModalVisible} onOpenChange={setAutoBlockModalVisible}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{'恶意请求自动拦截'}</DialogTitle>
          </DialogHeader>
          <div>
            <div>
              <span style={{ color: '#888' }}>{'拦截开关：'}</span>
              <Switch
                checked={modalAutoBlockSwitch}
                style={{ margin: '0 0 0 10px' }}
                onCheckedChange={val => setModalAutoBlockSwitch(val)}
              />
            </div>
            <div style={{ padding: 16, margin: '16px 0', background: '#F3F4F7' }}>
              <strong>{'拦截原理说明：'}</strong>
              <span style={{ color: '#444' }}>
                {'恶意请求是终止进程对规则域名/ip的访问，不会杀掉进程，会终止这个访问请求。'}
              </span>
              <div style={{ margin: '10px 0 0 0', padding: '0 0 2px 3px', color: '#e3eaef', background: '#000' }}>
                root@VM-0-17-ubuntu:/home/ubuntu# ping 14.119.104.189 <br />
                ping: 14.119.104.189: Non-recoverable failure in name resolution
              </div>
            </div>
            <div className="maliciousRequest-editPolicy">
              <div>
                <div className="label-txt mg-tp-6" style={{ width: 70 }}>
                  {'防护模式：'}
                </div>
                <div className="content">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <ToggleGroup
                          type="single"
                          className={`autoBlock-protect-mode-segment ${!modalAutoBlockSwitch ? 'pointer-events-none opacity-50' : ''}`}
                          value={modalProtectMode}
                          onValueChange={value => { if (value) setModalProtectMode(value); }}
                        >
                          {renderSegOptions(false, modalProtectMode === '0').map(opt => (
                            <ToggleGroupItem key={opt.value} value={opt.value}>
                              {opt.text}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </span>
                    </TooltipTrigger>
                    {!modalAutoBlockSwitch && (
                      <TooltipContent>{'拦截开关未开启，暂无法进行模式切换'}</TooltipContent>
                    )}
                  </Tooltip>
                  {modalProtectMode === '0' ? (
                    <div style={{ marginTop: 5 }}>
                      {'仅针对高置信度的风险进行自动防护，更适合日常安全运营使用。'}
                      <Badge variant="secondary" style={{ margin: '-2px 0 0 0' }}>
                        {'推荐'}
                      </Badge>
                    </div>
                  ) : (
                    <div style={{ color: '#444', marginTop: 5 }}>
                      <div>{'综合多个引擎检测结果，针对中、高置信度的风险进行自动拦截。'}</div>
                      <div>
                        <span style={{ color: '#E24C55' }}>{'可能存在误拦截风险'}</span>
                        {'，适合重保防护，请谨慎启用。'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="default" onClick={() => handleAutoBlockChange(modalAutoBlockSwitch, modalProtectMode)}>
              {'确定'}
            </Button>
            <Button variant="outline" onClick={() => setAutoBlockModalVisible(false)}>
              {'取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
