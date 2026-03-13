/**
 * ImageManagement - 管控端镜像管理页
 * 成员创建 OpenClaw 时启动的云服务器镜像管理
 * 企业可使用自定义镜像，并随时导入最新版本
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Trash2, Info, RefreshCw, ExternalLink } from "lucide-react";

// Mock 镜像列表（模拟从腾讯云拉取）
const PUBLIC_IMAGES = [
  { id: "img-openclaw-official", name: "云服务器 OpenClaw 镜像", group: "public" },
];

const CUSTOM_IMAGES = [
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", group: "custom" },
  { id: "img-cust-e5f6g7h8", name: "openclaw-custom-v1.1-beta", group: "custom" },
  { id: "img-cust-i9j0k1l2", name: "openclaw-prod-2025Q4", group: "custom" },
];

const ALL_IMPORTABLE = [...PUBLIC_IMAGES, ...CUSTOM_IMAGES];

const MOCK_IMAGES = [
  { id: "img-openclaw-official", name: "云服务器 OpenClaw 镜像", status: "available", disk: "系统盘 150GiB", os: "CentOS 7.9 64位", createTime: "2025-12-01", active: true },
  { id: "img-cust-a1b2c3d4", name: "openclaw-custom-v1.0", status: "available", disk: "系统盘 100GiB", os: "CentOS 7.9 64位", createTime: "2025-09-15", active: false },
  { id: "img-cust-i9j0k1l2", name: "openclaw-prod-2025Q4", status: "creating", disk: "系统盘 200GiB", os: "Ubuntu 22.04 64位", createTime: "2026-03-01", active: false },
];

export default function ImageManagement() {
  const [images, setImages] = useState(MOCK_IMAGES);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const selectedImage = ALL_IMPORTABLE.find((img) => img.id === selectedImageId);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("镜像列表已刷新");
    }, 1200);
  };

  const handleImport = () => {
    if (!selectedImageId) { toast.error("请选择要导入的镜像"); return; }
    const alreadyExists = images.find((img) => img.id === selectedImageId);
    if (alreadyExists) { toast.error("该镜像已在列表中"); return; }
    const img = ALL_IMPORTABLE.find((i) => i.id === selectedImageId)!;
    setImages([...images, {
      id: img.id,
      name: img.name,
      status: "available",
      disk: "系统盘 150GiB",
      os: "CentOS 7.9 64位",
      createTime: new Date().toISOString().slice(0, 10),
      active: false,
    }]);
    setShowImportDialog(false);
    setSelectedImageId("");
    toast.success(`镜像「${img.name}」已成功导入`);
  };

  return (
    <AdminLayout>
      <div className="page-enter max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">镜像管理</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理成员创建 OpenClaw 时所使用的云服务器镜像。企业可导入自定义镜像以满足特定的运行环境需求；当镜像有版本更新时，也可随时导入最新镜像并切换生效，确保成员始终使用最新版本的运行环境。
          </p>
        </div>

        {/* 提示说明 */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-600 leading-relaxed">
            同一时间只有一个镜像处于「生效」状态。切换生效镜像后，新创建的 OpenClaw 将使用该镜像启动云服务器；已运行中的 OpenClaw 不受影响。
          </p>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">硬盘</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作系统</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">导入时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {images.map((img) => (
                <tr key={img.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{img.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{img.id}</p>
                      </div>

                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-sm text-gray-600">{img.disk}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{img.os}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{img.createTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">设为生效</span>
                        <Switch
                          checked={img.active}
                          onCheckedChange={(v) => {
                            if (!v) return;
                            setImages(images.map((i) => ({ ...i, active: i.id === img.id })));
                            toast.success(`镜像「${img.name}」已设为生效，新创建的 OpenClaw 将使用此镜像`);
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
      <Dialog open={showImportDialog} onOpenChange={(open) => { setShowImportDialog(open); if (!open) setSelectedImageId(""); }}>
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

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label>选择镜像</Label>
              <div className="flex items-center gap-2">
                <Select value={selectedImageId} onValueChange={setSelectedImageId}>
                  <SelectTrigger className="bg-gray-50 flex-1">
                    <SelectValue placeholder="请选择要导入的镜像" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs text-gray-400 font-medium">公共镜像</SelectLabel>
                      {PUBLIC_IMAGES.map((img) => (
                        <SelectItem key={img.id} value={img.id}>
                          <div className="flex items-center justify-between gap-6 w-full">
                            <span className="text-sm">{img.name}</span>
                            <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="text-xs text-gray-400 font-medium">自定义镜像</SelectLabel>
                      {CUSTOM_IMAGES.map((img) => (
                        <SelectItem key={img.id} value={img.id}>
                          <div className="flex items-center justify-between gap-6 w-full">
                            <span className="text-sm">{img.name}</span>
                            <span className="text-xs text-gray-400 font-mono shrink-0">{img.id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
                  title="刷新镜像列表"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setSelectedImageId(""); }}>取消</Button>
            <Button
              onClick={handleImport}
              disabled={!selectedImageId}
              style={selectedImageId ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
            >
              确认导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
