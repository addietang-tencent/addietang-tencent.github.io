/**
 * LoginModal - 登录弹窗
 * 用户通过用户 ID 和密码登录
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { SITE_CONFIG } from "@/lib/mockData";

interface LoginModalProps {
  open: boolean;
  onSuccess?: () => void;
}

export default function LoginModal({ open, onSuccess }: LoginModalProps) {
  const { login } = useUserRole();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) { setError("请输入用户 ID"); return; }
    if (!password.trim()) { setError("请输入密码"); return; }
    setError("");
    setLoading(true);
    // 模拟短暂网络延迟
    await new Promise(r => setTimeout(r, 400));
    const result = login(userId.trim(), password);
    setLoading(false);
    if (result.success) {
      setUserId("");
      setPassword("");
      onSuccess?.();
    } else {
      setError(result.error || "登录失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        // 禁止点击遮罩关闭
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #007AFF, #5856D6)" }} />

        <div className="px-8 pt-6 pb-8">
          {/* Logo + Title */}
          <DialogHeader className="mb-6">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
                🦞
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                登录 {SITE_CONFIG.name}
              </DialogTitle>
              <p className="text-sm text-gray-400 text-center">请输入您的用户 ID 和密码</p>
            </div>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-userid" className="text-sm font-medium text-gray-700">
                用户 ID
              </Label>
              <Input
                id="login-userid"
                type="text"
                placeholder="请输入用户 ID"
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setError(""); }}
                className="h-10 bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                密码
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="h-10 bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-blue-100 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-sm font-semibold text-white rounded-lg mt-2"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  登录
                </span>
              )}
            </Button>
          </form>

          {/* Hint */}
          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            如忘记密码，请联系企业管理员重置
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
