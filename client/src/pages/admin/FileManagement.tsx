import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Bot,
  Building,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info
} from "lucide-react";

// Updated Mock Data for Enterprise Spaces
const ENTERPRISE_SPACES = [
  { id: "ent-001", name: "企业技能库", type: "公共", used: "12GB", quota: "50GB", expiry: "永久有效" },
  { id: "ent-002", name: "初始技能包", type: "公共", used: "8GB", quota: "50GB", expiry: "永久有效" },
];

// Mock Data for Personal Spaces (Flat Structure)
const PERSONAL_SPACES_DATA = [
  { id: "user-ins-1", instanceId: "ins-u25p9jqg", instanceName: "Noah的分析助手", creator: "noah@acompany.com", avatar: "N", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-2", instanceId: "ins-u25p9jqg", instanceName: "Noah的分析助手", creator: "alice@acompany.com", avatar: "A", type: "个人", used: "3GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-3", instanceId: "ins-v88x2kww", instanceName: "Noah的测试沙盒", creator: "noah@acompany.com", avatar: "N", type: "个人", used: "2GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-4", instanceId: "ins-t14o8ipf", instanceName: "Mia的新助手", creator: "mia@acompany.com", avatar: "M", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-5", instanceId: "ins-t14o8ipf", instanceName: "Mia的新助手", creator: "bob@acompany.com", avatar: "B", type: "个人", used: "8GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-6", instanceId: "ins-s03n7heo", instanceName: "Leo的项目助手", creator: "leo@acompany.com", avatar: "L", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-7", instanceId: "ins-x11m9zzz", instanceName: "Leo的文档库", creator: "leo@acompany.com", avatar: "L", type: "个人", used: "15GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
  { id: "user-ins-8", instanceId: "ins-x11m9zzz", instanceName: "Leo的文档库", creator: "carol@acompany.com", avatar: "C", type: "个人", used: "12GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
];

const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:-translate-y-0.5"
    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm text-gray-500">{title}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
  </div>
);

export default function FileManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [autoBindNewInstance, setAutoBindNewInstance] = useState(true);
  const [instancesEnabled, setInstancesEnabled] = useState<Record<string, boolean>>(
    PERSONAL_SPACES_DATA.reduce((acc, item) => {
      acc[item.id] = item.enabled;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [instanceToDisable, setInstanceToDisable] = useState<{ id: string; name: string } | null>(null);
  const [batchEnableDialogOpen, setBatchEnableDialogOpen] = useState(false);
  const [singleEnableDialogOpen, setSingleEnableDialogOpen] = useState(false);
  const [instanceToEnable, setInstanceToEnable] = useState<{ id: string; name: string } | null>(null);

  const handleToggleInstance = (instanceId: string, instanceName: string, currentEnabled: boolean) => {
    if (currentEnabled) {
      // 如果当前是开启状态，尝试关闭时弹出确认对话框
      setInstanceToDisable({ id: instanceId, name: instanceName });
      setDisableDialogOpen(true);
    } else {
      // 如果当前是关闭状态，弹出开启确认对话框
      setInstanceToEnable({ id: instanceId, name: instanceName });
      setSingleEnableDialogOpen(true);
    }
  };

  const handleConfirmDisable = () => {
    if (instanceToDisable) {
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceToDisable.id]: false
      }));
    }
    setDisableDialogOpen(false);
    setInstanceToDisable(null);
  };

  const handleCancelDisable = () => {
    setDisableDialogOpen(false);
    setInstanceToDisable(null);
  };

  const handleBatchEnable = () => {
    if (selectedInstances.size > 0) {
      setBatchEnableDialogOpen(true);
    }
  };

  const handleConfirmBatchEnable = () => {
    // 启用所有选中的实例
    const newEnabled = { ...instancesEnabled };
    selectedInstances.forEach(instanceId => {
      newEnabled[instanceId] = true;
    });
    setInstancesEnabled(newEnabled);
    setSelectedInstances(new Set()); // 清空选中状态
    setBatchEnableDialogOpen(false);
  };

  const handleCancelBatchEnable = () => {
    setBatchEnableDialogOpen(false);
  };

  const handleConfirmSingleEnable = () => {
    if (instanceToEnable) {
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceToEnable.id]: true
      }));
    }
    setSingleEnableDialogOpen(false);
    setInstanceToEnable(null);
  };

  const handleCancelSingleEnable = () => {
    setSingleEnableDialogOpen(false);
    setInstanceToEnable(null);
  };

  // 计算未启用的实例数量
  const disabledInstancesCount = React.useMemo(() => {
    return PERSONAL_SPACES_DATA.filter(item => !instancesEnabled[item.id]).length;
  }, [instancesEnabled]);

  // 获取所有未启用的实例ID
  const allDisabledInstanceIds = React.useMemo(() => {
    return PERSONAL_SPACES_DATA.filter(item => !instancesEnabled[item.id]).map(item => item.id);
  }, [instancesEnabled]);

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInstances(new Set(allDisabledInstanceIds));
    } else {
      setSelectedInstances(new Set());
    }
  };

  // 处理单个实例选中
  const handleSelectInstance = (instanceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInstances);
    if (checked) {
      newSelected.add(instanceId);
    } else {
      newSelected.delete(instanceId);
    }
    setSelectedInstances(newSelected);
  };

  // 判断是否全选
  const isAllSelected = allDisabledInstanceIds.length > 0 && 
    allDisabledInstanceIds.every(id => selectedInstances.has(id));

  // 判断是否部分选中
  const isIndeterminate = selectedInstances.size > 0 && 
    selectedInstances.size < allDisabledInstanceIds.length;

  // 计算统计数据
  const stats = React.useMemo(() => {
    // 计算企业公共空间数量
    const enterpriseSpacesCount = ENTERPRISE_SPACES.length;

    // 计算个人空间实例总数（只计算enabled=true的记录）
    const totalPersonalInstances = PERSONAL_SPACES_DATA.filter(item => instancesEnabled[item.id]).length;

    return {
      enterpriseSpacesCount,
      totalPersonalInstances
    };
  }, [instancesEnabled]);

  // 搜索过滤
  const filteredPersonalSpaces = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return PERSONAL_SPACES_DATA;
    }
    const query = searchQuery.toLowerCase().trim();
    return PERSONAL_SPACES_DATA.filter(item => 
      item.instanceName.toLowerCase().includes(query) ||
      item.instanceId.toLowerCase().includes(query) ||
      item.creator.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="page-enter space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">网盘管理</h1>
          <p className="text-sm text-gray-500 mt-1">为您提供专属、安全的云存储空间，由腾讯云存储 Agent Storage 服务提供支持</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard 
          title="企业公共空间" 
          value={stats.enterpriseSpacesCount}
          icon={Building} 
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="已开通 AI 智能体私有空间" 
          value={stats.totalPersonalInstances}
          icon={Bot} 
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Enterprise Public Space Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">企业公共空间</h2>
        </div>

        {/* 信息提示横幅 */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-600 leading-relaxed">
            默认开启,为您赠送 <span className="font-semibold">50G+50G</span> 永久免费空间,用于存放企业级技能库和初始技能包
          </p>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[35%]">
                  空间名称
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[18%]">
                  类型
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[28%]">
                  已用/存储容量
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[19%]">
                  有效期
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENTERPRISE_SPACES.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="tabular-nums">
                      {item.used}/{<span className="font-semibold">{item.quota}</span>}
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">
                      免费
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 tabular-nums">{item.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Agent Private Space Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">AI 智能体私有空间</h2>
        </div>

        {/* 信息提示横幅 */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-600 leading-relaxed">
            开启后,为您赠送每个 OpenClaw 实例 <span className="font-semibold">3个月50GB</span> 免费额度,到期后可以通过购买资源包进行续租
          </p>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          {/* Search Bar and Auto Bind Configuration */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBatchEnable}
                disabled={selectedInstances.size === 0}
                style={selectedInstances.size > 0 ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
                className={`text-white rounded-lg text-sm font-medium px-4 h-9 transition-all ${
                  selectedInstances.size === 0 ? "bg-gray-300 cursor-not-allowed" : "btn-primary-glow"
                }`}
              >
                批量启用网盘服务
                {selectedInstances.size > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {selectedInstances.size}
                  </span>
                )}
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="搜索名称、ID或创建人" 
                  className="pl-9 h-9 bg-white border-gray-300 hover:border-gray-400 focus:border-purple-500 rounded-lg text-sm transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Auto Bind Configuration */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">新增实例是否自动绑定网盘</span>
                  <span className="text-xs text-gray-500">开启后,新创建的 AI 智能体实例将自动分配网盘空间</span>
                </div>
                <Switch 
                  checked={autoBindNewInstance}
                  onCheckedChange={setAutoBindNewInstance}
                />
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span>共计 <span className="font-semibold text-gray-900 tabular-nums">{stats.totalPersonalInstances}</span> 个 OpenClaw 实例</span>
              </div>
            </div>
          </div>

          {/* Flat Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[3%]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={disabledInstancesCount === 0}
                    aria-label="全选"
                  />
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[25%]">
                  OpenClaw 实例
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[18%]">
                  创建人
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[10%]">
                  类型
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">
                  已用/存储容量
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[12%]">
                  有效期
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap w-[10%]">
                  启用网盘
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPersonalSpaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">未找到匹配的记录</p>
                      <p className="text-xs text-gray-400">请尝试其他搜索关键词</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPersonalSpaces.map((item) => {
                  const isEnabled = instancesEnabled[item.id];
                  const isSelected = selectedInstances.has(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {!isEnabled && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectInstance(item.id, checked as boolean)}
                            aria-label={`选择 ${item.instanceName}`}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">{item.instanceName}</span>
                            <span className="text-xs font-mono text-blue-500">{item.instanceId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white shrink-0 font-semibold text-xs">
                            {item.avatar}
                          </div>
                          <span className="text-sm text-gray-900 truncate">{item.creator}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {isEnabled ? (
                          <span className="tabular-nums">
                            {item.used}/{<span className="font-semibold">{item.quota}</span>}
                            <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">
                              免费
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">未启用</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 tabular-nums">
                        {isEnabled ? item.expiry : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Switch 
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleInstance(item.id, item.instanceName, isEnabled)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disable Confirmation Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              确认关闭网盘
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              您确定要关闭 <span className="font-bold text-gray-900">"{instanceToDisable?.name}"</span> 的网盘功能吗？
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">关闭网盘后：</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>该实例将无法访问网盘中的文件</li>
                    <li>已存储的文件将被永久删除</li>
                    <li>此操作不可撤销</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDisable}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmDisable}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              确认关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Enable Confirmation Dialog */}
      <Dialog open={batchEnableDialogOpen} onOpenChange={setBatchEnableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Bot className="w-5 h-5 text-purple-600" />
              批量启用网盘服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              您确定要为选中的 <span className="font-semibold text-purple-600 tabular-nums">{selectedInstances.size}</span> 个实例启用网盘服务吗?
            </p>
            <div className="flex items-start gap-2.5 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5">
              <Bot className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-800 space-y-1 leading-relaxed">
                <p className="font-semibold">启用后：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>每个实例将获得 3个月50GB 免费额度</li>
                  <li>实例可以访问专属网盘空间</li>
                  <li>到期后可购买资源包续租</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelBatchEnable}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmBatchEnable}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              className="flex-1 text-white btn-primary-glow"
            >
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Enable Confirmation Dialog */}
      <Dialog open={singleEnableDialogOpen} onOpenChange={setSingleEnableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Bot className="w-5 h-5 text-purple-600" />
              启用网盘服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              您确定要为 <span className="font-bold text-gray-900">"{instanceToEnable?.name}"</span> 启用网盘服务吗?
            </p>
            <div className="flex items-start gap-2.5 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5">
              <Bot className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-800 space-y-1 leading-relaxed">
                <p className="font-semibold">启用后：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>该实例将获得 3个月50GB 免费额度</li>
                  <li>实例可以访问专属网盘空间</li>
                  <li>到期后可购买资源包续租</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelSingleEnable}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmSingleEnable}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              className="flex-1 text-white btn-primary-glow"
            >
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
