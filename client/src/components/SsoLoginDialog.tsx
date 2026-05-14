import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SsoLoginDialogProps {
  visible: boolean;
  onClose: () => void;
}

interface SsoImOption {
  type: string;
  label: string;
  iconUrl: string;
}

/** 演示用 SSO 供应商列表 */
const SSO_IM_OPTIONS: SsoImOption[] = [
  { type: 'feishu', label: '飞书', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/lark-v2-logo.png' },
  { type: 'dingtalk', label: '钉钉', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/dd-v2-logo.png' },
  { type: 'aad', label: '微软Entra ID', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/aad-v2-logo.png' },
  { type: 'saml', label: 'SAML2.0', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/saml-v2-logo.png' },
  { type: 'ad', label: 'Windows AD', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/ad-v2-logo.png' },
  { type: 'wework-private', label: '私有化企微', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/wework-logo.png' },
  { type: 'oidc', label: 'OIDC', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/oidc-v2-logo.png' },
  { type: 'jwt', label: 'JWT', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/jwt-v2-logo.png' },
  { type: 'openldap', label: 'OpenLDAP', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/openldap-v2-logo.png' },
  { type: 'wecom', label: '企业微信', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/wework-v2-logo.png' },
  { type: 'cas', label: 'CAS', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/cas-v2-logo.png' },
  { type: 'oauth2', label: 'Oauth2', iconUrl: 'https://toa-web-test-1258344699.cos.ap-guangzhou.myqcloud.com/public/images/oauth2-v2-logo.png' },
];

/** 登录页 Logo + 标题头部 */
function DialogHeaderSection({ siteName }: { siteName: string }) {
  return (
    <DialogHeader className="items-center mb-6">
      <div
        className="w-14 h-14 rounded-[4px] flex items-center justify-center shadow-lg mb-4"
        style={{ background: 'linear-gradient(90deg, #020617 70%, #1447E6 100%)' }}
      >
        <span className="text-2xl">🦞</span>
      </div>
      <DialogTitle className="text-xl font-bold text-center">
        登录 {siteName}
      </DialogTitle>
      <DialogDescription className="sr-only">
        登录对话框
      </DialogDescription>
    </DialogHeader>
  );
}

/** 底部品牌标识 */
function BrandFooter() {
  return (
    <div className="flex items-center justify-center mt-6">
      <img
        src="/images/eid-new-brand-gray.png"
        alt="eID Digital Identity"
        className="h-4 object-contain"
        style={{ opacity: 0.55 }}
      />
    </div>
  );
}

/** 手机号图标 */
const PhoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.546 0.245 262.881)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

/** SSO 云钥匙图标 */
const SsoCloudIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M12.7492 6.45039C14.5439 6.45061 15.9992 7.9056 15.9992 9.70039C15.999 11.495 14.5438 12.9502 12.7492 12.9504C11.9485 12.9504 11.216 12.659 10.6496 12.1789L10.3918 12.3391L9.3703 12.967L9.88788 13.8068C10.1045 14.1594 9.99498 14.6219 9.64276 14.8391C9.29029 15.0559 8.82782 14.946 8.61053 14.5939L8.09296 13.7531L7.29315 14.2463C6.9405 14.4629 6.47796 14.3527 6.26093 14.0002C6.04425 13.6478 6.15412 13.1862 6.50604 12.9689L9.60565 11.0617L9.75507 10.9689C9.5897 10.5793 9.49926 10.1504 9.49921 9.70039C9.49921 7.90552 10.9544 6.45048 12.7492 6.45039ZM8.84882 1.05C11.2202 1.05007 13.27 2.41319 14.4367 4.40742C14.6454 4.76482 14.5244 5.22374 14.1672 5.43282C13.8097 5.64165 13.3509 5.5216 13.1418 5.16426C12.2054 3.56365 10.6148 2.55007 8.84882 2.55C6.79192 2.55009 4.96492 3.93122 4.14764 6.00606C4.13899 6.02803 4.13067 6.05034 4.12225 6.07246C4.01089 6.36496 3.73619 6.54595 3.44159 6.55391L3.25018 6.61153C2.20974 6.99698 1.50018 7.95313 1.50018 9.04219C1.50031 10.4535 2.70191 11.6496 4.25018 11.6496H4.34686C4.76086 11.6497 5.09665 11.9856 5.09686 12.3996C5.09686 12.8138 4.76099 13.1495 4.34686 13.1496H4.25018C1.93262 13.1496 0.000306483 11.3399 0.000183105 9.04219C0.000183105 7.26469 1.16224 5.77297 2.75604 5.19453L2.79901 5.18086L2.87811 5.15645C3.94294 2.75887 6.18963 1.05008 8.84882 1.05ZM12.7492 7.95039C11.7828 7.95048 10.9992 8.73395 10.9992 9.70039C10.9994 10.6667 11.7829 11.4503 12.7492 11.4504C13.7154 11.4502 14.499 10.6666 14.4992 9.70039C14.4992 8.73403 13.7155 7.95061 12.7492 7.95039Z" fill="oklch(0.446 0.03 256.802)" />
  </svg>
);

/** 邮箱图标 */
const EmailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.546 0.245 262.881)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

/** 登录操作按钮配置 */
interface LoginAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

/** 其他登录方式 - 分隔线 + 按钮列表 + 品牌标识 */
function OtherLoginMethods({
  title = '其他登录方式',
  actions,
}: {
  title?: string;
  actions: LoginAction[];
}) {
  return (
    <div className="w-full mt-2">
      {/* 分隔线 */}
      <div className="flex items-center gap-3 mt-5">
        <div className="flex-1 h-px" style={{ background: 'oklch(0.91 0.008 240)' }} />
        <span style={{ fontSize: '12px', color: 'oklch(0.65 0.01 240)' }}>{title}</span>
        <div className="flex-1 h-px" style={{ background: 'oklch(0.91 0.008 240)' }} />
      </div>

      {/* 登录按钮 */}
      <div className="flex justify-center gap-[72px] mt-4">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            onClick={action.onClick}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:shadow-md"
              style={{ background: 'oklch(0.96 0.005 240)' }}
            >
              {action.icon}
            </div>
            <span style={{ fontSize: '12px', color: 'oklch(0.52 0.015 240)' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <BrandFooter />
    </div>
  );
}

/** SSO IM 卡片列表：最多展示 3 个，超过 3 个出现滚动条 */
function SsoImCardList({ options, onSelect }: { options: SsoImOption[]; onSelect: (type: string) => void }) {
  const needScroll = options.length > 3;

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        needScroll && 'overflow-y-auto pr-1',
      )}
      // 3 个卡片高度（每个约 68px）+ 2 个间距（每个 12px）= 228px
      style={needScroll ? { maxHeight: 228 } : undefined}
    >
      {options.map((opt) => (
        <button
          key={opt.type}
          onClick={() => onSelect(opt.type)}
          className="flex items-center gap-4 w-full px-4 py-3.5 rounded-[4px] bg-gray-100 transition-all duration-150 text-left group hover:bg-gray-200 cursor-pointer flex-shrink-0"
        >
          <img src={opt.iconUrl} alt={opt.label} className="w-10 h-10 rounded-[4px] object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">
              {opt.label}
            </span>
          </div>
          <svg className="w-4 h-4 text-gray-400 transition-colors flex-shrink-0 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** 模拟手机号登录表单 */
function PhoneLoginForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const handleSendCode = useCallback(() => {
    if (!phone.trim()) {
      toast.error('请输入手机号');
      return;
    }
    toast.success('验证码已发送（Demo 演示）');
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phone]);

  const handleLogin = useCallback(() => {
    if (!phone.trim() || !code.trim()) {
      toast.error('请填写完整信息');
      return;
    }
    if (!agreed) {
      toast.error('请先阅读并同意服务协议');
      return;
    }
    toast.success('登录成功（Demo 演示）');
  }, [phone, code, agreed]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 手机号输入 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: '#1d2129' }}>手机号</label>
        <div
          className="flex items-center rounded-[4px] border transition-all overflow-hidden"
          style={{ borderColor: '#e5e6eb' }}
        >
          {/* +86 区号选择 */}
          <div
            className="flex items-center gap-1 px-3 py-3 flex-shrink-0 cursor-pointer select-none"
            style={{ borderRight: '1px solid #e5e6eb' }}
            onClick={() => toast.info('Demo: 选择区号')}
          >
            <span className="text-sm" style={{ color: '#1d2129' }}>+86</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86909c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
            style={{ color: '#1d2129' }}
          />
        </div>
      </div>

      {/* 验证码输入 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: '#1d2129' }}>验证码</label>
        <div
          className="flex items-center rounded-[4px] border transition-all overflow-hidden"
          style={{ borderColor: '#e5e6eb' }}
        >
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
            style={{ color: '#1d2129' }}
          />
          <button
            type="button"
            disabled={countdown > 0}
            onClick={handleSendCode}
            className="flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              borderLeft: '1px solid #e5e6eb',
              color: countdown > 0 ? '#c9cdd4' : '#165dff',
              background: 'transparent',
            }}
          >
            {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
          </button>
        </div>
      </div>

      {/* 登录按钮 */}
      <button
        type="button"
        onClick={handleLogin}
        className="w-full py-3 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] mt-1"
        style={{ background: 'linear-gradient(135deg, #79bbff, #409eff)' }}
      >
        登录
      </button>

      {/* 协议勾选 */}
      <div className="flex items-start gap-2 justify-center">
        <button
          type="button"
          onClick={() => setAgreed(!agreed)}
          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer"
          style={{
            borderColor: agreed ? '#165dff' : '#c9cdd4',
            background: agreed ? '#165dff' : 'transparent',
          }}
        >
          {agreed && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <p className="text-xs" style={{ color: '#86909c' }}>
          我已阅读并同意
          <button type="button" className="hover:underline mx-0.5" style={{ color: '#165dff' }} onClick={() => toast.info('Demo: 查看服务协议')}>
            服务协议
          </button>
          和
          <button type="button" className="hover:underline mx-0.5" style={{ color: '#165dff' }} onClick={() => toast.info('Demo: 查看隐私政策')}>
            隐私政策
          </button>
        </p>
      </div>
    </div>
  );
}

/** 视图类型：sso=SSO选择页, phone=手机号登录页 */
type ViewMode = 'sso' | 'phone';

/** View 1: SSO 选择页面 */
function SsoMainView({
  options,
  onPhoneLogin,
}: {
  options: SsoImOption[];
  onPhoneLogin: () => void;
}) {
  const handleSsoSelect = useCallback((type: string) => {
    toast.success(`已选择 ${type} 登录（Demo 演示）`);
  }, []);

  return (
    <div className="flex flex-col">
      <SsoImCardList options={options} onSelect={handleSsoSelect} />

      <OtherLoginMethods
        title="其他账号登录"
        actions={[
          { icon: PhoneIcon, label: '手机号', onClick: onPhoneLogin },
          { icon: EmailIcon, label: '邮箱', onClick: () => toast.info('Demo: 邮箱登录') },
        ]}
      />
    </div>
  );
}

/** View 2: 手机号登录页面 */
function PhoneLoginView({
  showSsoOption,
  onSsoClick,
}: {
  showSsoOption: boolean;
  onSsoClick?: () => void;
}) {
  const ssoAction: LoginAction = {
    icon: SsoCloudIcon,
    label: 'SSO',
    onClick: onSsoClick ?? (() => toast.info('Demo: SSO 登录')),
  };
  const emailAction: LoginAction = {
    icon: EmailIcon,
    label: '邮箱',
    onClick: () => toast.info('Demo: 邮箱登录'),
  };

  return (
    <div className="flex flex-col items-center">
      <PhoneLoginForm />

      <OtherLoginMethods
        actions={showSsoOption ? [ssoAction, emailAction] : [emailAction]}
      />
    </div>
  );
}

/**
 * SsoLoginDialog - SSO 登录弹窗交互样式 Demo
 *
 * 功能：
 * - 双视图切换（SSO 选择 / 手机号登录）
 * - SSO IM 卡片列表（超过 2 项自动滚动）
 * - 其他登录方式快捷入口
 * - 手机号 + 验证码表单
 * - 纯交互演示，无真实业务逻辑
 */
const SsoLoginDialog: React.FC<SsoLoginDialogProps> = ({ visible, onClose }) => {
  const [view, setView] = useState<ViewMode>('sso');

  // 关闭弹窗时重置视图
  const handleClose = useCallback(() => {
    setView('sso');
    onClose();
  }, [onClose]);

  // 弹窗打开时锁定背景滚动
  React.useEffect(() => {
    if (visible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [visible]);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-[420px] p-0 gap-0 overflow-hidden bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* 返回按钮 - 仅在手机号登录视图时显示 */}
        {view === 'phone' && (
          <button
            type="button"
            className="absolute top-4 left-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none z-10"
            onClick={() => setView('sso')}
          >
            <ArrowLeft className="size-4" />
          </button>
        )}

        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          <div className="px-8 pt-8 pb-2 flex-shrink-0">
            <DialogHeaderSection siteName="OpenClaw Enterprise" />
          </div>

          <div className="px-8 pb-8 overflow-y-auto flex-1 min-h-0">
            {view === 'sso' ? (
              <SsoMainView
                options={SSO_IM_OPTIONS}
                onPhoneLogin={() => setView('phone')}
              />
            ) : (
              <PhoneLoginView
                showSsoOption
                onSsoClick={() => setView('sso')}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SsoLoginDialog;
