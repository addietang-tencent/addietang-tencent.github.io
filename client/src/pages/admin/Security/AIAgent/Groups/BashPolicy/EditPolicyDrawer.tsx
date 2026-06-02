

/* eslint-disable  */


import React, { useEffect, useState } from 'react';
import { Base64 } from 'js-base64';
import { toast } from 'sonner';
import { Info, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ModifyBashPolicy, DescribeMachineGeneral, CheckBashPolicyParams } from '@/pages/admin/Security/api';

import { AUTHORIZE_ROUTE } from '../../constants';
import MultiTypeSelectMachine from '../../Common/MultiTypeSelectMachine';
import CvmSelectComponent from '../../Common/CvmSelectComponent';

import { PROCESS_TYPES, PROCESS_TYPES_MAP, LICENSE_TYPES_MAP, hostVersionMap, heightMap } from './Constants';

export const MAX_TEXT_LEN = 40;

export function EditPolicyDrawer({
  type = 'create',
  from = undefined,
  selectItem,
  visible,
  setVisible,
  refreshTable,
  initParams = undefined,
  hasFlagship,
  aiAgentHostList,
}: any) {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [policyName, setPolicyName] = useState('');
  const [policyDesc, setPolicyDesc] = useState('');
  const [whiteType, setWhiteType] = useState('0'); // 0:黑名单 1:白名单
  const [hostScope, setHostScope] = useState('1');
  const [selectMachine, setSelectMachine] = useState([] as any);
  const [selectQuuidList, setSelectQuuidList] = useState([]);
  const [policyAction, setPolicyAction] = useState('0'); // 0:告警 1:白名单 2:拦截
  const [machineStat, setMachineStat] = useState({} as any);
  const [modalVisible, setModalVisible] = useState(false);
  const [isHandleOld, setIsHandleOld] = useState(true);
  const [nameErrMsg, setNameErrMsg] = useState('');
  const [isNameCorrect, setIsNameCorrect] = useState(true);
  const [modalResult, setModalResult] = useState('loading');
  const [errMsg, setErrMsg] = useState('');
  const [policyLevel, setPolicyLevel] = useState('1');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [processList, setProcessList] = useState([] as any);
  const [processHeights, setProcessHeights] = useState([30]);
  const [processCmdHeights, setProcessCmdHeights] = useState([30]);

  const checkBashRuleParams = async (name: string) => {
    if (type !== 'edit') {
      if (name?.trim?.()) {
        const params: any = {
          CheckField: 'Name',
          Name: name?.trim?.(),
          Rules: { Process: { Cmdline: '', Exe: '' }, PProcess: {}, AProcess: {} },
          ...(type === 'create' && initParams?.EventId ? { EventId: initParams?.EventId } : {}),
        };
        const res: any = await CheckBashPolicyParams(params);
        if (res) {
          setIsNameCorrect(res?.ErrCode === 0);
          setNameErrMsg(res?.ErrMsg || '');
          if (res?.ErrCode !== 0) {
            toast.error(res?.ErrMsg || '参数填写错误');
          }
        }
      }
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!policyName?.trim?.()) {
      toast.error('策略名称不能为空');
      return;
    }
    if (!/^[0-9a-zA-Z\u4e00-\u9fa5]+$/.test(policyName?.trim?.())) {
      toast.error('策略名称格式不正确，仅支持英文、数字、中文');
      return;
    }
    if (policyName?.trim?.()?.length > 20) {
      toast.error('策略名称不能超过20个字符');
      return;
    }
    if (policyDesc?.trim?.()?.length > 200) {
      toast.error('策略描述不能超过200个字符');
      return;
    }
    if (processList?.some?.((item: any) => !item?.path?.trim?.() && !item?.cmd?.trim?.())) {
      toast.error('请至少填写进程文件路径或进程命令行其中一项');
      return;
    }
    if (hostScope === '1' && !selectMachine?.length) {
      toast.error('请选择OpenClaw');
      return;
    }
    setLoading(true);
    const rules: any = Object.keys(PROCESS_TYPES_MAP).reduce((pre: any, cur) => {
      const obj = processList?.filter?.((item: { processType: string; }) => item?.processType === cur)?.[0];
      if (obj?.path?.trim?.() || obj?.cmd?.trim?.()) {
        pre[cur] = {
          Exe: Base64.encode(obj?.path?.trim?.()),
          Cmdline: Base64.encode(obj?.cmd?.trim?.()),
        };
      }
      return pre;
    }, {});
    if (type !== 'edit') {
      const checkRes: any = await CheckBashPolicyParams({
        CheckField: `Name,${Object.keys(PROCESS_TYPES_MAP)
          .filter(key =>
            processList?.some?.((item: { processType: string; path: string; cmd: string; }) => item?.processType === key && (item?.path?.trim?.() || item?.cmd?.trim?.())),
          )
          .join(',')}`,
        Name: policyName?.trim?.(),
        Rules: rules,
        ...(type === 'create' && initParams?.EventId ? { EventId: initParams?.EventId } : {}),
      });
      if (checkRes?.ErrCode !== 0) {
        setLoading(false);
        toast.error(checkRes?.ErrMsg || '参数填写错误');
        return;
      }
    }
    if (type === 'create') {
      setModalVisible(true);
      setModalResult('loading');
    }
    if (policyAction === '2') {
      delete rules?.Process?.Exe;
    }
    const params: any = {
      Name: policyName?.trim?.(),
      Category: type === 'create' ? 1 : selectItem?.Category ?? 1,
      Descript: policyDesc?.trim?.(),
      White: Number(whiteType),
      BashAction: Number(policyAction),
      Scope: hostScope == '0' ? (policyAction == '2' ? 2 : whiteType === '1' ? 3 : 1) : 0,
      Enable: isEnabled ? 1 : 0,
      Level: whiteType == '1' ? 0 : Number(policyLevel),
      Rules: rules,
    };
    if (type === 'edit') {
      params.Id = selectItem?.Id;
    }
    if (hostScope == '1') {
      params.Quuids = selectMachine;
    }
    if (policyAction == '1' && type === 'create') {
      params.DealOldEvents = isHandleOld ? 1 : 0;
    }
    if (
      (from === 'alarmList' || from === 'detail') &&
      type === 'create' &&
      initParams?.EventId &&
      (initParams?.MachineType == 1 || initParams?.MachineType == 2) &&
      (hostScope == '0' || (hostScope == '1' && selectMachine?.includes?.(initParams?.Quuids?.[0])))
    ) {
      params.EventId = initParams?.EventId;
    }
    const res: any = await ModifyBashPolicy({ Policy: params });
    if (res) {
      if (type === 'create') {
        setModalResult('success');
      } else {
        setVisible?.(false);
      }
      toast.success('操作成功');
    } else if (type === 'create') {
      setModalResult('fail');
      setErrMsg(res?.msg || res?.uiMsg || res?.message || '');
    }
    refreshTable?.();
    setLoading(false);
  };

  const getMachineTotal = async () => {
    const res: any = await DescribeMachineGeneral();
    setMachineStat(res || {});
  };

  // 编辑状态下，规范匹配内容select数据
  const modifyProcessList =
    !selectItem?.Rules ||
      !Object.keys(selectItem?.Rules)?.length ||
      !Object.keys(selectItem?.Rules)?.filter?.(key => selectItem?.Rules?.[key]?.Cmdline || selectItem?.Rules?.[key]?.Exe)
        ?.length
      ? [{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }]
      : Object.keys(selectItem?.Rules)
        ?.filter?.(key => selectItem?.Rules?.[key]?.Cmdline || selectItem?.Rules?.[key]?.Exe)
        ?.map?.(key => ({
          processType: key,
          path: selectItem?.Rules?.[key]?.Exe || '',
          cmd: selectItem?.Rules?.[key]?.Cmdline || '',
        }));

  // 编辑时，监听 policyAction 和 whiteType 变化，自动重置 processList
  useEffect(() => {
    if (visible) {
      if (type === 'edit') {
        if (policyAction === String(selectItem?.BashAction) && whiteType === String(selectItem?.White)) {
          setProcessList(modifyProcessList);
        } else {
          setProcessList([{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }]);
        }
      }
      if (type === 'create') {
        setProcessList([
          {
            processType: PROCESS_TYPES[0].value,
            path: initParams ? initParams?.Path : '',
            cmd: initParams ? initParams?.Cmd : '',
          },
        ]);
      }
    }
  }, [policyAction, whiteType, visible]);

  useEffect(() => {
    if (type === 'create' && policyName?.trim?.()) {
      window.clearTimeout((window as any).checkBashPolicyParamsTimer);
      (window as any).checkBashPolicyParamsTimer = window.setTimeout(() => {
        checkBashRuleParams(policyName?.trim?.());
      }, 500);
    }
  }, [policyName]);

  // 数据初始化
  useEffect(() => {
    if (visible) {
      setLoading(false);
      setIsHandleOld(type === 'create' ? true : String(selectItem?.DealOldEvents) === '1');
      setIsEnabled(type === 'create' ? true : String(selectItem?.Enable) === '1');
      setPolicyName(type === 'create' ? '' : selectItem?.Name || '');
      setPolicyDesc(type === 'create' ? '' : selectItem?.Descript || '');
      setWhiteType(
        type === 'create'
          ? initParams?.PolicyAction == 1
            ? '1'
            : '0'
          : String(selectItem?.BashAction) === '1'
            ? '1'
            : '0',
      );
      setHostScope('1');
      setSelectQuuidList(
        type === 'create'
          ? initParams?.PolicyAction == 2
            ? initParams?.Quuids
            : []
          : (selectItem?.Quuids || [])?.filter?.((id: any) => id),
      );
      setSelectMachine(
        type === 'create'
          ? initParams?.PolicyAction == 2
            ? initParams?.Quuids
            : []
          : (selectItem?.Quuids || [])?.filter?.((id: any) => id),
      );
      setPolicyLevel(
        type === 'create' ? (initParams?.PolicyLevel ? initParams?.PolicyLevel : '1') : selectItem?.Level || '1',
      );
      setPolicyAction(
        type === 'create'
          ? initParams?.PolicyAction
            ? `${initParams?.PolicyAction}`
            : '0'
          : `${selectItem?.BashAction || '0'}`,
      );
      setProcessList(
        type === 'create'
          ? initParams
            ? [
              {
                processType: PROCESS_TYPES[0].value,
                path: initParams?.Path || '',
                cmd: initParams?.Cmd || '',
              },
            ]
            : [{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }]
          : type === 'edit'
            ? !selectItem?.Rules ||
              !Object.keys(selectItem?.Rules)?.length ||
              !Object.keys(selectItem?.Rules)?.filter?.(
                key => selectItem?.Rules?.[key]?.Cmdline || selectItem?.Rules?.[key]?.Exe,
              )?.length
              ? [{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }]
              : Object.keys(selectItem?.Rules)
                ?.filter?.(key => selectItem?.Rules?.[key]?.Cmdline || selectItem?.Rules?.[key]?.Exe)
                ?.map?.(key => ({
                  processType: key,
                  path: selectItem?.Rules?.[key]?.Exe || '',
                  cmd: selectItem?.Rules?.[key]?.Cmdline || '',
                }))
            : [{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }],
      );
      getMachineTotal();
    }
  }, [visible]);

  return (
    <>
      <Sheet open={visible} onOpenChange={open => { if (!open) setVisible?.(false); }}>
        <SheetContent side="right" className="w-[960px] max-w-[960px] sm:max-w-[960px] flex flex-col p-0" style={{ background: '#fff' }}>
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle>{`${type === 'edit' ? '编辑' : '创建'}策略`}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Alert>
              <AlertDescription>
                {'白名单策略支持全部OpenClaw；告警策略支持专业版、旗舰版OpenClaw；拦截策略仅支持 Linux 系统的旗舰版OpenClaw，可点击\u00A0'}
                <a className="underline cursor-pointer inline" onClick={() => window.open(AUTHORIZE_ROUTE)}>{'升级版本'}</a>
              </AlertDescription>
            </Alert>
            <div className={`maliciousRequest-editPolicy`}>
              <h3 style={{ margin: '15px 0 20px 0' }}>{'基本信息'}</h3>
              <div className="mg-bt-16">
                <div className="label-txt mg-tp-6">
                  <span style={{ color: 'red' }}>*</span>
                  {' 策略名称'}
                </div>
                <div className="content">
                  <Input
                    maxLength={20}
                    value={policyName}
                    onChange={e => setPolicyName(e.target.value)}
                    style={{ width: 600 }}
                    placeholder={'请输入策略名称，限制20个字符以内'}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline-block ml-1 w-4 h-4 text-muted-foreground cursor-pointer align-middle" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {`支持英文、数字、中文，限制20个字符以内${type === 'edit' ? '' : '，不支持重名'}`}
                    </TooltipContent>
                  </Tooltip>
                  {!isNameCorrect && policyName?.trim?.() && (
                    <div style={{ color: '#e54645' }}>
                      <AlertCircle className="inline-block w-4 h-4 align-middle" />
                      <span style={{ marginLeft: 3, verticalAlign: 'middle' }}>
                        {nameErrMsg || '策略名称不正确，请检查'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mg-bt-16">
                <div className="label-txt mg-tp-6">{'策略描述'}</div>
                <div className="content">
                  <Input
                    value={policyDesc}
                    onChange={e => setPolicyDesc(e.target.value)}
                    disabled={String(selectItem?.Category) === '0' && String(selectItem?.BashAction) === '2'}
                    style={{ width: 600 }}
                    placeholder={'请输入策略描述，限制200个字符以内'}
                  />
                </div>
              </div>
              <div>
                <div className="label-txt">
                  <span style={{ color: 'red' }}>*</span>
                  {' 开关'}
                </div>
                <div className="content">
                  <Switch checked={isEnabled} onCheckedChange={val => setIsEnabled(val)} />
                </div>
              </div>
              <hr style={{ margin: '20px -20px' }} />
              <h3 className="mg-bt-16">{'策略详情'}</h3>
              <div className="mg-bt-16">
                <div className="label-txt">
                  <span style={{ color: 'red' }}>*</span>
                  {' 黑/白名单'}
                </div>
                <div className="content">
                  <RadioGroup
                    value={whiteType}
                    onValueChange={value => {
                      setWhiteType(value);
                      setPolicyAction(value === '0' ? '0' : '1');
                      // setHostScope(type === 'create' ? '1' : '0');
                    }}
                    disabled={String(selectItem?.Category) === '0' && String(selectItem?.BashAction) === '2'}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="whiteType-0" />
                      <Label htmlFor="whiteType-0">{'黑名单'}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="whiteType-1" />
                      <Label htmlFor="whiteType-1">{'白名单'}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              {whiteType === '0' && (
                <div className="mg-bt-16">
                  <div className="label-txt mg-tp-6">
                    <span style={{ color: 'red' }}>*</span>
                    {' 执行动作'}
                  </div>
                  <div className="content">
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={policyAction}
                      onValueChange={value => {
                        if (value) {
                          setPolicyAction(value);
                          // setHostScope(type === 'create' ? '1' : '0');
                        }
                      }}
                      disabled={String(selectItem?.Category) === '0' && String(selectItem?.BashAction) === '2'}
                    >
                      <ToggleGroupItem value="0" style={{ borderRadius: 0 }}>{'告警'}</ToggleGroupItem>
                      {hasFlagship ? (
                        <ToggleGroupItem value="2" style={{ borderRadius: 0 }}>{'拦截'}</ToggleGroupItem>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <ToggleGroupItem value="2" disabled style={{ borderRadius: 0 }}>{'拦截'}</ToggleGroupItem>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>
                              {'当前暂无旗舰版OpenClaw，无法设置拦截策略，可'}
                              <a
                                onClick={() => window.open(AUTHORIZE_ROUTE)}
                                style={{ color: '#000', textDecoration: 'underline' }}
                              >
                                {'点击升级版本'}
                              </a>
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </ToggleGroup>
                    <div className="tip" style={{ display: 'inline-block', marginLeft: 8 }}>
                      {policyAction == '0'
                        ? '当发现OpenClaw存在威胁命令时，将产生告警。'
                        : policyAction == '1'
                          ? '当发现OpenClaw存在威胁命令时，将不再产生告警或拦截行为。'
                          : '当发现OpenClaw存在威胁命令时，将对威胁命令运行进行自动拦截，并产生拦截记录。'}
                    </div>
                  </div>
                </div>
              )}
              {whiteType === '0' && (
                <div className="mg-bt-16">
                  <div className="label-txt mg-tp-6">
                    <span style={{ color: 'red' }}>*</span>
                    {' 威胁等级'}
                  </div>
                  <div className="content">
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={policyLevel}
                      onValueChange={value => { if (value) setPolicyLevel(value); }}
                      disabled={String(selectItem?.Category) === '0' && String(selectItem?.BashAction) === '2'}
                    >
                      <ToggleGroupItem
                        value="1"
                        style={{ borderRadius: 0 }}
                      >
                        {'高危'}
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="2"
                        style={{ borderRadius: 0 }}
                      >
                        {'中危'}
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="3"
                        style={{ borderRadius: 0 }}
                      >
                        {'低危'}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}
              <Alert style={{ margin: '-2px 0 15px 0' }}>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    <li style={{ lineHeight: '20px' }}>{'为提升告警精准度，已优化规则配置：'}</li>
                    <li style={{ lineHeight: '20px' }}>
                      {'当设置父进程/进程路径规则时，系统将停止匹配bash历史日志，减少干扰确保告警准确有效。'}
                    </li>
                    <li style={{ lineHeight: '20px' }}>
                      {'【进程文件路径】进程文件所在的路径，如curl，进程文件路径是/usr/bin/curl'}
                    </li>
                    <li style={{ lineHeight: '20px' }}>
                      {'【进程命令行】启动进程的命令行，如curl  http://127.0.0.1:80'}
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
              <div className="mg-bt-16">
                <div className="label-txt mg-tp-6">
                  <span style={{ color: 'red' }}>*</span>
                  {' 匹配内容'}
                </div>
                <div className="content">
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left px-3 py-2 font-medium" style={{ width: 120 }}>{'进程类型'}</th>
                          {policyAction !== '2' && (
                            <th className="text-left px-3 py-2 font-medium">{'进程文件路径'}</th>
                          )}
                          <th className="text-left px-3 py-2 font-medium">{'进程命令行'}</th>
                          {!(whiteType === '0' && policyAction === '2') && (
                            <th className="text-left px-3 py-2 font-medium" style={{ width: 80 }}>{'操作'}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {processList?.map?.((item: any, rowIndex: number) => (
                          <tr key={rowIndex} className="border-b last:border-b-0">
                            <td className="px-3 py-2 align-top" style={{ width: 120 }}>
                              <Select
                                value={item?.processType}
                                onValueChange={val => {
                                  const newList: any = [...processList];
                                  newList[rowIndex].processType = val;
                                  setProcessList(newList);
                                }}
                              >
                                <SelectTrigger style={{ width: '100%' }}>
                                  <SelectValue placeholder={'请选择进程类型'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {(whiteType === '0' && policyAction === '2'
                                    ? PROCESS_TYPES.slice(0, 1)
                                    : PROCESS_TYPES
                                  ).map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                      disabled={
                                        whiteType === '0' && policyAction === '2'
                                          ? false
                                          : processList?.map?.((p: { processType: any; }) => p?.processType)?.indexOf?.(option?.value) > -1
                                      }
                                    >
                                      {option.text || option.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            {policyAction !== '2' && (
                              <td className="px-3 py-2 align-top">
                                <Textarea
                                  maxLength={1024}
                                  value={item?.path || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const newList: any = [...processList];
                                    newList[rowIndex].path = val;
                                    setProcessList(newList);
                                    const len = Math.ceil(val?.length / MAX_TEXT_LEN);
                                    setProcessHeights([
                                      ...processHeights?.slice?.(0, rowIndex),
                                      len > 12 ? heightMap[12] + (len - 12) * 16 : heightMap[len],
                                      ...processHeights?.slice?.(rowIndex + 1),
                                    ]);
                                  }}
                                  style={{ width: '100%', resize: 'vertical', height: processHeights[rowIndex] || 30 }}
                                  placeholder={`请输入${PROCESS_TYPES_MAP[item?.processType]}文件路径`}
                                />
                              </td>
                            )}
                            <td className="px-3 py-2 align-top">
                              <Textarea
                                maxLength={1024}
                                value={item?.cmd || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newList = [...processList];
                                  newList[rowIndex].cmd = val;
                                  setProcessList(newList);
                                  const len = Math.ceil(val?.length / MAX_TEXT_LEN);
                                  setProcessCmdHeights([
                                    ...processCmdHeights?.slice?.(0, rowIndex),
                                    len > 12 ? heightMap[12] + (len - 12) * 16 : heightMap[len],
                                    ...processCmdHeights?.slice?.(rowIndex + 1),
                                  ]);
                                }}
                                style={{ width: '100%', resize: 'vertical', height: processCmdHeights[rowIndex] || 30 }}
                                placeholder={`请输入${PROCESS_TYPES_MAP[item?.processType]}命令行`}
                              />
                            </td>
                            {!(whiteType === '0' && policyAction === '2') && (
                              <td className="px-3 py-2 align-top" style={{ width: 80 }}>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className={`p-1 rounded hover:bg-muted ${processList?.length >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer text-primary'}`}
                                        onClick={() => {
                                          if (processList?.length < 3) {
                                            const allProcessTypeList = PROCESS_TYPES.map(t => t?.value);
                                            const newType = allProcessTypeList.filter(
                                              key => !processList?.map?.((p: { processType: any; }) => p?.processType)?.includes?.(key),
                                            )?.[0];
                                            setProcessList(
                                              processList?.concat?.({ processType: newType, path: '', cmd: '' }),
                                            );
                                          }
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    {processList?.length >= 3 && (
                                      <TooltipContent>{'最多可添加三行'}</TooltipContent>
                                    )}
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className={`p-1 rounded hover:bg-muted ${processList?.length <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer text-destructive'}`}
                                        onClick={() => {
                                          if (processList?.length > 1) {
                                            setProcessList(processList?.filter?.((_: any, i: number) => i !== rowIndex));
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    {processList?.length <= 1 && (
                                      <TooltipContent>{'至少需添加一行'}</TooltipContent>
                                    )}
                                  </Tooltip>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tip">{'OpenClaw无法识别alias命令，请输入最终执行命令的正则表达式'}</div>
                </div>
              </div>
              {whiteType === '1' && type === 'create' && (
                <div className="mg-bt-16">
                  <div className="label-txt">
                    <span style={{ color: 'red' }}>*</span>
                    {' 告警处理'}
                  </div>
                  <div className="content">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="handleOld" checked={isHandleOld} onCheckedChange={value => setIsHandleOld(!!value)} />
                      <Label htmlFor="handleOld">{'对符合本规则的历史"待处理"告警执行加白操作'}</Label>
                    </div>
                  </div>
                </div>
              )}
              <hr style={{ margin: '20px -20px' }} />
              <h3 className="mg-bt-16">
                {`生效OpenClaw范围 (已选择${hostScope == '1'
                  ? selectMachine?.length || 0
                  : policyAction == '2'
                    ? machineStat?.FlagshipMachineCnt || 0
                    : whiteType === '1'
                      ? machineStat?.MachineCnt || 0
                      : (machineStat?.FlagshipMachineCnt || 0) + (machineStat?.SpecialtyMachineCnt || 0)}台)`}
              </h3>
              <div>
                <div className="content" style={{ marginTop: -15 }}>
                  {/* <Radio.Group
                value={hostScope}
                onChange={value => {
                  setHostScope(value);
                  setSelectMachine([]);
                  setSelectQuuidList([]);
                }}
              >
                <Radio name="0">
                  {policyAction == '2'
                    ? `全部旗舰版OpenClaw（${machineStat?.FlagshipMachineCnt || 0}）`
                    : `全部${whiteType === '1' ? '' : '专业版和旗舰版'}OpenClaw（${whiteType === '1'
                            ? machineStat?.MachineCnt || 0
                            : (machineStat?.FlagshipMachineCnt || 0) + (machineStat?.SpecialtyMachineCnt || 0)}）`}
                  <Bubble
                    content={`新增${policyAction == '2' ? '旗舰版' : whiteType === '1' ? '' : '专业版和旗舰版'}OpenClaw时，将自动加入策略生效范围`}
                  >
                    <Icon type="info" style={{ marginTop: -1 }} />
                  </Bubble>
                </Radio>
                <Radio name="1">{'自选OpenClaw'}</Radio>
              </Radio.Group>
            </div>
          </div> */}
                  {hostScope == '1' ? (
                    <CvmSelectComponent
                      layout="fixed"
                      isAllMachineSelectable
                      isBlockMode={policyAction == '2' ? '2' : whiteType === '1' ? '0' : '1'}
                      QuuidList={selectQuuidList}
                      onChange={(keys: any, rows: any[]) =>
                        setSelectMachine(rows?.filter?.((d: { Quuid: any; }) => d.Quuid)?.map?.((d: { Quuid: any; }) => d.Quuid) ?? [])
                      }
                      setFetchLoading={setFetchLoading}
                      aiAgentHostList={aiAgentHostList}
                      filter={
                        policyAction == '2'
                          ? {
                            Version: ['Flagship'],
                            Quuid: aiAgentHostList
                              ?.filter?.((d: any) => d?.ProtectType === 'Flagship' && d?.Quuid)
                              ?.map?.((d: { Quuid: any; }) => d?.Quuid),
                          }
                          : whiteType === '1'
                            ? {
                              Quuid: aiAgentHostList?.filter?.((d: any) => d?.Quuid)?.map?.((d: { Quuid: any; }) => d?.Quuid),
                            }
                            : {
                              Version: ['ProtectedMachines'],
                              Quuid: aiAgentHostList?.filter?.((d: any) => d?.Quuid)?.map?.((d: { Quuid: any; }) => d?.Quuid),
                            }
                      }
                      isEnable={item =>
                      (policyAction == '2'
                        ? item?.ProtectType === 'Flagship'
                        : whiteType === '1'
                          ? true
                          : item.ProtectType === 'Flagship' ||
                          item.ProtectType === 'PRO_VERSION' ||
                          item.ProtectType === 'GENERAL_DISCOUNT')
                      }
                      showProjectFilter={false}
                      showLeftTagColumns={false}
                      showRightTagColumns={false}
                      renderColumns={[
                        {
                          header: '防护版本',
                          key: 'ProtectType',
                          render: record => hostVersionMap[record?.ProtectType],
                        },
                      ]}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <SheetFooter className="px-5 py-3 border-t flex flex-row items-center" style={{ gap: 12 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled={!policyName?.trim?.() || loading || fetchLoading} onClick={handleSubmit} style={{ width: 80 }}>
                    {'保存'}
                  </Button>
                </span>
              </TooltipTrigger>
              {!policyName?.trim?.() && (
                <TooltipContent>{'未设置必填项'}</TooltipContent>
              )}
            </Tooltip>
            <Button variant="outline" onClick={() => setVisible?.(false)} style={{ width: 80 }}>
              {'取消'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={modalVisible}
        onOpenChange={open => {
          if (!open) {
            setModalVisible?.(false);
            setVisible?.(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{' '}</DialogTitle>
          </DialogHeader>
          <div
            className={
              modalResult === 'loading'
                ? 'policyEdit-modal-loading'
                : modalResult === 'success'
                  ? 'newBaseline-ignoreSuccess'
                  : 'policyEdit-modal-fail'
            }
          >
            <h3>
              {modalResult === 'loading' && <Loader2 className="inline-block w-4 h-4 animate-spin mr-2 align-middle" style={{ margin: '-3px 10px 0 0' }} />}
              {modalResult === 'loading'
                ? '策略创建中，请稍候...'
                : modalResult === 'success'
                  ? '策略创建成功'
                  : '策略创建失败'}
            </h3>
            <div style={{ marginTop: 10, marginLeft: modalResult === 'loading' ? 25 : 0 }}>
              {modalResult === 'loading'
                ? '正在创建策略，请耐心等待'
                : modalResult === 'success'
                  ? '已成功创建策略，策略已生效'
                  : errMsg || '策略创建失败，请重新创建策略'}
            </div>
          </div>
          <DialogFooter>
            {modalResult === 'loading' ? (
              <Button disabled style={{ width: 90, textAlign: 'center' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : modalResult === 'success' ? (
              from === 'alarmList' || from === 'detail' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalVisible?.(false);
                    setVisible?.(false);
                    // refreshTable?.();
                  }}
                >
                  {'关闭'}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setModalVisible?.(false);
                      setVisible?.(false);
                    }}
                  >
                    {'返回列表'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPolicyName('');
                      setPolicyDesc('');
                      setProcessList([{ processType: PROCESS_TYPES[0].value, path: '', cmd: '' }]);
                      setModalVisible?.(false);
                    }}
                  >
                    {'再创建一条'}
                  </Button>
                </>
              )
            ) : (
              <Button onClick={() => setModalVisible?.(false)}>
                {'返回编辑策略'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
