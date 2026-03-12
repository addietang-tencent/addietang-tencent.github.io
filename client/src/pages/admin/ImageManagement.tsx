/**
 * ImageManagement - 管控端镜像管理页
 * 成员创建 OpenClaw 时启动的云服务器镜像管理
 * 企业可使用自定义镜像，并随时导入最新版本
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, Server, Info } from "lucide-react";

const MOCK_IMAGES = [
  { id: "img-001", name: "openclaw-base-v2.1", status: "available", disk: "系统盘 150GiB", os: "CentOS 7.9 64位", createTime: "2025-12-01", active: true },
  { id: "img-002", name: "openclaw-base-v2.0", status: "available", disk: "系统盘 100GiB", os: "CentOS 7.9 64位", createTime: "2025-09-15", active: false },
  { id: "img-003", name: "openclaw-dev-v1.5", status: "creating", disk: "系统盘 200GiB", os: "Ubuntu 22.04 64位", createTime: "2026-03-01", active: false },
];

export default function ImageManagement() {
  const [images, setImages] = useState(MOCK_IMAGES);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importName, setImportName] = useState("");
  const [importId, setImportId] = useState("");

  const handleImport = () => {
    if (!importName.trim()) { toast.error("请填写镜像名称"); return; }
    if (!importId.trim()) { toast.error("请填写镜像 ID"); return; }
    setShowImportDialog(false);
    setImportName("");
    setImportId("");
    toast.success("镜像导入任务已提交，请稍后刷新查看状态");
  };

  return (
    <AdminLayout>
      <div className="page-enter max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">镜像管理</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理成员创建 OpenClaw 时所使用的云服务器镜像。企业可上传或导入自定义镜像，以满足特定的运行环境需求；当镜像有版本更新时，也可随时导入最新镜像并切换生效，确保成员始终使用最新版本的运行环境。
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
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
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
                      {img.active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          生效中
                        </span>
                      )}
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
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">设为生效</span>
                        <Switch
                          checked={img.active}
                          onCheckedChange={(v) => {
                            if (!v) return; // 不允许直接关闭，只能通过切换其他镜像
                            setImages(images.map((i) => ({ ...i, active: i.id === img.id })));
                            toast.success(`镜像「${img.name}」已设为生效，新创建的 OpenClaw 将使用此镜像`);
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (img.active) { toast.error("当前生效镜像不可删除，请先切换至其他镜像"); return; }
                          setImages(images.filter((i) => i.id !== img.id));
                          toast.success("镜像已删除");
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="删除镜像"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 导入镜像弹窗 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>导入镜像</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 -mt-1">
            填写腾讯云镜像信息，导入后可在列表中查看并设为生效。
          </p>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>镜像名称</Label>
              <Input
                placeholder="请输入镜像名称，例如 openclaw-base-v2.2"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>镜像 ID</Label>
              <Input
                placeholder="请输入腾讯云镜像 ID，例如 img-xxxxxxxx"
                value={importId}
                onChange={(e) => setImportId(e.target.value)}
                className="bg-gray-50 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>取消</Button>
            <Button
              onClick={handleImport}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
