/**
 * BasicInfo - 管控端基础信息配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side (浅灰背景)
 *
 * OneID 模式：展示同步企业信息 + 用户登录方式下拉
 */
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Users, ChevronDown, X, RefreshCw, Loader2 } from "lucide-react";
import {
  MOCK_SSO_IM_TYPE_OPTIONS,
  MOCK_SSO_IM_TYPES,
  type SsoImTypeOption,
} from "@/lib/mockData";

const WELCOME_DIALOG_SHOWN_KEY = "clawpro_welcome_dialog_shown";

export default function StandardBasicInfo() {

  // ---------- 欢迎弹窗 state ----------
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(() => {
    return !localStorage.getItem(WELCOME_DIALOG_SHOWN_KEY);
  });

  const handleCloseWelcomeDialog = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem(WELCOME_DIALOG_SHOWN_KEY, "1");
  };

  // ---------- state ----------
  const [syncing, setSyncing] = useState(false);

  const [form, setForm] = useState({
    siteName: "A公司企业版OpenClaw",
    region: "广州",
    domain: "openclaw.acompany.com",
    tencentUin: "3205597606",
    logo: null as File | null,
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const MAX_FILE_SIZE = 512 * 1024; // 512KB

  // 用户登录方式 — 多选
  const [ssoImTypes, setSsoImTypes] = useState<string[]>([...MOCK_SSO_IM_TYPES]);
  const ssoImTypeOptions: SsoImTypeOption[] = MOCK_SSO_IM_TYPE_OPTIONS;
  const originalSsoImTypesRef = useRef<string[]>([...MOCK_SSO_IM_TYPES]);

  // 用于重置
  const originalNameRef = useRef("A公司企业版OpenClaw");

  // ---------- Logo 选择 ----------
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setLogoError("Logo 文件不能超过 512KB，请压缩后重试");
      e.target.value = "";
      return;
    }
    setLogoError(null);
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    toast.success("Logo已更换，点击「保存」后生效");
  };

  // 清理预览 URL
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // ---------- 保存 ----------
  const handleSave = () => {
    const nameChanged = form.siteName !== originalNameRef.current;
    const ssoImTypesChanged = (
      ssoImTypes.length !== originalSsoImTypesRef.current.length ||
      ssoImTypes.some((t, i) => t !== originalSsoImTypesRef.current[i])
    );
    if (!nameChanged && !logoFile && !ssoImTypesChanged) {
      toast.info("没有需要保存的变更");
      return;
    }
    originalNameRef.current = form.siteName;
    originalSsoImTypesRef.current = [...ssoImTypes];
    setLogoFile(null);
    setLogoPreview(null);
    toast.success("基础信息已保存");
  };

  // ---------- 同步企业信息 ----------
  const handleSyncEnterprise = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("企业信息同步成功");
    }, 1500);
  };

  // ---------- 取消 ----------
  const handleCancel = () => {
    setForm((f) => ({ ...f, siteName: originalNameRef.current }));
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    setSsoImTypes([...originalSsoImTypesRef.current]);
    toast.info("已取消修改");
  };

  // ---------- 前往腾讯统一身份 ----------
  const handleGoToTencentIdentity = () => {
    window.open(
      "https://xxx.com/login",
      "_blank"
    );
    handleCloseWelcomeDialog();
  };

  return (
    <>
      {/* 欢迎使用弹窗 - 首次访问时显示 */}
      <Dialog open={showWelcomeDialog} onOpenChange={(open) => !open && handleCloseWelcomeDialog()}>
        <DialogContent
          className="sm:max-w-[420px] p-8 text-center"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900">欢迎使用</DialogTitle>
            </div>
            <DialogDescription className="sr-only">引导管理员前往腾讯统一身份平台</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-6">
            首次登录请先前往腾讯统一身份平台进行用户新增和登录方式设置。
          </p>
          <Button
            className="w-full"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            onClick={handleGoToTencentIdentity}
          >
            前往腾讯统一身份
          </Button>
        </DialogContent>
      </Dialog>

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
                <span className="text-xs text-gray-400 font-normal ml-2">将展示在用户端左上角</span>
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="siteName"
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                  placeholder="例如：A公司您的专属ClawPro平台"
                  className="bg-gray-50 border-gray-200 flex-1"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncEnterprise}
                    disabled={syncing}
                    className="text-sm whitespace-nowrap shrink-0 text-gray-500"
                  >
                    {syncing ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                    )}
                    同步企业信息
                  </Button>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                网站 Logo
                <span className="text-xs text-gray-400 font-normal ml-2">将展示在用户端左上角，建议尺寸 200×200px</span>
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {form.siteName.charAt(0) || "O"}
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-gray-50">
                  <Upload className="w-4 h-4" />
                  更换 Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                {logoError ? (
                  <span className="text-xs text-red-500 font-medium">* {logoError}</span>
                ) : logoFile ? (
                  <span className="text-xs text-orange-500">* 新 Logo 尚未保存</span>
                ) : null}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-6">
              {/* Region — read-only */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  所在地域
                  <span className="text-xs text-gray-400 font-normal ml-2">用户端、管控端及员工 OpenClaw 底层云设备所在的地域</span>
                </p>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed opacity-60">{form.region}</div>
              </div>

              {/* Domain — read-only */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  域名
                  <span className="text-xs text-gray-400 font-normal ml-2">用户端与管控端的访问域名</span>
                </p>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed opacity-60">{form.domain}</div>
              </div>

              {/* Tencent Cloud UIN — read-only */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  关联腾讯云账号
                  <span className="text-xs text-gray-400 font-normal ml-2">当前平台关联的腾讯云账号 UIN</span>
                </p>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed opacity-60">{form.tencentUin}</div>
              </div>

              {/* 用户登录方式 */}
              <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-700">
                    用户登录方式
                    <span className="text-xs text-gray-400 font-normal ml-2">设置当前平台用户的默认登录方式，需与腾讯统一身份平台保持一致</span>
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-left hover:border-gray-300 transition-colors min-h-[38px] data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50"
                      >
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {ssoImTypes.length === 0 ? (
                            <span className="text-gray-400">请选择登录方式</span>
                          ) : (
                            ssoImTypes.map((val) => {
                              const opt = ssoImTypeOptions.find((o) => o.value === val);
                              return (
                                <span
                                  key={val}
                                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 text-xs font-medium"
                                >
                                  {opt?.label ?? val}
                                  <X
                                    className="w-3 h-3 cursor-pointer hover:text-blue-900 shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSsoImTypes((prev) => prev.filter((t) => t !== val));
                                    }}
                                  />
                                </span>
                              );
                            })
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[var(--radix-popover-trigger-width)]"
                      align="start"
                      sideOffset={4}
                    >
                      <div className="max-h-60 overflow-y-auto py-1">
                        {ssoImTypeOptions.map((opt) => {
                          const checked = ssoImTypes.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                                checked ? "bg-blue-50/50" : ""
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  if (v) {
                                    setSsoImTypes((prev) => [...prev, opt.value]);
                                  } else {
                                    setSsoImTypes((prev) => prev.filter((t) => t !== opt.value));
                                  }
                                }}
                                className="shrink-0"
                              />
                              <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                          );
                        })}
                        {ssoImTypeOptions.length === 0 && (
                          <div className="px-3 py-4 text-sm text-gray-400 text-center">暂无可选登录方式</div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
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
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
