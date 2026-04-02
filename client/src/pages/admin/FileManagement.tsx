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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Bot,
  ShieldAlert,
  HardDrive,
  PieChart,
  Layers,
  Building,
  User,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  Folder,
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  ExternalLink,
  MoreVertical,
  Zap,
  Share2
} from "lucide-react";

// Updated Mock Data for Enterprise Spaces
const ENTERPRISE_SPACES = [
  { id: "ent-skill-lib", name: "企业技能库", type: "公共", used: "12GB", quota: "50GB", expiry: "永久有效" },
  { id: "ent-plugin-lib", name: "企业预设配置库", type: "公共", used: "8GB", quota: "50GB", expiry: "永久有效" },
];

// Mock Data for Personal Spaces (Grouped)
const PERSONAL_GROUPED_DATA = [
  {
    creator: "noah@acompany.com",
    avatar: "N",
    items: [
      { id: "ins-u25p9jqg", name: "Noah的分析助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30" },
      { id: "ins-v88x2kww", name: "Noah的测试沙盒", type: "个人", used: "2GB", quota: "50GB", expiry: "2026-06-30" },
    ]
  },
  {
    creator: "mia@acompany.com",
    avatar: "M",
    items: [
      { id: "ins-t14o8ipf", name: "Mia的新助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30" },
    ]
  },
  {
    creator: "leo@acompany.com",
    avatar: "L",
    items: [
      { id: "ins-s03n7heo", name: "Leo的项目助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2026-06-30" },
      { id: "ins-x11m9zzz", name: "Leo的文档库", type: "个人", used: "15GB", quota: "50GB", expiry: "2026-06-30" },
    ]
  }
];

// Mock Data for Recycle Bin
const RECYCLE_BIN_INSTANCES = [
  { id: "del-ins-01", name: "张三的旧助手", creator: "张三", deleteTime: "2026-03-25", used: "12.5GB" },
  { id: "del-ins-02", name: "李四的测试环境", creator: "李四", deleteTime: "2026-03-20", used: "4.2GB" },
];

const RECYCLE_BIN_FILES = [
  { id: "f1", name: "项目文档", type: "folder", size: "-", time: "2026-03-10", owner: "张三", status: "pending_assign" },
  { id: "f2", name: "方案.docx", type: "docx", size: "2.3MB", time: "2026-03-05", owner: "张三", status: "pending_assign" },
  { id: "f3", name: "截图.png", type: "png", size: "1.2MB", time: "2026-03-08", owner: "张三", status: "pending_assign" },
  { id: "f4", name: "报表.xlsx", type: "xlsx", size: "5.6MB", time: "2026-03-12", owner: "张三", status: "pending_destroy", days: 3 },
];

