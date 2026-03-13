/**
 * BasicInfo - 管控端基础信息配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side (浅灰背景)
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function BasicInfo() {
  const [form, setForm] = useState({
    siteName: "A公司企业版OpenClaw",
    siteDesc: "快速创建属于你的24小时AI私人助理，提升企业团队的工作效率",
    region: "广州",
    domain: "openclaw.acompany.com",
    tencentUin: "3205597606",
    logo: null as File | null,
  });

  const handleSave = () => {
    toast.success("基础信息已保存");
  };

  return (
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
              {/* Region — read-only text */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  所在地域
                  <span className="text-xs text-gray-400 font-normal ml-2">员工端、管控端及员工 OpenClaw 底层云设备所在的地域</span>
                </p>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">{form.region}</div>
              </div>

              {/* Domain — read-only text */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  域名
                  <span className="text-xs text-gray-400 font-normal ml-2">员工端与管控端的访问域名</span>
                </p>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">{form.domain}</div>
              </div>

              {/* Tencent Cloud UIN — read-only text */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  关联腾讯云账号
                  <span className="text-xs text-gray-400 font-normal ml-2">当前平台关联的腾讯云账号 UIN</span>
                </p>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">{form.tencentUin}</div>
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
  );
}
