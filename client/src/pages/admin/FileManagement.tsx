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
  ArrowLeft,
  Folder,
  FileText,
  Image as ImageIcon,
  Table as TableIcon,
  ExternalLink,
  MoreVertical
} from "lucide-react";

// Updated Mock Data for Enterprise Spaces
const ENTERPRISE_SPACES = [
  { id: "ent-skill-lib", name: "企业技能库", type: "公共", used: "12GB", quota: "50GB", expiry: "永久有效" },
  { id: "ent-plugin-lib", name: "企业插件库", type: "公共", used: "8GB", quota: "50GB", expiry: "永久有效" },
];

// Mock Data for Personal Spaces (Grouped)
const PERSONAL_GROUPED_DATA = [
  {
    creator: "noah@acompany.com",
    avatar: "N",
    items: [
      { id: "ins-u25p9jqg", name: "Noah的分析助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2027-12-31" },
      { id: "ins-v88x2kww", name: "Noah的测试沙盒", type: "个人", used: "2GB", quota: "50GB", expiry: "2026-12-31" },
    ]
  },
  {
    creator: "mia@acompany.com",
    avatar: "M",
    items: [
      { id: "ins-t14o8ipf", name: "Mia的新助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2027-06-30" },
    ]
  },
  {
    creator: "leo@acompany.com",
    avatar: "L",
    items: [
      { id: "ins-s03n7heo", name: "Leo的项目助手", type: "个人", used: "5GB", quota: "50GB", expiry: "2028-03-10" },
      { id: "ins-x11m9zzz", name: "Leo的文档库", type: "个人", used: "15GB", quota: "50GB", expiry: "2028-01-01" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [recycleBinView, setRecycleBinView] = useState<"list" | "detail">("list");
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectedQuotaItem, setSelectedQuotaItem] = useState<any>(null);
  const [newQuota, setNewQuota] = useState<string>("50GB");
  const [customQuota, setCustomQuota] = useState<string>("");
  const [recycleBinFiles, setRecycleBinFiles] = useState(RECYCLE_BIN_FILES);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenQuotaDialog = (item: any) => {
    setSelectedQuotaItem(item);
    setNewQuota("50GB");
    setCustomQuota("");
    setIsQuotaDialogOpen(true);
  };

  const handleQuotaSelect = (quota: string) => {
    setNewQuota(quota);
    setCustomQuota("");
  };

  const handleCustomQuotaChange = (value: string) => {
    setCustomQuota(value);
    if (value) {
      setNewQuota(`${value}GB`);
    }
  };

  const handleConfirmQuota = () => {
    const finalQuota = customQuota ? `${customQuota}GB` : newQuota;
    alert(`已将 ${selectedQuotaItem?.name} 的配额调整为: ${finalQuota}`);
    // TODO: 实现实际的配额调整逻辑
    setIsQuotaDialogOpen(false);
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

  return (
    <div className="page-enter space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
          <p className="text-sm text-gray-500 mt-1">为每位用户提供专属、安全的私人云存储空间。</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="企业总配额" value="500GB" icon={HardDrive} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
        <StatCard title="已用配额" value="200GB" icon={PieChart} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
        <StatCard title="总空间数" value="25" icon={Layers} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
      </div>

      {/* Section 1: Enterprise Spaces */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">企业公共空间</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">管理企业的公共资产、部门共享及项目资料库。</span>
        </div>
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">空间名称 / ID</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">类型</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">已用 / 配额</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">有效期</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENTERPRISE_SPACES.map((item) => (
                <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 last:border-0 group">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{item.name}</span>
                        <span className="text-xs text-blue-500 font-medium">{item.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600">{item.type}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                    {item.used} / <span className="font-bold">{item.quota}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">免费</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">{item.expiry}</TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700 font-medium p-0" onClick={() => handleOpenQuotaDialog(item)}>调整配额</Button>
                  </TableCell>
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
          <h2 className="text-lg font-bold text-gray-900">龙虾个人空间</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">管理每位龙虾用户的专属云盘配额。</span>
        </div>
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索名称、ID 或创建人" className="pl-10 h-10 bg-gray-50/50 border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 border-gray-100 hover:bg-gray-50 text-gray-600 hover:text-red-600 transition-colors" onClick={handleOpenRecycleBin}>
                <Trash2 className="w-4 h-4" />
                回收站
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="bg-purple-600 p-1 rounded-md text-white"><Bot className="w-4 h-4" /></div>
              <span>共计 <span className="font-bold text-gray-900">14</span> 个 OpenClaw 实例</span>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">创建人 / 名称 / ID</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">类型</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">已用 / 配额</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6">有效期</TableHead>
                <TableHead className="font-medium text-xs text-gray-400 h-12 px-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERSONAL_GROUPED_DATA.map((group) => (
                <React.Fragment key={group.creator}>
                  <TableRow className="bg-gray-50/30 hover:bg-gray-50/50 border-b border-gray-50">
                    <TableCell colSpan={5} className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">{group.avatar}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{group.creator}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-200/50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">{group.items.length} 个实例</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  {group.items.map((item, itemIdx) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group relative">
                      <TableCell className="py-4 px-6 pl-12">
                        <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-gray-100"></div>
                        {itemIdx === group.items.length - 1 && <div className="absolute left-10 top-0 h-1/2 w-[1px] bg-gray-100"></div>}
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-gray-100"></div>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"><Bot className="w-5 h-5" /></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{item.name}</span>
                            <span className="text-xs text-blue-500 font-medium">{item.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600">{item.type}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {item.used} / <span className="font-bold">{item.quota}</span>
                        <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600">免费</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">{item.expiry}</TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700 font-medium p-0" onClick={() => handleOpenQuotaDialog(item)}>调整配额</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Dialog 1: Adjust Quota */}
      <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">调整存储配额</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">名称</span>
                <span className="text-sm font-bold text-gray-900">{selectedQuotaItem?.name || '-'}</span>
              </div>
              <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-medium">当前配额</span>
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
              <label className="text-sm font-bold text-gray-900 block">新增配额</label>
              <div className="grid grid-cols-3 gap-3">
                {['50GB', '100GB', '500GB', '1TB', '2TB'].map((q) => (
                  <Button 
                    key={q} 
                    variant="outline" 
                    className={`h-11 font-medium rounded-xl transition-all ${
                      newQuota === q && !customQuota
                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => handleQuotaSelect(q)}
                  >
                    {q}
                  </Button>
                ))}
                <div className="relative">
                  <Input 
                    className={`h-11 rounded-xl pr-10 text-sm ${
                      customQuota 
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                        : 'border-gray-100'
                    }`}
                    placeholder="自定义" 
                    value={customQuota}
                    onChange={(e) => handleCustomQuotaChange(e.target.value)}
                    type="number"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">GB</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-3">
            <Button variant="ghost" onClick={() => setIsQuotaDialogOpen(false)} className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 px-6">取消</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-md shadow-blue-200 transition-all active:scale-95" onClick={handleConfirmQuota}>确认调整</Button>
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
                将 <span className="font-bold text-blue-600">{selectedFiles.size}</span> 个文件转移给其他成员
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
              <label className="text-sm font-bold text-gray-900 block">选择转移目标成员</label>
              <div className="space-y-2">
                {['Noah (noah@acompany.com)', 'Mia (mia@acompany.com)', 'Leo (leo@acompany.com)', '其他成员'].map((member) => (
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
