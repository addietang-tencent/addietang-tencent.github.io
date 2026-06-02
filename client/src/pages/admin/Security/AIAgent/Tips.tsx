import React from "react";
import { EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIAgentTips({ showTipsPanel, setShowTipsPanel }: any) {
  return showTipsPanel ? (
    <Card className="AIAgent-tips">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          什么是 AI Agent安全？
        </CardTitle>
        <button
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
          onClick={() => {
            setShowTipsPanel(false);
          }}
        >
          <EyeOff className="w-4 h-4" />
          隐藏说明
        </button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-400">
          帮助快速识别环境中运行 AI Agent /
          调用大模型的资产，将这些资产的风险告警、管控策略生效情况与审计记录集中呈现，让你在"可见—可控—可追溯"的闭环下，安全引入并持续使用
          Agent。
          <a
            href="https://cloud.tencent.com/document/product/664/129679"
            target="_blank"
            style={{ margin: "1px 0 0 5px", color: "#1447e6", fontSize: 14 }}
          >
            说明文档
          </a>
        </div>
        <div className="max-w-[80%] p-3 px-4 bg-gray-50 rounded-lg mt-3">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>
              <strong>资产可见：</strong>
              自动识别 AI Agent 资产（运行 AI Agent
              或通过网络请求调用大模型的资产），生成统一资产清单，支持按 Agent
              类型/业务/资产组快速管理。
            </li>
            <li>
              <strong>风险可控：</strong>
              围绕 Agent
              资产聚合网络、OpenClaw层关键告警，支持按威胁等级/时间/资产/来源归因筛选与排序，快速锁定"最需优先处置"的风险点。
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  ) : null;
}
