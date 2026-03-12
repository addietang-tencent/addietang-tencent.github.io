/**
 * ChannelConfig - 管控端通道配置页
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const CHANNELS = [
  { id: "wework", name: "企业微信", desc: "通过企业微信机器人或自建应用接入，支持群消息通知与丰富交互能力", icon: "💬" },
  { id: "qq", name: "QQ", desc: "通过 QQ 机器人接入，适合个人和非正式沟通场景", icon: "🐧" },
  { id: "feishu", name: "飞书", desc: "通过飞书机器人接入，适合使用飞书办公套件的团队", icon: "🪶" },
  { id: "dingtalk", name: "钉钉", desc: "通过钉钉机器人接入，适合阿里系企业用户", icon: "📎" },
];

export default function ChannelConfig() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    wework: true, qq: true, feishu: true, dingtalk: false,
  });

  return (
    <AdminLayout>
      <div className="page-enter max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">通道配置</h1>
          <p className="text-sm text-gray-500 mt-1">
            配置成员可以为 OpenClaw 选择接入的即时通讯工具。开启「成员可见」后，成员可在 OpenClaw 配置中选择对应通道。
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
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {ch.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ch.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ch.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">成员可见</span>
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
    </AdminLayout>
  );
}
