/**
 * ImageManagement - 管控端镜像管理页
 * 管理智能体运行环境镜像，支持公共镜像（官方维护）和自定义镜像
 * 生效镜像将作为新建和一键升级的目标版本
 */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Trash2, Info, RefreshCw, ExternalLink, Search, ChevronsUpDown, ShieldCheck, UserCog } from "lucide-react";

// Mock 镜像列表（模拟从腾讯云拉取）
const PUBLIC_IMAGES = [
  { id: "img-openclaw-official", name: "云服务器 OpenClaw 镜像", group: "public" },
  { id: "img-clawpro-base-v3.28", name: "ClawPro 官方基础镜像 v3.28", group: "public" },
];

const CUSTOM_IMAGES = [
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", group: "custom" },
  { id: "img-cust-e5f6g7h8", name: "openclaw-custom-v1.1-beta", group: "custom" },
  { id: "img-cust-i9j0k1l2", name: "openclaw-prod-2025Q4", group: "custom" },
  { id: "img-cust-m3n4o5p6", name: "openclaw-dev-latest", group: "custom" },
  { id: "img-cust-q7r8s9t0", name: "openclaw-test-v2.0", group: "custom" },
];

const ALL_IMPORTABLE = [...PUBLIC_IMAGES, ...CUSTOM_IMAGES];

// 镜像类型：public = 公共镜像（官方维护）, custom = 自定义镜像（用户维护）
type ImageType = "public" | "custom";

interface ImageRow {
  id: string;
  name: string;
  status: string;
  type: ImageType;
  openclawVersion: string;
  os: string;
  createTime: string;
  active: boolean;
}

const MOCK_IMAGES: ImageRow[] = [
  { id: "img-openclaw-official", name: "云服务器 OpenClaw 镜像", status: "available", type: "public", openclawVersion: "OpenClaw 2026.3.28", os: "CentOS 7.9 64位", createTime: "2025-12-01 10:30:00", active: true },
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", status: "available", type: "custom", openclawVersion: "", os: "CentOS 7.9 64位", createTime: "2025-09-15 14:22:35", active: false },
  { id: "img-cust-i9j0k1l2", name: "openclaw-prod-2025Q4", status: "creating", type: "custom", openclawVersion: "", os: "Ubuntu 22.04 64位", createTime: "2026-03-01 09:15:42", active: false },
];

function ImageTypeBadge({ type }: { type: ImageType }) {
  if (type === "public") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 cursor-default">
            <ShieldCheck className="w-3 h-3" />
            公共镜像
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
          由官方维护，自动跟进平台程序版本更新，无需用户自行维护
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100 cursor-default">
          <UserCog className="w-3 h-3" />
          自定义镜像
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
        由用户自行制作和维护，官方不负责版本更新，适用于有特殊运行环境需求的场景
      </TooltipContent>
    </Tooltip>
  );
}

