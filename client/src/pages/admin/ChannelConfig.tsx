/**
 * ChannelConfig - 管控端通道配置页
 */
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

// SVG icon components for each channel
function WeworkIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1EB955" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M8.5 10.5c-.83 0-1.5-.67-1.5-1.5S7.67 7.5 8.5 7.5 10 8.17 10 9s-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.36C8.44 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.67 0-3.22-.49-4.53-1.33l-.32-.2-3.01.81.82-2.95-.21-.33A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    </div>
  );
}

function QQIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#12B7F5" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
  );
}

function FeishuIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#3370FF" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18L18 8v8l-6 3.75L6 16V8l6-3.82z"/>
        <path d="M12 7l-4 2.5v5L12 17l4-2.5v-5L12 7zm0 2.18l2 1.25v2.5L12 14.32l-2-1.25v-2.5L12 9.18z"/>
      </svg>
    </div>
  );
}

function DingtalkIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1677FF" }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H7.5c-.83 0-1.5-.67-1.5-1.5v-5C6 8.67 6.67 8 7.5 8h9c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zm-7-6v4h1.5v-1.5H12V16h1.5v-4H12v1.5h-1v-1.5H9.5z"/>
      </svg>
    </div>
  );
}

function WechatIcon() {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5" style={{ background: "#07C160" }}>
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663415970324/bygiZj33T3TUvGMBPvApKE/wechat_logo_transparent_11985bb7.png"
        alt="微信"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  wework: <WeworkIcon />,
  qq: <QQIcon />,
  feishu: <FeishuIcon />,
  dingtalk: <DingtalkIcon />,
  wechat: <WechatIcon />,
};

const CHANNELS = [
  { id: "wechat", name: "微信", desc: "通过微信 ClawBot 接入，用户可直接在微信与机器人对话" },
  { id: "qq", name: "QQ", desc: "通过 QQ 机器人接入，适合个人和非正式沟通场景" },
  { id: "wework", name: "企业微信", desc: "通过企业微信机器人或自建应用接入，支持群消息通知与丰富交互能力" },
  { id: "dingtalk", name: "钉钉", desc: "通过钉钉机器人接入，适合阿里系企业用户" },
  { id: "feishu", name: "飞书", desc: "通过飞书机器人接入，适合使用飞书办公套件的团队" },
];

export default function ChannelConfig() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    wechat: true, qq: true, wework: true, dingtalk: false, feishu: true,
  });

  return (
      <div className="page-enter max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">通道配置</h1>
          <p className="text-sm text-gray-500 mt-1">
            配置用户可以为 OpenClaw 选择接入的即时通讯工具。开启「用户可见」后，用户可在 OpenClaw 配置中选择对应通道。
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-50">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">可用通道列表</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  {CHANNEL_ICONS[ch.id]}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ch.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">用户可见</span>
                  <Switch
                    checked={visibility[ch.id] || false}
                    onCheckedChange={(v) => {
                      setVisibility({ ...visibility, [ch.id]: v });
                      toast.success(`${ch.name} 已${v ? "开启" : "关闭"}`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
