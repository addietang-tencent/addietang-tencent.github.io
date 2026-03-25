/**
 * LoginPage - 企业登录页面
 * 集成 OneID 登录组件
 * 支持：手机号登录、SSO、邮箱、腾讯统一身份
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Phone, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  enterpriseName?: string;
}

export default function LoginPage({ open = true, onOpenChange, enterpriseName = 'OpenClaw_test' }: LoginPageProps) {
  const [, navigate] = useLocation();
  const [loginMode, setLoginMode] = useState<'phone' | 'sso' | 'email' | 'tencent'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('请输入手机号');
      return;
    }

    setIsLoading(true);
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerificationSent(true);
      toast.success('验证码已发送');
    } catch (error) {
      toast.error('发送验证码失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phoneNumber.trim() || !verificationCode.trim()) {
      toast.error('请输入手机号和验证码');
      return;
    }

    setIsLoading(true);
    try {
      // 模拟登录
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('登录成功');
      // 跳转到我的 OpenClaw 页面
      navigate('/my-openclaw');
    } catch (error) {
      toast.error('登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    // 跳转到 OneID SSO 登录页面
    window.location.href = 'https://clawlogin-dex3nflt.manus.space/';
  };

  const handleEmailLogin = () => {
    toast.info('邮箱登录功能开发中');
  };

  const handleTencentLogin = () => {
    toast.info('腾讯统一身份登录功能开发中');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-3xl">☁️</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              登录 {enterpriseName}
            </h2>
            <p className="text-sm text-gray-500">
              请输入您的账号信息以继续
            </p>
          </div>

          {/* Phone Login Mode */}
          {loginMode === 'phone' && (
            <div className="space-y-4">
              {/* Phone Number Input */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">手机号</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium">
                    +86
                  </div>
                  <Input
                    type="tel"
                    placeholder="请输入手机号码"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">验证码</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    onClick={handleSendVerificationCode}
                    disabled={isLoading || isVerificationSent}
                    className="whitespace-nowrap"
                  >
                    {isVerificationSent ? '已发送' : '获取验证码'}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handlePhoneLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                {isLoading ? '登录中...' : '登 录'}
              </Button>
            </div>
          )}

          {/* Other Login Methods */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">其他登录方式</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSSOLogin}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-700">SSO</span>
              </button>
              <button
                onClick={handleEmailLogin}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-700">邮箱</span>
              </button>
              <button
                onClick={handleTencentLogin}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors col-span-2"
              >
                <span className="text-xs text-gray-700">🐧 腾讯统一身份</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center mt-6">
            如需创建账号，请联系管理员
          </p>
        </div>
      </div>
    </div>
  );
}
