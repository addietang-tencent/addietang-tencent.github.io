import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Base64 } from 'js-base64';
import { toast } from 'sonner';
import { Info, RefreshCw, ChevronUp, ChevronDown, AlertTriangle, Search, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
  TableHead,
  TableHeader,
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
import { ModifyBashPolicyStatus, DeleteBashPolicies, DescribeBashPolicies, ModifyBashPolicy } from '@/pages/admin/Security/api';

import { renderSegOptionsNew } from '../MaliciousPolicy/MaliciousPolicyList';
import { AUTHORIZE_ROUTE } from '../../constants';
import {
  fetchInitStorageShowColKeys,
  saveColKeys,
  getMaxRemoteStorage,
  setMaxRemoteStorage,
} from '../../Common/tablePanelColumnUtil';
import MultiTypeSelectMachine from '../../Common/MultiTypeSelectMachine';
import ExportCsv from '../../Common/ExportCsv';
import CvmSelectComponent from '../../Common/CvmSelectComponent';
import { setCookie, getCookie } from '../../Common/cookieUtil';
import { getSelectionRows } from '../../Common/CommonRiskHandleFunc';

import { PolicyDetailDrawer } from './PolicyDetailDrawer';
import { EditPolicyDrawer } from './EditPolicyDrawer';
import {
  RulesAttributeMap,
  POLICY_TYPES,
  BASH_POLICY_LEVEL_ALL,
  ALL_POLICY_TYPES_DATA,
  GetHostTypeText,
  getPolicyActionMap,
  BASH_LEVEL_MAP,
  BLOCK_STANDARD_ID,
  BLOCK_DEEP_ID,
  SYSTEM_STANDARD_ID,
  BASH_DETAIL_TORULE,
  BASH_DETAIL_TOCREATE,
  getPolicyActionsData,
  POLICY_ACTION_THEME_MAP,
  hostVersionMap,
  LICENSE_TYPES_MAP,
  CSIP_AI_AGENT_BATCH_TIPS,
} from './Constants';

const PAGE = 'CSIP_BASH_POLICYLIST';

/** 每页条数可选列表 */
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

/** 列定义 */
interface ColDef {
  key: string;
  header: string;
  width?: number | string;
  fixed?: 'left' | 'right';
  stickyLeft?: number;
  stickyRight?: number;
  isAlwaysShow?: boolean;
  ellipsis?: boolean;
  columnEmptyValue?: string;
  render?: (item: any, rowKey: string, recordIndex: number) => React.ReactNode;
}

export const getRuleLevelText = (level: any) => (
  <span
    className={`malware-level-wrap bash-level-${level}`}
    style={{ color: !BASH_LEVEL_MAP[level] ? '#000' : '', borderRadius: '3px' }}
  >
    {BASH_LEVEL_MAP[level] || '无'}
  </span>
);

export const HIGH_CMD = [
  { text: '删除根目录', value: 'rm -rf /', cmd: 'rm -rf /$' },
  { text: '删除用户主目录', value: 'rm -rf ~/', cmd: 'rm -rf ~/$' },
  { text: '格式化磁盘', value: 'mkfs', cmd: 'mkfs' },
  { text: '原始磁盘写入', value: 'dd if=* of=/dev/sd*', cmd: 'dd if=.* of=/dev/sd.*' },
  {
    paramsText: '直接写入磁盘设备',
    text: '直接写入磁盘设备',
    value: (
      <>
        <span>&gt;</span> /dev/sd*
      </>
    ),
    cmd: '> /dev/sd.*',
  },
  {
    paramsText: '写入proc文件系统',
    text: '写入 /proc 文件系统',
    value: (
      <>
        echo * <span>&gt;</span> /proc/*
      </>
    ),
    cmd: 'echo .* > /proc/.*',
  },
  {
    paramsText: 'AI在任意目录启动http服务',
    text: 'AI在任意目录启动http服务',
    value: <span>python(3)?\s+-m\s+http\.server\s+</span>,
    cmd: 'python(3)?\\s+-m\\s+http\\.server\\s+',
  },
];

export function BashPolicyList({ hasFlagship, getInitPolicyCount, aiAgentHostList, isFromDetail }: any) {
  const [handleType, setHandleType] = useState('');
  const [selectItem, setSelectItem] = useState({} as any);
  const [confirmModal, setConfirmModal] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingList, setLoadingList] = useState<boolean[]>([]);
  const [tableshow, setTableshow] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [modalProtectMode, setModalProtectMode] = useState('0');
  const [autoBlockModalVisible, setAutoBlockModalVisible] = useState(false);
  const [modalAutoBlockSwitch, setModalAutoBlockSwitch] = useState(false);
  const [downloadParams, setDownloadParams] = useState({} as any);
  const [initColKeys, setInitColKeys] = useState<string[]>([]);
  const [changeModePopVisible, setChangeModePopVisible] = useState(false);
  const [standardBlockPolicy, setStandardBlockPolicy] = useState({} as any);
  const [importantBlockPolicy, setImportantBlockPolicy] = useState({} as any);
  const [closeAutoBlockModal, setCloseAutoBlockModal] = useState(false);
  const [showCloseBubble, setShowCloseBubble] = useState(true);
  const [batchAddPolicyModalVisible, setBatchAddPolicyModalVisible] = useState(false);
  const [selectMachine, setSelectMachine] = useState<string[]>([]);
  const [selectQuuidList] = useState<string[]>([]);
  const [isShowBatchTips, setIsShowBatchTips] = useState(false);
  const [hasExpandBatchAddModal, setHasExpandBatchAddModal] = useState(true);
  const [columnSettingOpen, setColumnSettingOpen] = useState(false);

  // 搜索
  const [searchField, setSearchField] = useState<string>('Name');
  const [searchKey, setSearchKey] = useState('');

  // 筛选
  const [filterBashAction, setFilterBashAction] = useState<string>('');
  const [filterEnable, setFilterEnable] = useState<string>('');
  const [filterWhite, setFilterWhite] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string[]>(BASH_POLICY_LEVEL_ALL);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const requestIdRef = useRef(0);

  const clearSelected = useCallback(() => {
    setSelectedKeys([]);
    setSelectedRows([]);
  }, []);

  const getInitColKeys = async () => {
    const colKeys = await fetchInitStorageShowColKeys(PAGE);
    setInitColKeys(colKeys ?? []);
  };

  const batchCreatePolicy = async () => {
    setBatchAddPolicyModalVisible(false);
    const res: any = await Promise.all(
      HIGH_CMD.map(d =>
        ModifyBashPolicy({
          Policy: {
            Name: `拦截${d?.paramsText || d.text}命令`,
            Category: 1,
            Descript: `拦截命令${d.cmd}`,
            White: 0,
            BashAction: 2,
            Scope: 0,
            Enable: 1,
            Level: 1,
            Quuids: selectMachine?.filter?.(d => d)?.map?.(d => d),
            Rules: { Process: { Cmdline: Base64.encode(d?.cmd) } },
          } as any,
        }),
      ),
    );
    if (res) {
      setMaxRemoteStorage(CSIP_AI_AGENT_BATCH_TIPS, '1');
      setIsShowBatchTips(false);
      toast.success('操作成功');
    }
    refreshTable?.();
  };

  const getAutoBlockData = async () => {
    const res: any = await DescribeBashPolicies({
      Offset: 0,
      Limit: 5,
      Filters: [{ Name: 'Category', Values: ['0'] }],
    });
    const data = res?.List?.filter?.((item: { BashAction: any; }) => String(item?.BashAction) === '2');
    setStandardBlockPolicy(data?.filter?.((item: { Id: number; }) => item?.Id === BLOCK_STANDARD_ID)?.[0] || {});
    setImportantBlockPolicy(data?.filter?.((item: { Id: number; }) => item?.Id === BLOCK_DEEP_ID)?.[0] || {});
    fetchTableData();
  };

  const handleSwitchChange = async (item: { Id: any; Enable: any; }, index = loadingIndex) => {
    setLoadingList(prev => [...prev.slice(0, index), true, ...prev.slice(index + 1)]);
    const res: any = await ModifyBashPolicyStatus({
      Id: item?.Id,
      Enable: String(item?.Enable) === '1' ? 0 : 1,
    });
    if (res) {
      toast.success('操作成功');
      clearSelected();
      if (tableData?.length === 1 && filterEnable && page > 1) {
        setPage(prev => Math.max(prev - 1, 1));
      } else {
        getAutoBlockData();
      }
    } else {
      setLoadingList(tableData?.map?.(() => false) ?? []);
    }
  };

  const handleDelPolicy = async (item: any = undefined) => {
    setDetailVisible(false);
    const handleSelectedKeys = selectedKeys.map(item => Number(item));
    const params = {
      Ids: item?.Id ? [Number(item?.Id)] : handleSelectedKeys,
    };
    const res: any = await DeleteBashPolicies(params);
    if (res) {
      toast.success('操作成功');
      setDetailVisible(false);
      if (params?.Ids?.length === tableData?.length && page > 1) {
        setPage(prev => Math.max(prev - 1, 1));
      } else {
        getAutoBlockData();
      }
      clearSelected();
    }
  };

  const handleAutoBlockChange = async (isOpen: boolean, mode: string) => {
    setAutoBlockModalVisible(false);
    setLoadingList(prev => [...prev.slice(0, loadingIndex), true, ...prev.slice(loadingIndex + 1)]);
    const firstCloseId = isOpen
      ? mode === '0'
        ? importantBlockPolicy?.Id
        : standardBlockPolicy?.Id
      : standardBlockPolicy?.Id;
    const res: any = await ModifyBashPolicyStatus({ Id: firstCloseId, Enable: 0 });
    const res1: any = await ModifyBashPolicyStatus({
      Id: firstCloseId === standardBlockPolicy?.Id ? importantBlockPolicy?.Id : standardBlockPolicy?.Id,
      Enable: isOpen ? 1 : 0,
    });
    if (res && res1) {
      toast.success('操作成功');
    }
    getAutoBlockData();
  };

  /** 数据请求 — 替代原 TablePanel 的 request */
  const fetchTableData = useCallback(async () => {
    setIsLoading(true);
    const reqId = ++requestIdRef.current;

    const filters: any[] = [];

    // 搜索
    if (searchKey.trim()) {
      if (searchField === 'Rule') {
        filters.push({ Name: 'Rule', Values: [Base64.encode(searchKey.trim())] });
      } else {
        filters.push({ Name: searchField, Values: [searchKey.trim()] });
      }
    }
    // 筛选
    if (filterBashAction) filters.push({ Name: 'BashAction', Values: [filterBashAction] });
    if (filterEnable) filters.push({ Name: 'Enable', Values: [filterEnable] });
    if (filterWhite) filters.push({ Name: 'White', Values: [filterWhite] });
    if (filterLevel?.length && filterLevel.join(',') !== BASH_POLICY_LEVEL_ALL.join(',')) {
      filters.push({ Name: 'Level', Values: filterLevel });
    }
    if (filterCategory) filters.push({ Name: 'Category', Values: [filterCategory] });

    const params: any = { Filters: filters };
    setDownloadParams({ Filters: filters });

    try {
      const res: any = await DescribeBashPolicies({ ...params, Limit: 100, Offset: 0 });
      if (reqId !== requestIdRef.current) return;

      let list = res?.List || [];
      if (res?.TotalCount > 100) {
        const num = Math.min(Math.ceil((res?.TotalCount - 100) / 100), 19);
        const resMore = await Promise.all(
          new Array(num)
            .fill(1)
            .map((_, index) => DescribeBashPolicies({ ...params, Offset: 100 * (index + 1), Limit: 100 })),
        );
        list = list.concat(resMore?.map?.((item: any) => item?.List ?? [])?.flat?.(3));
      }
      if (reqId !== requestIdRef.current) return;

      // 处理系统拦截策略排序
      const block = list?.filter?.((item: any) => String(item?.Category) === '0' && String(item?.BashAction) === '2');
      list = (!block?.length
        ? []
        : (filterEnable
          && ((filterEnable === '0'
            && [standardBlockPolicy, importantBlockPolicy]?.every?.(d => String(d?.Enable) === '0'))
            || (filterEnable === '1' && block?.length > 0)))
          || !filterEnable
          ? [importantBlockPolicy]
          : []
      )?.concat?.(list?.filter?.((item: any) => !(String(item?.Category) === '0' && String(item?.BashAction) === '2')));

      if (detailVisible && selectItem?.Id) {
        const found = list?.find?.((item: any) => item?.Id === selectItem?.Id);
        if (found) setSelectItem(found);
      }

      setAllData(list);
      setTotalCount(list?.length || 0);

      const offset = (page - 1) * pageSize;
      const currentData = list?.slice?.(offset, offset + pageSize) || [];
      setLoadingList(currentData.map(() => false));
      setTableData(currentData);
    } catch (err) {
      console.error(err);
    } finally {
      if (reqId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, pageSize, searchKey, searchField, filterBashAction, filterEnable, filterWhite, filterLevel, filterCategory, standardBlockPolicy, importantBlockPolicy, detailVisible, selectItem?.Id]);

  const refreshTable = useCallback(() => {
    fetchTableData();
    getInitPolicyCount?.();
  }, [fetchTableData, getInitPolicyCount]);

  // 初始化
  useEffect(() => {
    getInitColKeys();
    getMaxRemoteStorage(CSIP_AI_AGENT_BATCH_TIPS, val => setIsShowBatchTips(val !== '1'));
    const createCookie = getCookie(BASH_DETAIL_TOCREATE);
    if (createCookie) {
      setCookie(BASH_DETAIL_TOCREATE, '', -1);
      setHandleType('create');
      setSelectItem({});
      setSettingVisible(true);
    }
    const cookieName = getCookie(BASH_DETAIL_TORULE);
    if (cookieName) {
      setSearchKey(cookieName?.split?.(',')?.[0] || '');
    }
  }, []);

  // 初次加载获取系统策略 + 列表
  useEffect(() => {
    getAutoBlockData();
  }, []);

  // 筛选/搜索/分页变化时重新加载
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // cookie 跳转到编辑
  useEffect(() => {
    const cookieName = getCookie(BASH_DETAIL_TORULE);
    if (cookieName && allData?.length) {
      const item = allData?.filter?.((item: any) => String(item?.Id) === cookieName?.split?.(',')?.[1]);
      if (item?.length === 1 && item?.[0]) {
        setSelectItem(item?.[0] ?? {});
        setHandleType('edit');
        setSettingVisible(true);
      }
      setCookie(BASH_DETAIL_TORULE, '', -1);
    }
  }, [allData]);

  useEffect(() => {
    if (autoBlockModalVisible) {
      const isOpen = String(standardBlockPolicy?.Enable) === '1' || String(importantBlockPolicy?.Enable) === '1';
      setModalAutoBlockSwitch(true);
      setModalProtectMode(isOpen ? String(importantBlockPolicy?.Enable) : '0');
    }
  }, [autoBlockModalVisible]);

  // 列定义
  const allColumns: ColDef[] = useMemo(() => [
    {
      key: 'Name',
      header: '策略名称',
      render: (item, _rowKey, recordIndex) =>
        String(item?.Category) === '0' ? (
          item?.Name
        ) : (
          <Button
            variant="link"
            title={item?.Name}
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
            {item?.Name}
          </Button>
        ),
    },
    {
      key: 'Category',
      header: '策略类型',
      render: item =>
        item?.Category === 0 || item?.Category === 1 ? (
          <span className="maliciousRequest-alarmList-policyType">
            {POLICY_TYPES[item?.Category] || '--'}
            {String(item?.Category) === '0' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline-block w-3.5 h-3.5 align-middle ml-0.5 -mt-0.5 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[320px]">
                  {'系统策略为腾讯OpenClaw运营专家与算法专家经过多模型沉淀的规则配置，适用于大部分的高危命令检测。'}
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        ) : (
          '--'
        ),
    },
    {
      key: 'White',
      header: '黑/白名单',
      render: item =>
        String(item?.White) === '1' ? (
          <span className="maliciousRequest-alarmList-white">{'白名单'}</span>
        ) : (
          <span className="maliciousRequest-alarmList-black">{'黑名单'}</span>
        ),
    },
    {
      key: 'Rule',
      header: '策略内容',
      render: (item, _rowKey, recordIndex) => {
        const data = Object.keys(RulesAttributeMap).filter(
          key => item?.Rules?.[key]?.Exe || item?.Rules?.[key]?.Cmdline,
        );
        const content = item?.Rules?.[data?.[0]]?.Exe || item?.Rules?.[data?.[0]]?.Cmdline;
        return String(item?.Category) === '0' ? (
          '腾讯云恶意命令库'
        ) : data?.length > 0 ? (
          <span>
            {`${data?.map?.(key => RulesAttributeMap?.[key])?.join?.('、')}：${`${content?.slice?.(0, 20)}${content?.length > 20 ? '...' : ''}`}`}
            <span>
              {'等（'}
              <Button
                variant="link"
                style={{ margin: '-2px 2px 0', padding: 0, minWidth: 'auto', verticalAlign: 'middle' }}
                onClick={() => {
                  setSelectItem(item);
                  setLoadingIndex(recordIndex);
                  setDetailVisible(true);
                }}
              >
                {`${data?.length}个`}
              </Button>
              {'）'}
            </span>
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'Level',
      header: '威胁等级',
      render: item => (String(item?.Category) === '0' ? '-' : getRuleLevelText(item?.Level)),
    },
    {
      key: 'Scope',
      header: '生效OpenClaw',
      render: (item, _rowKey, recordIndex) => (
        <div>
          {item?.Category === 0 ? (
            <span>{String(item?.Scope) !== '0' ? GetHostTypeText(item?.Scope) : item?.Quuids?.length || 0}</span>
          ) : (
            <Button
              variant="link"
              className="machineName-btn-textOverflow"
              title={String(item?.Scope) !== '0' ? GetHostTypeText(item?.Scope) : String(item?.Quuids?.length || 0)}
              onClick={() => {
                setSelectItem(item);
                setLoadingIndex(recordIndex);
                setDetailVisible(true);
              }}
            >
              <span>{String(item?.Scope) !== '0' ? GetHostTypeText(item?.Scope) : item?.Quuids?.length || 0}</span>
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'ModifyTime',
      header: '更新时间',
    },
    {
      key: 'BashAction',
      header: '执行动作',
      render: (item, _text, index) => (
        <div>
          <Badge variant={POLICY_ACTION_THEME_MAP[item?.BashAction] === 'error' ? 'destructive' : POLICY_ACTION_THEME_MAP[item?.BashAction] === 'warning' ? 'outline' : 'secondary'}>
            {getPolicyActionMap()?.[item?.BashAction]}
          </Badge>
          {String(item?.Category) === '0' && String(item?.BashAction) === '2' ? (
            (String(standardBlockPolicy?.Enable) === '0' && String(importantBlockPolicy?.Enable) === '0')
              || loadingList[index] ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span style={{ margin: '3px 0 0 0', display: 'block' }}>
                    <ToggleGroup
                      type="single"
                      disabled
                      className="autoBlock-protect-mode-segment"
                      value="0"
                    >
                      {renderSegOptionsNew(true, true, setShowCloseBubble).map(opt => (
                        <ToggleGroupItem key={opt.value} value={opt.value} style={{ height: 30 }}>{opt.text}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px]">
                  {loadingList[index] ? null : !hasFlagship ? (
                    <span>
                      <span>{'高危命令自动拦截属于旗舰版功能，开启后将自动拦截检测出的系统高危命令，点击 '}</span>
                      <a style={{ color: 'var(--primary)' }} onClick={() => window.open(AUTHORIZE_ROUTE)}>
                        {'升级版本'}
                      </a>
                      <span>{'，一键开启拦截。'}</span>
                    </span>
                  ) : (
                    <span>
                      {'策略未开启，暂无法进行模式切换，可点击 '}
                      <a style={{ color: 'var(--primary)' }} onClick={() => setAutoBlockModalVisible(true)}>
                        {'开启策略'}
                      </a>
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Popover open={changeModePopVisible} onOpenChange={setChangeModePopVisible}>
                <PopoverTrigger asChild>
                  <span style={{ margin: '3px 0 0 0', display: 'block' }}>
                    <ToggleGroup
                      type="single"
                      className="autoBlock-protect-mode-segment"
                      value={String(importantBlockPolicy?.Enable)}
                      onValueChange={val => {
                        if (val && val !== String(importantBlockPolicy?.Enable)) {
                          setChangeModePopVisible(true);
                        }
                      }}
                    >
                      {renderSegOptionsNew(true, String(standardBlockPolicy?.Enable) === '1').map(opt => (
                        <ToggleGroupItem key={opt.value} value={opt.value} style={{ height: 30 }}>{opt.text}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      {String(importantBlockPolicy?.Enable) === '1' ? (
                        '确认切换为标准模式？'
                      ) : (
                        <span>
                          <AlertTriangle className="inline w-4 h-4 -mt-0.5 mr-1" />
                          {'确认切换为重保模式？'}
                        </span>
                      )}
                    </h4>
                    <div style={{ marginBottom: -10 }}>
                      {String(importantBlockPolicy?.Enable) === '1' ? (
                        '确认后，将切换为标准模式，综合多个引擎检测结果，仅针对高置信度的风险进行自动防护，更适合日常安全运营使用。'
                      ) : (
                        <span>
                          {'确认后，将切换为重保模式，综合多个引擎检测结果，针对高、中置信度的风险进行自动防护，'}
                          <span style={{ color: '#E24C55' }}>{'可能存在误拦截风险'}</span>
                          {'，适合重保防护，请谨慎启用。'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="link"
                        onClick={() => {
                          setChangeModePopVisible(false);
                          setLoadingIndex(index);
                          handleAutoBlockChange?.(true, String(importantBlockPolicy?.Enable) === '1' ? '0' : '1');
                        }}
                      >
                        {'确定'}
                      </Button>
                      <Button variant="ghost" onClick={() => setChangeModePopVisible(false)}>
                        {'取消'}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          ) : null}
        </div>
      ),
    },
    {
      key: 'Enable',
      header: '开关',
      render: (item, _rowKey, recordIndex) =>
        String(item?.Category) === '0'
          && String(item?.BashAction) !== '2'
          && String(item?.Id) === String(SYSTEM_STANDARD_ID) ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Switch disabled checked style={{ marginLeft: 5 }} /></span>
            </TooltipTrigger>
            <TooltipContent>{'系统默认告警策略默认生效，不支持关闭'}</TooltipContent>
          </Tooltip>
        ) : String(item?.BashAction) === '2' && String(item?.Category) === '0' ? (
          !hasFlagship ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Switch
                    disabled
                    style={{ marginLeft: 5 }}
                    checked={String(standardBlockPolicy?.Enable) === '1' || String(importantBlockPolicy?.Enable) === '1'}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[320px]">
                <span>
                  <span>{'高危命令自动拦截属于旗舰版功能，开启后将自动拦截检测出的系统高危命令，点击 '}</span>
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
              checked={String(standardBlockPolicy?.Enable) === '1' || String(importantBlockPolicy?.Enable) === '1'}
              style={{ marginLeft: 5 }}
              onCheckedChange={() => {
                if (String(standardBlockPolicy?.Enable) === '1' || String(importantBlockPolicy?.Enable) === '1') {
                  setCloseAutoBlockModal(true);
                } else {
                  setAutoBlockModalVisible(true);
                }
              }}
            />
          )
        ) : String(item?.BashAction) === '2' && !hasFlagship ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Switch disabled checked={String(item?.Enable) === '1'} style={{ marginLeft: 5 }} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px]">
              <span>
                <span>{'当前暂无旗舰版OpenClaw，无法设置拦截策略，可'}</span>
                <a style={{ color: 'var(--primary)' }} onClick={() => window.open(AUTHORIZE_ROUTE)}>
                  {'点击升级版本'}
                </a>
              </span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild><span>
              <Switch disabled={loadingList[recordIndex]} style={{ marginLeft: 5 }} checked={String(item?.Enable) === '1'} />
            </span></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{`确定${String(item?.Enable) === '1' ? '关闭' : '开启'}此策略？`}</AlertDialogTitle>
                <AlertDialogDescription>
                  {String(item?.Enable) === '1'
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
        ),
    },
    {
      key: 'Action',
      header: '操作',
      render: item => (
        <span className="flex items-center whitespace-nowrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ margin: '0 -15px 0 -10px' }}>
                <Button
                  variant="link"
                  disabled={String(item?.Category) === '0' || (String(item?.BashAction) === '2' && !hasFlagship)}
                  onClick={() => {
                    setHandleType('edit');
                    setSelectItem(item);
                    setSettingVisible(true);
                  }}
                >
                  {'编辑'}
                </Button>
              </span>
            </TooltipTrigger>
            {(String(item?.Category) === '0' || (String(item?.BashAction) === '2' && !hasFlagship)) && (
              <TooltipContent className="max-w-[200px]">
                {String(item?.Category) === '0' ? (
                  '系统策略不支持编辑'
                ) : (
                  <span>
                    {'当前暂无旗舰版OpenClaw，无法设置拦截策略，可'}
                    <a onClick={() => window.open(AUTHORIZE_ROUTE)} style={{ textDecoration: 'underline' }}>
                      {'点击升级版本'}
                    </a>
                  </span>
                )}
              </TooltipContent>
            )}
          </Tooltip>
          {String(item?.Category) === '0' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="link" disabled>
                    {'删除'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{'系统策略不支持删除'}</TooltipContent>
            </Tooltip>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild><span>
                <Button variant="link">{'删除'}</Button>
              </span></AlertDialogTrigger>
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
    return allColumns.filter(col => col.isAlwaysShow || col.fixed === 'right' || initColKeys.includes(col.key));
  }, [allColumns, initColKeys]);

  // 行选择逻辑
  const selectableRows = useMemo(() => tableData.filter(d => String(d?.Category) === '1'), [tableData]);
  const allSelected = selectableRows.length > 0 && selectableRows.every(d => selectedKeys.includes(String(d?.Id)));
  const someSelected = !allSelected && selectableRows.some(d => selectedKeys.includes(String(d?.Id)));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelected();
    } else {
      const keys = selectableRows.map(d => String(d?.Id));
      const rows = getSelectionRows(selectedRows, keys, tableData, 'Id');
      setSelectedKeys(keys);
      setSelectedRows(rows);
    }
  }, [allSelected, selectableRows, selectedRows, tableData, clearSelected]);

  const toggleSelectRow = useCallback((item: any) => {
    const key = String(item?.Id);
    const isSelected = selectedKeys.includes(key);
    const newKeys = isSelected ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key];
    const newRows = getSelectionRows(selectedRows, newKeys, tableData, 'Id');
    setSelectedKeys(newKeys);
    setSelectedRows(newRows);
  }, [selectedKeys, selectedRows, tableData]);

  return (
    <div className="w-full overflow-hidden">
      {isShowBatchTips && !isFromDetail && (
        <div className="csip-AIAgent-hostGroup-recommend" style={{ margin: '0 12px 18px' }}>
          <strong>{'推荐开启策略'}</strong>
          <Separator orientation="vertical" className="inline-block mx-2.5 h-3" />
          {`推荐您拦截 ${HIGH_CMD.length}条 高风险命令，建议拦截：`}
          {HIGH_CMD.slice(0, 3).map((d, i) => (
            <Badge key={i} variant="outline" style={{ marginLeft: 10 }}>
              <span className="text-red-500">{d.value}</span>
            </Badge>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" style={{ marginLeft: 10, cursor: 'pointer' }}>
                +{HIGH_CMD.length - 3}{'条'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px]" style={{ background: '#fff' }}>
              <div>
                <strong style={{ color: '#000' }}>{'建议拦截命令：'}</strong>
                <ul className="list-disc pl-4 mt-1">
                  {HIGH_CMD.map((d, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span style={{ color: '#000' }}>{d.value}</span>
                      <Badge
                        variant="outline"
                        style={{
                          float: 'right',
                          ...(i === HIGH_CMD.length - 1 || i === HIGH_CMD.length - 2 ? { marginLeft: 20 } : {}),
                        }}
                      >
                        {d.text}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
          <a style={{ float: 'right' }} onClick={() => setBatchAddPolicyModalVisible(true)}>
            {'一键创建拦截策略 >'}
          </a>
        </div>
      )}
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
            disabled={!selectedKeys?.length}
            onClick={() => {
              setHandleType('del');
              setSelectItem({});
              setTableshow(false);
              setConfirmModal(true);
            }}
          >
            {'删除'}
          </Button>
          <Select value={filterBashAction || 'undefined'} onValueChange={val => { setFilterBashAction(val === 'undefined' ? '' : val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="请选择执行动作" />
            </SelectTrigger>
            <SelectContent>
              {getPolicyActionsData().map((d: any) => (
                <SelectItem key={d.value} value={String(d.value)}>{d.text}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEnable || '__all__'} onValueChange={val => { setFilterEnable(val === '__all__' ? '' : val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="请选择生效状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部生效状态</SelectItem>
              <SelectItem value="1">已生效</SelectItem>
              <SelectItem value="0">未生效</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={searchField} onValueChange={val => { setSearchField(val); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Name">策略名称</SelectItem>
              <SelectItem value="Rule">策略内容</SelectItem>
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
              <div className="px-2 py-1.5 text-xs text-gray-500">{`已勾选${initColKeys?.length || allColumns.filter(c => !c.isAlwaysShow && c.fixed !== 'right').length}个`}</div>
              <DropdownMenuSeparator />
              {allColumns.filter(c => !c.isAlwaysShow && c.fixed !== 'right').map(col => (
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
            requestApi="ExportBashPolicies"
            params={downloadParams}
            onFinish={(data: any) => {
              window.location.href = data.DownloadUrl;
              return false;
            }}
          /> */}
        </div>
      </div>

      {/* ===== 表格 ===== */}
      <div className="relative bg-white border-t border-gray-100 overflow-hidden table-panel-searchTag" style={{ maxWidth: '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
        <div className="overflow-x-auto overflow-y-visible w-full">
          <table className="w-full" style={{ minWidth: 1400, tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 40 }} />
              {visibleColumns.map(col => (
                <col key={col.key} style={{ width: col.width || 'auto' }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="w-10 px-3 py-3 sticky left-0 z-[3] bg-gray-50/95" style={{ boxShadow: '4px 0 8px -4px rgba(0,0,0,0.08)' }}>
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                {visibleColumns.map(col => (
                  <th
                    key={col.key}
                    className={`text-left px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis ${col.fixed === 'right' ? 'sticky bg-gray-50/95 z-[3]' : col.fixed === 'left' ? 'sticky bg-gray-50/95 z-[3]' : ''
                      }`}
                    style={{
                      ...(col.fixed === 'right' ? { right: col.stickyRight ?? 0, boxShadow: col.stickyRight ? '-4px 0 8px -4px rgba(0,0,0,0.08)' : undefined } : {}),
                      ...(col.fixed === 'left' ? { left: col.stickyLeft ?? 0, boxShadow: '4px 0 8px -4px rgba(0,0,0,0.08)' } : {}),
                    }}
                  >
                    {col.header}
                    {/* 列头筛选 - 黑/白名单 */}
                    {col.key === 'White' && (
                      <Select value={filterWhite || '__all__'} onValueChange={val => { setFilterWhite(val === '__all__' ? '' : val); setPage(1); }}>
                        <SelectTrigger className="inline-flex h-5 text-[10px] w-auto ml-1 border-0 p-0 shadow-none" style={{ position: 'relative', top: 3 }}>
                          {/* <ChevronDown className="w-3 h-3" /> */}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">全部</SelectItem>
                          <SelectItem value="0">黑名单</SelectItem>
                          <SelectItem value="1">白名单</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {/* 列头筛选 - 策略类型 */}
                    {col.key === 'Category' && (
                      <Select value={filterCategory || '__all__'} onValueChange={val => { setFilterCategory(val === '__all__' ? '' : val); setPage(1); }}>
                        <SelectTrigger className="inline-flex h-5 text-[10px] w-auto ml-1 border-0 p-0 shadow-none" style={{ position: 'relative', top: 3 }}>
                          {/* <ChevronDown className="w-3 h-3" /> */}
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_POLICY_TYPES_DATA.map((d: any) => (
                            <SelectItem key={d.value ?? '__all__'} value={d.value || '__all__'}>{d.text}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.length > 0 ? (
                tableData.map((item: any, idx: number) => {
                  const rowId = String(item?.Id);
                  const isSelected = selectedKeys.includes(rowId);
                  const isSelectable = String(item?.Category) === '1';
                  return (
                    <tr key={item?.Id || idx} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      <td className={`w-10 px-3 py-3 sticky left-0 z-[2] ${isSelected ? 'bg-blue-50/30' : 'bg-white'}`} style={{ boxShadow: '4px 0 8px -4px rgba(0,0,0,0.08)' }}>
                        {isSelectable ? (
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelectRow(item)} />
                        ) : (
                          <Checkbox disabled checked={false} />
                        )}
                      </td>
                      {visibleColumns.map(col => (
                        <td
                          key={col.key}
                          className={`px-3 py-3 text-sm ${col.fixed === 'right' ? `sticky z-[1] ${isSelected ? 'bg-blue-50/30' : 'bg-white'}` :
                            col.fixed === 'left' ? `sticky z-[2] ${isSelected ? 'bg-blue-50/30' : 'bg-white'}` : ''
                            }`}
                          style={{
                            ...(col.fixed === 'right' ? { right: col.stickyRight ?? 0, boxShadow: col.stickyRight ? '-4px 0 8px -4px rgba(0,0,0,0.08)' : undefined } : {}),
                            ...(col.fixed === 'left' ? { left: col.stickyLeft ?? 0, boxShadow: '4px 0 8px -4px rgba(0,0,0,0.08)' } : {}),
                          }}
                        >
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
      </div>

      {settingVisible && (
        <EditPolicyDrawer
          visible={settingVisible}
          setVisible={setSettingVisible}
          type={handleType}
          selectItem={selectItem}
          refreshTable={getAutoBlockData}
          hasFlagship={hasFlagship}
          aiAgentHostList={aiAgentHostList}
        />
      )}

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

      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {`确定${handleType === 'del' ? '删除' : String(selectItem?.Enable) === '1' ? '关闭' : '开启'}${selectedKeys?.length > 0 ? `选中的 ${selectedKeys?.length || 0}个 ` : '此'}策略吗？`}
            </DialogTitle>
          </DialogHeader>
          <div>
            <p style={{ color: '#444', marginTop: 10 }}>
              {handleType === 'del'
                ? '确认后，策略将被删除，无法恢复，策略范围内的资产将不再生效，请谨慎操作。'
                : String(selectItem?.Enable) === '1'
                  ? `确认后，策略将被关闭，生效范围内的OpenClaw将不再${selectItem?.BashAction == 2
                    ? '进行拦截'
                    : selectItem?.BashAction == 1
                      ? '放行'
                      : '进行告警'}。`
                  : `确认后，策略将生效，生效范围内的OpenClaw将${selectItem?.BashAction == 2
                    ? '开启拦截'
                    : selectItem?.BashAction == 1
                      ? '开启放行'
                      : '开启告警'}，请谨慎操作。`}
            </p>
            {selectedKeys?.length > 0 && !selectItem?.Id && selectedRows?.length > 0 && handleType !== 'del' && (
              <div style={{ marginTop: 10 }}>
                <p>
                  您已选择
                  <span style={{ color: '#0ABF5B', margin: '0 3px' }}>
                    {selectedRows?.length}个
                  </span>
                  策略，
                  <Button variant="link" onClick={() => setTableshow(!tableshow)} style={{ verticalAlign: 'top' }}>
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
                              <TableCell>{`ID：${record?.Id ?? '-'} - 策略名称：${record?.Name ?? '-'}`}</TableCell>
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
            <Button
              variant="outline"
              onClick={() => {
                setConfirmModal(false);
              }}
            >
              {'取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeAutoBlockModal} onOpenChange={setCloseAutoBlockModal}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{'确认关闭自动拦截？'}</DialogTitle>
          </DialogHeader>
          <div className="newBaseline-confirm-modal">
            <p style={{ color: '#444', marginTop: 10 }}>
              {'关闭该功能后，OpenClaw将不再自动拦截检测到的高危命令进程，可能造成被入侵风险，请谨慎操作。'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                handleAutoBlockChange?.(false, '0');
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

      <Dialog open={autoBlockModalVisible} onOpenChange={setAutoBlockModalVisible}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{'高危命令自动拦截'}</DialogTitle>
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
                {'高危命令自动拦截采用杀命中规则的进程的方式，比如A创建/bin/bash -i进程（bash -i被加黑），这个时候创建的/bin/bash进程会被杀掉（或者创建失败），A进程不影响。'}
              </span>
              <div style={{ margin: '10px 0 0 0', padding: '0 0 2px 3px', color: '#e3eaef', background: '#000' }}>
                root@VM-0-17-ubuntu:/home/ubuntu# ping 14.119.104.189 <br />
                Killed
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
                          className="autoBlock-protect-mode-segment"
                          disabled={!modalAutoBlockSwitch}
                          value={modalProtectMode}
                          onValueChange={value => { if (value) setModalProtectMode(value); }}
                        >
                          {renderSegOptionsNew(false, modalProtectMode === '0').map(opt => (
                            <ToggleGroupItem key={opt.value} value={opt.value}>{opt.text}</ToggleGroupItem>
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
                      <Badge variant="secondary" className="ml-1 -mt-0.5">
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

      <Dialog open={batchAddPolicyModalVisible} onOpenChange={setBatchAddPolicyModalVisible}>
        <DialogContent className="max-w-[1100px]" style={{ maxWidth: 1100, maxHeight: 800, overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{'确认添加推荐策略？'}</DialogTitle>
          </DialogHeader>
          <div>
            <div style={{ margin: '-5px 0 20px' }}>
              {'确认后，将一键为您添加下述拦截策略，智能拦截AI Agent场景下的恶意命令，保护您的AI Agent资产安全。'}
            </div>
            <div className={`maliciousRequest-editPolicy`}>
              <div className="mg-bt-16">
                <div className="label-txt">{'开启策略'}</div>
                <div className="content">
                  <div style={{ marginBottom: 10 }}>
                    {`${HIGH_CMD.length}条`}
                    <a
                      style={{ margin: '0 0 0 12px' }}
                      onClick={() => setHasExpandBatchAddModal(!hasExpandBatchAddModal)}
                    >
                      {hasExpandBatchAddModal ? '收起' : '展开'}
                      {hasExpandBatchAddModal ? <ChevronUp className="inline w-3 h-3 ml-1" /> : <ChevronDown className="inline w-3 h-3 ml-1" />}
                    </a>
                  </div>
                  {hasExpandBatchAddModal && (
                    <ScrollArea className="max-h-[360px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{'策略名称'}</TableHead>
                            <TableHead>{'策略内容'}</TableHead>
                            <TableHead>{'拦截动作'}</TableHead>
                            <TableHead>{'威胁等级'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {HIGH_CMD.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell>{'拦截'}{item?.paramsText || item.text}{'命令'}</TableCell>
                              <TableCell>{`进程：${item.cmd}`}</TableCell>
                              <TableCell><Badge variant="destructive">{'拦截'}</Badge></TableCell>
                              <TableCell>{getRuleLevelText(1)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </div>
              </div>
              <div className="mg-bt-16">
                <div className="label-txt mg-tp-6">{'选择AI Agent资产'}</div>
                <div className="content" style={{ marginTop: -19 }}>
                  <CvmSelectComponent
                    layout="fixed"
                    isAllMachineSelectable
                    isBlockMode="2"
                    QuuidList={selectQuuidList}
                    onChange={(keys: any, rows: any[]) =>
                      setSelectMachine(rows?.filter?.((d: { Quuid: any; }) => d.Quuid)?.map?.((d: { Quuid: any; }) => d.Quuid) ?? [])
                    }
                    filter={{
                      Version: ['Flagship'],
                      Quuid: aiAgentHostList?.filter?.((d: any) => d?.ProtectType === 'Flagship' && d?.Quuid)?.map?.((d: { Quuid: any; }) => d?.Quuid),
                    }}
                    showProjectFilter={false}
                    showLeftTagColumns={false}
                    showRightTagColumns={false}
                    aiAgentHostList={aiAgentHostList}
                    renderColumns={[
                      {
                        header: '防护版本',
                        key: 'ProtectType',
                        render: record => hostVersionMap[record?.ProtectType],
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                if (!selectMachine?.length) {
                  toast.error('请至少选择一台OpenClaw');
                  return;
                }
                batchCreatePolicy();
              }}
            >
              {'添加策略'}
            </Button>
            <Button variant="outline" onClick={() => setBatchAddPolicyModalVisible(false)}>
              {'取消'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
