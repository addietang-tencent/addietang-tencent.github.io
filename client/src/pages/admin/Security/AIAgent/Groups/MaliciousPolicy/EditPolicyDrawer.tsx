

/* eslint-disable  */


import React, { useEffect, useState } from 'react';
import { Base64 } from 'js-base64';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
import { ModifyRiskDnsPolicy, DescribeMachineGeneral } from '@/pages/admin/Security/api';

import { LICENSE_TYPES_MAP, hostVersionMap } from '../BashPolicy/Constants';
import { AUTHORIZE_ROUTE, checkMachineIsWindows } from '../../constants';
import MultiTypeSelectMachine from '../../Common/MultiTypeSelectMachine';
import CvmSelectComponent from '../../Common/CvmSelectComponent';

export function EditPolicyDrawer({
  type = 'create',
  from = undefined,
  selectItem,
  visible = false,
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
  const [whiteType, setWhiteType] = useState('0');
  const [domains, setDomains] = useState('');
  const [hostScope, setHostScope] = useState('1');
  const [selectMachine, setSelectMachine] = useState([] as any);
  const [selectQuuidList, setSelectQuuidList] = useState([]);
  const [policyAction, setPolicyAction] = useState('0');
  const [machineStat, setMachineStat] = useState({} as any);
  const [modalVisible, setModalVisible] = useState(false);
  const [isHandleOld, setIsHandleOld] = useState(true);
  const [modalResult, setModalResult] = useState('loading');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async () => {
    const isSystemBlock = String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2';
    if (!policyName?.trim?.()) {
      toast.error('策略名称不能为空');
      return;
    }
    if (policyName?.trim?.()?.length > 20 && !isSystemBlock) {
      toast.error('策略名称不能超过20个字符');
      return;
    }
    if (policyDesc?.trim?.()?.length > 200 && !isSystemBlock) {
      toast.error('策略描述不能超过200个字符');
      return;
    }
    if (!domains?.trim?.()?.length) {
      toast.error('域名详情不能为空');
      return;
    }
    const arr =
      domains
        ?.split?.('\n')
        ?.map?.(item => item?.trim?.())
        ?.filter?.(item => item) ?? [];
    if (arr?.length <= 0 && !isSystemBlock) {
      toast.error('域名详情不能为空');
      return;
    }
    const domainReg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    if (arr?.some?.(d => !domainReg.test(d) && !(d?.indexOf?.('*.') === 0 && domainReg.test(d?.slice?.(2))))) {
      toast.error('请输入正确格式的域名或泛域名');
      return;
    }
    if (arr?.length > 100 && !isSystemBlock) {
      toast.error('域名最多只能输入100个');
      return;
    }
    if (hostScope === '1' && !selectMachine?.length) {
      toast.error('请选择OpenClaw');
      return;
    }
    setLoading(true);
    if (type === 'create') {
      setModalVisible(true);
      setModalResult('loading');
    }
    const params: any = {
      PolicyName: policyName?.trim?.(),
      PolicyType: type === 'create' ? 1 : selectItem?.PolicyType ?? 1,
      PolicyDesc: policyDesc?.trim?.(),
      PolicyAction: Number(policyAction),
      HostScope: hostScope == '0' ? (policyAction == '2' ? 2 : whiteType === '1' ? 3 : 1) : 0,
      Domains: isSystemBlock ? selectItem?.Domains || [] : arr?.map?.(str => Base64.encode(str)),
      IsEnabled: isEnabled ? 0 : 1,
      HostIds: hostScope == '1' ? selectMachine : [],
    };
    if (type === 'edit') {
      params.PolicyId = selectItem?.PolicyId;
    }
    if (policyAction == '1' && type === 'create') {
      params.IsDealOldEvent = isHandleOld ? 1 : 0;
    }
    if (from === 'alarmList' && initParams?.EventId) {
      params.EventId = initParams?.EventId;
    }
    const res: any = await ModifyRiskDnsPolicy({ Data: params });
    if (String(res?.Repeat) === '1') {
      setModalVisible(false);
      setLoading(false);
      toast.error('存在相同策略，无法创建');
      return;
    }
    if (res) {
      if (type === 'create') {
        setModalResult('success');
      } else {
        setVisible?.(false);
      }
      toast.success('操作成功');
      refreshTable?.();
    } else if (type === 'create') {
      setModalResult('fail');
      setErrMsg(res?.msg || res?.uiMsg || res?.message || '');
    }
    setLoading(false);
  };

  const getMachineTotal = async () => {
    const res: any = await DescribeMachineGeneral();
    setMachineStat(res || {});
  };

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setIsHandleOld(type === 'create' ? true : String(selectItem?.IsDealOldEvent) === '1');
      setIsEnabled(type === 'create' ? true : String(selectItem?.IsEnabled) === '0');
      setPolicyName(type === 'create' ? '' : selectItem?.PolicyName || '');
      setPolicyDesc(type === 'create' ? '' : selectItem?.PolicyDesc || '');
      setWhiteType(
        type === 'create'
          ? initParams?.PolicyAction == 1
            ? '1'
            : '0'
          : String(selectItem?.PolicyAction) === '1'
            ? '1'
            : '0',
      );
      setHostScope('1');
      setSelectQuuidList(
        type === 'create'
          ? initParams?.PolicyAction == 2
            ? initParams?.HostIds
            : []
          : (selectItem?.HostIds || [])?.filter?.((id: any) => id),
      );
      setSelectMachine(
        type === 'create'
          ? initParams?.PolicyAction == 2
            ? initParams?.HostIds
            : []
          : (selectItem?.HostIds || [])?.filter?.((id: any) => id),
      );
      setDomains(
        type === 'create'
          ? initParams?.PolicyAction
            ? initParams?.Domain
            : ''
          : selectItem?.Domains?.join?.('\n') || '',
      );
      setPolicyAction(
        type === 'create'
          ? initParams?.PolicyAction
            ? `${initParams?.PolicyAction}`
            : '0'
          : `${selectItem?.PolicyAction || '0'}`,
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
                <a className="underline cursor-pointer" onClick={() => window.open(AUTHORIZE_ROUTE)}>{'升级版本'}</a>
              </AlertDescription>
            </Alert>
            <div className={`maliciousRequest-editPolicy`}>
              <h3 style={{ margin: '15px 0 20px 0' }}>{'基本信息'}</h3>
              <div className="mg-bt-20">
                <div className="label-txt mg-tp-6">
                  <span style={{ color: 'red' }}>*</span>
                  {' 策略名称'}
                </div>
                <div className="content">
                  <Input
                    value={policyName}
                    onChange={e => setPolicyName(e.target.value)}
                    disabled={String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2'}
                    style={{ width: 600 }}
                    placeholder={'请输入策略名称，限制20个字符以内'}
                  />
                </div>
              </div>
              <div className="mg-bt-20">
                <div className="label-txt mg-tp-6">{'策略描述'}</div>
                <div className="content">
                  <Input
                    value={policyDesc}
                    onChange={e => setPolicyDesc(e.target.value)}
                    disabled={String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2'}
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
              <h3 className="mg-bt-20">{'策略详情'}</h3>
              <div className="mg-bt-20">
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
                    }}
                    disabled={String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2'}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="0" id="blacklist" />
                      <Label htmlFor="blacklist">{'黑名单'}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="1" id="whitelist" />
                      <Label htmlFor="whitelist">{'白名单'}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="mg-bt-20">
                <div className="label-txt mg-tp-6">
                  <span style={{ color: 'red' }}>*</span>
                  {' 执行动作'}
                </div>
                <div className="content">
                  <ToggleGroup
                    type="single"
                    value={policyAction}
                    onValueChange={value => {
                      if (value) {
                        setPolicyAction(value);
                      }
                    }}
                    variant="outline"
                    className="w-fit"
                  >
                    <ToggleGroupItem value="0" className="px-4" style={{ borderRadius: 0 }} disabled={whiteType === '1' || (String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2')}>
                      {'告警'}
                    </ToggleGroupItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <ToggleGroupItem value="2" className="px-4" style={{ borderRadius: 0 }} disabled={whiteType === '1' || !hasFlagship || (String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2')}>
                            {'拦截'}
                          </ToggleGroupItem>
                        </span>
                      </TooltipTrigger>
                      {!hasFlagship && (
                        <TooltipContent>
                          {'当前暂无旗舰版OpenClaw，无法设置拦截策略，可点击升级版本'}
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <ToggleGroupItem value="1" className="px-4" style={{ borderRadius: 0 }} disabled={whiteType === '0' || (String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2')}>
                      {'放行'}
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <div className="tip">
                    {policyAction == '0' ? (
                      '当OpenClaw尝试对策略范围内的域名进行外联时，将产生告警记录。'
                    ) : policyAction == '2' ? (
                      <>
                        <p>{'拦截规则只针对新启动进程发起的IP/域名/泛域名请求有效。'}</p>
                        <p>{'当前仅支持Linux系统拦截，Windows系统暂不支持。'}</p>
                      </>
                    ) : (
                      '当OpenClaw尝试对策略范围内的域名进行外联时，将不再产生告警或拦截行为。'
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="label-txt">
                  <span style={{ color: 'red' }}>*</span>
                  {' 域名详情'}
                </div>
                <div className="content">
                  <Textarea
                    value={domains}
                    onChange={e => setDomains(e.target.value)}
                    disabled={String(selectItem?.PolicyType) === '0' && String(selectItem?.PolicyAction) === '2'}
                    style={{ width: 600, resize: 'vertical' }}
                  />
                  <div className="tip">
                    {'请输入IP/域名/泛域名（如：www.12345.com、*.tencent.com等，暂不支持URL），多个内容以换行分隔'}
                  </div>
                </div>
              </div>
              <hr style={{ margin: '20px -20px' }} />
              <h3 className="mg-bt-20">
                {`生效OpenClaw范围 (已选择${hostScope == '1'
                  ? selectMachine?.length || 0
                  : policyAction == '2'
                    ? machineStat?.FlagshipMachineCnt || 0
                    : whiteType === '1'
                      ? machineStat?.MachineCnt || 0
                      : (machineStat?.FlagshipMachineCnt || 0) + (machineStat?.SpecialtyMachineCnt || 0)}台)`}
              </h3>
              <div className="mg-bt-20">
                <div className="content" style={{ marginTop: -15 }}>
                  {hostScope == '1' ? (
                    <CvmSelectComponent
                      layout="fixed"
                      isAllMachineSelectable
                      isNewDnsBlock={policyAction == '2'}
                      isBlockMode={policyAction == '2' ? '2' : whiteType === '1' ? '0' : '1'}
                      QuuidList={selectQuuidList}
                      onChange={(keys: any, rows: any) =>
                        setSelectMachine(rows?.filter?.((d: any) => d.Quuid)?.map?.((d: any) => d.Quuid) ?? [])
                      }
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
                        ? item?.ProtectType === 'Flagship' && !checkMachineIsWindows(item)
                        : whiteType === '1'
                          ? true
                          : item.ProtectType === 'Flagship' ||
                          item.ProtectType === 'PRO_VERSION' ||
                          item.ProtectType === 'GENERAL_DISCOUNT')
                      }
                      showProjectFilter={false}
                      showLeftTagColumns={false}
                      showRightTagColumns={false}
                      setFetchLoading={setFetchLoading}
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
            {policyAction == '1' && type === 'create' && (
              <div style={{ marginTop: 15 }} className="flex items-center gap-2">
                <Checkbox checked={isHandleOld} onCheckedChange={val => setIsHandleOld(!!val)} id="handle-old" />
                <Label htmlFor="handle-old">
                  {'对符合本策略规则的历史"待处理"告警，执行本策略规则的操作'}
                </Label>
              </div>
            )}
          </div>
          <SheetFooter className="px-5 py-3 border-t flex flex-row gap-3">
            {policyName?.trim?.() && domains?.trim?.() ? (
              <Button className="flex-1" disabled={loading || fetchLoading} onClick={handleSubmit}>
                {'保存'}
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button className="w-full" disabled>
                      {'保存'}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{'未设置必填项'}</TooltipContent>
              </Tooltip>
            )}
            <Button className="flex-1" variant="outline" onClick={() => setVisible?.(false)}>
              {'取消'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={modalVisible} onOpenChange={open => { if (!open) { setModalVisible?.(false); setVisible?.(false); } }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="sr-only">{'创建策略结果'}</DialogTitle>
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
              {modalResult === 'loading' && <Loader2 className="inline-block w-4 h-4 animate-spin mr-2 align-middle" />}
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
              from === 'alarmList' ? (
                <Button
                  onClick={() => {
                    setModalVisible?.(false);
                    setVisible?.(false);
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
                      setDomains('');
                      setSelectMachine([]);
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