export default function ImageManagement() {
  const [images, setImages] = useState<ImageRow[]>(MOCK_IMAGES);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showImageList, setShowImageList] = useState(false);
  const imageListRef = useRef<HTMLDivElement>(null);

  const selectedImage = ALL_IMPORTABLE.find((img) => img.id === selectedImageId);

  const handleDialogOpenChange = (open: boolean) => {
    setShowImportDialog(open);
    if (!open) {
      setSelectedImageId("");
      setSearchQuery("");
      setShowImageList(false);
    }
  };

  const handleClickOutsideImageList = (e: React.MouseEvent) => {
    if (imageListRef.current && !imageListRef.current.contains(e.target as Node)) {
      setShowImageList(false);
    }
  };

  const filteredImages = ALL_IMPORTABLE.filter((img) =>
    img.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublic = filteredImages.filter((img) => img.group === "public");
  const filteredCustom = filteredImages.filter((img) => img.group === "custom");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("镜像列表已刷新");
    }, 1200);
  };

  const formatNow = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleImport = () => {
    if (!selectedImageId) { toast.error("请选择要导入的镜像"); return; }
    const alreadyExists = images.find((img) => img.id === selectedImageId);
    if (alreadyExists) { toast.error("该镜像已在列表中"); return; }
    const img = ALL_IMPORTABLE.find((i) => i.id === selectedImageId)!;
    const isPublic = img.group === "public";
    setImages([...images, {
      id: img.id,
      name: img.name,
      status: "available",
      type: isPublic ? "public" : "custom",
      openclawVersion: isPublic ? "OpenClaw 2026.4.2" : "",
      os: "CentOS 7.9 64位",
      createTime: formatNow(),
      active: false,
    }]);
    setShowImportDialog(false);
    setSelectedImageId("");
    setSearchQuery("");
    toast.success(`镜像「${img.name}」已成功导入`);
  };

  return (
    <>
      <div className="page-enter max-w-[1100px]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">镜像管理</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理智能体运行环境镜像。公共镜像由官方持续维护更新；企业也可导入自定义镜像以满足特定运行环境需求。
          </p>
        </div>

        {/* 提示说明 */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-600 leading-relaxed space-y-1">
            <p>同一时间只有一个镜像处于「生效」状态。生效镜像将作为<span className="font-semibold">新建</span>和<span className="font-semibold">一键升级</span>的目标版本：</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>新创建的智能体将直接使用生效镜像启动</li>
              <li>已运行的智能体可通过「一键升级」切换到生效镜像版本，升级时保留原有智能体配置</li>
            </ul>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">镜像列表</h2>
            <Button
              size="sm"
              onClick={() => setShowImportDialog(true)}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              导入镜像
            </Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">镜像 ID / 名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">镜像类型</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 tracking-wide">
                  <div className="flex items-center gap-1">
                    智能体版本
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default inline-flex">
                          <Info className="w-3 h-3 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                        镜像中内置的智能体版本，自定义镜像暂不支持自动识别
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作系统</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">导入时间</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {images.map((img) => (
                <tr key={img.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{img.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{img.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ImageTypeBadge type={img.type} />
                  </td>
                  <td className="px-4 py-4">
                    {img.status === "available" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        可用
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                        创建中
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {img.openclawVersion ? (
                      <div className="leading-tight">
                        <span className="text-sm text-gray-700">OpenClaw</span>
                        <br />
                        <span className="text-xs text-gray-500 font-mono">{img.openclawVersion.replace("OpenClaw ", "")}</span>
                      </div>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-gray-400 cursor-default">未识别</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-xs leading-relaxed">
                          自定义镜像暂不支持自动识别智能体版本信息
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{img.os}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-500 leading-tight">
                      <span className="whitespace-nowrap">{img.createTime.split(" ")[0]}</span>
                      <br />
                      <span className="text-xs text-gray-400 whitespace-nowrap">{img.createTime.split(" ")[1]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">设为生效</span>
                        <Switch
                          checked={img.active}
                          onCheckedChange={(v) => {
                            if (!v) return;
                            setImages(images.map((i) => ({ ...i, active: i.id === img.id })));
                            toast.success(`镜像「${img.name}」已设为生效，将作为新建和一键升级的目标版本`);
                          }}
                        />
                      </div>
                      {img.active ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-not-allowed">
                              <Trash2 className="w-4 h-4 text-gray-200" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left">生效中的镜像无法删除</TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          onClick={() => {
                            setImages(images.filter((i) => i.id !== img.id));
                            toast.success("镜像已删除");
                          }}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="删除镜像"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 导入镜像弹窗 */}
      <Dialog open={showImportDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>导入镜像</DialogTitle>
          </DialogHeader>

          {/* 说明文案 */}
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5 -mt-1">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              以下镜像均为已在腾讯云创建好的镜像。若需要创建新镜像，请前往{" "}
              <a
                href="https://console.cloud.tencent.com/cvm/image"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
              >
                腾讯云云服务器控制台
                <ExternalLink className="w-3 h-3" />
              </a>
              {" "}操作后，再回此处刷新并导入。
            </p>
          </div>

          <div className="space-y-4 py-1" onClick={handleClickOutsideImageList}>
            <div className="space-y-2">
              <Label>选择镜像</Label>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowImageList(!showImageList)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                >
                  <span>{selectedImageId ? selectedImage?.name : "请选择要导入的镜像"}</span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
                  title="刷新镜像列表"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400">镜像大小不允许超过50GiB</p>

              {showImageList && (
                <div ref={imageListRef} className="border border-gray-200 rounded-lg bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="relative p-2 border-b border-gray-100">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索镜像 ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {filteredPublic.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0 flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          公共镜像
                          <span className="text-gray-400 font-normal">（官方维护）</span>
                        </div>
                        {filteredPublic.map((img) => (
                          <div
                            key={img.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageId(img.id);
                              setShowImageList(false);
                              setSearchQuery("");
                            }}
                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                              selectedImageId === img.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-900 truncate">{img.name}</span>
                              <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredCustom.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0 flex items-center gap-1.5">
                          <UserCog className="w-3 h-3 text-orange-400" />
                          自定义镜像
                          <span className="text-gray-400 font-normal">（用户维护）</span>
                        </div>
                        {filteredCustom.map((img) => (
                          <div
                            key={img.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageId(img.id);
                              setShowImageList(false);
                              setSearchQuery("");
                            }}
                            className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                              selectedImageId === img.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-900 truncate">{img.name}</span>
                              <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredImages.length === 0 && (
                      <div className="px-3 py-8 text-center text-sm text-gray-400">
                        未找到匹配的镜像
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setSelectedImageId(""); setSearchQuery(""); }}>取消</Button>
            <Button
              onClick={handleImport}
              disabled={!selectedImageId}
              style={selectedImageId ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
            >
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
