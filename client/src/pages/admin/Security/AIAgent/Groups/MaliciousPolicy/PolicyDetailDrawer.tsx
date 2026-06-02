/*  */
/* eslint-disable  */


import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Info, Tag as TagIcon, Copy as CopyIcon, Search, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import Pagination from '@/components/Pagination';
import { DescribeMachines } from '@/pages/admin/Security/api';

import { PROTECTTYPE_VERSION_TYPES, ProtectLevelMap } from '../../constants';
// import ExportCsv from '../../Common/ExportCsv';
import { getRequestParams } from '../../Common/CommonRiskHandleFunc';

import { getPolicyActionMap, GetHostTypeText } from './CommonType';

export function PolicyDetailDrawer({
  loading = undefined,
  selectItem,
  detailVisible,
  setDetailVisible,
  hasFlagship,
  setHandleType,
  setSettingVisible,
  handleDelPolicy,
  handleSwitchChange,
  aiAgentHostList,
}:any) {
  const PAGE_SIZE = 10;

  const [downLoadParams, setDownLoadParams] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [machinePage, setMachinePage] = useState(1);
  const [machineSearch, setMachineSearch] = useState('');
  const [machineLoading, setMachineLoading] = useState(false);

  const requestIdRef = useRef(0);

  const fetchMachines = async (page: number, keywords?: string) => {
    if (!selectItem?.HostIds?.length) {
      setMachineData([]);
      return;
    }
    const rid = ++requestIdRef.current;
    setMachineLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const query: any = {
        Offset: offset,
        Limit: PAGE_SIZE,
        MachineRegion: 'all-regions',
        MachineType: 'ALL',
      };
      if (keywords) {
        query.Keywords = keywords;
      }
      const params = getRequestParams(query, [
        { key: 'Keywords', type: 'string' },
        { key: 'Quuid', type: 'string' },
      ]);
      console.log(12388, params, params?.Filters);
      if (!params?.Filters) {
        params.Filters = [];
      }
      params?.Filters?.push?.({
        Name: 'Quuid',
        Values: selectItem?.HostIds?.slice?.(offset, offset + PAGE_SIZE),
      });
      if (selectItem?.PolicyAction == 2) {
        params?.Filters?.push?.({
          Name: 'Version',
          Values: ['Flagship'],
        });
      } else if (String(selectItem?.PolicyAction) !== '1') {
        params?.Filters?.push?.({
          Name: 'Version',
          Values: ['ProtectedMachines'],
        });
      }
      setDownLoadParams({
        Filters: params?.Filters?.filter?.((d: any) => d?.Name !== 'Quuid')?.concat?.({
          Name: 'Quuid',
          Values: selectItem?.HostIds,
        }),
        MachineRegion: query?.MachineRegion,
        MachineType: query?.MachineType,
      });
      console.log(12300, params, selectItem?.HostIds, offset, selectItem?.HostIds?.slice?.(offset, offset + PAGE_SIZE));
      const resp: any = await DescribeMachines({ ...(params || {}), Offset: 0, Limit: PAGE_SIZE });
      if (rid === requestIdRef.current) {
        setMachineData(
          resp?.Machines?.map?.((d: any) => ({
            ...d,
            OpenClawName: aiAgentHostList?.find?.(
              (a: any) => a?.InstanceID === d?.MachineExtraInfo?.InstanceID
            )?.OpenClawName,
          })) || []
        );
      }
    } catch {
      // error handled by interceptor
    } finally {
      if (rid === requestIdRef.current) {
        setMachineLoading(false);
      }
    }
  };

  const refreshTable = () => {
    fetchMachines(machinePage, machineSearch);
  };

  useEffect(() => {
    if (detailVisible && isEdit) {
      refreshTable();
      setIsEdit(false);
    }
  }, [selectItem?.HostIds]);

  useEffect(() => {
    if (detailVisible) {
      setIsEdit(false);
      setMachinePage(1);
      setMachineSearch('');
      fetchMachines(1, '');
    }
  }, [detailVisible]);

  useEffect(() => {
    if (detailVisible && String(selectItem?.HostScope) === '0') {
      fetchMachines(machinePage, machineSearch);
    }
  }, [machinePage]);

  return (
    <Sheet open={detailVisible} onOpenChange={open => { if (!open) setDetailVisible?.(false); }}>
      <SheetContent side="right" className="w-[960px] max-w-[960px] sm:max-w-[960px] flex flex-col p-0" style={{ background: '#fff' }}>
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle>
            <span className="maliciousRequest-policyDetail-title">
              {'策略详情：'}
              {selectItem?.PolicyName}
            </span>

            {String(selectItem?.IsEnabled) === '0' ? (
              <Badge variant="secondary" className="ml-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                {'启用中'}
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
                {'未启用'}
              </Badge>
            )}
          </SheetTitle>
          <div style={{ marginTop: 15 }} className="flex gap-2">
            {String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) !== '2' ? null : String(
              selectItem?.PolicyAction,
            ) === '2' && !hasFlagship ? null : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={loading}>
                    {`${String(selectItem?.IsEnabled) === '0' ? '关闭' : '开启'}策略`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{`确定${String(selectItem?.IsEnabled) === '0' ? '关闭' : '开启'}此策略？`}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {String(selectItem?.IsEnabled) === '0'
                        ? '确认后，将关闭此策略，后续命中策略内容时，将不再执行相应动作，请谨慎操作。'
                        : '确认后，将开启此策略，后续命中策略内容时，将对应执行相应动作。'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{'取消'}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSwitchChange(selectItem)}>
                      {'确定'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {String(selectItem?.PolicyAction) === '2' && !hasFlagship ? null : String(selectItem?.PolicyType)
              === '0' ? (
                String(selectItem?.PolicyAction) !== '2' ? null : (
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setIsEdit(true);
                      setHandleType?.('edit');
                      setSettingVisible?.(true);
                    }}
                  >
                    {'编辑'}
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEdit(true);
                    setHandleType?.('edit');
                    setSettingVisible?.(true);
                  }}
                >
                  {'编辑'}
                </Button>
              )}
            {String(selectItem?.PolicyType) === '1' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">{'删除'}</Button>
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
                    <AlertDialogAction onClick={() => {
                      setDetailVisible?.(false);
                      handleDelPolicy(selectItem);
                    }}>
                      {'确定'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="maliciousRequest-policyDetail">
        <h3 style={{ margin: '0 0 20px 0' }}>{'基本信息'}</h3>
        <div className="mg-bt-20">
          <div className="flex">
            <div className="flex-1">
              <div className="name-icon" />
              <div className="name">
                <div className="lab">{'策略名称'}</div>
                <div className="cont">{selectItem?.PolicyName}</div>
              </div>
            </div>
            <div className="flex-1">
              <div style={{ paddingTop: 16 }}>
                <span style={{ color: '#888', marginRight: 15 }}>{'最近编辑时间'}</span>
                <span>{selectItem?.UpdateTime || '--'}</span>
              </div>
            </div>
          </div>
        </div>
        <hr style={{ margin: '20px 0' }} />
        <div className="mg-bt-20">
          <div className="label-txt">{'策略描述'}</div>
          <div className="content">{selectItem?.PolicyDesc || '--'}</div>
        </div>
        <hr style={{ margin: '20px -20px' }} />
        <h3 className="mg-bt-20">{'拦截策略详情'}</h3>
        <div className="mg-bt-20">
          <div className="label-txt">{'黑/白名单'}</div>
          <div className="content">
            {String(selectItem?.PolicyAction) === '1' ? (
              <span className="maliciousRequest-alarmList-white" style={{ marginTop: -1 }}>
                {'白名单'}
              </span>
            ) : (
              <span className="maliciousRequest-alarmList-black" style={{ marginTop: -1 }}>
                {'黑名单'}
              </span>
            )}
          </div>
        </div>
        <div className="mg-bt-20">
          <div className="label-txt">{'执行动作'}</div>
          <div className="content">
            <div
              className={
                selectItem?.PolicyAction == 1
                  ? 'newBaseline-passStatus-3'
                  : `maliciousRequest-policy-action-${selectItem?.PolicyAction}`
              }
            >
              {getPolicyActionMap()?.[selectItem?.PolicyAction]}
            </div>
          </div>
        </div>
        <div>
          <div className="label-txt">{'域名详情'}</div>
          <div className="content">{selectItem?.Domains?.join?.('；')}</div>
        </div>
        <hr style={{ margin: '20px -20px' }} />
        <h3 style={{ marginBottom: 15 }}>
          {`生效OpenClaw范围${String(selectItem?.HostScope) !== '0' ? '' : `（${selectItem?.HostIds?.length || 0}）`}`}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Info className="inline-block w-4 h-4 text-muted-foreground ml-1 align-middle cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              <div>
                <div>{'白名单策略可对全部OpenClaw生效；'}</div>
                <div>{'告警策略可对专业版、旗舰版生效；'}</div>
                <div>
                  {'拦截策略仅对旗舰版生效，OpenClaw降配至专业版、基础版，将自动从生效范围剔除。若需添加拦截，请先'}
                  <a className="underline cursor-pointer" onClick={() => window.open(AUTHORIZE_ROUTE)}>
                    {'升级至旗舰版'}
                  </a>
                  {'，并将OpenClaw添加至生效范围即可。'}
                </div>
              </div>
            </TooltipContent>
          </Tooltip> */}
        </h3>
        <div>
          {String(selectItem?.HostScope) !== '0' ? (
            <div className="maliciousRequest-policy-host">{GetHostTypeText(selectItem?.HostScope)}</div>
          ) : (
            <div>
              {/* <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    placeholder="请输入OpenClaw IP或名称搜索"
                    value={machineSearch}
                    onChange={e => {
                      setMachineSearch(e.target.value);
                      setMachinePage(1);
                      fetchMachines(1, e.target.value);
                    }}
                    className="pl-8 h-8 w-[220px] bg-white text-xs"
                  />
                </div>
                <button
                  onClick={refreshTable}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-colors"
                  title="刷新表格"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${machineLoading ? 'animate-spin' : ''}`} />
                </button>
                <ExportCsv
                  title={'导出'}
                  requestApi="DescribeExportMachines"
                  params={downLoadParams}
                  reportTag="cwp.maliciousRequest.policyDetail.machinelist.download"
                  onFinish={data => {
                    window.location.href = data.DownloadUrl;
                    return false;
                  }}
                />
              </div> */}
              <div className="relative bg-white rounded-md border border-gray-100 overflow-hidden">
                {machineLoading && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">{'Agent名称/ID'}</th>
                      {/* <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">{'OpenClaw IP'}</th> */}
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">{'标签'}</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">{'版本状态'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {machineData.length === 0 && !machineLoading && (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-400">{'暂无数据'}</td>
                      </tr>
                    )}
                    {machineData.map((item: any) => (
                      <tr key={item?.Quuid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-3">
                          <div>
                            <div>
                              {item?.OpenClawName || '-'}
                              <div>{item?.MachineExtraInfo?.InstanceID || "-"}</div>
                              {/* {item?.InstanceId && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <CopyIcon
                                      className="inline-block w-3.5 h-3.5 ml-1 cursor-pointer text-muted-foreground hover:text-foreground align-middle"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item?.InstanceId || '').then(() => {
                                          toast.success('复制成功');
                                        });
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>{'复制'}</TooltipContent>
                                </Tooltip>
                              )} */}
                            </div>
                            {/* <div title={item?.MachineName} className="machineName-btn-textOverflow">
                              {item?.MachineName || '--'}
                            </div> */}
                          </div>
                        </td>
                        {/* <td className="px-3 py-3">
                          <span
                            className="block truncate"
                            style={{ margin: '2px 0 1px 0' }}
                            title={`${item?.MachineIp}/${item?.MachineWanIp}`}
                          >
                            <span className="newbuy-ip-label">{'内'}</span>
                            <span className="newbuy-table-text">{item?.MachineIp || '-'}</span>
                            <span className="newbuy-ip-label" style={{ marginLeft: 8 }}>{'外'}</span>
                            <span className="newbuy-table-text">{item?.MachineWanIp || '-'}</span>
                          </span>
                        </td> */}
                        <td className="px-3 py-3">
                          {(item?.Tag?.length || 0) + (item?.CloudTags?.length || 0) > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" style={{ padding: '0 6px 0 3px', marginTop: 0, cursor: 'pointer' }}>
                                  <TagIcon className="inline-block w-3.5 h-3.5 mr-0.5 newbuy-table-tag-more" />
                                  {(item?.Tag?.length || 0) + (item?.CloudTags?.length || 0) === 1 ? '标签' : '多个'}
                                  <span style={{ color: '#0052d9' }}>
                                    ({(item?.Tag ?? [])?.length + (item?.CloudTags ?? [])?.length})
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                                  <p style={{ fontWeight: 'bold' }}>{'腾讯云标签'}</p>
                                  {item?.CloudTags?.map?.((data: any, index: number) => (
                                    <div key={index} style={{ maxWidth: 300, wordBreak: 'break-all', marginTop: 3 }}>
                                      {`${data?.TagKey}:${data?.TagValue}`}
                                    </div>
                                  ))}
                                  {!item?.CloudTags?.length && <span className="text-muted-foreground">{'暂无腾讯云标签'}</span>}
                                  <p style={{ marginTop: 10, marginBottom: 5, fontWeight: 'bold' }}>{'OpenClaw标签'}</p>
                                  {item?.Tag?.map?.((data: any, index: number) => (
                                    <div key={index} style={{ maxWidth: 300, wordBreak: 'break-all', marginTop: 3 }}>
                                      {data?.Name}
                                    </div>
                                  ))}
                                  {!item?.Tag?.length && <span className="text-muted-foreground">{'暂无OpenClaw标签'}</span>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">{'暂无标签'}</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className={`vulDetail-version-${PROTECTTYPE_VERSION_TYPES[item?.ProtectType]}`}>
                            {ProtectLevelMap[String(PROTECTTYPE_VERSION_TYPES[item?.ProtectType])] || '未安装'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  page={machinePage}
                  total={selectItem?.HostIds?.length || 0}
                  pageSize={PAGE_SIZE}
                  onChange={setMachinePage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
