/**
 * BasicInfo - 管控端基础信息配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side (浅灰背景)
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function BasicInfo() {
  const [form, setForm] = useState({
    siteName: "A公司企业版OpenClaw",
    siteDesc: "快速创建属于你的24小时AI私人助理，提升企业团队的工作效率",
    region: "广州",
    ip: "120.48.88.123",
    domain: "openclaw.acompany.com",
    tencentUin: "3205597606",
    logo: null as File | null,
  });

  const handleSave = () => {
    toast.success("基础信息已保存");
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">基础信息配置</h1>
          <p className="text-sm text-gray-500 mt-1">配置企业版 OpenClaw 平台的基本信息，修改后立即生效</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="space-y-6">
            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                网站名称
                <span className="text-xs text-gray-400 font-normal ml-2">将展示在员工端左上角</span>
              </Label>
              <Input
                id="siteName"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="例如：A公司企业版OpenClaw"
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Site Description */}
            <div className="space-y-2">
              <Label htmlFor="siteDesc" className="text-sm font-medium text-gray-700">
                网站描述
              </Label>
              <Textarea
                id="siteDesc"
                value={form.siteDesc}
                onChange={(e) => setForm({ ...form, siteDesc: e.target.value })}
                placeholder="请输入网站描述"
                className="bg-gray-50 border-gray-200 resize-none"
                rows={3}
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                公司 Logo
                <span className="text-xs text-gray-400 font-normal ml-2">将展示在员工端左上角，建议尺寸 200×200px</span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-gray-50">
                  <Upload className="w-4 h-4" />
                  上传公司 Logo
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) { setForm({ ...form, logo: e.target.files[0] }); toast.success("Logo 已上传"); } }} />
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-6">
              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                  所在地域
                  <span className="text-xs text-gray-400 font-normal ml-2">当前管控端部署所在的云服务器地域</span>
                </Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="例如：广州"
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              {/* IP Address - Read Only */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  IP 地址
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>服务器 IP 地址，不可修改</TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  value={form.ip}
                  readOnly
                  className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Domain - Read Only */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  域名
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>平台访问域名，不可修改</TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  value={form.domain}
                  readOnly
                  className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Tencent Cloud UIN - Read Only */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  关联腾讯云账号
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>腾讯云账号 UIN，不可修改</TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  value={form.tencentUin}
                  readOnly
                  className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={handleSave}
              className="px-8"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              保存
            </Button>
            <Button variant="outline" onClick={() => toast.info("已取消修改")}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