const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, valueColorClass = "text-gray-900" }: any) => (
  <Card className="shadow-sm border-gray-100 rounded-xl bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${bgColorClass}`}>
          <Icon className={`w-7 h-7 ${colorClass}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-500 mb-1">{title}</span>
          <span className={`text-3xl font-bold tracking-tight truncate ${valueColorClass}`}>{value}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function FileManagement() {
  const [isSmhEnabled, setIsSmhEnabled] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [recycleBinView, setRecycleBinView] = useState<"list" | "detail">("list");
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectedQuotaItem, setSelectedQuotaItem] = useState<any>(null);
  const [newQuota, setNewQuota] = useState<string>("50GB");
  const [recycleBinFiles, setRecycleBinFiles] = useState(RECYCLE_BIN_FILES);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchQuotaDialogOpen, setIsBatchQuotaDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [batchNewQuota, setBatchNewQuota] = useState<string>("50GB");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set(PERSONAL_GROUPED_DATA.map(g => g.creator)));

  // 动态计算统计数据
  const calculateStats = () => {
    // 企业公共空间数据
    const enterpriseUsed = ENTERPRISE_SPACES.reduce((sum, space) => {
      const used = parseFloat(space.used.replace('GB', '').replace('TB', '')) * 
                   (space.used.includes('TB') ? 1024 : 1);
      return sum + used;
    }, 0);

    const enterpriseQuota = ENTERPRISE_SPACES.reduce((sum, space) => {
      const quota = parseFloat(space.quota.replace('GB', '').replace('TB', '')) * 
                    (space.quota.includes('TB') ? 1024 : 1);
      return sum + quota;
    }, 0);

    // 个人空间数据
    const personalItems = PERSONAL_GROUPED_DATA.flatMap(group => group.items);
    const personalUsed = personalItems.reduce((sum, item) => {
      const used = parseFloat(item.used.replace('GB', '').replace('TB', '')) * 
                   (item.used.includes('TB') ? 1024 : 1);
      return sum + used;
    }, 0);

    const personalQuota = personalItems.reduce((sum, item) => {
      const quota = parseFloat(item.quota.replace('GB', '').replace('TB', '')) * 
                    (item.quota.includes('TB') ? 1024 : 1);
      return sum + quota;
    }, 0);

    // 合并所有空间数据
    const allSpaces = [
      ...ENTERPRISE_SPACES,
      ...personalItems
    ];

    // 计算总存储容量
    const totalQuota = enterpriseQuota + personalQuota;

    // 计算已用存储容量
    const totalUsed = enterpriseUsed + personalUsed;

    // 格式化显示(自动转换为GB或TB)
    const formatStorage = (gb: number) => {
      if (gb >= 1024) {
        return `${(gb / 1024).toFixed(1)}TB`;
      }
      return `${gb}GB`;
    };

    // 计算总空间数
    const totalSpaces = allSpaces.length;
    
    // 计算企业公共空间数量
    const enterpriseSpacesCount = ENTERPRISE_SPACES.length;

    // 计算个人空间实例总数
    const totalPersonalInstances = PERSONAL_GROUPED_DATA.reduce((sum, group) => {
      return sum + group.items.length;
    }, 0);

    // 计算使用百分比
    const usagePercentage = totalQuota > 0 
      ? Math.round((totalUsed / totalQuota) * 100) 
      : 0;

    const enterprisePercentage = enterpriseQuota > 0
      ? Math.round((enterpriseUsed / enterpriseQuota) * 100)
      : 0;

    const personalPercentage = personalQuota > 0
      ? Math.round((personalUsed / personalQuota) * 100)
      : 0;

    return {
      totalQuota: formatStorage(totalQuota),
      totalUsed: formatStorage(totalUsed),
      totalSpaces,
      enterpriseSpacesCount,
      totalPersonalInstances,
      usagePercentage,
      enterpriseUsed: formatStorage(enterpriseUsed),
      enterpriseQuota: formatStorage(enterpriseQuota),
      enterprisePercentage,
      personalUsed: formatStorage(personalUsed),
      personalQuota: formatStorage(personalQuota),
      personalPercentage
    };
  };

  const stats = calculateStats();

  // 搜索过滤逻辑(仅过滤个人空间)
  const getFilteredPersonalData = () => {
    const query = searchQuery.toLowerCase().trim();
    
    // 如果没有搜索词,返回所有个人空间数据
    if (!query) {
      return PERSONAL_GROUPED_DATA;
    }

    // 过滤个人空间(按用户分组)
    const filteredPersonalGroupedData = PERSONAL_GROUPED_DATA
      .map(group => {
        // 过滤该用户的实例
        const filteredItems = group.items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          group.creator.toLowerCase().includes(query)
        );
        
        // 只返回有匹配实例的用户组
        if (filteredItems.length > 0) {
          return {
            ...group,
            items: filteredItems
          };
        }
        return null;
      })
      .filter(group => group !== null) as typeof PERSONAL_GROUPED_DATA;

    return filteredPersonalGroupedData;
  };

  const filteredPersonalData = getFilteredPersonalData();

  // 计算过滤后的个人实例总数
  const filteredPersonalInstancesCount = filteredPersonalData.reduce((sum, group) => {
    return sum + group.items.length;
  }, 0);

  // 分页逻辑：按用户分组进行分页
  const totalPages = Math.ceil(filteredPersonalData.length / pageSize);
  const paginatedPersonalData = filteredPersonalData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 当搜索或过滤改变时，重置到第一页
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenQuotaDialog = (item: any) => {
    setSelectedQuotaItem(item);
    setNewQuota("50GB");
    setIsQuotaDialogOpen(true);
  };

  const handleQuotaSelect = (quota: string) => {
    setNewQuota(quota);
  };

  const handleConfirmQuota = () => {
    alert(`已将 ${selectedQuotaItem?.name} 的存储容量调整为: ${newQuota}`);
    // TODO: 实现实际的存储容量调整逻辑
    setIsQuotaDialogOpen(false);
  };

  const handleOpenBatchQuotaDialog = () => {
    // 不重置用户选择，保留表格中选择的用户
    setBatchNewQuota("50GB");
    setIsBatchQuotaDialogOpen(true);
  };

  const handleToggleUser = (userEmail: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userEmail);
    } else {
      newSelected.delete(userEmail);
    }
    setSelectedUsers(newSelected);
  };

  const handleToggleAllUsers = (checked: boolean) => {
    if (checked) {
      const allUsers = new Set(PERSONAL_GROUPED_DATA.map(group => group.creator));
      setSelectedUsers(allUsers);
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleToggleUserExpand = (userEmail: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userEmail)) {
      newExpanded.delete(userEmail);
    } else {
      newExpanded.add(userEmail);
    }
    setExpandedUsers(newExpanded);
  };

  const handleBatchQuotaSelect = (quota: string) => {
    setBatchNewQuota(quota);
  };

  const handleConfirmBatchQuota = () => {
    const selectedCount = selectedUsers.size;
    if (selectedCount === 0) {
      alert("请至少选择一位用户");
      return;
    }
    const userList = Array.from(selectedUsers).join(", ");
    alert(`已将以下 ${selectedCount} 位用户的存储容量调整为 ${batchNewQuota}:\n${userList}`);
    // TODO: 实现实际的批量存储容量调整逻辑
    setIsBatchQuotaDialogOpen(false);
  };

  const handleOpenRecycleBin = () => {
    setRecycleBinView("list");
    setIsRecycleBinOpen(true);
  };

  const openInstanceDetail = (instance: any) => {
    setSelectedInstance(instance);
    setRecycleBinView("detail");
    setSelectedFiles(new Set());
    setSelectAll(false);
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedFiles(new Set(recycleBinFiles.map(f => f.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  // 处理单个文件选择
  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
    setSelectAll(newSelected.size === recycleBinFiles.length);
  };

  // 批量转移
  const handleBatchTransfer = () => {
    if (selectedFiles.size === 0) {
      alert("请先选择要转移的文件");
      return;
    }
    setIsTransferDialogOpen(true);
  };

  // 确认转移
  const handleConfirmTransfer = () => {
    if (!transferTarget) {
      alert("请选择转移目标成员");
      return;
    }
    
    const transferredFiles = recycleBinFiles.filter(f => selectedFiles.has(f.id));
    const fileNames = transferredFiles.map(f => f.name).join("、");
    
    // 从回收站中移除已转移的文件
    setRecycleBinFiles(recycleBinFiles.filter(f => !selectedFiles.has(f.id)));
    
    alert(`已将 ${selectedFiles.size} 个文件(${fileNames})转移给: ${transferTarget}`);
    
    // 重置状态
    setSelectedFiles(new Set());
    setSelectAll(false);
    setIsTransferDialogOpen(false);
    setTransferTarget("");
  };

  // 打开删除确认弹窗
  const handlePermanentDelete = () => {
    if (selectedFiles.size === 0) {
      alert("请先选择要删除的文件");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  // 确认彻底删除
  const handleConfirmDelete = () => {
    // 从回收站中移除已删除的文件
    setRecycleBinFiles(recycleBinFiles.filter(f => !selectedFiles.has(f.id)));
    
    alert(`已彻底删除 ${selectedFiles.size} 个文件`);
    
    // 重置状态
    setSelectedFiles(new Set());
    setSelectAll(false);
    setIsDeleteDialogOpen(false);
  };

  const handleEnableSmh = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmEnableSmh = () => {
    setIsSmhEnabled(true);
    setIsConfirmDialogOpen(false);
  };

  return (
    <div className="page-enter space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">云盘管理</h1>
          <p className="text-sm text-gray-500 mt-1">为您提供专属、安全的私人云存储空间</p>
        </div>
      </div>

      {/* SMH Service Activation Banner */}
      {!isSmhEnabled && (
        <>
          {/* Enterprise Public Space Section - Show when SMH is NOT enabled */}
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
                          默认开启,赠送 <span className="font-semibold text-blue-600">100GB</span> 永久免费空间，用于存放企业级技能库和预设配置库
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

          {/* AI 智能体私有空间 Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Bot className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">AI 智能体私有空间</h2>
            </div>

            {/* 大框包裹开通说明和功能卡片 */}
            <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
              <CardContent className="p-6 pb-0">
                {/* 开通说明和按钮 - 同一行 */}
                <div className="flex items-center justify-between gap-6 mb-5">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      AI 智能体私有空间 需要开启云盘管理服务
                    </h3>
                    <p className="text-sm text-gray-600">
                      开启后,为您赠送每个 OpenClaw 实例
                      <span className="mx-1 font-semibold text-blue-600">3 个月 50GB</span>
                      免费额度。到期后可以购买资源包继续使用续租
                    </p>
                  </div>
                  <Button 
                    className="h-10 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    onClick={handleEnableSmh}
                  >
                    开启云盘管理服务
                  </Button>
                </div>
              </CardContent>

              {/* 分隔线 - 横跨整个Card宽度 */}
              <div className="border-t border-gray-200"></div>

              <CardContent className="p-6 pt-5 space-y-5">
                {/* 分隔文字 */}
                <div className="text-sm text-gray-900 font-semibold">
                  开启后为您提供以下:
                </div>

                {/* Feature Cards Grid - 横向左对齐布局 */}
                <div className="grid grid-cols-3 gap-6">
                  {/* 空间安全隔离 */}
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900">空间安全隔离</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        实现不同用户 AI Agent 存储空间的完全隔离，保障数据隐私与安全
                      </p>
                    </div>
                  </div>

                  {/* 存储管理及监控 */}
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900">存储管理及监控</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        实时监控每个用户的容量的使用情况及余量进度条提示
                      </p>
                    </div>
                  </div>

                  {/* 文件安全共享 */}
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Share2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900">文件安全共享</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        一键生成有效期提取码控制的外链分享链接，确保分享安全性
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Stats Cards - Only show when SMH is enabled */}
      {isSmhEnabled && (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* 企业公共空间卡片 */}
        <Card className="shadow-sm border-gray-100 rounded-xl bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 bg-blue-50">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">企业公共空间</span>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">{stats.enterpriseSpacesCount}</span>
                  </div>
                </div>
              </div>

              {/* 当前使用量 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">当前使用量</span>
                  <span className="text-xs text-gray-500">{stats.enterpriseUsed} / {stats.enterpriseQuota}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${stats.enterprisePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-400">{stats.enterprisePercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 智能体私有空间卡片 */}
        <Card className="shadow-sm border-gray-100 rounded-xl bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 bg-purple-50">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">AI 智能体私有空间</span>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">{stats.totalPersonalInstances}</span>
                  </div>
                </div>
              </div>

              {/* 当前使用量 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">当前使用量</span>
                  <span className="text-xs text-gray-500">{stats.personalUsed} / {stats.personalQuota}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${stats.personalPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-400">{stats.personalPercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Enterprise Spaces */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">企业公共空间</h2>
        </div>
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-white">
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

{/* Section 2: Personal Spaces */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <User className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">AI 智能体私有空间</h2>
        </div>
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索名称或创建人" className="pl-10 h-10 bg-gray-50/50 border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="bg-purple-600 p-1 rounded-md text-white"><Bot className="w-4 h-4" /></div>
              <span>共计 <span className="font-bold text-gray-900">{filteredPersonalInstancesCount}</span> 个 OpenClaw 实例</span>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[35%] text-left">创建人 / 名称</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[18%] text-left">类型</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[28%] text-left">已用/存储容量</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 w-[19%] text-left">有效期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonalData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">未找到匹配的个人空间</p>
                        <p className="text-xs text-gray-500">尝试使用其他关键词搜索</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPersonalData.map((group) => {
                  const isExpanded = expandedUsers.has(group.creator);
                  return (
                <React.Fragment key={group.creator}>
                  <TableRow className="bg-gray-50/30 hover:bg-gray-50/50 border-b border-gray-50 cursor-pointer" onClick={() => handleToggleUserExpand(group.creator)}>
                    <TableCell colSpan={4} className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <ChevronDown 
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                        />
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">{group.avatar}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{group.creator}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-200/50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">{group.items.length} 个实例</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && group.items.map((item, itemIdx) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group relative">
                      <TableCell className="py-4 px-6 pl-12 align-middle">
                        <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-gray-100"></div>
                        {itemIdx === group.items.length - 1 && <div className="absolute left-10 top-0 h-1/2 w-[1px] bg-gray-100"></div>}
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-gray-100"></div>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"><Bot className="w-5 h-5" /></div>
                          <span className="text-sm font-bold text-gray-900">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 align-middle">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600">{item.type}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">
                        {item.used}/{<span className="font-bold">{item.quota}</span>}
                        <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">免费</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium align-middle">{item.expiry}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
              })
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-500">
                共 <span className="font-bold text-gray-900">{filteredPersonalData.length}</span> 位用户
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 显示逻辑：当前页、前后各一页，以及第一页和最后一页
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <div key={page} className="px-2 text-gray-400">
                          ...
                        </div>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`h-9 w-9 p-0 ${
                          currentPage === page
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

        </>
      )}

      {/* Confirm Dialog: Enable SMH Service */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900">免费额度说明</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            {/* 说明内容 */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                为您赠送<span className="font-semibold text-blue-600">3个月</span>每个 OpenClaw 实例<span className="font-semibold text-blue-600">50GB</span>的存储空间，到期后可以购买资源包进行续租。点击确定后才会进入最终页面
              </p>
            </div>

            {/* 确认复选框 */}
            <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-lg">
              <input 
                type="checkbox" 
                id="agree-terms"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-600 cursor-pointer select-none">
                我已阅读并同意免费额度说明
              </label>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50/30 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              className="h-10 px-6 text-sm font-medium"
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirmEnableSmh}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog 1: Adjust Quota */}
      <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">调整存储容量</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">名称</span>
                <span className="text-sm font-bold text-gray-900">{selectedQuotaItem?.name || '-'}</span>
              </div>
              <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">当前存储容量</span>
                  <span className="font-bold text-blue-700 text-lg">{selectedQuotaItem?.quota || '-'}</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ 
                      width: selectedQuotaItem 
                        ? `${(parseFloat(selectedQuotaItem.used) / parseFloat(selectedQuotaItem.quota)) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>已使用：{selectedQuotaItem?.used || '-'}</span>
                  <span>剩余可用：{selectedQuotaItem ? `${parseFloat(selectedQuotaItem.quota) - parseFloat(selectedQuotaItem.used)}GB` : '-'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 block">新增存储容量</label>
              <div className="grid grid-cols-3 gap-3">
                {['50GB', '100GB', '500GB', '1TB', '2TB'].map((q) => (
                  <Button 
                    key={q} 
                    variant="outline" 
                    className={`h-11 font-medium rounded-xl transition-all ${
                      newQuota === q
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => handleQuotaSelect(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-3">
            <Button variant="ghost" onClick={() => setIsQuotaDialogOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 px-6">取消</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-md shadow-blue-200 transition-all active:scale-95" onClick={handleConfirmQuota}>确认调整</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 1.5: Batch Adjust Storage Quota */}
      <Dialog open={isBatchQuotaDialogOpen} onOpenChange={setIsBatchQuotaDialogOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">批量调整存储容量</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 block">已选择用户</label>
              <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">共计 <span className="font-bold text-lg">{selectedUsers.size}</span> 位用户</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                  {Array.from(selectedUsers).map((userEmail) => {
                    const group = PERSONAL_GROUPED_DATA.find(g => g.creator === userEmail);
                    return (
                      <div key={userEmail} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {group?.avatar}
                        </div>
                        <span className="text-xs text-gray-700 font-medium">{userEmail}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 block">调整为</label>
              <div className="grid grid-cols-3 gap-3">
                {['50GB', '100GB', '500GB', '1TB', '2TB', '5TB'].map((q) => (
                  <Button 
                    key={q} 
                    variant="outline" 
                    className={`h-11 font-medium rounded-xl transition-all ${
                      batchNewQuota === q
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => handleBatchQuotaSelect(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-3">
            <Button variant="ghost" onClick={() => setIsBatchQuotaDialogOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 px-6">取消</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-md shadow-blue-200 transition-all active:scale-95" 
              onClick={handleConfirmBatchQuota}
            >
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Recycle Bin */}
      <Dialog open={isRecycleBinOpen} onOpenChange={setIsRecycleBinOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] rounded-2xl p-0 overflow-hidden border-none shadow-2xl flex flex-col">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              {recycleBinView === "detail" && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200" onClick={() => setRecycleBinView("list")}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                {recycleBinView === "list" ? "存储回收站" : `实例详情: ${selectedInstance?.name}`}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-0">
            {recycleBinView === "list" ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {RECYCLE_BIN_INSTANCES.map((ins) => (
                    <div key={ins.id} className="group p-5 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between" onClick={() => openInstanceDetail(ins)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900">{ins.name}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-3">
                            <span>创建人: {ins.creator}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>已用空间: {ins.used}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>删除时间: {ins.deleteTime}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="p-10 text-center space-y-2 border-2 border-dashed border-gray-50 rounded-3xl">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">暂无更多已删除实例</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="all" 
                      className="rounded-md border-gray-300" 
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="all" className="text-xs font-bold text-gray-500 cursor-pointer ml-1 uppercase tracking-wider">全选</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs rounded-lg border-gray-200 gap-1.5 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      onClick={handleBatchTransfer}
                      disabled={selectedFiles.size === 0}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> 批量转移
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs rounded-lg border-gray-200 gap-1.5 font-bold text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={handlePermanentDelete}
                      disabled={selectedFiles.size === 0}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 彻底删除
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <Table>
                    <TableHeader className="bg-white sticky top-0 z-10">
                      <TableRow className="border-b border-gray-50 hover:bg-transparent">
                        <TableHead className="w-12 px-6"></TableHead>
                        <TableHead className="font-medium text-[10px] text-gray-400 h-10 px-4 uppercase tracking-wider">文件名</TableHead>
                        <TableHead className="font-medium text-[10px] text-gray-400 h-10 px-4 uppercase tracking-wider">大小</TableHead>
                        <TableHead className="font-medium text-[10px] text-gray-400 h-10 px-4 uppercase tracking-wider">修改时间</TableHead>
                        <TableHead className="font-medium text-[10px] text-gray-400 h-10 px-4 uppercase tracking-wider">原归属</TableHead>
                        <TableHead className="font-medium text-[10px] text-gray-400 h-10 px-4 text-right uppercase tracking-wider">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recycleBinFiles.map((file) => (
                        <TableRow key={file.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                          <TableCell className="px-6 py-3">
                            <Checkbox 
                              className="rounded-md border-gray-300" 
                              checked={selectedFiles.has(file.id)}
                              onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {file.type === 'folder' ? <Folder className="w-4 h-4 text-amber-400 fill-amber-400" /> : 
                               file.type === 'docx' ? <FileText className="w-4 h-4 text-blue-500" /> :
                               file.type === 'png' ? <ImageIcon className="w-4 h-4 text-emerald-500" /> :
                               <TableIcon className="w-4 h-4 text-green-600" />}
                              <span className="text-sm font-bold text-gray-900">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-500">{file.size}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-500">{file.time}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 font-medium">{file.owner}</TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <div className="relative h-8 flex items-center justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs font-bold text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0"
                              >
                                转移
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full group-hover:opacity-0 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 shrink-0">
            <Button variant="ghost" onClick={() => setIsRecycleBinOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 px-8">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Transfer Files */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">转移文件</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                将 <span className="font-bold text-blue-600">{selectedFiles.size}</span> 个文件转移给 OpenClaw 实例
              </p>
              <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <p className="text-xs text-gray-500 mb-2">选中的文件:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recycleBinFiles
                    .filter(f => selectedFiles.has(f.id))
                    .map(f => (
                      <div key={f.id} className="text-sm text-gray-700">• {f.name}</div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 block">选择转移目标 OpenClaw 实例</label>
              <div className="space-y-2">
                {['Noah (noah@acompany.com)', 'Mia (mia@acompany.com)', 'Leo (leo@acompany.com)', '其他 OpenClaw 实例'].map((member) => (
                  <Button
                    key={member}
                    variant="outline"
                    className={`w-full h-11 justify-start font-medium rounded-xl transition-all ${
                      transferTarget === member
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => setTransferTarget(member)}
                  >
                    {member}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsTransferDialogOpen(false);
                setTransferTarget("");
              }} 
              className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 px-6"
            >
              取消
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-md shadow-blue-200 transition-all active:scale-95"
              onClick={handleConfirmTransfer}
              disabled={!transferTarget}
            >
              确认转移
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 4: Confirm Delete */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-red-50/50 border-b border-red-100">
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              确认彻底删除
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">
                    即将彻底删除 <span className="text-red-600">{selectedFiles.size}</span> 个文件
                  </p>
                  <p className="text-xs text-red-600 mt-1">此操作不可撤销，请谨慎操作！</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">文件列表</p>
                <div className="max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  {recycleBinFiles
                    .filter(f => selectedFiles.has(f.id))
                    .map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                        {f.type === 'folder' ? <Folder className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" /> : 
                         f.type === 'docx' ? <FileText className="w-4 h-4 text-blue-500 shrink-0" /> :
                         f.type === 'png' ? <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" /> :
                         <TableIcon className="w-4 h-4 text-green-600 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{f.size} · 归属: {f.owner}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">⚠</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-900 mb-1">重要提示</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• 删除后文件将永久从系统中移除</li>
                      <li>• 无法通过任何方式恢复这些文件</li>
                      <li>• 建议在删除前再次确认文件内容</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              className="rounded-xl font-bold border-gray-200 hover:bg-gray-100 px-6 flex-1"
            >
              取消
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-8 shadow-md shadow-red-200 transition-all active:scale-95 flex-1"
              onClick={handleConfirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
