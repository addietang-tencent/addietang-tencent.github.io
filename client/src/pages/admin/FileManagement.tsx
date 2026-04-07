import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  User,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

// Updated Mock Data for Enterprise Spaces
const ENTERPRISE_SPACES = [
  { id: "ent-001", name: "企业技能库", type: "公共", used: "12GB", quota: "50GB", expiry: "永久有效" },
  { id: "ent-002", name: "初始技能包", type: "公共", used: "8GB", quota: "50GB", expiry: "永久有效" },
];

// Mock Data for Personal Spaces (Grouped)
const PERSONAL_GROUPED_DATA = [
  {
    creator: "noah@acompany.com",
    avatar: "N",
    items: [
      { id: "ins-u25p9jqg", name: "Noah的分析助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
      { id: "ins-v88x2kww", name: "Noah的测试沙盒", type: "个人", used: "2GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
    ]
  },
  {
    creator: "mia@acompany.com",
    avatar: "M",
    items: [
      { id: "ins-t14o8ipf", name: "Mia的新助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
    ]
  },
  {
    creator: "leo@acompany.com",
    avatar: "L",
    items: [
      { id: "ins-s03n7heo", name: "Leo的项目助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
      { id: "ins-x11m9zzz", name: "Leo的文档库", type: "个人", used: "15GB", quota: "50GB", expiry: "2026-06-30", enabled: false },
    ]
  }
];

const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }: any) => (
  <Card className="shadow-sm border-gray-100 rounded-lg bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${bgColorClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{title}</span>
          <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function FileManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(
    new Set(PERSONAL_GROUPED_DATA.map(group => group.creator))
  );
  const [autoBindNewInstance, setAutoBindNewInstance] = useState(true);
  const [instancesEnabled, setInstancesEnabled] = useState<Record<string, boolean>>(
    PERSONAL_GROUPED_DATA.reduce((acc, group) => {
      group.items.forEach(item => {
        acc[item.id] = item.enabled;
      });
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [instanceToDisable, setInstanceToDisable] = useState<{ id: string; name: string } | null>(null);
  const [batchEnableDialogOpen, setBatchEnableDialogOpen] = useState(false);

  const handleToggleUserExpand = (email: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedUsers(newExpanded);
  };

  const handleToggleInstance = (instanceId: string, instanceName: string, currentEnabled: boolean) => {
    if (currentEnabled) {
      // 如果当前是开启状态，尝试关闭时弹出确认对话框
      setInstanceToDisable({ id: instanceId, name: instanceName });
      setDisableDialogOpen(true);
    } else {
      // 如果当前是关闭状态，直接开启
      setInstancesEnabled(prev => ({
        ...prev,
        [instanceId]: true
      }));
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

  // 计算未启用的实例数量
  const disabledInstancesCount = React.useMemo(() => {
    return PERSONAL_GROUPED_DATA.reduce((count, group) => {
      return count + group.items.filter(item => !instancesEnabled[item.id]).length;
    }, 0);
  }, [instancesEnabled]);

  // 获取所有未启用的实例ID
  const allDisabledInstanceIds = React.useMemo(() => {
    const ids: string[] = [];
    PERSONAL_GROUPED_DATA.forEach(group => {
      group.items.forEach(item => {
        if (!instancesEnabled[item.id]) {
          ids.push(item.id);
        }
      });
    });
    return ids;
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

    // 计算个人空间实例总数（只计算enabled=true的实例）
    const totalPersonalInstances = PERSONAL_GROUPED_DATA.reduce((sum, group) => {
      const enabledCount = group.items.filter(item => instancesEnabled[item.id]).length;
      return sum + enabledCount;
    }, 0);

    return {
      enterpriseSpacesCount,
      totalPersonalInstances
    };
  }, [instancesEnabled]);

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
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
        />
        <StatCard 
          title="已开通 AI 智能体私有网盘空间" 
          value={stats.totalPersonalInstances}
          icon={Bot} 
          colorClass="text-purple-600" 
          bgColorClass="bg-purple-50" 
        />
      </div>

      {/* Enterprise Public Space Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">企业公共空间</h2>
        </div>

        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-white">
              {/* 说明文字行 */}
              <TableRow className="bg-blue-50/30 hover:bg-blue-50/30 border-b border-gray-100">
                <TableHead colSpan={4} className="py-3 px-6 font-normal">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold">i</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      默认开启，为您赠送 <span className="font-semibold text-blue-600">50G+50G</span> 永久免费空间，用于存放企业级技能库和初始技能包
                    </p>
                  </div>
                </TableHead>
              </TableRow>
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[35%] text-left">空间名称</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[18%] text-left">类型</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[28%] text-left">已用/存储容量</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[19%] text-left">有效期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENTERPRISE_SPACES.map((item) => (
                <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 last:border-0 group">
                  <TableCell className="py-4 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Building className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600">{item.type}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">
                    {item.used}/{<span className="font-bold">{item.quota}</span>}
                    <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">免费</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">{item.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* AI Agent Private Space Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">AI 智能体私有网盘空间</h2>
          </div>
          <p className="text-sm text-gray-600">
            开启后，为您赠送每个 OpenClaw 实例 <span className="font-semibold text-purple-600">3个月50GB</span> 免费额度，到期后可以通过购买资源包进行续租
          </p>
        </div>

        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          {/* Search Bar and Auto Bind Configuration */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBatchEnable}
                disabled={selectedInstances.size === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium px-4 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                批量启用网盘服务
                {selectedInstances.size > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {selectedInstances.size}
                  </span>
                )}
              </Button>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="搜索名称或创建人" 
                  className="pl-9 h-9 bg-gray-50/50 border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Auto Bind Configuration */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">新增实例是否自动绑定网盘</span>
                  <span className="text-xs text-gray-500">开启后，新创建的 AI 智能体实例将自动分配网盘空间</span>
                </div>
                <Switch 
                  checked={autoBindNewInstance}
                  onCheckedChange={setAutoBindNewInstance}
                />
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="bg-purple-600 p-1 rounded text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>共计 <span className="font-bold text-gray-900">{stats.totalPersonalInstances}</span> 个 OpenClaw 实例</span>
              </div>
            </div>
          </div>

          {/* Grouped Table */}
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[3%] text-left">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={disabledInstancesCount === 0}
                    className={isIndeterminate ? "data-[state=checked]:bg-purple-600" : ""}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[32%] text-left">创建人 / 名称</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[18%] text-left">类型</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[22%] text-left">已用/存储容量</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[15%] text-left">有效期</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[10%] text-left">是否启用网盘</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERSONAL_GROUPED_DATA.map((group) => {
                const isExpanded = expandedUsers.has(group.creator);
                const enabledCount = group.items.filter(item => instancesEnabled[item.id]).length;
                
                return (
                  <React.Fragment key={group.creator}>
                    {/* Creator Row - Always Visible */}
                    <TableRow 
                      className="hover:bg-purple-50/20 transition-colors border-b border-gray-50 cursor-pointer group"
                      onClick={() => handleToggleUserExpand(group.creator)}
                    >
                      <TableCell className="py-4 px-6 align-middle"></TableCell>
                      <TableCell className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm font-semibold text-sm">
                            {group.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{group.creator}</span>
                            <span className="text-xs text-gray-500">{enabledCount} 个实例</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 align-middle" colSpan={4}></TableCell>
                    </TableRow>

                    {/* Instance Rows - Shown when expanded */}
                    {isExpanded && group.items.map((item) => {
                      const isEnabled = instancesEnabled[item.id];
                      const isSelected = selectedInstances.has(item.id);
                      return (
                        <TableRow 
                          key={item.id} 
                          className="hover:bg-purple-50/20 transition-colors border-b border-gray-50 last:border-0 bg-gray-50/30"
                        >
                          <TableCell className="py-4 px-6 align-middle" onClick={(e) => e.stopPropagation()}>
                            {!isEnabled && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelectInstance(item.id, checked as boolean)}
                                className="data-[state=checked]:bg-purple-600"
                                aria-label={`选择 ${item.name}`}
                              />
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 pl-14 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Bot className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 align-middle">
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600">{item.type}</span>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">
                            {isEnabled ? (
                              <>
                                {item.used}/{<span className="font-bold">{item.quota}</span>}
                                <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">免费</span>
                              </>
                            ) : (
                              <span className="text-gray-400">未启用</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">
                            {isEnabled ? item.expiry : <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell className="py-4 px-6 align-middle">
                            <Switch 
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleInstance(item.id, item.name, isEnabled)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
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
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Bot className="w-5 h-5" />
              批量启用网盘服务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              您确定要为选中的 <span className="font-bold text-purple-600">{selectedInstances.size}</span> 个实例启用网盘服务吗?
            </p>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-800 space-y-1">
                  <p className="font-semibold">启用后：</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>每个实例将获得 3个月50GB 免费额度</li>
                    <li>实例可以访问专属网盘空间</li>
                    <li>到期后可购买资源包续租</li>
                  </ul>
                </div>
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
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              确认启用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
