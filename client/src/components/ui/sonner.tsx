/**
 * Toast 通知组件
 * ─────────────────────────────────────────────────────────────────
 * 基于 sonner 的全局 Toast 通知，统一样式与交互规范。
 *
 * 视觉规范：
 *   - 白色背景 + 圆角 12px + 阴影
 *   - 图标在左侧，文字居中，关闭按钮在右侧
 *   - 边框颜色统一 #EAEEF4
 *
 * 使用方式：
 *   import { toast } from 'sonner';
 *   toast.error("请输入用户 ID");
 *   toast.success("操作成功");
 *
 * 在 App 根组件挂载 <Toaster /> 即可。
 */
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#09090b] group-[.toaster]:border-[#EAEEF4] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:text-sm group-[.toaster]:font-medium",
          closeButton:
            "group-[.toast]:!static group-[.toast]:!ml-auto group-[.toast]:!mr-0 group-[.toast]:!translate-x-0 group-[.toast]:!translate-y-0 group-[.toast]:!left-auto group-[.toast]:!right-0 group-[.toast]:!top-auto group-[.toast]:!border-[#EAEEF4] group-[.toast]:!bg-white group-[.toast]:!text-[#525252] group-[.toast]:hover:!bg-[#f4f4f5] group-[.toast]:!w-5 group-[.toast]:!h-5 group-[.toast]:!rounded-md",
          title: "group-[.toast]:text-[#09090b] group-[.toast]:font-medium",
          description: "group-[.toast]:text-[#737373]",
          actionButton:
            "group-[.toast]:bg-[#0A0A0A] group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#525252] group-[.toast]:border group-[.toast]:border-[#EAEEF4] group-[.toast]:rounded-md group-[.toast]:text-xs",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#09090b",
          "--normal-border": "#EAEEF4",
          "--error-bg": "#ffffff",
          "--error-text": "#09090b",
          "--error-border": "#EAEEF4",
          "--success-bg": "#ffffff",
          "--success-text": "#09090b",
          "--success-border": "#EAEEF4",
          zIndex: 99999,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
